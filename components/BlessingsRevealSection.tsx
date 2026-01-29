
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { config } from '../config';

gsap.registerPlugin(ScrollTrigger);

const BlessingsRevealSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.blessing-card');
      
      cards.forEach((card: any, i) => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
            toggleActions: "play none none reverse"
          }
        });

        // 1. Card Reveal with clip-path mask
        tl.fromTo(card,
          { clipPath: 'inset(0 100% 0 0)', opacity: 0, x: -10 },
          { clipPath: 'inset(0 0% 0 0)', opacity: 1, x: 0, duration: 1, ease: "expo.out" }
        );

        // 2. Character Reveal
        const textElement = card.querySelector('.blessing-text');
        const text = textElement.textContent;
        textElement.innerHTML = text.split('').map((char: string) => 
          `<span class="char opacity-0 inline-block">${char}</span>`
        ).join('');

        tl.to(card.querySelectorAll('.char'), {
          opacity: 1,
          stagger: 0.02,
          duration: 0.4,
          ease: "none"
        }, "-=0.5");

        // 3. Cursor pulse
        tl.fromTo(card.querySelector('.cursor-beam'),
          { scaleY: 0 },
          { scaleY: 1, duration: 0.4, ease: "power2.out" },
          "-=0.8"
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-16 px-6 flex flex-col items-center">
      <div className="max-w-lg w-full space-y-12">
        
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-cursive text-white tracking-widest text-glow">心底的声音</h2>
          <p className="text-[10px] text-white/30 tracking-[0.5em] uppercase">Whispers of the Soul</p>
          <div className="w-10 h-px bg-amber-500/50 mx-auto" />
        </div>

        <div className="space-y-6">
          {config.blessings.map((text, i) => (
            <div key={i} className="blessing-card relative flex items-center group">
              {/* Left Cursor Beam */}
              <div className="cursor-beam absolute left-0 w-[1.5px] h-8 bg-amber-500/40 shadow-[0_0_10px_var(--color-amber)] origin-center" />
              
              {/* Card Container */}
              <div className="glass-panel ml-4 flex-1 p-5 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
                <p className="blessing-text text-white/90 font-light text-base md:text-lg leading-relaxed tracking-wide italic">
                  {text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlessingsRevealSection;
