import React, { useState } from 'react';
import { Calendar, Clock, MessageSquare, Building2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { ViewingSuccessIllustration } from '../illustrations/ViewingSuccessIllustration';
import { viewingService } from '../../services/viewingService';
import { useToast } from '../../context/ToastContext';

const TIME_SLOTS = [
  "09:00", "10:30", "12:00", "14:00", "15:30", "17:00"
];

export const ViewingModal = ({ isOpen, onClose, property, onSuccess }) => {
  const { addToast } = useToast();

  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    return tomorrow.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('14:00');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !time) {
      addToast('Please select a preferred viewing date and time', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const propertyId = property._id || property.propertyId || property.id;
      // Payload STRICTLY sending { date, time, message } per RFC-003 (zero phone number references)
      const res = await viewingService.requestViewing(propertyId, {
        date,
        time,
        message
      });

      if (res.success) {
        setIsSuccess(true);
        addToast('Viewing request submitted successfully!', 'success');
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      addToast(err.message || 'Failed to submit viewing request. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={isSuccess ? undefined : "Schedule Private Viewing"}>
      {isSuccess ? (
        <div className="flex flex-col items-center text-center p-4 py-6">
          <ViewingSuccessIllustration />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-4 mb-2">
            Viewing Request Submitted!
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm leading-relaxed">
            Your viewing appointment for <strong className="text-slate-800 dark:text-slate-200">{property?.title}</strong> on <strong className="text-brand-500">{date} at {time}</strong> has been submitted with <span className="font-semibold text-amber-500">Pending</span> status.
          </p>
          <Button variant="primary" size="md" onClick={handleClose}>
            Done & View Appointments
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Property Banner Preview */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <img
              src={property?.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=300&q=80'}
              alt={property?.title}
              className="w-14 h-14 rounded-lg object-cover"
            />
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-xs font-bold text-brand-500 uppercase tracking-wider">{property?.propertyType}</span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{property?.title}</h4>
              <span className="text-xs font-semibold text-slate-400">{property?.location?.city || property?.location?.address || property?.location}</span>
            </div>
          </div>

          {/* Date Picker */}
          <Input
            label="Preferred Date"
            type="date"
            icon={Calendar}
            value={date}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          {/* Time Slot Picker */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Preferred Time Slot
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setTime(slot)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    time === slot
                      ? 'bg-brand-500 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Message Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Special Notes / Message (Optional)
            </label>
            <textarea
              rows="3"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Would like to inspect balcony orientation and parking space..."
              className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium border bg-white dark:bg-dark-card border-slate-200 dark:border-dark-border text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Confirm Viewing Request
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
