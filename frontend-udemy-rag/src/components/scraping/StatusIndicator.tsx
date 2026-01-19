import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StatusIndicatorProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string;
}

export const StatusIndicator = ({ status, message }: StatusIndicatorProps) => {
  if (status === 'idle') return null;

  const variants = {
    loading: {
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
      className: "border-primary/50 bg-primary/5",
    },
    success: {
      icon: <CheckCircle2 className="h-4 w-4 text-success" />,
      className: "border-success/50 bg-success/5",
    },
    error: {
      icon: <AlertCircle className="h-4 w-4 text-destructive" />,
      className: "border-destructive/50 bg-destructive/5",
    },
  };

  const config = variants[status as keyof typeof variants];

  return (
    <Alert className={config.className}>
      {config.icon}
      <AlertDescription className="ml-2">{message}</AlertDescription>
    </Alert>
  );
};
