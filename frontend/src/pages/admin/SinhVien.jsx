import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HiOutlineXMark, HiOutlineExclamationTriangle } from 'react-icons/hi2';
import { getStudents, importStudents, createStudent, updateStudent, deleteStudent } from '../../services/sinhVienService';

export default function SinhVien() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);

  const { data: svData, isLoading } = useQuery({
    queryKey: ['sinhvien', { search, page }],
    queryFn: () => getStudents({ search: search || undefined, page }),
  });

  const deleteMut = useMutation({
    mutationFn: (mssv) => deleteStudent(mssv),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sinhvien'] });
      setShowDeleteConfirm(false);
      setDeleteItem(null);
    },
  });

  const tableData = svData?.data || [];
  const total = svData?.total || 0;
  const perPage = svData?.per_page || 20;
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-6">Sinh viên</h1>

      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Tìm theo MSSV, họ tên..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none flex-1 min-w-[200px]"
        />
        {/* <button
          onClick={() => setShowImportModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          Import Excel
        </button> */}
        <button
          onClick={() => { setEditItem(null); setShowFormModal(true); }}
          className="border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          Thêm sinh viên
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">MSSV</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Họ tên</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Lớp</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">SĐT</th>
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
            ) : tableData.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center">
                  <p className="text-slate-500 font-semibold">Chưa có sinh viên</p>
                  {/* <p className="text-sm text-slate-400 mt-1">Import danh sách sinh viên từ file Excel để bắt đầu.</p> */}
                </td>
              </tr>
            ) : (
              tableData.map(sv => (
                <tr key={sv.mssv} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100">{sv.mssv}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100 font-medium">{sv.hoTen}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100">{sv.lop || '-'}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100">{sv.email || '-'}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100">{sv.soDienThoai || '-'}</td>
                  <td className="px-4 py-3 border-t border-slate-100">
                    <div className="flex gap-3">
                      <button onClick={() => { setEditItem(sv); setShowFormModal(true); }} className="text-sm text-blue-600 hover:text-blue-800">Sửa</button>
                      <button onClick={() => { setDeleteItem(sv); setShowDeleteConfirm(true); }} className="text-sm text-red-500 hover:text-red-700">Xóa</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {total > perPage && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-slate-500">Hiển thị {start}-{end} / {total} sinh viên</span>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1 text-sm border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50">Trước</button>
            {[...Array(Math.ceil(total / perPage))].map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                className={`px-3 py-1 text-sm border rounded ${page === i + 1 ? 'bg-blue-500 text-white border-blue-500' : 'border-slate-200 hover:bg-slate-50'}`}>{i + 1}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(Math.ceil(total / perPage), p + 1))} disabled={page >= Math.ceil(total / perPage)}
              className="px-3 py-1 text-sm border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50">Sau</button>
          </div>
        </div>
      )}

      {showImportModal && <ImportModal onClose={() => setShowImportModal(false)} />}
      {showFormModal && <SvFormModal editItem={editItem} onClose={() => { setShowFormModal(false); setEditItem(null); }} />}
      {showDeleteConfirm && deleteItem && (
        <SvDeleteConfirm item={deleteItem} loading={deleteMut.isPending}
          onConfirm={() => deleteMut.mutate(deleteItem.mssv)}
          onCancel={() => { setShowDeleteConfirm(false); setDeleteItem(null); }} />
      )}
    </div>
  );
}

function ImportModal({ onClose }) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const importMut = useMutation({
    mutationFn: () => importStudents(file, ''),
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ['sinhvien'] });
    },
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600" aria-label="Đóng">
          <HiOutlineXMark size={20} />
        </button>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Import danh sách sinh viên</h2>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-700 mb-1">File Excel</label>
          <input type="file" accept=".xlsx,.xls" onChange={e => setFile(e.target.files[0] || null)}
            className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100" />
        </div>
        <button onClick={() => importMut.mutate()} disabled={!file || importMut.isPending}
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
          {importMut.isPending ? 'Đang xử lý...' : 'Import'}
        </button>
        {importMut.isError && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mt-4">Không thể import file. Vui lòng thử lại.</div>}
        {result && (
          <div className="mt-4">
            {result.imported > 0 && <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg">Đã import {result.imported} sinh viên thành công.</div>}
            {result.errors?.length > 0 && (
              <div className="mt-3 border border-amber-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead><tr className="bg-amber-50">
                    <th className="px-3 py-2 text-left text-xs font-semibold text-amber-700">Dòng</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-amber-700">Lỗi</th>
                  </tr></thead>
                  <tbody>
                    {result.errors.map((err, i) => (
                      <tr key={i} className="border-t border-amber-100">
                        <td className="px-3 py-2 text-sm text-slate-700">{err.row}</td>
                        <td className="px-3 py-2 text-sm text-slate-700">{err.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SvFormModal({ editItem, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    mssv: editItem?.mssv || '',
    hoTen: editItem?.hoTen || '',
    lop: editItem?.lop || '',
    email: editItem?.email || '',
  });
  const [errors, setErrors] = useState({});

  const createMut = useMutation({
    mutationFn: (data) => createStudent(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sinhvien'] }); onClose(); },
    onError: (err) => { if (err.response?.status === 422) setErrors(err.response.data.errors || {}); },
  });

  const updateMut = useMutation({
    mutationFn: (data) => updateStudent(editItem.mssv, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sinhvien'] }); onClose(); },
    onError: (err) => { if (err.response?.status === 422) setErrors(err.response.data.errors || {}); },
  });

  const loading = createMut.isPending || updateMut.isPending;

  function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    if (editItem) updateMut.mutate({ hoTen: form.hoTen, lop: form.lop, email: form.email });
    else createMut.mutate(form);
  }

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600" aria-label="Đóng">
          <HiOutlineXMark size={20} />
        </button>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">{editItem ? 'Sửa sinh viên' : 'Thêm sinh viên'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-1">MSSV</label>
            <input type="text" value={form.mssv} onChange={e => handleChange('mssv', e.target.value)} disabled={!!editItem || loading}
              className={`w-full border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 ${errors.mssv ? 'border-red-300' : 'border-slate-200'}`} />
            {errors.mssv && <p className="text-red-500 text-xs mt-1">{errors.mssv[0]}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Họ tên</label>
            <input type="text" value={form.hoTen} onChange={e => handleChange('hoTen', e.target.value)} disabled={loading}
              className={`w-full border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 ${errors.hoTen ? 'border-red-300' : 'border-slate-200'}`} />
            {errors.hoTen && <p className="text-red-500 text-xs mt-1">{errors.hoTen[0]}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Lớp</label>
            <input type="text" value={form.lop} onChange={e => handleChange('lop', e.target.value)} disabled={loading}
              className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
            <input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} disabled={loading}
              className={`w-full border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 ${errors.email ? 'border-red-300' : 'border-slate-200'}`} />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>}
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 text-sm rounded-lg">Hủy</button>
            <button type="submit" disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
              {loading ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SvDeleteConfirm({ item, loading, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onCancel}>
      <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 text-center" onClick={e => e.stopPropagation()}>
        <HiOutlineExclamationTriangle className="text-red-500 mx-auto mb-3" size={40} />
        <h3 className="text-xl font-semibold text-slate-900">Xóa sinh viên?</h3>
        <p className="text-sm text-slate-500 mt-2">Bạn có chắc muốn xóa sinh viên {item.hoTen} ({item.mssv})? Hành động này không thể hoàn tác.</p>
        <div className="flex justify-center gap-3 mt-6">
          <button onClick={onCancel} className="border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 text-sm rounded-lg">Hủy</button>
          <button onClick={onConfirm} disabled={loading}
            className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
            {loading ? 'Đang xóa...' : 'Xóa'}
          </button>
        </div>
      </div>
    </div>
  );
}
