/* ============================================
   Particles Background Animation
   Canvas-based particle system
   ============================================ */

class ParticleSystem {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: null, y: null };
        this.isActive = true;

        this.config = {
            particleCount: options.particleCount || 60,
            connectionDistance: options.connectionDistance || 120,
            mouseDistance: options.mouseDistance || 150,
            speed: options.speed || 0.5,
            color: options.color || 'rgba(0, 212, 170, 0.3)',
            lineColor: options.lineColor || 'rgba(0, 212, 170, 0.08)',
            ...options
        };

        this.init();
    }

    init() {
        this.resize();
        this.createParticles();
        this.bindEvents();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.config.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * this.config.speed,
                vy: (Math.random() - 0.5) * this.config.speed,
                radius: Math.random() * 2 + 1
            });
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        window.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });

        // Pausar quando nao visivel
        document.addEventListener('visibilitychange', () => {
            this.isActive = !document.hidden;
            if (this.isActive) this.animate();
        });
    }

    update() {
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            // Wrap around edges
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;

            // Mouse repulsion
            if (this.mouse.x !== null) {
                const dx = this.mouse.x - p.x;
                const dy = this.mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < this.config.mouseDistance) {
                    const force = (this.config.mouseDistance - dist) / this.config.mouseDistance;
                    p.vx -= (dx / dist) * force * 0.5;
                    p.vy -= (dy / dist) * force * 0.5;
                }
            }
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw connections
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < this.config.connectionDistance) {
                    const opacity = (1 - dist / this.config.connectionDistance) * 0.5;
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = this.config.lineColor.replace('0.08', opacity.toFixed(2));
                    this.ctx.lineWidth = 1;
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }

        // Draw particles
        this.particles.forEach(p => {
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = this.config.color;
            this.ctx.fill();
        });
    }

    animate() {
        if (!this.isActive) return;
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Verificar preferencia de reducao de movimento
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!prefersReducedMotion) {
        new ParticleSystem('particles-canvas', {
            particleCount: 50,
            connectionDistance: 100,
            speed: 0.3
        });
    }
});
