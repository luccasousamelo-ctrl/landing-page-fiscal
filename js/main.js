/* ============================================
   BRASIL+EUA FISCAL — Main JavaScript
   ============================================ */

(function() {
    'use strict';

    // ---- CONFIG ----
    const WHATSAPP_NUMBER = '5500000000000'; // Trocar pelo número real
    const WHATSAPP_MSG = encodeURIComponent('Olá, quero regularizar minha situação fiscal no Brasil e nos EUA!');
    const IR_DEADLINE = new Date('2026-05-30T23:59:59-03:00');

    // GA4 & Meta Pixel IDs (trocar pelos reais)
    const GA4_ID = 'G-XXXXXXXXXX';
    const META_PIXEL_ID = 'XXXXXXXXXXXXXXX';

    // ---- UTM CAPTURE ----
    function captureUTMs() {
        const params = new URLSearchParams(window.location.search);
        const utms = {};
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(key => {
            const val = params.get(key);
            if (val) utms[key] = val;
        });
        if (Object.keys(utms).length > 0) {
            sessionStorage.setItem('utm_params', JSON.stringify(utms));
        }
        return utms;
    }

    // ---- TRACKING EVENTS ----
    function trackEvent(eventName, params) {
        // GA4
        if (typeof gtag === 'function') {
            gtag('event', eventName, params || {});
        }
        // Meta Pixel
        if (typeof fbq === 'function') {
            fbq('track', eventName, params || {});
        }
        // Console (dev)
        console.log('[Track]', eventName, params);
    }

    // ---- SCROLL PROGRESS BAR ----
    function initScrollProgress() {
        const bar = document.querySelector('.scroll-progress');
        if (!bar) return;

        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            bar.style.width = progress + '%';
        }, { passive: true });
    }

    // ---- NAVBAR ----
    function initNavbar() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;

        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }, { passive: true });
    }

    // ---- HAMBURGER MENU ----
    function initMobileMenu() {
        const hamburger = document.querySelector('.hamburger');
        const menu = document.querySelector('.mobile-menu');
        const overlay = document.querySelector('.mobile-menu-overlay');
        if (!hamburger || !menu) return;

        function toggleMenu() {
            hamburger.classList.toggle('active');
            menu.classList.toggle('open');
            if (overlay) overlay.classList.toggle('open');
            document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
        }

        hamburger.addEventListener('click', toggleMenu);
        if (overlay) overlay.addEventListener('click', toggleMenu);

        menu.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', toggleMenu);
        });
    }

    // ---- STICKY CTA BAR ----
    function initStickyCTA() {
        const bar = document.querySelector('.sticky-cta-bar');
        const hero = document.querySelector('.hero');
        if (!bar || !hero) return;

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    bar.classList.remove('visible');
                } else {
                    bar.classList.add('visible');
                }
            });
        }, { threshold: 0 });

        observer.observe(hero);
    }

    // ---- SCROLL ANIMATIONS ----
    function initScrollAnimations() {
        const elements = document.querySelectorAll('.animate-on-scroll');
        if (elements.length === 0) return;

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    // Stagger siblings
                    var parent = entry.target.parentElement;
                    if (parent) {
                        var siblings = Array.from(parent.children).filter(function(c) {
                            return c.classList.contains('animate-on-scroll');
                        });
                        var idx = siblings.indexOf(entry.target);
                        entry.target.style.transitionDelay = (idx * 0.07) + 's';
                    }
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        });

        elements.forEach(function(el) {
            observer.observe(el);
        });
    }

    // ---- COUNTDOWN TIMER ----
    function initCountdown() {
        function update() {
            var now = new Date();
            var diff = IR_DEADLINE - now;

            if (diff <= 0) {
                document.querySelectorAll('.countdown-days').forEach(function(el) { el.textContent = '0'; });
                document.querySelectorAll('.countdown-hours').forEach(function(el) { el.textContent = '0'; });
                document.querySelectorAll('.countdown-mins').forEach(function(el) { el.textContent = '0'; });
                document.querySelectorAll('.countdown-secs').forEach(function(el) { el.textContent = '0'; });
                return;
            }

            var days = Math.floor(diff / (1000 * 60 * 60 * 24));
            var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            var secs = Math.floor((diff % (1000 * 60)) / 1000);

            document.querySelectorAll('.countdown-days').forEach(function(el) { el.textContent = days; });
            document.querySelectorAll('.countdown-hours').forEach(function(el) { el.textContent = String(hours).padStart(2, '0'); });
            document.querySelectorAll('.countdown-mins').forEach(function(el) { el.textContent = String(mins).padStart(2, '0'); });
            document.querySelectorAll('.countdown-secs').forEach(function(el) { el.textContent = String(secs).padStart(2, '0'); });
        }

        update();
        setInterval(update, 1000);
    }

    // ---- COUNTER ANIMATION ----
    function initCounters() {
        var counters = document.querySelectorAll('.stat-number[data-target]');
        if (counters.length === 0) return;

        function animateCounter(counter) {
            var target = parseInt(counter.getAttribute('data-target'));
            var suffix = counter.getAttribute('data-suffix') || '';
            var duration = 2200;
            var startTime = performance.now();

            function tick(currentTime) {
                var elapsed = currentTime - startTime;
                var progress = Math.min(elapsed / duration, 1);
                var eased = 1 - Math.pow(1 - progress, 3);
                var current = Math.floor(eased * target);
                counter.textContent = current.toLocaleString('pt-BR') + suffix;
                if (progress < 1) requestAnimationFrame(tick);
            }

            requestAnimationFrame(tick);
        }

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    counters.forEach(animateCounter);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        var statsSection = document.querySelector('.stats-bar');
        if (statsSection) observer.observe(statsSection);
    }

    // ---- FAQ ACCORDION ----
    function initFAQ() {
        document.querySelectorAll('.faq-question').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var item = btn.parentElement;
                var answer = item.querySelector('.faq-answer');
                var isActive = item.classList.contains('active');

                // Close all
                document.querySelectorAll('.faq-item').forEach(function(i) {
                    i.classList.remove('active');
                    i.querySelector('.faq-answer').style.maxHeight = '0';
                });

                // Toggle
                if (!isActive) {
                    item.classList.add('active');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                }
            });
        });
    }

    // ---- SMOOTH SCROLL ----
    function initSmoothScroll() {
        var navbar = document.getElementById('navbar');
        document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                var target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    var navH = navbar ? navbar.offsetHeight : 0;
                    var pos = target.getBoundingClientRect().top + window.pageYOffset - navH;
                    window.scrollTo({ top: pos, behavior: 'smooth' });
                }
            });
        });
    }

    // ---- BACK TO TOP ----
    function initBackToTop() {
        var btn = document.querySelector('.back-to-top');
        if (!btn) return;

        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 600) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        }, { passive: true });

        btn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ---- FORM VALIDATION ----
    function initForm() {
        var form = document.getElementById('lead-form');
        if (!form) return;

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            var valid = true;

            // Reset errors
            form.querySelectorAll('.form-input, .form-select').forEach(function(input) {
                input.classList.remove('error');
            });
            form.querySelectorAll('.form-error').forEach(function(err) {
                err.classList.remove('visible');
            });

            // Validate nome
            var nome = form.querySelector('[name="nome"]');
            if (nome && nome.value.trim().length < 2) {
                nome.classList.add('error');
                nome.nextElementSibling && nome.nextElementSibling.classList.add('visible');
                valid = false;
            }

            // Validate email
            var email = form.querySelector('[name="email"]');
            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (email && !emailRegex.test(email.value.trim())) {
                email.classList.add('error');
                email.nextElementSibling && email.nextElementSibling.classList.add('visible');
                valid = false;
            }

            // Validate whatsapp
            var whatsapp = form.querySelector('[name="whatsapp"]');
            if (whatsapp && whatsapp.value.trim().length < 10) {
                whatsapp.classList.add('error');
                whatsapp.nextElementSibling && whatsapp.nextElementSibling.classList.add('visible');
                valid = false;
            }

            if (valid) {
                // Capture UTMs
                var utms = JSON.parse(sessionStorage.getItem('utm_params') || '{}');
                var formData = {
                    nome: nome ? nome.value.trim() : '',
                    email: email ? email.value.trim() : '',
                    whatsapp: whatsapp ? whatsapp.value.trim() : '',
                    estado: form.querySelector('[name="estado"]') ? form.querySelector('[name="estado"]').value : '',
                    situacao: form.querySelector('[name="situacao"]') ? form.querySelector('[name="situacao"]').value : '',
                    utms: utms
                };

                console.log('[Form Submit]', formData);
                trackEvent('generate_lead', { method: 'form' });
                trackEvent('Lead', { content_name: 'Landing Page Form' });

                // Redirect
                window.location.href = 'obrigado.html';
            }
        });
    }

    // ---- EXIT INTENT POPUP ----
    function initExitIntent() {
        var popup = document.querySelector('.popup-overlay');
        if (!popup) return;

        var shown = false;

        // Desktop: mouse leaves viewport
        document.addEventListener('mouseout', function(e) {
            if (shown) return;
            if (e.clientY < 5 && !e.relatedTarget && !e.toElement) {
                popup.classList.add('active');
                shown = true;
                trackEvent('exit_intent_shown');
            }
        });

        // Close
        popup.querySelector('.popup-close').addEventListener('click', function() {
            popup.classList.remove('active');
        });

        popup.addEventListener('click', function(e) {
            if (e.target === popup) popup.classList.remove('active');
        });

        // Popup form
        var popupForm = popup.querySelector('form');
        if (popupForm) {
            popupForm.addEventListener('submit', function(e) {
                e.preventDefault();
                var emailInput = popupForm.querySelector('input[type="email"]');
                if (emailInput && emailInput.value.trim()) {
                    trackEvent('checklist_download', { email: emailInput.value.trim() });
                    popup.classList.remove('active');
                    alert('Checklist enviado para seu email!');
                }
            });
        }
    }

    // ---- WHATSAPP TRACKING ----
    function initWhatsAppTracking() {
        document.querySelectorAll('a[href*="wa.me"], .btn-whatsapp-sticky').forEach(function(el) {
            el.addEventListener('click', function() {
                trackEvent('whatsapp_click', { location: el.closest('section') ? el.closest('section').id : 'float' });
            });
        });
    }

    // ---- CTA TRACKING ----
    function initCTATracking() {
        document.querySelectorAll('.btn-primary, .btn-green, .navbar-cta').forEach(function(el) {
            el.addEventListener('click', function() {
                trackEvent('click_cta', {
                    text: el.textContent.trim().substring(0, 50),
                    section: el.closest('section') ? el.closest('section').id : 'nav'
                });
            });
        });
    }

    // ---- INIT ALL ----
    function init() {
        captureUTMs();
        initScrollProgress();
        initNavbar();
        initMobileMenu();
        initStickyCTA();
        initScrollAnimations();
        initCountdown();
        initCounters();
        initFAQ();
        initSmoothScroll();
        initBackToTop();
        initForm();
        initExitIntent();
        initWhatsAppTracking();
        initCTATracking();
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
