import React, { useEffect, useState } from 'react';
import { adminApi, eventsApi } from '@/services/endpoints';
import { AdminMetrics, EventItem } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';
import { 
  DollarSign, 
  Ticket as TicketIcon, 
  Calendar, 
  Users, 
  Plus, 
  Search, 
  TrendingUp, 
  Sparkles, 
  CheckCircle, 
  AlertCircle,
  X
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  
  // Modal State for New Event
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Technology',
    description: '',
    banner_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80',
    venue_name: '',
    venue_address: '',
    status: 'published',
    start_time: '',
    end_time: '',
    ticket_name: 'General Admission',
    ticket_price: '500000',
    ticket_quota: '100',
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [metricsData, eventsData] = await Promise.all([
        adminApi.getMetrics(),
        eventsApi.getEvents({ per_page: 50 }),
      ]);
      setMetrics(metricsData);
      setEvents(eventsData.data);
    } catch {
      // Handle permission error or mock metrics
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError(null);

    try {
      await eventsApi.createEvent({
        title: formData.title,
        category: formData.category,
        description: formData.description,
        banner_url: formData.banner_url,
        venue_name: formData.venue_name,
        venue_address: formData.venue_address,
        status: formData.status,
        start_time: formData.start_time,
        end_time: formData.end_time,
        ticket_categories: [
          {
            name: formData.ticket_name,
            price: parseFloat(formData.ticket_price),
            total_quota: parseInt(formData.ticket_quota, 10),
          },
        ],
      });

      setIsModalOpen(false);
      loadDashboardData();
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : 'Failed to publish event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    e.category?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400 border border-cyan-500/20">
            <Sparkles className="h-3.5 w-3.5" /> High-Performance Administrative Hub
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Operations & Analytics Dashboard
          </h1>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-400 hover:to-indigo-500 transition-all hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" />
          Create New Event
        </button>
      </div>

      {/* Metrics Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Gross Revenue</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {metrics ? formatCurrency(metrics.total_revenue) : 'Rp 0'}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> Real-time settled GMV
          </div>
        </div>

        {/* Total Tickets Sold */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Tickets Dispatched</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <TicketIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {metrics?.total_tickets_sold ?? 0}
          </div>
          <div className="text-[11px] text-slate-400">Zero oversold inventory</div>
        </div>

        {/* Active Events */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active Events</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {metrics?.active_events ?? 0}
          </div>
          <div className="text-[11px] text-cyan-400">Published and on-sale</div>
        </div>

        {/* Registered Users */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Customer Accounts</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {metrics?.registered_users ?? 0}
          </div>
          <div className="text-[11px] text-purple-400">Verified platform identities</div>
        </div>
      </div>

      {/* 7-Day Revenue Trend Visual Chart */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-white">Daily Revenue Velocity</h3>
            <p className="text-xs text-slate-400">Last 7 recorded sales days breakdown</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" /> Settled Revenue
            </span>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="h-52 w-full flex items-end gap-3 sm:gap-6 pt-6">
          {metrics?.sales_chart && metrics.sales_chart.length > 0 ? (
            metrics.sales_chart.map((point) => {
              const maxVal = Math.max(...metrics.sales_chart.map((p) => p.total), 1);
              const heightPercent = Math.max(10, Math.min(100, (point.total / maxVal) * 100));

              return (
                <div key={point.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="text-[10px] text-indigo-300 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatCurrency(point.total)}
                  </div>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-indigo-600 to-cyan-400 transition-all group-hover:brightness-125"
                  />
                  <div className="text-[10px] text-slate-400 font-mono">
                    {point.date.slice(5)}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="h-full w-full flex items-center justify-center text-xs text-slate-500">
              No recent 7-day sales points to display.
            </div>
          )}
        </div>
      </div>

      {/* Event Catalog Management Table */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-white">Event Inventory Management</h3>
            <p className="text-xs text-slate-400">
              Monitor quota allocations, pricing schedules, and live statuses.
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search table..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="h-9 w-64 rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/50 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Event Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Venue</th>
                <th className="py-3 px-4">Schedule</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Tiers & Quota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEvents.map((evt) => {
                const cats = evt.ticket_categories || evt.categories || [];
                const totalQuota = cats.reduce((acc, c) => acc + c.total_quota, 0);
                const availQuota = cats.reduce((acc, c) => acc + c.available_quota, 0);

                return (
                  <tr key={evt.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-white max-w-xs truncate">
                      {evt.title}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px]">
                        {evt.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                      {evt.venue_name}
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {formatDate(evt.start_time)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 uppercase">
                        {evt.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                      <strong className="text-white">{availQuota}</strong> / {totalQuota} seats
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create New Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">Create New Event & Release Quota</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {modalError && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Engineering Summit 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Music">Music</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Conference">Conference</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Banner Image URL</label>
                  <input
                    type="url"
                    value={formData.banner_url}
                    onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Full agenda and event details..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Venue Name</label>
                  <input
                    type="text"
                    required
                    value={formData.venue_name}
                    onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
                    placeholder="e.g. JIExpo Hall B"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Venue Address</label>
                  <input
                    type="text"
                    required
                    value={formData.venue_address}
                    onChange={(e) => setFormData({ ...formData, venue_address: e.target.value })}
                    placeholder="Full street address"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">End Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Initial Tier Setup */}
              <div className="border-t border-slate-800 pt-3 space-y-3">
                <div className="font-bold text-white">Initial Ticket Category Tier</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Tier Name</label>
                    <input
                      type="text"
                      required
                      value={formData.ticket_name}
                      onChange={(e) => setFormData({ ...formData, ticket_name: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Price (IDR)</label>
                    <input
                      type="number"
                      required
                      value={formData.ticket_price}
                      onChange={(e) => setFormData({ ...formData, ticket_price: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Total Quota</label>
                    <input
                      type="number"
                      required
                      value={formData.ticket_quota}
                      onChange={(e) => setFormData({ ...formData, ticket_quota: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-800 bg-slate-950 px-5 py-2.5 font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-2.5 font-bold text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-400 hover:to-indigo-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating Event...' : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
