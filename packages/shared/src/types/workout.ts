export interface Exercise {
  id: string;
  name: string;
  nameHi: string | null;
  muscleGroup: string;
  equipment: string | null;
  description: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
}

export interface WorkoutPlan {
  id: string;
  gymId: string;
  name: string;
  description: string | null;
  createdBy: string | null;
  isTemplate: boolean;
  days: WorkoutPlanDay[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutPlanDay {
  id: string;
  dayNumber: number;
  dayName: string | null;
  sortOrder: number;
  exercises: WorkoutPlanExercise[];
}

export interface WorkoutPlanExercise {
  id: string;
  exercise: Exercise;
  sets: number;
  reps: string;
  restSeconds: number;
  notes: string | null;
  sortOrder: number;
}
