import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { GeneratedScene } from '../../types';

interface SceneCard3DProps {
  scene: GeneratedScene;
  index: number;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
  isSelected: boolean;
  isHovered: boolean;
}

export const SceneCard3D: React.FC<SceneCard3DProps> = ({
  scene,
  position,
  rotation,
  isSelected,
  isHovered
}) => {
  const groupRef = useRef<THREE.Group>();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  // Load texture
  useEffect(() => {
    const loadTexture = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        const textureLoader = new THREE.TextureLoader();
        const loadedTexture = await new Promise<THREE.Texture>((resolve, reject) => {
          textureLoader.load(
            scene.imageUrl,
            resolve,
            undefined,
            reject
          );
        });

        loadedTexture.generateMipmaps = true;
        loadedTexture.needsUpdate = true;
        setTexture(loadedTexture);
        setIsLoading(false);
      } catch (error) {
        console.error(`Failed to load texture for scene ${scene.id}:`, error);
        setHasError(true);
        setIsLoading(false);
      }
    };

    loadTexture();

    return () => {
      if (texture) {
        texture.dispose();
      }
    };
  }, [scene.imageUrl, scene.id]);

  // Create card geometry and materials
  const createCard = () => {
    const group = new THREE.Group();
    groupRef.current = group;

    // Card dimensions
    const width = 3;
    const height = 2;
    const depth = 0.1;
    const borderWidth = 0.05;

    // Main card face
    const cardGeometry = new THREE.PlaneGeometry(width, height);
    let cardMaterial: THREE.Material;

    if (isLoading) {
      // Loading state material
      cardMaterial = new THREE.MeshBasicMaterial({
        color: 0x666666,
        transparent: true,
        opacity: 0.8
      });
    } else if (hasError) {
      // Error state material
      cardMaterial = new THREE.MeshBasicMaterial({
        color: 0xff4444,
        transparent: true,
        opacity: 0.8
      });
    } else if (texture) {
      // Success state with texture
      cardMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.95
      });
    } else {
      // Fallback material
      cardMaterial = new THREE.MeshBasicMaterial({
        color: 0x888888,
        transparent: true,
        opacity: 0.8
      });
    }

    const cardMesh = new THREE.Mesh(cardGeometry, cardMaterial);
    cardMesh.position.z = depth / 2;
    cardMesh.castShadow = true;
    cardMesh.receiveShadow = true;
    group.add(cardMesh);

    // Card border/frame
    const frameGeometry = new THREE.BoxGeometry(width + borderWidth, height + borderWidth, depth);
    const frameMaterial = new THREE.MeshBasicMaterial({
      color: isSelected ? 0x3b82f6 : (isHovered ? 0x6366f1 : 0x374151),
      transparent: true,
      opacity: 0.8
    });
    const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
    frameMesh.castShadow = true;
    frameMesh.receiveShadow = true;
    group.add(frameMesh);

    // Scene number badge
    const badgeGeometry = new THREE.CircleGeometry(0.2, 32);
    const badgeMaterial = new THREE.MeshBasicMaterial({
      color: 0x1f2937,
      transparent: true,
      opacity: 0.9
    });
    const badgeMesh = new THREE.Mesh(badgeGeometry, badgeMaterial);
    badgeMesh.position.set(-width/2 + 0.3, height/2 - 0.3, depth/2 + 0.01);
    group.add(badgeMesh);

    // Add text for scene number (simplified - in real implementation you'd use TextGeometry)
    const textGeometry = new THREE.PlaneGeometry(0.3, 0.3);
    const textMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9
    });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(-width/2 + 0.3, height/2 - 0.3, depth/2 + 0.02);
    group.add(textMesh);

    return group;
  };

  // Update card appearance based on state
  useEffect(() => {
    if (!groupRef.current) return;

    const group = groupRef.current;
    
    // Update scale based on selection/hover state
    const targetScale = isSelected ? 1.1 : (isHovered ? 1.05 : 1);
    group.scale.setScalar(targetScale);

    // Update position to maintain center
    group.position.copy(position);
    group.rotation.copy(rotation);

    // Add subtle animation for hover/selection
    if (isHovered || isSelected) {
      group.position.y += 0.1;
    }
  }, [isSelected, isHovered, position, rotation]);

  // Create card on mount
  useEffect(() => {
    createCard();
    return () => {
      // Cleanup will be handled by parent component
    };
  }, []);

  // This component doesn't return JSX since it's a Three.js object
  // The actual 3D objects are created in the useEffect
  return null;
};
