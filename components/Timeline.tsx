
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CONFIG } from '../constants';

gsap.registerPlugin(ScrollTrigger);

const Timeline: React.FC = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Line drawing animation
      gsap.fromTo(lineRef.current, 
        { scaleY: 0 }, 
        { 
          scaleY: 1, 
          ease: 'none',
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top 70%",
            end: "bottom 80%",
            scrub: 1.5
          }
        }
      );

      // 2. Card and dot reveals
      const items = gsap.utils.toArray('.timeline-item');
      items.forEach((item: any) => {
        const card = item.querySelector('.glass-card');
        const dot = item.querySelector('.node-dot');

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: item,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        });

        tl.fromTo(card, 
          { opacity: 0, y: 40, filter: 'blur(10px)', scale: 0.95 },
          { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1, duration: 1, ease: 'power3.out' }
        );

        tl.fromTo(dot, 
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(2)' },
          "-=0.7"
        );
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="py-24 px-6 relative w-full overflow-hidden">
      <div className="max-w-xl mx-auto relative">
        
        {/* Decorative Layer (z-0) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div 
            ref={lineRef}
            className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-orange-500/40 to-transparent -translate-x-1/2 origin-top" 
          />
        </div>

        {/* Content Layer (z-10) */}
        <div className="relative z-10 space-y-24">
          {CONFIG.blessings.map((text, i) => (
            <div key={i} className="timeline-item relative flex flex-col items-center">
              
              {/* Central Node Dot */}
              <div className="node-dot absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.8)] z-20" />
              
              {/* Glass Card */}
              <div className="glass-card w-full p-8 rounded-[2rem] text-center group cursor-default">
                <p className="text-main font-light leading-relaxed tracking-wide text-base md:text-lg">
                  {text}
                </p>
                <div className="mt-4 flex justify-center opacity-20 group-hover:opacity-40 transition-opacity">
                  <div className="w-8 h-[1px] bg-white" />
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Timeline;
