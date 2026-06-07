/**
 * ==========================================
 * Glass Portfolio - 统一安全请求拦截核心
 * 自动处理 JWT 令牌注入与 401 身份校验失效重定向
 * ==========================================
 */

const BASE_URL = "http://localhost:8080";

/**
 * 核心请求封装方法
 * @param {string} url - 请求相对路径
 * @param {object} options - Fetch 配置参数
 */
async function request(url, options = {}) {
    // 1. 初始化 headers 对象
    options.headers = options.headers || {};

    // 2. 自动从本地存储提取 JWT Token 并注入请求头
    const token = localStorage.getItem("token");
    if (token) {
        options.headers["token"] = token;
    }

    // 3. 对含有 JSON 对象的请求自动追加内容类型
    if (options.body && typeof options.body === "object" && !(options.body instanceof FormData)) {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(BASE_URL + url, options);

        // 4. 核心安全拦截：检测 401 登录态失效或未授权
        if (response.status === 401) {
            localStorage.removeItem("token");
            alert("您的登录凭证已失效，请重新登录！");
            window.location.href = "/"; // 强行重定向至登录页
            throw new Error("Unauthorized");
        }

        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            throw new Error("后端返回的并非合法的 JSON 格式数据");
        }

        // 5. 统一适配后端的 Result 包装格式
        if (data && data.code !== undefined) {
            if (data.code !== 200) {
                throw new Error(data.msg || "后端操作执行失败");
            }
            return data.data; // 返回 Result 内包的真实业务实体
        }
        return data;

    } catch (error) {
        console.error("【API 请求链路报错】:", error);
        throw error;
    }
}

/**
 * 异步文件上传专属（多媒体服务）
 */
export async function uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("token");
    const headers = {};
    if (token) {
        headers["token"] = token;
    }

    const res = await fetch(BASE_URL + "/upload/file", {
        method: "POST",
        headers: headers,
        body: formData
    });

    if (res.status === 401) {
        localStorage.removeItem("token");
        alert("登录已过期，请重新登录！");
        window.location.href = "/";
        return;
    }

    const data = await res.json();
    if (data.code !== 200) {
        throw new Error(data.msg || "上传失败");
    }
    return data.data; // 返回包含 url 的 Map
}

/* ==========================================
   项目 (Project) API 模块
   ========================================== */
export function getProjects() {
    return request("/project/list");
}

export function getProjectById(id) {
    return request(`/project/${id}`);
}

export function addProjectApi(data) {
    return request("/project/add", {
        method: "POST",
        body: data
    });
}

export function updateProjectApi(data) {
    return request("/project/update", {
        method: "PUT",
        body: data
    });
}

export function deleteProjectApi(id) {
    return request(`/project/delete/${id}`, {
        method: "DELETE"
    });
}

/* ==========================================
   文章 (Article) API 模块
   ========================================== */
export function getArticles() {
    return request("/article/list");
}

export function getArticleById(id) {
    return request(`/article/${id}`);
}

export function addArticleApi(data) {
    return request("/article/add", {
        method: "POST",
        body: data
    });
}

export function updateArticleApi(data) {
    return request("/article/update", {
        method: "PUT",
        body: data
    });
}

export function deleteArticleApi(id) {
    return request(`/article/delete/${id}`, {
        method: "DELETE"
    });
}

/* ==========================================
   留言板 (Message) API 模块
   ========================================== */
export function getMessages() {
    return request("/api/message/list");
}

export function deleteMessageApi(id) {
    // 假设你有删除留言的接口，如没有，可方便未来拓展
    return request(`/api/message/delete/${id}`, {
        method: "DELETE"
    });
}


/* ==========================================
   音乐 (Music) API 模块
   ========================================== */
export function getMusics() {
    return request("/music/list");
}

export function getMusicById(id) {
    return request(`/music/${id}`);
}

export function addMusicApi(data) {
    return request("/music/add", {
        method: "POST",
        body: data
    });
}

export function updateMusicApi(data) {
    return request("/music/update", {
        method: "PUT",
        body: data
    });
}

export function deleteMusicApi(id) {
    return request(`/music/delete/${id}`, {
        method: "DELETE"
    });
}

/* ==========================================
   感悟 (Insight) API 模块
   ========================================== */
export function getInsights() {
    return request("/insight/list");
}

export function getInsightById(id) {
    return request(`/insight/${id}`);
}

export function addInsightApi(data) {
    return request("/insight/add", {
        method: "POST",
        body: data
    });
}

export function updateInsightApi(data) {
    return request("/insight/update", {
        method: "PUT",
        body: data
    });
}

export function deleteInsightApi(id) {
    return request(`/insight/delete/${id}`, {
        method: "DELETE"
    });
}

/* ==========================================
   轮播图 (Carousel) API 模块
   ========================================== */
export function getCarousels() {
    return request("/carousel/list");
}

export function addCarouselApi(data) {
    return request("/carousel/add", {
        method: "POST",
        body: data
    });
}

export function updateCarouselApi(data) {
    return request("/carousel/update", {
        method: "PUT",
        body: data
    });
}

export function deleteCarouselApi(id) {
    return request(`/carousel/delete/${id}`, {
        method: "DELETE"
    });
}