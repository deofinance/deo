// Initialize Circle user and create wallet
// TEMPORARILY DISABLED - Circle SDK integration pending
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Temporarily disabled until Circle SDK is properly configured
  return NextResponse.json(
    { 
      error: 'Circle SDK integration pending',
      message: 'This endpoint will be available when Circle Web SDK is fully integrated'
    },
    { status: 503 }
  );
  
  /* DISABLED CODE - Re-enable when Circle SDK is ready
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
