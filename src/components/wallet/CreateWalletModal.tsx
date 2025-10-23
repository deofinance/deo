'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Wallet, CheckCircle, Loader2, AlertCircle, Shield } from 'lucide-react';
import { useCircleSdk } from '@/contexts/CircleSdkContext';

interface CreateWalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type WalletCreationStep = 'info' | 'creating' | 'pin-setup' | 'success' | 'error';

export function CreateWalletModal({ open, onOpenChange }: CreateWalletModalProps) {
  const router = useRouter();
  const { sdk, isReady } = useCircleSdk();
  const [step, setStep] = useState<WalletCreationStep>('info');
  const [error, setError] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string>('');

  const handleCreateWallet = async () => {
    try {
      setStep('creating');
      setError('');

      if (!sdk || !isReady) {
        throw new Error('Circle SDK not ready');
      }

      const token = localStorage.getItem('deo_token') || localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication required');
      }

      // Step 1: Initialize Circle user and create wallet
      const initResponse = await fetch('/api/circle/initialize-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userToken: localStorage.getItem('circle_user_token'),
          accountType: 'SCA',
          blockchains: ['MATIC-AMOY'], // Test network
        }),
      });

      if (!initResponse.ok) {
        const errorData = await initResponse.json();
        throw new Error(errorData.message || 'Failed to initialize wallet');
      }

      const { challengeId } = await initResponse.json();

      // Step 2: Execute PIN setup challenge with Circle SDK
      setStep('pin-setup');

      // Note: In a real implementation, you would call sdk.execute() here
      // This is a placeholder for the Circle SDK challenge execution
      console.log('Challenge ID:', challengeId);
      
      // Simulate successful PIN setup (replace with actual SDK call)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 3: Sync user data with our database
      const syncResponse = await fetch('/api/circle/sync-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          circleUserId: 'temp-user-id', // This would come from Circle SDK
          circleUserToken: localStorage.getItem('circle_user_token'),
          provider: 'circle',
        }),
      });

      if (!syncResponse.ok) {
        throw new Error('Failed to sync wallet data');
      }

      const syncData = await syncResponse.json();
      setWalletAddress(syncData.walletAddress || '');

      setStep('success');
    } catch (err) {
      console.error('Wallet creation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create wallet');
      setStep('error');
    }
  };

  const handleClose = () => {
    if (step === 'success') {
      router.push('/accounts/wallet');
    } else {
      onOpenChange(false);
      // Reset state after animation
      setTimeout(() => {
        setStep('info');
        setError('');
        setWalletAddress('');
      }, 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {/* Info Step */}
        {step === 'info' && (
          <>
            <DialogHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <DialogTitle className="text-center">Create Your Smart Wallet</DialogTitle>
              <DialogDescription className="text-center">
                Your secure, self-custodial wallet powered by Circle
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Self-Custodial</p>
                  <p className="text-sm text-slate-600">Only you control your funds</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Gasless Transactions</p>
                  <p className="text-sm text-slate-600">No transaction fees on supported chains</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Multi-Chain Support</p>
                  <p className="text-sm text-slate-600">Access across Ethereum, Polygon, and more</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleCreateWallet}
                disabled={!isReady}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
              >
                Create Wallet
              </Button>
            </div>
          </>
        )}

        {/* Creating Step */}
        {step === 'creating' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-center">Creating Your Wallet</DialogTitle>
              <DialogDescription className="text-center">
                Setting up your secure wallet...
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mb-4" />
              <p className="text-sm text-slate-600">This will only take a moment</p>
            </div>
          </>
        )}

        {/* PIN Setup Step */}
        {step === 'pin-setup' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-center">Set Your PIN</DialogTitle>
              <DialogDescription className="text-center">
                Create a secure 6-digit PIN to protect your wallet
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mb-4" />
              <p className="text-sm text-slate-600">Circle PIN setup loading...</p>
            </div>

            <p className="text-xs text-slate-500 text-center">
              The Circle security widget will appear to set your PIN
            </p>
          </>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <>
            <DialogHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <DialogTitle className="text-center">Wallet Created!</DialogTitle>
              <DialogDescription className="text-center">
                Your smart wallet is ready to use
              </DialogDescription>
            </DialogHeader>

            {walletAddress && (
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-500 mb-1">Wallet Address</p>
                <p className="text-sm font-mono break-all text-slate-900">{walletAddress}</p>
              </div>
            )}

            <Button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
            >
              Go to Wallet
            </Button>
          </>
        )}

        {/* Error Step */}
        {step === 'error' && (
          <>
            <DialogHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <DialogTitle className="text-center">Creation Failed</DialogTitle>
              <DialogDescription className="text-center">
                {error || 'Something went wrong'}
              </DialogDescription>
            </DialogHeader>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setStep('info');
                  setError('');
                }}
                className="flex-1"
              >
                Try Again
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
