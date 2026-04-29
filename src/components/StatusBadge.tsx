import './StatusBadge.css';

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'onleave';
}

const labels: Record<string, string> = {
  active: 'Active',
  inactive: 'Inactive',
  onleave: 'On Leave',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`status-badge status-${status}`}>{labels[status]}</span>;
}
