/* eslint-disable react/no-unknown-property */

// eslint-disable-next-line no-unused-vars
import React from 'react'
import { useGLTF } from '@react-three/drei'

export default function Model(props) {
  const { nodes, materials } = useGLTF('/earth.gltf')
  return (
    <group {...props} dispose={null}>
  
      <mesh geometry={nodes.Object_4.geometry} material={materials['Scene_-_Root']} scale={1.128} />
    </group>
  )
}

useGLTF.preload('/earth.gltf')
