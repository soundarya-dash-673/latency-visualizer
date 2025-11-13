'use client';
import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line as RLine, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Search, Activity, Zap, Globe2, Download, Moon, Sun } from 'lucide-react';
import { useLiveLatency } from './hooks/useLiveLatency';
import { ThreeGlobe } from './components/ThreeGlobe';
import { EXCHANGES } from './utils/Constant';
import { getLatencyColor } from './utils/utilities';

// Main Application
export default function LatencyVisualizer() {
  const [selectedExchange, setSelectedExchange] = useState<string | null>(null);
  const [latencyData, setLatencyData] = useState<LatencyData[]>([]);
  const [historicalData, setHistoricalData] = useState<Array<{ time: string; latency: number }>>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [showConnections, setShowConnections] = useState(true);
  const [showRegions, setShowRegions] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showDataFlow, setShowDataFlow] = useState(false);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const liveLatencies = useLiveLatency();

  useEffect(() => {
    const updateLatency = () => {
      const newData: LatencyData[] = [];
      
      for (let i = 0; i < 6; i++) {
        const fromIdx = Math.floor(Math.random() * EXCHANGES.length);
        const toIdx = (fromIdx + 1 + Math.floor(Math.random() * (EXCHANGES.length - 1))) % EXCHANGES.length;
        
        const from = EXCHANGES[fromIdx];
        const to = EXCHANGES[toIdx];
        
        const fromLatency = liveLatencies[from.id.toLowerCase()] || 50;
        const toLatency = liveLatencies[to.id.toLowerCase()] || 50;
        const avgLatency = (fromLatency + toLatency) / 2;
        
        newData.push({
          fromId: from.id,
          toId: to.id,
          latency: Math.round(avgLatency),
          timestamp: Date.now()
        });
      }
      
      setLatencyData(newData);
    };

    updateLatency();
    const interval = setInterval(updateLatency, 8000);
    return () => clearInterval(interval);
  }, [liveLatencies]);

  useEffect(() => {
    if (!selectedExchange) return;

    const hours = timeRange === '1h' ? 1 : timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
    const points = Math.min(hours, 50);
    const currentLatency = liveLatencies[selectedExchange.toLowerCase()] || 75;
    
    const data = [];
    const now = Date.now();
    
    for (let i = points; i >= 0; i--) {
      const time = new Date(now - (i * (hours * 60 * 60 * 1000) / points));
      const variation = Math.sin(i / 5) * 15 + (Math.random() - 0.5) * 10;
      
      data.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        latency: Math.round(Math.max(10, currentLatency + variation))
      });
    }
    
    setHistoricalData(data);
  }, [selectedExchange, timeRange, liveLatencies]);

  const filteredExchanges = EXCHANGES.filter(exchange => {
    const matchesProvider = selectedProvider === 'all' || exchange.provider === selectedProvider;
    const matchesSearch = 
      exchange.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exchange.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exchange.provider.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProvider && matchesSearch;
  });

  const stats = {
    avg: latencyData.length ? Math.round(latencyData.reduce((a, b) => a + b.latency, 0) / latencyData.length) : 0,
    min: latencyData.length ? Math.min(...latencyData.map(d => d.latency)) : 0,
    max: latencyData.length ? Math.max(...latencyData.map(d => d.latency)) : 0,
    active: Object.keys(liveLatencies).length
  };

  const exportToCSV = () => {
    const headers = 'From,To,Latency (ms),Timestamp\n';
    const rows = latencyData.map(d => 
      `${d.fromId},${d.toId},${d.latency},${new Date(d.timestamp).toISOString()}`
    ).join('\n');
    
    const csv = headers + rows;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `latency-data-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950 text-white' : 'bg-gray-100 text-gray-900'} p-4 transition-colors`}>
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              3D Latency Topology Visualizer
            </h1>
            <p className={`${darkMode ? 'text-slate-400' : 'text-gray-600'} mt-1`}>
              Real-time cryptocurrency exchange network monitoring with live API data
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg ${darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:bg-gray-50'} border ${darkMode ? 'border-slate-700' : 'border-gray-300'} transition-colors`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={exportToCSV}
              disabled={latencyData.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed rounded-lg transition-colors text-white"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <div className="flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-green-500 animate-pulse" />
              <span className={darkMode ? 'text-slate-300' : 'text-gray-700'}>Live Data</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`${darkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700' : 'bg-white border-gray-300'} rounded-lg p-4 border`}>
            <div className={`flex items-center gap-2 ${darkMode ? 'text-slate-400' : 'text-gray-600'} mb-1`}>
              <Zap className="w-4 h-4" />
              <span className="text-sm">Avg Latency</span>
            </div>
            <div className="text-2xl font-bold">{stats.avg} ms</div>
          </div>
          <div className={`${darkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700' : 'bg-white border-gray-300'} rounded-lg p-4 border`}>
            <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'} mb-1`}>Min Latency</div>
            <div className="text-2xl font-bold text-green-500">{stats.min} ms</div>
          </div>
          <div className={`${darkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700' : 'bg-white border-gray-300'} rounded-lg p-4 border`}>
            <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'} mb-1`}>Max Latency</div>
            <div className="text-2xl font-bold text-red-500">{stats.max} ms</div>
          </div>
          <div className={`${darkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700' : 'bg-white border-gray-300'} rounded-lg p-4 border`}>
            <div className={`flex items-center gap-2 ${darkMode ? 'text-slate-400' : 'text-gray-600'} mb-1`}>
              <Globe2 className="w-4 h-4" />
              <span className="text-sm">Active Monitors</span>
            </div>
            <div className="text-2xl font-bold">{stats.active}</div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-300'} rounded-lg p-4 border`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Search exchanges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:border-blue-500`}
              />
            </div>

            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className={`px-4 py-2 ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:border-blue-500`}
            >
              <option value="all">All Providers</option>
              <option value="AWS">AWS</option>
              <option value="GCP">GCP</option>
              <option value="Azure">Azure</option>
            </select>

            <label className={`flex items-center gap-2 cursor-pointer px-4 py-2 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-300'} border rounded-lg`}>
              <input
                type="checkbox"
                checked={showConnections}
                onChange={(e) => setShowConnections(e.target.checked)}
                className="w-4 h-4"
              />
              <span>Connections</span>
            </label>

            <label className={`flex items-center gap-2 cursor-pointer px-4 py-2 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-300'} border rounded-lg`}>
              <input
                type="checkbox"
                checked={showRegions}
                onChange={(e) => setShowRegions(e.target.checked)}
                className="w-4 h-4"
              />
              <span>Regions</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <label className={`flex items-center gap-2 cursor-pointer px-4 py-2 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-300'} border rounded-lg`}>
              <input
                type="checkbox"
                checked={showHeatmap}
                onChange={(e) => setShowHeatmap(e.target.checked)}
                className="w-4 h-4"
              />
              <span>Heatmap</span>
            </label>

            <label className={`flex items-center gap-2 cursor-pointer px-4 py-2 ${showDataFlow ? 'bg-blue-500 border-blue-400' : darkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-300'} border rounded-lg transition-colors`}>
              <input
                type="checkbox"
                checked={showDataFlow}
                onChange={(e) => setShowDataFlow(e.target.checked)}
                className="w-4 h-4"
              />
              <span className={showDataFlow ? 'text-white font-semibold' : ''}>🌊 Data Flow</span>
            </label>

            <div className={`flex items-center gap-2 px-4 py-2 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-300'} border rounded-lg`}>
              <Activity className="w-4 h-4 text-blue-500" />
              <span className="text-sm">
                {showDataFlow ? 'Active Particles' : 'Data Flow Off'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-700 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FF9900]" />
              <span className={darkMode ? 'text-slate-300' : 'text-gray-700'}>AWS</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#4285F4]" />
              <span className={darkMode ? 'text-slate-300' : 'text-gray-700'}>GCP</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#0078D4]" />
              <span className={darkMode ? 'text-slate-300' : 'text-gray-700'}>Azure</span>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <div className="w-8 h-1 bg-green-500" />
              <span className={darkMode ? 'text-slate-300' : 'text-gray-700'}>&lt;50ms</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-yellow-500" />
              <span className={darkMode ? 'text-slate-300' : 'text-gray-700'}>50-150ms</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-red-500" />
              <span className={darkMode ? 'text-slate-300' : 'text-gray-700'}>&gt;150ms</span>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-300'} rounded-lg border overflow-hidden`} style={{ height: '600px' }}>
          <ThreeGlobe
            exchanges={filteredExchanges}
            selectedExchange={selectedExchange}
            onSelectExchange={setSelectedExchange}
            latencyData={latencyData}
            showConnections={showConnections}
            showRegions={showRegions}
            showHeatmap={showHeatmap}
            showDataFlow={showDataFlow}
            liveLatencies={liveLatencies}
            darkMode={darkMode}
          />
        </div>

        <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-300'} rounded-lg p-6 border`}>
          <h2 className="text-xl font-bold mb-4">Live Exchange Latencies</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {EXCHANGES.map(exchange => {
              const latency = liveLatencies[exchange.id.toLowerCase()];
              const isVisible = filteredExchanges.some(e => e.id === exchange.id);
              
              if (!isVisible) return null;
              
              return (
                <div
                  key={exchange.id}
                  className={`${darkMode ? 'bg-slate-900 border-slate-700 hover:border-blue-500' : 'bg-gray-50 border-gray-300 hover:border-blue-500'} rounded-lg p-4 border cursor-pointer transition-colors`}
                  onClick={() => setSelectedExchange(exchange.id)}
                >
                  <div className="font-bold text-sm mb-1">{exchange.name}</div>
                  <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-600'} mb-2`}>{exchange.provider}</div>
                  {latency ? (
                    <div className="text-2xl font-bold" style={{ color: getLatencyColor(latency) }}>
                      {latency}ms
                    </div>
                  ) : (
                    <div className={`text-sm ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>Measuring...</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {selectedExchange && historicalData.length > 0 && (
          <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-300'} rounded-lg p-6 border`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                Historical Latency - {EXCHANGES.find(e => e.id === selectedExchange)?.name}
              </h2>
              <div className="flex gap-2">
                {(['1h', '24h', '7d', '30d'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      timeRange === range
                        ? 'bg-blue-500 text-white'
                        : darkMode 
                          ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#d1d5db'} />
                <XAxis dataKey="time" stroke={darkMode ? '#9CA3AF' : '#6b7280'} />
                <YAxis stroke={darkMode ? '#9CA3AF' : '#6b7280'} label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft', fill: darkMode ? '#9CA3AF' : '#6b7280' }} />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: darkMode ? '#1E293B' : '#ffffff', 
                    border: `1px solid ${darkMode ? '#475569' : '#d1d5db'}`, 
                    borderRadius: '8px',
                    color: darkMode ? '#ffffff' : '#000000'
                  }}
                />
                <Legend />
                <RLine type="monotone" dataKey="latency" stroke="#3B82F6" strokeWidth={2} dot={false} name="Latency (ms)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}