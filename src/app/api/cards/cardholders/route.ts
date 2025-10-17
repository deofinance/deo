// Create Stripe cardholder
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { validateBody, createCardholderSchema } from '@/lib/middleware/validation';
import { StripeService } from '@/lib/services/stripeService';

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const validation = await validateBody(body, createCardholderSchema);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const { name, email, phone_number, billing_address } = validation.data!;

    const stripeService = new StripeService();
    const cardholder = await stripeService.createCardholder({
      name,
      email,
      phoneNumber: phone_number,
      address: billing_address,
    });

    return NextResponse.json({
      success: true,
      cardholder_id: cardholder.id,
      name: cardholder.name,
      email: cardholder.email,
      status: cardholder.status,
    });
  } catch (error) {
    console.error('Create cardholder error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create cardholder',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
