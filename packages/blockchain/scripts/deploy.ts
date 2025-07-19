import { ethers } from "hardhat";
import { TournamentScoring } from "../typechain-types";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy TournamentScoring contract
  console.log("\n🚀 Deploying TournamentScoring contract...");
  
  const TournamentScoring = await ethers.getContractFactory("TournamentScoring");
  const tournamentScoring = await TournamentScoring.deploy();
  
  await tournamentScoring.waitForDeployment();
  
  const contractAddress = await tournamentScoring.getAddress();
  console.log("✅ TournamentScoring deployed to:", contractAddress);
  
  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  const tournamentCount = await tournamentScoring.getTournamentCount();
  console.log("Initial tournament count:", tournamentCount.toString());
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress,
    deployer: deployer.address,
    network: await deployer.provider.getNetwork(),
    timestamp: new Date().toISOString(),
    gasUsed: "N/A", // Will be populated in actual deployment
  };
  
  console.log("\n📋 Deployment Summary:");
  console.log("Contract Address:", contractAddress);
  console.log("Deployer:", deployer.address);
  console.log("Network:", deploymentInfo.network.name);
  console.log("Chain ID:", deploymentInfo.network.chainId);
  console.log("Timestamp:", deploymentInfo.timestamp);
  
  // Test basic functionality
  console.log("\n🧪 Testing basic functionality...");
  
  try {
    // Create a test tournament
    const tx = await tournamentScoring.createTournament(
      "Test Tournament",
      "A test tournament for deployment verification",
      4
    );
    
    const receipt = await tx.wait();
    console.log("✅ Test tournament created successfully");
    console.log("Transaction hash:", receipt?.hash);
    
    // Verify tournament creation
    const newTournamentCount = await tournamentScoring.getTournamentCount();
    console.log("New tournament count:", newTournamentCount.toString());
    
    // Get tournament details
    const tournament = await tournamentScoring.getTournament(1);
    console.log("Test tournament details:", {
      id: tournament.id.toString(),
      name: tournament.name,
      creator: tournament.creator,
      status: tournament.status,
    });
    
  } catch (error) {
    console.error("❌ Error testing functionality:", error);
  }
  
  console.log("\n🎉 Deployment completed successfully!");
  console.log("Remember to:");
  console.log("1. Save the contract address:", contractAddress);
  console.log("2. Update your environment variables");
  console.log("3. Verify the contract on the block explorer");
  
  return {
    contractAddress,
    contract: tournamentScoring,
  };
}

// Execute deployment
main()
  .then(({ contractAddress }) => {
    console.log(`\n✅ Contract deployed successfully to: ${contractAddress}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
