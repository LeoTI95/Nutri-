'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, Zap, Drumstick, Wheat, TrendingUp, Calendar, Plus } from 'lucide-react';
import { MetricsCard } from '@/components/custom/dashboard/metrics-card';
import { ExerciseCard } from '@/components/custom/dashboard/exercise-card';
import { MealCard } from '@/components/custom/dashboard/meal-card';
import { AddMealModal } from '@/components/custom/dashboard/add-meal-modal';
import { Exercise, Meal, NutritionMetrics } from '@/lib/types';

export default function Dashboard() {
  const router = useRouter();
  const [isAddMealModalOpen, setIsAddMealModalOpen] = useState(false);
  
  // Mock data - será substituído por dados reais do Supabase
  const [metrics, setMetrics] = useState<NutritionMetrics>({
    calories_consumed: 1450,
    calories_burned: 380,
    calories_net: 1070,
    protein: 95,
    carbs: 165,
    fats: 45,
  });

  const [todayMeals, setTodayMeals] = useState<Meal[]>([
    {
      id: '1',
      user_id: 'demo',
      name: 'Omelete com Queijo',
      calories: 320,
      protein: 28,
      carbs: 8,
      fats: 22,
      meal_type: 'breakfast',
      consumed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      user_id: 'demo',
      name: 'Frango Grelhado com Arroz Integral',
      calories: 580,
      protein: 52,
      carbs: 68,
      fats: 12,
      meal_type: 'lunch',
      consumed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      user_id: 'demo',
      name: 'Iogurte Grego com Granola',
      calories: 250,
      protein: 15,
      carbs: 32,
      fats: 8,
      meal_type: 'snack',
      consumed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
  ]);

  const [todayExercises, setTodayExercises] = useState<Exercise[]>([
    {
      id: '1',
      user_id: 'demo',
      name: 'Corrida Matinal',
      type: 'running',
      duration_minutes: 30,
      calories_burned: 280,
      performed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      user_id: 'demo',
      name: 'Treino de Força',
      type: 'gym',
      duration_minutes: 45,
      calories_burned: 180,
      performed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
  ]);

  const [streak, setStreak] = useState(7);

  const handleAddMeal = (newMeal: Omit<Meal, 'id' | 'user_id' | 'created_at'>) => {
    const meal: Meal = {
      ...newMeal,
      id: Date.now().toString(),
      user_id: 'demo',
      created_at: new Date().toISOString(),
    };

    setTodayMeals([...todayMeals, meal]);
    
    // Atualizar métricas
    setMetrics({
      ...metrics,
      calories_consumed: metrics.calories_consumed + meal.calories,
      protein: metrics.protein + meal.protein,
      carbs: metrics.carbs + meal.carbs,
      fats: metrics.fats + meal.fats,
      calories_net: metrics.calories_net + meal.calories,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Olá, <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Nutricionista</span>! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Acompanhe suas métricas nutricionais e atividades do dia
        </p>
      </div>

      {/* Streak Banner */}
      <div className="mb-8 p-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{streak} dias</h3>
              <p className="text-emerald-50">Sequência de atividades! Continue assim! 🔥</p>
            </div>
          </div>
          <button className="px-6 py-3 bg-white text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-all shadow-lg">
            Ver Calendário
          </button>
        </div>
      </div>

      {/* Nutrition Metrics */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          Métricas Nutricionais
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricsCard
            title="Calorias Consumidas"
            value={metrics.calories_consumed}
            unit="kcal"
            goal={2000}
            icon={Flame}
            color="emerald"
          />
          <MetricsCard
            title="Calorias Gastas"
            value={metrics.calories_burned}
            unit="kcal"
            goal={500}
            icon={Zap}
            color="orange"
          />
          <MetricsCard
            title="Proteínas"
            value={metrics.protein}
            unit="g"
            goal={150}
            icon={Drumstick}
            color="blue"
          />
          <MetricsCard
            title="Carboidratos"
            value={metrics.carbs}
            unit="g"
            goal={250}
            icon={Wheat}
            color="purple"
          />
        </div>
      </div>

      {/* Today's Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Meals */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Drumstick className="w-5 h-5 text-emerald-600" />
              Refeições de Hoje
            </h2>
            <button 
              onClick={() => setIsAddMealModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Adicionar</span>
            </button>
          </div>
          <div className="space-y-3">
            {todayMeals.map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))}
          </div>
        </div>

        {/* Exercises */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-600" />
              Exercícios de Hoje
            </h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all shadow-lg">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Adicionar</span>
            </button>
          </div>
          <div className="space-y-3">
            {todayExercises.map((exercise) => (
              <ExerciseCard key={exercise.id} exercise={exercise} />
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
          Ações Rápidas
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => setIsAddMealModalOpen(true)}
            className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-100 dark:border-emerald-900/20 hover:shadow-lg transition-all"
          >
            <Drumstick className="w-6 h-6 text-emerald-600 mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Registrar Refeição</p>
          </button>
          <button className="p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-100 dark:border-orange-900/20 hover:shadow-lg transition-all">
            <Zap className="w-6 h-6 text-orange-600 mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Registrar Exercício</p>
          </button>
          <button 
            onClick={() => router.push('/historico')}
            className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-100 dark:border-blue-900/20 hover:shadow-lg transition-all"
          >
            <Calendar className="w-6 h-6 text-blue-600 mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Ver Histórico</p>
          </button>
          <button 
            onClick={() => router.push('/chat')}
            className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-100 dark:border-purple-900/20 hover:shadow-lg transition-all"
          >
            <TrendingUp className="w-6 h-6 text-purple-600 mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Chat IA</p>
          </button>
        </div>
      </div>

      {/* Add Meal Modal */}
      <AddMealModal
        isOpen={isAddMealModalOpen}
        onClose={() => setIsAddMealModalOpen(false)}
        onAddMeal={handleAddMeal}
      />
    </div>
  );
}
