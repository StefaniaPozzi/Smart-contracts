require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("hardhat-gas-reporter");
require("dotenv").config();
require("solc");

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;
const MUMBAI_RPC_URL = process.env.MUMBAI_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;
const ETHSCAN_API_KEY = process.env.ETHSCAN_API_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.8",
  solidity: {
    compilers: [
      {
        version: "0.8.8",
      },
      { version: "0.6.0" },
    ],
  },
  namedAccounts: {
    deployer: {
      default: 0,
      31337: 1,
    },
  },
  networks: {
    goerli: {
      url: GOERLI_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 5,
      blockConfirmations: 6,
    },
    mumbai: {
      url: MUMBAI_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 80001,
    },
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    currency: "EUR",
    coinmarketcap: COINMARKETCAP_API_KEY,
    token: "MATIC",
  },
  etherscan: {
    apiKey: ETHSCAN_API_KEY,
  },
};
