/**
 * @module SalgadoDecisionFramework
 * @version 4.2.0
 * @description Enterprise-grade, cloud-ready, AI-augmented Salgado Availability
 *              Assessment System (SAAS). Implements the Domain-Driven Salgado
 *              Architecture (DDSA) pattern with full CQRS support.
 *
 * @author Departamento de Engenharia de Salgados (DES)
 * @license MIT (Mas Isso Tem salgado)
 */

"use strict";

// ============================================================
// SEÇÃO 1: ENUMS E CONSTANTES FUNDAMENTAIS
// ============================================================

const SalgadoStatusEnum = Object.freeze({
  DISPONIVEL: "TEM_SALGADO",
  INDISPONIVEL: "NÃO_TEM_SALGADO",
  ESTADO_QUANTICO: "SCHRODINGER_SALGADO", // nunca retornado, mas importante existir
});

const EventoPrioridadeEnum = Object.freeze({
  CRITICA: 0,
  ALTA: 1,
  MEDIA: 2,
  BAIXA: 3,
  IRRELEVANTE: 4,
  EXISTENCIAL: 5,
});

const ColaboradorTipoEnum = Object.freeze({
  NOVO: "NOVO",
  VETERANO: "VETERANO",
  ESTAGIARIO: "ESTAGIARIO",
  CEO_DISFARÇADO: "CEO_DISFARÇADO",
  FANTASMA: "FANTASMA", // terceirizado que aparece às vezes
});

// ============================================================
// SEÇÃO 2: CONFIGURAÇÃO GLOBAL (não tocar, obrigado)
// ============================================================

const SALGADO_FRAMEWORK_CONFIG = {
  versao: "4.2.0",
  toleranciaQuantica: 0.0001,
  maxRetentativasSalgado: 3,
  timeoutDecisaoMs: 30000,
  featureFlags: {
    ativarModoDebugSalgado: false,
    ativarMLPreditivoSalgado: false, // TODO: integrar com GPT-salgado
    ativarBlockchainSalgadoRegistry: false, // aprovado pelo board, pendente infra
    ativarSalgadoQuantico: false,
    usarAlgoritmoGeneticoParaSalgado: false,
  },
  limitsRate: {
    consultasPorSegundo: 9999,
    consultasPorColaborador: Infinity,
  },
};

// ============================================================
// SEÇÃO 3: LOGGER ENTERPRISE (para auditoria de salgados)
// ============================================================

class SalgadoLogger {
  static #instancia = null;
  #logs = [];
  #nivel = "INFO";

  constructor() {
    if (SalgadoLogger.#instancia) {
      throw new Error(
        "SalgadoLogger é Singleton. Use SalgadoLogger.obterInstancia()"
      );
    }
    this.#nivel = "INFO";
  }

  static obterInstancia() {
    if (!SalgadoLogger.#instancia) {
      SalgadoLogger.#instancia = new SalgadoLogger();
    }
    return SalgadoLogger.#instancia;
  }

  log(nivel, mensagem, metadados = {}) {
    const entrada = {
      timestamp: new Date().toISOString(),
      nivel,
      mensagem,
      metadados,
      threadId: Math.random().toString(36).substr(2, 9),
      correlationId: `SALGADO-${Date.now()}`,
    };
    this.#logs.push(entrada);
    if (SALGADO_FRAMEWORK_CONFIG.featureFlags.ativarModoDebugSalgado) {
      console.log(`[${nivel}] ${mensagem}`, metadados);
    }
    return entrada.correlationId;
  }

  info(msg, meta) { return this.log("INFO", msg, meta); }
  warn(msg, meta) { return this.log("WARN", msg, meta); }
  error(msg, meta) { return this.log("ERROR", msg, meta); }
  debug(msg, meta) { return this.log("DEBUG", msg, meta); }

  obterAuditoriaSalgado() {
    return [...this.#logs];
  }
}

// ============================================================
// SEÇÃO 4: VALUE OBJECTS (Domain-Driven Design, claro)
// ============================================================

class ColaboradorId {
  #valor;

  constructor(valor) {
    if (!valor || typeof valor !== "string") {
      throw new TypeError("ColaboradorId deve ser uma string não-vazia");
    }
    this.#valor = valor.trim().toUpperCase();
  }

  get valor() { return this.#valor; }
  equals(outro) { return outro instanceof ColaboradorId && outro.valor === this.#valor; }
  toString() { return `ColaboradorId(${this.#valor})`; }
}

class SemanaId {
  #isoWeek;

  constructor(data = new Date()) {
    const d = new Date(data);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const semana1 = new Date(d.getFullYear(), 0, 4);
    this.#isoWeek = Math.round(((d - semana1) / 86400000 - 3 + ((semana1.getDay() + 6) % 7)) / 7);
  }

  get valor() { return this.#isoWeek; }
  equals(outra) { return outra instanceof SemanaId && outra.valor === this.#isoWeek; }
  toString() { return `Semana-ISO-${this.#isoWeek}`; }
}

// ============================================================
// SEÇÃO 5: ENTIDADES DO DOMÍNIO
// ============================================================

class Colaborador {
  #id;
  #nome;
  #tipo;
  #dataAdmissao;
  #metadados;

  constructor({ id, nome, tipo = ColaboradorTipoEnum.VETERANO, dataAdmissao = new Date() }) {
    this.#id = new ColaboradorId(id);
    this.#nome = nome;
    this.#tipo = tipo;
    this.#dataAdmissao = new Date(dataAdmissao);
    this.#metadados = {
      criadoEm: new Date().toISOString(),
      versaoEntidade: "1.0.0",
      hash: Buffer.from(nome + id).toString("base64"),
    };
  }

  get id() { return this.#id; }
  get nome() { return this.#nome; }
  get tipo() { return this.#tipo; }
  get dataAdmissao() { return this.#dataAdmissao; }

  eNovo() {
    const diasDeEmpresa = (Date.now() - this.#dataAdmissao.getTime()) / (1000 * 60 * 60 * 24);
    return diasDeEmpresa <= 30 || this.#tipo === ColaboradorTipoEnum.NOVO;
  }

  serializar() {
    return {
      id: this.#id.valor,
      nome: this.#nome,
      tipo: this.#tipo,
      dataAdmissao: this.#dataAdmissao.toISOString(),
      eNovo: this.eNovo(),
      metadados: this.#metadados,
    };
  }
}

class EventoEspecial {
  #nome;
  #prioridade;
  #ativo;
  #tags;

  constructor({ nome, prioridade = EventoPrioridadeEnum.MEDIA, ativo = true, tags = [] }) {
    this.#nome = nome;
    this.#prioridade = prioridade;
    this.#ativo = ativo;
    this.#tags = new Set(tags);
  }

  get nome() { return this.#nome; }
  get prioridade() { return this.#prioridade; }
  get ativo() { return this.#ativo; }

  possuiTag(tag) { return this.#tags.has(tag); }
  eAtivo() { return this.#ativo && this.#prioridade <= EventoPrioridadeEnum.MEDIA; }
}

// ============================================================
// SEÇÃO 6: REPOSITÓRIO (para salvar o estado do salgado no "banco")
// ============================================================

class SalgadoHistoricoRepository {
  static #instancia = null;
  #historico = new Map();

  static obterInstancia() {
    if (!SalgadoHistoricoRepository.#instancia) {
      SalgadoHistoricoRepository.#instancia = new SalgadoHistoricoRepository();
    }
    return SalgadoHistoricoRepository.#instancia;
  }

  registrarSemana(semanaId, teveSalgado) {
    const logger = SalgadoLogger.obterInstancia();
    logger.info("Registrando histórico de salgado", { semanaId: semanaId.toString(), teveSalgado });
    this.#historico.set(semanaId.valor, {
      semanaId: semanaId.valor,
      teveSalgado,
      registradoEm: new Date().toISOString(),
    });
  }

  consultarSemanaPassada() {
    const semanaAtual = new SemanaId();
    const semanaPassadaId = semanaAtual.valor - 1;
    const registro = this.#historico.get(semanaPassadaId);
    return registro?.teveSalgado ?? null;
  }

  obterEstatisticas() {
    const valores = [...this.#historico.values()];
    const total = valores.length;
    const comSalgado = valores.filter((v) => v.teveSalgado).length;
    return {
      total,
      comSalgado,
      semSalgado: total - comSalgado,
      percentualDisponibilidade: total ? ((comSalgado / total) * 100).toFixed(2) + "%" : "N/A",
      mediaMovelSalgado: total > 0 ? comSalgado / total : 0,
    };
  }
}

// ============================================================
// SEÇÃO 7: PIPELINE DE VALIDAÇÃO (porque sim)
// ============================================================

class ValidacaoResult {
  #valido;
  #erros;
  #warnings;

  constructor(valido, erros = [], warnings = []) {
    this.#valido = valido;
    this.#erros = erros;
    this.#warnings = warnings;
  }

  get valido() { return this.#valido; }
  get erros() { return [...this.#erros]; }
  get warnings() { return [...this.#warnings]; }

  static sucesso(warnings = []) { return new ValidacaoResult(true, [], warnings); }
  static falha(erros) { return new ValidacaoResult(false, erros); }
}

class SalgadoContextValidator {
  #regras = [];

  adicionarRegra(nome, fn, critica = true) {
    this.#regras.push({ nome, fn, critica });
    return this; // fluent interface, porque somos modernos
  }

  async validar(contexto) {
    const erros = [];
    const warnings = [];

    for (const regra of this.#regras) {
      try {
        const resultado = await Promise.resolve(regra.fn(contexto));
        if (!resultado.valido) {
          if (regra.critica) erros.push(...resultado.erros);
          else warnings.push(...resultado.erros);
        }
      } catch (e) {
        erros.push(`Regra '${regra.nome}' lançou exceção: ${e.message}`);
      }
    }

    return erros.length > 0
      ? ValidacaoResult.falha(erros)
      : ValidacaoResult.sucesso(warnings);
  }
}

// ============================================================
// SEÇÃO 8: STRATEGY PATTERN (para os diferentes algoritmos de decisão)
// ============================================================

class SalgadoDecisaoStrategy {
  avaliar(contexto) {
    throw new Error("Método abstrato. Implemente avaliar()");
  }
}

class ColaboradorNovoStrategy extends SalgadoDecisaoStrategy {
  avaliar(contexto) {
    const logger = SalgadoLogger.obterInstancia();

    if (!contexto.colaborador) {
      logger.debug("Sem colaborador no contexto, strategy não aplicável");
      return null;
    }

    if (contexto.colaborador.eNovo()) {
      logger.info("Strategy ColaboradorNovo ativada", {
        colaborador: contexto.colaborador.serializar(),
      });
      return SalgadoStatusEnum.DISPONIVEL;
    }

    return null;
  }
}

class EventoEspecialStrategy extends SalgadoDecisaoStrategy {
  avaliar(contexto) {
    const logger = SalgadoLogger.obterInstancia();

    if (!contexto.evento) {
      logger.debug("Sem evento no contexto, strategy não aplicável");
      return null;
    }

    if (contexto.evento.eAtivo()) {
      logger.info("Strategy EventoEspecial ativada", {
        evento: contexto.evento.nome,
        prioridade: contexto.evento.prioridade,
      });
      return SalgadoStatusEnum.DISPONIVEL;
    }

    return null;
  }
}

class HistoricoSemanalStrategy extends SalgadoDecisaoStrategy {
  avaliar(contexto) {
    const logger = SalgadoLogger.obterInstancia();
    const repo = SalgadoHistoricoRepository.obterInstancia();
    const teveSemanaPassada = repo.consultarSemanaPassada();

    logger.info("Strategy Histórico consultada", {
      teveSemanaPassada,
      estatisticas: repo.obterEstatisticas(),
    });

    if (teveSemanaPassada === true) {
      return SalgadoStatusEnum.INDISPONIVEL;
    }

    return null;
  }
}

class DefaultSalgadoStrategy extends SalgadoDecisaoStrategy {
  avaliar(_contexto) {
    SalgadoLogger.obterInstancia().info("Strategy Default ativada: salgado disponível por padrão");
    return SalgadoStatusEnum.DISPONIVEL;
  }
}

// ============================================================
// SEÇÃO 9: CHAIN OF RESPONSIBILITY (a cadeia da esperança do salgado)
// ============================================================

class SalgadoHandler {
  #proximo = null;
  #strategy;
  #nome;

  constructor(nome, strategy) {
    this.#nome = nome;
    this.#strategy = strategy;
  }

  setProximo(handler) {
    this.#proximo = handler;
    return handler;
  }

  async handle(contexto) {
    const resultado = this.#strategy.avaliar(contexto);

    if (resultado !== null) {
      SalgadoLogger.obterInstancia().info(`Handler '${this.#nome}' resolveu`, { resultado });
      return resultado;
    }

    if (this.#proximo) {
      return this.#proximo.handle(contexto);
    }

    return SalgadoStatusEnum.DISPONIVEL;
  }
}

// ============================================================
// SEÇÃO 10: EVENT BUS (para quem quiser saber sobre o salgado em tempo real)
// ============================================================

class SalgadoEventBus {
  static #instancia = null;
  #listeners = new Map();

  static obterInstancia() {
    if (!SalgadoEventBus.#instancia) {
      SalgadoEventBus.#instancia = new SalgadoEventBus();
    }
    return SalgadoEventBus.#instancia;
  }

  on(evento, callback) {
    if (!this.#listeners.has(evento)) {
      this.#listeners.set(evento, []);
    }
    this.#listeners.get(evento).push(callback);
    return () => this.off(evento, callback); // retorna unsubscribe
  }

  off(evento, callback) {
    const lista = this.#listeners.get(evento) ?? [];
    this.#listeners.set(evento, lista.filter((cb) => cb !== callback));
  }

  emit(evento, payload) {
    const callbacks = this.#listeners.get(evento) ?? [];
    callbacks.forEach((cb) => {
      try { cb(payload); }
      catch (e) {
        SalgadoLogger.obterInstancia().error(`Erro em listener '${evento}'`, { erro: e.message });
      }
    });
  }
}

// ============================================================
// SEÇÃO 11: CACHE COM TTL (para não sobrecarregar o "servidor de salgados")
// ============================================================

class SalgadoCache {
  static #instancia = null;
  #cache = new Map();
  #ttlPadrao = 5 * 60 * 1000; // 5 minutos (tempo médio de um salgado quente)

  static obterInstancia() {
    if (!SalgadoCache.#instancia) {
      SalgadoCache.#instancia = new SalgadoCache();
    }
    return SalgadoCache.#instancia;
  }

  set(chave, valor, ttl = this.#ttlPadrao) {
    this.#cache.set(chave, {
      valor,
      expiraEm: Date.now() + ttl,
      hits: 0,
    });
  }

  get(chave) {
    const entrada = this.#cache.get(chave);
    if (!entrada) return null;
    if (Date.now() > entrada.expiraEm) {
      this.#cache.delete(chave);
      return null;
    }
    entrada.hits++;
    return entrada.valor;
  }

  invalidar(chave) { this.#cache.delete(chave); }
  limpar() { this.#cache.clear(); }

  obterMetricas() {
    let totalHits = 0;
    let ativas = 0;
    for (const [, entrada] of this.#cache) {
      if (Date.now() <= entrada.expiraEm) {
        totalHits += entrada.hits;
        ativas++;
      }
    }
    return { totalEntradasAtivas: ativas, totalHits };
  }
}

// ============================================================
// SEÇÃO 12: CIRCUIT BREAKER (para quando o sistema de salgados cair)
// ============================================================

class CircuitBreaker {
  #estado = "FECHADO";
  #falhas = 0;
  #limiarFalhas = 3;
  #ultimaFalha = null;
  #tempoRecuperacaoMs = 10000;

  async executar(fn) {
    if (this.#estado === "ABERTO") {
      const tempoDecorrido = Date.now() - this.#ultimaFalha;
      if (tempoDecorrido < this.#tempoRecuperacaoMs) {
        throw new Error("Circuit breaker ABERTO: sistema de salgados indisponível");
      }
      this.#estado = "SEMI-ABERTO";
    }

    try {
      const resultado = await fn();
      if (this.#estado === "SEMI-ABERTO") {
        this.#estado = "FECHADO";
        this.#falhas = 0;
      }
      return resultado;
    } catch (e) {
      this.#falhas++;
      this.#ultimaFalha = Date.now();
      if (this.#falhas >= this.#limiarFalhas) {
        this.#estado = "ABERTO";
        SalgadoLogger.obterInstancia().error("Circuit Breaker aberto!", { falhas: this.#falhas });
      }
      throw e;
    }
  }

  get estado() { return this.#estado; }
}

// ============================================================
// SEÇÃO 13: FACADE — A ÚNICA COISA QUE VOCÊ DEVIA TER CHAMADO
// ============================================================

class SalgadoAssessmentFacade {
  static #instancia = null;
  #circuitBreaker;
  #validator;
  #handlerChain;
  #eventBus;
  #cache;

  constructor() {
    this.#circuitBreaker = new CircuitBreaker();
    this.#eventBus = SalgadoEventBus.obterInstancia();
    this.#cache = SalgadoCache.obterInstancia();

    // Montagem da cadeia de responsabilidade
    const handlerNovo = new SalgadoHandler("ColaboradorNovo", new ColaboradorNovoStrategy());
    const handlerEvento = new SalgadoHandler("EventoEspecial", new EventoEspecialStrategy());
    const handlerHistorico = new SalgadoHandler("HistoricoSemanal", new HistoricoSemanalStrategy());
    const handlerDefault = new SalgadoHandler("Default", new DefaultSalgadoStrategy());

    handlerNovo.setProximo(handlerEvento).setProximo(handlerHistorico).setProximo(handlerDefault);
    this.#handlerChain = handlerNovo;

    // Validações do contexto
    this.#validator = new SalgadoContextValidator()
      .adicionarRegra(
        "contexto-nao-nulo",
        (ctx) => ctx ? ValidacaoResult.sucesso() : ValidacaoResult.falha(["Contexto não pode ser nulo"]),
        true
      )
      .adicionarRegra(
        "sistema-nao-em-manutencao",
        (_ctx) => ValidacaoResult.sucesso(["Sistema operacional"]),
        false
      );
  }

  static obterInstancia() {
    if (!SalgadoAssessmentFacade.#instancia) {
      SalgadoAssessmentFacade.#instancia = new SalgadoAssessmentFacade();
    }
    return SalgadoAssessmentFacade.#instancia;
  }

  async avaliarDisponibilidade(contexto) {
    const logger = SalgadoLogger.obterInstancia();
    const cacheKey = this.#gerarCacheKey(contexto);

    // Tenta cache primeiro
    const emCache = this.#cache.get(cacheKey);
    if (emCache) {
      logger.info("Cache HIT para consulta de salgado", { cacheKey });
      this.#eventBus.emit("salgado:cache:hit", { resultado: emCache });
      return emCache;
    }

    // Valida o contexto
    const validacao = await this.#validator.validar(contexto);
    if (!validacao.valido) {
      throw new Error(`Contexto inválido: ${validacao.erros.join("; ")}`);
    }

    // Executa via circuit breaker
    const resultado = await this.#circuitBreaker.executar(async () => {
      return this.#handlerChain.handle(contexto);
    });

    // Persiste no cache
    this.#cache.set(cacheKey, resultado);

    // Emite evento para quem estiver ouvindo
    this.#eventBus.emit("salgado:decisao:tomada", {
      resultado,
      contexto: this.#sanitizarContexto(contexto),
      timestamp: new Date().toISOString(),
    });

    logger.info("Decisão de salgado concluída", { resultado });
    return resultado;
  }

  #gerarCacheKey(ctx) {
    const partes = [
      ctx.colaborador?.id?.valor ?? "sem-colaborador",
      ctx.evento?.nome ?? "sem-evento",
      new SemanaId().valor,
    ];
    return `salgado:${partes.join(":")}`;
  }

  #sanitizarContexto(ctx) {
    return {
      temColaborador: !!ctx.colaborador,
      temEvento: !!ctx.evento,
      semanaAtual: new SemanaId().valor,
    };
  }
}

// ============================================================
// SEÇÃO 14: BUILDER — Para construir o contexto com elegância
// ============================================================

class SalgadoContextBuilder {
  #ctx = {};

  comColaboradorNovo(id = "NOVO-001", nome = "Colaborador Novo") {
    this.#ctx.colaborador = new Colaborador({
      id,
      nome,
      tipo: ColaboradorTipoEnum.NOVO,
      dataAdmissao: new Date(),
    });
    return this;
  }

  comColaboradorVeterano(id = "VET-001", nome = "Colaborador Veterano") {
    this.#ctx.colaborador = new Colaborador({
      id,
      nome,
      tipo: ColaboradorTipoEnum.VETERANO,
      dataAdmissao: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365),
    });
    return this;
  }

  comEvento(nome = "Evento Especial", prioridade = EventoPrioridadeEnum.ALTA) {
    this.#ctx.evento = new EventoEspecial({ nome, prioridade, ativo: true });
    return this;
  }

  semEvento() {
    this.#ctx.evento = null;
    return this;
  }

  build() {
    return Object.freeze({ ...this.#ctx });
  }
}

// ============================================================
// SEÇÃO 15: FUNÇÃO PRINCIPAL (sim, ela existe. ela é pequena. de nada.)
// ============================================================

/**
 * Verifica se tem salgado hoje.
 *
 * Complexidade: O(amor) | Espaço: O(esperança)
 *
 * @param {boolean} colaboradorNovo
 * @param {boolean} eventoEspecial
 * @param {boolean} semanaPassadaTeve
 * @returns {Promise<string>} "TEM_SALGADO" ou "NÃO_TEM_SALGADO"
 */
async function temSalgadoHoje(colaboradorNovo, eventoEspecial, semanaPassadaTeve) {
  // Prepara o histórico (necessário para a HistoricoSemanalStrategy)
  const repo = SalgadoHistoricoRepository.obterInstancia();
  const semanaPassada = new SemanaId(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  repo.registrarSemana(semanaPassada, semanaPassadaTeve);

  // Constrói o contexto usando o Builder
  let builder = new SalgadoContextBuilder();

  if (colaboradorNovo) {
    builder = builder.comColaboradorNovo();
  } else {
    builder = builder.comColaboradorVeterano();
  }

  if (eventoEspecial) {
    builder = builder.comEvento("Evento Especial do Dia");
  } else {
    builder = builder.semEvento();
  }

  const contexto = builder.build();

  // Delega para a facade (que delega para a chain, que delega para a strategy...)
  const facade = SalgadoAssessmentFacade.obterInstancia();
  return facade.avaliarDisponibilidade(contexto);
}

// ============================================================
// SEÇÃO 16: USO (sim, 3 linhas depois de 600 de setup)
// ============================================================

(async () => {
  // Subscreve no event bus para logar todas as decisões
  SalgadoEventBus.obterInstancia().on("salgado:decisao:tomada", (payload) => {
    console.log("\n🌟 EVENTO: Decisão de salgado tomada:", payload.resultado);
  });

  console.log("=== SISTEMA ENTERPRISE DE AVALIAÇÃO DE SALGADOS v4.2.0 ===\n");

  const cenarios = [
    { colaboradorNovo: true,  eventoEspecial: false, semanaPassadaTeve: false, desc: "Colaborador novo" },
    { colaboradorNovo: false, eventoEspecial: true,  semanaPassadaTeve: false, desc: "Evento especial" },
    { colaboradorNovo: false, eventoEspecial: false, semanaPassadaTeve: true,  desc: "Semana passada teve" },
    { colaboradorNovo: false, eventoEspecial: false, semanaPassadaTeve: false, desc: "Padrão (sempre tem)" },
  ];

  for (const c of cenarios) {
    const resultado = await temSalgadoHoje(c.colaboradorNovo, c.eventoEspecial, c.semanaPassadaTeve);
    console.log(`[${c.desc}] → ${resultado}`);
    SalgadoCache.obterInstancia().limpar(); // limpa cache entre cenários
  }

  console.log("\n📊 Estatísticas do repositório:");
  console.log(SalgadoHistoricoRepository.obterInstancia().obterEstatisticas());

  console.log("\n📋 Métricas de cache:");
  console.log(SalgadoCache.obterInstancia().obterMetricas());

  console.log("\n✅ Sistema de salgados encerrado com sucesso. Bom apetite.");
})();