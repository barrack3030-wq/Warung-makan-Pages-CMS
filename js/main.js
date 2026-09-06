// Translation Dictionary
const translations = {
  id: {
    nav_home: "Beranda",
    nav_about: "Tentang",
    nav_menu: "Menu",
    nav_gallery: "Galeri",
    nav_contact: "Kontak",
    btn_view_menu: "Lihat Menu",
    btn_order_now: "Pesan Sekarang",
    about_title: "Tentang Kami",
    menu_title: "Menu Pilihan",
    menu_subtitle: "Jelajahi hidangan lezat dan minuman segar kami yang disiapkan khusus untuk Anda.",
    gallery_title: "Galeri",
    gallery_subtitle: "Momen spesial dan hidangan favorit pelanggan kami.",
    footer_contact: "Hubungi Kami",
    footer_open_hours: "Jam Buka:",
    footer_address: "Alamat",
    btn_wa: "Hubungi via WhatsApp",
    filter_all: "Semua",
    btn_order_item: "Pesan"
  },
  en: {
    nav_home: "Home",
    nav_about: "About",
    nav_menu: "Menu",
    nav_gallery: "Gallery",
    nav_contact: "Contact",
    btn_view_menu: "View Menu",
    btn_order_now: "Order Now",
    about_title: "About Us",
    menu_title: "Our Menu",
    menu_subtitle: "Explore our delicious dishes and refreshing drinks prepared especially for you.",
    gallery_title: "Gallery",
    gallery_subtitle: "Special moments and our customers' favorite dishes.",
    footer_contact: "Contact Us",
    footer_open_hours: "Open Hours:",
    footer_address: "Address",
    btn_wa: "Contact via WhatsApp",
    filter_all: "All",
    btn_order_item: "Order"
  }
};

let currentLang = localStorage.getItem('lang') || 'id';

function updateLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  
  // Update active button
  document.querySelectorAll('.lang-btn').forEach(btn => {
    if (btn.dataset.lang === lang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update static text elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  // Re-render components that depend on language
  setupFilters();
  if (menuItems.length > 0) renderMenu(menuItems);
}

// Global state
let siteSettings = {};
let menuItems = [];

// DOM Elements
const elements = {
  loader: document.getElementById('loader'),
  navbar: document.querySelector('.navbar'),
  mobileToggle: document.querySelector('.mobile-toggle'),
  navMenu: document.querySelector('.nav-menu'),
  menuContainer: document.getElementById('menu-container'),
  filterContainer: document.getElementById('menu-filters'),
  galleryContainer: document.getElementById('gallery-container'),
  heroSection: document.getElementById('hero')
};

// Formatting utilities
const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(number);
};

const createWhatsappUrl = (productName) => {
  const number = siteSettings.whatsapp || '';
  // Ensure number starts with country code, remove +, -, spaces
  const cleanNumber = number.replace(/\D/g, ''); 
  const message = `Halo ${siteSettings.businessName}, saya ingin memesan *${productName}*.`;
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
};

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadSettings();
    await loadMenu();
    await loadGallery();
    
    setupEventListeners();
    updateLanguage(currentLang);
    
    // Hide loader
    setTimeout(() => {
      elements.loader.style.opacity = '0';
      setTimeout(() => elements.loader.remove(), 500);
    }, 500);
    
  } catch (error) {
    console.error("Error initializing app:", error);
    elements.loader.innerHTML = "<p>Gagal memuat data. Silakan refresh halaman.</p>";
  }
});

// Load and Apply Settings
async function loadSettings() {
  const response = await fetch('/content/settings.json');
  siteSettings = await response.json();
  
  // Update Document Title & SEO
  document.title = `${siteSettings.businessName} - ${siteSettings.tagline}`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', siteSettings.description);
  
  // Populate DOM elements marked with data-cms attribute
  const cmsElements = document.querySelectorAll('[data-cms]');
  cmsElements.forEach(el => {
    const key = el.getAttribute('data-cms');
    if (siteSettings[key]) {
      if (el.tagName === 'IMG') {
        el.src = siteSettings[key];
        el.alt = siteSettings.businessName;
      } else {
        el.textContent = siteSettings[key];
      }
    }
  });
  
  // Set Hero Background
  initHeroSlider();
  
  // Update universal WhatsApp buttons
  const waBtns = document.querySelectorAll('.wa-general-btn');
  waBtns.forEach(btn => {
    const message = `Halo ${siteSettings.businessName}, saya ingin bertanya tentang menu.`;
    const cleanNum = (siteSettings.whatsapp || '').replace(/\D/g, '');
    btn.href = `https://wa.me/${cleanNum}?text=${encodeURIComponent(message)}`;
  });
}

function initHeroSlider() {
  const sliderContainer = document.getElementById('hero-slider');
  if (!sliderContainer) return;
  
  const defaultImages = [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1544025162-83115437ee32?q=80&w=2070&auto=format&fit=crop'
  ];
  
  let images = [];
  if (siteSettings.heroSlider && siteSettings.heroSlider.length > 0) {
    images = siteSettings.heroSlider.map(item => item.image);
  } else if (siteSettings.heroImage) {
    images = [siteSettings.heroImage];
  } else {
    images = defaultImages;
  }

  images.forEach((img, index) => {
    const slide = document.createElement('div');
    slide.className = `hero-slide ${index === 0 ? 'active' : ''}`;
    slide.style.backgroundImage = `url('${img}')`;
    sliderContainer.appendChild(slide);
  });

  if (images.length > 1) {
    let currentIndex = 0;
    const slides = sliderContainer.querySelectorAll('.hero-slide');
    
    setInterval(() => {
      slides[currentIndex].classList.remove('active');
      currentIndex = (currentIndex + 1) % slides.length;
      slides[currentIndex].classList.add('active');
    }, 5000);
  }
}

// Load and Render Menu
async function loadMenu() {
  const response = await fetch('/content/menu.json');
  const data = await response.json();
  menuItems = data.items || [];
  
  renderMenu(menuItems);
  setupFilters();
}

function renderMenu(items) {
  if (!elements.menuContainer) return;
  
  elements.menuContainer.innerHTML = '';
  
  if (items.length === 0) {
    elements.menuContainer.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">Belum ada menu yang tersedia.</p>';
    return;
  }
  
  items.forEach(item => {
    if (!item.isAvailable) return;
    
    const card = document.createElement('div');
    card.className = 'menu-card';
    
    const promoHtml = item.promoLabel ? `<span class="promo-label">${item.promoLabel}</span>` : '';
    const imgUrl = item.image || 'https://via.placeholder.com/400x300?text=No+Image';
    const waUrl = createWhatsappUrl(item.name);
    
    card.innerHTML = `
      <img src="${imgUrl}" alt="${item.name}" class="menu-image" loading="lazy">
      ${promoHtml}
      <div class="menu-content">
        <h3 class="menu-title">${item.name}</h3>
        <p class="menu-desc">${item.description}</p>
        <div class="menu-footer">
          <span class="menu-price">${formatRupiah(item.price)}</span>
          <a href="${waUrl}" target="_blank" class="order-btn">${translations[currentLang].btn_order_item}</a>
        </div>
      </div>
    `;
    
    elements.menuContainer.appendChild(card);
  });
}

function setupFilters() {
  if (!elements.filterContainer) return;
  
  // Get unique categories
  const categories = ['Semua', ...new Set(menuItems.map(item => item.category))];
  
  elements.filterContainer.innerHTML = '';
  categories.forEach((cat, index) => {
    if (!cat) return;
    const btn = document.createElement('button');
    const isAll = cat === 'Semua';
    btn.className = `filter-btn ${index === 0 ? 'active' : ''}`;
    btn.textContent = isAll ? translations[currentLang].filter_all : cat;
    btn.dataset.filter = cat;
    
    btn.addEventListener('click', () => {
      // Update active state
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Filter items
      if (cat === 'Semua') {
        renderMenu(menuItems);
      } else {
        const filtered = menuItems.filter(item => item.category === cat);
        renderMenu(filtered);
      }
    });
    
    elements.filterContainer.appendChild(btn);
  });
}

// Load and Render Gallery
async function loadGallery() {
  if (!elements.galleryContainer) return;
  
  const response = await fetch('/content/gallery.json');
  const data = await response.json();
  const photos = data.photos || [];
  
  elements.galleryContainer.innerHTML = '';
  
  photos.forEach(photo => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    
    item.innerHTML = `
      <img src="${photo.image}" alt="${photo.title}" loading="lazy">
      <div class="gallery-overlay">
        <h3>${photo.title}</h3>
        <p>${photo.description}</p>
      </div>
    `;
    
    elements.galleryContainer.appendChild(item);
  });
}

// Global Event Listeners
function setupEventListeners() {
  // Sticky Navbar
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      elements.navbar.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
      elements.navbar.style.padding = '0';
    } else {
      elements.navbar.style.boxShadow = 'none';
    }
  });
  
  // Mobile Menu Toggle
  if (elements.mobileToggle) {
    elements.mobileToggle.addEventListener('click', () => {
      elements.navMenu.classList.toggle('active');
      const icon = elements.mobileToggle.querySelector('i') || elements.mobileToggle;
      if (elements.navMenu.classList.contains('active')) {
        icon.innerHTML = '&#10005;'; // X mark
      } else {
        icon.innerHTML = '&#9776;'; // Hamburger
      }
    });
  }
  
  // Close mobile menu on link click
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      elements.navMenu.classList.remove('active');
      if (elements.mobileToggle) {
        elements.mobileToggle.innerHTML = '&#9776;';
      }
    });
  });

  // Language Switcher
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      updateLanguage(e.target.dataset.lang);
    });
  });
}
