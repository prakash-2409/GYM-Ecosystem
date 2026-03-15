'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { useToast } from '@/components/ui/toast';
import { Drawer } from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Plus, Trash2, Dumbbell, Users, ChevronDown, ChevronUp, X } from 'lucide-react';

interface WorkoutPlanSummary {
  id: string;
  name: string;
  description: string | null;
  isTemplate: boolean;
  createdAt: string;
  days: {
    id: string;
    dayNumber: number;
    dayName: string | null;
    exercises: {
      id: string;
      sets: number;
      reps: string;
      restSeconds: number;
      notes: string | null;
      exercise: { id: string; name: string; muscleGroup: string };
    }[];
  }[];
  _count: { assignments: number };
}

interface ExerciseOption {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string | null;
}

interface DayInput {
  dayNumber: number;
  dayName: string;
  exercises: ExerciseInput[];
}

interface ExerciseInput {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: string;
  restSeconds: number;
  notes: string;
}

export default function WorkoutsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [assignDrawerOpen, setAssignDrawerOpen] = useState(false);
  const [assignPlanId, setAssignPlanId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WorkoutPlanSummary | null>(null);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  const { data: plans, isLoading } = useQuery({
    queryKey: ['workout-plans'],
    queryFn: () => apiClient.get('/workouts').then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/workouts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-plans'] });
      setDeleteTarget(null);
      toast('success', 'Workout plan deleted');
    },
    onError: () => toast('error', 'Failed to delete plan'),
  });

  const handleSaved = () => {
    setDrawerOpen(false);
    queryClient.invalidateQueries({ queryKey: ['workout-plans'] });
  };

  const openAssign = (planId: string) => {
    setAssignPlanId(planId);
    setAssignDrawerOpen(true);
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Workout Plans</h1>
        </div>
        <TableSkeleton rows={4} cols={4} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Workout Plans</h1>
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 h-9 rounded-btn text-sm font-medium hover:opacity-90 active:opacity-80 transition-all duration-150"
        >
          <Plus size={16} />
          Create Plan
        </button>
      </div>

      {!plans?.length ? (
        <div className="bg-surface rounded-card border border-border">
          <EmptyState
            icon={<Dumbbell size={28} />}
            title="No workout plans"
            description="Create workout plans and assign them to your members."
            action={
              <button
                onClick={() => setDrawerOpen(true)}
                className="flex items-center gap-2 bg-primary text-white px-4 h-9 rounded-btn text-sm font-medium hover:opacity-90 transition-all duration-150"
              >
                <Plus size={16} />
                Create Plan
              </button>
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          {(plans as WorkoutPlanSummary[]).map((plan) => (
            <div key={plan.id} className="bg-surface rounded-card border border-border overflow-hidden">
              <div
                className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-[#F5F5F5] transition-colors duration-150"
                onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Dumbbell size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{plan.name}</h3>
                    <p className="text-xs text-gray-500">
                      {plan.days.length} days &middot; {plan._count.assignments} members assigned
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {plan.isTemplate && <Badge variant="info">Template</Badge>}
                  <button
                    onClick={(e) => { e.stopPropagation(); openAssign(plan.id); }}
                    className="h-8 px-3 flex items-center gap-1.5 text-xs font-medium rounded-btn border border-border text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <Users size={14} />
                    Assign
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(plan); }}
                    className="h-8 w-8 flex items-center justify-center rounded-btn text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors duration-150"
                  >
                    <Trash2 size={16} />
                  </button>
                  {expandedPlan === plan.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </div>

              {expandedPlan === plan.id && (
                <div className="border-t border-border px-6 py-4">
                  {plan.description && (
                    <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
                  )}
                  <div className="space-y-4">
                    {plan.days.sort((a, b) => a.dayNumber - b.dayNumber).map((day) => (
                      <div key={day.id}>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                          Day {day.dayNumber}{day.dayName ? ` — ${day.dayName}` : ''}
                        </h4>
                        <div className="bg-gray-50 rounded-btn overflow-hidden">
                          <table className="w-full">
                            <thead>
                              <tr className="text-left">
                                <th className="px-4 py-2 text-xs font-medium text-gray-500">Exercise</th>
                                <th className="px-4 py-2 text-xs font-medium text-gray-500">Sets</th>
                                <th className="px-4 py-2 text-xs font-medium text-gray-500">Reps</th>
                                <th className="px-4 py-2 text-xs font-medium text-gray-500">Rest</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {day.exercises.map((ex) => (
                                <tr key={ex.id}>
                                  <td className="px-4 py-2 text-sm text-gray-900">{ex.exercise.name}</td>
                                  <td className="px-4 py-2 text-sm font-mono text-gray-600">{ex.sets}</td>
                                  <td className="px-4 py-2 text-sm font-mono text-gray-600">{ex.reps}</td>
                                  <td className="px-4 py-2 text-sm font-mono text-gray-600">{ex.restSeconds}s</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Plan Drawer */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Create Workout Plan" width="max-w-2xl">
        <WorkoutPlanForm onSaved={handleSaved} onCancel={() => setDrawerOpen(false)} />
      </Drawer>

      {/* Assign Plan Drawer */}
      <Drawer open={assignDrawerOpen} onClose={() => { setAssignDrawerOpen(false); setAssignPlanId(null); }} title="Assign to Members">
        {assignPlanId && (
          <AssignForm
            planId={assignPlanId}
            onDone={() => {
              setAssignDrawerOpen(false);
              setAssignPlanId(null);
              queryClient.invalidateQueries({ queryKey: ['workout-plans'] });
            }}
          />
        )}
      </Drawer>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Workout Plan"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function WorkoutPlanForm({ onSaved, onCancel }: { onSaved: () => void; onCancel: () => void }) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [days, setDays] = useState<DayInput[]>([
    { dayNumber: 1, dayName: 'Chest', exercises: [] },
  ]);
  const [saving, setSaving] = useState(false);

  // Exercise search
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [activeDay, setActiveDay] = useState<number | null>(null);

  const { data: exercises } = useQuery({
    queryKey: ['exercises', exerciseSearch],
    queryFn: () => apiClient.get('/workouts/exercises', { params: { search: exerciseSearch || undefined } }).then((r) => r.data),
    enabled: exerciseSearch.length > 1,
  });

  const addDay = () => {
    setDays([...days, { dayNumber: days.length + 1, dayName: '', exercises: [] }]);
  };

  const removeDay = (idx: number) => {
    const updated = days.filter((_, i) => i !== idx).map((d, i) => ({ ...d, dayNumber: i + 1 }));
    setDays(updated);
  };

  const addExercise = (dayIdx: number, ex: ExerciseOption) => {
    const updated = [...days];
    updated[dayIdx].exercises.push({
      exerciseId: ex.id,
      exerciseName: ex.name,
      sets: 3,
      reps: '12',
      restSeconds: 60,
      notes: '',
    });
    setDays(updated);
    setExerciseSearch('');
    setActiveDay(null);
  };

  const removeExercise = (dayIdx: number, exIdx: number) => {
    const updated = [...days];
    updated[dayIdx].exercises = updated[dayIdx].exercises.filter((_, i) => i !== exIdx);
    setDays(updated);
  };

  const updateExercise = (dayIdx: number, exIdx: number, field: keyof ExerciseInput, value: string | number) => {
    const updated = [...days];
    (updated[dayIdx].exercises[exIdx] as Record<string, unknown>)[field] = value;
    setDays(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast('error', 'Plan name is required');
      return;
    }

    setSaving(true);
    try {
      await apiClient.post('/workouts', {
        name: name.trim(),
        description: description.trim() || undefined,
        days: days.map((d) => ({
          dayNumber: d.dayNumber,
          dayName: d.dayName || undefined,
          exercises: d.exercises.map((ex) => ({
            exerciseId: ex.exerciseId,
            sets: ex.sets,
            reps: ex.reps,
            restSeconds: ex.restSeconds,
            notes: ex.notes || undefined,
          })),
        })),
      });
      toast('success', 'Workout plan created');
      onSaved();
    } catch {
      toast('error', 'Failed to create plan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Beginner Push Pull Legs"
            className="w-full h-10 px-3 border border-border rounded-btn text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow duration-150"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional"
            rows={2}
            className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none transition-shadow duration-150"
          />
        </div>
      </div>

      {/* Days */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Days</h3>
          <button
            type="button"
            onClick={addDay}
            className="text-xs text-primary hover:underline font-medium"
          >
            + Add Day
          </button>
        </div>

        {days.map((day, dayIdx) => (
          <div key={dayIdx} className="border border-border rounded-card p-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-500 uppercase shrink-0">Day {day.dayNumber}</span>
              <input
                type="text"
                value={day.dayName}
                onChange={(e) => {
                  const updated = [...days];
                  updated[dayIdx].dayName = e.target.value;
                  setDays(updated);
                }}
                placeholder="e.g. Chest & Triceps"
                className="flex-1 h-8 px-2 border border-border rounded text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow duration-150"
              />
              {days.length > 1 && (
                <button type="button" onClick={() => removeDay(dayIdx)} className="text-gray-400 hover:text-red-500 transition-colors duration-150">
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Exercises list */}
            {day.exercises.map((ex, exIdx) => (
              <div key={exIdx} className="flex items-center gap-2 bg-gray-50 rounded-btn px-3 py-2">
                <span className="text-sm text-gray-900 flex-1 truncate">{ex.exerciseName}</span>
                <input
                  type="number"
                  value={ex.sets}
                  onChange={(e) => updateExercise(dayIdx, exIdx, 'sets', Number(e.target.value))}
                  className="w-14 h-7 px-2 border border-border rounded text-xs font-mono text-center focus:ring-2 focus:ring-primary outline-none"
                  title="Sets"
                  min={1}
                />
                <span className="text-xs text-gray-400">x</span>
                <input
                  type="text"
                  value={ex.reps}
                  onChange={(e) => updateExercise(dayIdx, exIdx, 'reps', e.target.value)}
                  className="w-14 h-7 px-2 border border-border rounded text-xs font-mono text-center focus:ring-2 focus:ring-primary outline-none"
                  title="Reps"
                />
                <input
                  type="number"
                  value={ex.restSeconds}
                  onChange={(e) => updateExercise(dayIdx, exIdx, 'restSeconds', Number(e.target.value))}
                  className="w-16 h-7 px-2 border border-border rounded text-xs font-mono text-center focus:ring-2 focus:ring-primary outline-none"
                  title="Rest (sec)"
                  min={0}
                />
                <button type="button" onClick={() => removeExercise(dayIdx, exIdx)} className="text-gray-400 hover:text-red-500 transition-colors duration-150">
                  <X size={14} />
                </button>
              </div>
            ))}

            {/* Add exercise search */}
            <div className="relative">
              <input
                type="text"
                value={activeDay === dayIdx ? exerciseSearch : ''}
                onFocus={() => setActiveDay(dayIdx)}
                onChange={(e) => { setActiveDay(dayIdx); setExerciseSearch(e.target.value); }}
                placeholder="Search exercises to add..."
                className="w-full h-8 px-3 border border-dashed border-gray-300 rounded-btn text-sm text-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow duration-150"
              />
              {activeDay === dayIdx && exercises?.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-surface border border-border rounded-btn shadow-lg max-h-48 overflow-y-auto">
                  {(exercises as ExerciseOption[]).map((ex) => (
                    <button
                      key={ex.id}
                      type="button"
                      onClick={() => addExercise(dayIdx, ex)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors duration-150 flex items-center justify-between"
                    >
                      <span>{ex.name}</span>
                      <span className="text-xs text-gray-400">{ex.muscleGroup}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          className="h-9 px-4 text-sm font-medium rounded-btn border border-border text-gray-700 hover:bg-gray-50 transition-colors duration-150"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="h-9 px-4 text-sm font-medium rounded-btn bg-primary text-white hover:opacity-90 disabled:opacity-50 transition-all duration-150"
        >
          {saving ? 'Creating...' : 'Create Plan'}
        </button>
      </div>
    </form>
  );
}

function AssignForm({ planId, onDone }: { planId: string; onDone: () => void }) {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const { data } = useQuery({
    queryKey: ['members', search],
    queryFn: () => apiClient.get('/members', { params: { search: search || undefined, limit: 50 } }).then((r) => r.data),
  });

  const members = data?.members || [];

  const toggleMember = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleAssign = async () => {
    if (!selectedIds.length) {
      toast('error', 'Select at least one member');
      return;
    }
    setSaving(true);
    try {
      await apiClient.post(`/workouts/${planId}/assign`, { memberIds: selectedIds });
      toast('success', `Plan assigned to ${selectedIds.length} member(s)`);
      onDone();
    } catch {
      toast('error', 'Failed to assign plan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search members..."
        className="w-full h-10 px-3 border border-border rounded-btn text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow duration-150"
      />

      <div className="border border-border rounded-btn overflow-hidden max-h-80 overflow-y-auto">
        {members.map((m: Record<string, unknown>) => {
          const user = m.user as Record<string, string>;
          const memberId = m.id as string;
          return (
            <label
              key={memberId}
              className="flex items-center gap-3 px-4 py-3 hover:bg-[#F5F5F5] transition-colors duration-150 cursor-pointer border-b border-border last:border-b-0"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(memberId)}
                onChange={() => toggleMember(memberId)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.phone}</p>
              </div>
            </label>
          );
        })}
      </div>

      {selectedIds.length > 0 && (
        <p className="text-xs text-gray-500">{selectedIds.length} member(s) selected</p>
      )}

      <button
        onClick={handleAssign}
        disabled={saving || !selectedIds.length}
        className="w-full h-9 text-sm font-medium rounded-btn bg-primary text-white hover:opacity-90 disabled:opacity-50 transition-all duration-150"
      >
        {saving ? 'Assigning...' : `Assign to ${selectedIds.length} Member(s)`}
      </button>
    </div>
  );
}
