// Verify OTP and authenticate user
import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/services/userService';
import { otpCache } from '@/lib/utils/otpCache';
import { validateBody, otpSchema } from '@/lib/middleware/validation';
import { generateToken } from '@/lib/utils/jwt';
import { rateLimit, RATE_LIMITS } from '@/lib/middleware/rateLimit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await rateLimit(
      `verify-code:${ip}`,
      RATE_LIMITS.auth
    );

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Please wait before trying again',
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = await validateBody(body, otpSchema);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const { email, code } = validation.data!;

    // Verify OTP from cache
    const verifyResult = otpCache.verify(email, code);
    
    if (!verifyResult.valid) {
      console.error('OTP verification failed:', verifyResult.error);
      return NextResponse.json(
        {
          error: 'Verification failed',
          message: verifyResult.error || 'Invalid or expired code',
        },
        { status: 400 }
      );
    }

    // Get or create user
    const userService = new UserService();
    let user = await userService.getUserByEmail(email);

    if (!user) {
      // Create user with placeholder wallet address
      // Actual wallet will be created when user first needs it
      const placeholderAddress = `pending-${Date.now()}-${email.substring(0, 10)}`;

      user = await userService.createUser({
        email,
        smart_wallet_address: placeholderAddress,
        primary_auth_method: 'email',
      });

      // Verify email
      await userService.verifyEmail(user.id);
      
      console.log('New email user created:', {
        userId: user.id,
        email: user.email,
      });
    } else {
      console.log('Existing email user logged in:', {
        userId: user.id,
        email: user.email,
      });
    }

    // Update last auth time
    await userService.updateLastAuth(user.id);

    // Generate JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        smart_wallet_address: user.smart_wallet_address,
        first_name: user.first_name,
        last_name: user.last_name,
        kyc_status: user.kyc_status,
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      {
        error: 'Verification failed',
        message: error instanceof Error ? error.message : 'Invalid or expired code',
      },
      { status: 400 }
    );
  }
}
