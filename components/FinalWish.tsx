
import React from 'react';
import { CONFIG } from '../constants';
import { fireFireworks, fireConfetti } from '../utils/helpers';

const FinalWish: React.FC = () => {
  const handleClick = () => {
    fireFireworks();
    fireConfetti(150, 100);
  };

  return (
    <section className="py-16 px-6 text-center">
      <div className="max-w-md mx-auto">
        <p className="text-white/60 mb-8 font-cursive text-xl leading-relaxed">
          {CONFIG.finalToast}
        </p>
        
        <button 
          onClick={handleClick}
          className="group relative px-10 py-4 font-bold text-white transition-all duration-300"
        >
          {/* Animated border */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 rounded-full animate-gradient-xy p-[2px]">
            <div className="w-full h-full bg-black rounded-full transition-all group-hover:bg-transparent" />
          </div>
          <span className="relative z-10 text-lg tracking-widest">让快乐延续 🎊</span>
        </button>
      </div>

      <style>{`
        @keyframes gradient-xy {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-xy {
          background-size: 200% 200%;
          animation: gradient-xy 3s ease infinite;
        }
      `}</style>
    </section>
  );
};

export default FinalWish;
