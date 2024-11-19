// LoadingSpinner.js
import { Html, useProgress } from '@react-three/drei/native'

export default function Loader() {
  const { progress } = useProgress()
  return <Html center>{progress} % loaded</Html>
}