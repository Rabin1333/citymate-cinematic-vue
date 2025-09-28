import { useEffect, useRef } from 'react';

const ParticleField = () => {
  const fieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;

    // Create magnetic orbs
    const createOrb = (index: number) => {
      const orb = document.createElement('div');
      orb.className = 'magnetic-orb';
      
      // Random initial position
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      
      orb.style.left = `${x}px`;
      orb.style.top = `${y}px`;
      
      // Add random animation delay
      orb.style.animationDelay = `${Math.random() * -20}s`;
      
      return orb;
    };

    // Create DNA helix elements
    const createDNAHelix = (x: number, y: number) => {
      const helix = document.createElement('div');
      helix.className = 'dna-helix';
      helix.style.left = `${x}%`;
      helix.style.top = `${y}%`;
      return helix;
    };

    // Add orbs
    for (let i = 0; i < 3; i++) {
      field.appendChild(createOrb(i));
    }

    // Add DNA helixes in corners
    field.appendChild(createDNAHelix(10, 20));
    field.appendChild(createDNAHelix(85, 15));
    field.appendChild(createDNAHelix(15, 75));
    field.appendChild(createDNAHelix(80, 80));

    // Mouse follower effect for orbs
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      const orbs = field.querySelectorAll('.magnetic-orb');
      orbs.forEach((orb, index) => {
        const element = orb as HTMLElement;
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = mouseX - centerX;
        const deltaY = mouseY - centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Magnetic attraction within 200px
        if (distance < 200) {
          const force = (200 - distance) / 200;
          const moveX = deltaX * force * 0.1;
          const moveY = deltaY * force * 0.1;
          
          element.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
        } else {
          element.style.transform = 'translate3d(0, 0, 0)';
        }
      });
    };

    document.addEventListener('mousemove', handleMouseMove);

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Support for reduced motion
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    if (prefersReducedMotion.matches && fieldRef.current) {
      fieldRef.current.style.display = 'none';
    }
  }, []);

  return <div ref={fieldRef} className="particle-field" aria-hidden="true" />;
};

export default ParticleField;