/* ==========================================================================
   STARTUP INTELLIGENCE DASHBOARD — Main JavaScript
   Chart helpers, animations, sidebar toggle, utility functions
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
// SIDEBAR: Mobile toggle
// =============================================================================
document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('open');
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 768 &&
                sidebar.classList.contains('open') &&
                !sidebar.contains(e.target) &&
                !menuToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    }
});

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
