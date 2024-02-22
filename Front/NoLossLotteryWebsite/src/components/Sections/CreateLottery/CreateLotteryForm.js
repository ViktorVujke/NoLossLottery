import React, { useState } from 'react';
import { Input, FormGroup, Label } from 'reactstrap';
import LotteryFactoryABI from '../../../contracts/LotteryFactoryABI.js'; // Update the path as necessary
import ERC20ABI from '../../../contracts/ERC20ABI.js'
import '../SectionComponents/FormStyle.css';
import { ethers } from 'ethers';

const CreateLotteryForm = () => {
  const [lottery, setLottery] = useState({
    token: '',
    duration: '',
    minDeposit: '', // Added minDeposit to the state
    depositTimeLimit: '' // Optionally, add depositTimeLimit if you want it to be user-configurable
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLottery(prevLottery => ({
      ...prevLottery,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(lottery);

    if (window.ethereum == null) {
      console.log("MetaMask not installed; using read-only defaults");
      provider = await ethers.getDefaultProvider();
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();

    const contractAddress = '0xb6057e08a11da09a998985874fe2119e98db3d5d';
    const lotteryFactory = new ethers.Contract(contractAddress, LotteryFactoryABI, signer);
    const tokenContract = new ethers.Contract(lottery.token, ERC20ABI, provider);

    // Fetch the token's decimals
    const decimals = await tokenContract.decimals();
    alert( ethers.parseUnits(lottery.minDeposit, decimals))
    if(lottery.duration<lottery.depositTimeLimit)
    {
      alert("Deposit time limit can't be smaller than the duration of the lottery")
      return;
    }
    try {
      // Convert duration from days to seconds if needed by your contract
      const tx = await lotteryFactory.createLottery(
        lottery.token,
        ethers.parseUnits(lottery.minDeposit, decimals), // Assuming the minDeposit is entered in ETH and needs to be converted to Wei
        lottery.duration,
        lottery.depositTimeLimit || lottery.duration // Use depositTimeLimit if set; otherwise, fall back to duration
      );
      await tx.wait();
      console.log('Lottery created successfully');
    } catch (error) {
      console.error('Error creating lottery:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Token Select Input */}
      <FormGroup className="user-box">
        <Input type="select" name="token" id="token" value={lottery.token} onChange={handleChange} required bsSize="lg" style={{ backgroundColor: '#333', color: '#fff', fontSize: 15 }}>
          <option value="">Select a token</option>
          <option value="0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48">USDC</option>
          <option value="0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599">WBTC</option>
          <option value="0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2">WETH</option>
          <option value="0x514910771AF9Ca656af840dff83E8264EcF986CA">LINK</option>
          <option value="0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9">AAVE</option>
          {/* Add more cryptocurrency options as needed */}
        </Input>
        <Label for="token" style={{ color: 'white' }}>Choose Lottery Token</Label>
      </FormGroup>
      {/* Duration Input */}
      <FormGroup className="user-box">
        <Input required type="number" name="duration" id="duration" value={lottery.duration} onChange={handleChange} bsSize="lg" />
        <Label for="duration" style={{ color: 'white' }}>Duration (Days)</Label>
      </FormGroup>

      {/* Minimum Deposit Input */}
      <FormGroup className="user-box">
        <Input required type="text" name="minDeposit" id="minDeposit" value={lottery.minDeposit} onChange={handleChange} bsSize="lg" />
        <Label for="minDeposit" style={{ color: 'white' }}>Minimum Deposit (in chosen coin)</Label>
      </FormGroup>
      <FormGroup className="user-box">
        <Input required type="number" name="depositTimeLimit" id="depositTimeLimit" value={lottery.depositTimeLimit} onChange={handleChange} bsSize="lg" />
        <Label for="depositTimeLimit" style={{ color: 'white' }}>For how long can users deposit funds (Days)</Label>
      </FormGroup>

      {/* Optionally, Deposit Time Limit Input */}
      {/* Add this section if you want depositTimeLimit to be user-configurable */}

      <center>
        <button className="animated-button">
          <span>Create Lottery</span>
          <span></span>
        </button>
      </center>
    </form>
  );
};

export default CreateLotteryForm;

