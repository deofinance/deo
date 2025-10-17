// Health check endpoint
import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/database/connection';

export async function GET() {
  try {
    const dbHealthy = await testConnection();

    const checks = {
      database: {
        status: dbHealthy ? 'ok' : 'error',
      },
      server: {
        status: 'ok',
      },
    };

    const healthy = Object.values(checks).every((check) => check.status === 'ok');

    return NextResponse.json(
      {
        status: healthy ? 'healthy' : 'degraded',
        checks,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      },
      { status: healthy ? 200 : 503 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
