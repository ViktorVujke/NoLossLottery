const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NoLossLottery", function () {
  let NoLossLottery, noLossLottery, owner, addr1, addr2;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    NoLossLottery = await ethers.getContractFactory("NoLossLottery");
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy a new contract for each test
// Deploy a new contract for each test, including the initial owner address
noLossLottery = await NoLossLottery.deploy(
  "TOKEN_CONTRACT_ADDRESS",
  Math.floor(Date.now() / 1000) + 300,
  100,
  owner.address // Pass the test's deploying account as the initial owner
);
  await noLossLottery.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await noLossLottery.owner()).to.equal(owner.address);
    });

    it("Should accept deposits and emit Deposited event", async function () {
      // This part requires you to have the ERC20 token contract deployed and the test account to have enough tokens
      // For simplicity, this example assumes the token contract allows you to mint or allocate tokens for testing
      // You might need to add logic to mint tokens to the addr1 before this step
      await expect(noLossLottery.connect(addr1).deposit(100)).to.emit(noLossLottery, "Deposited").withArgs(addr1.address, 100);
    });
  });

  describe("Selecting Winner", function () {
    it("Owner can set random number and select a winner", async function () {
      // Assuming deposits have been made, which is not covered here due to token transfer complexities
      await noLossLottery.setRandomNumber(1); // Set the random number
      await expect(noLossLottery.selectWinner()).to.emit(noLossLottery, "WinnerSelected");
      // Additional checks can be made here based on the logic for distributing the yield
    });
  });

  // Add more tests as needed for withdraw and other functionalities
});
