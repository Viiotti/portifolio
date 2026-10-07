// Every fact on the site comes from this file. Sources: the canonical CV
// (`cv.md`, outside this repository) as already published on the current site
// and résumé, commits f67e2b7 and 032580b. Nothing here may be added without
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
  { label: 'Now', path: '/now/' },
  { label: 'Stack', path: '/stack/' },
  { label: 'Résumé', path: '/resume/' },
] as const;

/** Runtime-verified figures from the self-hosted platform (commit f67e2b7). */
export const metrics = [
  { value: '20', label: 'vector collections I operate' },
  { value: '16,005', label: 'indexed points, self-hosted' },
  { value: '0', label: 'external embedding API calls' },
  { value: '6 mo', label: "sole architect of a company's AI platform" },
] as const;

export const now = {
  updated: 'August 2026',
  items: [
    {
      title: 'Self-hosted retrieval platform',
      body: 'Vector search, local embeddings, LLM tracing and bounded agent orchestration, operated end to end.',
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
  { when: 'Jul 2024 — Jun 2025', role: 'NOC — Network monitoring analyst', org: 'Hyti / SADA Transportes', points: ['Monitored and analysed the SADA Transportes network infrastructure.', 'Investigated network health, availability and monitoring signals.'] },
  { when: 'Jul 2025 — Oct 2025', role: 'Observability & integrity security analyst', org: 'Ana Gaming', points: ['Analysed operational graphs and ran query-based investigations.', 'Investigated anomalies in business and system integrity signals.'] },
  { when: 'Feb 2026 — Jul 2026', role: 'AI Engineer · contract', org: 'MaxStartup — 6-month engagement', points: ["Sole architect and developer of the company's AI integrations.", 'Multi-agent knowledge system: trust-tiered knowledge, retrieval, autonomous workflows.'] },
  { when: 'Ongoing', role: 'Independent — AI systems & software', org: 'Freelance', points: ['Websites, applications and SaaS products.', 'Operating a self-hosted retrieval platform as the primary technical project.'], current: true },
] as const;
