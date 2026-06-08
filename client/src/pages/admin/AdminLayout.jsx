import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import logo from '../../assets/logo/3DIndustrialPortfolio.png';

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navLinks = [
    { to: '/admin/dashboard', icon: 'fa-gauge', label: 'لوحة التحكم' },
    { to: '/admin/modules',   icon: 'fa-cube',   label: 'المشاريع ثلاثية الأبعاد' },
    { to: '/admin/settings',  icon: 'fa-gear',   label: 'الإعدادات' },
  ];

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="h-16 flex items-center border-b border-white/5 flex-shrink-0">
        {collapsed ? (
          <button
            onClick={() => setCollapsed(false)}
            className="w-full flex items-center justify-center text-slate-400 hover:text-white transition-colors h-full"
            title="توسيع القائمة"
          >
            <i className="fa-solid fa-chevron-left text-sm" />
          </button>
        ) : (
          <div className="flex items-center w-full px-4 gap-2">
            <Link to="/" className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
              <img src={logo} alt="logo" className="w-8 h-8 flex-shrink-0 rounded-xl object-contain" />
              <span className="font-bold text-sm whitespace-nowrap truncate">ميك بورتفوليو</span>
            </Link>
            <button
              onClick={() => setCollapsed(true)}
              className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              title="طي القائمة"
            >
              <i className="fa-solid fa-chevron-right text-xs" />
            </button>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {navLinks.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            title={collapsed ? link.label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl text-sm font-medium transition-colors
              ${collapsed ? 'px-0 py-2.5 justify-center' : 'px-3 py-2.5'}
              ${isActive
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
      <div className="p-3 border-t border-white/5 flex-shrink-0">
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
          title={collapsed ? 'تسجيل الخروج' : undefined}
          className={`flex items-center gap-3 w-full text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors
            ${collapsed ? 'px-0 py-2.5 justify-center' : 'px-3 py-2.5'}`}
        >
          <i className="fa-solid fa-right-from-bracket w-4 text-center flex-shrink-0" />
          {!collapsed && <span>تسجيل الخروج</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] font-arabic flex flex-row" dir="rtl">

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed top-0 right-0 h-full z-50 bg-[#0f1117] border-l border-white/5
          flex flex-col transition-all duration-200
          lg:sticky lg:top-0 lg:h-screen lg:z-auto lg:translate-x-0 lg:flex-shrink-0
          ${collapsed ? 'lg:w-16' : 'lg:w-64'}
          w-64
          ${mobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}
      >
        <SidebarContent />
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">

        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center h-14 px-4 bg-[#0f1117] border-b border-white/5 flex-shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <i className="fa-solid fa-bars text-sm" />
          </button>
          <Link to="/" className="flex items-center gap-2 mr-3">
            <img src={logo} alt="logo" className="w-7 h-7 rounded-lg object-contain" />
            <span className="font-bold text-sm">ميك بورتفوليو</span>
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
