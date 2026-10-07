# Ecossistema do portfólio + Rastro — Design

- **Data:** 2026-10-06
- **Decisões:** Rafael Viotti · redação: Claude Code
- **Status:** aguardando revisão do Rafael (inclui confirmar a abordagem da §4)
- **Mockups:** canvas privado "Rastro — Direção Visual" no claude.ai. Direção escolhida: **A · Telemetry**. Todas as telas de referência estão listadas na §13.

---

## 1. Objetivo

Transformar o portfólio, hoje uma página de afirmações, num conjunto de provas verificáveis que gere contatos de dois públicos:

1. **Vagas remotas** de AI infra, LLMOps e RAG (EUA e Europa). Público primário.
2. **Clientes de freelance**, com uma oferta fechada: auditoria de RAG. Público secundário.

**Métricas de sucesso (mensais):** contatos recebidos por tipo · calls agendadas · estrelas e forks do Rastro · downloads do dataset no Hugging Face. A linha de base começa a ser medida no SP1.

## 2. Regras globais (valem para todo sub-projeto e todo agente)

1. **Nada inventado.** Toda métrica exibida é medida e rastreável a um arquivo, run de CI ou commit. Valor ilustrativo só existe em mockup, com selo visível.
2. **Fatos de carreira** vêm só do CV canônico do Rafael (`cv.md`, fora deste repositório).
3. **Prova social** só real, com nome, link e permissão de quem escreveu.
4. **Textos de privacidade** descrevem exatamente o que é coletado.
5. **Nenhum agente publica sozinho.** Mudança no site passa por PR aprovado pelo Rafael.
6. **Qualidade mínima:** Lighthouse ≥ 95 em performance e acessibilidade em toda página do portfólio; `prefers-reduced-motion` respeitado em tudo.

## 3. Decisões tomadas

| # | Tema | Escolha |
|---|---|---|
| D1 | Projeto-âncora | Demo pública nova de RAG: **Rastro** (nome provisório) |
| D2 | Execução | Híbrido: pipeline reproduzível no repositório + site estático com modos Replay e Ao vivo (no navegador) |
| D3 | Corpus | Legislação brasileira: CF/88 (+ ADCT), CLT, CDC |
| D4 | Onde vive | Repositório e site próprios |
| D5 | Primeira experiência | História guiada (replay) → exploração livre |
| D6 | Lançamento | Só quando estiver completo |
| D7 | Direção visual | A · Telemetry, sem abertura cinematográfica |
| D8 | Ecossistema | Os 20 itens do brainstorm, aprovados integralmente (§5 a §8) |
| D9 | Métricas + agente de crescimento | Delegados ao omp (§9), com as salvaguardas da §9.4 |

## 4. Arquitetura

### Abordagem recomendada: estático + borda Cloudflare (aguardando confirmação)

```
                       rafaelviotti.dev  (DNS Cloudflare)
     ┌─────────────────────────────┬───────────────────────────────┐
     │ Portfólio · Astro           │ rastro.rafaelviotti.dev       │
     │ Cloudflare Pages            │ Vite + Svelte · CF Pages      │
     └──────────────┬──────────────┴───────────────┬───────────────┘
                    │ eventos (sendBeacon)           │ modelos ONNX / WebLLM
                    ▼                                ▼ (CDN do Hugging Face)
     Worker /api ── D1 (eventos) ── Durable Object (presença ao vivo)
                    │
                    └─ API privada ──► omp (painel privado + agente de crescimento)

     GitHub viiotti/rastro: o CI roda o pipeline e publica os traces do
     replay e o relatório de avaliação como release versionada (run id + commit).
```

Os dois sites são estáticos e continuam funcionando com a API fora do ar (**fail-open**).

### Alternativas descartadas

- **GitHub Pages + SaaS** (GoatCounter, Web3Forms): menos peças, mas sem presença ao vivo e sem dados próprios para o agente.
- **Tudo self-hosted na infra do Rafael:** máxima demonstração de ops, mas o site passaria a depender de uma máquina pessoal. Isso contradiz "sistemas que ficam no ar".

## 5. Sub-projetos, donos e ordem

Cada sub-projeto ganha o próprio plano de implementação.

| SP | Nome | Dono | Depende de |
|---|---|---|---|
| SP0 | Higiene urgente do portfólio atual | Claude | — |
| SP1 | Fundação: domínio + Astro + páginas-base | Claude (Rafael: compra do domínio, contas) | SP0 |
| SP2 | Rastro | Claude (Rafael: revisão do gabarito) | — (em paralelo ao SP1) |
| SP3 | Conteúdo: estudos de caso + 2 primeiros artigos | Claude redige, Rafael valida os fatos | SP1, SP2 |
| SP4 | Métricas + painel público de telemetria | omp | SP1 |
| SP5 | Agente de crescimento | omp | SP4 + ≥ 4 semanas de dados |
| SP6 | Lançamento coordenado | Rafael (rascunhos: Claude) | SP1–SP3 |

## 6. SP0 — Higiene urgente (antes de qualquer divulgação)

1. **Service worker:** o `sw.js` atual (cache-first, nome `rv-portfolio-v1` nunca alterado) pode servir o `index.html` antigo, com o conteúdo inventado, a quem já visitou o site.
   - Trocar por um *kill switch* no mesmo caminho: apaga todos os caches, se desregistra e recarrega os clientes.
   - Remover o registro do SW do `index.html`.
   - Depois da migração para o domínio novo, o GitHub Pages antigo continua servindo o kill switch e uma página de redirecionamento por pelo menos 6 meses.
2. **Imagem de compartilhamento** (`og-image.svg`/`.png`): nome correto e posicionamento atual. Hoje mostra "Rafael Viiotti — IA · Automação · QA · Security".
3. **`manifest.json` e `404.html`:** nome, idioma e posicionamento atuais.
4. **Hero sem promessa ainda não cumprida:** remover "measurable evals" e "cost per query" até o Rastro existir, ou reescrever no tempo verbal certo.
5. **Canvas do hero:** adicionar `width:100%; height:100%`. Hoje ele renderiza em 300×150 px.
6. **JS morto:** remover `github.js`, `analytics.js` e `particles.js`.
7. **Arquivos auxiliares:** `sitemap.xml` com lastmod atual; README atualizado; `STATE.md` sem o caminho local.
8. **Ajustes visuais:** contraste de `--ink-3` no tema claro ≥ 4,5:1; pílula do hero sem quebra ruim no mobile.

**Pronto quando:**
- o Lighthouse não regride;
- não sobra nenhum texto do posicionamento antigo;
- um teste com Playwright prova que o kill switch funciona: registra o SW v1, publica o kill switch e confirma que a página nova é servida.

## 7. SP1 — Fundação do portfólio

### 7.1 Domínio
- `rafaelviotti.dev`. A disponibilidade ainda não foi verificada; alternativas: `viotti.dev`, `rviotti.dev`.
- Registro no Cloudflare Registrar. A compra é do Rafael.
- O Rastro fica em `rastro.<domínio>`.

### 7.2 Stack
- Astro com saída estática, ilhas em Svelte, TypeScript.
- Tokens do Telemetry migrados de `style.css` para custom properties compartilhadas com o Rastro.
- Geist + Geist Mono hospedadas no próprio site (woff2, subconjunto latino, 2 pesos cada).

### 7.3 Páginas

| Rota | Conteúdo |
|---|---|
| `/` | Hero com mini-replay do Rastro (~10 s, loop, botão "Abrir demo") → Prova → Trabalho → Escrita recente → Trajetória → Contato duplo |
| `/work/` + `/work/<slug>` | Estudos de caso: Rastro, plataforma RAG self-hosted, plataforma de IA da empresa |
| `/writing/` + `/writing/<slug>` | Artigos técnicos + RSS |
| `/hire` | Contato para vagas |
| `/services` | Auditoria de RAG: prazo [N dias] e preço [FAIXA] a definir pelo Rafael |
| `/now` | O que o Rafael está fazendo agora; atualizada todo mês |
| `/stack` | Stack self-hosted (Qdrant, Ollama, LangFuse…) |
| `/resume` | Já existe; ganha PDF para baixar |
| `/telemetry` | Painel público ao vivo (§9.3) |
| `/privacy` | O que é coletado, por quê, por quanto tempo |

### 7.4 Formato fixo dos estudos de caso
1. Problema
2. Restrições
3. Decisões e trade-offs
4. Diagrama de arquitetura sem dados sensíveis
5. Resultados medidos
6. O que eu faria diferente

O frontmatter tem o campo obrigatório `sources`, que lista a evidência de cada afirmação.

### 7.5 Primeiros artigos (SP3)
1. Medindo custo por query de uma RAG.
2. Postmortem da coleção corrompida.
3. Busca entre idiomas EN → PT.
4. Chunking que respeita a estrutura da lei vs. chunking ingênuo, com números.
5. Meu stack self-hosted.

Os dois primeiros saem antes do lançamento.

### 7.6 Componentes de assinatura

Todos mostram só valores medidos; se um valor não puder ser medido, aparece "—".

- **Paleta ⌘K** para navegação.
- **Relógio de fuso:** usa a API `Intl` para calcular a diferença entre o fuso do visitante e Belo Horizonte (UTC−3) e a sobreposição com o expediente das 09h às 18h.
- **Telemetria no rodapé:** LCP via `PerformanceObserver`, KB transferidos via Resource Timing, e cookies via `document.cookie`.

### 7.7 Contato
- Formulários separados para vaga e para projeto.
  - **Vaga:** nome, empresa, link da vaga, tipo de contrato e link do Cal.com.
  - **Projeto:** problema, prazo e faixa de orçamento.
- Envio para o endpoint do Worker (SP4); até lá, Web3Forms.
- Antispam: campo honeypot e trava de tempo mínimo de preenchimento.
- Fallback para `mailto:`.
- Resposta automática com prazo de retorno.

### 7.8 SEO
- Título e descrição por página.
- Imagem OG gerada no build no estilo Telemetry.
- JSON-LD: Person, Article, SoftwareApplication, Dataset.
- Sitemap, RSS e canonical.
- Redirecionamento do `github.io`.

### 7.9 Analytics base
- Cloudflare Web Analytics, sem cookies, desde o primeiro dia.
- O texto atual "No newsletter, no tracking" é substituído por uma descrição exata, com link para `/privacy`.

### 7.10 Idioma
Inglês no site inteiro. Português só no conteúdo do Rastro.

## 8. SP2 — Rastro

### 8.1 Corpus e ingestão
- **Fonte:** textos compilados oficiais do planalto.gov.br. As URLs exatas são validadas na implementação.
- **Registro de cada texto:** HTML bruto, sha256 e data da coleta.
- **Parser:** gera a hierarquia lei → título → capítulo → seção → artigo → parágrafo → inciso → alínea.
- **IDs estáveis:** `cf88:art7:XVIII`, `clt:art392`, `adct:art10:II:b`.
- **Dispositivos revogados ou vetados:** ficam marcados nos dados e fora do índice.

### 8.2 Chunking
- **Estrutural:** 1 chunk = 1 artigo; incisos longos são divididos mantendo o caput como contexto.
- **Ingênuo, para comparação:** 512 tokens com sobreposição de 64.
- Os dois são avaliados. O vencedor vai para o site; o outro fica no relatório.

### 8.3 Embeddings
- **Candidatos:** `multilingual-e5-small` (384 dimensões, roda no navegador, padrão inicial), `multilingual-e5-base` e `bge-m3` (só servidor).
- Prefixos `query:` / `passage:` do e5.
- A escolha final segue o gabarito (§8.7).

### 8.4 Busca
- **Navegador:** busca exata (força bruta, cosseno) num Web Worker sobre vetores float16 ou int8. São poucos milhares de chunks.
- **Pipeline:** Qdrant (HNSW).
- O relatório mostra os dois.

### 8.5 Rerank
- Cross-encoder multilíngue pequeno, adotado só se o ganho em nDCG@10 compensar a latência.
- Se não compensar no navegador, a etapa existe só no replay, e a interface diz isso.

### 8.6 Geração
- **Replay:** LLM local via Ollama no pipeline.
- **Ao vivo:** WebLLM (WebGPU) com modelo pequeno multilíngue em 4 bits, opcional. O download só começa com o consentimento do visitante, e o tamanho aparece antes.
- **Sem WebGPU:** recuperação + trechos citados, sem geração.
- **Toda afirmação da resposta cita um dispositivo recuperado.**

### 8.7 Gabarito (golden set)
- ~200 perguntas em PT, cada uma com versão em EN e os IDs dos dispositivos corretos.
- Rascunho assistido por LLM; revisão manual do Rafael, registrada no dataset.
- Licença CC BY 4.0, publicado no Hugging Face Datasets.

### 8.8 Métricas
- **Qualidade de recuperação:** recall@5 e @20, MRR@10, nDCG@10.
- **Latência:** p50 e p95 por etapa. No navegador é medida no dispositivo do visitante; no CI, no runner, com o hardware documentado.
- **Tokens** por query.
- **Custo:**
  - $0 marginal no modo navegador;
  - estimativa para APIs hospedadas, com tabela pública de preços datada e citada.
- **Fidelidade:** checagem automática de citações + amostra revisada manualmente.

### 8.9 Traces e procedência
- O pipeline grava spans em JSON no formato OpenTelemetry.
- O CI publica `traces/*.json` e `eval/report.json` numa release com `run_id` e `commit`.
- O site mostra o link para o run.
- Rodando localmente (`docker compose`), os mesmos spans vão para o LangFuse.

### 8.10 Aplicação web (Vite + Svelte 5 + TS)

**Telas:** Replay · Ao vivo · Relatório de avaliação · Como funciona.

**Componentes (do mockup A):**
- Header: modo e selo de procedência.
- StageRail: as 6 etapas, de Question a Answer.
- QueryCard.
- VectorBars.
- EmbeddingMap:
  - UMAP do corpus pré-calculado no pipeline;
  - a consulta nova é posicionada pela média ponderada dos vizinhos, com o rótulo "posição aproximada".
- ResultsList: com marca-texto nos termos casados.
- TraceWaterfall.
- Narration.

**Animação (personalidade Telemetry, precisa como um instrumento):**
- **Tempos:** easing expo-out; elementos de interface entre 150 e 250 ms; revelação de dados entre 600 e 1000 ms; intervalo de 120 ms entre itens.
- **Tempo do replay:** roda em "tempo narrativo", com a opção de alternar para "tempo real" e ver a velocidade verdadeira.
- **Controles:** 0,5× / 1× / 2×, pausar, etapa anterior e próxima.
- **Teclado:** espaço e ←/→, quando o player está em foco.

**Acessibilidade:**
- `prefers-reduced-motion` → transições instantâneas.
- Contraste AA.
- O mapa tem alternativa em tabela.
- A etapa atual é anunciada via `aria-live`.

**Mobile:**
- As etapas viram chips roláveis.
- O mapa é recolhível.
- A geração ao vivo fica desligada por padrão.

**Orçamento de carga:**
- O replay pesa ≤ 300 KB de JS e dados no primeiro carregamento.
- Os modelos só carregam no modo ao vivo.
- O Cloudflare Pages limita cada arquivo a 25 MiB, então os modelos vêm do CDN do Hugging Face. Isso é declarado na página de privacidade do Rastro.

### 8.11 Repositório `viiotti/rastro`
```
pipeline/   Python (uv): ingest/ chunk/ embed/ index/ eval/ trace/
web/        Vite + Svelte 5 + TS
docker-compose.yml   Qdrant + Ollama + LangFuse (execução local)
.github/workflows/   ci.yml · pipeline.yml (manual + semanal) · deploy.yml
docs/       arquitetura, relatório de avaliação
```

### 8.12 Avisos e licenças
- "Não é aconselhamento jurídico", com a data de vigência dos textos.
- Código sob MIT; dataset sob CC BY 4.0.
- Textos legais são de domínio público (Lei 9.610/98, art. 8º, IV).

## 9. SP4/SP5 — Métricas, telemetria pública e agente (dono: omp)

### 9.1 Eventos
```
{ ts, site, path, ref_host, utm, country, device_class,
  event: pageview | cta_click | form_submit | replay_start | replay_complete
         | live_query | model_download,
  session_hash }
```
- `session_hash = sha256(ip + user_agent + site + salt_do_dia)`.
- O salt é rotacionado e descartado a cada 24 h.
- `country` vem do header da Cloudflare.

### 9.2 Presença ao vivo
- Um Durable Object por site.
- Heartbeat a cada 30 s.
- "Agora" = sessões com heartbeat nos últimos 60 s.
- **Limites do plano grátis** (Durable Objects com SQLite, disponíveis no Workers Free desde abril de 2025): 100 mil requisições/dia e 100 mil gravações de linha/dia.
  - Um heartbeat a cada 30 s é 120 requisições por hora de visita. O limite diário cobre ~830 horas de visita por dia.
  - A presença fica em memória no Durable Object; **não se grava uma linha por heartbeat**. Só eventos (§9.1) vão para o D1.

### 9.3 Painel público `/telemetry`
**Mostra:**
- quantas pessoas estão no site agora;
- visitas nos últimos 30 dias e no total;
- fontes principais;
- top 5 países;
- Web Vitals p75;
- o último relatório do agente, com as partes sensíveis tarjadas.

**Não mostra IP algum, nem mascarado.** Mostrar o raciocínio do agente impressiona mais e não expõe ninguém.

Endpoint `GET /api/stats/public`. Os valores abaixo são só exemplo do formato:
```json
{"live":3,"views_30d":1284,"views_total":5321,
 "top_referrers":[{"host":"linkedin.com","views":412}],
 "top_countries":[{"code":"US","views":380}],
 "web_vitals_p75":{"lcp_ms":900,"cls":0.01,"inp_ms":80},
 "agent_report":{"week":"2026-W41","summary_redacted":"…","prs":[{"url":"…","title":"…"}]},
 "updated_at":"2026-10-06T12:00:00Z"}
```

### 9.4 Agente de crescimento: propõe, nunca publica
- Roda uma vez por semana.
- Lê as métricas e escreve um relatório: o que trouxe contatos, quedas, regressões de performance, links quebrados.
- Abre no máximo 3 PRs pequenos. Cada PR cita os dados que o motivaram.
- **Nunca altera** fatos de carreira, métricas exibidas, prova social ou textos de privacidade.
- **Teste A/B** só com amostra mínima calculada antes. Portfólio tem pouco tráfego: sem amostra, sem A/B.

### 9.5 Privacidade (LGPD/GDPR)
- Sem cookies; base legal: interesse legítimo.
- Eventos ficam guardados por 13 meses.
- **IP bruto não é gravado por padrão.** Se o Rafael optar por gravar:
  - só no painel privado;
  - retenção ≤ 30 dias;
  - declarado em `/privacy`;
  - nunca exposto em endpoint público.

### 9.6 Falhas
- Beacons com timeout, sem bloquear a renderização.
- O painel mostra `updated_at` e escreve "sem dados" em vez de exibir números velhos.

## 10. Testes

- **Pipeline:**
  - pytest: parser com fixtures de artigos reais, chunker e métricas com casos de resultado conhecido;
  - checagem de reprodutibilidade pelo hash do índice.
- **Rastro web:**
  - vitest para a lógica;
  - Playwright para o fluxo do replay, o modo ao vivo com modelo simulado, reduced-motion e mobile;
  - regressão visual por screenshots.
- **Portfólio:**
  - Lighthouse CI (≥ 95);
  - checagem de links e validação de JSON-LD;
  - teste do kill switch do service worker.

## 11. Pendências do Rafael

1. Confirmar a abordagem de arquitetura (§4).
2. Domínio: verificar disponibilidade e comprar.
3. Nome definitivo do Rastro.
4. Prazo e faixa de preço da auditoria de RAG.
5. Pedidos de recomendação no LinkedIn.
6. Revisar o gabarito; o tamanho da amostra é definido no plano do SP2.
7. Contas: Cloudflare, Hugging Face, Cal.com.
8. Gravar ou não IP bruto no painel privado (§9.5).
9. Opcional: renomear o repositório `portifolio` → `portfolio` (o GitHub redireciona).

## 12. Fora de escopo, por ora

Versão em português do portfólio · newsletter · palestras · A/B automatizado sem tráfego suficiente · outros conjuntos de documentos no Rastro.

## 13. Design de referência (canvas)

Telas validadas renderizando no runtime real do editor, no desktop e, nas páginas, também a 390 px.

| Grupo | Tela | Mostra |
|---|---|---|
| Rastro | Replay · Retrieve (A · Telemetry) | Mapa de embeddings, top 5 por cosseno, waterfall parcial |
| Rastro | Replay · Rerank | Gráfico de mudança de posição (antes → depois), novo top 5 |
| Rastro | Replay · Answer | Resposta com citações agrupadas, fontes, waterfall completo com TTFT, custo no dispositivo e em API |
| Rastro | Live | Pergunta livre, consentimento para baixar o modelo, onde cada etapa roda, medição no dispositivo |
| Rastro | Evaluation report | Tabela de configurações, recall@k, recall por lei, exemplos de falha |
| Rastro | Mobile replay | Chips de etapa, mapa recolhível, player fixo no rodapé |
| Portfólio | Home | Hero com prévia do Rastro, métricas verificáveis, trabalho, escrita, trajetória, contato duplo |
| Portfólio | Contact | Abas vaga/projeto (interativas), relógio de fuso calculado ao vivo |
| Portfólio | Telemetry | Ao vivo, visitas, fontes, Web Vitals, relatório do agente tarjado |
| Portfólio | Case study | Formato fixo da §7.4, decisões com custo, arquitetura offline/online |

Os números das telas são ilustrativos e todas trazem o selo "Mockup · illustrative values". Os textos legais são reais.

### Cores validadas
Validadas com o script do skill de visualização: banda de luminosidade, croma, separação para daltonismo e contraste sobre a superfície escura.

- **Destaque (marca):** `#00d4aa`. Usado só para a pergunta e para a interface, nunca como categoria.
- **Fontes nos mapas:** CF/88 `#3a8ee0`, CLT `#c47a00`, CDC `#c056a8`. Comparando todos os pares, a pior separação para daltonismo é ΔE 9,7 (meta: ≥ 8).
- **Séries do relatório:** `#00a385`, `#8a63e8`, `#d0603a`. Comparando pares adjacentes, a pior separação para daltonismo é ΔE 19,3.

As cores das fontes legais valem em todas as telas: a mesma lei tem sempre a mesma cor.
