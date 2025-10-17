// Initialize Circle user and create wallet
// TODO: Complete Circle frontend integration before enabling this endpoint
import { NextRequest, NextResponse } from 'next/server';
// import { initiateUserControlledWalletsClient } from '@circle-fin/user-controlled-wallets';

export async function POST(request: NextRequest) {
  // Temporarily disabled - Circle frontend integration pending
  return NextResponse.json(
    { 
      error: 'Circle integration not yet complete',
      message: 'This endpoint will be available when Circle Web SDK is integrated'
    },
    { status: 503 }
  );

  /* TODO: Uncomment when Circle frontend integration is complete
  try {
    const { userToken, accountType = 'SCA', blockchains } = await request.json();

    if (!userToken) {
      return NextResponse.json(
        { error: 'User token is required' },
        { status: 400 }
      );
    }

    if (!process.env.CIRCLE_API_KEY) {
      console.error('CIRCLE_API_KEY not configured');
      return NextResponse.json(
        { error: 'Circle API not configured' },
        { status: 503 }
      );
    }

    // Default blockchains for development (testnets)
    const defaultBlockchains = process.env.NODE_ENV === 'production'
      ? ['ETH-MAINNET', 'MATIC-MAINNET']
      : ['ETH-SEPOLIA', 'MATIC-AMOY'];

    const circleClient = initiateUserControlledWalletsClient({
      apiKey: process.env.CIRCLE_API_KEY,
    });

    // Initialize user and create wallet
    const response = await circleClient.createUserPinWithWallets({
      userToken,
      accountType,
      blockchains: blockchains || defaultBlockchains,
    });

    if (!response.data) {
      throw new Error('No data returned from Circle');
    }

    console.log('User initialized with challenge:', response.data.challengeId);

    return NextResponse.json({
      challengeId: response.data.challengeId,
      success: true,
    });
  } catch (error) {
    console.error('Initialize user error:', error);
    return NextResponse.json(
      {
        error: 'Failed to initialize user',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
  */
}
