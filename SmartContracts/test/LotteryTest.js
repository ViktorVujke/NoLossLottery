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
    const globalS = {};

    it("Initialize", async () => {
        globalS.user = (await hre.ethers.getSigners())[0];
        await USDC.buy(globalS.user, 20000000n);
        globalS.initial = await USDC.getBalance(globalS.user);
        globalS.lottery = await Lottery.deployUSDC(30000)
        await USDC.approve(globalS.user, 20000000n, globalS.lottery.target)
    })

    it("Exceed allowance", async () => {
        const result = await Contracts.execute(globalS.lottery, "deposit", [50000000n], 0, globalS.user);
        expect(result.ok).to.equal(false);
    })

    it("Exceed balance", async () => {
        const result = await Contracts.execute(globalS.lottery, "deposit", [40000000n], 0, globalS.user);
        expect(result.ok).to.equal(false);
    })

    it("Working deposit", async () => {
        const result = await Contracts.execute(globalS.lottery, "deposit", [10000000n], 0, globalS.user);
        expect((result.ok)).to.equal(true);
    })

    /*it("Already have position", async () => {
        const result = await Contracts.execute(globalS.lottery, "deposit", [10000000n], 0, globalS.user);
        expect((result.ok)).to.equal(false);
    })*/

    it("Increase over time", async () => {
        await hre.network.provider.send("evm_increaseTime", [10000]);
        await hre.network.provider.send("evm_mine");
        const result = await Contracts.execute(globalS.lottery, "getYieldAmount", [], 0, globalS.user);
        expect(result.result).to.greaterThan(0n);
        globalS.amount = result.result;
    })
    it("Increase over time 2", async () => {
        await hre.network.provider.send("evm_increaseTime", [10000]);
        await hre.network.provider.send("evm_mine");
        const result = await Contracts.execute(globalS.lottery, "getYieldAmount", [], 0, globalS.user);
        expect(result.result).to.greaterThan(globalS.amount);
    })
    it("Withdraw", async () => {
        const result = await Contracts.execute(globalS.lottery, "withdraw", [10000000n], 0, globalS.user);
        expect(result.ok).to.equal(true);
    })
    it("GetYield after withdraw", async () => {
        const result = await Contracts.execute(globalS.lottery, "getYieldAmount", [], 0, globalS.user);
        expect(result.result).to.greaterThan(0);
    })
    it("Deposit v2", async () => {
        const result = await Contracts.execute(globalS.lottery, "deposit", [10000000n], 0, globalS.user);
        expect(result.ok).to.equal(true);
    })
    it("Unauthorized depozit", async () => {
        await Contracts.execute(globalS.lottery, "withdraw", [10000000n], 0, globalS.user);
        const result = await Contracts.execute(globalS.lottery, "deposit", [10000000n], 0, globalS.user);
        expect(result.ok).to.equal(false);
        expect(await USDC.getBalance(globalS.user)).to.equal(globalS.initial);
    })
    it("Second depositor", async () => {
        globalS.user2 = (await hre.ethers.getSigners())[1];
        await USDC.buy(globalS.user2, 30000000n);
        await USDC.approve(globalS.user2, 30000000n, globalS.lottery.target)
        const result = await Contracts.execute(globalS.lottery, "deposit", [30000000n], 0, globalS.user2);
        expect(result.ok).to.equal(true);
    })
    it("Early win", async () => {
        const result = await Contracts.execute(globalS.lottery, "win", [], 0, globalS.user2);
        expect(result.ok).to.equal(false);
    })
    it("First back", async () => {
        await USDC.approve(globalS.user, 20000000n, globalS.lottery.target)
        const result = await Contracts.execute(globalS.lottery, "deposit", [20000000n], 0, globalS.user);
        expect(result.ok).to.equal(true);
        expect((await Contracts.execute(globalS.lottery, "getSuppliedAmount", [], 0, globalS.user)).result).to.equal(50000000n);
        await hre.network.provider.send("evm_increaseTime", [5000]);
        await USDC.buy(globalS.user, 20000000n);
        await USDC.approve(globalS.user, 20000000n, globalS.lottery.target)
        await Contracts.execute(globalS.lottery, "deposit", [20000000n], 0, globalS.user);
        expect(((await Contracts.execute(globalS.lottery, "getTotalEntries", [], 0, globalS.user))).result).to.closeTo(20000000n, 100000);
    })

    it("Final log", async () => {
        await hre.network.provider.send("evm_increaseTime", [5000]);
        await Contracts.execute(globalS.lottery, "win", [Math.floor(Math.random() * 1000000001)], 0, globalS.user)
        const winner = (await Contracts.execute(globalS.lottery, "getWinner", [], 0, globalS.user)).result;
        if (winner == globalS.user.address) {
            console.log("PRVI POBEDIO")
        }
        if (winner == globalS.user2.address) {
            console.log("DRUGI POBEDIO")
        }
    })

})

