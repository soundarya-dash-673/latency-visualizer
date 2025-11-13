# 3D Latency Topology Visualizer

A real-time cryptocurrency exchange network monitoring application with interactive 3D globe visualization, live latency measurements, and comprehensive data analysis tools.

![Project Banner](https://img.shields.io/badge/Next.js-16.0-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Three.js](https://img.shields.io/badge/Three.js-0.160-orange) ![License](https://img.shields.io/badge/license-MIT-green)

## 📋 Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Running Locally](#running-locally)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [Libraries Used](#libraries-used)
- [Assumptions & Design Decisions](#assumptions--design-decisions)
- [API Integration](#api-integration)
- [Troubleshooting](#troubleshooting)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Features
- 🌍 **Interactive 3D Globe** - Fully interactive globe with drag-to-rotate and scroll-to-zoom
- ⚡ **Real-time Latency Monitoring** - Live HTTP latency measurements from actual exchange APIs
- 📊 **Historical Data Visualization** - Time-series charts with multiple timeframes (1h, 24h, 7d, 30d)
- 🔍 **Advanced Filtering** - Search by exchange name, region, or cloud provider
- ☁️ **Cloud Provider Visualization** - AWS, GCP, and Azure region overlays
- 🔥 **Latency Heatmap** - Visual representation of latency hotspots
- 🌊 **Animated Data Flow** - Particle system showing real-time data packet flow
- 🎨 **Dark/Light Theme** - Toggle between dark and light modes
- 📥 **Export Functionality** - Export latency data to CSV format

### Bonus Features
- ✅ Click-to-select exchanges with detailed information
- ✅ Color-coded latency indicators (green <50ms, yellow 50-150ms, red >150ms)
- ✅ Provider-specific filtering and visualization
- ✅ Responsive design for mobile and desktop
- ✅ Real-time statistics dashboard

## 🎥 Demo

[Include video demo link or GIF here]

## 🛠 Tech Stack

- **Framework**: Next.js 16.0.2 (App Router)
- **Language**: TypeScript 5.3.3
- **3D Visualization**: Three.js 0.160.0
- **Charts**: Recharts 2.10.3
- **Styling**: Tailwind CSS 3.4.1
- **Icons**: Lucide React 0.263.1
- **Runtime**: Node.js 18+ / React 18.2.0

## 📦 Installation

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js**: version 18.0.0 or higher
- **npm**: version 9.0.0 or higher (comes with Node.js)
- **Git**: for cloning the repository

You can check your versions with:
```bash
node --version
npm --version
git --version
```

### Step 1: Clone the Repository
```bash
git clone <your-repository-url>
cd latency-visualizer
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install all required packages:
- Core dependencies: React, Next.js, TypeScript
- 3D libraries: Three.js
- Charting: Recharts
- UI: Tailwind CSS, Lucide React
- Type definitions: @types/three, @types/react, etc.

### Step 3: Verify Installation

Check that all packages are installed correctly:
```bash
npm list --depth=0
```

## 🚀 Running Locally

### Development Mode

To start the development server:
```bash
npm run dev
```

The application will be available at:
- **Local**: http://localhost:3000
- **Network**: http://192.168.x.x:3000 (accessible from other devices on your network)

### Production Build

To create an optimized production build:
```bash
npm run build
npm start
```

### Other Commands
```bash
# Run linter
npm run lint

# Type checking
npx tsc --noEmit

# Clean cache and rebuild
rm -rf .next
npm run dev
```

## 📁 Project Structure
```
latency-visualizer/
├── app/
    |- components/
        |-- ThreeGlobe.tsx
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main application component (Client Component)
│   └── globals.css         # Global styles with Tailwind directives
    |__ utils/
    |__ types/
    |__ hooks/

├── public/                 # Static assets
├── node_modules/           # Dependencies
├── .next/                  # Next.js build output
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
├── next.config.ts          # Next.js configuration
└── README.md              # This file
```

## 🎯 Key Features

### 1. 3D Globe Visualization

**Implementation**: Pure Three.js with manual scene setup
- Interactive sphere with 64x64 segments for smooth rendering
- Wireframe overlay for grid effect
- Custom camera controls (OrbitControls-like behavior)
- Exchange markers positioned using latitude/longitude to 3D vector conversion

**Controls**:
- **Rotate**: Click and drag
- **Zoom**: Scroll wheel (3-10 units range)
- **Select**: Click on markers

### 2. Real-time Latency Measurement

**Method**: HTTP HEAD requests with Performance API
```typescript
const startTime = performance.now();
await fetch(url, { method: 'HEAD', mode: 'no-cors' });
const endTime = performance.now();
const latency = endTime - startTime;
```

**Update Frequency**: Every 10 seconds
**Fallback**: Estimated latency if CORS blocks the request

### 3. Animated Data Flow

**Particle System**:
- Up to 15 simultaneous particles
- Quadratic Bezier curves for realistic data paths
- Size based on simulated volume
- Green spheres (0.1 radius) for high visibility
- Pulsing scale animation
- Auto-cleanup when particles reach destination

### 4. Historical Data

**Implementation**: Simulated time-series data based on current latency
- Uses sine wave variations for realistic patterns
- Stores 50 data points per timeframe
- Updates immediately when exchange is selected

## 📚 Libraries Used

### Core Dependencies

| Library | Version | Purpose | License |
|---------|---------|---------|---------|
| Next.js | 16.0.2 | React framework with SSR/SSG | MIT |
| React | 18.2.0 | UI library | MIT |
| TypeScript | 5.3.3 | Type safety | Apache-2.0 |
| Three.js | 0.160.0 | 3D graphics library | MIT |
| Recharts | 2.10.3 | Charting library | MIT |
| Lucide React | 0.263.1 | Icon library | ISC |
| Tailwind CSS | 3.4.1 | Utility-first CSS | MIT |

### Dev Dependencies

| Library | Purpose |
|---------|---------|
| @types/three | TypeScript definitions for Three.js |
| @types/react | TypeScript definitions for React |
| @types/node | TypeScript definitions for Node.js |
| ESLint | Code linting |
| PostCSS | CSS processing |
| Autoprefixer | CSS vendor prefixing |

### Why These Libraries?

- **Three.js**: Industry-standard for WebGL 3D graphics, excellent documentation
- **Recharts**: React-native charting with good TypeScript support
- **Tailwind**: Rapid UI development with utility classes
- **Lucide**: Modern, lightweight icon set

## 🧩 Assumptions & Design Decisions

### 1. Exchange Data

**Assumption**: Exchange server locations are based on primary data centers
- Binance: Tokyo (AWS ap-northeast-1)
- OKX: Hong Kong (AWS ap-east-1)
- Deribit: Amsterdam (GCP europe-west4)
- Bybit: Singapore (AWS ap-southeast-1)
- Coinbase: San Francisco (GCP us-west1)
- Kraken: London (Azure uk-south)
- Huobi: Beijing (AWS cn-north-1)
- Bitfinex: New York (Azure us-east)

**Source**: Public information from exchange documentation and infrastructure reports

### 2. Latency Measurement

**Assumption**: HTTP HEAD request latency approximates WebSocket latency
- **Rationale**: HEAD requests are lightweight and widely supported
- **Limitation**: CORS policies may block some requests
- **Fallback**: Estimated latency based on distance and provider

### 3. Data Flow Visualization

**Assumption**: Particle size represents trading volume
- **Implementation**: Random volumes between 500-1500 units
- **Rationale**: Demonstrates the concept without requiring real trading data
- **Visual**: Larger particles = higher volume

### 4. Cloud Regions

**Assumption**: Major cloud regions for crypto exchanges
- AWS: US East, Asia Pacific
- GCP: Europe West, US West
- Azure: North America, UK

**Simplified**: Real deployments may use multiple regions

### 5. Performance Optimizations

**Decisions**:
- Limited to 15 simultaneous particles (prevents performance degradation)
- 64x64 sphere geometry (balance between quality and performance)
- Update frequency: 8-10 seconds (reduces API calls)
- Memoized components where appropriate

### 6. Browser Compatibility

**Assumption**: Modern browsers with WebGL support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Not supported**: IE11 or older browsers

## 🔌 API Integration

### Live Latency Sources

The application measures real-time latency to these endpoints:
```typescript
const ENDPOINTS = {
  binance: 'https://www.binance.com',
  okx: 'https://www.okx.com',
  deribit: 'https://www.deribit.com',
  bybit: 'https://www.bybit.com',
  coinbase: 'https://www.coinbase.com',
  kraken: 'https://www.kraken.com'
};
```

### CORS Handling

**Issue**: Some exchanges block cross-origin requests
**Solution**: `mode: 'no-cors'` in fetch requests
**Limitation**: Cannot read response, only measure timing

### Rate Limiting

- Requests sent every 10 seconds per exchange
- Maximum 6 concurrent measurements
- No API keys required (using public endpoints)

## 🐛 Troubleshooting

### Common Issues

#### 1. "You're importing a component that needs useState"

**Solution**: Add `'use client';` as the first line in `app/page.tsx`
```typescript
'use client';

import React, { useState, useEffect, useRef } from 'react';
```

#### 2. CSS Not Loading / Styles Broken

**Solution**: Ensure correct Tailwind setup
```bash
npm install -D tailwindcss postcss autoprefixer
rm -rf .next
npm run dev
```

Verify `app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

#### 3. Three.js Black Screen

**Possible causes**:
- WebGL not supported in browser
- Scene not rendering

**Solution**: Check browser console for WebGL errors

#### 4. Particles Not Visible

**Solution**: 
- Enable "Data Flow" checkbox
- Check browser console for logs
- Particles are bright green (0.1 radius)

#### 5. "Module not found" Errors

**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Performance Issues

If the application is slow:
1. Disable data flow (most intensive feature)
2. Reduce particle count in code (change `< 15` to `< 5`)
3. Close other browser tabs
4. Check GPU acceleration is enabled

### Browser Console

Press **F12** to open developer tools and check:
- Console: JavaScript errors
- Network: Failed API requests
- Performance: Frame rate issues

## 🚧 Future Enhancements

### Planned Features
- [ ] Real WebSocket connections to exchanges
- [ ] Actual trading volume data integration
- [ ] User authentication and saved preferences
- [ ] More exchanges (Gemini, Bittrex, etc.)
- [ ] Network path visualization (traceroute-like)
- [ ] Alerts for high latency
- [ ] Historical data persistence (database)
- [ ] Mobile app version

### Technical Improvements
- [ ] Web Workers for heavy computations
- [ ] Server-side latency measurements
- [ ] GraphQL API for data fetching
- [ ] Unit and integration tests
- [ ] E2E testing with Playwright
- [ ] Performance monitoring (Lighthouse CI)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- Follow existing TypeScript patterns
- Use Prettier for formatting
- Add comments for complex logic
- Write meaningful commit messages

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

**Soundaya Dash**
- Assignment for: GoQuant Recruitment
- Date: November 2025
- Contact: dashsoundarya@gmail.com

## 🙏 Acknowledgments

- Three.js community for excellent documentation
- Next.js team for the amazing framework
- Recharts contributors
- Exchange APIs for public endpoints
- GoQuant for the challenging assignment
