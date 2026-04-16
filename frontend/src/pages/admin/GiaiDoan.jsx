import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HiOutlineXMark, HiOutlineExclamationTriangle } from 'react-icons/hi2';
import { getStages, createStage, updateStage, deleteStage } from '../../services/giaiDoanService';

export default function AdminGiaiDoanPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  const { data: gdData, isLoading } = useQuery({
    queryKey: ['giaidoan'],
    queryFn: getStages,
  });

  const deleteMut = useMutation({
    mutationFn: (id) => deleteStage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giaidoan'] });
      setShowDeleteConfirm(false);
      setDeleteItem(null);
    },
  });

  const filtered = useMemo(() => {
    if (!Array.isArray(gdData)) return [];
    if (!search.trim()) return gdData;
    const q = search.toLowerCase();
    return gdData.filter(gd =>
      gd.mo_ta?.toLowerCase().includes(q) ||
      gd.loai?.toLowerCase().includes(q)
    );
  }, [gdData, search]);

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-6">Giai đoạn</h1>

      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm mô tả, loại..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none flex-1"
        />
        <button
          onClick={() => { setEditItem(null); setShowFormModal(true); }}
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          Thêm giai đoạn
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">STT</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Mô tả</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Loại</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ngày bắt đầu</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ngày kết thúc</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(6)].map((_, ci) => (
                    <td key={ci} className="px-4 py-3 border-t border-slate-100">
                      <div className="bg-slate-100 animate-pulse rounded h-4 w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center">
                  <p className="text-slate-500 font-semibold">Chưa có giai đoạn</p>
                  <p className="text-sm text-slate-400 mt-1">Thêm giai đoạn đầu tiên để cấu hình hệ thống.</p>
                </td>
              </tr>
            ) : (
              filtered.map((gd, index) => (
                <tr key={gd.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-500 border-t border-slate-100 text-center">{index + 1}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100 font-medium">{gd.mo_ta}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100">{gd.loai}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100">{gd.ngay_bat_dau}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100">{gd.ngay_ket_thuc}</td>
                  <td className="px-4 py-3 border-t border-slate-100">
                    <div className="flex gap-3">
                      <button onClick={() => { setEditItem(gd); setShowFormModal(true); }} className="text-sm text-blue-600 hover:text-blue-800">Sửa</button>
                      <button onClick={() => { setDeleteItem(gd); setShowDeleteConfirm(true); }} className="text-sm text-red-500 hover:text-red-700">Xóa</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showDeleteConfirm && deleteItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => { setShowDeleteConfirm(false); setDeleteItem(null); }}>
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 text-center" onClick={e => e.stopPropagation()}>
            <HiOutlineExclamationTriangle className="text-red-500 mx-auto mb-3" size={40} />
            <h3 className="text-xl font-semibold text-slate-900">Xóa giai đoạn?</h3>
            <p className="text-sm text-slate-500 mt-2">Bạn có chắc muốn xóa giai đoạn này? Hành động này không thể hoàn tác.</p>
            <div className="flex justify-center gap-3 mt-6">
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteItem(null); }}
                className="border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 text-sm rounded-lg">Hủy</button>
              <button onClick={() => deleteMut.mutate(deleteItem.id)} disabled={deleteMut.isPending}
                className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                {deleteMut.isPending ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
