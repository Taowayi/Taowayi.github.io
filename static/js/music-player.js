// 音乐播放器
class MusicPlayer {
    constructor() {
        this.isPlaying = false;
        this.currentTrack = 0;
        this.audio = new Audio();
        this.isDragging = false;
        this.isVisible = true;
        this.dragOffset = { x: 0, y: 0 };
        
        // 曲目列表 - 使用本地音乐文件
        this.tracks = [
            { name: '🎵 神のまにまに', url: 'static/assets/music/Sou,いすぼくろ,ウォルピスカーター - 神のまにまに.mp3' },
            { name: '🎹 老人と海', url: 'static/assets/music/ヨルシカ - 老人と海.mp3' },
            { name: '🎸 強風オールバック', url: 'static/assets/music/歌愛ユキ,ゆこぴ - 強風オールバック.mp3' }
        ];
        
        // 设置音频
        this.audio.volume = 0.3;
        this.audio.loop = false;
        this.audio.addEventListener('ended', () => this.next());
        
        // 创建播放器界面
        this.createPlayer();
        this.setupEventListeners();
    }
    
    createPlayer() {
        const playerHTML = `
            <div id="music-player" style="
                position: fixed;
                bottom: 20px;
                left: 20px;
                background: linear-gradient(135deg, rgba(106, 90, 205, 0.95), rgba(255, 105, 180, 0.95));
                padding: 15px 20px;
                border-radius: 50px;
                box-shadow: 0 8px 32px rgba(106, 90, 205, 0.4);
                z-index: 10000;
                display: flex;
                align-items: center;
                gap: 15px;
                color: white;
                font-family: 'Noto Sans JP', sans-serif;
                cursor: move;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
                user-select: none;
            ">
                <button id="music-toggle" style="
                    background: white;
                    border: none;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                ">
                    <i class="bi bi-play-fill" style="font-size: 20px; color: #6a5acd;"></i>
                </button>
                <div id="track-info" style="
                    display: flex;
                    flex-direction: column;
                    min-width: 150px;
                ">
                    <div style="font-weight: bold; font-size: 14px;">🎵 二次元BGM</div>
                    <div id="track-name" style="font-size: 12px; opacity: 0.9;">点击播放</div>
                </div>
                <button id="music-next" style="
                    background: rgba(255,255,255,0.3);
                    border: none;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                ">
                    <i class="bi bi-skip-forward-fill" style="font-size: 14px; color: white;"></i>
                </button>
                <button id="music-close" style="
                    background: rgba(255,255,255,0.3);
                    border: none;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                ">
                    <i class="bi bi-x-lg" style="font-size: 14px; color: white;"></i>
                </button>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', playerHTML);
        
        // 添加悬停效果
        const player = document.getElementById('music-player');
        player.addEventListener('mouseenter', () => {
            player.style.transform = 'scale(1.05)';
            player.style.boxShadow = '0 12px 40px rgba(106, 90, 205, 0.6)';
        });
        player.addEventListener('mouseleave', () => {
            player.style.transform = 'scale(1)';
            player.style.boxShadow = '0 8px 32px rgba(106, 90, 205, 0.4)';
        });
    }
    
    setupEventListeners() {
        const player = document.getElementById('music-player');
        const toggleBtn = document.getElementById('music-toggle');
        const nextBtn = document.getElementById('music-next');
        const closeBtn = document.getElementById('music-close');
        
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });
        
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.next();
        });
        
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.close();
        });
        
        // 拖拽功能
        player.addEventListener('mousedown', (e) => {
            // 如果点击的是按钮，不启动拖拽
            if (e.target.closest('button')) return;
            
            this.isDragging = true;
            const rect = player.getBoundingClientRect();
            this.dragOffset.x = e.clientX - rect.left;
            this.dragOffset.y = e.clientY - rect.top;
            player.style.transition = 'none';
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            
            const x = e.clientX - this.dragOffset.x;
            const y = e.clientY - this.dragOffset.y;
            
            player.style.left = x + 'px';
            player.style.top = y + 'px';
            player.style.bottom = 'auto';
        });
        
        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                player.style.transition = 'all 0.3s ease';
            }
        });
    }
    
    toggle() {
        const icon = document.querySelector('#music-toggle i');
        const trackName = document.getElementById('track-name');
        
        if (this.audio.paused) {
            // 如果是第一次播放或换歌，加载音频
            if (!this.audio.src || this.audio.src !== this.tracks[this.currentTrack].url) {
                this.audio.src = this.tracks[this.currentTrack].url;
            }
            
            this.audio.play().then(() => {
                this.isPlaying = true;
                icon.className = 'bi bi-pause-fill';
                trackName.textContent = this.tracks[this.currentTrack].name;
                this.startVisualizer();
            }).catch(err => {
                console.log('播放失败，使用默认提示:', err);
                trackName.textContent = '播放失败 - 请点击重试';
            });
        } else {
            this.audio.pause();
            this.isPlaying = false;
            icon.className = 'bi bi-play-fill';
            trackName.textContent = '已暂停';
            this.stopVisualizer();
        }
    }
    
    next() {
        this.currentTrack = (this.currentTrack + 1) % this.tracks.length;
        const trackName = document.getElementById('track-name');
        const wasPlaying = this.isPlaying;
        
        // 停止当前音乐
        this.audio.pause();
        this.audio.src = this.tracks[this.currentTrack].url;
        
        if (wasPlaying) {
            this.audio.play().then(() => {
                trackName.textContent = this.tracks[this.currentTrack].name;
                this.startVisualizer();
            }).catch(err => {
                console.log('切歌失败:', err);
                trackName.textContent = '加载中...';
            });
        } else {
            trackName.textContent = this.tracks[this.currentTrack].name;
        }
    }
    
    close() {
        const player = document.getElementById('music-player');
        this.audio.pause();
        this.stopVisualizer();
        player.style.transform = 'scale(0)';
        player.style.opacity = '0';
        
        setTimeout(() => {
            player.style.display = 'none';
        }, 300);
        
        // 添加恢复按钮
        this.createRestoreButton();
    }
    
    createRestoreButton() {
        const btn = document.createElement('button');
        btn.id = 'music-restore';
        btn.innerHTML = '<i class="bi bi-music-note-beamed"></i>';
        btn.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(135deg, rgba(106, 90, 205, 0.95), rgba(255, 105, 180, 0.95));
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(106, 90, 205, 0.4);
            z-index: 10000;
            transition: all 0.3s ease;
        `;
        
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'scale(1.1)';
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'scale(1)';
        });
        
        btn.addEventListener('click', () => {
            const player = document.getElementById('music-player');
            player.style.display = 'flex';
            setTimeout(() => {
                player.style.transform = 'scale(1)';
                player.style.opacity = '1';
            }, 10);
            btn.remove();
        });
        
        document.body.appendChild(btn);
    }
    
    startVisualizer() {
        const player = document.getElementById('music-player');
        player.style.animation = 'musicPulse 1s ease-in-out infinite';
    }
    
    stopVisualizer() {
        const player = document.getElementById('music-player');
        player.style.animation = 'none';
    }
}

// 添加音乐播放器的CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes musicPulse {
        0%, 100% {
            box-shadow: 0 8px 32px rgba(106, 90, 205, 0.4);
        }
        50% {
            box-shadow: 0 8px 32px rgba(255, 105, 180, 0.6), 0 0 30px rgba(255, 105, 180, 0.4);
        }
    }
    
    #music-toggle:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 16px rgba(0,0,0,0.3);
    }
    
    #music-next:hover {
        background: rgba(255,255,255,0.5);
        transform: scale(1.1);
    }
`;
document.head.appendChild(style);

// 初始化音乐播放器
document.addEventListener('DOMContentLoaded', () => {
    // 默认以小状态：隐藏播放器，显示恢复按钮
    const mp = new MusicPlayer();
    const player = document.getElementById('music-player');
    if (player) {
        player.style.display = 'none';
    }
    // 复用已有恢复按钮创建逻辑（若无则创建）
    if (!document.getElementById('music-restore')) {
        const btn = document.createElement('button');
        btn.id = 'music-restore';
        btn.innerHTML = '<i class="bi bi-music-note-beamed"></i>';
        btn.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(135deg, rgba(106, 90, 205, 0.95), rgba(255, 105, 180, 0.95));
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(106, 90, 205, 0.4);
            z-index: 10000;
            transition: all 0.3s ease;
        `;
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'scale(1.1)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'scale(1)';
        });
        btn.addEventListener('click', () => {
            const p = document.getElementById('music-player');
            p.style.display = 'flex';
            setTimeout(() => {
                p.style.transform = 'scale(1)';
                p.style.opacity = '1';
            }, 10);
            btn.remove();
        });
        document.body.appendChild(btn);
    }
});
