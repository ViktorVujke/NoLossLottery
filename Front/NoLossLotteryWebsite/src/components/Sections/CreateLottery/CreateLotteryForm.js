import React, { useState } from 'react';
import { Input, FormGroup, Label } from 'reactstrap';
import LotteryFactoryABI from '../../../contracts/LotteryFactoryABI.js'; // Update the path as necessary
import '../SectionComponents/FormStyle.css';
import { ethers } from 'ethers';

const CreateLotteryForm = () => {
  const [lottery, setLottery] = useState({
    token: '',
    duration: ''
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

    // Setup ethers provider with BrowserProvider for ethers v6
    // Note: This example uses window.ethereum (MetaMask)
    // Ensure MetaMask is installed and connected to the correct network
    if (window.ethereum == null) {

      // If MetaMask is not installed, we use the default provider,
      // which is backed by a variety of third-party services (such
      // as INFURA). They do not have private keys installed,
      // so they only have read-only access
      console.log("MetaMask not installed; using read-only defaults")
      provider = ethers.getDefaultProvider()
  
  } 
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []); // Request account access
    const signer = await provider.getSigner();

    // Replace 'your_contract_address_here' with your actual contract address
    const contractAddress = '0xb6057e08a11da09a998985874fe2119e98db3d5d';
    const lotteryFactory = new ethers.Contract(contractAddress, LotteryFactoryABI, signer);

    try {
        // Assuming the token field contains the address of the token contract
        // and duration is entered in days (convert to seconds for the contract call)
        const durationInSeconds = lottery.duration * 24 * 60 * 60;
        console.log(lotteryFactory)
        const tx = await lotteryFactory.createLottery(lottery.token, durationInSeconds);
        await tx.wait();
        console.log('Lottery created successfully');
        // Optionally, clear form or provide user feedback
    } catch (error) {
      console.error('Error creating lottery:', error);
      console.log(error); // For complete error details
  }
};


  return (
    <form onSubmit={handleSubmit}>
      <FormGroup className="user-box">
        <Input type="select" name="token" id="token" value={lottery.token} onChange={handleChange} required bsSize="lg" style={{ backgroundColor: '#333', color: '#fff', fontSize:15 }}>
          <option value="">Select a token</option>
          <option value="0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48">USDC</option>
          <option value="0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599">WBTC</option>
          <option value="0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2">WETH</option>
          <option value="0x514910771AF9Ca656af840dff83E8264EcF986CA">LINK</option>
          <option value="0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9">AAVE</option>
          {/* Add more cryptocurrency options as needed */}
        </Input>
        <Label for="token" style={{color:'white'}}>Choose Lottery Token</Label>
      </FormGroup>
      <FormGroup className="user-box">
        <Input required type="number" name="duration" id="duration" value={lottery.duration} onChange={handleChange} bsSize="lg" />
        <Label for="duration" style={{color:'white'}}>Duration (Days)</Label>
      </FormGroup>
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
