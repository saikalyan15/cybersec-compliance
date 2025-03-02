import { cn } from '@/app/lib/utils';
import { ReactNode } from 'react';

interface TableProps<T> {
  data: T[];
  columns: {
    key: keyof T | string;
    header: string;
    cell?: (item: T) => ReactNode;
    className?: string;
  }[];
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  emptyState?: ReactNode;
}

export function Table<T extends Record<string, unknown>>({
  data,
  columns,
  onRowClick,
  isLoading = false,
  emptyState,
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-8 flex justify-center">
          <div className="animate-pulse space-y-4 w-full">
            <div className="h-8 bg-slate-200 rounded w-full"></div>
            <div className="h-8 bg-slate-200 rounded w-full"></div>
            <div className="h-8 bg-slate-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-8 flex justify-center">{emptyState}</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key.toString()}
                  scope="col"
                  className={cn(
                    'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                    column.className
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr
                key={index}
                className={cn(onRowClick && 'cursor-pointer hover:bg-gray-50')}
                onClick={() => onRowClick && onRowClick(item)}
              >
                {columns.map((column) => {
                  const cellContent = column.cell
                    ? column.cell(item)
                    : typeof column.key === 'string'
                    ? String(item[column.key as keyof T] ?? '')
                    : String(item[column.key] ?? '');

                  return (
                    <td
                      key={`${index}-${column.key.toString()}`}
                      className={cn(
                        'px-6 py-4 whitespace-nowrap text-sm text-gray-500',
                        column.className
                      )}
                    >
                      {cellContent}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
