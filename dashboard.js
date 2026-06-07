// ==========================================
// 权限校验：未登录严禁访问大屏
// ==========================================
(function() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "/login.html";
    }
})();

const BASE_URL = "http://localhost:8080";
let isBackendOnline = false;

// 本地存储对应键
const LS = {
    books: "hz_admin_books",
    habits: "hz_admin_habits",
    habitsDone: "hz_admin_habits_done",
    settings: "hz_admin_settings",
    offlineFeedback: "hz_feedback_offline", // 接收前台的离线留言
    chartData: "hz_admin_chart_data",
    carousel: "hz_admin_carousel"
};

// ==========================================
// 数据中心：图表管理逻辑
// ==========================================
const DEFAULT_CHART_DATA = {
    growth: [
        { year: '2023', books: 60, health: 70, tech: 40 },
        { year: '2024', books: 75, health: 80, tech: 65 },
        { year: '2025', books: 82, health: 85, tech: 80 },
        { year: '2026', books: 95, health: 90, tech: 96 }
    ],
    musicStyles: [
        { name: '流行音乐', value: 35 },
        { name: '古典音乐', value: 20 },
        { name: '电子音乐', value: 25 },
        { name: '摇滚音乐', value: 20 }
    ],
    health: [
        { label: '周一', sleep: 7, cardio: 30, score: 85 },
        { label: '周三', sleep: 8, cardio: 45, score: 90 },
        { label: '周五', sleep: 6.5, cardio: 60, score: 88 },
        { label: '周日', sleep: 9, cardio: 20, score: 95 }
    ]
};

async function initDataCenter() {
    let data = DEFAULT_CHART_DATA;
    
    if (isBackendOnline) {
        try {
            const growth = await apiRequest("/statistic/type/growth");
            const musicStyles = await apiRequest("/statistic/type/music_style");
            const health = await apiRequest("/statistic/type/health");
            
            if (growth && growth.length > 0) {
                data.growth = growth.map(g => ({
                    id: g.id,
                    year: g.dataKey || g.data_key,
                    books: g.value1,
                    health: g.value2,
                    tech: g.value3
                }));
            }
            if (musicStyles && musicStyles.length > 0) {
                data.musicStyles = musicStyles.map(m => ({
                    id: m.id,
                    name: m.dataKey || m.data_key,
                    value: m.value1
                }));
            }
            if (health && health.length > 0) {
                data.health = health.map(h => ({
                    id: h.id,
                    label: h.dataKey || h.data_key,
                    sleep: h.value1,
                    cardio: h.value2,
                    score: h.value3
                }));
            }
        } catch (e) {
            console.warn("从后端加载图表数据失败，使用本地缓存");
            data = lsGet(LS.chartData, DEFAULT_CHART_DATA);
        }
    } else {
        data = lsGet(LS.chartData, DEFAULT_CHART_DATA);
    }
    
    // 渲染成长数据输入框
    const growthContainer = document.getElementById('growth-data-inputs');
    if (growthContainer) {
        growthContainer.innerHTML = (data.growth || []).map((g, i) => `
            <div class="grid grid-cols-5 gap-4 items-center animate-fade-in" data-id="${g.id || ''}">
                <input type="text" value="${g.year}" class="growth-year bg-white/50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800" placeholder="年份">
                <input type="number" value="${g.books}" class="growth-books bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-indigo-600">
                <input type="number" value="${g.health}" class="growth-health bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-rose-500">
                <input type="number" value="${g.tech}" class="growth-tech bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-blue-600">
                <div class="flex justify-center">
                    <button onclick="removeDataRow(this, 'growth')" class="text-slate-300 hover:text-rose-500 transition-all"><i class="fa-solid fa-trash-can text-[10px]"></i></button>
                </div>
            </div>
        `).join('');
    }

    // 渲染音乐风格
    const musicContainer = document.getElementById('music-style-inputs');
    if (musicContainer) {
        musicContainer.innerHTML = (data.musicStyles || []).map((m, i) => `
            <div class="grid grid-cols-5 gap-4 items-center animate-fade-in" data-id="${m.id || ''}">
                <input type="text" value="${m.name}" class="music-style-name col-span-2 bg-white/50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800" placeholder="风格名称">
                <input type="number" value="${m.value}" class="music-style-value col-span-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-blue-600">
                <div class="flex justify-center">
                    <button onclick="removeDataRow(this, 'music_style')" class="text-slate-300 hover:text-rose-500 transition-all"><i class="fa-solid fa-trash-can text-[10px]"></i></button>
                </div>
            </div>
        `).join('');
    }

    // 渲染健康数据
    const healthContainer = document.getElementById('health-data-inputs');
    if (healthContainer) {
        healthContainer.innerHTML = (data.health || []).map((h, i) => `
            <div class="grid grid-cols-5 gap-4 items-center animate-fade-in" data-id="${h.id || ''}">
                <input type="text" value="${h.label}" class="health-label bg-white/50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800">
                <input type="number" step="0.1" value="${h.sleep}" class="health-sleep bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-indigo-600">
                <input type="number" value="${h.cardio}" class="health-cardio bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-rose-500">
                <input type="number" value="${h.score}" class="health-score bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-emerald-600">
                <div class="flex justify-center">
                    <button onclick="removeDataRow(this, 'health')" class="text-slate-300 hover:text-rose-500 transition-all"><i class="fa-solid fa-trash-can text-[10px]"></i></button>
                </div>
            </div>
        `).join('');
    }
}

window.addMusicStyleRow = function() {
    const container = document.getElementById('music-style-inputs');
    const div = document.createElement('div');
    div.className = "grid grid-cols-5 gap-4 items-center animate-fade-in";
    div.setAttribute('data-id', '');
    div.innerHTML = `
        <input type="text" class="music-style-name col-span-2 bg-white/50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800" placeholder="风格名称">
        <input type="number" class="music-style-value col-span-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-blue-600" value="0">
        <div class="flex justify-center">
            <button onclick="removeDataRow(this, 'music_style')" class="text-slate-300 hover:text-rose-500 transition-all"><i class="fa-solid fa-trash-can text-[10px]"></i></button>
        </div>
    `;
    container.appendChild(div);
}

window.addGrowthRow = function() {
    const container = document.getElementById('growth-data-inputs');
    const div = document.createElement('div');
    div.className = "grid grid-cols-5 gap-4 items-center animate-fade-in";
    div.setAttribute('data-id', '');
    div.innerHTML = `
        <input type="text" class="growth-year bg-white/50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800" placeholder="年份">
        <input type="number" class="growth-books bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-indigo-600" value="0">
        <input type="number" class="growth-health bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-rose-500" value="0">
        <input type="number" class="growth-tech bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-blue-600" value="0">
        <div class="flex justify-center">
            <button onclick="removeDataRow(this, 'growth')" class="text-slate-300 hover:text-rose-500 transition-all"><i class="fa-solid fa-trash-can text-[10px]"></i></button>
        </div>
    `;
    container.appendChild(div);
}

window.addHealthRow = function() {
    const container = document.getElementById('health-data-inputs');
    const div = document.createElement('div');
    div.className = "grid grid-cols-5 gap-4 items-center animate-fade-in";
    div.setAttribute('data-id', '');
    div.innerHTML = `
        <input type="text" class="health-label bg-white/50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800" placeholder="周期">
        <input type="number" step="0.1" class="health-sleep bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-indigo-600" value="0">
        <input type="number" class="health-cardio bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-rose-500" value="0">
        <input type="number" class="health-score bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-emerald-600" value="0">
        <div class="flex justify-center">
            <button onclick="removeDataRow(this, 'health')" class="text-slate-300 hover:text-rose-500 transition-all"><i class="fa-solid fa-trash-can text-[10px]"></i></button>
        </div>
    `;
    container.appendChild(div);
}

window.removeDataRow = function(btn, type) {
    const row = btn.closest('.grid');
    const id = row.getAttribute('data-id');
    
    showVisionConfirm("删除数据", "确认删除该条图表原始数据吗？", async () => {
        if (isBackendOnline && id) {
            try {
                await apiRequest(`/statistic/delete/${id}`, { method: "DELETE" });
            } catch (e) {
                showToast("从数据库移除失败: " + e.message, true);
                return;
            }
        }
        row.classList.add('opacity-0', 'scale-95');
        setTimeout(() => row.remove(), 300);
        showToast("数据已移除。记得点击上方保存同步。");
    });
}

window.resetDataCenterToDefault = function() {
    showVisionConfirm("重置数据中心", "这将清空当前所有图表数据并恢复为系统默认初始值。确认继续吗？", async () => {
        if (isBackendOnline) {
            try {
                // 先删除旧的
                const types = ['growth', 'music_style', 'health'];
                for (const t of types) {
                    const items = await apiRequest(`/statistic/type/${t}`);
                    for (const item of items) {
                        await apiRequest(`/statistic/delete/${item.id}`, { method: "DELETE" });
                    }
                }
                
                // 再插入新的
                for (const g of DEFAULT_CHART_DATA.growth) {
                    await apiRequest("/statistic/add", { method: "POST", body: { type: 'growth', dataKey: g.year, value1: g.books, value2: g.health, value3: g.tech } });
                }
                for (const m of DEFAULT_CHART_DATA.musicStyles) {
                    await apiRequest("/statistic/add", { method: "POST", body: { type: 'music_style', dataKey: m.name, value1: m.value } });
                }
                for (const h of DEFAULT_CHART_DATA.health) {
                    await apiRequest("/statistic/add", { method: "POST", body: { type: 'health', dataKey: h.label, value1: h.sleep, value2: h.cardio, value3: h.score } });
                }
                showToast("已成功重置并同步至后端！");
            } catch (e) {
                showToast("重置失败: " + e.message, true);
            }
        }
        
        lsSet(LS.chartData, DEFAULT_CHART_DATA);
        initDataCenter();
        showToast("数据已重置为默认值。");
    });
}

window.saveAllChartData = async function() {
    const data = {
        growth: [],
        musicStyles: [],
        health: []
    };

    // 收集成长数据
    const growthRows = document.querySelectorAll('#growth-data-inputs > div');
    for (let i = 0; i < growthRows.length; i++) {
        const row = growthRows[i];
        data.growth.push({
            id: row.getAttribute('data-id'),
            year: row.querySelector('.growth-year').value,
            books: parseInt(row.querySelector('.growth-books').value) || 0,
            health: parseInt(row.querySelector('.growth-health').value) || 0,
            tech: parseInt(row.querySelector('.growth-tech').value) || 0,
            sort: i
        });
    }

    // 收集音乐风格
    const musicRows = document.querySelectorAll('#music-style-inputs > div');
    for (let i = 0; i < musicRows.length; i++) {
        const row = musicRows[i];
        data.musicStyles.push({
            id: row.getAttribute('data-id'),
            name: row.querySelector('.music-style-name').value,
            value: parseInt(row.querySelector('.music-style-value').value) || 0,
            sort: i
        });
    }

    // 收集健康数据
    const healthRows = document.querySelectorAll('#health-data-inputs > div');
    for (let i = 0; i < healthRows.length; i++) {
        const row = healthRows[i];
        data.health.push({
            id: row.getAttribute('data-id'),
            label: row.querySelector('.health-label').value,
            sleep: parseFloat(row.querySelector('.health-sleep').value) || 0,
            cardio: parseInt(row.querySelector('.health-cardio').value) || 0,
            score: parseInt(row.querySelector('.health-score').value) || 0,
            sort: i
        });
    }

    if (isBackendOnline) {
        try {
            // 这里我们逐个发送更新或新增请求，简单起见，我们假设数据量不大
            for (const item of data.growth) {
                const payload = { type: 'growth', dataKey: item.year, value1: item.books, value2: item.health, value3: item.tech, sort: item.sort };
                if (item.id) { payload.id = item.id; await apiRequest("/statistic/update", { method: "PUT", body: payload }); }
                else { await apiRequest("/statistic/add", { method: "POST", body: payload }); }
            }
            for (const item of data.musicStyles) {
                const payload = { type: 'music_style', dataKey: item.name, value1: item.value, sort: item.sort };
                if (item.id) { payload.id = item.id; await apiRequest("/statistic/update", { method: "PUT", body: payload }); }
                else { await apiRequest("/statistic/add", { method: "POST", body: payload }); }
            }
            for (const item of data.health) {
                const payload = { type: 'health', dataKey: item.label, value1: item.sleep, value2: item.cardio, value3: item.score, sort: item.sort };
                if (item.id) { payload.id = item.id; await apiRequest("/statistic/update", { method: "PUT", body: payload }); }
                else { await apiRequest("/statistic/add", { method: "POST", body: payload }); }
            }
            
            // 同步保存到本地缓存，防止前台加载时因后端延迟导致显示旧数据
            lsSet(LS.chartData, data);
            
            showToast("全站图表数据已同步至数据库！");
            initDataCenter(); // 重新加载以获取新分配的 ID
        } catch (e) {
            showToast("同步至后端失败: " + e.message, true);
        }
    } else {
        lsSet(LS.chartData, data);
        showToast("离线模式：数据已暂存至本地缓存。");
    }
}

function uid() {
    return Math.random().toString(16).slice(2) + Date.now().toString(16);
}
function todayKey() {
    return new Date().toISOString().slice(0, 10);
}
function lsGet(key, fallback) {
    try {
        const v = localStorage.getItem(key);
        if (!v) return fallback;
        return JSON.parse(v);
    } catch {
        return fallback;
    }
}
function lsSet(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
}

function getImageUrl(path) {
    if (!path) return 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return BASE_URL + (path.startsWith('/') ? path : '/' + path);
}

// ==========================================
// 检测后端连通性，防止网络报错阻断前端运行
// ==========================================
async function checkBackendConnectivity() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5秒超时
        const res = await fetch(BASE_URL + "/project/list", { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
            isBackendOnline = true;
            updateAuthBadge(true, "本地服务 SpringBoot 已连接");
        } else {
            throw new Error();
        }
    } catch (e) {
        isBackendOnline = false;
        updateAuthBadge(false, "离线运行中 · 高拟真本地存储接管");
    }
}

function updateAuthBadge(isOnline, text) {
    const dot = document.getElementById("auth-dot");
    const authText = document.getElementById("auth-text");
    if (!dot || !authText) return;

    if (isOnline) {
        dot.className = "w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse";
        authText.className = "text-emerald-600 font-bold";
    } else {
        dot.className = "w-1.5 h-1.5 rounded-full bg-orange-400";
        authText.className = "text-orange-500 font-bold";
    }
    authText.textContent = text;
}

// ==========================================
// 核心安全网络请求拦截器机制（优雅兼容离线降级）
// ==========================================
async function apiRequest(url, options = {}) {
    if (!isBackendOnline) {
        throw new Error("OFFLINE_MODE");
    }

    options.headers = options.headers || {};
    const token = localStorage.getItem("token");
    if (token) {
        options.headers["token"] = token;
    }

    if (options.body && typeof options.body === "object" && !(options.body instanceof FormData)) {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(BASE_URL + url, options);
        if (response.status === 401) {
            localStorage.removeItem("token");
            showVisionAlert("登录过期", "管理员授权已过期，请重新登录！", "fa-user-lock", "bg-amber-50 text-amber-600");
            setTimeout(() => window.location.href = "/login.html", 2000);
            throw new Error("Unauthorized");
        }
        const data = await response.json();
        if (data && data.code !== undefined) {
            if (data.code !== 200) {
                throw new Error(data.msg || "接口层报错异常");
            }
            return data.data;
        }
        return data;
    } catch (e) {
        console.warn("网络链路级处理警告:", e.message);
        throw e;
    }
}

function handleLogout() {
    localStorage.removeItem("token");
    showToast("已安全登出控制大屏。");
    setTimeout(() => window.location.href = "/login.html", 1000);
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));

    const activeBtn = document.getElementById(`tab-${tabName}`);
    const activePanel = document.getElementById(`panel-${tabName}`);
    if (activeBtn && activePanel) {
        activeBtn.classList.add('active');
        activePanel.classList.remove('hidden');
    }
}

function toggleModal(id, isOpen) {
    const modal = document.getElementById(id);
    if (!modal) return;
    const card = modal.querySelector('.glass-panel');
    if (isOpen) {
        modal.classList.remove('pointer-events-none', 'opacity-0');
        modal.classList.add('opacity-100');
        if (card) {
            card.classList.remove('scale-95');
            card.classList.add('scale-100');
        }
    } else {
        modal.classList.add('pointer-events-none', 'opacity-0');
        modal.classList.remove('opacity-100');
        if (card) {
            card.classList.add('scale-95');
            card.classList.remove('scale-100');
        }
    }
}

// ==========================================
// 项目管理业务流
// ==========================================
function openProjectModal() {
    document.getElementById("project-form").reset();
    document.getElementById("proj-id").value = "";
    document.getElementById("proj-image-url").value = "";
    document.getElementById("proj-modal-title").textContent = "新增项目归档";
    toggleModal("project-modal", true);
}

function closeProjectModal() {
    toggleModal("project-modal", false);
}

async function editProject(id) {
    try {
        let data;
        if (isBackendOnline) {
            data = await apiRequest(`/project/${id}`);
        } else {
            // fallbackProjects should be available globally or imported
            data = fallbackProjects.find(x => x.id === id);
        }

        if (!data) return;
        document.getElementById("proj-id").value = data.id || "";
        document.getElementById("proj-title").value = data.title || "";
        document.getElementById("proj-tech").value = data.techStack || "";
        document.getElementById("proj-github").value = data.github || "";
        document.getElementById("proj-demo").value = data.demo || "";
        document.getElementById("proj-desc").value = data.description || "";
        document.getElementById("proj-image-url").value = data.image || "";

        document.getElementById("proj-modal-title").textContent = "修改编辑项目";
        toggleModal("project-modal", true);
    } catch (e) {
        showToast("获取单项数据失败: " + e.message, true);
    }
}

async function saveProject(event) {
    event.preventDefault();
    try {
        let imageUrl = document.getElementById("proj-image-url").value;
        const fileInput = document.getElementById("proj-image-file");

        if (fileInput.files[0] && isBackendOnline) {
            const formData = new FormData();
            formData.append("file", fileInput.files[0]);
            const uploadRes = await fetch(BASE_URL + "/upload/file", {
                method: "POST",
                body: formData
            }).then(res => res.json());
            imageUrl = uploadRes.data?.url || uploadRes.data || imageUrl;
        }

        const data = {
            title: document.getElementById("proj-title").value.trim(),
            techStack: document.getElementById("proj-tech").value.trim(),
            github: document.getElementById("proj-github").value.trim(),
            demo: document.getElementById("proj-demo").value.trim(),
            description: document.getElementById("proj-desc").value.trim(),
            image: imageUrl || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600"
        };

        const editId = document.getElementById("proj-id").value;
        if (isBackendOnline) {
            if (editId) {
                await apiRequest("/project/update", {
                    method: "PUT",
                    body: { ...data, id: editId }
                });
            } else {
                await apiRequest("/project/add", {
                    method: "POST",
                    body: data
                });
            }
            showToast("项目数据已成功同步上传！");
        } else {
            if (editId) {
                const idx = fallbackProjects.findIndex(x => x.id == editId);
                if (idx !== -1) fallbackProjects[idx] = { ...data, id: Number(editId) };
            } else {
                fallbackProjects.unshift({ ...data, id: Date.now() });
            }
            showToast("离线模式：项目数据已暂存。");
        }

        closeProjectModal();
        loadProjectTable();
        loadStatistics();
    } catch (e) {
        showToast("保存失败: " + e.message, true);
    }
}

async function deleteProject(id) {
    showVisionConfirm("删除项目", "确认彻底删除该项目展示档案吗？", async () => {
        try {
            if (isBackendOnline) {
                await apiRequest(`/project/delete/${id}`, { method: "DELETE" });
            } else {
                const idx = fallbackProjects.findIndex(x => x.id == id);
                if (idx !== -1) fallbackProjects.splice(idx, 1);
            }
            showToast("项目已成功移除。");
            loadProjectTable();
            loadStatistics();
        } catch (e) {
            showToast("操作失败: " + e.message, true);
        }
    });
}

// ==========================================
// 文章管理业务流
// ==========================================
function openArticleModal() {
    document.getElementById("article-form").reset();
    document.getElementById("art-id").value = "";
    document.getElementById("art-modal-title").textContent = "撰写发布新文章";
    toggleModal("article-modal", true);
}

function closeArticleModal() {
    toggleModal("article-modal", false);
}

async function editArticle(id) {
    try {
        let data;
        if (isBackendOnline) {
            data = await apiRequest(`/article/${id}`);
        } else {
            data = fallbackArticles.find(x => x.id === id);
        }

        if (!data) return;
        document.getElementById("art-id").value = data.id || "";
        document.getElementById("art-title").value = data.title || "";
        document.getElementById("art-summary").value = data.summary || "";
        document.getElementById("art-content").value = data.content || "";

        document.getElementById("art-modal-title").textContent = "修缮文章内容";
        toggleModal("article-modal", true);
    } catch (e) {
        showToast("拉取文章详情失败: " + e.message, true);
    }
}

async function saveArticle(event) {
    event.preventDefault();
    try {
        const data = {
            title: document.getElementById("art-title").value.trim(),
            summary: document.getElementById("art-summary").value.trim(),
            content: document.getElementById("art-content").value.trim()
        };

        const editId = document.getElementById("art-id").value;
        if (isBackendOnline) {
            if (editId) {
                await apiRequest("/article/update", {
                    method: "PUT",
                    body: { ...data, id: editId }
                });
            } else {
                await apiRequest("/article/add", {
                    method: "POST",
                    body: data
                });
            }
            showToast("博文操作成功！");
        } else {
            if (editId) {
                const idx = fallbackArticles.findIndex(x => x.id == editId);
                if (idx !== -1) fallbackArticles[idx] = { ...data, id: Number(editId) };
            } else {
                fallbackArticles.unshift({ ...data, id: Date.now() });
            }
            showToast("离线模式：博文发表成功。");
        }

        closeArticleModal();
        loadArticleTable();
        loadStatistics();
    } catch (e) {
        showToast("保存失败: " + e.message, true);
    }
}

async function deleteArticle(id) {
    showVisionConfirm("下架文章", "确认彻底下架删除该篇文章吗？这将无法撤回。", async () => {
        try {
            if (isBackendOnline) {
                await apiRequest(`/article/delete/${id}`, { method: "DELETE" });
            } else {
                const idx = fallbackArticles.findIndex(x => x.id == id);
                if (idx !== -1) fallbackArticles.splice(idx, 1);
            }
            showToast("博文已成功下架！");
            loadArticleTable();
            loadStatistics();
        } catch (e) {
            showToast("操作失败: " + e.message, true);
        }
    });
}

// ==========================================
// 留言模块完美融合与演示生成
// ==========================================
function createDemoMessage() {
    let list = lsGet(LS.offlineFeedback, []);
    list.unshift({
        id: Date.now(),
        username: "来自访客-" + Math.random().toString(16).slice(2, 6).toUpperCase(),
        email: "visitor@geek.com",
        content: "这是一条测试留言，体验极高弹性高容灾的前后台协同！",
        createTime: new Date().toISOString()
    });
    lsSet(LS.offlineFeedback, list);
    loadMessagesTable();
    loadStatistics();
    showToast("成功生成一条测试离线留言！");
}

function clearAllDemoMessages() {
    showVisionConfirm("清空留言", "确定要清空全部本地测试与前台暂存的留言吗？", () => {
        localStorage.removeItem(LS.offlineFeedback);
        loadMessagesTable();
        loadStatistics();
        showToast("留言已全部清空。");
    });
}

// ==========================================
// 本地极高拟态模块：书籍/习惯
// ==========================================
function seedLocalModulesIfEmpty() {
    if (!localStorage.getItem(LS.books)) {
        lsSet(LS.books, [
            { id: "b1", title: "Clean Code", author: "Robert C. Martin", tag: "工程", status: "在读", note: "关于可读性、可维护性与工程纪律的经典。", coverUrl: "https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg" },
            { id: "b2", title: "Effective Java", author: "Joshua Bloch", tag: "实践", status: "收藏", note: "Java 设计与最佳实践的权威守则。", coverUrl: "https://covers.openlibrary.org/b/isbn/9780134685991-L.jpg" },
            { id: "b3", title: "DDIA", author: "Martin Kleppmann", tag: "架构", status: "已读", note: "分布式密集型系统构建底层的硬核读物。", coverUrl: "https://covers.openlibrary.org/b/isbn/9781449373320-L.jpg" },
            { id: "b4", title: "Clean Architecture", author: "Robert C. Martin", tag: "架构", status: "在读", note: "架构分层、边界与可演化系统的优雅之道。", coverUrl: "https://covers.openlibrary.org/b/isbn/9780134494166-L.jpg" }
        ]);
    }
    if (!localStorage.getItem(LS.habits)) {
        lsSet(LS.habits, [
            { id: "h1", title: "跑步/快走 30min", tag: "运动", streak: 6 },
            { id: "h2", title: "核心代码设计 45min", tag: "自律", streak: 13 }
        ]);
    }
    if (!localStorage.getItem(LS.habitsDone)) {
        lsSet(LS.habitsDone, {});
    }
    if (!localStorage.getItem(LS.settings)) {
        lsSet(LS.settings, {
            siteName: "HZ | Apple Vision Pro Portfolio",
            bio: "精通 SpringBoot + Redis 高吞吐后端系统研发，擅长微服务拦截器设计与高雅拟物化白灰磨砂前端视觉传达。",
            github: "",
            email: "",
            blog: ""
        });
    }
}

function openGenericModal(type, editId = null) {
    const modal = document.getElementById("generic-modal");
    const fields = document.getElementById("gen-fields");
    const title = document.getElementById("gen-modal-title");
    document.getElementById("gen-type").value = type;
    document.getElementById("gen-id").value = editId || "";
    fields.innerHTML = "";

    const makeInput = (id, label, placeholder, value = "", colSpan2 = false) => {
        const wrap = document.createElement("div");
        wrap.className = colSpan2 ? "col-span-2" : "";
        wrap.innerHTML = `
            <label class="text-[10px] font-bold text-slate-500 block mb-1">${label}</label>
            <input id="${id}" value="${(value ?? "").toString().replaceAll('"','&quot;')}" placeholder="${placeholder}" class="w-full bg-white/60 border border-slate-200/50 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500">
        `;
        fields.appendChild(wrap);
    };
    const makeTextarea = (id, label, placeholder, value = "") => {
        const wrap = document.createElement("div");
        wrap.className = "col-span-2";
        wrap.innerHTML = `
            <label class="text-[10px] font-bold text-slate-500 block mb-1">${label}</label>
            <textarea id="${id}" rows="4" placeholder="${placeholder}" class="w-full bg-white/60 border border-slate-200/50 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500">${value ?? ""}</textarea>
        `;
        fields.appendChild(wrap);
    };

    if (type === "books") {
        title.textContent = editId ? "编辑推荐书籍" : "新增推荐书籍";
        const data = lsGet(LS.books, []);
        const it = editId ? data.find(x => x.id === editId) : null;
        makeInput("b-title", "书名", "如：Clean Code", it?.title || "", true);
        makeInput("b-author", "作者", "如：Robert C. Martin", it?.author || "");
        makeInput("b-tag", "书籍分类标签", "工程/架构/实践", it?.tag || "");
        makeInput("b-status", "阅读状态", "在读/收藏/已读", it?.status || "");
        makeInput("b-cover", "封面图片链接", "可空，或输入有效图片URL", it?.coverUrl || "", true);
        makeTextarea("b-note", "核心读书感悟", "一句话总结读书笔记细节...", it?.note || "");
    } else if (type === "habits") {
        title.textContent = editId ? "编辑习惯条目" : "新增打卡习惯";
        const data = lsGet(LS.habits, []);
        const it = editId ? data.find(x => x.id === editId) : null;
        makeInput("h-title", "自律打卡习惯名称", "如：早起看书 30min", it?.title || "", true);
        makeInput("h-tag", "习惯类型标签", "运动/自律/学习", it?.tag || "");
        makeInput("h-streak", "当前已连续坚持天数", "纯数字", (it?.streak ?? 0).toString(), "");
    }

    toggleModal("generic-modal", true);
}

function closeGenericModal() {
    toggleModal("generic-modal", false);
}

document.getElementById("generic-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const type = document.getElementById("gen-type").value;
    const editId = document.getElementById("gen-id").value;

    if (type === "books") {
        const list = lsGet(LS.books, []);
        const payload = {
            id: editId || uid(),
            title: document.getElementById("b-title").value.trim(),
            author: document.getElementById("b-author").value.trim(),
            tag: document.getElementById("b-tag").value.trim(),
            status: document.getElementById("b-status").value.trim(),
            coverUrl: document.getElementById("b-cover").value.trim() || "https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg",
            note: document.getElementById("b-note").value.trim()
        };
        const next = editId ? list.map(x => x.id === editId ? payload : x) : [payload, ...list];
        lsSet(LS.books, next);
        closeGenericModal();
        loadBooksTable();
        return;
    }

    if (type === "habits") {
        const list = lsGet(LS.habits, []);
        const payload = {
            id: editId || uid(),
            title: document.getElementById("h-title").value.trim(),
            tag: document.getElementById("h-tag").value.trim(),
            streak: Number(document.getElementById("h-streak").value || 0)
        };
        const next = editId ? list.map(x => x.id === editId ? payload : x) : [payload, ...list];
        lsSet(LS.habits, next);
        closeGenericModal();
        loadHabitsTable();
        loadInsights();
    }
});

function deleteLocalItem(type, id) {
    showVisionConfirm("确认删除", "确认彻底从本地库删除该条条目吗？", () => {
        if (type === "books") {
            lsSet(LS.books, lsGet(LS.books, []).filter(x => x.id !== id));
            loadBooksTable();
        } else if (type === "habits") {
            const list = lsGet(LS.habits, []).filter(x => x.id !== id);
            lsSet(LS.habits, list);
            const done = lsGet(LS.habitsDone, {});
            Object.keys(done).forEach(day => {
                done[day] = (done[day] || []).filter(x => x !== id);
            });
            lsSet(LS.habitsDone, done);
            loadHabitsTable();
            loadInsights();
        }
        showToast("条目已从本地移除。");
    });
}

function toggleHabitDone(id) {
    const day = todayKey();
    const done = lsGet(LS.habitsDone, {});
    done[day] = done[day] || [];
    const set = new Set(done[day]);
    if (set.has(id)) {
        set.delete(id);
    } else {
        set.add(id);
    }
    done[day] = Array.from(set);
    lsSet(LS.habitsDone, done);
    loadHabitsTable();
    loadInsights();
}

function clearTodayHabits() {
    const day = todayKey();
    const done = lsGet(LS.habitsDone, {});
    done[day] = [];
    lsSet(LS.habitsDone, done);
    loadHabitsTable();
    loadInsights();
}

// ==========================================
// 表格及卡片渲染控制器
// ==========================================
function loadBooksTable() {
    const container = document.getElementById("books-list");
    if (!container) return;
    const data = lsGet(LS.books, []);
    if (data.length === 0) {
        container.innerHTML = `<div class="text-xs text-slate-400">暂无推荐书籍。</div>`;
        return;
    }
    container.innerHTML = data.map(item => `
        <div class="glass-card p-5 rounded-2xl flex flex-col justify-between space-y-3">
            <div>
                <div class="flex justify-between items-start gap-3">
                    <div>
                        <h4 class="font-bold text-slate-800 text-sm mb-1">${item.title}</h4>
                        <p class="text-[10px] text-slate-500 font-bold">${item.author} · ${item.tag} · ${item.status}</p>
                    </div>
                    <span class="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Books</span>
                </div>
                <p class="text-slate-600 text-[11px] leading-relaxed mt-2 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">${item.note || '暂无读书感悟'}</p>
            </div>
            <div class="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button onclick="openGenericModal('books','${item.id}')" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg transition-all">编辑</button>
                <button onclick="deleteLocalItem('books','${item.id}')" class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[10px] rounded-lg transition-all">删除</button>
            </div>
        </div>
    `).join('');
}

function loadHabitsTable() {
    const container = document.getElementById("habits-list");
    if (!container) return;
    const list = lsGet(LS.habits, []);
    const done = lsGet(LS.habitsDone, {});
    const day = todayKey();
    const doneSet = new Set(done[day] || []);

    if (list.length === 0) {
        container.innerHTML = `<div class="text-xs text-slate-400">暂无习惯打卡设定。</div>`;
        return;
    }

    container.innerHTML = list.map(item => {
        const isDone = doneSet.has(item.id);
        return `
            <div class="glass-card p-5 rounded-2xl flex flex-col justify-between space-y-3">
                <div>
                    <div class="flex justify-between items-center">
                        <h4 class="font-bold text-slate-800 text-sm">${item.title}</h4>
                        <span class="text-[10px] font-bold ${isDone ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 bg-slate-100'} px-2 py-0.5 rounded-full">${isDone ? '今日已自律完成' : '待坚持'}</span>
                    </div>
                    <p class="text-[10px] text-slate-500 font-bold mt-1">分类：${item.tag} · 连续坚持：${item.streak ?? 0} 天</p>
                </div>
                <div class="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                    <button onclick="toggleHabitDone('${item.id}')" class="px-3 py-1.5 ${isDone ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'} font-bold text-[10px] rounded-lg transition-all">${isDone ? '取消今日自律' : '今日快速打卡'}</button>
                    <button onclick="openGenericModal('habits','${item.id}')" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg transition-all">编辑</button>
                    <button onclick="deleteLocalItem('habits','${item.id}')" class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[10px] rounded-lg transition-all">删除</button>
                </div>
            </div>
        `;
    }).join('');
}

async function loadSettings() {
    const siteName = document.getElementById("set-siteName");
    const bio = document.getElementById("set-bio");
    const github = document.getElementById("set-github");
    const email = document.getElementById("set-email");
    const blog = document.getElementById("set-blog");
    const logoUrl = document.getElementById("set-logoUrl");
    const logoPreview = document.getElementById("logo-preview");

    if (!siteName) return;

    let s = lsGet(LS.settings, {});

    if (isBackendOnline) {
        try {
            const configs = await apiRequest("/site/config/all");
            if (configs) {
                // 将后端下划线格式映射到我们的驼峰格式并存入 LocalStorage
                s = {
                    siteName: configs.site_name || s.siteName || "",
                    siteSubtitle: configs.site_subtitle || s.siteSubtitle || "",
                    github: configs.github_url || s.github || "",
                    email: configs.admin_email || s.email || "",
                    blog: configs.blog_url || s.blog || "",
                    logoUrl: configs.site_logo || s.logoUrl || "",
                    heroGreeting: configs.hero_greeting || s.heroGreeting || "你好，我是",
                    typewriterPrefix: configs.typewriter_prefix || s.typewriterPrefix || "我是一名",
                    heroDesc: configs.hero_description || s.heroDesc || "",
                    typewriterStrings: configs.typewriter_strings || s.typewriterStrings || "",
                    typeSpeed: configs.type_speed || s.typeSpeed || "60",
                    backSpeed: configs.back_speed || s.backSpeed || "30",
                    typewriterLoop: configs.typewriter_loop === 'true' || s.typewriterLoop === true
                };
                lsSet(LS.settings, s);
            }
        } catch (e) {
            console.warn("从后端加载设置失败");
        }
    }

    siteName.value = s.siteName || "";
    const siteSubtitle = document.getElementById("set-siteSubtitle");
    if (siteSubtitle) siteSubtitle.value = s.siteSubtitle || "";
    
    // 加载描述与问候语
    const heroGreeting = document.getElementById("set-heroGreeting");
    const typewriterPrefix = document.getElementById("set-typewriterPrefix");
    const heroDesc = document.getElementById("set-heroDesc");
    if (heroGreeting) heroGreeting.value = s.heroGreeting || "你好，我是";
    if (typewriterPrefix) typewriterPrefix.value = s.typewriterPrefix || "我是一名";
    if (heroDesc) heroDesc.value = s.heroDesc || "";

    github.value = s.github || "";
    email.value = s.email || "";
    blog.value = s.blog || "";
    
    // 加载打字机配置
    const typewriterStrings = document.getElementById("set-typewriterStrings");
    const typeSpeed = document.getElementById("set-typeSpeed");
    const backSpeed = document.getElementById("set-backSpeed");
    const typewriterLoop = document.getElementById("set-typewriterLoop");

    if (typewriterStrings) typewriterStrings.value = s.typewriterStrings || "";
    if (typeSpeed) typeSpeed.value = s.typeSpeed || "60";
    if (backSpeed) backSpeed.value = s.backSpeed || "30";
    if (typewriterLoop) typewriterLoop.checked = s.typewriterLoop === true;

    if (s.logoUrl) {
        logoUrl.value = s.logoUrl;
        logoPreview.innerHTML = `<img src="${getImageUrl(s.logoUrl)}" class="w-full h-full object-cover">`;
    }
}

async function saveSettings() {
    const logoFile = document.getElementById("logo-file").files[0];
    let logoUrl = document.getElementById("set-logoUrl").value;

    if (logoFile && isBackendOnline) {
        try {
            const formData = new FormData();
            formData.append("file", logoFile);
            const token = localStorage.getItem("token");
            const res = await fetch(BASE_URL + "/upload/file", {
                method: "POST",
                headers: token ? { "token": token } : {},
                body: formData
            });
            const data = await res.json();
            if (data.code === 200) {
                logoUrl = data.data.url || data.data;
                document.getElementById("set-logoUrl").value = logoUrl;
            }
        } catch (e) {
            console.error("Logo 上传失败", e);
        }
    }

    const siteName = document.getElementById("set-siteName").value.trim();
    const siteSubtitle = document.getElementById("set-siteSubtitle").value.trim();
    const heroGreeting = document.getElementById("set-heroGreeting").value.trim();
    const typewriterPrefix = document.getElementById("set-typewriterPrefix").value.trim();
    const heroDesc = document.getElementById("set-heroDesc").value.trim();
    const github = document.getElementById("set-github").value.trim();
    const email = document.getElementById("set-email").value.trim();
    const blog = document.getElementById("set-blog").value.trim();
    const typewriterStrings = document.getElementById("set-typewriterStrings").value.trim();
    const typeSpeed = document.getElementById("set-typeSpeed").value.trim();
    const backSpeed = document.getElementById("set-backSpeed").value.trim();
    const typewriterLoop = document.getElementById("set-typewriterLoop").checked;

    // 统一数据格式，兼容 LocalStorage 和 后端
    const settingsData = {
        siteName: siteName,
        siteSubtitle: siteSubtitle,
        github: github,
        email: email,
        blog: blog,
        logoUrl: logoUrl,
        heroGreeting: heroGreeting,
        typewriterPrefix: typewriterPrefix,
        heroDesc: heroDesc,
        typewriterStrings: typewriterStrings,
        typeSpeed: typeSpeed,
        backSpeed: backSpeed,
        typewriterLoop: typewriterLoop
    };

    if (isBackendOnline) {
        try {
            // 后端接口可能还是用下划线，如果是的话这里需要转换，但为了本地持久化一致，我们先存本地
            await apiRequest("/site/config/save", {
                method: "POST",
                body: {
                    site_name: siteName,
                    site_subtitle: siteSubtitle,
                    github_url: github,
                    admin_email: email,
                    blog_url: blog,
                    site_logo: logoUrl,
                    hero_greeting: heroGreeting,
                    typewriter_prefix: typewriterPrefix,
                    hero_description: heroDesc,
                    typewriter_strings: typewriterStrings,
                    type_speed: typeSpeed,
                    back_speed: backSpeed,
                    typewriter_loop: typewriterLoop.toString()
                }
            });
            showToast("站点设置已成功保存至数据库！");
        } catch (e) {
            showToast("保存至后端失败: " + e.message, true);
        }
    }

    // 无论在线离线，都存一份本地以实现极致持久化
    lsSet(LS.settings, settingsData);
    if (!isBackendOnline) showToast("离线模式：设置已保存至本地缓存！");
    
    loadSettings();
}

async function loadMusicTable() {
    const container = document.getElementById("music-list");
    if (!container) return;
    if (!isBackendOnline) {
        container.innerHTML = `<div class="text-xs text-slate-400">后端离线，无法加载音乐列表。</div>`;
        return;
    }
    try {
        const data = await apiRequest("/music/list");
        if (!data || data.length === 0) {
            container.innerHTML = `<div class="text-xs text-slate-400">暂无音乐。</div>`;
            return;
        }
        container.innerHTML = data.map(item => `
            <div class="glass-card p-5 rounded-2xl flex flex-col justify-between space-y-3">
                <div class="flex gap-4">
                    <div class="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        <img src="${getImageUrl(item.cover)}" class="w-full h-full object-cover" onerror="this.src='https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200'">
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-start gap-3">
                            <div class="truncate">
                                <h4 class="font-bold text-slate-800 text-sm mb-1 truncate">${item.title || '未知标题'}</h4>
                                <p class="text-[10px] text-slate-500 font-bold truncate">${item.artist || '未知艺术家'}</p>
                            </div>
                            <span class="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Music</span>
                        </div>
                    </div>
                </div>
                <div>
                    <p class="text-slate-600 text-[11px] mt-2 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 truncate">地址: ${item.url || '无'}</p>
                </div>
                <div class="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                    <button onclick="editMusic('${item.id}')" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg transition-all">编辑</button>
                    <button onclick="deleteMusic('${item.id}')" class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[10px] rounded-lg transition-all">删除</button>
                </div>
            </div>
        `).join('');
    } catch (e) {
        container.innerHTML = `<div class="text-xs text-slate-400">音乐加载失败: ${e.message}</div>`;
    }
}

function openMusicModal(editId = null) {
    const modal = document.getElementById("music-modal");
    document.getElementById("music-form").reset();
    document.getElementById("music-id").value = "";
    document.getElementById("music-cover-url").value = "";
    document.getElementById("music-cover-preview").innerHTML = '<i class="fa-solid fa-music text-slate-300"></i>';
    document.getElementById("music-modal-title").textContent = "新增音乐";
    if (editId) {
        document.getElementById("music-modal-title").textContent = "编辑音乐";
        loadMusicForEdit(editId);
    }
    toggleModal("music-modal", true);
}

async function loadMusicForEdit(id) {
    try {
        const item = await apiRequest(`/music/${id}`);
        document.getElementById("music-id").value = item.id;
        document.getElementById("music-title").value = item.title || "";
        document.getElementById("music-artist").value = item.artist || "";
        document.getElementById("music-sort").value = item.sort || 0;
        document.getElementById("music-url").value = item.url || "";
        
        const coverUrl = item.cover || "";
        document.getElementById("music-cover-url").value = coverUrl;
        if (coverUrl) {
            document.getElementById("music-cover-preview").innerHTML = `<img src="${getImageUrl(coverUrl)}" class="w-full h-full object-cover">`;
        } else {
            document.getElementById("music-cover-preview").innerHTML = '<i class="fa-solid fa-music text-slate-300"></i>';
        }
    } catch (e) {
        showToast("加载音乐信息失败: " + e.message, true);
    }
}

function editMusic(id) {
    openMusicModal(id);
}

async function deleteMusic(id) {
    showVisionConfirm("删除音乐", "确定要删除这首音乐吗？", async () => {
        try {
            await apiRequest(`/music/delete/${id}`, { method: "DELETE" });
            showToast("音乐已成功删除。");
            loadMusicTable();
        } catch (e) {
            showToast("删除失败: " + e.message, true);
        }
    });
}

document.getElementById("music-form").onsubmit = async function(e) {
    e.preventDefault();
    const id = document.getElementById("music-id").value;
    const musicFile = document.getElementById("music-file").files[0];
    const coverFile = document.getElementById("music-cover-file").files[0];
    let url = document.getElementById("music-url").value;
    let coverUrl = document.getElementById("music-cover-url").value;

    const token = localStorage.getItem("token");

    // 上传音乐文件
    if (musicFile && isBackendOnline) {
        try {
            const formData = new FormData();
            formData.append("file", musicFile);
            const res = await fetch(BASE_URL + "/upload/file", {
                method: "POST",
                headers: token ? { "token": token } : {},
                body: formData
            });
            const data = await res.json();
            if (data.code === 200) {
                url = data.data.url || data.data;
            } else {
                showToast("音乐文件上传失败: " + (data.msg || "未知错误"), true);
                return;
            }
        } catch (e) {
            showToast("音乐文件上传失败: " + e.message, true);
            return;
        }
    }

    // 上传封面文件
    if (coverFile && isBackendOnline) {
        try {
            const formData = new FormData();
            formData.append("file", coverFile);
            const res = await fetch(BASE_URL + "/upload/file", {
                method: "POST",
                headers: token ? { "token": token } : {},
                body: formData
            });
            const data = await res.json();
            if (data.code === 200) {
                coverUrl = data.data.url || data.data;
            } else {
                showToast("封面上传失败: " + (data.msg || "未知错误"), true);
                return;
            }
        } catch (e) {
            showToast("封面上传失败: " + e.message, true);
            return;
        }
    }

    const payload = {
        title: document.getElementById("music-title").value,
        artist: document.getElementById("music-artist").value,
        sort: parseInt(document.getElementById("music-sort").value) || 0,
        url: url,
        cover: coverUrl
    };

    if (id) {
        payload.id = parseInt(id);
        try {
            await apiRequest("/music/update", { method: "PUT", body: payload });
            showToast("音乐信息已更新");
        } catch (e) {
            showToast("更新失败: " + e.message, true);
            return;
        }
    } else {
        try {
            await apiRequest("/music/add", { method: "POST", body: payload });
            showToast("新音乐已发布");
        } catch (e) {
            showToast("新增失败: " + e.message, true);
            return;
        }
    }
    toggleModal("music-modal", false);
    loadMusicTable();
};

function closeMusicModal() {
    toggleModal("music-modal", false);
}

function closeVisionPopup() {
    toggleModal("vision-popup", false);
}

function showVisionConfirm(title, msg, onConfirm) {
    document.getElementById("popup-title").textContent = title;
    document.getElementById("popup-msg").textContent = msg;
    document.getElementById("popup-icon").innerHTML = '<i class="fa-solid fa-circle-question"></i>';
    document.getElementById("popup-icon").className = "w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl mb-4 mx-auto";
    document.getElementById("popup-cancel-btn").style.display = "block";
    
    const confirmBtn = document.getElementById("popup-confirm-btn");
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    newConfirmBtn.onclick = () => {
        closeVisionPopup();
        if (onConfirm) onConfirm();
    };
    
    toggleModal("vision-popup", true);
}

function showVisionAlert(title, msg, icon = 'fa-circle-info', colorClass = 'bg-blue-50 text-blue-600') {
    document.getElementById("popup-title").textContent = title;
    document.getElementById("popup-msg").textContent = msg;
    document.getElementById("popup-icon").innerHTML = `<i class="fa-solid ${icon}"></i>`;
    document.getElementById("popup-icon").className = `w-12 h-12 rounded-2xl ${colorClass} flex items-center justify-center text-xl mb-4 mx-auto`;
    document.getElementById("popup-cancel-btn").style.display = "none";
    
    const confirmBtn = document.getElementById("popup-confirm-btn");
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    newConfirmBtn.onclick = () => {
        closeVisionPopup();
    };
    
    toggleModal("vision-popup", true);
}

function showToast(message, isError = false) {
    const toast = document.getElementById('toastNotification');
    if (!toast) return;
    toast.innerText = message;
    toast.className = `fixed bottom-6 right-6 px-6 py-4 rounded-2xl text-white font-bold shadow-2xl transition-all duration-500 z-[2000] ${isError ? 'bg-gradient-to-r from-rose-600 to-pink-500' : 'bg-gradient-to-r from-indigo-600 to-blue-500'}`;
    toast.style.transform = "translateY(0)";
    toast.style.opacity = "1";
    setTimeout(() => {
        toast.style.transform = "translateY(100px)";
        toast.style.opacity = "0";
    }, 3000);
}

async function loadInsightTable() {
    const container = document.getElementById("insight-list");
    if (!container) return;
    if (!isBackendOnline) {
        container.innerHTML = `<div class="text-xs text-slate-400">后端离线，无法加载感悟列表。</div>`;
        return;
    }
    try {
        const data = await apiRequest("/insight/list");
        if (!data || data.length === 0) {
            container.innerHTML = `<div class="text-xs text-slate-400">暂无感悟。</div>`;
            return;
        }
        container.innerHTML = data.map(item => `
            <div class="glass-card p-5 rounded-2xl flex flex-col justify-between space-y-3">
                <div>
                    <div class="flex justify-between items-start gap-3">
                        <div>
                            <p class="font-bold text-slate-800 text-sm mb-1">${item.content || '无内容'}</p>
                            <p class="text-[10px] text-slate-500 font-bold">—— ${item.author || '匿名'} ${item.source ? '《' + item.source + '》' : ''}</p>
                        </div>
                        <span class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Insight</span>
                    </div>
                </div>
                <div class="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                    <button onclick="editInsight('${item.id}')" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg transition-all">编辑</button>
                    <button onclick="deleteInsight('${item.id}')" class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[10px] rounded-lg transition-all">删除</button>
                </div>
            </div>
        `).join('');
    } catch (e) {
        container.innerHTML = `<div class="text-xs text-slate-400">感悟加载失败: ${e.message}</div>`;
    }
}

function openInsightModal(editId = null) {
    const modal = document.getElementById("insight-modal");
    document.getElementById("insight-form").reset();
    document.getElementById("insight-id").value = "";
    document.getElementById("insight-modal-title").textContent = "新增感悟";
    if (editId) {
        document.getElementById("insight-modal-title").textContent = "编辑感悟";
        loadInsightForEdit(editId);
    }
    toggleModal("insight-modal", true);
}

async function loadInsightForEdit(id) {
    try {
        const item = await apiRequest(`/insight/${id}`);
        document.getElementById("insight-id").value = item.id;
        document.getElementById("insight-content").value = item.content || "";
        document.getElementById("insight-author").value = item.author || "";
        document.getElementById("insight-source").value = item.source || "";
        document.getElementById("insight-sort").value = item.sort || 0;
    } catch (e) {
        showToast("加载感悟信息失败: " + e.message, true);
    }
}

function editInsight(id) {
    openInsightModal(id);
}

async function deleteInsight(id) {
    showVisionConfirm("删除感悟", "确定要删除这条感悟吗？", async () => {
        try {
            await apiRequest(`/insight/delete/${id}`, { method: "DELETE" });
            showToast("感悟已成功下架。");
            loadInsightTable();
        } catch (e) {
            showToast("删除失败: " + e.message, true);
        }
    });
}

document.getElementById("insight-form").onsubmit = async function(e) {
    e.preventDefault();
    const id = document.getElementById("insight-id").value;
    const payload = {
        content: document.getElementById("insight-content").value,
        author: document.getElementById("insight-author").value,
        source: document.getElementById("insight-source").value,
        sort: parseInt(document.getElementById("insight-sort").value) || 0
    };

    if (id) {
        payload.id = parseInt(id);
        try {
            await apiRequest("/insight/update", { method: "PUT", body: payload });
            showToast("感悟信息已更新");
        } catch (e) {
            showToast("更新失败: " + e.message, true);
            return;
        }
    } else {
        try {
            await apiRequest("/insight/add", { method: "POST", body: payload });
            showToast("新感悟已发布");
        } catch (e) {
            showToast("新增失败: " + e.message, true);
            return;
        }
    }
    toggleModal("insight-modal", false);
    loadInsightTable();
};

function closeInsightModal() {
    toggleModal("insight-modal", false);
}

async function loadCarouselTable() {
    const container = document.getElementById("carousel-list");
    if (!container) return;

    let data = [];
    if (isBackendOnline) {
        try {
            data = await apiRequest("/carousel/list");
        } catch (e) {
            console.warn("轮播从后端加载失败");
        }
    }
    
    // 如果后端没数据或离线，则看本地
    if (data.length === 0) {
        data = lsGet(LS.carousel, []);
    }

    if (!data || data.length === 0) {
        container.innerHTML = `<div class="text-xs text-slate-400">暂无轮播图，请点击右侧按钮新增。</div>`;
        return;
    }
    container.innerHTML = data.map(item => `
        <div class="glass-card p-5 rounded-2xl flex flex-col justify-between space-y-3">
            <div class="flex gap-4">
                <img src="${getImageUrl(item.imageUrl)}" class="w-20 h-20 rounded-xl object-cover border border-slate-200">
                <div class="flex-1">
                    <h4 class="font-bold text-slate-800 text-sm mb-1">${item.title || '无标题'}</h4>
                    <p class="text-[10px] text-slate-500 font-bold">排序: ${item.sort || 0}</p>
                    <span class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-2 inline-block">Carousel</span>
                </div>
            </div>
            <div class="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button onclick="editCarousel('${item.id}')" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg transition-all">编辑</button>
                <button onclick="deleteCarousel('${item.id}')" class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[10px] rounded-lg transition-all">删除</button>
            </div>
        </div>
    `).join('');
}

function openCarouselModal(editId = null) {
    const modal = document.getElementById("carousel-modal");
    document.getElementById("carousel-form").reset();
    document.getElementById("carousel-id").value = "";
    document.getElementById("carousel-url").value = "";
    document.getElementById("carousel-preview").innerHTML = '<i class="fa-solid fa-image text-slate-300 text-xl"></i>';
    document.getElementById("carousel-modal-title").textContent = "新增轮播图";
    if (editId) {
        document.getElementById("carousel-modal-title").textContent = "编辑轮播图";
        loadCarouselForEdit(editId);
    }
    toggleModal("carousel-modal", true);
}

async function loadCarouselForEdit(id) {
    try {
        let data = [];
        if (isBackendOnline) {
            data = await apiRequest("/carousel/list");
        }
        if (data.length === 0) {
            data = lsGet(LS.carousel, []);
        }
        const item = data.find(x => x.id == id);
        if (item) {
            document.getElementById("carousel-id").value = item.id;
            document.getElementById("carousel-title").value = item.title || "";
            document.getElementById("carousel-sort").value = item.sort || 0;
            document.getElementById("carousel-url").value = item.imageUrl || "";
            if (item.imageUrl) {
                document.getElementById("carousel-preview").innerHTML = `<img src="${getImageUrl(item.imageUrl)}" class="w-full h-full object-cover">`;
            }
        }
    } catch (e) {
        showToast("加载轮播信息失败: " + e.message, true);
    }
}

function editCarousel(id) {
    openCarouselModal(id);
}

async function deleteCarousel(id) {
    showVisionConfirm("删除轮播图", "确定要删除这张轮播图吗？", async () => {
        try {
            if (isBackendOnline) {
                await apiRequest(`/carousel/delete/${id}`, { method: "DELETE" });
            } else {
                const list = lsGet(LS.carousel, []).filter(x => x.id != id);
                lsSet(LS.carousel, list);
            }
            showToast("轮播图已成功删除。");
            loadCarouselTable();
        } catch (e) {
            showToast("删除失败: " + e.message, true);
        }
    });
}

document.getElementById("carousel-form").onsubmit = async function(e) {
    e.preventDefault();
    const id = document.getElementById("carousel-id").value;
    const file = document.getElementById("carousel-file").files[0];
    let url = document.getElementById("carousel-url").value;

    if (file && isBackendOnline) {
        try {
            const formData = new FormData();
            formData.append("file", file);
            const token = localStorage.getItem("token");
            const res = await fetch(BASE_URL + "/upload/file", {
                method: "POST",
                headers: token ? { "token": token } : {},
                body: formData
            });
            const data = await res.json();
            if (data.code === 200) {
                url = data.data.url;
            } else {
                showToast("图片上传失败: " + (data.msg || "未知错误"), true);
                return;
            }
        } catch (e) {
            showToast("图片上传失败: " + e.message, true);
            return;
        }
    }

    const payload = {
        title: document.getElementById("carousel-title").value,
        sort: parseInt(document.getElementById("carousel-sort").value) || 0,
        imageUrl: url || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"
    };

    if (isBackendOnline) {
        try {
            if (id) {
                payload.id = parseInt(id);
                await apiRequest("/carousel/update", { method: "PUT", body: payload });
                showToast("轮播信息已更新");
            } else {
                await apiRequest("/carousel/add", { method: "POST", body: payload });
                showToast("新轮播图已发布");
            }
        } catch (e) {
            showToast("操作失败: " + e.message, true);
            return;
        }
    } else {
        // 离线模式
        const list = lsGet(LS.carousel, []);
        if (id) {
            const idx = list.findIndex(x => x.id == id);
            if (idx !== -1) list[idx] = { ...payload, id: id };
        } else {
            list.push({ ...payload, id: Date.now() });
        }
        lsSet(LS.carousel, list);
        showToast("离线模式：轮播已保存至本地");
    }
    
    toggleModal("carousel-modal", false);
    loadCarouselTable();
};

function closeCarouselModal() {
    toggleModal("carousel-modal", false);
}

function exportSnapshot() {
    const payload = {
        exportTime: new Date().toISOString(),
        recommendBooks: lsGet(LS.books, []),
        habitsTracker: lsGet(LS.habits, []),
        habitsDoneLogs: lsGet(LS.habitsDone, {}),
        siteProfile: lsGet(LS.settings, {}),
        offlineFeedback: lsGet(LS.offlineFeedback, [])
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hz_portfolio_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function loadInsights() {
    const el = document.getElementById("insights-cards");
    if (!el) return;
    const books = lsGet(LS.books, []).length;
    const habits = lsGet(LS.habits, []).length;
    const done = lsGet(LS.habitsDone, {});
    const today = todayKey();
    const todayDone = (done[today] || []).length;
    const offlineMessages = lsGet(LS.offlineFeedback, []).length;

    el.innerHTML = `
        <div class="glass-card p-6 rounded-2xl space-y-2">
            <span class="text-[10px] font-bold text-slate-500">自建数据库存储总览</span>
            <div class="text-2xl font-black text-slate-800">${books + habits} 个条目</div>
            <p class="text-[11px] text-slate-500">书架 ${books} · 坚持习惯 ${habits}</p>
        </div>
        <div class="glass-card p-6 rounded-2xl space-y-2">
            <span class="text-[10px] font-bold text-slate-500">今日健康自律打卡率</span>
            <div class="text-2xl font-black text-slate-800">${todayDone} / ${habits} 项已完</div>
            <p class="text-[11px] text-slate-500">今日打卡核算日期：${today}</p>
        </div>
        <div class="glass-card p-6 rounded-2xl space-y-2">
            <span class="text-[10px] font-bold text-slate-500">访客离线留言沉淀</span>
            <div class="text-2xl font-black text-slate-800">${offlineMessages} 条新留言</div>
            <p class="text-[11px] text-slate-500">可在前台无后端状态下完美留存访客沟通需求。</p>
        </div>
        <div class="glass-card p-6 rounded-2xl space-y-2">
            <span class="text-[10px] font-bold text-slate-500">架构稳定性建议</span>
            <p class="text-[11px] text-slate-600 leading-relaxed">系统已完全实现微服务接口和高容灾缓存的透明化加载模式。</p>
        </div>
    `;
}

async function loadStatistics() {
    let projectsCount = 0;
    let articlesCount = 0;

    if (isBackendOnline) {
        try {
            const projects = await apiRequest("/project/list") || [];
            const articles = await apiRequest("/article/list") || [];
            projectsCount = projects.length;
            articlesCount = articles.length;
        } catch (e) {
            projectsCount = fallbackProjects.length;
            articlesCount = fallbackArticles.length;
        }
    } else {
        projectsCount = fallbackProjects.length;
        articlesCount = fallbackArticles.length;
    }

    const offlineMessages = lsGet(LS.offlineFeedback, []);
    let onlineMessagesCount = 0;
    if (isBackendOnline) {
        try {
            const onlineMsgs = await apiRequest("/api/message/list") || [];
            onlineMessagesCount = onlineMsgs.length;
        } catch (_) {}
    }

    document.getElementById("stat-projects").textContent = projectsCount;
    document.getElementById("stat-articles").textContent = articlesCount;
    document.getElementById("stat-messages").textContent = onlineMessagesCount + offlineMessages.length;
}

async function loadProjectTable() {
    const container = document.getElementById("project-list");
    if (!container) return;
    container.innerHTML = `<div class="text-xs text-slate-400">项目数据加载中...</div>`;

    let data = [];
    if (isBackendOnline) {
        try {
            data = await apiRequest("/project/list") || [];
        } catch (e) {
            data = fallbackProjects;
        }
    } else {
        data = fallbackProjects;
    }

    if (data.length === 0) {
        container.innerHTML = `<div class="text-xs text-slate-400">目前暂未创建项目档案。</div>`;
        return;
    }

    container.innerHTML = data.map(item => `
        <div class="glass-card p-5 rounded-2xl flex flex-col justify-between space-y-4">
            <div>
                <div class="aspect-video w-full rounded-xl bg-slate-100 overflow-hidden border border-slate-200/50 mb-3">
                    <img src="${getImageUrl(item.image)}" onerror="this.src='https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400'" class="w-full h-full object-cover">
                </div>
                <h4 class="font-bold text-slate-800 text-sm mb-1 line-clamp-1">${item.title}</h4>
                <span class="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">${item.techStack || '通用Java架构'}</span>
                <p class="text-slate-500 text-[11px] leading-relaxed mt-2 line-clamp-2">${item.description || '暂无描述'}</p>
            </div>
            <div class="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button onclick="editProject(${item.id})" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg transition-all">编辑</button>
                <button onclick="deleteProject(${item.id})" class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[10px] rounded-lg transition-all">删除</button>
            </div>
        </div>
    `).join('');
}

async function loadArticleTable() {
    const container = document.getElementById("article-list");
    if (!container) return;
    container.innerHTML = `<div class="text-xs text-slate-400">博文数据加载中...</div>`;

    let data = [];
    if (isBackendOnline) {
        try {
            data = await apiRequest("/article/list") || [];
        } catch (e) {
            data = fallbackArticles;
        }
    } else {
        data = fallbackArticles;
    }

    if (data.length === 0) {
        container.innerHTML = `<div class="text-xs text-slate-400">目前暂未发表任何博文。</div>`;
        return;
    }

    container.innerHTML = data.map(item => `
        <div class="glass-card p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in">
            <div>
                <h4 class="font-bold text-slate-800 text-sm mb-1">${item.title}</h4>
                <p class="text-slate-500 text-[11px] leading-relaxed line-clamp-1">${item.summary || '暂无摘要总结'}</p>
            </div>
            <div class="flex space-x-2 shrink-0">
                <button onclick="editArticle(${item.id})" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg transition-all">编辑文章</button>
                <button onclick="deleteArticle(${item.id})" class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[10px] rounded-lg transition-all">下架</button>
            </div>
        </div>
    `).join('');
}

async function loadMessagesTable() {
    const container = document.getElementById("message-list");
    if (!container) return;
    container.innerHTML = `<div class="text-xs text-slate-400">正在同步留言板...</div>`;

    let data = [];
    if (isBackendOnline) {
        try {
            data = await apiRequest("/api/message/list") || [];
        } catch (e) {
            console.warn("读后端留言接口出错");
        }
    }

    const offlineData = lsGet(LS.offlineFeedback, []);
    data = [...offlineData, ...data];

    if (data.length === 0) {
        container.innerHTML = `<div class="text-xs text-slate-400 col-span-full">留言审查箱空空如也。</div>`;
        return;
    }

    container.innerHTML = data.map(item => {
        const isOfflineMark = offlineData.some(x => x.id === item.id);
        return `
            <div class="glass-card p-5 rounded-2xl flex flex-col justify-between space-y-3">
                <div>
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <span>${item.username || '匿名游客'}</span>
                            ${isOfflineMark ? '<span class="text-[9px] font-black uppercase text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">本地缓存</span>' : '<span class="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">数据库</span>'}
                        </span>
                        <span class="text-[9px] text-slate-400">${item.createTime ? String(item.createTime).substring(0, 10) : '刚刚'}</span>
                    </div>
                    <span class="text-[10px] text-indigo-500 font-semibold block mb-2">${item.email || '未预留联系邮箱'}</span>
                    <p class="text-slate-600 text-[11px] leading-relaxed bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">${item.content || ''}</p>
                </div>
            </div>
        `;
    }).join('');
}

document.addEventListener("DOMContentLoaded", async () => {
    seedLocalModulesIfEmpty();
    loadSettings();

    await checkBackendConnectivity();
    await initDataCenter();

    loadStatistics();
    loadProjectTable();
    loadArticleTable();
    loadMessagesTable();

    loadBooksTable();
    loadHabitsTable();
    loadMusicTable();
    loadInsightTable();
    loadCarouselTable();
    loadInsights();

    // 轮播图文件预览优化
    const carouselFileInput = document.getElementById("carousel-file");
    if (carouselFileInput) {
        carouselFileInput.addEventListener("change", function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById("carousel-preview").innerHTML = `<img src="${e.target.result}" class="w-full h-full object-cover">`;
                    // 在离线模式下，我们也可以把这个 base64 存入隐藏 input 作为一个暂存方案
                    if (!isBackendOnline) {
                        document.getElementById("carousel-url").value = e.target.result;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 音乐封面文件预览优化
    const musicCoverInput = document.getElementById("music-cover-file");
    if (musicCoverInput) {
        musicCoverInput.addEventListener("change", function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById("music-cover-preview").innerHTML = `<img src="${e.target.result}" class="w-full h-full object-cover">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }
});
