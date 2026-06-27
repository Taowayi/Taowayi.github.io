const content_dir = 'contents/pages/';
const config_file = 'contents/config.yml';
const page_files = ['home', 'research', 'anime', 'publications', 'contact'];

const safeTypeset = (elements) => {
    if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
        window.MathJax.typesetPromise(elements).catch(() => {});
    } else if (window.MathJax && typeof window.MathJax.typeset === 'function') {
        window.MathJax.typeset();
    }
};

async function loadPageFragments() {
    await Promise.all(page_files.map(async (name) => {
        const mount = document.getElementById(name + '-page-mount');
        if (!mount) return;
        const response = await fetch(content_dir + name + '.html');
        mount.innerHTML = await response.text();
    }));
    initQuestBoard();
}

function initNavbar() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pages = document.querySelectorAll('.page');
            pages.forEach(page => page.classList.remove('active'));
            const targetId = link.getAttribute('href').substring(1);
            const targetPage = document.getElementById(targetId + '-page');
            if (targetPage) {
                targetPage.classList.add('active');
            }
            window.scrollTo(0, 0);
        });
    });

    const homePage = document.getElementById('home-page');
    if (homePage) {
        homePage.classList.add('active');
    }
}

function initConfig() {
    fetch(config_file)
        .then(response => response.text())
        .then(text => {
            const yml = jsyaml.load(text);
            Object.keys(yml).forEach(key => {
                const target = document.getElementById(key);
                if (target) {
                    target.innerHTML = yml[key];
                }
            });
        })
        .catch(error => console.log(error));
}

function initPublicationSection() {
    const pubListEl = document.getElementById('pub-list');
    if (!pubListEl) return;

    const hintEl = document.getElementById('pub-hint');
    const pubTotalEl = document.getElementById('pub-total');
    const citeTotalEl = document.getElementById('cite-total');
    const topCiteEl = document.getElementById('top-cite');
    const topTitleEl = document.getElementById('top-cite-title');
    const btnLatest = document.getElementById('sort-latest');
    const btnCited = document.getElementById('sort-cited');
    const avatarImg = document.querySelector('#avatar img');
    const bannerImg = document.querySelector('.top-section .banner-img');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');
    const toastEl = document.getElementById('load-toast');
    const toastText = document.getElementById('load-toast-text');
    const authorRecid = 2867836;
    const apiUrl = `https://inspirehep.net/api/literature?q=authors.recid:${authorRecid}&size=200`;
    const CACHE_KEY = 'inspireCache_v1';
    const cached = (() => { try { return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); } catch { return null; } })();
    let items = [];

    const monthPad = (m) => {
        if (!m) return '';
        return String(m).padStart(2, '0');
    };

    const getJournalAbbrev = (title) => {
        if (!title) return '';
        const t = title.toLowerCase();
        const map = [
            { k: ['physical review letters', 'phys. rev. lett.', 'prl'], v: 'PRL' },
            { k: ['physical review d', 'phys. rev. d', 'prd'], v: 'PRD' },
            { k: ['physical review c', 'phys. rev. c', 'prc'], v: 'PRC' },
            { k: ['journal of high energy physics', 'jhep'], v: 'JHEP' },
            { k: ['physics letters b', 'phys. lett. b', 'plb'], v: 'PLB' },
            { k: ['european physical journal c', 'epj c', 'epjc'], v: 'EPJC' },
            { k: ['classical and quantum gravity', 'cqg'], v: 'CQG' },
            { k: ['monthly notices of the royal astronomical society', 'mnras'], v: 'MNRAS' },
            { k: ['astrophysical journal', 'apj'], v: 'ApJ' },
            { k: ['nuclear physics a', 'nucl. phys. a', 'npa'], v: 'NPA' },
            { k: ['science'], v: 'Science' },
            { k: ['nature'], v: 'Nature' }
        ];
        for (const entry of map) {
            if (entry.k.some(s => t.includes(s))) return entry.v;
        }
        const initials = title
            .replace(/[^a-zA-Z\s]/g, ' ')
            .trim()
            .split(/\s+/)
            .slice(0, 4)
            .map(w => w[0] ? w[0].toUpperCase() : '')
            .join('');
        return initials || '';
    };

    const normalizeRecord = (rec) => {
        const meta = rec.metadata || {};
        let title = (meta.titles && meta.titles[0] && meta.titles[0].title) ? meta.titles[0].title : '(无标题)';
        title = title.replace(/&amp;/g, '&');
        title = title.replace(/<math[^>]*>([\s\S]*?)<\/math>/gi, (m, inner) => {
            const text = inner
                .replace(/<mi[^>]*>/gi, '')
                .replace(/<mo[^>]*>/gi, '')
                .replace(/<mn[^>]*>/gi, '')
                .replace(/<mrow[^>]*>/gi, '')
                .replace(/<\/(mi|mo|mn|mrow)>/gi, '')
                .trim();
            return text ? `$${text}$` : m;
        });
        const pubInfo = (meta.publication_info && meta.publication_info[0]) ? meta.publication_info[0] : {};
        const year = pubInfo.year ? pubInfo.year : (meta.earliest_date || '').slice(0, 4);
        const month = pubInfo.month ? monthPad(pubInfo.month) : ((meta.earliest_date || '').slice(5, 7));
        const yearMonth = (year && month) ? `${year}-${month}` : (year || '');
        const cite = typeof meta.citation_count === 'number' ? meta.citation_count : 0;
        const link = meta.links && meta.links[0] && meta.links[0].value ? meta.links[0].value : (meta.urls && meta.urls[0] && meta.urls[0].value ? meta.urls[0].value : undefined);
        const journalTitle = pubInfo.journal_title || (pubInfo.journal_title_abbrev || '');
        const docTypes = Array.isArray(meta.document_type) ? meta.document_type.map(dt => String(dt).toLowerCase()) : [];
        const hasArXiv = Array.isArray(meta.arxiv_eprints) ? meta.arxiv_eprints.length > 0 : false;
        const refereed = !!meta.refereed;
        const isPreprint = !refereed && (docTypes.includes('preprint') || (hasArXiv && !journalTitle));
        const journalShort = isPreprint ? 'Preprint' : getJournalAbbrev(journalTitle);
        return { title, year, yearMonth, cite, link, journalShort };
    };

    const renderFromItems = (mode = 'latest') => {
        if (!pubListEl) return;
        pubListEl.innerHTML = '';
        const sorted = [...items];
        if (mode === 'cited') {
            sorted.sort((a, b) => b.cite - a.cite);
        } else {
            sorted.sort((a, b) => parseInt(b.year || '0', 10) - parseInt(a.year || '0', 10));
        }

        sorted.forEach(it => {
            const li = document.createElement('li');
            const ym = it.yearMonth ? ` (${it.yearMonth})` : (it.year ? ` (${it.year})` : '');
            const j = it.journalShort ? ` · [${it.journalShort}]` : '';
            li.innerHTML = `${it.title}${ym}${j} — 引用 ${it.cite}`;
            if (it.link) {
                const a = document.createElement('a');
                a.href = it.link;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                a.textContent = ' [链接]';
                li.appendChild(a);
            }
            pubListEl.appendChild(li);
        });

        safeTypeset([pubListEl]);

        if (btnLatest && btnCited) {
            if (mode === 'latest') {
                btnLatest.classList.add('btn-primary');
                btnLatest.classList.remove('btn-outline-primary');
                btnCited.classList.add('btn-outline-primary');
                btnCited.classList.remove('btn-primary');
            } else {
                btnCited.classList.add('btn-primary');
                btnCited.classList.remove('btn-outline-primary');
                btnLatest.classList.add('btn-outline-primary');
                btnLatest.classList.remove('btn-primary');
            }
        }
    };

    const updateStats = () => {
        const total = items.length;
        const citations = items.reduce((sum, it) => sum + (isNaN(it.cite) ? 0 : it.cite), 0);
        const top = [...items].sort((a, b) => b.cite - a.cite)[0];

        if (pubTotalEl) pubTotalEl.textContent = String(total);
        if (citeTotalEl) citeTotalEl.textContent = String(citations);
        if (top) {
            if (topCiteEl) topCiteEl.textContent = String(top.cite);
            if (topTitleEl) {
                topTitleEl.innerHTML = `${top.title}${top.year ? ' (' + top.year + ')' : ''}`;
                safeTypeset([topTitleEl]);
            }
        }

        const years = [...new Set(items.map(it => parseInt(it.year || '0', 10)).filter(y => y > 0))].sort((a, b) => b - a);
        const latestYears = years.slice(0, 5).reverse();
        const byYear = latestYears.map(y => items.filter(it => parseInt(it.year || '0', 10) === y).reduce((sum, it) => sum + (isNaN(it.cite) ? 0 : it.cite), 0));
        const nonZero = byYear.filter(v => v > 0);
        const maxVal = Math.max(...(nonZero.length ? byYear : [1]));
        const trendBox = document.getElementById('trend-mini');
        if (trendBox) {
            const w = 60;
            const h = 24;
            const step = byYear.length > 1 ? w / (byYear.length - 1) : w;
            const defaultY = Math.round(h * 0.6);
            const pts = byYear.length > 0 ? byYear.map((v, i) => ({ x: Math.round(i * step), y: Math.round(h - (h * (nonZero.length ? v : 0) / maxVal)) || defaultY })) : [{ x: 0, y: defaultY }];
            const path = pts.reduce((acc, p, idx) => acc + (idx === 0 ? `M${p.x},${p.y}` : ` L${p.x},${p.y}`), '');
            trendBox.innerHTML = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fb7185"/><stop offset="100%" stop-color="#ff69b4"/></linearGradient></defs><path d="${path}" fill="none" stroke="url(#trendGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
            const svgEl = trendBox.querySelector('svg');
            if (svgEl) svgEl.style.display = 'block';
            trendBox.title = latestYears.length ? latestYears.map((y, i) => `${y}:${byYear[i] || 0}`).join(' | ') : '无趋势数据';
        }

        if (hintEl) hintEl.textContent = `已加载 ${total} 篇文献（数据源：INSPIRE${cached ? ' · 本地缓存' : ''}）`;
        if (toastEl && toastText) {
            toastText.textContent = `已加载 ${total} 篇文献 / 引用总数 ${citations}`;
            toastEl.style.display = 'block';
            toastEl.style.opacity = '1';
            setTimeout(() => {
                toastEl.style.transition = 'opacity 0.6s ease';
                toastEl.style.opacity = '0';
                setTimeout(() => { toastEl.style.display = 'none'; }, 600);
            }, 2000);
        }
    };

    const applyBannerTheme = () => {
        if (!bannerImg) return;
        const isDark = document.body.classList.contains('dark-mode');
        bannerImg.src = isDark ? 'static/assets/img/anime-banner-dark.svg' : 'static/assets/img/anime-banner-light.svg';
    };

    const bindMediaInteractions = () => {
        const cardImages = document.querySelectorAll('img:not(#avatar img):not(.top-section .banner-img)');
        cardImages.forEach(img => {
            img.style.cursor = 'zoom-in';
            img.addEventListener('click', () => {
                if (!lightbox || !lightboxImg) return;
                lightboxImg.src = img.src;
                lightbox.classList.add('active');
            });
        });

        const closeLightbox = () => { if (lightbox) lightbox.classList.remove('active'); };
        if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
        if (lightbox) {
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) closeLightbox();
            });
        }
        window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

        if (avatarImg) {
            avatarImg.addEventListener('click', () => {
                document.body.classList.toggle('dark-mode');
                applyBannerTheme();
            });
        }

        applyBannerTheme();
    };

    const loadRemoteData = async () => {
        try {
            if (cached && Array.isArray(cached.records)) {
                items = cached.records.map(normalizeRecord);
                renderFromItems('latest');
                updateStats();
            }

            const headers = new Headers();
            if (cached && cached.etag) headers.set('If-None-Match', cached.etag);
            const resp = await fetch(apiUrl, { headers });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const data = await resp.json();
            const records = (data.hits && data.hits.hits) ? data.hits.hits : [];
            items = records.map(normalizeRecord);
            renderFromItems('latest');
            updateStats();

            try {
                const etag = resp.headers ? (resp.headers.get('ETag') || resp.headers.get('etag')) : undefined;
                localStorage.setItem(CACHE_KEY, JSON.stringify({ etag, timestamp: Date.now(), records }));
            } catch {}

            if (btnLatest) btnLatest.addEventListener('click', () => renderFromItems('latest'));
            if (btnCited) btnCited.addEventListener('click', () => renderFromItems('cited'));
        } catch (err) {
            if (cached && Array.isArray(cached.records)) {
                if (hintEl) hintEl.textContent = `INSPIRE 校验失败，已使用本地缓存：${err.message}`;
            } else if (hintEl) {
                hintEl.textContent = `INSPIRE 加载失败：${err.message}`;
            }
        }
    };

    bindMediaInteractions();
    loadRemoteData();
}

function initQuestBoard() {
    var form = document.getElementById('quest-form');
    var feedback = document.getElementById('quest-feedback');
    if (!form || !feedback) return;

    // ★ 邮箱隐藏：拆成三段，源码看不出完整地址
    //    替换为你自己的邮箱：prefix + at + domain
    // ★ 邮箱隐藏：Base64 编码，源码看不出真实字符
    var mailParts = { a: 'MTM2MjA4MTA2NQ==', b: 'QA==', c: 'cXEuY29t' };

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var name = document.getElementById('name').value.trim();
        var email = document.getElementById('email').value.trim();
        var message = document.getElementById('message').value.trim();
        if (!name || !email || !message) {
            feedback.style.display = 'block';
            feedback.style.color = '#fb7185';
            feedback.textContent = '请填完所有委托信息再提交。';
            return;
        }
        var realMail = atob(mailParts.a) + atob(mailParts.b) + atob(mailParts.c);
        var subject = encodeURIComponent('【工会委托】来自 ' + name);
        var body = encodeURIComponent('冒险者: ' + name + '\n信标: ' + email + '\n\n委托内容:\n' + message);
        window.location.href = 'mailto:' + realMail + '?subject=' + subject + '&body=' + body;
        feedback.style.display = 'block';
        feedback.style.color = '#34d399';
        feedback.textContent = '正在打开魔法信使…';
    });
}

function initSidebar() {
    const box = document.getElementById('quick-sidebar');
    const header = document.getElementById('qs-header');
    const body = document.getElementById('qs-body');
    const toggleBtn = document.getElementById('qs-toggle');
    if (!box || !header || !body || !toggleBtn) return;

    const saved = JSON.parse(localStorage.getItem('quickSidebarState') || '{}');
    if (typeof saved.right === 'number') box.style.right = saved.right + 'px';
    if (typeof saved.bottom === 'number') box.style.bottom = saved.bottom + 'px';
    if (saved.collapsed) {
        body.style.display = 'none';
        toggleBtn.textContent = '展开';
    }

    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startRight = 0;
    let startBottom = 0;

    header.addEventListener('mousedown', (e) => {
        dragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startRight = parseInt((box.style.right || '24px').replace('px', ''), 10) || 24;
        startBottom = parseInt((box.style.bottom || '80px').replace('px', ''), 10) || 80;
        document.body.style.userSelect = 'none';
    });

    window.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        box.style.right = Math.max(0, startRight - dx) + 'px';
        box.style.bottom = Math.max(0, startBottom - dy) + 'px';
    });

    window.addEventListener('mouseup', () => {
        if (!dragging) return;
        dragging = false;
        document.body.style.userSelect = '';
        const state = JSON.parse(localStorage.getItem('quickSidebarState') || '{}');
        state.right = parseInt(box.style.right.replace('px', ''), 10) || 24;
        state.bottom = parseInt(box.style.bottom.replace('px', ''), 10) || 80;
        localStorage.setItem('quickSidebarState', JSON.stringify(state));
    });

    toggleBtn.addEventListener('click', () => {
        const isHidden = body.style.display === 'none';
        body.style.display = isHidden ? 'block' : 'none';
        toggleBtn.textContent = isHidden ? '折叠' : '展开';
        const state = JSON.parse(localStorage.getItem('quickSidebarState') || '{}');
        state.collapsed = !isHidden;
        localStorage.setItem('quickSidebarState', JSON.stringify(state));
    });
}

window.addEventListener('DOMContentLoaded', async () => {
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    }

    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(document.querySelectorAll('#navbarResponsive .nav-link'));
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (navbarToggler && window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

    await loadPageFragments();
    initNavbar();
    initConfig();
    initPublicationSection();
    initSidebar();
});
