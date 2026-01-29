
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
    // 渐进式显示，防止 WebGL 未加载完成时的闪烁
    gsap.fromTo("main", { opacity: 0 }, { opacity: 1, duration: 1, ease: "power2.out" });
    
    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div className="bgStage min-h-screen relative bg-[#05060a]">
      {/* 粒子背景始终在最底层 */}
      <ParticlesBackgroundThree />
      
      <main className="relative z-10 w-full flex flex-col items-center selection:bg-amber-500/20">
        <div className="w-full max-w-4xl">
          <Hero />
          
          <div className="space-y-16 pb-12">
            {/* 核心 3D 蛋糕部分 */}
            <Cake3DSection />
            
            {/* 分割文案 */}
            <div className="px-6 text-center space-y-4 reveal-section">
              <h2 className="text-3xl md:text-5xl font-cursive text-white/90 tracking-[0.2em] text-glow">岁月的倒影</h2>
              <p className="text-[10px] text-white/20 tracking-[0.6em] uppercase font-light">Memory Fragments</p>
              <div className="mt-6 w-12 h-[1px] bg-gradient-to-r from-amber-500/40 to-transparent mx-auto" />
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
