// =====================================================
// দৈনিক আলোকিত — Main Application Logic
// =====================================================

// State
let allNews = [];

// Utils
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    // Use Bengali locale for formatting
    return date.toLocaleDateString('bn-BD', options);
}

function getImageUrl(newsId, index) {
    // Generate placeholder images since we don't have real assets
    const colors = ['1a56db', 'e63946', '059669', '7c3aed', 'b45309', '0891b2'];
    const color = colors[index % colors.length];
    return `https://placehold.co/800x500/${color}/FFFFFF?text=News+Image`;
}

// Initialization
function renderHomepage() {
    allNews = NEWS_DATA;
    
    setupNavigation();
    renderTicker();
    renderHeroSection();
    renderLatestNews();
    renderCategoryStrip();
    renderTrendingSidebar();
}

function setupNavigation() {
    const navList = document.getElementById('main-nav-list');
    const mobileNavList = document.getElementById('mobile-nav-list');
    
    if(!navList) return;

    let navHtml = '<li><a href="index.html" class="active">প্রচ্ছদ</a></li>';
    let mobileNavHtml = '<a href="index.html" class="active">প্রচ্ছদ</a>';

    CATEGORIES.slice(0, 8).forEach(cat => {
        navHtml += `<li><a href="category.html?c=${cat.id}">${cat.id}</a></li>`;
        mobileNavHtml += `<a href="category.html?c=${cat.id}">${cat.id}</a>`;
    });

    navList.innerHTML = navHtml;
    if(mobileNavList) mobileNavList.innerHTML = mobileNavHtml;
}

function renderTicker() {
    const tickerContainer = document.getElementById('breaking-ticker');
    if(!tickerContainer) return;

    const breakingNews = allNews.filter(n => n.isBreaking);
    let html = '';
    
    breakingNews.forEach(news => {
        html += `<div class="ticker-item" onclick="window.location.href='article.html?id=${news.id}'">${news.title}</div>`;
    });
    
    // Duplicate for smooth infinite scroll
    tickerContainer.innerHTML = html + html;
}

function renderHeroSection() {
    const heroContainer = document.getElementById('hero-container');
    if(!heroContainer) return;

    const featured = allNews.filter(n => n.isFeatured);
    if(featured.length === 0) return;

    const mainNews = featured[0];
    const sideNews = featured.slice(1, 4); // Take up to 3 for sidebar

    let html = `
        <div class="hero-main" onclick="window.location.href='article.html?id=${mainNews.id}'">
            <img src="${getImageUrl(mainNews.id, 0)}" alt="Hero" class="hero-image">
            <div class="hero-overlay">
                <span class="hero-category">${mainNews.category}</span>
                <h2 class="hero-title">${mainNews.title}</h2>
                <div class="hero-meta">
                    <span><i class="far fa-user"></i> ${mainNews.author}</span>
                </div>
            </div>
        </div>
        <div class="hero-sidebar">
    `;

    sideNews.forEach((news, idx) => {
        html += `
            <div class="hero-side-card" onclick="window.location.href='article.html?id=${news.id}'">
                <img src="${getImageUrl(news.id, idx + 1)}" alt="Thumbnail" class="side-image">
                <div class="side-content">
                    <div class="side-category">${news.category}</div>
                    <h3 class="side-title">${news.title}</h3>
                    <div class="side-meta">${formatDate(news.date)}</div>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    heroContainer.innerHTML = html;
}

function renderLatestNews() {
    const grid = document.getElementById('latest-news-grid');
    if(!grid) return;

    // Skip featured ones so we don't duplicate on homepage
    const latest = allNews.filter(n => !n.isFeatured).slice(0, 6);
    let html = '';

    latest.forEach((news, idx) => {
        const catObj = CATEGORIES.find(c => c.id === news.category);
        const color = catObj ? catObj.color : '#1a56db';

        html += `
            <div class="news-card" onclick="window.location.href='article.html?id=${news.id}'">
                <div class="news-card-image-wrap">
                    <img src="${getImageUrl(news.id, idx + 4)}" alt="News" class="news-card-image">
                </div>
                <div class="news-card-body">
                    <span class="news-card-category" style="background: ${color}">${news.category}</span>
                    <h3 class="news-card-title">${news.title}</h3>
                    <p class="news-card-summary">${news.summary}</p>
                    <div class="news-card-meta">
                        <span class="news-card-author">${news.author}</span>
                        <span>${formatDate(news.date)}</span>
                    </div>
                </div>
            </div>
        `;
    });

    grid.innerHTML = html;
}

function renderCategoryStrip() {
    const strip = document.getElementById('category-strip');
    if(!strip) return;

    let html = '';
    CATEGORIES.forEach(cat => {
        html += `
            <div class="category-chip" onclick="window.location.href='category.html?c=${cat.id}'">
                <span>${cat.icon}</span>
                <span>${cat.id}</span>
            </div>
        `;
    });
    strip.innerHTML = html;
}

function renderTrendingSidebar() {
    const list = document.getElementById('trending-list');
    if(!list) return;

    // Just pick random ones for trending
    const trending = [...allNews].sort(() => 0.5 - Math.random()).slice(0, 5);
    let html = '';

    trending.forEach((news, idx) => {
        // Use Bengali numerals
        const bnNumbers = ['১', '২', '৩', '৪', '৫'];
        html += `
            <div class="trending-item" onclick="window.location.href='article.html?id=${news.id}'">
                <div class="trending-number">${bnNumbers[idx]}</div>
                <div>
                    <div class="trending-title">${news.title}</div>
                    <div class="trending-meta">${news.category} • ${formatDate(news.date)}</div>
                </div>
            </div>
        `;
    });

    list.innerHTML = html;
}

// UI Interactions
function toggleSearch() {
    const overlay = document.getElementById('search-overlay');
    if(overlay) {
        overlay.classList.toggle('active');
        if(overlay.classList.contains('active')) {
            document.getElementById('search-input').focus();
        }
    }
}

function performSearch() {
    const q = document.getElementById('search-input').value;
    if(q) {
        window.location.href = `category.html?q=${encodeURIComponent(q)}`;
    }
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if(menu) menu.classList.toggle('active');
}

// Date in top bar
const dateEl = document.getElementById('current-date');
if(dateEl) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.innerText = new Date().toLocaleDateString('bn-BD', options);
}
