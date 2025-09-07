import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

interface UseThreeSceneOptions {
  containerRef: React.RefObject<HTMLDivElement>;
  autoResize?: boolean;
  enableControls?: boolean;
}

interface ThreeSceneState {
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;
  isInitialized: boolean;
}

export const useThreeScene = ({ 
  containerRef, 
  autoResize = true 
}: UseThreeSceneOptions) => {
  const [state, setState] = useState<ThreeSceneState>({
    scene: null,
    camera: null,
    renderer: null,
    isInitialized: false
  });

  const animationFrameRef = useRef<number>();


  // Initialize Three.js scene
  const initializeScene = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const { width, height } = container.getBoundingClientRect();

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a); // Dark background

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75, // Field of view
      width / height, // Aspect ratio
      0.1, // Near plane
      1000 // Far plane
    );
    camera.position.set(0, 0, 5);

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Add renderer to container
    container.appendChild(renderer.domElement);

    // Setup lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Add some point lights for better illumination
    const pointLight1 = new THREE.PointLight(0xffffff, 0.5, 100);
    pointLight1.position.set(-5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 0.5, 100);
    pointLight2.position.set(5, -5, 5);
    scene.add(pointLight2);

    setState({
      scene,
      camera,
      renderer,
      isInitialized: true
    });

    return { scene, camera, renderer };
  }, [containerRef]);

  // Handle window resize
  const handleResize = useCallback(() => {
    if (!containerRef.current || !state.camera || !state.renderer) return;

    const container = containerRef.current;
    const { width, height } = container.getBoundingClientRect();

    state.camera.aspect = width / height;
    state.camera.updateProjectionMatrix();
    state.renderer.setSize(width, height);
  }, [containerRef, state.camera, state.renderer]);

  // Animation loop
  const animate = useCallback(() => {
    if (!state.scene || !state.camera || !state.renderer) return;

    animationFrameRef.current = requestAnimationFrame(animate);
    state.renderer.render(state.scene, state.camera);
  }, [state.scene, state.camera, state.renderer]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (state.renderer && containerRef.current) {
      containerRef.current.removeChild(state.renderer.domElement);
      state.renderer.dispose();
    }

    if (state.scene) {
      // Dispose of all geometries and materials
      state.scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
    }

    setState({
      scene: null,
      camera: null,
      renderer: null,
      isInitialized: false
    });
  }, [state.scene, state.renderer, containerRef]);

  // Initialize on mount
  useEffect(() => {
    const { scene, camera, renderer } = initializeScene() || {};
    
    if (scene && camera && renderer) {
      animate();
    }

    return cleanup;
  }, [initializeScene, animate, cleanup]);

  // Handle resize events
  useEffect(() => {
    if (!autoResize) return;

    const handleWindowResize = () => {
      handleResize();
    };

    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, [autoResize, handleResize]);

  return {
    ...state,
    handleResize,
    cleanup
  };
};
