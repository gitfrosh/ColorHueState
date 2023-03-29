require("@nomiclabs/hardhat-ethers");
const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  solidity: '0.8.12',
  networks: {
    goerli: {
      url: process.env.ALCHEMY_API_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  // etherscan: {
  //   // Your API key for Etherscan
  //   // Obtain one at https://etherscan.io/
  //   apiKey: process.env.ETHERSCAN_API_KEY,
  // }
}