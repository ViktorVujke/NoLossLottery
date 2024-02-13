const hre = require("hardhat");
const { Contracts } = require(".");
const Lottery = {}

Lottery.getContract = async () => {
    if (!Lottery.contract) {
        const Factory = await hre.ethers.getContractFactory("NoLossLottery");
        Lottery.contract = await Factory.deploy("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
        await Lottery.contract.waitForDeployment();
    }
    return Lottery.contract;
}

module.exports = Lottery;