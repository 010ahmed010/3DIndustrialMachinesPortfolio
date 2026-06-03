import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const links = [
    { href: '#home',     label: 'الرئيسية',   icon: 'fa-house' },
    { href: '#projects', label: 'المشاريع',   icon: 'fa-cube' },
    { href: '#about',    label: 'عن المهندس', icon: 'fa-user-gear' },
    { href: '#skills',   label: 'المهارات',   icon: 'fa-drafting-compass' },
    { href: '#contact',  label: 'التواصل',    icon: 'fa-envelope' },
  ];

  // Only الرئيسية appears in التنقل; the rest are covered by the sections grid
  const topLinks = links.filter(l => l.href === '#home');

  const sections = [
    { href: '#projects', label: 'المشاريع',   icon: 'fa-cube' },
    { href: '#about',    label: 'عن المهندس', icon: 'fa-user-gear' },
    { href: '#skills',   label: 'المهارات',   icon: 'fa-drafting-compass' },
    { href: '#contact',  label: 'التواصل',    icon: 'fa-envelope' },
  ];

  const close = () => setMenuOpen(false);

  return (
    <>
      <nav className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a0a0f]/95 backdrop-blur-md border-b border-white/5 shadow-xl' : 'bg-transparent'}`}>
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-cube text-white text-sm" />
            </div>
            <span className="font-bold text-lg">ميك بورتفوليو</span>
          </Link>

          {!isAdmin && (
            <div className="hidden md:flex items-center gap-6">
              {links.map(l => (
                <a key={l.href} href={l.href} className="text-slate-400 hover:text-white text-sm font-medium transition-colors">
                  {l.label}
                </a>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            {!isAdmin && (
              <Link to="/admin/login" className="hidden md:flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors px-3 py-2">
                <i className="fa-solid fa-lock text-xs" />
                <span>لوحة التحكم</span>
              </Link>
            )}
            <button
              className="md:hidden w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              onClick={() => setMenuOpen(true)}
            >
              <i className="fa-solid fa-bars text-lg" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Full-screen mobile menu overlay ── */}
      <div
        className={`fixed inset-0 z-[100] md:hidden flex flex-col transition-all duration-300 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ background: '#0b0f1a' }}
        dir="rtl"
      >
        {/* Top bar — Logo right, X left (RTL: first child = right, second = left) */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          {/* Logo — first child → RIGHT in RTL */}
          <Link to="/" onClick={close} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-cube text-white text-sm" />
            </div>
            <span className="font-bold text-base">ميك بورتفوليو</span>
          </Link>
          {/* Close button — second child → LEFT in RTL */}
          <button
            onClick={close}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all"
          >
            <i className="fa-solid fa-xmark text-lg" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8">

          {/* Navigation links */}
          <div>
            <p className="text-slate-600 text-xs font-medium mb-4 text-right">التنقل</p>
            <div className="space-y-1">
              {topLinks.map(l => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={close}
                  className="flex items-center justify-between w-full py-3 px-2 text-slate-200 hover:text-white rounded-xl hover:bg-white/5 transition-all group"
                >
                  {/* text first → RIGHT in RTL */}
                  <span className="text-xl font-semibold">{l.label}</span>
                  {/* icon second → LEFT in RTL */}
                  <i className={`fa-solid ${l.icon} text-slate-600 group-hover:text-blue-400 text-sm transition-colors`} />
                </a>
              ))}
            </div>
          </div>

          {/* Sections quick-grid */}
          <div>
            <p className="text-slate-600 text-xs font-medium mb-4 text-right">أقسام الصفحة</p>
            <div className="grid grid-cols-2 gap-3">
              {sections.map(s => (
                <a
                  key={s.href}
                  href={s.href}
                  onClick={close}
                  className="flex items-center justify-end gap-3 bg-[#111827] border border-white/5 rounded-xl px-4 py-3 hover:border-blue-500/40 hover:bg-[#162035] transition-all"
                >
                  <span className="text-sm font-medium text-slate-200">{s.label}</span>
                  <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className={`fa-solid ${s.icon} text-blue-400 text-xs`} />
                  </div>
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom action */}
        <div className="px-5 py-5 border-t border-white/5">
          <Link
            to="/admin/login"
            onClick={close}
            className="flex items-center justify-center gap-3 w-full bg-blue-600/15 border border-blue-500/30 hover:bg-blue-600/25 text-blue-300 font-semibold py-3.5 rounded-xl transition-all"
          >
            <i className="fa-solid fa-lock text-sm" />
            <span>لوحة التحكم</span>
          </Link>
        </div>
      </div>
    </>
  );
}
