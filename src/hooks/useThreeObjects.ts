import { useRef, useCallback } from 'react';
import * as THREE from 'three';

interface TextureLoaderOptions {
  crossOrigin?: string;
  generateMipmaps?: boolean;
}

export const useThreeObjects = () => {
  const textureLoader = useRef<THREE.TextureLoader>();
  const loadedTextures = useRef<Map<string, THREE.Texture>>(new Map());

  // Initialize texture loader
  const getTextureLoader = useCallback(() => {
    if (!textureLoader.current) {
      textureLoader.current = new THREE.TextureLoader();
    }
    return textureLoader.current;
  }, []);

  // Load texture with caching
  const loadTexture = useCallback((
    url: string, 
    options: TextureLoaderOptions = {}
  ): Promise<THREE.Texture> => {
    return new Promise((resolve, reject) => {
      // Check if texture is already loaded
      if (loadedTextures.current.has(url)) {
        resolve(loadedTextures.current.get(url)!);
        return;
      }

      const loader = getTextureLoader();
      
      if (options.crossOrigin) {
        loader.setCrossOrigin(options.crossOrigin);
      }

      loader.load(
        url,
        (texture) => {
          if (options.generateMipmaps !== false) {
            texture.generateMipmaps = true;
          }
          texture.needsUpdate = true;
          loadedTextures.current.set(url, texture);
          resolve(texture);
        },
        undefined,
        (error) => {
          console.error('Error loading texture:', error);
          reject(error);
        }
      );
    });
  }, [getTextureLoader]);

  // Create plane geometry with texture
  const createTexturedPlane = useCallback((
    width: number,
    height: number,
    textureUrl?: string,
    options: {
      transparent?: boolean;
      opacity?: number;
      side?: THREE.Side;
    } = {}
  ): Promise<THREE.Mesh> => {
    return new Promise(async (resolve) => {
      const geometry = new THREE.PlaneGeometry(width, height);
      let material: THREE.Material;

      if (textureUrl) {
        try {
          const texture = await loadTexture(textureUrl);
          material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: options.transparent || false,
            opacity: options.opacity || 1,
            side: options.side || THREE.FrontSide
          });
        } catch (error) {
          console.warn('Failed to load texture, using fallback material');
          material = new THREE.MeshBasicMaterial({
            color: 0x888888,
            transparent: options.transparent || false,
            opacity: options.opacity || 1
          });
        }
      } else {
        material = new THREE.MeshBasicMaterial({
          color: 0x888888,
          transparent: options.transparent || false,
          opacity: options.opacity || 1
        });
      }

      const mesh = new THREE.Mesh(geometry, material);
      resolve(mesh);
    });
  }, [loadTexture]);

  // Create card geometry for scenes
  const createSceneCard = useCallback((
    width: number,
    height: number,
    depth: number,
    textureUrl?: string,
    options: {
      transparent?: boolean;
      opacity?: number;
      castShadow?: boolean;
      receiveShadow?: boolean;
    } = {}
  ): Promise<THREE.Group> => {
    return new Promise(async (resolve) => {
      const group = new THREE.Group();

      // Create front face
      const frontPlane = await createTexturedPlane(
        width, 
        height, 
        textureUrl,
        { 
          transparent: options.transparent,
          opacity: options.opacity,
          side: THREE.FrontSide
        }
      );
      frontPlane.position.z = depth / 2;
      frontPlane.castShadow = options.castShadow || false;
      frontPlane.receiveShadow = options.receiveShadow || false;
      group.add(frontPlane);

      // Create back face
      const backPlane = await createTexturedPlane(
        width, 
        height, 
        undefined,
        { 
          transparent: true,
          opacity: 0.1,
          side: THREE.BackSide
        }
      );
      backPlane.position.z = -depth / 2;
      backPlane.castShadow = options.castShadow || false;
      backPlane.receiveShadow = options.receiveShadow || false;
      group.add(backPlane);

      // Create edges
      const edgeGeometry = new THREE.BoxGeometry(width, height, depth);
      const edgeMaterial = new THREE.MeshBasicMaterial({
        color: 0x333333,
        transparent: true,
        opacity: 0.3
      });
      const edges = new THREE.Mesh(edgeGeometry, edgeMaterial);
      edges.castShadow = options.castShadow || false;
      edges.receiveShadow = options.receiveShadow || false;
      group.add(edges);

      resolve(group);
    });
  }, [createTexturedPlane]);

  // Cleanup function
  const cleanup = useCallback(() => {
    // Dispose of all loaded textures
    loadedTextures.current.forEach((texture) => {
      texture.dispose();
    });
    loadedTextures.current.clear();
  }, []);

  return {
    loadTexture,
    createTexturedPlane,
    createSceneCard,
    cleanup
  };
};
