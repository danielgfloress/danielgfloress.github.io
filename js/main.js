/* ═══════════════════════════════════════════════════
   DANIEL GARCÍA FLORES — main.js
═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    // ── Año en el footer ──────────────────────────────
    document.getElementById('year').textContent = new Date().getFullYear();

    // ── Navbar: añade clase scrolled al hacer scroll ──
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });

    // ── Menú móvil ───────────────────────────────────
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    menuBtn.addEventListener('click', () => {
        const isOpen = !mobileMenu.classList.contains('hidden');
        mobileMenu.classList.toggle('hidden', isOpen);
        menuBtn.classList.toggle('active', !isOpen);
    });

    // Cierra el menú móvil al hacer clic en un enlace
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            menuBtn.classList.remove('active');
        });
    });

    // ── Parallax en el hero ──────────────────────────
    const heroBg = document.getElementById('hero-bg');
    if (heroBg) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            const heroH = document.getElementById('hero').offsetHeight;
            if (scrollY < heroH) {
                const pct = scrollY / heroH;
                heroBg.style.transform = `translateY(${pct * 80}px)`;
            }
        }, { passive: true });
    }

    // ── Scroll Reveal con IntersectionObserver ────────
    const revealEls = document.querySelectorAll(
        '.reveal-up, .reveal-left, .reveal-right'
    );

    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach(el => revealObserver.observe(el));

    // ── Lightbox ─────────────────────────────────────
    const lightbox = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightbox-img');
    const lbTitle = document.getElementById('lightbox-title');
    const lbCategory = document.getElementById('lightbox-category');
    const lbClose = document.getElementById('lightbox-close');
    const lbPrev = document.getElementById('lightbox-prev');
    const lbNext = document.getElementById('lightbox-next');

    const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));

    document.querySelectorAll('.video-item video').forEach(video => {

        video.addEventListener('mouseenter', () => {
            video.play();
        });

        video.addEventListener('mouseleave', () => {
            video.pause();
            video.currentTime = 0;
        });

    });
    let currentIndex = 0;

    // Contenedor de vídeo en lightbox (lo creamos dinámicamente)
    let lbVideo = null;
    let lbVimeo = null;

    function clearLightboxMedia() {
        lbImg.style.display = 'none';
        lbImg.src = '';
        if (lbVideo) {
            lbVideo.pause();
            lbVideo.remove();
            lbVideo = null;
        }
        if (lbVimeo) {
            lbVimeo.remove();
            lbVimeo = null;
        }
    }

    function showInLightbox(item) {
        clearLightboxMedia();
        lbTitle.textContent = item.dataset.title;
        lbCategory.textContent = item.dataset.category;

        if (item.dataset.vimeo) {
            const wrapper = document.createElement('div');
            wrapper.className = 'relative mx-auto w-[min(92vw,46.125vh)] h-[82vh] max-h-[82vh]';
            wrapper.style.aspectRatio = '9 / 16';

            const iframe = document.createElement('iframe');
            iframe.src = item.dataset.vimeo;
            iframe.allow = 'autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share';
            iframe.referrerPolicy = 'strict-origin-when-cross-origin';
            iframe.title = item.querySelector('iframe')?.title || 'Vimeo video';
            iframe.className = 'absolute inset-0 w-full h-full';
            iframe.setAttribute('frameborder', '0');

            wrapper.appendChild(iframe);
            lbVimeo = wrapper;
            lbImg.parentNode.insertBefore(wrapper, lbImg);
        } else if (item.dataset.video) {
            // Es un vídeo de galería → mostrar vídeo en lightbox
            lbVideo = document.createElement('video');
            lbVideo.src = item.dataset.video;
            lbVideo.controls = true;
            lbVideo.autoplay = true;
            lbVideo.className = 'max-w-full max-h-[75vh] mx-auto block';
            lbImg.parentNode.insertBefore(lbVideo, lbImg);
        } else {
            // Es una foto → mostrar imagen
            lbImg.style.display = 'block';
            lbImg.src = item.dataset.src;
        }
    }

    function openLightbox(index) {
        currentIndex = index;
        showInLightbox(galleryItems[index]);
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(clearLightboxMedia, 300);
    }

    function goTo(index) {
        const total = galleryItems.length;
        currentIndex = (index + total) % total;
        lbImg.style.opacity = '0';
        setTimeout(() => {
            showInLightbox(galleryItems[currentIndex]);
            lbImg.style.opacity = '1';
        }, 150);
    }

    // Abrir lightbox al clic en item de galería
    galleryItems.forEach((item, i) => {
        item.addEventListener('click', () => openLightbox(i));
    });

    // Cerrar
    lbClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', e => {
        if (e.target === lightbox) closeLightbox();
    });

    // Navegación
    lbPrev.addEventListener('click', e => { e.stopPropagation(); goTo(currentIndex - 1); });
    lbNext.addEventListener('click', e => { e.stopPropagation(); goTo(currentIndex + 1); });

    // Teclado
    document.addEventListener('keydown', e => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') goTo(currentIndex - 1);
        if (e.key === 'ArrowRight') goTo(currentIndex + 1);
    });

    // Touch swipe en lightbox
    let touchStartX = 0;
    lightbox.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    lightbox.addEventListener('touchend', e => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) goTo(currentIndex + (diff > 0 ? 1 : -1));
    }, { passive: true });

    // ── Showreel: play/pause toggle ──────────────────
    const video = document.getElementById('showreel-video');
    const vimeoIframe = document.getElementById('showreel-vimeo');
    const overlay = document.getElementById('video-overlay');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');

    const showOverlay = () => {
        overlay.style.opacity = '1';
        overlay.style.pointerEvents = 'auto';
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');
    };

    const hideOverlay = () => {
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
        playIcon.classList.add('hidden');
        pauseIcon.classList.remove('hidden');
    };

    if (vimeoIframe && overlay && window.Vimeo) {
        const vimeoPlayer = new Vimeo.Player(vimeoIframe);

        overlay.addEventListener('click', async () => {
            try {
                await vimeoPlayer.play();
                hideOverlay();
            } catch (error) {
                console.warn('No se pudo controlar el reproductor de Vimeo.', error);
            }
        });

        vimeoPlayer.on('play', hideOverlay);
        vimeoPlayer.on('ended', showOverlay);
        vimeoPlayer.on('pause', showOverlay);
    } else if (video && overlay) {
        overlay.addEventListener('click', () => {
            if (video.paused) {
                video.play();
                hideOverlay();
            } else if(video.play) {
                video.pause();
                showOverlay();
            }
        });

        // Vuelve a mostrar el overlay al acabar el vídeo
        video.addEventListener('ended', () => {
            showOverlay();
        });

        // Al hover sobre el vídeo en reproducción, muestra el overlay tenuemente
        video.addEventListener('mouseenter', () => {
            if (!video.paused) overlay.style.opacity = '0.3';
        });
        video.addEventListener('mouseleave', () => {
            if (!video.paused) overlay.style.opacity = '0';
        });
    }

    // ── Transición suave img en lightbox ─────────────
    if (lbImg) {
        lbImg.style.transition = 'opacity 0.15s ease';
    }

});
