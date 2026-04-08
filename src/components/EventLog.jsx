import { useEffect, useRef } from 'react'

const levelStyles = {
  INFO:  { color: 'var(--cyan)',  prefix: 'INFO ' },
  DEBUG: { color: 'var(--text-dim)', prefix: 'DEBUG' },
  WARN:  { color: 'var(--amber)', prefix: 'WARN ' },
  ERROR: { color: 'var(--red)',   prefix: 'ERROR' },
}

export default function EventLog({ entries }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries])

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="panel-title">Event Log</span>
          <span style={{
            padding: '1px 6px',
            background: 'var(--bg-input)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            fontSize: 9,
            color: 'var(--text-dim)',
          }}>
            {entries.length} entradas
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['INFO', 'DEBUG', 'WARN', 'ERROR'].map(l => (
            <span key={l} style={{
              fontSize: 9,
              color: levelStyles[l].color,
              opacity: entries.some(e => e.nivel === l) ? 1 : 0.3,
              letterSpacing: '0.08em',
            }}>
              {l}
            </span>
          ))}
        </div>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        maxHeight: 180,
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        padding: '8px 0',
      }}>
        {entries.length === 0 ? (
          <div style={{
            padding: '24px 16px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: 11,
            letterSpacing: '0.08em',
          }}>
            <span style={{ animation: 'blink 1s step-end infinite' }}>█</span>
            {' '}aguardando eventos do sistema...
          </div>
        ) : (
          entries.map((entry, i) => {
            const style = levelStyles[entry.nivel] || levelStyles.INFO
            const isNew  = i === entries.length - 1
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 0,
                  padding: '3px 16px',
                  borderBottom: '1px solid var(--border)',
                  animation: isNew ? 'fadeIn 0.2s ease both' : 'none',
                  background: isNew ? 'rgba(255,255,255,0.01)' : 'transparent',
                  transition: 'background 0.3s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = isNew ? 'rgba(255,255,255,0.01)' : 'transparent'}
              >
                {/* Timestamp */}
                <span style={{ color: 'var(--text-muted)', minWidth: 72, userSelect: 'none' }}>
                  {entry.ts}
                </span>

                {/* Level */}
                <span style={{
                  color: style.color,
                  minWidth: 52,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                }}>
                  [{style.prefix}]
                </span>

                {/* Message */}
                <span style={{ color: 'var(--text)', flex: 1 }}>
                  {entry.msg}
                </span>

                {/* Meta badge */}
                {entry.meta && Object.keys(entry.meta).length > 0 && (
                  <span style={{
                    marginLeft: 8,
                    padding: '0 6px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border)',
                    borderRadius: 2,
                    fontSize: 9,
                    color: 'var(--text-dim)',
                    cursor: 'default',
                    flexShrink: 0,
                  }}
                  title={JSON.stringify(entry.meta, null, 2)}
                  >
                    meta
                  </span>
                )}
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
