'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { MOCK_EXERCISES } from '@/lib/mock-data';

interface ExerciseDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export function ExerciseDropdown({ value, onChange }: ExerciseDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredExercises = MOCK_EXERCISES.filter((ex) =>
    ex.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div
        className="flex items-center justify-between w-full p-2.5 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? 'text-gray-900 text-sm' : 'text-gray-400 text-sm'}>
          {value || 'Select exercise...'}
        </span>
        <ChevronDown size={16} className="text-gray-400" />
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-gray-100 flex items-center gap-2">
            <Search size={14} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full text-sm outline-none bg-transparent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="overflow-y-auto flex-1 p-1">
            {filteredExercises.length > 0 ? (
              filteredExercises.map((ex) => (
                <div
                  key={ex.id}
                  className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded cursor-pointer"
                  onClick={() => {
                    onChange(ex.name);
                    setIsOpen(false);
                    setSearch('');
                  }}
                >
                  {ex.name} <span className="text-xs text-gray-400 ml-1">({ex.muscleGroup})</span>
                </div>
              ))
            ) : (
              <div
                className="px-3 py-2 text-sm text-primary hover:bg-primary/5 rounded cursor-pointer font-medium"
                onClick={() => {
                  onChange(search);
                  setIsOpen(false);
                  setSearch('');
                }}
              >
                + Add custom: "{search}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
