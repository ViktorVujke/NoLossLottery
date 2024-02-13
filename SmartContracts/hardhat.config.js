require("@nomicfoundation/hardhat-toolbox");
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    hardhat: {
      forking: {
        url: "https://eth-mainnet.g.alchemy.com/v2/KwqrdbT8DUbOjW62kYjyTSceXzjMj2eG",
        blockNumber: 19211681
      }/*,
      accounts: [{
        privateKey: '0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e',
        balance: '10000000000000000000000' // 10000 ETH in Wei
      }]*/
    }
  },
  solidity: "0.8.20"
};