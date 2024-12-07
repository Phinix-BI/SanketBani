import React, { useRef, useEffect, useState } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei/native';
import * as THREE from 'three';

export default function Character({ animationSequence = [] , transitionDuration = 0.5, ...props }) {
  
  const group = useRef();
  const { nodes, materials, animations } = useGLTF(require('../assets/Models/Good_morning_animation_11.glb'));
  const { actions } = useAnimations(animations, group);
  
  const [currentAnimationIndex, setCurrentAnimationIndex] = useState(0);
  const [isPlayingSequence, setIsPlayingSequence] = useState(true);

   // Mapping specific animation names to human-readable action names
   const animationNames = {
    "sentence_025": "Hello Animation",
    "sentence_101": "2ndAction",
    // Add more mappings as needed
  };

  useEffect(() => {
    if (animationSequence.length > 0 && isPlayingSequence) {
      const playAnimation = (index) => {
        const animationName = animationSequence[index];
        
        // Translate to human-readable name if available
        const readableName = animationNames[animationName] || animationName;
        const action = actions[readableName];
        
        if (action) {
          // Play the current action with fade-in and loop control
          action.reset().fadeIn(transitionDuration).play();
          action.clampWhenFinished = true;
          action.loop = THREE.LoopOnce;

          // Set up a listener for when the action finishes
          action.getMixer().addEventListener('finished', () => {
            action.fadeOut(transitionDuration);
            const nextIndex = index + 1;

            if (nextIndex < animationSequence.length) {
              setCurrentAnimationIndex(nextIndex);
            } else {
              // Stop the sequence after completing the last animation
              setIsPlayingSequence(false);
            }
          });
        } 
      };
      
      playAnimation(currentAnimationIndex);

      return () => {
        // Stop the current action when the component unmounts
        actions[animationSequence[currentAnimationIndex]].fadeOut(transitionDuration);
      }
    }
  }, [animationSequence, currentAnimationIndex, actions, transitionDuration, isPlayingSequence]);

  return (
    <group ref={group} {...props} dispose={null} castShadow receiveShadow>
      <group name="Scene">
        <group name="Right_Boy" scale={4} position={[0, -4.5, 0]} rotation={[0, -0.025, 0]}>
          <group name="chest002">
            <skinnedMesh
              name="body002_1"
              geometry={nodes.body002_1.geometry}
              material={materials['shirt.001']}
              skeleton={nodes.body002_1.skeleton}
            />
            <skinnedMesh
              name="body002_2"
              geometry={nodes.body002_2.geometry}
              material={materials['shorts.001']}
              skeleton={nodes.body002_2.skeleton}
            />
            <skinnedMesh
              name="body002_3"
              geometry={nodes.body002_3.geometry}
              material={materials['shoe.001']}
              skeleton={nodes.body002_3.skeleton}
            />
            <skinnedMesh
              name="body002_4"
              geometry={nodes.body002_4.geometry}
              material={materials['hair.001']}
              skeleton={nodes.body002_4.skeleton}
            />
            <skinnedMesh
              name="body002_5"
              geometry={nodes.body002_5.geometry}
              material={materials['eye.001']}
              skeleton={nodes.body002_5.skeleton}
            />
            <skinnedMesh
              name="body002_6"
              geometry={nodes.body002_6.geometry}
              material={materials['body.001']}
              skeleton={nodes.body002_6.skeleton}
            />
            <skinnedMesh
              name="body002_7"
              geometry={nodes.body002_7.geometry}
              material={materials['head.001']}
              skeleton={nodes.body002_7.skeleton}
            />
          </group>
          <primitive object={nodes.mid_down} />
          <primitive object={nodes.Bone005} />
          <primitive object={nodes.Bone010} />
          <primitive object={nodes.Bone011} />
          <primitive object={nodes.Bone012} />
          <primitive object={nodes.Bone013} />
          <primitive object={nodes.Bone016} />
          <primitive object={nodes.Bone017} />
          <primitive object={nodes.mid_down001} />
          <primitive object={nodes.Bone044} />
          <primitive object={nodes.Bone045} />
          <primitive object={nodes.Bone046} />
          <primitive object={nodes.Bone047} />
          <primitive object={nodes.Bone048} />
          <primitive object={nodes.Bone049} />
          <primitive object={nodes.Bone050} />
          <primitive object={nodes.Bone} />
          <primitive object={nodes.Bone001} />
        </group>
      </group>
    </group>
  );
}

useGLTF.preload(require('../assets/Models/Good_morning_animation_11.glb'));
