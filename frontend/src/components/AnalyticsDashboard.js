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

      {/* Traffic Sources */}
      <Card className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Traffic Sources</h3>
        <p className="text-sm text-slate-600 mb-6">Where your visitors are coming from</p>

        {totalPageviews === 0 ? (
          <p className="text-slate-500 text-center py-8">No referrer data available</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

            {/* Right column - Continent Traffic Bar Chart */}
            <div className="lg:col-span-1">
              <h4 className="text-sm font-semibold text-slate-900 mb-6">Traffic by Continent</h4>
              {analytics?.continents && analytics.continents.length > 0 ? (
                <div className="w-full">
                  {/* SVG Bar Chart */}
                  <svg width="100%" height="280" viewBox="0 0 500 280" preserveAspectRatio="none" className="w-full" style={{ overflow: 'visible' }}>
                    {/* Background grid lines */}
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <g key={`grid-${i}`}>
                        <line x1="30" y1={240 - (i * 40)} x2="500" y2={240 - (i * 40)} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2,2" />
                        <text x="25" y={243 - (i * 40)} fontSize="10" fill="#94a3b8" textAnchor="end">
                          {Math.round((i * 5))}
                        </text>
                      </g>
                    ))}
                    
                    {/* Y-axis */}
                    <line x1="30" y1="10" x2="30" y2="240" stroke="#cbd5e1" strokeWidth="2" />
                    {/* X-axis */}
                    <line x1="30" y1="240" x2="500" y2="240" stroke="#cbd5e1" strokeWidth="2" />

                    {/* Bars */}
                    {(() => {
                      const maxPercentage = 100;
                      const barWidth = (460 / analytics.continents.length) * 0.7;
                      const spacing = 460 / analytics.continents.length;
                      const colors = ['#c7b9f7', '#7dd3fc', '#86efac', '#fcd34d', '#fca5a5', '#f0a4d4'];
                      
                      return analytics.continents.map((continent, index) => {
                        const barHeight = (continent.percentage / maxPercentage) * 200;
                        const xPos = 40 + (index * spacing);
                        const yPos = 240 - barHeight;
                        const barColor = colors[index % colors.length];
                        
                        return (
                          <g key={`bar-${index}`}>
                            {/* Bar */}
                            <rect
                              x={xPos}
                              y={yPos}
                              width={barWidth}
                              height={barHeight}
                              fill={barColor}
                              rx="3"
                              className="transition-all hover:opacity-80 cursor-pointer"
                              opacity="1"
                            >
                              <title>{`${continent.name}: ${continent.count} (${continent.percentage}%)`}</title>
                            </rect>
                            
                            {/* Value label on top of bar */}
                            {barHeight > 15 && (
                              <text
                                x={xPos + barWidth / 2}
                                y={yPos - 5}
                                fontSize="10"
                                fontWeight="bold"
                                fill="#1e293b"
                                textAnchor="middle"
                              >
                                {continent.percentage}%
                              </text>
                            )}
                            
                            {/* Continent label below */}
                            <text
                              x={xPos + barWidth / 2}
                              y="260"
                              fontSize="11"
                              fill="#475569"
                              textAnchor="middle"
                              fontWeight="500"
                            >
                              {continent.name.split(' ')[0]}
                            </text>
                          </g>
                        );
                      });
                    })()}

                    {/* Y-axis label */}
                    <text x="12" y="125" fontSize="11" fill="#94a3b8" textAnchor="middle" transform="rotate(-90, 12, 125)">
                      %
                    </text>
                  </svg>

                  {/* Legend - Below Chart */}
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {analytics.continents.map((continent, index) => {
                      const colors = ['#c7b9f7', '#7dd3fc', '#86efac', '#fcd34d', '#fca5a5', '#f0a4d4'];
                      const barColor = colors[index % colors.length];
                      return (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: barColor }}
                          />
                          <span className="text-slate-700">
                            {continent.name} <span className="text-slate-500 font-medium">({continent.count})</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-center py-8 text-sm">No continent data available</p>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}