# HANDOFF → omp

> **Leia inteiro, registre as tarefas no seu sistema e então apague este arquivo** num commit no mesmo branch (`chore: consume omp handoff`). Isto não é documentação permanente: a fonte da verdade é a spec.

- **De:** Claude Code (sessão de 2026-10-06), a pedido do Rafael
- **Repositório / branch:** `viiotti/portifolio` · `claude/upbeat-hypatia-mrycvb`
- **Spec:** `docs/superpowers/specs/2026-10-06-portfolio-ecosystem-design.md`. Leia as seções §2 (regras globais), §4 (arquitetura), §5 (donos e ordem) e §9 (a sua parte).
- **Status:** a spec aguarda revisão do Rafael. **Não comece nenhuma implementação antes de ele aprovar**, porque a abordagem da §4 ainda não foi confirmada.

## Contexto em 5 linhas

1. O portfólio vira um conjunto de páginas focado em gerar contatos de dois públicos: vagas remotas de AI infra e freelance de auditoria de RAG.
2. O projeto-âncora é o **Rastro**, uma demo pública de "RAG transparente" sobre a legislação brasileira, num repositório próprio.
3. A arquitetura recomendada é: sites estáticos no Cloudflare Pages + um Worker `/api` + D1 + Durable Object.
4. O Claude cuida dos sub-projetos SP0 a SP3 (higiene, fundação, Rastro, conteúdo).
5. **Você cuida do SP4 (métricas e telemetria) e do SP5 (agente de crescimento)**, e de tudo que exige as contas ou a infraestrutura do Rafael.

## Suas tarefas

| ID | Tarefa | Começa quando | Pronto quando |
|---|---|---|---|
| OMP-1 | Coletor de eventos + presença ao vivo (Worker, D1, Durable Object) conforme spec §9.1–9.2 | SP1 com domínio no ar | Eventos chegam ao D1; `GET /api/stats/public` responde no formato da §9.3; o site continua funcionando com a API fora do ar |
| OMP-2 | Painel privado do Rafael: gráficos, sessões, fontes, funil (visita → CTA → formulário), regressões de Web Vitals | OMP-1 | O Rafael acessa com autenticação; nada dele aparece em rota pública |
| OMP-3 | Agente de crescimento, conforme §9.4 | OMP-1 + ≥ 4 semanas de dados | Relatório semanal gerado; PRs pequenos abertos para revisão, nunca com merge automático |
| OMP-4 | Configurar as contas junto com o Rafael: Cloudflare (DNS, 2 projetos Pages, Workers, D1, DO), Hugging Face (dataset), Cal.com | Rafael aprovar a spec | Contas criadas e credenciais guardadas fora do repositório |
| OMP-5 | Rodar o pipeline do Rastro no stack real do Rafael (Qdrant + Ollama + LangFuse) para gerar traces de referência locais | SP2 pronto | Traces no LangFuse do Rafael + relatório comparando com os números do CI |

## Contrato com os sites (não altere sem combinar)

- `POST /api/e`: um evento no schema da §9.1. Responde 204, sem cookies, com CORS liberado só para os dois domínios.
- `POST /api/hb`: heartbeat a cada 30 s. "Ao vivo" = sessões com heartbeat nos últimos 60 s.
- `GET /api/stats/public`: o JSON da §9.3, com `updated_at` sempre presente.
- **Fail-open:** se a API falhar, nenhuma página quebra nem fica lenta.

## Regras inegociáveis

1. **Nada inventado.** Todo número exibido é medido e rastreável.
2. **Sem publicação sozinho.** Você não publica nem faz merge de nada no site; toda mudança passa por PR aprovado pelo Rafael.
3. **O agente nunca altera** fatos de carreira, métricas exibidas, prova social ou textos de privacidade.
4. **Sem IP em público.** Nenhum IP aparece em rota pública, nem mascarado. No privado, o padrão é só o `session_hash` com salt diário. IP bruto só com OK explícito do Rafael, retenção ≤ 30 dias e declarado em `/privacy` (§9.5).
5. **Sem gastos sem aprovação.** Você não compra, não assina e não cria recursos pagos sem aprovação explícita do Rafael, a cada vez.
6. **Sem A/B sem amostra.** Teste A/B só com tamanho de amostra mínimo calculado antes.

## Nota sobre o pedido original do Rafael

O Rafael pediu um painel com "contagem de quem está vendo agora e total, gráficos, logs e IP" e uma parte pública tarjada demonstrando isso.

A recomendação, já registrada na spec, é dividir assim:
- **Parte pública (`/telemetry`):** agregados ao vivo + o relatório do agente com as partes sensíveis tarjadas.
- **IPs e logs:** só no painel privado.

Mostrar IPs, mesmo tarjados, sinaliza coleta invasiva para recrutadores e esbarra na LGPD. Já o raciocínio do agente demonstra a capacidade sem expor ninguém.

## Como reportar

Ao concluir cada tarefa, avise o Rafael com: o que foi feito, os links, o que ficou pendente e o que precisa de decisão dele.
