import React, { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../utils/api.js";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import ProjectCard from "../components/ProjectCard.jsx";

const PAGE_SIZE = 9;

export default function ProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const [modules, setModules] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  const fetchModules = useCallback((page) => {
    setLoading(true);
    api
      .get(`/modules?status=published&page=${page}&limit=${PAGE_SIZE}`)
      .then((r) => {
        setModules(r.data.modules || []);
        setTotalPages(r.data.pages || 1);
        setTotal(r.data.total || 0);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchModules(currentPage);
  }, [currentPage, fetchModules]);

  useEffect(() => {
    api.get("/profile").then((r) => setProfile(r.data)).catch(() => {});
  }, []);

  const goToPage = (page) => {
    setSearchParams({ page: String(page) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: "#0a0a0f", fontFamily: "'Tajawal', sans-serif" }}
      dir="rtl"
    >
      <Navbar />

      {/* ── Page Header ── */}
      <section
        className="pt-32 pb-12"
        style={{
          background:
            "linear-gradient(to bottom, #0b0f1a 0%, #0e1320 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-6">
            <Link to="/" className="hover:text-blue-400 transition-colors">
              الرئيسية
            </Link>
            <i className="fa-solid fa-chevron-left text-xs" />
            <span className="text-slate-300">جميع المشاريع</span>
          </div>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">جميع المشاريع</h1>
              <p className="text-slate-400">
                {loading ? "جارٍ التحميل…" : `${total} مشروع منشور`}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-slate-400 text-sm bg-[#111827] border border-white/5 rounded-xl px-4 py-2">
              <i className="fa-solid fa-layer-group text-blue-400" />
              <span>
                صفحة {currentPage} من {totalPages}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Grid ── */}
      <section className="py-14" style={{ background: "#0e1320" }}>
        <div className="container mx-auto px-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div
                  key={i}
                  className="bg-[#151821] rounded-xl border border-white/5 overflow-hidden animate-pulse"
                >
                  <div className="aspect-video bg-[#1a1f2e]" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-[#1a1f2e] rounded w-3/4" />
                    <div className="h-3 bg-[#1a1f2e] rounded w-1/2" />
                    <div className="h-9 bg-[#1a1f2e] rounded mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : modules.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-20 h-20 bg-slate-800/60 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                <i className="fa-solid fa-cube text-slate-500 text-3xl" />
              </div>
              <p className="text-slate-500 text-lg">
                لا توجد مشاريع منشورة حتى الآن
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((mod) => (
                <ProjectCard key={mod._id} module={mod} />
              ))}
            </div>
          )}

          {/* ── Pagination ── */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-14 flex-wrap">
              {/* Previous */}
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-white/10 bg-[#111827] text-slate-400 hover:text-white hover:border-blue-500/50 hover:bg-[#162035] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <i className="fa-solid fa-chevron-right text-xs" />
              </button>

              {/* Page numbers */}
              {pages.map((p) => {
                const isActive = p === currentPage;
                const isNear =
                  Math.abs(p - currentPage) <= 2 ||
                  p === 1 ||
                  p === totalPages;
                if (!isNear) {
                  if (p === currentPage - 3 || p === currentPage + 3) {
                    return (
                      <span key={p} className="text-slate-600 px-1">
                        …
                      </span>
                    );
                  }
                  return null;
                }
                return (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg border text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/30"
                        : "border-white/10 bg-[#111827] text-slate-400 hover:text-white hover:border-blue-500/50 hover:bg-[#162035]"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              {/* Next */}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-white/10 bg-[#111827] text-slate-400 hover:text-white hover:border-blue-500/50 hover:bg-[#162035] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <i className="fa-solid fa-chevron-left text-xs" />
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer profile={profile} />
    </div>
  );
}
