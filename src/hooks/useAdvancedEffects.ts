/**
 * CityMate Cinema - Advanced Effects Integration Hook
 * Orchestrates WebGL particles, fluid dynamics, and cinematic lighting
 * Award-Winning Visual Effects Coordination
 */

import { useEffect, useRef, useCallback } from 'react';
import { WebGLParticleManager } from '../systems/WebGLParticleManager';
import { FluidDynamicsEngine } from '../systems/FluidDynamicsEngine';
import { CinematicLightingEngine } from '../systems/CinematicLightingEngine';

interface AdvancedEffectsConfig {
  enableParticles?: boolean;
  enableFluidDynamics?: boolean;
  enableCinematicLighting?: boolean;
  particleCount?: number;
  fluidViscosity?: number;
  lightingIntensity?: number;
  filmGrainIntensity?: number;
  performanceMode?: 'high' | 'medium' | 'low';
}

interface EffectTrigger {
  type: 'movie-hover' | 'button-click' | 'page-transition' | 'genre-change' | 'booking-complete';
  element?: HTMLElement;
  genre?: string;
  intensity?: number;
  duration?: number;
}

export const useAdvancedEffects = (config: AdvancedEffectsConfig = {}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particleManagerRef = useRef<WebGLParticleManager | null>(null);
  const fluidEngineRef = useRef<FluidDynamicsEngine | null>(null);
  const lightingEngineRef = useRef<CinematicLightingEngine | null>(null);
  const isInitializedRef = useRef(false);

  // Configuration with defaults
  const effectConfig = {
    enableParticles: true,
    enableFluidDynamics: true,
    enableCinematicLighting: true,
    particleCount: 500,
    fluidViscosity: 1.0,
    lightingIntensity: 0.8,
    filmGrainIntensity: 0.15,
    performanceMode: 'high' as const,
    ...config
  };

  // Initialize effects systems
  const initializeEffects = useCallback(() => {
    if (isInitializedRef.current || !canvasRef.current) return;

    try {
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        console.log('Reduced motion detected, skipping advanced effects');
        return;
      }

      // Check WebGL support
      const canvas = canvasRef.current;
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        console.warn('WebGL not supported, falling back to 2D effects');
        effectConfig.enableParticles = false;
      }

      // Adjust for performance mode
      if (effectConfig.performanceMode === 'medium') {
        effectConfig.particleCount = Math.floor(effectConfig.particleCount * 0.6);
        effectConfig.filmGrainIntensity *= 0.7;
      } else if (effectConfig.performanceMode === 'low') {
        effectConfig.particleCount = Math.floor(effectConfig.particleCount * 0.3);
        effectConfig.filmGrainIntensity *= 0.5;
        effectConfig.enableFluidDynamics = false;
      }

      // Initialize particle system
      if (effectConfig.enableParticles && gl) {
        particleManagerRef.current = new WebGLParticleManager(canvas);
        console.log('WebGL Particle Manager initialized');
      }

      // Initialize fluid dynamics
      if (effectConfig.enableFluidDynamics) {
        fluidEngineRef.current = new FluidDynamicsEngine(canvas);
        console.log('Fluid Dynamics Engine initialized');
      }

      // Initialize cinematic lighting
      if (effectConfig.enableCinematicLighting) {
        lightingEngineRef.current = new CinematicLightingEngine(canvas);
        console.log('Cinematic Lighting Engine initialized');
      }

      isInitializedRef.current = true;
      
      // Set up automatic effects based on page context
      setupAutomaticEffects();
      
    } catch (error) {
      console.error('Failed to initialize advanced effects:', error);
    }
  }, [effectConfig]);

  // Setup automatic effects based on page elements
  const setupAutomaticEffects = useCallback(() => {
    // Add fluid surface tension to all cards
    const cards = document.querySelectorAll('.movie-card, .liquid-morph');
    cards.forEach(card => {
      if (fluidEngineRef.current) {
        fluidEngineRef.current.addSurfaceTension(card as HTMLElement);
      }
    });

    // Add caustic patterns to glass elements
    const glassElements = document.querySelectorAll('.glass-reflection');
    glassElements.forEach(element => {
      if (lightingEngineRef.current) {
        lightingEngineRef.current.addCausticPattern(element as HTMLElement, {
          intensity: 0.6,
          speed: 0.003,
          refractionIndex: 1.5
        });
      }
    });

    // Add chromatic aberration to focus elements
    const focusElements = document.querySelectorAll('.hero-title, .movie-title');
    focusElements.forEach(element => {
      if (lightingEngineRef.current) {
        lightingEngineRef.current.addChromaticAberration(element as HTMLElement, 0.3);
      }
    });

    // Create god rays for hero sections
    const heroSections = document.querySelectorAll('.volumetric-light');
    heroSections.forEach(section => {
      if (lightingEngineRef.current) {
        const rect = section.getBoundingClientRect();
        lightingEngineRef.current.createGodRays({
          x: rect.left + rect.width * 0.3,
          y: rect.top + rect.height * 0.2
        }, 6);
      }
    });

    // Add magnetic fields to interactive elements
    const magneticElements = document.querySelectorAll('.magnetic-button');
    magneticElements.forEach(element => {
      if (particleManagerRef.current) {
        particleManagerRef.current.addMagneticField(element as HTMLElement);
      }
    });

  }, []);

  // Trigger specific cinematic effects
  const triggerEffect = useCallback((effect: EffectTrigger) => {
    const { type, element, genre, intensity = 1.0, duration = 1000 } = effect;

    switch (type) {
      case 'movie-hover':
        // Create genre-specific particle burst
        if (particleManagerRef.current && genre) {
          particleManagerRef.current.createGenreParticles(genre, 15);
          particleManagerRef.current.triggerCinematicEffect('genre-burst', { genre });
        }

        // Trigger fluid splash effect
        if (fluidEngineRef.current && element) {
          const rect = element.getBoundingClientRect();
          fluidEngineRef.current.triggerFluidEffect('splash', 
            rect.left + rect.width / 2, 
            rect.top + rect.height / 2, 
            intensity
          );
        }

        // Enhance lighting
        if (lightingEngineRef.current) {
          lightingEngineRef.current.triggerLightingEffect('pulse', intensity * 0.5);
        }
        break;

      case 'button-click':
        // Create explosion effect
        if (particleManagerRef.current) {
          particleManagerRef.current.triggerCinematicEffect('explosion');
        }

        // Trigger fluid explosion
        if (fluidEngineRef.current && element) {
          const rect = element.getBoundingClientRect();
          fluidEngineRef.current.triggerFluidEffect('explosion',
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
            intensity
          );
        }

        // Flash lighting effect
        if (lightingEngineRef.current) {
          lightingEngineRef.current.triggerLightingEffect('flash', intensity);
        }
        break;

      case 'page-transition':
        // Create wave transition effect
        if (fluidEngineRef.current) {
          const centerX = window.innerWidth / 2;
          const centerY = window.innerHeight / 2;
          fluidEngineRef.current.triggerFluidEffect('vortex', centerX, centerY, intensity);
        }

        // Lighting transition
        if (lightingEngineRef.current) {
          lightingEngineRef.current.triggerLightingEffect('flicker', intensity * 0.7);
        }
        break;

      case 'genre-change':
        // Switch to genre-specific particle system
        if (particleManagerRef.current && genre) {
          particleManagerRef.current.createGenreParticles(genre, 25);
        }

        // Adjust lighting color temperature for genre
        if (lightingEngineRef.current) {
          const genreIntensity = getGenreLightingIntensity(genre);
          lightingEngineRef.current.setFilmGrainIntensity(genreIntensity);
        }
        break;

      case 'booking-complete':
        // Celebration particle effect
        if (particleManagerRef.current) {
          particleManagerRef.current.triggerCinematicEffect('constellation', {
            title: 'Booking Complete',
            plotPoints: ['Success', 'Enjoy', 'Cinema']
          });
        }

        // Success lighting pulse
        if (lightingEngineRef.current) {
          lightingEngineRef.current.triggerLightingEffect('pulse', 1.5);
        }
        break;
    }

    // Auto-cleanup intensive effects
    if (duration > 0) {
      setTimeout(() => {
        // Reduce effect intensity after duration
        if (lightingEngineRef.current) {
          lightingEngineRef.current.triggerLightingEffect('pulse', 0.3);
        }
      }, duration);
    }
  }, []);

  // Get genre-specific lighting configuration
  const getGenreLightingIntensity = (genre?: string): number => {
    const genreConfig = {
      'horror': 0.25,
      'thriller': 0.2,
      'drama': 0.15,
      'action': 0.3,
      'sci-fi': 0.1,
      'comedy': 0.05,
      'romance': 0.1
    };

    return genreConfig[genre as keyof typeof genreConfig] || 0.15;
  };

  // Responsive canvas sizing
  const resizeCanvas = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Notify effects systems of resize
    if (particleManagerRef.current || fluidEngineRef.current || lightingEngineRef.current) {
      // Systems handle their own resize logic
    }
  }, []);

  // Performance monitoring
  const monitorPerformance = useCallback(() => {
    let frameCount = 0;
    let lastTime = Date.now();

    const checkFPS = () => {
      frameCount++;
      const currentTime = Date.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = frameCount;
        frameCount = 0;
        lastTime = currentTime;

        // Adjust effects based on performance
        if (fps < 30 && effectConfig.performanceMode === 'high') {
          console.warn('Low FPS detected, reducing effects complexity');
          effectConfig.performanceMode = 'medium';
          
          if (particleManagerRef.current) {
            // Reduce particle count
          }
          if (lightingEngineRef.current) {
            lightingEngineRef.current.setFilmGrainIntensity(effectConfig.filmGrainIntensity * 0.5);
          }
        }
      }
      
      requestAnimationFrame(checkFPS);
    };
    
    requestAnimationFrame(checkFPS);
  }, [effectConfig]);

  // Initialize on mount
  useEffect(() => {
    // Create canvas if it doesn't exist
    if (!canvasRef.current) {
      const canvas = document.createElement('canvas');
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '1';
      canvas.style.mixBlendMode = 'screen';
      
      document.body.appendChild(canvas);
      canvasRef.current = canvas;
    }

    initializeEffects();
    resizeCanvas();
    monitorPerformance();

    // Setup resize listener
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [initializeEffects, resizeCanvas, monitorPerformance]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      particleManagerRef.current?.destroy();
      fluidEngineRef.current?.destroy();
      lightingEngineRef.current?.destroy();
      
      if (canvasRef.current && canvasRef.current.parentNode) {
        canvasRef.current.parentNode.removeChild(canvasRef.current);
      }
    };
  }, []);

  // Auto-detect and apply effects to new elements
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // Auto-apply effects to new movie cards
            if (element.classList.contains('movie-card') && fluidEngineRef.current) {
              fluidEngineRef.current.addSurfaceTension(element as HTMLElement);
            }
            
            // Auto-apply effects to new glass elements
            if (element.classList.contains('glass-reflection') && lightingEngineRef.current) {
              lightingEngineRef.current.addCausticPattern(element as HTMLElement);
            }
            
            // Auto-apply magnetic fields to new buttons
            if (element.classList.contains('magnetic-button') && particleManagerRef.current) {
              particleManagerRef.current.addMagneticField(element as HTMLElement);
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, []);

  return {
    triggerEffect,
    isInitialized: isInitializedRef.current,
    particleManager: particleManagerRef.current,
    fluidEngine: fluidEngineRef.current,
    lightingEngine: lightingEngineRef.current
  };
};

// Genre-specific effect presets
export const genreEffectPresets = {
  horror: {
    particleColor: [1.0, 0.1, 0.1, 0.8],
    lightingIntensity: 0.25,
    fluidViscosity: 2.0,
    filmGrain: 0.3
  },
  'sci-fi': {
    particleColor: [0.1, 0.5, 1.0, 0.7],
    lightingIntensity: 0.1,
    fluidViscosity: 0.5,
    filmGrain: 0.1
  },
  action: {
    particleColor: [1.0, 0.6, 0.1, 0.9],
    lightingIntensity: 0.3,
    fluidViscosity: 1.5,
    filmGrain: 0.2
  },
  drama: {
    particleColor: [0.6, 0.4, 0.8, 0.5],
    lightingIntensity: 0.15,
    fluidViscosity: 1.0,
    filmGrain: 0.15
  }
};