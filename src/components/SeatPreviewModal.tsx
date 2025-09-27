// src/components/SeatPreviewModal.tsx
import { useState, useEffect, useRef } from "react";
import { X, RotateCw, Info, Eye, Play, Pause, Volume2, VolumeX, Maximize, Download } from "lucide-react";
import * as THREE from "three";
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
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const mountRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
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
    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || window.innerHeight;

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
    setIsPlaying(true);
    setIsMuted(false);
    setVolume(1);
    onClose();
  };

  const handleVideoError = () => {
    console.error('Video failed to load, falling back to 360° image');
    setVideoError(true);
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const showVideo = preview?.videoUrl && !videoError;
  const showImage = preview && (!preview.videoUrl || videoError);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 cursor-pointer" 
        onClick={handleBackdropClick}
        aria-label="Close preview"
      />
      
      {/* Container */}
      <div 
        ref={containerRef}
        className="relative w-full h-full flex flex-col"
      >
        {/* Top Bar */}
        <div className="relative z-10 flex items-center justify-between p-4 bg-background/10 backdrop-blur-md border-b border-border/20">
          <div className="flex items-center gap-3">
            <Eye className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">
              {zoneName} Seating Preview
            </h2>
          </div>
          
          <Button
            onClick={handleClose}
            variant="ghost"
            size="icon"
            className="hover:bg-destructive/20 hover:text-destructive"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex items-center justify-center p-4">
          {loading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-lg text-muted-foreground">Loading preview...</p>
            </div>
          ) : error ? (
            <div className="text-center max-w-md">
              <Info className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Preview Not Available</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={handleClose} variant="outline">
                Close
              </Button>
            </div>
          ) : preview ? (
            <div className="w-full h-full flex flex-col">
              {/* Main Media Content */}
              <div className="flex-1 flex items-center justify-center">
                {showVideo ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <video 
                      ref={videoRef}
                      src={preview.videoUrl}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                      autoPlay
                      loop
                      playsInline
                      onError={handleVideoError}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onVolumeChange={(e) => {
                        const video = e.target as HTMLVideoElement;
                        setVolume(video.volume);
                        setIsMuted(video.muted);
                      }}
                    />
                    
                    {/* Video Controls Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Button
                            onClick={togglePlayPause}
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/20"
                          >
                            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                          </Button>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={toggleMute}
                              variant="ghost"
                              size="icon"
                              className="text-white hover:bg-white/20"
                            >
                              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                            </Button>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              value={volume}
                              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                              className="w-20 accent-primary"
                            />
                          </div>
                        </div>
                        
                        <div className="text-xs text-white/70">
                          Download disabled
                        </div>
                      </div>
                    </div>
                  </div>
                ) : showImage ? (
                  <div className="w-full h-full" ref={mountRef}>
                    {/* Three.js 360° viewer will mount here */}
                  </div>
                ) : null}
              </div>

              {/* Bottom Info */}
              <div className="relative z-10 p-4 bg-background/10 backdrop-blur-md space-y-3">
                {preview.description && (
                  <p className="text-center text-muted-foreground">
                    {preview.description}
                  </p>
                )}
                
                {showImage && (
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <RotateCw className="h-4 w-4" />
                      <span>Drag to rotate</span>
                    </div>
                    <div>•</div>
                    <div>Scroll to zoom</div>
                    <div>•</div>
                    <div>Press ESC to close</div>
                  </div>
                )}
                
                {videoError && preview.videoUrl && (
                  <div className="text-center text-sm text-yellow-400">
                    Video unavailable, showing 360° image
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default SeatPreviewModal;