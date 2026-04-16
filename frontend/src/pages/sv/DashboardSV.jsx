import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";
import { HiOutlineClock } from "react-icons/hi2";

export default function DashboardSV() {
  // Lấy thông tin sinh viên từ localStorage
  const sv = (() => {
    try {
      const s = localStorage.getItem("user");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  })();

  // Lấy thống kê tổng quan sinh viên
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["sv-stats"],
    queryFn: () => api.get("/sv-stats").then(r => r.data),
    refetchInterval: 30000,
  });

  return (
    <div>
      {/* Banner chào mừng */}
      <div className="relative bg-gradient-to-r from-cyan-600 to-blue-400 text-white rounded-xl px-6 py-8 mb-6 overflow-hidden flex flex-col md:flex-row items-center justify-between shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-300/20 rounded-full -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-cyan-300/20 rounded-full translate-y-1/2"></div>
        <div className="relative z-10 w-full md:w-auto mb-4 md:mb-0">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Xin chào, {sv?.name || "Sinh viên"}!</h1>
          <p className="text-cyan-50 text-sm md:text-base">Chúc bạn một kỳ học thành công và nhiều trải nghiệm!</p>
        </div>
        {/* <div className="relative z-10 flex flex-col gap-2 bg-cyan-700/30 px-5 py-3 rounded-lg border border-cyan-400/20 w-fit backdrop-blur-sm self-start md:self-auto">
          <div className="text-sm">MSSV: <span className="font-semibold">{sv?.id || "—"}</span></div>
          <div className="text-sm border-t border-cyan-400/30 pt-2">Lớp: {sv?.lop || "—"}</div>
        </div> */}
      </div>

      <h2 className="text-lg font-semibold text-slate-800 mb-4 px-1">Tổng quan</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-700 mb-2">Thông tin cá nhân</h3>
          <div className="text-slate-700 mb-1">Tên: {sv?.name || "—"}</div>
          <div className="text-slate-700 mb-1">MSSV: {sv?.id || "—"}</div>
          <div className="text-slate-700 mb-1">Lớp: {sv?.class || "—"}</div>
          <div className="text-slate-700 mb-1">Email: {sv?.email || "—"}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full pointer-events-none"></div>
          <HiOutlineClock className="text-blue-500 mb-4" size={48} />
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Giai đoạn hiện tại</h3>
          {statsLoading ? (
            <div className="text-slate-400">Đang tải...</div>
          ) : stats?.giaidoan_hientai ? (
            <>
              <div className="text-lg font-semibold text-blue-700 mb-1">{stats.giaidoan_hientai.mo_ta}</div>
              <div className="text-slate-600 text-sm">{stats.giaidoan_hientai.ngay_bat_dau} - {stats.giaidoan_hientai.ngay_ket_thuc}</div>
              <div className="text-slate-500 text-xs mt-2">Tổng số giai đoạn: {stats.sogiaidoan}</div>
            </>
          ) : (
            <div className="text-slate-400">Không có giai đoạn hiện tại</div>
          )}
        </div>
      </div>

      {/* <h2 className="text-lg font-semibold text-slate-800 mb-4 px-1">Đề tài của bạn</h2>
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-8">
        {statsLoading ? (
          <div className="text-slate-400">Đang tải...</div>
        ) : stats?.ten_de_tai ? (
          <>
            <div className="text-base font-bold text-blue-700 mb-1">{stats.ten_de_tai}</div>
            <div className="text-slate-700 mb-1">Trạng thái: <span className="font-semibold">{stats.trang_thai_de_tai || "—"}</span></div>
          </>
        ) : (
          <div className="text-slate-400">Bạn chưa đăng ký đề tài nào.</div>
        )}
      </div> */}
    </div>
  );
}
