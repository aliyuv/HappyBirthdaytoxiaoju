
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { config } from '../config';
import { fireConfetti, fireFireworks } from '../utils/helpers';

type CakeState = 'idle' | 'lit' | 'wish' | 'blown';

const Cake3DSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasParentRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<CakeState>('idle');
  const [toast, setToast] = useState('');
  const toastTimerRef = useRef<number | null>(null);

  // 引用 Three.js 相关对象以便在交互中控制
  const flamesRef = useRef<THREE.Mesh[]>([]);
  const pointLightsRef = useRef<THREE.PointLight[]>([]);
  const candleMatsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  const showToast = (message: string) => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToast(message);
    toastTimerRef.current = window.setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    if (!canvasParentRef.current) return;

    // 基础场景设置
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    canvasParentRef.current.appendChild(renderer.domElement);

    // 蛋糕主体组
    const cakeGroup = new THREE.Group();
    scene.add(cakeGroup);

    // 材质定义
    const creamMat = new THREE.MeshStandardMaterial({ color: 0xfff0f5, roughness: 0.3, metalness: 0.1 });
    const strawberryMat = new THREE.MeshStandardMaterial({ color: 0xff4d4d, roughness: 0.5 });

    // 蛋糕层
    const bottom = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.25, 0.8, 64), creamMat);
    cakeGroup.add(bottom);

    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.7, 64), creamMat);
    top.position.y = 0.75;
    cakeGroup.add(top);

    // 装饰：小草莓
    for (let i = 0; i < 8; i++) {
      const berry = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), strawberryMat);
      const angle = (i / 8) * Math.PI * 2;
      berry.position.set(Math.cos(angle) * 0.7, 1.15, Math.sin(angle) * 0.7);
      cakeGroup.add(berry);
    }

    // 蜡烛与火焰配置
    const candlePos = [
      { x: 0.3, z: 0.3, color: 0xff69b4 },
      { x: -0.3, z: -0.3, color: 0xba55d3 },
      { x: 0.4, z: -0.2, color: 0x4ddbff }
    ];

    // 火焰纹理生成
    const createFlameTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64; canvas.height = 128;
      const ctx = canvas.getContext('2d')!;
      const grad = ctx.createRadialGradient(32, 96, 0, 32, 64, 64);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.2, '#ffcc00');
      grad.addColorStop(0.5, '#ff6600');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(32, 80, 20, 45, 0, 0, Math.PI * 2);
      ctx.fill();
      return new THREE.CanvasTexture(canvas);
    };
    const flameTex = createFlameTexture();

    candlePos.forEach((pos, i) => {
      // 蜡烛
      const cMat = new THREE.MeshStandardMaterial({ color: pos.color, emissive: pos.color, emissiveIntensity: 0 });
      const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 16), cMat);
      candle.position.set(pos.x, 1.3, pos.z);
      cakeGroup.add(candle);
      candleMatsRef.current.push(cMat);

      // 火焰（Mesh 代替 Sprite 方便变形控制）
      const fGeo = new THREE.PlaneGeometry(0.25, 0.5);
      const fMat = new THREE.MeshBasicMaterial({ map: flameTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
      const flame = new THREE.Mesh(fGeo, fMat);
      flame.position.y = 0.35;
      candle.add(flame);
      flamesRef.current.push(flame);

      // 点光源
      const light = new THREE.PointLight(0xffaa44, 0, 4);
      light.position.y = 0.4;
      candle.add(light);
      pointLightsRef.current.push(light);
    });

    // 灯光
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dLight.position.set(5, 10, 5);
    scene.add(dLight);

    camera.position.set(0, 2.8, 5.5);
    camera.lookAt(0, 0.5, 0);

    // 尺寸适配逻辑修复：使用 Observer
    const updateSize = () => {
      if (!canvasParentRef.current) return;
      const w = canvasParentRef.current.clientWidth;
      const h = canvasParentRef.current.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    const resizeObs = new ResizeObserver(updateSize);
    resizeObs.observe(canvasParentRef.current);
    updateSize();

    // 动画循环
    let frameId: number;
    const animate = (time: number) => {
      frameId = requestAnimationFrame(animate);
      cakeGroup.rotation.y += 0.004;
      cakeGroup.position.y = Math.sin(time * 0.0015) * 0.05;

      flamesRef.current.forEach((f, i) => {
        // Fix: Cast material to MeshBasicMaterial to access opacity property
        const fMat = f.material as THREE.MeshBasicMaterial;
        if (fMat.opacity > 0) {
          // 火焰动态形变与闪烁
          const flicker = 1 + Math.sin(time * 0.01 + i) * 0.1;
          f.scale.set(flicker, 1 + Math.cos(time * 0.015) * 0.1, 1);
          f.rotation.y = -cakeGroup.rotation.y; // 始终面向摄像机
          pointLightsRef.current[i].intensity = 1.5 * flicker;
        }
      });
      renderer.render(scene, camera);
    };
    animate(0);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObs.disconnect();
      renderer.dispose();
      scene.clear();
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  const handleInteraction = () => {
    if (state === 'idle') {
      setState('lit');
      showToast("火苗正在点亮... ✨");
      
      flamesRef.current.forEach((f, i) => {
        const tl = gsap.timeline({ delay: i * 0.2 });
        // Fix: Cast material to MeshBasicMaterial to access opacity property
        const fMat = f.material as THREE.MeshBasicMaterial;
        tl.to(fMat, { opacity: 1, duration: 0.8 })
          .to(candleMatsRef.current[i], { emissiveIntensity: 1, duration: 0.5 }, "<")
          .to(pointLightsRef.current[i], { intensity: 1.5, duration: 0.5 }, "<");
      });

      setTimeout(() => {
        setState('wish');
        showToast("许个愿吧，小菊 :)");
      }, 1800);
    }
  };

  const handleBlow = () => {
    if (state === 'wish') {
      setState('blown');
      showToast("愿望已送达！🎉");
      
      flamesRef.current.forEach((f, i) => {
        // Fix: Cast material to MeshBasicMaterial to access opacity property
        const fMat = f.material as THREE.MeshBasicMaterial;
        gsap.to(fMat, { opacity: 0, duration: 0.3, delay: i * 0.1 });
        gsap.to(candleMatsRef.current[i], { emissiveIntensity: 0, duration: 0.3, delay: i * 0.1 });
        gsap.to(pointLightsRef.current[i], { intensity: 0, duration: 0.3, delay: i * 0.1 });
      });

      fireFireworks();
      setTimeout(() => fireConfetti(160, 80), 300);
    }
  };

  return (
    <section ref={containerRef} className="relative w-full py-16 px-4 flex flex-col items-center">
      {/* Toast */}
      <div 
        onClick={() => setToast('')}
        className={`fixed top-12 left-1/2 -translate-x-1/2 z-[100] px-6 py-2 rounded-full glass-panel border border-amber-500/30 text-white text-xs tracking-[0.2em] transition-all duration-700 cursor-pointer ${toast ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0'}`}
      >
        {toast}
      </div>

      <div className="w-full max-w-sm glass-panel rounded-[3rem] p-8 relative overflow-hidden flex flex-col items-center shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
        
        <div className="text-center mb-6">
          <h3 className="text-xl font-cursive text-amber-200/80 tracking-widest">Birthday Ceremony</h3>
          <div className="w-8 h-px bg-white/10 mx-auto mt-2" />
        </div>

        {/* 关键：设置明确的高度防止移动端坍塌 */}
        <div 
          ref={canvasParentRef} 
          className="w-full h-[320px] md:h-[400px] cursor-pointer" 
          onClick={handleInteraction}
        />

        <div className="w-full mt-8 space-y-4">
          {state === 'idle' && (
            <button 
              onClick={handleInteraction}
              className="w-full py-4 rounded-2xl bg-amber-500 text-white font-bold tracking-[0.4em] text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              {config.buttonText}
            </button>
          )}
          
          {state === 'wish' && (
            <button 
              onMouseDown={handleBlow}
              onTouchStart={handleBlow}
              className="w-full py-4 rounded-2xl border border-amber-500/50 text-amber-500 font-bold tracking-[0.4em] text-xs animate-pulse active:scale-95 transition-all"
            >
              🌬️ 吹灭蜡烛
            </button>
          )}

          {state === 'blown' && (
            <button 
              onClick={() => setState('idle')}
              className="w-full py-4 rounded-2xl bg-white/5 text-white/40 font-bold tracking-[0.4em] text-xs border border-white/5"
            >
              再许一个愿
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default Cake3DSection;
