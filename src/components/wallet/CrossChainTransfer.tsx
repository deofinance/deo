/**
 * Cross-Chain Transfer Component
 * USDC transfers between chains using Circle CCTP V2
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowDownUp, 
  Zap, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { type ChainId } from '@/types';
import { cctpService } from '@/lib/services/cctpService';
import { formatCurrency } from '@/lib/utils/format';

interface CrossChainTransferProps {
  walletAddress: string;
  initialSourceChain?: ChainId;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CrossChainTransfer({
  walletAddress,
  initialSourceChain,
  onSuccess,
  onCancel,
}: CrossChainTransferProps) {
  const [sourceChain, setSourceChain] = useState<ChainId>(initialSourceChain || '1');
  const [destinationChain, setDestinationChain] = useState<ChainId>('137');
  const [amount, setAmount] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferStatus, setTransferStatus] = useState<
    'idle' | 'pending' | 'attesting' | 'completed' | 'failed'
  >('idle');
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const supportedChains = [
    { id: '1', name: 'Ethereum', icon: '⟠' },
    { id: '137', name: 'Polygon', icon: '⬡' },
    { id: '42161', name: 'Arbitrum', icon: '◆' },
    { id: '10', name: 'Optimism', icon: '○' },
  ];

  const isCCTPSupported = cctpService.isCCTPSupported(sourceChain, destinationChain);
  const estimatedTime = cctpService.estimateTransferTime(sourceChain, destinationChain);
  const fees = cctpService.estimateFees(amount, sourceChain);

  const handleSwapChains = () => {
    const temp = sourceChain;
    setSourceChain(destinationChain);
    setDestinationChain(temp);
  };

  const handleTransfer = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!isCCTPSupported) {
      setError('CCTP transfer not supported between selected chains');
      return;
    }

    setIsTransferring(true);
    setError(null);
    setTransferStatus('pending');

    try {
      const response = await fetch('/api/wallet/cctp/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('deo_token')}`,
        },
        body: JSON.stringify({
          sourceChainId: sourceChain,
          destinationChainId: destinationChain,
          amount,
          token: 'USDC',
          recipientAddress: walletAddress,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Transfer failed');
      }

      setTxHash(data.txHash);
      setTransferStatus('attesting');

      // Poll for completion
      const checkStatus = setInterval(async () => {
        try {
          const statusResponse = await fetch(
            `/api/wallet/cctp/status/${data.transferId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('deo_token')}`,
              },
            }
          );

          const statusData = await statusResponse.json();

          if (statusData.status === 'completed') {
            setTransferStatus('completed');
            clearInterval(checkStatus);
            setTimeout(() => {
              onSuccess?.();
            }, 2000);
          } else if (statusData.status === 'failed') {
            setTransferStatus('failed');
            setError('Transfer failed');
            clearInterval(checkStatus);
          }
        } catch (err) {
          console.error('Status check error:', err);
        }
      }, 5000);

      // Cleanup after 5 minutes
      setTimeout(() => clearInterval(checkStatus), 300000);
    } catch (err) {
      console.error('Transfer error:', err);
      setError(err instanceof Error ? err.message : 'Transfer failed');
      setTransferStatus('failed');
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-brand-600" />
              Cross-Chain Bridge
            </CardTitle>
            <CardDescription>Transfer USDC across networks with Circle CCTP</CardDescription>
          </div>
          <Badge variant="secondary" className="text-xs">
            CCTP V2
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Transfer Form */}
        <div className="space-y-4">
          {/* Source Chain */}
          <div>
            <Label htmlFor="source-chain" className="text-sm font-medium mb-2 block">
              From Network
            </Label>
            <Select value={sourceChain} onValueChange={(val) => setSourceChain(val as ChainId)}>
              <SelectTrigger id="source-chain">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {supportedChains.map((chain) => (
                  <SelectItem key={chain.id} value={chain.id}>
                    <div className="flex items-center gap-2">
                      <span>{chain.icon}</span>
                      <span>{chain.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSwapChains}
              className="rounded-full h-10 w-10 p-0"
            >
              <ArrowDownUp className="h-4 w-4" />
            </Button>
          </div>

          {/* Destination Chain */}
          <div>
            <Label htmlFor="dest-chain" className="text-sm font-medium mb-2 block">
              To Network
            </Label>
            <Select
              value={destinationChain}
              onValueChange={(val) => setDestinationChain(val as ChainId)}
            >
              <SelectTrigger id="dest-chain">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {supportedChains.map((chain) => (
                  <SelectItem key={chain.id} value={chain.id}>
                    <div className="flex items-center gap-2">
                      <span>{chain.icon}</span>
                      <span>{chain.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div>
            <Label htmlFor="amount" className="text-sm font-medium mb-2 block">
              Amount
            </Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pr-16"
                disabled={isTransferring}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-sm font-medium text-gray-500">USDC</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transfer Details */}
        {amount && parseFloat(amount) > 0 && isCCTPSupported && (
          <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">You will receive:</span>
              <span className="font-medium">{amount} USDC</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Estimated time:</span>
              <span className="font-medium flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {estimatedTime}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Network fee:</span>
              <span className="font-medium">{formatCurrency(parseFloat(fees.total))}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
              <span className="font-medium text-gray-900">Total cost:</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(parseFloat(amount) + parseFloat(fees.total))}
              </span>
            </div>
          </div>
        )}

        {/* CCTP Not Supported Warning */}
        {sourceChain && destinationChain && !isCCTPSupported && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900">
                  CCTP Not Supported
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Direct CCTP transfer is not available between these chains.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Transfer Status */}
        {transferStatus !== 'idle' && (
          <div className="space-y-3">
            <div
              className={`p-4 rounded-lg ${
                transferStatus === 'completed'
                  ? 'bg-green-50 border border-green-200'
                  : transferStatus === 'failed'
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-blue-50 border border-blue-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {transferStatus === 'completed' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : transferStatus === 'failed' ? (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                ) : (
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {transferStatus === 'pending' && 'Initiating transfer...'}
                    {transferStatus === 'attesting' && 'Waiting for attestation...'}
                    {transferStatus === 'completed' && 'Transfer completed!'}
                    {transferStatus === 'failed' && 'Transfer failed'}
                  </p>
                  {transferStatus === 'attesting' && (
                    <p className="text-xs text-gray-600 mt-1">
                      This usually takes {estimatedTime}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {txHash && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() =>
                  window.open(
                    `https://cctp-explorer.circle.com/tx/${txHash}`,
                    '_blank'
                  )
                }
              >
                View on CCTP Explorer
              </Button>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isTransferring}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleTransfer}
            disabled={
              !amount ||
              parseFloat(amount) <= 0 ||
              !isCCTPSupported ||
              isTransferring ||
              sourceChain === destinationChain
            }
            className="flex-1 bg-gradient-to-r from-brand-500 to-teal-500 hover:from-brand-600 hover:to-teal-600"
          >
            {isTransferring ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Bridge USDC
              </>
            )}
          </Button>
        </div>

        {/* CCTP Info */}
        <div className="p-4 bg-brand-50 border border-brand-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-brand-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-brand-900 mb-1">
                Powered by Circle CCTP V2
              </p>
              <p className="text-xs text-brand-700">
                Native USDC transfer with no slippage or wrapped tokens. Your USDC arrives
                directly on the destination chain.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
