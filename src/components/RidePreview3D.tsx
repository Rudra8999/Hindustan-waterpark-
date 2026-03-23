import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, MeshWobbleMaterial, Sphere, Torus, Cylinder, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

const TornadoRide = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.05;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  return (
    <group>
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <mesh ref={meshRef}>
          <coneGeometry args={[1.5, 3, 32, 1, true]} />
          <meshStandardMaterial color="#f97316" wireframe />
        </mesh>
        <mesh position={[0, -1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.2, 0.1, 16, 100]} />
          <meshStandardMaterial color="#f97316" />
        </mesh>
      </Float>
    </group>
  );
};

const WaveRide = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      meshRef.current.rotation.x = Math.sin(time) * 0.1;
      meshRef.current.rotation.z = Math.cos(time) * 0.1;
    }
  });

  return (
    <Float speed={3} rotationIntensity={0.5} floatIntensity={2}>
      <mesh ref={meshRef}>
        <planeGeometry args={[3, 3, 32, 32]} />
        <MeshWobbleMaterial color="#3b82f6" factor={0.6} speed={2} />
      </mesh>
    </Float>
  );
};

const SplashRide = () => {
  const count = 20;
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1],
        speed: 0.5 + Math.random() * 1,
        offset: Math.random() * 10
      });
    }
    return temp;
  }, []);

  return (
    <group>
      {particles.map((p, i) => (
        <Particle key={i} {...p} />
      ))}
      <Sphere args={[0.8, 32, 32]}>
        <MeshDistortMaterial color="#eab308" speed={4} distort={0.4} />
      </Sphere>
    </group>
  );
};

const Particle = ({ position, speed, offset }: any) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime * speed + offset;
      ref.current.position.y = Math.abs(Math.sin(t)) * 1.5;
      ref.current.scale.setScalar(Math.cos(t) * 0.2 + 0.3);
    }
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.2, 16, 16]} />
      <meshStandardMaterial color="#fbbf24" />
    </mesh>
  );
};

const DefaultRide = () => (
  <Float speed={2} rotationIntensity={2} floatIntensity={2}>
    <mesh>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial color="#6366f1" />
    </mesh>
  </Float>
);

const SlideRide = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef}>
        <torusKnotGeometry args={[1, 0.3, 128, 32]} />
        <meshStandardMaterial color="#ec4899" />
      </mesh>
    </Float>
  );
};

const PoolRide = () => {
  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2, 32]} />
        <MeshDistortMaterial color="#06b6d4" speed={2} distort={0.2} />
      </mesh>
    </Float>
  );
};

const LazyRiverRide = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += 0.02;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef}>
        <torusGeometry args={[1.5, 0.4, 16, 100]} />
        <meshStandardMaterial color="#10b981" />
      </mesh>
    </Float>
  );
};

export default function RidePreview3D({ rideId }: { rideId: string }) {
  const renderRide = () => {
    const id = rideId.toLowerCase();
    if (id.includes('tornado')) return <TornadoRide />;
    if (id.includes('wave')) return <WaveRide />;
    if (id.includes('splash') || id.includes('kingdom')) return <SplashRide />;
    if (id.includes('slide')) return <SlideRide />;
    if (id.includes('pool')) return <PoolRide />;
    if (id.includes('river')) return <LazyRiverRide />;
    return <DefaultRide />;
  };

  return (
    <div className="w-full h-full min-h-[300px] relative">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        {renderRide()}
        
        <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={10} blur={2} far={4.5} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
