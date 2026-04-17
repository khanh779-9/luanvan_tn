import React from 'react';
import { HiOutlineXMark } from 'react-icons/hi2';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-lg"
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[80] px-4" onClick={onClose}>
      <div 
        className={`bg-white rounded-xl p-6 w-full mx-auto relative shadow-xl max-h-[90vh] overflow-y-auto ${maxWidth}`}
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 hover:bg-slate-100 rounded-full p-1" 
          aria-label="Đóng"
        >
          <HiOutlineXMark size={20} />
        </button>
        {title && <h2 className="text-xl font-bold text-slate-900 mb-6 pr-8">{title}</h2>}
        
        {children}
      </div>
    </div>
  );
}
