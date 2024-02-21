import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Input, FormGroup, Label } from 'reactstrap';
import LotteryABI from '../../../contracts/LotteryABI.js'; // Ensure this is correctly imported
import ERC20ABI from '../../../contracts/ERC20ABI.js'; // Ensure this is correctly imported

const JoinLotteryForm = ({ lottery }) => {
  const [amount, setAmount] = useState('');

  const handleChange = (e) => {
    setAmount(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!window.ethereum) {
      alert("Please install MetaMask to continue.");
      return;
    }

    try {
      // Correctly initialize ethers provider with MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum);
      // Request account access
      await provider.send("eth_requestAccounts", []);
      // Get the signer to sign transactions
      const signer = await provider.getSigner();

      // Initialize the token contract with the signer
      const tokenContract = new ethers.Contract(lottery.token, ERC20ABI, signer);

      // Fetch the token's decimals
      const decimals = await tokenContract.decimals();
      // Format the amount using the token's decimals
      const formattedAmount = ethers.parseUnits(amount, decimals);
        alert(formattedAmount)
      // Approve the lottery contract to spend the tokens
      const approvalTx = await tokenContract.approve(lottery.address, formattedAmount);
      await approvalTx.wait();

      // After approval, deposit the tokens into the lottery contract
      const lotteryContract = new ethers.Contract(lottery.address, LotteryABI, signer);
      const depositTx = await lotteryContract.deposit(formattedAmount);
      await depositTx.wait();

      console.log('Tokens deposited successfully:', depositTx);
    } catch (error) {
      console.error('Error during token deposit:', error);
      alert("There was an error joining the lottery.");
    }
  };


  return (
    <form onSubmit={handleSubmit}>
      {/* Form content remains unchanged */}
      <FormGroup className="user-box">
        <label style={{color:'gray'}}>{lottery.address}</label>
      </FormGroup>
      <FormGroup className="user-box">
        <Input type="text" name="lotteryToken" id="lotteryToken" value={lottery.token} readOnly bsSize="lg" style={{ backgroundColor: '#333', color: '#fff', fontSize:15 }} />
        <Label for="lotteryToken" style={{color:'white'}}>Lottery Token</Label>
      </FormGroup>
      <FormGroup className="user-box">
        <Input type="text" name="minEntryAmount" id="minEntryAmount" value={0.1} readOnly bsSize="lg" style={{ backgroundColor: '#333', color: '#fff', fontSize:15 }} />
        <Label for="minEntryAmount" style={{color:'white'}}>Min Entry Amount</Label>
      </FormGroup>
      <FormGroup className="user-box">
        <Input required type="number" step="0.1" name="amount" id="amount" value={amount} onChange={handleChange} bsSize="lg" />
        <Label for="amount" style={{color:'white'}}>Amount to Bet</Label>
      </FormGroup>
      <center>
        <button className="animated-button">
          <span>Join Lottery</span>
          <span></span>
        </button>
      </center>
    </form>
  );
};

export default JoinLotteryForm;
