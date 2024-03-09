import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
require("dotenv").config();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 10,
          },
        },
      },
    ],
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v6",
  },

  networks: {
    "pacific-testnet": {
      chainId: 3441005,
      url: process.env.MANTA_PACIFIC_TESTNET_RPC as string,
      accounts: [
        process.env.DEPLOYER_KEY_TEST as string,
        process.env.USER_1_KEY as string,
        process.env.USER_2_KEY as string,
      ],
      gas: parseInt(process.env.GASLIMIT as string),
    },
    "pacific-mainnet": {
      chainId: 169,
      url: process.env.MANTA_PACIFIC_MAINNET_RPC as string,
      accounts: [
        process.env.DEPLOYER_KEY_MAIN as string,
        process.env.USER_1_KEY as string,
        process.env.USER_2_KEY as string,
      ],
      gas: parseInt(process.env.GASLIMIT as string),
    },
    "pacific-mainnet-socialscan": {
      chainId: 169,
      url: process.env.MANTA_PACIFIC_MAINNET_RPC as string,
    },
    goerli: {
      chainId: 5,
      url: process.env.GOERLI_RPC as string,
      accounts: [
        process.env.DEPLOYER_KEY_TEST as string,
        process.env.USER_1_KEY as string,
        process.env.USER_2_KEY as string,
      ],
      gas: parseInt(process.env.GASLIMIT as string),
    },
  },
  etherscan: {
    apiKey: {
      "pacific-testnet": "abc",
      "pacific-mainnet": "abc",
      "pacific-mainnet-socialscan": "abc",
      goerli: process.env.ETHERSCAN_API_KEY as string,
    },
    customChains: [
      {
        network: "pacific-testnet",
        chainId: 3441005,
        urls: {
          apiURL: "https://manta-testnet.calderaexplorer.xyz/api",
          browserURL: "https://manta-testnet.calderaexplorer.xyz/",
        },
      },
      {
        network: "pacific-mainnet",
        chainId: 169,
        urls: {
          apiURL: "https://manta-pacific.calderaexplorer.xyz/api",
          browserURL: "https://manta-pacific.calderaexplorer.xyz/",
        },
      },
      {
        network: "pacific-mainnet-socialscan",
        chainId: 169,
        urls: {
          apiURL: "https://manta.socialscan.io/api",
          browserURL: "https://manta.socialscan.io/",
        },
      },
      {
        network: "goerli",
        chainId: 5,
        urls: {
          apiURL: "http://api-goerli.etherscan.io/api",
          browserURL: "https://goerli.etherscan.io/",
        },
      },
    ],
  },
};

export default config;
