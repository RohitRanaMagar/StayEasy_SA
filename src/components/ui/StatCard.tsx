import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: { value: number; positive: boolean };
  icon: LucideIcon;
  iconColor?: string;
}

export default function StatCard({ label, value, change, icon: Icon, iconColor = 'text-brand' }: StatCardProps) {
  return (
    <div className="rounded-xl p-4 border border-gray-100 bg-white hover:shadow-md transition-all duration-200 hover:border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-xs mt-1 ${change.positive ? 'text-emerald-600' : 'text-red-500'}`}>
              {change.positive ? '+' : ''}{change.value}%
            </p>
          )}
        </div>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconColor} bg-opacity-10`}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}
