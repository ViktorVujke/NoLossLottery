const hre = require("hardhat");
const { Contracts } = require(".");
const { Uniswap } = require("./Uniswap");
const { setBalance } = require("../users");
const Lottery = require("./Lottery");

const USDC = {};

USDC.getContract = async () => {
    if (!USDC.contract)
        USDC.contract = new hre.ethers.Contract("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", require("./ABI/USDC.json"));
    return USDC.contract;
}

USDC.getBalance = async (wallet) => {
    try {
        const result = await Contracts.execute(await USDC.getContract(), 'balanceOf', [wallet.address], 0, wallet);
        if (!result.ok || !result.view || result.result === undefined) {
            return null;
        }
        return result.result;
    }
    catch (e) {
        return null;
    }
}

USDC.approve = async (wallet, amount, recipientAddress) => {
    try {
        const result = await Contracts.execute(await USDC.getContract(), 'approve', [recipientAddress, amount], 0, wallet);
        if (!result.ok) {
            return false;
        }
        return true;
    }
    catch (e) {
        return false;
    }
}

USDC.buy = async (wallet, amount) => {
    try {
        return await Uniswap.buyExactUSDCForEth(wallet, amount);

    }
    catch (e) {
        console.log(e);
    }
}

module.exports = { USDC }