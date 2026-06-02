import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api.js';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import ProjectCard from '../components/ProjectCard.jsx';

export default function HomePage() {
  const [modules, setModules] = useState([]);
  const [profile, setProfile] = useState(null);
  const [contact, setContact] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactStatus, setContactStatus] = useState(null);

  useEffect(() => {
    api.get('/modules?limit=6&status=published').then(r => setModules(r.data.modules || []));
    api.get('/profile').then(r => setProfile(r.data));
  }, []);

  const handleContact = async (e) => {
    e.preventDefault();
    try {
      await api.post('/contact', contact);
      setContactStatus('success');
      setContact({ name: '', email: '', subject: '', message: '' });
    } catch {
      setContactStatus('error');
    }
  };

  const categories = [
    { icon: 'fa-cogs', label: 'ميكانيكية', count: '1,230' },
    { icon: 'fa-industry', label: 'تصميم صناعي', count: '860' },
    { icon: 'fa-car', label: 'سيارات', count: '430' },
    { icon: 'fa-robot', label: 'روبوتات', count: '390' },
    { icon: 'fa-plane', label: 'فضاء', count: '210' },
    { icon: 'fa-box', label: 'منتجات', count: '180' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-arabic" dir="rtl">
      <Navbar />

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-bl from-blue-900/20 via-transparent to-transparent pointer-events-none" />

        <div className="container mx-auto px-6 py-24 flex flex-col lg:flex-row items-center gap-12">
          {/* Left Content */}
          <div className="flex-1 z-10">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-1.5 text-sm text-blue-400 mb-6">
              <i className="fa-solid fa-circle-dot text-xs" />
              <span>اعرض. شارك. ألهم.</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              اعرض هندستك{' '}
              <span className="text-blue-400">بتقنية ثلاثية الأبعاد.</span>
            </h1>
            <p className="text-slate-400 text-lg mb-8 max-w-xl">
              {profile?.bioAr || 'منصة متخصصة لمهندسي SolidWorks لعرض مشاريعهم بنماذج ثلاثية الأبعاد تفاعلية ودراسات حالة تفصيلية.'}
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#projects" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                <span>استعراض المشاريع</span>
                <i className="fa-solid fa-arrow-left" />
              </a>
              <a href="#contact" className="flex items-center gap-2 border border-slate-600 hover:border-blue-500 text-slate-300 hover:text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                <span>التواصل</span>
                <i className="fa-solid fa-envelope" />
              </a>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-12">
              {[
                { icon: 'fa-cube', value: `${modules.length || '0'}+`, label: 'مشروع' },
                { icon: 'fa-user-gear', value: '1', label: 'مهندس' },
                { icon: 'fa-eye', value: '2,450+', label: 'مشاهدة' },
                { icon: 'fa-heart', value: '1,200+', label: 'إعجاب' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <i className={`fa-solid ${s.icon} text-blue-400`} />
                  </div>
                  <div>
                    <div className="text-xl font-bold">{s.value}</div>
                    <div className="text-slate-500 text-sm">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - 3D Preview Area */}
          <div className="flex-1 relative">
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-600/10 rounded-2xl border border-white/5" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                    <i className="fa-solid fa-cube text-blue-400 text-4xl" />
                  </div>
                  <p className="text-slate-400 text-sm">انقر على مشروع لعرضه ثلاثي الأبعاد</p>
                </div>
              </div>

              {/* Controls overlay */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                {[
                  { icon: 'fa-rotate', label: 'تدوير' },
                  { icon: 'fa-magnifying-glass-plus', label: 'تكبير' },
                  { icon: 'fa-up-down-left-right', label: 'تحريك' },
                  { icon: 'fa-expand', label: 'ملء الشاشة' },
                ].map((c, i) => (
                  <div key={i} className="w-12 h-12 bg-[#151821] border border-white/10 rounded-lg flex flex-col items-center justify-center gap-0.5 cursor-pointer hover:border-blue-500/50 transition-colors">
                    <i className={`fa-solid ${c.icon} text-slate-400 text-xs`} />
                    <span className="text-[9px] text-slate-500">{c.label}</span>
                  </div>
                ))}
              </div>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {[0,1,2,3].map(i => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i===0 ? 'bg-blue-500' : 'bg-slate-600'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section id="projects" className="py-20 bg-[#0f1117]">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold">المشاريع المميزة</h2>
              <p className="text-slate-400 mt-2">مشاريع مختارة من مهندسين موهوبين</p>
            </div>
            <Link to="/projects" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors">
              <span>عرض الكل</span>
              <i className="fa-solid fa-arrow-left text-sm" />
            </Link>
          </div>

          {modules.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-cube text-slate-500 text-3xl" />
              </div>
              <p className="text-slate-500 text-lg">لا توجد مشاريع منشورة حتى الآن</p>
              <p className="text-slate-600 text-sm mt-2">سيتم إضافة المشاريع قريباً</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map(mod => (
                <ProjectCard key={mod._id} module={mod} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20">
                <i className="fa-solid fa-user-gear text-blue-400 text-3xl" />
              </div>
              <h2 className="text-3xl font-bold mb-2">{profile?.fullNameAr || 'أحمد الجاسم'}</h2>
              <p className="text-blue-400 font-medium mb-4">{profile?.professionAr || 'مهندس ميكاترونكس'}</p>
              <p className="text-slate-400 leading-relaxed mb-6">
                {profile?.bioAr || 'مهندس ميكاترونكس متخصص في تصميم الأجزاء الميكانيكية الصناعية باستخدام برامج الهندسة المتقدمة مثل SolidWorks وBlender. أقدم هنا أعمالي وإبداعاتي الهندسية بتقنية ثلاثية الأبعاد.'}
              </p>
              <div className="flex flex-wrap gap-3">
                {profile?.linkedin && (
                  <a href={profile.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-[#151821] hover:bg-[#1c2030] px-4 py-2 rounded-lg border border-white/5 transition-colors text-sm">
                    <i className="fa-brands fa-linkedin text-blue-400" />
                    <span>LinkedIn</span>
                  </a>
                )}
                {profile?.whatsapp && (
                  <a href={`https://wa.me/${profile.whatsapp}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-[#151821] hover:bg-[#1c2030] px-4 py-2 rounded-lg border border-white/5 transition-colors text-sm">
                    <i className="fa-brands fa-whatsapp text-green-400" />
                    <span>واتساب</span>
                  </a>
                )}
                {profile?.email && (
                  <a href={`mailto:${profile.email}`} className="flex items-center gap-2 bg-[#151821] hover:bg-[#1c2030] px-4 py-2 rounded-lg border border-white/5 transition-colors text-sm">
                    <i className="fa-solid fa-envelope text-slate-400" />
                    <span>{profile.email}</span>
                  </a>
                )}
              </div>
            </div>
            <div id="skills">
              <h3 className="text-2xl font-bold mb-8">المهارات والخبرات</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: 'fa-drafting-compass', label: 'SolidWorks' },
                  { icon: 'fa-cube', label: 'Blender 3D' },
                  { icon: 'fa-microchip', label: 'ميكاترونكس' },
                  { icon: 'fa-gears', label: 'التصميم الميكانيكي' },
                  { icon: 'fa-industry', label: 'الهندسة الصناعية' },
                  { icon: 'fa-code', label: 'برمجة CNC' },
                ].map((skill, i) => (
                  <div key={i} className="flex items-center gap-3 bg-[#151821] rounded-xl p-4 border border-white/5 hover:border-blue-500/30 transition-colors">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className={`fa-solid ${skill.icon} text-blue-400`} />
                    </div>
                    <span className="font-medium text-sm">{skill.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Browse Categories */}
      <section className="py-20 bg-[#0f1117]">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold">تصفح الفئات</h2>
              <p className="text-slate-400 mt-2">استعرض المشاريع حسب المجال الهندسي</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <div key={i} className="flex flex-col items-center gap-3 bg-[#151821] rounded-xl p-6 border border-white/5 hover:border-blue-500/30 hover:bg-[#1c2030] cursor-pointer transition-all group">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <i className={`fa-solid ${cat.icon} text-blue-400 text-lg`} />
                </div>
                <span className="font-semibold text-sm text-center">{cat.label}</span>
                <span className="text-slate-500 text-xs">{cat.count} مشروع</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="container mx-auto px-6 max-w-2xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">تواصل معي</h2>
            <p className="text-slate-400">لديك استفسار أو مشروع مشترك؟ أرسل لي رسالة</p>
          </div>
          <form onSubmit={handleContact} className="bg-[#151821] rounded-2xl p-8 border border-white/5 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">الاسم</label>
                <input
                  type="text" value={contact.name} onChange={e => setContact(p => ({...p, name: e.target.value}))} required
                  className="w-full bg-[#0f1117] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="اسمك الكامل"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">البريد الإلكتروني</label>
                <input
                  type="email" value={contact.email} onChange={e => setContact(p => ({...p, email: e.target.value}))} required
                  className="w-full bg-[#0f1117] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="email@example.com"
                  dir="ltr"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">الموضوع</label>
              <input
                type="text" value={contact.subject} onChange={e => setContact(p => ({...p, subject: e.target.value}))}
                className="w-full bg-[#0f1117] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="موضوع الرسالة"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">الرسالة</label>
              <textarea
                value={contact.message} onChange={e => setContact(p => ({...p, message: e.target.value}))} required rows={5}
                className="w-full bg-[#0f1117] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                placeholder="اكتب رسالتك هنا..."
              />
            </div>
            {contactStatus === 'success' && (
              <div className="flex items-center gap-2 text-green-400 bg-green-400/10 rounded-lg px-4 py-3">
                <i className="fa-solid fa-check-circle" />
                <span>تم إرسال رسالتك بنجاح!</span>
              </div>
            )}
            {contactStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-400 bg-red-400/10 rounded-lg px-4 py-3">
                <i className="fa-solid fa-circle-exclamation" />
                <span>حدث خطأ، يرجى المحاولة مرة أخرى</span>
              </div>
            )}
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
              <i className="fa-solid fa-paper-plane" />
              <span>إرسال الرسالة</span>
            </button>
          </form>
        </div>
      </section>

      <Footer profile={profile} />
    </div>
  );
}
