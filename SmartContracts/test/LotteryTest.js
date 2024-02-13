const { expect } = require("chai");
const { Contracts } = require("../src/contracts");
const { createWallet, setBalance, getBalance } = require("../src/users");
const { USDC } = require("../src/contracts/USDC");
const { Uniswap } = require("../src/contracts/Uniswap");
const hre = require("hardhat");
const Lottery = require("../src/contracts/Lottery");

describe("Base architecture", function () {
    it("Contract deployment", async () => {
        expect((await USDC.getContract())?.approve, "USDC deployment failed").to.not.equal(undefined);
        expect((await Uniswap.getContract()), "Uniswap deployment failed").to.not.equal(undefined);
    })
    it("Wallet management", async () => {
        const wallet = await createWallet();
        expect(wallet?.address).to.not.equal(undefined);

        await setBalance(wallet, "0.1");

        expect(await getBalance(wallet)).to.equal("0.1");
    })
})

describe("Uniswap USDC", async () => {
    it("Buy USDC", async () => {
        const wallet = (await hre.ethers.getSigners())[0];//await createWallet();
        //await setBalance(wallet, "10000000000000000000000000000000");
        expect(await USDC.getBalance(wallet)).to.equal(0n);
        expect(await USDC.buy(wallet, 10000000n), "Top up failed").to.equal(true)
        expect(await USDC.getBalance(wallet)).to.equal(10000000n);
        expect(await USDC.buy(wallet, 1000000n), "Top up failed").to.equal(true)
        expect(await USDC.getBalance(wallet)).to.equal(11000000n);
    })
})

describe("Lottery Contract", async () => {
    it("Deposit USDC", async () => {
        const user1 = (await hre.ethers.getSigners())[0];
        await USDC.buy(user1, 2000000000n); // 100 dolara
        await USDC.approve(user1, 4000000000n, (await Lottery.getContract()).target)

        // Exceeds allowance
        const result1 = await Contracts.execute(await Lottery.getContract(), "deposit", [5000000000n], 0, user1);
        expect(result1.ok).to.equal(false);

        // Exceeds balance
        const result2 = await Contracts.execute(await Lottery.getContract(), "deposit", [4000000000n], 0, user1);
        expect(result2.ok).to.equal(false);

        // Working
        const result4 = await Contracts.execute(await Lottery.getContract(), "deposit", [1000000000n], 0, user1);
        expect(result4.ok).to.equal(true);

        // Already have a position
        const result5 = await Contracts.execute(await Lottery.getContract(), "deposit", [1000000000n], 0, user1);
        expect(result5.ok).to.equal(false);

        setInterval(async () => {
            await hre.network.provider.send("evm_mine"); 
            const result6 = await Contracts.execute(await Lottery.getContract(), "getSuppliedAmount", [], 0, user1);
            console.log(result6);
        }, 10000);

        await new Promise(resolve => setTimeout(resolve, 2000 * 1000));

    })

})

