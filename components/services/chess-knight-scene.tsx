"use client"

import { ContactShadows, Environment, OrbitControls, PerspectiveCamera } from "@react-three/drei"
import { Canvas, useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import * as THREE from "three"

function KnightHead() {
  const shape = useMemo(() => {
    const knight = new THREE.Shape()

    knight.moveTo(-0.5, -1.15)
    knight.bezierCurveTo(-0.82, -0.78, -0.88, -0.2, -0.54, 0.34)
    knight.bezierCurveTo(-0.38, 0.58, -0.24, 0.78, -0.11, 0.96)
    knight.bezierCurveTo(-0.18, 1.18, -0.07, 1.42, 0.18, 1.56)
    knight.bezierCurveTo(0.44, 1.72, 0.72, 1.64, 0.9, 1.42)
    knight.bezierCurveTo(0.73, 1.2, 0.66, 0.96, 0.74, 0.7)
    knight.bezierCurveTo(1.05, 0.55, 1.16, 0.26, 1.02, 0.02)
    knight.bezierCurveTo(0.87, -0.22, 0.52, -0.33, 0.17, -0.36)
    knight.bezierCurveTo(0.24, -0.63, 0.14, -0.85, -0.12, -1.04)
    knight.bezierCurveTo(-0.25, -1.13, -0.38, -1.17, -0.5, -1.15)

    return knight
  }, [])

  const extrudeSettings = useMemo(
    () => ({
      depth: 0.58,
      bevelEnabled: true,
      bevelSegments: 8,
      bevelSize: 0.055,
      bevelThickness: 0.055,
      curveSegments: 32,
    }),
    [],
  )

  const groovePositions = [-0.4, -0.22, -0.04, 0.14, 0.32, 0.5, 0.68]

  return (
    <group position={[-0.03, 1.95, -0.27]} rotation={[0.04, -0.1, 0]}>
      <mesh castShadow receiveShadow>
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshStandardMaterial color="#b87936" roughness={0.54} metalness={0.04} />
      </mesh>

      <mesh position={[0.62, 0.36, 0.64]} scale={[1, 0.7, 0.3]} castShadow>
        <sphereGeometry args={[0.085, 24, 24]} />
        <meshStandardMaterial color="#231812" roughness={0.45} />
      </mesh>

      <mesh position={[0.94, -0.35, 0.62]} scale={[1.15, 0.62, 0.45]} castShadow>
        <sphereGeometry args={[0.18, 24, 18]} />
        <meshStandardMaterial color="#8f5827" roughness={0.56} metalness={0.04} />
      </mesh>

      <mesh position={[1.04, -0.42, 0.76]} rotation={[0, 0, -0.06]} castShadow>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#1f1510" roughness={0.5} />
      </mesh>

      <mesh position={[0.52, 1.56, 0.3]} rotation={[0.08, 0.05, -0.2]} castShadow>
        <coneGeometry args={[0.12, 0.48, 4]} />
        <meshStandardMaterial color="#7b421d" roughness={0.58} metalness={0.03} />
      </mesh>

      <mesh position={[0.2, 1.58, 0.28]} rotation={[0.08, 0.04, 0.06]} castShadow>
        <coneGeometry args={[0.11, 0.43, 4]} />
        <meshStandardMaterial color="#6e3919" roughness={0.6} metalness={0.03} />
      </mesh>

      <mesh position={[0.67, 0.05, 0.66]} rotation={[0, 0, -0.2]} castShadow>
        <boxGeometry args={[0.46, 0.035, 0.025]} />
        <meshStandardMaterial color="#2b1b12" roughness={0.48} />
      </mesh>

      {groovePositions.map((y, index) => (
        <mesh key={y} position={[-0.47, y + 0.28, 0.64]} rotation={[0, 0, 0.72]} castShadow>
          <boxGeometry args={[0.5 - index * 0.018, 0.035, 0.035]} />
          <meshStandardMaterial color="#2b1b12" roughness={0.5} />
        </mesh>
      ))}

      {[-0.54, -0.27, 0, 0.27, 0.54].map((x) => (
        <mesh key={x} position={[x, -0.86, 0.64]} rotation={[0, 0, -0.96]} castShadow>
          <boxGeometry args={[0.38, 0.022, 0.02]} />
          <meshStandardMaterial color="#2b1b12" roughness={0.55} />
        </mesh>
      ))}
    </group>
  )
}

function ChessKnightModel() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!groupRef.current) {
      return
    }

    groupRef.current.position.y = Math.sin(clock.elapsedTime * 1.4) * 0.035
  })

  return (
    <group ref={groupRef} rotation={[0, -0.52, 0]}>
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <cylinderGeometry args={[1.34, 1.48, 0.18, 96]} />
        <meshStandardMaterial color="#3b2416" roughness={0.5} metalness={0.06} />
      </mesh>

      <mesh position={[0, 0.24, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.18, 1.3, 0.22, 96]} />
        <meshStandardMaterial color="#9d612b" roughness={0.52} metalness={0.05} />
      </mesh>

      <mesh position={[0, 0.44, 0]} castShadow receiveShadow>
        <torusGeometry args={[1.0, 0.1, 20, 96]} />
        <meshStandardMaterial color="#2b1b12" roughness={0.46} metalness={0.08} />
      </mesh>

      <mesh position={[0, 0.58, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.82, 1.02, 0.26, 96]} />
        <meshStandardMaterial color="#b87936" roughness={0.54} metalness={0.04} />
      </mesh>

      <mesh position={[0, 0.82, 0]} castShadow receiveShadow>
        <torusGeometry args={[0.72, 0.07, 18, 88]} />
        <meshStandardMaterial color="#2b1b12" roughness={0.48} metalness={0.06} />
      </mesh>

      <mesh position={[0, 1.02, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.44, 0.62, 0.44, 80]} />
        <meshStandardMaterial color="#a8662f" roughness={0.56} metalness={0.04} />
      </mesh>

      <mesh position={[0, 1.34, 0]} rotation={[0, 0, -0.05]} castShadow receiveShadow>
        <cylinderGeometry args={[0.36, 0.5, 0.5, 80]} />
        <meshStandardMaterial color="#9d612b" roughness={0.58} metalness={0.04} />
      </mesh>

      <KnightHead />
    </group>
  )
}

export function ChessKnightScene() {
  return (
    <div className="h-[420px] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#f4ead8] via-background to-accent/10 md:h-[560px]">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
        <PerspectiveCamera makeDefault position={[0, 2.35, 6.4]} fov={37} />
        <color attach="background" args={["#f8f1e5"]} />
        <ambientLight intensity={1.25} />
        <directionalLight position={[4, 5, 5]} intensity={2.55} castShadow shadow-mapSize={[2048, 2048]} />
        <pointLight position={[-3, 2, 3]} intensity={1.25} color="#f0a95b" />
        <ChessKnightModel />
        <ContactShadows position={[0, -0.05, 0]} opacity={0.32} scale={5.5} blur={2.8} far={2.5} />
        <Environment preset="studio" />
        <OrbitControls
          autoRotate
          autoRotateSpeed={1}
          enableDamping
          enablePan={false}
          enableZoom={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3.2}
          rotateSpeed={1.25}
        />
      </Canvas>
    </div>
  )
}
