import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navLinks = [
    { to: '/admin/dashboard', icon: 'fa-grid-2', label: 'لوحة التحكم' },
    { to: '/admin/modules', icon: 'fa-cube', label: 'المشاريع ثلاثية الأبعاد' },
    { to: '/admin/settings', icon: 'fa-gear', label: 'الإعدادات' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex font-arabic" dir="rtl">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-64'} flex-shrink-0 bg-[#0f1117] border-l border-white/5 flex flex-col transition-all duration-200`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-white/5">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 flex-shrink-0 bg-blue-600 rounded-xl flex items-center justify-center">
              <i className="fa-solid fa-cube text-white text-sm" />
            </div>
            {!collapsed && <span className="font-bold text-sm whitespace-nowrap">ميك بورتفوليو</span>}
          </div>
          <button onClick={() => setCollapsed(!collapsed)} className="mr-auto text-slate-500 hover:text-white transition-colors">
            <i className={`fa-solid ${collapsed ? 'fa-chevron-left' : 'fa-chevron-right'} text-xs`} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <i className={`fa-solid ${link.icon} w-4 text-center flex-shrink-0`} />
              {!collapsed && <span>{link.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Admin info + logout */}
        <div className="p-3 border-t border-white/5">
          {!collapsed && (
            <div className="flex items-center gap-3 px-2 py-2 mb-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-user text-white text-xs" />
              </div>
              <div className="overflow-hidden">
                <div className="text-sm font-medium truncate">{admin?.username}</div>
                <div className="text-xs text-slate-500">مدير</div>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <i className="fa-solid fa-right-from-bracket w-4 text-center flex-shrink-0" />
            {!collapsed && <span>تسجيل الخروج</span>}
          </button>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors mt-1"
          >
            <i className="fa-solid fa-arrow-up-right-from-square w-4 text-center flex-shrink-0" />
            {!collapsed && <span>عرض الموقع</span>}
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
