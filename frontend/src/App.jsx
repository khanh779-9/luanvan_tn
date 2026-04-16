
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import AdminSinhVien from './pages/admin/SinhVien';
import AdminGiangVien from './pages/admin/GiangVien';
import AdminPhanCong from './pages/admin/PhanCong';
import AdminNhapLieu from './pages/admin/NhapLieu';
import AdminGiaiDoanPage from './pages/admin/GiaiDoan';
import GVTongQuan from './pages/gv/TongQuan';
import GVHDGiuaKy from './pages/gv/GiuaKy';
import GVHDHuongDan from './pages/gv/HuongDan';
import GVPBPhanBien from './pages/gv/PhanBien';
import GVHoiDong from './pages/gv/HoiDong';
import TongQuan from './pages/admin/TongQuan';
import { useAuth } from './context/AuthContext';

const queryClient = new QueryClient();


function App() {
  // Lấy user từ context hoặc localStorage
  const { user: contextUser } = useAuth() || {};
  let user = contextUser;
  if (!user) {
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        user = JSON.parse(saved);
      } catch {}
    }
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route element={<RoleRoute allowed="thuky" />}>
              <Route path="/admin/tong-quan" element={<TongQuan />} />
              <Route path="/admin/sinhvien" element={<AdminSinhVien />} />
              <Route path="/admin/giangvien" element={<AdminGiangVien />} />
              <Route path="/admin/phancong" element={<AdminPhanCong />} />
              <Route path="/admin/giaidoan" element={<AdminGiaiDoanPage />} />
              <Route path="/admin/nhaplieu" element={<AdminNhapLieu />} />
            </Route>
            <Route element={<RoleRoute allowed="gv" />}>
              <Route path="/gv/tong-quan" element={<GVTongQuan />} />
              <Route path="/gv/giua-ky" element={<GVHDGiuaKy />} />
              <Route path="/gv/huongdan" element={<GVHDHuongDan />} />
              <Route path="/gv/phanbien" element={<GVPBPhanBien />} />
              <Route path="/gv/hoidong" element={<GVHoiDong />} />
            </Route>
          </Route>
        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </QueryClientProvider>
  );
}

export default App;