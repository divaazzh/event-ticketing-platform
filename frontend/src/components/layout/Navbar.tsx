import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { 
  Ticket, 
  Search, 
  Calendar, 
  User as UserIcon, 
  LogOut, 
  LayoutDashboard, 
  Sparkles,
  Menu,
  X
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/25 transition-transform group-hover:scale-105">
              <Ticket className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-white group-hover:text-indigo-400 transition-colors">
                Ticket<span className="text-indigo-500">Flow</span>
              </span>
              <span className="text-[10px] font-medium tracking-widest text-slate-400 uppercase -mt-1">
                Enterprise Box Office
              </span>
            </div>
          </Link>

          {/* Desktop Search Shortcut */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex relative items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search concerts, tech conferences, workshops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-80 lg:w-96 rounded-full border border-slate-800 bg-slate-900/60 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </form>
        </div>

        {/* Navigation items */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-indigo-400 transition-colors"
          >
            <Calendar className="h-4 w-4" />
            Explore Events
          </Link>

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 rounded-full border border-slate-700/60 bg-slate-800/60 py-1.5 pl-3 pr-4 text-sm font-medium text-slate-200 hover:border-slate-600 hover:bg-slate-800 transition-all"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-xs font-bold text-white uppercase shadow-sm">
                  {user?.name?.slice(0, 2) || 'US'}
                </div>
                <div className="text-left max-w-[120px] truncate">
                  <div className="text-xs font-semibold leading-tight text-slate-100 truncate">
                    {user?.name}
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize">{user?.role}</div>
                </div>
              </button>

              {/* User Dropdown */}
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 z-20 mt-2 w-56 rounded-2xl border border-slate-800 bg-slate-900/95 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="border-b border-slate-800/80 px-3 py-2 text-xs text-slate-400">
                      Signed in as <span className="font-semibold text-slate-200">{user?.email}</span>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/my-tickets"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-200 hover:bg-indigo-600/20 hover:text-indigo-300 transition-colors"
                      >
                        <Ticket className="h-4 w-4 text-indigo-400" />
                        My Tickets & Orders
                      </Link>

                      {(user?.role === 'admin' || user?.role === 'organizer') && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-200 hover:bg-cyan-600/20 hover:text-cyan-300 transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4 text-cyan-400" />
                          Management Portal
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-slate-800/80 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-400 hover:to-indigo-500 transition-all hover:scale-[1.02]"
              >
                <Sparkles className="h-3.5 w-3.5 text-cyan-200" />
                Register
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-800 bg-slate-950 px-4 py-4 md:hidden space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-800 bg-slate-900 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500"
            />
          </form>

          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-sm font-medium text-slate-200"
          >
            <Calendar className="h-4 w-4 text-indigo-400" />
            Explore Events
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/my-tickets"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-sm font-medium text-slate-200"
              >
                <Ticket className="h-4 w-4 text-indigo-400" />
                My Tickets
              </Link>

              {(user?.role === 'admin' || user?.role === 'organizer') && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2 text-sm font-medium text-cyan-400"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Admin Dashboard
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 py-2 text-sm font-medium text-rose-400"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-medium text-slate-200 rounded-lg bg-slate-900"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-semibold text-white rounded-lg bg-indigo-600"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
