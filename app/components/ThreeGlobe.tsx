import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CLOUD_REGIONS } from '../utils/Constant';
import { getLatencyColor, getProviderColor, latLngToVector3 } from '../utils/utilities';

// Three.js Globe Component
export const ThreeGlobe: React.FC<{
  exchanges: Exchange[];
  selectedExchange: string | null;
  onSelectExchange: (id: string) => void;
  latencyData: LatencyData[];
  showConnections: boolean;
  showRegions: boolean;
  showHeatmap: boolean;
  showDataFlow: boolean;
  liveLatencies: Record<string, number>;
  darkMode: boolean;
}> = ({ exchanges, selectedExchange, onSelectExchange, latencyData, showConnections, showRegions, showHeatmap, showDataFlow, liveLatencies, darkMode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeRef = useRef<THREE.Mesh | null>(null);
  const markersRef = useRef<THREE.Group | null>(null);
  const connectionsRef = useRef<THREE.Group | null>(null);
  const regionsRef = useRef<THREE.Group | null>(null);
  const heatmapRef = useRef<THREE.Group | null>(null);
  const dataFlowRef = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<DataFlowParticle[]>([]);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(darkMode ? 0x0f172a : 0x1e293b);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xffffff, 1);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 0.5);
    pointLight2.position.set(-10, -10, -10);
    scene.add(pointLight2);

    const globeGeometry = new THREE.SphereGeometry(2, 64, 64);
    const globeMaterial = new THREE.MeshStandardMaterial({
      color: darkMode ? 0x1e293b : 0x2d3748,
      wireframe: false,
      transparent: true,
      opacity: 0.9,
      roughness: 0.8,
      metalness: 0.2
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);
    globeRef.current = globe;

    const wireframeGeometry = new THREE.SphereGeometry(2.01, 32, 32);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });
    const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    scene.add(wireframe);

    const markers = new THREE.Group();
    scene.add(markers);
    markersRef.current = markers;

    const connections = new THREE.Group();
    scene.add(connections);
    connectionsRef.current = connections;

    const regions = new THREE.Group();
    scene.add(regions);
    regionsRef.current = regions;

    const heatmap = new THREE.Group();
    scene.add(heatmap);
    heatmapRef.current = heatmap;

    // Data flow group
    const dataFlow = new THREE.Group();
    scene.add(dataFlow);
    dataFlowRef.current = dataFlow;

    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      globe.rotation.y += deltaX * 0.005;
      globe.rotation.x += deltaY * 0.005;
      wireframe.rotation.y = globe.rotation.y;
      wireframe.rotation.x = globe.rotation.x;

      if (markersRef.current) {
        markersRef.current.rotation.y = globe.rotation.y;
        markersRef.current.rotation.x = globe.rotation.x;
      }
      if (connectionsRef.current) {
        connectionsRef.current.rotation.y = globe.rotation.y;
        connectionsRef.current.rotation.x = globe.rotation.x;
      }
      if (regionsRef.current) {
        regionsRef.current.rotation.y = globe.rotation.y;
        regionsRef.current.rotation.x = globe.rotation.x;
      }
      if (heatmapRef.current) {
        heatmapRef.current.rotation.y = globe.rotation.y;
        heatmapRef.current.rotation.x = globe.rotation.x;
      }
      if (dataFlowRef.current) {
        dataFlowRef.current.rotation.y = globe.rotation.y;
        dataFlowRef.current.rotation.x = globe.rotation.x;
      }

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z += e.deltaY * 0.01;
      camera.position.z = Math.max(3, Math.min(10, camera.position.z));
    };

    const onClick = (e: MouseEvent) => {
      if (!markersRef.current || !containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2(x, y);
      raycaster.setFromCamera(mouse, camera);
      
      const intersects = raycaster.intersectObjects(markersRef.current.children, true);
      if (intersects.length > 0 && intersects[0].object.userData.exchange) {
        onSelectExchange(intersects[0].object.userData.exchange.id);
      }
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('wheel', onWheel);
    renderer.domElement.addEventListener('click', onClick);

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      if (!isDragging && globe) {
        globe.rotation.y += 0.001;
        wireframe.rotation.y = globe.rotation.y;
        if (markersRef.current) markersRef.current.rotation.y = globe.rotation.y;
        if (connectionsRef.current) connectionsRef.current.rotation.y = globe.rotation.y;
        if (regionsRef.current) regionsRef.current.rotation.y = globe.rotation.y;
        if (heatmapRef.current) heatmapRef.current.rotation.y = globe.rotation.y;
        if (dataFlowRef.current) dataFlowRef.current.rotation.y = globe.rotation.y;
      }

      // Update data flow particles - SIMPLIFIED
      if (dataFlowRef.current && particlesRef.current.length > 0) {
        particlesRef.current.forEach((particle, idx) => {
          particle.progress += particle.speed;
          
          // Remove if completed
          if (particle.progress >= 1) {
            particle.progress = 1; // Cap at 1
          }
          
          // Find corresponding mesh
          const mesh = dataFlowRef.current?.children[idx];
          if (mesh && mesh instanceof THREE.Mesh) {
            const from = exchanges.find(e => e.id === particle.fromId);
            const to = exchanges.find(e => e.id === particle.toId);
            
            if (from && to) {
              const fromPos = latLngToVector3(from.lat, from.lng, 2.15);
              const toPos = latLngToVector3(to.lat, to.lng, 2.15);
              const midPoint = new THREE.Vector3()
                .addVectors(fromPos, toPos)
                .multiplyScalar(0.5)
                .normalize()
                .multiplyScalar(2.5);
              
              const curve = new THREE.QuadraticBezierCurve3(fromPos, midPoint, toPos);
              const position = curve.getPoint(particle.progress);
              mesh.position.copy(position);
              
              // Pulse effect
              const scale = 1 + Math.sin(particle.progress * Math.PI * 2) * 0.5;
              mesh.scale.set(scale, scale, scale);
              
              // Fade out near end
              if (mesh.material instanceof THREE.MeshBasicMaterial) {
                mesh.material.opacity = particle.progress < 0.9 ? 1 : (1 - particle.progress) * 10;
              }
            }
          }
        });
        
        // Clean up completed particles
        particlesRef.current = particlesRef.current.filter(p => p.progress < 1);
        while (dataFlowRef.current.children.length > particlesRef.current.length) {
          const mesh = dataFlowRef.current.children[dataFlowRef.current.children.length - 1];
          dataFlowRef.current.remove(mesh);
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      renderer.domElement.removeEventListener('click', onClick);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [darkMode, onSelectExchange]);

  // Update markers
  useEffect(() => {
    if (!markersRef.current) return;

    while (markersRef.current.children.length > 0) {
      markersRef.current.remove(markersRef.current.children[0]);
    }

    exchanges.forEach(exchange => {
      const position = latLngToVector3(exchange.lat, exchange.lng, 2.05);
      const isSelected = selectedExchange === exchange.id;
      
      const markerGeometry = new THREE.SphereGeometry(isSelected ? 0.08 : 0.05, 16, 16);
      const markerMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(getProviderColor(exchange.provider)),
        emissive: new THREE.Color(getProviderColor(exchange.provider)),
        emissiveIntensity: isSelected ? 1 : 0.5
      });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.copy(position);
      marker.userData = { exchange };

      markersRef.current?.add(marker);

      if (isSelected) {
        const ringGeometry = new THREE.RingGeometry(0.1, 0.12, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.5
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.copy(position);
        ring.lookAt(0, 0, 0);
        markersRef.current?.add(ring);
      }
    });
  }, [exchanges, selectedExchange]);

  // Update connections
  useEffect(() => {
    if (!connectionsRef.current) return;

    while (connectionsRef.current.children.length > 0) {
      connectionsRef.current.remove(connectionsRef.current.children[0]);
    }

    if (!showConnections) return;

    latencyData.forEach(data => {
      const from = exchanges.find(e => e.id === data.fromId);
      const to = exchanges.find(e => e.id === data.toId);
      if (!from || !to) return;

      const fromPos = latLngToVector3(from.lat, from.lng, 2.05);
      const toPos = latLngToVector3(to.lat, to.lng, 2.05);

      const midPoint = new THREE.Vector3()
        .addVectors(fromPos, toPos)
        .multiplyScalar(0.5)
        .normalize()
        .multiplyScalar(2.3);

      const curve = new THREE.QuadraticBezierCurve3(fromPos, midPoint, toPos);
      const points = curve.getPoints(50);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      
      const material = new THREE.LineBasicMaterial({
        color: new THREE.Color(getLatencyColor(data.latency)),
        transparent: true,
        opacity: 0.6
      });

      const line = new THREE.Line(geometry, material);
      connectionsRef.current?.add(line);
    });
  }, [latencyData, exchanges, showConnections]);

  // Update cloud regions
  useEffect(() => {
    if (!regionsRef.current) return;

    while (regionsRef.current.children.length > 0) {
      regionsRef.current.remove(regionsRef.current.children[0]);
    }

    if (!showRegions) return;

    CLOUD_REGIONS.forEach(region => {
      const position = latLngToVector3(region.lat, region.lng, 2.02);
      const size = region.radius * 0.01;
      
      const geometry = new THREE.CircleGeometry(size, 32);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(getProviderColor(region.provider)),
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
      });
      const circle = new THREE.Mesh(geometry, material);
      circle.position.copy(position);
      circle.lookAt(0, 0, 0);
      
      regionsRef.current?.add(circle);
    });
  }, [showRegions]);

  // Update heatmap
  useEffect(() => {
    if (!heatmapRef.current) return;

    while (heatmapRef.current.children.length > 0) {
      heatmapRef.current.remove(heatmapRef.current.children[0]);
    }

    if (!showHeatmap) return;

    exchanges.forEach(exchange => {
      const latency = liveLatencies[exchange.id.toLowerCase()] || 75;
      const intensity = Math.max(0, 1 - (latency / 200));
      
      const position = latLngToVector3(exchange.lat, exchange.lng, 2.015);
      const geometry = new THREE.CircleGeometry(0.15, 32);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(getLatencyColor(latency)),
        transparent: true,
        opacity: 0.4 * intensity,
        side: THREE.DoubleSide
      });
      const heatSpot = new THREE.Mesh(geometry, material);
      heatSpot.position.copy(position);
      heatSpot.lookAt(0, 0, 0);
      
      heatmapRef.current?.add(heatSpot);
    });
  }, [showHeatmap, exchanges, liveLatencies]);

  // Update data flow particles
  useEffect(() => {
    if (!dataFlowRef.current || !showDataFlow) {
      if (dataFlowRef.current) {
        while (dataFlowRef.current.children.length > 0) {
          dataFlowRef.current.remove(dataFlowRef.current.children[0]);
        }
      }
      particlesRef.current = [];
      return;
    }

    console.log('Data Flow Enabled! Creating particles...');

    const createParticle = () => {
      if (!dataFlowRef.current || exchanges.length < 2) {
        console.log('Cannot create particle - missing refs or exchanges');
        return;
      }

      // Generate random exchange pair
      const fromIdx = Math.floor(Math.random() * exchanges.length);
      let toIdx = Math.floor(Math.random() * exchanges.length);
      while (toIdx === fromIdx && exchanges.length > 1) {
        toIdx = Math.floor(Math.random() * exchanges.length);
      }

      const from = exchanges[fromIdx];
      const to = exchanges[toIdx];

      console.log(`Creating particle from ${from.name} to ${to.name}`);

      // Create particle data
      const particle: DataFlowParticle = {
        id: `${Date.now()}-${Math.random()}`,
        fromId: from.id,
        toId: to.id,
        progress: 0,
        volume: Math.random() * 1000 + 500,
        speed: 0.01
      };

      particlesRef.current.push(particle);

      // Create VERY VISIBLE particle
      const particleSize = 0.1; // HUGE size for testing
      const particleGeometry = new THREE.SphereGeometry(particleSize, 32, 32);
      const particleMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color('#00ff00'), // BRIGHT GREEN for high visibility
        transparent: true,
        opacity: 1
      });
      const particleMesh = new THREE.Mesh(particleGeometry, particleMaterial);
      
      // Start at from position
      const startPos = latLngToVector3(from.lat, from.lng, 2.15);
      particleMesh.position.copy(startPos);
      
      dataFlowRef.current.add(particleMesh);
      console.log('Particle mesh added to scene, total particles:', particlesRef.current.length);
    };

    // Create initial particles immediately
    console.log('Creating 5 initial particles...');
    for (let i = 0; i < 5; i++) {
      setTimeout(() => createParticle(), i * 500);
    }

    // Create particles periodically
    const interval = setInterval(() => {
      if (particlesRef.current.length < 15) {
        createParticle();
      }
    }, 1000);

    return () => {
      console.log('Data Flow disabled, cleaning up...');
      clearInterval(interval);
      if (dataFlowRef.current) {
        while (dataFlowRef.current.children.length > 0) {
          dataFlowRef.current.remove(dataFlowRef.current.children[0]);
        }
      }
      particlesRef.current = [];
    };
  }, [showDataFlow, exchanges]);

  return <div ref={containerRef} className="w-full h-full" />;
};