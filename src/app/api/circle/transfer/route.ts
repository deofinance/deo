// Transfer USDC
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { validateBody, transferSchema } from '@/lib/middleware/validation';
import { CircleService } from '@/lib/services/circleService';
import { TransactionService } from '@/lib/services/transactionService';
import { rateLimit, RATE_LIMITS } from '@/lib/middleware/rateLimit';

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(
      `transfer:${authResult.user.userId}`,
      RATE_LIMITS.api
    );

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Please wait before making another transfer',
        },
        { status: 429 }
      );
    }

    // Validate request body
    const body = await request.json();
    const validation = await validateBody(body, transferSchema);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const { recipient, amount, chain_id, stablecoin } = validation.data!;

    // Get user token from request (should be sent by client)
    const userToken = request.headers.get('x-circle-user-token');
    if (!userToken) {
      return NextResponse.json(
        { error: 'Circle user token required' },
        { status: 400 }
      );
    }

    // Create transaction record
    const transactionService = new TransactionService();
    const transaction = await transactionService.createTransaction({
      user_id: authResult.user.userId,
      transaction_type: 'transfer',
      amount,
      stablecoin,
      chain_id,
      to_address: recipient,
      description: `Transfer ${amount} ${stablecoin} to ${recipient}`,
    });

    // Initiate transfer via Circle
    const circleService = new CircleService();
    
    // Note: This is simplified. In production, you'd need to:
    // 1. Get the wallet ID from database
    // 2. Convert chain_id to Circle blockchain format
    // 3. Get the token ID for USDC
    const result = await circleService.initiateTransfer({
      userToken,
      walletId: 'wallet-id', // Get from DB
      destinationAddress: recipient,
      amount,
      tokenId: 'usdc-token-id',
      blockchain: 'ETH-SEPOLIA', // Map from chain_id
    });

    // Update transaction with challenge ID
    await transactionService.updateTransactionStatus(
      transaction.id,
      'pending'
    );

    return NextResponse.json({
      success: true,
      transaction_id: transaction.id,
      challenge_id: result.challengeId,
      status: result.status,
    });
  } catch (error) {
    console.error('Transfer error:', error);
    return NextResponse.json(
      {
        error: 'Transfer failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
