/**
 * Circle CCTP V2 Service
 * Cross-Chain Transfer Protocol V2 integration
 * Enables native USDC transfers across chains
 */

import { ChainId } from '@/types';

export interface CCTPTransferRequest {
  amount: string;
  sourceChainId: ChainId;
  destinationChainId: ChainId;
  destinationAddress: string;
  userToken: string;
}

export interface CCTPDomain {
  chainId: ChainId;
  domain: number;
  tokenMessengerAddress: string;
  messageTransmitterAddress: string;
  usdcAddress: string;
}

export class CCTPService {
  // CCTP V2 Domain mappings for production
  private readonly CCTP_DOMAINS: Record<ChainId, CCTPDomain> = {
    '1': {
      chainId: '1',
      domain: 0,
      tokenMessengerAddress: '0xBd3fa81B58Ba92a82136038B25aDec7066af3155',
      messageTransmitterAddress: '0x0a992d191DEeC32aFe36203Ad87D7d289a738F81',
      usdcAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    },
    '137': {
      chainId: '137',
      domain: 7,
      tokenMessengerAddress: '0x9daF8c91AEFAE50b9c0E69629D3F6Ca40cA3B3FE',
      messageTransmitterAddress: '0xF3be9355363857F3e001be68856A2f96b4C39Ba9',
      usdcAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
    },
    '42161': {
      chainId: '42161',
      domain: 3,
      tokenMessengerAddress: '0x19330d10D9Cc8751218eaf51E8885D058642E08A',
      messageTransmitterAddress: '0xC30362313FBBA5cf9163F0bb16a0e01f01A896ca',
      usdcAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    },
    '10': {
      chainId: '10',
      domain: 2,
      tokenMessengerAddress: '0x2B4069517957735bE00ceE0fadAE5d71A34e3556',
      messageTransmitterAddress: '0x4D41f22c5a0e5c74090899E5a8Fb597a8842b3e8',
      usdcAddress: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
    },
    '56': {
      chainId: '56',
      domain: 6,
      tokenMessengerAddress: '0x0000000000000000000000000000000000000000',
      messageTransmitterAddress: '0x0000000000000000000000000000000000000000',
      usdcAddress: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    },
  };

  /**
   * Get CCTP domain info for a chain
   */
  getDomainInfo(chainId: ChainId): CCTPDomain | null {
    return this.CCTP_DOMAINS[chainId] || null;
  }

  /**
   * Check if CCTP is supported between two chains
   */
  isCCTPSupported(sourceChainId: ChainId, destChainId: ChainId): boolean {
    const sourceDomain = this.CCTP_DOMAINS[sourceChainId];
    const destDomain = this.CCTP_DOMAINS[destChainId];
    
    return !!(
      sourceDomain &&
      destDomain &&
      sourceDomain.tokenMessengerAddress !== '0x0000000000000000000000000000000000000000' &&
      destDomain.tokenMessengerAddress !== '0x0000000000000000000000000000000000000000'
    );
  }

  /**
   * Estimate transfer time
   */
  estimateTransferTime(sourceChainId: ChainId, destChainId: ChainId): string {
    // CCTP transfers typically take 10-20 minutes
    return '10-20 minutes';
  }

  /**
   * Calculate estimated fees
   */
  estimateFees(amount: string, sourceChainId: ChainId): {
    gasFee: string;
    protocolFee: string;
    total: string;
  } {
    // Placeholder - actual fees would be calculated based on gas prices
    const gasFee = '0.50'; // USD
    const protocolFee = '0.00'; // CCTP has no protocol fee
    const total = gasFee;

    return {
      gasFee,
      protocolFee,
      total,
    };
  }

  /**
   * Get supported chain pairs for CCTP
   */
  getSupportedChainPairs(): Array<{
    source: ChainId;
    destination: ChainId;
    sourceName: string;
    destName: string;
  }> {
    const pairs: Array<{
      source: ChainId;
      destination: ChainId;
      sourceName: string;
      destName: string;
    }> = [];

    const chainNames: Record<ChainId, string> = {
      '1': 'Ethereum',
      '137': 'Polygon',
      '42161': 'Arbitrum',
      '10': 'Optimism',
      '56': 'BSC',
    };

    const supportedChains: ChainId[] = ['1', '137', '42161', '10'];

    for (const source of supportedChains) {
      for (const dest of supportedChains) {
        if (source !== dest && this.isCCTPSupported(source, dest)) {
          pairs.push({
            source,
            destination: dest,
            sourceName: chainNames[source],
            destName: chainNames[dest],
          });
        }
      }
    }

    return pairs;
  }

  /**
   * Format amount for CCTP (USDC has 6 decimals)
   */
  formatAmount(amount: string): string {
    const num = parseFloat(amount);
    if (isNaN(num)) return '0';
    
    // Convert to USDC decimals (6)
    return (num * 1e6).toFixed(0);
  }

  /**
   * Parse amount from CCTP format
   */
  parseAmount(amount: string): string {
    const num = parseFloat(amount);
    if (isNaN(num)) return '0';
    
    // Convert from USDC decimals (6)
    return (num / 1e6).toFixed(2);
  }
}

// Singleton instance
export const cctpService = new CCTPService();
