import { CheckCircle2, X, Info, AlertTriangle } from "lucide-react";
import { useEffect } from "react";

interface SuccessNotificationProps {
  message: string;
  type?: "success" | "info" | "warning";
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

export function SuccessNotification({
  message,
  type = "success",
  onClose,
  autoClose = true,
  duration = 3000,
}: SuccessNotificationProps) {
  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const styles = {
    success: {
      bg: "bg-green-50 dark:bg-green-950/20",
      border: "border-green-200 dark:border-green-900",
      text: "text-green-800 dark:text-green-100",
      icon: <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />,
    },
    info: {
      bg: "bg-blue-50 dark:bg-blue-950/20",
      border: "border-blue-200 dark:border-blue-900",
      text: "text-blue-800 dark:text-blue-100",
      icon: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    },
    warning: {
      bg: "bg-yellow-50 dark:bg-yellow-950/20",
      border: "border-yellow-200 dark:border-yellow-900",
      text: "text-yellow-800 dark:text-yellow-100",
      icon: <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />,
    },
  };

  const style = styles[type];

  return (
    <div
      className={`${style.bg} ${style.border} border rounded-lg p-4 shadow-lg animate-slide-in-top`}
    >
      <div className="flex items-start gap-3">
        {style.icon}
        <p className={`${style.text} text-sm flex-1`}>{message}</p>
        {onClose && (
          <button
            onClick={onClose}
            className={`${style.text} hover:opacity-70 transition-opacity`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

interface InlineSuccessProps {
  message: string;
}

export function InlineSuccess({ message }: InlineSuccessProps) {
  return (
    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-green-800 dark:text-green-100">{message}</p>
      </div>
    </div>
  );
}
