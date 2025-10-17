import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPage() {
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100 text-brand-700 font-medium mb-4">
            <Shield className="h-4 w-4" />
            Your Privacy Matters
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-slate-600">
            Last updated: October 12, 2025
          </p>
        </div>

        {/* Quick Summary */}
        <div className="bg-gradient-to-r from-brand-500 to-teal-500 rounded-2xl p-8 mb-12 text-white shadow-xl">
          <h2 className="text-2xl font-bold mb-4">Privacy at a Glance</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <Lock className="h-6 w-6 flex-shrink-0 mt-1" />
              <div>
                <div className="font-semibold mb-1">Bank-Grade Security</div>
                <div className="text-sm text-white/90">Your data is encrypted and protected</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Eye className="h-6 w-6 flex-shrink-0 mt-1" />
              <div>
                <div className="font-semibold mb-1">Full Transparency</div>
                <div className="text-sm text-white/90">We're clear about data usage</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="h-6 w-6 flex-shrink-0 mt-1" />
              <div>
                <div className="font-semibold mb-1">Your Control</div>
                <div className="text-sm text-white/90">You own and control your data</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-soft border border-brand-100 mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Introduction</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              DEO Finance ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </p>
            <p className="text-slate-700 leading-relaxed">
              By using DEO Finance, you agree to the collection and use of information in accordance with this policy.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-soft border border-brand-100 mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">2.1 Personal Information</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              We collect information that you provide directly to us:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
              <li>Name, email address, and contact information</li>
              <li>Government-issued identification for KYC verification</li>
              <li>Date of birth and address</li>
              <li>Financial information (wallet addresses, transaction history)</li>
              <li>Profile photo (optional)</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">2.2 Automatically Collected Information</h3>
            <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
              <li>Device information (IP address, browser type, operating system)</li>
              <li>Usage data (pages visited, features used, time spent)</li>
              <li>Location information (with your permission)</li>
              <li>Cookie data and similar tracking technologies</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">2.3 Third-Party Information</h3>
            <p className="text-slate-700 leading-relaxed">
              We receive information from our service providers including Circle (wallet services), 
              Stripe (card services), Persona (KYC verification), and others.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-soft border border-brand-100 mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We use your information to:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send transaction notifications</li>
              <li>Verify your identity and comply with KYC/AML regulations</li>
              <li>Prevent fraud and enhance security</li>
              <li>Send important updates and service announcements</li>
              <li>Provide customer support</li>
              <li>Analyze usage patterns to improve user experience</li>
              <li>Comply with legal obligations</li>
            </ul>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-soft border border-brand-100 mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. Information Sharing and Disclosure</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We may share your information with:
            </p>
            
            <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-4">Service Providers</h3>
            <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
              <li><strong>Circle:</strong> Wallet management and cryptocurrency transactions</li>
              <li><strong>Stripe:</strong> Card issuance and payment processing</li>
              <li><strong>Persona:</strong> Identity verification and KYC</li>
              <li><strong>AWS:</strong> Cloud infrastructure and email services</li>
              <li><strong>Alchemy:</strong> Blockchain data and infrastructure</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-4">Legal Requirements</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              We may disclose your information if required by law, court order, or government regulation, 
              or to protect our rights, property, or safety.
            </p>

            <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-4">Business Transfers</h3>
            <p className="text-slate-700 leading-relaxed">
              In the event of a merger, acquisition, or sale of assets, your information may be transferred 
              to the acquiring entity.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-soft border border-brand-100 mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. Data Security</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
              <li>End-to-end encryption for sensitive data</li>
              <li>Secure SSL/TLS connections</li>
              <li>Regular security audits and penetration testing</li>
              <li>Multi-factor authentication options</li>
              <li>Secure data centers with physical security</li>
              <li>Employee training on data protection</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              <strong className="text-brand-600">Note:</strong> While we strive to protect your data, 
              no method of transmission over the internet is 100% secure.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-soft border border-brand-100 mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">6. Your Privacy Rights</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your data (subject to legal requirements)</li>
              <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Restrict Processing:</strong> Limit how we use your data</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              To exercise these rights, contact us at <span className="text-brand-600 font-medium">privacy@deofinance.com</span>
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-soft border border-brand-100 mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">7. Cookies and Tracking</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
              <li>Keep you signed in</li>
              <li>Remember your preferences</li>
              <li>Analyze site usage and performance</li>
              <li>Provide personalized content</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              You can control cookies through your browser settings, but some features may not work properly 
              if cookies are disabled.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-soft border border-brand-100 mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">8. Data Retention</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We retain your information for as long as necessary to:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
              <li>Provide our services</li>
              <li>Comply with legal obligations (typically 5-7 years for financial records)</li>
              <li>Resolve disputes and enforce agreements</li>
              <li>Prevent fraud and abuse</li>
            </ul>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-soft border border-brand-100 mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">9. International Data Transfers</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              Your information may be transferred to and processed in countries other than your own. 
              We ensure appropriate safeguards are in place for such transfers, including:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
              <li>Standard contractual clauses approved by regulatory authorities</li>
              <li>Compliance with GDPR, CCPA, and other privacy regulations</li>
              <li>Data processing agreements with all service providers</li>
            </ul>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-soft border border-brand-100 mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">10. Children's Privacy</h2>
            <p className="text-slate-700 leading-relaxed">
              DEO Finance is not intended for users under 18 years of age. We do not knowingly collect 
              personal information from children. If you believe we have collected information from a child, 
              please contact us immediately.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-soft border border-brand-100 mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">11. Changes to This Policy</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We may update this Privacy Policy from time to time. We will notify you of material changes by:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
              <li>Posting the updated policy on this page</li>
              <li>Updating the "Last updated" date</li>
              <li>Sending an email notification for significant changes</li>
            </ul>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-soft border border-brand-100 mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">12. Contact Us</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              If you have questions or concerns about this Privacy Policy or our data practices:
            </p>
            <div className="bg-brand-50 rounded-lg p-4 border border-brand-200">
              <p className="text-slate-700">
                <strong className="text-slate-900">Email:</strong>{' '}
                <a href="mailto:privacy@deofinance.com" className="text-brand-600 hover:text-brand-700 font-medium">
                  privacy@deofinance.com
                </a>
              </p>
              <p className="text-slate-700 mt-2">
                <strong className="text-slate-900">Data Protection Officer:</strong>{' '}
                <a href="mailto:dpo@deofinance.com" className="text-brand-600 hover:text-brand-700 font-medium">
                  dpo@deofinance.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <Link
            href="/terms"
            className="text-brand-600 hover:text-brand-700 font-medium transition-colors"
          >
            ← Terms of Service
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
