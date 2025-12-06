import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // CRITICAL: Disable strict mode to prevent double effect mounting
  // which breaks AudioContext and WebGL contexts
  reactStrictMode: false,
  
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei', '@react-three/xr', 'tone'],
  
  // Turbopack config with proper three.js aliasing
  turbopack: {
    resolveAlias: {
      // Force single three.js instance in turbopack
      'three': 'three',
    }
  },
  
  // Webpack config for non-turbopack builds  
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      three: require.resolve('three'),
    }
    // Suppress the multiple Three.js warning in dev
    config.ignoreWarnings = [
      { message: /Multiple instances of Three.js/ }
    ]
    return config
  }
};

export default nextConfig;
