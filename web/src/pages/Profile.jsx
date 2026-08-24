import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Heart, Calendar, LogOut, ShieldCheck, ChevronRight, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '../components/common/Button';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { favoriteService } from '../services/favoriteService';
import { viewingService } from '../services/viewingService';
import { useToast } from '../context/ToastContext';

export const Profile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, logout, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [favCount, setFavCount] = useState(null);
  const [viewingCount, setViewingCount] = useState(null);

  const [loadingFavs, setLoadingFavs] = useState(true);
  const [loadingViewings, setLoadingViewings] = useState(true);

  const [favsError, setFavsError] = useState(false);
  const [viewingsError, setViewingsError] = useState(false);

  // Fetch real count metrics from backend APIs
  const fetchCounts = async () => {
    if (!isAuthenticated) return;

    // Fetch Favorites Count
    setLoadingFavs(true);
    setFavsError(false);
    try {
      const favRes = await favoriteService.getFavorites();
      if (favRes.success) {
        const total = favRes.pagination?.totalFavorites ?? favRes.favorites?.length ?? 0;
        setFavCount(total);
      }
    } catch (err) {
      setFavsError(true);
    } finally {
      setLoadingFavs(false);
    }

    // Fetch Viewing Requests Count
    setLoadingViewings(true);
    setViewingsError(false);
    try {
      const viewingRes = await viewingService.getMyRequests();
      if (viewingRes.success) {
        const total = viewingRes.pagination?.totalViewings ?? viewingRes.viewings?.length ?? 0;
        setViewingCount(total);
      }
    } catch (err) {
      setViewingsError(true);
    } finally {
      setLoadingViewings(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    addToast('Logged out successfully', 'info');
    navigate('/');
  };

  if (authLoading) {
    return (
      <div className="pt-28 pb-20 min-h-screen max-w-4xl mx-auto px-4 animate-pulse flex flex-col gap-6">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
          <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
        </div>
      </div>
    );
  }

  // Derive initials from real user name
  const userInitial = user?.name ? user.name.trim().charAt(0).toUpperCase() : 'U';

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="flex flex-col gap-1 mb-8">
          <span className="text-xs font-extrabold uppercase tracking-wider text-brand-500">HAVEN. Account</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            User Profile
          </h1>
        </div>

        {/* Real Authenticated User Banner Card */}
        <div className="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-3xl p-6 sm:p-8 shadow-sm mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-500 to-emerald-400 text-white flex items-center justify-center font-extrabold text-2xl shadow-lg shadow-brand-500/20">
              {userInitial}
            </div>
            <div className="flex flex-col">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {user?.name || 'Authenticated User'}
              </h2>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {user?.email || 'user@example.com'}
              </span>
              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-bold text-emerald-500">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Tenant Account</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              icon={LogOut}
              onClick={handleLogout}
              className="text-rose-500 border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/50"
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Clickable Profile Navigation Cards with Real API Counts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          {/* Saved Favorites Clickable Card */}
          <div
            onClick={() => navigate('/favorites')}
            className="group bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border p-6 rounded-3xl flex items-center justify-between shadow-sm hover:shadow-lg hover:border-brand-500 dark:hover:border-brand-500 transition-all cursor-pointer"
          >
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Saved Favorites</span>
              {loadingFavs ? (
                <div className="h-8 w-12 bg-slate-200 dark:bg-slate-800 rounded animate-pulse my-1" />
              ) : favsError ? (
                <div className="flex items-center gap-2 text-xs text-rose-500 font-semibold my-1">
                  <span>Unable to load</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); fetchCounts(); }}
                    className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:text-slate-900"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {favCount ?? 0}
                </span>
              )}
              <span className="text-xs font-semibold text-brand-500 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>View favorites</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Heart className="w-6 h-6 fill-rose-500" />
            </div>
          </div>

          {/* Viewing Requests Clickable Card */}
          <div
            onClick={() => navigate('/viewings')}
            className="group bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border p-6 rounded-3xl flex items-center justify-between shadow-sm hover:shadow-lg hover:border-brand-500 dark:hover:border-brand-500 transition-all cursor-pointer"
          >
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Viewing Requests</span>
              {loadingViewings ? (
                <div className="h-8 w-12 bg-slate-200 dark:bg-slate-800 rounded animate-pulse my-1" />
              ) : viewingsError ? (
                <div className="flex items-center gap-2 text-xs text-rose-500 font-semibold my-1">
                  <span>Unable to load</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); fetchCounts(); }}
                    className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:text-slate-900"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {viewingCount ?? 0}
                </span>
              )}
              <span className="text-xs font-semibold text-brand-500 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>View appointments</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
