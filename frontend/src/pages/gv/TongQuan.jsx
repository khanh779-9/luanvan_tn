import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import {
  HiOutlinePencilSquare,
  HiOutlineClipboardDocumentCheck,
  HiOutlineUserGroup,
  HiOutlineChartBar,
  HiOutlineClock
} from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';

export default function GVTongQuan() {
  const navigate = useNavigate();
  const { user } = useAuth() || {};

  const { data: statsData, isLoading } = useQuery({
    queryKey: ['gv-stats'],
    queryFn: () => api.get('/gv-stats').then(res => res.data),
    refetchInterval: 30000,
  });

  const hdCount = statsData?.sodetai_hd || 0;
  const pbCount = statsData?.sodetai_pb || 0;
  const hdongCount = statsData?.sodetai_hoidong || 0;
  const currentStage = statsData?.giaidoan_hientai || null;


  const getRoleBadge = (roleName) => {
    if (!roleName) return 'Giảng viên';
    if (roleName.toLowerCase() === 'thuky') return 'Thư ký khoa';
    if (roleName.toLowerCase() === 'uyvien') return 'Ủy viên hội đồng';
    if (roleName.toLowerCase() === 'giangvien') return 'Giảng viên';
    
    
    return roleName;
  };

  const statCards = [
    { label: 'Đề tài Nhận Hướng Dẫn', value: hdCount, icon: HiOutlinePencilSquare, color: 'blue', path: '/gv/huongdan' },
    { label: 'Đề tài Phân Phản Biện', value: pbCount, icon: HiOutlineClipboardDocumentCheck, color: 'cyan', path: '/gv/phanbien' },
    { label: 'Hội đồng tham gia', value: hdongCount, icon: HiOutlineUserGroup, color: 'green', path: '/gv/hoidong' },
  ];

  const colorMap = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-500' },
    cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', icon: 'text-cyan-500' },
    green: { bg: 'bg-green-50', text: 'text-green-600', icon: 'text-green-500' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', icon: 'text-amber-500' },
  };


  return (
    <div>
      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-r from-emerald-600 to-emerald-400 text-white rounded-xl px-6 py-8 mb-6 overflow-hidden flex flex-col md:flex-row items-center justify-between shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-300/20 rounded-full -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-emerald-300/20 rounded-full translate-y-1/2"></div>
        
        <div className="relative z-10 w-full md:w-auto mb-4 md:mb-0">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Xin chào, {user?.name || 'Giảng viên'}!</h1>
          <p className="text-emerald-50 text-sm md:text-base">Chúc bạn một ngày làm việc hiệu quả và tràn đầy năng lượng.</p>
        </div>
        
        <div className="relative z-10 flex flex-col gap-2 bg-emerald-700/30 px-5 py-3 rounded-lg border border-emerald-400/20 w-fit backdrop-blur-sm self-start md:self-auto">
          <div className="text-sm">
            Mã giảng viên: <span className="font-semibold">{user?.id || '—'}</span>
          </div>
          <div className="text-sm border-t border-emerald-400/30 pt-2">
            Vai trò: {getRoleBadge(user?.role)}
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-slate-800 mb-4 px-1">Tổng quan công việc hiện tại</h2>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {isLoading
          ? Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse min-h-[120px]">
                <div className="w-1/2 h-3 bg-slate-200 rounded mb-4"></div>
                <div className="w-1/4 h-8 bg-slate-200 rounded"></div>
              </div>
            ))
          : statCards.map(card => {
              const c = colorMap[card.color];
              // const Icon = card.icon; // Remove icon usage
              return (
                <div
                  key={card.label}
                  onClick={() => card.path && navigate(card.path)}
                  className={`bg-white rounded-xl border border-slate-200 p-5 transition-all hover:-translate-y-1 hover:shadow-lg ${card.path ? 'cursor-pointer' : ''}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{card.label}</span>
                    {/* Icon removed here */}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <div className={`text-4xl font-extrabold ${c.text}`}>{card.value}</div>
                    
                  </div>
                </div>
              );
            })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Stage */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-50 rounded-full pointer-events-none"></div>
          <HiOutlineClock className="text-amber-500 mb-4" size={48} />
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
            Tiến độ chung
          </h3>
          {currentStage ? (
            <div>
              <p className="text-lg font-bold text-slate-800 mb-2">{currentStage.mo_ta}</p>
              <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full mb-3 shadow-sm">Đang diễn ra</span>
              <p className="text-sm text-slate-500 font-medium bg-slate-50 px-4 py-2 rounded-lg border border-slate-100 placeholder-slate-400">
                {currentStage.ngay_bat_dau} <span className="mx-2">đến</span> {currentStage.ngay_ket_thuc}
              </p>
            </div>
          ) : (
            <p className="text-slate-500 font-medium">Hiện tại khoa không có tiến độ nào đang mở.</p>
          )}
        </div>

        {/* Quick Shortcut Panel */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <HiOutlineChartBar className="text-blue-600" /> Bản tin nhanh
          </h3>
          <div className="bg-slate-50 rounded-lg p-5 border border-slate-100 text-sm text-slate-600 space-y-4">
            <p className="leading-relaxed">
              Bạn có thể tiến hành chấm điểm <span className="font-semibold text-slate-800">Giữa kỳ</span>, <span className="font-semibold text-slate-800">Hướng dẫn</span>, và <span className="font-semibold text-slate-800">Phản biện</span> trong menu bên trái. 
            </p>
            <p className="leading-relaxed">
              Hãy chú ý thời hạn các giai đoạn của Khoa. Bảng chấm điểm ở mỗi trang hỗ trợ <strong>nhập điểm liên tục</strong> và ngay lập tức đồng bộ về hệ thống chung.
            </p>
            <div className="pt-2">
              <button 
                onClick={() => navigate('/gv/giua-ky')}
                className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-medium transition-colors shadow-sm w-full md:w-auto text-center"
              >
                Chuyển đến Chấm Giữa Kỳ →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
