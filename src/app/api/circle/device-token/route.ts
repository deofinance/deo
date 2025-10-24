// Create device token for Circle authentication
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
}
