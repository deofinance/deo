// Blockchain constants and contract addresses
import { ChainId } from '@/types';

export const CHAIN_NAMES: Record<ChainId, string> = {
  '1': 'Ethereum',
  '137': 'Polygon',
  '42161': 'Arbitrum',
  '10': 'Optimism',
  '56': 'BSC',
};

export const CHAIN_EXPLORERS: Record<ChainId, string> = {
  '1': 'https://etherscan.io',
  '137': 'https://polygonscan.com',
  '42161': 'https://arbiscan.io',
  '10': 'https://optimistic.etherscan.io',
  '56': 'https://bscscan.com',
};

export const USDC_ADDRESSES: Record<ChainId, string> = {
  '1': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  '137': '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  '42161': '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
  '10': '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
  '56': '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
};

export const USDC_DECIMALS = 6;

export const RPC_URLS: Record<ChainId, string> = {
  '1': `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  '137': `https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  '42161': `https://arb-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  '10': `https://opt-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  '56': 'https://bsc-dataseed1.binance.org',
};

export const NATIVE_TOKENS: Record<ChainId, string> = {
  '1': 'ETH',
  '137': 'MATIC',
  '42161': 'ETH',
  '10': 'ETH',
  '56': 'BNB',
};

// Circle blockchain identifiers
export const CIRCLE_BLOCKCHAIN_IDS: Record<ChainId, string> = {
  '1': 'ETH',
  '137': 'MATIC',
  '42161': 'ARB',
  '10': 'OP',
  '56': 'BSC',
};
