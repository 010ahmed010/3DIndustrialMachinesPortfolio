import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';

export default function AdminLoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'بيانات الدخول غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center font-arabic" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/30">
            <i className="fa-solid fa-cube text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-bold mb-1">لوحة التحكم</h1>
          <p className="text-slate-400 text-sm">تسجيل الدخول للمدير</p>
        </div>

        <div className="bg-[#151821] rounded-2xl p-8 border border-white/5 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-slate-400 mb-2">اسم المستخدم</label>
              <div className="relative">
                <i className="fa-solid fa-user absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                <input
                  type="text"
                  value={form.username}
                  onChange={e => setForm(p => ({...p, username: e.target.value}))}
                  required
                  className="w-full bg-[#0f1117] border border-white/10 rounded-lg pr-10 pl-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="اسم المستخدم"
                  dir="ltr"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">كلمة المرور</label>
              <div className="relative">
                <i className="fa-solid fa-lock absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm(p => ({...p, password: e.target.value}))}
                  required
                  className="w-full bg-[#0f1117] border border-white/10 rounded-lg pr-10 pl-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="كلمة المرور"
                  dir="ltr"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 bg-red-400/10 rounded-lg px-4 py-3 text-sm">
                <i className="fa-solid fa-circle-exclamation" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>جاري الدخول...</span></>
              ) : (
                <><i className="fa-solid fa-right-to-bracket" /><span>تسجيل الدخول</span></>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/5 text-center">
            <p className="text-slate-500 text-xs">
              عند أول تسجيل دخول، يتم إنشاء حساب المدير تلقائياً
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
