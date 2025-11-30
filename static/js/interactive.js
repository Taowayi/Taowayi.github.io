// 头像点击特效和其他趣味互动
class InteractiveEffects {
    constructor() {
        this.setupAvatarClick();
        this.setupScrollEffects();
        this.setupEasterEggs();
    }
    
    // 头像点击特效
    setupAvatarClick() {
        const avatar = document.querySelector('#avatar img');
        if (!avatar) return;
        
        let clickCount = 0;
        avatar.addEventListener('click', () => {
            clickCount++;
            
            // 创建粒子爆炸效果
            this.createParticleBurst(avatar);
            
            // 每点击5次触发特殊效果
            if (clickCount % 5 === 0) {
                this.triggerSpecialEffect();
            }
            
            // 播放声音提示（如果需要可以添加音效）
            this.playClickSound();
        });
    }
    
    // 粒子爆炸效果
    createParticleBurst(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'fixed';
            particle.style.left = centerX + 'px';
            particle.style.top = centerY + 'px';
            particle.style.width = '10px';
            particle.style.height = '10px';
            particle.style.borderRadius = '50%';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '9999';
            
            const colors = ['#6a5acd', '#ff69b4', '#87ceeb', '#ffb6c1'];
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            
            document.body.appendChild(particle);
            
            const angle = (Math.PI * 2 * i) / 20;
            const velocity = 5 + Math.random() * 5;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            this.animateParticle(particle, vx, vy);
        }
    }
    
    animateParticle(particle, vx, vy) {
        let x = 0, y = 0;
        let opacity = 1;
        
        const animate = () => {
            x += vx;
            y += vy;
            opacity -= 0.02;
            
            particle.style.transform = `translate(${x}px, ${y}px)`;
            particle.style.opacity = opacity;
            
            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                particle.remove();
            }
        };
        
        animate();
    }
    
    // 特殊效果
    triggerSpecialEffect() {
        const messages = [
            '🌟 你发现了隐藏成就！',
            '✨ 量子态叠加成功！',
            '🎉 摸鱼达人称号获得！',
            '💫 二次元之力觉醒！',
            '🎊 已进入超级摸鱼模式！'
        ];
        
        const message = messages[Math.floor(Math.random() * messages.length)];
        this.showFloatingMessage(message);
        
        // 页面震动效果
        document.body.style.animation = 'shake 0.5s';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 500);
    }
    
    showFloatingMessage(text) {
        const msg = document.createElement('div');
        msg.textContent = text;
        msg.style.position = 'fixed';
        msg.style.top = '50%';
        msg.style.left = '50%';
        msg.style.transform = 'translate(-50%, -50%)';
        msg.style.fontSize = '32px';
        msg.style.fontWeight = 'bold';
        msg.style.color = '#ff69b4';
        msg.style.textShadow = '0 0 20px rgba(255,105,180,0.8), 0 0 40px rgba(106,90,205,0.6)';
        msg.style.zIndex = '99999';
        msg.style.pointerEvents = 'none';
        msg.style.animation = 'floatUp 2s ease-out';
        
        document.body.appendChild(msg);
        
        setTimeout(() => msg.remove(), 2000);
    }
    
    playClickSound() {
        // 创建一个简单的音效（使用Web Audio API）
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }
    
    // 滚动特效
    setupScrollEffects() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const avatar = document.querySelector('#avatar img');
            
            if (avatar) {
                // 头像随滚动轻微旋转
                avatar.style.transform = `rotate(${scrolled * 0.05}deg) scale(${1 + scrolled * 0.0001})`;
            }
        });
    }
    
    // 彩蛋：Konami代码
    setupEasterEggs() {
        const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
        let konamiIndex = 0;
        
        document.addEventListener('keydown', (e) => {
            if (e.key === konamiCode[konamiIndex]) {
                konamiIndex++;
                if (konamiIndex === konamiCode.length) {
                    this.activateKonamiCode();
                    konamiIndex = 0;
                }
            } else {
                konamiIndex = 0;
            }
        });
        
        // 双击标题触发彩蛋
        const title = document.querySelector('.top-section-content h2');
        if (title) {
            title.addEventListener('dblclick', () => {
                this.activateRainbowMode();
            });
        }
    }
    
    activateKonamiCode() {
        this.showFloatingMessage('🎮 Konami Code 激活！');
        
        // 让整个页面旋转一圈
        document.body.style.transition = 'transform 2s';
        document.body.style.transform = 'rotate(360deg)';
        
        setTimeout(() => {
            document.body.style.transform = '';
            document.body.style.transition = '';
        }, 2000);
        
        // 烟花效果
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                this.createFirework();
            }, i * 200);
        }
    }
    
    createFirework() {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight / 2;
        
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'fixed';
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.width = '5px';
            particle.style.height = '5px';
            particle.style.borderRadius = '50%';
            particle.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '9999';
            
            document.body.appendChild(particle);
            
            const angle = (Math.PI * 2 * i) / 30;
            const velocity = 3 + Math.random() * 7;
            this.animateParticle(particle, Math.cos(angle) * velocity, Math.sin(angle) * velocity);
        }
    }
    
    activateRainbowMode() {
        this.showFloatingMessage('🌈 彩虹模式启动！');
        
        let hue = 0;
        const rainbowInterval = setInterval(() => {
            hue = (hue + 2) % 360;
            document.documentElement.style.setProperty('--primary-color', `hsl(${hue}, 70%, 60%)`);
            document.documentElement.style.setProperty('--secondary-color', `hsl(${(hue + 60) % 360}, 70%, 60%)`);
        }, 50);
        
        setTimeout(() => {
            clearInterval(rainbowInterval);
            document.documentElement.style.setProperty('--primary-color', '#6a5acd');
            document.documentElement.style.setProperty('--secondary-color', '#ff69b4');
        }, 5000);
    }
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
    
    @keyframes floatUp {
        0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
        }
        50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.2);
        }
        100% {
            opacity: 0;
            transform: translate(-50%, -150%) scale(0.8);
        }
    }
`;
document.head.appendChild(style);

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    new InteractiveEffects();
});
