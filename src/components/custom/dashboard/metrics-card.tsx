'use client';

import { LucideIcon } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: number;
  unit: string;
  goal?: number;
  icon: LucideIcon;
  color: 'emerald' | 'orange' | 'blue' | 'purple';
}

const colorClasses = {
  emerald: 'from-emerald-400 to-teal-600',
  orange: 'from-orange-400 to-red-500',
  blue: 'from-blue-400 to-cyan-600',
  purple: 'from-purple-400 to-pink-600',
};

export function MetricsCard({ title, value, unit, goal, icon: Icon, color }: MetricsCardProps) {
  const percentage = goal ? Math.min((value / goal) * 100, 100) : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{title}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {value}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{unit}</span>
          </div>
          {goal && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Meta: {goal} {unit}
            </p>
          )}
        </div>
        <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>

      {goal && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${colorClasses[color]} transition-all duration-500`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {percentage.toFixed(0)}% da meta
          </p>
        </div>
      )}
    </div>
  );
}
