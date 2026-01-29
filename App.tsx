
import React, { useEffect } from 'react';
import ParticlesBackgroundThree from './components/ParticlesBackgroundThree';
import Hero from './components/Hero';
import Cake3DSection from './components/Cake3DSection';
import PhotoWall from './components/PhotoWall';
import BlessingsRevealSection from './components/BlessingsRevealSection';
import FinalWish from './components/FinalWish';
import FooterEasterEgg from './components/FooterEasterEgg';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const App: React.FC = () => {
  useEffect(() => {
    // Initial global entrance
    gsap.fromTo("main", { opacity: 0 }, { opacity: 1, duration: 1.5, ease: "power2.out" });
    
    // Smooth scroll experience tweak
    document.documentElement.style.scrollBehavior = 'smooth';

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div className="bgStage min-h-screen">
      <ParticlesBackgroundThree />
      
      <main className="relative z-10 w-full flex flex-col items-center selection:bg-amber-500/20">
        <div className="w-full max-w-4xl mx-auto">
          <Hero />
          
          <div className="space-y-24 pb-12">
            <Cake3DSection />
            
            <div className="px-6 text-center space-y-4">
              <h2 className="text-3xl md:text-5xl font-cursive text-white/90 tracking-[0.2em] text-glow">岁月的倒影</h2>
              <p className="text-xs text-white/20 tracking-[0.6em] uppercase font-light">Memory Fragments</p>
              <div className="mt-8 w-12 h-[2px] bg-gradient-to-r from-amber-500/40 to-transparent mx-auto rounded-full" />
            </div>
            
            <PhotoWall />
            
            <BlessingsRevealSection />
            
            <FinalWish />
          </div>
          
          <FooterEasterEgg />
        </div>
      </main>
    </div>
  );
};

export default App;
