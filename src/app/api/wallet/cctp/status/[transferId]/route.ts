/**
 * CCTP Transfer Status API
 * Get status of cross-chain transfer
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ transferId: string }> }
) {
  try {
    // Authenticate request
    const authResult = await requireAuth(request);
    
    // If authResult is a NextResponse, it means authentication failed
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // In Next.js 15, params is a Promise and must be awaited
    const params = await props.params;
    const { transferId } = params;

    if (!transferId) {
      return NextResponse.json({ error: 'Transfer ID required' }, { status: 400 });
    }

    // In production, this would query Circle's attestation service
    // and check blockchain confirmations
    
    // Mock status - in reality this would change based on actual transfer progress
    const mockStatuses = ['pending', 'attested', 'completed'] as const;
    const status = mockStatuses[Math.min(2, Math.floor(Date.now() / 10000) % 3)];

    const response = {
      transferId,
      status,
      attestation: status === 'attested' || status === 'completed' 
        ? `0x${Math.random().toString(16).substr(2, 128)}` 
        : undefined,
      destinationTxHash: status === 'completed'
        ? `0x${Math.random().toString(16).substr(2, 64)}`
        : undefined,
      estimatedCompletion: status === 'pending' || status === 'attested'
        ? new Date(Date.now() + 600000).toISOString()
        : undefined,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('CCTP status check error:', error);
    return NextResponse.json(
      {
        error: 'Failed to check transfer status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
