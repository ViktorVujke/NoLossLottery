// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./NoLossLottery.sol";

contract NoLossLotteryFactory {
    // Array to hold addresses of all lotteries
    address[] public lotteries;

    event LotteryCreated(address lotteryAddress);

    function createLottery(address tokenContractAddress, uint256 duration) public {
        NoLossLottery newLottery = new NoLossLottery(tokenContractAddress, duration);
        lotteries.push(address(newLottery));
        emit LotteryCreated(address(newLottery));
    }

    function getLotteries() public view returns (address[] memory) {
        return lotteries;
    }
}
