# HANDOFF → omp

> **Leia inteiro, registre as tarefas no seu sistema e então apague este arquivo** num commit no mesmo branch (`chore: consume omp handoff`). Isto não é documentação permanente: a fonte da verdade é a spec.

- **De:** Claude Code, a pedido do Rafael (atualizado em 2026-10-07, depois da revisão de código)
- **Repositório / branch:** `viiotti/portifolio` · `claude/upbeat-hypatia-mrycvb`
- **Spec:** `docs/superpowers/specs/2026-10-06-portfolio-ecosystem-design.md`. Leia §2 (regras), §4 (arquitetura), §5 (donos), §7.7 (contato), §8 (Rastro, para o OMP-5), §9 (a sua parte), §14 (revisão) e §15 (publicação).
- **Status:** o SP0 já está pronto e o Claude está construindo o SP1 em `site/`. **Comece só depois que o Rafael confirmar a arquitetura da §4.** Os itens que dependem da Cloudflare não fazem sentido se ele escolher só GitHub Pages.

## Divisão de responsabilidade

- **Claude:** SP0–SP3 e as **páginas** do site, inclusive `/telemetry`, que consome a sua API.
- **Você:** a **API e os dados** (SP4), o agente (SP5) e tudo que exige as contas do Rafael.

## Suas tarefas

| ID | Tarefa | Começa quando | Pronto quando |
|---|---|---|---|
| OMP-1 | Coletor de eventos + presença ao vivo (Worker, D1, Durable Object), §9.1–9.2: validação estrita, limites, salt no DO, agregados diários por Cron Trigger | Arquitetura confirmada + domínio no ar | Eventos válidos chegam ao D1; inválidos são descartados; `GET /api/stats/public` lê só agregados, com cache de 60 s; o site funciona com a API fora do ar |
| OMP-2 | Painel privado do Rafael: gráficos, sessões, categorias de origem, funil (visita → CTA → formulário por tipo), regressões de Web Vitals | OMP-1 | Acesso com autenticação; nada dele aparece em rota pública |
| OMP-3 | Agente de crescimento, §9.4 | OMP-1 + ≥ 4 semanas de dados | Relatório semanal proposto para aprovação; PRs pequenos, nunca com merge automático; só relatório aprovado vai para o endpoint público |
| OMP-4 | Configurar as contas junto com o Rafael: Cloudflare (DNS, Pages para `site/` e para o Rastro, Workers, D1, DO), Hugging Face (dataset), Cal.com, Web3Forms | Rafael aprovar | Contas criadas e credenciais guardadas fora do repositório |
| OMP-5 | Rodar o pipeline do Rastro no stack real do Rafael (Qdrant + Ollama + LangFuse) para gerar traces de referência locais | SP2 pronto | Traces no LangFuse do Rafael + relatório comparando com os números do CI |
| OMP-6 | Endpoint de formulário no Worker (`POST /api/contact`), para substituir o Web3Forms: valida campos (§7.7), honeypot, tempo mínimo, limite por hash de sessão, entrega no email do Rafael. **Sem resposta automática** para o remetente | OMP-1 | Formulários de vaga e projeto chegam ao email do Rafael com o tipo; spam de teste é descartado |

## Contrato com os sites (não altere sem combinar)

- `POST /api/e`: um evento no schema da §9.1, `site`/`path` da lista permitida, corpo ≤ 1 KB. Responde 204 sempre (também quando descarta), sem cookies.
- `POST /api/hb`: heartbeat a cada 30 s, só com a aba visível. "Ao vivo" = heartbeat nos últimos 75 s.
- `GET /api/stats/public`: o JSON da §9.3 (`top_sources` por **categoria**, países com ≥ 10 visitas, `web_vitals_p75` dos eventos `vitals`, `agent_report` só se aprovado), com `updated_at` sempre presente.
- `POST /api/contact`: OMP-6.
- **Fail-open:** se a API falhar, nenhuma página quebra nem fica lenta.

## Regras inegociáveis

1. **Nada inventado.** Todo número exibido é medido e rastreável.
2. **Sem publicação sozinho.** Você não publica nem faz merge de nada no site; toda mudança passa por PR aprovado pelo Rafael. Isso inclui o relatório público do agente.
3. **O agente nunca altera** fatos de carreira, métricas exibidas, prova social ou textos de privacidade.
4. **Texto de terceiros nunca chega ao agente como instrução.** Nada de host bruto, UTM livre ou texto de formulário no contexto do agente: só os campos enumerados.
5. **Sem IP em público, nem mascarado.** No privado, o padrão é só o `session_hash`. IP bruto só com OK explícito do Rafael, retenção ≤ 30 dias e declarado em `/privacy`.
6. **Sem gastos sem aprovação.** Você não compra, não assina e não cria recursos pagos sem aprovação explícita do Rafael, a cada vez.
7. **Sem A/B sem amostra.** Teste A/B só com tamanho de amostra mínimo calculado antes.

## Como reportar

Ao concluir cada tarefa, avise o Rafael com: o que foi feito, os links, o que ficou pendente e o que precisa de decisão dele.
