import React from 'react';

export default function Pagination({ page, setPage, total, perPage = 15, itemName = 'bản ghi' }) {
  if (!total || total <= perPage) return null;

  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);
  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="flex items-center justify-between mt-4">
      <span className="text-sm text-slate-500">
        Hiển thị {start}-{end} / {total} {itemName}
      </span>
      <div className="flex gap-1">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-1 text-sm border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          Trước
        </button>
        
        {/* Render maximum 10 page buttons to prevent UI overflow */}
        {[...Array(Math.min(totalPages, 10))].map((_, i) => {
          const pgNumber = i + 1;
          const isActive = page === pgNumber;
          return (
            <button
              key={i}
              onClick={() => setPage(pgNumber)}
              className={`px-3 py-1 text-sm border rounded transition-colors ${
                isActive
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              {pgNumber}
            </button>
          );
        })}
        
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className="px-3 py-1 text-sm border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          Sau
        </button>
      </div>
    </div>
  );
}
