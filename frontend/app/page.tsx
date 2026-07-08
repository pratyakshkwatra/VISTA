'use client'

import { MapPin, Verified, Navigation, Camera } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <div className="bg-[#031427] text-[#d3e4fe] min-h-screen font-body overflow-hidden">
      {/* TopNavBar */}
      <header className="bg-[#031427]/80 backdrop-blur-md border-b border-[#404848] sticky top-0 z-50">
        <div className="flex justify-between items-center w-full px-6 max-w-7xl mx-auto h-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-display text-2xl font-bold text-[#9dd0cd] tracking-tighter"
          >
            VISTA
          </motion.div>
          <nav className="hidden md:flex items-center gap-8">
            <Link className="text-[#9dd0cd] font-bold border-b-2 border-[#9dd0cd] pb-1 text-sm tracking-wide transition-all" href="/">Home</Link>
            <Link className="text-[#c0c8c7] hover:text-[#9dd0cd] transition-colors duration-200 text-sm font-medium" href="/report">Report Pollution</Link>
            <Link className="text-[#c0c8c7] hover:text-[#9dd0cd] transition-colors duration-200 text-sm font-medium" href="/dashboard">Admin Dashboard</Link>
          </nav>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Link href="/login" className="bg-[#9dd0cd] text-[#003735] px-5 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-[#9dd0cd]/20">
              Secure Login
            </Link>
          </motion.div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-[700px] flex flex-col justify-center items-center px-6 pt-20 overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-40">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#2a5c5a]/40 via-transparent to-transparent"></div>
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 max-w-4xl text-center space-y-6"
          >
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-[#2a5c5a] bg-[#0b1c30]/80 backdrop-blur-sm mb-2 shadow-[0_0_15px_rgba(42,92,90,0.5)]"
            >
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
              <span className="text-xs font-semibold tracking-widest uppercase text-[#9dd0cd]">Live Air Quality Network</span>
            </motion.div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight tracking-tight">
              Real-time Pollution Monitoring.<br/>Community-led Action.
            </h1>
            <p className="text-lg text-[#c0c8c7] max-w-2xl mx-auto leading-relaxed">
              Track air quality in your city and report localized pollution incidents. Together we can provide the data needed for faster interventions.
            </p>
            <div className="pt-8 flex flex-wrap justify-center gap-4">
              <Link href="#map">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#9dd0cd] text-[#003735] px-8 py-4 rounded-xl font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_0_20px_rgba(157,208,205,0.3)]"
                >
                  View Live Map
                </motion.button>
              </Link>
              <Link href="/report">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#102034]/60 backdrop-blur-md border border-[#8a9291]/50 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-[#2a3a4f] transition-all"
                >
                  Report Incident
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Local Insights & Map */}
        <section id="map" className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* City AQI Widget (Mumbai) */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:col-span-4 bg-[#102034]/70 backdrop-blur-xl border border-[#9dd0cd]/20 p-8 rounded-xl flex flex-col justify-between shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#9dd0cd] to-[#2a5c5a] opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div>
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h3 className="text-xs font-bold text-[#9dd0cd] uppercase tracking-widest mb-1">Current City Status</h3>
                    <p className="font-display text-2xl font-semibold text-white">Delhi NCR</p>
                  </div>
                  <MapPin className="text-[#9dd0cd]" size={32} />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-7xl font-bold text-white tracking-tighter">142</span>
                  <span className="text-sm font-bold text-[#c0c8c7] uppercase">AQI</span>
                </div>
                <p className="text-[#F59E0B] font-semibold text-sm mt-4 flex items-center gap-2">
                  <Verified size={18} />
                  Moderate Air Quality
                </p>
              </div>
              <div className="mt-10 pt-6 border-t border-[#404848]">
                <div className="flex justify-between text-[#c0c8c7] text-xs font-medium">
                  <span>PM2.5: 55µg/m³</span>
                  <span>O3: 18ppb</span>
                </div>
              </div>
            </motion.div>

            {/* Interactive Real Map */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:col-span-8 bg-[#102034]/70 backdrop-blur-xl rounded-xl relative overflow-hidden h-[450px] border border-[#9dd0cd]/20 shadow-2xl"
            >
              <iframe 
                width="100%" 
                height="100%" 
                style={{ border: 0 }}
                scrolling="no" 
                src="/map.html" 
                className="opacity-90 hover:opacity-100 transition-opacity duration-500"
              ></iframe>
              <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <span className="bg-[#031427]/90 backdrop-blur px-4 py-2 rounded text-[#9dd0cd] font-bold border border-[#9dd0cd]/30 text-sm shadow-[0_0_15px_rgba(157,208,205,0.2)]">
                  Live Incident Map (Delhi)
                </span>
              </div>
            </motion.div>

            {/* Report Pollution CTA */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-12 bg-gradient-to-br from-[#2a5c5a] to-[#003735] text-white p-10 rounded-xl flex flex-col md:flex-row items-center justify-between gap-8 border border-[#9dd0cd]/30 mt-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#9dd0cd] rounded-full blur-[100px] opacity-20"></div>
              <div className="max-w-2xl text-center md:text-left relative z-10">
                <h2 className="font-display text-2xl font-bold mb-2">Help Us Keep The Air Clean</h2>
                <p className="text-[#a0d2cf] opacity-90">Notice garbage burning, severe dust, or heavy industrial smoke? Report it to the local authorities instantly.</p>
              </div>
              <Link href="/report">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-[#2a5c5a] px-10 py-5 rounded-xl font-bold uppercase tracking-widest flex items-center gap-3 shadow-xl relative z-10"
                >
                  <Camera size={24} />
                  Report Now
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </section>

      </main>
    </div>
  )
}
