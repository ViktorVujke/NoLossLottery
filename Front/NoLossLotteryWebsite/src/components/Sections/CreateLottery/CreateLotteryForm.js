import React, { useState } from 'react';
import '../SectionComponents/FormStyle.css'
const CreateLotteryForm = () => {
  const [lottery, setLottery] = useState({
    token: '',
    duration: '',
    minAmount: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLottery((prevLottery) => ({
      ...prevLottery,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(lottery);
    // Add logic to handle form submission, e.g., sending data to a backend
  };

  return (
    <div className="login-box">
      <p>Create Lottery</p>
      <form onSubmit={handleSubmit}>
        <div style={{width:'100%',justifyContent:'space-around', alignItems:'center'}}>
          <select required name="token" value={lottery.token} onChange={handleChange} style={{marginBottom:20, marginRight:10}}>
            <option value="">Choose Lottery Token</option>
            <option value="BTC">BTC</option>
            <option value="ETH">ETH</option>
            <option value="LINK">LINK</option>
            <option value="AAVE">AAVE</option>
            {/* Add more cryptocurrency options as needed */}
          </select>
          <label>Lottery Token</label>
        </div>
        <div className="user-box">
          <input
            required
            name="duration"
            type="number"
            min="1"
            value={lottery.duration}
            onChange={handleChange}
          />
          <label>Duration (Days)</label>
        </div>
        <div className="user-box">
          <input
            required
            name="minAmount"
            type="number"
            min="0.01"
            step="0.01"
            value={lottery.minAmount}
            onChange={handleChange}
          />
          <label>Minimum Entering Amount</label>
        </div>
        <button type="submit" className="submit-btn">Submit</button>
      </form>
      <p>Don't have an account? <a href="" className="a2">Sign up!</a></p>
    </div>
  );
};

export default CreateLotteryForm;
