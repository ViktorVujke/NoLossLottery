const fs = require('fs/promises');
const path = require('path');
const ethers = require("ethers");
const { Contracts } = require('../../SmartContracts/src/contracts');

let contracts = [];
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const bot = new ethers.Wallet("0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e", provider);

const lookForChange = async () => {
    const factoryAddressPath = path.join(__dirname, '../contracts/factoryAddress.txt');
    const factoryABIPath = path.join(__dirname, '../contracts/FactoryABI.json');
    const factoryABIContents = await fs.readFile(factoryABIPath, { encoding: 'utf8' });
    const factoryAddress = await fs.readFile(factoryAddressPath, { encoding: 'utf8' });
    const factoryABI = JSON.parse(factoryABIContents);
    const contract = new ethers.Contract(factoryAddress, factoryABI);
    const result = await Contracts.execute(contract, "getLotteries", [], 0, bot);
    console.log(result.result);
}

lookForChange();
setInterval(lookForChange, 20000);
