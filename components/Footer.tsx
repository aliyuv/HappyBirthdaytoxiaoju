
import React, { useState } from 'react';
import { CONFIG } from '../constants';
import { fireConfetti } from '../utils/helpers';

const Footer: React.FC = () => {
  const [clickCount, setClickCount] = useState(0);

  const handleEgg = () => {
    const newCount = clickCount + 1;
    if (newCount === 3) {
      fireConfetti(200, 120);
      alert("恭喜发现彩蛋！小菊要开心每一天呀！🎉");
      setClickCount(0);
    } else {
      setClickCount(newCount);
    }
  };

  return (
    <footer className="py-20 px-6 text-center border-t border-white/5 bg-black/50">
      <div 
        onClick={handleEgg}
        className="text-white/20 text-xs tracking-[0.3em] font-light cursor-help select-none"
      >
        MADE WITH ❤️ BY {CONFIG.fromName}
      </div>
      <div className="mt-4 flex justify-center space-x-4 opacity-10">
        {['✨', '🎂', '🎈', '💖'].map((emoji, i) => (
          <span key={i}>{emoji}</span>
        ))}
      </div>
    </footer>
  );
};

export default Footer;
