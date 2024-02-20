const hre = require("hardhat");
const DAYS = 31;
const main = async () => {
    await hre.network.provider.send("evm_increaseTime", [86400 * DAYS]);
    await hre.network.provider.send("evm_mine");
}
main();