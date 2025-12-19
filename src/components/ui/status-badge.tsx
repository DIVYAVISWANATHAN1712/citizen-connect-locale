import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig = {
  submitted: {
    label: { en: "Submitted", hi: "सबमिट किया गया" },
    className: "bg-status-submitted text-white",
  },
  acknowledged: {
    label: { en: "Acknowledged", hi: "स्वीकार किया गया" },
    className: "bg-status-acknowledged text-black",
  },
  in_progress: {
    label: { en: "In Progress", hi: "प्रगति में" },
    className: "bg-status-inProgress text-white",
  },
  resolved: {
    label: { en: "Resolved", hi: "हल किया गया" },
    className: "bg-status-resolved text-white",
  },
} as const;

interface StatusBadgeProps {
  status: keyof typeof statusConfig;
  language?: "en" | "hi";
  className?: string;
}

export function StatusBadge({ status, language = "en", className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge className={cn(config.className, className)}>
      {config.label[language]}
    </Badge>
  );
}
