# 🥐 Salgado Assessment & Availability System

> **SAAS** — *Enterprise-grade, cloud-ready, AI-augmented Salgado Availability Assessment System*

[![versão](https://img.shields.io/badge/versão-4.2.0-brightgreen)](./CHANGELOG.md)
[![licença](https://img.shields.io/badge/licença-MIT_(Mas_Isso_Tem)-yellow)](./LICENSE)
[![cobertura](https://img.shields.io/badge/cobertura-97%25-success)](./coverage)
[![status](https://img.shields.io/badge/salgado-TEM-orange)](./docs/status.md)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-blue)](https://nodejs.org)
[![padrão](https://img.shields.io/badge/padrão-DDSA-purple)](./docs/architecture.md)

---

## 📋 Sumário

- [Visão Geral](#visão-geral)
- [Motivação](#motivação)
- [Arquitetura](#arquitetura)
  - [Domain-Driven Salgado Architecture (DDSA)](#domain-driven-salgado-architecture-ddsa)
  - [Diagrama de Componentes](#diagrama-de-componentes)
  - [Fluxo de Decisão](#fluxo-de-decisão)
- [Instalação](#instalação)
- [Uso](#uso)
  - [Uso Básico](#uso-básico)
  - [Uso Avançado com Builder](#uso-avançado-com-builder)
  - [Integração com Event Bus](#integração-com-event-bus)
- [Módulos](#módulos)
  - [Domain Layer](#domain-layer)
  - [Application Layer](#application-layer)
  - [Infrastructure Layer](#infrastructure-layer)
  - [Cross-cutting Concerns](#cross-cutting-concerns)
- [Design Patterns](#design-patterns)
- [Configuração](#configuração)
  - [Feature Flags](#feature-flags)
  - [Limites de Rate](#limites-de-rate)
- [Testes](#testes)
- [Performance](#performance)
- [Roadmap](#roadmap)
- [Contribuindo](#contribuindo)
- [FAQ](#faq)
- [Licença](#licença)

---

## Visão Geral

O **SAAS** (Salgado Assessment & Availability System) é uma solução _enterprise_ para resolução do problema clássico e recorrente no ambiente corporativo brasileiro: **tem salgado hoje ou não tem?**

Construído sob os princípios da **Domain-Driven Salgado Architecture (DDSA)**, o sistema orquestra múltiplos padrões de projeto, camadas de abstração e mecanismos de resiliência para entregar, com latência de microssegundos e zero margem de erro, uma das seguintes respostas:

```
"TEM_SALGADO"
```

ou, em situações de escassez verificada:

```
"NÃO_TEM_SALGADO"
```

O SAAS nasceu da necessidade de modernizar uma lógica de negócio crítica que havia sido implementada de forma imprudentemente simples — apenas 10 linhas de código — sem qualquer consideração pelos princípios SOLID, pelos padrões de design do Gang of Four, nem pela saúde mental da equipe de engenharia que um dia precisaria dar manutenção.

---

## Motivação

O código que motivou este projeto é apresentado abaixo em sua forma original, como um exemplo de como **não se deve** implementar lógica de negócio crítica em um ambiente de produção:

```javascript
// ⚠️ LEGADO — NÃO USAR EM PRODUÇÃO
if (colaboradorNovo) {
  return 'TEM_SALGADO'
}
if (eventoEspecial) {
  return 'TEM_SALGADO'
}
if (semanaPassadaTeve) {
  return 'NÃO_TEM_SALGADO'
}
return 'TEM_SALGADO'
```

### Problemas identificados no código legado

| Problema | Impacto | Severidade |
|---|---|---|
| Ausência de Value Objects | Acoplamento primitivo | 🔴 Crítico |
| Lógica sem Strategy Pattern | Impossível estender sem modificar | 🔴 Crítico |
| Sem Circuit Breaker | Sistema frágil a falhas em cascata | 🔴 Crítico |
| Sem cache TTL | Re-processamento desnecessário a cada consulta | 🟠 Alto |
| Sem Event Bus | Observabilidade zero sobre decisões tomadas | 🟠 Alto |
| Sem logging estruturado | Auditoria de salgados impossível | 🟠 Alto |
| Sem repositório de histórico | Dados de semanas anteriores perdidos | 🟡 Médio |
| Sem validação de contexto | Contextos inválidos passam sem tratamento | 🟡 Médio |
| Apenas 10 linhas | Difícil de justificar a contratação de um time | 🟡 Médio |

---

## Arquitetura

### Domain-Driven Salgado Architecture (DDSA)

O SAAS implementa a **DDSA**, uma variação da arquitetura hexagonal adaptada ao contexto de avaliação de disponibilidade de salgados. A DDSA é dividida em quatro camadas principais:

```
┌──────────────────────────────────────────────────────────────────┐
│                        INTERFACE LAYER                           │
│              temSalgadoHoje(novo, evento, semana)                │
└─────────────────────────────┬────────────────────────────────────┘
                              │
┌─────────────────────────────▼────────────────────────────────────┐
│                      APPLICATION LAYER                           │
│  SalgadoAssessmentFacade  │  SalgadoContextBuilder               │
│  SalgadoContextValidator  │  CircuitBreaker                      │
└─────────────────────────────┬────────────────────────────────────┘
                              │
┌─────────────────────────────▼────────────────────────────────────┐
│                        DOMAIN LAYER                              │
│  Colaborador  │  EventoEspecial  │  ColaboradorId  │  SemanaId   │
│  ColaboradorNovoStrategy  │  EventoEspecialStrategy              │
│  HistoricoSemanalStrategy │  DefaultSalgadoStrategy              │
│  SalgadoHandler (Chain of Responsibility)                        │
└─────────────────────────────┬────────────────────────────────────┘
                              │
┌─────────────────────────────▼────────────────────────────────────┐
│                     INFRASTRUCTURE LAYER                         │
│  SalgadoLogger  │  SalgadoCache  │  SalgadoHistoricoRepository   │
│  SalgadoEventBus                                                 │
└──────────────────────────────────────────────────────────────────┘
```

### Diagrama de Componentes

```
                  ┌────────────────────┐
                  │  temSalgadoHoje()  │  ◄── Entry point
                  └────────┬───────────┘
                           │
                  ┌────────▼───────────┐      ┌──────────────────┐
                  │  Context Builder   │─────►│   Colaborador    │
                  └────────┬───────────┘      │  EventoEspecial  │
                           │                  └──────────────────┘
                  ┌────────▼───────────┐
                  │ Context Validator  │◄──── Regras de negócio
                  └────────┬───────────┘
                           │
                  ┌────────▼───────────┐      ┌──────────────────┐
                  │  Circuit Breaker   │      │  SalgadoCache    │
                  └────────┬───────────┘      │   (TTL: 5min)    │
                           │                  └────────▲─────────┘
                  ┌────────▼───────────┐               │ cache hit/miss
                  │   Facade SAAS      │───────────────┘
                  └────────┬───────────┘
                           │
           ┌───────────────┼───────────────────┐
           │               │                   │
  ┌────────▼────────┐  ┌───▼────────────┐ ┌────▼────────────┐
  │  Handler Novo   │  │ Handler Evento │ │Handler Histórico│
  │   (Strategy)    │  │  (Strategy)    │ │  (Strategy)     │
  └────────┬────────┘  └───┬────────────┘ └────┬────────────┘
           │               │                   │
           └───────────────┼───────────────────┘
                           │
                  ┌────────▼───────────┐
                  │  Handler Default   │  ◄── Sempre retorna TEM_SALGADO
                  └────────────────────┘
```

### Fluxo de Decisão

```
INÍCIO
  │
  ├──► Cache hit? ──► SIM ──► Retorna resultado cacheado
  │
  └──► NÃO
         │
         ▼
    Valida contexto
         │
         ├──► Inválido ──► Lança exceção com detalhes
         │
         └──► Válido
                │
                ▼
        Circuit Breaker ABERTO?
                │
                ├──► SIM ──► Lança erro de indisponibilidade
                │
                └──► NÃO
                       │
                       ▼
              Colaborador é NOVO?
                       │
                       ├──► SIM ──► "TEM_SALGADO" ✓
                       │
                       └──► NÃO
                              │
                              ▼
                    Evento ESPECIAL ATIVO?
                              │
                              ├──► SIM ──► "TEM_SALGADO" ✓
                              │
                              └──► NÃO
                                     │
                                     ▼
                         Semana passada TEVE salgado?
                                     │
                                     ├──► SIM ──► "NÃO_TEM_SALGADO" ✗
                                     │
                                     └──► NÃO
                                            │
                                            ▼
                                    DEFAULT: "TEM_SALGADO" ✓
```

---

## Instalação

### Pré-requisitos

- Node.js `>= 18.0.0`
- npm `>= 9.0.0`
- Acesso a uma cozinha corporativa
- Fé

### Via npm

```bash
npm install salgado-assessment-system
```

### Via yarn

```bash
yarn add salgado-assessment-system
```

### Via clone do repositório

```bash
git clone https://github.com/sua-empresa/salgado-assessment-system.git
cd salgado-assessment-system
npm install
```

### Verificando a instalação

```bash
node -e "const { temSalgadoHoje } = require('.'); temSalgadoHoje(false, false, false).then(console.log)"
# Output esperado: TEM_SALGADO
```

---

## Uso

### Uso Básico

A função principal `temSalgadoHoje` aceita três parâmetros booleanos e retorna uma `Promise<string>`:

```javascript
const { temSalgadoHoje } = require('salgado-assessment-system');

// Cenário 1: colaborador novo na empresa
const resultado1 = await temSalgadoHoje(true, false, false);
console.log(resultado1); // "TEM_SALGADO"

// Cenário 2: evento especial hoje
const resultado2 = await temSalgadoHoje(false, true, false);
console.log(resultado2); // "TEM_SALGADO"

// Cenário 3: semana passada teve, essa semana não terá
const resultado3 = await temSalgadoHoje(false, false, true);
console.log(resultado3); // "NÃO_TEM_SALGADO"

// Cenário 4: situação padrão (por padrão, sempre tem salgado)
const resultado4 = await temSalgadoHoje(false, false, false);
console.log(resultado4); // "TEM_SALGADO"
```

### Uso Avançado com Builder

Para cenários mais complexos, recomenda-se utilizar o `SalgadoContextBuilder` diretamente, que expõe uma API fluente para construção contextual:

```javascript
const {
  SalgadoContextBuilder,
  SalgadoAssessmentFacade,
  ColaboradorTipoEnum,
  EventoPrioridadeEnum,
} = require('salgado-assessment-system');

// Construção de contexto com colaborador veterano e evento de alta prioridade
const contexto = new SalgadoContextBuilder()
  .comColaboradorVeterano('FUNC-42', 'João da Silva')
  .comEvento('Aniversário da Empresa', EventoPrioridadeEnum.CRITICA)
  .build();

const facade = SalgadoAssessmentFacade.obterInstancia();
const resultado = await facade.avaliarDisponibilidade(contexto);

console.log(resultado); // "TEM_SALGADO"
```

### Integração com Event Bus

O SAAS emite eventos em tempo real que podem ser consumidos por qualquer parte do sistema, permitindo observabilidade total sobre o ciclo de vida das decisões de salgado:

```javascript
const { SalgadoEventBus } = require('salgado-assessment-system');

const bus = SalgadoEventBus.obterInstancia();

// Escuta todas as decisões tomadas
const unsubscribe = bus.on('salgado:decisao:tomada', (payload) => {
  console.log(`[${payload.timestamp}] Decisão: ${payload.resultado}`);
  console.log('Contexto:', payload.contexto);

  // Integrar com seu sistema de monitoramento
  metricsClient.increment('salgado.decisao', { resultado: payload.resultado });
});

// Escuta cache hits para monitoramento de eficiência
bus.on('salgado:cache:hit', ({ resultado }) => {
  console.log('Cache hit! Resultado servido instantaneamente:', resultado);
});

// Para parar de escutar
unsubscribe();
```

### Consultando Histórico e Estatísticas

```javascript
const { SalgadoHistoricoRepository, SalgadoLogger } = require('salgado-assessment-system');

const repo = SalgadoHistoricoRepository.obterInstancia();

// Obtendo estatísticas históricas
const stats = repo.obterEstatisticas();
console.log(stats);
/*
{
  total: 52,
  comSalgado: 47,
  semSalgado: 5,
  percentualDisponibilidade: "90.38%",
  mediaMovelSalgado: 0.9038461538461539
}
*/

// Auditoria completa de todas as consultas realizadas
const logger = SalgadoLogger.obterInstancia();
const auditoria = logger.obterAuditoriaSalgado();
console.log(`Total de operações auditadas: ${auditoria.length}`);
```

---

## Módulos

### Domain Layer

A camada de domínio contém toda a lógica de negócio do sistema, organizada em entidades, value objects e estratégias de decisão.

#### Value Objects

| Classe | Descrição | Imutável |
|---|---|---|
| `ColaboradorId` | Identificador único de colaborador, normalizado para uppercase | ✅ |
| `SemanaId` | Identificador de semana ISO 8601, calculado a partir de uma data | ✅ |

```javascript
// ColaboradorId — encapsula e normaliza o identificador
const id = new ColaboradorId('func-001');
console.log(id.valor);          // "FUNC-001"
console.log(id.toString());     // "ColaboradorId(FUNC-001)"
console.log(id.equals(new ColaboradorId('FUNC-001'))); // true

// SemanaId — semana ISO da data fornecida
const semana = new SemanaId(new Date('2024-03-15'));
console.log(semana.valor);      // 11 (semana 11 do ano)
```

#### Entidades

**`Colaborador`** — entidade central do domínio. Encapsula os dados do colaborador e expõe comportamentos de negócio:

```javascript
const colaborador = new Colaborador({
  id: 'FUNC-001',
  nome: 'Maria Oliveira',
  tipo: ColaboradorTipoEnum.NOVO,
  dataAdmissao: new Date(), // admitido hoje
});

console.log(colaborador.eNovo()); // true (admitido há menos de 30 dias)
console.log(colaborador.serializar());
/*
{
  id: "FUNC-001",
  nome: "Maria Oliveira",
  tipo: "NOVO",
  dataAdmissao: "2024-03-15T...",
  eNovo: true,
  metadados: { criadoEm: "...", versaoEntidade: "1.0.0", hash: "..." }
}
*/
```

**`EventoEspecial`** — entidade que representa um evento com prioridade e estado:

```javascript
const evento = new EventoEspecial({
  nome: 'Confraternização de Q1',
  prioridade: EventoPrioridadeEnum.ALTA,
  ativo: true,
  tags: ['trimestral', 'obrigatorio', 'salgado-garantido'],
});

console.log(evento.eAtivo());          // true
console.log(evento.possuiTag('trimestral')); // true
```

#### Strategies de Decisão

Cada strategy implementa a interface `SalgadoDecisaoStrategy` e encapsula uma regra de negócio isolada:

| Strategy | Condição de Ativação | Retorno |
|---|---|---|
| `ColaboradorNovoStrategy` | `colaborador.eNovo() === true` | `TEM_SALGADO` |
| `EventoEspecialStrategy` | `evento.eAtivo() === true` | `TEM_SALGADO` |
| `HistoricoSemanalStrategy` | Semana passada teve salgado | `NÃO_TEM_SALGADO` |
| `DefaultSalgadoStrategy` | Sempre (fallback final) | `TEM_SALGADO` |

---

### Application Layer

#### `SalgadoAssessmentFacade`

Ponto de entrada principal da camada de aplicação. Coordena o fluxo completo de avaliação, desde a validação do contexto até a persistência em cache.

```
Responsabilidades:
  ├── Verificar cache antes de processar
  ├── Validar o contexto de entrada
  ├── Envolver a execução no Circuit Breaker
  ├── Delegar para a Chain of Responsibility
  ├── Persistir resultado em cache (TTL: 5min)
  └── Emitir eventos no Event Bus
```

#### `SalgadoContextBuilder`

Implementa o padrão Builder para construção fluente e tipada do contexto de avaliação. Elimina a necessidade de instanciar entidades manualmente.

#### `SalgadoContextValidator`

Pipeline de validação extensível. Novas regras podem ser adicionadas sem modificar o código existente:

```javascript
const validator = new SalgadoContextValidator()
  .adicionarRegra('contexto-nao-nulo', (ctx) => ..., true)   // crítica
  .adicionarRegra('sistema-operacional', (ctx) => ..., false); // não-crítica (warning)
```

---

### Infrastructure Layer

#### `SalgadoLogger`

Logger estruturado em padrão Singleton. Armazena entradas com `timestamp`, `correlationId`, `threadId` e metadados arbitrários. Serve como base para auditoria completa de todas as decisões de salgado.

```javascript
const logger = SalgadoLogger.obterInstancia();

logger.info('Consultando disponibilidade', { colaboradorId: 'FUNC-001' });
logger.warn('Contexto parcialmente preenchido', { campo: 'evento' });
logger.error('Falha ao consultar repositório', { erro: 'timeout' });
```

#### `SalgadoHistoricoRepository`

Repositório em memória (com suporte planejado a persistência externa — ver [Roadmap](#roadmap)) para armazenamento do histórico semanal de disponibilidade de salgados. Fornece estatísticas agregadas para fins de planejamento.

#### `SalgadoCache`

Cache LRU com TTL configurável. Chaves compostas por `colaboradorId:eventoNome:semanaISO` garantem que resultados distintos por contexto não se sobreponham.

```
TTL padrão: 5 minutos (equivalente ao tempo médio de um salgado ainda quente)
```

#### `SalgadoEventBus`

Barramento de eventos Singleton. Suporta múltiplos listeners por evento e retorna uma função de `unsubscribe` ao registrar cada listener.

**Eventos disponíveis:**

| Evento | Payload | Descrição |
|---|---|---|
| `salgado:decisao:tomada` | `{ resultado, contexto, timestamp }` | Disparado após cada decisão |
| `salgado:cache:hit` | `{ resultado }` | Disparado quando o resultado vem do cache |

---

### Cross-cutting Concerns

#### Circuit Breaker

O `CircuitBreaker` protege o sistema contra falhas em cascata. Opera em três estados:

```
FECHADO ──► (≥3 falhas) ──► ABERTO ──► (após 10s) ──► SEMI-ABERTO
   ▲                                                         │
   └──────────────────── (sucesso) ──────────────────────────┘
```

| Estado | Comportamento |
|---|---|
| `FECHADO` | Operação normal. Falhas são contadas. |
| `ABERTO` | Todas as requisições são rejeitadas imediatamente. |
| `SEMI-ABERTO` | Uma requisição de teste é permitida. Sucesso fecha o circuito. |

---

## Design Patterns

O SAAS implementa os seguintes padrões de projeto do livro _"Design Patterns: Elements of Reusable Object-Oriented Software"_ (Gang of Four), além de padrões de arquitetura modernos:

| Padrão | Onde é aplicado | Justificativa |
|---|---|---|
| **Singleton** | `SalgadoLogger`, `SalgadoCache`, `SalgadoHistoricoRepository`, `SalgadoEventBus`, `SalgadoAssessmentFacade` | Garante instância única e estado global consistente |
| **Strategy** | `ColaboradorNovoStrategy`, `EventoEspecialStrategy`, etc. | Isola cada regra de negócio em uma classe coesa |
| **Chain of Responsibility** | `SalgadoHandler` | Processa as strategies em cadeia, parando na primeira que responde |
| **Builder** | `SalgadoContextBuilder` | Construção fluente e segura do contexto |
| **Facade** | `SalgadoAssessmentFacade` | Interface simplificada sobre subsistemas complexos |
| **Observer** | `SalgadoEventBus` | Desacopla produtores de consumidores de eventos |
| **Value Object** | `ColaboradorId`, `SemanaId` | Encapsula primitivos com comportamento e imutabilidade |
| **Repository** | `SalgadoHistoricoRepository` | Abstrai o acesso ao histórico de salgados |
| **Circuit Breaker** | `CircuitBreaker` | Resiliência a falhas em cascata |

---

## Configuração

Toda a configuração do sistema é centralizada no objeto `SALGADO_FRAMEWORK_CONFIG`:

```javascript
const SALGADO_FRAMEWORK_CONFIG = {
  versao: "4.2.0",
  toleranciaQuantica: 0.0001,
  maxRetentativasSalgado: 3,
  timeoutDecisaoMs: 30000,
  featureFlags: { ... },
  limitsRate: { ... },
};
```

### Feature Flags

O sistema suporta feature flags para habilitação gradual de funcionalidades experimentais:

| Flag | Padrão | Descrição |
|---|---|---|
| `ativarModoDebugSalgado` | `false` | Habilita logging detalhado no console |
| `ativarMLPreditivoSalgado` | `false` | _(Em desenvolvimento)_ Predição via modelo de ML |
| `ativarBlockchainSalgadoRegistry` | `false` | _(Aprovado pelo board, pendente infra)_ Registro imutável em blockchain |
| `ativarSalgadoQuantico` | `false` | _(Pesquisa)_ Salgado em superposição quântica até ser observado |
| `usarAlgoritmoGeneticoParaSalgado` | `false` | _(Experimental)_ Otimização evolutiva da decisão |

Para habilitar uma flag em ambiente de desenvolvimento:

```javascript
SALGADO_FRAMEWORK_CONFIG.featureFlags.ativarModoDebugSalgado = true;
```

> **⚠️ Atenção:** Não habilitar `ativarBlockchainSalgadoRegistry` sem aprovação da equipe de infraestrutura. O board aprovou, mas a infra ainda não.

### Limites de Rate

```javascript
limitsRate: {
  consultasPorSegundo: 9999,      // Razoavelmente generoso
  consultasPorColaborador: Infinity, // Ninguém deveria perguntar isso mais de uma vez
}
```

---

## Testes

### Executando a suíte de testes

```bash
# Todos os testes
npm test

# Com cobertura
npm run test:coverage

# Apenas testes unitários
npm run test:unit

# Apenas testes de integração
npm run test:integration

# Modo watch
npm run test:watch
```

### Estrutura de testes

```
tests/
├── unit/
│   ├── domain/
│   │   ├── ColaboradorId.spec.js
│   │   ├── Colaborador.spec.js
│   │   ├── EventoEspecial.spec.js
│   │   └── SemanaId.spec.js
│   ├── strategies/
│   │   ├── ColaboradorNovoStrategy.spec.js
│   │   ├── EventoEspecialStrategy.spec.js
│   │   ├── HistoricoSemanalStrategy.spec.js
│   │   └── DefaultSalgadoStrategy.spec.js
│   └── infrastructure/
│       ├── SalgadoCache.spec.js
│       ├── SalgadoLogger.spec.js
│       └── CircuitBreaker.spec.js
├── integration/
│   ├── facade.spec.js
│   └── chain-of-responsibility.spec.js
└── e2e/
    └── temSalgadoHoje.spec.js
```

### Exemplo de teste

```javascript
describe('temSalgadoHoje', () => {
  it('deve retornar TEM_SALGADO para colaborador novo', async () => {
    const resultado = await temSalgadoHoje(true, false, false);
    expect(resultado).toBe(SalgadoStatusEnum.DISPONIVEL);
  });

  it('deve retornar NÃO_TEM_SALGADO quando semana passada teve', async () => {
    const resultado = await temSalgadoHoje(false, false, true);
    expect(resultado).toBe(SalgadoStatusEnum.INDISPONIVEL);
  });

  it('deve servir do cache na segunda consulta idêntica', async () => {
    const spy = jest.spyOn(SalgadoEventBus.obterInstancia(), 'emit');
    await temSalgadoHoje(false, false, false);
    await temSalgadoHoje(false, false, false);
    expect(spy).toHaveBeenCalledWith('salgado:cache:hit', expect.any(Object));
  });
});
```

### Cobertura atual

| Módulo | Statements | Branches | Functions | Lines |
|---|---|---|---|---|
| Domain | 100% | 100% | 100% | 100% |
| Application | 98% | 95% | 100% | 98% |
| Infrastructure | 97% | 94% | 100% | 97% |
| **Total** | **97%** | **96%** | **100%** | **97%** |

---

## Performance

Benchmarks executados em hardware padrão corporativo (notebook com 47 abas do Chrome abertas):

| Cenário | Latência (p50) | Latência (p99) | Throughput |
|---|---|---|---|
| Cache hit | < 0.01ms | 0.05ms | 1.2M req/s |
| Cache miss (decisão simples) | 0.3ms | 1.2ms | 180K req/s |
| Circuit breaker aberto | < 0.001ms | 0.01ms | 5M req/s |

> **Nota:** O sistema foi testado sob carga de 10.000 requisições simultâneas de colaboradores consultando se tinha salgado antes do almoço. Nenhuma degradação foi observada.

---

## Roadmap

### v4.3.0 — _Próxima release_
- [ ] Persistência do `SalgadoHistoricoRepository` em Redis
- [ ] SDK para integração com Slack (`/salgado?`)
- [ ] Dashboard de métricas de disponibilidade (Grafana-ready)
- [ ] Suporte a múltiplos andares do mesmo prédio

### v5.0.0 — _Visão de longo prazo_
- [ ] **Salgado Preditivo via ML** — modelo treinado com histórico de 52 semanas para predição proativa
- [ ] **Blockchain Registry** _(infra aprovada, aguardando orçamento)_ — registro imutável e auditável de todas as decisões de salgado
- [ ] **Salgado Quântico** — avaliação em superposição até o momento da observação (requer hardware quântico)
- [ ] **Algoritmo Genético** — otimização evolutiva para maximizar a frequência de salgados ao longo do ano
- [ ] **API REST** com OpenAPI 3.0 spec e geração automática de SDK
- [ ] **Multi-tenancy** — suporte a múltiplas empresas com configurações de salgado independentes
- [ ] **Internacionalização** — suporte a `HAS_SNACK`, `HAT_SNACK`, `A_DU_SNACK`

---

## Contribuindo

Contribuições são bem-vindas! Por favor, leia este guia antes de submeter um Pull Request.

### Preparando o ambiente

```bash
git clone https://github.com/sua-empresa/salgado-assessment-system.git
cd salgado-assessment-system
npm install
npm run prepare  # configura hooks do git
```

### Padrões de código

- Todos os novos módulos devem seguir a **DDSA** (Domain-Driven Salgado Architecture)
- Novas regras de negócio devem ser implementadas como **Strategies** isoladas
- Toda lógica nova deve ter cobertura de testes **≥ 95%**
- Commits seguem o padrão **Conventional Commits**:

```
feat(domain): adiciona suporte a colaborador terceirizado
fix(cache): corrige TTL em ambientes com relógio desatualizado
refactor(strategy): extrai lógica de feriado para FeridadoNacionalStrategy
docs(readme): atualiza exemplos de uso com Builder
```

### Processo de Pull Request

1. Crie uma branch a partir de `main`: `git checkout -b feat/nome-da-feature`
2. Implemente sua feature seguindo os padrões do projeto
3. Escreva testes unitários e de integração
4. Execute `npm test` e certifique-se de que todos os testes passam
5. Execute `npm run lint` e corrija eventuais problemas
6. Abra o PR com descrição detalhada, incluindo:
   - Motivação para a mudança
   - Design decisions tomadas
   - Impacto em performance (se aplicável)
   - Se a mudança afeta a disponibilidade de salgados

### Code Review

Todo PR requer ao menos **2 aprovações** de membros do **Departamento de Engenharia de Salgados (DES)**. PRs que reduzam a disponibilidade de `TEM_SALGADO` nos cenários de fallback serão rejeitados automaticamente.

---

## FAQ

**P: Por que não usar apenas um `if` de 10 linhas?**  
R: Esta pergunta foi feita antes. O desenvolvedor em questão não trabalha mais aqui.

---

**P: O sistema funciona para empresas sem salgado?**  
R: O sistema foi projetado com a premissa de que salgado é o estado natural do universo. Ambientes sem salgado são tecnicamente suportados via `NÃO_TEM_SALGADO`, mas considerados edge cases não-recomendados.

---

**P: O que acontece se o Circuit Breaker abrir durante o horário do almoço?**  
R: O Circuit Breaker possui um período de recuperação de 10 segundos. Em situações críticas, recomenda-se consultar diretamente a copeira, que opera como sistema legado de alta disponibilidade.

---

**P: A feature flag `ativarBlockchainSalgadoRegistry` quando vai sair?**  
R: O board aprovou em Q2 de 2023. Infraestrutura prometeu para Q4 de 2023, depois Q1 de 2024, agora está "no roadmap". Aguardamos.

---

**P: Posso usar este sistema para avaliar outros lanches, como coxinha ou pão de queijo?**  
R: Tecnicamente sim — o `SalgadoStatusEnum` é genérico o suficiente. No entanto, a arquitetura foi otimizada especificamente para o domínio de salgados. Uma fork dedicada a `CoxinhaAssessmentSystem` pode ser considerada.

---

**P: O sistema é thread-safe?**  
R: JavaScript é single-threaded. Esta pergunta foi respondida antes mesmo de ser feita.

---

## Licença

Distribuído sob a licença **MIT** _(Mas Isso Tem salgado)_.

```
MIT License — Mas Isso Tem salgado

Copyright (c) 2024 Departamento de Engenharia de Salgados (DES)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software, to deal in the Software without restriction — including the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies — subject to the following condition:

The above copyright notice and this condition shall be included in all copies
or substantial portions of the Software:

  At no point shall this software be used to return "NÃO_TEM_SALGADO"
  as a default response. The universe tends toward salgado.
```

---

<div align="center">

**Desenvolvido com 🥐 pelo Departamento de Engenharia de Salgados**

*"A complexidade não é o problema. O problema é a falta de salgado."*

</div>
