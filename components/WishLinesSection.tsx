
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CONFIG } from '../constants';

gsap.registerPlugin(ScrollTrigger);

const WishLinesSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray('.wish-card');
      
      gsap.fromTo('.wish-title', 
        { opacity: 0, y: 20, filter: 'blur(10px)' },
        { 
          opacity: 1, y: 0, filter: 'blur(0px)',
          scrollTrigger: {
            trigger: '.wish-title',
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );

      gsap.fromTo(items, 
        { opacity: 0, y: 30, filter: 'blur(12px)', scale: 0.98 },
        {
          opacity: 1, y: 0, filter: 'blur(0px)', scale: 1,
          duration: 1.2,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-32 px-6 relative w-full flex flex-col items-center">
      <div className="max-w-md w-full space-y-12">
        
        <div className="wish-title text-center space-y-3">
          <h2 className="text-3xl font-cursive text-white">送给{CONFIG.toName}的祝福</h2>
          <div className="w-12 h-px bg-amber-500/50 mx-auto rounded-full" />
        </div>

        <div className="space-y-6">
          {CONFIG.blessings.map((text, i) => (
            <div 
              key={i} 
              className="wish-card glass-wish-card p-8 rounded-3xl relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-500/20 to-transparent" />
              <p className="text-white/90 text-center text-lg md:text-xl font-light leading-relaxed tracking-wide italic">
                “ {text} ”
              </p>
              
              {/* Decorative sparkle corner */}
              <div className="absolute -bottom-2 -right-2 opacity-10 group-hover:opacity-30 transition-opacity">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white">
                  <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-11.314l.707.707m11.314 11.314l.707.707" />
                </svg>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default WishLinesSection;
