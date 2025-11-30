// 右侧常驻趣味小组件：星轨仪 + 语录轮播 + 快捷链接
class FunWidget {
    constructor() {
        this.container = document.createElement('div');
        this.container.id = 'fun-widget';
        this.container.style.cssText = `
            position: fixed;
            top: 90px;
            right: 12px;
            width: 240px;
            height: 420px;
            z-index: 1000;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 12px 32px rgba(106, 90, 205, 0.35);
            background: linear-gradient(135deg, rgba(106,90,205,0.85), rgba(255,105,180,0.85));
            backdrop-filter: blur(8px);
            border: 1px solid rgba(255,255,255,0.2);
        `;

        this.container.innerHTML = `
            <div id="fw-header" style="
                display: flex; align-items: center; justify-content: space-between;
                padding: 10px 12px; color: #fff; font-weight: 600; font-size: 14px; user-select:none;">
                <span>🔭 星轨仪</span>
                <div>
                    <button id="fw-min" title="折叠" style="background:transparent;border:none;color:#fff;opacity:.85;cursor:pointer;">—</button>
                    <button id="fw-close" title="关闭" style="background:transparent;border:none;color:#fff;opacity:.85;cursor:pointer;">×</button>
                </div>
            </div>
            <canvas id="fw-canvas" width="240" height="220" style="display:block;"></canvas>
            <div id="fw-quotes" style="
                color:#fff; font-size:13px; line-height:1.4; padding: 10px 12px; min-height:72px;">
                <div id="fw-quote-text">“探索宇宙，也探索自我。”</div>
            </div>
            <div id="fw-links" style="display:flex; gap:8px; padding: 8px 12px;">
                <a href="https://github.com/Taowayi" target="_blank" style="
                    flex:1; text-align:center; padding:8px 0; border-radius:10px; color:#fff; text-decoration:none;
                    background: rgba(255,255,255,.15);">GitHub</a>
                <a href="https://space.bilibili.com/251781364" target="_blank" style="
                    flex:1; text-align:center; padding:8px 0; border-radius:10px; color:#fff; text-decoration:none;
                    background: rgba(255,255,255,.15);">Bilibili</a>
            </div>
        `;

        document.body.appendChild(this.container);
        this.initCanvas();
        this.initQuotes();
        this.initControls();
    }

    initControls() {
        const closeBtn = this.container.querySelector('#fw-close');
        const minBtn = this.container.querySelector('#fw-min');
        const canvas = this.container.querySelector('#fw-canvas');
        const quotes = this.container.querySelector('#fw-quotes');
        const links = this.container.querySelector('#fw-links');
        let minimized = false;
        let isDragging = false;
        let dragOffset = { x: 0, y: 0 };

        closeBtn.addEventListener('click', () => {
            this.container.style.transform = 'scale(0.95)';
            this.container.style.opacity = '0';
            setTimeout(() => {
                this.container.style.display = 'none';
                this.createRestoreButton();
            }, 200);
        });

        minBtn.addEventListener('click', () => {
            minimized = !minimized;
            canvas.style.display = minimized ? 'none' : 'block';
            quotes.style.display = minimized ? 'none' : 'block';
            links.style.display = minimized ? 'none' : 'flex';
            this.container.style.height = minimized ? '44px' : '420px';
            try { localStorage.setItem('fw-min', minimized ? '1' : '0'); } catch {}
        });

        // 允许拖拽（通过头部）
        const header = this.container.querySelector('#fw-header');
        header.style.cursor = 'move';
        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            const rect = this.container.getBoundingClientRect();
            dragOffset.x = e.clientX - rect.left;
            dragOffset.y = e.clientY - rect.top;
            this.container.style.transition = 'none';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const x = Math.min(window.innerWidth - this.container.offsetWidth - 6, Math.max(6, e.clientX - dragOffset.x));
            const y = Math.min(window.innerHeight - this.container.offsetHeight - 6, Math.max(80, e.clientY - dragOffset.y));
            this.container.style.left = x + 'px';
            this.container.style.top = y + 'px';
            this.container.style.right = 'auto';
            // 位置持久化
            try {
                localStorage.setItem('fw-pos', JSON.stringify({ x, y }));
            } catch {}
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                this.container.style.transition = 'all .2s ease';
            }
        });

        // 恢复位置与折叠状态
        try {
            const saved = localStorage.getItem('fw-pos');
            if (saved) {
                const { x, y } = JSON.parse(saved);
                this.container.style.left = x + 'px';
                this.container.style.top = y + 'px';
                this.container.style.right = 'auto';
            }
            const savedMin = localStorage.getItem('fw-min');
            if (savedMin === '1') {
                minimized = true;
                canvas.style.display = 'none';
                quotes.style.display = 'none';
                links.style.display = 'none';
                this.container.style.height = '44px';
            }
        } catch {}
    }

    initQuotes() {
        const quotes = [
            '“量子是微小的，想象是无穷的。”',
            '“在星空里摸鱼，在现实中进步。”',
            '“数学是宇宙的语言。”',
            '“今天也要做快乐的物理学家！”'
        ];
        const qEl = this.container.querySelector('#fw-quote-text');
        let idx = 0;
        setInterval(() => {
            idx = (idx + 1) % quotes.length;
            qEl.textContent = quotes[idx];
        }, 4000);
    }

    initCanvas() {
        const canvas = this.container.querySelector('#fw-canvas');
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;

        const bodies = Array.from({ length: 36 }).map((_, i) => ({
            angle: Math.random() * Math.PI * 2,
            radius: 30 + i * 3.2,
            size: Math.random() * 2 + 1,
            speed: 0.002 + i * 0.00008,
            hue: (220 + i * 4) % 360
        }));

        const draw = () => {
            ctx.clearRect(0, 0, W, H);
            ctx.save();
            ctx.translate(W / 2, H / 2);

            // 轨道
            bodies.forEach(b => {
                ctx.strokeStyle = `rgba(255,255,255,.18)`;
                ctx.beginPath();
                ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
                ctx.stroke();
            });

            // 行星
            bodies.forEach(b => {
                const x = Math.cos(b.angle) * b.radius;
                const y = Math.sin(b.angle) * b.radius;
                const grad = ctx.createRadialGradient(x, y, 0, x, y, b.size * 4);
                grad.addColorStop(0, `hsla(${b.hue}, 80%, 70%, .95)`);
                grad.addColorStop(1, `hsla(${b.hue}, 80%, 60%, .15)`);
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(x, y, b.size, 0, Math.PI * 2);
                ctx.fill();
                b.angle += b.speed;
            });

            // 彗星
            for (let i = 0; i < 3; i++) {
                const t = Date.now() / 1000 + i;
                const r = 100 + 40 * Math.sin(t * 0.7 + i);
                const a = t * 0.8 + i * 1.2;
                const x = Math.cos(a) * r;
                const y = Math.sin(a) * r;
                ctx.fillStyle = 'rgba(255,255,255,.8)';
                ctx.beginPath();
                ctx.arc(x, y, 2.2, 0, Math.PI * 2);
                ctx.fill();
                // 尾巴
                for (let j = 0; j < 10; j++) {
                    const tx = Math.cos(a - j * 0.08) * (r - j * 2);
                    const ty = Math.sin(a - j * 0.08) * (r - j * 2);
                    ctx.fillStyle = `rgba(255,255,255,${(1 - j / 10) * .2})`;
                    ctx.fillRect(tx, ty, 1.5, 1.5);
                }
            }

            ctx.restore();
            requestAnimationFrame(draw);
        };
        draw();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // 默认以小状态：隐藏面板，显示恢复按钮
    const fw = new FunWidget();
    const panel = document.getElementById('fun-widget');
    if (panel) {
        panel.style.display = 'none';
    }
    fw.createRestoreButton();
});

// 关闭后创建恢复按钮
FunWidget.prototype.createRestoreButton = function () {
    // 若已存在，避免重复
    if (document.getElementById('fw-restore')) return;
    const btn = document.createElement('button');
    btn.id = 'fw-restore';
    btn.title = '打开星轨仪';
    btn.innerHTML = '🔭';
    btn.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 20px;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: none;
        background: linear-gradient(135deg, rgba(106,90,205,0.95), rgba(255,105,180,0.95));
        color: #fff;
        font-size: 20px;
        box-shadow: 0 8px 24px rgba(106,90,205,.35);
        z-index: 1000;
        cursor: pointer;
        transition: transform .2s ease;
    `;
    btn.addEventListener('mouseenter', () => btn.style.transform = 'scale(1.08)');
    btn.addEventListener('mouseleave', () => btn.style.transform = 'scale(1)');
    btn.addEventListener('click', () => {
        // 恢复侧栏
        const panel = document.getElementById('fun-widget');
        if (panel) {
            panel.style.display = 'block';
            setTimeout(() => {
                panel.style.opacity = '1';
                panel.style.transform = 'scale(1)';
            }, 10);
        }
        btn.remove();
    });
    document.body.appendChild(btn);
};
