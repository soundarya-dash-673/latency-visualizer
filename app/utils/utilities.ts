import * as THREE from 'three';
// Utility Functions
export const latLngToVector3 = (lat: number, lng: number, radius: number) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  
  return new THREE.Vector3(x, y, z);
};

export const getLatencyColor = (latency: number) => {
  if (latency < 50) return '#10b981';
  if (latency < 150) return '#f59e0b';
  return '#ef4444';
};

export const getProviderColor = (provider: string) => {
  switch (provider) {
    case 'AWS': return '#FF9900';
    case 'GCP': return '#4285F4';
    case 'Azure': return '#0078D4';
    default: return '#6B7280';
  }
};