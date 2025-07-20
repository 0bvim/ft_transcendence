import { ethers } from "ethers";
import fs from "fs";
import path from "path";

async function checkBalance() {
  try {
    // Read wallet info
    const walletPath = path.join(__dirname, "../.wallet-info.json");
    if (!fs.existsSync(walletPath)) {
      console.log("❌ Wallet not found. Run 'npm run generate-wallet' first.");
      return;
    }

    const walletInfo = JSON.parse(fs.readFileSync(walletPath, "utf8"));
    const provider = new ethers.JsonRpcProvider("https://api.avax-test.network/ext/bc/C/rpc");

    console.log("🔍 Checking wallet balance...\n");
    console.log("📋 Wallet Details:");
    console.log(`🏠 Address: ${walletInfo.address}`);
    
    // Get balance
    const balance = await provider.getBalance(walletInfo.address);
    const balanceInAvax = ethers.formatEther(balance);
    
    console.log(`💰 Balance: ${balanceInAvax} AVAX`);
    
    // Get network info
    const network = await provider.getNetwork();
    console.log(`🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);
    
    if (parseFloat(balanceInAvax) === 0) {
      console.log("\n💡 Your wallet is empty! Get testnet AVAX from:");
      console.log("🌐 https://faucet.avax.network/");
      console.log(`📋 Address: ${walletInfo.address}`);
    } else {
      console.log("\n✅ Wallet has funds! Ready for blockchain transactions.");
      
      if (parseFloat(balanceInAvax) >= 1.0) {
        console.log("🚀 You can now deploy smart contracts!");
      }
    }
    
  } catch (error) {
    console.error("❌ Error checking balance:", error instanceof Error ? error.message : error);
  }
}

// Run if called directly
if (require.main === module) {
  checkBalance();
}

export { checkBalance }; 