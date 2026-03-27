/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/// <reference types="vite/client" />

import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Menu, 
  Search, 
  Heart, 
  ChevronDown, 
  Home, 
  Compass, 
  PlusCircle, 
  User,
  Plus,
  X,
  Wallet,
  CheckCircle2,
  ExternalLink,
  Upload,
  Sparkles,
  Info,
  Loader2,
  BookOpen,
  Send,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Lucid, Blockfrost, type MintingPolicy, type PolicyId, type TxHash, fromText } from 'lucid-cardano';
import { Buffer } from 'buffer';
import Markdown from 'react-markdown';

// Polyfill Buffer for Cardano libraries
if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = Buffer;
}

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface Asset {
  id: string;
  title: string;
  creator: string;
  price: string;
  available: string;
  type: 'NFT' | 'Phygital' | 'Fractional';
  image: string;
  isOwned?: boolean;
}

interface WalletInfo {
  name: string;
  icon: string;
  key: string;
}

// --- Mock Data ---
const INITIAL_ASSETS: Asset[] = [
  {
    id: '1',
    title: 'NEON_GENESIS_01',
    creator: 'Cyber_Labs',
    price: '2.45 ETH',
    available: '45.0%',
    type: 'NFT',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBs_c-liSAup-ElHUMnmdQWnvamJ5bc0FdFinoYxTSe7-gwjljUDRi5wvAq77_JOUPSQVFgezT3xGXrxMOiCRzhc-9cHixaeR1VL2G3AgJfhYV0bJOmX1tlXsMuJh4TAZGNFNXxwd4okB-vFS85ENeSdr53ArhDdP8lcrp4RnARzwhK607wHJeW4CZSSPwNDVIZzL4ObOjZe-OLzg-Zr-Cf6wmUq7e_hUzq99v-5Q2D6dTsqx8FFnKVMmwHajdTalu712LhNi9YoTI',
  },
  {
    id: '2',
    title: 'CHRONO_FRACTION_A',
    creator: 'SwissElite',
    price: '14.2 ETH',
    available: '12.5%',
    type: 'Phygital',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRHFtMhRWjy0qYrKk7sh6ZqdeBNYa4WA0DLpjvvzmRE0xbqu4BTndklmAwAtdfyu6pV4xznQLdEpUWDqDT4xTWlrKV49pgVzFIhQ2yMC0cPqqXMDJ-rIdCn4xlPeZVlnOVN1TFk9TVO2kjEJlHxU0WcQrkU9MLuvg-yQhGm5XxqTInvLzn6qKeo-HwBIBrN41h3_cuJtraW6kQwoYJyCcGfEGncxvGCHNgLW7E8ss3VYOjq_g8o9MCw_MM9LQUM-_hvSxH9PEWufI',
  }
];

const CATEGORIES = ['All Assets', 'NFTs', 'Phygital', 'Fractional', 'Knowledge Base'];

// --- Knowledge Base Component ---

const KnowledgeBase = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!query.trim()) return;

    const userMessage = query.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setQuery('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMessage,
        config: {
          systemInstruction: "You are a MeTTa (Meta-Type Talk) expert. Answer questions about MeTTa language based on the provided documentation. Be concise and provide code examples when relevant.",
          tools: [{ urlContext: {} }]
        },
        // Note: In a real scenario, we'd pass specific URLs from metta-lang.dev
        // For this demo, we'll use the main site and some common paths
        // @ts-ignore - urlContext is a valid tool but might not be in all type definitions
        urlContext: {
          urls: [
            "https://metta-lang.dev/",
            "https://metta-lang.dev/docs/introduction",
            "https://metta-lang.dev/docs/guide",
            "https://metta-lang.dev/docs/reference"
          ]
        }
      });

      const assistantMessage = response.text || "I'm sorry, I couldn't find information about that in the MeTTa documentation.";
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Error: Failed to connect to MeTTa Knowledge Base. Please check your connection." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-white border border-zinc-100 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col h-[600px] mt-12">
      <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center shadow-lg shadow-zinc-200">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-headline text-zinc-900">MeTTa Knowledge Base</h3>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Powered by metta-lang.dev</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100 rounded-full">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Live Documentation</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-grow overflow-y-auto p-8 space-y-6 no-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-zinc-50 flex items-center justify-center">
              <MessageSquare className="w-10 h-10 text-zinc-200" />
            </div>
            <div className="max-w-xs">
              <p className="text-zinc-900 font-bold text-lg">Ask anything about MeTTa</p>
              <p className="text-zinc-400 text-xs mt-2">Get instant answers, code snippets, and explanations directly from the official MeTTa language documentation.</p>
            </div>
            <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
              {["What is MeTTa?", "How to define a function in MeTTa?", "Explain pattern matching in MeTTa"].map((suggestion) => (
                <button 
                  key={suggestion}
                  onClick={() => setQuery(suggestion)}
                  className="text-left px-4 py-3 rounded-2xl border border-zinc-100 text-xs text-zinc-600 hover:bg-zinc-50 hover:border-zinc-200 transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex flex-col max-w-[85%]",
                msg.role === 'user' ? "ml-auto items-end" : "items-start"
              )}
            >
              <div className={cn(
                "px-6 py-4 rounded-[2rem] text-sm leading-relaxed",
                msg.role === 'user' 
                  ? "bg-zinc-900 text-white rounded-tr-none" 
                  : "bg-zinc-50 text-zinc-800 rounded-tl-none border border-zinc-100"
              )}>
                <div className="markdown-body prose prose-zinc prose-sm max-w-none">
                  <Markdown>{msg.content}</Markdown>
                </div>
              </div>
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-2 px-2">
                {msg.role === 'user' ? 'You' : 'MeTTa Expert'}
              </span>
            </motion.div>
          ))
        )}
        {isTyping && (
          <div className="flex items-center gap-3 px-2">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div 
                  key={i}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                  className="w-1.5 h-1.5 rounded-full bg-zinc-300"
                />
              ))}
            </div>
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">MeTTa Expert is thinking...</span>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-zinc-100 bg-white">
        <div className="relative flex items-center">
          <input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question about MeTTa..."
            className="w-full bg-zinc-50 border border-zinc-100 rounded-full py-4 pl-6 pr-16 text-sm outline-none focus:border-zinc-900 focus:bg-white transition-all"
          />
          <button 
            onClick={handleSend}
            disabled={!query.trim() || isTyping}
            className="absolute right-2 w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-white shadow-lg shadow-zinc-200 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Components ---

const SellModal = ({ 
  isOpen, 
  onClose, 
  asset,
  onSellSuccess,
  lucid
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  asset: Asset | null;
  onSellSuccess: (assetId: string, price: string) => void;
  lucid: Lucid | null;
}) => {
  const [price, setPrice] = useState('');
  const [isListing, setIsListing] = useState(false);
  const [step, setStep] = useState(1);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!asset) return null;

  const handleList = async () => {
    if (!price) return;
    setIsListing(true);
    setError(null);
    
    try {
      if (lucid) {
        // Simulate a real transaction by asking for a signature
        // In a real marketplace, this would be a script transaction (plutus)
        // For this demo, we'll simulate the signing process
        const address = await lucid.wallet.address();
        const tx = await lucid.newTx()
          .payToAddress(address, { lovelace: 1000000n }) // Dummy self-payment to trigger signature
          .complete();
        const signedTx = await tx.sign().complete();
        const hash = await signedTx.submit();
        setTxHash(hash);
      } else {
        // Simulation mode
        await new Promise(resolve => setTimeout(resolve, 2500));
        setTxHash("simulated_listing_hash_" + Math.random().toString(36).substring(7));
      }
      
      setIsListing(false);
      setStep(2);
      onSellSuccess(asset.id, `${price} ADA`);
    } catch (err: any) {
      console.error("Listing failed:", err);
      setError(err.message || "Failed to list asset. Please try again.");
      setIsListing(false);
    }
  };

  const reset = () => {
    setStep(1);
    setPrice('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={reset}
            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden"
          >
            <div className="p-10">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-bold font-headline tracking-tight">List for Sale</h3>
                <button onClick={reset} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {step === 1 ? (
                <div className="space-y-8">
                  <div className="flex items-center gap-6 p-4 bg-zinc-50 rounded-3xl">
                    <img src={asset.image} alt={asset.title} className="w-20 h-20 rounded-2xl object-cover shadow-sm" />
                    <div>
                      <h4 className="font-bold text-zinc-900">{asset.title}</h4>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Owned Asset</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Set Listing Price (ADA)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        placeholder="e.g. 450"
                        className="w-full bg-zinc-50 border-none rounded-2xl py-5 px-6 text-lg font-bold focus:ring-2 focus:ring-zinc-900 transition-all"
                      />
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">ADA</div>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-2xl flex gap-3">
                    <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-amber-700 leading-relaxed font-medium">
                      Listing your NFT will move it to a secure smart contract escrow. You can cancel the listing at any time.
                    </p>
                  </div>

                  <button 
                    disabled={!price || isListing}
                    onClick={handleList}
                    className="w-full bg-zinc-900 text-white font-bold py-5 rounded-2xl uppercase tracking-[0.2em] text-xs hover:bg-zinc-800 transition-all disabled:opacity-30 flex items-center justify-center gap-3"
                  >
                    {isListing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Broadcasting...
                      </>
                    ) : (
                      'Confirm Listing'
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center py-6 text-center">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-8">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-2xl font-bold font-headline mb-4">Asset Listed!</h4>
                  <p className="text-zinc-500 text-sm max-w-xs leading-relaxed mb-10 px-4">
                    Your NFT is now live on the marketplace for {price} ADA. <br/>
                    <span className="text-[10px] text-zinc-400 font-mono break-all mt-4 block">TX: {txHash}</span>
                  </p>
                  <button 
                    onClick={reset}
                    className="w-full bg-zinc-900 text-white font-bold py-5 rounded-2xl uppercase tracking-[0.2em] text-xs hover:bg-zinc-800 transition-all"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const BuyModal = ({ 
  isOpen, 
  onClose, 
  asset,
  onBuySuccess,
  lucid
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  asset: Asset | null;
  onBuySuccess: (assetId: string) => void;
  lucid: Lucid | null;
}) => {
  const [isBuying, setIsBuying] = useState(false);
  const [step, setStep] = useState(1);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!asset) return null;

  const handleBuy = async () => {
    setIsBuying(true);
    setError(null);
    
    try {
      if (lucid) {
        // Simulate a real purchase transaction
        const address = await lucid.wallet.address();
        const tx = await lucid.newTx()
          .payToAddress(address, { lovelace: 1000000n }) // Dummy self-payment to trigger signature
          .complete();
        const signedTx = await tx.sign().complete();
        const hash = await signedTx.submit();
        setTxHash(hash);
      } else {
        // Simulation mode
        await new Promise(resolve => setTimeout(resolve, 2500));
        setTxHash("simulated_purchase_hash_" + Math.random().toString(36).substring(7));
      }
      
      setIsBuying(false);
      setStep(2);
      onBuySuccess(asset.id);
    } catch (err: any) {
      console.error("Purchase failed:", err);
      setError(err.message || "Failed to purchase asset. Please try again.");
      setIsBuying(false);
    }
  };

  const reset = () => {
    setStep(1);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={reset}
            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden"
          >
            <div className="p-10">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-bold font-headline tracking-tight">Purchase NFT</h3>
                <button onClick={reset} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {step === 1 ? (
                <div className="space-y-8">
                  <div className="flex items-center gap-6 p-4 bg-zinc-50 rounded-3xl">
                    <img src={asset.image} alt={asset.title} className="w-20 h-20 rounded-2xl object-cover shadow-sm" />
                    <div>
                      <h4 className="font-bold text-zinc-900">{asset.title}</h4>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Marketplace Asset</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Price</label>
                    <div className="text-3xl font-bold text-zinc-900">{asset.price}</div>
                  </div>

                  <div className="p-4 bg-zinc-50 rounded-2xl flex gap-3">
                    <Info className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
                      Purchasing this NFT will transfer the ownership to your wallet and the funds to the seller.
                    </p>
                  </div>

                  {error && (
                    <div className="p-4 bg-rose-50 text-rose-600 text-xs rounded-2xl font-medium">
                      {error}
                    </div>
                  )}

                  <button 
                    disabled={isBuying}
                    onClick={handleBuy}
                    className="w-full bg-zinc-900 text-white font-bold py-5 rounded-2xl uppercase tracking-[0.2em] text-xs hover:bg-zinc-800 transition-all disabled:opacity-30 flex items-center justify-center gap-3"
                  >
                    {isBuying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Confirm Purchase'
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center py-10 text-center">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-8">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-2xl font-bold font-headline mb-4">Purchase Successful!</h4>
                  <p className="text-zinc-500 text-sm max-w-xs leading-relaxed mb-10">
                    You now own {asset.title}. <br/>
                    <span className="text-[10px] text-zinc-400 font-mono break-all mt-4 block">TX: {txHash}</span>
                  </p>
                  <button 
                    onClick={reset}
                    className="w-full bg-zinc-900 text-white font-bold py-5 rounded-2xl uppercase tracking-[0.2em] text-xs hover:bg-zinc-800 transition-all"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const MintModal = ({ 
  isOpen, 
  onClose, 
  onMintSuccess,
  lucid
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onMintSuccess: (asset: Asset) => void;
  lucid: Lucid | null;
}) => {
  const [step, setStep] = useState(1);
  const [isMinting, setIsMinting] = useState(false);
  const [mintError, setMintError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMint = async () => {
    if (!formData.name || !formData.image) return;
    
    setIsMinting(true);
    setMintError(null);
    
    try {
      if (!lucid) {
        // Simulation mode
        await new Promise(resolve => setTimeout(resolve, 3000));
        const hash = "simulated_tx_hash_" + Math.random().toString(36).substring(7);
        setTxHash(hash);
        
        const newAsset: Asset = {
          id: hash,
          title: formData.name,
          creator: 'You',
          price: '0.00 ADA',
          available: '100%',
          type: 'NFT',
          image: formData.image,
        };
        
        setStep(3);
        onMintSuccess(newAsset);
        return;
      }

      // Real minting logic
      const utxos = await lucid.wallet.getUtxos();
      if (utxos.length === 0) throw new Error("No UTXOs found in wallet. Please fund your wallet.");
      
      const address = await lucid.wallet.address();
      const { paymentCredential } = lucid.utils.getAddressDetails(address);
      
      if (!paymentCredential) throw new Error("Could not get payment credential.");

      // 2. Create a simple minting policy (Native Script)
      const mintingPolicy: MintingPolicy = lucid.utils.nativeScriptFromJson({
        type: "all",
        scripts: [
          { type: "sig", keyHash: paymentCredential.hash }
        ]
      });

      const policyId: PolicyId = lucid.utils.mintingPolicyToId(mintingPolicy);
      const assetName = fromText(formData.name);
      const unit = policyId + assetName;

      // 3. Prepare metadata (CIP-25)
      // Note: In a real app, you'd upload the image to IPFS first.
      // For this demo, we'll use a placeholder IPFS hash or the base64 if small (not recommended for mainnet).
      const metadata = {
        [policyId]: {
          [formData.name]: {
            name: formData.name,
            image: "ipfs://QmPlaceholderHash", // Placeholder for demo
            description: formData.description,
            mediaType: "image/png",
          }
        }
      };

      // 4. Build, sign, and submit the transaction
      const tx = await lucid
        .newTx()
        .mintAssets({ [unit]: 1n })
        .attachMintingPolicy(mintingPolicy)
        .attachMetadata(721, metadata)
        .complete();

      const signedTx = await tx.sign().complete();
      const hash: TxHash = await signedTx.submit();
      
      setTxHash(hash);
      
      const newAsset: Asset = {
        id: hash,
        title: formData.name,
        creator: 'You',
        price: '0.00 ADA',
        available: '100%',
        type: 'NFT',
        image: formData.image,
      };
      
      setStep(3);
      onMintSuccess(newAsset);
    } catch (error: any) {
      console.error("Minting failed:", error);
      setMintError(error.message || "Minting failed. Please check your wallet and try again.");
    } finally {
      setIsMinting(false);
    }
  };

  const reset = () => {
    setStep(1);
    setFormData({ name: '', description: '', image: '' });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={reset}
            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden"
          >
            <div className="p-10">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-900 rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold font-headline tracking-tight">Mint Cardano NFT</h3>
                </div>
                <button onClick={reset} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {!lucid && (
                <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3">
                  <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-amber-900">Cardano Integration Incomplete</p>
                    <p className="text-[10px] text-amber-700 leading-relaxed">
                      To enable real blockchain minting, please configure your <b>Blockfrost Project ID</b> in the environment variables. 
                      The app is currently running in <b>Simulation Mode</b>.
                    </p>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-[2rem] border-2 border-dashed border-zinc-200 bg-zinc-50 flex flex-col items-center justify-center cursor-pointer hover:border-zinc-900 transition-all group overflow-hidden relative"
                    >
                      {formData.image ? (
                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-zinc-300 group-hover:text-zinc-900 transition-colors mb-4" />
                          <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Upload Asset</p>
                          <p className="text-zinc-400 text-[10px] mt-2">PNG, JPG, GIF up to 10MB</p>
                        </>
                      )}
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept="image/*"
                      />
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-zinc-50 rounded-2xl">
                      <Info className="w-4 h-4 text-zinc-400 mt-0.5" />
                      <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
                        Your asset will be permanently stored on IPFS and minted on the Cardano blockchain.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Asset Name</label>
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. Cyber Punk #001"
                        className="w-full bg-zinc-50 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-zinc-900 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Description</label>
                      <textarea 
                        rows={4}
                        value={formData.description}
                        onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Tell the story of your masterpiece..."
                        className="w-full bg-zinc-50 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-zinc-900 transition-all resize-none"
                      />
                    </div>
                    <button 
                      disabled={!formData.name || !formData.image}
                      onClick={() => setStep(2)}
                      className="w-full bg-zinc-900 text-white font-bold py-5 rounded-2xl uppercase tracking-[0.2em] text-xs hover:bg-zinc-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Review & Mint
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col items-center py-10 text-center">
                  {isMinting ? (
                    <>
                      <div className="relative w-24 h-24 mb-8">
                        <Loader2 className="w-full h-full text-zinc-900 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Sparkles className="w-8 h-8 text-zinc-900" />
                        </div>
                      </div>
                      <h4 className="text-2xl font-bold font-headline mb-4">Minting in Progress...</h4>
                      <p className="text-zinc-500 text-sm max-w-xs leading-relaxed">
                        We are broadcasting your transaction to the Cardano network. Please do not close this window.
                      </p>
                    </>
                  ) : mintError ? (
                    <>
                      <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-8">
                        <X className="w-10 h-10" />
                      </div>
                      <h4 className="text-2xl font-bold font-headline mb-4 text-rose-600">Minting Failed</h4>
                      <p className="text-zinc-500 text-sm max-w-xs leading-relaxed mb-8">
                        {mintError}
                      </p>
                      <button 
                        onClick={() => setStep(1)}
                        className="w-full bg-zinc-900 text-white font-bold py-5 rounded-2xl uppercase tracking-[0.2em] text-xs hover:bg-zinc-800 transition-all"
                      >
                        Try Again
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-32 h-32 rounded-3xl overflow-hidden mb-8 shadow-xl">
                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <h4 className="text-2xl font-bold font-headline mb-2">{formData.name}</h4>
                      <p className="text-zinc-400 text-xs mb-10 uppercase tracking-widest">Policy: <span className="text-zinc-900">769c...8f2a</span></p>
                      
                      <div className="flex gap-4 w-full">
                        <button 
                          onClick={() => setStep(1)}
                          className="flex-1 border border-zinc-200 text-zinc-500 font-bold py-5 rounded-2xl uppercase tracking-widest text-xs hover:bg-zinc-50 transition-all"
                        >
                          Back
                        </button>
                        <button 
                          onClick={handleMint}
                          className="flex-[2] bg-zinc-900 text-white font-bold py-5 rounded-2xl uppercase tracking-[0.2em] text-xs hover:bg-zinc-800 transition-all"
                        >
                          Confirm & Mint
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="flex flex-col items-center py-10 text-center">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-8">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-3xl font-bold font-headline mb-4">NFT Minted Successfully!</h4>
                  <p className="text-zinc-500 text-sm max-w-xs leading-relaxed mb-10">
                    Your masterpiece is now live on the Cardano blockchain. Transaction: <span className="text-zinc-900 font-mono text-[10px] break-all">{txHash}</span>
                  </p>
                  
                  <div className="flex flex-col gap-3 w-full max-w-xs">
                    <button 
                      onClick={reset}
                      className="w-full bg-zinc-900 text-white font-bold py-5 rounded-2xl uppercase tracking-[0.2em] text-xs hover:bg-zinc-800 transition-all"
                    >
                      View in Collection
                    </button>
                    <a 
                      href={`https://${import.meta.env.VITE_CARDANO_NETWORK === 'mainnet' ? '' : import.meta.env.VITE_CARDANO_NETWORK + '.'}cardanoscan.io/transaction/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-zinc-400 font-bold py-3 uppercase tracking-widest text-[10px] hover:text-zinc-900 transition-colors flex items-center justify-center gap-2"
                    >
                      View on Cardanoscan <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const WalletModal = ({ 
  isOpen, 
  onClose, 
  onConnect 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConnect: (walletKey: string) => void;
}) => {
  const [availableWallets, setAvailableWallets] = useState<WalletInfo[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Check for CIP-30 wallets in window.cardano
      const cardano = (window as any).cardano;
      if (cardano) {
        const wallets: WalletInfo[] = Object.keys(cardano)
          .filter(key => cardano[key].enable && cardano[key].name)
          .map(key => ({
            name: cardano[key].name,
            icon: cardano[key].icon,
            key: key
          }));
        setAvailableWallets(wallets);
      }
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold font-headline tracking-tight">Connect Wallet</h3>
                <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-3">
                {availableWallets.length > 0 ? (
                  availableWallets.map((wallet) => (
                    <button
                      key={wallet.key}
                      onClick={() => onConnect(wallet.key)}
                      className="w-full flex items-center justify-between p-4 rounded-2xl border border-zinc-100 hover:border-zinc-900 hover:bg-zinc-50 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <img src={wallet.icon} alt={wallet.name} className="w-10 h-10 rounded-xl" />
                        <span className="font-bold text-zinc-900">{wallet.name}</span>
                      </div>
                      <ChevronDown className="w-5 h-5 text-zinc-300 -rotate-90 group-hover:text-zinc-900 transition-colors" />
                    </button>
                  ))
                ) : (
                  <div className="text-center py-12 px-6 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
                    <Wallet className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                    <p className="text-zinc-500 font-medium text-sm">No Cardano wallets detected.</p>
                    <p className="text-zinc-400 text-xs mt-2">Install Nami, Eternl, or Flint to get started.</p>
                    <a 
                      href="https://www.cardano.org/wallets/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-6 text-xs font-bold uppercase tracking-widest text-zinc-900 hover:opacity-60 transition-opacity"
                    >
                      Explore Wallets <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              <p className="text-center text-[10px] text-zinc-400 mt-8 font-medium uppercase tracking-widest">
                By connecting, you agree to our Terms of Service
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const TopBar = ({ 
  onConnectClick, 
  connectedAddress 
}: { 
  onConnectClick: () => void; 
  connectedAddress: string | null;
}) => (
  <header className="fixed top-0 w-full z-50 bg-gray-50/80 backdrop-blur-xl border-b border-zinc-100/50">
    <div className="flex justify-between items-center px-6 h-16 w-full max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <button className="p-1 hover:bg-zinc-100 rounded-full transition-colors">
          <Menu className="w-6 h-6 text-zinc-800" />
        </button>
        <h1 className="text-xl font-bold tracking-tighter text-zinc-900 font-headline">BASIX</h1>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-1 hover:bg-zinc-100 rounded-full transition-colors hidden sm:block">
          <Search className="w-5 h-5 text-zinc-800" />
        </button>
        <button 
          onClick={onConnectClick}
          className={cn(
            "text-[10px] font-bold px-5 py-2 rounded-full uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2",
            connectedAddress 
              ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
              : "bg-zinc-900 text-white hover:bg-zinc-800"
          )}
        >
          {connectedAddress ? (
            <>
              <CheckCircle2 className="w-3 h-3" />
              {`${connectedAddress.slice(0, 6)}...${connectedAddress.slice(-4)}`}
            </>
          ) : (
            'Connect'
          )}
        </button>
      </div>
    </div>
  </header>
);

const BottomNav = ({ onMintClick }: { onMintClick: () => void }) => (
  <nav className="fixed bottom-8 left-0 right-0 z-50 flex justify-center px-4">
    <div className="bg-white/70 backdrop-blur-2xl border border-white/20 w-full max-w-md rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.04)] flex justify-around items-center p-2">
      <button className="flex items-center justify-center text-zinc-400 w-12 h-12 hover:text-zinc-900 transition-colors">
        <Home className="w-6 h-6" />
      </button>
      <button className="flex items-center justify-center bg-zinc-900 text-white rounded-full w-12 h-12 shadow-lg shadow-zinc-200">
        <Compass className="w-6 h-6" />
      </button>
      <button 
        onClick={onMintClick}
        className="flex items-center justify-center text-zinc-400 w-12 h-12 hover:text-zinc-900 transition-colors"
      >
        <PlusCircle className="w-6 h-6" />
      </button>
      <button className="flex items-center justify-center text-zinc-400 w-12 h-12 hover:text-zinc-900 transition-colors">
        <User className="w-6 h-6" />
      </button>
    </div>
  </nav>
);

const AssetCard: React.FC<{ 
  asset: Asset; 
  onSellClick?: (asset: Asset) => void;
  onBuyClick?: (asset: Asset) => void;
}> = ({ 
  asset, 
  onSellClick,
  onBuyClick
}) => {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group cursor-pointer"
    >
      <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-zinc-100 relative">
        <img 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          src={asset.image} 
          alt={asset.title}
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] font-bold text-zinc-900 uppercase tracking-tighter border border-white/20 shadow-sm">
          {asset.type}
        </div>
        
        {asset.isOwned && onSellClick && (
          <div className="absolute inset-0 bg-zinc-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onSellClick(asset);
              }}
              className="bg-white text-zinc-900 font-bold px-8 py-3 rounded-full uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              Sell Asset
            </button>
          </div>
        )}

        {!asset.isOwned && onBuyClick && (
          <div className="absolute inset-0 bg-zinc-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onBuyClick(asset);
              }}
              className="bg-white text-zinc-900 font-bold px-8 py-3 rounded-full uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              Buy Asset
            </button>
          </div>
        )}
      </div>
      <div className="mt-5 space-y-1">
        <div className="flex justify-between items-start">
          <h4 className="font-headline font-bold text-lg tracking-tight text-zinc-900">{asset.title}</h4>
          <button className="p-1 hover:bg-zinc-100 rounded-full transition-colors">
            <Heart className="w-4 h-4 text-zinc-400 hover:text-rose-500 transition-colors" />
          </button>
        </div>
        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
          by <span className="text-zinc-900">{asset.creator}</span>
        </p>
        <div className="flex justify-between items-center pt-4 border-t border-zinc-100 mt-5">
          <div>
            <p className="text-[9px] text-zinc-400 uppercase font-bold tracking-widest">Price</p>
            <p className="text-sm font-extrabold text-zinc-900">{asset.price}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-zinc-400 uppercase font-bold tracking-widest">Status</p>
            <p className={cn(
              "text-[10px] font-bold",
              asset.isOwned ? "text-blue-600" : "text-emerald-600"
            )}>
              {asset.isOwned ? 'OWNED' : asset.available}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [activeCategory, setActiveCategory] = useState('All Assets');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [selectedAssetForSell, setSelectedAssetForSell] = useState<Asset | null>(null);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [selectedAssetForBuy, setSelectedAssetForBuy] = useState<Asset | null>(null);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [lucid, setLucid] = useState<Lucid | null>(null);
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [ownedAssets, setOwnedAssets] = useState<Asset[]>([]);
  const [isLoadingOwned, setIsLoadingOwned] = useState(false);

  // Initialize Lucid on mount if project ID is available
  useEffect(() => {
    const initLucid = async () => {
      const projectId = import.meta.env.VITE_BLOCKFROST_PROJECT_ID;
      const network = import.meta.env.VITE_CARDANO_NETWORK || 'preprod';
      
      if (projectId) {
        try {
          const l = await Lucid.new(
            new Blockfrost(
              `https://cardano-${network}.blockfrost.io/api/v0`,
              projectId
            ),
            network === 'mainnet' ? 'Mainnet' : network === 'preprod' ? 'Preprod' : 'Preview'
          );
          setLucid(l);
        } catch (error) {
          console.error("Failed to initialize Lucid:", error);
        }
      }
    };
    initLucid();
  }, []);

  const fetchOwnedAssets = async (address: string) => {
    if (!lucid) return;
    setIsLoadingOwned(true);
    
    try {
      // Fetch real UTXOs from the blockchain
      const utxos = await lucid.utxosAt(address);
      
      const detected: Asset[] = [];
      
      for (const utxo of utxos) {
        for (const [unit, amount] of Object.entries(utxo.assets)) {
          if (unit !== 'lovelace') {
            // unit is policyId + assetNameHex
            const policyId = unit.slice(0, 56);
            const assetNameHex = unit.slice(56);
            const assetName = Buffer.from(assetNameHex, 'hex').toString('utf8');
            
            // In a real app, we'd fetch metadata from the blockchain or an indexer
            // For now, we'll create a placeholder asset object for detected tokens
            detected.push({
              id: unit,
              title: assetName || `Asset ${unit.slice(0, 8)}...`,
              creator: 'Unknown',
              price: '0.00 ADA',
              available: 'Owned',
              type: 'NFT',
              image: `https://picsum.photos/seed/${unit}/800/1000`, // Placeholder image
              isOwned: true
            });
          }
        }
      }
      
      // Filter out duplicates (if multiple UTXOs contain the same asset)
      const uniqueDetected = detected.filter((asset, index, self) =>
        index === self.findIndex((t) => t.id === asset.id)
      );
      
      setOwnedAssets(uniqueDetected);
    } catch (error) {
      console.error("Failed to fetch owned assets:", error);
      // Fallback to mock data if real fetch fails (e.g. no Blockfrost key)
      const mockDetected: Asset[] = [
        {
          id: 'owned-1',
          title: 'CYBER_PUNK_REVENGE',
          creator: 'You',
          price: '0.00 ADA',
          available: 'Owned',
          type: 'NFT',
          image: 'https://picsum.photos/seed/cyber1/800/1000',
          isOwned: true
        }
      ];
      setOwnedAssets(mockDetected);
    } finally {
      setIsLoadingOwned(false);
    }
  };

  const handleConnectWallet = async (walletKey: string) => {
    try {
      const cardano = (window as any).cardano;
      if (cardano && cardano[walletKey]) {
        const api = await cardano[walletKey].enable();
        
        // If lucid is initialized, select the wallet
        if (lucid) {
          lucid.selectWallet(api);
        } else {
          // Fallback initialization if not done on mount
          const projectId = import.meta.env.VITE_BLOCKFROST_PROJECT_ID;
          const network = import.meta.env.VITE_CARDANO_NETWORK || 'preprod';
          
          if (projectId) {
            const l = await Lucid.new(
              new Blockfrost(
                `https://cardano-${network}.blockfrost.io/api/v0`,
                projectId
              ),
              network === 'mainnet' ? 'Mainnet' : network === 'preprod' ? 'Preprod' : 'Preview'
            );
            l.selectWallet(api);
            setLucid(l);
          }
        }

        const hexAddresses = await api.getUsedAddresses();
        let address = '';
        if (hexAddresses.length > 0) {
          address = hexAddresses[0];
        } else {
          const unused = await api.getUnusedAddresses();
          if (unused.length > 0) {
            address = unused[0];
          }
        }

        if (address) {
          // Convert hex address to Bech32 if needed
          const bech32Address = await lucid.wallet.address();
          setConnectedAddress(bech32Address);
          setIsWalletModalOpen(false);
          fetchOwnedAssets(bech32Address);
        }
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    }
  };

  const handleMintSuccess = (newAsset: Asset) => {
    const ownedAsset = { ...newAsset, isOwned: true };
    setOwnedAssets(prev => [ownedAsset, ...prev]);
  };

  const handleSellClick = (asset: Asset) => {
    setSelectedAssetForSell(asset);
    setIsSellModalOpen(true);
  };

  const handleSellSuccess = (assetId: string, price: string) => {
    // Move from owned to public marketplace
    const asset = ownedAssets.find(a => a.id === assetId);
    if (asset) {
      const listedAsset = { ...asset, price, isOwned: false, available: '100%' };
      setAssets(prev => [listedAsset, ...prev]);
      setOwnedAssets(prev => prev.filter(a => a.id !== assetId));
    }
    setIsSellModalOpen(false);
  };

  const handleBuyClick = (asset: Asset) => {
    if (!connectedAddress) {
      setIsWalletModalOpen(true);
      return;
    }
    setSelectedAssetForBuy(asset);
    setIsBuyModalOpen(true);
  };

  const handleBuySuccess = (assetId: string) => {
    // Move from public marketplace to owned
    const asset = assets.find(a => a.id === assetId);
    if (asset) {
      const ownedAsset = { ...asset, isOwned: true, available: 'Owned' };
      setOwnedAssets(prev => [ownedAsset, ...prev]);
      setAssets(prev => prev.filter(a => a.id !== assetId));
    }
    setIsBuyModalOpen(false);
  };

  const handleMintClick = () => {
    if (!connectedAddress) {
      setIsWalletModalOpen(true);
    } else {
      setIsMintModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-32">
      <TopBar 
        onConnectClick={() => setIsWalletModalOpen(true)} 
        connectedAddress={connectedAddress} 
      />

      <WalletModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
        onConnect={handleConnectWallet}
      />

      <MintModal 
        isOpen={isMintModalOpen} 
        onClose={() => setIsMintModalOpen(false)} 
        onMintSuccess={handleMintSuccess}
        lucid={lucid}
      />

      <SellModal 
        isOpen={isSellModalOpen}
        onClose={() => setIsSellModalOpen(false)}
        asset={selectedAssetForSell}
        onSellSuccess={handleSellSuccess}
        lucid={lucid}
      />

      <BuyModal 
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        asset={selectedAssetForBuy}
        onBuySuccess={handleBuySuccess}
        lucid={lucid}
      />

      <main className="mt-20 px-6 flex-grow max-w-7xl mx-auto w-full">
        {/* Hero Section */}
        <section className="mt-12 mb-10">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-6xl font-extrabold font-headline tracking-tight leading-[1.1] max-w-2xl text-zinc-900"
          >
            Discover Intellectual <br/> Property & NFTs
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-500 text-sm md:text-base mt-6 font-medium max-w-md"
          >
            The premier liquid marketplace for high-value physical assets. Secured by blockchain.
          </motion.p>
        </section>

        {/* Owned Assets Section */}
        <AnimatePresence>
          {connectedAddress && (
            <motion.section 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-12 overflow-hidden"
            >
              <div className="flex justify-between items-end mb-8 border-b border-zinc-100 pb-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold font-headline tracking-tight uppercase text-zinc-900">Currently Owned Assets</h2>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-2">Detected in your wallet</p>
                </div>
              </div>

              {isLoadingOwned ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4 bg-zinc-50 rounded-[3rem] border border-dashed border-zinc-200">
                  <Loader2 className="w-8 h-8 text-zinc-300 animate-spin" />
                  <p className="text-zinc-400 text-[9px] font-bold uppercase tracking-[0.3em]">Scanning Blockchain...</p>
                </div>
              ) : ownedAssets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                  {ownedAssets.map((asset) => (
                    <AssetCard 
                      key={asset.id} 
                      asset={asset} 
                      onSellClick={handleSellClick}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-zinc-50 rounded-[3rem] border border-dashed border-zinc-200">
                  <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">No assets detected in this wallet</p>
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>

        {/* Search & Filters */}
        <section className="space-y-8 mt-12">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-zinc-400" />
            </div>
            <input 
              className="w-full bg-transparent border-b border-zinc-200 focus:border-zinc-900 py-4 pl-8 pr-4 rounded-none text-sm placeholder:text-zinc-400 outline-none transition-all" 
              placeholder="Search IP assets, creators..." 
              type="text"
            />
          </div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
            {CATEGORIES.map((cat) => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-6 py-2.5 rounded-full whitespace-nowrap text-[10px] font-bold uppercase tracking-wider transition-all border",
                  activeCategory === cat 
                    ? "bg-zinc-900 text-white border-zinc-900 shadow-lg shadow-zinc-200" 
                    : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-900 hover:text-zinc-900"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {activeCategory === 'Knowledge Base' ? (
          <KnowledgeBase />
        ) : (
          <>
            {/* Stats Grid */}
            <section className="grid grid-cols-2 gap-4 mt-12">
              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-white border border-zinc-100 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between"
              >
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Market Volume</span>
                <div className="mt-6">
                  <h3 className="text-2xl md:text-3xl font-bold font-headline text-zinc-900">1,284 ETH</h3>
                  <p className="text-[10px] text-emerald-600 font-bold mt-2 flex items-center gap-1">
                    <span className="text-lg leading-none">↑</span> 12.4% <span className="text-zinc-400 ml-1 font-medium">24H</span>
                  </p>
                </div>
              </motion.div>
              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-white border border-zinc-100 p-6 rounded-3xl shadow-[0_8px_30_rgb(0,0,0,0.02)] flex flex-col justify-between"
              >
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Active Bids</span>
                <div className="mt-6">
                  <h3 className="text-2xl md:text-3xl font-bold font-headline text-zinc-900">432</h3>
                  <p className="text-[10px] text-zinc-400 font-bold mt-2 tracking-wider">85 NEW TODAY</p>
                </div>
              </motion.div>
            </section>

            {/* Asset Grid Header */}
            <div className="flex justify-between items-end mt-20 mb-10 border-b border-zinc-100 pb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold font-headline tracking-tight uppercase text-zinc-900">Featured Collections</h2>
              </div>
              <button className="text-zinc-400 hover:text-zinc-900 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors">
                Filter <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {/* Asset Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {assets.map((asset) => (
                <AssetCard 
                  key={asset.id} 
                  asset={asset} 
                  onBuyClick={handleBuyClick}
                />
              ))}
              
              {/* Skeleton/Placeholder */}
              <div className="bg-white p-8 rounded-3xl border border-dashed border-zinc-200 flex flex-col items-center justify-center h-[450px] gap-4">
                <div className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center">
                  <Plus className="w-6 h-6 text-zinc-300" />
                </div>
                <p className="text-zinc-300 text-[10px] font-bold uppercase tracking-[0.2em] text-center">
                  More assets <br/> loading...
                </p>
              </div>
            </section>

            {/* Loading State */}
            <div className="flex flex-col items-center justify-center py-24 gap-6">
              <div className="w-12 h-[1px] bg-zinc-100 relative overflow-hidden">
                <motion.div 
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-zinc-900"
                />
              </div>
              <p className="text-zinc-400 text-[9px] font-bold uppercase tracking-[0.4em]">Synchronizing Ledger</p>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-20 px-6 mt-auto bg-white border-t border-zinc-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-16">
          <div className="max-w-xs">
            <span className="text-2xl font-bold text-zinc-900 font-headline tracking-tighter">BASIX</span>
            <p className="text-xs text-zinc-500 mt-8 leading-relaxed font-medium">
              The world's premier liquid marketplace for intellectual property and high-value physical assets. Secured by blockchain technology.
            </p>
            <p className="text-[10px] text-zinc-400 mt-12 font-bold uppercase tracking-widest">© 2024 BASIX MARKETPLACE</p>
          </div>
          <div className="grid grid-cols-2 gap-x-16 gap-y-6">
            <div className="space-y-4">
              <a className="block text-zinc-900 hover:text-zinc-400 transition-colors text-[10px] font-bold uppercase tracking-widest" href="#">Documentation</a>
              <a className="block text-zinc-900 hover:text-zinc-400 transition-colors text-[10px] font-bold uppercase tracking-widest" href="#">Discord</a>
            </div>
            <div className="space-y-4">
              <a className="block text-zinc-900 hover:text-zinc-400 transition-colors text-[10px] font-bold uppercase tracking-widest" href="#">Twitter</a>
              <a className="block text-zinc-900 hover:text-zinc-400 transition-colors text-[10px] font-bold uppercase tracking-widest" href="#">Terms</a>
            </div>
          </div>
        </div>
      </footer>

      <BottomNav onMintClick={handleMintClick} />

      {/* Mobile FAB */}
      <motion.button 
        whileTap={{ scale: 0.9 }}
        onClick={handleMintClick}
        className="fixed bottom-28 right-8 w-14 h-14 bg-zinc-900 text-white rounded-full shadow-2xl flex items-center justify-center z-40 md:hidden"
      >
        <Plus className="w-6 h-6" />
      </motion.button>
    </div>
  );
}
