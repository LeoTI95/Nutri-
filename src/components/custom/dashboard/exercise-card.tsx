'use client';

import { Footprints, Bike, Dumbbell, Flame } from 'lucide-react';
import { Exercise } from '@/lib/types';

interface ExerciseCardProps {
  exercise: Exercise;
}

const exerciseIcons: Record<string, any> = {
  walking: Footprints,
  running: Footprints,
  cycling: Bike,
  spinning: Bike,
  gym: Dumbbell,
  football: Flame,
  other: Flame,
};

export function ExerciseCard({ exercise }: ExerciseCardProps) {
  const Icon = exerciseIcons[exercise.type] || Flame;

  return (
    <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10 rounded-xl border border-orange-100 dark:border-orange-900/20">
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{exercise.name}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {exercise.duration_minutes} min • {exercise.calories_burned} kcal
        </p>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(exercise.performed_at).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}
