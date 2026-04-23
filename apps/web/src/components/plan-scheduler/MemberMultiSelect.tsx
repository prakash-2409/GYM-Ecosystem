'use client';

import { useState } from 'react';
import { MOCK_MEMBERS } from '@/lib/mock-data';
import { Search, Check } from 'lucide-react';

interface MemberMultiSelectProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function MemberMultiSelect({ selectedIds, onChange }: MemberMultiSelectProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Active' | 'Beginners' | 'Fat Loss'>('All');

  // Simple mock filtering logic
  const filteredMembers = MOCK_MEMBERS.filter((m) => {
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'Active' && m.status !== 'active') return false;
    // Mock rules for 'Beginners' / 'Fat Loss'
    if (filter === 'Beginners' && m.totalVisits > 50) return false;
    if (filter === 'Fat Loss' && (m.gender as string) === 'Unknown') return false; // dummy logic
    return true;
  });

  const toggleMember = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((sid) => sid !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const selectAll = () => {
    const allFilteredIds = filteredMembers.map(m => m.id);
    const newSelected = new Set([...selectedIds, ...allFilteredIds]);
    onChange(Array.from(newSelected));
  };
  
  const clearSelection = () => {
    onChange([]);
  };

  return (
    <div className="bg-white border text-gray-900 border-gray-200 rounded-xl overflow-hidden flex flex-col h-[500px]">
      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2 mb-3 bg-white border border-gray-200 rounded-lg p-2 focus-within:border-primary/50 transition-colors">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search members..."
            className="w-full text-sm outline-none bg-transparent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {['All', 'Active', 'Beginners', 'Fat Loss'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === f 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Selected: <b className="text-gray-900">{selectedIds.length}</b> members</span>
          <div className="flex gap-3">
            <button onClick={selectAll} className="text-primary font-medium hover:underline">Select All</button>
            <button onClick={clearSelection} className="text-gray-400 font-medium hover:text-gray-600">Clear</button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filteredMembers.map((m) => {
          const isSelected = selectedIds.includes(m.id);
          return (
            <div
              key={m.id}
              onClick={() => toggleMember(m.id)}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors mb-1 border border-transparent ${
                isSelected ? 'bg-primary/5 border-primary/20' : 'hover:bg-gray-50'
              }`}
            >
              <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                isSelected ? 'bg-primary border-primary text-white' : 'border-gray-300 bg-white'
              }`}>
                {isSelected && <Check size={12} strokeWidth={3} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 truncate">{m.name}</p>
                <p className="text-xs text-gray-500 truncate">Current plan: {m.plan}</p>
              </div>
            </div>
          );
        })}
        {filteredMembers.length === 0 && (
          <div className="p-8 text-center text-gray-500 text-sm">
            No members found matching filters.
          </div>
        )}
      </div>
    </div>
  );
}
