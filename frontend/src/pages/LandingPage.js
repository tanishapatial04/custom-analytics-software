import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { TrendingUp, Brain, Shield, Zap } from 'lucide-react';

export default function LandingPage({ isAuthenticated }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-indigo-600" />
            <span className="text-2xl font-bold text-slate-900">DataForge</span>
          </div>
          <Button 
            data-testid="nav-cta-button"
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full"
          >
            {isAuthenticated ? 'Dashboard' : 'Get Started'}
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
            Privacy-First Analytics Platform
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            Analytics Powered by
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Natural Language
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Ask questions about your data in plain English. Get instant insights powered by AI. 
            Privacy-first tracking that respects your users.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              data-testid="hero-get-started-button"
              onClick={() => navigate('/auth')}
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl"
            >
              Start Tracking Free
            </Button>
            <Button 
              data-testid="hero-learn-more-button"
              variant="outline" 
              size="lg"
              className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-8 py-6 text-lg rounded-full"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              Everything you need to understand your users
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Powerful analytics meets conversational AI for insights that matter
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 hover:shadow-lg transition-shadow" data-testid="feature-nlq">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Natural Language Queries</h3>
              <p className="text-slate-600">
                Ask questions like "What's my traffic trend?" and get instant, AI-powered answers.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-lg transition-shadow" data-testid="feature-realtime">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Real-Time Insights</h3>
              <p className="text-slate-600">
                Monitor your website performance with live data updates and instant metrics.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-shadow" data-testid="feature-privacy">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Privacy First</h3>
              <p className="text-slate-600">
                GDPR-compliant with IP anonymization, consent management, and no cookie tracking.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 hover:shadow-lg transition-shadow" data-testid="feature-saas">
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Multi-Tenant SaaS</h3>
              <p className="text-slate-600">
                Manage multiple projects and websites from a single, powerful dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to unlock AI-powered insights?
          </h2>
          <p className="text-xl text-indigo-100 mb-10">
            Start tracking your website analytics in minutes. No credit card required.
          </p>
          <Button 
            data-testid="cta-start-free-button"
            onClick={() => navigate('/auth')}
            size="lg"
            className="bg-white text-indigo-600 hover:bg-indigo-50 px-10 py-6 text-lg rounded-full shadow-xl hover:shadow-2xl font-semibold"
          >
            Start Free Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-slate-900 text-slate-400">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="w-6 h-6 text-indigo-400" />
            <span className="text-xl font-bold text-white">DataForge</span>
          </div>
          <p className="mb-4">Privacy-first analytics with AI-powered insights</p>
          <p className="text-sm text-slate-500">
            © 2025 DataForge Analytics. Built with FastAPI, React & MongoDB.
          </p>
        </div>
      </footer>
    </div>
  );
}
