"use client";
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, PerspectiveCamera, Stars } from '@react-three/drei';
import { useGLTF, useAnimations } from '@react-three/drei';
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
  return null;
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

// Sound Manager using Web Audio API
function useSoundEffects(speed: number, progress: number, isComplete: boolean) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const engineOscillatorRef = useRef<OscillatorNode | null>(null);
  const engineGainRef = useRef<GainNode | null>(null);
  const lastWhooshRef = useRef(0);
  const [audioInitialized, setAudioInitialized] = useState(false);

  useEffect(() => {
    // Initialize audio context immediately when component mounts
    const initAudio = async () => {
      if (audioContextRef.current) return;
      
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
        
        // Try to resume immediately - some browsers allow this
        if (audioContextRef.current.state === 'suspended') {
          try {
            await audioContextRef.current.resume();
            setAudioInitialized(true);
          } catch (e) {
            // If resume fails, we'll need user interaction
          }
        } else {
          setAudioInitialized(true);
        }
      } catch (error) {
        console.log('Audio context initialization failed:', error);
      }
    };

    initAudio();

    // Also set up interaction handlers as fallback
    const handleInteraction = async () => {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        try {
          await audioContextRef.current.resume();
          setAudioInitialized(true);
        } catch (e) {
          console.log('Could not resume audio on interaction:', e);
        }
      }
    };

    // Add listeners for any user interaction
    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true });
    window.addEventListener('keydown', handleInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  // Try to resume audio context when animation starts
  useEffect(() => {
    if (audioContextRef.current && progress > 0 && !audioInitialized) {
      const resumeAudio = async () => {
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          try {
            await audioContextRef.current.resume();
            setAudioInitialized(true);
          } catch (error) {
            console.log('Could not resume audio:', error);
          }
        }
      };
      resumeAudio();
    }
  }, [progress, audioInitialized]);

  // Engine sound that varies with speed - more realistic
  useEffect(() => {
    if (!audioContextRef.current || !audioInitialized || progress >= 1) {
      if (engineOscillatorRef.current) {
        engineOscillatorRef.current.stop();
        engineOscillatorRef.current = null;
      }
      return;
    }

    const audioContext = audioContextRef.current;

    if (!engineOscillatorRef.current) {
      // Create main engine sound with multiple oscillators for realism
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const merger = audioContext.createChannelMerger(2);
      
      // Two oscillators for richer engine sound
      oscillator1.type = 'sawtooth';
      oscillator1.frequency.value = 60 + speed * 80;
      
      oscillator2.type = 'square';
      oscillator2.frequency.value = 120 + speed * 160;
      
      gainNode.gain.value = 0.08 + speed * 0.12; // Volume increases with speed
      
      oscillator1.connect(merger, 0, 0);
      oscillator2.connect(merger, 0, 1);
      merger.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator1.start();
      oscillator2.start();
      
      engineOscillatorRef.current = oscillator1; // Store reference to first
      engineGainRef.current = gainNode;
      
      // Store second oscillator for cleanup
      (engineOscillatorRef.current as any).oscillator2 = oscillator2;
    } else {
      // Update frequency and volume based on speed
      const baseFreq1 = 60 + speed * 80;
      const baseFreq2 = 120 + speed * 160;
      const targetGain = 0.08 + speed * 0.12;
      
      engineOscillatorRef.current.frequency.setTargetAtTime(
        baseFreq1,
        audioContext.currentTime,
        0.15
      );
      
      // Update second oscillator if it exists
      const osc2 = (engineOscillatorRef.current as any).oscillator2;
      if (osc2) {
        osc2.frequency.setTargetAtTime(
          baseFreq2,
          audioContext.currentTime,
          0.15
        );
      }
      
      engineGainRef.current?.gain.setTargetAtTime(
        targetGain,
        audioContext.currentTime,
        0.15
      );
    }

    return () => {
      if (engineOscillatorRef.current) {
        engineOscillatorRef.current.stop();
        const osc2 = (engineOscillatorRef.current as any).oscillator2;
        if (osc2) {
          osc2.stop();
        }
        engineOscillatorRef.current = null;
      }
    };
  }, [speed, progress, audioInitialized]);

  // Completion celebration sound
  useEffect(() => {
    if (!audioContextRef.current || !audioInitialized || !isComplete) return;

    const audioContext = audioContextRef.current;
    
    // Create a celebratory sound with multiple tones
    const playCelebrationSound = () => {
      const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C (major chord)
      
      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.value = freq;
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5 + index * 0.1);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start(audioContext.currentTime + index * 0.1);
        oscillator.stop(audioContext.currentTime + 0.6 + index * 0.1);
      });
    };

    playCelebrationSound();
  }, [isComplete, audioInitialized]);

  // Speed boost/whoosh sound when accelerating
  useEffect(() => {
    if (!audioContextRef.current || !audioInitialized || speed < 0.2) return;

    const audioContext = audioContextRef.current;
    const currentTime = Date.now();
    
    // Only play whoosh every 2-3 seconds during acceleration
    if (currentTime - lastWhooshRef.current < 2000) return;
    
    // Play whoosh when speed increases significantly
    const speedIncrease = speed > 0.3 && speed < 0.8;
    
    if (speedIncrease && Math.random() < 0.3) {
      lastWhooshRef.current = currentTime;
      
      // Create a whoosh sound for acceleration
      const playWhoosh = () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
      };

      playWhoosh();
    }
  }, [speed, audioInitialized]);
}

// Soldier model with animations (Idle/Walk) from three.js examples
function Soldier({ position, walking }: { position: [number, number, number]; walking: boolean }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { scene, animations } = useGLTF('https://threejs.org/examples/models/gltf/Soldier.glb') as any;
  const groupRef = useRef<THREE.Group>(null);
  const { actions } = useAnimations(animations, groupRef);

  useEffect(() => {
    if (!actions) return;
    const idle = actions['Idle'] || actions['idle'];
    const walk = actions['Walk'] || actions['walk'];
    if (walking) {
      if (idle) idle.fadeOut(0.3);
      if (walk) walk.reset().fadeIn(0.3).play();
    } else {
      if (walk) walk.fadeOut(0.3);
      if (idle) idle.reset().fadeIn(0.3).play();
    }
  }, [actions, walking]);

  // Ensure soldier faces +X (adjust as needed for the model)
  return (
    <group ref={groupRef} position={position} rotation={[0, -Math.PI / 2, 0]} scale={1.2}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload('https://threejs.org/examples/models/gltf/Soldier.glb');

// Main Scene
function Scene({ onComplete, walkTrigger }: { onComplete: () => void, walkTrigger: number }) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const [manX, setManX] = useState(-5);
  const [walking, setWalking] = useState(false);
  const doorX = 5;

  // Start walking when parent triggers
  useEffect(() => {
    if (walkTrigger > 0) {
      setWalking(true);
    }
  }, [walkTrigger]);

  useFrame((_, delta) => {
    if (walking) {
      const speed = 1.5;
      const nx = Math.min(manX + speed * delta, doorX + 0.6);
      setManX(nx);
      if (nx >= doorX + 0.6) {
        setWalking(false);
        setTimeout(() => onComplete(), 800);
      }
    }
    if (cameraRef.current) {
      const target = new THREE.Vector3(manX, 1.2, 0);
      cameraRef.current.position.lerp(new THREE.Vector3(manX - 3, 2.5, 8), 0.1);
      cameraRef.current.lookAt(target);
    }
  });

  const openAmount = Math.min(1, Math.max(0, (manX - (doorX - 1.2)) / 2));

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} />
      <Stars radius={80} depth={40} count={3000} factor={3} fade speed={0.6} />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[40, 20]} />
        <meshStandardMaterial color="#0f1427" />
      </mesh>

      {/* Path */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[12, 2.5]} />
        <meshStandardMaterial color="#1a1f3b" />
      </mesh>

      {/* Soldier character */}
      <Soldier position={[manX, 0, 0]} walking={walking} />

      {/* Door */}
      <group position={[doorX, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, 1.2, 0]}>
          <boxGeometry args={[2, 2.4, 0.2]} />
          <meshStandardMaterial color="#222" />
        </mesh>
        <group position={[-0.9, 0, 0.11]} rotation={[0, -openAmount * Math.PI / 2, 0]}>
          <mesh position={[0.9, 1.2, 0]}>
            <boxGeometry args={[1.8, 2.4, 0.1]} />
            <meshStandardMaterial color="#5cd3ff" />
          </mesh>
        </group>
      </group>

      {/* Camera */}
      <PerspectiveCamera makeDefault ref={cameraRef} position={[-6, 3, 8]} fov={60} />
    </>
  );
}

export default function ContestIntroAnimation({ onComplete }: { onComplete: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [walkTrigger, setWalkTrigger] = useState(0);

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
            <Scene onComplete={onComplete} walkTrigger={walkTrigger} />
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

          {/* Speedometer - hidden on mobile */}
          <div className="hidden md:block">
            <Speedometer speed={speed} />
          </div>

          {/* Enter button (starts walking) */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-auto">
            <motion.button
              onClick={() => setWalkTrigger((v) => v + 1)}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#5cd3ff] to-[#6f5af6] text-white font-bold shadow-2xl hover:opacity-90"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Enter
            </motion.button>
          </div>

          {/* Game Instructions - hidden on mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="hidden md:block absolute bottom-8 right-8 bg-black/50 backdrop-blur-lg border-2 border-[#5cd3ff] rounded-xl p-4 max-w-[250px]"
          >
            <div className="text-[#5cd3ff] font-bold text-sm mb-2">🎮 MISSION</div>
            <div className="text-white/80 text-xs">
              Click Enter to walk through the gate and start your journey.
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
