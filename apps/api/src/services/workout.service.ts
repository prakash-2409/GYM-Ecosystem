import prisma from '@gymstack/db';

export async function getWorkoutPlans(gymId: string) {
  const plans = await prisma.workoutPlan.findMany({
    where: { gymId },
    include: {
      days: {
        orderBy: { sortOrder: 'asc' },
        include: {
          exercises: {
            orderBy: { sortOrder: 'asc' },
            include: { exercise: true },
          },
        },
      },
      _count: { select: { assignments: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return plans;
}

export async function getWorkoutPlanById(id: string, gymId: string) {
  const plan = await prisma.workoutPlan.findFirst({
    where: { id, gymId },
    include: {
      days: {
        orderBy: { sortOrder: 'asc' },
        include: {
          exercises: {
            orderBy: { sortOrder: 'asc' },
            include: { exercise: true },
          },
        },
      },
      assignments: {
        include: {
          member: {
            include: { user: { select: { name: true } } },
          },
        },
      },
    },
  });

  if (!plan) throw new Error('Workout plan not found');

  return plan;
}

export async function createWorkoutPlan(gymId: string, userId: string, data: {
  name: string;
  description?: string;
  isTemplate?: boolean;
  days: {
    dayNumber: number;
    dayName?: string;
    exercises: {
      exerciseId: string;
      sets: number;
      reps: string;
      restSeconds?: number;
      notes?: string;
    }[];
  }[];
}) {
  const plan = await prisma.workoutPlan.create({
    data: {
      gymId,
      createdBy: userId,
      name: data.name,
      description: data.description,
      isTemplate: data.isTemplate ?? false,
      days: {
        create: data.days.map((day, dayIndex) => ({
          dayNumber: day.dayNumber,
          dayName: day.dayName,
          sortOrder: dayIndex,
          exercises: {
            create: day.exercises.map((ex, exIndex) => ({
              exerciseId: ex.exerciseId,
              sets: ex.sets,
              reps: ex.reps,
              restSeconds: ex.restSeconds ?? 60,
              notes: ex.notes,
              sortOrder: exIndex,
            })),
          },
        })),
      },
    },
    include: {
      days: {
        orderBy: { sortOrder: 'asc' },
        include: {
          exercises: {
            orderBy: { sortOrder: 'asc' },
            include: { exercise: true },
          },
        },
      },
    },
  });

  return plan;
}

export async function updateWorkoutPlan(id: string, gymId: string, data: {
  name: string;
  description?: string;
  isTemplate?: boolean;
  days: {
    dayNumber: number;
    dayName?: string;
    exercises: {
      exerciseId: string;
      sets: number;
      reps: string;
      restSeconds?: number;
      notes?: string;
    }[];
  }[];
}) {
  const existing = await prisma.workoutPlan.findFirst({ where: { id, gymId } });
  if (!existing) throw new Error('Workout plan not found');

  // Delete existing days (cascades to exercises) and recreate
  await prisma.workoutPlanDay.deleteMany({ where: { workoutPlanId: id } });

  const plan = await prisma.workoutPlan.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      isTemplate: data.isTemplate ?? existing.isTemplate,
      days: {
        create: data.days.map((day, dayIndex) => ({
          dayNumber: day.dayNumber,
          dayName: day.dayName,
          sortOrder: dayIndex,
          exercises: {
            create: day.exercises.map((ex, exIndex) => ({
              exerciseId: ex.exerciseId,
              sets: ex.sets,
              reps: ex.reps,
              restSeconds: ex.restSeconds ?? 60,
              notes: ex.notes,
              sortOrder: exIndex,
            })),
          },
        })),
      },
    },
    include: {
      days: {
        orderBy: { sortOrder: 'asc' },
        include: {
          exercises: {
            orderBy: { sortOrder: 'asc' },
            include: { exercise: true },
          },
        },
      },
    },
  });

  return plan;
}

export async function deleteWorkoutPlan(id: string, gymId: string) {
  const plan = await prisma.workoutPlan.findFirst({ where: { id, gymId } });
  if (!plan) throw new Error('Workout plan not found');

  await prisma.workoutPlan.delete({ where: { id } });
  return true;
}

export async function assignWorkoutPlan(workoutPlanId: string, memberIds: string[], assignedBy: string) {
  // Deactivate existing active assignments for these members
  await prisma.memberWorkoutAssignment.updateMany({
    where: {
      memberId: { in: memberIds },
      isActive: true,
    },
    data: { isActive: false },
  });

  // Create new assignments for all members
  const assignments = await prisma.$transaction(
    memberIds.map((memberId) =>
      prisma.memberWorkoutAssignment.create({
        data: {
          memberId,
          workoutPlanId,
          assignedBy,
          isActive: true,
        },
      }),
    ),
  );

  return assignments;
}

export async function getExercises(search?: string, muscleGroup?: string) {
  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { nameHi: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (muscleGroup) {
    where.muscleGroup = muscleGroup;
  }

  const exercises = await prisma.exercise.findMany({
    where: where as Parameters<typeof prisma.exercise.findMany>[0]['where'],
    orderBy: { name: 'asc' },
  });

  return exercises;
}

export async function getAssignments(gymId: string) {
  const assignments = await prisma.memberWorkoutAssignment.findMany({
    where: {
      isActive: true,
      workoutPlan: { gymId },
    },
    include: {
      member: {
        include: { user: { select: { name: true } } },
      },
      workoutPlan: { select: { name: true } },
    },
    orderBy: { assignedAt: 'desc' },
  });

  return assignments;
}
