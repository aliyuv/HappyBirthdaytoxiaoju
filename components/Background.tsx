
import React, { useEffect, useRef } from 'react';

const Background: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const stars: { x: number; y: number; size: number; alpha: number; speed: number }[] = [];
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const count = isReduced ? 20 : 80;

    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 1.2 + 0.3,
        alpha: Math.random() * 0.5 + 0.1,
        speed: Math.random() * 0.15 + 0.05
      });
    }

    let frameId: number;
    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      stars.forEach(s => {
        s.y -= s.speed;
        if (s.y < -10) s.y = h + 10;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      });
      frameId = requestAnimationFrame(animate);
    };
    
    if (!isReduced) animate();

    const handleResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <canvas ref={canvasRef} className="absolute inset-0 opacity-30" />
    </div>
  );
};

export default Background;
