document.addEventListener('DOMContentLoaded', () => {

    /* =========================================
       0. Preloader Logic (Cinematic)
       ========================================= */
    const loader = document.getElementById('loader');
    const counterElement = document.querySelector('.loader-counter');
    const loaderStatus = document.querySelector('.loader-status');

    // Disable scroll initially
    document.body.style.overflow = 'hidden';

    // Simulate Loading
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 5);
        if (progress > 100) progress = 100;

        counterElement.innerText = progress;

        if (progress === 100) {
            clearInterval(interval);
            loaderStatus.innerText = "SYSTEM ONLINE";

            setTimeout(() => {
                loader.classList.add('loaded');
                document.body.style.overflow = ''; // Re-enable scroll
                initHeroAnimations();
            }, 500);
        }
    }, 40); // Slightly slower for drama


    /* =========================================
       1. Setup Lenis (Smooth Scroll)
       ========================================= */
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true
    });
    window.lenis = lenis;

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    gsap.registerPlugin(ScrollTrigger);

    function initHeroAnimations() {
        // ... (Existing hero text reveal logic can be moved here or triggered by scrollTrigger naturally)
    }

    /* =========================================
       2. Three.js Background (Subtle Particles)
       ========================================= */
    // Init ThreeJS on all devices
    const initThreeJS = () => {
        const canvas = document.getElementById('webgl-canvas');
        if (!canvas) return;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Partilces
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 500; // reduced count

        const posArray = new Float32Array(particlesCount * 3);

        for (let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 15; // Spread
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

        const material = new THREE.PointsMaterial({
            size: 0.02,
            color: 0x888888,
            transparent: true,
            opacity: 0.8
        });

        const particlesMesh = new THREE.Points(particlesGeometry, material);
        scene.add(particlesMesh);

        camera.position.z = 2;

        // Interaction
        let mouseX = 0;
        let mouseY = 0;

        document.addEventListener('mousemove', (event) => {
            mouseX = event.clientX / window.innerWidth - 0.5;
            mouseY = event.clientY / window.innerHeight - 0.5;
        });

        let isPaused = false;
        window.threePaused = false; // Global flag

        const animate = () => {
            requestAnimationFrame(animate);

            // Check global pause flag
            if (window.threePaused) return;

            particlesMesh.rotation.y += 0.001;
            particlesMesh.rotation.x += 0.001;

            // Mouse parallax influence
            particlesMesh.rotation.x += mouseY * 0.05;
            particlesMesh.rotation.y += mouseX * 0.05;

            renderer.render(scene, camera);
        };

        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    };
    initThreeJS();

    /* =========================================
       3. Custom Cursor Logic
       ========================================= */
    if (window.matchMedia("(hover: hover)").matches) {
        const cursorDot = document.querySelector('.cursor-dot');
        const cursorOutline = document.querySelector('.cursor-outline');

        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;

            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;

            cursorOutline.animate({
                left: `${posX}px`,
                top: `${posY}px`
            }, { duration: 500, fill: "forwards" });
        });

        const hoverables = document.querySelectorAll('a, button, .project-item, .mini-card');
        hoverables.forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
        });
    }


    /* =========================================
       4. Magnet Button Effect
       ========================================= */
    const magnets = document.querySelectorAll('.magnet-btn');
    magnets.forEach((magnet) => {
        magnet.addEventListener('mousemove', (e) => {
            const rect = magnet.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(magnet, {
                x: x * 0.3,
                y: y * 0.3,
                duration: 0.3
            });
            const text = magnet.querySelector('span');
            if (text) {
                gsap.to(text, { x: x * 0.1, y: y * 0.1, duration: 0.3 });
            }
        });

        magnet.addEventListener('mouseleave', () => {
            gsap.to(magnet, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.3)" });
            const text = magnet.querySelector('span');
            if (text) {
                gsap.to(text, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.3)" });
            }
        });
    });


    /* =========================================
       5. Parallax Elements
       ========================================= */
    if (window.matchMedia("(min-width: 900px)").matches) {
        gsap.utils.toArray('.parallax-el').forEach(el => {
            const speed = el.getAttribute('data-speed');
            gsap.to(el, {
                y: (i, target) => ScrollTrigger.maxScroll(window) * speed,
                ease: "none",
                scrollTrigger: {
                    trigger: document.body,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 0
                }
            });
        });
    }

    /* =========================================
       6. Text Reveals
       ========================================= */
    // Only animate if element is in view to save resources
    const revealTexts = document.querySelectorAll('.reveal-text, .hero-title, .subtitle');

    revealTexts.forEach(text => {
        gsap.fromTo(text,
            { y: 50, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: text,
                    start: "top 90%"
                }
            }
        );
    });

    gsap.to('.line-animated', {
        scaleX: 1,
        duration: 1.5,
        ease: "power3.inOut",
        scrollTrigger: {
            trigger: '.projects-section',
            start: "top 70%"
        }
    });

    /* =========================================
       7. Mobile Nav
       ========================================= */
    const mobileToggle = document.querySelector('.mobile-toggle');
    const mobileNav = document.querySelector('.mobile-nav-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            mobileNav.classList.toggle('active');

            // Stagger links
            if (mobileNav.classList.contains('active')) {
                gsap.to(mobileLinks, {
                    y: 0, opacity: 1,
                    stagger: 0.1, delay: 0.2
                });
            } else {
                gsap.to(mobileLinks, {
                    y: 20, opacity: 0
                });
            }
        });
    }

    // Close nav when link clicked
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileNav.classList.remove('active');
        });
    });


    /* =========================================
       8. Project Modal Logic
       ========================================= */
    const modal = document.getElementById('project-modal');
    const modalClose = document.querySelector('.modal-close');
    const modalOverlay = document.querySelector('.modal-overlay');
    const projectItems = document.querySelectorAll('.project-item');

    // Content Elements
    const mTitle = document.getElementById('modal-title');
    const mDesc = document.getElementById('modal-desc');
    const mTech = document.getElementById('modal-tech');
    const mLive = document.getElementById('modal-live');
    const mCode = document.getElementById('modal-code');
    const mTrack = document.getElementById('gallery-track');
    const prevBtn = document.getElementById('gallery-prev');
    const nextBtn = document.getElementById('gallery-next');

    let currentSlide = 0;
    let totalSlides = 0;

    projectItems.forEach(item => {
        item.addEventListener('click', () => {
            const title = item.getAttribute('data-title');
            const desc = item.getAttribute('data-desc');
            const tech = JSON.parse(item.getAttribute('data-tech') || '[]');
            const images = JSON.parse(item.getAttribute('data-images') || '[]');
            const liveLink = item.getAttribute('data-live');
            const codeLink = item.getAttribute('data-code');

            if (!title) return; // Ignore if no data (e.g. non-data items)

            // Populate Text
            mTitle.innerText = title;
            mDesc.innerText = desc;

            // Populate Tech Stack
            mTech.innerHTML = tech.map(t => `<span class="tech-tag">${t}</span>`).join('');

            // Handle Links
            if (liveLink) {
                mLive.href = liveLink;
                mLive.style.display = 'inline-block';
            } else {
                mLive.style.display = 'none';
            }

            if (codeLink) {
                mCode.href = codeLink;
                mCode.style.display = 'inline-block';
            } else {
                mCode.style.display = 'none';
            }

            // Populate Gallery
            mTrack.innerHTML = '';
            currentSlide = 0;
            totalSlides = images.length;

            if (totalSlides > 0) {
                images.forEach(imgSrc => {
                    const img = document.createElement('img');
                    img.src = imgSrc;
                    img.className = 'gallery-img';
                    mTrack.appendChild(img);
                });
            } else {
                // Fallback if no images
                mTrack.innerHTML = '<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:#555;">No Preview Available</div>';
            }

            // Manage Gallery Nav Visibility
            if (totalSlides <= 1) {
                prevBtn.style.display = 'none';
                nextBtn.style.display = 'none';
            } else {
                prevBtn.style.display = 'flex';
                nextBtn.style.display = 'flex';
            }
            updateGallery();

            // Open Modal
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scroll
            window.threePaused = true; // Pause WebGL
        });
    });

    // Close Modal Function
    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        window.threePaused = false; // Resume WebGL
    };

    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });

    // Gallery Navigation
    const updateGallery = () => {
        const offset = -(currentSlide * 100);
        mTrack.style.transform = `translateX(${offset}%)`;
    };

    prevBtn.addEventListener('click', () => {
        if (currentSlide > 0) {
            currentSlide--;
            updateGallery();
        } else {
            currentSlide = totalSlides - 1; // Loop
            updateGallery();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentSlide < totalSlides - 1) {
            currentSlide++;
            updateGallery();
        } else {
            currentSlide = 0; // Loop
            updateGallery();
        }
    });

});
