import { getOrderStatusLabel, getOrderStatusStyle } from '../../lib/admin';

type StatusBadgeProps = {
  status: string;
  className?: string;
};

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${getOrderStatusStyle(
        status
      )} ${className}`}
    >
      {getOrderStatusLabel(status)}
    </span>
  );
}
