// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./DataTypes.sol";
import "../interfaces/IPool.sol";
import "../interfaces/IPoolAddressesProvider.sol";
import "../interfaces/IUniswapV2Router.sol";

contract NoLossLottery {
    IERC20 public tokenContract;
    IUniswapV2Router public uniswapRouter;
    IPool public lendingPool;
    IPoolAddressesProvider public poolAddressesProvider;
    uint256 start;
    uint256 end;

    constructor(address tokenContractAddress, uint256 sds) {
        block.timestamp;
        // CONTRACTI OVDE
        tokenContract = IERC20(tokenContractAddress);
        uniswapRouter = IUniswapV2Router(
            0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
        );
        poolAddressesProvider = IPoolAddressesProvider(
            0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e
        );

        address lendingPoolAddress = poolAddressesProvider.getPool();
        lendingPool = IPool(lendingPoolAddress);
        start = block.timestamp;
        end = start + sds;
    }

    struct Node {
        uint256 amount;
        uint256 entries;
        address next;
    }

    mapping(address => Node) private balances;
    address head = address(0);
    address tail = address(0);
    address winner = address(0);
    uint256 supplied = 0;
    uint256 totalEntries = 0;

    function deposit(uint256 amount) external {
        require(block.timestamp < end, "Lottery over");

        require(amount > 0, "Amount must be greater than 0");

        require(
            tokenContract.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );

        tokenContract.approve(address(lendingPool), amount);
        lendingPool.supply(address(tokenContract), amount, address(this), 0);

        supplied += amount;
        uint256 newEntries = (amount * (end - block.timestamp)) / (end - start);
        totalEntries += newEntries; // Za usdc ne bi trebalo da bude overflowa za milijardu i godinu dana

        if (tail == address(0)) {
            // Prvi cvor
            balances[msg.sender].amount = amount;
            balances[msg.sender].entries = newEntries;
            balances[msg.sender].next = address(0);
            head = tail = msg.sender;
        } else if (
            balances[msg.sender].next != address(0) || msg.sender == tail
        ) // Postoji
        {
            balances[msg.sender].amount += amount;
            balances[msg.sender].entries += newEntries;
        } else {
            // Ne postoji, nije prazan
            balances[msg.sender].amount = amount;
            balances[msg.sender].entries = newEntries;
            balances[msg.sender].next = address(0);
            balances[tail].next = msg.sender;
            tail = msg.sender;
        }
    }

    function getSuppliedAmount() public view returns (uint256) {
        return supplied;
    }

    function getTotalEntries() public view returns (uint256) {
        return totalEntries;
    }

    function getYieldAmount() public view returns (uint256) {
        DataTypes.ReserveData memory reserveData = lendingPool.getReserveData(
            address(tokenContract)
        );
        IERC20 aToken = IERC20(reserveData.aTokenAddress);
        return aToken.balanceOf(address(this)) - supplied;
    }

    function withdraw(uint256 amount) external {
        require(
            balances[msg.sender].amount >= amount,
            "You do not have enough tokens in lottery"
        );

        supplied -= amount;
        lendingPool.withdraw(address(tokenContract), amount, msg.sender);
        // Pogledati matematiku
        uint256 removedEntries = (balances[msg.sender].entries * amount) /
            balances[msg.sender].amount;
        balances[msg.sender].entries -= removedEntries;
        totalEntries -= removedEntries;
        balances[msg.sender].amount -= amount;
    }

    function win(uint256 randomNumber) external {
        require(block.timestamp >= end, "Lottery still in progress");
        uint256 num = randomNumber % totalEntries;
        address addr = head;
        while (addr != address(0)) {
            uint256 ent = balances[addr].entries;
            if (num < ent) {
                winner = addr;
                balances[addr].amount += getYieldAmount();
                return;
            }
            num -= ent;
            addr = balances[addr].next;
        }
    }

    function getWinner() external view returns (address) {
        return winner;
    }
}
