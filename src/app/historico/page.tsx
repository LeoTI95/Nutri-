'use client';

import { useState } from 'react';
import { Calendar, TrendingUp, Drumstick, Zap, ChevronLeft, ChevronRight } from 'lucide-react';

export default function HistoricoPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Mock data - será substituído por dados reais do Supabase
  const historicalData = [
    {
      date: '2024-01-15',
      calories_consumed: 1850,
      calories_burned: 420,
      protein: 110,
      carbs: 180,
      meals: 4,
      exercises: 2,
    },
    {
      date: '2024-01-14',
      calories_consumed: 1920,
      calories_burned: 380,
      protein: 95,
      carbs: 195,
      meals: 5,
      exercises: 1,
    },
    {
      date: '2024-01-13',
      calories_consumed: 1780,
      calories_burned: 450,
      protein: 105,
      carbs: 170,
      meals: 4,
      exercises: 2,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Histórico de Atividades 📊
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Acompanhe seu progresso ao longo do tempo
        </p>
      </div>

      {/* Date Navigation */}
      <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all">
            <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Janeiro 2024
            </h2>
          </div>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all">
            <ChevronRight className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Historical Data Cards */}
      <div className="space-y-4">
        {historicalData.map((day, index) => (
          <div
            key={index}
            className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {new Date(day.date).toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {day.meals} refeições • {day.exercises} exercícios
                  </p>
                </div>
              </div>
              <button className="px-4 py-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all">
                Ver detalhes
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Drumstick className="w-4 h-4 text-emerald-600" />
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Calorias
                  </p>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {day.calories_consumed}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">kcal consumidas</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-orange-600" />
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Queimadas
                  </p>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {day.calories_burned}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">kcal gastas</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Proteínas
                  </p>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {day.protein}g
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">consumidas</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Carboidratos
                  </p>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {day.carbs}g
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">consumidos</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-8 p-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-xl">
        <h3 className="text-xl font-bold text-white mb-4">Resumo do Mês</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-emerald-100 text-sm mb-1">Total de Refeições</p>
            <p className="text-3xl font-bold text-white">13</p>
          </div>
          <div>
            <p className="text-emerald-100 text-sm mb-1">Total de Exercícios</p>
            <p className="text-3xl font-bold text-white">5</p>
          </div>
          <div>
            <p className="text-emerald-100 text-sm mb-1">Média de Calorias</p>
            <p className="text-3xl font-bold text-white">1,850</p>
          </div>
          <div>
            <p className="text-emerald-100 text-sm mb-1">Dias Ativos</p>
            <p className="text-3xl font-bold text-white">3</p>
          </div>
        </div>
      </div>
    </div>
  );
}
