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
  const privateKey = "0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e";
  const wallet = new hre.ethers.Wallet(privateKey, provider);

  console.log("Deploying contract with the account:", wallet.address);

  await Uniswap.buyExactUSDCForEth(wallet, 200000000000)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
