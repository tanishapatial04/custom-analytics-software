import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from './ui/card';
import { Eye, Users, Activity, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function AnalyticsDashboard({ projectId }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(7);

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

  if (loading) {
    return (
      <div className="text-center py-20">
        <Activity className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
        <p className="text-slate-600">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="analytics-dashboard">
      {/* Date Range Selector */}
      <div className="flex justify-end">
        <select
          data-testid="date-range-selector"
          value={dateRange}
          onChange={(e) => setDateRange(Number(e.target.value))}
          className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg" data-testid="metric-pageviews">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{analytics?.total_pageviews || 0}</div>
              <div className="text-sm text-blue-100">Total Pageviews</div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg" data-testid="metric-sessions">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{analytics?.unique_sessions || 0}</div>
              <div className="text-sm text-purple-100">Unique Sessions</div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg" data-testid="metric-events">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{analytics?.total_events || 0}</div>
              <div className="text-sm text-green-100">Total Events</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Pages */}
      <Card className="bg-white rounded-2xl shadow-lg p-8" data-testid="top-pages-card">
        <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-indigo-600" />
          Top Pages
        </h3>
        {analytics?.top_pages && analytics.top_pages.length > 0 ? (
          <div className="space-y-3">
            {analytics.top_pages.map((page, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="text-slate-700 font-medium truncate max-w-md">{page.url}</div>
                </div>
                <div className="text-slate-900 font-bold">{page.views} views</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-600 text-center py-8">No page data available yet</p>
        )}
      </Card>

      {/* Daily Traffic Chart */}
      <Card className="bg-white rounded-2xl shadow-lg p-8" data-testid="daily-traffic-card">
        <h3 className="text-2xl font-bold text-slate-900 mb-6">Daily Traffic</h3>
        {analytics?.daily_traffic && analytics.daily_traffic.length > 0 ? (
          <div className="space-y-2">
            {analytics.daily_traffic.map((day, index) => {
              const maxCount = Math.max(...analytics.daily_traffic.map(d => d.count));
              const width = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
              return (
                <div key={index} className="flex items-center gap-4">
                  <div className="text-sm text-slate-600 font-medium w-24">{day.date}</div>
                  <div className="flex-1 bg-slate-100 rounded-full h-8 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full flex items-center justify-end px-3 transition-all"
                      style={{ width: `${width}%` }}
                    >
                      <span className="text-white text-sm font-semibold">{day.count}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-600 text-center py-8">No traffic data available yet</p>
        )}
      </Card>
    </div>
  );
}
