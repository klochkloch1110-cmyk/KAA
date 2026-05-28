import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingState({ message = "Загрузка...", size = "md" }: LoadingStateProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className={`${sizeClasses[size]} text-primary animate-spin mb-4`} />
      <p className={`${textSizeClasses[size]} text-muted-foreground`}>{message}</p>
    </div>
  );
}

interface TableLoadingStateProps {
  rows?: number;
  columns?: number;
}

export function TableLoadingState({ rows = 5, columns = 4 }: TableLoadingStateProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-lg p-4">
          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, j) => (
              <div key={j} className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-3 bg-muted/60 rounded animate-pulse w-3/4" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface CardLoadingStateProps {
  count?: number;
}

export function CardLoadingState({ count = 3 }: CardLoadingStateProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-6">
          <div className="space-y-4">
            <div className="h-6 bg-muted rounded animate-pulse w-2/3" />
            <div className="space-y-2">
              <div className="h-4 bg-muted/60 rounded animate-pulse" />
              <div className="h-4 bg-muted/60 rounded animate-pulse w-4/5" />
            </div>
            <div className="h-10 bg-muted rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
