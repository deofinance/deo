// Create device token for Circle authentication
// TODO: Complete Circle frontend integration before enabling this endpoint
import { NextRequest, NextResponse } from 'next/server';
// import { initiateUserControlledWalletsClient } from '@circle-fin/user-controlled-wallets';

export async function POST(request: NextRequest) {
  try {
    // Temporarily disabled - Circle frontend integration pending
    return NextResponse.json(
      { 
        error: 'Circle integration not yet complete',
        message: 'This endpoint will be available when Circle Web SDK is integrated'
      },
      { status: 503 }
    );

    /* TODO: Uncomment when Circle frontend integration is complete
    const { deviceId } = await request.json();

    if (!deviceId) {
      return NextResponse.json(
        { error: 'Device ID is required' },
        { status: 400 }
      );
    }

    // Check if Circle API key is configured
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

    const response = await circleClient.createDeviceTokenForSocialLogin({
      deviceId,
    });

    if (!response.data) {
      throw new Error('No data returned from Circle');
    }

    console.log('Device token created for device:', deviceId);

    return NextResponse.json({
      deviceToken: response.data.deviceToken,
      deviceEncryptionKey: response.data.deviceEncryptionKey,
    });
    */
  } catch (error) {
    console.error('Device token creation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create device token',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
