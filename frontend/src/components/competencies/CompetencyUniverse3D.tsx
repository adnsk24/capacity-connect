import React, { useMemo, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Html, Float } from "@react-three/drei"
import * as THREE from "three"
import { UserCompetency } from "@/services/competencies"
import { RotateCcw, Info } from "lucide-react"

interface CompetencyUniverse3DProps {
  competencies: UserCompetency[]
  selectedCompetencyId?: string
  onSelectCompetency: (comp: UserCompetency) => void
  onResetView?: () => void
}

// Color resolver according to competency level
const getLevelColor = (level: number): string => {
  if (level >= 4.5) return "#f59e0b" // Expert: Amber
  if (level >= 3.5) return "#8b5cf6" // Advanced: Violet
  if (level >= 2.5) return "#10b981" // Intermediate: Emerald
  if (level >= 1.5) return "#06b6d4" // Foundation: Cyan
  if (level >= 0.5) return "#3b82f6" // Awareness: Blue
  return "#64748b" // Unassessed: Slate
}

// Center Trainee Core Node
const TraineeCoreNode: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null)
  const haloRef = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.5
    if (haloRef.current) haloRef.current.rotation.x += delta * 0.3
  })

  return (
    <group position={[0, 0, 0]}>
      {/* Central Glowing Core */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#0284c7"
          emissiveIntensity={0.8}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Pulsing Outer Orbit Halo */}
      <mesh ref={haloRef}>
        <ringGeometry args={[1.2, 1.35, 48]} />
        <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} transparent opacity={0.4} />
      </mesh>

      {/* Trainee Label */}
      <Html position={[0, 1.4, 0]} center distanceFactor={14}>
        <div className="pointer-events-none select-none px-2.5 py-1 rounded-full bg-slate-900/90 text-sky-300 border border-sky-500/50 text-[10px] font-bold tracking-wider uppercase backdrop-blur-md shadow-lg shadow-sky-500/20 whitespace-nowrap">
          Operational Trainee Core
        </div>
      </Html>
    </group>
  )
}

// Individual Competency Node Component
interface CompetencyNodeProps {
  competency: UserCompetency
  position: [number, number, number]
  isSelected: boolean
  onClick: () => void
}

const CompetencyNode: React.FC<CompetencyNodeProps> = ({
  competency,
  position,
  isSelected,
  onClick,
}) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const color = useMemo(() => getLevelColor(competency.current_level), [competency.current_level])
  const radius = useMemo(
    () => 0.45 + (competency.current_level / 5.0) * 0.45,
    [competency.current_level]
  )

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * (hovered ? 1.5 : 0.4)
    }
  })

  // Line from center to node
  const linePoints = useMemo(() => {
    const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(...position)]
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    return geometry
  }, [position])

  return (
    <group position={position}>
      {/* Connecting constellation line back to Trainee Core */}
      <primitive
        object={
          new THREE.Line(
            linePoints,
            new THREE.LineBasicMaterial({
              color: isSelected ? "#38bdf8" : color,
              transparent: true,
              opacity: isSelected ? 0.75 : 0.25,
            })
          )
        }
        position={[-position[0], -position[1], -position[2]]}
      />

      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh
          ref={meshRef}
          onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            setHovered(true)
            document.body.style.cursor = "pointer"
          }}
          onPointerOut={() => {
            setHovered(false)
            document.body.style.cursor = "auto"
          }}
          scale={hovered || isSelected ? 1.25 : 1.0}
        >
          <sphereGeometry args={[radius, 32, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isSelected ? 0.9 : hovered ? 0.6 : 0.25}
            roughness={0.25}
            metalness={0.7}
          />
        </mesh>

        {/* Orbiting Satellite Sub-nodes (Evidence / Course Indicators) */}
        <mesh position={[radius * 1.5, 0.3, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshBasicMaterial color="#94a3b8" />
        </mesh>
        <mesh position={[-radius * 1.3, -0.4, 0.4]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>

        {/* Node Floating Label */}
        <Html position={[0, radius + 0.5, 0]} center distanceFactor={14}>
          <div
            onClick={onClick}
            className={`cursor-pointer select-none px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-tight transition-all duration-200 whitespace-nowrap shadow-md ${
              isSelected
                ? "bg-sky-500 text-white border-2 border-white ring-2 ring-sky-400"
                : hovered
                ? "bg-slate-900/90 text-white border border-slate-700"
                : "bg-slate-900/75 text-slate-200 border border-slate-800"
            }`}
          >
            <span className="font-mono text-[9px] mr-1 opacity-75">{competency.code}:</span>
            <span>L{competency.current_level.toFixed(1)}</span>
          </div>
        </Html>
      </Float>
    </group>
  )
}

// Background Star Particles
const AtmosphericStarfield: React.FC = () => {
  const particles = useMemo(() => {
    const coords = []
    for (let i = 0; i < 400; i++) {
      const x = (Math.random() - 0.5) * 80
      const y = (Math.random() - 0.5) * 80
      const z = (Math.random() - 0.5) * 80
      coords.push(x, y, z)
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(coords, 3))
    return geometry
  }, [])

  return (
    <points geometry={particles}>
      <pointsMaterial size={0.12} color="#60a5fa" transparent opacity={0.35} sizeAttenuation />
    </points>
  )
}

export const CompetencyUniverse3D: React.FC<CompetencyUniverse3DProps> = ({
  competencies,
  selectedCompetencyId,
  onSelectCompetency,
  onResetView,
}) => {
  const controlsRef = useRef<any>(null)

  // Compute 3D radial positions for competencies
  const nodePositions = useMemo(() => {
    const count = competencies.length
    const radius = 6.2
    return competencies.map((comp, idx) => {
      const angle = (idx / count) * Math.PI * 2
      const elevation = Math.sin(idx * 1.5) * 1.8 // varied Y elevations for 3D depth
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      return { comp, pos: [x, elevation, z] as [number, number, number] }
    })
  }, [competencies])

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset()
    }
    if (onResetView) onResetView()
  }

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
      {/* Canvas Controls Header Overlay */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-300 text-xs shadow-md">
          <Info className="h-3.5 w-3.5 text-sky-400" />
          <span>Interactive 3D Constellation: Click node to inspect evidence</span>
        </div>
      </div>

      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        <button
          onClick={handleResetCamera}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800/90 text-slate-200 border border-slate-700/60 text-xs font-medium transition-all backdrop-blur-md shadow-md cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
          <span>Reset Orbit</span>
        </button>
      </div>

      {/* Bottom Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-10 hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900/85 backdrop-blur-md border border-slate-800 text-[11px] text-slate-300">
        <span className="text-slate-400 font-medium">Proficiency:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
          <span>Expert (5.0)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-violet-500 inline-block" />
          <span>Advanced (4.0)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          <span>Intermediate (3.0)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" />
          <span>Foundation (2.0)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
          <span>Awareness (1.0)</span>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 6, 14], fov: 50 }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <color attach="background" args={["#030712"]} />
        <ambientLight intensity={0.65} />
        <pointLight position={[0, 4, 0]} intensity={1.5} color="#38bdf8" />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />

        <AtmosphericStarfield />
        <TraineeCoreNode />

        {nodePositions.map(({ comp, pos }) => (
          <CompetencyNode
            key={comp.competency_id}
            competency={comp}
            position={pos}
            isSelected={comp.competency_id === selectedCompetencyId}
            onClick={() => onSelectCompetency(comp)}
          />
        ))}

        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.06}
          minDistance={3.5}
          maxDistance={24}
          autoRotate
          autoRotateSpeed={0.35}
        />
      </Canvas>
    </div>
  )
}

export default CompetencyUniverse3D
