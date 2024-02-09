const hre = require("hardhat");
const getDebt = (debt) => Number(debt) / Number(BigInt(1e18));
async function main() {
    const CDPView = await hre.ethers.getContractFactory("Test");
    const cdpView = await CDPView.deploy();
    await cdpView.waitForDeployment();

    try {
        console.log("Function result:", await cdpView.saberi3(-5, 200, 3));
    } catch (error) {
        console.error("Error fetching CDP Info:", error);
    }
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });