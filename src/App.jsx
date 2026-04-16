import { useState, useCallback, useEffect } from 'react'
import Header from './components/Header'
import ControlPanel from './components/ControlPanel'
import Verdict from './components/Verdict'
import MetricsRow from './components/MetricsRow'
import EventLog from './components/EventLog'
import {
  avaliarSalgado,
  getCacheStats,
  getCircuitBreakerState,
  addToHistory,
  getHistory,
  getHistoryStats,
  invalidateCache,
} from './engine'

const INITIAL_PARAMS = {
  colaboradorNovo:    false,
  eventoEspecial:     false,
  semanaPassadaTeve:  false,
}

export default function App() {
  const [params,   setParams]   = useState(INITIAL_PARAMS)
  const [result,   setResult]   = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [logEntries, setLog]    = useState([])
  const [cbState,  setCbState]  = useState(getCircuitBreakerState())
  const [cacheStats, setCache]  = useState(getCacheStats())
  const [history,  setHistory]  = useState(getHistory())
  const [histStats,setHistStats]= useState(getHistoryStats())

  // Refresh reactive metrics after each evaluation
  const refreshMetrics = useCallback(() => {
    setCbState(getCircuitBreakerState())
    setCache(getCacheStats())
    setHistory(getHistory())
    setHistStats(getHistoryStats())
  }, [])

  const handleParamChange = useCallback((key, value) => {
    setParams(prev => ({ ...prev, [key]: value }))
    // Invalidate cache when params change so next eval is fresh
    invalidateCache()
  }, [])

  const handleEvaluate = useCallback(async () => {
    setLoading(true)
    setResult(null)

    // Brief artificial delay so the loading state is perceptible
    await new Promise(r => setTimeout(r, 420))

    try {
      const evaluation = avaliarSalgado(params)
      setResult(evaluation)
      setLog(prev => [...prev, ...evaluation.logs])
      addToHistory(evaluation.resultado)
    } catch (err) {
      const errorLog = {
        nivel: 'ERROR',
        msg:   err.message,
        meta:  {},
        ts:    new Date().toLocaleTimeString('pt-BR'),
      }
      setLog(prev => [...prev, errorLog])
    } finally {
      setLoading(false)
      refreshMetrics()
    }
  }, [params, refreshMetrics])

  // Keyboard shortcut: Enter to evaluate
  useEffect(() => {
    const handler = e => {
      if (e.key === 'Enter' && !loading) handleEvaluate()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleEvaluate, loading])

  // System status derived from circuit breaker
  const systemStatus = cbState.estado === 'FECHADO' ? 'OK' : 'DEGRADED'

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* ── Header ── */}
      <Header systemStatus={systemStatus} />

      {/* ── Main content ── */}
      <div style={{
        flex: 1,
        padding: '16px 20px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        maxWidth: 1400,
        width: '100%',
        margin: '0 auto',
      }}>

        {/* Top row: Control Panel + Verdict */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '340px 1fr',
          gap: 12,
        }}>
          <ControlPanel
            values={params}
            onChange={handleParamChange}
            onEvaluate={handleEvaluate}
            loading={loading}
          />
          <Verdict result={result} loading={loading} />
        </div>

        {/* Metrics row */}
        <MetricsRow
          circuitBreaker={cbState}
          cacheStats={cacheStats}
          history={history}
          historyStats={histStats}
        />

        {/* Event Log */}
        <EventLog entries={logEntries} />

        {/* Status bar */}
        <StatusBar
          cbState={cbState}
          cacheStats={cacheStats}
          histStats={histStats}
          onClearLog={() => setLog([])}
          onClearCache={() => { invalidateCache(); refreshMetrics() }}
        />
      </div>
    </div>
  )
}

// ── Status Bar ──────────────────────────────────────────────
function StatusBar({ cbState, cacheStats, histStats, onClearLog, onClearCache }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '6px 12px',
      background: 'var(--bg-panel-alt)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      fontSize: 10,
      color: 'var(--text-dim)',
      letterSpacing: '0.06em',
    }}>
      <div style={{ display: 'flex', gap: 20 }}>
        <StatusItem label="CB" value={cbState.estado} color={
          cbState.estado === 'FECHADO' ? 'var(--green)' :
          cbState.estado === 'SEMI-ABERTO' ? 'var(--amber)' : 'var(--red)'
        } />
        <StatusItem label="CACHE" value={`${cacheStats.ativas} ativas`} />
        <StatusItem label="AVALIAÇÕES" value={histStats.total} />
        <StatusItem label="DISPONIBILIDADE" value={histStats.pct != null ? `${histStats.pct}%` : 'N/A'} color="var(--green)" />
        <span style={{ color: 'var(--text-muted)' }}>
          pressione <kbd style={{
            padding: '1px 4px',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-mid)',
            borderRadius: 2,
            fontFamily: 'var(--font-mono)',
          }}>Enter</kbd> para avaliar
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <GhostButton onClick={onClearCache} label="limpar cache" />
        <GhostButton onClick={onClearLog}   label="limpar log"   />
      </div>
    </div>
  )
}

function StatusItem({ label, value, color }) {
  return (
    <span>
      <span style={{ color: 'var(--text-muted)', marginRight: 4 }}>{label}:</span>
      <span style={{ color: color || 'var(--text-label)', fontWeight: 600 }}>{value}</span>
    </span>
  )
}

function GhostButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '2px 8px',
        background: 'transparent',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        color: 'var(--text-dim)',
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        letterSpacing: '0.08em',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--border-mid)'
        e.currentTarget.style.color = 'var(--text-label)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.color = 'var(--text-dim)'
      }}
    >
      {label}
    </button>
  )
}
