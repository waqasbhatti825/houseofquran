    (function () {
      'use strict';

      var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var preloader = document.getElementById('site-preloader');
      var progressBar = document.getElementById('preloader-progress');
      var bismillah = document.getElementById('preloader-arabic');
      var curtain = document.getElementById('page-transition');
      var menuButton = document.getElementById('mobile-menu-toggle');
      var mobileMenu = document.getElementById('mobile-menu');
      var siteHeader = document.getElementById('site-header');
      var readingProgress = document.getElementById('reading-progress');
      var isTransitioning = false;
      var lenis = null;

      /* LENIS */
      function initLenis() {
        if (reduceMotion || typeof Lenis === 'undefined') return;
        lenis = new Lenis({
          duration: 1.15,
          easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
          smoothWheel: true,
          smoothTouch: false
        });
        function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);
        if (window.ScrollTrigger) {
          lenis.on('scroll', ScrollTrigger.update);
          gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
          gsap.ticker.lagSmoothing(0);
        }
      }

      /* MOBILE MENU */
      function closeMenu() {
        if (!mobileMenu || !menuButton) return;
        mobileMenu.classList.remove('is-open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Open navigation');
      }
      function openMenu() {
        if (!mobileMenu || !menuButton) return;
        mobileMenu.classList.add('is-open');
        menuButton.setAttribute('aria-expanded', 'true');
        menuButton.setAttribute('aria-label', 'Close navigation');
      }
      if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
          var isOpen = menuButton.getAttribute('aria-expanded') === 'true';
          isOpen ? closeMenu() : openMenu();
        });
        mobileMenu.querySelectorAll('a').forEach(function (link) {
          link.addEventListener('click', closeMenu);
        });
      }

      /* NAV */
      var sections = Array.from(document.querySelectorAll('main section[id]'));
      var navLinks = Array.from(document.querySelectorAll('.site-navigation a[data-path]'));

      function setActiveNav(id) {
        navLinks.forEach(function (link) {
          var path = link.getAttribute('data-path');
          if (path === id) link.setAttribute('aria-current', 'page');
          else link.removeAttribute('aria-current');
        });
        document.querySelectorAll('.mobile-menu-grid a[data-path]').forEach(function (link) {
          var path = link.getAttribute('data-path');
          if (path === id) link.setAttribute('aria-current', 'page');
          else link.removeAttribute('aria-current');
        });
      }

      var navObserver = null;
      if ('IntersectionObserver' in window) {
        navObserver = new IntersectionObserver(function (entries) {
          var visible = entries.filter(function (e) { return e.isIntersecting; })
            .sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; });
          if (visible.length > 0) setActiveNav(visible[0].target.id);
        }, {
          rootMargin: '-40% 0px -55% 0px',
          threshold: [0, 0.25, 0.5, 0.75, 1]
        });
      }

      function onScroll() {
        var y = window.scrollY || window.pageYOffset;
        if (siteHeader) siteHeader.classList.toggle('is-scrolled', y > 20);
        if (readingProgress) {
          var docHeight = document.documentElement.scrollHeight - window.innerHeight;
          var progress = docHeight > 0 ? y / docHeight : 0;
          readingProgress.style.transform = 'scaleX(' + progress + ')';
        }
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();

      /* FAQ */
      document.querySelectorAll('[data-faq-toggle]').forEach(function (button) {
        button.addEventListener('click', function () {
          var content = button.nextElementSibling;
          var isExpanded = button.getAttribute('aria-expanded') === 'true';
          button.setAttribute('aria-expanded', String(!isExpanded));
          if (content) content.hidden = isExpanded;
          if (window.ScrollTrigger) ScrollTrigger.refresh();
        });
      });

      /* FORM */
      var form = document.getElementById('trial-form');
      if (form) {
        form.addEventListener('submit', function (event) {
          event.preventDefault();
          if (!form.reportValidity()) return;
          function val(id) { var el = document.getElementById(id); return el && el.value ? el.value.trim() : 'Not provided'; }
          var message = [
            'Assalamu Alaikum Rauf Sajjad, I would like to request a Quran trial class.',
            '',
            'Name: ' + val('full-name'),
            'Email: ' + val('email'),
            'WhatsApp: ' + val('whatsapp'),
            'Age group: ' + val('age-group'),
            'Preferred course: ' + val('course'),
            'Preferred time: ' + val('timing'),
            'Class format: ' + val('format'),
            'Notes: ' + val('notes')
          ].join('\n');
          var whatsappUrl = 'https://wa.me/923283126989?text=' + encodeURIComponent(message);
          var opened = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
          var success = document.getElementById('form-success-banner');
          if (success) {
            success.textContent = opened
              ? 'WhatsApp opened with your request pre-filled. Please review and send the message to Rauf Sajjad.'
              : 'Your request is ready. If WhatsApp did not open, contact Rauf Sajjad directly at +92 328 3126989.';
            success.hidden = false;
          }
        });
      }

      /* PAGE TRANSITION */
      function transitionTo(target) {
        if (!target || isTransitioning) return;
        isTransitioning = true;
        closeMenu();

        function finish() {
          if (lenis) lenis.scrollTo(target, { offset: -80, duration: 0 });
          else target.scrollIntoView({ behavior: 'auto', block: 'start' });
          history.replaceState(null, '', '#' + target.id);
          if (window.ScrollTrigger) ScrollTrigger.refresh();
          if (reduceMotion || !curtain) { isTransitioning = false; return; }
          curtain.style.visibility = 'visible';
          curtain.style.pointerEvents = 'auto';
          curtain.style.transition = 'transform 0.75s cubic-bezier(0.77, 0, 0.18, 1)';
          curtain.style.transform = 'translateY(100%)';
          setTimeout(function () {
            curtain.style.visibility = 'hidden';
            curtain.style.pointerEvents = 'none';
            curtain.style.transition = 'none';
            curtain.style.transform = 'translateY(100%)';
            void curtain.offsetHeight;
            isTransitioning = false;
          }, 800);
        }
        if (reduceMotion || !curtain) { finish(); return; }
        curtain.style.transition = 'transform 0.6s cubic-bezier(0.77, 0, 0.18, 1)';
        curtain.style.transform = 'translateY(100%)';
        curtain.style.visibility = 'visible';
        curtain.style.pointerEvents = 'auto';
        void curtain.offsetHeight;
        curtain.style.transform = 'translateY(0)';
        setTimeout(finish, 620);
      }

      document.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener('click', function (event) {
          var href = this.getAttribute('href');
          if (!href || href === '#') {
            event.preventDefault();
            var home = document.getElementById('home');
            if (home) transitionTo(home);
            return;
          }
          var target = document.getElementById(decodeURIComponent(href.slice(1)));
          if (!target) return;
          event.preventDefault();
          transitionTo(target);
        });
      });

      /* PRELOADER — SEQUENTIAL */
      function killPreloader(callback) {
        if (!preloader) { callback && callback(); return; }
        preloader.classList.add('is-hidden');
        setTimeout(function () {
          if (preloader && preloader.parentNode) {
            preloader.parentNode.removeChild(preloader);
            preloader = null;
          }
          callback && callback();
        }, 900);
      }

      function runPreloader(callback) {
        if (!preloader) { callback && callback(); return; }
        if (reduceMotion) { killPreloader(callback); return; }

        var progress = 0;
        var interval = setInterval(function () {
          progress += Math.random() * 18 + 6;
          if (progress >= 100) { progress = 100; clearInterval(interval); }
          if (progressBar) progressBar.style.transform = 'scaleX(' + (progress / 100) + ')';
        }, 110);

        // After ~1.4s, bar should be near 100%
        setTimeout(function () {
          clearInterval(interval);
          if (progressBar) progressBar.style.transform = 'scaleX(1)';

          // After bar completes → reveal Bismillah
          setTimeout(function () {
            if (bismillah) bismillah.classList.add('is-visible');

            // After Bismillah fully visible → fade out preloader
            setTimeout(function () {
              killPreloader(function () {
                if (window.__runHero && !reduceMotion) window.__runHero();
                document.body.classList.remove('gsap-ready');
                setTimeout(function () {
                  if (window.ScrollTrigger) ScrollTrigger.refresh();
                }, 400);
                callback && callback();
              });
            }, 1900);
          }, 250);
        }, 1500);
      }

      /* LIGHTBOX */
      var lightbox = document.getElementById('lightbox');
      var lightboxImg = document.getElementById('lightbox-img');
      var lightboxTitle = document.getElementById('lightbox-title');
      var lightboxMeta = document.getElementById('lightbox-meta');
      var lightboxCounter = document.getElementById('lightbox-counter');
      var lightboxClose = lightbox ? lightbox.querySelector('.lightbox-close') : null;
      var lightboxPrev = lightbox ? lightbox.querySelector('.lightbox-nav--prev') : null;
      var lightboxNext = lightbox ? lightbox.querySelector('.lightbox-nav--next') : null;
      var galleryItems = [];
      var currentIndex = 0;

      function openLightbox(index) {
        if (!lightbox || !galleryItems.length) return;
        if (index < 0) index = galleryItems.length - 1;
        if (index >= galleryItems.length) index = 0;
        currentIndex = index;
        var item = galleryItems[index];
        if (!item) return;
        var src = item.getAttribute('data-lightbox-src') || (item.querySelector('img') && item.querySelector('img').src) || '';
        var title = item.getAttribute('data-lightbox-title') || '';
        var meta = item.getAttribute('data-lightbox-meta') || '';
        if (lightboxImg) {
          lightboxImg.style.opacity = '0';
          setTimeout(function () {
            lightboxImg.src = src;
            lightboxImg.alt = title;
            lightboxImg.style.opacity = '1';
          }, 120);
        }
        if (lightboxTitle) lightboxTitle.textContent = title;
        if (lightboxMeta) lightboxMeta.textContent = meta;
        if (lightboxCounter) lightboxCounter.textContent = (index + 1) + ' / ' + galleryItems.length;
        lightbox.classList.add('is-open');
        document.body.style.overflow = 'hidden';
      }

      function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('is-open');
        document.body.style.overflow = '';
      }

      function navigateLightbox(direction) {
        if (!galleryItems.length) return;
        openLightbox(currentIndex + direction);
      }

      if (lightbox && lightboxClose && lightboxPrev && lightboxNext) {
        lightboxClose.addEventListener('click', closeLightbox);
        lightboxPrev.addEventListener('click', function (e) { e.stopPropagation(); navigateLightbox(-1); });
        lightboxNext.addEventListener('click', function (e) { e.stopPropagation(); navigateLightbox(1); });
        lightbox.addEventListener('click', function (e) {
          if (e.target === lightbox) closeLightbox();
        });
        document.addEventListener('keydown', function (e) {
          if (!lightbox.classList.contains('is-open')) return;
          if (e.key === 'Escape') closeLightbox();
          if (e.key === 'ArrowLeft') navigateLightbox(-1);
          if (e.key === 'ArrowRight') navigateLightbox(1);
        });
      }

      /* GALLERY */
      function initGallery() {
        var masonry = document.getElementById('galleryMasonry');
        if (!masonry) return;

        function refreshGalleryItems() {
          galleryItems = Array.from(masonry.querySelectorAll('.gallery-pin'))
            .filter(function (item) { return item.style.display !== 'none'; });
        }
        refreshGalleryItems();

        masonry.querySelectorAll('.gallery-pin').forEach(function (item) {
          item.addEventListener('click', function () {
            var visible = Array.from(masonry.querySelectorAll('.gallery-pin'))
              .filter(function (i) { return i.style.display !== 'none'; });
            var idx = visible.indexOf(item);
            galleryItems = visible;
            openLightbox(idx);
          });
        });

        var filterButtons = document.querySelectorAll('.gallery-filter');
        filterButtons.forEach(function (btn) {
          btn.addEventListener('click', function () {
            filterButtons.forEach(function (b) {
              b.classList.remove('is-active');
              b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('is-active');
            btn.setAttribute('aria-selected', 'true');
            var filter = btn.getAttribute('data-filter');
            var allItems = masonry.querySelectorAll('.gallery-pin');
            allItems.forEach(function (item) {
              var category = item.getAttribute('data-category') || '';
              if (filter === 'all' || category === filter) {
                item.style.display = '';
              } else {
                item.style.display = 'none';
              }
            });
            refreshGalleryItems();
            if (window.ScrollTrigger) ScrollTrigger.refresh();
          });
        });
      }

      /* GSAP */
      function initGsap() {
        if (reduceMotion || !window.gsap) {
          document.body.classList.remove('gsap-ready');
          return;
        }
        if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
        var ease = 'power3.out';

        function runHero() {
          var tl = gsap.timeline({ defaults: { ease: ease } });
          tl.fromTo('[data-hero="badge"]', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, 0);
          var titleEl = document.querySelector('[data-hero="title"]');
          if (titleEl) {
            tl.fromTo(titleEl,
              { yPercent: 100, opacity: 0, clipPath: 'inset(0 0 100% 0)' },
              { yPercent: 0, opacity: 1, clipPath: 'inset(0 0 0% 0)', duration: 1.0 }, 0.15);
          }
          tl.fromTo('[data-hero="copy"]', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, 0.4);
          tl.fromTo('[data-hero="ctas"] > *', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 }, 0.55);
          tl.fromTo('[data-hero="stats"]', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, 0.7);
          document.querySelectorAll('[data-count]').forEach(function (el) {
            var target = parseFloat(el.getAttribute('data-count'));
            var suffix = el.getAttribute('data-suffix') || '';
            var obj = { val: 0 };
            tl.to(obj, {
              val: target, duration: 1.4, ease: 'power2.out',
              onUpdate: function () { el.textContent = Math.round(obj.val) + suffix; }
            }, 0.85);
          });
          tl.fromTo('[data-hero="portrait"]', { x: 40, opacity: 0, scale: 0.95 }, { x: 0, opacity: 1, scale: 1, duration: 1.1 }, 0.25);
          var portraitImg = document.querySelector('.hero-portrait img');
          if (portraitImg) {
            tl.fromTo(portraitImg, { scale: 1.15 }, { scale: 1, duration: 1.6, ease: 'power2.out' }, 0.25);
          }
        }

        gsap.fromTo('.site-header', { y: -80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: ease, delay: 0.1 });
        gsap.fromTo('.site-navigation a', { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: ease, stagger: 0.06, delay: 0.4 });
        gsap.fromTo('.header-actions > *', { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: ease, stagger: 0.08, delay: 0.55 });

        gsap.utils.toArray('.reveal-line > span').forEach(function (span) {
          gsap.fromTo(span,
            { yPercent: 100, opacity: 0 },
            {
              yPercent: 0, opacity: 1, duration: 0.9, ease: ease,
              scrollTrigger: { trigger: span, start: 'top 88%', once: true }
            });
        });

        gsap.utils.toArray('[data-fade]').forEach(function (el) {
          gsap.fromTo(el,
            { y: 30, opacity: 0 },
            {
              y: 0, opacity: 1, duration: 0.8, ease: ease,
              scrollTrigger: { trigger: el, start: 'top 90%', once: true }
            });
        });

        gsap.utils.toArray('[data-stagger]').forEach(function (group) {
          var items = group.querySelectorAll('[data-stagger-item]');
          if (!items.length) return;
          gsap.fromTo(items,
            { y: 40, opacity: 0 },
            {
              y: 0, opacity: 1, duration: 0.75, ease: ease, stagger: 0.12,
              scrollTrigger: { trigger: group, start: 'top 85%', once: true }
            });
        });

        var aboutImg = document.querySelector('.about-vignette img');
        if (aboutImg) {
          gsap.fromTo(aboutImg,
            { yPercent: -8, scale: 1.1 },
            {
              yPercent: 8, scale: 1.1, ease: 'none',
              scrollTrigger: { trigger: '.about-vignette', start: 'top bottom', end: 'bottom top', scrub: 1 }
            });
        }

        gsap.utils.toArray('[data-timeline-line]').forEach(function (line) {
          gsap.fromTo(line,
            { scaleY: 0 },
            {
              scaleY: 1, duration: 1.0, ease: 'power2.out',
              scrollTrigger: { trigger: line.parentElement, start: 'top 85%', once: true }
            });
        });

        gsap.utils.toArray('.timeline-node').forEach(function (node) {
          gsap.fromTo(node,
            { scale: 0, opacity: 0 },
            {
              scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)',
              scrollTrigger: { trigger: node.parentElement, start: 'top 85%', once: true }
            });
        });

        if (document.querySelector('.hero-halo-1')) {
          gsap.to('.hero-halo-1', { y: -10, rotate: -1.5, duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut' });
        }
        if (document.querySelector('.hero-halo-2')) {
          gsap.to('.hero-halo-2', { y: 8, rotate: 1.5, duration: 4.5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
        }

        window.__runHero = runHero;
        window.addEventListener('load', function () { if (window.ScrollTrigger) ScrollTrigger.refresh(); });
        setTimeout(function () { if (window.ScrollTrigger) ScrollTrigger.refresh(); }, 1200);
      }

      /* INIT */
      function init() {
        if (curtain) {
          curtain.style.transform = 'translateY(100%)';
          curtain.style.visibility = 'hidden';
          curtain.style.pointerEvents = 'none';
        }
        initLenis();
        initGsap();
        initGallery();

        if (navObserver) {
          sections.forEach(function (section) { navObserver.observe(section); });
        }

        window.addEventListener('hashchange', function () {
          var id = window.location.hash.replace('#', '');
          if (id) setActiveNav(id);
        });

        var initialId = window.location.hash.replace('#', '') || 'home';
        setActiveNav(initialId);

        runPreloader();
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
      } else {
        init();
      }
    })();