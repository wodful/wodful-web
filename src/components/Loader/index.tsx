interface LoaderProps {
  title: string;
  description?: string;
}

const Loader = ({ title, description }: LoaderProps) => (
  <div className="fixed inset-0 z-[1000] flex h-full w-full flex-col items-center justify-center bg-white/90">
    <span
      className="mb-3 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-primary"
      aria-hidden
    />
    <p className="font-bold text-slate-900">{title}</p>
    {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
  </div>
);

export { Loader };
