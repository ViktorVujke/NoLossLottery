const hre = require("hardhat");

const createWallet = async () => {
    const wallet = hre.ethers.Wallet.createRandom(new hre.ethers.JsonRpcProvider());
    return wallet;
}

function dec2hex(str) { // .toString(16) only works up to 2^53
    var dec = str.toString().split(''), sum = [], hex = [], i, s
    while (dec.length) {
        s = 1 * dec.shift()
        for (i = 0; s || i < sum.length; i++) {
            s += (sum[i] || 0) * 10
            sum[i] = s % 16
            s = (s - sum[i]) / 16
        }
    }
    while (sum.length) {
        hex.push(sum.pop().toString(16))
    }
    return hex.join('')
}

async function setBalance(wallet, etherAmountStr) {
    await hre.network.provider.send("hardhat_setBalance", [
        wallet.address,
        "0x" + dec2hex(hre.ethers.parseUnits(etherAmountStr.toString(), "ether").toString()),
    ]);
}

async function getBalance(wallet) {
    const balance = await hre.ethers.provider.getBalance(wallet.address);
    return hre.ethers.formatEther(balance);
}


module.exports = { createWallet, setBalance, getBalance }