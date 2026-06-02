import React from 'react';

export default function Footer({ profile }) {
  return (
    <footer className="bg-[#0a0a0f] border-t border-white/5">
      {/* Newsletter */}
      <div className="border-b border-white/5">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                <i className="fa-solid fa-envelope text-blue-400 text-lg" />
              </div>
              <div>
                <h3 className="font-bold text-lg">ابق على اطلاع بأحدث المشاريع</h3>
                <p className="text-slate-400 text-sm">اشترك ولا تفوت أي مشروع جديد</p>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <input type="email" placeholder="أدخل بريدك الإلكتروني" dir="ltr" className="flex-1 md:w-72 bg-[#151821] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors" />
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap">
                <span>اشتراك</span>
                <i className="fa-solid fa-paper-plane text-xs" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-cube text-white text-sm" />
              </div>
              <span className="font-bold text-lg">ميك بورتفوليو</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              منصة متخصصة لمهندسي SolidWorks لعرض مشاريعهم بنماذج ثلاثية الأبعاد تفاعلية.
            </p>
            <div className="space-y-2">
              {[
                { icon: 'fa-cube', label: 'عرض ثلاثي الأبعاد', sub: 'مشاهدة النماذج تفاعلياً' },
                { icon: 'fa-folder-open', label: 'إدارة المشاريع', sub: 'تنظيم وإدارة الأعمال' },
                { icon: 'fa-users', label: 'مجتمع مهندسين', sub: 'تواصل مع المهنيين' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <i className={`fa-solid ${item.icon} text-blue-400 w-4`} />
                  <div>
                    <span className="text-white font-medium">{item.label}</span>
                    <span className="text-slate-500 mr-2 text-xs">{item.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            { title: 'المنصة', links: ['الرئيسية', 'المشاريع', 'الفئات', 'المهندسون', 'المميز', 'المشاريع الحديثة'] },
            { title: 'المصادر', links: ['المدونة', 'الدروس', 'التوثيق', 'مركز المساعدة', 'الإرشادات', 'مرجع API'] },
            { title: 'الشركة', links: ['من نحن', 'قصتنا', 'الوظائف', 'سياسة الخصوصية', 'الشروط', 'تواصل معنا'] },
            { title: 'الدعم', links: ['مركز المساعدة', 'المجتمع', 'الإبلاغ عن مشكلة', 'التغذية الراجعة', 'الدعم الفني'] },
          ].map((col, i) => (
            <div key={i}>
              <h4 className="font-bold mb-4">{col.title}</h4>
              <div className="space-y-2">
                {col.links.map(l => (
                  <a key={l} href="#" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                    <i className="fa-solid fa-angle-left text-xs text-slate-600" />
                    {l}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/5">
        <div className="container mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">© 2024 ميك بورتفوليو. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-slate-500 hover:text-white text-sm transition-colors">سياسة الخصوصية</a>
            <span className="text-slate-700">•</span>
            <a href="#" className="text-slate-500 hover:text-white text-sm transition-colors">شروط الخدمة</a>
            <span className="text-slate-700">•</span>
            <a href="#" className="text-slate-500 hover:text-white text-sm transition-colors">سياسة الكوكيز</a>
          </div>
          <div className="flex items-center gap-3">
            {[
              { icon: 'fa-brands fa-linkedin', href: profile?.linkedin || '#' },
              { icon: 'fa-brands fa-twitter', href: '#' },
              { icon: 'fa-brands fa-instagram', href: '#' },
              { icon: 'fa-brands fa-youtube', href: '#' },
            ].map((s, i) => (
              <a key={i} href={s.href} target="_blank" rel="noreferrer" className="w-8 h-8 bg-[#151821] rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#1c2030] transition-colors">
                <i className={`${s.icon} text-sm`} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
