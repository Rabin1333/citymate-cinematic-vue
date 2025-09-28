import { useEffect, useRef } from 'react';

interface MagneticOptions {
  intensity?: number;
  range?: number;
  duration?: number;
}

export const useMagneticEffect = (options: MagneticOptions = {}) => {
  const elementRef = useRef<HTMLElement | null>(null);
  const { intensity = 0.3, range = 100, duration = 300 } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let isActive = false;
    let animationId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance < range) {
        isActive = true;
        const force = Math.max(0, 1 - distance / range);
        const moveX = deltaX * force * intensity;
        const moveY = deltaY * force * intensity;

        element.style.setProperty('--mouse-x', `${moveX}px`);
        element.style.setProperty('--mouse-y', `${moveY}px`);
        element.classList.add('magnetic-active');
      } else if (isActive) {
        isActive = false;
        element.style.setProperty('--mouse-x', '0px');
        element.style.setProperty('--mouse-y', '0px');
        element.classList.remove('magnetic-active');
      }
    };

    const handleMouseLeave = () => {
      if (isActive) {
        isActive = false;
        element.style.setProperty('--mouse-x', '0px');
        element.style.setProperty('--mouse-y', '0px');
        element.classList.remove('magnetic-active');
      }
    };

    // Add GPU acceleration
    element.style.willChange = 'transform';
    element.style.transform = 'translate3d(0, 0, 0)';

    document.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
      
      // Cleanup
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      
      if (element) {
        element.style.willChange = 'auto';
        element.style.removeProperty('--mouse-x');
        element.style.removeProperty('--mouse-y');
        element.classList.remove('magnetic-active');
      }
    };
  }, [intensity, range, duration]);

  return elementRef;
};

export const useQuantumField = () => {
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      element.style.setProperty('--mouse-x', `${x}%`);
      element.style.setProperty('--mouse-y', `${y}%`);
    };

    element.addEventListener('mousemove', handleMouseMove);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return elementRef;
};

export const useCrystallineShatter = () => {
  const elementRef = useRef<HTMLElement | null>(null);

  const triggerShatter = (e: React.MouseEvent) => {
    const element = elementRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    element.style.setProperty('--click-x', `${x}%`);
    element.style.setProperty('--click-y', `${y}%`);
    
    element.classList.add('shatter-active');
    
    setTimeout(() => {
      element.classList.remove('shatter-active');
    }, 600);
  };

  return { elementRef, triggerShatter };
};