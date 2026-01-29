
import confetti from 'canvas-confetti';

// Explicitly type the origin parameter to include optional x and y coordinates
export const fireConfetti = (particleCount = 100, spread = 70, origin: { x?: number; y?: number } = { y: 0.6 }) => {
  confetti({
    particleCount,
    spread,
    origin,
    colors: ['#ffc107', '#ff5722', '#e91e63', '#9c27b0', '#ffffff'],
    zIndex: 9999
  });
};

export const fireFireworks = () => {
  const duration = 3 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval: any = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
  }, 250);
};
