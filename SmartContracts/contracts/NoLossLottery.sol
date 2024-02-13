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

    constructor(address tokenContractAddress) {
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
    }

    struct Position {
        uint256 timestamp;
        uint256 amount; // USDC
    }

    mapping(address => Position) private balances;

    function deposit(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");

        require(
            balances[msg.sender].amount == 0,
            "You already have a position"
        );

        require(
            tokenContract.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );

        tokenContract.approve(address(lendingPool), amount);
        lendingPool.supply(address(tokenContract), amount, address(this), 0);

        balances[msg.sender].amount = amount;
        balances[msg.sender].timestamp = block.timestamp;
    }

    function getSuppliedAmount() external view returns (uint256) {
        DataTypes.ReserveData memory reserveData = lendingPool.getReserveData(
            address(tokenContract)
        );
        IERC20 aToken = IERC20(reserveData.aTokenAddress);
        return aToken.balanceOf(address(this));
    }

    function withdraw() external {
        require(balances[msg.sender].amount > 0, "You have not supplied any tokens");
        lendingPool.withdraw(address(tokenContract), balances[msg.sender].amount, msg.sender);
        balances[msg.sender].amount = 0;
        balances[msg.sender].timestamp = 0;
    }
}
