// Real Exchange Data
export const EXCHANGES: Exchange[] = [
  { id: 'binance', name: 'Binance', lat: 35.6762, lng: 139.6503, provider: 'AWS', region: 'ap-northeast-1' },
  { id: 'okx', name: 'OKX', lat: 22.3193, lng: 114.1694, provider: 'AWS', region: 'ap-east-1' },
  { id: 'deribit', name: 'Deribit', lat: 52.3676, lng: 4.9041, provider: 'GCP', region: 'europe-west4' },
  { id: 'bybit', name: 'Bybit', lat: 1.3521, lng: 103.8198, provider: 'AWS', region: 'ap-southeast-1' },
  { id: 'coinbase', name: 'Coinbase', lat: 37.7749, lng: -122.4194, provider: 'GCP', region: 'us-west1' },
  { id: 'kraken', name: 'Kraken', lat: 51.5074, lng: -0.1278, provider: 'Azure', region: 'uk-south' },
  { id: 'huobi', name: 'Huobi', lat: 39.9042, lng: 116.4074, provider: 'AWS', region: 'cn-north-1' },
  { id: 'bitfinex', name: 'Bitfinex', lat: 40.7128, lng: -74.0060, provider: 'Azure', region: 'us-east' },
];

// Cloud Regions for overlays
export const CLOUD_REGIONS = [
  { provider: 'AWS', name: 'US East', lat: 38.0, lng: -78.0, radius: 15 },
  { provider: 'AWS', name: 'Asia Pacific', lat: 25.0, lng: 120.0, radius: 20 },
  { provider: 'GCP', name: 'Europe West', lat: 50.0, lng: 8.0, radius: 15 },
  { provider: 'Azure', name: 'North America', lat: 40.0, lng: -95.0, radius: 18 },
];
