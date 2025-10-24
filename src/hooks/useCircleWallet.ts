/**
 * Circle Wallet React Hook
 * Simplifies Circle wallet management in React components
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCircleSdk } from '@/contexts/CircleSdkContext';
import {
  getCircleCredentials,
  hasCircleCredentials,
  initializeCircleWallet,
  completeCircleLogin,
  clearCircleCredentials,
} from '@/lib/utils/circleWallet';

interface CircleWalletState {
  hasWallet: boolean;
  userToken: string | null;
  userId: string | null;
  isInitializing: boolean;
  error: string | null;
}

export function useCircleWallet() {
  const { sdk, isReady, deviceId } = useCircleSdk();
  const [state, setState] = useState<CircleWalletState>({
    hasWallet: false,
    userToken: null,
    userId: null,
    isInitializing: false,
    error: null,
  });

  // Check for existing credentials on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const credentials = getCircleCredentials();
      setState((prev) => ({
        ...prev,
        hasWallet: hasCircleCredentials(),
        userToken: credentials.userToken,
        userId: credentials.userId,
      }));
    }
  }, []);

  /**
   * Login with Google using Circle SDK
   */
  const loginWithGoogle = useCallback(async () => {
    if (!sdk || !deviceId) {
      setState((prev) => ({ ...prev, error: 'SDK not ready' }));
      return { success: false, error: 'SDK not ready' };
    }

    setState((prev) => ({ ...prev, isInitializing: true, error: null }));

    try {
      const result = await completeCircleLogin(sdk, deviceId, 'google');

      if (result.success) {
        const credentials = getCircleCredentials();
        setState((prev) => ({
          ...prev,
          hasWallet: true,
          userToken: credentials.userToken,
          userId: credentials.userId,
          isInitializing: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: result.error || 'Login failed',
          isInitializing: false,
        }));
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isInitializing: false,
      }));
      return { success: false, error: errorMessage };
    }
  }, [sdk, deviceId]);

  /**
   * Login with Facebook using Circle SDK
   */
  const loginWithFacebook = useCallback(async () => {
    if (!sdk || !deviceId) {
      setState((prev) => ({ ...prev, error: 'SDK not ready' }));
      return { success: false, error: 'SDK not ready' };
    }

    setState((prev) => ({ ...prev, isInitializing: true, error: null }));

    try {
      const result = await completeCircleLogin(sdk, deviceId, 'facebook');

      if (result.success) {
        const credentials = getCircleCredentials();
        setState((prev) => ({
          ...prev,
          hasWallet: true,
          userToken: credentials.userToken,
          userId: credentials.userId,
          isInitializing: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: result.error || 'Login failed',
          isInitializing: false,
        }));
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isInitializing: false,
      }));
      return { success: false, error: errorMessage };
    }
  }, [sdk, deviceId]);

  /**
   * Login with Apple using Circle SDK
   */
  const loginWithApple = useCallback(async () => {
    if (!sdk || !deviceId) {
      setState((prev) => ({ ...prev, error: 'SDK not ready' }));
      return { success: false, error: 'SDK not ready' };
    }

    setState((prev) => ({ ...prev, isInitializing: true, error: null }));

    try {
      const result = await completeCircleLogin(sdk, deviceId, 'apple');

      if (result.success) {
        const credentials = getCircleCredentials();
        setState((prev) => ({
          ...prev,
          hasWallet: true,
          userToken: credentials.userToken,
          userId: credentials.userId,
          isInitializing: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: result.error || 'Login failed',
          isInitializing: false,
        }));
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isInitializing: false,
      }));
      return { success: false, error: errorMessage };
    }
  }, [sdk, deviceId]);

  /**
   * Initialize wallet for current user
   * Creates SCA wallet if not exists
   */
  const initializeWallet = useCallback(async () => {
    const credentials = getCircleCredentials();

    if (!credentials.userToken) {
      setState((prev) => ({ ...prev, error: 'No user token found' }));
      return { success: false, error: 'No user token found' };
    }

    setState((prev) => ({ ...prev, isInitializing: true, error: null }));

    try {
      const result = await initializeCircleWallet(credentials.userToken, 'SCA');
      setState((prev) => ({ ...prev, isInitializing: false, hasWallet: true }));
      return { success: true, challengeId: result.challengeId };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Wallet initialization failed';
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isInitializing: false,
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Logout and clear credentials
   */
  const logout = useCallback(() => {
    clearCircleCredentials();
    localStorage.removeItem('deo_token');
    setState({
      hasWallet: false,
      userToken: null,
      userId: null,
      isInitializing: false,
      error: null,
    });
  }, []);

  /**
   * Refresh credentials from localStorage
   */
  const refreshCredentials = useCallback(() => {
    const credentials = getCircleCredentials();
    setState((prev) => ({
      ...prev,
      hasWallet: hasCircleCredentials(),
      userToken: credentials.userToken,
      userId: credentials.userId,
    }));
  }, []);

  return {
    // State
    ...state,
    isReady,
    deviceId,

    // Actions
    loginWithGoogle,
    loginWithFacebook,
    loginWithApple,
    initializeWallet,
    logout,
    refreshCredentials,

    // SDK instance (for advanced usage)
    sdk,
  };
}
