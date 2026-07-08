'use client'

import { useState } from 'react'
import { Camera, MapPin, CheckCircle, Navigation, ArrowRight, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export default function ReportPage() {
  const [step, setStep] = useState(1)
  const [hasUploaded, setHasUploaded] = useState(false)
  const totalSteps = 3
  
  const nextStep = () => setStep(s => Math.min(totalSteps + 1, s + 1))
  const prevStep = () => setStep(s => Math.max(1, s - 1))

  const handleUpload = () => {
    setHasUploaded(true)
  }

  return (
    <div className="bg-[#031427] text-[#d3e4fe] min-h-screen font-body flex flex-col">
      <header className="bg-[#031427]/80 backdrop-blur-md border-b border-[#404848] sticky top-0 z-50 h-16">
        <div className="flex justify-between items-center w-full px-6 max-w-7xl mx-auto h-full">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-display text-2xl font-bold text-[#9dd0cd]">VISTA</Link>
            <div className="hidden sm:flex items-center px-2 py-1 bg-[#102034] rounded border border-[#404848] text-[10px] font-bold text-[#c0c8c7] uppercase">
              Citizen Portal
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-12 pb-12 px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl font-bold mb-1">
                  {step <= totalSteps ? "Evidence Fusion Report" : "Fusion Complete"}
                </h1>
                {step <= totalSteps && (
                  <p className="text-[#c0c8c7] font-medium tracking-wide">Step {step} of {totalSteps}</p>
                )}
              </div>
            </div>

            <div className="bg-[#102034]/70 backdrop-blur-xl rounded-xl p-8 min-h-[500px] flex flex-col relative border border-[#9dd0cd]/20 shadow-2xl overflow-hidden">
              <AnimatePresence mode='wait'>
                {step === 1 && (
                  <motion.div 
                    key="step1"
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <h3 className="font-display text-xl font-semibold">Upload Evidence</h3>
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleUpload}
                      className={`border-2 border-dashed ${hasUploaded ? 'border-[#10B981] bg-[#10B981]/10' : 'border-[#404848] bg-[#000f21]/50'} rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors h-64`}
                    >
                      {hasUploaded ? (
                        <>
                          <CheckCircle className="text-[#10B981] mb-4" size={48} />
                          <h3 className="font-semibold mb-2 text-[#10B981]">Evidence Attached</h3>
                        </>
                      ) : (
                        <>
                          <Camera className="text-[#9dd0cd] mb-4" size={48} />
                          <h3 className="font-semibold mb-2">Primary Evidence</h3>
                          <p className="text-sm text-[#c0c8c7]">Click to upload photos (MVP: mock upload)</p>
                        </>
                      )}
                    </motion.div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div 
                    key="step2"
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <h3 className="font-display text-xl font-semibold">Location & Details</h3>
                    <div className="relative w-full h-64 rounded-xl overflow-hidden border border-[#9dd0cd]/20 shadow-inner">
                      <iframe 
                        width="100%" 
                        height="100%" 
                        style={{ border: 0 }}
                        scrolling="no" 
                        src="/map.html"
                        className="absolute inset-0 z-0 opacity-80"
                      ></iframe>
                      <div className="z-10 bg-[#031427]/90 backdrop-blur p-4 rounded-lg border border-[#404848] flex items-center gap-3 shadow-lg absolute bottom-4 left-4">
                        <MapPin className="text-[#9dd0cd] animate-bounce" />
                        <span className="font-semibold">Auto-detecting GPS...</span>
                      </div>
                    </div>
                    <input className="w-full bg-[#000f21]/80 backdrop-blur border border-[#404848] rounded-lg p-4 text-white focus:border-[#9dd0cd] outline-none transition-colors" placeholder="Brief description of the pollution source" />
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div 
                    key="step3"
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <h3 className="font-display text-xl font-semibold">Incident Category</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {["Garbage Burning", "Factory Smoke", "Construction Dust", "Crop Residue", "Vehicle Exhaust", "Other"].map(cat => (
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          key={cat} 
                          className="flex items-center gap-3 p-5 rounded-lg border border-[#404848] hover:border-[#9dd0cd] bg-[#0b1c30]/80 transition-all text-left shadow-md"
                        >
                          <CheckCircle className="text-[#9dd0cd]" size={20} />
                          <span className="font-semibold text-sm">{cat}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step > totalSteps && (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center py-16 h-full"
                  >
                    <div className="w-24 h-24 bg-[#10B981]/10 border border-[#10B981] flex items-center justify-center rounded-full mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                      <CheckCircle className="text-[#10B981]" size={48} />
                    </div>
                    <h2 className="font-display text-3xl font-bold mb-4">Report Submitted</h2>
                    <p className="text-[#c0c8c7] mb-8 max-w-md">Your incident #VISTA-E-9941 has been securely transmitted. Thank you for keeping our city clean.</p>
                    <button onClick={() => {setStep(1); setHasUploaded(false)}} className="bg-[#9dd0cd] text-[#003735] px-8 py-3 rounded-lg font-bold hover:brightness-110 transition-all">Start New Report</button>
                  </motion.div>
                )}
              </AnimatePresence>

              {step <= totalSteps && (
                <div className="mt-auto pt-8 flex justify-between items-center border-t border-[#404848]">
                  <button onClick={prevStep} disabled={step === 1} className={`flex items-center gap-2 font-semibold ${step === 1 ? 'opacity-0' : 'text-[#c0c8c7] hover:text-[#9dd0cd] transition-colors'}`}>
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button 
                    onClick={async () => {
                      if (step === totalSteps) {
                        try {
                          await fetch('/api/incidents/report', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ description: "Citizen report (mock)", latitude: 28.6139, longitude: 77.2090 })
                          });
                          nextStep();
                        } catch (err) {
                          alert('Error submitting report. Please try again.');
                        }
                      } else {
                        nextStep();
                      }
                    }} 
                    className="bg-[#9dd0cd] text-[#003735] px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:brightness-110 transition-all shadow-[0_0_15px_rgba(157,208,205,0.4)]"
                  >
                    {step === totalSteps ? 'Submit Report' : 'Next Step'} <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
            <AnimatePresence>
              {hasUploaded && (
                <motion.div 
                  initial={{ opacity: 0, x: 20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  className="bg-[#102034]/70 backdrop-blur-xl rounded-xl p-6 border border-[#9dd0cd]/30 shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#9dd0cd] opacity-10 rounded-full blur-3xl"></div>
                  <div className="flex items-center gap-2 mb-4 relative z-10">
                    <Navigation className="text-[#9dd0cd] animate-pulse" size={16} />
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#9dd0cd]">AI Validation Engine</h4>
                  </div>
                  <div className="bg-[#000f21]/80 rounded-lg border border-[#404848] p-4 space-y-4 mb-6 relative z-10">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[#c0c8c7] uppercase">Processing Evidence...</span>
                      <span className="text-[#10B981] font-bold">96.4%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#102034] rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '96%' }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-[#10B981]"
                      ></motion.div>
                    </div>
                    <div className="space-y-2 pt-2 text-[11px] text-[#c0c8c7]">
                      <div className="flex justify-between"><span className="flex items-center gap-2">Image Analysis</span><span className="text-[#10B981]">Verified</span></div>
                      <div className="flex justify-between"><span className="flex items-center gap-2">Satellite Fusion</span><span className="text-yellow-500">In Queue</span></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </main>
    </div>
  )
}
