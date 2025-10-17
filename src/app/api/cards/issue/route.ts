// Issue a card
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { validateBody, issueCardSchema } from '@/lib/middleware/validation';
import { StripeService } from '@/lib/services/stripeService';
import { getDatabasePool } from '@/lib/database/connection';

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const validation = await validateBody(body, issueCardSchema);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const { type, currency, spending_limits } = validation.data!;

    // Get cardholder ID from request or database
    const cardholderId = body.cardholder_id;
    if (!cardholderId) {
      return NextResponse.json(
        { error: 'Cardholder ID required' },
        { status: 400 }
      );
    }

    // Issue card via Stripe
    const stripeService = new StripeService();
    const limits = spending_limits
      ? [
          ...(spending_limits.daily
            ? [{ amount: spending_limits.daily * 100, interval: 'daily' as const }]
            : []),
          ...(spending_limits.monthly
            ? [{ amount: spending_limits.monthly * 100, interval: 'monthly' as const }]
            : []),
        ]
      : undefined;

    const stripeCard = await stripeService.issueCard({
      cardholderId,
      type,
      currency,
      spendingLimits: limits,
    });

    // Store card in database
    const pool = getDatabasePool();
    const result = await pool.query(
      `INSERT INTO user_cards (
        user_id,
        card_type,
        card_status,
        last_four_digits,
        expiry_month,
        expiry_year,
        cardholder_name,
        currency,
        stripe_card_id,
        stripe_cardholder_id,
        issued_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now())
      RETURNING *`,
      [
        authResult.user.userId,
        type,
        'active',
        stripeCard.last4,
        stripeCard.exp_month,
        stripeCard.exp_year,
        stripeCard.cardholder.name,
        currency.toUpperCase(),
        stripeCard.id,
        cardholderId,
      ]
    );
    const card = result.rows[0];

    return NextResponse.json({
      success: true,
      card: {
        id: card.id,
        type: card.card_type,
        last_four: card.last_four_digits,
        expiry_month: card.expiry_month,
        expiry_year: card.expiry_year,
        status: card.card_status,
      },
    });
  } catch (error) {
    console.error('Issue card error:', error);
    return NextResponse.json(
      {
        error: 'Failed to issue card',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
