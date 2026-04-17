import { useState } from 'react';
import { Outlet } from 'react-router';
import StageStatusBanner from '../components/StageStatusBanner';
import { HiOutlineBars3 } from 'react-icons/hi2';
import Sidebar from '../components/Sidebar';

export default function MainLayout({ role }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 h-screen overflow-y-auto bg-slate-50">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-600 hover:text-slate-900 p-1"
            aria-label="Mở menu"
          >
            <HiOutlineBars3 size={24} />
          </button>
          <span className="text-sm font-semibold text-slate-800">QL Luận văn</span>
        </div>

        <div className="p-4 md:p-8">
          <StageStatusBanner>
            <Outlet />
          </StageStatusBanner>
        </div>
      </main>
    </div>
  );
}
