import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo/3DIndustrialPortfolio.png";

const NAV_LINKS = [
  { label: "الرئيسية", section: "home" },
  { label: "المشاريع", section: "projects" },
  { label: "عن المهندس", section: "about" },
  { label: "المهارات", section: "skills" },
  { label: "التواصل", section: "contact" },
];

export default function Footer({ profile }) {
  const year = new Date().getFullYear();
  const name = profile?.fullNameAr || "أحمد الجاسم";
  const profession = profile?.professionAr || "مهندس ميكاترونكس";
  const bio = profile?.bioAr;
  const handleNavClick = (e, section) => {
    e.preventDefault();
    const scrollTo = () => {
      const el = document.getElementById(section);
      if (el) el.scrollIntoView({ behavior: "smooth" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    };
    if (window.location.pathname === "/") {
      scrollTo();
    } else {
      window.location.href = `/#${section}`;
    }
  };

  return (
    <footer className="bg-[#0a0a0f] border-t border-white/5" dir="rtl">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">

          {/* ── Brand ── */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4 w-fit">
              <img src={logo} alt="logo" className="w-9 h-9 rounded-xl object-contain" />
              <span className="font-bold text-lg">ميكا بورتفوليو</span>
            </Link>

            <p className="text-blue-400 text-sm font-medium mb-2">{profession}</p>

            {bio ? (
              <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-4">{bio}</p>
            ) : (
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                منصة تخصصية لعرض مشاريع الهندسة الميكاترونية بنماذج ثلاثية الأبعاد تفاعلية.
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              {[
                { icon: "fa-cube", label: "عرض ثلاثي الأبعاد" },
                { icon: "fa-gears", label: "هندسة ميكاترونية" },
                { icon: "fa-drafting-compass", label: "رسومات فنية" },
              ].map((tag) => (
                <span
                  key={tag.label}
                  className="flex items-center gap-1.5 text-xs text-slate-400 bg-white/5 border border-white/8 rounded-full px-3 py-1"
                >
                  <i className={`fa-solid ${tag.icon} text-blue-400`} />
                  {tag.label}
                </span>
              ))}
            </div>
          </div>

          {/* ── Navigation ── */}
          <div>
            <h4 className="font-bold text-sm mb-5 text-white">روابط سريعة</h4>
            <nav className="space-y-3">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.section}
                  href={`/#${link.section}`}
                  onClick={(e) => handleNavClick(e, link.section)}
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group cursor-pointer"
                >
                  <i className="fa-solid fa-angle-left text-xs text-slate-600 group-hover:text-blue-400 transition-colors" />
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* ── Contact ── */}
          <div>
            <h4 className="font-bold text-sm mb-5 text-white">التواصل</h4>
            <div className="space-y-3">
              {profile?.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-center gap-3 text-sm text-slate-400 hover:text-white transition-colors group"
                >
                  <span className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center flex-shrink-0 group-hover:border-blue-500/40 transition-colors">
                    <i className="fa-solid fa-envelope text-blue-400 text-xs" />
                  </span>
                  <span className="truncate" dir="ltr">{profile.email}</span>
                </a>
              )}

              {profile?.phone && (
                <a
                  href={`tel:${profile.phone}`}
                  className="flex items-center gap-3 text-sm text-slate-400 hover:text-white transition-colors group"
                >
                  <span className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center flex-shrink-0 group-hover:border-blue-500/40 transition-colors">
                    <i className="fa-solid fa-phone text-blue-400 text-xs" />
                  </span>
                  <span dir="ltr">{profile.phone}</span>
                </a>
              )}

              {profile?.whatsapp && (
                <a
                  href={`https://wa.me/${profile.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 text-sm text-slate-400 hover:text-white transition-colors group"
                >
                  <span className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center flex-shrink-0 group-hover:border-blue-500/40 transition-colors">
                    <i className="fa-brands fa-whatsapp text-blue-400 text-xs" />
                  </span>
                  <span>واتساب</span>
                </a>
              )}

              {profile?.linkedin && (
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 text-sm text-slate-400 hover:text-white transition-colors group"
                >
                  <span className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center flex-shrink-0 group-hover:border-blue-500/40 transition-colors">
                    <i className="fa-brands fa-linkedin text-blue-400 text-xs" />
                  </span>
                  <span>LinkedIn</span>
                </a>
              )}

              {!profile?.email && !profile?.phone && !profile?.whatsapp && !profile?.linkedin && (
                <p className="text-slate-500 text-sm">أضف بيانات التواصل من لوحة الإدارة</p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-white/5">
        <div className="container mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-500 text-sm">
            © {year} {name} · جميع الحقوق محفوظة
          </p>
          <p className="text-slate-600 text-xs flex items-center gap-1.5">
            <i className="fa-solid fa-cube text-blue-500/50" />
            بُني بشغف للهندسة الميكاترونية
          </p>
        </div>
      </div>
    </footer>
  );
}
