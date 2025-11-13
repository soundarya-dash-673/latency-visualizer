// Types
interface Exchange {
  id: string;
  name: string;
  lat: number;
  lng: number;
  provider: 'AWS' | 'GCP' | 'Azure';
  region: string;
}

interface LatencyData {
  fromId: string;
  toId: string;
  latency: number;
  timestamp: number;
}

interface DataFlowParticle {
  id: string;
  fromId: string;
  toId: string;
  progress: number;
  volume: number;
  speed: number;
}