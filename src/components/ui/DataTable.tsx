import type { ReactNode, TableHTMLAttributes } from 'react';

export function DataTable({
  children,
  className = '',
  ...props
}: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className={`min-w-full border-collapse text-left text-sm ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
}

export function DataTableHead({ children }: { children: ReactNode }) {
  return <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">{children}</thead>;
}

export function DataTableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-slate-100">{children}</tbody>;
}

export function DataTableRow({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <tr className={`hover:bg-slate-50/80 ${className}`}>{children}</tr>;
}

export function DataTableHeaderCell({
  children,
  className = '',
}: {
  children?: ReactNode;
  className?: string;
}) {
  return <th className={`px-4 py-3 font-semibold ${className}`}>{children}</th>;
}

export function DataTableCell({
  children,
  className = '',
  colSpan,
}: {
  children?: ReactNode;
  className?: string;
  colSpan?: number;
}) {
  return (
    <td className={`px-4 py-3 text-slate-700 ${className}`} colSpan={colSpan}>
      {children}
    </td>
  );
}
