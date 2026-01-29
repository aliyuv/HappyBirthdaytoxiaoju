
export const showToast = (message: string) => {
  const toast = document.createElement('div');
  toast.className = 'fixed top-24 left-1/2 -translate-x-1/2 z-[999] bg-amber-500 text-white text-xs px-4 py-2 rounded-full shadow-lg transition-all duration-500 opacity-0 translate-y-2';
  toast.innerText = message;
  document.body.appendChild(toast);
  
  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.remove('opacity-0', 'translate-y-2');
    toast.classList.add('opacity-100', 'translate-y-0');
  });

  setTimeout(() => {
    toast.classList.remove('opacity-100', 'translate-y-0');
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 500);
  }, 3000);
};
