// 打字机效果
class TypeWriter {
    constructor(element, texts, speed = 100, deleteSpeed = 50, pauseTime = 2000) {
        this.element = element;
        this.texts = texts;
        this.speed = speed;
        this.deleteSpeed = deleteSpeed;
        this.pauseTime = pauseTime;
        this.textIndex = 0;
        this.charIndex = 0;
        this.isDeleting = false;
        this.timerId = null;
        this.isVisible = true;
        
        // 页面不可见时暂停,节省资源
        document.addEventListener('visibilitychange', () => {
            this.isVisible = !document.hidden;
            if (this.isVisible && !this.timerId) {
                this.type();
            } else if (!this.isVisible && this.timerId) {
                clearTimeout(this.timerId);
                this.timerId = null;
            }
        });
        
        this.type();
    }
    
    type() {
        if (!this.isVisible) return;
        
        const currentText = this.texts[this.textIndex];
        
        if (this.isDeleting) {
            this.element.textContent = currentText.substring(0, this.charIndex - 1);
            this.charIndex--;
        } else {
            this.element.textContent = currentText.substring(0, this.charIndex + 1);
            this.charIndex++;
        }
        
        let typeSpeed = this.isDeleting ? this.deleteSpeed : this.speed;
        
        if (!this.isDeleting && this.charIndex === currentText.length) {
            typeSpeed = this.pauseTime;
            this.isDeleting = true;
        } else if (this.isDeleting && this.charIndex === 0) {
            this.isDeleting = false;
            this.textIndex = (this.textIndex + 1) % this.texts.length;
        }
        
        this.timerId = setTimeout(() => {
            this.timerId = null;
            this.type();
        }, typeSpeed);
    }
}


// 初始化打字机效果
document.addEventListener('DOMContentLoaded', () => {
    // 尊重用户减少动画偏好
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    
    // 为大标题添加打字机效果
    // 注意:不覆盖静态内容,而是操作 h2 元素本身(双击彩蛋已改为监听父容器,避免冲突)
    const titleElement = document.querySelector('.top-section-content h2');
    if (titleElement) {
        const texts = ['无聊……', '量子魔法使', '探索宇宙的奥秘', '二次元物理学家'];
        new TypeWriter(titleElement, texts, 150, 100, 2000);
    }
});
