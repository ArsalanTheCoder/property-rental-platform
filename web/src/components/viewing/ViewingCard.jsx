import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, AlertCircle } from 'lucide-react';
import { ViewingStatusBadge } from './ViewingStatusBadge';
import { Button } from '../common/Button';

export const ViewingCard = ({ viewing, property, onCancel }) => {
  const viewingId = viewing._id || viewing.viewingId;
  const propId = viewing.propertyId?._id || viewing.propertyId || property?._id || property?.propertyId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
    >
      {/* Property Thumbnail & Summary */}
      <div className="flex items-center gap-4 min-w-0">
        <img
          src={property?.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80'}
          alt={property?.title || 'Property'}
          className="w-20 h-20 rounded-xl object-cover shrink-0"
        />
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <ViewingStatusBadge status={viewing.status} />
            <span className="text-[10px] font-semibold text-slate-400">Ref: {viewingId?.slice(-6) || 'N/A'}</span>
          </div>

          <Link to={`/properties/${propId}`}>
            <h4 className="text-base font-bold text-slate-900 dark:text-white truncate hover:text-brand-500 transition-colors">
              {property?.title || 'Rental Residence'}
            </h4>
          </Link>

          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-brand-500 shrink-0" />
            <span className="truncate">{property?.location?.city || property?.location?.address || property?.location || 'Prime Location'}</span>
          </div>
        </div>
      </div>

      {/* Appointment Date / Time Info */}
      <div className="flex flex-wrap items-center gap-4 bg-slate-50 dark:bg-slate-900/80 px-4 py-3 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-brand-500 shrink-0" />
          <span>{viewing.date}</span>
        </div>
        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500 shrink-0" />
          <span>{viewing.time}</span>
        </div>
      </div>

      {/* Action Cancel Button */}
      {viewing.status === 'pending' && onCancel && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onCancel(viewingId)}
          className="shrink-0 text-rose-500 border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/50"
        >
          Cancel Appointment
        </Button>
      )}
    </motion.div>
  );
};
