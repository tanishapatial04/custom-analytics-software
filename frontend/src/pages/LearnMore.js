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
        <div className="w-[90%] mx-auto px-6 py-4 flex items-center justify-between relative">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-[#1C4B42]" />
              <span className="text-2xl font-bold text-slate-900">SignalVista</span>
            </div>
          </div>

          <div className="absolute left-1/2 transform -translate-x-1/2 hidden sm:flex items-center gap-6">
            <button onClick={() => navigate('/')} className="text-slate-700 hover:text-slate-900">Home</button>
            <button onClick={() => navigate('/learn-more')} className="text-slate-700 hover:text-slate-900">Learn More</button>
          </div>

          <div className="flex items-center gap-4">
            <Button 
              data-testid="nav-cta-button"
              onClick={() => navigate(localStorage.getItem('token') ? '/dashboard' : '/auth')}
              className="bg-[#b4e717] text-[#1C4B42] px-6 py-2 rounded-full hover:bg-[#b4e718] hover:text-[#1C4B42]"
            >
              {localStorage.getItem('token') ? 'Dashboard' : 'Get Started'}
            </Button>
          </div>
        </div>
      </nav>

      <main className="pt-24">
        {/* Hero */}
        <section className="py-20 px-6">
          <div id="what-you-get" className="w-[90%] mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block mb-4 px-3 py-1 bg-[#e8f8f0] text-[#1C4B42] rounded-full text-sm font-medium">What you'll get</div>
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">A powerful, privacy-first analytics dashboard</h1>
              <p className="text-lg text-slate-600 mb-6">SignalVista collects anonymized interaction events and transforms them into clear metrics and visualizations that inform product and marketing decisions. The platform aggregates events into sessions, computes retention and cohort metrics, and generates visual explorations like funnels and time-series charts. Natural-language search surfaces the most relevant visual answers for everyday questions, while export and integration options enable sharing with BI tools. Strong privacy defaults anonymize personal data and respect consent, so teams can measure real engagement without compromising user trust. The result is a focused dashboard that highlights trends, surface anomalies, and makes it simple to track outcomes against goals.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={() => navigate('/auth')} className="bg-[#b4e717] text-[#1C4B42] px-6 py-3 hover:bg-[#b4e718]">Get started — it's free</Button>
                  <Button variant="outline" onClick={() => {
                    const el = document.getElementById('dashboard-details');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    else {
                      // if not present, ensure we're on this page then scroll after navigation
                      navigate('/learn-more');
                      setTimeout(() => {
                        document.getElementById('dashboard-details')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 300);
                    }
                  }} className="px-6 py-3">See dashboard details</Button>
              </div>
            </div>

            {/* Right: Dashboard image / mockup */}
            <div className="flex justify-center lg:justify-end">
              <img
                src="/what-you-get-hero.png"
                alt="Dashboard Image"
                className="max-w-full rounded-md"
                style={{ boxShadow: '0 10px 20px rgb(180 231 23 / 18%), 0 6px 6px rgb(19 105 97 / 25%)' }}
              />
            </div>
          </div>
        </section>

          {/* Dashboard details section */}
          <section id="dashboard-details" className="py-12 px-6 bg-white border-t">
            <div className="w-[90%] mx-auto">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">How data appears in the dashboard</h2>
              <p className="text-slate-600 mb-6">Dashboard visualizations combine aggregated event streams and sessionized metrics to present clear panels: time-series charts for trends, cohort tables for retention, conversion funnels for drop-off analysis, and summary KPIs for top-level monitoring. Charts are interactive — hover for tooltips, zoom by date range, and filter by segments. Reports can be exported as CSV or shared as snapshot links for collaborators.</p>

              <h3 className="text-xl font-semibold mt-6 mb-2">Settings & data management</h3>
              <p className="text-slate-600 mb-4">From the settings panel you control retention windows, sampling rates, which events are collected, and privacy defaults such as IP anonymization and consent handling. You can enable or disable integrations, configure alert thresholds, and set user roles and access permissions for team members.</p>

              <h3 className="text-xl font-semibold mt-6 mb-2">Installing the analytics collector</h3>
              <p className="text-slate-600 mb-3">Add the small collector snippet to each page you want tracked. Place it in the site's <code className="bg-slate-100 px-1 rounded">&lt;head&gt;</code> or before the closing <code className="bg-slate-100 px-1 rounded">&lt;/body&gt;</code> tag. The snippet batches events and sends them efficiently to the backend with minimal impact on page performance.</p>
              <pre className="bg-slate-100 p-4 rounded text-sm overflow-auto mb-4"><code>{`<!-- SignalVista collector -->
  <script>
    (function(){
      window.SignalVista = window.SignalVista || [];
      function sv(){ SV.push(arguments);} 
      var SV = window.SignalVista; SV('init', { projectId: 'YOUR_PROJECT_ID' });
      var s = document.createElement('script'); s.src = 'https://cdn.signalvista.example/collector.js'; s.async = true;
      document.head.appendChild(s);
    })();
  </script>`}</code></pre>

              <h3 className="text-xl font-semibold mt-6 mb-2">Managing event tracking</h3>
              <p className="text-slate-600 mb-6">Use the tracking API to send custom events for user actions (e.g., purchases, form submissions). Name events consistently and include meaningful attributes to make segmentation and filtering reliable. The dashboard provides tools to map events to meaningful labels, create derived metrics, and preview how the events will appear before enabling them in production.</p>

              <p className="text-slate-600">These controls let teams adopt tracking incrementally, validate data, and maintain privacy while gaining actionable insights from real user behavior.</p>
            </div>
          </section>

        {/* Secondary content sections */}
        <section className="py-16 px-6 bg-gray-50">
          <div className="w-[90%] mx-auto grid md:grid-cols-3 gap-8">
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
