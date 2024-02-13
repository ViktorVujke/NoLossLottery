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
    console.log("RUNUJEM DESCRIBEEE");
    const globalS = {};

    it("Initialize", async () => {
        globalS.user = (await hre.ethers.getSigners())[0];
        await USDC.buy(globalS.user, 20000000n);
        globalS.initial = await USDC.getBalance(globalS.user);
        await USDC.approve(globalS.user, 20000000n, (await Lottery.getContract()).target)
    })

    it("Exceed allowance", async () => {
        const result = await Contracts.execute(await Lottery.getContract(), "deposit", [50000000n], 0, globalS.user);
        expect(result.ok).to.equal(false);
    })

    it("Exceed balance", async () => {
        const result = await Contracts.execute(await Lottery.getContract(), "deposit", [40000000n], 0, globalS.user);
        expect(result.ok).to.equal(false);
    })

    it("Working deposit", async () => {
        const result = await Contracts.execute(await Lottery.getContract(), "deposit", [10000000n], 0, globalS.user);
        expect((result.ok)).to.equal(true);
    })

    it("Already have position", async () => {
        const result = await Contracts.execute(await Lottery.getContract(), "deposit", [10000000n], 0, globalS.user);
        expect((result.ok)).to.equal(false);
    })

    it("Exceed balance", async () => {
    })
    it("Exceed balance", async () => {
    })

    it("Deposit USDC", async () => {

        // Already have a position
        expect((await Contracts.execute(await Lottery.getContract(), "deposit", [10000000n], 0, globalS.user)).ok).to.equal(false);

        await hre.network.provider.send("evm_increaseTime", [10000]);
        await hre.network.provider.send("evm_mine");
        const result1 = await Contracts.execute(await Lottery.getContract(), "getSuppliedAmount", [], 0, globalS.user);
        expect(result1.result).to.greaterThan(10000000n);

        await hre.network.provider.send("evm_increaseTime", [10000]);
        await hre.network.provider.send("evm_mine");
        const result2 = await Contracts.execute(await Lottery.getContract(), "getSuppliedAmount", [], 0, globalS.user);
        expect(result2.result).to.greaterThan(result1.result);

        const withdrawAmountObj = await Contracts.execute(await Lottery.getContract(), "withdraw", [], 0, globalS.user);
        expect(withdrawAmountObj.ok).to.equal(true);

        const result6 = await Contracts.execute(await Lottery.getContract(), "getSuppliedAmount", [], 0, globalS.user);
        expect(result6.result).to.greaterThan(0);

        const result7 = await Contracts.execute(await Lottery.getContract(), "deposit", [10000000n], 0, globalS.user);
        expect(result7.ok).to.equal(true);

        await Contracts.execute(await Lottery.getContract(), "withdraw", [], 0, globalS.user);

        const result8 = await Contracts.execute(await Lottery.getContract(), "deposit", [10000000n], 0, globalS.user);
        expect(result8.ok).to.equal(false);
        expect(await USDC.getBalance(globalS.user)).to.equal(globalS.initial);


        console.log(await Contracts.execute(await Lottery.getContract(), "getSuppliedAmount", [], 0, globalS.user))
    })

})

