import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, RotateCcw } from 'lucide-react';
import { ViewingCard } from '../components/viewing/ViewingCard';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { viewingService } from '../services/viewingService';
import { propertyService } from '../services/propertyService';
import { useToast } from '../context/ToastContext';

export const Viewings = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [viewings, setViewings] = useState([]);
  const [propertiesMap, setPropertiesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchViewingsData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [viewingRes, propertyRes] = await Promise.all([
        viewingService.getMyRequests(),
        propertyService.getProperties()
      ]);

      if (propertyRes.success && Array.isArray(propertyRes.properties)) {
        const map = {};
        propertyRes.properties.forEach((p) => {
          map[p._id || p.propertyId || p.id] = p;
        });
        setPropertiesMap(map);
      }

      if (viewingRes.success && Array.isArray(viewingRes.viewings)) {
        setViewings(viewingRes.viewings);
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViewingsData();
  }, []);

  const handleCancelViewing = async (viewingId) => {
    try {
      const res = await viewingService.cancelViewing(viewingId);
      if (res.success) {
        setViewings((prev) =>
          prev.map((v) => ((v._id === viewingId || v.viewingId === viewingId) ? { ...v, status: 'cancelled' } : v))
        );
        addToast('Viewing request cancelled', 'info');
      }
    } catch (err) {
      addToast(err.message || 'Failed to cancel viewing', 'error');
    }
  };

  const filteredViewings = viewings.filter((v) => {
    if (statusFilter === 'all') return true;
    return v.status?.toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-brand-500 font-bold text-xs uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              <span>Tour Appointments</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              My Viewing Requests
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Track status updates for your requested property inspection tours.
            </p>
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-brand-500 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Viewings Content */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2].map((n) => (
              <div key={n} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-dark-card rounded-3xl border border-slate-200 dark:border-dark-border text-center max-w-md mx-auto my-12">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Unable to load viewing requests
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              A temporary issue occurred while communicating with the server.
            </p>
            <Button variant="primary" icon={RotateCcw} onClick={fetchViewingsData}>
              Retry Loading Appointments
            </Button>
          </div>
        ) : filteredViewings.length === 0 ? (
          <EmptyState
            title="No Viewing Requests Found"
            description="You haven't scheduled any property inspection tours under this status filter yet."
            actionText="Browse Properties to Schedule"
            onAction={() => navigate('/properties')}
          />
        ) : (
          <div className="flex flex-col gap-4">
            {filteredViewings.map((viewing) => {
              const vId = viewing._id || viewing.viewingId;
              const pId = viewing.propertyId?._id || viewing.propertyId;
              return (
                <ViewingCard
                  key={vId}
                  viewing={viewing}
                  property={propertiesMap[pId] || viewing.propertyId}
                  onCancel={handleCancelViewing}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
