// Cinematic Effects Registry and Utility Functions

export interface EffectConfig {
  aliases: string[];
  visual: (element?: HTMLElement, isReducedMotion?: boolean) => void;
  sfx?: string;
  durationMs: number;
  intensity: number;
}

// Effect Registry - Config-first design for easy extension
export const effectsRegistry: Record<string, EffectConfig> = {
  darkKnight: {
    aliases: ["the dark knight", "batman", "dark knight"],
    visual: (element, isReducedMotion) => {
      if (isReducedMotion) {
        // Simple flash for reduced motion
        document.body.style.background = "hsl(0 0% 5%)";
        setTimeout(() => {
          document.body.style.background = "";
        }, 200);
        return;
      }

      // Bat-signal spotlight effect
      const spotlight = document.createElement('div');
      spotlight.className = 'fixed inset-0 pointer-events-none z-50';
      spotlight.style.background = 'radial-gradient(circle at center, transparent 20%, rgba(0,0,0,0.8) 60%)';
      spotlight.style.opacity = '0';
      spotlight.style.transition = 'opacity 0.5s ease-in-out';
      document.body.appendChild(spotlight);

      // Page luma dip
      document.body.style.filter = 'brightness(0.3)';
      
      requestAnimationFrame(() => {
        spotlight.style.opacity = '1';
      });

      // Sweep animation
      setTimeout(() => {
        spotlight.style.background = 'radial-gradient(circle at 70% 30%, transparent 25%, rgba(0,0,0,0.8) 65%)';
      }, 800);

      // Cleanup
      setTimeout(() => {
        spotlight.style.opacity = '0';
        document.body.style.filter = '';
        setTimeout(() => {
          document.body.removeChild(spotlight);
        }, 500);
      }, 2000);
    },
    sfx: "/sfx/bat-whoosh.mp3",
    durationMs: 2500,
    intensity: 0.8,
  },

  inception: {
    aliases: ["inception", "dream"],
    visual: (element, isReducedMotion) => {
      if (isReducedMotion) {
        // Simple color shift for reduced motion
        document.body.style.filter = 'hue-rotate(180deg)';
        setTimeout(() => {
          document.body.style.filter = '';
        }, 500);
        return;
      }

      // Reality tilt and ripple
      const viewport = document.documentElement;
      viewport.style.transform = 'perspective(1000px) rotateX(3deg) rotateY(5deg)';
      viewport.style.transition = 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

      // Ripple effect
      const ripple = document.createElement('div');
      ripple.className = 'fixed inset-0 pointer-events-none z-50';
      ripple.style.background = 'radial-gradient(circle, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)';
      ripple.style.transform = 'scale(0)';
      ripple.style.transition = 'transform 1.5s ease-out';
      document.body.appendChild(ripple);

      requestAnimationFrame(() => {
        ripple.style.transform = 'scale(3)';
      });

      // Reset
      setTimeout(() => {
        viewport.style.transform = '';
        ripple.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(ripple);
        }, 500);
      }, 2500);
    },
    sfx: "/sfx/dream-hum.mp3",
    durationMs: 3000,
    intensity: 0.7,
  },

  interstellar: {
    aliases: ["interstellar", "wormhole"],
    visual: (element, isReducedMotion) => {
      if (isReducedMotion) {
        // Simple fade effect
        document.body.style.opacity = '0.7';
        setTimeout(() => {
          document.body.style.opacity = '';
        }, 800);
        return;
      }

      // Wormhole swirl vignette
      const wormhole = document.createElement('div');
      wormhole.className = 'fixed inset-0 pointer-events-none z-50';
      wormhole.style.background = 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.9) 70%)';
      wormhole.style.transform = 'rotate(0deg) scale(1)';
      wormhole.style.transition = 'transform 2.8s ease-in-out';
      document.body.appendChild(wormhole);

      requestAnimationFrame(() => {
        wormhole.style.transform = 'rotate(360deg) scale(0.5)';
      });

      // Cleanup
      setTimeout(() => {
        wormhole.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(wormhole);
        }, 300);
      }, 2500);
    },
    sfx: "/sfx/space-ping.mp3",
    durationMs: 2800,
    intensity: 0.75,
  },

  avatar: {
    aliases: ["avatar", "na'vi", "pandora"],
    visual: (element, isReducedMotion) => {
      if (isReducedMotion) {
        // Simple glow effect
        document.body.style.boxShadow = 'inset 0 0 50px rgba(51, 153, 255, 0.3)';
        setTimeout(() => {
          document.body.style.boxShadow = '';
        }, 1000);
        return;
      }

      // Bioluminescent pulse
      const posters = document.querySelectorAll('.movie-card, img, button');
      posters.forEach((poster, index) => {
        setTimeout(() => {
          (poster as HTMLElement).style.boxShadow = '0 0 30px rgba(51, 153, 255, 0.8)';
          (poster as HTMLElement).style.transition = 'box-shadow 0.3s ease-in-out';
          
          setTimeout(() => {
            (poster as HTMLElement).style.boxShadow = '';
          }, 400);
        }, index * 100);
      });
    },
    sfx: "/sfx/forest-ambience.mp3",
    durationMs: 2200,
    intensity: 0.6,
  },

  parasite: {
    aliases: ["parasite"],
    visual: (element, isReducedMotion) => {
      if (isReducedMotion) {
        // Quick color inversion
        document.body.style.filter = 'invert(1)';
        setTimeout(() => {
          document.body.style.filter = '';
        }, 300);
        return;
      }

      // Split-screen light/dark mask sweep
      const mask = document.createElement('div');
      mask.className = 'fixed inset-0 pointer-events-none z-50';
      mask.style.background = 'linear-gradient(to right, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.3) 50%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.7) 100%)';
      mask.style.transform = 'translateY(-100%)';
      mask.style.transition = 'transform 2s ease-in-out';
      document.body.appendChild(mask);

      requestAnimationFrame(() => {
        mask.style.transform = 'translateY(100%)';
      });

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(mask);
      }, 2000);
    },
    sfx: "/sfx/drip.mp3",
    durationMs: 2000,
    intensity: 0.5,
  },

  dune: {
    aliases: ["dune", "arrakis"],
    visual: (element, isReducedMotion) => {
      if (isReducedMotion) {
        // Simple grain overlay
        document.body.style.filter = 'sepia(0.3) contrast(1.1)';
        setTimeout(() => {
          document.body.style.filter = '';
        }, 1000);
        return;
      }

      // Desert heat-shimmer and grains
      document.body.style.filter = 'hue-rotate(30deg) saturate(1.2)';
      
      const grains = document.createElement('div');
      grains.className = 'fixed inset-0 pointer-events-none z-50';
      grains.style.background = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'4\' height=\'4\' viewBox=\'0 0 4 4\'%3E%3Cpath fill=\'%23d2b48c\' fill-opacity=\'0.1\' d=\'M1 3h1v1H1V3zm2-2h1v1H3V1z\'%3E%3C/path%3E%3C/svg%3E")';
      grains.style.animation = 'drift 2.3s linear';
      document.body.appendChild(grains);

      // Heat shimmer effect
      setTimeout(() => {
        document.body.style.filter += ' blur(0.5px)';
        setTimeout(() => {
          document.body.style.filter = 'hue-rotate(30deg) saturate(1.2)';
        }, 300);
      }, 800);

      // Cleanup
      setTimeout(() => {
        document.body.style.filter = '';
        document.body.removeChild(grains);
      }, 2300);
    },
    sfx: "/sfx/sand-whisper.mp3",
    durationMs: 2300,
    intensity: 0.65,
  },
};

// Audio cache for performance
const audioCache: Record<string, HTMLAudioElement> = {};

// Utility function to normalize search input
export const normalizeInput = (input: string): string => {
  return input.toLowerCase().trim().replace(/[^\w\s]/g, '');
};

// Match input against effect aliases
export const findEffectByInput = (input: string): string | null => {
  const normalized = normalizeInput(input);
  
  for (const [movieKey, config] of Object.entries(effectsRegistry)) {
    if (config.aliases.some(alias => normalized.includes(alias))) {
      return movieKey;
    }
  }
  
  return null;
};

// Map movie title to effect key
export const findEffectByTitle = (title: string): string | null => {
  const normalized = normalizeInput(title);
  
  // Direct mapping for known titles
  const titleMappings: Record<string, string> = {
    'the dark knight': 'darkKnight',
    'inception': 'inception',
    'interstellar': 'interstellar',
    'avatar': 'avatar',
    'parasite': 'parasite',
    'dune': 'dune',
  };

  for (const [key, effectKey] of Object.entries(titleMappings)) {
    if (normalized.includes(key)) {
      return effectKey;
    }
  }

  return findEffectByInput(title);
};

// Telemetry logging
export const logCinematicEffect = (movieKey: string, triggerType: string, muted: boolean, durationMs: number) => {
  // In a real app, this would send to analytics service
  console.log('cinematic_effect_played', {
    movieKey,
    triggerType,
    muted,
    durationMs,
    timestamp: Date.now()
  });
};

// ARIA live announcement
export const announceEffect = (movieKey: string) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.style.position = 'absolute';
  announcement.style.left = '-9999px';
  announcement.textContent = `Cinematic effect played: ${movieKey}`;
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    if (document.body.contains(announcement)) {
      document.body.removeChild(announcement);
    }
  }, 2000);
};