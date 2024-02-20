const fs = require('fs/promises');
const path = require('path');
const ethers = require("ethers");
const { Contracts } = require('../../SmartContracts/src/contracts');

let contracts = {};
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const bot = new ethers.Wallet("0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e", provider);

const callDrawWinner = async (lotteryAddress) => {
    // Mozda neka provera, da ne budemo revertovani
    console.log("Lutrija " + lotteryAddress + " gotova, zovem draw winner");

    const lottery = await createContractFromAddressAndABILocation(lotteryAddress, '../contracts/LotteryABI.json')
    const rewardAmount = (await Contracts.execute(lottery, "getYieldAmountInWEI", [], 0, bot)).result || 0;
    const acceptableCompensation = BigInt(2) * BigInt(863210) * BigInt(ethers.formatUnits(await provider.send("eth_gasPrice", []), 'wei'))

    if (rewardAmount < acceptableCompensation)
        return console.log(`Lutrija ${lotteryAddress} mala (yield je ${rewardAmount} WEI)`);

    console.log(await Contracts.execute(lottery, "drawWinner", [], 0, bot))
    // Simulirati ChainLink
    console.log("draw winner izvrsen")
}

const createContractFromAddressAndABILocation = async (address, ABILocation) => {
    const ABIPath = path.join(__dirname, ABILocation);
    const ABIContents = await fs.readFile(ABIPath, { encoding: 'utf8' });
    const ABI = JSON.parse(ABIContents);
    return new ethers.Contract(address, ABI);
}

const handleNewLottery = async (address) => {//'../contracts/LotteryABI.json'
    const contract = await createContractFromAddressAndABILocation(address, '../contracts/LotteryABI.json')

    const result = await Contracts.execute(contract, "getEnd", [], 0, bot);
    const end = parseInt(result.result);
    console.log(`Lutrija ${address} se zavrsava ${(new Date(end * 1000)).toLocaleString()}`)
    const winnerDrawn = false;// Izracunati i ovo
    if (winnerDrawn)
        return;

    // Zbog hardhat advancovanja vremena ne mogu samo da stavim ovde timeout, zato se koristi checkForEnded
    contracts[address] = end;

    // U slucaju kad se gleda pravo vreme
    // (end <= Date.now()) ? callDrawWinner(address) : setTimeout(callDrawWinner.bind(null, address), end - Date.now())
}

const lookForUpdate = async () => {
    const factoryAddressPath = path.join(__dirname, '../contracts/factoryAddress.txt');
    const factoryAddress = await fs.readFile(factoryAddressPath, { encoding: 'utf8' });
    const contract = await createContractFromAddressAndABILocation(factoryAddress, '../contracts/FactoryABI.json');
    const result = await Contracts.execute(contract, "getLotteries", [], 0, bot);
    for (const contractAddress of result.result) {
        if (contracts[contractAddress])
            continue;
        contracts[contractAddress] = true;
        handleNewLottery(contractAddress);
    }
}

lookForUpdate();
setInterval(lookForUpdate, 10000);


const checkForEnded = async () => {
    console.log("Vreme je: " + (new Date((await provider.getBlock("latest")).timestamp * 1000)).toLocaleString());
    for (const lottery in contracts) {
        const end = contracts[lottery];

        // Ne pratimo ga
        if (end === true)
            continue;

        // Nije jos gotov
        if ((await provider.getBlock("latest")).timestamp < end)
            continue;

        contracts[lottery] = true;
        callDrawWinner(lottery);
    }
}

setInterval(checkForEnded, 1000);