import React from 'react';
import { Badge } from '../common/Badge';
import { Clock, CheckCircle, XCircle, AlertCircle, CheckCheck } from 'lucide-react';

export const ViewingStatusBadge = ({ status = 'pending' }) => {
  const normalized = status.toLowerCase();

  const statusConfig = {
    pending: { label: 'Pending Approval', variant: 'pending', icon: Clock },
    confirmed: { label: 'Viewing Confirmed', variant: 'confirmed', icon: CheckCircle },
    rejected: { label: 'Request Declined', variant: 'rejected', icon: XCircle },
    cancelled: { label: 'Cancelled', variant: 'cancelled', icon: AlertCircle },
    completed: { label: 'Tour Completed', variant: 'completed', icon: CheckCheck }
  };

  const config = statusConfig[normalized] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} size="sm">
      <Icon className="w-3.5 h-3.5 mr-1 inline-block" />
      <span>{config.label}</span>
    </Badge>
  );
};
