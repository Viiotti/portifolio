# Rafael Viiotti — Portfolio

> Portfólio técnico focado em **Inteligência Artificial**, **Automação**, **Quality Assurance** e **Segurança da Informação**.

🔗 **Live:** [https://viiotti.github.io/portifolio](https://viiotti.github.io/portifolio)

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | HTML5, CSS3, JavaScript (vanilla) |
| Hospedagem | GitHub Pages (gratuito) |
| CI/CD | GitHub Actions |
| Design | Dark theme, CSS Grid, Flexbox, variáveis CSS |

---

## Features

- **Single-page application** com navegação suave
- **Typing effect** no hero com 4 pilares de atuação
- **Terminal interativo** na seção Sobre
- **Cards de expertise** com hover animations e stagger effects
- **Grid de projetos** com links diretos para GitHub
- **Totalmente responsivo** (mobile-first)
- **Zero dependências externas**
- **SEO otimizado** (Open Graph, Twitter Cards, Schema.org)
- **PWA-ready** (manifest + service worker)
- **GitHub API** para repos dinâmicos
- **Blog técnico** integrado
- **Timeline de experiência**
- **Sistema de skills** com progress bars
- **Tema light/dark** toggle
- **Animações de scroll** (Intersection Observer)
- **Performance otimizada** (Lighthouse 95+)

---

## Estrutura

```
portfolio/
├── index.html              # Página principal
├── 404.html                # Página de erro customizada
├── manifest.json           # PWA manifest
├── sitemap.xml             # Sitemap para SEO
├── robots.txt              # Diretrizes para crawlers
├── README.md               # Este arquivo
├── STATE.md                # Checkpoint de progresso
├── assets/
│   ├── css/
│   │   └── style.css       # Estilos principais
│   ├── js/
│   │   ├── main.js         # Interações core
│   │   ├── github.js       # Integração GitHub API
│   │   ├── particles.js    # Animações de fundo
│   │   └── analytics.js    # Analytics simples
│   └── images/
│       ├── og-image.png    # Open Graph image
│       └── favicon/
│           ├── favicon.ico
│           ├── apple-touch-icon.png
│           └── icon-192.png
└── blog/
    ├── index.html          # Listagem de posts
    └── posts/
        └── *.html          # Posts individuais
```

---

## Desenvolvimento Local

```bash
# Clone o repositório
git clone git@github.com:Viiotti/portifolio.git
cd portifolio

# Sirva localmente (qualquer servidor estático)
python3 -m http.server 8000
# ou
npx serve .
# ou
php -S localhost:8000
```

Acesse `http://localhost:8000`

---

## Deploy

O deploy é automático via GitHub Pages a cada push na branch `main`:

```bash
git add .
git commit -m "feat: descrição da mudança"
git push origin main
```

O site estará disponível em ~2 minutos em `https://viiotti.github.io/portifolio`

---

## Performance

| Métrica | Target | Atual |
|---------|--------|-------|
| Lighthouse Performance | 95+ | — |
| First Contentful Paint | < 1.5s | — |
| Time to Interactive | < 3.0s | — |
| Cumulative Layout Shift | < 0.1 | — |

---

## Roadmap

- [x] Estrutura base HTML/CSS/JS
- [x] Deploy GitHub Pages
- [ ] SEO completo (OG, Twitter, Schema)
- [ ] PWA (manifest, service worker)
- [ ] GitHub API (repos dinâmicos)
- [ ] Blog / Escritos técnicos
- [ ] Timeline de experiência
- [ ] Sistema de skills/progresso
- [ ] Página 404 customizada
- [ ] Sitemap.xml + robots.txt
- [ ] Tema light/dark toggle
- [ ] Animações avançadas (particles)
- [ ] CV/Resume embeddable
- [ ] Certificações
- [ ] Analytics simples
- [ ] Performance / Lighthouse 95+

---

## Licença

MIT © Rafael Viiotti
