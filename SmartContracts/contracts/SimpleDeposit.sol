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
}
interface UniswapV2Router02 {
    function swapETHForExactTokens(
        uint256 amountOut,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable returns (uint256[] memory amounts);
    function getAmountsIn(
        uint256 amountOut,
        address[] memory path
    ) external view returns (uint256[] memory amounts);
}
contract SimpleDeposit is Ownable {
    IERC20 public usdcToken;
    IUniswapV2Router public uniswapRouter;
    mapping(address => uint256) public balances;

    event Deposited(address indexed user, uint256 amount, string currency);

    constructor( address _initialOwner) Ownable(_initialOwner) {
        usdcToken = IERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
        uniswapRouter = IUniswapV2Router(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);
    }

    function deposit(uint256 amount) public {
        require(amount > 0, "Amount must be greater than 0");
        require(usdcToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        balances[msg.sender] += amount;
        emit Deposited(msg.sender, amount, "USDC");
    }

    // Optional: Function to allow users to check their balance
    function getBalance(address user) public view returns (uint256) {
        return balances[user];
    }

    function depositETHForUSDC(uint amountOutMin, uint deadline) external payable {
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
            uint usdcReceived = usdcToken.balanceOf(address(this)) - balances[address(this)];
            balances[msg.sender] += usdcReceived;
            
            emit Deposited(msg.sender, usdcReceived, "USDC");
        }
        // SPREMOOOOOOOOOOOOO
function getUsdcBalance(address addr) public view returns (uint256) {
        IERC20 usdcContract = IERC20(
            0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
        );
        return usdcContract.balanceOf(addr);
    }
function topUpUSDC(uint256 requestedAmount) public payable {
        uint256 usdc = getUsdcBalance(msg.sender);
        uint256 satoshis = requestedAmount*1000000;
        if (usdc >= satoshis) {
            payable(msg.sender).transfer(msg.value);
            return;
        }
        uint256 amount = satoshis - usdc;
        UniswapV2Router02 uniswapRouter = UniswapV2Router02(
            0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
        );
        address[] memory path = new address[](2);
        path[0] = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
        path[1] = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
        uint256[] memory amountsIn = uniswapRouter.getAmountsIn(amount, path);
        uint256 ethRequired = amountsIn[0];
        require(msg.value >= ethRequired, "Not enough ETH sent");
        uniswapRouter.swapETHForExactTokens{value: ethRequired}(
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
