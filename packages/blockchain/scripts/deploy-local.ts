import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🚀 Starting local blockchain deployment...");
  
  // Get the contract factory
  const TournamentScoring = await ethers.getContractFactory("TournamentScoring");
  
  // Get deployment account
  const [deployer] = await ethers.getSigners();
  console.log("📋 Deploying with account:", deployer.address);
  
  // Get account balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
  
  // Deploy the contract
  console.log("🔧 Deploying TournamentScoring contract...");
  const tournament = await TournamentScoring.deploy();
  await tournament.waitForDeployment();
  
  const contractAddress = await tournament.getAddress();
  console.log("✅ TournamentScoring deployed to:", contractAddress);
  
  // Test basic functionality
  console.log("\n🧪 Testing basic contract functionality...");
  
  // Test 1: Create a tournament
  console.log("Test 1: Creating a tournament...");
  const tx1 = await tournament.createTournament(
    "Test Tournament",
    "A test tournament for development",
    8
  );
  await tx1.wait();
  
  const tournamentData = await tournament.getTournament(1);
  console.log("✅ Tournament created:", tournamentData.name);
  
  // Test 2: Add participants
  console.log("Test 2: Adding participants...");
  const tx2 = await tournament.addParticipant(1, "user1", "Alice", "HUMAN");
  await tx2.wait();
  
  const tx3 = await tournament.addParticipant(1, "user2", "Bob", "HUMAN");
  await tx3.wait();
  
  const tx4 = await tournament.addParticipant(1, "ai1", "AI Player", "AI");
  await tx4.wait();
  
  const tx5 = await tournament.addParticipant(1, "user3", "Charlie", "HUMAN");
  await tx5.wait();
  
  const tournamentData2 = await tournament.getTournament(1);
  console.log("✅ Participants added:", tournamentData2.currentParticipants.toString());
  
  // Test 3: Start tournament
  console.log("Test 3: Starting tournament...");
  const tx6 = await tournament.startTournament(1);
  await tx6.wait();
  
  const updatedTournament = await tournament.getTournament(1);
  console.log("✅ Tournament started, status:", updatedTournament.status);
  
  // Test 4: Record a match result
  console.log("Test 4: Recording match result...");
  const resultHash = ethers.keccak256(ethers.toUtf8Bytes("user1-user2-user1-11-9"));
  const tx7 = await tournament.recordMatchResult(
    1, // tournamentId
    1, // round
    "user1", // player1Id
    "user2", // player2Id
    "user1", // winnerId
    11, // player1Score
    9, // player2Score
    resultHash // resultHash
  );
  await tx7.wait();
  
  const tournamentData3 = await tournament.getTournament(1);
  console.log("✅ Match recorded, tournament status:", tournamentData3.status);
  
  // Save contract address to environment file
  const envPath = path.join(__dirname, "..", ".env.development");
  let envContent = fs.readFileSync(envPath, "utf8");
  
  // Update the contract address in the env file
  envContent = envContent.replace(
    /TOURNAMENT_SCORING_CONTRACT_ADDRESS=.*/,
    `TOURNAMENT_SCORING_CONTRACT_ADDRESS=${contractAddress}`
  );
  
  fs.writeFileSync(envPath, envContent);
  console.log("📝 Contract address saved to .env.development");
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress,
    deployerAddress: deployer.address,
    deploymentTime: new Date().toISOString(),
    network: "hardhat",
    chainId: 31337,
    gasUsed: tx1.gasLimit?.toString() || "unknown",
    testResults: {
      tournamentCreated: true,
      participantsAdded: true,
      tournamentStarted: true,
      matchRecorded: true
    }
  };
  
  const deploymentPath = path.join(__dirname, "..", "deployments", "local.json");
  fs.mkdirSync(path.dirname(deploymentPath), { recursive: true });
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n🎉 Local deployment completed successfully!");
  console.log("📊 Deployment summary:");
  console.log("   - Contract Address:", contractAddress);
  console.log("   - Network: Hardhat (Local)");
  console.log("   - Chain ID: 31337");
  console.log("   - All tests passed ✅");
  console.log("\n🚀 You can now start the blockchain service with:");
  console.log("   npm run dev");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
