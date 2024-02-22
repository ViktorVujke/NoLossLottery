const hre = require("hardhat");
const { Uniswap } = require("../src/contracts/Uniswap");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function delayedGreeting() {
  await sleep(20000);
  console.log("hello");
}

async function main() {
  const provider = new hre.ethers.JsonRpcProvider();
  // Use the private key to create a wallet signer
  const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const wallet = new hre.ethers.Wallet(privateKey, provider);

  console.log("Deploying contract with the account:", wallet.address);

  await Uniswap.buyExactUSDCForEth(wallet, 2000000000000)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
