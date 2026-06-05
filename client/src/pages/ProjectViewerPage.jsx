import React, { useEffect, useState, Suspense, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, useGLTF, Html, Center, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import api from '../utils/api.js';

function GLBModel({ url, displayMode, isPlaying }) {
  const { scene, animations } = useGLTF(url);
  const { actions, names } = useAnimations(animations, scene);

  useEffect(() => {
    if (!names.length) return;
    if (isPlaying) {
      names.forEach(name => actions[name]?.reset().play());
    } else {
      names.forEach(name => actions[name]?.paused === false && actions[name]?.stop());
    }
  }, [isPlaying, actions, names]);

  useEffect(() => {
    const originals = [];
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach(mat => {
          originals.push({ mat, wireframe: mat.wireframe, transparent: mat.transparent, opacity: mat.opacity, depthWrite: mat.depthWrite });
          if (displayMode === 'wireframe') {
            mat.wireframe = true;
            mat.transparent = false;
            mat.opacity = 1;
          } else if (displayMode === 'xray') {
            mat.wireframe = false;
            mat.transparent = true;
            mat.opacity = 0.18;
            mat.depthWrite = false;
          } else {
            mat.wireframe = false;
            mat.transparent = false;
            mat.opacity = 1;
            mat.depthWrite = true;
          }
          mat.needsUpdate = true;
        });
      }
    });
    return () => {
      originals.forEach(({ mat, wireframe, transparent, opacity, depthWrite }) => {
        mat.wireframe = wireframe;
        mat.transparent = transparent;
        mat.opacity = opacity;
        mat.depthWrite = depthWrite;
        mat.needsUpdate = true;
      });
    };
  }, [scene, displayMode]);

  return <Center><primitive object={scene} /></Center>;
}

function ModelViewer({ url, format, displayMode, isPlaying }) {
  if (!url) return null;
  if (format === 'glb' || format === 'gltf')
    return <GLBModel url={url} displayMode={displayMode} isPlaying={isPlaying} />;
  return (
    <Html center>
      <div className="text-center text-slate-400">
        <i className="fa-solid fa-cube text-4xl mb-2 block" />
        <p className="text-sm">صيغة {format?.toUpperCase()} غير مدعومة مباشرة في المتصفح</p>
        <p className="text-xs text-slate-500 mt-1">يتطلب تحويل إلى GLB</p>
      </div>
    </Html>
  );
}

function PlaceholderModel() {
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.5, 0.8, 2]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.6, 0.5, 0.3]}>
        <cylinderGeometry args={[0.2, 0.2, 0.6, 16]} />
        <meshStandardMaterial color="#1e40af" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[-0.6, 0.5, 0.3]}>
        <cylinderGeometry args={[0.2, 0.2, 0.6, 16]} />
        <meshStandardMaterial color="#1e40af" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[1.8, 0.2, 2.2]} />
        <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  );
}

function CameraController({ action, onActionDone, orbitRef }) {
  const { camera, scene, gl } = useThree();

  useEffect(() => {
    if (!action) return;

    if (action === 'reset') {
      camera.position.set(3, 2, 5);
      if (orbitRef.current) {
        orbitRef.current.target.set(0, 0, 0);
        orbitRef.current.update();
      }
    } else if (action === 'fit') {
      const box = new THREE.Box3();
      scene.traverse(obj => { if (obj.isMesh) box.expandByObject(obj); });
      if (!box.isEmpty()) {
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        const dist = (maxDim / 2) / Math.tan(fov / 2) * 1.6;
        camera.position.set(center.x, center.y + maxDim * 0.3, center.z + dist);
        if (orbitRef.current) {
          orbitRef.current.target.copy(center);
          orbitRef.current.update();
        }
      }
    } else if (action === 'screenshot') {
      gl.render(scene, camera);
      const link = document.createElement('a');
      link.download = 'model.png';
      link.href = gl.domElement.toDataURL('image/png');
      link.click();
    }

    onActionDone();
  }, [action]);

  return null;
}

function CameraRotTracker({ rotRef }) {
  const { camera } = useThree();
  useFrame(() => { rotRef.current.copy(camera.quaternion); });
  return null;
}

function AxisOverlay({ rotRef }) {
  const canvasRef = useRef();

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    const S = 90;
    cvs.width = S;
    cvs.height = S;
    const cx = S / 2, cy = S / 2;
    const LEN = 28;
    const HEAD = 7;
    const HEAD_ANGLE = 0.42;

    const AXES = [
      { dir: new THREE.Vector3(1, 0, 0), color: '#f04040', label: 'X' },
      { dir: new THREE.Vector3(0, 1, 0), color: '#30cc50', label: 'Y' },
      { dir: new THREE.Vector3(0, 0, 1), color: '#4488ff', label: 'Z' },
    ];

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, S, S);

      const q = rotRef.current;
      const projected = AXES.map(ax => {
        const v = ax.dir.clone().applyQuaternion(q);
        return { ...ax, sx: cx + v.x * LEN, sy: cy - v.y * LEN, depth: v.z };
      });

      // draw back axes first (dimmed), then front
      [...projected].sort((a, b) => a.depth - b.depth).forEach(({ sx, sy, color, label, depth }) => {
        const alpha = depth >= 0 ? 1.0 : 0.28;
        const angle = Math.atan2(sy - cy, sx - cx);

        ctx.globalAlpha = alpha;

        // shaft
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(sx, sy);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        ctx.stroke();

        // arrowhead (filled triangle)
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx - HEAD * Math.cos(angle - HEAD_ANGLE), sy - HEAD * Math.sin(angle - HEAD_ANGLE));
        ctx.lineTo(sx - HEAD * Math.cos(angle + HEAD_ANGLE), sy - HEAD * Math.sin(angle + HEAD_ANGLE));
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();

        // label
        const lx = sx + 11 * Math.cos(angle);
        const ly = sy + 11 * Math.sin(angle);
        ctx.font = 'bold 11px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = color;
        ctx.fillText(label, lx, ly);
      });

      // origin dot
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#cccccc';
      ctx.fill();

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [rotRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        bottom: '72px',
        left: '16px',
        width: '90px',
        height: '90px',
        pointerEvents: 'none',
      }}
    />
  );
}

const ENV_PRESETS = [
  { key: 'studio', icon: 'fa-lightbulb', label: 'استوديو' },
  { key: 'city', icon: 'fa-city', label: 'مدينة' },
  { key: 'forest', icon: 'fa-tree', label: 'غابة' },
  { key: 'night', icon: 'fa-moon', label: 'ليل' },
];

export default function ProjectViewerPage() {
  const { id } = useParams();
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('3d');
  const [displayMode, setDisplayMode] = useState('shaded');
  const [envPreset, setEnvPreset] = useState('studio');
  const [showGrid, setShowGrid] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cameraAction, setCameraAction] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const storedVote = localStorage.getItem(`vote_${id}`);
  const [liked, setLiked] = useState(storedVote === 'liked');
  const [disliked, setDisliked] = useState(storedVote === 'disliked');

  const orbitRef = useRef();
  const viewerRef = useRef();
  const axisRotRef = useRef(new THREE.Quaternion());

  useEffect(() => {
    api.get(`/modules/${id}`)
      .then(r => setModule(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const handleLike = async () => {
    if (liked || disliked) return;
    const r = await api.post(`/modules/${id}/like`);
    setModule(m => ({ ...m, likes: r.data.likes }));
    setLiked(true);
    localStorage.setItem(`vote_${id}`, 'liked');
  };

  const handleDislike = async () => {
    if (liked || disliked) return;
    const r = await api.post(`/modules/${id}/dislike`);
    setModule(m => ({ ...m, dislikes: r.data.dislikes }));
    setDisliked(true);
    localStorage.setItem(`vote_${id}`, 'disliked');
  };

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      viewerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  const fireAction = useCallback((action) => {
    setCameraAction(action);
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400">جاري تحميل المشروع...</p>
      </div>
    </div>
  );

  if (!module) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center">
        <i className="fa-solid fa-triangle-exclamation text-slate-600 text-5xl mb-4 block" />
        <p className="text-slate-400 text-lg">المشروع غير موجود</p>
        <Link to="/" className="mt-4 inline-flex items-center gap-2 text-blue-400 hover:text-blue-300">
          <i className="fa-solid fa-arrow-right" />
          <span>العودة للرئيسية</span>
        </Link>
      </div>
    </div>
  );

  const tabs = [
    { id: '3d', label: 'عرض ثلاثي الأبعاد' },
    { id: 'exploded', label: 'عرض مفكك' },
    { id: 'drawings', label: 'الرسومات الفنية' },
    { id: 'description', label: 'الوصف' },
  ];

  const bottomButtons = [
    {
      icon: 'fa-house',
      title: 'إعادة ضبط الكاميرا',
      action: () => fireAction('reset'),
    },
    {
      icon: isFullscreen ? 'fa-compress' : 'fa-expand',
      title: isFullscreen ? 'تصغير' : 'ملء الشاشة',
      action: toggleFullscreen,
    },
    {
      icon: 'fa-rotate',
      title: 'تدوير تلقائي',
      action: () => setAutoRotate(v => !v),
      active: autoRotate,
    },
    {
      icon: isPlaying ? 'fa-pause' : 'fa-play',
      title: isPlaying ? 'إيقاف الحركة' : 'تشغيل الحركة',
      action: () => setIsPlaying(v => !v),
      active: isPlaying,
    },
    {
      icon: 'fa-border-all',
      title: 'إظهار/إخفاء الشبكة',
      action: () => setShowGrid(v => !v),
      active: showGrid,
    },
    {
      icon: 'fa-camera',
      title: 'لقطة شاشة',
      action: () => fireAction('screenshot'),
    },
    {
      icon: 'fa-arrows-maximize',
      title: 'ضبط العرض للنموذج',
      action: () => fireAction('fit'),
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-arabic" dir="rtl">
      {/* Top bar */}
      <div className="bg-[#0f1117] border-b border-white/5 px-6 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 mb-0">
          <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center">
            <i className="fa-solid fa-cube text-white text-xs" />
          </div>
          <span className="font-bold">ميك بورتفوليو</span>
        </div>
        <i className="fa-solid fa-chevron-left text-slate-600 text-xs" />
        <Link to="/#projects" className="text-slate-400 hover:text-white text-sm transition-colors">المشاريع</Link>
        <i className="fa-solid fa-chevron-left text-slate-600 text-xs" />
        <span className="text-white text-sm">{module.titleAr}</span>
        <div className="mr-auto flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-user text-white text-xs" />
            </div>
            <span className="text-slate-300">{module.designer}</span>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-49px)]">
        {/* Left Sidebar */}
        <div className="w-44 bg-[#0f1117] border-l border-white/5 flex flex-col">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-4 py-3 text-slate-400 hover:text-white text-sm transition-colors border-b border-white/5"
          >
            <i className="fa-solid fa-arrow-right text-xs" />
            <span>رجوع</span>
          </button>

          <div className="mx-3 mt-3 aspect-square bg-[#151821] rounded-lg overflow-hidden border border-white/5">
            {module.thumbnailUrl ? (
              <img src={module.thumbnailUrl} alt={module.titleAr} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <i className="fa-solid fa-cube text-slate-600 text-2xl" />
              </div>
            )}
          </div>

          <div className="p-3 flex-1 overflow-y-auto">
            <h2 className="font-bold text-sm leading-tight mb-1">{module.titleAr}</h2>
            <p className="text-blue-400 text-xs mb-3">{module.category}</p>
            <p className="text-slate-400 text-xs leading-relaxed mb-4">{module.descriptionAr}</p>

            <div className="space-y-2">
              {module.softwareVersion && (
                <div className="flex items-center gap-2 text-xs">
                  <i className="fa-solid fa-laptop-code text-slate-500 w-3" />
                  <div>
                    <div className="text-slate-500">إصدار البرنامج</div>
                    <div className="font-medium">{module.softwareVersion}</div>
                  </div>
                </div>
              )}
              {module.partsCount && (
                <div className="flex items-center gap-2 text-xs">
                  <i className="fa-solid fa-puzzle-piece text-slate-500 w-3" />
                  <div>
                    <div className="text-slate-500">عدد القطع</div>
                    <div className="font-medium">{module.partsCount}</div>
                  </div>
                </div>
              )}
              {module.projectType && (
                <div className="flex items-center gap-2 text-xs">
                  <i className="fa-solid fa-tag text-slate-500 w-3" />
                  <div>
                    <div className="text-slate-500">نوع المشروع</div>
                    <div className="font-medium">{module.projectType}</div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs">
                <i className="fa-regular fa-calendar text-slate-500 w-3" />
                <div>
                  <div className="text-slate-500">تاريخ الرفع</div>
                  <div className="font-medium">{new Date(module.createdAt).toLocaleDateString('ar')}</div>
                </div>
              </div>
            </div>

            {module.sketches?.length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs text-slate-500 mb-2 font-semibold">عروض أخرى</h4>
                <div className="grid grid-cols-2 gap-1.5">
                  {module.sketches.slice(0, 4).map((sk, i) => (
                    <div key={i} className="aspect-square bg-[#151821] rounded border border-white/5 overflow-hidden cursor-pointer hover:border-blue-500/30">
                      <img src={sk} alt={`عرض ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Viewer */}
        <div className="flex-1 flex flex-col">
          {/* Tab Bar */}
          <div className="bg-[#0f1117] border-b border-white/5 flex items-center px-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-500 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === '3d' && (
            <div ref={viewerRef} className="flex-1 relative">
              <Canvas
                camera={{ position: [3, 2, 5], fov: 45 }}
                gl={{ antialias: true, preserveDrawingBuffer: true }}
                shadows
              >
                <color attach="background" args={['#0f1117']} />
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
                <directionalLight position={[-5, 5, -5]} intensity={0.3} />
                <pointLight position={[0, 5, 0]} intensity={0.8} color="#3b82f6" />

                <Suspense fallback={
                  <Html center>
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-slate-400 text-xs">جاري التحميل...</p>
                    </div>
                  </Html>
                }>
                  {module.modelFile ? (
                    <ModelViewer
                      url={module.modelFile}
                      format={module.modelFormat}
                      displayMode={displayMode}
                      isPlaying={isPlaying}
                    />
                  ) : (
                    <PlaceholderModel />
                  )}
                </Suspense>

                {showGrid && (
                  <Grid
                    infiniteGrid
                    cellSize={0.5}
                    cellThickness={0.5}
                    cellColor="#1e293b"
                    sectionSize={2}
                    sectionThickness={1}
                    sectionColor="#334155"
                    fadeDistance={20}
                    fadeStrength={1}
                  />
                )}

                <OrbitControls
                  ref={orbitRef}
                  enablePan={true}
                  enableZoom={true}
                  enableRotate={true}
                  minDistance={1}
                  maxDistance={20}
                  autoRotate={autoRotate}
                  autoRotateSpeed={2}
                />

                <Environment preset={envPreset} />

                <CameraController
                  action={cameraAction}
                  onActionDone={() => setCameraAction(null)}
                  orbitRef={orbitRef}
                />

                <CameraRotTracker rotRef={axisRotRef} />
              </Canvas>

              <AxisOverlay rotRef={axisRotRef} />

              {/* Controls hint */}
              <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm rounded-xl p-3 text-xs text-slate-300 border border-white/10">
                <div className="flex items-center gap-2 mb-1.5">
                  <i className="fa-solid fa-computer-mouse text-slate-400 w-3" />
                  <span className="font-semibold text-slate-200">ضوابط التحكم</span>
                </div>
                <div className="space-y-1 text-slate-400">
                  <div className="flex justify-between gap-4"><span>تدوير</span><span className="text-slate-500">اسحب</span></div>
                  <div className="flex justify-between gap-4"><span>تحريك</span><span className="text-slate-500">Shift + سحب</span></div>
                  <div className="flex justify-between gap-4"><span>تكبير</span><span className="text-slate-500">عجلة</span></div>
                </div>
              </div>

              {/* Bottom controls */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-xl p-2 border border-white/10">
                {bottomButtons.map((btn, i) => (
                  <button
                    key={i}
                    onClick={btn.action}
                    title={btn.title}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
                      btn.active
                        ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40'
                        : 'text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <i className={`fa-solid ${btn.icon} text-xs`} />
                  </button>
                ))}
              </div>

              {/* Like/Dislike */}
              <div className="absolute bottom-4 right-4 flex items-center gap-3">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${liked ? 'bg-blue-600 text-white' : 'bg-black/40 backdrop-blur-sm border border-white/10 text-slate-300 hover:text-white hover:border-blue-500/50'}`}
                >
                  <i className="fa-solid fa-thumbs-up" />
                  <span>{module.likes || 0}</span>
                </button>
                <button
                  onClick={handleDislike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${disliked ? 'bg-red-600 text-white' : 'bg-black/40 backdrop-blur-sm border border-white/10 text-slate-300 hover:text-white hover:border-red-500/50'}`}
                >
                  <i className="fa-solid fa-thumbs-down" />
                  <span>{module.dislikes || 0}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'drawings' && (
            <div className="flex-1 p-6 overflow-y-auto">
              {module.sketches?.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {module.sketches.map((sk, i) => (
                    <div key={i} className="bg-[#151821] rounded-xl border border-white/5 overflow-hidden">
                      <img src={sk} alt={`رسم فني ${i + 1}`} className="w-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-slate-500">
                    <i className="fa-solid fa-drafting-compass text-5xl mb-4 block" />
                    <p>لا توجد رسومات فنية</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'description' && (
            <div className="flex-1 p-8 overflow-y-auto max-w-3xl">
              <h2 className="text-2xl font-bold mb-4">{module.titleAr}</h2>
              <p className="text-blue-400 mb-6">{module.titleEn}</p>
              <div className="prose prose-invert">
                <p className="text-slate-300 leading-relaxed">{module.descriptionAr}</p>
                {module.descriptionEn && (
                  <div className="mt-6 pt-6 border-t border-white/5" dir="ltr">
                    <p className="text-slate-400 leading-relaxed">{module.descriptionEn}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'exploded' && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-slate-500">
                <i className="fa-solid fa-arrows-to-circle text-5xl mb-4 block" />
                <p className="text-lg font-medium">عرض مفكك</p>
                <p className="text-sm mt-1">هذه الميزة قادمة قريباً</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="w-52 bg-[#0f1117] border-r border-white/5 p-4 overflow-y-auto">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">وضع العرض</h3>
          <div className="space-y-2 mb-6">
            {[
              { value: 'shaded', label: 'معتم' },
              { value: 'wireframe', label: 'شبكي' },
              { value: 'xray', label: 'شفاف' },
            ].map(({ value, label }) => (
              <label key={value} className="flex items-center gap-2 cursor-pointer group" onClick={() => setDisplayMode(value)}>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${displayMode === value ? 'border-blue-500' : 'border-slate-600 group-hover:border-slate-400'}`}>
                  {displayMode === value && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                </div>
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>

          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">البيئة</h3>
          <div className="grid grid-cols-4 gap-1.5 mb-6">
            {ENV_PRESETS.map(({ key, icon, label }) => (
              <button
                key={key}
                onClick={() => setEnvPreset(key)}
                title={label}
                className={`aspect-square rounded-lg border flex flex-col items-center justify-center gap-1 transition-colors ${
                  envPreset === key
                    ? 'border-blue-500/70 bg-blue-600/20 text-blue-400'
                    : 'border-white/10 bg-[#151821] hover:border-blue-500/30 text-slate-500'
                }`}
              >
                <i className={`fa-solid ${icon} text-xs`} />
              </button>
            ))}
          </div>

          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">الرؤية</h3>
          <div className="space-y-2 mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <div className="w-4 h-4 rounded-full border-2 border-blue-500 flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
              </div>
              <span className="text-sm">كل القطع</span>
            </label>
          </div>

          {module.materials && (
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">المواد</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{module.materials}</p>
            </div>
          )}

          {module.modelFile && (
            <div className="mt-6">
              <a
                href={module.modelFile}
                download
                className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2.5 text-sm font-semibold transition-colors"
              >
                <i className="fa-solid fa-download" />
                <span>تحميل الملفات</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
