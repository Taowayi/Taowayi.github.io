document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('href').substring(1);
            history.pushState(null, '', `#${targetPage}`);
            loadContent(targetPage);
        });
    });
    
    // 处理浏览器前进/后退
    window.addEventListener('popstate', () => {
        const page = window.location.hash.substring(1) || 'home';
        loadContent(page);
    });
});

async function loadContent(page) {
    try {
        // 显示加载状态
        document.getElementById('content-container').innerHTML = '<div class="text-center py-5">加载中...</div>';
        
        const response = await fetch(`partials/${page}.html`);
        if (!response.ok) throw new Error('页面加载失败');
        
        document.getElementById('content-container').innerHTML = await response.text();
        
        // 激活当前导航项
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', 
                link.getAttribute('href') === `#${page}`);
        });
        
    } catch (error) {
        document.getElementById('content-container').innerHTML = `
            <div class="alert alert-danger">
                无法加载页面: ${error.message}
            </div>
        `;
    }
}