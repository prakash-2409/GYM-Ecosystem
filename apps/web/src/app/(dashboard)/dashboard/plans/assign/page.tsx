'use client';

import { useState, Suspense } from 'react';
import { MOCK_TEMPLATES } from '@/lib/mock-data';
import { MemberMultiSelect } from '@/components/plan-scheduler/MemberMultiSelect';
import { PDFPreviewModal } from '@/components/plan-scheduler/PDFPreviewModal';
import { ChevronLeft, Send, FileText, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function AssignPlanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTemplateId = searchParams?.get('template') || MOCK_TEMPLATES[0].id;

  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplateId);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState('1 Month');
  const [sendWhatsApp, setSendWhatsApp] = useState(true);
  const [sendPush, setSendPush] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  const template = MOCK_TEMPLATES.find(t => t.id === selectedTemplate);

  const handleAssign = () => {
    if (selectedMembers.length === 0) return alert('Select at least one member.');
    // Mock save
    alert(`Successfully assigned to ${selectedMembers.length} members and sent notifications!`);
    router.push('/dashboard/plans/library');
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/plans/library" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Assign Plan</h1>
          <p className="text-sm text-gray-500 mt-1">Bulk assign workout template to members</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Col: Template & Settings */}
        <div className="flex-1 space-y-6">
          <div className="bg-white border text-gray-900 border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">1. Select Template</h2>
            <select
              className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm focus:border-primary/50 outline-none appearance-none font-medium"
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
            >
              {MOCK_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.goal})</option>
              ))}
            </select>
          </div>

          <div className="bg-white border text-gray-900 border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">3. Settings & Distribution</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full bg-transparent border border-gray-200 rounded-lg p-2.5 text-sm" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration</label>
                <select 
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm outline-none"
                >
                  <option>1 Month</option>
                  <option>2 Months</option>
                  <option>3 Months</option>
                  <option>Custom</option>
                </select>
              </div>
            </div>

            <h3 className="text-sm font-medium text-gray-700 mb-3">Notify Members via:</h3>
            <div className="space-y-3 mb-8">
              <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input type="checkbox" className="mt-1 w-4 h-4 text-primary rounded" checked={sendWhatsApp} onChange={e => setSendWhatsApp(e.target.checked)} />
                <div>
                  <div className="flex items-center gap-1.5 font-medium text-sm text-gray-900"><MessageCircle size={16} className="text-green-500"/> WhatsApp (PDF Attached)</div>
                  <p className="text-xs text-gray-500 mt-0.5">Sends personalized PDF plan via WhatsApp.</p>
                </div>
              </label>
              <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input type="checkbox" className="mt-1 w-4 h-4 text-primary rounded" checked={sendPush} onChange={e => setSendPush(e.target.checked)} />
                <div>
                  <div className="flex items-center gap-1.5 font-medium text-sm text-gray-900"><Smartphone size={16} className="text-violet-500"/> Push Notification (App)</div>
                  <p className="text-xs text-gray-500 mt-0.5">Alerts member in their GymOS app.</p>
                </div>
              </label>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  if (selectedMembers.length === 0) return alert('Select members first.');
                  setShowPreview(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 px-5 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <FileText size={18} /> Preview PDF
              </button>
              <button
                onClick={handleAssign}
                className="flex-[2] flex items-center justify-center gap-2 bg-primary text-white border border-transparent px-5 py-3 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
              >
                Assign to {selectedMembers.length} Members <Send size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Member Selection */}
        <div className="w-full lg:w-[400px]">
          <div className="bg-white border text-gray-900 border-gray-200 rounded-2xl p-6 shadow-sm h-full flex flex-col">
            <h2 className="text-lg font-semibold mb-4">2. Select Members</h2>
            <MemberMultiSelect selectedIds={selectedMembers} onChange={setSelectedMembers} />
          </div>
        </div>
      </div>

      {showPreview && (
        <PDFPreviewModal
          template={template}
          membersCount={selectedMembers.length}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}

// Separate MessageCircle icon for WhatsApp
import { MessageCircle } from 'lucide-react';

export default function AssignPlanPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AssignPlanContent />
    </Suspense>
  );
}
