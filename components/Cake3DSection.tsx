import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { config } from '../config';
import { fireConfetti, fireFireworks } from '../utils/helpers';

type CakeState = 'idle' | 'lit' | 'wish' | 'blown';

const Cake3DSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<CakeState>('idle');
  const [toast, setToast] = useState('');
  
  // 关键修复 1：使用 useRef 存储计时器 ID
  const toastTimerRef = useRef<number | null>(null);

  const showToast = (msg: string) => {
    // 每次显示前先清除旧的计时器，防止在移动端因积压导致不消失
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToast(msg);
    
    // 设置新的自动关闭计时器
    toastTimerRef.current = window.setTimeout(() => {
      setToast('');
      toastTimerRef.current = null;
    }, 3000); // 3秒自动关闭
  };

  const flamesRef = useRef<THREE.Group[]>([]);
  const glowsRef = useRef<THREE.Sprite[]>([]);
  const pointLightsRef = useRef<THREE.PointLight[]>([]);
  const candleMatsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    containerRef.current.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const cakeMat = new THREE.MeshStandardMaterial({ color: 0xfff0f5, roughness: 0.4 });
    const topTierMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });

    const bottomTier = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.8, 48), cakeMat);
    group.add(bottomTier);

    const topTier = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.7, 48), topTierMat);
    topTier.position.y = 0.75;
    group.add(topTier);

    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.08, 16, 48), new THREE.MeshStandardMaterial({ color: 0xfab6d6 }));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 1.1;
    group.add(ring);

    const createGlowTexture = (color: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 64; canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.3, color);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(canvas);
    };

    const flameTex = createGlowTexture('rgba(255, 180, 50, 0.8)');
    const glowTex = createGlowTexture('rgba(255, 120, 0, 0.4)');
    const candleCoords = [{ x: 0.3, z: 0.3 }, { x: -0.3, z: -0.3 }, { x: 0.4, z: -0.2 }];

    candleCoords.forEach((coord, i) => {
      const candleMat = new THREE.MeshStandardMaterial({ 
        color: i % 2 === 0 ? 0xff69b4 : 0xba55d3,
        emissive: new THREE.Color(0xff8c00),
        emissiveIntensity: 0
      });
      const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8), candleMat);
      candle.position.set(coord.x, 1.3, coord.z);
      group.add(candle);
      candleMatsRef.current.push(candleMat);

      const flameGroup = new THREE.Group();
      const flameSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending }));
      flameSprite.scale.set(0.2, 0.4, 1);
      flameSprite.position.y = 0.25;
      flameGroup.add(flameSprite);
      candle.add(flameGroup);
      flamesRef.current.push(flameGroup);

      const glowSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending }));
      glowSprite.scale.set(0.6, 0.6, 1);
      glowSprite.position.y = 0.25;
      candle.add(glowSprite);
      glowsRef.current.push(glowSprite);

      const pLight = new THREE.PointLight(0xffb25c, 0, 3);
      pLight.position.y = 0.4;
      candle.add(pLight);
      pointLightsRef.current.push(pLight);
    });

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    camera.position.set(0, 2.5, 5);
    camera.lookAt(0, 0.5, 0);

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      group.rotation.y += 0.003;
      group.position.y = Math.sin(Date.now() * 0.001) * 0.04;

      flamesRef.current.forEach((f, i) => {
        const sprite = f.children[0] as THREE.Sprite;
        if (sprite.material.opacity > 0) {
          const flicker = 1 + (Math.random() - 0.5) * 0.1;
          sprite.scale.y = 0.4 * flicker;
          sprite.scale.x = 0.2 * (1 / flicker);
          pointLightsRef.current[i].intensity *= flicker;
        }
      });
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      renderer.dispose();
      scene.clear();
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
      if (containerRef.current) containerRef.current.removeChild(renderer.domElement);
    };
  }, []);

  const handleCakeClick = () => {
    if (state === 'idle') {
      setState('lit');
      showToast("点亮星光 ✨");
      
      flamesRef.current.forEach((f, i) => {
        const sprite = f.children[0] as THREE.Sprite;
        const timeline = gsap.timeline({ delay: i * 0.18 });
        timeline.to(sprite.material, { opacity: 1, duration: 0.6 })
                .to(glowsRef.current[i].material, { opacity: 0.6, duration: 0.8 }, "<")
                .to(pointLightsRef.current[i], { intensity: 1.4, duration: 0.5 }, "<")
                .to(candleMatsRef.current[i], { emissiveIntensity: 1.2, duration: 0.5 }, "<");
      });

      setTimeout(() => {
        setState('wish');
        showToast("许个愿吧，小菊 :)");
      }, 1500);
    }
  };

  const blowOut = () => {
    if (state === 'wish') {
      setState('blown');
      showToast("愿望已送达 :)"); // 修改此处文案并使用 showToast
      
      flamesRef.current.forEach((f, i) => {
        const sprite = f.children[0] as THREE.Sprite;
        const timeline = gsap.timeline({ delay: (flamesRef.current.length - 1 - i) * 0.12 });
        timeline.to(sprite.material, { opacity: 0, duration: 0.3 })
                .to(glowsRef.current[i].material, { opacity: 0, duration: 0.4 }, "<")
                .to(pointLightsRef.current[i], { intensity: 0, duration: 0.3 }, "<")
                .to(candleMatsRef.current[i], { emissiveIntensity: 0, duration: 0.2 }, "<");
      });

      fireFireworks();
      setTimeout(() => fireConfetti(150, 70), 300);
    }
  };

  return (
    <section className="relative w-full py-14 flex flex-col items-center justify-center min-h-[60vh]">
      {/* 修正后的 Toast：支持点击即刻手动关闭，提升移动端交互感 */}
      <div 
        onClick={() => setToast('')}
        className={`fixed top-12 z-[100] px-6 py-2 rounded-full glass-panel border border-amber-500/30 text-white text-xs tracking-widest transition-all duration-700 cursor-pointer select-none active:scale-95 ${toast ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0'}`}
      >
        {toast}
      </div>

      <div className="max-w-md w-full glass-panel rounded-[3rem] p-6 flex flex-col items-center relative shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>
        <div className="text-center mb-4">
          <h2 className="text-lg font-cursive text-amber-200/60 tracking-[0.3em] uppercase">Ceremony</h2>
          <div className="w-8 h-px bg-white/10 mx-auto mt-2" />
        </div>
        <div ref={containerRef} className="w-full aspect-square cursor-pointer" onClick={handleCakeClick} />
        <div className="mt-6 w-full px-4">
          {state === 'idle' && (
            <button onClick={handleCakeClick} className="w-full py-3 rounded-2xl bg-amber-500 text-white font-bold tracking-[0.4em] text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all">
              {config.buttonText}
            </button>
          )}
          {state === 'wish' && (
            <button onMouseDown={blowOut} onTouchStart={blowOut} className="w-full py-3 rounded-2xl border border-amber-500/50 text-amber-500 font-bold tracking-[0.4em] text-xs animate-pulse active:scale-95 transition-all">
              🌬️ 吹灭蜡烛
            </button>
          )}
          {state === 'blown' && (
             <button onClick={() => { setState('idle'); }} className="w-full py-3 rounded-2xl bg-white/5 text-white/40 font-bold tracking-[0.4em] text-xs border border-white/5">
               再点亮一次
             </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default Cake3DSection;