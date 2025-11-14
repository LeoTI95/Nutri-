export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  goal_calories: number;
  goal_protein: number;
  goal_carbs: number;
  created_at: string;
}

export interface Meal {
  id: string;
  user_id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  consumed_at: string;
  created_at: string;
}

export interface Exercise {
  id: string;
  user_id: string;
  name: string;
  type: 'walking' | 'running' | 'football' | 'spinning' | 'cycling' | 'gym' | 'other';
  duration_minutes: number;
  calories_burned: number;
  performed_at: string;
  created_at: string;
}

export interface DailyActivity {
  id: string;
  user_id: string;
  activity_date: string;
  has_exercise: boolean;
  has_meal_log: boolean;
  total_calories_consumed: number;
  total_calories_burned: number;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface NutritionMetrics {
  calories_consumed: number;
  calories_burned: number;
  calories_net: number;
  protein: number;
  carbs: number;
  fats: number;
}
