// Get Circle wallet balance
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { BalanceService } from '@/lib/services/balanceService';
import { UserService } from '@/lib/services/userService';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const userService = new UserService();
    const balanceService = new BalanceService();

    // Get user data
    const user = await userService.getUserById(authResult.user.userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get total balance across all chains
    const totalBalanceStr = await balanceService.getTotalBalance(user.id);
    const totalBalance = parseFloat(totalBalanceStr);

    return NextResponse.json({
      balance: totalBalance.toFixed(2),
      address: user.smart_wallet_address,
      circleUserId: user.circle_user_id,
    });
  } catch (error) {
    console.error('Balance fetch error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch balance',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
