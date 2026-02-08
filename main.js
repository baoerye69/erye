/**
 * Haoran Wu's Website Main Logic
 * Optimized for Boston, Liverpool, and Suzhou views
 */

// 1. 页面 Tab 切换逻辑
window.switchTab = function(tabId) {
    const sections = ['home-section', 'resume-section', 'cycling-section'];
    const buttons = ['btn-home', 'btn-resume', 'btn-cycling'];

    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (id === tabId + '-section') {
                el.style.display = 'block';
                el.classList.add('fade-enter-active');
            } else {
                el.style.display = 'none';
                el.classList.remove('fade-enter-active');
            }
        }
    });

    // 按钮高亮状态切换
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

    // 如果进入骑行页面，初始化或刷新地图
    if (tabId === 'cycling') {
        if (!window.map) {
            initGPXMap();
        } else {
            setTimeout(() => {
                window.map.invalidateSize();
            }, 300);
        }
    }
}

// 2. 坐标与地图配置
const LOCATIONS = {
    'boston': { center: [42.3601, -71.0589], zoom: 12 },
    'liverpool': { center: [53.4084, -2.9916], zoom: 12 },
    'suzhou': { center: [31.2990, 120.5853], zoom: 12 },
    'all': { center: [41.8, -72.5], zoom: 7 } // 该坐标可同时覆盖 NY 和 Boston 区域
};

window.map = null;

function initGPXMap() {
    const container = document.getElementById('gpx-heatmap');
    if (!container || window.map) return;

    // 初始化地图，默认显示波士顿及周边全景
    window.map = L.map('gpx-heatmap', {
        zoomControl: true,
        attributionControl: true
    }).setView(LOCATIONS.all.center, LOCATIONS.all.zoom);

    // 使用高质感浅色底图
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(window.map);

    // 移除加载动画
    const loader = document.getElementById('map-loading');
    if (loader) loader.style.display = 'none';

    // 渲染轨迹数据并绑定按钮
    renderMyRoutes();
    setupRegionButtons();
}

// 3. 轨迹渲染逻辑
function renderMyRoutes() {
    const data = window.ALL_ROUTES || window.GPX_ROUTES;
    if (!data || !window.map) {
        console.warn("No route data found in window.ALL_ROUTES");
        return;
    }

    console.log(`Rendering ${data.length} routes...`);

    data.forEach(route => {
        if (route && route.length > 0) {
            L.polyline(route, {
                color: '#7B1FA2', // 专业热力图紫色
                weight: 2,        // 轨迹多时，细线更美观
                opacity: 0.4,     // 叠加产生热力效果
                smoothFactor: 1
            }).addTo(window.map);
        }
    });
}

// 4. 绑定边栏区域按钮
function setupRegionButtons() {
    const mappings = {
        'region-all': 'all',
        'region-us': 'boston',
        'region-uk': 'liverpool',
        'region-asia': 'suzhou'
    };

    Object.keys(mappings).forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.onclick = function(e) {
                e.preventDefault();
                const loc = LOCATIONS[mappings[btnId]];
                // 使用 flyTo 实现丝滑平移
                window.map.flyTo(loc.center, loc.zoom, {
                    duration: 1.5,
                    easeLinearity: 0.25
                });
                
                // 更新按钮视觉反馈 (可选)
                document.querySelectorAll('[id^="region-"]').forEach(b => b.classList.replace('bg-purple-500/20', 'bg-white/5'));
                btn.classList.replace('bg-white/5', 'bg-purple-500/20');
            };
        }
    });
}

// 5. 初始启动
document.addEventListener('DOMContentLoaded', () => {
    // 默认进入主页
    switchTab('home');
});
