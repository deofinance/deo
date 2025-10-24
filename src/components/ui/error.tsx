/**
 * Error Components
 * User-friendly error displays
 */

import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from './button';
import Link from 'next/link';

interface ErrorMessageProps {
  title?: string;
  message: string;
  className?: string;
}

export function ErrorMessage({ title = 'Error', message, className = '' }: ErrorMessageProps) {
  return (
    <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold text-red-800">{title}</h3>
          <p className="text-sm text-red-600 mt-1">{message}</p>
        </div>
      </div>
    </div>
  );
}

interface ErrorPageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showHomeButton?: boolean;
}

export function ErrorPage({ 
  title = 'Something went wrong',
  message = 'We encountered an error. Please try again.',
  onRetry,
  showHomeButton = true 
}: ErrorPageProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <Button onClick={onRetry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
          {showHomeButton && (
            <Link href="/">
              <Button variant="outline">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

interface ErrorCardProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorCard({ message, onRetry, className = '' }: ErrorCardProps) {
  return (
    <div className={`p-6 bg-red-50 border border-red-200 rounded-lg ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-red-800 mb-3">{message}</p>
          {onRetry && (
            <Button onClick={onRetry} size="sm" variant="outline">
              <RefreshCw className="mr-2 h-3 w-3" />
              Retry
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
