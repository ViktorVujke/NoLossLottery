// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./DataTypes.sol";
import "../interfaces/IPool.sol";
import "../interfaces/IPoolAddressesProvider.sol";
import "../interfaces/IUniswapV2Router.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBase.sol";

contract NoLossLottery is VRFConsumerBase {
    IERC20 public tokenContract;
    IUniswapV2Router public uniswapRouter;
    IPool public lendingPool;
    IPoolAddressesProvider public poolAddressesProvider;
    uint256 start;
    uint256 end;
    uint256 depositEnd;
    uint256 minDeposit;

    // Chainlink VRF variables
    bytes32 internal keyHash;
    uint256 internal fee;

    // Add a state variable to store the random result
    uint256 public randomResult;
    uint256 randomNumber;
    bool public isRandomnessRequested = false; // To prevent multiple requests
    address owner;
    event Emklvmt(uint256 ert);

    receive() external payable {}

    fallback() external payable {}

    constructor(
        address tokenContractAddress,
        address ownerAddress,
        uint256 minimalDepositAmount,
        uint256 durationInDays,
        uint256 depositTimeLimitInDays
    )
        VRFConsumerBase(
            0xf0d54349aDdcf704F77AE15b96510dEA15cb7952,
            0x514910771AF9Ca656af840dff83E8264EcF986CA
        )
    {
        require(
            minimalDepositAmount > 0,
            "Minimal deposit amount has to be at least 1 unit"
        );
        require(durationInDays > 0, "Lottery has to last at least 1 day");
        require(
            depositTimeLimitInDays > 0 &&
                depositTimeLimitInDays <= durationInDays,
            "Deposit time limit has to be positive and <= duration"
        );
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

        minDeposit = minimalDepositAmount;
        owner = ownerAddress;
        start = block.timestamp;
        depositEnd = start + depositTimeLimitInDays * 86400;
        end = start + durationInDays * 86400;

        keyHash = 0xAA77729D3466CA35AE8D28B3BBAC7CC36A5031EFDC430821C02BC31A238AF445;
        fee = 2 * 10 ** 18; // 1 LINK, accounting for 18 decimal places
    }

function getLotteryInfo()
    public
    view
    returns (
        address tokenAddress,
        uint256 totalSupplied,
        uint256 currentReward,
        uint256 daysUntilEnd,
        uint256 depositEndTime, // Added depositEnd to the return signature
        uint256 minimumDeposit  // Added minDeposit to the return signature
    )
{
    tokenAddress = address(tokenContract);
    totalSupplied = supplied;
    currentReward = getYieldAmount();
    daysUntilEnd = (end > block.timestamp)
        ? (end - block.timestamp) / 60 / 60 / 24
        : 0; // Convert seconds to days

    depositEndTime = depositEnd; // Assume depositEndTime is a state variable representing the end of the deposit period
    minimumDeposit = minDeposit; // Assume minimumDeposit is a state variable representing the minimum deposit amount
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
    uint256 prize = 0;

    modifier ownerOnly() {
        require(msg.sender == owner, "Access denied: Caller is not the owner");
        _;
    }

    function getMinimalAllowedDeposit() external view returns (uint256) {
        return minDeposit;
    }

    function deposit(uint256 amount) external {
        // require(block.timestamp < end, "Lottery is over");
        require(
            block.timestamp < depositEnd,
            "You can no longer deposit in this lottery"
        );
        require(
            amount + balances[msg.sender].amount >= minDeposit,
            "Your total deposited amount cannot be lower than minimal allowed deposit"
        );
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

    function getYieldAmountInWEI() external view returns (uint256) {
        DataTypes.ReserveData memory reserveData = lendingPool.getReserveData(
            address(tokenContract)
        );
        IERC20 aToken = IERC20(reserveData.aTokenAddress);
        uint256 amountInERC20 = aToken.balanceOf(address(this)) - supplied;
        if (amountInERC20 == 0) return 0;

        address[] memory path = new address[](2);
        path[0] = address(tokenContract);
        path[1] = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

        uint[] memory amounts = uniswapRouter.getAmountsOut(
            amountInERC20,
            path
        );

        return amounts[1];
    }

    function getEnd() public view returns (uint256) {
        return end;
    }

    function withdraw(uint256 amount) external {
        require(
            (balances[msg.sender].amount - amount >= minDeposit) ||
                (balances[msg.sender].amount == amount),
            "After your withdrawal, your deposited amount can either be 0 (withdraw all your balance) or greater than or equal to minimal deposited amout (partial withdraw)"
        );
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

    function getLinkForRandomness() internal {
        address[] memory linkPath = new address[](3);
        linkPath[0] = address(tokenContract); // The token you are swapping from
        linkPath[1] = uniswapRouter.WETH(); // The intermediary token, WETH
        linkPath[2] = 0x514910771AF9Ca656af840dff83E8264EcF986CA; // LINK token address
        if (LINK.balanceOf(address(this)) < fee) {
            // Assume `fee` is the amount of LINK needed for the randomness request
            uint256 linkShortage = fee - LINK.balanceOf(address(this));

            // Calculate the amount of the lottery's token needed to buy the LINK shortage
            // This is an oversimplified approach; ensure you handle slippage and other trading concerns
            uint256 tokenAmountRequired = uniswapRouter.getAmountsIn(
                linkShortage,
                linkPath
            )[0];

            require(
                getYieldAmount() >= tokenAmountRequired,
                "You do not have enough tokens in lottery winnings to trigger link purchase"
            );

            lendingPool.withdraw(
                address(tokenContract),
                tokenAmountRequired,
                address(this)
            );
            // Ensure the contract has enough tokens to perform the swap
            require(
                IERC20(tokenContract).balanceOf(address(this)) >=
                    tokenAmountRequired,
                "Not enough tokens for LINK purchase"
            );

            // Approve Uniswap router to spend tokens
            IERC20(tokenContract).approve(
                address(uniswapRouter),
                tokenAmountRequired
            );

            // Perform the swap from the lottery's token to LINK
            // Note: Adjust the `swap` function parameters as needed
            uniswapRouter.swapExactTokensForTokens(
                tokenAmountRequired,
                linkShortage,
                linkPath,
                address(this),
                block.timestamp + 15 minutes
            );

            // After swap, check LINK balance again to ensure there's enough for the fee
            require(
                LINK.balanceOf(address(this)) >= fee,
                "Swap failed to provide enough LINK"
            );
        }

        require(
            LINK.balanceOf(address(this)) >= fee,
            "Not enough LINK - fill contract with faucet"
        );
    }

    function linkBalance() public {
        getLinkForRandomness();
        emit Emklvmt(LINK.balanceOf(address(this)));
    }

    function drawWinner() external {
        uint256 totalYield = getYieldAmount();
        require(block.timestamp >= end, "Lottery still in progress");
        require(!isRandomnessRequested, "Randomness already requested");

        getLinkForRandomness();

        getRandomNumber();
        isRandomnessRequested = true;

        // TODO videti jel ovo dobro
        uint256 estimatedGas = 863210 * tx.gasprice;

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

        prize = totalYield - amountInMax;
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
        require(prize > 0, "Lottery already won");
        uint256 num = randomNumber % totalEntries;
        address addr = head;
        while (addr != address(0)) {
            uint256 ent = balances[addr].entries;
            if (num < ent) {
                winner = addr;
                prize = 0;
                uint256 yield = getYieldAmount();
                balances[addr].amount += yield;
                supplied += yield;
                return;
            }
            num -= ent;
            addr = balances[addr].next;
        }
    }

    function getWithdrawableOwnerProfit() public view returns (uint256) {
        if(!isRandomnessRequested){
            return 0;
        }
        return getYieldAmount() - prize;
    }

    function withdrawOwnerProfit() external ownerOnly {
        require(
            isRandomnessRequested,
            "You can not withdraw before winner has been drawn"
        );
        uint256 profit = getWithdrawableOwnerProfit();
        lendingPool.withdraw(address(tokenContract), profit, msg.sender);
    }

    // Function to request randomness
    function getRandomNumber() public returns (bytes32 requestId) {
        require(
            LINK.balanceOf(address(this)) >= fee,
            "Not enough LINK - fill contract with faucet"
        );
        return requestRandomness(keyHash, fee);
    }

    // Chainlink VRF callback function
    function fulfillRandomness23(uint256 randomness) external {
        randomNumber = randomness;
    }

    function fulfillRandomness(
        bytes32 /* requestId */,
        uint256 randomness
    ) internal override {
        randomResult = randomness;
        isRandomnessRequested = false; // Reset the flag
        // Now you can proceed with any logic that depends on the random number.
    }
}
