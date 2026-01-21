import { createWalletClient, http, publicActions } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';

const privateKey = process.env.FAUCET_PRIVATE_KEY as `0x${string}`;
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;

console.log("🔍 [Debug] Private Key exists:", !!privateKey);
console.log("🔍 [Debug] RPC URL:", rpcUrl);

// Initialize the account from the private key
let account;
try {
  account = privateKey ? privateKeyToAccount(privateKey) : undefined;
} catch (error) {
  console.error("❌ Failed to load Faucet Wallet. Check FAUCET_PRIVATE_KEY in .env.local");
  account = undefined;
}

export { account };

// Create a Wallet Client for sending transactions
export const walletClient = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http(rpcUrl)
}).extend(publicActions); // Extend with public actions to use it as a Public Client too
