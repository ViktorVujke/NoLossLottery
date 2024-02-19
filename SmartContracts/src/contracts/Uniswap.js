const hre = require("hardhat");
const { Contracts } = require(".");
const { getBalance } = require("../users");
const Uniswap = {}

Uniswap.getContract = async () => {
    if (!Uniswap.contract)
        Uniswap.contract = new hre.ethers.Contract("0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", require("./ABI/Uniswap.json"));
    return Uniswap.contract;
}

Uniswap.buyExactUSDCForEth = async (wallet, amountSatoshi) => {
    const path = ["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"]
    const amountsIn = await Contracts.execute(await Uniswap.getContract(), "getAmountsIn", [amountSatoshi, path], 0, wallet);
    const ethRequired = amountsIn.result[0];
    const trade = await Contracts.execute(await Uniswap.getContract(), "swapETHForExactTokens", [amountSatoshi, path, wallet.address, Date.now() + 10 * 60 * 1000], ethRequired, wallet);
    return trade.ok;
}
Uniswap.buyExactTokenForEth = async (tokenAddress, wallet, amountSatoshi) => {
    const path = ["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", tokenAddress]
    const amountsIn = await Contracts.execute(await Uniswap.getContract(), "getAmountsIn", [amountSatoshi, path], 0, wallet);
    const ethRequired = amountsIn.result[0];
    const trade = await Contracts.execute(await Uniswap.getContract(), "swapETHForExactTokens", [amountSatoshi, path, wallet.address, Date.now() + 10 * 60 * 1000], ethRequired, wallet);
    return trade.ok;
}

module.exports = { Uniswap }