'use client';

import { X } from 'lucide-react';
import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import the PDF component to avoid SSR issues
const PDFPreview = dynamic(() => import('./PDFPreview'), { ssr: false });

interface PDFPreviewModalProps {
  onClose: () => void;
  template: any;
  membersCount: number;
}

export function PDFPreviewModal({ onClose, template, membersCount }: PDFPreviewModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
          <div>
            <h2 className="font-semibold text-gray-900 border-none">PDF Generation Preview</h2>
            <p className="text-xs text-gray-500 mt-1">This will be generated individually for {membersCount} members.</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 bg-gray-200 p-4">
          <PDFPreview template={template} />
        </div>
      </div>
    </div>
  );
}
