require("@nomiclabs/hardhat-waffle");
require('dotenv').config()

require('./tasks/index')

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});


const ALCHEMY_KOVAN_API_KEY = process.env.ALCHEMY_KOVAN_API_KEY;
const ALCHEMY_RINKEBY_API_KEY = process.env.ALCHEMY_RINKEBY_API_KEY;
const ALCHEMY_ROPSTEN_API_KEY = process.env.ALCHEMY_ROPSTEN_API_KEY;
const ACCOUNT_MNEMONICS = process.env.ACCOUNT_MNEMONICS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  networks: {
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${ALCHEMY_RINKEBY_API_KEY}`,
      accounts: {
        mnemonic: `${ACCOUNT_MNEMONICS}`
      }
    },
    kovan: {
      url: `https://eth-kovan.alchemyapi.io/v2/${ALCHEMY_KOVAN_API_KEY}`,
      accounts: {
        mnemonic: `${ACCOUNT_MNEMONICS}`
      }
    },
    ropsten: {
      url: `https://eth-ropsten.alchemyapi.io/v2/${ALCHEMY_ROPSTEN_API_KEY}`,
      accounts: {
        mnemonic: `${ACCOUNT_MNEMONICS}`
      }
    }
  },

};
