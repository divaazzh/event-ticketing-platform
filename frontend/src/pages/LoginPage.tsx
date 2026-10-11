import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Ticket, Mail, Lock, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const { login, error, clearError, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate(redirectPath);
    } catch {
      // Error handled by store
    }
  };

  const handleQuickFill = (role: 'customer' | 'admin' | 'organizer') => {
    clearError();
    if (role === 'customer') {
      setEmail('customer@ticketflow.io');
      setPassword('password');
    } else if (role === 'admin') {
      setEmail('admin@ticketflow.io');
      setPassword('password');
    } else if (role === 'organizer') {
      setEmail('organizer@ticketflow.io');
      setPassword('password');
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and title */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white shadow-xl shadow-indigo-500/25">
              <Ticket className="h-6 w-6" />
            </div>
          </Link>
          <h2 className="text-3xl font-black tracking-tight text-white">
            Welcome Back
          </h2>
          <p className="text-xs text-slate-400">
            Sign in to access your tickets, holds, and order management.
          </p>
        </div>

        {/* Quick Demo Login Preset Buttons */}
        <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/80 p-4 shadow-xl backdrop-blur-md space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            Quick Demo Sandbox Credentials
          </div>
          <p className="text-[11px] text-slate-400">
            Click below to auto-populate seeded test credentials:
          </p>
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleQuickFill('customer')}
              className="rounded-xl border border-slate-700 bg-slate-800/80 py-2 px-2 text-center text-xs font-semibold text-slate-200 hover:border-indigo-500 hover:bg-indigo-600/20 hover:text-white transition-all"
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('organizer')}
              className="rounded-xl border border-slate-700 bg-slate-800/80 py-2 px-2 text-center text-xs font-semibold text-slate-200 hover:border-cyan-500 hover:bg-cyan-600/20 hover:text-white transition-all"
            >
              Organizer
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className="rounded-xl border border-slate-700 bg-slate-800/80 py-2 px-2 text-center text-xs font-semibold text-slate-200 hover:border-purple-500 hover:bg-purple-600/20 hover:text-white transition-all"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Card Form */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {error && (
            <div className="flex items-center gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-400 hover:to-indigo-500 disabled:opacity-50 transition-all hover:scale-[1.01]"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  Sign In to Account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
