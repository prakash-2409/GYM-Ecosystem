export interface DietChart {
  id: string;
  gymId: string;
  name: string;
  description: string | null;
  totalCalories: number | null;
  createdBy: string | null;
  isTemplate: boolean;
  meals: DietMeal[];
  createdAt: string;
  updatedAt: string;
}

export interface DietMeal {
  id: string;
  mealType: string;
  mealName: string;
  description: string | null;
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  timeSuggestion: string | null;
  sortOrder: number;
}
