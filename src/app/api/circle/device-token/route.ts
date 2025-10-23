// Create device token for Circle authentication
// Note: Device tokens are now generated on the frontend by the Circle SDK
// This endpoint is kept for backward compatibility but returns success immediately
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { deviceId } = await request.json();

    if (!deviceId) {
      return NextResponse.json(
        { error: 'Device ID is required' },
        { status: 400 }
      );
    }

    // Device tokens are handled by the frontend SDK
    // Just confirm the configuration is ready
    if (!process.env.NEXT_PUBLIC_CIRCLE_APP_ID) {
      return NextResponse.json(
        { error: 'Circle not configured' },
        { status: 503 }
      );
    }

    console.log('Device ID registered:', deviceId);

    return NextResponse.json({
      success: true,
      message: 'Device registered successfully',
      deviceId,
    });
  } catch (error) {
    console.error('Device registration error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to register device',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
