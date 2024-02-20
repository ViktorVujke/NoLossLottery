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

    await Contracts.execute(factory, "createLottery", [USDC.address, 31 * 86400], 0, (await hre.ethers.getSigners())[0]);

}

main();