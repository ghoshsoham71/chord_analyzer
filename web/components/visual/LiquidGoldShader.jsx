import { Canvas, useFrame } from "@react-three/fiber"
import { useRef, useMemo, useState, useEffect } from "react"
import * as THREE from "three"

function AnimatedPlane() {
  const meshRef = useRef()
  const materialRef = useRef()

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color("#C89B3C") },
      uColor2: { value: new THREE.Color("#7A2F1F") },
    }),
    []
  )

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime()
    }
    if (meshRef.current) {
      meshRef.current.rotation.z = clock.getElapsedTime() * 0.05
    }
  })

  const vertexShader = `
    varying vec2 vUv;
    uniform float uTime;
    
    void main() {
      vUv = uv;
      vec3 pos = position;
      pos.z += sin(pos.x * 2.0 + uTime) * 0.3;
      pos.z += sin(pos.y * 2.0 + uTime * 0.8) * 0.3;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `

  const fragmentShader = `
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    varying vec2 vUv;
    
    void main() {
      float pattern = sin(vUv.x * 10.0 + uTime) * sin(vUv.y * 10.0 + uTime * 0.5);
      pattern = pattern * 0.5 + 0.5;
      
      vec3 color = mix(uColor2, uColor1, pattern);
      float alpha = 0.15 + pattern * 0.1;
      
      gl_FragColor = vec4(color, alpha);
    }
  `

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[30, 30, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

export default function LiquidGoldShader() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal via-charcoal-light/20 to-charcoal" />
    )
  }

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal via-charcoal-light/20 to-charcoal" />
      
      {/* Canvas with Three.js */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#C89B3C" />
        <pointLight position={[-10, -10, 10]} intensity={0.3} color="#7A2F1F" />
        <AnimatedPlane />
      </Canvas>
      
      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-charcoal/50" />
      <div className="absolute inset-0 bg-gradient-to-r from-charcoal/30 via-transparent to-charcoal/30" />
    </div>
  )
}
