'use client';

import { Users, Calendar, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PlanTemplateCardProps {
  id: string;
  name: string;
  goal: string;
  daysPerWeek: number;
  usersCount: number;
  lastUpdated: string;
}

export function PlanTemplateCard({
  id,
  name,
  goal,
  daysPerWeek,
  usersCount,
  lastUpdated,
}: PlanTemplateCardProps) {
  const router = useRouter();

  const getGoalColor = (g: string) => {
    switch (g) {
      case 'Fat Loss': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'Muscle Gain': return 'bg-violet-500/10 text-violet-500 border-violet-500/20';
      case 'Maintenance': return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg transition-all duration-200 group flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-semibold text-lg text-gray-900 leading-tight">{name}</h3>
        <span className={`text-[11px] font-medium px-2 py-1 rounded-full border ${getGoalColor(goal)}`}>
          {goal}
        </span>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 flex-1">
        <div className="flex items-center gap-1.5">
          <Calendar size={16} />
          <span>{daysPerWeek} Days/week</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users size={16} />
          <span>{usersCount} Members</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
        <span className="text-xs text-gray-400">
          Updated {new Date(lastUpdated).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </span>
        <button
          onClick={() => router.push(`/dashboard/plans/assign?template=${id}`)}
          className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Assign <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
