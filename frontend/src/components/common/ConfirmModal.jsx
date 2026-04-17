import React from 'react';
import { HiOutlineExclamationTriangle } from 'react-icons/hi2';

export default function ConfirmModal({ 
  isOpen, 
  title = "Xác nhận xóa?", 
  message = "Hành động này không thể hoàn tác.", 
  onConfirm, 
  onCancel, 
  loading = false,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  error = null
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]" onClick={onCancel}>
      <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 text-center shadow-xl" onClick={e => e.stopPropagation()}>
        <HiOutlineExclamationTriangle className="text-red-500 mx-auto mb-4" size={48} />
        <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 mb-6">{message}</p>
        
        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-6 text-left border border-red-100">
            {error}
          </div>
        )}
        
        <div className="flex justify-center gap-3 mt-2">
          <button 
            onClick={onCancel}
            disabled={loading}
            className="flex-1 border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium py-2 rounded-lg transition-colors text-sm"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm} 
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition-colors text-sm disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
