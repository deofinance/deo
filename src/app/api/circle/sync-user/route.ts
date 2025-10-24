// Sync Circle user with our database
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
    const { circleUserId, circleUserToken, provider } = await request.json();

    if (!circleUserId || !circleUserToken) {
      return NextResponse.json(
        { error: 'Circle user credentials are required' },
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

    const circleClient = initiateUserControlledWalletsClient({
      apiKey: process.env.CIRCLE_API_KEY,
    });

    // Get Circle user status
    const userStatus = await circleClient.getUserStatus({
      userToken: circleUserToken,
    });

    console.log('Circle user status:', userStatus.data);

    // Get user's wallets
    const wallets = await circleClient.listWallets({
      userToken: circleUserToken,
    });

    console.log('Circle user wallets:', wallets.data?.wallets?.length || 0);

    const primaryWallet = wallets.data?.wallets?.[0];
    const walletAddress = primaryWallet?.address || '';
    const walletSetId = primaryWallet?.walletSetId || '';

    // Sync with our database
    const userService = new UserService();
    
    // Try to find existing user by Circle ID
    let user = await userService.getUserByCircleId(circleUserId);

    if (!user) {
      // Create new user
      user = await userService.createUser({
        email: `circle-${circleUserId}@deofinance.app`, // Placeholder email
        smart_wallet_address: walletAddress,
        circle_user_id: circleUserId,
        circle_wallet_set_id: walletSetId,
        primary_auth_method: 'circle',
      });

      console.log('New Circle user created:', {
        userId: user.id,
        circleUserId,
        walletAddress,
      });
    } else {
      // Update existing user
      await userService.updateUserCircleInfo(user.id, {
        smart_wallet_address: walletAddress,
        circle_wallet_set_id: walletSetId,
      });

      console.log('Existing user updated:', {
        userId: user.id,
        circleUserId,
      });
    }

    await userService.verifyEmail(user.id);
    await userService.updateLastAuth(user.id);

    // Generate our JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      circleUserId,
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        circleUserId,
        walletAddress,
        wallets: wallets.data?.wallets || [],
        pinStatus: userStatus.data?.pinStatus,
      },
    });
  } catch (error) {
    console.error('Sync user error:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync user',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
  */
}
