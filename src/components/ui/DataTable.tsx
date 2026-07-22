import type { ReactNode, TableHTMLAttributes } from 'react';

export function DataTable({
  children,
  className = '',
  containerClassName = '',
  ...props
}: TableHTMLAttributes<HTMLTableElement> & { containerClassName?: string }) {
  return (
    <div
      className={`w-full overflow-x-auto rounded-surface border border-slate-200 bg-white ${containerClassName}`}
    >
      <table className={`min-w-full border-collapse text-left text-sm ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
}

export function DataTableHead({ children }: { children: ReactNode }) {
  return <thead className="border-b border-slate-200 bg-slate-50">{children}</thead>;
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
  return (
    <th className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600 ${className}`}>
      {children}
    </th>
  );
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
