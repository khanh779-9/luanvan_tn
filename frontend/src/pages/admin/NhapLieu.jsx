import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HiOutlineXMark, HiOutlineExclamationTriangle } from 'react-icons/hi2';
import { getList, createRecord, updateRecord, deleteRecord, importExcel } from '../../services/nhapLieuService';
import api from '../../services/api';

const STATUS_MAP = {
  cho_duyet: { label: 'Chờ duyệt', cls: 'bg-amber-50 text-amber-700' },
  da_duyet: { label: 'Đã duyệt', cls: 'bg-green-50 text-green-700' },
  tu_choi: { label: 'Từ chối', cls: 'bg-red-50 text-red-600' },
};

export default function AdminNhapLieuPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);

  const { data: listData, isLoading } = useQuery({
    queryKey: ['nhaplieu', { search, status: statusFilter, page }],
    queryFn: () => getList({ search: search || undefined, status: statusFilter || undefined, page }).then(r => r.data),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => deleteRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nhaplieu'] });
      setShowDeleteConfirm(false);
      setDeleteItem(null);
    },
  });

  const approveMut = useMutation({
    mutationFn: (id) => api.post(`/topic-registration-form/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nhaplieu'] });
    },
  });

  const tableData = listData?.data || [];
  const total = listData?.total || 0;
  const perPage = listData?.per_page || 20;
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-6">Nhập liệu đăng ký đề tài</h1>

      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Tìm theo MSSV, tên SV..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none flex-1 min-w-[200px]"
        />
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="cho_duyet">Chờ duyệt</option>
          <option value="da_duyet">Đã duyệt</option>
          <option value="tu_choi">Từ chối</option>
        </select>
        <button
          onClick={() => setShowImportModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          Import Excel
        </button>
        <button
          onClick={() => { setEditItem(null); setShowFormModal(true); }}
          className="border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          Thêm bản ghi
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider w-12">STT</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tên đề tài</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Sinh viên</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">GVHD</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nguồn</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_, ci) => (
                      <td key={ci} className="px-4 py-3 border-t border-slate-100">
                        <div className="bg-slate-100 animate-pulse rounded h-4 w-3/4"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : tableData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <p className="text-slate-500 font-semibold">Chưa có dữ liệu đăng ký</p>
                    <p className="text-sm text-slate-400 mt-1">Import file Excel hoặc thêm bản ghi thủ công.</p>
                  </td>
                </tr>
              ) : (
                tableData.map((item, idx) => {
                  const st = STATUS_MAP[item.status] || { label: item.status, cls: 'bg-slate-100 text-slate-600' };
                  const students = [
                    { name: item.student1_name, id: item.student1_id },
                    ...(item.student2_id ? [{ name: item.student2_name, id: item.student2_id }] : []),
                  ];
                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-500 border-t border-slate-100 text-center">{start + idx}</td>
                      <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100 font-medium max-w-[250px] truncate" title={item.topic_title}>
                        {item.topic_title}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100">
                        {students.map((sv, i) => (
                          <div key={i} className={i > 0 ? 'mt-1' : ''}>
                            <span className="font-medium">{sv.name}</span>
                            <span className="text-slate-400"> ({sv.id})</span>
                          </div>
                        ))}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100 whitespace-nowrap">
                        {item.gvhd_code || <span className="text-slate-400 italic">Chưa có</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100">
                        <span className="text-xs">{item.source || '—'}</span>
                      </td>
                      <td className="px-4 py-3 border-t border-slate-100">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                      </td>
                      <td className="px-4 py-3 border-t border-slate-100">
                        <div className="flex gap-2 items-center">
                          {item.status === 'cho_duyet' && (
                            <button
                              onClick={() => approveMut.mutate(item.id)}
                              disabled={approveMut.isPending}
                              className="text-xs text-green-600 hover:text-green-800 font-semibold"
                            >
                              Duyệt
                            </button>
                          )}
                          <button onClick={() => { setEditItem(item); setShowFormModal(true); }} className="text-xs text-blue-600 hover:text-blue-800">Sửa</button>
                          <button onClick={() => { setDeleteItem(item); setShowDeleteConfirm(true); }} className="text-xs text-red-500 hover:text-red-700">Xóa</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {total > perPage && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-slate-500">Hiển thị {start}-{end} / {total} bản ghi</span>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1 text-sm border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50">Trước</button>
            {[...Array(Math.min(Math.ceil(total / perPage), 10))].map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                className={`px-3 py-1 text-sm border rounded ${page === i + 1 ? 'bg-blue-500 text-white border-blue-500' : 'border-slate-200 hover:bg-slate-50'}`}>{i + 1}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(Math.ceil(total / perPage), p + 1))} disabled={page >= Math.ceil(total / perPage)}
              className="px-3 py-1 text-sm border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50">Sau</button>
          </div>
        </div>
      )}

      {showImportModal && <ImportModal onClose={() => setShowImportModal(false)} />}

      {showFormModal && (
        <FormModal editItem={editItem} onClose={() => { setShowFormModal(false); setEditItem(null); }} />
      )}

      {showDeleteConfirm && deleteItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => { setShowDeleteConfirm(false); setDeleteItem(null); }}>
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 text-center" onClick={e => e.stopPropagation()}>
            <HiOutlineExclamationTriangle className="text-red-500 mx-auto mb-3" size={40} />
            <h3 className="text-xl font-semibold text-slate-900">Xóa bản đăng ký?</h3>
            <p className="text-sm text-slate-500 mt-2">Bạn có chắc muốn xóa bản ghi của {deleteItem.student1_name}? Hành động này không thể hoàn tác.</p>
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

function ImportModal({ onClose }) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const importMut = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append('file', file);
      return importExcel(fd).then(r => r.data);
    },
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ['nhaplieu'] });
      queryClient.invalidateQueries({ queryKey: ['sinhvien'] });
    },
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600" aria-label="Đóng">
          <HiOutlineXMark size={20} />
        </button>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Import đăng ký đề tài từ Excel</h2>
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
            {result.imported > 0 && <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg">Đã import {result.imported} bản ghi thành công.</div>}
            {result.errors?.length > 0 && (
              <div className="mt-3 border border-amber-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead><tr className="bg-amber-50">
                    <th className="px-3 py-2 text-left text-xs font-semibold text-amber-700">Sheet</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-amber-700">Lỗi</th>
                  </tr></thead>
                  <tbody>
                    {result.errors.map((err, i) => (
                      <tr key={i} className="border-t border-amber-100">
                        <td className="px-3 py-2 text-sm text-slate-700">{err.sheet || err.row || i + 1}</td>
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

function FormModal({ editItem, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    topic_title: editItem?.topic_title || '',
    topic_description: editItem?.topic_description || '',
    topic_type: editItem?.topic_type || 'mot_sinh_vien',
    student1_id: editItem?.student1_id || '',
    student1_name: editItem?.student1_name || '',
    student1_class: editItem?.student1_class || '',
    student1_email: editItem?.student1_email || '',
    student2_id: editItem?.student2_id || '',
    student2_name: editItem?.student2_name || '',
    student2_class: editItem?.student2_class || '',
    student2_email: editItem?.student2_email || '',
    gvhd_code: editItem?.gvhd_code || '',
    gvpb_code: editItem?.gvpb_code || '',
    note: editItem?.note || '',
    status: editItem?.status || 'cho_duyet',
  });
  const [errors, setErrors] = useState({});

  const createMut = useMutation({
    mutationFn: (data) => createRecord(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['nhaplieu'] }); onClose(); },
    onError: (err) => { if (err.response?.status === 422) setErrors(err.response.data.errors || {}); },
  });

  const updateMut = useMutation({
    mutationFn: (data) => updateRecord(editItem.id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['nhaplieu'] }); onClose(); },
    onError: (err) => { if (err.response?.status === 422) setErrors(err.response.data.errors || {}); },
  });

  const loading = createMut.isPending || updateMut.isPending;

  function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    if (editItem) updateMut.mutate(form);
    else createMut.mutate(form);
  }

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  }

  const isHaiSV = form.topic_type === 'hai_sinh_vien';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600" aria-label="Đóng">
          <HiOutlineXMark size={20} />
        </button>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">{editItem ? 'Sửa bản đăng ký' : 'Thêm bản đăng ký'}</h2>
        <form onSubmit={handleSubmit}>
          {/* Đề tài */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Tên đề tài</label>
            <input type="text" value={form.topic_title} onChange={e => handleChange('topic_title', e.target.value)} disabled={loading}
              className={`w-full border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 ${errors.topic_title ? 'border-red-300' : 'border-slate-200'}`} />
            {errors.topic_title && <p className="text-red-500 text-xs mt-1">{errors.topic_title[0]}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Mô tả đề tài</label>
            <textarea rows={2} value={form.topic_description} onChange={e => handleChange('topic_description', e.target.value)} disabled={loading}
              className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Loại</label>
            <select value={form.topic_type} onChange={e => handleChange('topic_type', e.target.value)} disabled={loading}
              className="w-full border border-slate-200 rounded-lg px-3 py-3 text-sm bg-white disabled:opacity-50">
              <option value="mot_sinh_vien">1 sinh viên</option>
              <option value="hai_sinh_vien">2 sinh viên</option>
            </select>
          </div>

          {/* SV 1 */}
          <p className="text-sm font-semibold text-slate-600 mb-2 mt-4">Sinh viên 1</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">MSSV</label>
              <input type="text" value={form.student1_id} onChange={e => handleChange('student1_id', e.target.value)} disabled={loading}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Họ tên</label>
              <input type="text" value={form.student1_name} onChange={e => handleChange('student1_name', e.target.value)} disabled={loading}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Lớp</label>
              <input type="text" value={form.student1_class} onChange={e => handleChange('student1_class', e.target.value)} disabled={loading}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Email</label>
              <input type="email" value={form.student1_email} onChange={e => handleChange('student1_email', e.target.value)} disabled={loading}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50" />
            </div>
          </div>

          {/* SV 2 */}
          {isHaiSV && (
            <>
              <p className="text-sm font-semibold text-slate-600 mb-2">Sinh viên 2</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">MSSV</label>
                  <input type="text" value={form.student2_id} onChange={e => handleChange('student2_id', e.target.value)} disabled={loading}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Họ tên</label>
                  <input type="text" value={form.student2_name} onChange={e => handleChange('student2_name', e.target.value)} disabled={loading}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Lớp</label>
                  <input type="text" value={form.student2_class} onChange={e => handleChange('student2_class', e.target.value)} disabled={loading}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Email</label>
                  <input type="email" value={form.student2_email} onChange={e => handleChange('student2_email', e.target.value)} disabled={loading}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50" />
                </div>
              </div>
            </>
          )}

          {/* GVHD, GVPB, Note, Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Mã GVHD</label>
              <input type="text" value={form.gvhd_code} onChange={e => handleChange('gvhd_code', e.target.value)} disabled={loading}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Mã GVPB</label>
              <input type="text" value={form.gvpb_code} onChange={e => handleChange('gvpb_code', e.target.value)} disabled={loading}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50" />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Ghi chú</label>
            <textarea rows={2} value={form.note} onChange={e => handleChange('note', e.target.value)} disabled={loading}
              className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Trạng thái</label>
            <select value={form.status} onChange={e => handleChange('status', e.target.value)} disabled={loading}
              className="w-full border border-slate-200 rounded-lg px-3 py-3 text-sm bg-white disabled:opacity-50">
              <option value="cho_duyet">Chờ duyệt</option>
              <option value="da_duyet">Đã duyệt</option>
              <option value="tu_choi">Từ chối</option>
            </select>
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
