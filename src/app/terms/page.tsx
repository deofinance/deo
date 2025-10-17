import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-teal-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-slate-600">
            Last updated: October 12, 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-soft border border-brand-100 mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              By accessing and using DEO Finance ("the Service"), you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to these terms, please do not use the Service.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-soft border border-brand-100 mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. Description of Service</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              DEO Finance provides a comprehensive stablecoin financial platform that includes:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
              <li>Digital wallet services for stablecoin management</li>
              <li>Multi-chain cryptocurrency transactions</li>
              <li>Card issuance and payment services</li>
              <li>KYC verification and identity services</li>
              <li>DeFi protocol integrations</li>
            </ul>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-soft border border-brand-100 mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. User Responsibilities</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              You agree to:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Not use the Service for any illegal or unauthorized purpose</li>
            </ul>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-soft border border-brand-100 mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. Financial Services</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              DEO Finance partners with regulated financial service providers including Circle, Stripe, and others 
              to provide financial services. You agree to comply with the terms of these third-party providers.
            </p>
            <p className="text-slate-700 leading-relaxed">
              <strong className="text-brand-600">Important:</strong> Cryptocurrency transactions are subject to 
              market risks and volatility. You acknowledge that you understand these risks.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-soft border border-brand-100 mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. KYC and Verification</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              To comply with regulatory requirements, you agree to:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
              <li>Complete identity verification (KYC) through our partner Persona</li>
              <li>Provide government-issued identification documents</li>
              <li>Maintain accurate and up-to-date personal information</li>
              <li>Comply with additional verification requirements as needed</li>
            </ul>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-soft border border-brand-100 mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">6. Fees and Charges</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              DEO Finance may charge fees for certain services. All applicable fees will be clearly disclosed 
              before you complete a transaction. Fees may include:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
              <li>Transaction fees for cryptocurrency transfers</li>
              <li>Card issuance and usage fees</li>
              <li>Premium feature subscriptions</li>
              <li>Third-party service provider fees</li>
            </ul>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-soft border border-brand-100 mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">7. Prohibited Activities</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              You may not use the Service to:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
              <li>Engage in money laundering or terrorist financing</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Transmit malware or harmful code</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Conduct fraudulent transactions</li>
            </ul>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-soft border border-brand-100 mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">8. Limitation of Liability</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              To the maximum extent permitted by law, DEO Finance shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages, including loss of profits, data, 
              or other intangible losses.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-soft border border-brand-100 mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">9. Termination</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We reserve the right to suspend or terminate your account at any time for violation of these 
              terms or applicable laws. You may also terminate your account at any time by contacting support.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-soft border border-brand-100 mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">10. Changes to Terms</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We may update these Terms of Service from time to time. We will notify you of any material 
              changes by posting the new terms on this page and updating the "Last updated" date.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-soft border border-brand-100 mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">11. Contact Information</h2>
            <p className="text-slate-700 leading-relaxed">
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="text-brand-600 font-medium mt-4">
              Email: legal@deofinance.com
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <Link
            href="/privacy"
            className="text-brand-600 hover:text-brand-700 font-medium transition-colors"
          >
            Privacy Policy →
          </Link>
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}
