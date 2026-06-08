import React, { useEffect, useState, Suspense, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, useGLTF, Html, useAnimations, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import api from '../utils/api.js';

function GLBModel({ url, displayMode, isPlaying, orbitRef, fittedCamRef, onLoad }) {
  const { scene, animations } = useGLTF(url);
  const { actions, names } = useAnimations(animations, scene);
  const { camera } = useThree();

  useEffect(() => {
    // Reset scene transform so bounding box reflects true model geometry
    scene.position.set(0, 0, 0);
    scene.rotation.set(0, 0, 0);
    scene.scale.set(1, 1, 1);

    const box = new THREE.Box3().setFromObject(scene);
    if (box.isEmpty()) { onLoad?.(); return; }

    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Ground: center on X/Z, bottom sits on Y=0
    scene.position.set(-center.x, -box.min.y, -center.z);

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    const dist = (maxDim / 2) / Math.tan(fov / 2) * 1.8;

    // Look at a point 1/3 up the model height
    const targetY = size.y * 0.33;

    // Camera sits in front at a natural diagonal angle
    const camPos = new THREE.Vector3(dist * 0.65, size.y * 0.45 + dist * 0.25, dist);

    camera.position.copy(camPos);
    camera.near = maxDim * 0.001;
    camera.far = maxDim * 200;
    camera.updateProjectionMatrix();

    if (orbitRef?.current) {
      orbitRef.current.target.set(0, targetY, 0);
      orbitRef.current.minDistance = maxDim * 0.05;
      orbitRef.current.maxDistance = maxDim * 30;
      orbitRef.current.update();
    }

    // Store fitted state so reset button can restore this exact view
    if (fittedCamRef) {
      fittedCamRef.current = {
        camPos: camPos.clone(),
        target: new THREE.Vector3(0, targetY, 0),
        minDist: maxDim * 0.05,
        maxDist: maxDim * 30,
      };
    }

    onLoad?.();
  }, [scene]);

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

  return <primitive object={scene} />;
}

function ViewerLoadingOverlay({ progress, visible }) {
  if (!visible) return null;
  return (
    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
      <div className="flex flex-col items-center gap-5 bg-[#0d1119]/85 border border-white/10 backdrop-blur-md rounded-2xl px-10 py-8 shadow-2xl">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
          <div className="absolute inset-2 rounded-full border border-blue-400/30 border-t-blue-400 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <i className="fa-solid fa-cube text-blue-400 text-sm" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 w-full">
          <span className="text-white text-sm font-semibold tracking-wide">جاري التحميل...</span>
          <div className="w-44 h-1.5 bg-slate-700/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-200 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-blue-400 text-xs tabular-nums font-medium">{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
}

function ModelViewer({ url, format, displayMode, isPlaying, orbitRef, fittedCamRef, onLoad }) {
  if (!url) return null;
  if (format === 'glb' || format === 'gltf')
    return <GLBModel url={url} displayMode={displayMode} isPlaying={isPlaying} orbitRef={orbitRef} fittedCamRef={fittedCamRef} onLoad={onLoad} />;
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

class ModelErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {
    this.props.onError?.();
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
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

function CameraController({ action, onActionDone, orbitRef, fittedCamRef }) {
  const { camera, scene, gl } = useThree();

  useEffect(() => {
    if (!action) return;

    const applyFitted = () => {
      if (!fittedCamRef?.current) return false;
      const { camPos, target, minDist, maxDist } = fittedCamRef.current;
      camera.position.copy(camPos);
      if (orbitRef.current) {
        orbitRef.current.target.copy(target);
        orbitRef.current.minDistance = minDist;
        orbitRef.current.maxDistance = maxDist;
        orbitRef.current.update();
      }
      return true;
    };

    if (action === 'reset') {
      if (!applyFitted()) {
        camera.position.set(3, 2, 5);
        if (orbitRef.current) { orbitRef.current.target.set(0, 0, 0); orbitRef.current.update(); }
      }
    } else if (action === 'fit') {
      applyFitted();
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
  useFrame(() => { rotRef.current.copy(camera.matrixWorldInverse); });
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

      const mat = rotRef.current;
      const projected = AXES.map(ax => {
        const v = ax.dir.clone().transformDirection(mat);
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
  const [showMobileSettings, setShowMobileSettings] = useState(false);
  const [showMobileInfo, setShowMobileInfo] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelProgress, setModelProgress] = useState(0);
  const [modelError, setModelError] = useState(false);

  const orbitRef = useRef();
  const viewerRef = useRef();
  const axisRotRef = useRef(new THREE.Matrix4());
  const fittedCamRef = useRef(null);

  useEffect(() => {
    api.get(`/modules/${id}`)
      .then(r => {
        setModule(r.data);
        const stored = localStorage.getItem(`vote_${id}`);
        if (stored) {
          setLiked(stored === 'liked');
          setDisliked(stored === 'disliked');
        } else {
          setLiked(r.data.userVote === 'liked');
          setDisliked(r.data.userVote === 'disliked');
          if (r.data.userVote) localStorage.setItem(`vote_${id}`, r.data.userVote);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  // Reset loading state when module changes
  useEffect(() => {
    if (!module) return;
    setModelLoaded(false);
    setModelProgress(0);
    setModelError(false);
  }, [module?._id]);

  // Simulate smooth progress while model is loading (GLB fetch has no byte events)
  useEffect(() => {
    if (modelLoaded) return;
    const tick = setInterval(() => {
      setModelProgress(p => {
        if (p >= 90) { clearInterval(tick); return p; }
        return p + (90 - p) * 0.07;
      });
    }, 80);
    return () => clearInterval(tick);
  }, [modelLoaded, module?._id]);

  const handleModelLoad = useCallback(() => {
    setModelProgress(100);
    setTimeout(() => setModelLoaded(true), 350);
  }, []);

  // Sync isFullscreen state with the browser's native fullscreen events
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const handleLike = async () => {
    const r = await api.post(`/modules/${id}/like`);
    setModule(m => ({ ...m, likes: r.data.likes, dislikes: r.data.dislikes }));
    setLiked(r.data.userVote === 'liked');
    setDisliked(r.data.userVote === 'disliked');
    if (r.data.userVote) localStorage.setItem(`vote_${id}`, r.data.userVote);
    else localStorage.removeItem(`vote_${id}`);
  };

  const handleDislike = async () => {
    const r = await api.post(`/modules/${id}/dislike`);
    setModule(m => ({ ...m, likes: r.data.likes, dislikes: r.data.dislikes }));
    setLiked(r.data.userVote === 'liked');
    setDisliked(r.data.userVote === 'disliked');
    if (r.data.userVote) localStorage.setItem(`vote_${id}`, r.data.userVote);
    else localStorage.removeItem(`vote_${id}`);
  };

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      viewerRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
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
    <div className="h-[100dvh] bg-[#0a0a0f] text-white font-arabic flex flex-col overflow-hidden" dir="rtl">

      {/* ── Top Bar ── */}
      <div className="bg-[#0f1117] border-b border-white/5 px-3 md:px-6 h-12 flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => window.history.back()}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-400 hover:text-white flex-shrink-0 transition-colors"
        >
          <i className="fa-solid fa-arrow-right text-xs" />
        </button>

        {/* Brand + breadcrumbs — desktop */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
            <i className="fa-solid fa-cube text-white text-[10px]" />
          </div>
          <span className="font-bold text-sm">ميك بورتفوليو</span>
        </div>
        <i className="hidden md:block fa-solid fa-chevron-left text-slate-600 text-xs" />
        <Link to="/#projects" className="hidden md:block text-slate-400 hover:text-white text-sm transition-colors flex-shrink-0">المشاريع</Link>
        <i className="hidden md:block fa-solid fa-chevron-left text-slate-600 text-xs" />

        {/* Project title */}
        <span className="text-white text-sm font-semibold flex-1 truncate">{module.titleAr}</span>

        {/* Designer — desktop */}
        <div className="hidden md:flex items-center gap-2 text-sm flex-shrink-0">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
            <i className="fa-solid fa-user text-white text-[10px]" />
          </div>
          <span className="text-slate-300 text-xs">{module.designer}</span>
        </div>

        {/* Settings toggle — mobile / tablet */}
        <button
          onClick={() => setShowMobileSettings(v => !v)}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/5 flex-shrink-0 transition-colors"
        >
          <i className="fa-solid fa-sliders text-sm" />
        </button>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">

        {/* Left Sidebar — desktop only */}
        <aside className="hidden lg:flex w-44 flex-col bg-[#0f1117] border-l border-white/5 flex-shrink-0 overflow-y-auto">
          <div className="mx-3 mt-3 aspect-square bg-[#151821] rounded-lg overflow-hidden border border-white/5 flex-shrink-0">
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
        </aside>

        {/* Center column */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto lg:overflow-hidden">

          {/* Tab bar */}
          <div className="bg-[#0f1117] border-b border-white/5 flex items-center overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: 'none' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 md:px-5 py-3 text-xs md:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors flex-shrink-0 ${
                  activeTab === tab.id ? 'border-blue-500 text-white' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 3D Viewer */}
          {activeTab === '3d' && (
            <div ref={viewerRef} className="flex-1 relative min-h-[55vh] lg:min-h-0">
              <ViewerLoadingOverlay progress={modelProgress} visible={!modelLoaded && !modelError} />

              {modelError && (
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                  <div className="flex flex-col items-center gap-4 bg-[#0d1119]/85 border border-red-500/20 backdrop-blur-md rounded-2xl px-10 py-8 shadow-2xl" dir="rtl">
                    <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                      <i className="fa-solid fa-file-slash text-red-400 text-xl" />
                    </div>
                    <div className="flex flex-col items-center gap-1.5 text-center">
                      <span className="text-white text-sm font-semibold">ملف النموذج غير متوفر</span>
                      <span className="text-slate-500 text-xs leading-relaxed">
                        لم يتم العثور على ملف النموذج ثلاثي الأبعاد
                        <br />
                        يرجى التواصل مع المسؤول
                      </span>
                    </div>
                  </div>
                </div>
              )}

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

                <ModelErrorBoundary onError={() => { handleModelLoad(); setModelError(true); }}>
                  <Suspense fallback={null}>
                    {module.modelFile ? (
                      <ModelViewer
                        url={module.modelFile}
                        format={module.modelFormat}
                        displayMode={displayMode}
                        isPlaying={isPlaying}
                        orbitRef={orbitRef}
                        fittedCamRef={fittedCamRef}
                        onLoad={handleModelLoad}
                      />
                    ) : (
                      <PlaceholderModel />
                    )}
                  </Suspense>
                </ModelErrorBoundary>

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
                  fittedCamRef={fittedCamRef}
                />

                <CameraRotTracker rotRef={axisRotRef} />
              </Canvas>

              <AxisOverlay rotRef={axisRotRef} />

              {/* Controls hint — desktop only */}
              <div className="hidden md:block absolute top-4 right-4 bg-black/40 backdrop-blur-sm rounded-xl p-3 text-xs text-slate-300 border border-white/10">
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
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-xl p-1.5 border border-white/10">
                {bottomButtons.map((btn, i) => (
                  <button
                    key={i}
                    onClick={btn.action}
                    title={btn.title}
                    className={`w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-lg transition-colors ${
                      btn.active
                        ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40'
                        : 'text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <i className={`fa-solid ${btn.icon} text-xs`} />
                  </button>
                ))}
              </div>

              {/* Like / Dislike — pill style, vertical on mobile/tablet */}
              <div className="lg:hidden absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    liked ? 'bg-blue-600 text-white' : 'bg-black/40 backdrop-blur-sm border border-white/10 text-slate-300 hover:text-white hover:border-blue-500/50'
                  }`}
                >
                  <i className="fa-solid fa-thumbs-up" />
                  <span>{module.likes || 0}</span>
                </button>
                <button
                  onClick={handleDislike}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    disliked ? 'bg-red-600 text-white' : 'bg-black/40 backdrop-blur-sm border border-white/10 text-slate-300 hover:text-white hover:border-red-500/50'
                  }`}
                >
                  <i className="fa-solid fa-thumbs-down" />
                  <span>{module.dislikes || 0}</span>
                </button>
              </div>

              {/* Like / Dislike — horizontal on desktop */}
              <div className="hidden lg:flex absolute bottom-4 right-4 items-center gap-2">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${liked ? 'bg-blue-600 text-white' : 'bg-black/40 backdrop-blur-sm border border-white/10 text-slate-300 hover:text-white hover:border-blue-500/50'}`}
                >
                  <i className="fa-solid fa-thumbs-up" />
                  <span>{module.likes || 0}</span>
                </button>
                <button
                  onClick={handleDislike}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${disliked ? 'bg-red-600 text-white' : 'bg-black/40 backdrop-blur-sm border border-white/10 text-slate-300 hover:text-white hover:border-red-500/50'}`}
                >
                  <i className="fa-solid fa-thumbs-down" />
                  <span>{module.dislikes || 0}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'drawings' && (
            <div className="flex-1 p-4 md:p-6 overflow-y-auto">
              {module.sketches?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {module.sketches.map((sk, i) => (
                    <div key={i} className="bg-[#151821] rounded-xl border border-white/5 overflow-hidden">
                      <img src={sk} alt={`رسم فني ${i + 1}`} className="w-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[200px]">
                  <div className="text-center text-slate-500">
                    <i className="fa-solid fa-drafting-compass text-5xl mb-4 block" />
                    <p>لا توجد رسومات فنية</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'description' && (
            <div className="flex-1 p-5 md:p-8 overflow-y-auto">
              <div className="max-w-3xl">
                <h2 className="text-xl md:text-2xl font-bold mb-4">{module.titleAr}</h2>
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
            </div>
          )}

          {activeTab === 'exploded' && (
            <div className="flex-1 flex items-center justify-center min-h-[200px]">
              <div className="text-center text-slate-500">
                <i className="fa-solid fa-arrows-to-circle text-5xl mb-4 block" />
                <p className="text-lg font-medium">عرض مفكك</p>
                <p className="text-sm mt-1">هذه الميزة قادمة قريباً</p>
              </div>
            </div>
          )}

          {/* Project info accordion — mobile / tablet only */}
          <div className="lg:hidden border-t border-white/5 bg-[#0f1117] flex-shrink-0">
            <button
              onClick={() => setShowMobileInfo(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm text-slate-300 hover:text-white transition-colors"
            >
              <span className="font-semibold">معلومات المشروع</span>
              <i className={`fa-solid fa-chevron-${showMobileInfo ? 'up' : 'down'} text-xs text-slate-500`} />
            </button>
            {showMobileInfo && (
              <div className="px-4 pb-5 space-y-3">
                {module.thumbnailUrl && (
                  <div className="w-20 h-20 bg-[#151821] rounded-lg overflow-hidden border border-white/5">
                    <img src={module.thumbnailUrl} alt={module.titleAr} className="w-full h-full object-cover" />
                  </div>
                )}
                <div>
                  <h2 className="font-bold text-sm">{module.titleAr}</h2>
                  <p className="text-blue-400 text-xs mt-0.5">{module.category}</p>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">{module.descriptionAr}</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {module.softwareVersion && (
                    <div>
                      <div className="text-slate-500">إصدار البرنامج</div>
                      <div className="font-medium mt-0.5">{module.softwareVersion}</div>
                    </div>
                  )}
                  {module.partsCount && (
                    <div>
                      <div className="text-slate-500">عدد القطع</div>
                      <div className="font-medium mt-0.5">{module.partsCount}</div>
                    </div>
                  )}
                  {module.projectType && (
                    <div>
                      <div className="text-slate-500">نوع المشروع</div>
                      <div className="font-medium mt-0.5">{module.projectType}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-slate-500">تاريخ الرفع</div>
                    <div className="font-medium mt-0.5">{new Date(module.createdAt).toLocaleDateString('ar')}</div>
                  </div>
                </div>
                {module.sketches?.length > 0 && (
                  <div>
                    <h4 className="text-xs text-slate-500 mb-2 font-semibold">عروض أخرى</h4>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {module.sketches.slice(0, 6).map((sk, i) => (
                        <div key={i} className="w-16 h-16 flex-shrink-0 bg-[#151821] rounded border border-white/5 overflow-hidden">
                          <img src={sk} alt={`عرض ${i + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Right Panel — desktop only */}
        <aside className="hidden lg:block w-52 bg-[#0f1117] border-r border-white/5 p-4 overflow-y-auto flex-shrink-0">
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
        </aside>

      </div>

      {/* ── Mobile / Tablet — Settings Bottom Sheet ── */}
      {showMobileSettings && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
          onClick={() => setShowMobileSettings(false)}
        >
          <div
            className="bg-[#0f1117] rounded-t-2xl border-t border-white/10 max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/5">
              <span className="font-semibold text-sm">إعدادات العرض</span>
              <button
                onClick={() => setShowMobileSettings(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <i className="fa-solid fa-xmark text-xs" />
              </button>
            </div>

            <div className="p-5 space-y-6">
              {/* Display mode */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">وضع العرض</h3>
                <div className="flex gap-2">
                  {[
                    { value: 'shaded', label: 'معتم' },
                    { value: 'wireframe', label: 'شبكي' },
                    { value: 'xray', label: 'شفاف' },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setDisplayMode(value)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                        displayMode === value
                          ? 'bg-blue-600/20 border-blue-500/70 text-blue-400'
                          : 'bg-[#151821] border-white/10 text-slate-400 hover:border-blue-500/30'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Environment */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">البيئة</h3>
                <div className="grid grid-cols-4 gap-2">
                  {ENV_PRESETS.map(({ key, icon, label }) => (
                    <button
                      key={key}
                      onClick={() => setEnvPreset(key)}
                      title={label}
                      className={`aspect-square rounded-xl border flex flex-col items-center justify-center gap-1 transition-colors ${
                        envPreset === key
                          ? 'border-blue-500/70 bg-blue-600/20 text-blue-400'
                          : 'border-white/10 bg-[#151821] hover:border-blue-500/30 text-slate-500'
                      }`}
                    >
                      <i className={`fa-solid ${icon} text-sm`} />
                      <span className="text-[9px]">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Download */}
              {module.modelFile && (
                <a
                  href={module.modelFile}
                  download
                  onClick={() => setShowMobileSettings(false)}
                  className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 text-sm font-semibold transition-colors"
                >
                  <i className="fa-solid fa-download" />
                  <span>تحميل الملفات</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
