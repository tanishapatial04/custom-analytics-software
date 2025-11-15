import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Eye, Users, Activity, TrendingUp, Download, ArrowUp, Search, MapPin, Link, Globe, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function AnalyticsDashboard({ projectId }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(7);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, [projectId, dateRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`/analytics/${projectId}/overview?days=${dateRange}`);
      setAnalytics(response.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      toast.info('Generating CSV report...');
      const response = await axios.get(`/analytics/${projectId}/export?days=${dateRange}`, {
        responseType: 'blob'
      });
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics_${projectId}_${dateRange}days.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success('CSV report downloaded');
    } catch (error) {
      toast.error('Failed to export CSV');
    }
  };

  // Render
  // You may need to define pageviewsPercent, sessionsPercent, otherPercent, filteredPages, browserEntries, totalEvents, referrers, totalPageviews, etc. above this return if not already present.
  return (
    <div>
      {/* Right Column - Event Distribution */}
      <Card className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Traffic Composition</h3>
        <p className="text-sm text-slate-600 mb-6">Percentage breakdown of traffic types</p>
        <div className="flex flex-col items-center">
          {/* Pie Chart Representation */}
          <div className="relative w-32 h-32 mb-6">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f3f4f6" strokeWidth="2" />
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                stroke="#7c3aed"
                strokeWidth="2"
                strokeDasharray={`${pageviewsPercent} ${100 - pageviewsPercent}`}
              />
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                stroke="#f97316"
                strokeWidth="2"
                strokeDasharray={`${sessionsPercent} ${100 - sessionsPercent}`}
                strokeDashoffset={-(pageviewsPercent)}
              />
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                stroke="#60a5fa"
                strokeWidth="2"
                strokeDasharray={`${otherPercent} ${100 - otherPercent}`}
                strokeDashoffset={-(pageviewsPercent + sessionsPercent)}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{pageviewsPercent}%</p>
                <p className="text-xs text-slate-500">Pages</p>
              </div>
            </div>
          </div>
          <div className="space-y-2 w-full text-sm">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-purple-600 rounded-full"></span>
                <span className="text-slate-600">Pageviews</span>
              </div>
              <span className="font-medium text-slate-900">{pageviewsPercent}%</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-orange-600 rounded-full"></span>
                <span className="text-slate-600">Sessions</span>
              </div>
              <span className="font-medium text-slate-900">{sessionsPercent}%</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                <span className="text-slate-600">Other Events</span>
              </div>
              <span className="font-medium text-slate-900">{otherPercent}%</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Bottom Section - Pages and Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Pages */}
        <Card className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6 border border-slate-100">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Most Visited Pages</h3>
            <p className="text-sm text-slate-600 mb-4">Top 5 pages with highest traffic</p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search pages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
              />
            </div>
          </div>
          {filteredPages && filteredPages.length > 0 ? (
            <div className="space-y-3">
              {filteredPages.map((page, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-700 font-medium truncate text-sm">{page.url}</p>
                    </div>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <p className="font-bold text-slate-900">{page.views}</p>
                    <p className="text-xs text-slate-500">views</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-600 text-center py-8">No pages match your search</p>
          )}
        </Card>

        {/* Browser Distribution */}
        <Card className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Browser Distribution</h3>
          <p className="text-sm text-slate-600 mb-6">Top browsers used by visitors</p>
          <div className="space-y-4">
            {browserEntries.length > 0 ? (
              browserEntries.map(([browser, count], index) => {
                const percent = Math.round((count / totalEvents) * 100);
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600 font-medium">{browser}</span>
                      <span className="font-semibold text-slate-900">{percent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-full rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-500 text-center py-4">No browser data available</p>
            )}
          </div>
        </Card>
      </div>

      {/* Traffic Sources */}
      <Card className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Traffic Sources</h3>
        <p className="text-sm text-slate-600 mb-6">Where your visitors are coming from</p>

        {totalPageviews === 0 ? (
          <p className="text-slate-500 text-center py-8">No referrer data available</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Overview donuts */}
            <div className="lg:col-span-1 space-y-4">
              {(() => {
                // categorize referrers
                const searchEngines = ['google', 'bing', 'yahoo', 'duck', 'baidu', 'yandex'];
                let searchCount = 0;
                let directCount = 0;
                let referringCount = 0;
                let otherCount = 0;

                referrers.forEach(r => {
                  const src = (r.source || '').toLowerCase();
                  const c = r.count || 0;
                  if (!src || src === 'direct') {
                    directCount += c;
                  } else if (searchEngines.some(k => src.includes(k))) {
                    searchCount += c;
                  } else if (src.startsWith('http') || src.includes('.')) {
                    referringCount += c;
                  } else {
                    otherCount += c;
                  }
                });

                // ensure totals
                const remainder = Math.max(0, totalPageviews - (searchCount + directCount + referringCount + otherCount));
                otherCount += remainder;

                const items = [
                  { key: 'Search Engines', count: searchCount, color: 'from-emerald-400 to-teal-400', Icon: Globe },
                  { key: 'Direct Traffic', count: directCount, color: 'from-sky-400 to-indigo-500', Icon: MapPin },
                  { key: 'Referring Sites', count: referringCount, color: 'from-purple-500 to-pink-500', Icon: Link },
                  { key: 'Other', count: otherCount, color: 'from-slate-400 to-slate-600', Icon: ExternalLink }
                ];

                return items.map((it, idx) => {
                  const pct = Math.round((it.count / totalPageviews) * 100);
                  const dash = `${pct} ${100 - pct}`;
                  const Icon = it.Icon;
                  const colorMap = ['#10b981', '#0ea5e9', '#7c3aed', '#64748b'];
                  const strokeColor = colorMap[idx % colorMap.length];
                  return (
                    <div key={idx} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="w-16 h-16 relative flex items-center justify-center">
                        <svg viewBox="0 0 36 36" className="w-16 h-16">
                          <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                          <circle cx="18" cy="18" r="15.915" fill="none" stroke={strokeColor} strokeWidth="3" strokeDasharray={dash} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex flex-col items-center">
                            <Icon className="w-4 h-4 text-slate-700 mb-1" />
                            <span className="text-sm font-semibold text-slate-900">{pct}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-700">{it.key}</div>
                        <div className="text-lg font-bold text-slate-900">{it.count}</div>
                        <div className="text-xs text-slate-500">Compare with last period</div>
                      </div>
                    </div>
                  );
                });
              })()}

            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
