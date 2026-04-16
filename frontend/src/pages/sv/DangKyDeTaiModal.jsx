import React, { useState } from "react";
import api from "../../services/api";


export default function DangKyDeTaiModal({ open, onClose, onSuccess, editData }) {
  const [topicTitle, setTopicTitle] = useState("");
  const [topicDescription, setTopicDescription] = useState("");
  const [topicType, setTopicType] = useState("mot_sinh_vien");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (open && editData) {
      setTopicTitle(editData.topic_title || "");
      setTopicDescription(editData.topic_description || "");
      setTopicType(editData.topic_type || "mot_sinh_vien");
      setNote(editData.note || "");
    } else if (open) {
      setTopicTitle("");
      setTopicDescription("");
      setTopicType("mot_sinh_vien");
      setNote("");
    }
  }, [open, editData]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (editData) {
        // Update
        await api.put("/topic-registration-form/my", {
          topic_title: topicTitle,
          topic_description: topicDescription,
          topic_type: topicType,
          note,
        });
      } else {
        // Create
        await api.post("/topic-registration-form", {
          topic_title: topicTitle,
          topic_description: topicDescription,
          topic_type: topicType,
          note,
        });
      }
      setLoading(false);
      onSuccess?.();
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err?.response?.data?.message || "Đã có lỗi xảy ra");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-auto shadow-xl">
        <h3 className="text-xl font-bold text-slate-900 mb-4">
          {editData ? "Chỉnh sửa thông tin đề tài" : "Đăng ký đề tài mới"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tên đề tài <span className="text-red-500">*</span></label>
            <input
              type="text"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={topicTitle}
              onChange={e => setTopicTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả</label>
            <textarea
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={topicDescription}
              onChange={e => setTopicDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Loại đề tài</label>
            <select
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={topicType}
              onChange={e => setTopicType(e.target.value)}
            >
              <option value="mot_sinh_vien">Một sinh viên</option>
              <option value="hai_sinh_vien">Hai sinh viên</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú</label>
            <input
              type="text"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading
                ? (editData ? "Đang lưu..." : "Đang đăng ký...")
                : (editData ? "Lưu thay đổi" : "Đăng ký")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
