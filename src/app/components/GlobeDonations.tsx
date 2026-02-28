import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useRef, Suspense, useState, useEffect } from "react";
import * as THREE from "three";

/* 🔥 IMPACT RING */

function Impact({ trigger }: { trigger: boolean }) {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!trigger) return;
    const t = state.clock.getElapsedTime();
    const scale = 1 + Math.sin(t * 10) * 0.5;
    ref.current.scale.set(scale, scale, scale);
  });

  return (
    <mesh ref={ref}>
      <ringGeometry args={[2.2, 2.6, 64]} />
      <meshBasicMaterial
        color="#00f2ff"
        transparent
        opacity={trigger ? 0.8 : 0}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* 🌍 EARTH */

function Earth({ impact }: { impact: boolean }) {
  const groupRef = useRef<THREE.Group>(null!);
  const cloudsRef = useRef<THREE.Mesh>(null!);
  const auraRef = useRef<THREE.Mesh>(null!);

  const [colorMap, bumpMap, cloudsMap] = useLoader(THREE.TextureLoader, [
    "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg",
    "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg",
    "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png",
  ]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    groupRef.current.rotation.y = t * 0.06;
    cloudsRef.current.rotation.y = t * 0.09;

    const pulse = impact ? 1.25 : 1.05;
    auraRef.current.scale.setScalar(pulse + Math.sin(t * 2) * 0.03);
  });

  return (
    <group ref={groupRef} scale={0.75}>
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          map={colorMap}
          normalMap={bumpMap}
          metalness={0.1}
          roughness={1}
        />
      </mesh>

      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.05, 64, 64]} />
        <meshStandardMaterial
          map={cloudsMap}
          transparent
          opacity={0.25}
          depthWrite={false}
        />
      </mesh>

      {/* aura glow */}
      <mesh ref={auraRef}>
        <sphereGeometry args={[2.3, 64, 64]} />
        <meshBasicMaterial
          color="#00f2ff"
          transparent
          opacity={impact ? 0.25 : 0.08}
          side={THREE.BackSide}
        />
      </mesh>

      <Impact trigger={impact} />
    </group>
  );
}

/* 🎯 CONTROLLER */

function SceneController({ impact }: { impact: boolean }) {
  return <Earth impact={impact} />;
}

/* 🚀 MAIN */

export default function GlobeDonations({ trigger }: { trigger?: boolean }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }} gl={{ alpha: true }}>
        <Suspense fallback={null}>
          <ambientLight intensity={1.1} />
          <directionalLight position={[5, 5, 5]} intensity={2} />

          <SceneController impact={!!trigger} />

          <Stars radius={120} depth={60} count={6000} factor={4} />
        </Suspense>

        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.25} />
      </Canvas>
    </div>
  );
}