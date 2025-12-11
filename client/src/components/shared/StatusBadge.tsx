import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Status = 'submitted' | 'verified' | 'in_progress' | 'resolved' | 'critical';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  submitted: { label: 'Submitted', className: 'bg-gray-100 text-gray-600 hover:bg-gray-100' },
  verified: { label: 'Verified', className: 'bg-accent/10 text-accent hover:bg-accent/20' },
  in_progress: { label: 'In Progress', className: 'bg-warning/10 text-warning hover:bg-warning/20' },
  resolved: { label: 'Resolved', className: 'bg-success/10 text-success hover:bg-success/20' },
  critical: { label: 'Critical', className: 'bg-destructive/10 text-destructive hover:bg-destructive/20' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.submitted;
  
  return (
    <Badge variant="secondary" className={cn("font-medium", config.className, className)}>
      {config.label}
    </Badge>
  );
}
