# EthosGuard MVP - Current Status Report

EthosGuard is a reputation-gated NFT transfer protocol on Base Sepolia. It leverages Ethos Reputation Scores to secure trades and provides a fully interactive "Demo Simulator" that mirrors real-world functionality using burner wallets and real testnet assets.

## 🚀 Status: Feature Complete (Phase 4+ Polish)

### 🛠️ Tech Stack & Architecture
- **Frontend:** Next.js 15 (App Router), Tailwind CSS v4, Lucide Icons.
- **Blockchain:** Base Sepolia Testnet.
- **Smart Contract:** `TradeRequest.sol` (Escrow logic, Vouching, Reputation tracking).
- **Auth:** Privy (Social Login) + Viem (Local Burner Wallets for Demo Mode).
- **Data:** 
  - **Ethos API:** Identity resolution & Score.
  - **Alchemy:** NFT fetching (Real assets on Base Sepolia).
  - **On-Chain Events:** Used for Feeds, History, and Leaderboards (No backend database).

---

### ✅ Implemented Features

#### 1. Dual-Mode Authentication
- **Real Mode:** Standard Wallet Connect (RainbowKit).
- **Demo Mode (Simulator):** 
  - Login via Twitter (Privy) to fetch real Ethos Identity (Name, Image, Score).
  - Generates a persistent local **Burner Wallet** for signing transactions.
  - Users can fund this wallet with Base Sepolia ETH to perform *real* on-chain actions under their social identity.

#### 2. The Trading Loop (On-Chain)
Full OTC lifecycle implemented in `TradeRequest.sol`:
1.  **Request:** User A creates a buy/sell request (Value or Gift).
2.  **Accept/Deny:** User B (Target) accepts or denies the trade via the Dashboard.
3.  **Deposit:** User A deposits ETH into the Escrow Contract.
4.  **Finalize:** User B approves and transfers the NFT -> Contract releases ETH to B and NFT to A.
    *   *Demo Feature:* Includes "Get Gas" button linking to Alchemy Faucet.

#### 3. Social Trust Layer
- **Vouching:** Community members can "Vouch" for pending trades in the Feed.
    -   Contract stores vouches.
    -   UI shows "Vouched by @handle (Score)" badges.
- **Reputation Gate:** 
    -   **Danger (<1200):** Hard block.
    -   **Caution (<1400):** Requires Manual Verification.
    -   **Safe (1400+):** Green light.
    -   *Demo Override:* Searching for a demo address auto-mocks a safe score to facilitate testing.

#### 4. Interactive Dashboard
- **Vault:** View real NFTs in the connected wallet (Demo or Real).
- **Feed:** Global live activity feed (Cards with Avatars, Relative Time, Status).
- **History:** Personal trade log with Action Buttons (Accept, Deny, Deposit, Send NFT).
- **Rep:** View Credibility Score, Vouches, and Reviews.
- **Board (Leaderboard):** Live "Trade XP" leaderboard calculated client-side from the last 10,000 blocks.
    -   **Scoring:** +100 XP (Trade), +20 XP (Vouch), -500 XP (Flake).

#### 5. Notifications & UX
- **Action Banner:** High-visibility banner for pending actions (Incoming Requests).
- **Tab Badges:** Red notification count on History tab.
- **Toasts:** Real-time transaction status updates (Sonner).

---

### 📋 Key Contracts & Config
- **Contract Address:** `0xB99B33520B26dfEC12010f6D2204C98da669472C` (Base Sepolia)
- **Key Files:**
    - `contracts/TradeRequest.sol`: The core logic.
    - `lib/contract-abi.ts`: ABI definitions (TradeRequest + ERC721).
    - `hooks/useIncomingRequests.ts`: Fetches user-specific events.
    - `hooks/useLeaderboard.ts`: Calculates XP from event logs.
    - `components/Dashboard/RequestItem.tsx`: Handles the complex state machine of a trade.

### 🔜 Future Improvements
- [ ] **Indexer:** Move XP calculation and Feed fetching to a subgraph/backend for scalability.
- [ ] **Contract Upgrade:** Add `cancelRequest` for Senders.
- [ ] **Mobile Optimization:** Further refine the modal and feed for small screens.