# Next Token

This is a DeFi project repository for NEXT, the project include smart contract for the Tokens and the vesting protocols, wrapped around with the hardhat framework. The repository contains the well defined tests and the deployment scripts.
[Here](https://hardhat.org/) is a link to read more about the HardHat framework.

## Installation

Use the node package manager to install the dependencies once cloned.

```bash
npm install
```

# Basic Configuration required

The basic configuration required for the project can be done in `.env` file, the file should be created and the format for the file should be similar to the `env.sample` file, which will contains the below parameters before running the scripts.

```bash
ALCHEMY_KOVAN_API_KEY=KOVAN_API_KEY
ALCHEMY_API_KEY=API_KEY
ALCHEMY_RINKEBY_API_KEY=RINKEBY_API_KEY
ALCHEMY_ROPSTEN_API_KEY=ALCHEMY_ROPSTEN_API_KEY
PRIVATE_KEY=WALLET_PRIVATE_KEY
ACCOUNT_MNEMONICS="Your account Mnemonics"
```

other prerequisites are the test network tokens, which can be easily available [here](https://faucets.chain.link/) for ethereum and [here](https://testnet.binance.org/faucet-smart) for BNB testnet tokens.
The Binance smart chain testnet endpoint should be added to the metamsak as custom RPC endpoint as `https://data-seed-prebsc-1-s1.binance.org:8545/`.

# Basic Hardhat Commands

Listed below are basic hardhat out-of-box commands.

Try running some of the following tasks:

```shell
npx hardhat node
npx hardhat accounts
npx hardhat accounts --network kovan
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat run ./scripts/1_deploy_TokenEth.js
npx hardhat help
```

## Usage

---

**NOTE**

Before deploying the Distribution make sure to add the token address and the right contract name in the `3_deploy_Distribution.js` and `4_test_distribution.js` scripts.

---

```bash
# Test the smart contract are able to compile
npx hardhat compile

# Test the smart contracts
npx hardhat test

# Deploy the smart contracts on the local testnet
npx hardhat run ./scripts/1_deploy_TokenEth.js
npx hardhat run ./scripts/2_deploy_TokenBsc.js
npx hardhat run ./scripts/3_deploy_Distribution.js

# Initiate the Distribution in local network
npx hardhat run ./scripts/4_test_distribution.js

# Deploy the smart contracts on the testnet
npx hardhat run ./scripts/1_deploy_TokenEth.js --network <network-name>
npx hardhat run ./scripts/2_deploy_TokenBsc.js --network <network-name>
npx hardhat run ./scripts/3_deploy_Distribution.js --network <network-name>

# Initiate the Distribution in network
npx hardhat run ./scripts/4_test_distribution.js --network <network-name>

```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
