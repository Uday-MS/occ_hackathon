/* ==========================================================================
   STARTUPIQ — Main JavaScript
   Three.js 3D Earth, scroll animations, chart helpers, utilities
   ========================================================================== */


// =============================================================================
// UTILITY: Format large numbers for display
// =============================================================================
function formatNumber(num) {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toLocaleString();
}


// =============================================================================
// CHART.JS: Custom tooltip positioner — anchors tooltip at the bar's center-top
// =============================================================================
if (typeof Chart !== 'undefined' && Chart.Tooltip) {
    Chart.Tooltip.positioners.barCenter = function(elements, eventPosition) {
        if (!elements.length) return false;
        const el = elements[0].element;
        return {
            x: el.x,
            y: el.y,
        };
    };
}


// =============================================================================
// CHART.JS: Shared dark-theme chart options factory
// =============================================================================
function getDarkChartOptions(titleText) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            intersect: false,
            mode: 'index',
        },
        plugins: {
            legend: {
                labels: {
                    color: '#94a3b8',
                    font: { family: 'Inter', size: 12, weight: '500' },
                    padding: 16,
                    usePointStyle: true,
                    pointStyleWidth: 10,
                }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleColor: '#f1f5f9',
                bodyColor: '#94a3b8',
                borderColor: 'rgba(148, 163, 184, 0.15)',
                borderWidth: 1,
                padding: 14,
                cornerRadius: 10,
                titleFont: { family: 'Inter', size: 13, weight: '600' },
                bodyFont: { family: 'Inter', size: 12 },
                displayColors: true,
                boxPadding: 4,
                callbacks: {
                    label: function(ctx) {
                        const label = ctx.dataset.label || '';
                        return label + ': $' + formatNumber(ctx.raw);
                    }
                }
            },
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(148, 163, 184, 0.06)',
                    drawBorder: false,
                },
                ticks: {
                    color: '#64748b',
                    font: { family: 'Inter', size: 11 },
                    maxRotation: 45,
                },
                border: { display: false },
            },
            y: {
                grid: {
                    color: 'rgba(148, 163, 184, 0.06)',
                    drawBorder: false,
                },
                ticks: {
                    color: '#64748b',
                    font: { family: 'Inter', size: 11 },
                    callback: function(value) {
                        return '$' + formatNumber(value);
                    }
                },
                border: { display: false },
            }
        }
    };
}


// =============================================================================
// ANIMATED COUNTERS: Animate KPI numbers on page load
// =============================================================================
document.addEventListener('DOMContentLoaded', function() {
    const counters = document.querySelectorAll('[data-counter]');

    counters.forEach(el => {
        const target = parseFloat(el.getAttribute('data-counter'));
        const suffix = el.textContent.replace(/[\d.,\$\s]/g, ''); // Extract suffix like B, M, etc.
        const prefix = el.textContent.match(/^\$/) ? '$' : '';
        const duration = 1200; // ms
        const startTime = performance.now();

        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = target * eased;

            if (target % 1 !== 0) {
                el.textContent = prefix + current.toFixed(2) + suffix;
            } else {
                el.textContent = prefix + Math.floor(current).toLocaleString() + suffix;
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }

        requestAnimationFrame(animate);
    });
});


// =============================================================================
// NAVBAR: Scroll-aware styling
// =============================================================================
document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.getElementById('topNavbar');
    if (!navbar) return;

    function updateNavbar() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', updateNavbar, { passive: true });
    updateNavbar();
});


// =============================================================================
// SCROLL REVEAL: IntersectionObserver for fade-in animations
// =============================================================================
document.addEventListener('DOMContentLoaded', function() {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    if (!revealElements.length) return;

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(function(el) {
        observer.observe(el);
    });
});


// =============================================================================
// PARALLAX: Star field parallax on scroll
// =============================================================================
document.addEventListener('DOMContentLoaded', function() {
    const starfield = document.getElementById('starfield');
    if (!starfield) return;

    function updateParallax() {
        const scrollY = window.scrollY;
        const rate = scrollY * 0.15;
        starfield.style.transform = 'translateY(' + rate + 'px)';
    }

    window.addEventListener('scroll', updateParallax, { passive: true });
});


// =============================================================================
// SCROLL INDICATOR: Fade out on scroll
// =============================================================================
document.addEventListener('DOMContentLoaded', function() {
    const indicator = document.getElementById('scrollIndicator');
    if (!indicator) return;

    function updateIndicator() {
        const opacity = Math.max(0, 1 - window.scrollY / 300);
        indicator.style.opacity = opacity;
        indicator.style.pointerEvents = opacity < 0.3 ? 'none' : 'auto';
    }

    window.addEventListener('scroll', updateIndicator, { passive: true });
});


// =============================================================================
// THREE.JS: 3D Earth with realistic texture, glow, and scroll transitions
// =============================================================================
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if Three.js and the canvas exist
    if (typeof THREE === 'undefined') return;
    const canvas = document.getElementById('earthCanvas');
    if (!canvas) return;

    // -------------------------------------------------------------------------
    // Scene Setup
    // -------------------------------------------------------------------------
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 12;

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // transparent background

    // -------------------------------------------------------------------------
    // Lighting
    // -------------------------------------------------------------------------
    // Soft ambient light
    const ambientLight = new THREE.AmbientLight(0x334466, 0.8);
    scene.add(ambientLight);

    // Main directional light (sun-like, from front-left)
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.8);
    sunLight.position.set(-5, 3, 8);
    scene.add(sunLight);

    // Subtle blue rim light from behind
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.4);
    rimLight.position.set(4, -2, -6);
    scene.add(rimLight);

    // -------------------------------------------------------------------------
    // Earth Geometry & Materials
    // -------------------------------------------------------------------------
    const earthRadius = 2.2;
    const earthGeometry = new THREE.SphereGeometry(earthRadius, 64, 64);

    // Texture loader with fallback
    const textureLoader = new THREE.TextureLoader();

    // Create a procedural fallback texture (blue marble look)
    function createFallbackTexture() {
        const size = 512;
        const c = document.createElement('canvas');
        c.width = size;
        c.height = size;
        const ctx = c.getContext('2d');

        // Ocean base
        const grad = ctx.createLinearGradient(0, 0, size, size);
        grad.addColorStop(0, '#0a2463');
        grad.addColorStop(0.3, '#0c3576');
        grad.addColorStop(0.5, '#1e5f8a');
        grad.addColorStop(0.7, '#0c3576');
        grad.addColorStop(1, '#071a3e');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);

        // Continents (rough shapes)
        ctx.fillStyle = 'rgba(34, 139, 84, 0.5)';
        // North America
        ctx.beginPath();
        ctx.ellipse(120, 140, 60, 50, -0.3, 0, Math.PI * 2);
        ctx.fill();
        // South America
        ctx.beginPath();
        ctx.ellipse(160, 300, 35, 60, 0.2, 0, Math.PI * 2);
        ctx.fill();
        // Europe/Africa
        ctx.beginPath();
        ctx.ellipse(270, 180, 30, 40, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(280, 280, 35, 55, 0, 0, Math.PI * 2);
        ctx.fill();
        // Asia
        ctx.beginPath();
        ctx.ellipse(370, 160, 70, 45, 0.1, 0, Math.PI * 2);
        ctx.fill();
        // Australia
        ctx.beginPath();
        ctx.ellipse(420, 330, 25, 20, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Cloud wisps
        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            ctx.beginPath();
            ctx.ellipse(x, y, 20 + Math.random() * 40, 5 + Math.random() * 10, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();
        }

        const texture = new THREE.CanvasTexture(c);
        return texture;
    }

    // Earth material — start with fallback, load real texture
    const earthMaterial = new THREE.MeshPhongMaterial({
        map: createFallbackTexture(),
        shininess: 25,
        specular: new THREE.Color(0x222244),
    });

    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // Try to load real NASA texture
    const textureUrls = [
        'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
        'https://cdn.jsdelivr.net/gh/turban/webgl-earth@master/images/2_no_clouds_4k.jpg',
    ];

    function tryLoadTexture(urls, index) {
        if (index >= urls.length) return; // all failed, keep fallback
        textureLoader.load(
            urls[index],
            function(texture) {
                texture.colorSpace = THREE.SRGBColorSpace;
                earthMaterial.map = texture;
                earthMaterial.needsUpdate = true;
            },
            undefined,
            function() {
                tryLoadTexture(urls, index + 1);
            }
        );
    }

    tryLoadTexture(textureUrls, 0);

    // -------------------------------------------------------------------------
    // Atmosphere Glow (Fresnel shader)
    // -------------------------------------------------------------------------
    const atmosphereGeometry = new THREE.SphereGeometry(earthRadius * 1.14, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
        vertexShader: [
            'varying vec3 vNormal;',
            'void main() {',
            '    vNormal = normalize(normalMatrix * normal);',
            '    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
            '}'
        ].join('\n'),
        fragmentShader: [
            'varying vec3 vNormal;',
            'void main() {',
            '    float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);',
            '    gl_FragColor = vec4(0.3, 0.7, 1.0, 1.0) * intensity * 1.2;',
            '}'
        ].join('\n'),
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
    });

    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    // -------------------------------------------------------------------------
    // Outer glow ring (subtle additional halo)
    // -------------------------------------------------------------------------
    const outerGlowGeometry = new THREE.SphereGeometry(earthRadius * 1.3, 32, 32);
    const outerGlowMaterial = new THREE.ShaderMaterial({
        vertexShader: [
            'varying vec3 vNormal;',
            'void main() {',
            '    vNormal = normalize(normalMatrix * normal);',
            '    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
            '}'
        ].join('\n'),
        fragmentShader: [
            'varying vec3 vNormal;',
            'void main() {',
            '    float intensity = pow(0.5 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);',
            '    gl_FragColor = vec4(0.2, 0.5, 0.9, 0.6) * intensity;',
            '}'
        ].join('\n'),
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
    });

    const outerGlow = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial);
    scene.add(outerGlow);

    // -------------------------------------------------------------------------
    // Earth Group (so we can position everything together)
    // -------------------------------------------------------------------------
    const earthGroup = new THREE.Group();
    earthGroup.add(earth);
    earthGroup.add(atmosphere);
    earthGroup.add(outerGlow);
    scene.add(earthGroup);

    // Remove individual meshes from scene (they're in the group now)
    scene.remove(earth);
    scene.remove(atmosphere);
    scene.remove(outerGlow);

    // Initial tilt
    earth.rotation.x = 0.15;
    earth.rotation.z = -0.1;

    // -------------------------------------------------------------------------
    // Scroll-based Earth positioning
    // -------------------------------------------------------------------------
    // Hero position: right side
    const heroPos = { x: 3.5, y: 0.2, scale: 1.0 };
    // Analysis section: bottom center, larger (half visible)
    const analysisPos = { x: 0, y: -4.5, scale: 2.2 };

    let scrollProgress = 0;
    const heroSection = document.getElementById('heroSection');
    const analysisSection = document.getElementById('analysisSection');

    function updateScrollProgress() {
        if (!heroSection || !analysisSection) return;

        const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
        const analysisTop = analysisSection.offsetTop;
        const analysisCenter = analysisTop + analysisSection.offsetHeight * 0.5;

        const scrollY = window.scrollY + window.innerHeight * 0.5;

        if (scrollY <= heroBottom) {
            // In hero section
            scrollProgress = 0;
        } else if (scrollY >= analysisCenter) {
            // In analysis section
            scrollProgress = 1;
        } else {
            // Transitioning
            scrollProgress = (scrollY - heroBottom) / (analysisCenter - heroBottom);
        }

        // Clamp
        scrollProgress = Math.max(0, Math.min(1, scrollProgress));
    }

    window.addEventListener('scroll', updateScrollProgress, { passive: true });

    // Smooth interpolation helper
    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    // Easing function (ease-in-out cubic)
    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    // -------------------------------------------------------------------------
    // Animation Loop
    // -------------------------------------------------------------------------
    let currentX = heroPos.x;
    let currentY = heroPos.y;
    let currentScale = heroPos.scale;

    function animate() {
        requestAnimationFrame(animate);

        // Slow rotation
        earth.rotation.y += 0.002;

        // Smooth scroll-driven positioning
        const t = easeInOutCubic(scrollProgress);
        const targetX = lerp(heroPos.x, analysisPos.x, t);
        const targetY = lerp(heroPos.y, analysisPos.y, t);
        const targetScale = lerp(heroPos.scale, analysisPos.scale, t);

        // Smooth interpolation for buttery transitions
        currentX = lerp(currentX, targetX, 0.08);
        currentY = lerp(currentY, targetY, 0.08);
        currentScale = lerp(currentScale, targetScale, 0.08);

        earthGroup.position.set(currentX, currentY, 0);
        earthGroup.scale.setScalar(currentScale);

        // Fade Earth opacity based on how far past analysis section
        const fadeStart = 1.0;
        if (scrollProgress >= fadeStart) {
            // Check if we're past the analysis section entirely
            if (analysisSection) {
                const analysisBotY = analysisSection.offsetTop + analysisSection.offsetHeight;
                const pastAnalysis = (window.scrollY - analysisBotY) / (window.innerHeight * 0.5);
                const fadeAlpha = Math.max(0, 1 - Math.max(0, pastAnalysis));
                earthGroup.visible = fadeAlpha > 0.01;
            }
        } else {
            earthGroup.visible = true;
        }

        renderer.render(scene, camera);
    }

    animate();

    // -------------------------------------------------------------------------
    // Responsive resize
    // -------------------------------------------------------------------------
    function onResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Adjust hero position for smaller screens
        if (window.innerWidth < 1024) {
            heroPos.x = 0;
            heroPos.y = -0.5;
            heroPos.scale = 0.8;
        } else if (window.innerWidth < 1400) {
            heroPos.x = 2.8;
            heroPos.y = 0.2;
            heroPos.scale = 0.9;
        } else {
            heroPos.x = 3.5;
            heroPos.y = 0.2;
            heroPos.scale = 1.0;
        }
    }

    window.addEventListener('resize', onResize);
    onResize();

    // Initial scroll position calculation
    updateScrollProgress();
});
