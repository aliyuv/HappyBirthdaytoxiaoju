
import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { config } from '../config';

const Hero: React.FC = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [typedLine, setTypedLine] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!titleRef.current) return;
    
    const parts = config.mainTitle.split(' · ');
    titleRef.current.innerHTML = parts.map((part) => (
      `<div class="line overflow-hidden mb-2">
        ${part.split('').map(char => `<span class="char opacity-0 inline-block">${char}</span>`).join('')}
      </div>`
    )).join('');

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo(rootRef.current, { backdropFilter: 'blur(10px)' }, { backdropFilter: 'blur(0px)', duration: 1.2 });
      tl.fromTo('.char', 
        { opacity: 0, y: 30, filter: 'blur(10px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, stagger: 0.05, ease: 'expo.out' },
        "-=0.8"
      );
      tl.fromTo('.hero-subtitle', 
        { opacity: 0, y: 15, filter: 'blur(5px)' },
        { opacity: 0.8, y: 0, filter: 'blur(0px)', duration: 1, ease: 'power3.out' },
        "-=0.6"
      );
      tl.fromTo('.scroll-indicator', { opacity: 0 }, { opacity: 0.3, duration: 1, repeat: -1, yoyo: true }, "+=0.2");
    }, rootRef);

    let i = 0;
    const typeWriter = () => {
      if (i < config.optionalLine.length) {
        setTypedLine(prev => prev + config.optionalLine.charAt(i));
        i++;
        setTimeout(typeWriter, 80);
      }
    };
    const timer = setTimeout(typeWriter, 1500);

    return () => {
      ctx.revert();
      clearTimeout(timer);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((error) => {
            console.error("Playback failed:", error);
            showToast("浏览器限制自动播放，请再点一次");
          });
      }
    }
  };

  const handleAudioError = () => {
    showToast("音乐加载失败，请检查链接或网络");
    setIsPlaying(false);
  };

  return (
    <section ref={rootRef} className="relative h-screen flex flex-col items-center justify-center px-6 text-center select-none overflow-hidden">
      {/* Toast 提示区 */}
      <div className={`fixed top-24 right-8 z-[60] bg-amber-500 text-white text-[10px] px-3 py-1 rounded-full transition-all duration-500 ${toastMsg ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
        {toastMsg || "请点击开启音乐 ♪"}
      </div>

      <button 
        onClick={toggleMusic}
        className={`fixed top-8 right-8 z-50 w-12 h-12 flex items-center justify-center rounded-full glass-panel border border-amber-500/20 transition-all duration-700 ${isPlaying ? 'rotate-slow shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'opacity-60'}`}
      >
        <div className="relative">
          <span className={`text-lg ${isPlaying ? 'text-amber-500' : 'text-white/40'}`}>♪</span>
          {isPlaying && <span className="absolute -inset-1 rounded-full border border-amber-500 animate-ping opacity-30"></span>}
        </div>
        <audio 
          ref={audioRef} 
          src={config.bgmUrl} 
          loop 
          preload="metadata" 
          crossOrigin="anonymous" 
          onError={handleAudioError}
        />
      </button>

      <div className="z-10 max-w-2xl">
        <h1 ref={titleRef} className="text-4xl md:text-6xl font-bold font-cursive text-white mb-6 leading-tight tracking-tight text-glow"></h1>
        <p className="hero-subtitle text-sm md:text-lg text-white/80 tracking-[0.4em] font-light mb-12 uppercase">
          {config.subTitle}
        </p>
        <div className="h-6 text-sm md:text-base text-amber-200/40 italic font-cursive tracking-widest">
          {typedLine}<span className="animate-pulse ml-1 inline-block bg-amber-500 w-[1.5px] h-3"></span>
        </div>
      </div>

      <div className="scroll-indicator absolute bottom-12 flex flex-col items-center gap-2">
        <span className="text-[8px] text-white/20 tracking-[0.4em] uppercase">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-amber-500/50 to-transparent"></div>
      </div>

      <style>{`
        .rotate-slow { animation: rotate-s 12s linear infinite; }
        @keyframes rotate-s { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </section>
  );
};

export default Hero;
