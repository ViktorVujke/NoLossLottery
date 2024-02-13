// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DataTypes.sol";

//interfaces
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import '../interfaces/IPool.sol';
import '../interfaces/IPoolAddressesProvider.sol';
import '../interfaces/IUniswapV2Router.sol';

contract NoLossLottery {
    IERC20 public usdcToken;
    IUniswapV2Router public uniswapRouter;
    IPool public lendingPool;
    IPoolAddressesProvider public poolAddressesProvider;
    uint256 public constant MIN_DEPOSIT = 10000; // Minimum deposit amount in USDC
    uint256 public endTime; // End time for the lottery
    
    mapping(address => User) public users; // Mapping of user addresses to their data
    address public head; // Head of the linked list
    uint256 public totalEntries; // Total number of entries in the lottery
    uint256 public startTime; // Start time for the lottery

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
        startTime = block.timestamp; // Set the start time to contract deployment time
        endTime = startTime + 10000;
    }
    struct User {
        uint256 entries; // User's TWAB as number of entries
        address next; // Pointer to the next user in the list
    }




   function deposit(uint256 amount) external {
    require(amount > 0, "Amount must be greater than 0");
    require(block.timestamp < endTime, "Lottery has ended");

    usdcToken.transferFrom(msg.sender, address(this), amount);
    usdcToken.approve(address(lendingPool), amount);
    lendingPool.supply(address(usdcToken), amount, address(this), 0);

    uint256 additionalEntries = calculateEntries(amount, msg.sender);
    if (users[msg.sender].entries == 0) { // If it's a new user
        users[msg.sender].next = head; // Add new user to the front of the list
        head = msg.sender;
    }
    users[msg.sender].entries += additionalEntries;
    totalEntries += additionalEntries;
}

    function calculateEntries(uint256 amount, address user) internal view returns (uint256) {
        uint256 timeLeft = endTime > block.timestamp ? endTime - block.timestamp : 0;
        return (amount / MIN_DEPOSIT) * timeLeft / (startTime - endTime);
    }

    function getSuppliedAmount() external view returns (uint256) {
        DataTypes.ReserveData memory reserveData = lendingPool.getReserveData(
                0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
            );
        IERC20 aToken = IERC20(reserveData.aTokenAddress);
        return aToken.balanceOf(address(this));
    }

    //internal functions
}
