
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'With Company':
        return 'bg-passport-blue text-white';
      case 'With Employee':
        return 'bg-passport-green text-white';
      case 'With DGM':
        return 'bg-passport-amber text-white';
      default:
        return 'bg-passport-gray text-white';
    }
  };

  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-sm font-medium inline-block",
      getStatusColor(status),
      className
    )}>
      {status}
    </span>
  );
};

export default StatusBadge;
