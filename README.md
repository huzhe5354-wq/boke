const BASE_URL = "http://localhost:8080";
let isBackendOnline = false;
let articleDataCache = [];
let projectDataCache = [];

// ==========================================
// LocalStorage Keys
// ==========================================
const LS_KEYS = {
    books: "hz_admin_books",
    habits: "hz_admin_habits",
    habitsDone: "hz_admin_habits_done",
    settings: "hz_admin_settings",
    feedback: "hz_feedback_offline",
    chartData: "hz_admin_chart_data",
    carousel: "hz_admin_carousel"
};

// 默认内置高保真备用展示数据（确保未开启后端时完美展示）
const fallbackProjects = [
    {
        id: 991,
        title: "微服务分布式高并发网关拦截系统",
        techStack: "SpringBoot, Redis, JWT",
        description: "基于 Java 高级反射与自定义注解设计的高响应、低时延动态权限控制拦截链，吞吐率优化提升了 40%。",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600"
    },
    {
        id: 992,
        title: "Apple Vision Pro 空间拟物风格个人中心",
        techStack: "Vue, Tailwind, Three.js",
        description: "前台高透白色液态磨砂有机玻璃视觉表达，结合 WebGL 拓扑连线星系，带来极致的空间临场感体验。",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600"
    }
];

const fallbackArticles = [
    {
        id: 881,
        title: "深入浅出 JVM 垃圾回收器优化：针对极低停顿的时延调优指南",
        summary: "结合高并发生产实战，全景解析高吞吐后端服务中 G1/ZGC 垃圾回收器的参数拟合与内存泄露治理心得。",
        content: "<h3>关于内存调优</h3><p>在超高并发的高吞吐系统设计中，降低 STW 停顿时间是永无止境的追求。通过精细调整新生代大小及晋升阈值，能从根本上阻止对象异常流入老年代...</p>"
    },
    {
        id: 882,
        title: "Redis 分布式锁在复杂高并发拦截业务中的可重入设计与红锁实现",
        summary: "从底层 Lua 脚本到集群红锁算法，探讨如何在多机部署的微服务网关上保证绝对一致的安全凭证校验流程。",
        content: "<h3>Lua 脚本原子性控制</h3><p>当多个并发拦截器同时触达 Redis 实例时，采用 Lua 脚本进行原子化加锁与过期控制是最高效、稳定的方案...</p>"
    }
];

// ==========================================
// 0. 音频管理器与拓扑粒子震荡共振模块
// ==========================================
const trackList = [
    { name: "纯净溪流之声", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200" },
    { name: "深海潮汐回响", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", cover: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=200" },
    { name: "雨夜温暖编码", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200" }
];
let currentTrackIdx = 0;
let audioContext, audioAnalyser, audioSource, audioBufferSource;
let isAudioPlaying = false;
let audioNode;

// 从后端加载音乐列表
async function loadMusicList() {
    try {
        const res = await fetch("http://localhost:8080/music/list");
        const data = await res.json();
        if (data && data.code === 200 && data.data && data.data.length > 0) {
            trackList.length = 0;
            data.data.forEach(music => {
                trackList.push({
                    name: music.title || music.artist || "未知音乐",
                    url: music.url,
                    cover: music.cover || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200"
                });
            });
            if (trackList.length > 0) {
                updateMusicUI();
            }
        }
    } catch (e) {
        console.warn("音乐列表加载失败，使用默认列表:", e);
    }
}

function updateMusicUI() {
    const track = trackList[currentTrackIdx];
    const nameEl = document.getElementById("track-name");
    const coverEl = document.getElementById("track-cover");
    if (nameEl) nameEl.textContent = track.name;
    if (coverEl) coverEl.src = track.cover;
}
loadMusicList();

// 初始化音频感知 (仅在交互后加载)
function initAudioAnalyser() {
    if (audioContext) return;
    try {
        audioNode = new Audio();
        audioNode.crossOrigin = "anonymous";
        audioNode.src = trackList[currentTrackIdx].url;

        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioCtx();
        audioAnalyser = audioContext.createAnalyser();
        audioAnalyser.fftSize = 256;

        audioSource = audioContext.createMediaElementSource(audioNode);
        audioSource.connect(audioAnalyser);
        audioAnalyser.connect(audioContext.destination);
    } catch (e) {
        console.warn("当前浏览器音频权限拦截，将自动启动自仿真节奏振幅器。");
    }
}

// 获取当前音乐的节奏（振幅），如果没有真实音频API，则采用平滑的随机正弦波模拟
    function getMusicBeatIntensity() {
        if (audioAnalyser && isAudioPlaying) {
        const dataArray = new Uint8Array(audioAnalyser.frequencyBinCount);
        audioAnalyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
        }
        return sum / dataArray.length / 255.0; // 返回 0 到 1 之间的归一化振幅
    }
    // 音频未播放或无接口时，返回自模拟的正弦节奏波动
    return isAudioPlaying ? (0.3 + 0.7 * Math.abs(Math.sin(Date.now() * 0.005))) : 0;
}

function togglePlay() {
    initAudioAnalyser();
    const playBtn = document.getElementById("play-btn");
    const wave = document.getElementById("audio-wave");
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }

    if (isAudioPlaying) {
        audioNode.pause();
        isAudioPlaying = false;
        playBtn.innerHTML = '<i class="fa-solid fa-play text-[10px]"></i>';
        wave.classList.add("opacity-50");
    } else {
        audioNode.play().then(() => {
            isAudioPlaying = true;
            playBtn.innerHTML = '<i class="fa-solid fa-pause text-[10px]"></i>';
            wave.classList.remove("opacity-50");
        }).catch(err => {
            isAudioPlaying = true;
            playBtn.innerHTML = '<i class="fa-solid fa-pause text-[10px]"></i>';
            wave.classList.remove("opacity-50");
        });
    }
}

function prevTrack() {
    currentTrackIdx = (currentTrackIdx - 1 + trackList.length) % trackList.length;
    changeTrack();
}

function nextTrack() {
    currentTrackIdx = (currentTrackIdx + 1) % trackList.length;
    changeTrack();
}

function changeTrack() {
    initAudioAnalyser();
    updateMusicUI();
    audioNode.src = trackList[currentTrackIdx].url;
    if (isAudioPlaying) {
        audioNode.play().catch(() => {});
    }
}

function setVolume(v) {
        if (audioNode) {
            audioNode.volume = v;
        }
    }

    // ==========================================
    // 播放器 UI 增强逻辑
    // ==========================================
    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    function updatePlayerUI() {
        if (!audioNode) return;
        
        const progress = (audioNode.currentTime / audioNode.duration) * 100 || 0;
        const progressBar = document.getElementById("progress-bar");
        const currentTimeEl = document.getElementById("current-time");
        const totalDurationEl = document.getElementById("total-duration");
        
        if (progressBar) progressBar.style.width = `${progress}%`;
        if (currentTimeEl) currentTimeEl.textContent = formatTime(audioNode.currentTime);
        if (totalDurationEl && !isNaN(audioNode.duration)) {
            totalDurationEl.textContent = formatTime(audioNode.duration);
        }

        // 更新波浪动画效果
        const waves = document.querySelectorAll("#audio-wave span");
        if (waves.length > 0) {
            const intensity = getMusicBeatIntensity();
            waves.forEach((w, i) => {
                const h = isAudioPlaying ? (20 + intensity * 80 * (0.5 + Math.random() * 0.5)) : 20;
                w.style.height = `${h}%`;
            });
        }
    }

    window.seekAudio = function(e) {
        if (!audioNode) return;
        const container = document.getElementById("progress-container");
        const rect = container.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        audioNode.currentTime = pos * audioNode.duration;
    }

    // ==========================================
    // 1. 终极版 3D 粒子系统：分层随机/几何态 + 3D 环形音波可视化
    // ==========================================
let scene, camera, renderer, starCount = 5200; 
let starsGeometry, starsPoints, linesMesh;
let starPositions = [], starVelocities = [], targetPositions = [];
let mouseX = 0, mouseY = 0;

let audioTransitionStartTime = 0;
let prevAudioPlayingState = false;

let smoothedBeatIntensity = 0;
let smoothedFreqData = new Uint8Array(128);
const LERP_FACTOR = 0.08; 

function initThree() {
    const container = document.getElementById('three-container');
    if (!container || typeof THREE === 'undefined') return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.z = 500;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - window.innerWidth / 2) * 1.2;
        mouseY = -(e.clientY - window.innerHeight / 2) * 1.2;
    });

    starsGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const getHeartPoint = (t, scale = 18) => {
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
        return { x: x * scale, y: -y * scale, z: (Math.random() - 0.5) * 40 };
    };

    const generateGeometricTargets = (shape) => {
        for (let i = 0; i < starCount; i++) {
            let tx, ty, tz;
            if (i < starCount * 0.8) {
                if (shape === 'sphere') {
                    const phi = Math.acos(-1 + (2 * i) / (starCount * 0.8));
                    const theta = Math.sqrt(starCount * 0.8 * Math.PI) * phi;
                    tx = 320 * Math.cos(theta) * Math.sin(phi);
                    ty = 320 * Math.sin(theta) * Math.sin(phi);
                    tz = 320 * Math.cos(phi);
                } else if (shape === 'heart') {
                    const t = (i / (starCount * 0.8)) * Math.PI * 2;
                    const p = getHeartPoint(t, 15);
                    tx = p.x; ty = p.y; tz = p.z;
                } else if (shape === 'cube') {
                    const side = Math.pow(starCount * 0.8, 1/3);
                    const ix = i % Math.floor(side);
                    const iy = Math.floor(i / side) % Math.floor(side);
                    const iz = Math.floor(i / (side * side));
                    tx = (ix / side - 0.5) * 550;
                    ty = (iy / side - 0.5) * 550;
                    tz = (iz / side - 0.5) * 550;
                } else if (shape === 'tree') {
                    const ratio = i / (starCount * 0.8);
                    if (ratio < 0.8) {
                        const h = (1 - ratio/0.8) * 500;
                        const r = (ratio/0.8) * 200;
                        const angle = ratio * 100;
                        tx = Math.cos(angle) * r;
                        tz = Math.sin(angle) * r;
                        ty = h - 150;
                    } else {
                        tx = (Math.random() - 0.5) * 40;
                        tz = (Math.random() - 0.5) * 40;
                        ty = -150 - (Math.random() * 150);
                    }
                } else if (shape === 'cloud') {
                    const segment = i % 3;
                    const t = Math.random() * Math.PI * 2;
                    const u = Math.random() * Math.PI;
                    const r = 100 + Math.random() * 50;
                    const offsetX = segment === 0 ? -120 : (segment === 1 ? 0 : 120);
                    const offsetY = segment === 1 ? 40 : 0;
                    tx = offsetX + r * Math.sin(u) * Math.cos(t);
                    ty = offsetY + r * Math.sin(u) * Math.sin(t);
                    tz = r * Math.cos(u) * 0.6;
                }
            } else {
                tx = (Math.random() - 0.5) * 1200;
                ty = (Math.random() - 0.5) * 1000;
                tz = (Math.random() - 0.5) * 600;
            }
            targetPositions[i] = new THREE.Vector3(tx, ty, tz);
        }
    };

    generateGeometricTargets('sphere');

    for (let i = 0; i < starCount; i++) {
        let x = Math.random() * 2000 - 1000;
        let y = Math.random() * 1200 - 600;
        let z = Math.random() * 800 - 400;
        
        const pos = new THREE.Vector3(x, y, z);
        pos.layer = i % 5;
        pos.strandIdx = i % 12; 
        pos.strandPos = (i / starCount); 
        pos.phase = Math.random() * Math.PI * 2;
        pos.angle = Math.random() * Math.PI * 2;
        pos.orbitRadius = 60 + Math.random() * 100;
        pos.orbitSpeed = 0.04 + Math.random() * 0.06;
        pos.vizOffset = (Math.random() - 0.5) * 40;
        
        starPositions.push(pos);
        starVelocities.push(new THREE.Vector3(
            (Math.random() - 0.5) * 2, 
            (Math.random() - 0.5) * 2, 
            (Math.random() - 0.5) * 2
        ));
        
        positions[i*3] = x;
        positions[i*3+1] = y;
        positions[i*3+2] = z;
        
        colors[i*3] = 0.6; colors[i*3+1] = 0.85; colors[i*3+2] = 1.0;
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    starsPoints = new THREE.Points(starsGeometry, new THREE.PointsMaterial({ 
        size: 4.2, 
        vertexColors: true,
        transparent: true, 
        opacity: 0.9,
        blending: THREE.AdditiveBlending 
    }));
    scene.add(starsPoints);

    const lineMaterial = new THREE.LineBasicMaterial({ 
        vertexColors: true,
        transparent: true, 
        opacity: 0.35, 
        blending: THREE.AdditiveBlending 
    });
    linesMesh = new THREE.LineSegments(new THREE.BufferGeometry(), lineMaterial);
    scene.add(linesMesh);

    let lastShapeChange = 0;
    let shapeIdx = 0;
    const shapes = ['sphere', 'heart', 'cube', 'tree', 'cloud'];

    function animate(time) {
        requestAnimationFrame(animate);
        
        // 更新播放器 UI (进度条、时间、波浪)
        updatePlayerUI();

        // 处理 2 秒缓慢过渡
        if (isAudioPlaying !== prevAudioPlayingState) {
            audioTransitionStartTime = time;
            prevAudioPlayingState = isAudioPlaying;
        }
        const transitionProgress = Math.min(1.0, (time - audioTransitionStartTime) / 2000);

        const rawBeat = getMusicBeatIntensity();
        smoothedBeatIntensity += (rawBeat - smoothedBeatIntensity) * LERP_FACTOR; 

        if (audioAnalyser) {
            audioAnalyser.getByteFrequencyData(smoothedFreqData);
        }

        const posArr = starsGeometry.attributes.position.array;
        const colArr = starsGeometry.attributes.color.array;
        const linePos = [];
        const lineCol = [];

        const breatheScale = 1 + Math.sin(time * 0.001) * 0.05;
        if (!isAudioPlaying && time - lastShapeChange > 7000) {
            shapeIdx = (shapeIdx + 1) % shapes.length;
            generateGeometricTargets(shapes[shapeIdx]);
            lastShapeChange = time;
        }

        for (let i = 0; i < starCount; i++) {
            let p = starPositions[i];
            const freqIdx = Math.floor((i / starCount) * 64);
            const freqVal = (smoothedFreqData[freqIdx] || 0) / 255;
            
            let r, g, b;
            if (isAudioPlaying) {
                if (freqIdx < 15) { r = 0.6 + freqVal * 0.4; g = 0.1; b = 0.3; } 
                else if (freqIdx < 40) { r = 0.4; g = 0.2; b = 0.7 + freqVal * 0.3; }
                else { r = 0.1; g = 0.5 + freqVal * 0.5; b = 0.9; }
            } else {
                r = 0.5; g = 0.8; b = 1.0;
            }
            colArr[i*3] = r; colArr[i*3+1] = g; colArr[i*3+2] = b;

            // 鼠标吸附逻辑：大幅削弱力度，改为只依次小范围吸附微量粒子
            const mDX = p.x - mouseX;
            const mDY = p.y - mouseY;
            const mDist = Math.sqrt(mDX * mDX + mDY * mDY);
            // 只有索引为 10 的倍数的粒子才会产生微弱吸附，且范围缩小到 250
            if (i % 10 === 0 && mDist < 250) {
                const mForce = (250 - mDist) / 250 * 0.008; // 力度从 0.05 降至 0.008
                p.x -= mDX * mForce;
                p.y -= mDY * mForce;
            }

            if (!isAudioPlaying) {
                const target = targetPositions[i].clone().multiplyScalar(breatheScale);
                const angle = time * 0.0002 + p.phase;
                const radius = target.length();
                target.x += Math.cos(angle) * (radius * 0.05);
                target.y += Math.sin(angle) * (radius * 0.05);
                
                p.lerp(target, 0.04);
            } else {
                const t = time * 0.001;
                const layer = p.layer;
                
                const meteorX = (p.strandPos - 0.5) * 2200 + (t * 600 % 2200);
                let finalX = ((meteorX + 1100) % 2200) - 1100;
                
                const freqIdx = Math.floor((Math.abs(finalX) / 1100) * 127);
                const freqVal = (smoothedFreqData[freqIdx] || 0) / 255;
                
                if (layer < 2) {
                    const crossDir = (layer === 0 ? 1 : -1);
                    const waveY = Math.sin(finalX * 0.004 + t * 5) * 45 * crossDir;
                    const targetPos = new THREE.Vector3(finalX, waveY, 0);
                    p.lerp(targetPos, 0.12 + transitionProgress * 0.1);
                } else if (layer === 2) {
                    p.angle += p.orbitSpeed * (1 + smoothedBeatIntensity * 9);
                    const r = (25 + smoothedBeatIntensity * 140);
                    const orbitY = Math.sin(p.angle) * r;
                    const orbitZ = Math.cos(p.angle) * r * 0.7;
                    const targetPos = new THREE.Vector3(finalX, orbitY, orbitZ);
                    p.lerp(targetPos, 0.06 + transitionProgress * 0.08);
                } else {
                    const vizHeight = freqVal * 550 * (layer === 3 ? 1 : -1); 
                    const waveZ = Math.sin(finalX * 0.008 + t * 7) * 100;
                    const targetPos = new THREE.Vector3(finalX + p.vizOffset * 0.5, vizHeight, waveZ);
                    p.lerp(targetPos, 0.08 + transitionProgress * 0.1);
                }
            }

            posArr[i*3] = p.x;
            posArr[i*3+1] = p.y;
            posArr[i*3+2] = p.z;

            if (i % 8 === 0) {
                const searchRange = isAudioPlaying ? 50 : 45;
                for (let j = i + 1; j < Math.min(i + searchRange, starCount); j++) {
                    const distSq = p.distanceToSquared(starPositions[j]);
                    const maxDistSq = isAudioPlaying ? 14000 : 10000;
                    if (distSq < maxDistSq) {
                        linePos.push(p.x, p.y, p.z, starPositions[j].x, starPositions[j].y, starPositions[j].z);
                        lineCol.push(r, g, b, colArr[j*3], colArr[j*3+1], colArr[j*3+2]);
                    }
                }
            }
        }
        
        starsGeometry.attributes.position.needsUpdate = true;
        starsGeometry.attributes.color.needsUpdate = true;
        
        if (linePos.length > 0) {
            linesMesh.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePos), 3));
            linesMesh.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(lineCol), 3));
        } else {
            linesMesh.geometry.deleteAttribute('position');
        }

        camera.position.x += (mouseX * 0.2 - camera.position.x) * 0.05;
        camera.position.y += (mouseY * 0.2 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);

        // UI 节奏震动效果 (优化幅度并限制范围)
        if (isAudioPlaying && smoothedBeatIntensity > 0.05) {
            const vibrationAmplitude = smoothedBeatIntensity * 6.0; // 降低震动倍率，从 12.0 降至 6.0
            const vx = (Math.random() - 0.5) * vibrationAmplitude;
            const vy = (Math.random() - 0.5) * vibrationAmplitude;
            document.querySelectorAll('.vision-glass').forEach(el => {
                el.style.setProperty('--vibrate-x', `${vx.toFixed(2)}px`);
                el.style.setProperty('--vibrate-y', `${vy.toFixed(2)}px`);
            });
        } else {
            document.querySelectorAll('.vision-glass').forEach(el => {
                el.style.setProperty('--vibrate-x', '0px');
                el.style.setProperty('--vibrate-y', '0px');
            });
        }
    }
    animate(0);
}

// ==========================================
// 2. 完美的无缝降级与数据流渲染（可信度、高稳定性）
// ==========================================
function getImageUrl(path) {
    if (!path) return 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return BASE_URL + (path.startsWith('/') ? path : '/' + path);
}

async function checkBackendConnectivity() {
    try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(BASE_URL + "/project/list", { signal: controller.signal });
        clearTimeout(id);
        if (res.ok) {
            isBackendOnline = true;
            updateStatusBadge(true, "已连接本地 SpringBoot");
        } else {
            throw new Error();
        }
    } catch (e) {
        isBackendOnline = false;
        updateStatusBadge(false, "已无缝降级至高透本地缓存");
    }
}

function updateStatusBadge(isOnline, text) {
    const dot = document.getElementById("status-dot");
    const badgeText = document.getElementById("status-text");
    if (!dot || !badgeText) return;

    if (isOnline) {
        dot.className = "w-2 h-2 rounded-full bg-emerald-500 animate-pulse";
    } else {
        dot.className = "w-2 h-2 rounded-full bg-orange-400";
    }
    badgeText.textContent = text;
}

async function loadDynamicPortfolio() {
    // checkBackendConnectivity() 已在 DOMContentLoaded 中优先调用

    // 加载并应用站点全局配置
    const settings = JSON.parse(localStorage.getItem(LS_KEYS.settings)) || {
        siteName: "胡哲",
        bio: "Developer Portfolio",
        logoUrl: ""
    };
    
    const nameEls = [document.getElementById("site-name"), document.getElementById("hero-name")];
    const bioEl = document.getElementById("site-bio");
    const logoEls = [document.getElementById("site-logo"), document.getElementById("evade-avatar")];
    
    if (nameEls[0]) nameEls[0].textContent = settings.siteName || "胡哲";
    if (nameEls[1]) {
        let displayName = settings.siteName || "胡哲";
        // 如果名字中已经包含了 "你好，我是"，则去掉它，因为 HTML 中已经有了
        if (displayName.startsWith("你好，我是")) {
            displayName = displayName.replace("你好，我是", "").trim();
        }
        nameEls[1].textContent = displayName;
    }
    if (bioEl) bioEl.textContent = settings.bio || "Developer Portfolio";
    
    if (settings.logoUrl) {
        logoEls.forEach(el => {
            if(el) {
                el.innerHTML = `<img src="${getImageUrl(settings.logoUrl)}" class="w-full h-full object-cover rounded-full">`;
                el.classList.add('overflow-hidden');
            }
        });
    }

    const insightContainer = document.getElementById("insights-container");
    if (insightContainer) {
        let insights = [];
        if (isBackendOnline) {
            try {
                const res = await fetch(BASE_URL + "/insight/list");
                const data = await res.json();
                insights = data.code === 200 ? data.data : (data || []);
            } catch (e) {
                console.warn("读取后端感悟接口出错");
            }
        }

        if (insights.length === 0) {
            insightContainer.innerHTML = `
                <div class="vision-glass p-10 rounded-[40px] glass-hover-active magnetic-card">
                    <p class="text-slate-700 text-lg leading-relaxed font-semibold">
                        “把复杂变简单不是删功能，而是找到系统的主旋律：<span class="text-indigo-600 font-black">边界</span>、<span class="text-blue-600 font-black">节奏</span>、<span class="text-rose-600 font-black">反馈</span>。”
                    </p>
                    <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="bg-white/10 border border-white/20 rounded-2xl p-5">
                            <p class="text-[11px] text-slate-500 font-bold mb-2">边界</p>
                            <p class="text-sm text-slate-700 leading-relaxed">模块边界清晰，协作就不会互相“污染”。</p>
                        </div>
                        <div class="bg-white/10 border border-white/20 rounded-2xl p-5">
                            <p class="text-[11px] text-slate-500 font-bold mb-2">节奏</p>
                            <p class="text-sm text-slate-700 leading-relaxed">性能的本质是节奏：缓存、队列与限流都在做同一件事。</p>
                        </div>
                        <div class="bg-white/10 border border-white/20 rounded-2xl p-5">
                            <p class="text-[11px] text-slate-500 font-bold mb-2">反馈</p>
                            <p class="text-sm text-slate-700 leading-relaxed">用户体验是“可预期的反馈”，就像系统的可观测性。</p>
                        </div>
                    </div>
                </div>
            `;
        } else {
            insightContainer.innerHTML = insights.map(i => `
                <div class="vision-glass p-10 rounded-[40px] glass-hover-active magnetic-card" data-aos="fade-up">
                    <div class="flex flex-col items-center text-center">
                        <i class="fa-solid fa-quote-left text-indigo-200 text-4xl mb-6"></i>
                        <p class="text-slate-700 text-xl leading-relaxed font-bold italic mb-6">
                            “${i.content}”
                        </p>
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-px bg-slate-200"></div>
                            <span class="text-xs text-slate-500 font-black uppercase tracking-widest">${i.author || '匿名'} ${i.source ? ' · ' + i.source : ''}</span>
                            <div class="w-10 h-px bg-slate-200"></div>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    const projContainer = document.getElementById("project-container");
    if (projContainer) {
        let projects = [];
        if (isBackendOnline) {
            try {
                const res = await fetch(BASE_URL + "/project/list");
                const data = await res.json();
                projects = data.code === 200 ? data.data : (data || []);
            } catch (e) {
                projects = fallbackProjects;
            }
        } else {
            projects = fallbackProjects;
        }
        projectDataCache = projects;

        if (projects.length === 0) {
            projContainer.innerHTML = `<p class="text-xs text-slate-500 col-span-full">暂无发布的展示项目</p>`;
        } else {
            projContainer.innerHTML = projects.map(p => `
                <div onclick="openProjectModal(${p.id})" class="vision-glass p-5 rounded-[28px] hover:bg-white/60 hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between h-72 group relative overflow-hidden shadow-sm">
                    <div class="absolute -right-8 -bottom-8 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:scale-150 transition-all duration-500"></div>
                    <div>
                        <div class="aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/50 mb-3 shadow-inner">
                            <img src="${getImageUrl(p.image)}" onerror="this.src='https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400'" class="w-full h-full object-cover group-hover:scale-105 transition-all duration-500">
                        </div>
                        <h4 class="font-bold text-slate-800 text-sm mb-1 line-clamp-1">${p.title}</h4>
                        <span class="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">${p.techStack || '常规Java架构'}</span>
                        <p class="text-slate-500 text-[10px] mt-2 leading-relaxed line-clamp-2">${p.description || '暂无描述'}</p>
                    </div>
                </div>
            `).join('');
        }
    }

    const artContainer = document.getElementById("article-container");
    if (artContainer) {
        let articles = [];
        if (isBackendOnline) {
            try {
                const res = await fetch(BASE_URL + "/article/list");
                const data = await res.json();
                articles = data.code === 200 ? data.data : (data || []);
            } catch (e) {
                articles = fallbackArticles;
            }
        } else {
            articles = fallbackArticles;
        }
        articleDataCache = articles;

        if (articles.length === 0) {
            artContainer.innerHTML = `<p class="text-xs text-slate-500 col-span-full">暂无发布的文章档案</p>`;
        } else {
            artContainer.innerHTML = articles.map(a => `
                <div onclick="jumpToBlogDetail(${a.id})" class="vision-glass p-6 rounded-2xl glass-hover-active flex flex-col justify-between h-48 cursor-pointer group">
                    <div>
                        <span class="text-[9px] text-amber-600 font-bold uppercase tracking-widest block mb-2">Technical Blog</span>
                        <h3 class="font-bold text-sm text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">${a.title}</h3>
                        <p class="text-slate-500 text-[11px] leading-relaxed line-clamp-2">${a.summary || '暂无摘要描述'}</p>
                    </div>
                    <div class="text-[9px] text-slate-400 flex items-center space-x-2 mt-4">
                        <i class="fa-solid fa-calendar-days text-slate-300"></i>
                        <span>2026-06-05</span>
                    </div>
                </div>
            `).join('');
        }
    }

    const bookshelfGrid = document.getElementById("bookshelf-grid");
    if (bookshelfGrid) {
        let localBooks = JSON.parse(localStorage.getItem(LS_KEYS.books)) || [
            { id: "b1", title: "Clean Code", author: "Robert C. Martin", tag: "工程", note: "关于可读性、可维护性与工程纪律的经典。", status: "在读", coverUrl: "https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg" },
            { id: "b2", title: "Effective Java", author: "Joshua Bloch", tag: "实践", note: "Java 设计与最佳实践的权威守则。", status: "收藏", coverUrl: "https://covers.openlibrary.org/b/isbn/9780134685991-L.jpg" },
            { id: "b3", title: "DDIA", author: "Martin Kleppmann", tag: "架构", note: "分布式密集型系统构建底层的硬核读物。", status: "已读", coverUrl: "https://covers.openlibrary.org/b/isbn/9781449373320-L.jpg" },
            { id: "b4", title: "Clean Architecture", author: "Robert C. Martin", tag: "架构", note: "架构分层、边界与可演化系统的优雅之道。", status: "在读", coverUrl: "https://covers.openlibrary.org/b/isbn/9780134494166-L.jpg" }
        ];

        bookshelfGrid.innerHTML = localBooks.map(b => `
            <div class="book-shelf flex flex-col items-center cursor-pointer book-container" onclick="showDetail('${b.title}', '${b.author}：${b.note} (状态：${b.status})')">
                <div class="w-24 h-36 relative">
                    <div class="book3d-wrapper">
                        <div class="book3d-pages"></div>
                        <div class="book3d-spine" style="background: linear-gradient(90deg, rgba(15,23,42,0.95), rgba(37,99,235,0.85));"></div>
                        <div class="book3d-cover" style="background-image:url('${b.coverUrl || 'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg'}'); background-size:cover; background-position:center;">
                            <div class="book3d-shine"></div>
                        </div>
                    </div>
                </div>
                <h4 class="text-[11px] font-bold text-slate-700 mt-3 text-center truncate max-w-[100px]">${b.title}</h4>
            </div>
        `).join('');
    }

    const habitsGrid = document.getElementById("habits-display-grid");
    if (habitsGrid) {
        let localHabits = JSON.parse(localStorage.getItem(LS_KEYS.habits)) || [
            { id: "h1", title: "跑步/快走 30min", tag: "运动", streak: 6 },
            { id: "h2", title: "核心代码设计 45min", tag: "自律", streak: 13 }
        ];
        let doneHabits = JSON.parse(localStorage.getItem(LS_KEYS.habitsDone)) || {};
        let today = new Date().toISOString().slice(0, 10);
        let todayDoneList = doneHabits[today] || [];

        const habitsCountBadge = document.getElementById("stat-habits-count");
        if (habitsCountBadge) {
            habitsCountBadge.textContent = `${todayDoneList.length} 项已完`;
        }

        habitsGrid.innerHTML = localHabits.map(h => {
            const isDone = todayDoneList.includes(h.id);
            return `
                <div class="vision-glass p-8 rounded-[32px] glass-hover-active flex flex-col justify-between">
                    <div>
                        <div class="flex justify-between items-center mb-3">
                            <h3 class="font-black text-slate-800">${h.title}</h3>
                            <span class="text-[9px] font-black uppercase ${isDone ? 'text-emerald-600 bg-emerald-50' : 'text-orange-500 bg-orange-50'} px-2.5 py-1 rounded-full">${isDone ? '今日已打卡' : '待自律'}</span>
                        </div>
                        <p class="text-slate-600 text-sm leading-relaxed">保持该习惯是维护精力吞吐的保障。稳定恢复，才能持续稳定输出代码架构。</p>
                        <div class="mt-4 flex flex-wrap gap-2">
                            <span class="text-[10px] font-bold bg-slate-200/60 px-3 py-1 rounded-full text-slate-700">${h.tag}</span>
                            <span class="text-[10px] font-bold bg-slate-200/60 px-3 py-1 rounded-full text-slate-700">连续 ${h.streak} 天</span>
                        </div>
                    </div>
                    <button class="mt-6 px-5 py-2.5 ${isDone ? 'bg-slate-300' : 'bg-slate-900'} hover:bg-slate-800 text-white rounded-full font-bold text-xs transition-all active:scale-95" onclick="toggleFrontHabit('${h.id}')">
                        ${isDone ? '取消今日打卡' : '一键极速打卡'}
                    </button>
                </div>
            `;
        }).join('');
    }
}

window.toggleFrontHabit = function(id) {
    let doneHabits = JSON.parse(localStorage.getItem(LS_KEYS.habitsDone)) || {};
    let today = new Date().toISOString().slice(0, 10);
    doneHabits[today] = doneHabits[today] || [];

    if (doneHabits[today].includes(id)) {
        doneHabits[today] = doneHabits[today].filter(x => x !== id);
        showToast("习惯今日打卡已取消！");
    } else {
        doneHabits[today].push(id);
        showToast("今日习惯打卡成功！已保持高效自律节奏。");
    }
    localStorage.setItem(LS_KEYS.habitsDone, JSON.stringify(doneHabits));
    loadDynamicPortfolio(); 
}

window.openProjectModal = async function(id) {
    let p = projectDataCache.find(x => x.id === id);

    if (!p && isBackendOnline) {
        try {
            const res = await fetch(`${BASE_URL}/project/${id}`);
            const data = await res.json();
            p = data.code === 200 ? data.data : data;
        } catch (e) {
            console.error(e);
        }
    }

    if (p) {
        document.getElementById('modal-proj-image').src = getImageUrl(p.image);
        document.getElementById('modal-proj-title').textContent = p.title;
        document.getElementById('modal-proj-tech').textContent = p.techStack || '常规Java架构';
        document.getElementById('modal-proj-desc').textContent = p.description || '暂无详细描述。';

        document.getElementById('modal-proj-github').href = p.github || 'https://github.com';
        document.getElementById('modal-proj-demo').href = p.demo || '#';

        const modal = document.getElementById('project-detail-modal');
        modal.classList.remove('pointer-events-none', 'opacity-0');
        modal.classList.add('opacity-100');
        modal.querySelector('.vision-glass').classList.remove('scale-95');
        modal.querySelector('.vision-glass').classList.add('scale-100');
    }
}

window.closeProjectModal = function() {
    const modal = document.getElementById('project-detail-modal');
    modal.classList.add('pointer-events-none', 'opacity-0');
    modal.classList.remove('opacity-100');
    modal.querySelector('.vision-glass').classList.add('scale-95');
    modal.querySelector('.vision-glass').classList.remove('scale-100');
}

window.jumpToBlogDetail = function(blogId) {
    const article = articleDataCache.find(a => a.id === blogId);
    if(!article) return;

    document.getElementById('detail-title').textContent = article.title;
    document.getElementById('detail-content').innerHTML = article.content || `<p>${article.summary}</p>`;

    const detailView = document.getElementById('blog-detail-view');
    detailView.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    detailView.onscroll = () => {
        const totalHeight = detailView.scrollHeight - detailView.clientHeight;
        const scrollPercent = totalHeight > 0 ? Math.round((detailView.scrollTop / totalHeight) * 100) : 0;
        document.getElementById('reading-progress').textContent = `阅读进度: ${scrollPercent}%`;
    };
}

window.closeBlogDetail = function() {
    document.getElementById('blog-detail-view').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

async function initCharts() {
    if (typeof Chart === 'undefined') return;

    // 获取数据中心数据
    let chartData = JSON.parse(localStorage.getItem(LS_KEYS.chartData)) || {
        growth: [
            { year: '2023', books: 60, health: 70, tech: 40 },
            { year: '2024', books: 75, health: 80, tech: 65 },
            { year: '2025', books: 82, health: 85, tech: 80 },
            { year: '2026', books: 95, health: 90, tech: 96 }
        ],
        musicStyles: { classical: 30, house: 25, jay: 25, stef: 20 },
        health: [
            { label: '周一', sleep: 7, cardio: 30, score: 85 },
            { label: '周三', sleep: 8, cardio: 45, score: 90 },
            { label: '周五', sleep: 6.5, cardio: 60, score: 88 },
            { label: '周日', sleep: 9, cardio: 20, score: 95 }
        ]
    };

    // 尝试从后端实时同步最新图表数据
    if (isBackendOnline) {
        try {
            const resG = await fetch(BASE_URL + "/statistic/type/growth");
            const dataG = await resG.json();
            if (dataG.code === 200 && dataG.data.length > 0) {
                chartData.growth = dataG.data.map(g => ({ year: g.dataKey || g.data_key, books: g.value1, health: g.value2, tech: g.value3 }));
            }
            
            const resM = await fetch(BASE_URL + "/statistic/type/music_style");
            const dataM = await resM.json();
            if (dataM.code === 200 && dataM.data.length > 0) {
                chartData.musicStyles = {};
                dataM.data.forEach(m => { chartData.musicStyles[m.dataKey || m.data_key] = m.value1; });
            }

            const resH = await fetch(BASE_URL + "/statistic/type/health");
            const dataH = await resH.json();
            if (dataH.code === 200 && dataH.data.length > 0) {
                chartData.health = dataH.data.map(h => ({ label: h.dataKey || h.data_key, sleep: h.value1, cardio: h.value2, score: h.value3 }));
            }
        } catch (e) {
            console.warn("图表数据后端同步失败，使用本地缓存");
        }
    }

    // 获取书籍库数据用于雷达图
    const localBooks = JSON.parse(localStorage.getItem(LS_KEYS.books)) || [];
    const bookTags = {};
    localBooks.forEach(b => {
        const tag = b.tag || '未分类';
        bookTags[tag] = (bookTags[tag] || 0) + 1;
    });
    const bookLabels = Object.keys(bookTags).length > 0 ? Object.keys(bookTags) : ['工程', '架构', '实践', '文学', '历史'];
    const bookValues = Object.keys(bookTags).length > 0 ? Object.values(bookTags) : [5, 4, 3, 2, 1];

    // 全局 Chart.js 默认配置
    Chart.defaults.font.family = "'Plus Jakarta Sans', 'Inter', sans-serif";
    Chart.defaults.color = 'rgba(30, 41, 59, 0.5)';

    // 1. 成长维度演化 (Line Chart)
    const ctxGrowth = document.getElementById('growthChart');
    if (ctxGrowth) {
        new Chart(ctxGrowth, {
            type: 'line',
            data: {
                labels: chartData.growth.map(g => g.year),
                datasets: [
                    {
                        label: '书籍',
                        data: chartData.growth.map(g => g.books),
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 3,
                        pointRadius: 4,
                        pointBackgroundColor: '#6366f1'
                    },
                    {
                        label: '健康',
                        data: chartData.growth.map(g => g.health),
                        borderColor: '#f43f5e',
                        backgroundColor: 'transparent',
                        fill: false,
                        tension: 0.4,
                        borderWidth: 3,
                        pointRadius: 4,
                        pointBackgroundColor: '#f43f5e'
                    },
                    {
                        label: '技术',
                        data: chartData.growth.map(g => g.tech),
                        borderColor: '#0ea5e9',
                        backgroundColor: 'transparent',
                        fill: false,
                        tension: 0.4,
                        borderWidth: 3,
                        pointRadius: 4,
                        pointBackgroundColor: '#0ea5e9'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: 'bottom', labels: { boxWidth: 12, font: { size: 10, weight: 'bold' } } }
                },
                scales: {
                    y: { min: 0, max: 100, grid: { color: 'rgba(0, 0, 0, 0.03)' }, ticks: { font: { size: 10 } } },
                    x: { grid: { display: false }, ticks: { font: { size: 10 } } }
                }
            }
        });
    }

    // 2. 书籍学科 (Radar Chart)
    const ctxBook = document.getElementById('bookChart');
    if (ctxBook) {
        new Chart(ctxBook, {
            type: 'radar',
            data: {
                labels: bookLabels,
                datasets: [{
                    label: '书籍量',
                    data: bookValues,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBackgroundColor: '#10b981'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    r: {
                        angleLines: { color: 'rgba(0, 0, 0, 0.05)' },
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        pointLabels: { color: 'rgba(30, 41, 59, 0.8)', font: { size: 10, weight: 'bold' } },
                        ticks: { display: false },
                        suggestedMin: 0
                    }
                }
            }
        });
    }

    // 3. 音乐风格 (Doughnut Chart)
    const ctxMusic = document.getElementById('musicChart');
    if (ctxMusic) {
        // 兼容中英文 Key 名
        const getVal = (keys) => {
            for(let k of keys) {
                if(chartData.musicStyles[k] !== undefined) return chartData.musicStyles[k];
            }
            return 0;
        };

        new Chart(ctxMusic, {
            type: 'doughnut',
            data: {
                labels: ['流行音乐', '古典音乐', '电子音乐', '摇滚音乐'],
                datasets: [{
                    data: [
                        getVal(['流行音乐', 'pop']),
                        getVal(['古典音乐', 'classical']),
                        getVal(['电子音乐', 'electronic', 'house']),
                        getVal(['摇滚音乐', 'rock'])
                    ],
                    backgroundColor: ['#6366f1', '#0ea5e9', '#f43f5e', '#10b981'],
                    borderWidth: 0,
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { display: true, position: 'bottom', labels: { boxWidth: 10, font: { size: 10, weight: 'bold' } } }
                }
            }
        });
    }

    // 4. 健康数据 (Bar Chart)
    const ctxHealth = document.getElementById('healthChart');
    if (ctxHealth) {
        new Chart(ctxHealth, {
            type: 'bar',
            data: {
                labels: chartData.health.map(h => h.label),
                datasets: [{
                    label: '深度睡眠 (h)',
                    data: chartData.health.map(h => h.sleep),
                    backgroundColor: 'rgba(99, 102, 241, 0.6)',
                    hoverBackgroundColor: '#6366f1',
                    borderRadius: 8
                }, {
                    label: '有氧时长 (min)',
                    data: chartData.health.map(h => h.cardio),
                    backgroundColor: 'rgba(244, 63, 94, 0.6)',
                    hoverBackgroundColor: '#f43f5e',
                    borderRadius: 8
                }, {
                    label: '心肺得分',
                    data: chartData.health.map(h => h.score),
                    backgroundColor: 'rgba(16, 185, 129, 0.6)',
                    hoverBackgroundColor: '#10b981',
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: 'bottom', labels: { boxWidth: 12, font: { size: 10, weight: 'bold' } } }
                },
                scales: {
                    y: { grid: { color: 'rgba(0, 0, 0, 0.03)' }, ticks: { font: { size: 10 } } },
                    x: { grid: { display: false }, ticks: { font: { size: 10 } } }
                }
            }
        });
    }
}

let carouselInterval;
function startCarousel() {
    const container = document.getElementById('carousel-container');
    if (!container) return;

    if (carouselInterval) clearInterval(carouselInterval);

    async function fetchCarousels() {
        let carouselData = [];
        
        // 1. 尝试从后端获取
        if (isBackendOnline) {
            try {
                const res = await fetch(BASE_URL + "/carousel/list");
                const data = await res.json();
                carouselData = data.code === 200 ? data.data : (data || []);
            } catch (e) {
                console.warn("轮播图同步失败");
            }
        }

        // 2. 尝试从本地存储获取 (后台上传后通常会保存在这里)
        if (carouselData.length === 0) {
            carouselData = JSON.parse(localStorage.getItem('hz_admin_carousel')) || [];
        }

        // 3. 如果依然没有数据，则显示占位提示，不再使用默认图
        if (carouselData.length === 0) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center text-slate-400 space-y-4">
                    <i class="fa-solid fa-images text-4xl opacity-20"></i>
                    <p class="text-xs font-bold">暂无上传的轮播展示内容</p>
                    <p class="text-[10px] opacity-60">请在后台管理系统中上传您的生活美学切面</p>
                </div>
            `;
            return;
        }

        renderCarousel(carouselData);
    }

    function renderCarousel(data) {
        if (!data || data.length === 0) return;

        // 预加载所有图片以提升切换流畅度
        const promises = data.map(item => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve();
                img.onerror = () => resolve(); // 即使加载失败也继续
                img.src = getImageUrl(item.imageUrl);
            });
        });

        // 渲染基础结构，图片先隐藏
        container.innerHTML = data.map((item, idx) => `
            <div id="carousel-item-${idx}" class="absolute inset-0 w-full h-full transition-all duration-1000 opacity-0">
                <img src="${getImageUrl(item.imageUrl)}" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            </div>
        `).join('') + `
            <div class="absolute bottom-0 inset-x-0 bg-white/40 backdrop-blur-md py-4 px-6 text-[11px] text-slate-800 font-black flex justify-between items-center border-t border-white/20 z-10">
                <span id="carousel-label">${data[0].title}</span>
                <div class="flex space-x-2">
                    ${data.map((_, idx) => `<span class="w-2 h-2 rounded-full transition-all duration-300 bg-white/60" id="dot-${idx}"></span>`).join('')}
                </div>
            </div>
        `;

        // 当所有图片（或至少第一张）加载完成后显示第一张
        Promise.all([promises[0]]).then(() => {
            const firstItem = document.getElementById('carousel-item-0');
            const firstDot = document.getElementById('dot-0');
            if (firstItem) firstItem.classList.replace('opacity-0', 'opacity-100');
            if (firstDot) firstDot.classList.add('bg-indigo-500', 'w-4');
        });

        let idx = 0;
        if (carouselInterval) clearInterval(carouselInterval);
        carouselInterval = setInterval(() => {
            const currentItem = document.getElementById(`carousel-item-${idx}`);
            const currentDot = document.getElementById(`dot-${idx}`);
            if (!currentItem || !currentDot) return;

            currentItem.classList.remove('opacity-100');
            currentItem.classList.add('opacity-0');
            currentDot.classList.remove('bg-indigo-500', 'w-4');
            currentDot.classList.add('bg-white/60');

            idx = (idx + 1) % data.length;

            const nextItem = document.getElementById(`carousel-item-${idx}`);
            const nextDot = document.getElementById(`dot-${idx}`);
            if (!nextItem || !nextDot) return;

            nextItem.classList.remove('opacity-0');
            nextItem.classList.add('opacity-100');
            nextDot.classList.remove('bg-white/60');
            nextDot.classList.add('bg-indigo-500', 'w-4');

            const label = document.getElementById('carousel-label');
            if (label) label.textContent = data[idx].title;
        }, 5000);
    }

    fetchCarousels();
    
    // 每分钟同步一次轮播图，实现“后台修改，前台同步”
    setInterval(fetchCarousels, 60000);
}

window.showDetail = function(title, content) {
    const modal = document.getElementById('fluidModal');
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalContent').textContent = content;

    modal.classList.remove('pointer-events-none', 'opacity-0');
    modal.classList.add('opacity-100');
    modal.querySelector('.vision-glass').classList.remove('scale-90');
    modal.querySelector('.vision-glass').classList.add('scale-100');
}

window.closeModal = function() {
    const modal = document.getElementById('fluidModal');
    modal.classList.add('pointer-events-none', 'opacity-0');
    modal.classList.remove('opacity-100');
    modal.querySelector('.vision-glass').classList.add('scale-90');
    modal.querySelector('.vision-glass').classList.remove('scale-100');
}

function showToast(message) {
    const toast = document.getElementById('toastNotification');
    if (!toast) return;
    toast.innerText = message;
    toast.className = "fixed bottom-6 right-6 px-6 py-4 rounded-2xl text-white font-bold shadow-2xl transition-all duration-500 z-[2000] bg-gradient-to-r from-indigo-600 to-blue-500";
    toast.style.transform = "translateY(0)";
    toast.style.opacity = "1";
    setTimeout(() => {
        toast.style.transform = "translateY(100px)";
        toast.style.opacity = "0";
    }, 3000);
}

window.submitFeedback = async function(event) {
    event.preventDefault();
    const username = document.getElementById("msgName").value.trim();
    const email = document.getElementById("msgEmail").value.trim();
    const content = document.getElementById("msgContent").value.trim();

    if (isBackendOnline) {
        try {
            const res = await fetch(BASE_URL + "/api/message/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, content })
            });
            const data = await res.json();
            if (data.code === 200 || data === true) {
                showToast("您的留言已成功上传至 SpringBoot 后台审核！");
                document.getElementById("messageForm").reset();
            } else {
                throw new Error();
            }
        } catch (e) {
            saveFeedbackToLocal(username, email, content);
        }
    } else {
        saveFeedbackToLocal(username, email, content);
    }
}

function saveFeedbackToLocal(username, email, content) {
    let list = JSON.parse(localStorage.getItem(LS_KEYS.feedback)) || [];
    list.unshift({
        id: Date.now(),
        username,
        email,
        content,
        createTime: new Date().toISOString()
    });
    localStorage.setItem(LS_KEYS.feedback, JSON.stringify(list));
    showToast("留言已安全暂存至前台本地缓存！可在后台随时查阅。");
    document.getElementById("messageForm").reset();
}

function initDockNavActive() {
    const links = Array.from(document.querySelectorAll('a[data-nav]'));
    if (!links.length) return;

    const linkById = new Map();
    const sections = [];

    links.forEach(link => {
        const hash = link.getAttribute('href') || '';
        if (!hash.startsWith('#')) return;
        const id = hash.slice(1);
        const section = document.getElementById(id);
        if (!section) return;
        linkById.set(id, link);
        sections.push(section);

        link.addEventListener('click', () => {
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    const activateById = (id) => {
        const target = linkById.get(id);
        if (!target) return;
        links.forEach(l => l.classList.remove('active'));
        target.classList.add('active');
    };

    const observer = new IntersectionObserver((entries) => {
        const visible = entries
            .filter(e => e.isIntersecting)
            .sort((a, b) => (b.intersectionRatio - a.intersectionRatio));
        if (!visible.length) return;
        activateById(visible[0].target.id);
    }, {
        root: null,
        threshold: [0.22, 0.35, 0.5, 0.65],
        rootMargin: "-15% 0px -70% 0px"
    });

    sections.forEach(sec => observer.observe(sec));
}

function initEvadeAvatar() {
    const avatar = document.getElementById('evade-avatar');
    if (!avatar) return;

    let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0, currentX = 0, currentY = 0;
    const radius = 300, maxOffset = 120;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        const rect = avatar.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = mouseX - cx;
        const dy = mouseY - cy;
        const dist = Math.hypot(dx, dy);

        if (dist < radius) {
            const force = Math.pow((radius - dist) / radius, 2);
            const angle = Math.atan2(dy, dx);
            
            // 计算目标位移
            let nextX = -Math.cos(angle) * force * maxOffset;
            let nextY = -Math.sin(angle) * force * maxOffset;

            // 边界检测：确保头像不移出父容器可见区域
            const parentRect = avatar.parentElement.getBoundingClientRect();
            const margin = 20;

            if (rect.left + nextX < parentRect.left + margin) nextX = parentRect.left + margin - rect.left;
            if (rect.right + nextX > parentRect.right - margin) nextX = parentRect.right - margin - rect.right;
            if (rect.top + nextY < parentRect.top + margin) nextY = parentRect.top + margin - rect.top;
            if (rect.bottom + nextY > parentRect.bottom - margin) nextY = parentRect.bottom - margin - rect.bottom;

            targetX = nextX;
            targetY = nextY;
        } else {
            targetX = 0;
            targetY = 0;
        }
    }, { passive: true });

    function tick() {
        currentX += (targetX - currentX) * 0.08;
        currentY += (targetY - currentY) * 0.08;
        avatar.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
        requestAnimationFrame(tick);
    }
    tick();
}

function initMagneticEffect() {
    const cards = document.querySelectorAll('.magnetic-card:not(.no-magnetic), .vision-glass:not(.no-magnetic)');
    cards.forEach(card => {
        if (card.closest('.dock-nav') || card.closest('.fixed')) return;

        const isBookshelf = card.closest('#books');
        const isAvatar = card.id === 'avatar-badge';
        // 增强头像卡片吸附 (intensity 越小力越大)，头像设置为 15，书架 80，其他 50
        const intensity = isAvatar ? 15 : (isBookshelf ? 80 : 50); 

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / intensity;
            const rotateY = (centerX - x) / intensity;
            
            gsap.to(card, {
                rotationX: rotateX,
                rotationY: rotateY,
                transformPerspective: 1000,
                ease: 'power2.out',
                duration: 0.4
            });
        });
        
        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotationX: 0,
                rotationY: 0,
                ease: 'elastic.out(1, 0.3)',
                duration: 1.2
            });
        });
    });
}

async function loadSiteSettings() {
    if (isBackendOnline) {
        try {
            const res = await fetch(BASE_URL + "/site/config/all");
            const data = await res.json();
            if (data && data.code === 200 && data.data) {
                const s = data.data;
                if (s.site_name) {
                    const nameEls = [document.getElementById("site-name"), document.getElementById("hero-name")];
                    if (nameEls[0]) nameEls[0].textContent = s.site_name;
                    if (nameEls[1]) {
                        let displayName = s.site_name;
                        if (displayName.startsWith("你好，我是")) {
                            displayName = displayName.replace("你好，我是", "").trim();
                        }
                        nameEls[1].textContent = displayName;
                    }
                    document.title = s.site_name;
                }
                if (s.hero_greeting) {
                    const greetingEl = document.getElementById("hero-greeting");
                    if (greetingEl) greetingEl.textContent = s.hero_greeting;
                }
                if (s.typewriter_prefix) {
                    const prefixEl = document.getElementById("typewriter-prefix");
                    if (prefixEl) prefixEl.textContent = s.typewriter_prefix;
                }
                if (s.site_subtitle) {
                    const bioEl = document.getElementById("site-bio");
                    if (bioEl) bioEl.textContent = s.site_subtitle;
                }
                if (s.site_bio) {
                    // 这里的 site_bio 实际上是原本的个人简介，现在我们已经有了 site_subtitle，
                    // site_bio 应该映射到 heroDesc (主页下方的黑色描述文字)
                    // 但为了兼容，我们先保持原来的逻辑，并补充 hero_description
                }
                if (s.hero_description) {
                    const heroBio = document.querySelector("#home p.text-slate-500");
                    if (heroBio) heroBio.textContent = s.hero_description;
                }
                 const logo = s.site_logo || s.HZ;
                 if (logo) {
                     const logoEl = document.getElementById("site-logo");
                     const avatarEl = document.getElementById("evade-avatar");
                     const logoHtml = `<img src="${getImageUrl(logo)}" class="w-full h-full object-cover rounded-full scale-110">`;
                     
                     if (logoEl) {
                         logoEl.innerHTML = logoHtml;
                         logoEl.classList.add('bg-white', 'overflow-hidden');
                     }
                     if (avatarEl) {
                         avatarEl.innerHTML = `<img src="${getImageUrl(logo)}" class="w-full h-full object-cover rounded-full">`;
                         avatarEl.classList.remove('bg-gradient-to-tr', 'from-blue-500', 'to-indigo-600');
                         avatarEl.classList.add('bg-white', 'overflow-hidden');
                     }
                 }

                 // 加载打字机配置
                 if (s.typewriter_strings) {
                     initTypewriter({
                         typewriterStrings: s.typewriter_strings,
                         typeSpeed: s.type_speed,
                         backSpeed: s.back_speed,
                         typewriterLoop: s.typewriter_loop === 'true'
                     });
                 }
                 return;
            }
        } catch (e) {
            console.warn("从后端加载设置失败，尝试本地缓存");
        }
    }

    const s = JSON.parse(localStorage.getItem(LS_KEYS.settings)) || {};
    if (s.siteName) {
        document.getElementById("site-name").textContent = s.siteName;
    }
    if (s.heroGreeting) {
        const greetingEl = document.getElementById("hero-greeting");
        if (greetingEl) greetingEl.textContent = s.heroGreeting;
    }
    if (s.typewriterPrefix) {
        const prefixEl = document.getElementById("typewriter-prefix");
        if (prefixEl) prefixEl.textContent = s.typewriterPrefix;
    }
    if (s.siteSubtitle) {
        const bioEl = document.getElementById("site-bio");
        if (bioEl) bioEl.textContent = s.siteSubtitle;
    }
    if (s.heroDesc) {
        const heroBio = document.querySelector("#home p.text-slate-500");
        if (heroBio) heroBio.textContent = s.heroDesc;
    }
    if (s.logoUrl) {
        const logoEl = document.getElementById("site-logo");
        const avatarEl = document.getElementById("evade-avatar");
        const logoHtml = `<img src="${getImageUrl(s.logoUrl)}" class="w-full h-full object-cover rounded-2xl scale-110">`;
        
        if (logoEl) {
            logoEl.innerHTML = logoHtml;
            logoEl.classList.add('bg-white');
        }
        if (avatarEl) {
            avatarEl.innerHTML = `<img src="${getImageUrl(s.logoUrl)}" class="w-full h-full object-cover rounded-full">`;
            avatarEl.classList.remove('bg-gradient-to-tr', 'from-blue-500', 'to-indigo-600');
            avatarEl.classList.add('bg-white');
        }
    }
    
    // 如果有打字机配置，重新初始化打字机
    if (s.typewriterStrings) {
        initTypewriter(s);
    }
}

function initTypewriter(customSettings = null) {
    if (typeof Typed === 'undefined') return;
    const target = document.getElementById('typed');
    if (!target) return;

    // 默认配置
    let config = {
        strings: [
            "后端开发工程师 ^1000",
            "分布式架构探索者 ^1000",
            "像素级美学细节控 ^1000",
            "自律生活践行者 ^2000"
        ],
        typeSpeed: 60,       // 打字速度
        backSpeed: 30,       // 回退速度
        startDelay: 500,     // 延迟启动时间
        backDelay: 1500,     // 停顿时间
        loop: true,
        smartBackspace: true,
        cursorChar: '|',     // 经典光标样式
        autoInsertCss: true  // 自动插入光标动画 CSS
    };

    // 应用自定义配置
    if (customSettings && customSettings.typewriterStrings) {
        config.strings = customSettings.typewriterStrings.split('\n').filter(s => s.trim() !== "");
        config.typeSpeed = parseInt(customSettings.typeSpeed) || 60;
        config.backSpeed = parseInt(customSettings.backSpeed) || 30;
        config.loop = customSettings.typewriterLoop === true || customSettings.typewriterLoop === 'true';
    }

    // 如果已经存在实例，先销毁
    if (window.typedInstance) {
        window.typedInstance.destroy();
    }
    window.typedInstance = new Typed('#typed', config);
}

document.addEventListener('DOMContentLoaded', async () => {
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, once: true });
    }

    // 优先检测后端连通性
    await checkBackendConnectivity();

    // 优先初始化交互效果，不等待异步数据
    initEvadeAvatar();
    initMagneticEffect();
    initDockNavActive();
    initTypewriter();

    initThree();
    await initCharts();
    startCarousel();
    
    // 异步加载数据
    loadDynamicPortfolio();
    loadSiteSettings();

    const badge = document.getElementById('avatar-badge');
    if(badge && typeof gsap !== 'undefined') {
        badge.addEventListener('mousemove', (e) => {
            const rect = badge.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width/2;
            const y = e.clientY - rect.top - rect.height/2;
            gsap.to(badge, {
                rotationY: x * 0.04,
                rotationX: -y * 0.04,
                transformPerspective: 800,
                ease: 'power2.out',
                duration: 0.5
            });
        });
        badge.addEventListener('mouseleave', () => {
            gsap.to(badge, {
                rotationY: 0,
                rotationX: 0,
                ease: 'elastic.out(1, 0.3)',
                duration: 1.2
            });
        });
    }

    const typedTarget = document.getElementById('typed');
    // initTypewriter() 已经统一初始化，此处不再重复创建以防冲突
});

window.addEventListener('resize', () => {
    if(camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
});
