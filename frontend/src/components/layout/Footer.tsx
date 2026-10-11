import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket, ShieldCheck, Zap, Heart, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/90 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:gap-12">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 text-white shadow-md shadow-indigo-500/20">
                <Ticket className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-white">
                Ticket<span className="text-indigo-500">Flow</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400">
              High-concurrency ticket reservation engine. Engineered with pessimistic DB locks, optimistic versioning, and instant SVG QR ticket issuance.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="h-3 w-3" /> 100% Anti-Overselling
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-indigo-500/10 px-2 py-0.5 text-[11px] font-medium text-indigo-400 border border-indigo-500/20">
                <Zap className="h-3 w-3" /> Sub-10ms Holds
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Explore & Book
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-indigo-400 transition-colors">
                  All Featured Events
                </Link>
              </li>
              <li>
                <Link to="/?category=Technology" className="hover:text-indigo-400 transition-colors">
                  Technology Summits
                </Link>
              </li>
              <li>
                <Link to="/?category=Music" className="hover:text-indigo-400 transition-colors">
                  Music Festivals
                </Link>
              </li>
              <li>
                <Link to="/?category=Workshop" className="hover:text-indigo-400 transition-colors">
                  Executive Workshops
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Architecture & Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Platform Features
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                Atomic 15-Minute Cart Reservations
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400"></span>
                Multi-gateway Mock Settlement
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
                Cryptographic SVG Ticket Verification
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400"></span>
                Real-Time Organizer Analytics
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter / Demo info */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Developer Demo
            </h4>
            <p className="text-xs text-slate-400">
              Experience zero-race condition ticketing. Use the predefined accounts to test checkout, simulate payment failures, and verify tickets.
            </p>
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5 text-slate-300 font-medium mb-1">
                <Sparkles className="h-3 w-3 text-cyan-400" />
                Live API Endpoint
              </div>
              <code>http://127.0.0.1:8000/api/v1</code>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800/60 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div>
            &copy; {new Date().getFullYear()} TicketFlow Inc. High-Concurrency Ticketing Platform.
          </div>
          <div className="flex items-center gap-1">
            Built with <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" /> for modern enterprise event management
          </div>
        </div>
      </div>
    </footer>
  );
};
