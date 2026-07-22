import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'react-feather';

export type ToastStatus = 'success' | 'error' | 'info' | 'warning';

export type ToastOptions = {
  title: string;
  status?: ToastStatus;
  isClosable?: boolean;
  duration?: number;
};

type ToastItem = ToastOptions & { id: string };

type ToastContextValue = {
  toast: (options: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const statusStyles: Record<
  ToastStatus,
  {
    panel: string;
    iconWrap: string;
    icon: string;
    title: string;
    close: string;
    Icon: typeof CheckCircle;
  }
> = {
  success: {
    panel: 'border-primary/25 bg-primary text-white shadow-primary/30',
    iconWrap: 'bg-white/20',
    icon: 'text-white',
    title: 'text-white',
    close: 'text-white/70 hover:bg-white/15 hover:text-white',
    Icon: CheckCircle,
  },
  error: {
    panel: 'border-red-600/30 bg-red-600 text-white shadow-red-600/30',
    iconWrap: 'bg-white/20',
    icon: 'text-white',
    title: 'text-white',
    close: 'text-white/70 hover:bg-white/15 hover:text-white',
    Icon: AlertCircle,
  },
  info: {
    panel: 'border-sky-600/30 bg-sky-600 text-white shadow-sky-600/30',
    iconWrap: 'bg-white/20',
    icon: 'text-white',
    title: 'text-white',
    close: 'text-white/70 hover:bg-white/15 hover:text-white',
    Icon: Info,
  },
  warning: {
    panel: 'border-amber-500/30 bg-amber-500 text-white shadow-amber-500/30',
    iconWrap: 'bg-white/20',
    icon: 'text-white',
    title: 'text-white',
    close: 'text-white/80 hover:bg-white/15 hover:text-white',
    Icon: AlertTriangle,
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, status = 'info', isClosable = true, duration = 4500 }: ToastOptions) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setItems((prev) => [...prev, { id, title, status, isClosable, duration }]);
      if (duration > 0) {
        window.setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[2000] flex w-[min(100%-2rem,24rem)] flex-col-reverse gap-3 sm:bottom-6 sm:right-6"
        aria-live="polite"
      >
        {items.map((item) => {
          const status = item.status ?? 'info';
          const styles = statusStyles[status];
          const { Icon } = styles;
          return (
            <div
              key={item.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3.5 shadow-xl animate-fade-in-up ${styles.panel}`}
              role="status"
            >
              <span
                className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${styles.iconWrap}`}
                aria-hidden
              >
                <Icon size={18} className={styles.icon} strokeWidth={2.5} />
              </span>
              <p
                className={`min-w-0 flex-1 pt-1 text-sm font-semibold leading-snug ${styles.title}`}
              >
                {item.title}
              </p>
              {item.isClosable ? (
                <button
                  type="button"
                  onClick={() => dismiss(item.id)}
                  className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${styles.close}`}
                  aria-label="Fechar"
                >
                  <X size={16} aria-hidden />
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

/** Drop-in replacement for Chakra `useToast`. */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx.toast;
}
