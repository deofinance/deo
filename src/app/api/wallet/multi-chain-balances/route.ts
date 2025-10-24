/**
 * Multi-Chain Balances API
 * Fetches USDC balances across all supported chains
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { getDatabasePool } from '@/lib/database/connection';
import { type ChainId } from '@/types';

// Chain configuration
const SUPPORTED_CHAINS: Array<{
  chainId: ChainId;
  chainName: string;
  isLayer2: boolean;
  rpcUrl: string;
  usdcAddress: string;
}> = [
  {
    chainId: '1',
    chainName: 'Ethereum',
    isLayer2: false,
    rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/',
    usdcAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  },
  {
    chainId: '137',
    chainName: 'Polygon',
    isLayer2: true,
    rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-mainnet.g.alchemy.com/v2/',
    usdcAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
  },
  {
    chainId: '42161',
    chainName: 'Arbitrum',
    isLayer2: true,
    rpcUrl: process.env.ARBITRUM_RPC_URL || 'https://arb-mainnet.g.alchemy.com/v2/',
    usdcAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  },
  {
    chainId: '10',
    chainName: 'Optimism',
    isLayer2: true,
    rpcUrl: process.env.OPTIMISM_RPC_URL || 'https://opt-mainnet.g.alchemy.com/v2/',
    usdcAddress: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
  },
  {
    chainId: '56',
    chainName: 'BSC',
    isLayer2: false,
    rpcUrl: process.env.BSC_RPC_URL || 'https://bsc-dataseed1.binance.org',
    usdcAddress: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
  },
];

/**
 * ERC-20 balanceOf function signature
 */
const BALANCE_OF_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
];

/**
 * Fetch balance for a specific chain
 */
async function fetchChainBalance(
  walletAddress: string,
  chain: typeof SUPPORTED_CHAINS[0]
): Promise<{
  chainId: ChainId;
  chainName: string;
  token: 'USDC';
  balance: string;
  balanceUSD: number;
  isLayer2: boolean;
  lastUpdated: string;
} | null> {
  try {
    // In production, use ethers.js or web3.js to query the blockchain
    // For now, we'll return mock data
    
    // Mock balance (in production, this would be a real blockchain call)
    const mockBalance = Math.random() * 10000;
    const balanceFormatted = mockBalance.toFixed(2);

    return {
      chainId: chain.chainId,
      chainName: chain.chainName,
      token: 'USDC',
      balance: balanceFormatted,
      balanceUSD: mockBalance,
      isLayer2: chain.isLayer2,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Failed to fetch balance for ${chain.chainName}:`, error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate request
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { user: jwtPayload } = authResult;
    
    // Fetch user from database to get wallet address
    const pool = getDatabasePool();
    const userQuery = await pool.query(
      'SELECT smart_wallet_address FROM users WHERE id = $1',
      [jwtPayload.userId]
    );
    
    if (userQuery.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const walletAddress = userQuery.rows[0].smart_wallet_address;

    if (!walletAddress) {
      return NextResponse.json({ error: 'No wallet address found' }, { status: 400 });
    }

    // Fetch balances for all chains in parallel
    const balancePromises = SUPPORTED_CHAINS.map((chain) =>
      fetchChainBalance(walletAddress, chain)
    );

    const results = await Promise.all(balancePromises);
    const balances = results.filter((b) => b !== null);

    return NextResponse.json({
      success: true,
      walletAddress,
      balances,
      totalChains: balances.length,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Multi-chain balance fetch error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch balances',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
