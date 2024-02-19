const hre = require("hardhat");
const { Contracts } = require(".");
const { USDC } = require("./ERC20");
const Lottery = {}

Lottery.deployFactory = async () => {
    const Factory = await hre.ethers.getContractFactory("NoLossLotteryFactory");
    const contract = await Factory.deploy();
    await contract.waitForDeployment();
    return contract;
}

Lottery.deployLotteryUsingFactory = async (factory, tokenAddress, seconds) => {
    const bot = (await hre.ethers.getSigners())[19];
    const result = await Contracts.execute(factory, "createLottery", [tokenAddress, seconds], 0, bot);
    const NoLossLotteryABI = await hre.artifacts.readArtifact("NoLossLottery");
    return new hre.ethers.Contract(result.events[0].args[0], NoLossLotteryABI.abi);
}

Lottery.deployUSDC = async (seconds) => {
    const Factory = await hre.ethers.getContractFactory("NoLossLottery");
    Lottery.contract = await Factory.deploy(USDC.address, seconds);
    await Lottery.contract.waitForDeployment();
    return Lottery.contract;
}

Lottery.getContract = async () => {
    if (!Lottery.contract) {
        const Factory = await hre.ethers.getContractFactory("NoLossLottery");
        Lottery.contract = await Factory.deploy("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
        await Lottery.contract.waitForDeployment();
    }
    return Lottery.contract;
}

module.exports = Lottery;