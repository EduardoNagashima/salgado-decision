import { useState, useEffect } from 'react'
import { getISOWeek } from '../engine'

export default function Header({ systemStatus }) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const pad = n => String(n).padStart(2, '0')
  const timeStr = `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`
  const dateStr = time.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <header style={{
      background: 'var(--bg-panel-alt)',
      borderBottom: '1px solid var(--border-mid)',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 52,
      flexShrink: 0,
      position: 'relative',
      zIndex: 10,
    }}>
      {/* Logo + Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28,
            height: 28,
            background: 'var(--green-dim)',
            border: '1px solid var(--green-mid)',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
          }}>
            🥐
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 18,
              letterSpacing: '0.1em',
              color: 'var(--text-bright)',
              lineHeight: 1,
            }}>
              SAAS
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
              Salgado Assessment & Availability System
            </div>
          </div>
        </div>

        <div style={{ width: 1, height: 28, background: 'var(--border)' }} />

        <div style={{ display: 'flex', gap: 16 }}>
          <Pill label="versão" value="4.2.0" color="var(--purple)" />
          <Pill label="semana ISO" value={`W${getISOWeek()}`} color="var(--cyan)" />
          <Pill label="env" value="PRODUÇÃO" color="var(--green)" />
        </div>
      </div>

      {/* Status + Clock */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            className="dot"
            style={{
              background: systemStatus === 'OK' ? 'var(--green)' : 'var(--red)',
              boxShadow: systemStatus === 'OK'
                ? '0 0 6px var(--green)'
                : '0 0 6px var(--red)',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
          <span className="label">
            {systemStatus === 'OK' ? 'sistema operacional' : 'sistema degradado'}
          </span>
        </div>

        <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            letterSpacing: '0.08em',
            color: 'var(--text-bright)',
            lineHeight: 1,
          }}>
            {timeStr}
          </div>
          <div style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.06em' }}>
            {dateStr}
          </div>
        </div>
      </div>
    </header>
  )
}

function Pill({ label, value, color }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      padding: '3px 8px',
      background: `${color}10`,
      border: `1px solid ${color}33`,
      borderRadius: 3,
    }}>
      <span style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        {label}
      </span>
      <span style={{ fontSize: 10, color, fontWeight: 700, letterSpacing: '0.05em' }}>
        {value}
      </span>
    </div>
  )
}
