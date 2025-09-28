/**
 * CityMate Cinema - Advanced Fluid Dynamics Engine
 * Mercury-like viscous trails, surface tension, wave propagation
 * Competition-Grade Implementation
 */

interface FluidParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  density: number;
  pressure: number;
  viscosity: number;
  life: number;
  color: [number, number, number, number];
  size: number;
  temperature: number;
}

interface RippleWave {
  originX: number;
  originY: number;
  radius: number;
  maxRadius: number;
  amplitude: number;
  frequency: number;
  phase: number;
  speed: number;
  lifetime: number;
  damping: number;
}

interface SurfaceTension {
  element: HTMLElement;
  points: Array<{ x: number; y: number; force: number }>;
  bubbleIntensity: number;
  viscosityField: number;
}

export class FluidDynamicsEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private fluidParticles: FluidParticle[] = [];
  private rippleWaves: RippleWave[] = [];
  private surfaceTensions: SurfaceTension[] = [];
  private mercuryTrail: Array<{ x: number; y: number; intensity: number; age: number }> = [];
  
  // Fluid simulation parameters
  private readonly SMOOTHING_RADIUS = 20;
  private readonly REST_DENSITY = 1000;
  private readonly GAS_CONSTANT = 2000;
  private readonly VISCOSITY = 250;
  private readonly GRAVITY = 9.8;
  private readonly DAMPING = 0.99;
  private readonly SURFACE_TENSION = 0.0728;
  
  // Visual parameters
  private mouseX = 0;
  private mouseY = 0;
  private lastMouseX = 0;
  private lastMouseY = 0;
  private mouseVelocity = { x: 0, y: 0 };
  private trailLength = 50;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    
    this.setupEventListeners();
    this.initializeFluidField();
    this.startSimulation();
  }

  private setupEventListeners() {
    // Enhanced mouse tracking for mercury trails
    document.addEventListener('mousemove', (e) => {
      this.lastMouseX = this.mouseX;
      this.lastMouseY = this.mouseY;
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      
      // Calculate mouse velocity for fluid interaction
      this.mouseVelocity.x = this.mouseX - this.lastMouseX;
      this.mouseVelocity.y = this.mouseY - this.lastMouseY;
      
      // Add mercury trail point
      this.addMercuryTrailPoint(this.mouseX, this.mouseY);
      
      // Update surface tensions
      this.updateSurfaceTensions();
    });

    // Click/touch for wave generation
    document.addEventListener('click', (e) => {
      this.createRippleWave(e.clientX, e.clientY, 200, 0.8);
    });

    // Touch events for mobile
    document.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.mouseX = touch.clientX;
      this.mouseY = touch.clientY;
      this.addMercuryTrailPoint(this.mouseX, this.mouseY);
    });

    document.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      this.createRippleWave(touch.clientX, touch.clientY, 150, 1.0);
    });
  }

  private initializeFluidField() {
    // Create initial fluid particles for ambient effects
    for (let i = 0; i < 100; i++) {
      this.fluidParticles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        density: this.REST_DENSITY,
        pressure: 0,
        viscosity: this.VISCOSITY,
        life: 1.0,
        color: [0.8, 0.9, 1.0, 0.3],
        size: Math.random() * 3 + 1,
        temperature: 293 // Room temperature in Kelvin
      });
    }
  }

  // Mercury trail system - viscous liquid following cursor
  private addMercuryTrailPoint(x: number, y: number) {
    const velocity = Math.sqrt(this.mouseVelocity.x ** 2 + this.mouseVelocity.y ** 2);
    const intensity = Math.min(velocity / 10, 1.0);
    
    this.mercuryTrail.push({
      x, y,
      intensity: intensity * 0.8 + 0.2,
      age: 0
    });

    // Maintain trail length
    if (this.mercuryTrail.length > this.trailLength) {
      this.mercuryTrail.shift();
    }

    // Create fluid particles along the trail for interaction
    if (velocity > 5) {
      this.createFluidParticlesAlongTrail(x, y, velocity);
    }
  }

  private createFluidParticlesAlongTrail(x: number, y: number, velocity: number) {
    const count = Math.min(Math.floor(velocity / 5), 10);
    
    for (let i = 0; i < count; i++) {
      const offset = (Math.random() - 0.5) * 20;
      const particle: FluidParticle = {
        x: x + offset,
        y: y + offset,
        vx: this.mouseVelocity.x * 0.1 + (Math.random() - 0.5) * 2,
        vy: this.mouseVelocity.y * 0.1 + (Math.random() - 0.5) * 2,
        density: this.REST_DENSITY * 1.2,
        pressure: 0,
        viscosity: this.VISCOSITY * 2, // Higher viscosity for mercury-like behavior
        life: 1.0,
        color: [0.7, 0.8, 0.9, 0.6],
        size: Math.random() * 2 + 1,
        temperature: 293 + velocity // Kinetic energy affects temperature
      };

      this.fluidParticles.push(particle);
    }
  }

  // Ripple wave propagation system
  private createRippleWave(x: number, y: number, maxRadius: number, amplitude: number) {
    const wave: RippleWave = {
      originX: x,
      originY: y,
      radius: 0,
      maxRadius,
      amplitude,
      frequency: 0.1,
      phase: 0,
      speed: 150, // pixels per second
      lifetime: 3.0,
      damping: 0.95
    };

    this.rippleWaves.push(wave);

    // Create fluid disturbance at wave origin
    this.createFluidDisturbance(x, y, amplitude * 50);
  }

  private createFluidDisturbance(x: number, y: number, force: number) {
    this.fluidParticles.forEach(particle => {
      const dx = particle.x - x;
      const dy = particle.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 100) {
        const forceRatio = 1 - (distance / 100);
        const forceX = (dx / distance) * force * forceRatio;
        const forceY = (dy / distance) * force * forceRatio;
        
        particle.vx += forceX * 0.1;
        particle.vy += forceY * 0.1;
        particle.temperature += forceRatio * 10; // Energy adds heat
      }
    });
  }

  // Surface tension effects for card borders
  public addSurfaceTension(element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    const points: Array<{ x: number; y: number; force: number }> = [];
    
    // Create tension points around the element perimeter
    const numPoints = 20;
    for (let i = 0; i < numPoints; i++) {
      const t = i / numPoints;
      let x, y;
      
      if (t < 0.25) {
        // Top edge
        x = rect.left + (t * 4) * rect.width;
        y = rect.top;
      } else if (t < 0.5) {
        // Right edge
        x = rect.right;
        y = rect.top + ((t - 0.25) * 4) * rect.height;
      } else if (t < 0.75) {
        // Bottom edge
        x = rect.right - ((t - 0.5) * 4) * rect.width;
        y = rect.bottom;
      } else {
        // Left edge
        x = rect.left;
        y = rect.bottom - ((t - 0.75) * 4) * rect.height;
      }
      
      points.push({ x, y, force: 0 });
    }

    const surfaceTension: SurfaceTension = {
      element,
      points,
      bubbleIntensity: 0,
      viscosityField: 1.0
    };

    this.surfaceTensions.push(surfaceTension);
  }

  private updateSurfaceTensions() {
    this.surfaceTensions.forEach(tension => {
      const rect = tension.element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const mouseDistance = Math.sqrt(
        (this.mouseX - centerX) ** 2 + (this.mouseY - centerY) ** 2
      );

      // Update bubble intensity based on proximity
      if (mouseDistance < 150) {
        tension.bubbleIntensity = Math.max(0, 1 - mouseDistance / 150);
        
        // Create bubble effect on surface tension points
        tension.points.forEach(point => {
          const pointDistance = Math.sqrt(
            (this.mouseX - point.x) ** 2 + (this.mouseY - point.y) ** 2
          );
          
          if (pointDistance < 100) {
            point.force = Math.max(0, 1 - pointDistance / 100);
            
            // Create micro-bubbles
            if (Math.random() < 0.1) {
              this.createMicroBubble(point.x, point.y);
            }
          } else {
            point.force *= 0.9; // Decay
          }
        });
      } else {
        tension.bubbleIntensity *= 0.95;
        tension.points.forEach(point => {
          point.force *= 0.9;
        });
      }
    });
  }

  private createMicroBubble(x: number, y: number) {
    const bubble: FluidParticle = {
      x: x + (Math.random() - 0.5) * 10,
      y: y + (Math.random() - 0.5) * 10,
      vx: (Math.random() - 0.5) * 5,
      vy: -Math.random() * 3 - 1, // Bubbles rise
      density: this.REST_DENSITY * 0.1, // Bubbles are less dense
      pressure: 0,
      viscosity: this.VISCOSITY * 0.5,
      life: 1.0,
      color: [1.0, 1.0, 1.0, 0.4],
      size: Math.random() * 1.5 + 0.5,
      temperature: 293
    };

    this.fluidParticles.push(bubble);
  }

  // Fluid simulation physics
  private updateFluidPhysics(deltaTime: number) {
    // Calculate density and pressure for each particle
    this.fluidParticles.forEach(particle => {
      particle.density = this.calculateDensity(particle);
      particle.pressure = this.GAS_CONSTANT * (particle.density - this.REST_DENSITY);
    });

    // Apply forces
    this.fluidParticles.forEach((particle, index) => {
      const pressureForce = this.calculatePressureForce(particle);
      const viscosityForce = this.calculateViscosityForce(particle);
      const surfaceForce = this.calculateSurfaceTensionForce(particle);
      
      // Apply forces
      particle.vx += (pressureForce.x + viscosityForce.x + surfaceForce.x) * deltaTime;
      particle.vy += (pressureForce.y + viscosityForce.y + surfaceForce.y + this.GRAVITY) * deltaTime;
      
      // Apply damping
      particle.vx *= this.DAMPING;
      particle.vy *= this.DAMPING;
      
      // Update position
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;
      
      // Age and lifecycle
      particle.life -= deltaTime / 5; // 5 second lifetime
      if (particle.life <= 0) {
        this.fluidParticles.splice(index, 1);
        return;
      }
      
      // Update visual properties
      particle.color[3] = particle.life * 0.6;
      particle.size = (particle.life * 2 + 0.5) * (particle.density / this.REST_DENSITY);
      
      // Temperature cooling
      particle.temperature = Math.max(particle.temperature * 0.999, 293);
      
      // Boundary conditions
      this.applyBoundaryConditions(particle);
    });

    // Update mercury trail aging
    this.mercuryTrail.forEach((point, index) => {
      point.age += deltaTime;
      point.intensity *= 0.98;
      
      if (point.age > 2 || point.intensity < 0.1) {
        this.mercuryTrail.splice(index, 1);
      }
    });

    // Update ripple waves
    this.rippleWaves.forEach((wave, index) => {
      wave.radius += wave.speed * deltaTime;
      wave.phase += wave.frequency * deltaTime;
      wave.amplitude *= wave.damping;
      wave.lifetime -= deltaTime;
      
      if (wave.radius > wave.maxRadius || wave.lifetime <= 0) {
        this.rippleWaves.splice(index, 1);
      }
    });
  }

  private calculateDensity(particle: FluidParticle): number {
    let density = 0;
    
    this.fluidParticles.forEach(neighbor => {
      const dx = particle.x - neighbor.x;
      const dy = particle.y - neighbor.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < this.SMOOTHING_RADIUS) {
        const factor = this.SMOOTHING_RADIUS * this.SMOOTHING_RADIUS - distance * distance;
        density += factor * factor * factor;
      }
    });
    
    return density * 315 / (64 * Math.PI * Math.pow(this.SMOOTHING_RADIUS, 9));
  }

  private calculatePressureForce(particle: FluidParticle): { x: number; y: number } {
    let forceX = 0;
    let forceY = 0;
    
    this.fluidParticles.forEach(neighbor => {
      if (neighbor === particle) return;
      
      const dx = particle.x - neighbor.x;
      const dy = particle.y - neighbor.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < this.SMOOTHING_RADIUS && distance > 0) {
        const factor = (this.SMOOTHING_RADIUS - distance) * (this.SMOOTHING_RADIUS - distance);
        const pressure = (particle.pressure + neighbor.pressure) / (2 * neighbor.density);
        
        forceX += pressure * factor * (dx / distance);
        forceY += pressure * factor * (dy / distance);
      }
    });
    
    return {
      x: forceX * -45 / (Math.PI * Math.pow(this.SMOOTHING_RADIUS, 6)),
      y: forceY * -45 / (Math.PI * Math.pow(this.SMOOTHING_RADIUS, 6))
    };
  }

  private calculateViscosityForce(particle: FluidParticle): { x: number; y: number } {
    let forceX = 0;
    let forceY = 0;
    
    this.fluidParticles.forEach(neighbor => {
      if (neighbor === particle) return;
      
      const dx = particle.x - neighbor.x;
      const dy = particle.y - neighbor.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < this.SMOOTHING_RADIUS) {
        const factor = this.SMOOTHING_RADIUS - distance;
        
        forceX += (neighbor.vx - particle.vx) * factor / neighbor.density;
        forceY += (neighbor.vy - particle.vy) * factor / neighbor.density;
      }
    });
    
    return {
      x: forceX * this.VISCOSITY * 45 / (Math.PI * Math.pow(this.SMOOTHING_RADIUS, 6)),
      y: forceY * this.VISCOSITY * 45 / (Math.PI * Math.pow(this.SMOOTHING_RADIUS, 6))
    };
  }

  private calculateSurfaceTensionForce(particle: FluidParticle): { x: number; y: number } {
    // Simplified surface tension calculation
    let forceX = 0;
    let forceY = 0;
    
    // Add force towards areas of higher particle density
    const densityGradient = this.calculateDensityGradient(particle);
    
    forceX += densityGradient.x * this.SURFACE_TENSION;
    forceY += densityGradient.y * this.SURFACE_TENSION;
    
    return { x: forceX, y: forceY };
  }

  private calculateDensityGradient(particle: FluidParticle): { x: number; y: number } {
    let gradientX = 0;
    let gradientY = 0;
    
    this.fluidParticles.forEach(neighbor => {
      if (neighbor === particle) return;
      
      const dx = particle.x - neighbor.x;
      const dy = particle.y - neighbor.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < this.SMOOTHING_RADIUS && distance > 0) {
        const factor = (this.SMOOTHING_RADIUS - distance) * (this.SMOOTHING_RADIUS - distance);
        
        gradientX += factor * (dx / distance) / neighbor.density;
        gradientY += factor * (dy / distance) / neighbor.density;
      }
    });
    
    return { x: gradientX, y: gradientY };
  }

  private applyBoundaryConditions(particle: FluidParticle) {
    const restitution = 0.5;
    
    if (particle.x < 0) {
      particle.x = 0;
      particle.vx *= -restitution;
    } else if (particle.x > this.canvas.width) {
      particle.x = this.canvas.width;
      particle.vx *= -restitution;
    }
    
    if (particle.y < 0) {
      particle.y = 0;
      particle.vy *= -restitution;
    } else if (particle.y > this.canvas.height) {
      particle.y = this.canvas.height;
      particle.vy *= -restitution;
    }
  }

  // Rendering system
  private render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Render ripple waves
    this.renderRippleWaves();
    
    // Render mercury trail
    this.renderMercuryTrail();
    
    // Render fluid particles
    this.renderFluidParticles();
    
    // Render surface tension effects
    this.renderSurfaceTensions();
  }

  private renderRippleWaves() {
    this.rippleWaves.forEach(wave => {
      const alpha = wave.amplitude * wave.lifetime / 3;
      
      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      this.ctx.strokeStyle = `hsl(200, 80%, 60%)`;
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([5, 5]);
      
      this.ctx.beginPath();
      this.ctx.arc(wave.originX, wave.originY, wave.radius, 0, Math.PI * 2);
      this.ctx.stroke();
      
      this.ctx.restore();
    });
  }

  private renderMercuryTrail() {
    if (this.mercuryTrail.length < 2) return;
    
    this.ctx.save();
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    for (let i = 1; i < this.mercuryTrail.length; i++) {
      const current = this.mercuryTrail[i];
      const previous = this.mercuryTrail[i - 1];
      
      const alpha = current.intensity * (1 - current.age / 2);
      const width = current.intensity * 8;
      
      this.ctx.globalAlpha = alpha;
      this.ctx.strokeStyle = `hsl(240, 30%, 70%)`;
      this.ctx.lineWidth = width;
      
      this.ctx.beginPath();
      this.ctx.moveTo(previous.x, previous.y);
      this.ctx.lineTo(current.x, current.y);
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }

  private renderFluidParticles() {
    this.fluidParticles.forEach(particle => {
      this.ctx.save();
      this.ctx.globalAlpha = particle.color[3];
      
      const gradient = this.ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size * 2
      );
      
      gradient.addColorStop(0, `rgba(${particle.color[0] * 255}, ${particle.color[1] * 255}, ${particle.color[2] * 255}, ${particle.color[3]})`);
      gradient.addColorStop(1, `rgba(${particle.color[0] * 255}, ${particle.color[1] * 255}, ${particle.color[2] * 255}, 0)`);
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.restore();
    });
  }

  private renderSurfaceTensions() {
    this.surfaceTensions.forEach(tension => {
      if (tension.bubbleIntensity > 0.1) {
        tension.points.forEach(point => {
          if (point.force > 0.1) {
            this.ctx.save();
            this.ctx.globalAlpha = point.force * tension.bubbleIntensity;
            
            const gradient = this.ctx.createRadialGradient(
              point.x, point.y, 0,
              point.x, point.y, 10
            );
            
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
            gradient.addColorStop(1, 'rgba(200, 220, 255, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 10 * point.force, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
          }
        });
      }
    });
  }

  // Main simulation loop
  private startSimulation() {
    let lastTime = 0;
    
    const simulate = (currentTime: number) => {
      const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.016); // Cap at 60fps
      lastTime = currentTime;
      
      this.updateFluidPhysics(deltaTime);
      this.render();
      
      requestAnimationFrame(simulate);
    };
    
    requestAnimationFrame(simulate);
  }

  // Public API
  public triggerFluidEffect(type: 'splash' | 'vortex' | 'explosion', x: number, y: number, intensity: number = 1.0) {
    switch (type) {
      case 'splash':
        this.createRippleWave(x, y, 150 * intensity, 0.8 * intensity);
        this.createFluidDisturbance(x, y, 100 * intensity);
        break;
        
      case 'vortex':
        // Create spinning fluid motion
        for (let i = 0; i < 20; i++) {
          const angle = (i / 20) * Math.PI * 2;
          const radius = 50 * intensity;
          const px = x + Math.cos(angle) * radius;
          const py = y + Math.sin(angle) * radius;
          this.createFluidDisturbance(px, py, 30 * intensity);
        }
        break;
        
      case 'explosion':
        this.createRippleWave(x, y, 300 * intensity, 1.5 * intensity);
        this.createFluidDisturbance(x, y, 200 * intensity);
        break;
    }
  }

  public destroy() {
    this.fluidParticles = [];
    this.rippleWaves = [];
    this.surfaceTensions = [];
    this.mercuryTrail = [];
  }
}