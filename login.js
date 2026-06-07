function login() {
    const btn = document.querySelector('button');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> 正在授权...';

    fetch("http://localhost:8080/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username: document.getElementById('username').value,
            password: document.getElementById('password').value
        })
    })
    .then(r => r.json())
    .then(res => {
        if (res.code === 200) {
            localStorage.setItem("token", res.token);
            location.href = "/project";
        } else {
            btn.disabled = false;
            btn.textContent = originalText;
            showToast(res.msg || "登录失败", true);
        }
    })
    .catch(err => {
        btn.disabled = false;
        btn.textContent = originalText;
        showToast("连接服务器失败，请确保后端服务已启动", true);
    });
}

function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-4 rounded-2xl text-white font-bold shadow-2xl transition-all duration-500 z-[2000] ${isError ? 'bg-gradient-to-r from-rose-600 to-pink-500' : 'bg-gradient-to-r from-indigo-600 to-blue-500'}`;
    toast.innerText = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transform = "translate(-50%, 100px)";
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}
