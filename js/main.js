/* 
  PARIKSIT COACHING INSTITUTE - ULTRA HIGH PERFORMANCE APPLICATION LOGIC
  Mobile-Optimized Navigation Drawer, Viewport-Aware Tooltips, Custom Select Dropdowns, ScrollSpy, Lightbox & Search
*/

document.addEventListener('DOMContentLoaded', () => {
  renderResultPosters('all');
  renderFaculty('all');
  initSearch();
  initLightbox();
  initScrollSpy();
  initPillBorderProgress();
  initCustomSelect();
  initTooltips();
  initFormSubmissions();
  initMobileNavigation();
});

/* Mobile Navigation Drawer Toggle & Interactions */
function initMobileNavigation() {
  const toggleBtn = document.getElementById('mobileNavToggle');
  const drawer = document.getElementById('mobileNavDrawer');
  const backdrop = document.getElementById('mobileNavBackdrop');
  const closeBtn = document.getElementById('mobileDrawerClose');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  function openDrawer() {
    if (drawer) drawer.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (drawer) drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (toggleBtn) toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });

  // Mobile search input sync with search engine
  const mobileSearch = document.getElementById('mobileSearchInput');
  const desktopSearch = document.getElementById('globalSearchInput');
  if (mobileSearch && desktopSearch) {
    mobileSearch.addEventListener('input', (e) => {
      desktopSearch.value = e.target.value;
      desktopSearch.dispatchEvent(new Event('input'));
    });
    desktopSearch.addEventListener('input', (e) => {
      mobileSearch.value = e.target.value;
    });
  }
}

/* Bidirectional Revolving Pill Border Progress Indicator (Starts Center, Travels Both Ways) */
function initPillBorderProgress() {
  const island = document.querySelector('.floating-nav-island');
  const svg = document.getElementById('pillBorderSvg');
  const track = document.getElementById('pillBorderTrack');
  const wingLeft = document.getElementById('pillBorderWingLeft');
  const wingRight = document.getElementById('pillBorderWingRight');
  if (!island || !svg || !wingLeft || !wingRight) return;

  let halfLength = 0;

  function resizePillBorder() {
    const w = island.offsetWidth;
    const h = island.offsetHeight;
    if (!w || !h) return;

    const strokeWidth = 2;
    const offset = strokeWidth / 2;
    const rectW = Math.max(0, w - 2 * offset);
    const rectH = Math.max(0, h - 2 * offset);
    const r = rectH / 2;

    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    
    if (track) {
      track.setAttribute('x', offset);
      track.setAttribute('y', offset);
      track.setAttribute('width', rectW);
      track.setAttribute('height', rectH);
      track.setAttribute('rx', r);
      track.setAttribute('ry', r);
    }

    const topY = offset;
    const botY = h - offset;
    const centerX = w / 2;
    const rightX = w - offset - r;
    const leftX = offset + r;

    // Right Wing: Starts Top-Center -> moves clockwise across top-right -> right arc -> bottom-center
    const dRight = `M ${centerX} ${topY} L ${rightX} ${topY} A ${r} ${r} 0 0 1 ${rightX} ${botY} L ${centerX} ${botY}`;
    wingRight.setAttribute('d', dRight);

    // Left Wing: Starts Top-Center -> moves counter-clockwise across top-left -> left arc -> bottom-center
    const dLeft = `M ${centerX} ${topY} L ${leftX} ${topY} A ${r} ${r} 0 0 0 ${leftX} ${botY} L ${centerX} ${botY}`;
    wingLeft.setAttribute('d', dLeft);

    try {
      halfLength = wingRight.getTotalLength();
    } catch (e) {
      halfLength = (rightX - leftX) + Math.PI * r;
    }

    if (!halfLength || isNaN(halfLength)) {
      halfLength = (rightX - leftX) + Math.PI * r;
    }

    wingRight.style.strokeDasharray = `${halfLength} ${halfLength}`;
    wingLeft.style.strokeDasharray = `${halfLength} ${halfLength}`;
    updateProgress();
  }

  function updateProgress() {
    if (!halfLength) return;
    const scrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = totalHeight > 0 ? Math.min(1, Math.max(0, scrollY / totalHeight)) : 0;
    
    // Symmetrical bidirectional stroke progression: both wings advance from top-center and meet at bottom-center
    const offset = halfLength * (1 - progress);
    wingRight.style.strokeDashoffset = offset;
    wingLeft.style.strokeDashoffset = offset;
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateProgress();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', resizePillBorder, { passive: true });
  window.addEventListener('touchmove', updateProgress, { passive: true });

  // Initial calculation and layout stabilization
  resizePillBorder();
  setTimeout(resizePillBorder, 150);
}

/* Viewport-Aware Global Floating Tooltip System (Desktop Hover Only) */
function initTooltips() {
  // Check if device supports true hover to prevent sticky tooltips on mobile touch screens
  const isHoverDevice = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!isHoverDevice) return;

  let tooltip = document.getElementById('floatingTooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'floatingTooltip';
    tooltip.className = 'floating-tooltip';
    document.body.appendChild(tooltip);
  }

  let activeTarget = null;

  function showTooltip(target) {
    const text = target.getAttribute('data-tooltip');
    if (!text) return;

    activeTarget = target;
    tooltip.textContent = text;
    tooltip.classList.add('active');

    const rect = target.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    // Horizontal centering with screen boundary constraints
    const targetCenterX = rect.left + rect.width / 2;
    let left = targetCenterX - tooltipRect.width / 2;
    left = Math.max(12, Math.min(window.innerWidth - tooltipRect.width - 12, left));

    // Vertical placement logic: If target is within 65px of top (e.g. navbar), place below!
    let top;
    if (rect.top < 65) {
      top = rect.bottom + 8;
    } else {
      top = rect.top - tooltipRect.height - 8;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  function hideTooltip() {
    activeTarget = null;
    tooltip.classList.remove('active');
  }

  // Global delegation
  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('[data-tooltip]');
    if (target) {
      showTooltip(target);
    }
  }, { passive: true });

  document.addEventListener('mouseout', (e) => {
    const target = e.target.closest('[data-tooltip]');
    if (target && target === activeTarget) {
      hideTooltip();
    }
  }, { passive: true });

  // Hide on scroll for clean UX
  window.addEventListener('scroll', () => {
    if (activeTarget) hideTooltip();
  }, { passive: true });
}

/* Modern Glassmorphic Custom Select Component */
function initCustomSelect() {
  const selectWrappers = document.querySelectorAll('.custom-select-wrapper');

  selectWrappers.forEach(wrapper => {
    const trigger = wrapper.querySelector('.custom-select-trigger');
    const label = wrapper.querySelector('.custom-select-label');
    const hiddenInput = wrapper.querySelector('input[type="hidden"]');
    const options = wrapper.querySelectorAll('.custom-option');

    if (!trigger || !options.length) return;

    // Toggle dropdown on trigger click
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      selectWrappers.forEach(w => {
        if (w !== wrapper) w.classList.remove('open');
      });
      wrapper.classList.toggle('open');
    });

    // Handle option selection
    options.forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        const value = option.dataset.value;
        const title = option.querySelector('.option-title') ? option.querySelector('.option-title').innerText : option.innerText;

        if (hiddenInput) hiddenInput.value = value;
        if (label) {
          label.innerText = title;
          label.classList.remove('placeholder');
        }

        options.forEach(opt => {
          opt.classList.remove('selected');
          opt.setAttribute('aria-selected', 'false');
        });
        option.classList.add('selected');
        option.setAttribute('aria-selected', 'true');

        wrapper.classList.remove('open');
      });
    });

    // Keyboard support
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        wrapper.classList.toggle('open');
      } else if (e.key === 'Escape') {
        wrapper.classList.remove('open');
      }
    });
  });

  // Click outside to close all dropdowns
  document.addEventListener('click', () => {
    selectWrappers.forEach(wrapper => wrapper.classList.remove('open'));
  });
}

/* Dynamic ScrollSpy: Active Indicator Tracking across Sections */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-menu a');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  if (sections.length === 0) return;

  function updateActiveNav() {
    const scrollPosition = window.scrollY + 120; // Offset for sticky navbar height

    let currentSectionId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    // Special check for bottom of page
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 80) {
      currentSectionId = 'admissions';
    }

    if (currentSectionId) {
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        link.classList.toggle('active', href === `#${currentSectionId}`);
      });
      mobileNavLinks.forEach(link => {
        const href = link.getAttribute('href');
        link.classList.toggle('active', href === `#${currentSectionId}`);
      });
    }
  }

  // Throttle scroll events for peak performance
  let isTicking = false;
  window.addEventListener('scroll', () => {
    if (!isTicking) {
      window.requestAnimationFrame(() => {
        updateActiveNav();
        isTicking = false;
      });
      isTicking = true;
    }
  }, { passive: true });

  // Initial check on load
  updateActiveNav();
}

/* Search Filter across Results, Posters & Faculty */
function initSearch() {
  const searchInput = document.getElementById('globalSearchInput');
  if (!searchInput) return;

  let debounceTimer;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const query = e.target.value.toLowerCase().trim();
      if (!query) {
        renderResultPosters('all');
        renderFaculty('all');
        return;
      }

      const data = window.PARIKSIT_DATA || {};
      const posters = data.resultPosters || [];
      const faculty = data.faculty || [];

      // Filter result posters
      const filteredPosters = posters.filter(poster =>
        poster.title.toLowerCase().includes(query) ||
        poster.badge.toLowerCase().includes(query) ||
        poster.description.toLowerCase().includes(query) ||
        poster.year.includes(query)
      );
      renderCustomPosters(filteredPosters);

      // Filter faculty
      const filteredFaculty = faculty.filter(teacher =>
        teacher.name.toLowerCase().includes(query) ||
        teacher.alma.toLowerCase().includes(query) ||
        teacher.subjects.toLowerCase().includes(query)
      );
      renderCustomFaculty(filteredFaculty);
    }, 100);
  });
}

/* Render Result Posters with Fast WebP Thumbnails */
window.renderResultPosters = function(category = 'all') {
  const data = window.PARIKSIT_DATA || {};
  const posters = data.resultPosters || [];

  const filtered = category === 'all'
    ? posters
    : posters.filter(p => p.category === category);
  
  renderCustomPosters(filtered);

  // Tab active state
  const tabs = document.querySelectorAll('.result-tab');
  tabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.cat === category);
  });
};

function renderCustomPosters(dataList) {
  const container = document.getElementById('resultsGrid');
  if (!container) return;

  if (!dataList || dataList.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; padding: 40px; text-align: center; color: var(--text-secondary);">
        No result posters match your filter.
      </div>
    `;
    return;
  }

  container.innerHTML = dataList.map(poster => {
    const thumb = poster.thumbnail || poster.image;
    const fullImg = poster.image;
    const safeTitle = poster.title.replace(/'/g, "\\'");
    return `
      <div class="result-poster-card" onclick="openLightbox('${fullImg}', '${safeTitle} (${poster.year})')" data-tooltip="Click to inspect high-resolution poster">
        <div class="poster-preview-box">
          <img 
            src="${thumb}" 
            alt="${poster.title}" 
            class="poster-img" 
            loading="lazy" 
            decoding="async" 
            onerror="this.onerror=null; this.src='${fullImg}';"
          />
          <div class="poster-zoom-hint">Click to enlarge</div>
        </div>
        <div class="poster-info-content">
          <span class="poster-badge-tag">${poster.badge}</span>
          <div class="poster-title-text">${poster.title}</div>
          <div class="poster-desc-text">${poster.description}</div>
        </div>
      </div>
    `;
  }).join('');
}

/* Render Faculty with Fast WebP Portraits */
window.renderFaculty = function(subject = 'all') {
  const data = window.PARIKSIT_DATA || {};
  const faculty = data.faculty || [];

  const filtered = subject === 'all'
    ? faculty
    : faculty.filter(f => f.category === subject);
  
  renderCustomFaculty(filtered);

  // Tab active state
  const tabs = document.querySelectorAll('.faculty-tab');
  tabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.sub === subject);
  });
};

function renderCustomFaculty(dataList) {
  const container = document.getElementById('facultyGrid');
  if (!container) return;

  if (!dataList || dataList.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; padding: 40px; text-align: center; color: var(--text-secondary);">
        No mentors match your filter.
      </div>
    `;
    return;
  }

  container.innerHTML = dataList.map(teacher => {
    const thumb = teacher.thumbnail || teacher.image;
    const fullImg = teacher.image;
    return `
      <div class="faculty-card-minimal" data-tooltip="${teacher.role} • ${teacher.alma}">
        <div class="faculty-photo-wrapper">
          <img 
            src="${thumb}" 
            alt="${teacher.name}" 
            class="faculty-photo-img" 
            loading="lazy" 
            decoding="async" 
            onerror="this.onerror=null; if(this.src.indexOf('${fullImg}')===-1){this.src='${fullImg}';}else{this.src='images/teachers/yogesh-prajapati.jpg';}"
          />
        </div>
        <div class="faculty-name-title">${teacher.name}</div>
        <div class="faculty-credential">${teacher.alma}</div>
        <div class="faculty-subject-desc">${teacher.subjects}</div>
        <div style="font-size: 0.8rem; color: var(--text-tertiary); margin-top: 12px;">
          ${teacher.role} • ${teacher.exp}
        </div>
      </div>
    `;
  }).join('');
}

/* Lightbox Modal for Result Posters */
function initLightbox() {
  const lightbox = document.getElementById('lightboxModal');
  const closeBtn = document.getElementById('lightboxCloseBtn');

  function closeLightboxModal() {
    if (lightbox) {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeLightboxModal);
  }
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightboxModal();
    });
  }

  // Escape key to close lightbox
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox && lightbox.classList.contains('active')) {
      closeLightboxModal();
    }
  });
}

window.openLightbox = function(imgSrc, captionText) {
  const lightbox = document.getElementById('lightboxModal');
  const imgElem = document.getElementById('lightboxImg');
  const captionElem = document.getElementById('lightboxCaption');

  if (lightbox && imgElem) {
    imgElem.src = imgSrc;
    if (captionElem) captionElem.innerText = captionText;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};

/* Form Submissions (Fixed Binding & Validation) */
function initFormSubmissions() {
  const admissionsForm = document.getElementById('admissionsForm');
  if (admissionsForm) {
    admissionsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const programInput = document.getElementById('programInput');
      if (!programInput || !programInput.value) {
        alert('Please select your target academic program in the dropdown.');
        const selectWrapper = document.getElementById('programSelect');
        if (selectWrapper) selectWrapper.classList.add('open');
        return;
      }
      const studentName = document.getElementById('studentName') ? document.getElementById('studentName').value : 'Student';
      alert(`Thank you, ${studentName}! Your academic counseling request has been received. A Pariksit mentor will contact you shortly.`);
      admissionsForm.reset();
      const label = document.getElementById('selectedProgramLabel');
      if (label) {
        label.innerText = 'Select Academic Program';
        label.classList.add('placeholder');
      }
      const options = document.querySelectorAll('.custom-option');
      options.forEach(o => {
        o.classList.remove('selected');
        o.setAttribute('aria-selected', 'false');
      });
      programInput.value = '';
    });
  }
}
