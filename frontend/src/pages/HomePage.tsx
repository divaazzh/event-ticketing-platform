import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useEventStore } from '@/store/eventStore';
import { formatCurrency, formatDate, formatTime } from '@/utils/format';
import { 
  Calendar, 
  MapPin, 
  Search, 
  Tag, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Lock,
  Flame,
  ChevronRight,
  FilterX
} from 'lucide-react';

const CATEGORIES = ['All', 'Technology', 'Music', 'Workshop', 'Conference', 'Entertainment'];

export const HomePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { 
    events, 
    featuredEvents, 
    pagination, 
    currentPage, 
    filters, 
    isLoading, 
    fetchEvents, 
    fetchFeaturedEvents, 
    setFilters, 
    setPage,
    resetFilters 
  } = useEventStore();

  const [localSearch, setLocalSearch] = useState(searchParams.get('search') || '');

  // Sync url param search
  useEffect(() => {
    const q = searchParams.get('search');
    const cat = searchParams.get('category');
    if (q !== null && q !== filters.search) {
      setLocalSearch(q);
      setFilters({ search: q });
    }
    if (cat !== null && cat !== filters.category) {
      setFilters({ category: cat });
    }
  }, [searchParams]);

  useEffect(() => {
    fetchEvents();
    fetchFeaturedEvents();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(localSearch ? { search: localSearch } : {});
    setFilters({ search: localSearch });
  };

  const handleCategorySelect = (category: string) => {
    const chosen = category === 'All' ? '' : category;
    if (chosen) {
      setSearchParams({ category: chosen });
    } else {
      setSearchParams({});
    }
    setFilters({ category: chosen });
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-slate-900/50 via-slate-950 to-slate-950 py-16 sm:py-24">
        {/* Glow backdrop blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-tr from-indigo-600/15 via-cyan-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            Zero-Race Condition Live Engine • High-Concurrency Guaranteed
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Experience Unrivaled Events with{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-300 bg-clip-text text-transparent">
              Instant Confirmed
            </span>{' '}
            Tickets.
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-400 leading-relaxed">
            Direct access to major conferences, exclusive music festivals, and elite developer masterclasses. Guaranteed inventory locking with no double bookings.
          </p>

          {/* Hero Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="mx-auto max-w-2xl flex flex-col sm:flex-row items-center gap-2.5 rounded-2xl border border-slate-700/80 bg-slate-900/90 p-2 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex flex-1 items-center gap-3 px-3 w-full">
              <Search className="h-5 w-5 text-indigo-400 shrink-0" />
              <input
                type="text"
                placeholder="Search events by title, venue, or performer..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-400 hover:to-indigo-500 transition-all hover:scale-[1.02]"
            >
              Discover
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Category Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {CATEGORIES.map((cat) => {
              const active =
                (cat === 'All' && !filters.category) ||
                filters.category.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                    active
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'border border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Highlights (Top 3) */}
      {featuredEvents.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
                <Flame className="h-4 w-4 fill-amber-400 text-amber-400" /> Hot & Trending
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Featured Highlights
              </h2>
            </div>
            <Link
              to="#events-catalog"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              Browse full line-up <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredEvents.map((evt) => (
              <Link
                key={evt.id}
                to={`/events/${evt.slug || evt.id}`}
                className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 transition-all hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col"
              >
                {/* Banner Thumbnail */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
                  <img
                    src={evt.banner_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'}
                    alt={evt.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  <span className="absolute top-3 left-3 rounded-md bg-slate-950/80 px-2.5 py-1 text-[11px] font-semibold text-indigo-300 backdrop-blur-md border border-slate-700/60">
                    {evt.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                      <span>{formatDate(evt.start_time)} • {formatTime(evt.start_time)}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {evt.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {evt.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-400 truncate max-w-[180px]">
                      <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{evt.venue_name}</span>
                    </div>
                    <span className="font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      View Tickets <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Main Events Catalog */}
      <section id="events-catalog" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              All Available Events
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select an event to explore tier categories and reserve seats.
            </p>
          </div>

          {/* Active Filter Indicators */}
          {(filters.search || filters.category) && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Active filter:</span>
              {filters.search && (
                <span className="rounded-lg bg-indigo-500/10 border border-indigo-500/30 px-2 py-1 text-xs text-indigo-300">
                  "{filters.search}"
                </span>
              )}
              {filters.category && (
                <span className="rounded-lg bg-indigo-500/10 border border-indigo-500/30 px-2 py-1 text-xs text-indigo-300">
                  {filters.category}
                </span>
              )}
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 ml-2"
              >
                <FilterX className="h-3.5 w-3.5" /> Clear
              </button>
            </div>
          )}
        </div>

        {/* Loading / Empty / Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="h-80 rounded-2xl border border-slate-800 bg-slate-900/40 animate-pulse"
              />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-slate-400">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-white">No events match your criteria</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              We couldn't find any events with the specified filters. Try searching with other terms or clear filters.
            </p>
            <button
              onClick={resetFilters}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((evt) => {
              const categories = evt.ticket_categories || evt.categories || [];
              const lowestPrice =
                categories.length > 0
                  ? Math.min(...categories.map((c) => Number(c.price)))
                  : null;

              return (
                <Link
                  key={evt.id}
                  to={`/events/${evt.slug || evt.id}`}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-900/60 transition-all hover:border-indigo-500/50 hover:bg-slate-900 hover:shadow-xl hover:shadow-indigo-500/5"
                >
                  <div>
                    {/* Event Banner */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
                      <img
                        src={evt.banner_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80'}
                        alt={evt.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="rounded-md bg-slate-950/80 px-2 py-1 text-[11px] font-semibold text-cyan-300 backdrop-blur-md border border-slate-800">
                          {evt.category}
                        </span>
                      </div>
                      {lowestPrice !== null && (
                        <div className="absolute bottom-3 right-3 rounded-lg bg-slate-950/90 px-2.5 py-1 text-xs font-bold text-emerald-400 backdrop-blur-md border border-slate-800">
                          From {formatCurrency(lowestPrice)}
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                        <span>{formatDate(evt.start_time)}</span>
                        <span>•</span>
                        <span>{formatTime(evt.start_time)}</span>
                      </div>

                      <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                        {evt.title}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-2">
                        {evt.description}
                      </p>

                      <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{evt.venue_name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer card */}
                  <div className="border-t border-slate-800/80 bg-slate-950/40 px-5 py-3 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      {categories.length} ticket {categories.length === 1 ? 'tier' : 'tiers'}
                    </span>
                    <span className="font-semibold text-indigo-400 group-hover:text-indigo-300 inline-flex items-center gap-1">
                      Select Tickets <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination controls */}
        {pagination && pagination.last_page > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6">
            <button
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none"
            >
              Previous
            </button>
            <span className="text-xs text-slate-400 px-3">
              Page <strong className="text-white">{currentPage}</strong> of{' '}
              <strong className="text-white">{pagination.last_page}</strong>
            </span>
            <button
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage >= pagination.last_page}
              className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none"
            >
              Next
            </button>
          </div>
        )}
      </section>

      {/* Why Choose TicketFlow Features */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 sm:p-12">
          <div className="max-w-2xl space-y-2 mb-10">
            <div className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Enterprise Engineering
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Built to withstand high-volume flash sales.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Traditional ticketing portals fail during demand spikes. TicketFlow is built with strict database transactions and optimistic locking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Atomic Pessimistic Locks</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Database row locks ensure quota decrements occur sequentially with zero chance of overselling, even with 10,000+ concurrent checkouts.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">15-Minute Safe Hold Window</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tickets are reserved exclusively for you for 15 minutes while you choose your payment method, auto-releasing if payment times out.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Instant SVG QR Emission</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Once payment succeeds, vector QR codes are emitted directly with tamper-proof signatures ready for gate scanning.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
