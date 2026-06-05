import React, { useEffect, useState } from 'react';
import api, { uploadApi } from '../../utils/api.js';

const CATEGORIES = ['ميكانيكية', 'تصميم صناعي', 'سيارات', 'روبوتات', 'فضاء', 'منتجات استهلاكية', 'أخرى'];

function UploadModal({ onClose, onSuccess, editModule }) {
  const [form, setForm] = useState(editModule ? {
    titleAr: editModule.titleAr || '',
    titleEn: editModule.titleEn || '',
    descriptionAr: editModule.descriptionAr || '',
    descriptionEn: editModule.descriptionEn || '',
    category: editModule.category || '',
    designer: editModule.designer || '',
    materials: editModule.materials || '',
    specifications: editModule.specifications || '',
    features: editModule.features || '',
    softwareVersion: editModule.softwareVersion || '',
    partsCount: editModule.partsCount || '',
    projectType: editModule.projectType || '',
    status: editModule.status || 'pending',
  } : {
    titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '',
    category: '', designer: '', materials: '', specifications: '',
    features: '', softwareVersion: '', partsCount: '', projectType: '', status: 'pending',
  });
  const [modelFile, setModelFile] = useState(null);
  const [sketches, setSketches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setProgress(0);
    setPhase('uploading');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (modelFile) fd.append('modelFile', modelFile);
      sketches.forEach(s => fd.append('sketches', s));

      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded * 100) / e.total);
          setProgress(pct);
          if (pct === 100) setPhase('processing');
        },
      };

      if (editModule) {
        await uploadApi.put(`/modules/${editModule._id}`, fd, config);
      } else {
        await uploadApi.post('/modules', fd, config);
      }
      setPhase('done');
      setTimeout(() => onSuccess(), 400);
    } catch (err) {
      setPhase('idle');
      setProgress(0);
      const msg = err.response?.data?.error || err.message || 'حدث خطأ أثناء الرفع';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inp = "w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-[#151821] rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 bg-[#151821]">
          <h2 className="font-bold text-lg">{editModule ? 'تعديل المشروع' : 'رفع مشروع جديد'}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Titles */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">العنوان بالعربية *</label>
              <input className={inp} value={form.titleAr} onChange={e => setForm(p=>({...p,titleAr:e.target.value}))} required placeholder="عنوان المشروع" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">العنوان بالإنجليزية *</label>
              <input className={inp} dir="ltr" value={form.titleEn} onChange={e => setForm(p=>({...p,titleEn:e.target.value}))} required placeholder="Project Title" />
            </div>
          </div>

          {/* Descriptions */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">الوصف بالعربية *</label>
            <textarea className={inp} rows={3} value={form.descriptionAr} onChange={e => setForm(p=>({...p,descriptionAr:e.target.value}))} required placeholder="وصف تفصيلي للمشروع..." />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">الوصف بالإنجليزية *</label>
            <textarea className={inp} dir="ltr" rows={3} value={form.descriptionEn} onChange={e => setForm(p=>({...p,descriptionEn:e.target.value}))} required placeholder="Detailed project description..." />
          </div>

          {/* Category, Designer */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">الفئة *</label>
              <select className={inp} value={form.category} onChange={e => setForm(p=>({...p,category:e.target.value}))} required>
                <option value="">اختر الفئة</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">اسم المهندس *</label>
              <input className={inp} value={form.designer} onChange={e => setForm(p=>({...p,designer:e.target.value}))} required placeholder="اسم المهندس" />
            </div>
          </div>

          {/* Extra fields */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">نوع المشروع</label>
              <input className={inp} value={form.projectType} onChange={e => setForm(p=>({...p,projectType:e.target.value}))} placeholder="مثال: تجميع" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">إصدار البرنامج</label>
              <input className={inp} dir="ltr" value={form.softwareVersion} onChange={e => setForm(p=>({...p,softwareVersion:e.target.value}))} placeholder="SolidWorks 2023" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">عدد القطع</label>
              <input className={inp} type="number" value={form.partsCount} onChange={e => setForm(p=>({...p,partsCount:e.target.value}))} placeholder="23" />
            </div>
          </div>

          {/* Materials */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">المواد والمواصفات</label>
            <textarea className={inp} rows={2} value={form.materials} onChange={e => setForm(p=>({...p,materials:e.target.value}))} placeholder="أدخل مواد المشروع..." />
          </div>

          {/* Model File */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">ملف النموذج ثلاثي الأبعاد (GLB, GLTF, STL, OBJ, FBX)</label>
            <div className="border-2 border-dashed border-white/10 rounded-xl p-4 text-center hover:border-blue-500/30 transition-colors cursor-pointer"
              onClick={() => document.getElementById('modelFileInput').click()}>
              <input id="modelFileInput" type="file" accept=".glb,.gltf,.stl,.obj,.fbx" className="hidden" onChange={e => setModelFile(e.target.files[0])} />
              {modelFile ? (
                <div className="flex items-center justify-center gap-2 text-green-400">
                  <i className="fa-solid fa-check-circle" />
                  <span className="text-sm">{modelFile.name}</span>
                </div>
              ) : (
                <div>
                  <i className="fa-solid fa-cloud-upload-alt text-slate-500 text-2xl mb-2 block" />
                  <p className="text-slate-400 text-sm">اسحب الملف هنا أو انقر للاختيار</p>
                  {editModule?.modelFile && <p className="text-slate-500 text-xs mt-1">الملف الحالي موجود</p>}
                </div>
              )}
            </div>
          </div>

          {/* Sketches */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">الرسومات الفنية والمخططات (اختياري)</label>
            <div className="border-2 border-dashed border-white/10 rounded-xl p-4 text-center hover:border-blue-500/30 transition-colors cursor-pointer"
              onClick={() => document.getElementById('sketchInput').click()}>
              <input id="sketchInput" type="file" accept="image/*" multiple className="hidden" onChange={e => setSketches(Array.from(e.target.files))} />
              {sketches.length > 0 ? (
                <div className="flex items-center justify-center gap-2 text-green-400">
                  <i className="fa-solid fa-images" />
                  <span className="text-sm">{sketches.length} صور محددة</span>
                </div>
              ) : (
                <div>
                  <i className="fa-solid fa-images text-slate-500 text-2xl mb-2 block" />
                  <p className="text-slate-400 text-sm">رفع الرسومات والصور</p>
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">الحالة</label>
            <select className={inp} value={form.status} onChange={e => setForm(p=>({...p,status:e.target.value}))}>
              <option value="pending">في الانتظار</option>
              <option value="published">منشور</option>
              <option value="unpublished">مخفي</option>
            </select>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-400/10 rounded-lg px-4 py-3 text-sm">
              <i className="fa-solid fa-circle-exclamation" />
              <span>{error}</span>
            </div>
          )}

          {/* Progress bar */}
          {loading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  {phase === 'uploading' && 'جاري رفع الملف...'}
                  {phase === 'processing' && 'جاري المعالجة...'}
                  {phase === 'done' && 'تم بنجاح ✓'}
                </span>
                <span className="font-mono tabular-nums">
                  {phase === 'uploading' ? `${progress}%` : phase === 'processing' ? '100%' : ''}
                </span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${phase === 'done' ? 'bg-green-500' : 'bg-blue-500'}`}
                  style={{ width: phase === 'processing' || phase === 'done' ? '100%' : `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={loading} className="flex-1 border border-white/10 text-slate-300 hover:text-white hover:border-white/20 disabled:opacity-40 py-2.5 rounded-xl text-sm font-medium transition-colors">
              إلغاء
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>{phase === 'processing' ? 'جاري المعالجة...' : 'جاري الرفع...'}</span></>
                : <><i className="fa-solid fa-cloud-upload-alt" /><span>{editModule ? 'حفظ التعديلات' : 'رفع المشروع'}</span></>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminModules() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMod, setEditMod] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fetchModules = () => {
    setLoading(true);
    api.get('/modules/all').then(r => setModules(r.data.modules || [])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchModules(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('هل تريد حذف هذا المشروع؟')) return;
    setDeleting(id);
    try {
      await api.delete(`/modules/${id}`);
      fetchModules();
    } finally {
      setDeleting(null);
    }
  };

  const statusLabel = { published: { label: 'منشور', cls: 'bg-green-500/10 text-green-400' }, pending: { label: 'انتظار', cls: 'bg-amber-500/10 text-amber-400' }, unpublished: { label: 'مخفي', cls: 'bg-slate-500/10 text-slate-400' } };

  return (
    <div className="p-8" dir="rtl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">إدارة المشاريع</h1>
          <p className="text-slate-400 mt-1">رفع وتعديل وإدارة مشاريع ثلاثية الأبعاد</p>
        </div>
        <button onClick={() => { setEditMod(null); setShowModal(true); }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
          <i className="fa-solid fa-plus" />
          <span>رفع مشروع جديد</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : modules.length === 0 ? (
        <div className="text-center py-24 bg-[#151821] rounded-2xl border border-white/5">
          <i className="fa-solid fa-cube text-slate-600 text-5xl mb-4 block" />
          <h3 className="text-lg font-semibold mb-2">لا توجد مشاريع</h3>
          <p className="text-slate-500 text-sm mb-6">ابدأ برفع أول مشروع ثلاثي الأبعاد</p>
          <button onClick={() => { setEditMod(null); setShowModal(true); }} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
            <i className="fa-solid fa-plus" /><span>رفع مشروع</span>
          </button>
        </div>
      ) : (
        <div className="bg-[#151821] rounded-2xl border border-white/5 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-right text-xs text-slate-400 font-semibold px-5 py-3.5">المشروع</th>
                <th className="text-right text-xs text-slate-400 font-semibold px-4 py-3.5">الفئة</th>
                <th className="text-right text-xs text-slate-400 font-semibold px-4 py-3.5">الصيغة</th>
                <th className="text-right text-xs text-slate-400 font-semibold px-4 py-3.5">الحالة</th>
                <th className="text-right text-xs text-slate-400 font-semibold px-4 py-3.5">التفاعل</th>
                <th className="text-right text-xs text-slate-400 font-semibold px-4 py-3.5">التاريخ</th>
                <th className="text-right text-xs text-slate-400 font-semibold px-5 py-3.5">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {modules.map(m => (
                <tr key={m._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#0f1117] rounded-lg flex items-center justify-center flex-shrink-0 border border-white/5">
                        {m.thumbnailUrl ? <img src={m.thumbnailUrl} alt="" className="w-full h-full rounded-lg object-cover" /> : <i className="fa-solid fa-cube text-slate-500 text-sm" />}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{m.titleAr}</div>
                        <div className="text-slate-500 text-xs">{m.designer}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-400 text-sm">{m.category}</td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-mono uppercase">
                      {m.modelFormat || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusLabel[m.status]?.cls || ''}`}>
                      {statusLabel[m.status]?.label || m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-slate-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><i className="fa-regular fa-eye text-xs" />{m.views || 0}</span>
                      <span className="flex items-center gap-1"><i className="fa-regular fa-heart text-xs text-rose-400" />{m.likes || 0}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 text-xs">{new Date(m.createdAt).toLocaleDateString('ar')}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <a href={`/project/${m._id}`} target="_blank" rel="noreferrer" className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors" title="معاينة">
                        <i className="fa-solid fa-eye text-xs" />
                      </a>
                      <button onClick={() => { setEditMod(m); setShowModal(true); }} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="تعديل">
                        <i className="fa-solid fa-pen text-xs" />
                      </button>
                      <button onClick={() => handleDelete(m._id)} disabled={deleting === m._id} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="حذف">
                        {deleting === m._id ? <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" /> : <i className="fa-solid fa-trash text-xs" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <UploadModal
          editModule={editMod}
          onClose={() => { setShowModal(false); setEditMod(null); }}
          onSuccess={() => { setShowModal(false); setEditMod(null); fetchModules(); }}
        />
      )}
    </div>
  );
}
