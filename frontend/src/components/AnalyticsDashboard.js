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
  const [hoveredContinent, setHoveredContinent] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const mapRef = useRef(null);

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
      
      // Extract filename from Content-Disposition header or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = `analytics_report_${new Date().toISOString().split('T')[0]}.csv`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('CSV report downloaded successfully!');
    } catch (error) {
      toast.error('Failed to export CSV report');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <Activity className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
        <p className="text-slate-600">Loading analytics...</p>
      </div>
    );
  }

  // Filter pages based on search
  const filteredPages = analytics?.top_pages?.filter(page => 
    page.url.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Calculate metrics from dynamic data
  const totalEvents = analytics?.total_events || 0;
  const totalPageviews = analytics?.total_pageviews || 0;
  const uniqueSessions = analytics?.unique_sessions || 0;
  const avgEventsPerSession = analytics?.avg_events_per_session || 0;
  
  // Dynamic percentage changes from backend
  const pageviewsChange = typeof analytics?.pageviews_change === 'number' ? analytics.pageviews_change : 0;
  const sessionsChange = typeof analytics?.sessions_change === 'number' ? analytics.sessions_change : 0;
  const eventsChange = typeof analytics?.events_change === 'number' ? analytics.events_change : 0;
  
  // Browser distribution data
  const browsers = analytics?.browsers || {};
  const browserEntries = Object.entries(browsers);
  const topBrowser = browserEntries[0];
  const topBrowserPercent = topBrowser ? Math.round((topBrowser[1] / totalEvents) * 100) : 0;
  
  // Referrer data
  const referrers = analytics?.referrers || [];
  const topReferrer = referrers[0];
  const directTraffic = referrers.filter(r => r.source === 'Direct' || r.source === '')[0];
  
  // Calculate pie chart percentages for distribution
  // Pageviews are event_type='pageview', Sessions are unique_sessions, Other events are remaining
  const pageviewsPercent = totalEvents > 0 ? Math.round((totalPageviews / totalEvents) * 100) : 0;
  // Sessions percentage: if we have unique_sessions and total_events, calculate how much sessions represent
  // Assuming sessions is roughly representing the engagement metric
  const sessionsPercent = totalPageviews > 0 ? Math.round((uniqueSessions / totalPageviews) * 100) : 0;
  // Other events are anything that's not a pageview or session-derived
  const otherPercent = Math.max(0, 100 - pageviewsPercent);

  return (
    <div className="space-y-6 p-6 bg-slate-50 min-h-screen" data-testid="analytics-dashboard">
      {/* Header with Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Analytics Dashboard</h1>
          <p className="text-slate-600">Track your website performance and visitor insights</p>
        </div>
        <div className="flex gap-3">
          <select
            data-testid="date-range-selector"
            value={dateRange}
            onChange={(e) => setDateRange(Number(e.target.value))}
            className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <Button
            data-testid="export-csv-button"
            onClick={handleExportCSV}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Pageviews Card */}
        <Card className="bg-white rounded-2xl shadow-md p-6 border border-slate-100" data-testid="metric-pageviews">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-slate-600 text-sm font-medium">Total Pageviews</p>
              <div className="flex items-end gap-2 mt-1">
                <div className="text-4xl font-bold text-slate-900">
                  {totalPageviews.toLocaleString()}
                </div>
                <div className={`flex items-center gap-1 text-sm mb-1 ${pageviewsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <ArrowUp className="w-4 h-4" />
                  <span>{pageviewsChange > 0 ? '+' : ''}{pageviewsChange}%</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">Total number of page views across all sessions</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        {/* Sessions Card */}
        <Card className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-slate-600 text-sm font-medium">Unique Sessions</p>
              <div className="flex items-end gap-2 mt-1">
                <div className="text-4xl font-bold text-slate-900">
                  {uniqueSessions.toLocaleString()}
                </div>
                <div className={`flex items-center gap-1 text-sm mb-1 ${sessionsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <ArrowUp className="w-4 h-4" />
                  <span>{sessionsChange > 0 ? '+' : ''}{sessionsChange}%</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">Individual user sessions tracked on your site</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>

        {/* Total Events Card */}
        <Card className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-slate-600 text-sm font-medium">Total Events</p>
              <div className="flex items-end gap-2 mt-1">
                <div className="text-4xl font-bold text-slate-900">
                  {totalEvents.toLocaleString()}
                </div>
                <div className={`flex items-center gap-1 text-sm mb-1 ${eventsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <ArrowUp className="w-4 h-4" />
                  <span>{eventsChange > 0 ? '+' : ''}{eventsChange}%</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">Average {avgEventsPerSession} events per session</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Daily Traffic Chart */}
        <Card className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6 border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Traffic Over Time</h3>
          <p className="text-sm text-slate-600 mb-6">Daily traffic breakdown - Shows total events per day over selected period</p>
          {analytics?.daily_traffic && analytics.daily_traffic.length > 0 ? (
            <div className="space-y-4">
              {/* SVG Line Chart with smooth curves */}
              <svg width="100%" height="280" viewBox="0 0 800 280" className="w-full" style={{ overflow: 'visible' }}>
                {/* Grid background */}
                <defs>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                
                {/* Horizontal grid lines */}
                {[0, 1, 2, 3, 4].map((i) => (
                  <line key={`grid-${i}`} x1="40" y1={40 + (i * 56)} x2="780" y2={40 + (i * 56)} stroke="#e2e8f0" strokeWidth="1" />
                ))}
                
                {/* Y-axis */}
                <line x1="40" y1="20" x2="40" y2="240" stroke="#cbd5e1" strokeWidth="2" />
                {/* X-axis */}
                <line x1="40" y1="240" x2="780" y2="240" stroke="#cbd5e1" strokeWidth="2" />
                
                {/* Y-axis labels */}
                {[0, 1, 2, 3, 4].map((i) => {
                  const maxCount = Math.max(...analytics.daily_traffic.map(d => d.count));
                  const label = Math.round((maxCount / 4) * (4 - i));
                  return (
                    <text key={`label-${i}`} x="30" y={47 + (i * 56)} fontSize="10" fill="#64748b" textAnchor="end">
                      {label}
                    </text>
                  );
                })}
                
                {/* Generate line path and area */}
                {(() => {
                  const maxCount = Math.max(...analytics.daily_traffic.map(d => d.count));
                  const dataPoints = analytics.daily_traffic.map((day, index) => {
                    const x = 60 + (index / (analytics.daily_traffic.length - 1 || 1)) * 720;
                    const y = 240 - ((day.count / maxCount) * 200);
                    return { x, y, ...day };
                  });
                  
                  // Build smooth curve path
                  let pathD = `M ${dataPoints[0].x} ${dataPoints[0].y}`;
                  for (let i = 1; i < dataPoints.length; i++) {
                    const prev = dataPoints[i - 1];
                    const curr = dataPoints[i];
                    const cp1x = prev.x + 40;
                    const cp1y = prev.y;
                    const cp2x = curr.x - 40;
                    const cp2y = curr.y;
                    pathD += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${curr.x} ${curr.y}`;
                  }
                  
                  return (
                    <>
                      {/* Area under curve */}
                      <path d={`${pathD} L ${dataPoints[dataPoints.length - 1].x} 240 L ${dataPoints[0].x} 240 Z`} 
                            fill="url(#areaGradient)" />
                      
                      {/* Line */}
                      <path d={pathD} stroke="#3b82f6" strokeWidth="3" fill="none" />
                      
                      {/* Data points */}
                      {dataPoints.map((point, index) => (
                        <g key={`point-${index}`}>
                          <circle cx={point.x} cy={point.y} r="5" fill="#3b82f6" opacity="0" className="hover:opacity-100 transition-opacity" />
                          <circle cx={point.x} cy={point.y} r="3" fill="#fff" stroke="#3b82f6" strokeWidth="2" />
                          {/* Tooltip on hover */}
                          <title>{`${point.date}: ${point.count} events`}</title>
                        </g>
                      ))}
                    </>
                  );
                })()}
                
                {/* X-axis labels */}
                {analytics.daily_traffic.map((day, index) => {
                  if (index % Math.ceil(analytics.daily_traffic.length / 5) === 0 || index === analytics.daily_traffic.length - 1) {
                    const x = 60 + (index / (analytics.daily_traffic.length - 1 || 1)) * 720;
                    return (
                      <text key={`x-label-${index}`} x={x} y="260" fontSize="10" fill="#64748b" textAnchor="middle">
                        {day.date.slice(-2)}
                      </text>
                    );
                  }
                  return null;
                })}
              </svg>
              
              <div className="flex gap-6 text-xs text-slate-600 mt-4 px-4 py-2 bg-slate-50 rounded-lg">
                <div><span className="inline-block w-3 h-3 bg-blue-400 rounded mr-2"></span>Events per Day</div>
              </div>
            </div>
          ) : (
            <p className="text-slate-600 text-center py-8">No traffic data available yet</p>
          )}
        </Card>

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
      </div>

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

      {/* Traffic Sources - outer container; header removed so only inner boxes show backgrounds/shadows */}
      <Card className="rounded-2xl p-0">

        {/* Show real data when available, otherwise render demo data for all three columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start p-6">
            {/* Column 1 - Top Referrers (group common providers like Gmail, Yahoo, Outlook) */}
          <div className="space-y-3 p-4 bg-white rounded-lg border border-slate-100 shadow-sm h-full">
              <h4 className="text-sm font-semibold text-slate-900">Top Referrers</h4>
              {(() => {
                // decide whether to use real data or demo fallback
                const hasReal = totalPageviews > 0 && referrers && referrers.length > 0;
                // Demo referrers if no real data
                const demoReferrers = [
                  { source: 'Google', count: 45 },
                  { source: 'Gmail', count: 25 },
                  { source: 'Outlook/Hotmail', count: 15 },
                  { source: 'Yahoo Mail', count: 8 },
                  { source: 'Direct', count: 7 }
                ];

                const mapProvider = (src) => {
                  if (!src) return 'Direct';
                  const s = src.toLowerCase();
                  if (s.includes('mail.google') || s.includes('gmail')) return 'Gmail';
                  if (s.includes('outlook') || s.includes('office') || s.includes('live.com') || s.includes('hotmail')) return 'Outlook/Hotmail';
                  if (s.includes('yahoo')) return 'Yahoo Mail';
                  if (s.includes('facebook')) return 'Facebook';
                  if (s.includes('twitter') || s.includes('t.co')) return 'Twitter';
                  if (s.includes('linkedin')) return 'LinkedIn';
                  if (s.includes('google')) return 'Google';
                  if (s.includes('bing')) return 'Bing';
                  if (s.includes('duckduckgo') || s.includes('duck')) return 'DuckDuckGo';
                  if (s === 'direct' || s === 'direct / none') return 'Direct';
                  try {
                    const host = (src || '').replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
                    return host || src;
                  } catch (e) {
                    return src;
                  }
                };

                let sourceList = [];
                if (hasReal) {
                  const grouped = {};
                  referrers.forEach(r => {
                    const key = mapProvider(r.source || '');
                    grouped[key] = (grouped[key] || 0) + (r.count || 0);
                  });
                  sourceList = Object.entries(grouped).map(([k, v]) => ({ source: k, count: v }));
                  sourceList.sort((a, b) => b.count - a.count);
                } else {
                  sourceList = demoReferrers;
                }

                const refTotal = totalPageviews > 0 ? totalPageviews : sourceList.reduce((s, it) => s + it.count, 0) || 1;

                return sourceList.slice(0, 8).map((r, idx) => {
                  const pct = Math.round((r.count / refTotal) * 100);
                  const display = r.source;
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {display ? display[0].toUpperCase() : 'R'}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-slate-700 truncate">{display}</div>
                          <div className="text-xs text-slate-500">{r.count} visits</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900">{pct}%</div>
                        <div className="text-xs text-slate-500">of traffic</div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Column 2 - Device Type Distribution */}
            <div className="space-y-3 p-4 bg-white rounded-lg border border-slate-100 shadow-sm h-full">
              <h4 className="text-sm font-semibold text-slate-900">Device Types</h4>
              {(() => {
                const hasDevices = analytics?.devices && Object.keys(analytics.devices).length > 0;
                const demoDevices = { Desktop: 60, Mobile: 35, Tablet: 4, Bot: 1 };
                const devices = hasDevices ? analytics.devices : demoDevices;
                const entries = Object.entries(devices);
                const totalDevices = entries.reduce((s, [, v]) => s + v, 0) || 1;
                return (
                  <div className="space-y-3">
                    {entries.map(([name, count], i) => {
                      const percent = totalDevices > 0 ? Math.round((count / totalDevices) * 100) : 0;
                      const colors = ['bg-sky-400','bg-emerald-400','bg-amber-300','bg-stone-400'];
                      return (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-600 font-medium">{name}</span>
                            <span className="font-semibold text-slate-900">{percent}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div className={`${colors[i % colors.length]} h-full rounded-full`} style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Column 3 - Traffic by Country */}
            <div className="space-y-3 p-4 bg-white rounded-lg border border-slate-100 shadow-sm h-full">
              <h4 className="text-sm font-semibold text-slate-900">Traffic by Country</h4>
              {(() => {
                const hasCountries = analytics?.countries && analytics.countries.length > 0;
                const demoCountries = [
                  { iso: 'US', count: 60, percentage: 60 },
                  { iso: 'IN', count: 20, percentage: 20 },
                  { iso: 'GB', count: 10, percentage: 10 },
                  { iso: 'DE', count: 5, percentage: 5 },
                  { iso: 'CA', count: 5, percentage: 5 }
                ];
                const countries = hasCountries ? analytics.countries : demoCountries;

                return (
                  <div className="w-full">
                    <svg width="100%" height="220" viewBox="0 0 400 220" preserveAspectRatio="none" className="w-full" style={{ overflow: 'visible' }}>
                      {[0,1,2,3,4].map(i => (
                        <line key={i} x1="10" y1={180 - i*36} x2="390" y2={180 - i*36} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2,2" />
                      ))}

                      {(() => {
                        const max = Math.max(...countries.map(c => c.count), 1);
                        const barWidth = 320 / countries.length;
                        return countries.map((c, idx) => {
                          const h = (c.count / max) * 140;
                          const x = 30 + idx * barWidth;
                          const y = 180 - h;
                          const color = ['#7dd3fc','#86efac','#fcd34d','#fca5a5','#c7b9f7'][idx % 5];
                          return (
                            <g key={idx}>
                              <rect x={x} y={y} width={barWidth*0.6} height={h} rx="3" fill={color} />
                              <text x={x + (barWidth*0.3)} y={y - 6} fontSize="10" fill="#0f172a" textAnchor="middle">{c.percentage ?? Math.round((c.count / (countries.reduce((s, it) => s + it.count, 0) || 1)) * 100)}%</text>
                              <text x={x + (barWidth*0.3)} y={195} fontSize="10" fill="#475569" textAnchor="middle">{c.iso}</text>
                            </g>
                          );
                        });
                      })()}
                    </svg>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-700">
                      {countries.map((c, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded" style={{ backgroundColor: ['#7dd3fc','#86efac','#fcd34d','#fca5a5','#c7b9f7'][i % 5] }} />
                          <div>{c.iso} <span className="text-slate-500">({c.count})</span></div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
      </Card>
    </div>
  );
}