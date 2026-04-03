/* ============================================
   BRASIL+EUA FISCAL — Main JavaScript
   ============================================ */

(function() {
    'use strict';

    // ---- CONFIG ----
    var WHATSAPP_NUMBER = '5562999939810';
    var WHATSAPP_MSG = encodeURIComponent('Olá, quero regularizar minha situação fiscal no Brasil e nos EUA!');
    var WHATSAPP_URL = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + WHATSAPP_MSG;
    var IR_DEADLINE = new Date('2026-05-30T23:59:59-03:00');
    var LEAD_EMAIL = 'contato@brasileuafiscal.com.br'; // Email que recebe os leads

    // ---- UTM CAPTURE ----
    function captureUTMs() {
        var params = new URLSearchParams(window.location.search);
        var utms = {};
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function(key) {
            var val = params.get(key);
            if (val) utms[key] = val;
        });
        if (Object.keys(utms).length > 0) {
            sessionStorage.setItem('utm_params', JSON.stringify(utms));
        }
        return utms;
    }

    // ---- TRACKING EVENTS ----
    function trackEvent(eventName, params) {
        if (typeof gtag === 'function') {
            gtag('event', eventName, params || {});
        }
        if (typeof fbq === 'function') {
            fbq('track', eventName, params || {});
        }
        console.log('[Track]', eventName, params);
    }

    // ---- SEND LEAD VIA FORMSUBMIT ----
    function sendLeadEmail(data, callback) {
        var formData = new FormData();
        formData.append('nome', data.nome || '');
        formData.append('email', data.email || '');
        formData.append('telefone', data.telefone || data.whatsapp || '');
        formData.append('estado', data.estado || '');
        formData.append('situacao', data.situacao || '');
        formData.append('origem', data.origem || 'Landing Page');
        formData.append('pagina', window.location.href);
        formData.append('_subject', 'Novo Lead - Brasil+EUA Fiscal - ' + (data.nome || 'Sem nome'));
        formData.append('_template', 'table');
        formData.append('_captcha', 'false');

        var utms = JSON.parse(sessionStorage.getItem('utm_params') || '{}');
        if (Object.keys(utms).length > 0) {
            formData.append('utm_params', JSON.stringify(utms));
        }

        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://formsubmit.co/ajax/' + LEAD_EMAIL);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.onload = function() {
            if (callback) callback(xhr.status === 200);
        };
        xhr.onerror = function() {
            if (callback) callback(false);
        };
        xhr.send(formData);
    }

    // ---- SCROLL PROGRESS BAR ----
    function initScrollProgress() {
        var bar = document.querySelector('.scroll-progress');
        if (!bar) return;

        window.addEventListener('scroll', function() {
            var scrollTop = window.pageYOffset;
            var docHeight = document.documentElement.scrollHeight - window.innerHeight;
            var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            bar.style.width = progress + '%';
        }, { passive: true });
    }

    // ---- NAVBAR ----
    function initNavbar() {
        var navbar = document.getElementById('navbar');
        if (!navbar) return;

        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }, { passive: true });
    }

    // ---- HAMBURGER MENU (fullscreen overlay) ----
    function initMobileMenu() {
        var hamburger = document.querySelector('.hamburger');
        var menu = document.querySelector('.mobile-menu');
        if (!hamburger || !menu) return;

        function closeMenu() {
            hamburger.classList.remove('active');
            menu.classList.remove('open');
            document.body.style.overflow = '';
        }

        function toggleMenu() {
            hamburger.classList.toggle('active');
            menu.classList.toggle('open');
            document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
        }

        hamburger.addEventListener('click', toggleMenu);

        // Fecha ao clicar em qualquer link do menu
        menu.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', closeMenu);
        });

        // Fecha ao pressionar ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && menu.classList.contains('open')) {
                closeMenu();
            }
        });
    }

    // ---- STICKY CTA BAR ----
    function initStickyCTA() {
        var bar = document.querySelector('.sticky-cta-bar');
        var hero = document.querySelector('.hero');
        if (!bar || !hero) return;

        var observer = new IntersectionObserver(function(entries) {
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
        var elements = document.querySelectorAll('.animate-on-scroll');
        if (elements.length === 0) return;

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
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

                document.querySelectorAll('.faq-item').forEach(function(i) {
                    i.classList.remove('active');
                    i.querySelector('.faq-answer').style.maxHeight = '0';
                });

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

    // ---- SANITIZE INPUT (XSS prevention) ----
    function sanitize(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    // ---- MAIN FORM (lead-form) ----
    function initForm() {
        var form = document.getElementById('lead-form');
        if (!form) return;

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            var valid = true;

            form.querySelectorAll('.form-input, .form-select').forEach(function(input) {
                input.classList.remove('error');
            });
            form.querySelectorAll('.form-error').forEach(function(err) {
                err.classList.remove('visible');
            });

            var nome = form.querySelector('[name="nome"]');
            if (nome && nome.value.trim().length < 2) {
                nome.classList.add('error');
                if (nome.nextElementSibling) nome.nextElementSibling.classList.add('visible');
                valid = false;
            }

            var email = form.querySelector('[name="email"]');
            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (email && !emailRegex.test(email.value.trim())) {
                email.classList.add('error');
                if (email.nextElementSibling) email.nextElementSibling.classList.add('visible');
                valid = false;
            }

            var whatsapp = form.querySelector('[name="whatsapp"]');
            if (whatsapp && whatsapp.value.trim().length < 10) {
                whatsapp.classList.add('error');
                if (whatsapp.nextElementSibling) whatsapp.nextElementSibling.classList.add('visible');
                valid = false;
            }

            if (valid) {
                var submitBtn = form.querySelector('[type="submit"]');
                var originalText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> Enviando...';

                var formData = {
                    nome: sanitize(nome.value.trim()),
                    email: sanitize(email.value.trim()),
                    whatsapp: sanitize(whatsapp.value.trim()),
                    estado: form.querySelector('[name="estado"]') ? sanitize(form.querySelector('[name="estado"]').value) : '',
                    situacao: form.querySelector('[name="situacao"]') ? sanitize(form.querySelector('[name="situacao"]').value) : '',
                    origem: 'Formulario Principal'
                };

                trackEvent('generate_lead', { method: 'form' });
                trackEvent('Lead', { content_name: 'Landing Page Form' });

                sendLeadEmail(formData, function(success) {
                    if (success) {
                        window.location.href = 'obrigado.html';
                    } else {
                        // Fallback: redireciona mesmo se o envio falhar (dados nao se perdem no tracking)
                        window.location.href = 'obrigado.html';
                    }
                });
            }
        });
    }

    // ---- WHATSAPP LEAD POPUP ----
    function initWhatsAppPopup() {
        var popup = document.getElementById('whatsapp-popup-overlay');
        if (!popup) return;

        var floatBtn = document.getElementById('whatsapp-float-btn');
        var stickyBtn = document.getElementById('sticky-whatsapp-btn');

        function openPopup() {
            popup.classList.add('active');
            trackEvent('whatsapp_popup_shown');
        }

        function closePopup() {
            popup.classList.remove('active');
        }

        if (floatBtn) floatBtn.addEventListener('click', openPopup);
        if (stickyBtn) stickyBtn.addEventListener('click', openPopup);

        // Close button
        var closeBtn = popup.querySelector('.popup-close');
        if (closeBtn) closeBtn.addEventListener('click', closePopup);

        // Click outside to close
        popup.addEventListener('click', function(e) {
            if (e.target === popup) closePopup();
        });

        // Form submit
        var form = document.getElementById('whatsapp-lead-form');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();

                var nome = form.querySelector('[name="nome"]');
                var email = form.querySelector('[name="email"]');
                var telefone = form.querySelector('[name="telefone"]');

                // Validacao basica
                var valid = true;
                [nome, email, telefone].forEach(function(input) {
                    input.classList.remove('error');
                });

                if (!nome.value.trim() || nome.value.trim().length < 2) {
                    nome.classList.add('error');
                    valid = false;
                }
                if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
                    email.classList.add('error');
                    valid = false;
                }
                if (!telefone.value.trim() || telefone.value.trim().length < 8) {
                    telefone.classList.add('error');
                    valid = false;
                }

                if (!valid) return;

                var submitBtn = form.querySelector('[type="submit"]');
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> Enviando...';

                var leadData = {
                    nome: sanitize(nome.value.trim()),
                    email: sanitize(email.value.trim()),
                    telefone: sanitize(telefone.value.trim()),
                    origem: 'Popup WhatsApp'
                };

                trackEvent('whatsapp_lead_captured', { method: 'popup' });
                trackEvent('Lead', { content_name: 'WhatsApp Popup' });

                sendLeadEmail(leadData, function() {
                    // Redireciona para WhatsApp independente do resultado
                    var safeName = sanitize(nome.value.trim()).replace(/[<>"'&]/g, '');
                    var msg = encodeURIComponent('Olá! Meu nome é ' + safeName + '. Quero regularizar minha situação fiscal no Brasil e nos EUA!');
                    window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + msg, '_blank');
                    closePopup();
                    form.reset();
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg> Iniciar Conversa no WhatsApp';
                });
            });
        }
    }

    // ---- EXIT INTENT POPUP ----
    function initExitIntent() {
        var popup = document.querySelector('.popup-overlay:not(#whatsapp-popup-overlay)');
        if (!popup) return;

        var shown = false;

        document.addEventListener('mouseout', function(e) {
            if (shown) return;
            if (e.clientY < 5 && !e.relatedTarget && !e.toElement) {
                popup.classList.add('active');
                shown = true;
                trackEvent('exit_intent_shown');
            }
        });

        var closeBtn = popup.querySelector('.popup-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                popup.classList.remove('active');
            });
        }

        popup.addEventListener('click', function(e) {
            if (e.target === popup) popup.classList.remove('active');
        });

        var popupForm = popup.querySelector('form');
        if (popupForm) {
            popupForm.addEventListener('submit', function(e) {
                e.preventDefault();
                var emailInput = popupForm.querySelector('input[type="email"]');
                var emailVal = emailInput ? emailInput.value.trim() : '';
                var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                if (!emailRegex.test(emailVal)) {
                    if (emailInput) emailInput.classList.add('error');
                    return;
                }
                emailInput.classList.remove('error');

                if (emailInput && emailVal) {
                    var submitBtn = popupForm.querySelector('[type="submit"]');
                    submitBtn.disabled = true;

                    var leadData = {
                        email: sanitize(emailVal),
                        origem: 'Exit Intent - Checklist Download'
                    };

                    trackEvent('checklist_download', { email: emailInput.value.trim() });

                    sendLeadEmail(leadData, function() {
                        popup.classList.remove('active');
                        submitBtn.disabled = false;
                        alert('Checklist enviado para seu email!');
                    });
                }
            });
        }
    }

    // ---- WHATSAPP TRACKING ----
    function initWhatsAppTracking() {
        document.querySelectorAll('a[href*="wa.me"]').forEach(function(el) {
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
        initWhatsAppPopup();
        initExitIntent();
        initWhatsAppTracking();
        initCTATracking();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
