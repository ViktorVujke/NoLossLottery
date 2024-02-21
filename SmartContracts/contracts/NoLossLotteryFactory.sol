// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./NoLossLottery.sol";

contract NoLossLotteryFactory {
    // Array to hold addresses of all lotteries
    address[] public lotteries;
    address owner;

    constructor(address ownerAddress) {
        owner = ownerAddress;
    }

    event LotteryCreated(address lotteryAddress);

    function createLottery(
        address tokenContractAddress,
        uint256 minDeposit,
        uint256 durationInDays,
        uint256 depositTimeLimitInDays
    ) public {
        NoLossLottery newLottery = new NoLossLottery(
            tokenContractAddress,
            owner,
            minDeposit,
            durationInDays,
            depositTimeLimitInDays
        );
        lotteries.push(address(newLottery));
        emit LotteryCreated(address(newLottery));
    }

    function getLotteries() public view returns (address[] memory) {
        return lotteries;
    }
}
