import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Eye, Users, Activity, TrendingUp, Download, ArrowUp, Search } from 'lucide-react';
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

  // Calculate percentage changes (simplified - would compare with previous period in production)
  const pageviewsChange = 12;
  const sessionsChange = 8;
  const eventsChange = 15;
  
  // Filter pages based on search
  const filteredPages = analytics?.top_pages?.filter(page => 
    page.url.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Calculate pie chart percentages
  const totalMetric = analytics?.total_events || 0;
  const sessionsPercent = analytics?.unique_sessions ? Math.round((analytics.unique_sessions / totalMetric) * 100) : 0;
  const pageviewsPercent = analytics?.total_pageviews ? Math.round((analytics.total_pageviews / totalMetric) * 100) : 0;
  const otherPercent = Math.max(0, 100 - sessionsPercent - pageviewsPercent);

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
              <p className="text-slate-600 text-sm font-medium">Lorem ipsum</p>
              <div className="flex items-end gap-2 mt-1">
                <div className="text-4xl font-bold text-slate-900">
                  {analytics?.total_pageviews || 0}
                </div>
                <div className="flex items-center gap-1 text-green-600 text-sm mb-1">
                  <ArrowUp className="w-4 h-4" />
                  <span>{pageviewsChange}%</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">Duis at amet, consectetur adipiscing elit</p>
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
              <p className="text-slate-600 text-sm font-medium">Lorem ipsum</p>
              <div className="flex items-end gap-2 mt-1">
                <div className="text-4xl font-bold text-slate-900">
                  {analytics?.unique_sessions || 0}
                </div>
                <div className="flex items-center gap-1 text-green-600 text-sm mb-1">
                  <ArrowUp className="w-4 h-4" />
                  <span>{sessionsChange}%</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">Vel illum dolore eu feugiat nulla</p>
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
              <p className="text-slate-600 text-sm font-medium">Lorem ipsum</p>
              <div className="flex items-end gap-2 mt-1">
                <div className="text-4xl font-bold text-slate-900">
                  {analytics?.total_events || 0}
                </div>
                <div className="flex items-center gap-1 text-green-600 text-sm mb-1">
                  <ArrowUp className="w-4 h-4" />
                  <span>{eventsChange}%</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">Facilisis at vero eros et accumsan et</p>
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
          <h3 className="text-lg font-bold text-slate-900 mb-6">Dolor sit amet</h3>
          {analytics?.daily_traffic && analytics.daily_traffic.length > 0 ? (
            <div className="space-y-4">
              {/* Simplified line chart representation */}
              <div className="h-64 flex items-end gap-2 justify-between">
                {analytics.daily_traffic.map((day, index) => {
                  const maxCount = Math.max(...analytics.daily_traffic.map(d => d.count));
                  const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                  return (
                    <div 
                      key={index} 
                      className="flex-1 flex flex-col items-center group"
                    >
                      <div className="w-full bg-gradient-to-t from-blue-400 to-blue-300 rounded-t opacity-70 hover:opacity-100 transition-all" 
                        style={{ height: `${Math.max(height, 5)}%`, minHeight: '5%' }}>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">{day.date.slice(-2)}</p>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-6 text-xs text-slate-600 mt-4">
                <div><span className="inline-block w-3 h-3 bg-blue-400 rounded mr-2"></span>Lorem</div>
                <div><span className="inline-block w-3 h-3 bg-orange-400 rounded mr-2"></span>Ipsum</div>
              </div>
            </div>
          ) : (
            <p className="text-slate-600 text-center py-8">No traffic data available yet</p>
          )}
        </Card>

        {/* Right Column - Distribution Pie */}
        <Card className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Consectetur</h3>
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
                  <p className="text-2xl font-bold text-purple-600">75%</p>
                </div>
              </div>
            </div>
            <div className="space-y-2 w-full text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Lorem</span>
                <span className="font-medium text-slate-900">{pageviewsPercent}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Ipsum</span>
                <span className="font-medium text-slate-900">{sessionsPercent}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Dolor</span>
                <span className="font-medium text-slate-900">{otherPercent}%</span>
              </div>
            </div>
            <Button className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white">
              Subscript
            </Button>
          </div>
        </Card>
      </div>

      {/* Bottom Section - Pages and Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Pages */}
        <Card className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6 border border-slate-100">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Dolor sit amet</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search..."
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

        {/* Commodity Stats */}
        <Card className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Commodity</h3>
          <div className="space-y-4">
            {/* Mini Chart */}
            <div className="bg-gradient-to-t from-blue-100 to-blue-50 rounded-lg p-4 h-32 flex flex-col justify-end">
              <div className="flex items-end gap-1 h-24">
                {[40, 30, 60, 45, 70, 50].map((height, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-blue-400 to-blue-300 rounded-t"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-500">Sed diam nonummy nibh</p>
          </div>
        </Card>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Delerit augue */}
        <Card className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Delerit augue</h3>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <span className="inline-block w-3 h-3 bg-purple-500 rounded"></span>
              <span className="text-sm text-slate-600">Lorem</span>
            </div>
            <div className="flex gap-2">
              <span className="inline-block w-3 h-3 bg-blue-500 rounded"></span>
              <span className="text-sm text-slate-600">Ipsum</span>
            </div>
            <div className="flex gap-2">
              <span className="inline-block w-3 h-3 bg-orange-500 rounded"></span>
              <span className="text-sm text-slate-600">Dolor</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 flex gap-1 overflow-hidden">
            <div className="bg-purple-500 rounded-full" style={{ width: '35%' }}></div>
            <div className="bg-blue-500 rounded-full" style={{ width: '45%' }}></div>
            <div className="bg-orange-500 rounded-full" style={{ width: '20%' }}></div>
          </div>
        </Card>

        {/* Consectetur */}
        <Card className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Consectetur</h3>
          <div className="relative w-full h-24 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-32 h-32">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="8"
                strokeDasharray="62.8 251.2"
                strokeDashoffset="0"
                transform="rotate(-90 50 50)"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#f97316"
                strokeWidth="8"
                strokeDasharray="125.6 251.2"
                strokeDashoffset="-62.8"
                transform="rotate(-90 50 50)"
              />
              <text x="50" y="55" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#1e293b">
                30%
              </text>
              <text x="50" y="75" textAnchor="middle" fontSize="10" fill="#64748b">
                70%
              </text>
            </svg>
          </div>
        </Card>

        {/* Commodities Chart */}
        <Card className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Commodities</h3>
          <div className="flex items-end gap-2 h-32">
            {[70, 45, 60, 35, 50, 65].map((height, i) => (
              <div
                key={i}
                className="flex-1 bg-gradient-to-t from-orange-400 to-orange-300 rounded-t"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
