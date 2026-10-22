// Every fact on the site comes from this file. Sources: the canonical CV v2
// (F-CV-001..030) as published on main in e4b71f3, the Mother / Hermes
// showcase (tanya-showcase/README.md) and the résumé. Nothing here may be added without
// a source.

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Prefix an internal path with the deploy base (`/portifolio` on GitHub Pages). */
export const href = (path: string): string => `${base}${path.startsWith('/') ? path : `/${path}`}`;

export const person = {
  name: 'Rafael Viotti',
  role: 'AI Engineer',
  focus: 'Infrastructure · RAG · LLMOps',
  email: 'rafaelviotti@gmail.com',
  github: 'https://github.com/Viiotti',
  githubLabel: 'github.com/Viiotti',
  linkedin: 'https://www.linkedin.com/in/rafael-viotti-86364b1a1',
  linkedinLabel: 'in/rafael-viotti',
  location: 'Belo Horizonte, Brazil',
  timeZone: 'America/Sao_Paulo',
} as const;

export const nav = [
  { label: 'Work', path: '/#work' },
  { label: 'About', path: '/about/' },
  { label: 'Now', path: '/now/' },
  { label: 'Stack', path: '/stack/' },
  { label: 'Résumé', path: '/resume/' },
] as const;

/**
 * Mother / Hermes. Qualitative on purpose (v2 governance): structural
 * capabilities, not point-in-time counters.
 */
export const platform = {
  name: 'Mother / Hermes',
  collections: 'Multi-Domain',
  dims: '768d',
  embedder: 'nomic-embed-text',
  externalEmbeddingCalls: '0',
} as const;

export const metrics = [
  { value: platform.collections, label: 'isolated vector collections' },
  { value: platform.dims, label: `local ${platform.embedder} vectors` },
  { value: platform.externalEmbeddingCalls, label: 'external embedding API calls' },
  { value: '6 mo', label: "sole architect of a company's AI platform" },
  { value: '~4 y', label: 'systems & reliability foundation' },
] as const;

export const now = {
  updated: 'October 2026',
  items: [
    {
      title: 'Mother / Hermes',
      body: 'My self-hosted subagentic RAG and long-term memory platform: local embeddings, read-only MCP memory bridges, self-hosted LangFuse tracing and bounded depth-one subagents.',
    },
    {
      title: 'A retrieval benchmark',
      body: 'The measurement layer most RAG systems never get: golden sets, recall@k, latency percentiles and cost per query. Brazilian Portuguese first, because that is where the gap between what is asserted and what is measured is widest. Not public yet.',
    },
    {
      title: 'Autonomous marketing systems',
      body: 'Independent work combining AI automation with paid-traffic operation.',
    },
    {
      title: 'Study',
      body: 'Systems Analysis & Development at PUC Minas (2026–2028), and preparing for the CKA exam (not taken yet).',
    },
  ],
} as const;

export const path = [
  { when: 'Jan 2019 — Jan 2020', role: 'Apprentice — Computer maintenance', org: 'Alongside a technical degree', points: ['Hardware diagnosis, repair and maintenance on desktop systems.'] },
  { when: 'Feb 2020 — Jan 2021', role: 'IT Technician N2', org: 'Feluma', points: ['Local and field-based technical support.', 'Diagnosed workstation, connectivity and infrastructure issues.'] },
  { when: 'Jul 2024 — Jun 2025', role: 'NOC network monitoring analyst', org: 'Hyti · contracted to SADA Transportes', points: ['Monitored and analysed the SADA Transportes network infrastructure.', 'Investigated network health, availability and monitoring signals.'] },
  { when: 'Jul 2025 — Oct 2025', role: 'Observability & integrity security analyst', org: 'Ana Gaming', points: ['Python/Bash automations for observability routines, log processing and L1/L2 incident mitigation.', 'Analytical queries for telemetry, integrity analysis and automated incident detection in 24/7 critical systems.'] },
  { when: 'Feb 2026 — Jul 2026', role: 'Senior AI Engineer · contract', org: 'MaxStartup — 6-month engagement', points: ["Sole architect and developer of the company's AI integrations.", 'Multi-agent knowledge system: trust-tiered knowledge, retrieval, autonomous workflows.'] },
  { when: 'Ongoing', role: 'Independent — AI systems & software', org: 'Freelance', points: ['Applied research on resilient multi-agent architectures and recovery infrastructure (Mother / Hermes).', 'Websites, applications and SaaS combining automation and local LLM integrations via Python and MCP.'], current: true },
] as const;
