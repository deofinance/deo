// Authentication middleware
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader, JwtPayload } from '@/lib/utils/jwt';

export interface AuthenticatedRequest extends NextRequest {
  user?: JwtPayload;
}

/**
 * Authenticate request and attach user to request
 */
export async function authenticate(
  request: NextRequest
): Promise<{ success: boolean; user?: JwtPayload; error?: string }> {
  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return { success: false, error: 'No authentication token provided' };
  }

  try {
    const user = verifyToken(token);
    return { success: true, user };
  } catch (error) {
    return { success: false, error: 'Invalid or expired token' };
  }
}

/**
 * Require authentication middleware
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ user: JwtPayload } | NextResponse> {
  const result = await authenticate(request);

  if (!result.success || !result.user) {
    return NextResponse.json(
      { error: 'Unauthorized', message: result.error || 'Authentication required' },
      { status: 401 }
    );
  }

  return { user: result.user };
}

/**
 * Optional authentication - doesn't fail if no token
 */
export async function optionalAuth(
  request: NextRequest
): Promise<JwtPayload | null> {
  const result = await authenticate(request);
  return result.user || null;
}
