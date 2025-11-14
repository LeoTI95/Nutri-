'use client';

import { useState, useRef } from 'react';
import { X, Camera, Upload, Loader2, Drumstick } from 'lucide-react';
import { Meal } from '@/lib/types';

interface AddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMeal: (meal: Omit<Meal, 'id' | 'user_id' | 'created_at'>) => void;
}

interface AnalyzedFood {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  confidence: number;
}

export function AddMealModal({ isOpen, onClose, onAddMeal }: AddMealModalProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedFood, setAnalyzedFood] = useState<AnalyzedFood | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Criar preview da imagem
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Analisar imagem com OpenAI
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/analyze-food', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro ao analisar imagem');
      }

      const data = await response.json();
      setAnalyzedFood(data);
    } catch (error) {
      console.error('Erro ao analisar imagem:', error);
      alert('Erro ao analisar a imagem. Tente novamente.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleSubmit = () => {
    if (!analyzedFood) return;

    onAddMeal({
      name: analyzedFood.name,
      calories: analyzedFood.calories,
      protein: analyzedFood.protein,
      carbs: analyzedFood.carbs,
      fats: analyzedFood.fats,
      meal_type: mealType,
      consumed_at: new Date().toISOString(),
    });

    // Reset
    setAnalyzedFood(null);
    setImagePreview(null);
    onClose();
  };

  const handleReset = () => {
    setAnalyzedFood(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/20">
              <Drumstick className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Adicionar Refeição
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Upload Area */}
          {!imagePreview && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tire uma foto do alimento
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-emerald-500 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                  id="food-image"
                />
                <label
                  htmlFor="food-image"
                  className="cursor-pointer flex flex-col items-center gap-4"
                >
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/20">
                    <Camera className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      Clique para tirar foto ou fazer upload
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      A IA irá identificar o alimento e suas informações nutricionais
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Selecionar Imagem</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Image Preview & Analysis */}
          {imagePreview && (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-xl"
                />
                {!isAnalyzing && !analyzedFood && (
                  <button
                    onClick={handleReset}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Loading */}
              {isAnalyzing && (
                <div className="flex flex-col items-center justify-center py-8 gap-4">
                  <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
                  <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Analisando imagem...
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    A IA está identificando o alimento e calculando as informações nutricionais
                  </p>
                </div>
              )}

              {/* Analysis Result */}
              {analyzedFood && !isAnalyzing && (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-900/30">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                      Alimento Identificado
                    </h3>
                    <p className="text-2xl font-bold text-emerald-600 mb-1">
                      {analyzedFood.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Confiança: {Math.round(analyzedFood.confidence * 100)}%
                    </p>
                  </div>

                  {/* Nutritional Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Calorias</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {analyzedFood.calories}
                        <span className="text-sm font-normal text-gray-500 ml-1">kcal</span>
                      </p>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Proteínas</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {analyzedFood.protein}
                        <span className="text-sm font-normal text-gray-500 ml-1">g</span>
                      </p>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Carboidratos</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {analyzedFood.carbs}
                        <span className="text-sm font-normal text-gray-500 ml-1">g</span>
                      </p>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Gorduras</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {analyzedFood.fats}
                        <span className="text-sm font-normal text-gray-500 ml-1">g</span>
                      </p>
                    </div>
                  </div>

                  {/* Meal Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tipo de Refeição
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'breakfast', label: 'Café da Manhã' },
                        { value: 'lunch', label: 'Almoço' },
                        { value: 'dinner', label: 'Jantar' },
                        { value: 'snack', label: 'Lanche' },
                      ].map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setMealType(type.value as any)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            mealType === type.value
                              ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
                              : 'border-gray-200 dark:border-gray-600 hover:border-emerald-300'
                          }`}
                        >
                          <span className="font-medium">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleReset}
                      className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Tirar Outra Foto
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-lg"
                    >
                      Adicionar Refeição
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
