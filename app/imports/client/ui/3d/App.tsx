import * as THREE from 'three'
import { useLayoutEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  useGLTF,
  Environment,
  SoftShadows,
  OrbitControls,
  PerspectiveCamera,
  MeshTransmissionMaterial,
  useHelper,
  PivotControls,
  Center
} from '@react-three/drei'
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier'
import { useControls } from 'leva'
import { Caustics } from '@react-three/drei'
import React from 'react';
import Diamond from '/imports/client/ui/3d/Diamond'

export default function App() {
  const api = useRef()
  const { debug, ...config } = useControls({
    debug: true,
    color: 'white',
    worldRadius: { value: 0.3125, min: 0.0001, max: 10, step: 0.0001 },
    ior: { value: 1.1, min: 0, max: 2, step: 0.01 },
    intensity: { value: 0.05, min: 0, max: 10, step: 0.01 },
    falloff: { value: 0.01, min: 0, max: 1, step: 0.01 }
  })
  return (
    <Canvas shadows="basic">
      <PerspectiveCamera makeDefault position={[-10, 20, -70]} fov={65} />
      <directionalLight position={[-10, 40, 10]} castShadow>
        <orthographicCamera attach="shadow-camera" args={[-100, 100, 100, -100, 1, 200]} />
      </directionalLight>
      <SoftShadows samples={5} size={0.02} frustum={9.5} near={6.5} />

      {/*<Caustics lightSource={[5, 10, 5]} frames={Infinity} resolution={1024} {...config}>
        <PivotControls anchor={[0, 0.6, 0]} scale={15}>
          <Center top>
            <Bunny />
          </Center>
        </PivotControls>
  </Caustics>*/}

      <Physics gravity={[0, -100, 0]}>
        <group position={[0, -10, 0]}>
          <Caustics
            debug={debug}
            ref={api}
            frames={Infinity}
            lightSource={[5, 5, 5]}
            position={[0, -0.5, 0]}
            backside
            backfaceIor={1.2}
            {...config} resolution={512}
          >
            <RigidBody typed="fixed" restitution={1.95} position={[0, 100, 0]} colliders="hull">
              <Diamond></Diamond>
              {/*<Bunny debug={debug} {...config} />*/}
            </RigidBody>
          </Caustics>
          <mesh position={[0, -0.01, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]} scale={1000}>
            <planeGeometry />
            <shadowMaterial polygonOffset polygonOffsetFactor={10}  />
          </mesh>
          <RigidBody position={[0, -10, 0]} type="fixed" colliders={false}>
            <CuboidCollider args={[100, 10, 100]} />
            <CuboidCollider position={[0, 100, -60]} rotation={[-Math.PI / 2, 0, 0]} args={[100, 10, 100]} />
            <CuboidCollider position={[0, 100, 100]} rotation={[-Math.PI / 2, 0, 0]} args={[100, 10, 100]} />
            <CuboidCollider position={[80, 100, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} args={[100, 10, 100]} />
            <CuboidCollider position={[-80, 100, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} args={[100, 10, 100]} />
          </RigidBody>
        </group>
      </Physics>

      <OrbitControls makeDefault />
    </Canvas>
  )
}

function Bunny({ color, ...config }) {
  return (
    <mesh castShadow geometry={new THREE.IcosahedronGeometry(10)} frustumCulled={false}>
      <MeshTransmissionMaterial color={color} resolution={512} thickness={200} anisotropy={1} chromaticAberration={1} />
    </mesh>
  )
}
