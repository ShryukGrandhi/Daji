import React from 'react'
import { Text, RoundedBox } from '@react-three/drei'
import { useDJStore } from '@/store/useDJStore'

export function ChallengeHUD() {
  const currentChallenge = useDJStore((state) => state.currentChallenge)
  const challengeProgress = useDJStore((state) => state.challengeProgress)

  if (!currentChallenge) return null

  return (
    <group>
      {/* Compact Panel */}
      <RoundedBox args={[0.8, 0.1, 0.01]} radius={0.015}>
        <meshStandardMaterial color="#1a1a1a" transparent opacity={0.9} />
      </RoundedBox>
      
      {/* Gold accent */}
      <mesh position={[0, 0.045, 0.006]}>
        <planeGeometry args={[0.75, 0.008]} />
        <meshBasicMaterial color="#eab308" />
      </mesh>

      {/* Challenge Text */}
      <Text position={[0, 0.01, 0.01]} fontSize={0.025} color="white" maxWidth={0.7} textAlign="center">
        🏆 {currentChallenge}
      </Text>

      {/* Progress Bar */}
      <group position={[0, -0.03, 0.01]}>
          <mesh>
              <planeGeometry args={[0.5, 0.012]} />
              <meshBasicMaterial color="#333" />
          </mesh>
          <mesh position={[(challengeProgress - 1) * 0.25, 0, 0.001]} scale={[challengeProgress, 1, 1]}>
              <planeGeometry args={[0.5, 0.012]} />
              <meshBasicMaterial color="#eab308" />
          </mesh>
          <Text position={[0.28, 0, 0]} fontSize={0.015} color="#eab308">
            {(challengeProgress * 100).toFixed(0)}%
          </Text>
      </group>
    </group>
  )
}
