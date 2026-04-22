// === DEBOUNCE ===
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// === SCROLL PROGRESS ===
const progressBar = document.getElementById('scroll-progress-bar');
function updateScrollProgress() {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (progressBar) progressBar.style.width = `${(scrollTop / scrollHeight) * 100}%`;
}

// === NAVBAR HIDE/SHOW ===
const nav = document.getElementById('main-nav');
let lastScrollY = 0;
function handleNavScroll() {
    const curr = window.scrollY;
    if (curr > lastScrollY && curr > 100) {
        nav?.classList.add('nav-hidden');
    } else {
        nav?.classList.remove('nav-hidden');
    }
    lastScrollY = curr;
}

// === ACTIVE NAV LINK ===
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');
const updateActiveLink = debounce(() => {
    const scrollY = window.scrollY;
    sections.forEach(section => {
        const top = section.offsetTop - 65 - (window.innerHeight * 0.4);
        if (scrollY >= top && scrollY < top + section.offsetHeight) {
            navLinks.forEach(l => {
                l.classList.remove('active');
                if (l.getAttribute('href') === `#${section.id}`) l.classList.add('active');
            });
        }
    });
}, 100);

window.addEventListener('scroll', () => {
    updateScrollProgress();
    handleNavScroll();
    updateActiveLink();
});

// === SCROLL ANIMATIONS ===
const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            scrollObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.animate-on-scroll').forEach(el => scrollObserver.observe(el));

// === MOBILE MENU ===
const mobileMenuBtn = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const closeMobileMenuBtn = document.getElementById('close-mobile-menu');

mobileMenuBtn?.addEventListener('click', () => {
    mobileMenu?.classList.remove('translate-x-full');
    document.body.classList.add('mobile-menu-open');
});

function closeMobileMenu() {
    mobileMenu?.classList.add('translate-x-full');
    document.body.classList.remove('mobile-menu-open');
}

closeMobileMenuBtn?.addEventListener('click', closeMobileMenu);
document.querySelectorAll('.nav-link-mobile').forEach(l => l.addEventListener('click', closeMobileMenu));

// === SERVICE TABS (Opzione A / B) ===
document.querySelectorAll('.service-tab-button').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.service-tab-button').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.service-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.target)?.classList.add('active');
    });
});

// === PACKAGE TOGGLES ===
document.querySelectorAll('.pkg-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.dataset.content;
        const content = document.getElementById(targetId);
        btn.classList.toggle('active');
        content?.classList.toggle('active');
    });
});

// === TRASPARENZA ECONOMICA CALCULATOR ===
const fmt = n => new Intl.NumberFormat('it-IT', {
    style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2
}).format(n);

function calcTrasparenza() {
    const lordo = parseFloat(document.getElementById('tp-lordo')?.value) || 500;
    const commRate = parseFloat(document.getElementById('tp-comm')?.value) || 12;
    const pulizie = 20;

    function calc(otaRate) {
        const nettoOTA = lordo * (1 - otaRate / 100);
        const base = nettoOTA - pulizie;
        const moorentFee = base * (commRate / 100);
        const netto = base - moorentFee;
        return { lordo, otaFee: lordo * (otaRate / 100), base: Math.max(0, base), moorentFee, netto: Math.max(0, netto) };
    }

    const airbnb  = calc(3);
    const booking = calc(15);
    const direct  = calc(0);

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = fmt(val); };

    set('tp-airbnb-ota',     airbnb.otaFee);
    set('tp-airbnb-base',    airbnb.base);
    set('tp-airbnb-fee',     airbnb.moorentFee);
    set('tp-airbnb-netto',   airbnb.netto);

    set('tp-booking-ota',    booking.otaFee);
    set('tp-booking-base',   booking.base);
    set('tp-booking-fee',    booking.moorentFee);
    set('tp-booking-netto',  booking.netto);

    set('tp-direct-ota',     direct.otaFee);
    set('tp-direct-base',    direct.base);
    set('tp-direct-fee',     direct.moorentFee);
    set('tp-direct-netto',   direct.netto);

    // Highlight best netto
    ['tp-airbnb-netto', 'tp-booking-netto', 'tp-direct-netto'].forEach(id => {
        const el = document.getElementById(id);
        el?.closest('td')?.classList.remove('best-cell');
    });
    const max = Math.max(airbnb.netto, booking.netto, direct.netto);
    const bestId = airbnb.netto === max ? 'tp-airbnb-netto' : booking.netto === max ? 'tp-booking-netto' : 'tp-direct-netto';
    document.getElementById(bestId)?.closest('td')?.classList.add('best-cell');
}

document.getElementById('tp-lordo')?.addEventListener('input', calcTrasparenza);
document.getElementById('tp-comm')?.addEventListener('change', calcTrasparenza);
// Init on load
window.addEventListener('DOMContentLoaded', calcTrasparenza);

// === BEFORE/AFTER SLIDER ===
const baWrapper = document.getElementById('ba-slider');
if (baWrapper) {
    const beforeEl = document.getElementById('ba-before');
    const handleEl = document.getElementById('ba-handle');
    let dragging = false;

    function moveSlider(clientX) {
        const rect = baWrapper.getBoundingClientRect();
        const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
        if (beforeEl) beforeEl.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
        if (handleEl) handleEl.style.left = `${pct}%`;
    }

    baWrapper.addEventListener('mousedown', e => { dragging = true; moveSlider(e.clientX); });
    window.addEventListener('mousemove', e => { if (dragging) moveSlider(e.clientX); });
    window.addEventListener('mouseup', () => { dragging = false; });
    baWrapper.addEventListener('touchstart', e => { dragging = true; moveSlider(e.touches[0].clientX); }, { passive: true });
    window.addEventListener('touchmove', e => { if (dragging) moveSlider(e.touches[0].clientX); }, { passive: true });
    window.addEventListener('touchend', () => { dragging = false; });

    // Init at 50%
    moveSlider(baWrapper.getBoundingClientRect().left + baWrapper.offsetWidth / 2);
}
