import { useEffect, useState } from 'react'
import { SalgadoStatus } from '../engine'

export default function Verdict({ result, loading }) {
  const [animKey, setAnimKey] = useState(0)

  useEffect(() => {
    if (result) setAnimKey(k => k + 1)
  }, [result])

  const isAvailable  = result?.resultado === SalgadoStatus.DISPONIVEL
  const isUnavailable = result?.resultado === SalgadoStatus.INDISPONIVEL
  const color = isAvailable ? 'var(--green)' : isUnavailable ? 'var(--red)' : 'var(--text-dim)'
  const glow  = isAvailable ? 'var(--green-glow)' : isUnavailable ? 'var(--red-glow)' : 'none'

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div className="panel-header">
        <span className="panel-title">Veredito Final</span>
        {result && (
          <span style={{
            fontSize: 9,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: result.cacheHit ? 'var(--amber)' : 'var(--cyan)',
          }}>
            {result.cacheHit ? '● CACHE HIT' : '○ CACHE MISS'}
          </span>
        )}
      </div>

      <div className="panel-body" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        padding: '32px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Background glow */}
        {result && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: isAvailable
              ? 'radial-gradient(ellipse at center, rgba(0,255,136,0.04) 0%, transparent 70%)'
              : 'radial-gradient(ellipse at center, rgba(255,34,85,0.04) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
        )}

        {/* Main verdict text */}
        <div style={{ textAlign: 'center', width: '100%' }}>
          {loading ? (
            <LoadingState />
          ) : result ? (
            <VerdictText key={animKey} result={result} color={color} glow={glow} />
          ) : (
            <IdleState />
          )}
        </div>

        {/* Metadata grid */}
        {result && !loading && (
          <div
            key={`meta-${animKey}`}
            style={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 8,
              animation: 'fadeIn 0.4s ease 0.3s both',
            }}
          >
            <MetaCard label="Strategy" value={result.strategy?.replace('Strategy', '')} color="var(--cyan)" />
            <MetaCard label="Handler" value={result.handler} color="var(--purple)" />
            <MetaCard label="Latência" value={`${result.latencia}ms`} color="var(--amber)" />
            <MetaCard label="Semana ISO" value={`W${result.semanaISO}`} color="var(--text-label)" />
          </div>
        )}

        {/* Motivo */}
        {result && !loading && (
          <div
            style={{
              width: '100%',
              padding: '10px 12px',
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              animation: 'fadeIn 0.4s ease 0.5s both',
            }}
          >
            <div className="label" style={{ marginBottom: 4 }}>motivo</div>
            <div style={{ fontSize: 11, color: 'var(--text)', lineHeight: 1.5 }}>
              {result.motivo}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function VerdictText({ result, color, glow }) {
  const isAvailable = result.resultado === SalgadoStatus.DISPONIVEL
  return (
    <div>
      {/* Icon */}
      <div style={{
        fontSize: 40,
        marginBottom: 12,
        animation: 'slideUp 0.4s ease both',
        filter: `drop-shadow(${isAvailable ? '0 0 12px rgba(0,255,136,0.6)' : '0 0 12px rgba(255,34,85,0.6)'})`,
      }}>
        {isAvailable ? '🥐' : '🚫'}
      </div>

      {/* Main verdict */}
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 42,
        letterSpacing: '0.08em',
        color,
        textShadow: glow,
        lineHeight: 1,
        animation: 'scanIn 0.5s ease both',
      }}>
        {result.resultado}
      </div>

      {/* Sub-label */}
      <div style={{
        marginTop: 8,
        fontSize: 10,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: `${color}99`,
        animation: 'fadeIn 0.3s ease 0.4s both',
      }}>
        {isAvailable ? 'disponibilidade confirmada' : 'disponibilidade negada'}
      </div>

      {/* Decorative line */}
      <div style={{
        margin: '12px auto 0',
        width: '60%',
        height: 1,
        background: `linear-gradient(90deg, transparent, ${color}66, transparent)`,
        animation: 'fadeIn 0.3s ease 0.5s both',
      }} />
    </div>
  )
}

function LoadingState() {
  return (
    <div style={{ padding: '32px 0' }}>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 28,
        color: 'var(--text-dim)',
        letterSpacing: '0.12em',
        animation: 'pulse 1s ease-in-out infinite',
      }}>
        PROCESSANDO...
      </div>
      <div style={{
        marginTop: 12,
        fontSize: 10,
        color: 'var(--text-muted)',
        letterSpacing: '0.15em',
      }}>
        executando pipeline de decisão
      </div>
    </div>
  )
}

function IdleState() {
  return (
    <div style={{ padding: '32px 0' }}>
      <div style={{
        fontSize: 32,
        marginBottom: 12,
        opacity: 0.3,
      }}>
        ◌
      </div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 22,
        color: 'var(--text-muted)',
        letterSpacing: '0.12em',
      }}>
        AGUARDANDO INPUT
      </div>
      <div style={{
        marginTop: 8,
        fontSize: 10,
        color: 'var(--text-muted)',
        letterSpacing: '0.12em',
        animation: 'pulse 2s ease-in-out infinite',
      }}>
        configure os parâmetros e clique em avaliar
      </div>
    </div>
  )
}

function MetaCard({ label, value, color }) {
  return (
    <div style={{
      padding: '8px 10px',
      background: 'var(--bg-input)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
    }}>
      <div className="label" style={{ marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 11, color, fontWeight: 600, letterSpacing: '0.04em' }}>{value}</div>
    </div>
  )
}
