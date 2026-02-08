window.switchTab = function(tabId) {
    const sections = ['home-section', 'resume-section', 'cycling-section'];
    const buttons = ['btn-home', 'btn-resume', 'btn-cycling'];

    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (id === tabId + '-section') {
                el.style.display = 'block';
                el.classList.remove('hidden-section');
            } else {
                el.style.display = 'none';
                el.classList.add('hidden-section');
            }
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
}

const LOCATIONS = {
    'all': { center: [41.8, -72.5], zoom: 7.2 },
    'boston': { center: [42.3601, -71.0589], zoom: 9.5 },
    'liverpool': { center: [53.4084, -2.9916], zoom: 9.5 },
    'suzhou': { center: [31.19899, 120.61026], zoom: 12.5 } // 精准定位到你要求的坐标
};

window.map = null;

function initGPXMap() {
    const container = document.getElementById('gpx-heatmap');
    if (!container || window.map) return;

    window.map = L.map('gpx-heatmap', {
        zoomControl: true,
        attributionControl: false
    }).setView(LOCATIONS.all.center, LOCATIONS.all.zoom);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(window.map);

    document.getElementById('map-loading').style.display = 'none';
    renderMyRoutes();
    setupRegionButtons();
}

function renderMyRoutes() {
    const data = window.ALL_ROUTES;
    if (!data) return;
    data.forEach(route => {
        L.polyline(route, { color: '#0437F2', weight: 2, opacity: 0.5 }).addTo(window.map); // 轨迹也改为蓝色系
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
                window.map.flyTo(LOCATIONS[config.key].center, LOCATIONS[config.key].zoom, { duration: 1.5 });
                
                // 切换 class 实现美观的高亮效果
                btnConfigs.forEach(cfg => {
                    const b = document.getElementById(cfg.id);
                    if (b) {
                        b.classList.remove('active-region');
                        b.classList.add('inactive-region');
                    }
                });
                btn.classList.add('active-region');
                btn.classList.remove('inactive-region');
            };
        }
    });
}

document.addEventListener('DOMContentLoaded', () => { window.switchTab('home'); });
