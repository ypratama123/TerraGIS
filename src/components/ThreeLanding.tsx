"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial, Stars } from "@react-three/drei";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import * as THREE from "three";
import { MoveRight } from "lucide-react";

function AnimatedSphere() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Sphere args={[1, 100, 200]} scale={2.4} ref={meshRef}>
      <MeshDistortMaterial
        color="#4338ca" // Indigo-700
        attach="material"
        distort={0.5}
        speed={1.5}
        roughness={0.2}
        metalness={0.8}
        wireframe
      />
    </Sphere>
  );
}

function Particles() {
  const pointsRef = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  })

  return (
    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
  )
}

interface ThreeLandingProps {
  onEnter: () => void;
}

export default function ThreeLanding({ onEnter }: ThreeLandingProps) {
  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <AnimatedSphere />
          <Particles />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center pointer-events-auto"
        >
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 tracking-tighter drop-shadow-2xl bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
            Terra GIS
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 font-light tracking-wide">
            menjelajah lebih dekat desa ngabul jepara
          </p>

          <button
            onClick={onEnter}
            className="group relative px-8 py-4 bg-white border border-white/20 rounded-full text-black font-medium text-lg overflow-hidden transition-all hover:bg-gray-100 hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto shadow-lg"
          >
            <span>Enter Experience</span>
            <MoveRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>

      {/* Decorative gradients */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black to-transparent pointer-events-none" />
    </div>
  );
}
