require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: "./.env.local" });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    baseSepolia: {
      url: process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.base.org",
      accounts: process.env.FAUCET_PRIVATE_KEY ? [process.env.FAUCET_PRIVATE_KEY] : [],
      chainId: 84532,
    },
  },
};