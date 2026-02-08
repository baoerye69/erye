/**
 * Haoran Wu's Website Main Logic
 * Final Version: Fixed Tab switching and Multi-region Map Navigation
 */

// 1. 核心页面 Tab 切换逻辑 (确保挂载到全局 window)
window.switchTab = function(tabId) {
    console.log("Switching to tab:", tabId);
    const sections = ['home-section', 'resume-section', 'cycling-section'];
    const buttons = ['btn-home', 'btn-resume', 'btn-cycling'];

    // 切换内容显隐
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

    // 切换按钮高亮样式
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

    // 如果进入骑行页面，初始化或修正地图尺寸
    if (tabId === 'cycling') {
        if (!window.map) {
            // 第一次进入时初始化
            setTimeout(initGPXMap, 100);
        } else {
            // 再次进入时重绘，防止地图容器尺寸变化导致的显示问题
            setTimeout(() => {
                window.map.invalidateSize();
            }, 200);
        }
    }
}

// 2. 坐标与地图配置
const LOCATIONS = {
    'boston': { center: [42.3601, -71.0589], zoom: 12 },
    'liverpool': { center: [53.4084, -2.9916], zoom: 12 },
    'suzhou': { center: [31.2990, 120.5853], zoom: 12 },
    'all': { center: [41.8, -72.5], zoom: 7 } // 覆盖纽约和波士顿
};

window.map = null;

function initGPXMap() {
    const container = document.getElementById('gpx-heatmap');
    if (!container || window.map) return;

    // 初始化地图，默认显示全美东海岸视角
    window.map = L.map('gpx-heatmap', {
        zoomControl: true,
        attributionControl: true
    }).setView(LOCATIONS.all.center, LOCATIONS.all.zoom);

    // 加载底图
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(window.map);

    // 隐藏加载动画
    const loader = document.getElementById('map-loading');
    if (loader) loader.style.display = 'none';

    // 渲染足迹并绑定按钮
    renderMyRoutes();
    setupRegionButtons();
}

// 3. 轨迹渲染逻辑 (从 gpx-data.js 读取)
function renderMyRoutes() {
    const data = window.ALL_ROUTES || window.GPX_ROUTES;
    if (!data || !window.map) {
        console.warn("No route data found in window.ALL_ROUTES");
        return;
    }

    console.log(`Rendering ${data.length} tracks...`);

    data.forEach(route => {
        if (route && route.length > 0) {
            L.polyline(route, {
                color: '#7B1FA2', // 经典紫色
                weight: 2,
                opacity: 0.4,
                smoothFactor: 1
            }).addTo(window.map);
        }
    });
}

// 4. 绑定地图区域切换按钮
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
                
                // 丝滑飞越动画
                window.map.flyTo(loc.center, loc.zoom, {
                    duration: 1.5,
                    easeLinearity: 0.25
                });
                
                // 更新按钮样式
                document.querySelectorAll('#region-buttons button').forEach(b => {
                    b.classList.remove('bg-purple-500/20', 'border-purple-500/30');
                    b.classList.add('bg-white/5');
                });
                btn.classList.add('bg-purple-500/20', 'border-purple-500/30');
                btn.classList.remove('bg-white/5');
            };
        }
    });
}

// 5. 启动
document.addEventListener('DOMContentLoaded', () => {
    // 默认进入主页
    window.switchTab('home');
});
