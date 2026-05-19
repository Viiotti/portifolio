/* ============================================
   Simple Analytics (Privacy-First)
   Sem cookies, sem tracking de terceiros
   Apenas contagem de pageviews anonima
   ============================================ */

class SimpleAnalytics {
    constructor() {
        this.storageKey = 'rv_analytics';
        this.sessionKey = 'rv_session';
        this.init();
    }

    init() {
        // Verificar se eh nova sessao
        if (!sessionStorage.getItem(this.sessionKey)) {
            sessionStorage.setItem(this.sessionKey, Date.now().toString());
            this.trackEvent('session_start');
        }

        // Track pageview
        this.trackPageview();

        // Track time on page
        this.trackEngagement();
    }

    getData() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey) || '{}');
        } catch {
            return {};
        }
    }

    saveData(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    trackPageview() {
        const data = this.getData();
        const page = window.location.pathname;
        const today = new Date().toISOString().split('T')[0];

        if (!data.pageviews) data.pageviews = {};
        if (!data.pageviews[page]) data.pageviews[page] = {};
        if (!data.pageviews[page][today]) data.pageviews[page][today] = 0;

        data.pageviews[page][today]++;
        data.lastVisit = new Date().toISOString();
        data.totalVisits = (data.totalVisits || 0) + 1;

        this.saveData(data);
    }

    trackEvent(name, metadata = {}) {
        const data = this.getData();
        if (!data.events) data.events = [];

        data.events.push({
            name,
            timestamp: new Date().toISOString(),
            page: window.location.pathname,
            ...metadata
        });

        // Manter apenas ultimos 100 eventos
        if (data.events.length > 100) {
            data.events = data.events.slice(-100);
        }

        this.saveData(data);
    }

    trackEngagement() {
        let startTime = Date.now();
        let maxScroll = 0;

        // Track scroll depth
        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
            );
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
            }
        }, { passive: true });

        // Track time on page
        window.addEventListener('beforeunload', () => {
            const timeSpent = Math.round((Date.now() - startTime) / 1000);
            this.trackEvent('page_exit', {
                timeSpent,
                maxScrollDepth: maxScroll
            });
        });
    }

    getStats() {
        return this.getData();
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    window.analytics = new SimpleAnalytics();
});
