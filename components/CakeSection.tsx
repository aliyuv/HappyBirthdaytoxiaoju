
import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CONFIG } from '../constants';
import { fireConfetti, fireFireworks } from '../utils/helpers';
import { CakeState } from '../types';

gsap.registerPlugin(ScrollTrigger);

const CandleFlame: React.FC<{ isLit: boolean; intensity: number }> = ({ isLit, intensity }) => {
  return (
    <div className={`relative transition-all duration-1000 ${isLit ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
      {/* Outer Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-12 bg-orange-500/20 blur-xl rounded-full" />
      
      {/* Flame Body */}
      <div className="flame-container relative w-4 h-10 bottom-1">
        <div className="flame-main absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-10 rounded-[50%_50%_20%_20%] bg-gradient-to-t from-orange-600 via-orange-400 to-transparent blur-[1px] animate-flicker" />
        <div className="flame-inner absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-6 rounded-[50%_50%_35%_35%] bg-gradient-to-t from-yellow-200 to-transparent opacity-80" />
        <div className="flame-core absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-3 rounded-full bg-blue-400/50 mix-blend-screen" />
      </div>

      <style>{`
        @keyframes flicker {
          0%, 100% { transform: translateX(-50%) scale(1) rotate(-1deg); filter: brightness(1); }
          25% { transform: translateX(-50%) scale(1.05, 0.95) rotate(1deg); filter: brightness(1.2); }
          50% { transform: translateX(-50%) scale(0.98, 1.02) rotate(-2deg); filter: brightness(0.9); }
          75% { transform: translateX(-50%) scale(1.02, 0.98) rotate(2deg); filter: brightness(1.1); }
        }
        .animate-flicker {
          animation: flicker ${0.5 + Math.random()}s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

const CakeSection: React.FC = () => {
  const [state, setState] = useState<CakeState>('idle');
  const [litCount, setLitCount] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    gsap.fromTo(cardRef.current, 
      { opacity: 0, y: 50, filter: 'blur(10px)' },
      { 
        opacity: 1, y: 0, filter: 'blur(0px)',
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 80%",
          end: "top 20%",
          toggleActions: "play none none reverse"
        }
      }
    );
  }, []);

  const handleInteraction = () => {
    if (state === 'idle') {
      setState('lit');
      showToast("点亮希望 ✨");
      // Sequential lighting
      let count = 0;
      const interval = setInterval(() => {
        count++;
        setLitCount(count);
        fireConfetti(20, 30, { y: 0.7, x: 0.5 });
        if (count >= 3) {
          clearInterval(interval);
          setTimeout(() => {
            setState('wish');
            showToast("闭上眼，许个愿吧...");
          }, 1000);
        }
      }, 600);
    }
  };

  const blowOut = () => {
    if (state === 'wish') {
      setState('blown');
      setLitCount(0);
      showToast("愿望已送达 :)");
      fireFireworks();
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <section className="min-h-screen py-20 px-6 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Toast */}
      <div className={`fixed top-24 z-50 px-6 py-2 rounded-full backdrop-blur-lg bg-white/10 border border-white/20 text-white transition-all duration-500 transform ${toast ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0'}`}>
        {toast}
      </div>

      <div 
        ref={cardRef}
        className="animate-sweep relative w-full max-w-sm aspect-[4/5] p-8 rounded-3xl backdrop-blur-2xl bg-white/5 border border-white/10 shadow-2xl flex flex-col items-center justify-between overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        
        {/* Interaction Info */}
        <div className="z-10 text-center">
           <h3 className="text-xl font-cursive text-orange-200/80 mb-2">给{CONFIG.toName}的礼物</h3>
           <div className="w-12 h-1px bg-white/20 mx-auto" />
        </div>

        {/* Cake Visual */}
        <div className="relative mt-8 select-none" onClick={handleInteraction}>
          {/* Candles */}
          <div className="absolute -top-16 left-0 right-0 flex justify-around px-12">
            <div className="relative flex flex-col items-center">
              <CandleFlame isLit={litCount >= 1} intensity={1} />
              <div className="w-2 h-10 bg-gradient-to-b from-pink-400 to-pink-600 rounded-t-sm" />
            </div>
            <div className="relative flex flex-col items-center -top-4">
              <CandleFlame isLit={litCount >= 2} intensity={1.2} />
              <div className="w-2 h-12 bg-gradient-to-b from-purple-400 to-purple-600 rounded-t-sm" />
            </div>
            <div className="relative flex flex-col items-center">
              <CandleFlame isLit={litCount >= 3} intensity={1} />
              <div className="w-2 h-10 bg-gradient-to-b from-blue-400 to-blue-600 rounded-t-sm" />
            </div>
          </div>

          {/* Cake Tiers */}
          <div className="w-48 h-10 bg-white/90 rounded-t-2xl shadow-inner relative z-10" />
          <div className="w-56 h-12 bg-white/80 rounded-t-xl -mt-2 shadow-inner relative z-0" />
          <div className="w-64 h-14 bg-white/70 rounded-2xl -mt-2 shadow-inner" />
          
          {/* Base / Plate */}
          <div className="w-72 h-4 bg-white/20 blur-sm -mt-1 rounded-full mx-auto" />
        </div>

        {/* Action Button */}
        <div className="z-10 w-full">
          {state === 'idle' && (
            <button 
              onClick={handleInteraction}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold tracking-widest shadow-lg shadow-orange-500/20 active:scale-95 transition-transform"
            >
              {CONFIG.buttonText}
            </button>
          )}
          {state === 'lit' && (
             <div className="text-center text-white/40 italic text-sm animate-pulse">正在点亮祝福...</div>
          )}
          {state === 'wish' && (
            <button 
              onMouseDown={blowOut}
              onTouchStart={blowOut}
              className="w-full py-4 rounded-xl border border-white/30 text-white font-bold tracking-widest backdrop-blur-md hover:bg-white/10 active:scale-95 transition-all animate-bounce"
            >
              🌬️ 吹灭蜡烛
            </button>
          )}
          {state === 'blown' && (
            <button 
              onClick={() => { setState('idle'); setLitCount(0); }}
              className="w-full py-4 rounded-xl bg-white/10 text-white/80 font-bold tracking-widest border border-white/5"
            >
              再许一个愿
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default CakeSection;
