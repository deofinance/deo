// Simple in-memory OTP cache
// For production, use Redis or database

interface OTPEntry {
  code: string;
  email: string;
  expiresAt: number;
  attempts: number;
}

class OTPCache {
  private cache: Map<string, OTPEntry> = new Map();
  private readonly MAX_ATTEMPTS = 5;
  private readonly EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

  /**
   * Generate a 6-digit OTP code
   */
  generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Store OTP for an email
   */
  set(email: string, code: string): void {
    this.cache.set(email.toLowerCase(), {
      code,
      email,
      expiresAt: Date.now() + this.EXPIRY_MS,
      attempts: 0,
    });
  }

  /**
   * Verify OTP code for an email
   */
  verify(email: string, code: string): { valid: boolean; error?: string } {
    const normalizedEmail = email.toLowerCase();
    const entry = this.cache.get(normalizedEmail);

    if (!entry) {
      return { valid: false, error: 'No verification code found. Please request a new one.' };
    }

    // Check expiry
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(normalizedEmail);
      return { valid: false, error: 'Verification code has expired. Please request a new one.' };
    }

    // Check max attempts
    if (entry.attempts >= this.MAX_ATTEMPTS) {
      this.cache.delete(normalizedEmail);
      return { valid: false, error: 'Too many failed attempts. Please request a new code.' };
    }

    // Increment attempts
    entry.attempts++;

    // Verify code
    if (entry.code !== code) {
      return { valid: false, error: 'Invalid verification code. Please try again.' };
    }

    // Success - remove from cache
    this.cache.delete(normalizedEmail);
    return { valid: true };
  }

  /**
   * Check if email has a valid OTP (for rate limiting)
   */
  has(email: string): boolean {
    const entry = this.cache.get(email.toLowerCase());
    if (!entry) return false;
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(email.toLowerCase());
      return false;
    }
    
    return true;
  }

  /**
   * Delete OTP for an email
   */
  delete(email: string): void {
    this.cache.delete(email.toLowerCase());
  }

  /**
   * Clean up expired entries (call periodically)
   */
  cleanup(): void {
    const now = Date.now();
    for (const [email, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(email);
      }
    }
  }
}

// Export singleton instance
export const otpCache = new OTPCache();

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    otpCache.cleanup();
  }, 5 * 60 * 1000);
}
