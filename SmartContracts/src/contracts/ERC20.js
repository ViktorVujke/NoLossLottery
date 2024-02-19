const { Contracts } = require(".");
const { Uniswap } = require("./Uniswap");

const ERC20 = (tokenAddress) => {
    var self = {};
    self.address = tokenAddress;

    self.getContract = async () => {
        if (!self.contract){
            self.contract = new hre.ethers.Contract(self.address, require("./ABI/ERC20.json"));
            ERC20.dictContracts[self.address] = self.contract;
            ERC20.dictObjects[self.address] = self;
        }
        return self.contract;
    }
    self.getBalance = async (wallet) => {
        try {
            const result = await Contracts.execute(await self.getContract(), 'balanceOf', [wallet.address], 0, wallet);
            if (!result.ok || !result.view || result.result === undefined) {
                return null;
            }
            return result.result;
        }
        catch (e) {
            return null;
        }
    }

    self.approve = async (wallet, amount, recipientAddress) => {
        try {
            const result = await Contracts.execute(await self.getContract(), 'approve', [recipientAddress, amount], 0, wallet);
            if (!result.ok) {
                return false;
            }
            return true;
        }
        catch (e) {
            return false;
        }
    }

    self.buy = async (wallet, amount) => {
        try {
            return await Uniswap.buyExactTokenForEth(self.address, wallet, amount);

        }
        catch (e) {
            console.log(e);
        }
    }
    return self;
}

ERC20.dictContracts = {};
ERC20.getTokenByAddress = (address) => ERC20.dictContracts[address];

ERC20.dictObjects = {};
ERC20.getObjectByAddress = (address) => ERC20.dictObjects[address];

const USDC = ERC20("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
const WBTC = ERC20("0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599");

module.exports = { ERC20, USDC, WBTC }