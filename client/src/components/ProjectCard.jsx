import React from 'react';
import { Link } from 'react-router-dom';

export default function ProjectCard({ module }) {
  return (
    <div className="group bg-[#151821] rounded-xl border border-white/5 overflow-hidden hover:border-blue-500/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/20">
      <div className="relative aspect-video bg-[#0f1117] overflow-hidden">
        {module.thumbnailUrl ? (
          <img src={module.thumbnailUrl} alt={module.titleAr} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <i className="fa-solid fa-cube text-slate-600 text-4xl mb-2 block" />
              <span className="text-slate-600 text-xs">{module.modelFormat?.toUpperCase() || 'GLB'}</span>
            </div>
          </div>
        )}
        <button className="absolute top-3 left-3 w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
          <i className="fa-regular fa-bookmark text-xs" />
        </button>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#151821] to-transparent h-12 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="p-4">
        <h3 className="font-bold mb-1 line-clamp-1">{module.titleAr}</h3>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center">
            <i className="fa-solid fa-user text-blue-400 text-xs" />
          </div>
          <span className="text-slate-400 text-sm">{module.designer}</span>
        </div>

        <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
          <span className="flex items-center gap-1.5">
            <i className="fa-regular fa-eye" />
            {(module.views || 0).toLocaleString('ar')}
          </span>
          <span className="flex items-center gap-1.5">
            <i className="fa-regular fa-heart" />
            {(module.likes || 0).toLocaleString('ar')}
          </span>
          <span className="flex items-center gap-1.5">
            <i className="fa-regular fa-comment" />
            0
          </span>
        </div>

        <Link
          to={`/project/${module._id}`}
          className="flex items-center justify-center gap-2 w-full bg-blue-600/10 hover:bg-blue-600 border border-blue-500/30 hover:border-blue-600 text-blue-400 hover:text-white rounded-lg py-2.5 text-sm font-semibold transition-all"
        >
          <i className="fa-solid fa-cube text-xs" />
          <span>عرض المشروع ثلاثي الأبعاد</span>
        </Link>
      </div>
    </div>
  );
}
