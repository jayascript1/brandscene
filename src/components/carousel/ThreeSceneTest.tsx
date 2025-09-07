import React, { useRef } from 'react';
import * as THREE from 'three';
import { ThreeSceneCanvas } from './ThreeSceneCanvas';

export const ThreeSceneTest: React.FC = () => {
  const cubeRef = useRef<THREE.Mesh>();

  const handleSceneReady = (scene: THREE.Scene) => {
    // Create a simple rotating cube to test the setup
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({ 
      color: 0x00ff00,
      transparent: true,
      opacity: 0.8
    });
    
    const cube = new THREE.Mesh(geometry, material);
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.position.set(0, 0, 0);
    
    scene.add(cube);
    cubeRef.current = cube;

    // Add a ground plane
    const groundGeometry = new THREE.PlaneGeometry(10, 10);
    const groundMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x333333,
      transparent: true,
      opacity: 0.5
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Animation loop for cube rotation
    const animate = () => {
      if (cubeRef.current) {
        cubeRef.current.rotation.x += 0.01;
        cubeRef.current.rotation.y += 0.01;
      }
      requestAnimationFrame(animate);
    };
    animate();
  };

  return (
    <div className="w-full h-screen bg-gray-900">
      <div className="p-4 text-white">
        <h2 className="text-2xl font-bold mb-4">Three.js Scene Test</h2>
        <p className="text-gray-300 mb-4">
          This is a test of the Three.js setup. You should see a rotating green cube.
        </p>
      </div>
      <div className="flex-1 h-full">
        <ThreeSceneCanvas 
          className="w-full h-full"
          onSceneReady={handleSceneReady}
        />
      </div>
    </div>
  );
};
