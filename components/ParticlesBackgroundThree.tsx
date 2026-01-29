
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

class Meteor {
  line: THREE.Line;
  geometry: THREE.BufferGeometry;
  velocity: THREE.Vector3;
  life: number = 1.0;
  fadeSpeed: number;

  constructor(scene: THREE.Scene) {
    const points = [];
    // 流星初始位置（随机从上方某个区域生成）
    const startX = (Math.random() - 0.5) * 40;
    const startY = 10 + Math.random() * 5;
    const startZ = -5 - Math.random() * 10;
    
    points.push(new THREE.Vector3(startX, startY, startZ));
    points.push(new THREE.Vector3(startX + 0.5, startY + 0.5, startZ)); // 极短的初始线段

    this.geometry = new THREE.BufferGeometry().setFromPoints(points);
    const color = Math.random() > 0.85 ? 0xffccaa : 0xccddee;
    const material = new THREE.LineBasicMaterial({ 
      color: color, 
      transparent: true, 
      opacity: 0,
      blending: THREE.AdditiveBlending 
    });

    this.line = new THREE.Line(this.geometry, material);
    
    // 方向随机：左上->右下 或 右上->左下
    const dirX = Math.random() > 0.5 ? 1 : -1;
    this.velocity = new THREE.Vector3(dirX * 0.2, -0.25, 0);
    this.fadeSpeed = 0.015 + Math.random() * 0.02;

    scene.add(this.line);
  }

  update() {
    this.life -= this.fadeSpeed;
    const positions = this.geometry.attributes.position.array as Float32Array;

    // 移动头部
    positions[0] += this.velocity.x;
    positions[1] += this.velocity.y;
    positions[2] += this.velocity.z;

    // 尾部稍微滞后，形成拖尾感
    positions[3] += this.velocity.x * 0.8;
    positions[4] += this.velocity.y * 0.8;
    positions[5] += this.velocity.z * 0.8;

    this.geometry.attributes.position.needsUpdate = true;
    
    // 渐显渐隐
    const mat = this.line.material as THREE.LineBasicMaterial;
    if (this.life > 0.5) {
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.8, 0.1);
    } else {
      mat.opacity = Math.max(0, this.life * 1.6);
    }

    return this.life > 0;
  }

  destroy(scene: THREE.Scene) {
    scene.remove(this.line);
    this.geometry.dispose();
    (this.line.material as THREE.Material).dispose();
  }
}

const ParticlesBackgroundThree: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const meteors = useRef<Meteor[]>([]);
  const nextMeteorTime = useRef<number>(Date.now() + 5000);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Layer 1: Distant Stars
    const isMobile = window.innerWidth < 768;
    const starCount = isMobile ? 600 : 1500;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 30;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      starPos[i * 3 + 2] = (Math.random() - 1.0) * 15;
      
      const isAmber = Math.random() > 0.9;
      if (isAmber) {
        starColors[i * 3] = 1.0; starColors[i * 3 + 1] = 0.6; starColors[i * 3 + 2] = 0.2;
      } else {
        const val = 0.7 + Math.random() * 0.3;
        starColors[i * 3] = val * 0.8; starColors[i * 3 + 1] = val * 0.9; starColors[i * 3 + 2] = val;
      }
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({ size: 0.015, vertexColors: true, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Layer 2: Nebula Fog
    const createNebulaTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256; canvas.height = 256;
      const ctx = canvas.getContext('2d')!;
      const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      grad.addColorStop(0, 'rgba(60, 40, 120, 0.2)');
      grad.addColorStop(0.5, 'rgba(40, 20, 80, 0.05)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 256);
      return new THREE.CanvasTexture(canvas);
    };
    const nebulaTex = createNebulaTexture();
    const nebulaGroup = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const mat = new THREE.MeshBasicMaterial({ map: nebulaTex, transparent: true, opacity: 0.05, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false });
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), mat);
      plane.position.set((Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15, -8 - Math.random() * 5);
      plane.rotation.z = Math.random() * Math.PI;
      nebulaGroup.add(plane);
    }
    scene.add(nebulaGroup);

    camera.position.z = 5;

    const handlePointerMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('pointermove', handlePointerMove);

    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let frameId: number;
    const animate = (time: number) => {
      frameId = requestAnimationFrame(animate);
      const t = time * 0.0001;
      
      stars.rotation.y = t * 0.1;
      nebulaGroup.children.forEach((n, i) => {
        n.rotation.z += 0.0003 * (i + 1);
      });
      
      // 流星生成逻辑
      if (!isReduced && Date.now() > nextMeteorTime.current) {
        // 移动端降低频率，PC 端更高
        const minGap = isMobile ? 12000 : 6000;
        const maxGap = isMobile ? 20000 : 14000;
        
        // 同时最多 1 颗流星（移动端）或 2 颗（PC）
        if (meteors.current.length < (isMobile ? 1 : 2)) {
          meteors.current.push(new Meteor(scene));
        }
        nextMeteorTime.current = Date.now() + THREE.MathUtils.randFloat(minGap, maxGap);
      }

      // 更新流星
      meteors.current = meteors.current.filter(m => {
        const alive = m.update();
        if (!alive) m.destroy(scene);
        return alive;
      });

      // 视差相机
      camera.position.x += (mouse.current.x * 0.3 - camera.position.x) * 0.02;
      camera.position.y += (mouse.current.y * 0.3 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, -5);

      renderer.render(scene, camera);
    };

    if (!isReduced) animate(0);
    else renderer.render(scene, camera);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      cancelAnimationFrame(frameId);
      
      // 清理流星
      meteors.current.forEach(m => m.destroy(scene));
      
      scene.clear();
      renderer.dispose();
      starGeo.dispose(); starMat.dispose();
      nebulaTex.dispose();
      if (containerRef.current) containerRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none" />;
};

export default ParticlesBackgroundThree;
