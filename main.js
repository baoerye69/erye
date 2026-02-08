/**
 * Haoran Wu's Website Main Logic
 * Updated: Better zoom levels & persistent button highlighting
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

// 调整后的城市配置
const LOCATIONS = {
    'all': { center: [41.8, -72.5], zoom: 7.5 },     // 稍微缩小，确保覆盖 NY 到 Boston
    'boston': { center: [42.3601, -71.0589], zoom: 11 }, // 缩小到 11 倍，覆盖大波士顿地区
    'liverpool': { center: [53.4084, -2.9916], zoom: 11 }, // 覆盖利物浦及周边
    'suzhou': { center: [31.33, 120.65], zoom: 11.5 }    // 偏移中心到东部工业园区/骑行活跃区
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
        attribution: '&copy; OpenStreetMap &copy; CARTO'
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

// 处理地区按钮的点击与选中框逻辑
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
                
                // --- 选中框切换逻辑 ---
                // 1. 清除所有按钮的选中样式（紫色背景 + 边框）
                btnConfigs.forEach(cfg => {
                    const b = document.getElementById(cfg.id);
                    if (b) {
                        b.classList.remove('bg-purple-500/20', 'border-purple-500/30');
                        b.classList.add('bg-white/5', 'text-white/70');
                    }
                });

                // 2. 为当前点击的按钮添加选中样式
                btn.classList.add('bg-purple-500/20', 'border-purple-500/30');
                btn.classList.remove('bg-white/5', 'text-white/70');
            };
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    window.switchTab('home');
});
