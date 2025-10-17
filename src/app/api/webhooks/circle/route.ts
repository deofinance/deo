// Circle webhook handler
import { NextRequest, NextResponse } from 'next/server';
import { TransactionService } from '@/lib/services/transactionService';
import { BalanceService } from '@/lib/services/balanceService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // TODO: Verify Circle webhook signature

    const { eventType, data } = body;

    switch (eventType) {
      case 'wallet.created': {
        console.log('Wallet created:', data.walletId);
        // Wallet creation is handled in the auth flow
        break;
      }

      case 'transaction.confirmed': {
        const { transactionId, txHash, status } = data;
        
        // Update transaction status
        const transactionService = new TransactionService();
        const tx = await transactionService.getTransactionByHash(txHash);
        
        if (tx) {
          await transactionService.updateTransactionStatus(
            tx.id,
            status === 'confirmed' ? 'completed' : 'failed',
            txHash
          );
        }
        break;
      }

      case 'transfer.completed': {
        const { walletId, amount, tokenId } = data;
        
        // Update balance
        // Note: In production, you'd fetch the actual balance from Circle
        console.log('Transfer completed:', { walletId, amount, tokenId });
        break;
      }

      default:
        console.log('Unhandled Circle event:', eventType);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Circle webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
