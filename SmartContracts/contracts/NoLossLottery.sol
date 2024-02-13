// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DataTypes.sol";

//interfaces
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import '../interfaces/IPool.sol';
import '../interfaces/IPoolAddressesProvider.sol';
import '../interfaces/IUniswapV2Router.sol';

contract NoLossLottery {
    IERC20 public tokenContract;
    IUniswapV2Router public uniswapRouter;
    IPool public lendingPool;
    IPoolAddressesProvider public poolAddressesProvider;
    uint256 public constant MIN_DEPOSIT = 10000; // Minimum deposit amount in USDC
    uint256 public endTime; // End time for the lottery
    
    mapping(address => User) public users; // Mapping of user addresses to their data
    address public head; // Head of the linked list
    uint256 public totalEntries; // Total number of entries in the lottery
    uint256 public startTime; // Start time for the lottery

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
        startTime = block.timestamp; // Set the start time to contract deployment time
        endTime = startTime + 10000;
    }
    struct User {
        uint256 entries; // User's TWAB as number of entries
        uint256 depositAmount;
        address next; // Pointer to the next user in the list
    }




   function deposit(uint256 amount) external {
    require(amount > 0, "Amount must be greater than 0");
    require(block.timestamp < endTime, "Lottery has ended");

    tokenContract.transferFrom(msg.sender, address(this), amount);
    tokenContract.approve(address(lendingPool), amount);
    lendingPool.supply(address(tokenContract), amount, address(this), 0);

    uint256 additionalEntries = calculateEntries(amount, msg.sender);
    if (users[msg.sender].entries == 0) { // If it's a new user
        users[msg.sender].next = head; // Add new user to the front of the list
        head = msg.sender;
    }
    users[msg.sender].entries += additionalEntries;
    users[msg.sender].depositAmount += amount;
    totalEntries += additionalEntries;
}

    function calculateEntries(uint256 amount, address user) internal view returns (uint256) {
        uint256 timeLeft = endTime > block.timestamp ? endTime - block.timestamp : 0;
        return (amount / MIN_DEPOSIT) * timeLeft / (startTime - endTime);
    }

    function getSuppliedAmount() external view returns (uint256) {
        DataTypes.ReserveData memory reserveData = lendingPool.getReserveData(
            address(tokenContract)
        );
        IERC20 aToken = IERC20(reserveData.aTokenAddress);
        return aToken.balanceOf(address(this));
    }

    function withdraw() external {
    require(users[msg.sender].depositAmount > 0, "You have not supplied any tokens");

    uint256 amountToWithdraw = users[msg.sender].depositAmount;

    // Reset the user's lottery entries and deposited amount
    totalEntries -= users[msg.sender].entries;
    users[msg.sender].entries = 0;
    users[msg.sender].depositAmount = 0;

    // Withdraw the tokens back to the user
    require(lendingPool.withdraw(address(tokenContract), amountToWithdraw, msg.sender), "Withdrawal failed");

    // Note: The removal from the linked list is not addressed in this function.
    // Consider adding logic to handle the linked list if necessary.
    }
}
