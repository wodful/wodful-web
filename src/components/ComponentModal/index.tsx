import { useEffect, useId } from 'react';
import { X } from 'react-feather';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

type ComponentModalProps = {
  isOpen: boolean;
  modalHeader: string;
  children: React.ReactNode;
  size: ModalSize;
  onClose?: () => void;
};

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

const ComponentModal = ({
  isOpen,
  onClose,
  children,
  size,
  modalHeader,
}: ComponentModalProps) => {
  const titleId = useId();

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
      className={`fixed inset-0 z-50 flex p-4 ${
        size === 'sm' ? 'items-center justify-center' : 'items-start justify-center pt-10 sm:pt-16'
      }`}
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
        className={`relative z-10 flex max-h-[80%] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-xl ${sizeClasses[size]}`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 id={titleId} className="text-lg font-semibold text-slate-900">
            {modalHeader}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            aria-label="Fechar modal"
          >
            <X size={18} aria-hidden />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ComponentModal;
