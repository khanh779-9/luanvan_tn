import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HiOutlineExclamationTriangle } from 'react-icons/hi2';
import { getAssignments, updateAssignment, deleteAssignment } from '../../services/phanCongService';
import { getLecturers } from '../../services/giangVienService';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';

export default function AdminPhanCongPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  
  const [showFormModal, setShowFormModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  const [formGVHD, setFormGVHD] = useState('');
  const [formGVPB, setFormGVPB] = useState('');

  // Debounce search update
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch dữ liệu phân công (đã hỗ trợ phân trang)
  const { data: pcData, isLoading } = useQuery({
    queryKey: ['phancong', page, debouncedSearch],
    queryFn: () => getAssignments({ page, q: debouncedSearch, per_page: 15 }),
  });

  const { data: gvData } = useQuery({
    queryKey: ['giangvien'],
    queryFn: getLecturers,
  });
  
  const gvList = Array.isArray(gvData) ? gvData : (gvData?.data || []);

  const updateMut = useMutation({
    mutationFn: (data) => updateAssignment(editItem.maDeTai, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phancong'] });
      setShowFormModal(false);
      setEditItem(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => deleteAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phancong'] });
      setShowDeleteConfirm(false);
      setDeleteItem(null);
    },
  });

  const handleEditClick = (pc) => {
    setEditItem(pc);
    setFormGVHD(pc.maGV_HD || '');
    setFormGVPB(pc.maGV_PB || '');
    setShowFormModal(true);
  };

  const handleSave = () => {
    updateMut.mutate({
      maGV_HD: formGVHD || null,
      maGV_PB: formGVPB || null,
    });
  };

  // Thay vì filter nội bộ trên mảng, lấy data từ JSON paginated response backend trả về
  const filtered = pcData?.data || [];
  const total = pcData?.total || 0;
  const perPage = pcData?.per_page || 15;
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-6">Quản lý phân công</h1>

      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm đề tài, sinh viên, giảng viên..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none flex-1"
        />
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/4">Tên đề tài</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/4">Sinh viên</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">GVHD</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">GVPB</th>
              <th className="px-4 py-3 w-32"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(5)].map((_, ci) => (
                    <td key={ci} className="px-4 py-3 border-t border-slate-100">
                      <div className="bg-slate-100 animate-pulse rounded h-4 w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center">
                  <p className="text-slate-500 font-semibold">Chưa có đề tài nào</p>
                </td>
              </tr>
            ) : (
              filtered.map(pc => (
                <tr key={pc.maDeTai} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100 font-medium">{pc.tenDeTai}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100">
                    {pc.sinh_vien?.length > 0 ? (
                      <div className="space-y-1">
                        {pc.sinh_vien.map(sv => (
                          <div key={sv.mssv}>{sv.hoTen} ({sv.mssv})</div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Chưa có SV</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100 font-medium">
                    {pc.giang_vien_h_d?.tenGV || <span className="text-slate-400 font-normal italic">Chưa phân công</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100">
                    {pc.giang_vien_p_b?.tenGV || <span className="text-slate-400 font-normal italic">Chưa phân công</span>}
                  </td>
                  <td className="px-4 py-3 border-t border-slate-100">
                    <div className="flex gap-3 justify-end pr-2">
                      <button onClick={() => handleEditClick(pc)} className="text-sm font-medium text-blue-600 hover:text-blue-800">Sửa</button>
                      <button 
                        onClick={() => { setDeleteItem(pc); setShowDeleteConfirm(true); }} 
                        className="text-sm font-medium text-red-500 hover:text-red-700"
                        disabled={!pc.maGV_HD && !pc.maGV_PB}
                        title={!pc.maGV_HD && !pc.maGV_PB ? "Không có GV để xoá" : "Gỡ GVHD & GVPB"}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination 
        page={page} 
        setPage={setPage} 
        total={total} 
        perPage={perPage} 
        itemName="bản ghi" 
      />

      {showFormModal && editItem && (
        <Modal isOpen={true} onClose={() => { setShowFormModal(false); setEditItem(null); }} title="Cập nhật phân công" maxWidth="max-w-lg">
          <div className="mb-4">
            <p className="text-sm text-slate-500 mb-1">Đề tài</p>
            <p className="font-medium text-slate-800">{editItem.tenDeTai}</p>
          </div>
          <div className="mb-4">
            <p className="text-sm font-semibold text-slate-700 mb-2">Giảng viên hướng dẫn</p>
            <select
              value={formGVHD}
              onChange={e => setFormGVHD(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">-- Chưa phân công --</option>
              {gvList.map(g => <option key={g.maGV} value={g.maGV}>{g.tenGV} ({g.maGV})</option>)}
            </select>
          </div>
          <div className="mb-6">
            <p className="text-sm font-semibold text-slate-700 mb-2">Giảng viên phản biện</p>
            <select
              value={formGVPB}
              onChange={e => setFormGVPB(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">-- Chưa phân công --</option>
              {gvList.map(g => <option key={g.maGV} value={g.maGV}>{g.tenGV} ({g.maGV})</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => { setShowFormModal(false); setEditItem(null); }} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200">Hủy</button>
            <button onClick={handleSave} disabled={updateMut.isPending} className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium disabled:opacity-50">
              {updateMut.isPending ? 'Đang lưu...' : 'Lưu phân công'}
            </button>
          </div>
        </Modal>
      )}

      {showDeleteConfirm && deleteItem && (
        <ConfirmModal 
          isOpen={true}
          title="Xóa phân công?"
          message={`Hủy bỏ phân công GVHD và GVPB của đề tài "${deleteItem.tenDeTai}"? Hành động này không thể hoàn tác.`}
          onConfirm={() => deleteMut.mutate(deleteItem.maDeTai)}
          onCancel={() => { setShowDeleteConfirm(false); setDeleteItem(null); }}
          loading={deleteMut.isPending}
        />
      )}
    </div>
  );
}
