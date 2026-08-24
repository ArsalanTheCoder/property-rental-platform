import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart,
  Calendar,
  Bot,
  Share2,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';
import { PropertyGallery } from '../components/property/PropertyGallery';
import { PropertyInfo } from '../components/property/PropertyInfo';
import { PropertyDetailSkeleton } from '../components/common/Skeleton';
import { ViewingModal } from '../components/viewing/ViewingModal';
import { AIChatbot } from '../components/chatbot/AIChatbot';
import { Button } from '../components/common/Button';
import { propertyService } from '../services/propertyService';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToast } = useToast();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewingModalOpen, setViewingModalOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        const res = await propertyService.getPropertyById(id);
        if (res.success && res.property) {
          setProperty(res.property);
        }
      } catch (err) {
        addToast('Property not found or unavailable', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) {
    return <PropertyDetailSkeleton />;
  }

  if (!property) {
    return (
      <div className="pt-32 pb-20 max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Property Not Found</h2>
        <p className="text-slate-500 my-4">The property listing you requested could not be located.</p>
        <Link to="/properties">
          <Button variant="primary">Back to Property Listings</Button>
        </Link>
      </div>
    );
  }

  const propertyId = property._id || property.propertyId || property.id;
  const favorite = isFavorite(propertyId);

  const handleFavoriteClick = () => {
    if (!isAuthenticated) {
      addToast('Please login to save properties to your favorites', 'info');
      navigate('/login');
      return;
    }
    toggleFavorite(propertyId);
  };

  const handleRequestViewingClick = () => {
    if (!isAuthenticated) {
      addToast('Please login to request a property viewing', 'info');
      navigate('/login');
      return;
    }
    setViewingModalOpen(true);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `Check out ${property.title} on HAVEN Rental Platform`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast('Property link copied to clipboard!', 'success');
    }
  };

  const formattedPrice = `Rs. ${Number(property.price || 0).toLocaleString()}`;

  return (
    <div className="pt-28 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-brand-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Search Results</span>
          </Link>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Share2 className="w-4 h-4 text-brand-500" />
            <span>Share Listing</span>
          </button>
        </div>

        {/* Gallery Showcase */}
        <div className="mb-10">
          <PropertyGallery images={property.images} title={property.title} />
        </div>

        {/* Main Grid: Info + Actions Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Main Details */}
          <div className="lg:col-span-8">
            <PropertyInfo property={property} />
          </div>

          {/* Right Action Box Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-3xl p-6 shadow-xl sticky top-28 flex flex-col gap-6">
              {/* Price Banner */}
              <div className="flex items-baseline justify-between pb-6 border-b border-slate-100 dark:border-dark-border">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Rent</span>
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {formattedPrice}
                    <span className="text-sm font-normal text-slate-400"> / mo</span>
                  </div>
                </div>
                <button
                  onClick={handleFavoriteClick}
                  className={`p-3 rounded-2xl border transition-all ${
                    favorite
                      ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-500'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-500'
                  }`}
                  title={favorite ? "Remove from Favorites" : "Save to Favorites"}
                >
                  <Heart className={`w-5 h-5 ${favorite ? 'fill-rose-500' : ''}`} />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  icon={Calendar}
                  onClick={handleRequestViewingClick}
                  className="w-full shadow-lg"
                >
                  Request Private Viewing
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  icon={Bot}
                  onClick={() => setAiChatOpen(true)}
                  className="w-full bg-slate-900 text-white dark:bg-brand-500 dark:hover:bg-brand-600 border-none shadow-md"
                >
                  Ask AI About This Property
                </Button>
              </div>

              {/* Verified Guarantee Badge */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-3 text-xs text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold">HAVEN Tenant Guarantee</span>
                  <span className="text-[11px] leading-relaxed">
                    Verified property specs, instant viewing status tracking, and direct tenant support.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Viewing Appointment Modal */}
      <ViewingModal
        isOpen={viewingModalOpen}
        onClose={() => setViewingModalOpen(false)}
        property={property}
      />

      {/* Property-Specific AI Chatbot (Public Access Allowed per RFC-003) */}
      <AIChatbot
        isOpen={aiChatOpen}
        onClose={() => setAiChatOpen(false)}
        property={property}
      />
    </div>
  );
};
