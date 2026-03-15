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
import { Plus, Trash2, UtensilsCrossed, Copy, Users, ChevronDown, ChevronUp, X } from 'lucide-react';

const MEAL_TYPES = ['breakfast', 'pre-workout', 'lunch', 'post-workout', 'dinner', 'bed-time'] as const;

const MEAL_TYPE_LABELS: Record<string, string> = {
  'breakfast': 'Breakfast',
  'pre-workout': 'Pre-Workout',
  'lunch': 'Lunch',
  'post-workout': 'Post-Workout',
  'dinner': 'Dinner',
  'bed-time': 'Bed Time',
};

interface DietChartSummary {
  id: string;
  name: string;
  description: string | null;
  totalCalories: number | null;
  isTemplate: boolean;
  createdAt: string;
  meals: MealRow[];
  _count: { assignments: number };
}

interface MealRow {
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

interface MealInput {
  mealType: string;
  mealName: string;
  description: string;
  calories: string;
  proteinG: string;
  carbsG: string;
  fatG: string;
  timeSuggestion: string;
}

export default function DietsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [assignDrawerOpen, setAssignDrawerOpen] = useState(false);
  const [assignChartId, setAssignChartId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DietChartSummary | null>(null);
  const [duplicateTarget, setDuplicateTarget] = useState<DietChartSummary | null>(null);
  const [duplicateName, setDuplicateName] = useState('');
  const [expandedChart, setExpandedChart] = useState<string | null>(null);

  const { data: charts, isLoading } = useQuery({
    queryKey: ['diet-charts'],
    queryFn: () => apiClient.get('/diets').then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/diets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diet-charts'] });
      setDeleteTarget(null);
      toast('success', 'Diet chart deleted');
    },
    onError: () => toast('error', 'Failed to delete chart'),
  });

  const duplicateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      apiClient.post(`/diets/${id}/duplicate`, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diet-charts'] });
      setDuplicateTarget(null);
      setDuplicateName('');
      toast('success', 'Diet chart duplicated');
    },
    onError: () => toast('error', 'Failed to duplicate chart'),
  });

  const handleSaved = () => {
    setDrawerOpen(false);
    queryClient.invalidateQueries({ queryKey: ['diet-charts'] });
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Diet Charts</h1>
        </div>
        <TableSkeleton rows={4} cols={4} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Diet Charts</h1>
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 h-9 rounded-btn text-sm font-medium hover:opacity-90 active:opacity-80 transition-all duration-150"
        >
          <Plus size={16} />
          Create Chart
        </button>
      </div>

      {!charts?.length ? (
        <div className="bg-surface rounded-card border border-border">
          <EmptyState
            icon={<UtensilsCrossed size={28} />}
            title="No diet charts"
            description="Create diet plans with meal slots and assign them to your members."
            action={
              <button
                onClick={() => setDrawerOpen(true)}
                className="flex items-center gap-2 bg-primary text-white px-4 h-9 rounded-btn text-sm font-medium hover:opacity-90 transition-all duration-150"
              >
                <Plus size={16} />
                Create Chart
              </button>
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          {(charts as DietChartSummary[]).map((chart) => (
            <div key={chart.id} className="bg-surface rounded-card border border-border overflow-hidden">
              <div
                className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-[#F5F5F5] transition-colors duration-150"
                onClick={() => setExpandedChart(expandedChart === chart.id ? null : chart.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                    <UtensilsCrossed size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{chart.name}</h3>
                    <p className="text-xs text-gray-500">
                      {chart.meals.length} meals
                      {chart.totalCalories && <> &middot; <span className="font-mono">{chart.totalCalories}</span> cal</>}
                      {' '}&middot; {chart._count.assignments} members
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {chart.isTemplate && <Badge variant="info">Template</Badge>}
                  <button
                    onClick={(e) => { e.stopPropagation(); setDuplicateTarget(chart); setDuplicateName(`${chart.name} (Copy)`); }}
                    className="h-8 w-8 flex items-center justify-center rounded-btn text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-150"
                    title="Duplicate"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setAssignChartId(chart.id); setAssignDrawerOpen(true); }}
                    className="h-8 px-3 flex items-center gap-1.5 text-xs font-medium rounded-btn border border-border text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <Users size={14} />
                    Assign
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(chart); }}
                    className="h-8 w-8 flex items-center justify-center rounded-btn text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors duration-150"
                  >
                    <Trash2 size={16} />
                  </button>
                  {expandedChart === chart.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </div>

              {expandedChart === chart.id && (
                <div className="border-t border-border px-6 py-4">
                  {chart.description && (
                    <p className="text-sm text-gray-500 mb-4">{chart.description}</p>
                  )}
                  <div className="grid gap-3">
                    {MEAL_TYPES.map((type) => {
                      const meals = chart.meals.filter((m) => m.mealType === type).sort((a, b) => a.sortOrder - b.sortOrder);
                      if (!meals.length) return null;
                      return (
                        <div key={type} className="bg-gray-50 rounded-btn p-4">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                            {MEAL_TYPE_LABELS[type] || type}
                            {meals[0].timeSuggestion && <span className="font-mono ml-2 text-gray-400">{meals[0].timeSuggestion}</span>}
                          </h4>
                          {meals.map((meal) => (
                            <div key={meal.id} className="flex items-center justify-between py-1">
                              <div>
                                <span className="text-sm text-gray-900">{meal.mealName}</span>
                                {meal.description && <span className="text-xs text-gray-500 ml-2">— {meal.description}</span>}
                              </div>
                              <div className="flex items-center gap-3 text-xs font-mono text-gray-500">
                                {meal.calories && <span>{meal.calories} cal</span>}
                                {meal.proteinG && <span>P:{Number(meal.proteinG)}g</span>}
                                {meal.carbsG && <span>C:{Number(meal.carbsG)}g</span>}
                                {meal.fatG && <span>F:{Number(meal.fatG)}g</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Chart Drawer */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Create Diet Chart" width="max-w-2xl">
        <DietChartForm onSaved={handleSaved} onCancel={() => setDrawerOpen(false)} />
      </Drawer>

      {/* Assign Drawer */}
      <Drawer open={assignDrawerOpen} onClose={() => { setAssignDrawerOpen(false); setAssignChartId(null); }} title="Assign to Members">
        {assignChartId && (
          <AssignDietForm
            chartId={assignChartId}
            onDone={() => {
              setAssignDrawerOpen(false);
              setAssignChartId(null);
              queryClient.invalidateQueries({ queryKey: ['diet-charts'] });
            }}
          />
        )}
      </Drawer>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Diet Chart"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Duplicate Dialog */}
      {duplicateTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => { setDuplicateTarget(null); setDuplicateName(''); }} />
          <div className="relative bg-surface rounded-card border border-border shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-base font-semibold mb-3">Duplicate Diet Chart</h3>
            <input
              type="text"
              value={duplicateName}
              onChange={(e) => setDuplicateName(e.target.value)}
              placeholder="New chart name"
              className="w-full h-10 px-3 border border-border rounded-btn text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setDuplicateTarget(null); setDuplicateName(''); }}
                className="h-9 px-4 text-sm font-medium rounded-btn border border-border text-gray-700 hover:bg-gray-50 transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                onClick={() => duplicateName.trim() && duplicateMutation.mutate({ id: duplicateTarget.id, name: duplicateName.trim() })}
                disabled={!duplicateName.trim() || duplicateMutation.isPending}
                className="h-9 px-4 text-sm font-medium rounded-btn bg-primary text-white hover:opacity-90 disabled:opacity-50 transition-all duration-150"
              >
                {duplicateMutation.isPending ? 'Duplicating...' : 'Duplicate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DietChartForm({ onSaved, onCancel }: { onSaved: () => void; onCancel: () => void }) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [meals, setMeals] = useState<MealInput[]>([
    { mealType: 'breakfast', mealName: '', description: '', calories: '', proteinG: '', carbsG: '', fatG: '', timeSuggestion: '8:00 AM' },
  ]);
  const [saving, setSaving] = useState(false);

  const addMeal = (type: string) => {
    setMeals([...meals, {
      mealType: type,
      mealName: '',
      description: '',
      calories: '',
      proteinG: '',
      carbsG: '',
      fatG: '',
      timeSuggestion: '',
    }]);
  };

  const removeMeal = (idx: number) => {
    setMeals(meals.filter((_, i) => i !== idx));
  };

  const updateMeal = (idx: number, field: keyof MealInput, value: string) => {
    const updated = [...meals];
    updated[idx] = { ...updated[idx], [field]: value };
    setMeals(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast('error', 'Chart name is required');
      return;
    }
    if (!meals.some((m) => m.mealName.trim())) {
      toast('error', 'Add at least one meal');
      return;
    }

    setSaving(true);
    try {
      const totalCal = meals.reduce((sum, m) => sum + (Number(m.calories) || 0), 0);
      await apiClient.post('/diets', {
        name: name.trim(),
        description: description.trim() || undefined,
        totalCalories: totalCal || undefined,
        meals: meals
          .filter((m) => m.mealName.trim())
          .map((m, i) => ({
            mealType: m.mealType,
            mealName: m.mealName.trim(),
            description: m.description.trim() || undefined,
            calories: Number(m.calories) || undefined,
            proteinG: Number(m.proteinG) || undefined,
            carbsG: Number(m.carbsG) || undefined,
            fatG: Number(m.fatG) || undefined,
            timeSuggestion: m.timeSuggestion.trim() || undefined,
            sortOrder: i,
          })),
      });
      toast('success', 'Diet chart created');
      onSaved();
    } catch {
      toast('error', 'Failed to create diet chart');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Chart Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Bulking Diet — 3000 cal"
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

      {/* Meal slots */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Meals</h3>
        </div>

        {/* Meal type quick-add buttons */}
        <div className="flex flex-wrap gap-2">
          {MEAL_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => addMeal(type)}
              className="text-xs px-3 py-1.5 rounded-full border border-dashed border-gray-300 text-gray-500 hover:border-primary hover:text-primary transition-colors duration-150"
            >
              + {MEAL_TYPE_LABELS[type]}
            </button>
          ))}
        </div>

        {meals.map((meal, idx) => (
          <div key={idx} className="border border-border rounded-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="default">{MEAL_TYPE_LABELS[meal.mealType] || meal.mealType}</Badge>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={meal.timeSuggestion}
                  onChange={(e) => updateMeal(idx, 'timeSuggestion', e.target.value)}
                  placeholder="Time"
                  className="w-24 h-7 px-2 border border-border rounded text-xs font-mono text-center focus:ring-2 focus:ring-primary outline-none"
                />
                {meals.length > 1 && (
                  <button type="button" onClick={() => removeMeal(idx)} className="text-gray-400 hover:text-red-500 transition-colors duration-150">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <input
              type="text"
              value={meal.mealName}
              onChange={(e) => updateMeal(idx, 'mealName', e.target.value)}
              placeholder="Food items (e.g. 4 Eggs + 2 Toast + Banana)"
              className="w-full h-9 px-3 border border-border rounded-btn text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow duration-150"
            />

            <input
              type="text"
              value={meal.description}
              onChange={(e) => updateMeal(idx, 'description', e.target.value)}
              placeholder="Quantity & notes (optional)"
              className="w-full h-8 px-3 border border-border rounded-btn text-xs focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow duration-150"
            />

            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Calories</label>
                <input
                  type="number"
                  value={meal.calories}
                  onChange={(e) => updateMeal(idx, 'calories', e.target.value)}
                  placeholder="0"
                  className="w-full h-7 px-2 border border-border rounded text-xs font-mono text-center focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Protein (g)</label>
                <input
                  type="number"
                  value={meal.proteinG}
                  onChange={(e) => updateMeal(idx, 'proteinG', e.target.value)}
                  placeholder="0"
                  step="0.1"
                  className="w-full h-7 px-2 border border-border rounded text-xs font-mono text-center focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Carbs (g)</label>
                <input
                  type="number"
                  value={meal.carbsG}
                  onChange={(e) => updateMeal(idx, 'carbsG', e.target.value)}
                  placeholder="0"
                  step="0.1"
                  className="w-full h-7 px-2 border border-border rounded text-xs font-mono text-center focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Fat (g)</label>
                <input
                  type="number"
                  value={meal.fatG}
                  onChange={(e) => updateMeal(idx, 'fatG', e.target.value)}
                  placeholder="0"
                  step="0.1"
                  className="w-full h-7 px-2 border border-border rounded text-xs font-mono text-center focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
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
          {saving ? 'Creating...' : 'Create Chart'}
        </button>
      </div>
    </form>
  );
}

function AssignDietForm({ chartId, onDone }: { chartId: string; onDone: () => void }) {
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
    if (!selectedIds.length) return;
    setSaving(true);
    try {
      await apiClient.post(`/diets/${chartId}/assign`, { memberIds: selectedIds });
      toast('success', `Diet assigned to ${selectedIds.length} member(s)`);
      onDone();
    } catch {
      toast('error', 'Failed to assign diet');
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
