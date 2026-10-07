# Ecossistema do portfólio + Rastro — Design

- **Data:** 2026-10-06
- **Decisões:** Rafael Viotti · redação: Claude Code
- **Status:** SP0 concluído (commit `45e2427`). SP1 em implementação em `site/`. Revisão de código de 2026-10-07 aplicada (§14). A abordagem da §4 ainda aguarda confirmação do Rafael; o SP1 é construído de forma que sirva às duas opções de hospedagem.
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
| SP1 | Fundação: Astro + páginas-base (domínio depois) | Claude (Rafael: domínio, contas, ativar Pages via Actions) | SP0. Publicação: Pages via GitHub Actions (1 clique do Rafael) ou Cloudflare Pages (OMP-4) |
| SP2 | Rastro | Claude (Rafael: revisão do gabarito) | — (em paralelo ao SP1) |
| SP3 | Conteúdo: estudos de caso + 2 primeiros artigos | Claude redige, Rafael valida os fatos | SP1, SP2 |
| SP4 | Métricas + painel público de telemetria | omp | SP1 |
| SP5 | Agente de crescimento | omp | SP4 + ≥ 4 semanas de dados |
| SP6 | Lançamento coordenado | Rafael (rascunhos: Claude) | SP1–SP3 |

## 6. SP0 — Higiene urgente (antes de qualquer divulgação)

1. **Service worker:** o `sw.js` atual (cache-first, nome `rv-portfolio-v1` nunca alterado) pode servir o `index.html` antigo, com o conteúdo inventado, a quem já visitou o site.
   - Trocar por um *kill switch* no mesmo caminho: apaga **só os caches `rv-portfolio-*`** (a origem `viiotti.github.io` é compartilhada com outros sites do usuário), se desregistra e recarrega os clientes.
   - Remover o registro do SW do `index.html`.
   - Depois da migração para o domínio novo, o GitHub Pages antigo continua servindo o kill switch e uma página de redirecionamento por pelo menos 6 meses.
   - **Não renomear o repositório** nesse período: o GitHub redireciona git e web, mas não as URLs de site de projeto do Pages. O kill switch deixaria de ser servido.
2. **Imagem de compartilhamento** (`og-image.svg`/`.png`): nome correto e posicionamento atual. Hoje mostra "Rafael Viiotti — IA · Automação · QA · Security".
3. **`manifest.json` e `404.html`:** nome, idioma e posicionamento atuais.
4. **Sem promessa ainda não cumprida:** remover "measurable evals" e "cost per query" do hero, de `og:description` e de `twitter:description` até o Rastro existir.
5. **Canvas do hero:** adicionar `width:100%; height:100%`. Hoje ele renderiza em 300×150 px.
6. **JS morto:** remover `github.js`, `analytics.js` e `particles.js`.
7. **Arquivos auxiliares:** `sitemap.xml` com lastmod atual; README atualizado; `STATE.md` sem o caminho local.
8. **Ajustes visuais:** contraste de `--ink-3` ≥ 4,5:1 **nos dois temas** (o escuro, padrão, também falhava: 3,49:1); pílula do hero sem quebra ruim no mobile.
9. **Documentos internos fora do Pages:** `_config.yml` exclui `README.md`, `docs/`, `site/` e o handoff (o Jekyll publicaria os `.md` como páginas).

**Pronto quando:**
- o Lighthouse não regride;
- não sobra nenhum texto do posicionamento antigo;
- um teste com Playwright prova que o kill switch funciona: registra o SW v1, publica o kill switch e confirma que a página nova é servida.

**Concluído** no commit `45e2427`:
- Kill switch testado no Chromium: o cache `rv-portfolio-v1` some, um cache de outro app permanece, o registro é removido e a página recarrega na versão nova.
- Lighthouse mobile: 100 / 100 / 100 / 100. Ao dimensionar o canvas corretamente, o custo por quadro subiu; a animação foi otimizada (TBT de 400 ms para 0–30 ms).
- axe-core: zero violações WCAG A/AA na home, no 404 e no currículo, nos temas claro e escuro, a 1440 e 390 px.

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
| `/` | Hero com mini-replay do Rastro (toca uma vez, ≤ 10 s, com botão de pausa; sem `aria-live`; WCAG 2.2.2) → Prova → Trabalho → Escrita recente → Trajetória → Contato duplo |
| `/work/` + `/work/<slug>` | Estudos de caso: Rastro, plataforma RAG self-hosted, plataforma de IA da empresa |
| `/writing/` + `/writing/<slug>` | Artigos técnicos + RSS |
| `/hire` | Contato para vagas |
| `/services` | Auditoria de RAG: prazo [N dias] e preço [FAIXA] a definir pelo Rafael |
| `/now` | O que o Rafael está fazendo agora; atualizada todo mês |
| `/stack` | Stack self-hosted (Qdrant, Ollama, LangFuse…) |
| `/resume` | Já existe; ganha PDF para baixar |
| `/telemetry` | Painel público ao vivo (§9.3) |
| `/privacy` | O que é coletado, por quê, por quanto tempo |

**Página sem conteúdo real não é publicada.** `/services` (falta prazo e preço), `/writing` (sem artigos), `/telemetry` (falta a API do SP4) e `/work/rastro` (falta o Rastro) ficam como rascunho fora do build até terem conteúdo. O mini-replay da home só aparece quando o Rastro existir.

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
- Formulários separados para vaga e para projeto. **Os dois pedem nome e email** (sem email não há como responder).
  - **Vaga:** nome, email de trabalho, empresa, tipo de contrato, link da vaga (opcional), mensagem; link do Cal.com.
  - **Projeto:** nome, email, problema, prazo e faixa de orçamento.
- Envio: Web3Forms (chave de acesso fornecida pelo Rafael via variável de build); depois, endpoint do Worker (OMP-6).
- Antispam: campo honeypot e trava de tempo mínimo de preenchimento.
- Fallback para `mailto:` quando não há chave ou o envio falha.
- **Sem resposta automática por email:** no plano grátis do Web3Forms não existe, e um autoresponder aberto pode ser usado para mandar spam a terceiros. A confirmação aparece na própria página, com o prazo de retorno.

### 7.8 SEO
- Título e descrição por página.
- Imagem OG gerada no build no estilo Telemetry.
- JSON-LD: Person, Article, SoftwareApplication, Dataset.
- Sitemap, RSS e canonical.
- Redirecionamento do `github.io`.

### 7.9 Analytics base
- Cloudflare Web Analytics, sem cookies, quando a hospedagem for a Cloudflare (ou o token for fornecido). Até lá, nenhum analytics, e `/privacy` diz exatamente isso.
- O texto atual "No newsletter, no tracking" é substituído por uma descrição exata, com link para `/privacy`.

### 7.10 Idioma
Inglês no site inteiro. Português só no conteúdo do Rastro.

## 8. SP2 — Rastro

### 8.1 Corpus e ingestão
- **Fonte:** textos compilados oficiais do planalto.gov.br. As URLs exatas são validadas na implementação.
- **Registro de cada texto:** HTML bruto, sha256 e data da coleta.
- **Parser:** gera a hierarquia lei → título → capítulo → seção → subseção → artigo → (caput | parágrafo) → inciso → alínea → item.
- **IDs estáveis**, com gramática fixa:
  ```
  <lei>:art<N>[-<sufixo>]:<caput|p<N>|pu>[:<inciso romano>][:<alínea>][:<item>]
  ```
  - `cf88:art7:caput:XVIII`, `cf88:art14:caput:I` ≠ `cf88:art14:p3:I`, `clt:art392-a:caput`, `cf88:art5:pu` (parágrafo único), `adct:art10:caput:II:b`.
  - Sufixo de artigo em minúsculas (`392-a`). Teste de unicidade no CI: dois dispositivos diferentes nunca recebem o mesmo ID.
- **Dispositivos revogados ou vetados:** ficam marcados nos dados e fora do índice.

### 8.2 Chunking
- **Orçamento de tokens:** medido com o tokenizer do próprio modelo de embedding. O e5 aceita no máximo 512 tokens, já contando o prefixo `passage: ` e os tokens especiais. Teto de conteúdo: **480 tokens** por chunk.
- **Estrutural:** 1 chunk = 1 artigo quando cabe no teto. Quando não cabe (ex.: CF/88 art. 5º, art. 7º), o artigo é dividido **em fronteiras de inciso**, agrupando incisos consecutivos até o teto; cada parte leva o caput e o caminho hierárquico como contexto. Nenhum texto é truncado: o CI falha se algum chunk passar do teto.
- **Ingênuo, para comparação:** janelas de 480 tokens de conteúdo com sobreposição de 64, mesmo tokenizer.
- Cada chunk guarda a lista de IDs de dispositivos que contém (inteiros ou em parte).
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
- **Ao vivo:** WebLLM (WebGPU) com modelo pequeno multilíngue em 4 bits, opcional.
- **Todo download de modelo pede consentimento**, inclusive o de embedding (~100 MB+) e o do reranker: o tamanho aparece antes, e nada é baixado só por abrir o modo ao vivo.
- **Sem WebGPU:** recuperação + trechos citados, sem geração.
- **Toda afirmação da resposta cita um dispositivo recuperado.**

### 8.7 Gabarito (golden set)
- ~200 perguntas em PT, cada uma com versão em EN e os IDs dos dispositivos corretos.
- Rascunho assistido por LLM; revisão manual do Rafael, registrada no dataset.
- Licença CC BY 4.0, publicado no Hugging Face Datasets.

### 8.8 Métricas
- **Definição de acerto:** cada pergunta tem um ou mais IDs corretos. Um chunk recuperado é um acerto se a sua lista de dispositivos contém algum ID correto ou um ancestral direto dele (ex.: o chunk do art. 7º inteiro acerta `cf88:art7:caput:XVIII`). A mesma regra vale para chunking estrutural e ingênuo; o código da regra é um módulo único, testado.
- **Qualidade de recuperação:** recall@5 e @20, MRR@10, nDCG@10 (relevância binária, pelo primeiro chunk acertado).
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
- Os modelos só carregam no modo ao vivo, e só depois do consentimento (§8.6).
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
{ ts, site, path, ref_category, utm_source, country, device_class,
  event: pageview | cta_click | form_submit | replay_start | replay_complete
         | live_query | model_download | vitals,
  form?: hire | project,                       (só em form_submit)
  vitals?: { lcp_ms, inp_ms, cls },            (só em vitals, 1 por pageview, amostrado)
  session_hash }
```
- **Validação no Worker:** schema estrito; `site` e `path` em lista permitida (gerada no build); `event`, `form`, `device_class` e `ref_category` são enums; `utm_source` limitado a `[a-z0-9_-]{1,32}`; corpo ≤ 1 KB. Evento inválido é descartado (204, sem detalhe).
- **Sem texto livre de terceiros:** o referrer vira categoria (`linkedin`, `github`, `search`, `social`, `hn`, `direct`, `other`) no Worker; o host bruto nunca é gravado. Isso também impede que texto de atacante chegue ao agente (injeção de prompt).
- **Limites:** no máximo 30 eventos por `session_hash` por hora; bots descartados por user agent e pelo header de bot da Cloudflare; visitas do Rafael marcadas por uma opção local (`localStorage`) e ignoradas; Lighthouse CI e Playwright mandam um header que o Worker descarta.
- `session_hash = sha256(ip + user_agent + site + salt_do_dia)`.
- **Salt:** 32 bytes aleatórios gerados e guardados no storage de um Durable Object, trocados à meia-noite UTC; o anterior é **apagado**. Nunca derivado de um segredo (um salt recomputável permitiria reverter os hashes para IPs).
- `country` vem do header da Cloudflare.
- **Agregação:** um Cron Trigger diário grava tabelas de agregados (visitas por dia, por categoria, por país, p75 de vitals). Os agregados não são dados pessoais e ficam para sempre; eventos brutos, 13 meses.

### 9.2 Presença ao vivo
- Um Durable Object por site (lista fixa; `site` desconhecido é rejeitado, então ninguém cria objetos novos).
- Heartbeat a cada 30 s **só com a aba visível**; para em `visibilitychange` oculto e depois de 10 min sem interação. "Agora" = abas visíveis com heartbeat nos últimos 75 s.
- **Limites do plano grátis** (Durable Objects com SQLite, disponíveis no Workers Free desde abril de 2025): 100 mil requisições/dia e 100 mil gravações de linha/dia.
  - Cada heartbeat também conta no limite de **100 mil requisições/dia do Workers Free, que é da conta inteira** (eventos, estatísticas e formulários dividem a mesma cota).
  - Orçamento: 120 heartbeats por hora de aba visível. Com o limite de 10 min ociosos, uma aba esquecida custa no máximo ~20 requisições.
  - Se a cota acabar, o site continua funcionando (fail-open) e o formulário cai para `mailto:`.
  - A presença fica em memória no Durable Object; **não se grava uma linha por heartbeat**. Só eventos (§9.1) vão para o D1.

### 9.3 Painel público `/telemetry`
**Mostra:**
- quantas pessoas estão no site agora;
- visitas nos últimos 30 dias e no total;
- fontes principais, **só por categoria** (LinkedIn, GitHub, busca, direto, outros), nunca o host: um host como `empresa.myworkdayjobs.com` revelaria quem está avaliando o Rafael;
- top 5 países, cada linha só aparece com **≥ 10 visitas** no período (o resto vira "outros");
- Web Vitals p75 (eventos `vitals`);
- o último relatório do agente **aprovado pelo Rafael**.

**Não mostra IP algum, nem mascarado.** O relatório só vai ao ar depois de aprovado: o agente o propõe num PR (ou marca como pendente no banco), e o endpoint só serve relatórios com `approved_by` preenchido.

**Custo:** o endpoint lê só as tabelas de agregados e o Durable Object de presença, com cache de 60 s (Cache API). Nenhuma requisição varre a tabela de eventos brutos.

Endpoint `GET /api/stats/public`. Os valores abaixo são só exemplo do formato:
```json
{"live":3,"views_30d":1284,"views_total":5321,
 "top_sources":[{"category":"linkedin","views":412}],
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
- Eventos brutos ficam guardados por 13 meses; agregados diários, sem prazo (não identificam ninguém).
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
9. **Não renomear o repositório** enquanto o kill switch for necessário (§6.1).
10. O repositório é público: `docs/` e `HANDOFF_OMP.md` ficam visíveis no GitHub, mesmo fora do Pages. Decidir se os documentos internos vão para um repositório privado.
11. Chave do Web3Forms (formulários) e link do Cal.com.
12. Dar o clique que troca a origem do GitHub Pages para "GitHub Actions" quando quiser publicar o site novo (§15).

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

## 14. Revisão de código (2026-10-07)

Duas rodadas de `/code-review` encontraram cerca de 20 problemas distintos. Onde cada um foi resolvido:

| Problema | Resolução |
|---|---|
| Nada implementado; SP0 urgente parado | SP0 implementado e validado (§6) |
| Kill switch apagaria caches de todos os sites do `viiotti.github.io` | Só `rv-portfolio-*` (§6.1, `sw.js`) |
| Renomear o repositório quebraria o kill switch | Proibido no período (§6.1, §11.9) |
| `og:description`/`twitter:description` mantinham a promessa | Corrigidos (§6.4) |
| Contraste do tema escuro também falhava | Corrigido nos dois temas (§6.8) |
| Spec e handoff seriam publicados no Pages | `_config.yml` (§6.9); repositório público em §11.10 |
| Chunks acima de 512 tokens truncados | Teto de 480 tokens, divisão por incisos (§8.2) |
| IDs ambíguos (parágrafos, subseção, sufixos) | Gramática fixa e teste de unicidade (§8.1) |
| Acerto de recuperação indefinido | Regra única por lista de dispositivos (§8.8) |
| Download do modelo de embedding sem consentimento | Consentimento para todo modelo (§8.6) |
| Mini-replay em loop sem pausa (WCAG 2.2.2) | Toca uma vez, com pausa, sem `aria-live` (§7.3) |
| Formulários sem email; resposta automática inviável e abusável | Email obrigatório; confirmação na página (§7.7) |
| Schema sem vitals e sem tipo de formulário | Evento `vitals` e campo `form` (§9.1) |
| `/api/e` sem validação nem limites; injeção de prompt no agente | Schema estrito, enums, limites, sem texto livre (§9.1) |
| Salt diário sem lugar definido ou reversível | Aleatório, guardado e apagado no Durable Object (§9.1) |
| Endpoint público varrendo eventos brutos | Agregados diários + cache de 60 s (§9.3) |
| `views_total` caindo com a retenção | Agregados sem prazo (§9.5) |
| Cota de 100 mil requisições do Workers ignorada | Heartbeat só com aba visível, limite ocioso, fail-open (§9.2) |
| Hosts de referência expondo empresas | Só categorias e limiar mínimo (§9.3) |
| Relatório do agente público sem aprovação | Só relatórios aprovados (§9.3) |
| Handoff sem dono para formulário e `/telemetry` | OMP-6 e divisão de responsabilidade no handoff |

## 15. Publicação do site novo (SP1)

O site novo fica em `site/` (Astro) e não substitui o atual até o Rafael decidir:

1. **GitHub Pages:** em *Settings › Pages › Source*, trocar para **GitHub Actions**. O workflow `site.yml` constrói `site/` e publica em `viiotti.github.io/portifolio/`. O `sw.js` (kill switch) vai junto, no mesmo caminho.
2. **Cloudflare Pages + domínio:** OMP-4 cria o projeto apontando para `site/`, com `SITE_URL` e `SITE_BASE=/`. O GitHub Pages antigo continua servindo o kill switch e um redirecionamento por 6 meses.

Enquanto nada disso acontece, o Pages segue publicando o site atual (já corrigido pelo SP0) direto do branch.
