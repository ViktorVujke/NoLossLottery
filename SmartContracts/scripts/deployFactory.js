const hre = require("hardhat");
const Lottery = require("../src/contracts/Lottery");
const fs = require('fs').promises;
const path = require('path');

async function main() {
    const bot = (await hre.ethers.getSigners())[19];
    const factory = await Lottery.deployFactory(bot.address);
    const factoryAddress = factory.target;
    const factoryABI = (await hre.artifacts.readArtifact("NoLossLotteryFactory")).abi;
    const lotteryABI = (await hre.artifacts.readArtifact("NoLossLottery")).abi;

    const baseDir = path.join(__dirname, '../../Back/contracts');
    const factoryAddressPath = path.join(baseDir, 'FactoryAddress.txt');
    const factoryABIPath = path.join(baseDir, 'FactoryABI.json');
    const lotteryABIPath = path.join(baseDir, 'LotteryABI.json');

    await fs.mkdir(baseDir, { recursive: true });

    await fs.writeFile(factoryAddressPath, factoryAddress);
    await fs.writeFile(factoryABIPath, JSON.stringify(factoryABI, null, 2));
    await fs.writeFile(lotteryABIPath, JSON.stringify(lotteryABI, null, 2));
}

main();