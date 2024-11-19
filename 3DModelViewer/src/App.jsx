import React,{ useState , Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Earth from '../public/Earth'

export default function App() {
  return (
    <>
    <Canvas style={{height:'100vh'}}>
      <ambientLight />
      <Suspense fallback={null}>
        <Earth />
      </Suspense>
      <OrbitControls />
      </Canvas>
    </>
  )
}
