// Stripe webhook handler
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { getDatabasePool } from '@/lib/database/connection';

export async function POST(request: NextRequest) {
  try {
    // Initialize Stripe inside the function to avoid build-time errors
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-02-24.acacia',
    });

    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );

    const pool = getDatabasePool();

    switch (event.type) {
      case 'issuing_authorization.created': {
        const authorization = event.data.object as Stripe.Issuing.Authorization;
        console.log('Card authorization:', authorization.id);
        // Handle authorization - can approve/decline here
        break;
      }

      case 'issuing_transaction.created': {
        const transaction = event.data.object as Stripe.Issuing.Transaction;
        
        // Find card in database
        const cardResult = await pool.query(
          'SELECT * FROM user_cards WHERE stripe_card_id = $1',
          [transaction.card]
        );
        const card = cardResult.rows[0];

        if (card) {
          // Record card transaction
          await pool.query(
            `INSERT INTO card_transactions (
              card_id,
              user_id,
              merchant_name,
              merchant_category,
              amount,
              currency,
              status,
              transaction_date
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, now())`,
            [
              card.id,
              card.user_id,
              transaction.merchant_data?.name || 'Unknown',
              transaction.merchant_data?.category || 'other',
              Math.abs(transaction.amount) / 100,
              'USDC',
              'completed',
            ]
          );
        }
        break;
      }

      case 'issuing_card.created': {
        const card = event.data.object as Stripe.Issuing.Card;
        console.log('Card created:', card.id);
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    );
  }
}
