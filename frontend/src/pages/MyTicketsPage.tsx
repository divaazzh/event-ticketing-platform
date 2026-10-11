import React, { useEffect, useState } from 'react';
import { bookingsApi } from '@/services/endpoints';
import { Ticket, Order } from '@/types';
import { formatCurrency, formatDate, formatTime } from '@/utils/format';
import { 
  Ticket as TicketIcon, 
  Calendar, 
  MapPin, 
  Copy, 
  Check, 
  ShoppingBag, 
  Download, 
  Clock, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';

export const MyTicketsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tickets' | 'orders'>('tickets');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'tickets') {
        const res = await bookingsApi.getMyTickets(50, 1);
        setTickets(res.data);
      } else {
        const res = await bookingsApi.getMyOrders(50, 1);
        setOrders(res.data);
      }
    } catch {
      // Graceful fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight text-white">
          My Account & Passes
        </h1>
        <p className="text-xs text-slate-400">
          Manage your confirmed event tickets, dynamic entry QR codes, and past order history.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
        <button
          onClick={() => setActiveTab('tickets')}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'tickets'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <TicketIcon className="h-4 w-4" />
          Active & Issued Tickets ({tickets.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'orders'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          Order History ({orders.length})
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-slate-900/50 border border-slate-800" />
          ))}
        </div>
      ) : activeTab === 'tickets' ? (
        tickets.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-800 p-12 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-slate-400">
              <TicketIcon className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">No Tickets Issued Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You haven't purchased or booked any event tickets yet. Explore trending events to grab your passes!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tickets.map((tkt) => {
              const category = tkt.ticket_category || tkt.ticketCategory;
              const isCopied = copiedCode === tkt.ticket_code;

              return (
                <div
                  key={tkt.id}
                  className="relative flex flex-col sm:flex-row overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 transition-all hover:border-slate-700 shadow-xl"
                >
                  {/* Left Ticket Details */}
                  <div className="flex-1 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-1 text-[11px] font-bold text-indigo-400">
                        {category?.name || 'Standard Pass'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Valid & Active
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-white">
                        {category?.name} Admission
                      </h3>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-indigo-400" />
                        Issued: {formatDate(tkt.created_at)}
                      </div>
                    </div>

                    {/* Ticket Code Box */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-500">
                          Pass Authentication Code
                        </div>
                        <div className="font-mono text-sm font-black text-slate-200">
                          {tkt.ticket_code}
                        </div>
                      </div>
                      <button
                        onClick={() => handleCopyCode(tkt.ticket_code)}
                        className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                        title="Copy ticket code"
                      >
                        {isCopied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Cutout line divider */}
                  <div className="relative border-t sm:border-t-0 sm:border-l border-dashed border-slate-800 flex items-center justify-center p-6 bg-slate-950/40">
                    {/* QR Code SVG Container */}
                    <div className="flex flex-col items-center space-y-2 text-center">
                      <div className="h-36 w-36 rounded-2xl bg-white p-2.5 shadow-lg flex items-center justify-center">
                        {tkt.qr_payload ? (
                          <img
                            src={`data:image/svg+xml;base64,${tkt.qr_payload}`}
                            alt="Ticket QR Code"
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <div className="text-[10px] text-slate-800">QR Code Pending</div>
                        )}
                      </div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Scan at Gate Entrance
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Orders Tab */
        orders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-800 p-12 text-center space-y-4">
            <ShoppingBag className="mx-auto h-8 w-8 text-slate-400" />
            <h3 className="text-base font-bold text-white">No Order History</h3>
            <p className="text-xs text-slate-400">You don't have any recorded orders.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((ord) => {
              const statusColor =
                ord.status === 'paid'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : ord.status === 'pending'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30';

              return (
                <div
                  key={ord.id}
                  className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:border-slate-700"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-black text-white">
                        {ord.order_reference}
                      </span>
                      <span className={`rounded-md px-2.5 py-0.5 text-[11px] font-bold border uppercase tracking-wider ${statusColor}`}>
                        {ord.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400">
                      Placed on {formatDate(ord.created_at)}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {ord.items?.map((item) => (
                        <span
                          key={item.id}
                          className="rounded-lg bg-slate-950/70 border border-slate-800 px-2.5 py-1 text-xs text-slate-300"
                        >
                          {item.quantity}× {item.ticketCategory?.name || 'Tickets'}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center md:items-end flex-col gap-1">
                    <div className="text-xs text-slate-400">Total Settlement</div>
                    <div className="text-xl font-black text-indigo-400">
                      {formatCurrency(ord.total_amount)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
};
