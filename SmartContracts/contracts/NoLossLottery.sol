// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./DataTypes.sol";
import "../interfaces/IPool.sol";
import "../interfaces/IPoolAddressesProvider.sol";
import "../interfaces/IUniswapV2Router.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBase.sol";

contract NoLossLottery is VRFConsumerBase  {
    IERC20 public tokenContract;
    IUniswapV2Router public uniswapRouter;
    IPool public lendingPool;
    IPoolAddressesProvider public poolAddressesProvider;
    uint256 start;
    uint256 end;
    uint256 minDeposit;


    // Chainlink VRF variables
    bytes32 internal keyHash;
    uint256 internal fee;

    // Add a state variable to store the random result
    uint256 public randomResult;
    uint256 randomNumber;
    bool public isRandomnessRequested = false; // To prevent multiple requests


    receive() external payable {}

    fallback() external payable {}

    constructor(address tokenContractAddress, uint256 sds) 
    VRFConsumerBase(0xf0d54349aDdcf704F77AE15b96510dEA15cb7952, 0x514910771AF9Ca656af840dff83E8264EcF986CA)     
    {
        block.timestamp;
        tokenContract = IERC20(tokenContractAddress);
        uniswapRouter = IUniswapV2Router(
            0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
        );
        poolAddressesProvider = IPoolAddressesProvider(
            0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e
        );
        address lendingPoolAddress = poolAddressesProvider.getPool();
        lendingPool = IPool(lendingPoolAddress);

        minDeposit = 10;
        start = block.timestamp;
        end = start + sds;

        keyHash = 0xAA77729D3466CA35AE8D28B3BBAC7CC36A5031EFDC430821C02BC31A238AF445;
        fee = 1 * 10**18; // 1 LINK, accounting for 18 decimal places   
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
        totalEntries += newEntries;

        updateParticipant(msg.sender, amount, newEntries);
    }

    function updateParticipant(
        address participant,
        uint256 amount,
        uint256 newEntries
    ) private {
        Node storage node = balances[participant];

        if (node.amount == 0) {
            // New participant
            node.next = (head == address(0)) ? address(0) : head; // Set next to current head or 0 if first
            head = participant; // Update head to new participant
            if (tail == address(0)) {
                // If first participant, set as tail
                tail = participant;
            }
        }

        // Update or set participant's node data
        node.amount += amount;
        node.entries += newEntries;
    }

    function getTokenAddress() external view returns (address) {
        return address(tokenContract);
    }

    function getBalance(address usr) external view returns (uint256) {
        return balances[usr].amount;
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

    function getEnd() public view returns (uint256) {
        return end;
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


    function drawWinner(uint256 rN) external {
        uint256 totalYield = getYieldAmount();
        require(block.timestamp >= end, "Lottery still in progress");
        require(!isRandomnessRequested, "Randomness already requested");
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK - fill contract with faucet");

        getRandomNumber();
        isRandomnessRequested = true;


        uint256 estimatedGas = 403452 * tx.gasprice;

        address[] memory path = new address[](2);
        path[0] = address(tokenContract);
        path[1] = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

        uint[] memory amounts = uniswapRouter.getAmountsIn(estimatedGas, path);
        uint256 amountInMax = amounts[0];

        require(totalYield >= amountInMax, "Not enough tokens to cover swap");

        lendingPool.withdraw(address(tokenContract), totalYield, address(this));
        IERC20(tokenContract).approve(address(uniswapRouter), amountInMax);
        uniswapRouter.swapTokensForExactETH(
            estimatedGas,
            amountInMax,
            path,
            address(this),
            block.timestamp + 15 minutes
        );

        tokenContract.approve(address(lendingPool), totalYield - amountInMax);
        lendingPool.supply(
            address(tokenContract),
            totalYield - amountInMax,
            address(this),
            0
        );

        (bool success, ) = msg.sender.call{value: estimatedGas}("");
        require(success, "Failed to send ETH to cover gas cost");
    }

    function getWinner() external view returns (address) {
        if (winner != address(0)) return winner;

        require(randomNumber > 0, "Winner is not selected yet. ");

        uint256 num = randomNumber % totalEntries;
        address addr = head;
        while (addr != address(0)) {
            uint256 ent = balances[addr].entries;
            if (num < ent) {
                return addr;
            }
            num -= ent;
            addr = balances[addr].next;
        }
        return address(0);
    }

    function win() external {
        require(block.timestamp >= end, "Lottery still in progress");
        require(winner == address(0), "Lottery already won");
        uint256 num = randomNumber % totalEntries;
        address addr = head;
        while (addr != address(0)) {
            uint256 ent = balances[addr].entries;
            if (num < ent) {
                winner = addr;
                uint256 yield = getYieldAmount();
                balances[addr].amount += yield;
                supplied += yield;
                return;
            }
            num -= ent;
            addr = balances[addr].next;
        }
    }
     // Function to request randomness
    function getRandomNumber() public returns (bytes32 requestId) {
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK - fill contract with faucet");
        return requestRandomness(keyHash, fee);
    }

    // Chainlink VRF callback function
    function fulfillRandomness(bytes32 /* requestId */, uint256 randomness) internal override {
        randomResult = randomness;
        isRandomnessRequested = false; // Reset the flag
        // Now you can proceed with any logic that depends on the random number.
    }
}
