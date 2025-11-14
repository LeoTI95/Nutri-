'use client';

import { useState, useEffect } from 'react';
import { Coffee, Sun, Moon, Apple } from 'lucide-react';
import { Meal } from '@/lib/types';

interface MealCardProps {
  meal: Meal;
}

const mealIcons: Record<string, any> = {
  breakfast: Coffee,
  lunch: Sun,
  dinner: Moon,
  snack: Apple,
};

const mealLabels: Record<string, string> = {
  breakfast: 'Café da Manhã',
  lunch: 'Almoço',
  dinner: 'Jantar',
  snack: 'Lanche',
};

export function MealCard({ meal }: MealCardProps) {
  const Icon = mealIcons[meal.meal_type] || Apple;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formattedTime = mounted
    ? new Date(meal.consumed_at).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '--:--';

  return (
    <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{meal.name}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {mealLabels[meal.meal_type]} • {meal.calories} kcal
        </p>
        <div className="flex gap-3 mt-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">P: {meal.protein}g</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">C: {meal.carbs}g</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">G: {meal.fats}g</span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {formattedTime}
        </p>
      </div>
    </div>
  );
}
