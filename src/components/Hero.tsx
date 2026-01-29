
import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { config } from '../config';
import { showToast } from '../utils/toast';
import AudioDebugPanel from './AudioDebugPanel';

type AudioStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

const Hero: React.FC = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [status, setStatus] = useState<AudioStatus>('idle');
  const [typedLine, setTypedLine] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString().split(' ')[0];
    setLogs(prev => [`${time} - ${msg}`, ...prev].slice(0, 50));
  };

  useEffect(() => {
    if (!titleRef.current) return;
    
    // Title animation logic
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

    // Audio Event Listeners
    const audio = audioRef.current;
    if (audio) {
      const events = [
        'loadstart', 'loadedmetadata', 'canplay', 'canplaythrough', 
        'playing', 'pause', 'ended', 'stalled', 'waiting', 'error'
      ];
      events.forEach(evt => {
        audio.addEventListener(evt, () => {
          addLog(`Event: ${evt}`);
          if (evt === 'playing') setStatus('playing');
          if (evt === 'pause') setStatus('paused');
          if (evt === 'error') {
            setStatus('error');
            const err = audio.error;
            addLog(`Audio Error: Code ${err?.code}, Message: ${err?.message}`);
          }
        });
      });
    }

    return () => {
      ctx.revert();
      clearTimeout(timer);
      if (audio) {
        audio.pause();
      }
    };
  }, []);

  const preCheckUrl = async (url: string) => {
    addLog(`Pre-checking URL: ${url}`);
    try {
      const response = await fetch(url, { method: 'HEAD', mode: 'cors' });
      const contentType = response.headers.get('Content-Type');
      addLog(`CORS check passed. Content-Type: ${contentType}`);
      if (contentType && !contentType.includes('audio') && !contentType.includes('mpeg') && !contentType.includes('octet-stream')) {
        showToast(`警告: 链接类型为 ${contentType}，可能不是有效的音频直链`);
      }
    } catch (err) {
      addLog(`CORS check failed or blocked: ${err}`);
      showToast("无法进行跨域预检，链接可能不支持 CORS，但不影响尝试播放");
    }
  };

  const toggleMusic = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (status === 'playing') {
      audio.pause();
      return;
    }

    try {
      setStatus('loading');
      addLog('User clicked play - attempting to load and play');
      
      // Perform pre-check (doesn't block play)
      preCheckUrl(config.bgmUrl);

      // CRITICAL: Operations must be direct in hander
      audio.load();
      audio.volume = 0.35;
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise;
        addLog('Playback started successfully');
      }
    } catch (err: any) {
      setStatus('error');
      addLog(`Playback Rejected: ${err.name} - ${err.message}`);
      showToast(`播放失败: ${err.name}。浏览器可能阻止了该链接。`);
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'loading': return '⌛';
      case 'playing': return '⏸';
      case 'error': return '❌';
      default: return '♪';
    }
  };

  return (
    <section ref={rootRef} className="relative h-screen flex flex-col items-center justify-center px-6 text-center select-none overflow-hidden">
      <AudioDebugPanel logs={logs} status={status} audioRef={audioRef} />

      <button 
        onClick={toggleMusic}
        disabled={status === 'loading'}
        className={`fixed top-8 right-8 z-50 w-12 h-12 flex items-center justify-center rounded-full glass-panel border border-amber-500/20 transition-all duration-700 ${status === 'playing' ? 'rotate-slow shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'opacity-60'} ${status === 'error' ? 'border-red-500/50' : ''}`}
      >
        <div className="relative">
          <span className={`text-lg ${status === 'playing' ? 'text-amber-500' : 'text-white/40'}`}>
            {getIcon()}
          </span>
          {status === 'playing' && <span className="absolute -inset-1 rounded-full border border-amber-500 animate-ping opacity-30"></span>}
        </div>
        <audio 
          ref={audioRef} 
          src={config.bgmUrl} 
          loop 
          preload="none" 
          crossOrigin="anonymous" 
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
