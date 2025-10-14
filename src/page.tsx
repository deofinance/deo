import Link from 'next/link';
import { ArrowRight, Shield, Zap, Globe, Sparkles, CheckCircle, Star } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen gradient-hero overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-brand-500 to-teal-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">DEO</span>
              </div>
              <span className="text-xl bg-gradient-to-r from-brand-600 to-teal-600 bg-clip-text text-transparent font-bold">
                DEO Finance
              </span>
            </Link>
            <Link
              href="/auth/login"
              className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 pattern-dots opacity-50" />
        
        {/* Decorative Blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-brand-200/50 shadow-lg mb-8 animate-fade-in">
              <Sparkles className="h-4 w-4 text-brand-600" />
              <span className="text-sm font-medium text-brand-700">
                The Future of Stablecoin Financial Services
              </span>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-slate-900 mb-6 animate-slide-up">
              <span className="block text-balance">Stablecoin</span>
              <span className="block bg-gradient-to-r from-brand-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
                is all you need
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Your complete financial solution, reimagined. Deposit stablecoins and unlock a suite of powerful financial services.
              <br />
              <span className="font-semibold text-brand-700">Stablecoin IN, stablecoin OUT.</span>
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link
                href="/auth/login"
                className="group px-8 py-4 rounded-full bg-brand-600 hover:bg-brand-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 text-lg font-semibold"
              >
                Discover Our Services
                <ArrowRight className="inline-block ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/waitlist"
                className="px-8 py-4 rounded-full border-2 border-brand-200 glass hover:bg-white/80 text-brand-700 font-semibold text-lg transition-all duration-300"
              >
                <Sparkles className="inline-block mr-2 h-5 w-5" />
                Join Waitlist
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="relative py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Why Stablecoin is All You Need
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Experience the power of modern stablecoin financial services
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Shield className="h-8 w-8 text-white" />}
              title="Rock-Solid Stability"
              description="Stablecoins offer remarkable price stability, providing a reliable store of value in the volatile crypto landscape."
              gradient="from-brand-500 to-brand-600"
            />
            <FeatureCard
              icon={<Zap className="h-8 w-8 text-white" />}
              title="Gasless Transactions"
              description="Zero gas fees on all transactions with our smart wallet technology. Experience true financial freedom."
              gradient="from-teal-500 to-teal-600"
            />
            <FeatureCard
              icon={<Globe className="h-8 w-8 text-white" />}
              title="Multi-Chain Support"
              description="Access your assets across Ethereum, Polygon, Arbitrum, Optimism, and more with seamless bridging."
              gradient="from-cyan-500 to-cyan-600"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 gradient-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Trusted by thousands worldwide
            </h2>
            <p className="text-xl text-slate-600">
              Join the future of digital finance
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard value="$2.5B+" label="Total Volume" />
            <StatCard value="500K+" label="Active Users" />
            <StatCard value="15" label="Supported Chains" />
            <StatCard value="99.9%" label="Uptime" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Star className="h-12 w-12 mx-auto mb-6 text-yellow-400" />
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-slate-300 mb-12">
            Join thousands of users already using DEO Finance. No credit check required.
          </p>
          <Link
            href="/auth/login"
            className="inline-block px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-full text-lg font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl"
          >
            Get Started Free
            <ArrowRight className="inline-block ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-brand-500 to-teal-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">DEO</span>
              </div>
              <span className="text-lg font-bold text-white">DEO Finance</span>
            </div>
            <div className="flex items-center gap-6 text-slate-400">
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/docs" className="hover:text-white transition-colors">
                Documentation
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-slate-500 text-sm">
            <p>&copy; 2025 DEO Finance. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="group p-8 bg-white/60 backdrop-blur-xl border border-brand-200/50 rounded-2xl hover:shadow-xl hover:-translate-y-2 transition-all duration-500 text-center">
      <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-4 text-slate-900">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-5xl font-bold text-brand-600 mb-2">{value}</div>
      <div className="text-slate-600 font-medium">{label}</div>
    </div>
  );
}
