# BASIX: Cardano NFT Marketplace & IP Management

BASIX is a high-fidelity, decentralized marketplace for Intellectual Property (IP) and NFTs on the Cardano blockchain. Built with a focus on clean typography and immersive user experience, it allows creators to mint, manage, and trade digital assets with real-time blockchain synchronization.

## 🚀 Features

### 1. Cardano Wallet Integration
- **CIP-30 Support**: Connect with popular Cardano wallets like Nami, Eternl, Flint, and Lace.
- **Bech32 Compatibility**: Automatic conversion and display of wallet addresses in standard Bech32 format.
- **Session Management**: Secure wallet selection and transaction signing via the `lucid-cardano` library.

### 2. NFT Minting (CIP-25)
- **On-Chain Minting**: Create real NFTs on the Cardano network using Native Scripts.
- **Metadata Standard**: Implements the CIP-25 metadata standard for rich asset descriptions and media links.
- **Simulation Mode**: Test the minting flow without an API key using high-fidelity simulated transactions.

### 3. Smart Asset Detection
- **UTXO Scanning**: Automatically detects NFTs held in the connected wallet by scanning the blockchain ledger.
- **Real-Time Sync**: Synchronizes with the Cardano network to reflect changes in ownership and asset availability.

### 4. Decentralized Marketplace
- **List for Sale**: Move owned assets from your private collection to the public marketplace.
- **Purchase Assets**: Buy NFTs from other creators with real-time transaction feedback and Cardanoscan integration.
- **Escrow Simulation**: Realistic transaction signing flows for listing and purchasing assets.

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, TypeScript
- **Blockchain**: [Lucid-Cardano](https://github.com/spacebudz/lucid), [Blockfrost](https://blockfrost.io/)
- **Styling**: Tailwind CSS, Framer Motion (Animations)
- **Icons**: Lucide React
- **Polyfills**: Node.js polyfills for browser compatibility (Buffer, Stream, etc.)

## ⚙️ Setup & Configuration

To enable real blockchain interactions, you must configure the following environment variables in your `.env` file or AI Studio Secrets panel:

```env
# Blockfrost Project ID (Get one at https://blockfrost.io)
VITE_BLOCKFROST_PROJECT_ID=your_project_id_here

# Cardano Network (mainnet, preprod, or preview)
VITE_CARDANO_NETWORK=preprod
```

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 📖 How to Use

1. **Connect Wallet**: Click the "Connect Wallet" button and select your preferred Cardano wallet.
2. **Mint NFT**: Navigate to the "Mint" section, upload an image, add metadata, and sign the transaction.
3. **View Owned Assets**: Scroll to the bottom to see NFTs automatically detected in your wallet.
4. **List for Sale**: Click "Sell Asset" on an owned NFT, set your price in ADA, and confirm the listing.
5. **Buy Assets**: Browse the "Featured Collections" and click "Buy Asset" to purchase from the marketplace.

## ⚠️ Important Note

The application currently uses base64 encoding for image data in the minting metadata for demonstration purposes. For production use, it is highly recommended to upload images to **IPFS** and use the `ipfs://` URI in the metadata.

---

*Built with ❤️ for the Cardano Community.*
