import type { ReactNode } from 'react';
import { useEffect, useId } from 'react';
import { X } from 'react-feather';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

type ComponentModalProps = {
  isOpen: boolean;
  /** @deprecated Prefer `title` */
  modalHeader?: string;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  onClose?: () => void;
};

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

/** Shared action row for modal forms and confirmations. */
export function ModalFooter({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}

const ComponentModal = ({
  isOpen,
  onClose,
  children,
  footer,
  size = 'lg',
  title,
  modalHeader,
  description,
}: ComponentModalProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const heading = title ?? modalHeader ?? '';

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose?.();
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Fechar"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={`relative z-10 flex max-h-[min(80vh,800px)] w-full flex-col overflow-hidden rounded-surface bg-white shadow-xl ${sizeClasses[size]}`}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0 pt-0.5">
            <h2 id={titleId} className="text-lg font-semibold text-slate-900">
              {heading}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-1 text-sm text-slate-500">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-control text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            aria-label="Fechar modal"
          >
            <X size={18} aria-hidden />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>

        {footer ? (
          <div className="shrink-0 border-t border-slate-100 bg-white px-5 py-4">{footer}</div>
        ) : null}
      </div>
    </div>
  );
};

export default ComponentModal;
