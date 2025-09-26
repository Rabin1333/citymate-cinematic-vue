// src/components/SeatPreviewModal.tsx
import { useState, useEffect, useRef } from "react";
import { X, RotateCw, Info, Eye } from "lucide-react";
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
  const [videoError, setVideoError] = useState(false);
  const mountRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
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
    if (!isOpen || !auditoriumId || !zoneId) return;

    const loadPreview = async () => {
      setLoading(true);
      setError(null);
      setVideoError(false);
      try {
        const previews = await getAuditoriumPreviews(auditoriumId);
        console.log('Loaded previews for auditorium:', auditoriumId, previews);
        
        if (!previews || previews.length === 0) {
          setError(`No previews available for this auditorium`);
          return;
        }
        
        const zonePreview = previews.find(p => p.zoneId === zoneId);
        
        if (zonePreview) {
          setPreview(zonePreview);
        } else {
          setError(`No preview available for ${zoneName} seating area`);
        }
      } catch (err) {
        console.error('Failed to load preview:', err);
        setError(err instanceof Error ? err.message : 'Failed to load seat preview');
      } finally {
        setLoading(false);
      }
    };

    loadPreview();
  }, [isOpen, auditoriumId, zoneId, zoneName]);

  // Initialize Three.js 360° viewer for image fallback
  useEffect(() => {
    if (!isOpen || !preview || preview.videoUrl || videoError === false || !mountRef.current) return;

    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 1, 1100);
    camera.position.set(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    // Create sphere geometry
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1); // Invert for inside view

    // Load texture
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(
      preview.url360,
      () => {
        console.log('360° image loaded successfully');
      },
      undefined,
      (err) => {
        console.error('Failed to load 360° image:', err);
        setError('Failed to load preview image');
      }
    );

    const material = new THREE.MeshBasicMaterial({ map: texture });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Initial camera setup
    let lon = 0, lat = 0;
    let phi = 0, theta = 0;
    let isUserInteracting = false;
    let onPointerDownPointerX = 0, onPointerDownPointerY = 0;
    let onPointerDownLon = 0, onPointerDownLat = 0;

    const updateCamera = () => {
      lat = Math.max(-85, Math.min(85, lat));
      phi = THREE.MathUtils.degToRad(90 - lat);
      theta = THREE.MathUtils.degToRad(lon);

      camera.position.x = 0.1 * Math.sin(phi) * Math.cos(theta);
      camera.position.y = 0.1 * Math.cos(phi);
      camera.position.z = 0.1 * Math.sin(phi) * Math.sin(theta);

      camera.lookAt(0, 0, 0);
    };

    // Mouse events
    const onPointerDown = (event: PointerEvent) => {
      isUserInteracting = true;
      onPointerDownPointerX = event.clientX;
      onPointerDownPointerY = event.clientY;
      onPointerDownLon = lon;
      onPointerDownLat = lat;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (isUserInteracting) {
        lon = (onPointerDownPointerX - event.clientX) * 0.1 + onPointerDownLon;
        lat = (event.clientY - onPointerDownPointerY) * 0.1 + onPointerDownLat;
        updateCamera();
      }
    };

    const onPointerUp = () => {
      isUserInteracting = false;
    };

    // Touch events
    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        event.preventDefault();
        isUserInteracting = true;
        onPointerDownPointerX = event.touches[0].clientX;
        onPointerDownPointerY = event.touches[0].clientY;
        onPointerDownLon = lon;
        onPointerDownLat = lat;
      }
    };

    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 1 && isUserInteracting) {
        event.preventDefault();
        lon = (onPointerDownPointerX - event.touches[0].clientX) * 0.1 + onPointerDownLon;
        lat = (event.touches[0].clientY - onPointerDownPointerY) * 0.1 + onPointerDownLat;
        updateCamera();
      }
    };

    const onTouchEnd = (event: TouchEvent) => {
      event.preventDefault();
      isUserInteracting = false;
    };

    // Wheel event for zooming
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      camera.fov += event.deltaY * 0.05;
      camera.fov = Math.max(10, Math.min(75, camera.fov));
      camera.updateProjectionMatrix();
    };

    // Keyboard events
    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowLeft':
          lon -= 5;
          break;
        case 'ArrowRight':
          lon += 5;
          break;
        case 'ArrowUp':
          lat += 5;
          break;
        case 'ArrowDown':
          lat -= 5;
          break;
        case 'Escape':
          onClose();
          return;
      }
      updateCamera();
    };

    // Add event listeners
    mount.addEventListener('pointerdown', onPointerDown);
    mount.addEventListener('pointermove', onPointerMove);
    mount.addEventListener('pointerup', onPointerUp);
    mount.addEventListener('touchstart', onTouchStart, { passive: false });
    mount.addEventListener('touchmove', onTouchMove, { passive: false });
    mount.addEventListener('touchend', onTouchEnd, { passive: false });
    mount.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);

    // Resize handler
    const handleResize = () => {
      const newWidth = mount.clientWidth;
      const newHeight = mount.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      if (!isUserInteracting) {
        lon += 0.1;
      }
      updateCamera();
      renderer.render(scene, camera);
      if (sceneRef.current) {
        requestAnimationFrame(animate);
      }
    };

    // Store scene reference
    sceneRef.current = {
      scene, camera, renderer, sphere,
      isUserInteracting, onPointerDownPointerX, onPointerDownPointerY,
      onPointerDownLon, onPointerDownLat, lon, lat, phi, theta
    };

    updateCamera();
    animate();

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', onKeyDown);
      
      if (mount && renderer.domElement) {
        mount.removeEventListener('pointerdown', onPointerDown);
        mount.removeEventListener('pointermove', onPointerMove);
        mount.removeEventListener('pointerup', onPointerUp);
        mount.removeEventListener('touchstart', onTouchStart);
        mount.removeEventListener('touchmove', onTouchMove);
        mount.removeEventListener('touchend', onTouchEnd);
        mount.removeEventListener('wheel', onWheel);
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      texture.dispose();
      sceneRef.current = null;
    };
  }, [isOpen, preview, videoError, onClose]);

  // Cleanup on close or when switching to video
  useEffect(() => {
    if (!isOpen && sceneRef.current) {
      sceneRef.current = null;
    }
  }, [isOpen]);

  // Stop video when modal closes
  useEffect(() => {
    if (!isOpen && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isOpen]);

  const handleClose = () => {
    setPreview(null);
    setError(null);
    setVideoError(false);
    onClose();
  };

  const handleVideoError = () => {
    console.error('Video failed to load, falling back to 360° image');
    setVideoError(true);
  };

  const showVideo = preview?.videoUrl && !videoError;
  const showImage = preview && (!preview.videoUrl || videoError);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Eye className="h-5 w-5 text-cinema-red" />
            View - {zoneName} Seating
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 p-6 pt-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cinema-red mx-auto mb-4"></div>
                <p className="text-foreground-secondary">Loading preview...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Info className="h-12 w-12 text-foreground-secondary mx-auto mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">Preview Not Available</p>
                <p className="text-foreground-secondary">{error}</p>
                <Button 
                  onClick={handleClose}
                  className="mt-4"
                  variant="outline"
                >
                  Close
                </Button>
              </div>
            </div>
          ) : preview ? (
            <div className="h-full flex flex-col">
              {/* Video or Image Content */}
              <div className="flex-1 flex items-center justify-center bg-black rounded-xl overflow-hidden">
                {showVideo ? (
                  <video 
                    ref={videoRef}
                    src={preview.videoUrl}
                    className="w-full h-auto rounded-xl"
                    controls
                    autoPlay
                    loop
                    playsInline
                    onError={handleVideoError}
                  />
                ) : showImage ? (
                  // Fallback to 360° image viewer
                  <div className="w-full h-full relative" ref={mountRef}>
                    {/* Three.js will mount here */}
                  </div>
                ) : null}
              </div>

              {/* Description */}
              {preview.description && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-foreground-secondary">
                    {preview.description}
                  </p>
                </div>
              )}

              {/* Instructions - only show for 360° images */}
              {showImage && (
                <div className="mt-4 p-4 bg-cinema-red/10 border border-cinema-red/20 rounded-lg">
                  <div className="flex items-center gap-2 text-cinema-red mb-2">
                    <RotateCw className="h-4 w-4" />
                    <span className="text-sm font-medium">Navigation</span>
                  </div>
                  <p className="text-xs text-foreground-secondary">
                    Click and drag to look around • Scroll to zoom • Use arrow keys for keyboard navigation
                  </p>
                </div>
              )}

              {/* Video fallback message */}
              {videoError && preview.videoUrl && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Video preview could not be loaded, showing 360° image instead.
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SeatPreviewModal;