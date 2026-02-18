/**
 * effects.js — Premium UI Effects
 * Preloader, Custom Cursor, Typewriter, and magnetic tilt
 */

(function () {
    // ─── CONFIG ──────────────────────────────────────────────
    const titles = [
        "Backend Engineer & AI Developer",
        "Systems Architect",
        "ML Research Enthusiast",
        "Problem Solver",
        "Full-Stack Developer",
        "Cybersecurity Student"
    ];

    // ─── PRELOADER ───────────────────────────────────────────
    function initPreloader() {
        const preloader = document.getElementById('preloader');
        const progress = document.getElementById('loader-progress');
        const video = document.getElementById('bg-video');

        let percent = 0;
        const interval = setInterval(() => {
            percent += Math.random() * 10;
            if (percent >= 100) {
                percent = 100;
                clearInterval(interval);

                // Wait for video if possible
                if (video && video.readyState >= 3) {
                    finishLoading();
                } else if (video) {
                    video.oncanplaythrough = finishLoading;
                    // Fallback after 3 seconds
                    setTimeout(finishLoading, 2000);
                } else {
                    finishLoading();
                }
            }
            if (progress) progress.style.width = percent + '%';
        }, 100);

        function finishLoading() {
            if (preloader) {
                preloader.classList.add('fade-out');
                setTimeout(() => preloader.style.display = 'none', 800);
            }
        }
    }

    // ─── TYPEWRITER ──────────────────────────────────────────
    function initTypewriter() {
        const el = document.getElementById('typewriter');
        if (!el) return;

        let titleIdx = 0;
        let charIdx = 0;
        let isDeleting = false;
        let speed = 100;

        function type() {
            const current = titles[titleIdx];

            if (isDeleting) {
                el.textContent = current.substring(0, charIdx - 1);
                charIdx--;
                speed = 50;
            } else {
                el.textContent = current.substring(0, charIdx + 1);
                charIdx++;
                speed = 100;
            }

            if (!isDeleting && charIdx === current.length) {
                isDeleting = true;
                speed = 2000; // Pause at end
            } else if (isDeleting && charIdx === 0) {
                isDeleting = false;
                titleIdx = (titleIdx + 1) % titles.length;
                speed = 500;
            }

            setTimeout(type, speed);
        }

        type();
    }

    // ─── CUSTOM CURSOR ───────────────────────────────────────
    function initCursor() {
        const dot = document.getElementById('cursor-dot');
        const outline = document.getElementById('cursor-outline');
        if (!dot || !outline) return;

        window.addEventListener('mousemove', (e) => {
            const { clientX: x, clientY: y } = e;

            dot.style.left = x + 'px';
            dot.style.top = y + 'px';

            outline.animate({
                left: x + 'px',
                top: y + 'px'
            }, { duration: 500, fill: "forwards" });
        });

        // Hover effect on interactables
        const targets = 'a, button, .project-card, .tech-badge, .contact-card';
        document.querySelectorAll(targets).forEach(el => {
            el.addEventListener('mouseenter', () => {
                outline.style.width = '70px';
                outline.style.height = '70px';
                outline.style.background = 'rgba(167, 139, 250, 0.1)';
                dot.style.transform = 'translate(-50%, -50%) scale(1.5)';
            });
            el.addEventListener('mouseleave', () => {
                outline.style.width = '40px';
                outline.style.height = '40px';
                outline.style.background = 'transparent';
                dot.style.transform = 'translate(-50%, -50%) scale(1)';
            });
        });
    }

    // ─── MAGNETIC TILT ───────────────────────────────────────
    function initTilt() {
        const cards = document.querySelectorAll('.project-card, .contact-card');

        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
            });
        });
    }

    // ─── PARALLAX ────────────────────────────────────────────
    function initParallax() {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            const video = document.getElementById('bg-video');
            const canvas = document.getElementById('particles-canvas');

            // Removed video transform to prevent it from moving down
            if (canvas) canvas.style.transform = `translateY(${scrolled * 0.1}px)`;
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        initPreloader();
        initCursor();
        initTypewriter();
        initTilt();
        initParallax();
    });
})();
