import { ethers } from "ethers";
import fs from "fs";
import path from "path";

async function generateWallet() {
  console.log("🔑 Generating new wallet for Avalanche blockchain...\n");

  // Generate a random wallet
  const wallet = ethers.Wallet.createRandom();

  console.log("✅ Wallet generated successfully!\n");
  console.log("📋 Wallet Details:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`🔐 Private Key: ${wallet.privateKey}`);
  console.log(`🏠 Address:     ${wallet.address}`);
  console.log(`💬 Mnemonic:    ${wallet.mnemonic?.phrase}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Save wallet info to a secure file
  const walletInfo = {
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic?.phrase,
    createdAt: new Date().toISOString(),
    network: "Avalanche Fuji Testnet",
    chainId: 43113
  };

  const walletPath = path.join(__dirname, "../.wallet-info.json");
  fs.writeFileSync(walletPath, JSON.stringify(walletInfo, null, 2));
  console.log(`💾 Wallet info saved to: ${walletPath}`);
  console.log("⚠️  KEEP THIS FILE SECURE - It contains your private key!\n");

  // Create/update .env file
  const envPath = path.join(__dirname, "../.env");
  let envContent = "";

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8");
  }

  // Remove existing PRIVATE_KEY if present
  envContent = envContent.replace(/^PRIVATE_KEY=.*$/m, "");
  
  // Add the new private key
  if (!envContent.endsWith("\n") && envContent.length > 0) {
    envContent += "\n";
  }
  envContent += `PRIVATE_KEY=${wallet.privateKey}\n`;

  fs.writeFileSync(envPath, envContent);
  console.log(`✅ Updated .env file with new private key\n`);

  // Instructions
  console.log("🚀 Next Steps:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("1. 💰 Get testnet AVAX from the faucet:");
  console.log(`   https://faucet.avax.network/`);
  console.log(`   Address: ${wallet.address}`);
  console.log("");
  console.log("2. ⏰ Wait 2-3 minutes for the transaction to confirm");
  console.log("");
  console.log("3. 🚀 Deploy your smart contract:");
  console.log("   npm run deploy:fuji");
  console.log("");
  console.log("4. 🔄 Update your main .env file with the contract address");
  console.log("");
  console.log("5. 🎮 Start your blockchain service:");
  console.log("   make up");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Check if we can connect to Avalanche testnet
  try {
    console.log("🔍 Testing connection to Avalanche Fuji testnet...");
    const provider = new ethers.JsonRpcProvider("https://api.avax-test.network/ext/bc/C/rpc");
    const network = await provider.getNetwork();
    console.log(`✅ Connected to ${network.name} (Chain ID: ${network.chainId})`);

    // Check current balance (will be 0 initially)
    const balance = await provider.getBalance(wallet.address);
    console.log(`💰 Current balance: ${ethers.formatEther(balance)} AVAX`);

    if (balance === 0n) {
      console.log("💡 Visit the faucet to get testnet AVAX tokens!");
    }
  } catch (error) {
    console.log("⚠️  Could not connect to Avalanche testnet (this is OK for now)");
  }

  console.log("\n🎉 Wallet generation complete! Keep your private key safe! 🔐");
}

// Run if called directly
if (require.main === module) {
  generateWallet().catch((error) => {
    console.error("❌ Error generating wallet:", error);
    process.exit(1);
  });
}

export { generateWallet }; 