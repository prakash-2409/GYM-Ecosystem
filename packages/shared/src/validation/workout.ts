import { z } from 'zod';

const exerciseInPlanSchema = z.object({
  exerciseId: z.string().uuid(),
  sets: z.number().int().positive().default(3),
  reps: z.string().default('12'),
  restSeconds: z.number().int().min(0).default(60),
  notes: z.string().max(500).optional(),
  sortOrder: z.number().int().min(0).default(0),
});

const workoutDaySchema = z.object({
  dayNumber: z.number().int().positive(),
  dayName: z.string().max(50).optional(),
  sortOrder: z.number().int().min(0).default(0),
  exercises: z.array(exerciseInPlanSchema).min(1),
});

export const createWorkoutPlanSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(1000).optional(),
  isTemplate: z.boolean().default(false),
  days: z.array(workoutDaySchema).min(1),
});

export const assignWorkoutSchema = z.object({
  memberIds: z.array(z.string().uuid()).min(1),
});

const mealSchema = z.object({
  mealType: z.string(),
  mealName: z.string().min(2).max(200),
  description: z.string().max(500).optional(),
  calories: z.number().int().min(0).optional(),
  proteinG: z.number().min(0).optional(),
  carbsG: z.number().min(0).optional(),
  fatG: z.number().min(0).optional(),
  timeSuggestion: z.string().max(20).optional(),
  sortOrder: z.number().int().min(0).default(0),
});

export const createDietChartSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(1000).optional(),
  totalCalories: z.number().int().min(0).optional(),
  isTemplate: z.boolean().default(false),
  meals: z.array(mealSchema).min(1),
});

export const assignDietSchema = z.object({
  memberIds: z.array(z.string().uuid()).min(1),
});

export type CreateWorkoutPlanInput = z.infer<typeof createWorkoutPlanSchema>;
export type CreateDietChartInput = z.infer<typeof createDietChartSchema>;
