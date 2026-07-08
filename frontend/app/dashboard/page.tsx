'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { geoData } from '@/lib/geoData'

const LiveMap = dynamic(() => import('@/components/LiveMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#102034] flex items-center justify-center text-[#9dd0cd] uppercase tracking-widest text-xs font-bold animate-pulse">Initializing Geospatial Engine...</div>
})
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Map as MapIcon, AlertTriangle, TrendingUp, Zap, History, FileText, Bot, Search, Bell, CheckCircle, Loader2, Play, Pause } from 'lucide-react'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [actionStates, setActionStates] = useState<Record<string, string>>({})
  const [modalOpen, setModalOpen] = useState(false)
  const [incidents, setIncidents] = useState<any[]>([])

  // New States for Overhaul
  const [showPredictions, setShowPredictions] = useState(false)
  const [historicalDay, setHistoricalDay] = useState(0)
  const [interventionStep, setInterventionStep] = useState(1)
  const [selectedWard, setSelectedWard] = useState('')
  const [selectedInterv, setSelectedInterv] = useState('')
  const [reportStep, setReportStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedState, setSelectedState] = useState('India (National)')
  const [selectedDistrict, setSelectedDistrict] = useState('All India')
  const [showSimulator, setShowSimulator] = useState(false)
  const [activeIncident, setActiveIncident] = useState<any>(null)
  
  const [simResult, setSimResult] = useState<any>(null);
  const [predictedIncidents, setPredictedIncidents] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([{role: 'assistant', content: 'VISTA Copilot initialized. How can I assist you with urban intelligence today?'}]);

  const generateReport = async () => {
    setReportStep(2);
    try {
      const res = await fetch('/api/reports/generate', { method: 'POST' });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "VISTA_Audit_Trail.pdf";
      a.click();
      setReportStep(3);
    } catch(e) {
      setReportStep(0);
    }
  }

  const sendChat = async () => {
    if(!chatInput) return;
    const newHist = [...chatHistory, {role: 'user', content: chatInput}];
    setChatHistory(newHist);
    setChatInput('');
    try {
      const res = await fetch('/api/copilot/ask', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({query: chatInput})
      });
      const data = await res.json();
      setChatHistory([...newHist, {role: 'assistant', content: data.response}]);
    } catch(e) {
      console.error(e);
    }
  }

  const activeGeo = geoData[selectedState]?.districts[selectedDistrict] || geoData[selectedState];
  const activeCoords = activeGeo?.coords || [28.6139, 77.2090];
  const activeZoom = activeGeo?.zoom || 10;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setHistoricalDay(prev => {
          if (prev >= -1) setIsPlaying(false);
          return prev < 0 ? prev + 1 : 0;
        });
      }, 2000)
    }
    return () => clearInterval(interval)
  }, [isPlaying])

  useEffect(() => {
    fetch(`/api/incidents/history?hours_ago=${Math.abs(historicalDay)}`)
      .then(r => r.json())
      .then(data => {
        if (data && Array.isArray(data)) setIncidents(data);
      })
      .catch(e => console.error("Failed to fetch incidents", e));
  }, [historicalDay])

  useEffect(() => {
    if (showPredictions) {
      fetch('/api/incidents/predict')
        .then(r => r.json())
        .then(data => setPredictedIncidents(data));
    }
  }, [showPredictions])

  useEffect(() => {
    // Connect WebSocket via relative URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/incidents`;
    const ws = new WebSocket(wsUrl);
    ws.onmessage = (event) => {
      try {
        const newIncident = JSON.parse(event.data);
        // Prepend to incidents list
        setIncidents(prev => [newIncident, ...prev].slice(0, 50));
      } catch (e) {
        console.error("WS parse error", e);
      }
    };

    return () => {
      ws.close();
    }
  }, [])

  // Generic action handler to simulate API calls
  const handleAction = (id: string, actionName: string) => {
    setActionStates(prev => ({ ...prev, [id]: 'loading' }))
    setTimeout(() => {
      setActionStates(prev => ({ ...prev, [id]: 'success' }))
      setTimeout(() => {
        setActionStates(prev => ({ ...prev, [id]: 'idle' }))
      }, 3000)
    }, 1500)
  }

  const ActionButton = ({ id, text }: { id: string, text: string }) => {
    const state = actionStates[id] || 'idle'
    if (state === 'loading') {
      return (
        <button disabled className="py-1 px-3 border border-[#9dd0cd]/20 text-[#9dd0cd] text-[10px] font-bold rounded flex items-center gap-1 uppercase">
          <Loader2 size={12} className="animate-spin" /> Deploying
        </button>
      )
    }
    if (state === 'success') {
      return (
        <button disabled className="py-1 px-3 border border-[#10B981]/50 text-[#10B981] bg-[#10B981]/10 text-[10px] font-bold rounded flex items-center gap-1 uppercase">
          <CheckCircle size={12} /> Active
        </button>
      )
    }
    return (
      <button 
        onClick={() => handleAction(id, text)}
        className="py-1 px-3 border border-[#9dd0cd]/20 text-[#9dd0cd] text-[10px] font-bold rounded hover:bg-[#9dd0cd]/10 uppercase transition-colors"
      >
        {text}
      </button>
    )
  }

  return (
    <div className="bg-[#031427] text-[#d3e4fe] min-h-screen font-body flex overflow-hidden selection:bg-[#00a6e0] selection:text-[#00354a]">
      
      {/* SideNavBar */}
      <aside className="w-64 flex flex-col z-40 bg-[#0b1c30] border-r border-[#404848] h-screen sticky top-0 shrink-0">
        <div className="p-6 border-b border-[#404848]/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#2a5c5a] rounded flex items-center justify-center">
              <span className="material-symbols-outlined text-[#9dd0cd] text-[22px]">hub</span>
            </div>
            <div>
              <h2 className="font-display text-sm font-bold text-[#9dd0cd] leading-tight max-w-[130px] truncate">{selectedState === 'India (National)' ? 'Pan-India' : selectedState}</h2>
              <p className="text-[9px] text-[#c0c8c7] tracking-widest uppercase font-bold mt-0.5">Operations Center</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'live', icon: MapIcon, label: 'Live Map' },
            { id: 'incidents', icon: AlertTriangle, label: 'Incidents' },
            { id: 'reports', icon: FileText, label: 'Reports' },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all font-bold ${activeTab === tab.id ? 'bg-[#9dd0cd]/10 text-[#9dd0cd]' : 'text-[#c0c8c7] hover:bg-[#1b2b3f] hover:text-[#d3e4fe]'}`}
            >
              <tab.icon size={18} />
              <span className="text-[11px] tracking-wider uppercase">{tab.label}</span>
            </button>
          ))}

          <div className="my-4 h-[1px] bg-[#404848]/50 mx-4"></div>
          
          <button 
            onClick={() => setActiveTab('copilot')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all font-bold border border-[#9dd0cd]/20 ${activeTab === 'copilot' ? 'bg-[#9dd0cd]/20 text-[#9dd0cd]' : 'bg-[#9dd0cd]/5 text-[#9dd0cd] hover:bg-[#1b2b3f]'}`}
          >
            <Bot size={18} className="text-[#9dd0cd]" />
            <span className="text-[11px] tracking-wider uppercase text-[#9dd0cd]">FUSION AI COPILOT</span>
          </button>
        </nav>

        <div className="p-4 border-t border-[#404848]/30">
          <button 
            onClick={() => setModalOpen(true)}
            className="w-full py-3 bg-[#9dd0cd] text-[#003735] font-bold rounded hover:opacity-90 transition-opacity text-[11px] tracking-widest uppercase"
          >
            INITIATE RESPONSE
          </button>
        </div>
      </aside>

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* TopNavBar */}
        <header className="bg-[#0b1c30] flex justify-between items-center px-8 h-16 border-b border-[#404848] shrink-0 relative z-10">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Link href="/" className="font-display text-2xl font-black text-[#9dd0cd] tracking-tighter">VISTA</Link>
              <span className="text-xs font-bold text-[#c0c8c7] tracking-widest uppercase opacity-60 ml-2">UNIFIED FUSION PLATFORM</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-[#26364a]/50 rounded-full border border-[#404848]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9dd0cd]"></span>
              <span className="text-[10px] font-bold text-[#c0c8c7] uppercase tracking-widest">ADMIN ACCESS: NATIONAL-HQ</span>
            </div>
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c0c8c7]" size={16} />
              <input className="bg-[#000f21] border border-[#404848] rounded pl-10 pr-4 py-1.5 text-xs w-72 focus:ring-1 focus:ring-[#9dd0cd] outline-none text-white" placeholder="Search fused data nodes..." type="text"/>
            </div>
            <button className="text-[#c0c8c7] hover:bg-[#26364a] p-2 rounded transition-colors"><Bell size={20}/></button>
            <div className="w-8 h-8 rounded border border-[#404848] overflow-hidden ml-2">
              <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"/>
            </div>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto bg-[#031427] relative z-0" style={{backgroundImage: "linear-gradient(rgba(138, 146, 145, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(138, 146, 145, 0.05) 1px, transparent 1px)", backgroundSize: "32px 32px"}}>
          
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div key="dash" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="p-8 pb-16">
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <h1 className="text-3xl font-display text-[#9dd0cd]">Evidence Fusion: {selectedState === 'India (National)' ? 'Pan-India' : selectedState} Operations</h1>
                    <p className="text-[#c0c8c7] mt-1">Multi-Signal Fusion Intelligence for real-time municipal response orchestration.</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-[#c0c8c7] uppercase tracking-widest border border-[#404848]/30 rounded px-3 py-1 bg-[#000f21]">
                    <span className="w-2 h-2 rounded-full bg-[#9dd0cd] animate-pulse"></span> FUSION SYNC: ACTIVE (242ms)
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* AQI Widget */}
                  <div className="md:col-span-12 lg:col-span-3 bg-[#102034] border border-[#404848] p-6 rounded flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] text-[#c0c8c7] mb-1 tracking-widest font-bold uppercase">CPCB FUSED AVG AQI</p>
                      <div className="flex items-end gap-3">
                        <span className="text-5xl font-black leading-none text-[#9dd0cd]">342</span>
                        <div className="mb-1 px-2 py-0.5 bg-[#93000a] text-[#ffdad6] rounded flex items-center gap-1 font-mono text-[10px]">
                          <TrendingUp size={12} /> 8.4%
                        </div>
                      </div>
                      <p className="text-[#ffb4ab] font-bold text-xs mt-3 uppercase tracking-wider">Category: Very Poor</p>
                    </div>
                    <div className="h-12 mt-6 flex items-end gap-1">
                      {[10, 20, 30, 40, 60, 95].map((h, i) => (
                        <div key={i} className="flex-1 bg-[#9dd0cd] rounded-t-sm" style={{height: `${h}%`, opacity: 0.2 + (i*0.15)}}></div>
                      ))}
                    </div>
                  </div>

                  {/* AI Map Forecast */}
                  <div className="md:col-span-12 lg:col-span-6 bg-[#102034] border border-[#404848] rounded overflow-hidden relative">
                    <div className="absolute top-4 left-4 z-20 pointer-events-none">
                      <span className="bg-[#26364a]/90 backdrop-blur px-3 py-1.5 rounded border border-[#404848] text-[10px] text-[#9dd0cd] tracking-widest uppercase font-bold">Fused Spatial Risk Forecast (T+4H)</span>
                    </div>
                    <div className="w-full h-full min-h-[300px] bg-[#26364a] relative">
                      <LiveMap timelineFactor={0} showPredictions={false} coords={[28.6139, 77.2090]} zoom={10} liveIncidents={incidents} />
                    </div>
                    <div className="absolute bottom-4 right-4 z-20 flex gap-2">
                      <button onClick={() => setActiveTab('live')} className="bg-[#26364a] border border-[#404848] text-white px-4 py-2 rounded text-[10px] tracking-widest font-bold uppercase hover:bg-[#1b2b3f] transition-colors">WARDS</button>
                      <button onClick={() => setActiveTab('live')} className="bg-[#9dd0cd] text-[#003735] px-4 py-2 rounded text-[10px] tracking-widest font-bold uppercase shadow-lg hover:brightness-110 transition-colors">Inspect Hotspots</button>
                    </div>
                  </div>

                  {/* Model Health */}
                  <div className="md:col-span-12 lg:col-span-3 bg-[#102034] border border-[#404848] p-6 rounded flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] text-[#c0c8c7] mb-6 tracking-widest uppercase font-bold">Fusion Engine Confidence</p>
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90">
                        <circle cx="64" cy="64" fill="none" r="58" stroke="#1b2b3f" strokeWidth="8"></circle>
                        <circle cx="64" cy="64" fill="none" r="58" stroke="#9dd0cd" strokeDasharray="364" strokeDashoffset="44" strokeLinecap="round" strokeWidth="8" className="shadow-[0_0_15px_rgba(157,208,205,0.5)]"></circle>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-[#9dd0cd]">88%</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-[#c0c8c7] mt-6">Fused: CPCB + Citizen + Sat-Intel</p>
                  </div>

                  {/* Live Field Reports */}
                  <div className="col-span-12 bg-[#102034] border-2 border-[#9dd0cd]/30 rounded p-6 mt-2">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-[#7bd0ff] animate-pulse"></div>
                        <h3 className="text-xs text-[#9dd0cd] font-bold tracking-widest uppercase">Live Field Reports</h3>
                      </div>
                      <span className="text-[10px] font-bold text-[#c0c8c7] bg-[#1b2b3f] px-2 py-1 rounded uppercase tracking-wider">Citizen & Sensor Intel: Active</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {incidents.slice(0,3).map((inc, i) => (
                      <div key={i} className="bg-[#000f21] rounded overflow-hidden border border-[#404848] group hover:border-[#9dd0cd]/50 transition-colors">
                        <div className="h-32 bg-[#000f21] p-4 relative flex flex-col justify-end">
                          <div className="absolute top-3 right-3 bg-[#ffb4ab] text-[#690005] text-[9px] px-2 py-0.5 rounded font-bold uppercase z-10">{inc.severity || 'Medium'} Severity</div>
                          <div className="absolute top-3 left-3 bg-[#26364a] border border-[#404848] w-8 h-8 rounded flex items-center justify-center">
                            <AlertTriangle size={16} className="text-[#9dd0cd]" />
                          </div>
                          <div className="relative z-10">
                            <p className="text-sm font-bold text-[#9dd0cd] truncate mr-2">{inc.description || `Anomaly at ${inc.lat?.toFixed(2)}, ${inc.lng?.toFixed(2)}`}</p>
                            <p className="text-[9px] font-bold text-[#7bd0ff] uppercase mt-1 tracking-wider">{inc.type || 'Sensor Alert'} • Verified Active</p>
                          </div>
                        </div>
                        <div className="p-3 bg-[#0b1c30] border-t border-[#404848] flex justify-between items-center">
                          <span className="text-[9px] font-bold text-[#c0c8c7] uppercase tracking-widest">Lat: {inc.lat?.toFixed(2)}, Lng: {inc.lng?.toFixed(2)}</span>
                          <ActionButton id={`resp${i}`} text="Deploy Response" />
                        </div>
                      </div>
                      ))}
                      {incidents.length === 0 && (
                        <div className="col-span-3 text-center text-[#c0c8c7] py-8 border border-dashed border-[#404848] rounded">
                          No verified intelligence feeds available yet.
                        </div>
                      )}

                    </div>
                  </div>

                  {/* Active Hotspots */}
                  <div className="col-span-12 lg:col-span-8 bg-[#102034] border border-[#404848] rounded flex flex-col mt-2">
                    <div className="px-6 py-4 border-b border-[#404848] flex justify-between items-center">
                      <h3 className="text-[10px] text-[#9dd0cd] tracking-widest font-bold uppercase">High-Impact Fused Hotspots</h3>
                      <span className="text-[#c0c8c7] text-[10px] font-bold uppercase tracking-wider">Top Detected Zones</span>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex gap-4 bg-[#0b1c30] p-4 rounded border border-[#404848]/50">
                        <div className="w-20 h-20 bg-[#26364a] border border-[#404848] rounded flex items-center justify-center shrink-0">
                          <MapIcon size={24} className="text-[#9dd0cd]/50" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#9dd0cd]">Wazirpur Industrial</h4>
                          <p className="text-mono text-[#ffb4ab] font-bold text-xs mt-1">AQI: 412 (Fused)</p>
                          <p className="text-[10px] text-[#c0c8c7] mt-1 leading-relaxed">Source: Metal Finishing Units. High particulate matter detection.</p>
                        </div>
                      </div>
                      <div className="flex gap-4 bg-[#0b1c30] p-4 rounded border border-[#404848]/50">
                        <div className="w-20 h-20 bg-[#26364a] border border-[#404848] rounded flex items-center justify-center shrink-0">
                          <MapIcon size={24} className="text-[#9dd0cd]/50" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#9dd0cd]">Sarai Kale Khan</h4>
                          <p className="text-mono text-[#7bd0ff] font-bold text-xs mt-1">AQI: 284 (Fused)</p>
                          <p className="text-[10px] text-[#c0c8c7] mt-1 leading-relaxed">Source: Heavy Vehicle Idling. Google Maps + DPCC Sensor fusion indicates high NO2.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Municipal Actions */}
                  <div className="col-span-12 lg:col-span-4 bg-[#102034] border border-[#404848] rounded flex flex-col mt-2">
                    <div className="px-6 py-4 border-b border-[#404848]">
                      <h3 className="text-[10px] text-[#9dd0cd] tracking-widest font-bold uppercase">Fusion Response Log</h3>
                    </div>
                    <div className="p-6 flex flex-col gap-5">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 w-2 h-2 rounded-full bg-[#7bd0ff]"></div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-[#9dd0cd]">Smog Tower Activation (CP)</p>
                          <p className="text-[9px] font-bold text-[#c0c8c7] uppercase mt-1">Signal Fusion • Verified Active</p>
                        </div>
                        <span className="text-mono text-[10px] text-[#c0c8c7]">80% Eff.</span>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="mt-1 w-2 h-2 rounded-full bg-[#9dd0cd]"></div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-[#9dd0cd]">Mist Cannon Deployment</p>
                          <p className="text-[9px] font-bold text-[#c0c8c7] uppercase mt-1">Okhla Sec-II • Deployed</p>
                        </div>
                        <span className="text-mono text-[10px] text-[#c0c8c7]">4 Units</span>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="mt-1 w-2 h-2 rounded-full bg-[#8a9291]"></div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-[#9dd0cd]">GRAP Phase IV Restrictions</p>
                          <p className="text-[9px] font-bold text-[#c0c8c7] uppercase mt-1">NCR Region • Fused Analysis</p>
                        </div>
                        <span className="text-mono text-[10px] text-[#c0c8c7]">Pending</span>
                      </div>
                    </div>
                    <div className="mt-auto p-6 border-t border-[#404848]">
                      <button onClick={() => setActiveTab('reports')} className="w-full py-2 bg-[#1b2b3f] border border-[#404848] text-white text-[10px] font-bold tracking-widest uppercase hover:bg-[#26364a] transition-colors rounded">Unified Audit Trail</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'live' && (
              <motion.div key="live" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 z-10 bg-[#000f21]">
                <div className="absolute inset-0 z-0">
                  <LiveMap 
                    timelineFactor={historicalDay} 
                    showPredictions={showPredictions} 
                    coords={activeCoords} 
                    zoom={activeZoom} 
                    liveIncidents={showPredictions ? [...incidents, ...predictedIncidents] : incidents}
                    onIncidentClick={(inc: any) => setActiveIncident(inc)}
                  />
                </div>
                
                {/* Intel Panel Overlay */}
                <AnimatePresence>
                  {activeIncident && (
                    <motion.div 
                      initial={{x: 300, opacity: 0}}
                      animate={{x: 0, opacity: 1}}
                      exit={{x: 300, opacity: 0}}
                      className="absolute right-4 top-4 bottom-4 w-80 bg-[#0b1c30]/95 backdrop-blur border border-[#404848] rounded-lg shadow-2xl z-30 p-5 overflow-y-auto"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h2 className="text-[#9dd0cd] uppercase tracking-widest text-xs font-bold mb-1">Live Intel Report</h2>
                          <span className="text-[#c0c8c7] text-sm font-medium">#{activeIncident.id || 'N/A'}</span>
                        </div>
                        <button onClick={() => setActiveIncident(null)} className="text-[#8a9291] hover:text-white transition-colors">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-[#102034] p-3 rounded border border-[#1b2b3f]">
                          <span className="text-[10px] text-[#c0c8c7] uppercase tracking-widest block mb-1">Classification</span>
                          <div className="flex items-center gap-2">
                            <AlertTriangle size={14} className="text-[#ffb4ab]" />
                            <span className="text-[#d3e4fe] font-bold text-sm">{activeIncident.type || 'Unknown'}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-[#102034] p-3 rounded border border-[#1b2b3f]">
                            <span className="text-[10px] text-[#c0c8c7] uppercase tracking-widest block mb-1">Severity</span>
                            <span className={`text-sm font-bold ${activeIncident.severity === 'Critical' ? 'text-magenta-500' : 'text-[#ffb4ab]'}`}>{activeIncident.severity || 'High'}</span>
                          </div>
                          <div className="bg-[#102034] p-3 rounded border border-[#1b2b3f]">
                            <span className="text-[10px] text-[#c0c8c7] uppercase tracking-widest block mb-1">AI Confidence</span>
                            <span className="text-sm font-bold text-[#9dd0cd]">{(activeIncident.confidence * 100).toFixed(1)}%</span>
                          </div>
                        </div>

                        <div className="bg-[#102034] p-3 rounded border border-[#1b2b3f]">
                          <span className="text-[10px] text-[#c0c8c7] uppercase tracking-widest block mb-1">Description</span>
                          <p className="text-sm text-[#d3e4fe] leading-relaxed">{activeIncident.description}</p>
                        </div>

                        <div className="bg-[#102034] p-3 rounded border border-[#1b2b3f]">
                          <span className="text-[10px] text-[#c0c8c7] uppercase tracking-widest block mb-1">Coordinates</span>
                          <p className="text-xs text-[#9dd0cd] font-mono">{activeIncident.lat.toFixed(6)}, {activeIncident.lng.toFixed(6)}</p>
                        </div>

                        <button onClick={() => {setActiveTab('incidents'); setActiveIncident(null);}} className="w-full mt-4 py-2 bg-[#1b2b3f] text-[#c0c8c7] border border-[#404848] rounded hover:text-white transition-colors uppercase font-bold text-[10px] tracking-widest flex items-center justify-center gap-2">
                          <span>View Full Record</span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="absolute top-4 left-4 z-20 flex items-center gap-4">
                  <span className="bg-[#102034]/90 backdrop-blur px-4 py-2 rounded text-[#9dd0cd] font-bold border border-[#404848] text-sm shadow-[0_0_15px_rgba(157,208,205,0.2)]">
                    Operational Live Map
                  </span>
                  <div className="flex gap-2">
                    <select value={selectedState} onChange={(e) => {setSelectedState(e.target.value); setSelectedDistrict(Object.keys(geoData[e.target.value].districts)[0]);}} className="bg-[#102034]/90 backdrop-blur border border-[#404848] rounded px-3 py-1.5 text-[10px] uppercase font-bold tracking-widest text-[#9dd0cd] focus:outline-none focus:border-[#9dd0cd] transition-colors cursor-pointer">
                      {Object.keys(geoData).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} className="bg-[#102034]/90 backdrop-blur border border-[#404848] rounded px-3 py-1.5 text-[10px] uppercase font-bold tracking-widest text-[#9dd0cd] focus:outline-none focus:border-[#9dd0cd] transition-colors cursor-pointer">
                      {Object.keys(geoData[selectedState].districts).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                <div className="absolute top-20 left-4 z-20">
                  <button onClick={() => setShowSimulator(!showSimulator)} className={`flex items-center gap-2 px-4 py-3 rounded border border-[#404848] font-bold text-xs uppercase tracking-widest shadow-xl transition-colors ${showSimulator ? 'bg-[#9dd0cd] text-[#003735]' : 'bg-[#102034]/90 backdrop-blur text-[#9dd0cd] hover:bg-[#1b2b3f]'}`}>
                    <Zap size={16} /> {showSimulator ? 'Close Simulator' : 'Intervention Simulator'}
                  </button>
                </div>

                {/* Floating Simulator Panel */}
                <AnimatePresence>
                  {showSimulator && (
                    <motion.div initial={{x: -300, opacity: 0}} animate={{x: 0, opacity: 1}} exit={{x: -300, opacity: 0}} className="absolute top-36 left-4 z-20 w-[400px] bg-[#102034]/95 backdrop-blur-xl border border-[#404848] rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden">
                      <div className="p-4 border-b border-[#404848] bg-[#0b1c30]">
                        <h2 className="text-sm font-bold text-[#9dd0cd] uppercase tracking-widest">Simulate Impact</h2>
                      </div>
                      <div className="p-6 relative min-h-[300px]">
                        <AnimatePresence mode="wait">
                          {interventionStep === 1 && (
                            <motion.div key="step1" initial={{x: 20, opacity: 0}} animate={{x: 0, opacity: 1}} exit={{x: -20, opacity: 0}}>
                              <div className="mb-4 bg-[#9dd0cd]/10 border border-[#9dd0cd]/30 p-3 rounded">
                                <span className="text-[9px] text-[#c0c8c7] uppercase tracking-widest block mb-1">Inherited Target Zone</span>
                                <span className="text-sm font-bold text-[#9dd0cd]">{selectedDistrict}, {selectedState}</span>
                              </div>
                              <h3 className="text-xs font-bold text-[#d3e4fe] uppercase tracking-widest mb-4">Select Municipal Action</h3>
                              <div className="space-y-2">
                                {['Deploy Mist Cannons', 'Traffic Diversion', 'Industrial Halt', 'Deploy Enforcement Team'].map(a => (
                                  <button key={a} onClick={async () => {
                                    setSelectedInterv(a); 
                                    setInterventionStep(2);
                                    try {
                                        const res = await fetch('/api/incidents/simulate', {
                                            method: 'POST',
                                            headers: {'Content-Type': 'application/json'},
                                            body: JSON.stringify({ district: selectedDistrict, intervention_type: a, current_aqi: 382 })
                                        });
                                        const data = await res.json();
                                        setSimResult(data);
                                        setInterventionStep(3);
                                    } catch(e) { setInterventionStep(3); }
                                  }} className="w-full p-3 border text-left rounded transition-colors border-[#404848] hover:border-[#9dd0cd]/50 text-[#c0c8c7] text-sm">
                                    {a}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                          {interventionStep === 3 && (
                            <motion.div key="step3" initial={{x: 20, opacity: 0}} animate={{x: 0, opacity: 1}} exit={{x: -20, opacity: 0}} className="text-center">
                              <div className="w-16 h-16 rounded-full border border-[#9dd0cd] bg-[#9dd0cd]/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
                                <Zap size={24} className="text-[#9dd0cd]" />
                              </div>
                              <h3 className="text-sm font-bold text-white mb-2">Simulation Complete</h3>
                              <p className="text-[#c0c8c7] text-xs mb-6">Action: {selectedInterv} at {selectedDistrict}</p>
                              <div className="bg-[#0b1c30] border border-[#404848] p-4 rounded text-left mb-6">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-[10px] text-[#c0c8c7] uppercase tracking-widest">Current AQI</span>
                                  <span className="text-sm font-bold text-[#ffb4ab]">{simResult?.current_aqi || 382}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] text-[#c0c8c7] uppercase tracking-widest">Predicted</span>
                                  <span className="text-sm font-bold text-[#9dd0cd]">{simResult?.predicted_aqi || 315} (-{simResult?.drop_percentage || 18}%)</span>
                                </div>
                              </div>
                              <button onClick={() => {setInterventionStep(1); setSelectedInterv('');}} className="w-full py-2 bg-[#1b2b3f] text-[#c0c8c7] border border-[#404848] rounded hover:text-white transition-colors uppercase font-bold text-[10px] tracking-widest">Run New Simulation</button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Predictions Overlay Toggle */}
                <div className="absolute top-8 right-8 z-20 bg-[#102034]/90 backdrop-blur border border-[#404848] p-4 rounded-xl shadow-2xl">
                  <h3 className="text-xs font-bold text-[#c0c8c7] uppercase tracking-widest mb-3">Map Layers</h3>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={showPredictions} onChange={() => setShowPredictions(!showPredictions)} className="rounded border-[#404848] text-[#9dd0cd] focus:ring-0 bg-[#0b1c30]" />
                    <span className="text-sm font-bold text-[#9dd0cd] group-hover:text-white transition-colors">AI Prediction Overlay</span>
                  </label>
                  {showPredictions && (
                    <div className="mt-3 text-[10px] text-[#ffb4ab] border-l-2 border-[#ffb4ab] pl-2 font-bold uppercase">
                      Displaying T+4H Risk Forecast
                    </div>
                  )}
                </div>

                {/* Historical Slider Overlay */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 bg-[#102034]/90 backdrop-blur border border-[#404848] p-4 rounded-xl shadow-2xl w-full max-w-3xl flex items-center gap-4">
                  <button onClick={() => setIsPlaying(!isPlaying)} className="w-10 h-10 bg-[#9dd0cd] text-[#003735] rounded-full flex items-center justify-center hover:brightness-110 shadow-[0_0_15px_rgba(157,208,205,0.4)]">
                    {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-1" />}
                  </button>
                  <div className="flex-1">
                    <div className="flex justify-between text-[10px] font-bold text-[#c0c8c7] uppercase tracking-widest mb-2">
                      <span>T-24 Hours</span>
                      <span>Live</span>
                    </div>
                    <input type="range" min="-24" max="0" value={historicalDay} onChange={(e) => {setHistoricalDay(parseInt(e.target.value)); setIsPlaying(false);}} className="w-full h-1 bg-[#404848] rounded-lg appearance-none cursor-pointer accent-[#9dd0cd]" />
                  </div>
                  <div className="bg-[#0b1c30] px-4 py-2 border border-[#404848] rounded font-bold text-[#9dd0cd] text-xs uppercase tracking-widest min-w-[120px] text-center">
                    {historicalDay === 0 ? "Live" : `T${historicalDay} HRS`}
                  </div>
                </div>

              </motion.div>
            )}

            {activeTab === 'incidents' && (
              <motion.div key="incidents" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="p-8 pb-16 h-full flex flex-col">
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <h1 className="text-3xl font-display text-[#9dd0cd]">Incident Manager</h1>
                    <p className="text-[#c0c8c7] mt-1">Review and manage verified citizen and sensor reports.</p>
                  </div>
                </div>
                <div className="bg-[#102034] rounded-xl border border-[#404848] flex-1 overflow-hidden flex flex-col">
                  <div className="grid grid-cols-5 p-4 border-b border-[#404848] bg-[#0b1c30] text-xs font-bold text-[#c0c8c7] uppercase tracking-widest">
                    <div className="col-span-2">Incident Description</div>
                    <div>Location</div>
                    <div>Status</div>
                    <div>Action</div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {incidents.map((inc, i) => (
                      <div key={i} className="grid grid-cols-5 p-4 border-b border-[#404848]/50 items-center hover:bg-[#1b2b3f]/50 transition-colors">
                        <div className="col-span-2 text-sm font-bold text-[#d3e4fe]">{inc.description || "Unnamed Incident"}</div>
                        <div className="text-xs text-[#c0c8c7]">{inc.lat?.toFixed(4)}, {inc.lng?.toFixed(4)}</div>
                        <div className="text-xs text-[#ffb4ab] font-bold">{inc.status}</div>
                        <div><ActionButton id={`inc_${inc.id}`} text="Deploy Team" /></div>
                      </div>
                    ))}
                    {incidents.length === 0 && (
                        <div className="text-center text-[#c0c8c7] py-8">
                          No incidents available.
                        </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'reports' && (
              <motion.div key="reports" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="p-8 pb-16 h-full flex flex-col">
                <div className="mb-8 flex justify-between items-end">
                  <div>
                    <h1 className="text-3xl font-display text-[#9dd0cd]">Unified Audit Trail</h1>
                    <p className="text-[#c0c8c7] mt-1">Regulatory reports and compliance logs.</p>
                  </div>
                  <button onClick={() => setReportStep(1)} className="bg-[#9dd0cd] text-[#003735] px-6 py-3 rounded font-bold uppercase text-[10px] tracking-widest shadow-[0_0_20px_rgba(157,208,205,0.3)] hover:brightness-110 transition-colors flex items-center gap-2">
                    <FileText size={16} /> Generate Report
                  </button>
                </div>

                {reportStep === 0 ? (
                  <div className="bg-[#102034] rounded-xl border border-[#404848] flex-1 overflow-hidden flex flex-col">
                    <div className="grid grid-cols-4 p-4 border-b border-[#404848] bg-[#0b1c30] text-xs font-bold text-[#c0c8c7] uppercase tracking-widest">
                      <div className="col-span-2">Report Document</div>
                      <div>Date Generated</div>
                      <div>Action</div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      {[
                        { doc: 'Delhi_NCR_Weekly_Emissions_Audit.pdf', date: 'Oct 7, 2026' },
                        { doc: 'Okhla_Industrial_Compliance_Log.csv', date: 'Oct 6, 2026' },
                        { doc: 'GRAP_Phase_IV_Action_Report.pdf', date: 'Oct 5, 2026' },
                        { doc: 'Municipal_Response_Efficacy_Q3.pdf', date: 'Oct 1, 2026' },
                      ].map((rep, i) => (
                        <div key={i} className="grid grid-cols-4 p-4 border-b border-[#404848]/50 items-center hover:bg-[#1b2b3f]/50 transition-colors">
                          <div className="col-span-2 text-sm font-bold text-[#d3e4fe] flex items-center gap-2">
                            <FileText size={16} className="text-[#9dd0cd]" /> {rep.doc}
                          </div>
                          <div className="text-xs text-[#c0c8c7]">{rep.date}</div>
                          <div><ActionButton id={`dl_${i}`} text="Download" /></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#102034] rounded-xl border border-[#404848] flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
                    <AnimatePresence mode="wait">
                      {reportStep === 1 && (
                        <motion.div key="rstep1" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="text-center w-full max-w-2xl">
                          <h2 className="text-2xl font-bold text-white mb-6">Select Report Type</h2>
                          <div className="grid grid-cols-2 gap-4">
                            <button onClick={generateReport} className="p-6 border border-[#404848] hover:border-[#9dd0cd] bg-[#0b1c30] rounded-xl transition-colors">
                              <FileText size={32} className="text-[#9dd0cd] mx-auto mb-3" />
                              <h3 className="font-bold text-white">Emissions Audit</h3>
                              <p className="text-xs text-[#c0c8c7] mt-1">Statutory particulate matter log</p>
                            </button>
                            <button onClick={generateReport} className="p-6 border border-[#404848] hover:border-[#9dd0cd] bg-[#0b1c30] rounded-xl transition-colors">
                              <History size={32} className="text-[#9dd0cd] mx-auto mb-3" />
                              <h3 className="font-bold text-white">Intervention Efficacy</h3>
                              <p className="text-xs text-[#c0c8c7] mt-1">Impact of deployed responses</p>
                            </button>
                          </div>
                          <button onClick={() => setReportStep(0)} className="mt-8 text-[#8a9291] hover:text-white text-sm">Cancel</button>
                        </motion.div>
                      )}
                      {reportStep === 2 && (
                        <motion.div key="rstep2" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="text-center">
                          <div className="w-20 h-20 border-4 border-[#404848] border-t-[#9dd0cd] rounded-full animate-spin mx-auto mb-6"></div>
                          <h2 className="text-2xl font-bold text-white mb-2">Compiling Intelligence...</h2>
                          <p className="text-[#c0c8c7]">Fusing data from 120+ sensors and resolving anomalies.</p>
                          {setTimeout(() => setReportStep(3), 2000) && null}
                        </motion.div>
                      )}
                      {reportStep === 3 && (
                        <motion.div key="rstep3" initial={{scale: 0.9, opacity: 0}} animate={{scale: 1, opacity: 1}} className="text-center">
                          <div className="w-20 h-20 bg-[#9dd0cd]/20 border border-[#9dd0cd] rounded-full flex items-center justify-center mx-auto mb-6 text-[#9dd0cd]">
                            <CheckCircle size={40} />
                          </div>
                          <h2 className="text-2xl font-bold text-white mb-6">Report Generated</h2>
                          <div className="flex justify-center gap-4">
                            <button onClick={() => setReportStep(0)} className="px-6 py-3 bg-[#1b2b3f] text-white border border-[#404848] rounded uppercase font-bold text-[10px] tracking-widest hover:bg-[#26364a] transition-colors">Back to Logs</button>
                            <button onClick={() => setReportStep(0)} className="px-6 py-3 bg-[#9dd0cd] text-[#003735] rounded uppercase font-bold text-[10px] tracking-widest shadow-lg hover:brightness-110 transition-colors">Download PDF</button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'copilot' && (
              <motion.div key="copilot" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="p-8 h-full flex flex-col pb-16">
                <div className="flex-1 flex flex-col max-w-4xl mx-auto border border-[#9dd0cd]/30 rounded-xl bg-[#0b1c30]/90 backdrop-blur-xl overflow-hidden shadow-[0_0_30px_rgba(157,208,205,0.1)] w-full">
                    <div className="flex-1 p-6 overflow-y-auto space-y-6">
                      {chatHistory.map((msg, idx) => (
                         <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                           <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#9dd0cd] to-[#2a5c5a] flex items-center justify-center shrink-0 shadow-lg">
                             {msg.role === 'user' ? <span className="text-[#003735] font-bold">U</span> : <Bot className="text-[#003735]" size={20} />}
                           </div>
                           <div className={`p-4 rounded-2xl border border-[#404848] shadow-xl max-w-[80%] ${msg.role === 'user' ? 'bg-[#9dd0cd]/10 text-white rounded-tr-none' : 'bg-[#102034] text-[#d3e4fe] rounded-tl-none'}`}>
                             <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                           </div>
                         </div>
                      ))}
                    </div>
                    <div className="p-4 bg-[#102034]/90 backdrop-blur-md border-t border-[#404848]">
                      <div className="relative">
                        <textarea 
                          value={chatInput}
                          onChange={e => setChatInput(e.target.value)}
                          className="w-full bg-[#0b1c30] border border-[#404848] rounded-xl p-4 text-sm text-white outline-none resize-none focus:border-[#9dd0cd]/50 transition-colors shadow-inner" 
                          placeholder="Ask the AI Copilot to analyze data..." 
                          rows={1}
                          onKeyDown={async (e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              sendChat();
                            }
                          }}
                        ></textarea>
                        <button onClick={sendChat} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#9dd0cd] text-[#003735] rounded-lg flex items-center justify-center hover:brightness-110 transition-all shadow-lg">
                          <Search size={18} />
                        </button>
                      </div>
                    </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </main>
      </div>

      {/* Global Emergency Modal Overlay */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-[#102034] border border-[#ffb4ab]/50 p-8 rounded-xl max-w-md w-full shadow-2xl"
            >
              <div className="w-16 h-16 bg-[#93000a] text-[#ffdad6] rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-2xl font-bold text-center text-white mb-2">Initiate Emergency Response?</h2>
              <p className="text-center text-[#c0c8c7] text-sm mb-8">This will broadcast a high-priority alert to all connected municipal agencies in the Delhi-NCR sector.</p>
              <div className="flex gap-4">
                <button onClick={() => setModalOpen(false)} className="flex-1 py-3 border border-[#404848] rounded-lg font-bold hover:bg-[#1b2b3f] transition-colors">Cancel</button>
                <ActionButton id="modalAction" text="Confirm Broadcast" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
