import { useEffect } from 'react';

export const useParticleEffects = () => {
  useEffect(() => {
    // Initialize mouse tracking for all magnetic elements
    let mouseX = 0;
    let mouseY = 0;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Update CSS custom properties for magnetic elements
      document.documentElement.style.setProperty('--global-mouse-x', `${mouseX}px`);
      document.documentElement.style.setProperty('--global-mouse-y', `${mouseY}px`);

      // Handle magnetic buttons
      const magneticButtons = document.querySelectorAll('.magnetic-button');
      magneticButtons.forEach(button => {
        const element = button as HTMLElement;
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = mouseX - centerX;
        const deltaY = mouseY - centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Magnetic attraction within 100px
        if (distance < 100) {
          const force = Math.max(0, 1 - distance / 100);
          const moveX = deltaX * force * 0.3;
          const moveY = deltaY * force * 0.3;

          element.style.setProperty('--mouse-x', `${moveX}px`);
          element.style.setProperty('--mouse-y', `${moveY}px`);
          element.classList.add('magnetic-active');
        } else {
          element.style.setProperty('--mouse-x', '0px');
          element.style.setProperty('--mouse-y', '0px');
          element.classList.remove('magnetic-active');
        }
      });
    };

    // Reduced motion support
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    if (!prefersReducedMotion.matches) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
    }

    // Performance optimization: throttle mouse events
    const throttledMouseMove = throttle(handleGlobalMouseMove, 16); // ~60fps

    document.addEventListener('mousemove', throttledMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mousemove', throttledMouseMove);
    };
  }, []);
};

// Throttle utility function
function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;
  
  return (...args: Parameters<T>) => {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
}