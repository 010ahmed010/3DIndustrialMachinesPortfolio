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

  const links = [
    { href: '#home', label: 'الرئيسية' },
    { href: '#projects', label: 'المشاريع' },
    { href: '#about', label: 'عن المهندس' },
    { href: '#skills', label: 'المهارات' },
    { href: '#contact', label: 'التواصل' },
  ];

  return (
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
            className="md:hidden w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <i className={`fa-solid ${menuOpen ? 'fa-xmark' : 'fa-bars'}`} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-[#0f1117] border-t border-white/5 py-4">
          {links.map(l => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="block px-6 py-3 text-slate-400 hover:text-white transition-colors">
              {l.label}
            </a>
          ))}
          <Link to="/admin/login" onClick={() => setMenuOpen(false)} className="block px-6 py-3 text-slate-400 hover:text-white transition-colors">
            <i className="fa-solid fa-lock text-xs ml-2" />لوحة التحكم
          </Link>
        </div>
      )}
    </nav>
  );
}
