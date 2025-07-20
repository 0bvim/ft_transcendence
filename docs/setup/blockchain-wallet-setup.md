# 🔑 Blockchain Wallet Setup Guide

This guide will help you generate a wallet, get testnet tokens, and deploy smart contracts for the ft_transcendence blockchain service.

## 🚀 Quick Start

### 1. Generate a New Wallet

```bash
cd packages/blockchain
npm run generate-wallet
```

This will:
- Generate a new Ethereum-compatible wallet
- Save the private key to `.env`
- Create a secure backup in `.wallet-info.json`
- Display your wallet address

### 2. Get Testnet AVAX Tokens

Visit the **Avalanche Fuji Testnet Faucet**:
🌐 **https://faucet.avax.network/**

- Paste your wallet address (shown after generation)
- Request testnet AVAX tokens
- Wait 2-3 minutes for confirmation

### 3. Check Your Balance

```bash
npm run check-balance
```

### 4. Deploy Smart Contracts

```bash
npm run deploy:fuji
```

### 5. Update Environment

Copy the deployed contract address and add it to your main project `.env`:

```bash
TOURNAMENT_SCORING_CONTRACT_ADDRESS=0x1234...your_contract_address
```

### 6. Start the Service

```bash
make up
```

## 🛠️ Advanced Configuration

### Environment Variables

Your `packages/blockchain/.env` file should contain:

```env
# Required
PRIVATE_KEY=0x1234567890abcdef...your_private_key
TOURNAMENT_SCORING_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# Network (Fuji Testnet)
AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
AVALANCHE_CHAIN_ID=43113

# Gas Settings
GAS_LIMIT=3000000
GAS_PRICE=20000000000
```

### Manual Wallet Creation

If you prefer to create a wallet manually:

```bash
# Using ethers.js
node -e "
const {ethers} = require('ethers');
const wallet = ethers.Wallet.createRandom();
console.log('Private Key:', wallet.privateKey);
console.log('Address:', wallet.address);
"
```

### Import Existing Wallet

If you have an existing private key:

1. Add it directly to `.env`:
   ```
   PRIVATE_KEY=0x1234567890abcdef...your_existing_key
   ```

2. Or use MetaMask export:
   - MetaMask → Account Details → Export Private Key
   - Copy the private key to your `.env`

## 🔍 Verification

### Check Contract Deployment

```bash
curl http://localhost:3004/api/blockchain/health
```

Should return:
```json
{
  "success": true,
  "data": {
    "contractDeployed": true,
    "network": {
      "chainId": 43113,
      "name": "avalanche-fuji"
    }
  }
}
```

### Test Tournament Creation

```bash
curl -X POST http://localhost:3004/api/blockchain/tournaments \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Tournament","description":"A test tournament","maxParticipants":8}'
```

## 🌐 Network Information

### Avalanche Fuji Testnet

- **Chain ID**: 43113  
- **RPC URL**: https://api.avax-test.network/ext/bc/C/rpc
- **Block Explorer**: https://testnet.snowtrace.io/
- **Faucet**: https://faucet.avax.network/

### Add to MetaMask

**Network Name**: Avalanche Fuji C-Chain  
**New RPC URL**: https://api.avax-test.network/ext/bc/C/rpc  
**Chain ID**: 43113  
**Symbol**: AVAX  
**Explorer**: https://testnet.snowtrace.io/  

## 🔒 Security Notes

- ⚠️ **Never commit private keys** to git
- 💾 **Backup your wallet** - save the mnemonic phrase safely
- 🔐 **Use testnet only** - this setup is for development
- 🗂️ **`.wallet-info.json`** contains sensitive data - keep it secure

## 🐛 Troubleshooting

### "Private key required" Error

```bash
# Check if private key is set
grep PRIVATE_KEY packages/blockchain/.env

# Generate new wallet if missing
npm run generate-wallet
```

### "Insufficient funds" Error

```bash
# Check balance
npm run check-balance

# Get more testnet AVAX
open https://faucet.avax.network/
```

### Contract Deployment Failed

```bash
# Check network connection
curl https://api.avax-test.network/ext/bc/C/rpc \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"eth_blockNumber","params":[]}'

# Redeploy contract
npm run deploy:fuji
```

### Service Won't Start

```bash
# Check logs
docker-compose logs blockchain

# Verify environment
make check-balance
```

## 🎮 Integration with ft_transcendence

Once your wallet and contract are set up, the blockchain service will:

1. **Store tournament results** on-chain for immutable records
2. **Verify game outcomes** through cryptographic hashes  
3. **Provide transparency** for tournament scoring
4. **Enable future features** like tournaments prizes or NFT rewards

The blockchain integration ensures that tournament results cannot be tampered with and provides a permanent record of all competitive games.

---

🎉 **You're ready to use blockchain-powered tournaments!** 🏆 