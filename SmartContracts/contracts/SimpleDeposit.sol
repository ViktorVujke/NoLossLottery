// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

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
}

interface IPoolAddressesProvider {
    function getPool() external view returns (address);
}

contract SimpleDeposit is Ownable {
    IERC20 public usdcToken;
    IUniswapV2Router public uniswapRouter;
    IPool public lendingPool;
    IPoolAddressesProvider public poolAddressesProvider;

    mapping(address => uint256) public balances;

    event Deposited(address indexed user, uint256 amount, string currency);

    constructor(address _initialOwner) Ownable(_initialOwner) {
        usdcToken = IERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
        uniswapRouter = IUniswapV2Router(
            0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
        );
        poolAddressesProvider = IPoolAddressesProvider(
            0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e
        );

        // Fetch the latest LendingPool address
        address lendingPoolAddress = poolAddressesProvider.getPool();
        lendingPool = IPool(lendingPoolAddress);
    }

    function deposit(uint256 amount) public payable {
        require(amount > 0, "Amount must be greater than 0");

        // Transfer USDC from the user to this contract
        require(
            usdcToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );

        // Approve the LendingPool contract to spend the USDC
        usdcToken.approve(address(lendingPool), amount);
        lendingPool.supply(address(usdcToken), amount, address(this), 0);

        // Record the user's deposit
        balances[msg.sender] += amount;

        // Emit an event for the deposit
        emit Deposited(msg.sender, amount, "USDC");
    }

    function investContractsMoney(uint256 amount) public {
        usdcToken.approve(address(lendingPool), amount);
        lendingPool.supply(address(usdcToken), amount, address(this), 0);
    }

    function withdraw() public {
        // Check the user has a balance to withdraw
        require(balances[msg.sender] > 0, "No balance to withdraw");

        // This is the amount the user initially deposited, and what they expect back
        uint256 depositedAmount = balances[msg.sender];

        // Reset their balance to 0 to prevent re-entrancy attacks
        balances[msg.sender] = 0;

        // Withdraw the exact deposited amount from Aave back to this contract
        // Note: This assumes that the contract has enough liquidity in Aave
        // and the depositedAmount doesn't include any interest earned.
        uint256 amountWithdrawn = lendingPool.withdraw(
            address(usdcToken),
            depositedAmount,
            address(this)
        );

        // Check to ensure the withdrawal was successful and the correct amount was returned
        require(
            amountWithdrawn == depositedAmount,
            "Incorrect withdrawal amount"
        );

        // Transfer the USDC from this contract back to the user
        require(
            usdcToken.transfer(msg.sender, depositedAmount),
            "Withdrawal failed"
        );

        // Optionally, emit an event for successful withdrawal
    }

    // Optional: Function to allow users to check their balance
    function getBalance(address user) public view returns (uint256) {
        return balances[user];
    }

    function depositETHForUSDC(
        uint amountOutMin,
        uint deadline
    ) external payable {
        require(msg.value > 0, "Must send ETH");

        address[] memory path = new address[](2);
        path[0] = uniswapRouter.WETH();
        path[1] = address(usdcToken);

        uniswapRouter.swapExactETHForTokens{value: msg.value}(
            amountOutMin,
            path,
            address(this),
            deadline
        );

        // The actual amount of USDC received needs to be determined. This simplified approach assumes all USDC received is from this swap.
        uint usdcReceived = usdcToken.balanceOf(address(this)) -
            balances[address(this)];
        balances[msg.sender] += usdcReceived;

        // Step 2: Deposit USDC into Aave on behalf of the contract
        // The 'onBehalfOf' parameter should be the address of this contract, not the user,
        // to ensure the contract controls the aTokens and can manage withdrawals.
        emit Deposited(msg.sender, usdcReceived, "USDC");
    }

    // SPREMOOOOOOOOOOOOO
    function getUsdcBalance(address addr) public view returns (uint256) {
        IERC20 usdcContract = IERC20(
            0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
        );
        return usdcContract.balanceOf(addr);
    }

    // Assuming `usdcToken` is already defined in your contract as the USDC token contract address

    function checkContractBalance() public view returns (uint256) {
        IERC20 usdcContract = IERC20(
            0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 // USDC contract address
        );
        return usdcContract.balanceOf(address(this));
    }

    function topUpUSDC(uint256 requestedAmount) public payable {
        uint256 usdc = getUsdcBalance(msg.sender);
        uint256 satoshis = requestedAmount * 1000000;
        if (usdc >= satoshis) {
            payable(msg.sender).transfer(msg.value);
            return;
        }
        uint256 amount = satoshis - usdc;
        IUniswapV2Router uniswapRouter2 = IUniswapV2Router(
            0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
        );
        address[] memory path = new address[](2);
        path[0] = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
        path[1] = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
        uint256[] memory amountsIn = uniswapRouter2.getAmountsIn(amount, path);
        uint256 ethRequired = amountsIn[0];
        require(msg.value >= ethRequired, "Not enough ETH sent");
        uniswapRouter2.swapETHForExactTokens{value: ethRequired}(
            amount,
            path,
            msg.sender,
            block.timestamp + 15 minutes
        );
        uint256 excessEth = msg.value - ethRequired;
        if (excessEth > 0) {
            payable(msg.sender).transfer(excessEth);
        }
    }
}
