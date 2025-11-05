"use client";
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, PerspectiveCamera, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

// Enhanced Car component with better visuals
function Car({ position, rotation, speed }: { position: [number, number, number], rotation: [number, number, number], speed: number }) {
  const carRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (carRef.current) {
      // Add slight bounce effect when moving
      carRef.current.position.y = position[1] + Math.sin(Date.now() * 0.01) * 0.05;
    }
  });

  return (
    <group ref={carRef} position={position} rotation={rotation}>
      {/* Car body - more detailed */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[2, 0.8, 1.2]} />
        <meshStandardMaterial 
          color="#ff3333" 
          metalness={0.9} 
          roughness={0.1}
          emissive="#ff0000"
          emissiveIntensity={0.2}
        />
      </mesh>
      {/* Car roof */}
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[1.5, 0.5, 0.9]} />
        <meshStandardMaterial 
          color="#cc0000" 
          metalness={0.9} 
          roughness={0.1}
        />
      </mesh>
      {/* Windshield */}
      <mesh position={[0, 0.7, 0.45]}>
        <boxGeometry args={[1.3, 0.4, 0.05]} />
        <meshStandardMaterial color="#4a90e2" transparent opacity={0.6} />
      </mesh>
      {/* Wheels - larger and more visible */}
      {[[-0.8, -0.6], [0.8, -0.6], [-0.8, 0.6], [0.8, 0.6]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh>
            <cylinderGeometry args={[0.25, 0.25, 0.2, 16]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.15, 0.15, 0.22, 16]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
        </group>
      ))}
      {/* Speed lines from car */}
      {speed > 0.3 && [...Array(5)].map((_, i) => (
        <mesh
          key={i}
          position={[-1 - i * 0.3, 0.2, (Math.random() - 0.5) * 0.5]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <planeGeometry args={[0.05, 0.5]} />
          <meshStandardMaterial color="#5cd3ff" transparent opacity={0.5 - i * 0.1} />
        </mesh>
      ))}
      {/* Exhaust particles */}
      {speed > 0.5 && [...Array(3)].map((_, i) => (
        <mesh
          key={`exhaust-${i}`}
          position={[-1.2, 0.2, (i - 1) * 0.2]}
        >
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#ffaa00" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

// Enhanced Track with better visuals - extended
function Track() {
  const trackRef = useRef<THREE.Group>(null);
  
  // Create curved track - extended to reach garage
  const trackPoints: THREE.Vector3[] = [];
  for (let i = 0; i <= 100; i++) {
    const t = i / 100;
    const x = -20 + t * 40;
    const z = Math.sin(t * Math.PI * 1.5) * 3;
    trackPoints.push(new THREE.Vector3(x, 0, z));
  }

  return (
    <group ref={trackRef}>
      {/* Track surface with gradient - extended */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[60, 15]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      
      {/* Track center line */}
      {trackPoints.map((point, i) => {
        if (i % 5 !== 0) return null;
        return (
          <mesh key={i} position={[point.x, 0.02, point.z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.8, 0.15]} />
            <meshStandardMaterial 
              color="#5cd3ff" 
              emissive="#5cd3ff" 
              emissiveIntensity={0.8}
            />
          </mesh>
        );
      })}
      
      {/* Track barriers with glow */}
      {trackPoints.map((point, i) => {
        if (i % 3 !== 0) return null;
        const nextPoint = trackPoints[Math.min(i + 1, trackPoints.length - 1)];
        const direction = new THREE.Vector3().subVectors(nextPoint, point).normalize();
        const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x);
        
        return (
          <React.Fragment key={i}>
            <mesh position={[point.x + perpendicular.x * 2, 0.4, point.z + perpendicular.z * 2]}>
              <boxGeometry args={[0.15, 0.8, 0.15]} />
              <meshStandardMaterial 
                color="#5cd3ff" 
                emissive="#5cd3ff" 
                emissiveIntensity={0.6}
              />
            </mesh>
            <mesh position={[point.x - perpendicular.x * 2, 0.4, point.z - perpendicular.z * 2]}>
              <boxGeometry args={[0.15, 0.8, 0.15]} />
              <meshStandardMaterial 
                color="#5cd3ff" 
                emissive="#5cd3ff" 
                emissiveIntensity={0.6}
              />
            </mesh>
          </React.Fragment>
        );
      })}
    </group>
  );
}


// Speedometer UI component
function Speedometer({ speed }: { speed: number }) {
  const speedPercent = Math.min(speed * 100, 100);
  
  return (
    <div className="absolute bottom-8 left-8 bg-black/50 backdrop-blur-lg border-2 border-[#5cd3ff] rounded-xl p-6 min-w-[200px]">
      <div className="text-white/80 text-sm mb-2">SPEED</div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#5cd3ff] to-[#6f5af6] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${speedPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="text-[#5cd3ff] font-bold text-xl">
          {Math.round(speedPercent)}%
        </div>
      </div>
      <div className="text-white/60 text-xs mt-2">
        {speedPercent < 30 ? "Starting..." : speedPercent < 70 ? "Accelerating!" : "MAX SPEED!"}
      </div>
    </div>
  );
}

// Progress indicator
function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-lg border-2 border-[#5cd3ff] rounded-xl p-4 min-w-[300px]">
      <div className="text-white/80 text-sm mb-2 text-center">JOURNEY TO DREAM JOB</div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-4 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#5cd3ff] via-[#6f5af6] to-[#5cd3ff] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="text-[#5cd3ff] font-bold">
          {Math.round(progress * 100)}%
        </div>
      </div>
    </div>
  );
}

// Main Scene
function Scene({ onComplete, onProgressUpdate }: { onComplete: () => void, onProgressUpdate: (progress: number, speed: number) => void }) {
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(0);
  const carRef = useRef<THREE.Group>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const [showComplete, setShowComplete] = useState(false);
  
  // Track path
  const getTrackPosition = (t: number): [number, number, number] => {
    const x = -20 + t * 40;
    const z = Math.sin(t * Math.PI * 1.5) * 3;
    return [x, 0.5, z];
  };
  
  const getTrackRotation = (t: number): [number, number, number] => {
    const nextT = Math.min(t + 0.01, 1);
    const currentPos = getTrackPosition(t);
    const nextPos = getTrackPosition(nextT);
    const angle = Math.atan2(nextPos[2] - currentPos[2], nextPos[0] - currentPos[0]);
    return [0, angle + Math.PI / 2, 0];
  };

  useFrame((state, delta) => {
    if (progress < 1) {
      // Non-linear acceleration for game feel - slower animation
      const acceleration = 0.005; // Reduced from 0.01
      const speedMultiplier = 1 + progress * 2; // Reduced from 3
      const newProgress = Math.min(progress + acceleration * speedMultiplier, 1);
      const newSpeed = newProgress;
      setProgress(newProgress);
      setSpeed(newSpeed);
      onProgressUpdate(newProgress, newSpeed);
      
      // Update car position
      if (carRef.current) {
        const pos = getTrackPosition(newProgress);
        const rot = getTrackRotation(newProgress);
        carRef.current.position.set(pos[0], pos[1], pos[2]);
        carRef.current.rotation.set(rot[0], rot[1], rot[2]);
      }
      
      // Update camera to follow car - better tracking
      if (cameraRef.current && carRef.current) {
        const carPos = carRef.current.position;
        
        // Smooth camera following throughout
        const distance = 6;
        const height = 4;
        const sideOffset = 3;
        
        const targetX = carPos.x - distance;
        const targetY = carPos.y + height;
        const targetZ = carPos.z + sideOffset;
        
        cameraRef.current.position.lerp(
          new THREE.Vector3(targetX, targetY, targetZ),
          0.15
        );
        cameraRef.current.lookAt(carPos);
      }
      
      // Complete animation
      if (newProgress >= 1 && !showComplete) {
        setShowComplete(true);
        setTimeout(() => {
          onComplete();
        }, 4000); // Wait 4 seconds after completion
      }
    }
  });

  const carPosition = getTrackPosition(progress);
  const carRotation = getTrackRotation(progress);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} />
      <pointLight position={[20, 5, 0]} intensity={1} color="#5cd3ff" />
      <pointLight position={[-20, 5, 0]} intensity={1} color="#6f5af6" />
      <pointLight position={[20, 5, 0]} intensity={0.5} color="#ffffff" />
      
      {/* Stars background */}
      <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
      
      {/* Track */}
      <Track />
      
      
      {/* Car */}
      <group ref={carRef}>
        <Car position={carPosition} rotation={carRotation} speed={speed} />
      </group>
      
      
      {/* Speed lines effect */}
      {speed > 0.3 && (
        <>
          {[...Array(30)].map((_, i) => (
            <mesh
              key={i}
              position={[
                carPosition[0] - (i * 0.3),
                carPosition[1] - 0.1,
                carPosition[2] + (Math.sin(i * 0.5) * 0.5)
              ]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[0.15, 3]} />
              <meshStandardMaterial 
                color="#5cd3ff" 
                transparent 
                opacity={0.4 - (i * 0.01)} 
              />
            </mesh>
          ))}
        </>
      )}
      
      {/* Camera - better initial position */}
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={[-6, 4, 3]}
        fov={75}
        near={0.1}
        far={100}
      />
    </>
  );
}

export default function ContestIntroAnimation({ onComplete }: { onComplete: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleProgressUpdate = (newProgress: number, newSpeed: number) => {
    setProgress(newProgress);
    setSpeed(newSpeed);
  };

  if (!mounted) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-[#0b1020] via-[#0f1427] to-[#1a0b2e] z-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-[#5cd3ff] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="fixed inset-0 bg-gradient-to-br from-[#0b1020] via-[#0f1427] to-[#1a0b2e] z-50 overflow-hidden"
      >
        {/* 3D Canvas */}
        <div className="absolute inset-0 w-full h-full">
          <Canvas
            gl={{ antialias: true, alpha: false }}
            dpr={[1, 2]}
            camera={{ position: [0, 5, 10], fov: 75 }}
          >
            <Scene onComplete={onComplete} onProgressUpdate={handleProgressUpdate} />
          </Canvas>
        </div>
        
        {/* Game UI Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top Title */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 text-center"
          >
            <h1 className="text-6xl md:text-8xl font-extrabold mb-2">
              <span className="bg-gradient-to-r from-[#5cd3ff] via-[#6f5af6] to-[#5cd3ff] bg-clip-text text-transparent animate-pulse">
                INDIA'S FIRST
              </span>
            </h1>
            <h2 className="text-4xl md:text-6xl font-bold text-white">
              INTERVIEW COMPETITION
            </h2>
          </motion.div>

          {/* Progress Bar */}
          <ProgressBar progress={progress} />

          {/* Speedometer */}
          <Speedometer speed={speed} />

          {/* Game Instructions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 right-8 bg-black/50 backdrop-blur-lg border-2 border-[#5cd3ff] rounded-xl p-4 max-w-[250px]"
          >
            <div className="text-[#5cd3ff] font-bold text-sm mb-2">🎮 MISSION</div>
            <div className="text-white/80 text-xs">
              Race to your Dream Job! Complete the journey and unlock your career potential.
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
