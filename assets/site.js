/* ==========================================================================
   Krishna Viradiya — Shared Site Script
   Loaded on every page. Handles:
   - Supabase client setup (the small backend that stores blogs/snippets)
   - Header: mobile menu, active nav link, scroll progress bar
   - Neural network canvas background
   - Scroll-reveal animations
   ========================================================================== */

/* --------------------------------------------------------------------
   1. SUPABASE CONFIG
   -------------------------------------------------------------------- */
// These two values are PUBLIC by design (the "anon" key). Supabase is built
// so this key can sit in client-side code safely — it can only do what your
// Row Level Security rules allow (see SETUP.md). It is NOT a secret/admin key.
const SUPABASE_URL = "https://urwodwbkupdjoyuimmua.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_TqC3_kge9RJWVYZCoGaQ0w_0HNu2hpV";

let supabaseClient = null;
function getSupabase() {
    if (!supabaseClient && window.supabase) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return supabaseClient;
}

/* --------------------------------------------------------------------
   2. HEADER: mobile menu + active link highlighting
   -------------------------------------------------------------------- */
function initHeader() {
    if (window.lucide) lucide.createIcons();
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    let isMenuOpen = false;

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            isMenuOpen = !isMenuOpen;
            mobileMenu.classList.toggle('hidden', !isMenuOpen);
            menuBtn.innerHTML = isMenuOpen
                ? '<i data-lucide="x" class="w-8 h-8"></i>'
                : '<i data-lucide="menu" class="w-8 h-8"></i>';
            if (window.lucide) lucide.createIcons();
        });

        document.querySelectorAll('.mobile-link').forEach(link => {
            link.addEventListener('click', () => {
                isMenuOpen = false;
                mobileMenu.classList.add('hidden');
                menuBtn.innerHTML = '<i data-lucide="menu" class="w-8 h-8"></i>';
                if (window.lucide) lucide.createIcons();
            });
        });
    }

    // Mark the nav link matching the current page as active.
    // data-page on <body> tells us which page we're on (set per-file).
    const currentPage = document.body.getAttribute('data-page') || 'home';
    document.querySelectorAll('.nav-link, .mobile-link').forEach(link => {
        if (link.getAttribute('data-page') === currentPage) {
            link.classList.add('is-active');
        }
    });
}

/* --------------------------------------------------------------------
   3. SCROLL PROGRESS BAR
   -------------------------------------------------------------------- */
function initScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
        bar.style.width = scrolled + '%';
    });
}

/* --------------------------------------------------------------------
   4. SMOOTH SCROLL for in-page anchors (e.g. homepage #about etc.)
   -------------------------------------------------------------------- */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' ) return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({ top: offsetPosition, behavior: "smooth" });
            }
        });
    });
}

/* --------------------------------------------------------------------
   5. NEURAL NETWORK CANVAS BACKGROUND
   -------------------------------------------------------------------- */
function initNeuralCanvas() {
    const canvas = document.getElementById('neuralCanvas');
    const container = document.getElementById('canvas-container');
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    let width, height, particles = [];

    function resize() {
        width = canvas.width = container.offsetWidth;
        height = canvas.height = container.offsetHeight;
    }

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2 + 1;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = '#00ff66';
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        const count = window.innerWidth < 768 ? 30 : 60;
        for (let i = 0; i < count; i++) particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.update();
            p.draw();
            for (let j = i; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p.x - p2.x, dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(0, 255, 102, ${1 - dist / 100})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => { resize(); initParticles(); });
    resize();
    initParticles();
    animate();
}

/* --------------------------------------------------------------------
   6. SCROLL REVEAL
   -------------------------------------------------------------------- */
function initRevealAnimations() {
    const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* --------------------------------------------------------------------
   7. SHARED UTILITIES
   -------------------------------------------------------------------- */

// Tiny markdown-ish renderer for blog posts / chapter content.
// Supports: # ## ### headings, **bold**, *italic*, `code`, ```code blocks```,
// [link](url), images ![alt](url), > blockquote, - lists, paragraphs.
function renderRichText(raw) {
    if (!raw) return '';
    let text = raw.replace(/\r\n/g, '\n');

    // Code blocks first (so their content isn't touched by other rules)
    const codeBlocks = [];
    text = text.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
        const idx = codeBlocks.length;
        codeBlocks.push({ lang: lang || 'text', code });
        return `@@CODEBLOCK${idx}@@`;
    });

    const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const lines = text.split('\n');
    let html = '';
    let inList = false;
    for (let line of lines) {
        if (/^@@CODEBLOCK\d+@@$/.test(line.trim())) {
            if (inList) { html += '</ul>'; inList = false; }
            const idx = parseInt(line.trim().match(/\d+/)[0]);
            const { lang, code } = codeBlocks[idx];
            html += `<div class="code-block-wrap"><span class="code-block-lang">${escapeHtml(lang)}</span><button class="code-copy-btn" onclick="copyCodeBlock(this)">Copy</button><pre><code class="language-${escapeHtml(lang || 'plaintext')}">${escapeHtml(code.trim())}</code></pre></div>`;
            continue;
        }
        if (/^### /.test(line)) { if (inList) { html += '</ul>'; inList = false; } html += `<h3>${inlineMd(line.slice(4))}</h3>`; continue; }
        if (/^## /.test(line)) { if (inList) { html += '</ul>'; inList = false; } html += `<h2>${inlineMd(line.slice(3))}</h2>`; continue; }
        if (/^# /.test(line)) { if (inList) { html += '</ul>'; inList = false; } html += `<h2>${inlineMd(line.slice(2))}</h2>`; continue; }
        if (/^> /.test(line)) { if (inList) { html += '</ul>'; inList = false; } html += `<blockquote>${inlineMd(line.slice(2))}</blockquote>`; continue; }
        if (/^!\[(.*?)\]\((.*?)\)$/.test(line.trim())) {
            const m = line.trim().match(/^!\[(.*?)\]\((.*?)\)$/);
            if (inList) { html += '</ul>'; inList = false; }
            html += `<img src="${escapeHtml(m[2])}" alt="${escapeHtml(m[1])}" loading="lazy">`;
            continue;
        }
        if (/^[-*]\s+/.test(line)) {
            if (!inList) { html += '<ul>'; inList = true; }
            html += `<li>${inlineMd(line.replace(/^[-*]\s+/, ''))}</li>`;
            continue;
        }
        if (inList) { html += '</ul>'; inList = false; }
        if (line.trim() === '') continue;
        html += `<p>${inlineMd(line)}</p>`;
    }
    if (inList) html += '</ul>';
    return html;
}

function inlineMd(text) {
    return text
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#fff">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/!\[(.*?)\]\((.*?)\)/g, '') // images handled at line level
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}

// Strips markdown symbols entirely (no HTML output) — used for plain-text
// contexts like card summaries, <title> tags, or meta descriptions where
// HTML tags can't be used but raw asterisks/backticks would look like bugs.
function stripMd(text) {
    if (!text) return '';
    return text
        .replace(/!\[(.*?)\]\((.*?)\)/g, '$1')
        .replace(/\[(.+?)\]\((.+?)\)/g, '$1')
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/`(.+?)`/g, '$1')
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/^>\s+/gm, '')
        .replace(/^[-*]\s+/gm, '');
}

function copyCodeBlock(btn) {
    const code = btn.parentElement.querySelector('code').textContent;
    navigator.clipboard.writeText(code).then(() => {
        const original = btn.textContent;
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = original; btn.classList.remove('copied'); }, 1800);
    });
}

// Call this after injecting renderRichText() output into the page,
// so code blocks get colored syntax highlighting instead of flat gray text.
function highlightCodeBlocks(container) {
    if (!window.hljs) return;
    const scope = container || document;
    scope.querySelectorAll('pre code').forEach(block => {
        window.hljs.highlightElement(block);
    });
}

function formatDate(isoString) {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function escapeAttr(str) {
    return String(str || '').replace(/"/g, '&quot;');
}

/* --------------------------------------------------------------------
   8. BOOT
   -------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initScrollProgress();
    initSmoothScroll();
    initNeuralCanvas();
    initRevealAnimations();
});