import { SalgadoStatus } from '../engine'

export default function MetricsRow({ circuitBreaker, cacheStats, history, historyStats }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
      <CircuitBreakerPanel cb={circuitBreaker} />
      <CachePanel stats={cacheStats} />
      <HistoryPanel history={history} stats={historyStats} />
    </div>
  )
}

// ── Circuit Breaker ─────────────────────────────────────────
function CircuitBreakerPanel({ cb }) {
  const colorMap = {
    'FECHADO':    'var(--green)',
    'SEMI-ABERTO':'var(--amber)',
    'ABERTO':     'var(--red)',
  }
  const color = colorMap[cb.estado] || 'var(--text-dim)'
  const pct   = Math.min((cb.falhas / cb.limiar) * 100, 100)

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">Circuit Breaker</span>
        <span style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.08em' }}>
          resiliência
        </span>
      </div>
      <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* State indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          background: `${color}0a`,
          border: `1px solid ${color}33`,
          borderRadius: 'var(--radius)',
        }}>
          <span
            className="dot"
            style={{
              background: color,
              boxShadow: `0 0 6px ${color}`,
              animation: cb.estado === 'FECHADO' ? 'none' : 'pulse 1s ease-in-out infinite',
            }}
          />
          <span style={{ fontSize: 13, fontWeight: 700, color, letterSpacing: '0.06em', fontFamily: 'var(--font-display)' }}>
            {cb.estado}
          </span>
        </div>

        {/* Failure bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span className="label">falhas acumuladas</span>
            <span style={{ fontSize: 10, color: pct > 50 ? 'var(--amber)' : 'var(--text-dim)' }}>
              {cb.falhas}/{cb.limiar}
            </span>
          </div>
          <div style={{
            height: 4,
            background: 'var(--bg-input)',
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid var(--border)',
          }}>
            <div style={{
              height: '100%',
              width: `${pct}%`,
              background: pct < 50 ? 'var(--green-mid)' : pct < 80 ? 'var(--amber)' : 'var(--red)',
              borderRadius: 2,
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <MiniStat label="limiar" value={cb.limiar} />
          <MiniStat label="recuperação" value="10s" />
        </div>
      </div>
    </div>
  )
}

// ── Cache Metrics ───────────────────────────────────────────
function CachePanel({ stats }) {
  const hitRate = stats.totalEntradas > 0
    ? Math.round((stats.totalHits / Math.max(stats.totalHits + stats.totalEntradas, 1)) * 100)
    : 0

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">Cache</span>
        <span style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.08em' }}>
          TTL 5min
        </span>
      </div>
      <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Hit rate donut-ish */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
            <svg width={56} height={56} viewBox="0 0 56 56">
              <circle cx={28} cy={28} r={22} fill="none" stroke="var(--bg-input)" strokeWidth={6} />
              <circle
                cx={28} cy={28} r={22}
                fill="none"
                stroke={hitRate > 70 ? 'var(--green-mid)' : hitRate > 40 ? 'var(--amber)' : 'var(--red)'}
                strokeWidth={6}
                strokeDasharray={`${(hitRate / 100) * 138} 138`}
                strokeLinecap="round"
                transform="rotate(-90 28 28)"
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            </svg>
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--text-bright)',
            }}>
              {hitRate}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-label)', marginBottom: 2 }}>
              hit rate
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-bright)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>
              {stats.totalHits} hits
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <MiniStat label="entradas ativas" value={stats.ativas} />
          <MiniStat label="total entradas" value={stats.totalEntradas} />
        </div>

        <div style={{
          padding: '6px 8px',
          background: 'var(--bg-input)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          fontSize: 10,
          color: 'var(--text-dim)',
        }}>
          Chave: <span style={{ color: 'var(--text-label)' }}>colaboradorId:evento:semanaISO</span>
        </div>
      </div>
    </div>
  )
}

// ── History Panel ───────────────────────────────────────────
function HistoryPanel({ history, stats }) {
  const empty = history.length === 0

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">Histórico de Avaliações</span>
        {!empty && (
          <span style={{ fontSize: 10, color: 'var(--green)', fontWeight: 600 }}>
            {stats.pct}% TEM
          </span>
        )}
      </div>
      <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Bar chart */}
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 40 }}>
            {empty ? (
              Array.from({ length: 12 }).map((_, i) => (
                <div key={i} style={{
                  flex: 1,
                  height: '30%',
                  background: 'var(--bg-input)',
                  borderRadius: 2,
                  border: '1px solid var(--border)',
                }} />
              ))
            ) : (
              Array.from({ length: 12 }).map((_, i) => {
                const entry = history[11 - i]
                const isAvail = entry?.resultado === SalgadoStatus.DISPONIVEL
                const hasEntry = !!entry
                return (
                  <div key={i} title={entry ? `${entry.ts}: ${entry.resultado}` : ''} style={{
                    flex: 1,
                    height: hasEntry ? '100%' : '20%',
                    background: hasEntry
                      ? isAvail ? 'var(--green-mid)' : 'var(--red-mid)'
                      : 'var(--bg-input)',
                    borderRadius: 2,
                    border: `1px solid ${hasEntry ? (isAvail ? 'var(--green)' : 'var(--red)') : 'var(--border)'}`,
                    transition: 'all 0.3s ease',
                    boxShadow: hasEntry ? (isAvail ? '0 0 4px rgba(0,204,106,0.4)' : '0 0 4px rgba(204,26,68,0.4)') : 'none',
                    animation: i === 11 - history.indexOf(history[0]) ? 'fadeIn 0.3s ease both' : 'none',
                  }} />
                )
              })
            )}
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 4,
            fontSize: 9,
            color: 'var(--text-muted)',
          }}>
            <span>—12</span>
            <span>agora</span>
          </div>
        </div>

        {/* Legend + stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <MiniStat label="total" value={stats.total} />
          <MiniStat label="sem salgado" value={stats.nao} color="var(--red)" />
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 12 }}>
          <LegendItem color="var(--green-mid)" label="TEM_SALGADO" />
          <LegendItem color="var(--red-mid)" label="NÃO_TEM_SALGADO" />
        </div>
      </div>
    </div>
  )
}

function MiniStat({ label, value, color }) {
  return (
    <div style={{
      padding: '6px 8px',
      background: 'var(--bg-input)',
      borderRadius: 'var(--radius)',
      border: '1px solid var(--border)',
    }}>
      <div className="label" style={{ marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: color || 'var(--text-bright)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>
        {value ?? '—'}
      </div>
    </div>
  )
}

function LegendItem({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <div style={{ width: 8, height: 8, background: color, borderRadius: 1 }} />
      <span style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.06em' }}>{label}</span>
    </div>
  )
}
