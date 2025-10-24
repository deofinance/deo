/**
 * Circle Wallet Utilities
 * Helper functions for Circle SCA wallet management
 */

/**
 * Initialize Circle user and create SCA wallet
 * Call this after successful login to ensure user has a wallet
 */
export async function initializeCircleWallet(
  userToken: string,
  accountType: 'SCA' | 'EOA' = 'SCA',
  blockchains?: string[]
): Promise<{ challengeId: string; success: boolean }> {
  try {
    const response = await fetch('/api/circle/initialize-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userToken,
        accountType,
        blockchains,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to initialize wallet');
    }

    return data;
  } catch (error) {
    console.error('Wallet initialization error:', error);
    throw error;
  }
}

/**
 * Sync Circle user with DEO backend
 * Creates/updates user record and fetches wallet info
 */
export async function syncCircleUser(
  circleUserId: string,
  circleUserToken: string
): Promise<{
  token: string;
  user: any;
  wallets: any[];
}> {
  try {
    const response = await fetch('/api/circle/sync-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        circleUserId,
        circleUserToken,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to sync user');
    }

    return data;
  } catch (error) {
    console.error('User sync error:', error);
    throw error;
  }
}

/**
 * Create device token for Circle authentication
 */
export async function createDeviceToken(deviceId: string): Promise<{
  deviceToken: string;
  deviceEncryptionKey: string;
}> {
  try {
    const response = await fetch('/api/circle/device-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create device token');
    }

    return data;
  } catch (error) {
    console.error('Device token error:', error);
    throw error;
  }
}

/**
 * Get Circle credentials from localStorage
 */
export function getCircleCredentials(): {
  userToken: string | null;
  userId: string | null;
  encryptionKey: string | null;
  deviceToken: string | null;
  deviceEncryptionKey: string | null;
} {
  if (typeof window === 'undefined') {
    return {
      userToken: null,
      userId: null,
      encryptionKey: null,
      deviceToken: null,
      deviceEncryptionKey: null,
    };
  }

  return {
    userToken: localStorage.getItem('circle_user_token'),
    userId: localStorage.getItem('circle_user_id'),
    encryptionKey: localStorage.getItem('circle_encryption_key'),
    deviceToken: localStorage.getItem('circle_device_token'),
    deviceEncryptionKey: localStorage.getItem('circle_device_encryption_key'),
  };
}

/**
 * Store Circle credentials in localStorage
 */
export function storeCircleCredentials(credentials: {
  userToken?: string;
  userId?: string;
  encryptionKey?: string;
  deviceToken?: string;
  deviceEncryptionKey?: string;
  refreshToken?: string;
}): void {
  if (typeof window === 'undefined') return;

  if (credentials.userToken) {
    localStorage.setItem('circle_user_token', credentials.userToken);
  }
  if (credentials.userId) {
    localStorage.setItem('circle_user_id', credentials.userId);
  }
  if (credentials.encryptionKey) {
    localStorage.setItem('circle_encryption_key', credentials.encryptionKey);
  }
  if (credentials.deviceToken) {
    localStorage.setItem('circle_device_token', credentials.deviceToken);
  }
  if (credentials.deviceEncryptionKey) {
    localStorage.setItem('circle_device_encryption_key', credentials.deviceEncryptionKey);
  }
  if (credentials.refreshToken) {
    localStorage.setItem('circle_refresh_token', credentials.refreshToken);
  }
}

/**
 * Clear Circle credentials from localStorage
 */
export function clearCircleCredentials(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('circle_user_token');
  localStorage.removeItem('circle_user_id');
  localStorage.removeItem('circle_encryption_key');
  localStorage.removeItem('circle_device_token');
  localStorage.removeItem('circle_device_encryption_key');
  localStorage.removeItem('circle_refresh_token');
}

/**
 * Check if user has valid Circle credentials
 */
export function hasCircleCredentials(): boolean {
  const credentials = getCircleCredentials();
  return !!(credentials.userToken && credentials.userId);
}

/**
 * Format blockchain name for Circle API
 */
export function formatBlockchainName(
  chainId: string,
  environment: 'testnet' | 'mainnet' = 'testnet'
): string {
  const chainMap: Record<string, { testnet: string; mainnet: string }> = {
    '1': { testnet: 'ETH-SEPOLIA', mainnet: 'ETH-MAINNET' },
    '11155111': { testnet: 'ETH-SEPOLIA', mainnet: 'ETH-MAINNET' },
    '137': { testnet: 'MATIC-AMOY', mainnet: 'MATIC-MAINNET' },
    '80002': { testnet: 'MATIC-AMOY', mainnet: 'MATIC-MAINNET' },
  };

  return chainMap[chainId]?.[environment] || 'ETH-SEPOLIA';
}

/**
 * Get supported blockchains based on environment
 */
export function getSupportedBlockchains(
  environment: 'testnet' | 'mainnet' = 'testnet'
): string[] {
  if (environment === 'mainnet') {
    return ['ETH-MAINNET', 'MATIC-MAINNET'];
  }
  return ['ETH-SEPOLIA', 'MATIC-AMOY'];
}

/**
 * Complete Circle login flow
 * Handles device token creation and social login
 */
export async function completeCircleLogin(
  sdk: any,
  deviceId: string,
  provider: 'google' | 'facebook' | 'apple'
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Create device token
    const deviceTokens = await createDeviceToken(deviceId);
    storeCircleCredentials(deviceTokens);

    // 2. Perform social login
    await sdk.performLogin({ provider });

    // 3. Get credentials from localStorage (set by SDK callback)
    const credentials = getCircleCredentials();

    if (!credentials.userToken || !credentials.userId) {
      throw new Error('Login completed but credentials not found');
    }

    // 4. Sync with backend
    const syncResult = await syncCircleUser(
      credentials.userId,
      credentials.userToken
    );

    // 5. Store DEO JWT token
    if (syncResult.token) {
      localStorage.setItem('deo_token', syncResult.token);
    }

    return { success: true };
  } catch (error) {
    console.error('Circle login flow error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login failed',
    };
  }
}
