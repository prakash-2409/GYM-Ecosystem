import { MOCK_TEMPLATES } from '@/lib/mock-data';
import { PlanTemplateCard } from '@/components/plan-scheduler/PlanTemplateCard';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function PlansLibraryPage() {
  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Monthly Plan Scheduler</h1>
          <p className="text-sm text-gray-500 mt-1">Manage workout and diet plan templates</p>
        </div>
        <Link
          href="/dashboard/plans/create"
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Create New Template
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {MOCK_TEMPLATES.map((template) => (
          <PlanTemplateCard
            key={template.id}
            id={template.id}
            name={template.name}
            goal={template.goal}
            daysPerWeek={template.daysPerWeek}
            usersCount={template.usersCount}
            lastUpdated={template.lastUpdated}
          />
        ))}

        {/* Create new placeholder card */}
        <Link
          href="/dashboard/plans/create"
          className="bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-8 hover:bg-gray-50 hover:border-primary/30 transition-colors group h-full min-h-[180px]"
        >
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-400 group-hover:text-primary transition-colors mb-3">
            <Plus size={24} />
          </div>
          <span className="text-sm font-medium text-gray-600 group-hover:text-primary transition-colors text-center">
            Create Custom Plan
          </span>
        </Link>
      </div>
    </div>
  );
}
