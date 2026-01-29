
import React, { useState, useEffect } from 'react';
import gsap from 'gsap';
import { config } from '../config';
import { fireConfetti } from '../utils/helpers';

const FooterEasterEgg: React.FC = () => {
  const [clickCount, setClickCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const handleTrigger = () => {
    const nextCount = clickCount + 1;
    if (nextCount >= 3) {
      setClickCount(0);
      openModal();
    } else {
      setClickCount(nextCount);
      gsap.fromTo("#egg-star", { scale: 1 }, { scale: 1.5, duration: 0.2, yoyo: true, repeat: 1 });
    }
  };

  const openModal = () => {
    setIsOpen(true);
    fireConfetti(150, 90);
  };

  useEffect(() => {
    if (isOpen) {
      gsap.fromTo(".modal-overlay", { opacity: 0 }, { opacity: 1, duration: 0.4 });
      gsap.fromTo(".modal-content", 
        { scale: 0.8, opacity: 0, filter: "blur(10px)" }, 
        { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.6, ease: "back.out(1.7)" }
      );
    }
  }, [isOpen]);

  const closeModal = () => {
    gsap.to(".modal-content", { scale: 0.9, opacity: 0, duration: 0.3, onComplete: () => setIsOpen(false) });
  };

  return (
    <footer className="py-12 px-6 relative flex flex-col items-center border-t border-white/5 bg-black/40">
      <div 
        id="egg-star"
        onClick={handleTrigger}
        className="w-8 h-8 flex items-center justify-center cursor-pointer mb-4 animate-pulse"
      >
        <span className="text-xl">✨</span>
      </div>

      <div className="text-white/20 text-[9px] tracking-[0.4em] uppercase font-light mb-1">
        Produced with Love for {config.toName}
      </div>
      <div className="text-white/10 text-[7px] tracking-widest">
        {/* 关键修复 3：固定显示 2026年 */}
        © 2026 {config.fromName}
      </div>

      {isOpen && (
        <div className="modal-overlay fixed inset-0 z-[999] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="modal-content glass-panel max-w-sm w-full p-8 rounded-[2rem] text-center space-y-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-transparent" />
            <h3 className="text-xl font-cursive text-amber-500 tracking-widest">{config.easterWishTitle}</h3>
            <div className="w-6 h-px bg-white/10 mx-auto" />
            <p className="text-white/80 leading-relaxed font-light italic text-sm">
              “ {config.easterWishBody} ”
            </p>
            <div className="pt-2 text-[10px] text-white/40 tracking-widest uppercase">
              — {config.fromName}
            </div>
            <button 
              onClick={closeModal}
              className="mt-4 px-6 py-2 rounded-full border border-white/10 text-white/60 hover:text-white transition-colors text-[10px] tracking-widest uppercase"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </footer>
  );
};

export default FooterEasterEgg;
