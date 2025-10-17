// Send OTP to email
import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/services/emailService';
import { otpCache } from '@/lib/utils/otpCache';
import { validateBody, emailSchema } from '@/lib/middleware/validation';
import { rateLimit, RATE_LIMITS } from '@/lib/middleware/rateLimit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await rateLimit(
      `send-code:${ip}`,
      RATE_LIMITS.auth
    );

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Please wait before requesting another code',
          resetTime: rateLimitResult.resetTime,
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = await validateBody(body, emailSchema);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const { email } = validation.data!;

    // Check if SMTP is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USERNAME || !process.env.SMTP_PASSWORD) {
      console.warn('SMTP not configured. Email OTP will not work. Please set SMTP_HOST, SMTP_USERNAME, and SMTP_PASSWORD environment variables.');
      return NextResponse.json(
        {
          error: 'Email service not configured',
          message: 'Please contact support or use Google login instead.',
        },
        { status: 503 }
      );
    }

    // Generate OTP code
    const code = otpCache.generateCode();
    otpCache.set(email, code);

    console.log(`Generated OTP for ${email}: ${code} (DEV ONLY LOG)`);

    // Send OTP via Email
    try {
      const emailService = new EmailService();
      await emailService.sendOTPEmail(email, code);
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // For development, still return success if OTP is generated
      // In production, you'd want to return an error
      if (process.env.NODE_ENV === 'production') {
        throw emailError;
      } else {
        console.warn('DEV MODE: Email send failed but OTP is cached. Code:', code);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to email',
      // Include code in dev mode for testing
      ...(process.env.NODE_ENV !== 'production' && { devCode: code }),
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send verification code',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
