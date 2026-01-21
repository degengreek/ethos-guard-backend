import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();
  
  if (!deployer) {
    console.error("❌ Error: No deployer account found!");
    console.error("Please ensure FAUCET_PRIVATE_KEY is set in your .env.local file.");
    process.exit(1);
  }

  console.log("Deploying contracts with the account:", deployer.address);

  const MockNFT = await ethers.getContractFactory("MockNFT");
  const mockNFT = await MockNFT.deploy();

  await mockNFT.waitForDeployment();

  console.log("MockNFT deployed to:", await mockNFT.getAddress());
  
  console.log("\nIMPORTANT: Update your .env.local with this address:");
  console.log(`MOCK_NFT_CONTRACT_ADDRESS=${await mockNFT.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
