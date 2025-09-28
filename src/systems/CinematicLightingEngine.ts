/**
 * CityMate Cinema - Advanced Cinematic Lighting Engine
 * Real-time caustics, volumetric lighting, chromatic aberration
 * Hollywood-Grade Visual Effects System
 */

interface LightSource {
  id: string;
  x: number;
  y: number;
  z: number;
  intensity: number;
  color: [number, number, number];
  type: 'directional' | 'point' | 'spotlight' | 'volumetric';
  range: number;
  falloff: number;
  castsShadows: boolean;
  volumetricDensity?: number;
  spotlightAngle?: number;
  animationPhase?: number;
}

interface CausticPattern {
  element: HTMLElement;
  refractionIndex: number;
  intensity: number;
  waviness: number;
  speed: number;
  scale: number;
  phase: number;
}

interface VolumetricRay {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  intensity: number;
  color: [number, number, number];
  scattering: number;
  density: number;
}

interface GodRay {
  origin: { x: number; y: number };
  direction: number;
  length: number;
  width: number;
  intensity: number;
  particles: Array<{ x: number; y: number; opacity: number; size: number }>;
}

interface ChromaticAberration {
  element: HTMLElement;
  intensity: number;
  redOffset: { x: number; y: number };
  blueOffset: { x: number; y: number };
  animationSpeed: number;
}

export class CinematicLightingEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private lightSources: LightSource[] = [];
  private causticPatterns: CausticPattern[] = [];
  private volumetricRays: VolumetricRay[] = [];
  private godRays: GodRay[] = [];
  private chromaticAberrations: ChromaticAberration[] = [];
  
  // Film grain system
  private filmGrainCanvas: HTMLCanvasElement;
  private filmGrainCtx: CanvasRenderingContext2D;
  private grainIntensity = 0.15;
  private grainAnimationSpeed = 0.1;
  private grainFrame = 0;
  
  // Ambient lighting
  private ambientLight = { r: 0.1, g: 0.15, b: 0.2, intensity: 0.3 };
  private fogDensity = 0.05;
  private atmosphericScattering = 0.1;
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    
    // Create film grain canvas
    this.filmGrainCanvas = document.createElement('canvas');
    this.filmGrainCtx = this.filmGrainCanvas.getContext('2d')!;
    
    this.initializeLightingSystem();
    this.setupDynamicLighting();
    this.startLightingLoop();
  }

  private initializeLightingSystem() {
    // Add default ambient lighting
    this.addLightSource({
      id: 'ambient',
      x: this.canvas.width / 2,
      y: -100,
      z: 200,
      intensity: 0.3,
      color: [0.8, 0.9, 1.0],
      type: 'directional',
      range: 1000,
      falloff: 0.1,
      castsShadows: false
    });

    // Add cinematic key light
    this.addLightSource({
      id: 'key-light',
      x: this.canvas.width * 0.3,
      y: this.canvas.height * 0.2,
      z: 150,
      intensity: 0.8,
      color: [1.0, 0.95, 0.9],
      type: 'spotlight',
      range: 400,
      falloff: 0.5,
      castsShadows: true,
      spotlightAngle: Math.PI / 6,
      animationPhase: 0
    });

    // Add fill light
    this.addLightSource({
      id: 'fill-light',
      x: this.canvas.width * 0.7,
      y: this.canvas.height * 0.3,
      z: 120,
      intensity: 0.4,
      color: [0.9, 0.95, 1.0],
      type: 'point',
      range: 300,
      falloff: 0.3,
      castsShadows: false,
      animationPhase: Math.PI / 2
    });
  }

  private setupDynamicLighting() {
    // Mouse-following dynamic light
    document.addEventListener('mousemove', (e) => {
      this.updateDynamicLight(e.clientX, e.clientY);
    });

    // Scroll-based atmospheric changes
    document.addEventListener('scroll', () => {
      const scrollRatio = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      this.updateAtmosphericLighting(scrollRatio);
    });
  }

  private updateDynamicLight(mouseX: number, mouseY: number) {
    const dynamicLight = this.lightSources.find(light => light.id === 'dynamic-mouse');
    
    if (dynamicLight) {
      dynamicLight.x = mouseX;
      dynamicLight.y = mouseY;
      dynamicLight.intensity = 0.6 + Math.sin(Date.now() * 0.003) * 0.2;
    } else {
      this.addLightSource({
        id: 'dynamic-mouse',
        x: mouseX,
        y: mouseY,
        z: 100,
        intensity: 0.6,
        color: [1.0, 0.8, 0.6],
        type: 'point',
        range: 200,
        falloff: 0.4,
        castsShadows: false,
        animationPhase: 0
      });
    }
  }

  private updateAtmosphericLighting(scrollRatio: number) {
    // Change atmospheric lighting based on scroll position
    this.fogDensity = 0.05 + scrollRatio * 0.1;
    this.atmosphericScattering = 0.1 + scrollRatio * 0.15;
    
    // Update ambient light color temperature
    const warmth = 1 - scrollRatio * 0.3;
    this.ambientLight.r = 0.1 * warmth;
    this.ambientLight.g = 0.15;
    this.ambientLight.b = 0.2 + scrollRatio * 0.1;
  }

  // Caustic light patterns for glass surfaces
  public addCausticPattern(element: HTMLElement, config?: Partial<CausticPattern>) {
    const caustic: CausticPattern = {
      element,
      refractionIndex: config?.refractionIndex || 1.33,
      intensity: config?.intensity || 0.8,
      waviness: config?.waviness || 2.0,
      speed: config?.speed || 0.002,
      scale: config?.scale || 50,
      phase: 0
    };

    this.causticPatterns.push(caustic);
    this.applyCausticCSS(element, caustic);
  }

  private applyCausticCSS(element: HTMLElement, caustic: CausticPattern) {
    // Create CSS animation keyframes for caustic patterns
    const animationName = `caustic-${Date.now()}`;
    
    const keyframes = `
      @keyframes ${animationName} {
        0% { 
          background-position: 0% 0%; 
          filter: hue-rotate(0deg) brightness(1.0);
        }
        25% { 
          background-position: 25% 25%; 
          filter: hue-rotate(90deg) brightness(1.1);
        }
        50% { 
          background-position: 100% 50%; 
          filter: hue-rotate(180deg) brightness(0.9);
        }
        75% { 
          background-position: 75% 75%; 
          filter: hue-rotate(270deg) brightness(1.1);
        }
        100% { 
          background-position: 0% 0%; 
          filter: hue-rotate(360deg) brightness(1.0);
        }
      }
    `;

    // Add keyframes to document
    const style = document.createElement('style');
    style.textContent = keyframes;
    document.head.appendChild(style);

    // Apply caustic effect
    const causticBackground = `
      radial-gradient(ellipse at 20% 30%, rgba(255,255,255,0.3) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 70%, rgba(200,220,255,0.2) 0%, transparent 60%),
      radial-gradient(ellipse at 60% 20%, rgba(255,240,200,0.25) 0%, transparent 40%),
      radial-gradient(ellipse at 30% 80%, rgba(220,255,220,0.15) 0%, transparent 70%)
    `;

    element.style.backgroundImage = causticBackground;
    element.style.backgroundSize = '200% 200%, 150% 150%, 180% 180%, 120% 120%';
    element.style.animation = `${animationName} ${20 / caustic.speed}s ease-in-out infinite`;
    element.style.mixBlendMode = 'overlay';
  }

  // Volumetric god rays for hero sections
  public createGodRays(origin: { x: number; y: number }, count: number = 8) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const length = 300 + Math.random() * 200;
      const width = 20 + Math.random() * 30;
      
      const godRay: GodRay = {
        origin,
        direction: angle,
        length,
        width,
        intensity: 0.3 + Math.random() * 0.4,
        particles: []
      };

      // Create light particles along the ray
      for (let j = 0; j < 20; j++) {
        const t = j / 20;
        const rayX = origin.x + Math.cos(angle) * length * t;
        const rayY = origin.y + Math.sin(angle) * length * t;
        
        godRay.particles.push({
          x: rayX + (Math.random() - 0.5) * width,
          y: rayY + (Math.random() - 0.5) * width,
          opacity: (1 - t) * godRay.intensity,
          size: (1 - t) * 3 + 1
        });
      }

      this.godRays.push(godRay);
    }
  }

  // Chromatic aberration for focus transitions
  public addChromaticAberration(element: HTMLElement, intensity: number = 0.5) {
    const aberration: ChromaticAberration = {
      element,
      intensity,
      redOffset: { x: 0, y: 0 },
      blueOffset: { x: 0, y: 0 },
      animationSpeed: 0.01
    };

    this.chromaticAberrations.push(aberration);
    this.applyChromaticAberrationCSS(element, aberration);
  }

  private applyChromaticAberrationCSS(element: HTMLElement, aberration: ChromaticAberration) {
    const animationName = `chromatic-${Date.now()}`;
    
    const keyframes = `
      @keyframes ${animationName} {
        0% { 
          filter: 
            drop-shadow(2px 0 0 rgba(255,0,0,0.3))
            drop-shadow(-2px 0 0 rgba(0,0,255,0.3))
            contrast(1.1);
        }
        25% { 
          filter: 
            drop-shadow(1px 1px 0 rgba(255,0,0,0.25))
            drop-shadow(-1px -1px 0 rgba(0,0,255,0.25))
            contrast(1.05);
        }
        50% { 
          filter: 
            drop-shadow(-2px 0 0 rgba(255,0,0,0.3))
            drop-shadow(2px 0 0 rgba(0,0,255,0.3))
            contrast(1.1);
        }
        75% { 
          filter: 
            drop-shadow(-1px -1px 0 rgba(255,0,0,0.25))
            drop-shadow(1px 1px 0 rgba(0,0,255,0.25))
            contrast(1.05);
        }
        100% { 
          filter: 
            drop-shadow(2px 0 0 rgba(255,0,0,0.3))
            drop-shadow(-2px 0 0 rgba(0,0,255,0.3))
            contrast(1.1);
        }
      }
    `;

    const style = document.createElement('style');
    style.textContent = keyframes;
    document.head.appendChild(style);

    element.style.animation = `${animationName} 3s ease-in-out infinite`;
    element.style.willChange = 'filter';
  }

  // Film grain overlay system
  private generateFilmGrain() {
    this.filmGrainCanvas.width = this.canvas.width;
    this.filmGrainCanvas.height = this.canvas.height;

    const imageData = this.filmGrainCtx.createImageData(this.canvas.width, this.canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const grain = (Math.random() - 0.5) * this.grainIntensity * 255;
      
      data[i] = grain;     // Red
      data[i + 1] = grain; // Green
      data[i + 2] = grain; // Blue
      data[i + 3] = Math.abs(grain); // Alpha
    }

    this.filmGrainCtx.putImageData(imageData, 0, 0);
  }

  private applyFilmGrain() {
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'overlay';
    this.ctx.globalAlpha = 0.15;
    this.ctx.drawImage(this.filmGrainCanvas, 0, 0);
    this.ctx.restore();
  }

  // Volumetric lighting calculation
  private calculateVolumetricLighting(x: number, y: number): { r: number; g: number; b: number; intensity: number } {
    let totalR = this.ambientLight.r * this.ambientLight.intensity;
    let totalG = this.ambientLight.g * this.ambientLight.intensity;
    let totalB = this.ambientLight.b * this.ambientLight.intensity;
    let totalIntensity = this.ambientLight.intensity;

    this.lightSources.forEach(light => {
      const dx = x - light.x;
      const dy = y - light.y;
      const dz = 0 - light.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (distance < light.range) {
        let attenuation = 1 - (distance / light.range);
        attenuation = Math.pow(attenuation, light.falloff);

        // Apply atmospheric scattering
        const scatteringFactor = Math.exp(-distance * this.atmosphericScattering);
        attenuation *= scatteringFactor;

        // Apply fog attenuation
        const fogFactor = Math.exp(-distance * this.fogDensity);
        attenuation *= fogFactor;

        const lightContribution = light.intensity * attenuation;

        totalR += light.color[0] * lightContribution;
        totalG += light.color[1] * lightContribution;
        totalB += light.color[2] * lightContribution;
        totalIntensity += lightContribution;
      }
    });

    return {
      r: Math.min(totalR, 1),
      g: Math.min(totalG, 1),
      b: Math.min(totalB, 1),
      intensity: Math.min(totalIntensity, 1)
    };
  }

  // Shadow casting system
  private castShadows() {
    const shadowCasters = document.querySelectorAll('.glass-reflection, .movie-card, .magnetic-button');
    
    shadowCasters.forEach(element => {
      const rect = element.getBoundingClientRect();
      
      this.lightSources.forEach(light => {
        if (!light.castsShadows) return;

        const shadowLength = 50;
        const shadowX = rect.left + (rect.left - light.x) * 0.1;
        const shadowY = rect.top + (rect.top - light.y) * 0.1;

        // Apply CSS shadow
        const shadowBlur = Math.max(0, 20 - (Math.abs(rect.left - light.x) + Math.abs(rect.top - light.y)) / 20);
        const shadowOpacity = Math.max(0, 0.3 - (Math.abs(rect.left - light.x) + Math.abs(rect.top - light.y)) / 1000);

        (element as HTMLElement).style.boxShadow = `
          ${shadowX}px ${shadowY}px ${shadowBlur}px rgba(0,0,0,${shadowOpacity}),
          ${shadowX * 0.5}px ${shadowY * 0.5}px ${shadowBlur * 2}px rgba(0,0,0,${shadowOpacity * 0.5})
        `;
      });
    });
  }

  // Real-time lighting render loop
  private startLightingLoop() {
    let lastTime = 0;

    const render = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Update light animations
      this.lightSources.forEach(light => {
        if (light.animationPhase !== undefined) {
          light.animationPhase += deltaTime;
          
          // Animate light intensity
          const baseIntensity = light.intensity;
          light.intensity = baseIntensity + Math.sin(light.animationPhase) * 0.1;
          
          // Animate light position for dynamic lights
          if (light.id === 'key-light') {
            light.x += Math.sin(light.animationPhase * 0.5) * 2;
            light.y += Math.cos(light.animationPhase * 0.3) * 1;
          }
        }
      });

      // Update caustic patterns
      this.causticPatterns.forEach(caustic => {
        caustic.phase += caustic.speed;
      });

      // Update chromatic aberrations
      this.chromaticAberrations.forEach(aberration => {
        aberration.redOffset.x = Math.sin(currentTime * aberration.animationSpeed) * aberration.intensity;
        aberration.blueOffset.x = -aberration.redOffset.x;
      });

      // Update film grain
      this.grainFrame += this.grainAnimationSpeed;
      if (this.grainFrame > 1) {
        this.generateFilmGrain();
        this.grainFrame = 0;
      }

      // Apply lighting effects
      this.castShadows();
      this.applyFilmGrain();

      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
  }

  // Public API methods
  public addLightSource(config: Omit<LightSource, 'animationPhase'> & { animationPhase?: number }) {
    const light: LightSource = {
      ...config,
      animationPhase: config.animationPhase || 0
    };
    
    this.lightSources.push(light);
  }

  public removeLightSource(id: string) {
    const index = this.lightSources.findIndex(light => light.id === id);
    if (index > -1) {
      this.lightSources.splice(index, 1);
    }
  }

  public triggerLightingEffect(type: 'flash' | 'pulse' | 'flicker', intensity: number = 1.0) {
    switch (type) {
      case 'flash':
        this.addLightSource({
          id: 'flash-' + Date.now(),
          x: this.canvas.width / 2,
          y: this.canvas.height / 2,
          z: 50,
          intensity: intensity * 2,
          color: [1, 1, 1],
          type: 'point',
          range: 500,
          falloff: 2,
          castsShadows: false
        });
        
        // Remove flash after short duration
        setTimeout(() => {
          this.removeLightSource('flash-' + (Date.now() - 100));
        }, 100);
        break;

      case 'pulse':
        this.lightSources.forEach(light => {
          if (light.id !== 'ambient') {
            light.intensity *= (1 + intensity * 0.5);
          }
        });
        break;

      case 'flicker':
        this.lightSources.forEach(light => {
          if (light.id !== 'ambient') {
            light.intensity *= (0.8 + Math.random() * 0.4 * intensity);
          }
        });
        break;
    }
  }

  public setFilmGrainIntensity(intensity: number) {
    this.grainIntensity = Math.max(0, Math.min(1, intensity));
  }

  public destroy() {
    this.lightSources = [];
    this.causticPatterns = [];
    this.volumetricRays = [];
    this.godRays = [];
    this.chromaticAberrations = [];
  }
}