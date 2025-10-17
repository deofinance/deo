import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, RATE_LIMITS } from '@/lib/middleware/rateLimit';
import { getDatabasePool } from '@/lib/database/connection';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await rateLimit(
      `waitlist:${ip}`,
      { windowMs: 60 * 60 * 1000, maxRequests: 3 } // 3 requests per hour
    );

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Please try again later',
        },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, email } = body;

    // Validate input
    if (!name || !email) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Name and email are required',
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Invalid email address',
        },
        { status: 400 }
      );
    }

    // Get database connection
    const pool = getDatabasePool();
    const client = await pool.connect();

    try {
      // Check if email already exists
      const existingEntry = await client.query(
        'SELECT id FROM waitlist WHERE email = $1',
        [email.toLowerCase()]
      );

      if (existingEntry.rows.length > 0) {
        return NextResponse.json(
          {
            error: 'Already registered',
            message: "You're already on the waitlist!",
          },
          { status: 400 }
        );
      }

      // Insert into waitlist
      await client.query(
        `INSERT INTO waitlist (name, email, created_at, metadata)
         VALUES ($1, $2, NOW(), $3)`,
        [
          name.trim(),
          email.toLowerCase().trim(),
          JSON.stringify({
            ip,
            userAgent: request.headers.get('user-agent'),
            referrer: request.headers.get('referer'),
          }),
        ]
      );
    } finally {
      client.release();
    }

    console.log('New waitlist signup:', { name, email });

    return NextResponse.json({
      success: true,
      message: "You've been added to the waitlist!",
    });
  } catch (error) {
    console.error('Waitlist signup error:', error);
    return NextResponse.json(
      {
        error: 'Server error',
        message: 'Failed to join waitlist. Please try again.',
      },
      { status: 500 }
    );
  }
}

// Get waitlist count (optional, for admin dashboard later)
export async function GET() {
  try {
    const pool = getDatabasePool();
    const result = await pool.query('SELECT COUNT(*) as count FROM waitlist');
    const count = parseInt(result.rows[0]?.count || '0');

    return NextResponse.json({
      count,
      message: `${count} people on the waitlist`,
    });
  } catch (error) {
    console.error('Waitlist count error:', error);
    return NextResponse.json(
      {
        error: 'Server error',
        message: 'Failed to get waitlist count',
      },
      { status: 500 }
    );
  }
}
