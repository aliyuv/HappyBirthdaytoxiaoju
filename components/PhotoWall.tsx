
import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { config } from '../config';

gsap.registerPlugin(ScrollTrigger);

const PhotoCard: React.FC<{ url: string; index: number }> = ({ url, index }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;

    gsap.to(cardRef.current, {
      rotateX,
      rotateY,
      duration: 0.5,
      ease: 'power3.out'
    });
  };

  const handlePointerLeave = () => {
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.8,
      ease: 'elastic.out(1, 0.3)'
    });
  };

  return (
    <div 
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`photo-item relative overflow-hidden rounded-2xl group cursor-pointer aspect-square ${index % 3 === 0 ? 'md:col-span-2 md:aspect-video' : ''}`}
      style={{ perspective: '1000px' }}
    >
      {/* 关键修复 2：处理图片加载错误。如果本地文件不存在，则显示渐变色占位块 */}
      {error ? (
        <div className="w-full h-full bg-gradient-to-br from-white/5 to-amber-500/10 flex items-center justify-center border border-white/5">
           <span className="text-white/10 text-[10px] tracking-widest uppercase">Photo Not Found</span>
        </div>
      ) : (
        <img 
          src={url} 
          alt="" 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          loading="lazy"
          onError={() => setError(true)}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
        <span className="text-white/80 text-sm font-light">Memory Moment</span>
      </div>
    </div>
  );
};

const PhotoWall: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const items = gsap.utils.toArray('.photo-item');
    gsap.fromTo(items, 
      { opacity: 0, y: 30, filter: 'blur(8px)' },
      {
        opacity: 1, y: 0, filter: 'blur(0px)',
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        }
      }
    );
  }, []);

  return (
    <section ref={containerRef} className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-cursive text-white/90 tracking-widest">岁月的倒影</h2>
          <p className="text-sm text-white/40 mt-2">Every pixel holds a memory</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {config.photoUrls.map((photo, i) => (
            <PhotoCard key={i} url={photo.url} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PhotoWall;
