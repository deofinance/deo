// JWT token utilities
import jwt from 'jsonwebtoken';

// CRITICAL: JWT_SECRET must be set in environment variables
// Validate and ensure JWT_SECRET is a string (not undefined)
function getValidatedJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      'FATAL: JWT_SECRET environment variable is required. ' +
      'Generate a secure random secret: openssl rand -base64 64'
    );
  }

  if (secret === 'default-secret-change-in-production') {
    throw new Error(
      'FATAL: JWT_SECRET is using the default value. ' +
      'This is a critical security vulnerability. ' +
      'Generate a secure random secret: openssl rand -base64 64'
    );
  }

  if (secret.length < 32) {
    console.warn(
      'WARNING: JWT_SECRET should be at least 32 characters long for security. ' +
      'Current length: ' + secret.length
    );
  }

  return secret;
}

const JWT_SECRET: string = getValidatedJwtSecret();
const JWT_EXPIRY = '7d';

export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Generate JWT token
 */
export function generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
  });
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Decode token without verification (use with caution)
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
}

/**
 * Get time until token expires (in milliseconds)
 */
export function getTokenExpiryTime(token: string): number | null {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return null;
    
    const currentTime = Math.floor(Date.now() / 1000);
    const expiresIn = decoded.exp - currentTime;
    
    return expiresIn > 0 ? expiresIn * 1000 : 0;
  } catch (error) {
    return null;
  }
}

/**
 * Check if token will expire soon (within specified hours)
 */
export function isTokenExpiringSoon(token: string, hours: number = 24): boolean {
  const expiryTime = getTokenExpiryTime(token);
  if (!expiryTime) return true;
  
  const hoursInMs = hours * 60 * 60 * 1000;
  return expiryTime < hoursInMs;
}
