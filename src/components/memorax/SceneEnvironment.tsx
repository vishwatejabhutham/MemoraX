import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Wedding zone — warm golden particles floating gently (left side)
function WeddingParticles() {
  const ref = useRef<THREE.Points>(null);
  const count = 200;

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 1) * 8; // left side
      pos[i * 3 + 1] = Math.random() * 10 - 2;
      pos[i * 3 + 2] = Math.random() * 12 - 6;
      sz[i] = Math.random() * 3 + 1;
    }
    return [pos, sz];
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const posArr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      posArr[i * 3 + 1] += delta * 0.3;
      if (posArr[i * 3 + 1] > 8) posArr[i * 3 + 1] = -2;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    ref.current.rotation.y += delta * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} itemSize={3} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} count={count} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial size={0.08} color="#e8a838" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

// Concert zone — energetic colored particles with fast motion (right side)
function ConcertParticles() {
  const ref = useRef<THREE.Points>(null);
  const count = 300;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = Math.random() * 8; // right side
      pos[i * 3 + 1] = Math.random() * 10 - 2;
      pos[i * 3 + 2] = Math.random() * 12 - 6;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    ref.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.3) * 0.05;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#a855f7" transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

// Party zone — colorful confetti in foreground
function PartyConfetti() {
  const ref = useRef<THREE.Points>(null);
  const count = 250;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette = [
      [1, 0.4, 0.6], [0.3, 0.9, 0.8], [1, 0.7, 0.2], [0.6, 0.3, 1], [0.2, 0.8, 1],
    ];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = Math.random() * 3 - 3; // bottom / foreground
      pos[i * 3 + 2] = Math.random() * 6 - 1;
      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c[0];
      col[i * 3 + 1] = c[1];
      col[i * 3 + 2] = c[2];
    }
    return [pos, col];
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const posArr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      posArr[i * 3 + 1] -= delta * 0.8;
      if (posArr[i * 3 + 1] < -4) posArr[i * 3 + 1] = 3;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} itemSize={3} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.1} vertexColors transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

// Stage/concert light beams
function LightBeams() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      child.rotation.z = Math.sin(state.clock.elapsedTime * (0.5 + i * 0.2) + i) * 0.3;
    });
  });

  return (
    <group ref={groupRef} position={[4, 5, -3]}>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} rotation={[0, 0, (i - 1.5) * 0.4]} position={[(i - 1.5) * 1.5, 0, 0]}>
          <coneGeometry args={[0.8, 12, 8, 1, true]} />
          <meshBasicMaterial
            color={i % 2 === 0 ? "#a855f7" : "#38bdf8"}
            transparent
            opacity={0.08}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

// Wedding mandap structure (simplified geometric)
function MandapStructure() {
  return (
    <group position={[-5, -1, -2]}>
      {/* Pillars */}
      {[[-1, 0, -1], [1, 0, -1], [-1, 0, 1], [1, 0, 1]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <cylinderGeometry args={[0.08, 0.08, 3, 8]} />
          <meshStandardMaterial color="#d4a054" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      {/* Top canopy */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[2.5, 0.05, 2.5]} />
        <meshStandardMaterial color="#d4a054" metalness={0.6} roughness={0.3} transparent opacity={0.7} />
      </mesh>
      {/* Decorative top */}
      <mesh position={[0, 1.7, 0]}>
        <torusGeometry args={[0.6, 0.05, 8, 32]} />
        <meshStandardMaterial color="#e8a838" emissive="#e8a838" emissiveIntensity={0.3} metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

// Ground plane with reflections
function GroundPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color="#0a0a12" metalness={0.9} roughness={0.3} />
    </mesh>
  );
}

// Ambient fog and scene lighting
function SceneLighting({ intensity = 1 }: { intensity?: number }) {
  const spotRef1 = useRef<THREE.SpotLight>(null);
  const spotRef2 = useRef<THREE.SpotLight>(null);

  useFrame((state) => {
    if (spotRef1.current) {
      spotRef1.current.intensity = (2 + Math.sin(state.clock.elapsedTime * 0.5) * 0.5) * intensity;
    }
    if (spotRef2.current) {
      spotRef2.current.intensity = (2 + Math.cos(state.clock.elapsedTime * 0.7) * 0.5) * intensity;
    }
  });

  return (
    <>
      <ambientLight intensity={0.15 * intensity} color="#1a1028" />
      {/* Wedding warm light */}
      <pointLight position={[-5, 4, 0]} color="#e8a838" intensity={3 * intensity} distance={15} />
      <pointLight position={[-4, 1, -1]} color="#ff9f43" intensity={1.5 * intensity} distance={8} />
      {/* Concert lights */}
      <spotLight ref={spotRef1} position={[5, 6, -2]} color="#a855f7" intensity={2} angle={0.4} penumbra={0.8} />
      <spotLight ref={spotRef2} position={[3, 6, 1]} color="#38bdf8" intensity={2} angle={0.4} penumbra={0.8} />
      {/* Party floor glow */}
      <pointLight position={[0, -2, 3]} color="#ff6b9d" intensity={2 * intensity} distance={10} />
      <pointLight position={[-2, -2, 4]} color="#2dd4bf" intensity={1.5 * intensity} distance={8} />
    </>
  );
}

// TODO: Load dynamic scenes from database
export default function SceneEnvironment({ cameraZ = 8 }: { cameraZ?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
    // Smooth camera position
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, cameraZ, 0.02);
  });

  return (
    <>
      <fog attach="fog" args={["#080812", 5, 25]} />
      <SceneLighting />
      <group ref={groupRef}>
        <MandapStructure />
        <WeddingParticles />
        <ConcertParticles />
        <LightBeams />
        <PartyConfetti />
        <GroundPlane />
      </group>
    </>
  );
}
