type PublicLoaderProps = {
  label?: string;
};

export const PublicLoader = ({ label = 'Carregando…' }: PublicLoaderProps) => (
  <div
    className="flex min-h-[40vh] flex-col items-center justify-center gap-3"
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <span
      className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-r-transparent"
      aria-hidden
    />
    <span className="text-sm font-medium text-gray-600">{label}</span>
  </div>
);
