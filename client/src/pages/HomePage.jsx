import React, {
  useEffect,
  useState,
  Suspense,
  Component,
  useMemo,
} from "react";
import { Link } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Environment,
  ContactShadows,
  Grid,
  useProgress,
} from "@react-three/drei";
import * as THREE from "three";
import api from "../utils/api.js";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import ProjectCard from "../components/ProjectCard.jsx";

/* ─── Hero model catalogue ───────────────────────────────────────────────────
   Each model lives in public/models/<name>/scene.gltf with its textures folder.
   scale  — world-unit scale so the model fills the viewport nicely.
   posY   — vertical offset to sit just above the contact-shadow plane.
   ─────────────────────────────────────────────────────────────────────────── */
const HERO_MODELS = [
  // mech_drone  — original hero model
  { url: "/models/mech_drone/scene.gltf", scale: 2.2, posY: -0.5 },
  // deadnaut    — tall armoured robot
  { url: "/models/deadnaut/scene.gltf", scale: 0.38, posY: -0.9 },
  // drone       — wide quad-drone
  { url: "/models/drone/scene.gltf", scale: 0.7, posY: -0.3 },
  // toon_drone  — "4m" model is huge in world units; scale way down so full drone fits
  { url: "/models/toon_drone_-_4m-ru/scene.gltf", scale: 0.055, posY: -0.5 },
];

/* Preload triggered once at module init — useGLTF.preload is a static util, not a hook */
if (typeof window !== "undefined") {
  HERO_MODELS.forEach((m) => useGLTF.preload(m.url));
}

/* Pick a model that is DIFFERENT from the last visit, cycling through all 4.
   Runs at module-evaluation time so it re-runs on every hard page reload.     */
function pickHeroModel() {
  try {
    const key = "hero_model_idx";
    const last = parseInt(localStorage.getItem(key) ?? "-1");
    const next = (isNaN(last) ? -1 : last) + 1;
    const idx = next % HERO_MODELS.length;
    localStorage.setItem(key, String(idx));
    return HERO_MODELS[idx];
  } catch {
    return HERO_MODELS[0];
  }
}

const HERO_MODEL_THIS_VISIT = pickHeroModel();

/* Steel fallback palette — used only when a mesh has NO textures and is white */
const STEEL_COLORS = [
  "#3a3f4a",
  "#4a515f",
  "#2e3340",
  "#525a6a",
  "#3d4455",
  "#606878",
];

/* ── Loading progress overlay — shown while the GLTF model is fetching ── */
function ModelLoadingOverlay() {
  const { progress, active } = useProgress();
  if (!active) return null;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
      <div className="flex flex-col items-center gap-4">
        {/* Spinning cube icon */}
        <div className="w-14 h-14 bg-blue-500/15 border border-blue-500/30 rounded-2xl flex items-center justify-center animate-pulse">
          <i className="fa-solid fa-cube text-blue-400 text-2xl" />
        </div>
        {/* Progress bar */}
        <div className="w-40 h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${Math.round(progress)}%` }}
          />
        </div>
        {/* Percentage */}
        <span className="text-slate-400 text-xs font-medium tabular-nums">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}

/* ── Error boundary so WebGL failures don't crash the whole page ── */
class CanvasErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { err: false };
  }
  static getDerivedStateFromError() {
    return { err: true };
  }
  render() {
    if (this.state.err) {
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
              <i className="fa-solid fa-cube text-blue-400 text-4xl" />
            </div>
            <p className="text-slate-500 text-sm">نموذج ثلاثي الأبعاد</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ── Single GLTF model renderer ──
   Preserves real textures from the GLTF.  Only applies the steel fallback
   to meshes that have NO texture maps and a white/grey default colour.       */
function HeroModel({ url, scale, posY }) {
  const { scene } = useGLTF(url);

  useMemo(() => {
    let idx = 0;
    scene.traverse((child) => {
      if (!child.isMesh) return;

      const mat = child.material;
      const hasTexture =
        mat?.map ||
        mat?.normalMap ||
        mat?.emissiveMap ||
        mat?.metalnessMap ||
        mat?.roughnessMap ||
        mat?.aoMap ||
        mat?.specularMap;

      if (!hasTexture) {
        const c = mat?.color;
        const isWhite =
          !c ||
          (Math.abs(c.r - 1) < 0.15 &&
            Math.abs(c.g - 1) < 0.15 &&
            Math.abs(c.b - 1) < 0.15);

        if (isWhite) {
          child.material = new THREE.MeshStandardMaterial({
            color: STEEL_COLORS[idx % STEEL_COLORS.length],
            metalness: 0.8,
            roughness: 0.2,
            envMapIntensity: 1.5,
          });
          idx++;
        }
      }

      child.castShadow = true;
      child.receiveShadow = true;
    });
  }, [scene]);

  return <primitive object={scene} scale={scale} position={[0, posY, 0]} />;
}

/* ── Hero 3-D canvas ── */
function HeroCanvas({ model }) {
  return (
    <>
      <ModelLoadingOverlay />
      <CanvasErrorBoundary>
        <Canvas
          camera={{ position: [0, 1.2, 3.5], fov: 38 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: "transparent" }}
        >
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 8, 5]} intensity={1.5} castShadow />
          <directionalLight
            position={[-4, 2, -4]}
            intensity={0.6}
            color="#6ab0ff"
          />
          <spotLight
            position={[0, 10, 0]}
            intensity={0.8}
            angle={0.4}
            penumbra={0.5}
          />

          <Suspense fallback={null}>
            <HeroModel url={model.url} scale={model.scale} posY={model.posY} />
            <Environment preset="warehouse" />
            <ContactShadows
              position={[0, -1.0, 0]}
              opacity={0.45}
              scale={10}
              blur={2.5}
              far={4}
            />
          </Suspense>

          <Grid
            position={[0, -1.02, 0]}
            args={[20, 20]}
            cellSize={0.6}
            cellThickness={0.5}
            cellColor="#1e3a5f"
            sectionSize={3}
            sectionThickness={1}
            sectionColor="#1e3a5f"
            fadeDistance={12}
            fadeStrength={1}
            followCamera={false}
            infiniteGrid
          />

          <OrbitControls
            autoRotate
            autoRotateSpeed={1.2}
            enablePan={false}
            minDistance={1.8}
            maxDistance={8}
            maxPolarAngle={Math.PI / 2}
          />
        </Canvas>
      </CanvasErrorBoundary>
    </>
  );
}

export default function HomePage() {
  const [modules, setModules] = useState([]);
  const [profile, setProfile] = useState(null);
  const [contact, setContact] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [contactStatus, setContactStatus] = useState(null);

  /* Use the model selected at module-evaluation time (changes on every page load) */
  const heroModel = HERO_MODEL_THIS_VISIT;

  useEffect(() => {
    api
      .get("/modules?limit=6&status=published")
      .then((r) => setModules(r.data.modules || []));
    api.get("/profile").then((r) => setProfile(r.data));
  }, []);

  const handleContact = async (e) => {
    e.preventDefault();
    try {
      await api.post("/contact", contact);
      setContactStatus("success");
      setContact({ name: "", email: "", subject: "", message: "" });
    } catch {
      setContactStatus("error");
    }
  };

  const categories = [
    { icon: "fa-cogs", label: "ميكانيكية", count: "1,230" },
    { icon: "fa-industry", label: "تصميم صناعي", count: "860" },
    { icon: "fa-car", label: "سيارات", count: "430" },
    { icon: "fa-robot", label: "روبوتات", count: "390" },
    { icon: "fa-plane", label: "فضاء", count: "210" },
    { icon: "fa-box", label: "منتجات", count: "180" },
  ];

  return (
    <div
      className="min-h-screen text-white font-arabic"
      style={{ background: "#0b0f1a" }}
      dir="rtl"
    >
      <Navbar />

      {/* ─────────────────── Hero ─────────────────── */}
      <section
        id="home"
        className="relative min-h-screen flex items-center overflow-hidden"
      >
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-0 top-0 w-1/2 h-full bg-gradient-to-r from-blue-900/10 via-transparent to-transparent" />
          <div className="absolute left-1/4 top-1/4 w-96 h-96 bg-blue-600/8 rounded-full blur-3xl" />
        </div>

        {/* dir="ltr" → explicit left-to-right positions regardless of page RTL.
            DOM order: Canvas first = LEFT on desktop / TOP on mobile
                       Text second  = RIGHT on desktop / BOTTOM on mobile          */}
        <div
          className="w-full flex flex-col lg:flex-row items-stretch min-h-screen"
          dir="ltr"
        >
          {/* ── 3D Canvas — LEFT on desktop / TOP on mobile ── */}
          <div className="relative flex-1 min-h-[60vh] lg:min-h-screen">
            <div className="absolute inset-0">
              <HeroCanvas model={heroModel} />
            </div>

            {/* Control buttons — left edge */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
              {[
                { icon: "fa-rotate", label: "تدوير" },
                { icon: "fa-magnifying-glass-plus", label: "تكبير" },
                { icon: "fa-up-down-left-right", label: "تحريك" },
                { icon: "fa-expand", label: "ملء" },
              ].map((c, i) => (
                <div
                  key={i}
                  dir="rtl"
                  className="w-12 h-12 bg-[#0f1520]/80 backdrop-blur border border-white/10 rounded-lg flex flex-col items-center justify-center gap-0.5 cursor-pointer hover:border-blue-500/60 transition-colors"
                >
                  <i className={`fa-solid ${c.icon} text-slate-400 text-xs`} />
                  <span className="text-[9px] text-slate-500">{c.label}</span>
                </div>
              ))}
            </div>

            {/* Drag to rotate hint */}
            <div
              className="absolute bottom-6 right-6 flex items-center gap-2 text-slate-500 text-xs z-10"
              dir="rtl"
            >
              <i className="fa-solid fa-hand-pointer text-slate-600" />
              <span>اسحب للتدوير</span>
            </div>

            {/* Slide dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all ${i === 0 ? "w-5 h-2 bg-blue-500" : "w-2 h-2 bg-slate-600"}`}
                />
              ))}
            </div>
          </div>

          {/* ── Text — RIGHT on desktop / BOTTOM on mobile ── */}
          <div
            className="flex-1 flex items-center z-10 px-8 lg:px-16 py-16 lg:py-0"
            dir="rtl"
          >
            <div className="max-w-xl w-full">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-1.5 text-sm text-blue-400 mb-6">
                <i className="fa-solid fa-circle-dot text-xs animate-pulse" />
                <span>ابتكار. دقة. تميز.</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                <span className="block">حوّل تصاميمك </span>
                <span className="text-blue-400">لواقع ثلاثية الأبعاد.</span>
              </h1>

              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                {profile?.bioAr ||
                  "معرض احترافي يستعرض تصاميمي وخبراتي في SolidWorks و Blender عبر نماذج تفاعلية متطورة ودراسات هندسية متكاملة."}
              </p>

              <div className="flex flex-wrap gap-4 mb-12">
                <a
                  href="#projects"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg shadow-blue-600/20"
                >
                  <span>استعراض المشاريع</span>
                  <i className="fa-solid fa-arrow-left" />
                </a>
                <a
                  href="#contact"
                  className="flex items-center gap-2 border border-slate-600 hover:border-blue-500 text-slate-300 hover:text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  <span>التواصل</span>
                  <i className="fa-solid fa-envelope" />
                </a>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 pt-6 border-t border-white/5">
                {[
                  {
                    icon: "fa-cube",
                    value: `+${modules.length || "0"}`,
                    label: "مشروع",
                  },
                  { icon: "fa-user-gear", value: "1", label: "مهندس" },
                  { icon: "fa-eye", value: "+2,450", label: "مشاهدة" },
                  { icon: "fa-heart", value: "+1,200", label: "إعجاب" },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <i
                        className={`fa-solid ${s.icon} text-blue-400 text-sm`}
                      />
                    </div>
                    <div>
                      <div className="text-lg font-bold leading-tight">
                        {s.value}
                      </div>
                      <div className="text-slate-500 text-xs">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────── Featured Projects ─────────────────── */}
      <section
        id="projects"
        className="py-20"
        style={{ background: "#0e1320" }}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold">المشاريع المميزة</h2>
              <p className="text-slate-400 mt-2">مشاريع مختارة بعناية</p>
            </div>
            <Link
              to="/projects"
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              <span>عرض الكل</span>
              <i className="fa-solid fa-arrow-left text-sm" />
            </Link>
          </div>

          {modules.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-slate-800/60 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                <i className="fa-solid fa-cube text-slate-500 text-3xl" />
              </div>
              <p className="text-slate-500 text-lg">
                لا توجد مشاريع منشورة حتى الآن
              </p>
              <p className="text-slate-600 text-sm mt-2">
                سيتم إضافة المشاريع قريباً
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((mod) => (
                <ProjectCard key={mod._id} module={mod} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────── About / Bio ─────────────────── */}
      <section id="about" className="py-20" style={{ background: "#0b0f1a" }}>
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20">
                <i className="fa-solid fa-user-gear text-blue-400 text-3xl" />
              </div>
              <h2 className="text-3xl font-bold mb-2">
                {profile?.fullNameAr || "أحمد الجاسم"}
              </h2>
              <p className="text-blue-400 font-medium mb-4">
                {profile?.professionAr || "مهندس ميكاترونكس"}
              </p>
              <p className="text-slate-400 leading-relaxed mb-6">
                {profile?.bioAr ||
                  "مهندس ميكاترونكس متخصص في تصميم الأجزاء الميكانيكية الصناعية باستخدام برامج الهندسة المتقدمة مثل SolidWorks وBlender. أقدم هنا أعمالي وإبداعاتي الهندسية بتقنية ثلاثية الأبعاد."}
              </p>
              <div className="flex flex-wrap gap-3">
                {profile?.linkedin && (
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 bg-[#111827] hover:bg-[#1a2235] px-4 py-2 rounded-lg border border-white/5 transition-colors text-sm"
                  >
                    <i className="fa-brands fa-linkedin text-blue-400" />
                    <span>LinkedIn</span>
                  </a>
                )}
                {profile?.whatsapp && (
                  <a
                    href={`https://wa.me/${profile.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 bg-[#111827] hover:bg-[#1a2235] px-4 py-2 rounded-lg border border-white/5 transition-colors text-sm"
                  >
                    <i className="fa-brands fa-whatsapp text-green-400" />
                    <span>واتساب</span>
                  </a>
                )}
                {profile?.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className="flex items-center gap-2 bg-[#111827] hover:bg-[#1a2235] px-4 py-2 rounded-lg border border-white/5 transition-colors text-sm"
                  >
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
                  { icon: "fa-drafting-compass", label: "SolidWorks" },
                  { icon: "fa-cube", label: "Blender 3D" },
                  { icon: "fa-microchip", label: "ميكاترونكس" },
                  { icon: "fa-gears", label: "التصميم الميكانيكي" },
                  { icon: "fa-industry", label: "الهندسة الصناعية" },
                  { icon: "fa-code", label: "برمجة CNC" },
                ].map((skill, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-[#111827] rounded-xl p-4 border border-white/5 hover:border-blue-500/30 transition-colors"
                  >
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

      {/* ─────────────────── Browse Categories ─────────────────── */}
      <section className="py-20" style={{ background: "#0e1320" }}>
        <div className="container mx-auto px-6">
          <div className="mb-10">
            <h2 className="text-3xl font-bold">تصفح الفئات</h2>
            <p className="text-slate-400 mt-2">
              استعرض المشاريع حسب المجال الهندسي
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-3 bg-[#111827] rounded-xl p-6 border border-white/5 hover:border-blue-500/30 hover:bg-[#162035] cursor-pointer transition-all group"
              >
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <i className={`fa-solid ${cat.icon} text-blue-400 text-lg`} />
                </div>
                <span className="font-semibold text-sm text-center">
                  {cat.label}
                </span>
                <span className="text-slate-500 text-xs">
                  {cat.count} مشروع
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────── Contact ─────────────────── */}
      <section id="contact" className="py-20" style={{ background: "#0b0f1a" }}>
        <div className="container mx-auto px-6 max-w-2xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">تواصل معي</h2>
            <p className="text-slate-400">
              لديك استفسار أو مشروع مشترك؟ أرسل لي رسالة
            </p>
          </div>
          <form
            onSubmit={handleContact}
            className="bg-[#111827] rounded-2xl p-8 border border-white/5 space-y-5"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  الاسم
                </label>
                <input
                  type="text"
                  value={contact.name}
                  onChange={(e) =>
                    setContact((p) => ({ ...p, name: e.target.value }))
                  }
                  required
                  className="w-full bg-[#0b0f1a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="اسمك الكامل"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={contact.email}
                  onChange={(e) =>
                    setContact((p) => ({ ...p, email: e.target.value }))
                  }
                  required
                  className="w-full bg-[#0b0f1a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="email@example.com"
                  dir="ltr"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                الموضوع
              </label>
              <input
                type="text"
                value={contact.subject}
                onChange={(e) =>
                  setContact((p) => ({ ...p, subject: e.target.value }))
                }
                className="w-full bg-[#0b0f1a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="موضوع الرسالة"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                الرسالة
              </label>
              <textarea
                value={contact.message}
                onChange={(e) =>
                  setContact((p) => ({ ...p, message: e.target.value }))
                }
                required
                rows={5}
                className="w-full bg-[#0b0f1a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                placeholder="اكتب رسالتك هنا..."
              />
            </div>
            {contactStatus === "success" && (
              <div className="flex items-center gap-2 text-green-400 bg-green-400/10 rounded-lg px-4 py-3">
                <i className="fa-solid fa-check-circle" />
                <span>تم إرسال رسالتك بنجاح!</span>
              </div>
            )}
            {contactStatus === "error" && (
              <div className="flex items-center gap-2 text-red-400 bg-red-400/10 rounded-lg px-4 py-3">
                <i className="fa-solid fa-circle-exclamation" />
                <span>حدث خطأ، يرجى المحاولة مرة أخرى</span>
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
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
