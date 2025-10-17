// Get user balances across chains
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { getDatabasePool } from '@/lib/database/connection';
import { StablecoinBalance } from '@/types';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const pool = getDatabasePool();
    
    // Get all balances for user
    const result = await pool.query<StablecoinBalance>(
      `SELECT * FROM stablecoin_balances WHERE user_id = $1`,
      [authResult.user.userId]
    );
    const balances = result.rows;

    // Calculate total
    const totalBalance = balances.reduce(
      (sum, b) => sum + parseFloat(b.balance),
      0
    );

    return NextResponse.json({
      success: true,
      balances,
      total_balance: totalBalance.toFixed(2),
    });
  } catch (error) {
    console.error('Get balances error:', error);
    return NextResponse.json(
      { error: 'Failed to get balances' },
      { status: 500 }
    );
  }
}
