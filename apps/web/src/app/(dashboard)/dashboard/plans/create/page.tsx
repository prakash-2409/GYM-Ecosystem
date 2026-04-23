'use client';

import { useState } from 'react';
import { ChevronLeft, Plus, Trash2, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExerciseDropdown } from '@/components/plan-scheduler/ExerciseDropdown';

export default function CreatePlanPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('Fat Loss');
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [days, setDays] = useState<any[]>([
    { name: 'Day 1', exercises: [] }
  ]);
  const [diet, setDiet] = useState({ morning: '', preWorkout: '', postWorkout: '', night: '' });
  const [notes, setNotes] = useState('');

  const handleUpdateDays = (val: number) => {
    setDaysPerWeek(val);
    const newDays = [...days];
    if (val > newDays.length) {
      for (let i = newDays.length; i < val; i++) {
        newDays.push({ name: `Day ${i + 1}`, exercises: [] });
      }
    } else {
      newDays.splice(val);
    }
    setDays(newDays);
  };

  const addExercise = (dayIndex: number) => {
    const newDays = [...days];
    newDays[dayIndex].exercises.push({ exercise: '', sets: 3, reps: '10', rest: '60s' });
    setDays(newDays);
  };

  const updateExercise = (dayIndex: number, exIndex: number, field: string, value: any) => {
    const newDays = [...days];
    newDays[dayIndex].exercises[exIndex][field] = value;
    setDays(newDays);
  };

  const removeExercise = (dayIndex: number, exIndex: number) => {
    const newDays = [...days];
    newDays[dayIndex].exercises.splice(exIndex, 1);
    setDays(newDays);
  };

  const handleSave = () => {
    // Mock save logic
    router.push('/dashboard/plans/library');
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/plans/library" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create Template</h1>
          <p className="text-sm text-gray-500 mt-1">Design a reusable workout and diet plan</p>
        </div>
        <div className="flex-1" />
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Save size={18} />
          Save Template
        </button>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white border text-gray-900 border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Basic Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Plan Name</label>
              <input
                type="text"
                placeholder="e.g. Beginner Fat Loss — Month 1"
                className="w-full bg-transparent border border-gray-200 rounded-lg p-2.5 text-sm focus:border-primary/50 outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Goal</label>
              <select
                className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm focus:border-primary/50 outline-none appearance-none"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              >
                <option>Fat Loss</option>
                <option>Muscle Gain</option>
                <option>Maintenance</option>
                <option>Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Days per week</label>
              <select
                className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm focus:border-primary/50 outline-none appearance-none"
                value={daysPerWeek}
                onChange={(e) => handleUpdateDays(Number(e.target.value))}
              >
                {[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n} Days</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Workout Builder */}
        <div className="bg-white border text-gray-900 border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Workout Schedule</h2>
          <div className="space-y-8">
            {days.map((day, dIdx) => (
              <div key={dIdx} className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gray-50 border-b border-gray-100 p-4">
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-gray-900 min-w-16">Day {dIdx + 1}</span>
                    <input
                      type="text"
                      placeholder="e.g. Chest & Triceps or Rest Day"
                      className="flex-1 bg-white border border-gray-200 rounded-md p-1.5 text-sm focus:border-primary/50 outline-none"
                      value={day.name}
                      onChange={(e) => {
                        const newDays = [...days];
                        newDays[dIdx].name = e.target.value;
                        setDays(newDays);
                      }}
                    />
                  </div>
                </div>
                <div className="p-4 bg-white space-y-3">
                  {day.exercises.map((ex: any, eIdx: number) => (
                    <div key={eIdx} className="flex flex-col md:flex-row items-center gap-3 bg-gray-50/50 p-2 rounded-lg border border-gray-100">
                      <div className="flex-1 w-full min-w-[200px]">
                        <ExerciseDropdown
                          value={ex.exercise}
                          onChange={(val) => updateExercise(dIdx, eIdx, 'exercise', val)}
                        />
                      </div>
                      <div className="flex items-center gap-2 text-sm justify-between w-full md:w-auto">
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-500">Sets:</span>
                          <input type="number" className="w-14 bg-white border border-gray-200 rounded p-1 text-center" value={ex.sets} onChange={(e) => updateExercise(dIdx, eIdx, 'sets', e.target.value)} />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-500">Reps:</span>
                          <input type="text" className="w-16 bg-white border border-gray-200 rounded p-1 text-center" value={ex.reps} onChange={(e) => updateExercise(dIdx, eIdx, 'reps', e.target.value)} />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-500">Rest:</span>
                          <input type="text" className="w-16 bg-white border border-gray-200 rounded p-1 text-center" value={ex.rest} onChange={(e) => updateExercise(dIdx, eIdx, 'rest', e.target.value)} />
                        </div>
                        <button onClick={() => removeExercise(dIdx, eIdx)} className="p-1.5 text-gray-400 hover:text-red-500 rounded"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => addExercise(dIdx)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:bg-primary/5 py-1.5 px-3 rounded-lg transition-colors mt-2">
                    <Plus size={16} /> Add Exercise
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Diet & Notes */}
        <div className="bg-white border text-gray-900 border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Diet & Notes (Optional)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Morning</label><input type="text" value={diet.morning} onChange={e => setDiet({...diet, morning: e.target.value})} className="w-full bg-transparent border border-gray-200 rounded-lg p-2.5 text-sm" placeholder="Breakfast suggestion" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Pre Workout</label><input type="text" value={diet.preWorkout} onChange={e => setDiet({...diet, preWorkout: e.target.value})} className="w-full bg-transparent border border-gray-200 rounded-lg p-2.5 text-sm" placeholder="Pre-workout meal" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Post Workout</label><input type="text" value={diet.postWorkout} onChange={e => setDiet({...diet, postWorkout: e.target.value})} className="w-full bg-transparent border border-gray-200 rounded-lg p-2.5 text-sm" placeholder="Post-workout meal" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Night</label><input type="text" value={diet.night} onChange={e => setDiet({...diet, night: e.target.value})} className="w-full bg-transparent border border-gray-200 rounded-lg p-2.5 text-sm" placeholder="Dinner suggestion" /></div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Coach's Notes for Member</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full bg-transparent border border-gray-200 rounded-lg p-2.5 text-sm" placeholder="General tips and motivation..."></textarea>
          </div>
        </div>
      </div>
    </div>
  );
}
