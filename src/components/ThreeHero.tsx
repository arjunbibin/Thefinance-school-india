"use client"

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const targetMouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Create a mesh for the "Wealth Grid" - Immersive size
    const gridGeometry = new THREE.IcosahedronGeometry(15, 1);
    const gridMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x2E3192, 
      wireframe: true,
      transparent: true,
      opacity: 0.1
    });
    const grid = new THREE.Mesh(gridGeometry, gridMaterial);
    scene.add(grid);

    // Create particles for "Data Flow"
    const particlesCount = 1000;
    const posArray = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 60;
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.12,
      color: 0x00FFFF,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00FFFF, 2.5);
    pointLight.position.set(20, 20, 20);
    scene.add(pointLight);

    camera.position.z = 20;

    const animate = () => {
      requestAnimationFrame(animate);

      // Smooth interpolation for elegant, slow following
      mouse.current.x += (targetMouse.current.x - mouse.current.x) * 0.015;
      mouse.current.y += (targetMouse.current.y - mouse.current.y) * 0.015;

      // Subtle base rotation + point-to-mouse influence
      grid.rotation.y += 0.0008 + (mouse.current.x * 0.003);
      grid.rotation.x += 0.0004 + (mouse.current.y * 0.003);
      
      particlesMesh.rotation.y -= 0.0003 + (mouse.current.x * 0.001);
      particlesMesh.rotation.x -= (mouse.current.y * 0.001);
      
      const positions = particlesGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particlesCount * 3; i += 3) {
        positions[i + 1] += Math.sin(Date.now() * 0.0003 + positions[i]) * 0.002;
      }
      particlesGeometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    const handleMouseMove = (event: MouseEvent) => {
      targetMouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      targetMouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        targetMouse.current.x = (touch.clientX / window.innerWidth) * 2 - 1;
        targetMouse.current.y = -(touch.clientY / window.innerHeight) * 2 + 1;
      }
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('resize', handleResize);
    
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      gridGeometry.dispose();
      gridMaterial.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none" />;
}
