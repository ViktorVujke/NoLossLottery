const { expect } = require("chai");
const { Contracts } = require("../src/contracts");
const { createWallet, setBalance, getBalance } = require("../src/users");
const { USDC, WBTC, ERC20 } = require("../src/contracts/ERC20");
const { Uniswap } = require("../src/contracts/Uniswap");
const hre = require("hardhat");
const Lottery = require("../src/contracts/Lottery");

describe("Uniswap USDC", async () => {
    it("Buy USDC", async () => {
        const wallet = (await hre.ethers.getSigners())[0];

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

describe("Winner mechanism", async () => {
    it("Multiple members", async () => {
        const lottery = await Lottery.deployUSDC((60 + 1) * 86400) // 31 dan

        const bot = (await hre.ethers.getSigners())[19];

        const users = (await hre.ethers.getSigners()).slice(0, 15);

        for (const user of users) {
            await USDC.buy(user, 20000000000n);
            await USDC.approve(user, 20000000000n, lottery.target)
            await Contracts.execute(lottery, "deposit", [20000000000n], 0, user);
        }

        expect((await Contracts.execute(lottery, "getSuppliedAmount", [], 0, bot)).result).to.equal(300000000000n); // 300k usd u lutriji

        await hre.network.provider.send("evm_increaseTime", [60 * 86400]);
        await hre.network.provider.send("evm_mine");
        await hre.network.provider.send("evm_increaseTime", [86400]);
        expect((await Contracts.execute(lottery, "getWinner", [], 0, bot)).ok).to.equal(false);
        const oldBalance = await getBalance(bot)

        await Contracts.execute(lottery, "drawWinner", [], 0, bot)
        await Contracts.execute(lottery, "fulfillRandomness23", [Math.floor(Math.random() * 300000000000)], 0, bot)
        expect(await getBalance(bot)).to.greaterThanOrEqual(oldBalance);

        const winnerAddress = (await Contracts.execute(lottery, "getWinner", [], 0, bot)).result;
        let winner = null;
        for (const user of users)
            if (user.address == winnerAddress)
                winner = user;

        const balance1 = (await Contracts.execute(lottery, "getBalance", [winner.address], 0, winner)).result
        await Contracts.execute(lottery, "win", [], 0, (await hre.ethers.getSigners())[18])

        expect((await Contracts.execute(lottery, "getYieldAmount", [], 0, bot)).result).to.equal(0)
        const balance2 = (await Contracts.execute(lottery, "getBalance", [winner.address], 0, winner)).result
        expect(balance2).to.greaterThan(balance1);

        await Contracts.execute(lottery, "withdraw", [balance2], 0, winner)

        expect(await USDC.getBalance(winner)).to.approximately(balance2, balance2 / BigInt(1000));

        for (const user of users) {
            const balance = (await Contracts.execute(lottery, "getBalance", [user.address], 0, user)).result;
            if (balance > 0) {
                expect((await Contracts.execute(lottery, "withdraw", [balance], 0, user)).ok).to.equal(true);
            }
        }
        expect((await Contracts.execute(lottery, "getSuppliedAmount", [], 0, bot)).result).to.equal(0);
    })
})

describe("Lottery Factory", async () => {
    // 5 sekundi za 20 usera i 2 lutrije
    // 15 sekundi za 40 usera i 2 lutrije
    // 22 sekunde za 60 usera i 2 lutrije
    const globalS = {};
    const OFFSET = 20;
    const TOTAL = 3;
    const AMOUNT = 10000000000n;

    it("Deploy lottery", async () => {
        await WBTC.getContract(); // Da bi se ucitao
        globalS.bot = (await hre.ethers.getSigners())[19];
        globalS.users = (await hre.ethers.getSigners()).slice(OFFSET, OFFSET + TOTAL);
        globalS.factory = await Lottery.deployFactory();
        await Lottery.deployLotteryUsingFactory(globalS.factory, USDC.address, 31 * 86400)
        //await Lottery.deployLotteryUsingFactory(globalS.factory, WBTC.address, 31 * 86400)
    })


    it("Get Lottery", async () => {
        const lotteries = (await Contracts.execute(globalS.factory, "getLotteries", [], 0, globalS.bot)).result;
        globalS.lotteries = [];
        for (const lottery of lotteries) {
            const abiObj = await hre.artifacts.readArtifact("NoLossLottery");
            globalS.lotteries.push(new hre.ethers.Contract(lottery, abiObj.abi))
        }
        expect(globalS.lotteries[0]?.target).to.be.a('string');
    })


    it("Bulk deposit", async () => {
        for (const lottery of globalS.lotteries) {
            const tokenAddress = (await Contracts.execute(lottery, "getTokenAddress", [], 0, globalS.bot)).result;
            const tokenObject = await ERC20.getObjectByAddress(tokenAddress);
            for (const user of globalS.users) {
                // Svako stavlja po 100000000 u lutriju (100 usdc ili 1 wbtc)
                await tokenObject.buy(user, AMOUNT);
                await tokenObject.approve(user, AMOUNT, lottery.target)
                await Contracts.execute(lottery, "deposit", [AMOUNT], 0, user);
            }
        }
    })
    it("Get supplied amount", async () => {
        for (const lottery of globalS.lotteries) {
            const result = await Contracts.execute(lottery, "getSuppliedAmount", [], 0, globalS.bot);
            expect(result.result).to.equal(BigInt(TOTAL) * AMOUNT);
        }
    })
    it("Last wins", async () => {
        const last = globalS.users[TOTAL - 1];

        await hre.network.provider.send("evm_increaseTime", [30 * 86400]);
        await hre.network.provider.send("evm_mine");

        for (const lottery of globalS.lotteries) {
            for (const user of globalS.users) {
                if (user.address == last.address)
                    continue;
                await Contracts.execute(lottery, "withdraw", [AMOUNT], 0, user);
            }
        }

        await hre.network.provider.send("evm_increaseTime", [86400]);
        await hre.network.provider.send("evm_mine");

        for (const lottery of globalS.lotteries) {
            const oldBalance = await getBalance(globalS.bot)
            await Contracts.execute(lottery, "drawWinner", [], 0, globalS.bot);
            await Contracts.execute(lottery, "fulfillRandomness23", [Math.floor(Math.random() * 300000000000)], 0, globalS.bot)
            await hre.network.provider.send("evm_mine");
            const newBalance = await getBalance(globalS.bot)
            expect(newBalance).to.greaterThanOrEqual(oldBalance);
        }

        for (const lottery of globalS.lotteries) {
            const result = await Contracts.execute(lottery, "getWinner", [], 0, globalS.bot);
            expect(result.result).to.equal(last.address);
            await Contracts.execute(lottery, "win", [], 0, last)
            await hre.network.provider.send("evm_mine");
        }

        for (const lottery of globalS.lotteries) {
            const result = await Contracts.execute(lottery, "getBalance", [last.address], 0, last);
            await Contracts.execute(lottery, "withdraw", [result.result], 0, last);
            const tokenAddress = (await Contracts.execute(lottery, "getTokenAddress", [], 0, last)).result;
            const tokenObject = await ERC20.getObjectByAddress(tokenAddress);
            expect(await tokenObject.getBalance(last)).to.greaterThan(AMOUNT);
        }
    })
})