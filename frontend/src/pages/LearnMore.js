import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Activity, BarChart2, Users, Shield, TrendingUp } from 'lucide-react';

export default function LearnMore() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header (same as landing) */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-[#1C4B42]" />
            <span className="text-2xl font-bold text-slate-900">SignalVista</span>
          </div>
          <Button 
            data-testid="nav-cta-button"
            onClick={() => navigate(localStorage.getItem('token') ? '/dashboard' : '/auth')}
            className="bg-[#b4e717] text-[#1C4B42] px-6 py-2 rounded-full hover:bg-[#b4e718] hover:text-[#1C4B42]"
          >
            {localStorage.getItem('token') ? 'Dashboard' : 'Get Started'}
          </Button>
        </div>
      </nav>

      <main className="pt-24">
        {/* Hero */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block mb-4 px-3 py-1 bg-[#e8f8f0] text-[#1C4B42] rounded-full text-sm font-medium">What you'll get</div>
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">A powerful, privacy-first analytics dashboard</h1>
              <p className="text-lg text-slate-600 mb-6">SignalVista's dashboard surfaces the metrics that matter — in plain language and visual form — so teams can act faster. Below is an overview of the core capabilities you'll find inside the dashboard.</p>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Activity className="w-6 h-6 text-[#1C4B42] mt-1" />
                  <div>
                    <h4 className="font-semibold text-slate-900">Realtime & historical metrics</h4>
                    <p className="text-slate-600">Combine live and historical views to understand trends, spikes, and retention.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <BarChart2 className="w-6 h-6 text-[#1C4B42] mt-1" />
                  <div>
                    <h4 className="font-semibold text-slate-900">Visual explorations</h4>
                    <p className="text-slate-600">Charts, funnels, and cohort views you can customize and export for reports.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Users className="w-6 h-6 text-[#1C4B42] mt-1" />
                  <div>
                    <h4 className="font-semibold text-slate-900">User segmentation</h4>
                    <p className="text-slate-600">Segment users by behavior, events, or attributes to focus on high-value cohorts.</p>
                  </div>
                </li>
              </ul>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={() => navigate('/auth')} className="bg-[#b4e717] text-[#1C4B42] px-6 py-3">Get started — it's free</Button>
                <Button variant="outline" onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })} className="px-6 py-3">See dashboard details</Button>
              </div>
            </div>

            {/* Right: Dashboard image / mockup */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md shadow-xl rounded-2xl overflow-hidden border">
                <div className="bg-gradient-to-br from-[#0f766e] to-[#1C4B42] p-4 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-white/20 rounded-lg"></div>
                    <div className="text-sm">SignalVista</div>
                  </div>
                  <div className="rounded-md bg-white/10 p-3">
                    <div className="h-32 bg-white/20 rounded-md mb-3"></div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="h-12 bg-white/10 rounded"></div>
                      <div className="h-12 bg-white/10 rounded"></div>
                      <div className="h-12 bg-white/10 rounded"></div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-sm text-slate-500">Active users</div>
                      <div className="text-2xl font-bold text-slate-900">12.4k</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-500">Conversion</div>
                      <div className="text-2xl font-bold text-slate-900">4.2%</div>
                    </div>
                  </div>
                  <div className="h-28 bg-slate-100 rounded" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Secondary content sections */}
        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-2xl border">
              <h3 className="text-xl font-semibold mb-2">Actionable Insights</h3>
              <p className="text-slate-600">Automated highlights surface anomalies and suggested actions so your team spends less time hunting and more time shipping.</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border">
              <h3 className="text-xl font-semibold mb-2">Natural Language Queries</h3>
              <p className="text-slate-600">Ask questions in plain English and get visual answers, charts, and links to the underlying data in seconds.</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border">
              <h3 className="text-xl font-semibold mb-2">Privacy & Compliance</h3>
              <p className="text-slate-600">IP anonymization, consent controls, and a privacy-first defaults make it easy to stay compliant while getting insights.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
