#!/bin/sh
set -e

echo "🚀 Starting blockchain service initialization..."

# Wait for blockchain-node to be ready
echo "⏳ Waiting for blockchain node to be ready..."
until curl -s http://blockchain-node:8545 > /dev/null 2>&1; do
  echo "   Blockchain node not ready yet, waiting..."
  sleep 2
done

echo "✅ Blockchain node is ready!"

# Deploy smart contracts to local network
echo "📝 Deploying smart contracts to local blockchain..."
npx hardhat run scripts/deploy-local.ts --network localhost

# Extract contract address from deployment file
CONTRACT_ADDRESS=$(cat deployments/local.json | grep '"contractAddress"' | cut -d'"' -f4)
echo "📋 Contract deployed at: $CONTRACT_ADDRESS"

# Set the contract address environment variable
export TOURNAMENT_SCORING_CONTRACT_ADDRESS=$CONTRACT_ADDRESS

echo "🎉 Blockchain service setup complete!"
echo "🌐 Starting blockchain service..."

# Start the blockchain service
exec npm run start 