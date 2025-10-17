// Transaction list endpoint
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { TransactionService } from '@/lib/services/transactionService';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const type = searchParams.get('type') as any;
    const status = searchParams.get('status') as any;

    const transactionService = new TransactionService();
    const result = await transactionService.getTransactionsByUser(
      authResult.user.userId,
      { limit, offset, type, status }
    );

    return NextResponse.json({
      success: true,
      transactions: result.transactions,
      total: result.total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    return NextResponse.json(
      { error: 'Failed to get transactions' },
      { status: 500 }
    );
  }
}
