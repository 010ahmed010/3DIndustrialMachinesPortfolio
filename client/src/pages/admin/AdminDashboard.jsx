import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api.js';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stats').then(r => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const widgets = [
    { icon: 'fa-cube', label: 'إجمالي المشاريع المنشورة', value: stats?.totalModules ?? 0, color: 'blue', sub: `${stats?.pendingModules ?? 0} في الانتظار` },
    { icon: 'fa-eye', label: 'إجمالي المشاهدات', value: (stats?.totalViews ?? 0).toLocaleString('ar'), color: 'cyan', sub: 'عبر جميع المشاريع' },
    { icon: 'fa-heart', label: 'الإعجابات', value: (stats?.totalLikes ?? 0).toLocaleString('ar'), color: 'rose', sub: `${stats?.totalDislikes ?? 0} عدم إعجاب` },
    { icon: 'fa-envelope', label: 'رسائل التواصل', value: stats?.totalMessages ?? 0, color: 'amber', sub: `${stats?.unreadMessages ?? 0} غير مقروءة` },
  ];

  const colorMap = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  return (
    <div className="p-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
        <p className="text-slate-400 mt-1">مرحباً بك، إليك نظرة عامة على المنصة</p>
      </div>

      {/* Stat Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {widgets.map((w, i) => (
          <div key={i} className="bg-[#151821] rounded-xl p-5 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${colorMap[w.color]}`}>
                <i className={`fa-solid ${w.icon} text-lg`} />
              </div>
              <span className="text-slate-500 text-xs">{w.sub}</span>
            </div>
            <div className="text-3xl font-bold mb-1">{w.value}</div>
            <div className="text-slate-400 text-sm">{w.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Uploads */}
        <div className="bg-[#151821] rounded-xl border border-white/5">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <h2 className="font-bold">آخر المشاريع المرفوعة</h2>
            <Link to="/admin/modules" className="text-blue-400 text-sm hover:text-blue-300 transition-colors">
              عرض الكل
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {stats?.recentUploads?.length ? stats.recentUploads.map(m => (
              <div key={m._id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-10 h-10 bg-[#0f1117] rounded-lg flex items-center justify-center flex-shrink-0 border border-white/5">
                  {m.thumbnailUrl ? (
                    <img src={m.thumbnailUrl} alt={m.titleAr} className="w-full h-full rounded-lg object-cover" />
                  ) : (
                    <i className="fa-solid fa-cube text-slate-500 text-sm" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{m.titleAr}</div>
                  <div className="text-slate-500 text-xs">{m.category}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${m.status === 'published' ? 'bg-green-500/10 text-green-400' : m.status === 'pending' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-500/10 text-slate-400'}`}>
                    {m.status === 'published' ? 'منشور' : m.status === 'pending' ? 'انتظار' : 'مخفي'}
                  </span>
                  <span className="text-slate-600 text-xs">{new Date(m.createdAt).toLocaleDateString('ar')}</span>
                </div>
              </div>
            )) : (
              <div className="px-5 py-8 text-center text-slate-500 text-sm">لا توجد مشاريع حتى الآن</div>
            )}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-[#151821] rounded-xl border border-white/5">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <h2 className="font-bold">رسائل التواصل الأخيرة</h2>
            <Link to="/admin/settings" className="text-blue-400 text-sm hover:text-blue-300 transition-colors">
              عرض الكل
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {stats?.recentMessages?.length ? stats.recentMessages.map(msg => (
              <div key={msg._id} className="flex items-start gap-4 px-5 py-3.5">
                <div className="w-9 h-9 bg-blue-500/10 rounded-full flex items-center justify-center flex-shrink-0 border border-blue-500/20">
                  <i className="fa-solid fa-user text-blue-400 text-xs" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{msg.name}</span>
                    {msg.status === 'unread' && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                  </div>
                  <div className="text-slate-500 text-xs truncate">{msg.message}</div>
                  <div className="text-slate-600 text-xs mt-0.5">{new Date(msg.createdAt).toLocaleDateString('ar')}</div>
                </div>
              </div>
            )) : (
              <div className="px-5 py-8 text-center text-slate-500 text-sm">لا توجد رسائل حتى الآن</div>
            )}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="mt-6 bg-[#151821] rounded-xl border border-white/5 p-5">
        <h2 className="font-bold mb-4">حالة النظام</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'الخادم', status: true },
            { label: 'قاعدة البيانات', status: true },
            { label: 'التخزين', status: true },
            { label: 'واجهة المستخدم', status: true },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2.5 bg-[#0f1117] rounded-lg p-3">
              <div className={`w-2 h-2 rounded-full ${item.status ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-sm text-slate-300">{item.label}</span>
              <span className={`text-xs mr-auto ${item.status ? 'text-green-400' : 'text-red-400'}`}>
                {item.status ? 'يعمل' : 'معطل'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
