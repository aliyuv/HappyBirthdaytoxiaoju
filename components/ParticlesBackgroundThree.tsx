
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
    const startX = (Math.random() - 0.5) * 40;
    const startY = 10 + Math.random() * 5;
    const startZ = -5 - Math.random() * 10;
    
    points.push(new THREE.Vector3(startX, startY, startZ));
    points.push(new THREE.Vector3(startX + 0.5, startY + 0.5, startZ));

    this.geometry = new THREE.BufferGeometry().setFromPoints(points);
    const color = Math.random() > 0.85 ? 0xffccaa : 0xccddee;
    const material = new THREE.LineBasicMaterial({ 
      color: color, 
      transparent: true, 
      opacity: 0,
      blending: THREE.AdditiveBlending 
    });

    this.line = new THREE.Line(this.geometry, material);
    const dirX = Math.random() > 0.5 ? 1 : -1;
    this.velocity = new THREE.Vector3(dirX * 0.2, -0.25, 0);
    this.fadeSpeed = 0.015 + Math.random() * 0.02;

    scene.add(this.line);
  }

  update() {
    this.life -= this.fadeSpeed;
    const positions = this.geometry.attributes.position.array as Float32Array;
    positions[0] += this.velocity.x;
    positions[1] += this.velocity.y;
    positions[2] += this.velocity.z;
    positions[3] += this.velocity.x * 0.8;
    positions[4] += this.velocity.y * 0.8;
    positions[5] += this.velocity.z * 0.8;
    this.geometry.attributes.position.needsUpdate = true;
    
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
  const gyro = useRef({ x: 0, y: 0 });
  const meteors = useRef<Meteor[]>([]);
  const nextMeteorTime = useRef<number>(Date.now() + 5000);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false }); // 移动端关闭抗锯齿提升性能
    
    const dpr = Math.min(window.devicePixelRatio, 2);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(dpr);
    containerRef.current.appendChild(renderer.domElement);

    const isMobile = window.innerWidth < 768;
    const starCount = isMobile ? 800 : 1500; // 适当增加移动端密度
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 40;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      starPos[i * 3 + 2] = (Math.random() - 1.0) * 20;
      
      const isAmber = Math.random() > 0.9;
      if (isAmber) {
        starColors[i * 3] = 1.0; starColors[i * 3 + 1] = 0.7; starColors[i * 3 + 2] = 0.3;
      } else {
        const val = 0.8 + Math.random() * 0.2;
        starColors[i * 3] = val * 0.8; starColors[i * 3 + 1] = val * 0.9; starColors[i * 3 + 2] = val;
      }
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    
    // 核心优化：根据 DPR 动态调整粒子大小，移动端稍微调大一点点
    const starSize = isMobile ? 0.04 * dpr : 0.015 * dpr;
    const starMat = new THREE.PointsMaterial({ 
      size: starSize, 
      vertexColors: true, 
      transparent: true, 
      opacity: 0.8, // 提高透明度，防止看不见
      blending: THREE.AdditiveBlending,
      depthWrite: false 
    });
    
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // 陀螺仪支持：让移动端有视差感
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta !== null && e.gamma !== null) {
        // 限制旋转角度，平滑输入
        gyro.current.x = THREE.MathUtils.clamp(e.gamma / 30, -1, 1);
        gyro.current.y = THREE.MathUtils.clamp((e.beta - 45) / 30, -1, 1);
      }
    };

    if (isMobile && typeof DeviceOrientationEvent !== 'undefined') {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    const nebulaGroup = new THREE.Group();
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
      
      // 即使开启了减弱动态效果，也保持极其微小的自动旋转，避免看起来像死机
      const rotationSpeed = isReduced ? 0.02 : 0.1;
      stars.rotation.y = t * rotationSpeed;
      
      if (!isReduced && Date.now() > nextMeteorTime.current) {
        const minGap = isMobile ? 8000 : 6000;
        const maxGap = isMobile ? 15000 : 14000;
        if (meteors.current.length < (isMobile ? 1 : 2)) {
          meteors.current.push(new Meteor(scene));
        }
        nextMeteorTime.current = Date.now() + THREE.MathUtils.randFloat(minGap, maxGap);
      }

      meteors.current = meteors.current.filter(m => {
        const alive = m.update();
        if (!alive) m.destroy(scene);
        return alive;
      });

      // 视差逻辑优化：融合鼠标与陀螺仪输入
      const targetX = isMobile ? gyro.current.x : mouse.current.x;
      const targetY = isMobile ? gyro.current.y : mouse.current.y;
      
      camera.position.x += (targetX * 0.5 - camera.position.x) * 0.05;
      camera.position.y += (targetY * 0.5 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, -10);

      renderer.render(scene, camera);
    };

    animate(0);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('deviceorientation', handleOrientation);
      cancelAnimationFrame(frameId);
      meteors.current.forEach(m => m.destroy(scene));
      scene.clear();
      renderer.dispose();
      starGeo.dispose(); starMat.dispose();
      if (containerRef.current) containerRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none bg-[#05060a]" />;
};

export default ParticlesBackgroundThree;
