window.switchTab = function(tabId) {
    const sections = ['home-section', 'resume-section', 'cycling-section'];
    const buttons = ['btn-home', 'btn-resume', 'btn-cycling'];

    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = (id === tabId + '-section') ? 'block' : 'none';
        }
    });

    buttons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            if (id === 'btn-' + tabId) {
                btn.classList.add('bg-white/20');
                btn.classList.remove('text-white/70');
            } else {
                btn.classList.remove('bg-white/20');
                btn.classList.add('text-white/70');
            }
        }
    });

    if (tabId === 'cycling') {
        if (!window.map) {
            setTimeout(initGPXMap, 100);
        } else {
            setTimeout(() => { window.map.invalidateSize(); }, 200);
        }
    }
};

const LOCATIONS = {
    'all': { center: [41.8, -72.5], zoom: 7.2 },
    'boston': { center: [42.3601, -71.0589], zoom: 10 },
    'liverpool': { center: [53.4084, -2.9916], zoom: 10 },
    'suzhou': { center: [31.19899, 120.61026], zoom: 12.5 }
};

window.map = null;

function initGPXMap() {
    const container = document.getElementById('gpx-heatmap');
    if (!container || window.map) return;

    window.map = L.map('gpx-heatmap', { zoomControl: true, attributionControl: false }).setView(LOCATIONS.all.center, LOCATIONS.all.zoom);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(window.map);

    document.getElementById('map-loading').style.display = 'none';
    renderMyRoutes();
    setupRegionButtons();
}

function renderMyRoutes() {
    if (window.ALL_ROUTES) {
        window.ALL_ROUTES.forEach(route => {
            L.polyline(route, { color: '#7B1FA2', weight: 2, opacity: 0.4 }).addTo(window.map);
        });
    }
}

function setupRegionButtons() {
    const btnConfigs = [
        { id: 'region-all', key: 'all' },
        { id: 'region-us', key: 'boston' },
        { id: 'region-uk', key: 'liverpool' },
        { id: 'region-asia', key: 'suzhou' }
    ];

    btnConfigs.forEach(config => {
        const btn = document.getElementById(config.id);
        if (btn) {
            btn.onclick = function(e) {
                e.preventDefault();
                window.map.flyTo(LOCATIONS[config.key].center, LOCATIONS[config.key].zoom, { duration: 1.5 });
                
                // 统一切换高亮状态
                btnConfigs.forEach(cfg => {
                    const targetBtn = document.getElementById(cfg.id);
                    if (targetBtn) {
                        targetBtn.classList.remove('bg-white/30', 'text-white', 'scale-[1.02]', 'shadow-lg');
                        targetBtn.classList.add('bg-white/5', 'text-white/70');
                    }
                });

                btn.classList.add('bg-white/30', 'text-white', 'scale-[1.02]', 'shadow-lg');
                btn.classList.remove('bg-white/5', 'text-white/70');
            };
        }
    });
}

document.addEventListener('DOMContentLoaded', () => { window.switchTab('home'); });
