// src/components/SeatPreviewModal.tsx
import { useState, useEffect, useRef } from "react";
import { X, RotateCw, Info } from "lucide-react";
import * as THREE from "three";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getAuditoriumPreviews, type AuditoriumPreview } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface SeatPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditoriumId: string;
  zoneId: string;
  zoneName: string;
}

const SeatPreviewModal = ({ isOpen, onClose, auditoriumId, zoneId, zoneName }: SeatPreviewModalProps) => {
  const [preview, setPreview] = useState<AuditoriumPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    sphere: THREE.Mesh;
    isUserInteracting: boolean;
    onPointerDownPointerX: number;
    onPointerDownPointerY: number;
    onPointerDownLon: number;
    onPointerDownLat: number;
    lon: number;
    lat: number;
    phi: number;
    theta: number;
  } | null>(null);
  const { toast } = useToast();

  // Load preview data
  useEffect(() => {
    if (!isOpen || !auditoriumId) return;

    const loadPreview = async () => {
      setLoading(true);
      setError(null);
      try {
        const previews = await getAuditoriumPreviews(auditoriumId);
        const zonePreview = previews.find(p => p.zoneId === zoneId);
        
        if (zonePreview) {
          setPreview(zonePreview);
        } else {
          setError(`No preview available for ${zoneName} seating area`);
        }
      } catch (err) {
        console.error('Failed to load preview:', err);
        setError('Failed to load seat preview');
        toast({
          title: "Preview Error",
          description: "Could not load seat preview",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadPreview();
  }, [isOpen, auditoriumId, zoneId, zoneName, toast]);

  // Initialize Three.js 360° viewer
  useEffect(() => {
    if (!isOpen || !preview || !mountRef.current) return;

    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 1, 1100);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    // Create sphere geometry for 360° panorama
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1); // Invert so we see the inside

    // Load texture
    const loader = new THREE.TextureLoader();
    const material = new THREE.MeshBasicMaterial();
    
    loader.load(
      preview.url360,
      (texture) => {
        material.map = texture;
        material.needsUpdate = true;
      },
      undefined,
      (error) => {
        console.error('Error loading 360° image:', error);
        setError('Failed to load 360° view');
      }
    );

    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Interaction state
    const state = {
      scene,
      camera,
      renderer,
      sphere,
      isUserInteracting: false,
      onPointerDownPointerX: 0,
      onPointerDownPointerY: 0,
      onPointerDownLon: 0,
      onPointerDownLat: 0,
      lon: 0,
      lat: 0,
      phi: 0,
      theta: 0
    };

    sceneRef.current = state;

    // Event handlers for both mouse and touch
    const onPointerDown = (event: PointerEvent) => {
      if (event.isPrimary === false) return;
      event.preventDefault();
      state.isUserInteracting = true;
      state.onPointerDownPointerX = event.clientX;
      state.onPointerDownPointerY = event.clientY;
      state.onPointerDownLon = state.lon;
      state.onPointerDownLat = state.lat;
      renderer.domElement.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.isPrimary === false) return;
      if (state.isUserInteracting) {
        state.lon = (state.onPointerDownPointerX - event.clientX) * 0.1 + state.onPointerDownLon;
        state.lat = (event.clientY - state.onPointerDownPointerY) * 0.1 + state.onPointerDownLat;
      }
    };

    const onPointerUp = (event: PointerEvent) => {
      if (event.isPrimary === false) return;
      state.isUserInteracting = false;
      renderer.domElement.releasePointerCapture(event.pointerId);
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const fov = camera.fov + event.deltaY * 0.05;
      camera.fov = THREE.MathUtils.clamp(fov, 10, 75);
      camera.updateProjectionMatrix();
    };

    // Keyboard controls for accessibility
    const onKeyDown = (event: KeyboardEvent) => {
      const step = 5;
      switch (event.key) {
        case 'ArrowLeft':
          state.lon -= step;
          break;
        case 'ArrowRight':
          state.lon += step;
          break;
        case 'ArrowUp':
          state.lat = Math.min(85, state.lat + step);
          break;
        case 'ArrowDown':
          state.lat = Math.max(-85, state.lat - step);
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    // Add event listeners
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('wheel', onWheel);
    renderer.domElement.addEventListener('keydown', onKeyDown);
    renderer.domElement.setAttribute('tabindex', '0'); // Make focusable for keyboard events

    // Animation loop
    const animate = () => {
      if (!sceneRef.current) return;
      
      if (!state.isUserInteracting) {
        state.lon += 0.1; // Auto rotation when not interacting
      }

      state.lat = Math.max(-85, Math.min(85, state.lat));
      state.phi = THREE.MathUtils.degToRad(90 - state.lat);
      state.theta = THREE.MathUtils.degToRad(state.lon);

      const x = 500 * Math.sin(state.phi) * Math.cos(state.theta);
      const y = 500 * Math.cos(state.phi);
      const z = 500 * Math.sin(state.phi) * Math.sin(state.theta);

      camera.lookAt(x, y, z);
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!mount) return;
      const newWidth = mount.clientWidth;
      const newHeight = mount.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      renderer.domElement.removeEventListener('keydown', onKeyDown);
      
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      sceneRef.current = null;
    };
  }, [isOpen, preview]);

  // Cleanup on close
  useEffect(() => {
    if (!isOpen && sceneRef.current) {
      sceneRef.current = null;
    }
  }, [isOpen]);

  const handleClose = () => {
    setPreview(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RotateCw className="w-5 h-5 text-cinema-red" />
              <span>360° View - {zoneName} Seating</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-cinema-red border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-foreground-secondary">Loading 360° view...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-background">
              <div className="text-center max-w-md p-6">
                <Info className="w-12 h-12 text-foreground-secondary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Preview Not Available</h3>
                <p className="text-foreground-secondary">{error}</p>
                <Button onClick={handleClose} className="mt-4">
                  Close
                </Button>
              </div>
            </div>
          )}

          {preview && !error && (
            <>
              <div 
                ref={mountRef} 
                className="w-full h-full cursor-grab active:cursor-grabbing"
                style={{ touchAction: 'none' }}
                tabIndex={0}
                role="img"
                aria-label={`360-degree view of ${zoneName} seating area. Use mouse or touch to look around.`}
              />
              
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">How to navigate:</p>
                    <p className="text-white/80">
                      • Drag/swipe to look around • Scroll/pinch to zoom • Arrow keys to navigate • ESC to close
                    </p>
                    {preview.description && (
                      <p className="text-white/90 mt-1">{preview.description}</p>
                    )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SeatPreviewModal;