// Get user cards
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { getDatabasePool } from '@/lib/database/connection';
import { UserCard } from '@/types';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const pool = getDatabasePool();
    const result = await pool.query<UserCard>(
      `SELECT * FROM user_cards 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [authResult.user.userId]
    );
    const cards = result.rows;

    return NextResponse.json({
      success: true,
      cards,
    });
  } catch (error) {
    console.error('Get cards error:', error);
    return NextResponse.json(
      { error: 'Failed to get cards' },
      { status: 500 }
    );
  }
}
