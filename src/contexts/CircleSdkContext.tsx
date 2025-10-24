'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react';

// Circle Web SDK types - will be properly typed when SDK is installed
type W3SSdk = any;
type SocialLoginResult = any;
type EmailLoginResult = any;
type CircleError = any;

interface CircleSdkContextType {
  sdk: W3SSdk | undefined;
  isReady: boolean;
  deviceId: string | null;
  isLoggingIn: boolean;
}

const CircleSdkContext = createContext<CircleSdkContextType>({
  sdk: undefined,
  isReady: false,
  deviceId: null,
  isLoggingIn: false,
});

export const useCircleSdk = () => useContext(CircleSdkContext);

interface Props {
  children: ReactNode;
}

let sdkInstance: W3SSdk | undefined;

export function CircleSdkProvider({ children }: Props) {
  const [sdk, setSdk] = useState<W3SSdk | undefined>(sdkInstance);
  const [isReady, setIsReady] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const onLoginComplete = useCallback(
    (error: CircleError | undefined, result: SocialLoginResult | EmailLoginResult | undefined) => {
      setIsLoggingIn(false);
      
      if (error) {
        console.error('Circle login error:', error);
        // Error will be handled by the component
      } else if (result) {
        console.log('Circle login success:', result);
        
        // Store Circle tokens
        if ('userToken' in result) {
          localStorage.setItem('circle_user_token', result.userToken);
          localStorage.setItem('circle_encryption_key', result.encryptionKey);
          localStorage.setItem('circle_user_id', result.userId);
          
          if (result.refreshToken) {
            localStorage.setItem('circle_refresh_token', result.refreshToken);
          }
        }
      }
    },
    []
  );

  const getConfig = useCallback(() => {
    return {
      appSettings: { 
        appId: process.env.NEXT_PUBLIC_CIRCLE_APP_ID || '' 
      },
      loginConfigs: {
        deviceToken: localStorage.getItem('circle_device_token') || '',
        deviceEncryptionKey: localStorage.getItem('circle_device_encryption_key') || '',
        google: {
          clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
          redirectUri: typeof window !== 'undefined' ? window.location.origin : '',
        },
        facebook: {
          appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '',
          redirectUri: typeof window !== 'undefined' ? window.location.origin : '',
        },
        apple: {
          clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || '',
          redirectUri: typeof window !== 'undefined' ? window.location.origin : '',
        },
      },
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initSdk = () => {
      try {
        // Circle Web SDK will be initialized when package is installed
        // For now, just mark as ready without SDK
        console.log('Circle SDK context ready (SDK package pending installation)');
        setIsReady(true);
        
        // TODO: Uncomment when @circle-fin/w3s-pw-web-sdk is properly installed
        // if (!sdkInstance) {
        //   sdkInstance = new W3SSdk(getConfig(), onLoginComplete);
        // }
        // 
        // setSdk(sdkInstance);
        // 
        // sdkInstance.getDeviceId().then((id: string) => {
        //   setDeviceId(id);
        //   setIsReady(true);
        //   console.log('Circle SDK initialized with device ID:', id);
        // }).catch((error: Error) => {
        //   console.error('Failed to get device ID:', error);
        //   setIsReady(true);
        // });
      } catch (error) {
        console.error('Failed to initialize Circle SDK:', error);
        setIsReady(true);
      }
    };

    initSdk();
  }, [getConfig, onLoginComplete]);

  const contextValue = useMemo(() => ({
    sdk,
    isReady,
    deviceId,
    isLoggingIn,
  }), [sdk, isReady, deviceId, isLoggingIn]);

  return (
    <CircleSdkContext.Provider value={contextValue}>
      {children}
    </CircleSdkContext.Provider>
  );
}
