// 粒子特效系统
class ParticleSystem {
    constructor() {
        // 尊重用户减少动画偏好
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (this.reducedMotion) return;

        this.canvas = document.createElement('canvas');
        this.canvas.id = 'particle-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '-1';
        document.body.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        // 移动端降低粒子数以提升性能
        const isMobile = window.innerWidth < 768;
        this.particleCount = isMobile ? 30 : 60;
        this.linkDistance = 120;
        this.linkDistanceSq = this.linkDistance * this.linkDistance;
        this.animationId = null;
        this.isVisible = true;
        
        this.resize = this.resize.bind(this);
        this.animate = this.animate.bind(this);
        
        this.resize();
        this.init();
        this.animate();
        
        // resize 防抖
        let resizeTimer = null;
        window.addEventListener('resize', () => {
            if (resizeTimer) clearTimeout(resizeTimer);
            resizeTimer = setTimeout(this.resize, 200);
        });

        // 页面不可见时暂停动画,节省资源
        document.addEventListener('visibilitychange', () => {
            this.isVisible = !document.hidden;
            if (this.isVisible && !this.animationId) {
                this.animate();
            } else if (!this.isVisible && this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
        });
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    init() {
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 2 + 1,
                vx: Math.random() * 0.5 - 0.25,
                vy: Math.random() * 0.5 - 0.25,
                color: this.getRandomColor()
            });
        }
    }
    
    getRandomColor() {
        const colors = [
            'rgba(106, 90, 205, 0.6)',  // 紫色
            'rgba(255, 105, 180, 0.6)', // 粉色
            'rgba(135, 206, 250, 0.6)', // 天蓝色
            'rgba(255, 182, 193, 0.6)'  // 浅粉色
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    animate() {
        if (!this.isVisible) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const n = this.particles.length;
        // 绘制粒子并更新位置
        for (let i = 0; i < n; i++) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            
            // 边界反弹
            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
            
            // 绘制粒子
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.fill();
        }
        
        // 绘制连接线(O(n²) 优化:用平方距离避免开方,提前过滤)
        for (let i = 0; i < n; i++) {
            const p1 = this.particles[i];
            for (let j = i + 1; j < n; j++) {
                const p2 = this.particles[j];
                const dx = p1.x - p2.x;
                // x 方向距离已超阈值,提前跳过(避免不必要的 y 计算和开方)
                if (dx > this.linkDistance || dx < -this.linkDistance) continue;
                const dy = p1.y - p2.y;
                if (dy > this.linkDistance || dy < -this.linkDistance) continue;
                const distSq = dx * dx + dy * dy;
                if (distSq < this.linkDistanceSq) {
                    const distance = Math.sqrt(distSq);
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(106, 90, 205, ${0.2 * (1 - distance / this.linkDistance)})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                }
            }
        }
        
        this.animationId = requestAnimationFrame(this.animate);
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    new ParticleSystem();
});
