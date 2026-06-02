import React, { useEffect, useState } from 'react';
import api from '../../utils/api.js';

function Section({ title, children }) {
  return (
    <div className="bg-[#151821] rounded-2xl border border-white/5 overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-white/5 bg-[#1c2030]/50">
        <h2 className="font-bold">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

const inp = "w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [adminSettings, setAdminSettings] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    api.get('/profile').then(r => setProfile(r.data));
    api.get('/admin/settings').then(r => setAdminSettings(r.data));
    api.get('/contact').then(r => setContacts(r.data));
    api.get('/admin/audit-log').then(r => setAuditLog(r.data));
    api.get('/admin/login-history').then(r => setLoginHistory(r.data));
  }, []);

  const saveProfile = async () => {
    setSaving(true); setStatus(null);
    try {
      await api.put('/profile', profile);
      setStatus({ type: 'success', msg: 'تم حفظ الملف الشخصي بنجاح' });
    } catch { setStatus({ type: 'error', msg: 'حدث خطأ' }); }
    finally { setSaving(false); }
  };

  const saveAdminSettings = async () => {
    setSaving(true); setStatus(null);
    try {
      await api.put('/admin/settings', adminSettings);
      setStatus({ type: 'success', msg: 'تم حفظ الإعدادات بنجاح' });
    } catch { setStatus({ type: 'error', msg: 'حدث خطأ' }); }
    finally { setSaving(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) return setStatus({ type: 'error', msg: 'كلمتا المرور غير متطابقتين' });
    setSaving(true); setStatus(null);
    try {
      await api.put('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setStatus({ type: 'success', msg: 'تم تغيير كلمة المرور' });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { setStatus({ type: 'error', msg: err.response?.data?.error || 'حدث خطأ' }); }
    finally { setSaving(false); }
  };

  const markRead = async (id) => {
    await api.put(`/contact/${id}/status`, { status: 'read' });
    setContacts(c => c.map(m => m._id === id ? { ...m, status: 'read' } : m));
  };

  const tabs = [
    { id: 'profile', icon: 'fa-user', label: 'الملف العام' },
    { id: 'account', icon: 'fa-lock', label: 'حساب المدير' },
    { id: 'messages', icon: 'fa-envelope', label: 'الرسائل' },
    { id: 'security', icon: 'fa-shield', label: 'الأمان' },
  ];

  return (
    <div className="flex h-full" dir="rtl">
      {/* Sub-nav */}
      <div className="w-52 bg-[#0f1117] border-l border-white/5 flex-shrink-0 p-3">
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider px-3 mb-3">الإعدادات</p>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => { setActiveTab(t.id); setStatus(null); }}
            className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-1 ${
              activeTab === t.id ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <i className={`fa-solid ${t.icon} w-4 text-center`} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        {status && (
          <div className={`flex items-center gap-2 rounded-xl px-4 py-3 mb-6 text-sm ${status.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            <i className={`fa-solid ${status.type === 'success' ? 'fa-check-circle' : 'fa-circle-exclamation'}`} />
            {status.msg}
          </div>
        )}

        {/* Public Profile Tab */}
        {activeTab === 'profile' && profile && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold">الملف الشخصي العام</h1>
              <p className="text-slate-400 mt-1">معلومات المهندس المعروضة على الموقع العام</p>
            </div>
            <Section title="معلومات المهندس">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div><label className="block text-xs text-slate-400 mb-1.5">الاسم بالعربية</label><input className={inp} value={profile.fullNameAr || ''} onChange={e => setProfile(p=>({...p,fullNameAr:e.target.value}))} /></div>
                <div><label className="block text-xs text-slate-400 mb-1.5">الاسم بالإنجليزية</label><input className={inp} dir="ltr" value={profile.fullNameEn || ''} onChange={e => setProfile(p=>({...p,fullNameEn:e.target.value}))} /></div>
                <div><label className="block text-xs text-slate-400 mb-1.5">المسمى الوظيفي بالعربية</label><input className={inp} value={profile.professionAr || ''} onChange={e => setProfile(p=>({...p,professionAr:e.target.value}))} /></div>
                <div><label className="block text-xs text-slate-400 mb-1.5">المسمى الوظيفي بالإنجليزية</label><input className={inp} dir="ltr" value={profile.professionEn || ''} onChange={e => setProfile(p=>({...p,professionEn:e.target.value}))} /></div>
              </div>
              <div className="mb-4"><label className="block text-xs text-slate-400 mb-1.5">النبذة بالعربية</label><textarea className={inp} rows={3} value={profile.bioAr || ''} onChange={e => setProfile(p=>({...p,bioAr:e.target.value}))} /></div>
              <div><label className="block text-xs text-slate-400 mb-1.5">النبذة بالإنجليزية</label><textarea className={inp + " font-mono"} dir="ltr" rows={3} value={profile.bioEn || ''} onChange={e => setProfile(p=>({...p,bioEn:e.target.value}))} /></div>
            </Section>
            <Section title="بيانات التواصل">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs text-slate-400 mb-1.5"><i className="fa-solid fa-envelope ml-1" />البريد الإلكتروني</label><input className={inp} type="email" dir="ltr" value={profile.email || ''} onChange={e => setProfile(p=>({...p,email:e.target.value}))} /></div>
                <div><label className="block text-xs text-slate-400 mb-1.5"><i className="fa-solid fa-phone ml-1" />رقم الهاتف</label><input className={inp} dir="ltr" value={profile.phone || ''} onChange={e => setProfile(p=>({...p,phone:e.target.value}))} /></div>
                <div><label className="block text-xs text-slate-400 mb-1.5"><i className="fa-brands fa-whatsapp ml-1" />واتساب</label><input className={inp} dir="ltr" value={profile.whatsapp || ''} onChange={e => setProfile(p=>({...p,whatsapp:e.target.value}))} /></div>
                <div><label className="block text-xs text-slate-400 mb-1.5"><i className="fa-brands fa-linkedin ml-1" />LinkedIn</label><input className={inp} dir="ltr" value={profile.linkedin || ''} onChange={e => setProfile(p=>({...p,linkedin:e.target.value}))} /></div>
              </div>
            </Section>
            <button onClick={saveProfile} disabled={saving} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">
              {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>جاري الحفظ...</span></> : <><i className="fa-solid fa-floppy-disk" /><span>حفظ التغييرات</span></>}
            </button>
          </div>
        )}

        {/* Admin Account Tab */}
        {activeTab === 'account' && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold">حساب المدير</h1>
              <p className="text-slate-400 mt-1">إعدادات الأمان والمعلومات الشخصية</p>
            </div>
            {adminSettings && (
              <Section title="المعلومات الشخصية">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div><label className="block text-xs text-slate-400 mb-1.5">الاسم بالعربية</label><input className={inp} value={adminSettings.fullNameAr || ''} onChange={e => setAdminSettings(p=>({...p,fullNameAr:e.target.value}))} /></div>
                  <div><label className="block text-xs text-slate-400 mb-1.5">الاسم بالإنجليزية</label><input className={inp} dir="ltr" value={adminSettings.fullNameEn || ''} onChange={e => setAdminSettings(p=>({...p,fullNameEn:e.target.value}))} /></div>
                  <div><label className="block text-xs text-slate-400 mb-1.5">البريد الإلكتروني</label><input className={inp} dir="ltr" type="email" value={adminSettings.email || ''} onChange={e => setAdminSettings(p=>({...p,email:e.target.value}))} /></div>
                  <div><label className="block text-xs text-slate-400 mb-1.5">رقم الهاتف</label><input className={inp} dir="ltr" value={adminSettings.phone || ''} onChange={e => setAdminSettings(p=>({...p,phone:e.target.value}))} /></div>
                </div>
                <button onClick={saveAdminSettings} disabled={saving} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                  <i className="fa-solid fa-floppy-disk" /><span>حفظ</span>
                </button>
              </Section>
            )}
            <Section title="تغيير كلمة المرور">
              <form onSubmit={changePassword} className="space-y-4 max-w-md">
                <div><label className="block text-xs text-slate-400 mb-1.5">كلمة المرور الحالية</label><input className={inp} type="password" dir="ltr" value={pwForm.currentPassword} onChange={e => setPwForm(p=>({...p,currentPassword:e.target.value}))} required /></div>
                <div><label className="block text-xs text-slate-400 mb-1.5">كلمة المرور الجديدة (12 حرف كحد أدنى)</label><input className={inp} type="password" dir="ltr" value={pwForm.newPassword} onChange={e => setPwForm(p=>({...p,newPassword:e.target.value}))} required minLength={12} /></div>
                <div><label className="block text-xs text-slate-400 mb-1.5">تأكيد كلمة المرور</label><input className={inp} type="password" dir="ltr" value={pwForm.confirmPassword} onChange={e => setPwForm(p=>({...p,confirmPassword:e.target.value}))} required /></div>
                <button type="submit" disabled={saving} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                  <i className="fa-solid fa-lock" /><span>تحديث كلمة المرور</span>
                </button>
              </form>
            </Section>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold">رسائل التواصل</h1>
              <p className="text-slate-400 mt-1">{contacts.filter(c=>c.status==='unread').length} رسالة غير مقروءة</p>
            </div>
            <div className="space-y-3">
              {contacts.length === 0 ? (
                <div className="text-center py-16 bg-[#151821] rounded-2xl border border-white/5">
                  <i className="fa-solid fa-inbox text-slate-600 text-4xl mb-3 block" />
                  <p className="text-slate-500">لا توجد رسائل</p>
                </div>
              ) : contacts.map(msg => (
                <div key={msg._id} className={`bg-[#151821] rounded-xl border p-5 transition-colors ${msg.status === 'unread' ? 'border-blue-500/20' : 'border-white/5'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20 flex-shrink-0">
                        <i className="fa-solid fa-user text-blue-400 text-sm" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{msg.name}</span>
                          {msg.status === 'unread' && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                          <span className={`text-xs px-2 py-0.5 rounded-full ${msg.status === 'unread' ? 'bg-blue-500/10 text-blue-400' : msg.status === 'resolved' ? 'bg-green-500/10 text-green-400' : 'bg-slate-500/10 text-slate-400'}`}>
                            {msg.status === 'unread' ? 'غير مقروءة' : msg.status === 'resolved' ? 'محلولة' : 'مقروءة'}
                          </span>
                        </div>
                        <div className="text-slate-500 text-xs" dir="ltr">{msg.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-xs">{new Date(msg.createdAt).toLocaleString('ar')}</span>
                      {msg.status === 'unread' && (
                        <button onClick={() => markRead(msg._id)} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                          تحديد كمقروء
                        </button>
                      )}
                    </div>
                  </div>
                  {msg.subject && <div className="mt-3 text-sm font-medium text-slate-300">{msg.subject}</div>}
                  <p className="text-slate-400 text-sm mt-2 leading-relaxed">{msg.message}</p>
                  {msg.reply && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <div className="flex items-center gap-1.5 text-xs text-green-400 mb-1">
                        <i className="fa-solid fa-reply" />
                        <span>ردك:</span>
                      </div>
                      <p className="text-slate-400 text-sm">{msg.reply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold">الأمان والمراجعة</h1>
              <p className="text-slate-400 mt-1">سجل الدخول وسجل النشاط</p>
            </div>
            <Section title="سجل تسجيل الدخول">
              <div className="space-y-2">
                {loginHistory.slice(0, 10).length === 0 ? (
                  <p className="text-slate-500 text-sm">لا يوجد سجل</p>
                ) : loginHistory.slice(0, 10).map((log, i) => (
                  <div key={i} className="flex items-center gap-4 py-2.5 border-b border-white/5 last:border-0">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${log.success ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      <i className={`fa-solid ${log.success ? 'fa-check' : 'fa-xmark'} text-xs`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm">{log.success ? 'دخول ناجح' : 'محاولة دخول فاشلة'}</div>
                      <div className="text-xs text-slate-500 truncate">{log.device}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400" dir="ltr">{log.ip}</div>
                      <div className="text-xs text-slate-600">{new Date(log.timestamp).toLocaleString('ar')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="سجل النشاط">
              <div className="space-y-2">
                {auditLog.slice(0, 15).length === 0 ? (
                  <p className="text-slate-500 text-sm">لا يوجد نشاط مسجل</p>
                ) : auditLog.slice().reverse().slice(0, 15).map((log, i) => (
                  <div key={i} className="flex items-center gap-4 py-2.5 border-b border-white/5 last:border-0">
                    <div className="w-7 h-7 bg-blue-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-clock text-blue-400 text-xs" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm">{log.detail || log.action}</div>
                    </div>
                    <div className="text-xs text-slate-600">{new Date(log.timestamp).toLocaleString('ar')}</div>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}
      </div>
    </div>
  );
}
