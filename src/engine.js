// ============================================================
// SAAS — Salgado Assessment & Availability System
// Core Decision Engine (React-adapted)
// ============================================================

export const SalgadoStatus = Object.freeze({
  DISPONIVEL:  'TEM_SALGADO',
  INDISPONIVEL: 'NÃO_TEM_SALGADO',
})

export const ColaboradorTipo = Object.freeze({
  NOVO:      'NOVO',
  VETERANO:  'VETERANO',
  ESTAGIARIO:'ESTAGIARIO',
})

export const EventoPrioridade = Object.freeze({
  CRITICA:    0,
  ALTA:       1,
  MEDIA:      2,
  BAIXA:      3,
  IRRELEVANTE:4,
})

// ── Value Object: SemanaId ──────────────────────────────────
export function getISOWeek(date = new Date()) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const week1 = new Date(d.getFullYear(), 0, 4)
  return Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
}

// ── Strategy definitions ────────────────────────────────────
const strategies = [
  {
    id:        'ColaboradorNovoStrategy',
    handler:   'ColaboradorNovo',
    layer:     'Domain',
    avaliar:   ({ colaboradorNovo }) => colaboradorNovo
      ? { resultado: SalgadoStatus.DISPONIVEL, motivo: 'Colaborador admitido há menos de 30 dias' }
      : null,
  },
  {
    id:        'EventoEspecialStrategy',
    handler:   'EventoEspecial',
    layer:     'Domain',
    avaliar:   ({ eventoEspecial }) => eventoEspecial
      ? { resultado: SalgadoStatus.DISPONIVEL, motivo: 'Evento especial ativo com prioridade ≤ MEDIA' }
      : null,
  },
  {
    id:        'HistoricoSemanalStrategy',
    handler:   'HistoricoSemanal',
    layer:     'Domain',
    avaliar:   ({ semanaPassadaTeve }) => semanaPassadaTeve
      ? { resultado: SalgadoStatus.INDISPONIVEL, motivo: 'Semana passada teve — rodízio aplicado' }
      : null,
  },
  {
    id:        'DefaultSalgadoStrategy',
    handler:   'Default',
    layer:     'Domain',
    avaliar:   () => ({ resultado: SalgadoStatus.DISPONIVEL, motivo: 'Nenhuma restrição detectada — TEM_SALGADO por padrão' }),
  },
]

// ── Cache (in-memory) ───────────────────────────────────────
const _cache = new Map()
const CACHE_TTL = 5 * 60 * 1000

function getCacheKey(params) {
  return `${params.colaboradorNovo}:${params.eventoEspecial}:${params.semanaPassadaTeve}:${getISOWeek()}`
}

function cacheGet(key) {
  const entry = _cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiraEm) { _cache.delete(key); return null }
  entry.hits++
  return entry.value
}

function cacheSet(key, value) {
  _cache.set(key, { value, expiraEm: Date.now() + CACHE_TTL, hits: 0, criadoEm: Date.now() })
}

export function getCacheStats() {
  let ativas = 0, totalHits = 0
  for (const [, e] of _cache) {
    if (Date.now() <= e.expiraEm) { ativas++; totalHits += e.hits }
  }
  return { ativas, totalHits, totalEntradas: _cache.size }
}

export function invalidateCache() {
  _cache.clear()
}

// ── Circuit Breaker ─────────────────────────────────────────
const circuitBreaker = {
  estado:     'FECHADO',
  falhas:     0,
  limiar:     3,
  ultimaFalha: null,
  recuperacao: 10_000,

  canExecute() {
    if (this.estado === 'ABERTO') {
      const elapsed = Date.now() - this.ultimaFalha
      if (elapsed >= this.recuperacao) {
        this.estado = 'SEMI-ABERTO'
        return true
      }
      return false
    }
    return true
  },

  onSuccess() {
    if (this.estado === 'SEMI-ABERTO') {
      this.estado = 'FECHADO'
      this.falhas = 0
    }
  },

  onFailure() {
    this.falhas++
    this.ultimaFalha = Date.now()
    if (this.falhas >= this.limiar) this.estado = 'ABERTO'
  },

  getState() {
    return { estado: this.estado, falhas: this.falhas, limiar: this.limiar }
  },
}

export function getCircuitBreakerState() {
  return circuitBreaker.getState()
}

// ── Main evaluation function ────────────────────────────────
export function avaliarSalgado(params) {
  const t0 = performance.now()
  const logs = []
  const cacheKey = getCacheKey(params)

  const log = (nivel, msg, meta = {}) =>
    logs.push({ nivel, msg, meta, ts: new Date().toLocaleTimeString('pt-BR') })

  log('INFO', 'Iniciando avaliação de disponibilidade', params)

  // Cache check
  const cached = cacheGet(cacheKey)
  if (cached) {
    log('INFO', `Cache HIT — servindo resultado em cache`, { key: cacheKey })
    const latencia = (performance.now() - t0).toFixed(3)
    return { ...cached, cacheHit: true, latencia, logs }
  }
  log('DEBUG', 'Cache MISS — iniciando pipeline de decisão')

  // Circuit breaker check
  if (!circuitBreaker.canExecute()) {
    log('ERROR', 'Circuit Breaker ABERTO — sistema indisponível', circuitBreaker.getState())
    throw new Error('Circuit Breaker ABERTO: sistema de salgados temporariamente indisponível')
  }

  // Validation
  log('INFO', 'Validando contexto de entrada')
  if (params === null || params === undefined) {
    log('ERROR', 'Contexto inválido: null recebido')
    throw new Error('Contexto não pode ser nulo')
  }
  log('INFO', 'Contexto validado com sucesso')

  // Chain of responsibility
  let resultado = null
  let strategyUsada = null

  for (const strategy of strategies) {
    log('DEBUG', `Executando ${strategy.id}`, { handler: strategy.handler })
    const res = strategy.avaliar(params)
    if (res !== null) {
      resultado = res
      strategyUsada = strategy
      log('INFO', `Strategy '${strategy.id}' resolveu`, { resultado: res.resultado, motivo: res.motivo })
      break
    }
    log('DEBUG', `Strategy '${strategy.id}' não aplicável — passando para próxima`)
  }

  // Persist to cache
  const payload = {
    resultado:    resultado.resultado,
    motivo:       resultado.motivo,
    strategy:     strategyUsada.id,
    handler:      strategyUsada.handler,
    layer:        strategyUsada.layer,
    semanaISO:    getISOWeek(),
    cacheHit:     false,
    timestamp:    new Date().toISOString(),
  }
  cacheSet(cacheKey, payload)
  log('INFO', 'Resultado persistido em cache', { ttl: '5min', key: cacheKey })
  circuitBreaker.onSuccess()

  const latencia = (performance.now() - t0).toFixed(3)
  log('INFO', `Avaliação concluída em ${latencia}ms`, { resultado: payload.resultado })

  return { ...payload, latencia, logs }
}

// ── History tracker ─────────────────────────────────────────
const _history = []

export function addToHistory(resultado) {
  _history.unshift({
    resultado,
    semana: getISOWeek(),
    ts: new Date().toLocaleTimeString('pt-BR'),
  })
  if (_history.length > 12) _history.pop()
}

export function getHistory() {
  return [..._history]
}

export function getHistoryStats() {
  const total = _history.length
  const tem   = _history.filter(h => h.resultado === SalgadoStatus.DISPONIVEL).length
  return {
    total,
    tem,
    nao: total - tem,
    pct: total ? Math.round((tem / total) * 100) : null,
  }
}
