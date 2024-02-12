const hre = require("hardhat");
const { Contracts } = require(".");
const Lottery = {}

Lottery.getContract = async () => {
    if (!Lottery.contract) {
        const Factory = await hre.ethers.getContractFactory("NoLossLottery");
        Lottery.contract = await Factory.deploy();
        await Lottery.contract.waitForDeployment();
    }
    return Lottery.contract;
}

module.exports = Lottery;