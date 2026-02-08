/**
 * Haoran Wu's Website Main Logic
 * Final Tuning: Focused on Dushu Lake (Suzhou) & Clean UI
 */

window.switchTab = function(tabId) {
    const sections = ['home-section', 'resume-section', 'cycling-section'];
    const buttons = ['btn-home', 'btn-resume', 'btn-cycling'];

    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (id === tabId + '-section') {
                el.style.display = 'block';
                el.classList.remove('hidden');
            } else {
                el.style.display = 'none';
                el.classList.add('hidden');
            }
        }
    });

    buttons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            if (id === 'btn-' + tabId) {
                btn.classList.add('bg-white/10', 'border-white/5');
                btn.classList.remove('text-white/60', 'border-transparent');
            } else {
                btn.classList.remove('bg-white/10', 'border-white/5');
                btn.classList.add('text-white/60', 'border-transparent');
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
}

// 修正后的地理位置配置
const LOCATIONS = {
    'all': { center: [41.8, -72.5], zoom: 7.2 },
    'boston': { center: [42.3601, -71.0589], zoom: 10 },    // 更宽阔的波士顿视野
    'liverpool': { center: [53.4084, -2.9916], zoom: 10 }, // 更宽阔的利物浦视野
    'suzhou': { center: [31.275, 120.735], zoom: 12.5 }    // 精准对准独墅湖高教区路线中心
};

window.map = null;

function initGPXMap() {
    const container = document.getElementById('gpx-heatmap');
    if (!container || window.map) return;

    window.map = L.map('gpx-heatmap', {
        zoomControl: true,
        attributionControl: true
    }).setView(LOCATIONS.all.center, LOCATIONS.all.zoom);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap'
    }).addTo(window.map);

    document.getElementById('map-loading').style.display = 'none';

    renderMyRoutes();
    setupRegionButtons();
}

function renderMyRoutes() {
    const data = window.ALL_ROUTES || window.GPX_ROUTES;
    if (!data || !window.map) return;

    data.forEach(route => {
        if (route && route.length > 0) {
            L.polyline(route, {
                color: '#7B1FA2',
                weight: 2,
                opacity: 0.4
            }).addTo(window.map);
        }
    });
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
                const loc = LOCATIONS[config.key];
                window.map.flyTo(loc.center, loc.zoom, { duration: 1.5 });
                
                // 切换样式：仅保留背景深浅变化，彻底移除白框
                btnConfigs.forEach(cfg => {
                    const b = document.getElementById(cfg.id);
                    if (b) {
                        b.classList.remove('bg-purple-500/30', 'text-white');
                        b.classList.add('bg-white/5', 'text-white/70');
                        b.style.border = "none";
                        b.style.outline = "none";
                        b.style.boxShadow = "none";
                    }
                });

                btn.classList.add('bg-purple-500/30', 'text-white');
                btn.classList.remove('bg-white/5', 'text-white/70');
            };
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    window.switchTab('home');
});
