/* ============================================
   GitHub API Integration
   Busca repos dinamicamente do usuario Viiotti
   ============================================ */

class GitHubAPI {
    constructor(username = 'Viiotti') {
        this.username = username;
        this.baseURL = 'https://api.github.com';
        this.cache = new Map();
        this.cacheTime = 5 * 60 * 1000; // 5 minutos
    }

    async fetchRepos(options = {}) {
        const cacheKey = 'repos_' + JSON.stringify(options);
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheTime) {
            return cached.data;
        }

        const params = new URLSearchParams({
            sort: options.sort || 'updated',
            direction: options.direction || 'desc',
            per_page: options.per_page || '100'
        });

        try {
            const response = await fetch(
                `${this.baseURL}/users/${this.username}/repos?${params}`,
                { headers: { 'Accept': 'application/vnd.github.v3+json' } }
            );

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            this.cache.set(cacheKey, { data, timestamp: Date.now() });
            return data;
        } catch (error) {
            console.error('GitHub API error:', error);
            return cached?.data || [];
        }
    }

    async fetchRepoDetails(repoName) {
        const cacheKey = `repo_${repoName}`;
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheTime) {
            return cached.data;
        }

        try {
            const [repo, languages] = await Promise.all([
                fetch(`${this.baseURL}/repos/${this.username}/${repoName}`).then(r => r.json()),
                fetch(`${this.baseURL}/repos/${this.username}/${repoName}/languages`).then(r => r.json())
            ]);

            const data = { ...repo, languages };
            this.cache.set(cacheKey, { data, timestamp: Date.now() });
            return data;
        } catch (error) {
            console.error('GitHub API error:', error);
            return cached?.data || null;
        }
    }

    async fetchContributions() {
        // Nota: GitHub API nao expoe contributions diretamente
        // Isso requer GraphQL ou scraping
        // Retornando mock para demonstracao
        return {
            totalCommits: 847,
            totalPRs: 124,
            totalIssues: 89,
            streak: 45
        };
    }

    formatRepo(repo) {
        return {
            name: repo.name,
            description: repo.description || 'Sem descrição',
            url: repo.html_url,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            language: repo.language,
            languages: repo.languages || {},
            updated: new Date(repo.updated_at).toLocaleDateString('pt-BR'),
            topics: repo.topics || [],
            homepage: repo.homepage,
            isFork: repo.fork,
            isPrivate: repo.private
        };
    }
}

// Inicializacao
const github = new GitHubAPI('Viiotti');

async function loadGitHubProjects() {
    const container = document.getElementById('github-projects');
    if (!container) return;

    container.innerHTML = '<div class="loading">Carregando projetos...</div>';

    try {
        const repos = await github.fetchRepos({ per_page: '8' });
        const filtered = repos
            .filter(r => !r.fork && !r.private)
            .slice(0, 8);

        if (filtered.length === 0) {
            container.innerHTML = '<p class="no-data">Nenhum projeto público encontrado.</p>';
            return;
        }

        container.innerHTML = filtered.map(repo => {
            const r = github.formatRepo(repo);
            const langColor = getLanguageColor(r.language);
            
            return `
                <article class="project-card">
                    <div class="project-header">
                        <div class="project-folder">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                        </div>
                        <div class="project-links">
                            <a href="${r.url}" target="_blank" aria-label="GitHub">
                                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                            </a>
                            ${r.homepage ? `<a href="${r.homepage}" target="_blank" aria-label="Demo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>` : ''}
                        </div>
                    </div>
                    <h3>${r.name}</h3>
                    <p>${r.description}</p>
                    <div class="project-meta">
                        ${r.language ? `<span class="lang" style="--lang-color:${langColor}">${r.language}</span>` : ''}
                        <span class="stars">★ ${r.stars}</span>
                        <span class="updated">${r.updated}</span>
                    </div>
                </article>
            `;
        }).join('');
    } catch (error) {
        container.innerHTML = '<p class="error">Erro ao carregar projetos. <a href="https://github.com/Viiotti" target="_blank">Ver no GitHub →</a></p>';
    }
}

function getLanguageColor(lang) {
    const colors = {
        'Python': '#3572A5',
        'JavaScript': '#f1e05a',
        'TypeScript': '#2b7489',
        'HTML': '#e34c26',
        'CSS': '#563d7c',
        'Shell': '#89e051',
        'Rust': '#dea584',
        'Go': '#00ADD8',
        'Java': '#b07219',
        'C++': '#f34b7d',
        'C': '#555555',
        'Ruby': '#701516',
        'PHP': '#4F5D95'
    };
    return colors[lang] || '#8b949e';
}

// Carregar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se existe container de projetos dinamicos
    if (document.getElementById('github-projects')) {
        loadGitHubProjects();
    }
});
