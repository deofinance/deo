'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Sparkles, Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function WaitlistPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to join waitlist');
      }

      setStatus('success');
      setFormData({ name: '', email: '' });
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-teal-50 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back to home link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        {/* Main card */}
        <div className="glass rounded-2xl shadow-2xl p-8 border border-white/20">
          {status === 'success' ? (
            // Success state
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-brand-500 to-teal-500 mb-6 animate-scale-in">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                You're on the list! 🎉
              </h2>
              <p className="text-slate-600 text-lg mb-6">
                Thank you for your interest in DEO Finance. We'll notify you as soon as we launch.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => setStatus('idle')}
                  className="w-full bg-brand-600 hover:bg-brand-700"
                >
                  Join Another Email
                </Button>
                <Link href="/" className="block">
                  <Button variant="outline" className="w-full">
                    Return to Home
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            // Form state
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-r from-brand-500 to-teal-500 mb-4">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-3">
                  Join the Waitlist
                </h1>
                <p className="text-slate-600 text-lg">
                  Be the first to experience the future of digital finance
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your full name"
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all outline-none"
                      disabled={status === 'loading'}
                    />
                  </div>
                </div>

                {/* Email field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all outline-none"
                      disabled={status === 'loading'}
                    />
                  </div>
                </div>

                {/* Error message */}
                {status === 'error' && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{errorMessage}</p>
                  </div>
                )}

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-700 hover:to-teal-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Joining...
                    </span>
                  ) : (
                    'Join Waitlist'
                  )}
                </Button>
              </form>

              {/* Info message */}
              <div className="mt-6 p-4 bg-brand-50 rounded-lg border border-brand-100">
                <p className="text-sm text-brand-700 text-center">
                  🚀 We'll notify you when DEO Finance launches. No spam, we promise.
                </p>
              </div>

              {/* Already have account link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-600">
                  Already have early access?{' '}
                  <Link href="/auth/login" className="text-brand-600 hover:text-brand-700 font-semibold">
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer note */}
        <p className="text-center text-sm text-slate-500 mt-6">
          By joining, you agree to our{' '}
          <Link href="/terms" className="text-brand-600 hover:underline">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-brand-600 hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
