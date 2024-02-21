const hre = require("hardhat");
const Lottery = require("../src/contracts/Lottery");
const fs = require('fs').promises;
const path = require('path');
const { Contracts } = require("../src/contracts");
const { USDC } = require("../src/contracts/ERC20");

async function main() {
    const factoryAddressPath = path.join(__dirname, '../../Back/contracts/factoryAddress.txt');
    const factoryAddress = await fs.readFile(factoryAddressPath, { encoding: 'utf8' });

    const factoryABIPath = path.join(__dirname, '../../Back/contracts/FactoryABI.json');
    const factoryABIContents = await fs.readFile(factoryABIPath, { encoding: 'utf8' });
    const factoryABI = JSON.parse(factoryABIContents);

    const factory = new hre.ethers.Contract(factoryAddress, factoryABI);

    const creator = (await hre.ethers.getSigners())[0];
    const createLotteryResult = await Contracts.execute(factory, "createLottery", [USDC.address, 1000, 31, 30], 0, creator);
    console.log(createLotteryResult)
    const lotteryAddress = createLotteryResult.events[0].args[0];

    const NoLossLotteryABI = await hre.artifacts.readArtifact("NoLossLottery");
    const lottery = new hre.ethers.Contract(lotteryAddress, NoLossLotteryABI.abi);

    const user = (await hre.ethers.getSigners())[0];
    await USDC.buy(user, 20000000000n); // 20k usd -> rast 200
    await USDC.approve(user, 20000000000n, lottery.target)
    await Contracts.execute(lottery, "deposit", [20000000000n], 0, user);
}

main();