import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEventStore } from '@/store/eventStore';
import { useBookingStore } from '@/store/bookingStore';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency, formatDate, formatTime } from '@/utils/format';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Tag, 
  ShieldCheck, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Minus, 
  ArrowRight,
  Share2,
  Info
} from 'lucide-react';

export const EventDetailPage: React.FC = () => {
  const { identifier } = useParams<{ identifier: string }>();
  const navigate = useNavigate();

  const { currentEvent, isLoadingCurrentEvent, error, fetchEventBySlugOrId } = useEventStore();
  const { isAuthenticated } = useAuthStore();
  const { 
    setSelectedEvent, 
    selectedTickets, 
    updateTicketQuantity, 
    getTotalPrice, 
    getTotalTicketsCount, 
    reserveOrder,
    isLoading: isReserving,
    error: reservationError 
  } = useBookingStore();

  const [activeTab, setActiveTab] = useState<'details' | 'venue' | 'terms'>('details');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (identifier) {
      fetchEventBySlugOrId(identifier);
    }
  }, [identifier]);

  useEffect(() => {
    if (currentEvent) {
      setSelectedEvent(currentEvent);
    }
  }, [currentEvent]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleProceedToCheckout = async () => {
    if (!isAuthenticated) {
      // Redirect to login with redirect back
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    try {
      await reserveOrder();
      navigate('/checkout');
    } catch {
      // Error handled in store state
    }
  };

  if (isLoadingCurrentEvent) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-8 animate-pulse">
        <div className="h-96 rounded-3xl bg-slate-900/60" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-8 w-2/3 rounded-xl bg-slate-900" />
            <div className="h-24 rounded-xl bg-slate-900/50" />
          </div>
          <div className="h-80 rounded-2xl bg-slate-900" />
        </div>
      </div>
    );
  }

  if (error || !currentEvent) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-bold text-white">Event Not Found</h2>
        <p className="text-sm text-slate-400">
          {error || "The event you are looking for does not exist or may have been unlisted."}
        </p>
        <button
          onClick={() => navigate('/')}
          className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Return to All Events
        </button>
      </div>
    );
  }

  const categories = currentEvent.ticket_categories || currentEvent.categories || [];
  const totalCount = getTotalTicketsCount();
  const subtotal = getTotalPrice();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      {/* Top Banner Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">
        <div className="relative aspect-[21/9] sm:aspect-[24/9] w-full overflow-hidden">
          <img
            src={currentEvent.banner_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&q=80'}
            alt={currentEvent.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        </div>

        {/* Floating Banner Title & Tags */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-indigo-600/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
              {currentEvent.category}
            </span>
            <span className="rounded-full bg-slate-900/80 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/30 backdrop-blur-md flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> High-Availability Quotas
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            {currentEvent.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300 pt-1">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-indigo-400" />
              <span>{formatDate(currentEvent.start_time)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-indigo-400" />
              <span>{formatTime(currentEvent.start_time)} - {formatTime(currentEvent.end_time)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-cyan-400" />
              <span className="truncate max-w-xs">{currentEvent.venue_name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Details & Right Ticket Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Event Details, Tabs & Map */}
        <div className="lg:col-span-2 space-y-6">
          {/* Action Row */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            {/* Tabs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('details')}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  activeTab === 'details'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                Event Details
              </button>
              <button
                onClick={() => setActiveTab('venue')}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  activeTab === 'venue'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                Venue & Map
              </button>
              <button
                onClick={() => setActiveTab('terms')}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  activeTab === 'terms'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                Terms & Conditions
              </button>
            </div>

            {/* Share button */}
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-all"
            >
              <Share2 className="h-3.5 w-3.5" />
              {copiedLink ? 'Link Copied!' : 'Share'}
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 space-y-4">
                <h3 className="text-base font-bold text-white">About This Event</h3>
                <p className="text-sm leading-relaxed text-slate-300 whitespace-pre-line">
                  {currentEvent.description}
                </p>
              </div>

              {/* Organizer Badge */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-900/30 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 text-white font-bold">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Organized by</div>
                    <div className="text-sm font-bold text-white">
                      {currentEvent.organizer?.name || 'Authorized Event Host'}
                    </div>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
                  Verified Host
                </span>
              </div>
            </div>
          )}

          {activeTab === 'venue' && (
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 space-y-5">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">{currentEvent.venue_name}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-cyan-400 shrink-0" />
                  {currentEvent.venue_address}
                </p>
              </div>

              {/* Mock interactive venue map container */}
              <div className="relative h-64 w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-2">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px]" />
                <MapPin className="h-8 w-8 text-indigo-400 z-10 animate-bounce" />
                <span className="text-sm font-semibold text-slate-200 z-10">
                  {currentEvent.venue_name}
                </span>
                <span className="text-xs text-slate-500 max-w-md z-10">
                  {currentEvent.venue_address}
                </span>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(
                    `${currentEvent.venue_name} ${currentEvent.venue_address}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="z-10 mt-2 rounded-lg bg-indigo-600/30 border border-indigo-500/40 px-3 py-1 text-xs font-semibold text-indigo-300 hover:bg-indigo-600/50 transition-colors"
                >
                  Open in Google Maps
                </a>
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 space-y-3 text-xs leading-relaxed text-slate-300">
              <h3 className="text-base font-bold text-white mb-2">Admission & Ticket Terms</h3>
              <ul className="list-disc pl-5 space-y-2 text-slate-400">
                <li>All tickets issued are non-refundable once payment is completed.</li>
                <li>Each ticket QR code is cryptographically unique and will only permit a single gate check-in.</li>
                <li>Ticket holders must show a valid government-issued ID matching the registered ticket name upon entrance.</li>
                <li>The event organizer reserves the right to refuse entry if counterfeit or duplicated passes are detected.</li>
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Ticket Category Selector Card (Sticky) */}
        <div className="sticky top-20 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="border-b border-slate-800 pb-4 space-y-1">
            <h3 className="text-lg font-bold text-white">Select Tickets</h3>
            <p className="text-xs text-slate-400">
              Pick your desired category tier and quantity (max 10 total).
            </p>
          </div>

          {reservationError && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{reservationError}</span>
            </div>
          )}

          {/* Ticket categories list */}
          <div className="space-y-4">
            {categories.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No ticket categories currently released for this event.
              </div>
            ) : (
              categories.map((cat) => {
                const qty = selectedTickets[cat.id] || 0;
                const isSoldOut = cat.available_quota <= 0;

                return (
                  <div
                    key={cat.id}
                    className={`rounded-2xl border p-4 transition-all ${
                      qty > 0
                        ? 'border-indigo-500 bg-indigo-950/20'
                        : isSoldOut
                        ? 'border-slate-800/60 bg-slate-950/40 opacity-60'
                        : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          {cat.name}
                          {isSoldOut && (
                            <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-rose-400">
                              Sold Out
                            </span>
                          )}
                        </div>
                        {cat.description && (
                          <p className="text-xs text-slate-400 leading-normal">
                            {cat.description}
                          </p>
                        )}
                        <div className="text-xs font-semibold text-emerald-400 pt-1">
                          {formatCurrency(cat.price)}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {cat.available_quota} seats left
                        </div>
                      </div>

                      {/* Quantity Stepper */}
                      {!isSoldOut && (
                        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 p-1">
                          <button
                            type="button"
                            onClick={() => updateTicketQuantity(cat.id, qty - 1, cat.available_quota)}
                            disabled={qty <= 0}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-5 text-center text-xs font-bold text-white">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateTicketQuantity(cat.id, qty + 1, cat.available_quota)}
                            disabled={qty >= Math.min(10, cat.available_quota)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Subtotal & Action */}
          <div className="border-t border-slate-800 pt-4 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Selected Quantity</span>
              <span className="font-semibold text-white">{totalCount} tickets</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-200">Total Price</span>
              <span className="text-xl font-black text-indigo-400">
                {formatCurrency(subtotal)}
              </span>
            </div>

            <button
              onClick={handleProceedToCheckout}
              disabled={totalCount === 0 || isReserving}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-400 hover:to-indigo-500 disabled:opacity-40 disabled:pointer-events-none transition-all hover:scale-[1.01]"
            >
              {isReserving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Holding Tickets...
                </>
              ) : (
                <>
                  {isAuthenticated ? 'Proceed to Checkout' : 'Sign In to Reserve'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <Info className="h-3.5 w-3.5 text-indigo-400" />
              <span>Reserves inventory atomically for 15 minutes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
