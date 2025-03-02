import { LucideIcon } from 'lucide-react';
import { cn } from '@/app/lib/utils';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  color?: 'blue' | 'green' | 'amber' | 'rose';
}

export function DashboardCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  color = 'blue',
}: DashboardCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const trendClasses =
    trend && trend > 0 ? 'text-emerald-600' : 'text-rose-600';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-700">{title}</h3>
        <div className={cn('p-2 rounded-full', colorClasses[color])}>
          <Icon size={20} />
        </div>
      </div>

      <div className="flex flex-col">
        <span className="text-3xl font-bold text-gray-900">{value}</span>

        {trend !== undefined && (
          <div className="flex items-center mt-2">
            <span className={cn('text-sm font-medium', trendClasses)}>
              {trend > 0 ? '+' : ''}
              {trend}%
            </span>
            {trendLabel && (
              <span className="ml-2 text-sm text-gray-500">{trendLabel}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
