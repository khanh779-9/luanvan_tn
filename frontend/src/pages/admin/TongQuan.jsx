import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  HiOutlineAcademicCap,
  HiOutlineUsers,
  HiOutlineDocumentText,
  HiOutlineClipboardDocumentCheck,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineArrowTrendingUp,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2';
import { Bar, Doughnut } from 'react-chartjs-2';
import { getOverallStats } from '../../services/dashboardService';
import api from '../../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function TongQuan() {
  const navigate = useNavigate();

  const user = (() => {
    try {
      const s = localStorage.getItem('user');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  })();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getOverallStats,
    refetchInterval: 30000,
  });

  const { data: recentForms, isLoading: formsLoading } = useQuery({
    queryKey: ['dashboard-recent-forms'],
    queryFn: () => api.get('/nhap-lieu', { params: { per_page: 5 } }).then(r => r.data?.data || []),
  });



  const sodetai = stats?.sodetai || 0;
  const sosinhvien = stats?.sosinhvien || 0;
  const detaiDaxong = stats?.detai_daxong || 0;
  const currentStage = stats?.giaidoan_hientai || null;
  const totalStages = stats?.sogiaidoan || 0;

  const statCards = [
    { label: 'Tổng đề tài', value: sodetai, icon: HiOutlineDocumentText, color: 'blue', path: '/admin/nhaplieu' },
    { label: 'Tổng sinh viên', value: sosinhvien, icon: HiOutlineUsers, color: 'cyan', path: '/admin/sinhvien' },
    { label: 'Đề tài hoàn thành', value: detaiDaxong, icon: HiOutlineCheckCircle, color: 'green', path: null },
    { label: 'Giai đoạn hiện tại', value: currentStage ? `${currentStage.index}/${totalStages}` : 'Không có', icon: HiOutlineClock, color: 'amber', path: '/admin/giaidoan', isText: true },
  ];

  const colorMap = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-500' },
    cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', icon: 'text-cyan-500' },
    green: { bg: 'bg-green-50', text: 'text-green-600', icon: 'text-green-500' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', icon: 'text-amber-500' },
  };

  const recentList = Array.isArray(recentForms) ? recentForms : [];

  const STATUS_MAP = {
    cho_duyet: { label: 'Chờ duyệt', cls: 'bg-amber-50 text-amber-700' },
    da_duyet: { label: 'Đã duyệt', cls: 'bg-green-50 text-green-700' },
    tu_choi: { label: 'Từ chối', cls: 'bg-red-50 text-red-600' },
  };

  // Chart data
  const barData = {
    labels: ['Đề tài', 'Sinh viên', 'Hoàn thành'],
    datasets: [{
      label: 'Số lượng',
      data: [sodetai, sosinhvien, detaiDaxong],
      backgroundColor: ['#3b82f6', '#06b6d4', '#10b981'],
      borderRadius: 8,
      barThickness: 40,
    }],
  };

  const doughnutData = {
    labels: ['Hoàn thành', 'Đang thực hiện'],
    datasets: [{
      data: [detaiDaxong, Math.max(0, sodetai - detaiDaxong)],
      backgroundColor: ['#10b981', '#e2e8f0'],
      borderWidth: 0,
    }],
  };

  return (
    <div>
      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl px-6 py-5 mb-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/20 rounded-full -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-1/2 w-40 h-40 bg-blue-400/10 rounded-full translate-y-1/2"></div>
        <div className="relative">
          <h1 className="text-xl md:text-2xl font-bold">Xin chào, {user?.name || 'Admin'}!</h1>
          <div className="text-blue-100 text-sm mt-2 space-y-0.5">
            <div>Mã giảng viên: <span className="font-medium text-white">{user?.id || '—'}</span></div>
            <div className="hidden sm:block">Email: <span className="font-medium text-white">{user?.email || '—'}</span></div>
            <div>Vai trò: <span className="font-medium text-white">Thư ký khoa</span></div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsLoading
          ? Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
                <div className="w-1/2 h-3 bg-slate-200 rounded mb-4"></div>
                <div className="w-1/3 h-7 bg-slate-200 rounded"></div>
              </div>
            ))
          : statCards.map(card => {
              const c = colorMap[card.color];
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  onClick={() => card.path && navigate(card.path)}
                  className={`bg-white rounded-xl border border-slate-200 p-4 transition-all hover:shadow-md ${card.path ? 'cursor-pointer' : ''}`}
                >
                  <div className="mb-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.label}</span>
                  </div>
                  <div className={`${card.isText ? 'text-sm' : 'text-2xl'} font-bold ${c.text} truncate`} title={String(card.value)}>{card.value}</div>
                </div>
              );
            })}
      </div>

      {/* Charts + Current Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">
            Thống kê tổng quan
          </h3>
          <div className="h-[250px]">
            {statsLoading ? (
              <div className="w-full h-full bg-slate-100 rounded-lg animate-pulse"></div>
            ) : (
              <Bar
                data={barData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true, grace: '15%', ticks: { stepSize: 1 } },
                    x: { grid: { display: false } },
                  },
                }}
              />
            )}
          </div>
        </div>

        {/* Doughnut + Stage */}
        <div className="space-y-6">
          {/* Doughnut */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Tỷ lệ hoàn thành</h3>
            <div className="h-[150px] flex items-center justify-center">
              {statsLoading ? (
                <div className="w-32 h-32 bg-slate-100 rounded-full animate-pulse"></div>
              ) : sodetai === 0 ? (
                <p className="text-sm text-slate-400">Chưa có đề tài</p>
              ) : (
                <Doughnut
                  data={doughnutData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                      legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12, font: { size: 11 } } },
                    },
                  }}
                />
              )}
            </div>
          </div>

          {/* Current Stage */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Giai đoạn hiện tại
            </h3>
            {currentStage ? (
              <div>
                <p className="text-sm font-medium text-slate-800">{currentStage.object.mo_ta}</p>
                <p className="text-xs text-slate-400 mt-1">{currentStage.object.ngay_bat_dau} → {currentStage.object.ngay_ket_thuc}</p>
                <span className="inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700">Đang diễn ra</span>
              </div>
            ) : (
              <p className="text-sm text-slate-400">Không có giai đoạn nào đang diễn ra.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Registrations + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">
              Đăng ký đề tài gần đây
            </h3>
            <button onClick={() => navigate('/admin/nhaplieu')} className="text-xs text-blue-600 hover:text-blue-800 font-semibold">
              Xem tất cả →
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tên đề tài</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Sinh viên</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {formsLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(3)].map((_, ci) => (
                      <td key={ci} className="px-4 py-3 border-t border-slate-100">
                        <div className="bg-slate-100 animate-pulse rounded h-4 w-3/4"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : recentList.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center">
                    <p className="text-sm text-slate-400">Chưa có đăng ký đề tài nào.</p>
                  </td>
                </tr>
              ) : (
                recentList.map(item => {
                  const st = STATUS_MAP[item.status] || { label: item.status, cls: 'bg-slate-100 text-slate-600' };
                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100 font-medium max-w-[200px] truncate" title={item.topic_title}>
                        {item.topic_title}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100">
                        {item.student1_name}
                        {item.student2_name && <span className="text-slate-400">, {item.student2_name}</span>}
                      </td>
                      <td className="px-4 py-3 border-t border-slate-100">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Thao tác nhanh</h3>
          <div className="space-y-3">
            {[
              { label: 'Quản lý sinh viên', path: '/admin/sinhvien', icon: HiOutlineUsers, color: 'blue' },
              { label: 'Quản lý giảng viên', path: '/admin/giangvien', icon: HiOutlineAcademicCap, color: 'cyan' },
              { label: 'Nhập liệu đề tài', path: '/admin/nhaplieu', icon: HiOutlineDocumentText, color: 'amber' },
              { label: 'Phân công', path: '/admin/phancong', icon: HiOutlineUsers, color: 'green' },
              { label: 'Cấu hình giai đoạn', path: '/admin/giaidoan', icon: HiOutlineClock, color: 'blue' },
            ].map(item => {
              const c = colorMap[item.color];
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 border border-slate-100 transition-colors text-left"
                >
                  <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={c.icon} size={16} />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
