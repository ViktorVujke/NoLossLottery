// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./DataTypes.sol";

interface IUniswapV2Router {
    function swapExactETHForTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable returns (uint[] memory amounts);

    function WETH() external pure returns (address);

    function getAmountsIn(
        uint256 amountOut,
        address[] memory path
    ) external view returns (uint256[] memory amounts);

    function swapETHForExactTokens(
        uint256 amountOut,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable returns (uint256[] memory amounts);
}

interface IPool {
    function supply(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) external;

    function withdraw(
        address asset,
        uint256 amount,
        address to
    ) external returns (uint256);

    function getReserveData(
        address asset
    ) external view returns (DataTypes.ReserveData memory);
}

interface IPoolAddressesProvider {
    function getPool() external view returns (address);
}

contract NoLossLottery {
    IERC20 public usdcToken;
    IUniswapV2Router public uniswapRouter;
    IPool public lendingPool;
    IPoolAddressesProvider public poolAddressesProvider;

    constructor() {
        usdcToken = IERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
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
            usdcToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );

        usdcToken.approve(address(lendingPool), amount);
        lendingPool.supply(address(usdcToken), amount, address(this), 0);

        balances[msg.sender].amount = amount;
        balances[msg.sender].timestamp = block.timestamp;
    }

    function getSuppliedAmount() external view returns (uint256) {
        DataTypes.ReserveData memory reserveData = lendingPool.getReserveData(
                0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
            );
        IERC20 aToken = IERC20(reserveData.aTokenAddress);
        return aToken.balanceOf(address(this));
    }
}