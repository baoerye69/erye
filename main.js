// 1. 页面切换逻辑
window.switchTab = function(tabId) {
    const sections = ['home-section', 'resume-section', 'cycling-section'];
    const buttons = ['btn-home', 'btn-resume', 'btn-cycling'];

    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            // 统一使用 hidden 类来隐藏，这需要配合你 index.html 的设置
            if (id === tabId + '-section') {
                el.classList.remove('hidden');
                el.classList.add('fade-enter-active');
            } else {
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

    // 如果切换到骑行页面，初始化或刷新地图
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

// 2. 地图初始化逻辑
window.map = null;

function initGPXMap() {
    const mapContainer = document.getElementById('gpx-heatmap');
    if (!mapContainer || window.map) return;

    // 强制锁定波士顿中心
    window.map = L.map('gpx-heatmap', {
        zoomControl: true,
        attributionControl: true
    }).setView([42.3601, -71.0589], 12);

    // 添加基础地图层
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(window.map);

    // 隐藏加载动画
    const loader = document.getElementById('map-loading');
    if (loader) loader.style.display = 'none';

    // 尝试渲染轨迹数据
    renderMyRoutes();
}

function renderMyRoutes() {
    // 检查是否存在轨迹数据变量 (ALL_ROUTES 是你在 gpx-data.js 中定义的)
    const routes = window.ALL_ROUTES || window.GPX_ROUTES;
    if (!routes || !window.map) return;

    // 渲染简单的热力图或路径
    routes.forEach(route => {
        L.polyline(route, {
            color: '#9C27B0',
            weight: 3,
            opacity: 0.6
        }).addTo(window.map);
    });
}

// 3. 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 默认显示 Home
    switchTab('home');
});
