import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Compass, Heart, Calendar, User, LogIn, LogOut, UserPlus, Menu, X, Building2 } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { favorites } = useFavorites();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Base public links available to everyone
  const publicLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Properties', path: '/properties', icon: Compass }
  ];

  // Protected links available only when logged in
  const authenticatedLinks = [
    { name: 'Favorites', path: '/favorites', icon: Heart, badge: favorites.length },
    { name: 'My Viewings', path: '/viewings', icon: Calendar }
  ];

  const currentNavLinks = isAuthenticated
    ? [...publicLinks, ...authenticatedLinks]
    : publicLinks;

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'glass-nav border-b border-slate-200/50 dark:border-slate-800/60 shadow-sm py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
              HAVEN<span className="text-brand-500">.</span>
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase -mt-1">
              Tenant Rental Platform
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 dark:bg-slate-800/50 p-1.5 rounded-full border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-md">
          {currentNavLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                  active
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-white dark:bg-dark-card rounded-full shadow-sm"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${active ? 'text-brand-500' : ''}`} />
                  {link.name}
                  {link.badge > 0 && (
                    <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-brand-500 text-white">
                      {link.badge}
                    </span>
                  )}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action Controls: Profile / Logout vs Login / Sign Up */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                <User className="w-4 h-4 text-brand-500" />
                <span>Profile</span>
              </Link>
              <button
                onClick={handleLogoutClick}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-xs font-bold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-500 transition-colors"
              >
                <LogIn className="w-4 h-4 text-brand-500" />
                <span>Login</span>
              </Link>
              <Link
                to="/signup"
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-brand-500 hover:bg-brand-600 text-white rounded-xl shadow-md shadow-brand-500/20 transition-all hover:scale-[1.02]"
              >
                <UserPlus className="w-4 h-4" />
                <span>Sign Up</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Animated Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden glass-nav border-b border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            <div className="px-4 pt-3 pb-6 flex flex-col gap-2">
              {currentNavLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center justify-between p-3 rounded-xl font-semibold text-sm transition-colors ${
                      active
                        ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span>{link.name}</span>
                    </div>
                    {link.badge > 0 && (
                      <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-brand-500 text-white">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold text-sm text-slate-800 dark:text-slate-200"
                    >
                      <User className="w-5 h-5 text-brand-500" />
                      <span>Profile ({user?.name || 'Tenant'})</span>
                    </Link>
                    <button
                      onClick={handleLogoutClick}
                      className="flex items-center gap-3 w-full text-left p-3 rounded-xl font-semibold text-sm text-rose-500 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      to="/login"
                      className="text-center py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-sm text-slate-800 dark:text-slate-200"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="text-center py-2.5 rounded-xl bg-brand-500 text-white font-semibold text-sm shadow-md"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
