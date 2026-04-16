import { useState } from 'react'

const params = [
  {
    key:     'colaboradorNovo',
    label:   'Colaborador Novo',
    desc:    'Admitido há menos de 30 dias',
    entity:  'Colaborador',
    type:    'ColaboradorTipoEnum.NOVO',
    color:   'var(--cyan)',
  },
  {
    key:     'eventoEspecial',
    label:   'Evento Especial',
    desc:    'Ativo com prioridade ≤ MEDIA',
    entity:  'EventoEspecial',
    type:    'EventoPrioridadeEnum.ALTA',
    color:   'var(--amber)',
  },
  {
    key:     'semanaPassadaTeve',
    label:   'Semana Passada Teve',
    desc:    'Salgado disponível na semana anterior',
    entity:  'SalgadoHistoricoRepository',
    type:    'Boolean',
    color:   'var(--purple)',
  },
]

export default function ControlPanel({ values, onChange, onEvaluate, loading }) {
  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header">
        <span className="panel-title">Parâmetros de Entrada</span>
        <span style={{
          fontSize: 9,
          color: 'var(--text-dim)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          SalgadoContextBuilder
        </span>
      </div>

      <div className="panel-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {params.map(p => (
          <Toggle
            key={p.key}
            {...p}
            checked={values[p.key]}
            onChange={v => onChange(p.key, v)}
          />
        ))}
      </div>

      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={onEvaluate}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px 0',
            background: loading
              ? 'var(--bg-input)'
              : 'linear-gradient(135deg, rgba(0,255,136,0.12) 0%, rgba(0,255,136,0.04) 100%)',
            border: `1px solid ${loading ? 'var(--border)' : 'var(--green-mid)'}`,
            borderRadius: 'var(--radius)',
            color: loading ? 'var(--text-dim)' : 'var(--green)',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
          onMouseEnter={e => {
            if (!loading) {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,255,136,0.2) 0%, rgba(0,255,136,0.08) 100%)'
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0,255,136,0.15)'
            }
          }}
          onMouseLeave={e => {
            if (!loading) {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,255,136,0.12) 0%, rgba(0,255,136,0.04) 100%)'
              e.currentTarget.style.boxShadow = 'none'
            }
          }}
        >
          {loading ? (
            <>
              <span style={{ animation: 'rotate 0.8s linear infinite', display: 'inline-block' }}>◌</span>
              &nbsp;PROCESSANDO...
            </>
          ) : (
            <>▶ AVALIAR DISPONIBILIDADE</>
          )}
        </button>

        <div style={{
          marginTop: 8,
          fontSize: 10,
          color: 'var(--text-dim)',
          textAlign: 'center',
          letterSpacing: '0.06em',
        }}>
          via SalgadoAssessmentFacade.avaliarDisponibilidade()
        </div>
      </div>
    </div>
  )
}

function Toggle({ label, desc, entity, type, color, checked, onChange }) {
  return (
    <div
      style={{
        padding: '10px 12px',
        background: checked ? `${color}08` : 'transparent',
        border: `1px solid ${checked ? `${color}33` : 'var(--border)'}`,
        borderRadius: 'var(--radius)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        userSelect: 'none',
      }}
      onClick={() => onChange(!checked)}
      onMouseEnter={e => {
        if (!checked) e.currentTarget.style.borderColor = 'var(--border-mid)'
      }}
      onMouseLeave={e => {
        if (!checked) e.currentTarget.style.borderColor = 'var(--border)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        {/* Switch */}
        <div style={{
          width: 32,
          height: 17,
          borderRadius: 9,
          background: checked ? color : 'var(--bg-input)',
          border: `1px solid ${checked ? color : 'var(--border-mid)'}`,
          position: 'relative',
          flexShrink: 0,
          marginTop: 1,
          transition: 'all 0.2s ease',
          boxShadow: checked ? `0 0 8px ${color}66` : 'none',
        }}>
          <div style={{
            position: 'absolute',
            top: 2,
            left: checked ? 16 : 2,
            width: 11,
            height: 11,
            borderRadius: '50%',
            background: checked ? 'var(--bg)' : 'var(--text-dim)',
            transition: 'left 0.2s ease',
          }} />
        </div>

        {/* Label area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            color: checked ? 'var(--text-bright)' : 'var(--text)',
            letterSpacing: '0.04em',
            lineHeight: 1.3,
          }}>
            {label}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 1 }}>
            {desc}
          </div>
          <div style={{
            marginTop: 4,
            display: 'flex',
            gap: 4,
            flexWrap: 'wrap',
          }}>
            <Tag text={entity} color={color} />
            <Tag text={type} color="var(--text-muted)" border />
          </div>
        </div>

        {/* State indicator */}
        <div style={{
          fontSize: 10,
          fontWeight: 700,
          color: checked ? color : 'var(--text-dim)',
          letterSpacing: '0.1em',
          flexShrink: 0,
          alignSelf: 'center',
        }}>
          {checked ? 'TRUE' : 'false'}
        </div>
      </div>
    </div>
  )
}

function Tag({ text, color, border }) {
  return (
    <span style={{
      fontSize: 9,
      color,
      border: border ? `1px solid ${color}` : 'none',
      borderRadius: 2,
      padding: border ? '0 4px' : 0,
      letterSpacing: '0.06em',
      fontFamily: 'var(--font-mono)',
    }}>
      {text}
    </span>
  )
}
