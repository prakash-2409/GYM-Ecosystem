import Link from 'next/link';
import { ChevronLeft, Plus, Sparkles } from 'lucide-react';
import { MOCK_TEMPLATES } from '@/lib/mock-data';

export default function CreatePlanPage() {
  return (
  <div className="max-w-5xl mx-auto pb-16">
    <div className="flex items-center gap-4 mb-8">
    <Link href="/dashboard/plans/library" className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Back to plan library">
      <ChevronLeft size={20} className="text-gray-600" />
    </Link>
    <div>
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create Template</h1>
      <p className="text-sm text-gray-500 mt-1">Start from a proven workout structure and customize it for a member group.</p>
    </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.9fr] gap-6">
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Template starter</h2>
        <p className="text-sm text-gray-500 mt-1">Pick a direction, then copy and refine it in the next sprint.</p>
      </div>
      <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
        <Sparkles size={20} />
      </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {MOCK_TEMPLATES.map((template) => (
        <div key={template.id} className="rounded-2xl border border-gray-200 p-4 bg-gray-50/60">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
          <h3 className="font-semibold text-gray-900">{template.name}</h3>
          <p className="text-xs text-gray-500 mt-1">{template.goal}</p>
          </div>
          <span className="text-[11px] font-medium px-2 py-1 rounded-full border border-gray-200 bg-white text-gray-600">
          {template.daysPerWeek} days/week
          </span>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{template.usersCount} active members</span>
          <span>{new Date(template.lastUpdated).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
        </div>
        </div>
      ))}
      </div>
    </div>

    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Next step</h2>
      <p className="text-sm text-gray-500 leading-6">
      The production flow for creating a custom plan can be added here next. For now, the library and assignment screens are fully usable, and this route stays stable for build and demo navigation.
      </p>

      <div className="mt-6 space-y-3">
      <Link href="/dashboard/plans/library" className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-white px-4 py-3 text-sm font-medium hover:bg-primary/90 transition-colors">
        <Plus size={18} />
        Back to Plan Library
      </Link>
      <Link href="/dashboard/plans/assign" className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-gray-700 px-4 py-3 text-sm font-medium hover:bg-gray-50 transition-colors">
        Open Assignment Flow
      </Link>
      </div>
    </div>
    </div>
  </div>
  );
}
