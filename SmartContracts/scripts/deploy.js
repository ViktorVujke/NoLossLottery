const hre = require("hardhat");

async function main() {
  const provider = new hre.ethers.JsonRpcProvider();
  // Use the private key to create a wallet signer
  const privateKey = "0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e";
  const wallet = new hre.ethers.Wallet(privateKey, provider);

  console.log("Deploying contract with the account:", wallet.address);

  const SimpleDeposit = await hre.ethers.getContractFactory("SimpleDeposit");
  // Pass the wallet instance instead of its address
  const simpleDeposit = await SimpleDeposit.deploy(wallet);

  await simpleDeposit.waitForDeployment();

  console.log("SimpleDeposit contract deployed to:", simpleDeposit.target);

  // Specify a minimum amount of USDC you'd accept for your ETH
  const amountOutMin = hre.ethers.parseUnits("1000", 6); // Example: 10 USDC
  // Use a deadline of 20 minutes from now
  const deadline = Math.floor(Date.now() / 1000) + (20 * 60); // 20 minutes from the current Unix time

  // Send 1 ETH to the contract for USDC
  const ethToSend = hre.ethers.parseEther("10");

  // Connect the contract to the wallet that will execute the transaction
  const connectedContract = simpleDeposit.connect(wallet);

  // Call depositETHForUSDC with the specified parameters and attached ETH value
  const tx = await connectedContract.depositETHForUSDC(amountOutMin, deadline, { value: ethToSend });
  await tx.wait();
  const IERC20ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function balanceOf(address account) external view returns (uint256)", // Add balanceOf function
    // Add other ERC20 functions here as needed
  ];

  // The address of the USDC token on your network (ensure it's correct for localhost or testnet)
  const usdcAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const usdcToken = new hre.ethers.Contract(usdcAddress, IERC20ABI, wallet);
  console.log(simpleDeposit.target)
  const depositAmount = await usdcToken.balanceOf(wallet.address);

  // Approve the SimpleDeposit contract to spend 100 USDC on your behalf
  await usdcToken.approve(simpleDeposit.target, depositAmount);
  
  // Now you can deposit USDC into the SimpleDeposit contract
  const depositTx = await connectedContract.topUpUSDC(1,{value:"100000000000000000000"});
  await depositTx.wait();
  // After the swap, check the USDC balance of the deployer in the contract
  const userBalance = await connectedContract.getBalance(wallet.address);
  console.log("User USDC Balance:", userBalance.toString());

  const wit = await connectedContract.withdraw()
  console.log(wit)
  console.log("Deposit function tested successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
