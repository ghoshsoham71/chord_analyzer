import { useState } from 'react'
import { motion } from 'framer-motion'

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  async function handleAnalyze() {
    setLoading(true)
    setResult(null)
    try {
      // Example: call backend health endpoint (replace with real analyze endpoint)
      const res = await fetch('/api/health').catch(() => null)
      if (res && res.ok) {
        const json = await res.json()
        setResult({ ok: true, message: json.message || 'Backend reachable' })
      } else {
        setResult({ ok: false, message: 'No backend response — run the Python API' })
      }
    } catch (err) {
      setResult({ ok: false, message: String(err) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-6xl grid grid-cols-12 gap-8">
        <section className="col-span-7 glass p-8 rounded-2xl shadow-soft-lg">
          <header className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">
                Chord Analyzer <span className="hero-accent">Studio</span>
              </h1>
              <p className="mt-2 text-slate-300">Upload audio or point to Spotify to extract chords and generate sheets.</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400">Status</div>
              <div className="mt-1 font-medium text-slate-100">Ready</div>
            </div>
          </header>

          <div className="mt-8">
            <div className="flex gap-4 items-center">
              <label className="flex-1">
                <div className="p-6 rounded-xl border border-dashed border-slate-700 glass hover:border-slate-500 transition cursor-pointer">
                  <div className="text-slate-300">Drop audio here or click to choose a file</div>
                </div>
                <input type="file" accept="audio/*" className="hidden" />
              </label>

              <div className="w-44">
                <button onClick={handleAnalyze} className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-primary to-accent text-white font-semibold shadow">{loading ? 'Analyzing…' : 'Analyze'}</button>
              </div>
            </div>

            <div className="mt-6 bg-slate-900 rounded-lg p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="h-36 rounded-md bg-gradient-to-r from-slate-800 to-slate-900 flex items-center justify-center text-slate-500">Waveform / Visualizer placeholder</div>
              </motion.div>
            </div>
          </div>
        </section>

        <aside className="col-span-5 glass p-6 rounded-2xl shadow-soft-lg flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Analysis</h2>
            <div className="text-sm text-slate-400">Results</div>
          </div>

          <div className="flex-1 overflow-auto">
            {!result && (
              <div className="text-slate-400">No results yet — click Analyze to start.</div>
            )}

            {result && (
              <div className="mt-2">
                <div className={`p-4 rounded-lg ${result.ok ? 'bg-emerald-800/30' : 'bg-rose-800/30'}`}>
                  <div className="font-medium">{result.ok ? 'Success' : 'Error'}</div>
                  <div className="mt-1 text-sm text-slate-200">{result.message}</div>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm text-slate-300">Detected Chords</h3>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-200">C</span>
                    <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-200">G</span>
                    <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-200">Am</span>
                    <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-200">F</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button className="w-full py-2 rounded-md border border-slate-700 text-slate-200">Export PDF</button>
          </div>
        </aside>
      </div>
    </main>
  )
}
