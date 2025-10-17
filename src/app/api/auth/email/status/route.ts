// Check if email authentication is available
import { NextResponse } from 'next/server';

export async function GET() {
  const isConfigured = !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_USERNAME &&
    process.env.SMTP_PASSWORD
  );

  return NextResponse.json({
    enabled: isConfigured,
    message: isConfigured
      ? 'Email authentication is available'
      : 'Email authentication is not configured. Please use Google login.',
  });
}
