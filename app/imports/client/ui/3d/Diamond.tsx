import { useRef } from 'react'
import { Canvas, useLoader } from '@react-three/fiber'
import {
  useGLTF,
  Caustics,
  CubeCamera,
  Environment,
  OrbitControls,
  RandomizedLight,
  AccumulativeShadows,
  MeshRefractionMaterial,
  MeshTransmissionMaterial
} from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useControls } from 'leva'
import { RGBELoader } from 'three-stdlib'
import { IcosahedronGeometry } from 'three'
import React from 'react'

export default function Diamond(props) {
  const ref = useRef()
  // Use a custom envmap/scene-backdrop for the diamond material
  // This way we can have a clear BG while cube-cam can still film other objects
  const texture = useLoader(RGBELoader, 'images/hdri/aerodynamics_workshop_1k.hdr')
  // Optional config
  const config = useControls({
    bounces: { value: 3, min: 0, max: 8, step: 1 },
    aberrationStrength: { value: 0.01, min: 0, max: 0.1, step: 0.01 },
    ior: { value: 2.75, min: 0, max: 10 },
    fresnel: { value: 1, min: 0, max: 1 },
    color: 'white',
    fastChroma: true
  })
  return (
    <CubeCamera resolution={256} frames={1} envMap={texture}>
      {(texture) => (
        <mesh castShadow ref={ref} geometry={new IcosahedronGeometry(10)} {...props}>
          <MeshRefractionMaterial envMap={texture} {...config} toneMapped={false} />
        </mesh>
      )}
    </CubeCamera>
  )
}