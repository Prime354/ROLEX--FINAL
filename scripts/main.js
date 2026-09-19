/**
 * ROLEX LUXURY EXPERIENCE - FULL-PAGE SCROLL-LINKED BACKGROUND ENGINE
 * 
 * - Fixed 300-frame full-viewport canvas background (z-index: -1).
 * - Non-blocking asynchronous progressive loading: Frame 1 renders immediately.
 * - Nearest-frame fallback eliminates blanks and flickering on fast scrubs.
 * - Entire-page scroll progress synchronization (window.scrollY / totalScrollable).
 * - Object-fit: cover high-DPI retina canvas projection.
 * - Interactive glass specification modal, mobile menu, and concierge form.
 */

(function () {
  'use strict';

  // --- Configuration ---
  const TOTAL_FRAMES = 300;
  const FRAME_BASE_PATH = 'assets/frames/frame_';
  const FRAME_EXTENSION = '.jpg';

  // --- State Variables ---
  const frames = [];
  const loadedFlags = new Array(TOTAL_FRAMES).fill(false);
  let currentFrameIndex = 0;
  let ticking = false;

  // --- DOM Elements ---
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const siteHeader = document.querySelector('.glass-nav');
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');

  // Modal Elements
  const specModal = document.getElementById('spec-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalWatchName = document.getElementById('modal-watch-name');
  const modalWatchSeries = document.getElementById('modal-watch-series');
  const modalTableBody = document.getElementById('modal-table-body');

  // Watch Technical Data for Modal
  const watchSpecsDatabase = {
    'datejust-36': {
      series: 'Oyster Perpetual',
      name: 'Datejust 36',
      specs: [
        ['Model Case', 'Oyster, 36 mm, Oystersteel and 18 ct yellow gold'],
        ['Oyster Architecture', 'Monobloc middle case, screw-down case back and winding crown'],
        ['Diameter', '36 mm'],
        ['Material', 'Yellow Rolesor - combination of Oystersteel and 18 ct yellow gold'],
        ['Bezel', 'Fluted 18 ct yellow gold'],
        ['Winding Crown', 'Screw-down, Twinlock double waterproofness system'],
        ['Crystal', 'Scratch-resistant sapphire, Cyclops lens over the date'],
        ['Water Resistance', 'Waterproof to 100 metres / 330 feet'],
        ['Movement', 'Perpetual, mechanical, self-winding, Calibre 3235'],
        ['Precision', '-2/+2 sec/day, after casing (Superlative Chronometer)'],
        ['Power Reserve', 'Approximately 70 hours'],
        ['Bracelet', 'Jubilee, five-piece links with Oysterclasp and Easylink 5 mm comfort extension']
      ]
    },
    'submariner-date': {
      series: 'Oyster Perpetual',
      name: 'Submariner Date',
      specs: [
        ['Model Case', 'Oyster, 41 mm, Oystersteel'],
        ['Oyster Architecture', 'Monobloc middle case, screw-down case back and winding crown'],
        ['Diameter', '41 mm'],
        ['Material', 'Oystersteel (aerospace-grade 904L alloy)'],
        ['Bezel', 'Unidirectional rotatable 60-minute graduated, Cerachrom ceramic insert'],
        ['Winding Crown', 'Screw-down, Triplock triple waterproofness system'],
        ['Crystal', 'Scratch-resistant sapphire, Cyclops lens over the date'],
        ['Water Resistance', 'Waterproof to 300 metres / 1,000 feet'],
        ['Movement', 'Perpetual, mechanical, self-winding, Calibre 3235'],
        ['Precision', '-2/+2 sec/day, after casing (Superlative Chronometer)'],
        ['Power Reserve', 'Approximately 70 hours'],
        ['Bracelet', 'Oyster, solid three-piece links with Rolex Glidelock extension system']
      ]
    },
    'daytona': {
      series: 'Oyster Perpetual',
      name: 'Cosmograph Daytona',
      specs: [
        ['Model Case', 'Oyster, 40 mm, 18 ct yellow gold'],
        ['Oyster Architecture', 'Monobloc middle case, screw-down case back and winding crown'],
        ['Diameter', '40 mm'],
        ['Material', '18 ct yellow gold with black monobloc Cerachrom ceramic bezel'],
        ['Bezel', 'Cerachrom ceramic with moulded tachymetric scale in gold'],
        ['Winding Crown', 'Screw-down, Triplock triple waterproofness system'],
        ['Crystal', 'Scratch-resistant sapphire with double anti-reflective coating'],
        ['Water Resistance', 'Waterproof to 100 metres / 330 feet'],
        ['Movement', 'Perpetual, mechanical chronograph, self-winding, Calibre 4131'],
        ['Precision', '-2/+2 sec/day, after casing (Superlative Chronometer)'],
        ['Power Reserve', 'Approximately 72 hours'],
        ['Bracelet', 'Oysterflex elastomer bracelet with Rolex Glidelock extension system']
      ]
    },
    'day-date-40': {
      series: 'Oyster Perpetual',
      name: 'Day-Date 40',
      specs: [
        ['Model Case', 'Oyster, 40 mm, 18 ct Everose gold'],
        ['Oyster Architecture', 'Monobloc middle case, screw-down case back and winding crown'],
        ['Diameter', '40 mm'],
        ['Material', '18 ct Everose gold with olive green sunray-finish dial'],
        ['Bezel', 'Fluted 18 ct Everose gold'],
        ['Winding Crown', 'Screw-down, Twinlock double waterproofness system'],
        ['Crystal', 'Scratch-resistant sapphire, Cyclops lens over the date'],
        ['Water Resistance', 'Waterproof to 100 metres / 330 feet'],
        ['Movement', 'Perpetual, mechanical, self-winding, Calibre 3255'],
        ['Precision', '-2/+2 sec/day, after casing (Superlative Chronometer)'],
        ['Power Reserve', 'Approximately 70 hours'],
        ['Bracelet', 'President, semi-circular three-piece links with concealed Crownclasp']
      ]
    },
    'gmt-master-ii': {
      series: 'Oyster Perpetual',
      name: 'GMT-Master II',
      specs: [
        ['Model Case', 'Oyster, 40 mm, Oystersteel'],
        ['Oyster Architecture', 'Monobloc middle case, screw-down case back and winding crown'],
        ['Diameter', '40 mm'],
        ['Material', 'Oystersteel with bidirectional rotatable 24-hour bezel'],
        ['Bezel', 'Two-colour red and blue Cerachrom ceramic insert with engraved numerals'],
        ['Winding Crown', 'Screw-down, Triplock triple waterproofness system'],
        ['Crystal', 'Scratch-resistant sapphire, Cyclops lens over the date'],
        ['Water Resistance', 'Waterproof to 100 metres / 330 feet'],
        ['Movement', 'Perpetual, mechanical, self-winding, GMT function, Calibre 3285'],
        ['Precision', '-2/+2 sec/day, after casing (Superlative Chronometer)'],
        ['Power Reserve', 'Approximately 70 hours'],
        ['Bracelet', 'Jubilee, five-piece links with Oysterlock folding safety clasp']
      ]
    },
    'yacht-master-42': {
      series: 'Oyster Perpetual',
      name: 'Yacht-Master 42',
      specs: [
        ['Model Case', 'Oyster, 42 mm, RLX titanium'],
        ['Oyster Architecture', 'Monobloc middle case, screw-down case back and winding crown'],
        ['Diameter', '42 mm'],
        ['Material', 'RLX titanium (grade 5 titanium alloy)'],
        ['Bezel', 'Bidirectional rotatable 60-minute graduated with matte black Cerachrom insert'],
        ['Winding Crown', 'Screw-down, Triplock triple waterproofness system'],
        ['Crystal', 'Scratch-resistant sapphire, Cyclops lens over the date'],
        ['Water Resistance', 'Waterproof to 100 metres / 330 feet'],
        ['Movement', 'Perpetual, mechanical, self-winding, Calibre 3235'],
        ['Precision', '-2/+2 sec/day, after casing (Superlative Chronometer)'],
        ['Power Reserve', 'Approximately 70 hours'],
        ['Bracelet', 'Oyster, three-piece solid links in RLX titanium with Oysterlock safety clasp']
      ]
    }
  };

  /**
   * Initialize Canvas dimensions matching viewport and handle high-DPI displays
   */
  function setupCanvasDimensions() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2 for performance
    const displayWidth = window.innerWidth;
    const displayHeight = window.innerHeight;

    canvas.width = Math.round(displayWidth * dpr);
    canvas.height = Math.round(displayHeight * dpr);
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';

    // Redraw current frame immediately
    drawFrame(currentFrameIndex);
  }

  /**
   * Find nearest loaded frame index if requested frame hasn't loaded yet.
   * Eliminates blank frames or flicker during quick scrolling.
   * @param {number} targetIndex 0 to TOTAL_FRAMES - 1
   * @returns {number|null} Nearest available frame index or null
   */
  function getNearestLoadedFrameIndex(targetIndex) {
    if (loadedFlags[targetIndex]) return targetIndex;

    // Search outwards in both directions
    for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
      const prev = targetIndex - offset;
      if (prev >= 0 && loadedFlags[prev]) return prev;

      const next = targetIndex + offset;
      if (next < TOTAL_FRAMES && loadedFlags[next]) return next;
    }

    return null;
  }

  /**
   * Draw a specific frame onto the canvas with object-fit: cover scaling
   * @param {number} frameIndex 0 to TOTAL_FRAMES - 1
   */
  function drawFrame(frameIndex) {
    if (!ctx || !canvas) return;

    // Resolve to nearest available loaded frame if current isn't ready
    const resolvedIndex = getNearestLoadedFrameIndex(frameIndex);
    if (resolvedIndex === null) return;

    const img = frames[resolvedIndex];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Calculate object-fit: cover projection
    const imgWidth = img.naturalWidth || 1280;
    const imgHeight = img.naturalHeight || 720;
    const imgRatio = imgWidth / imgHeight;
    const canvasRatio = canvasWidth / canvasHeight;

    let renderWidth, renderHeight, offsetX, offsetY;

    if (canvasRatio > imgRatio) {
      // Canvas is wider than image aspect ratio
      renderWidth = canvasWidth;
      renderHeight = canvasWidth / imgRatio;
      offsetX = 0;
      offsetY = (canvasHeight - renderHeight) / 2;
    } else {
      // Canvas is taller than image aspect ratio
      renderHeight = canvasHeight;
      renderWidth = canvasHeight * imgRatio;
      offsetX = (canvasWidth - renderWidth) / 2;
      offsetY = 0;
    }

    ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);
  }

  /**
   * Calculate scroll progress across the ENTIRE PAGE's scrollable height:
   * progress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)
   */
  function updateScrollAnimation() {
    const scrollHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;
    const totalScrollable = scrollHeight - windowHeight;

    let progress = 0;
    if (totalScrollable > 0) {
      progress = window.scrollY / totalScrollable;
    }

    // Clamp between 0.0 and 1.0
    progress = Math.max(0, Math.min(1, progress));

    // Map progress to frame index 0..299
    const frameIndex = Math.min(TOTAL_FRAMES - 1, Math.floor(progress * TOTAL_FRAMES));
    currentFrameIndex = frameIndex;

    // Draw the calculated frame
    drawFrame(frameIndex);
  }

  /**
   * Optimized scroll listener using requestAnimationFrame and ticking flag
   */
  function onScroll() {
    // Header glass visual elevation on scroll
    if (siteHeader) {
      if (window.scrollY > 40) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    }

    // Canvas redraw tick
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateScrollAnimation();
        ticking = false;
      });
      ticking = true;
    }
  }

  /**
   * Preload 300 sequential JPG frames asynchronously.
   * Priority: Frame 1 is rendered immediately once ready.
   * Page is never blocked or waiting on a full loader.
   */
  function preloadFrames() {
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(4, '0');
      const frameIndex = i - 1;

      img.src = `${FRAME_BASE_PATH}${frameNum}${FRAME_EXTENSION}`;

      img.onload = () => {
        loadedFlags[frameIndex] = true;

        // Render Frame 1 immediately upon arrival
        if (frameIndex === 0 && currentFrameIndex === 0) {
          drawFrame(0);
        } else if (frameIndex === currentFrameIndex) {
          // If the currently requested frame just arrived, draw it
          drawFrame(currentFrameIndex);
        }
      };

      img.onerror = () => {
        // Even on error, mark to allow nearest-frame search to proceed
        loadedFlags[frameIndex] = false;
      };

      frames.push(img);
    }
  }

  /**
   * Open Specification Modal
   * @param {string} watchId Key from watchSpecsDatabase
   */
  function openSpecModal(watchId) {
    const data = watchSpecsDatabase[watchId];
    if (!data || !specModal) return;

    if (modalWatchSeries) modalWatchSeries.textContent = data.series;
    if (modalWatchName) modalWatchName.textContent = data.name;

    if (modalTableBody) {
      modalTableBody.innerHTML = '';
      data.specs.forEach(([key, val]) => {
        const tr = document.createElement('tr');
        const tdKey = document.createElement('td');
        tdKey.textContent = key;
        const tdVal = document.createElement('td');
        tdVal.textContent = val;
        tr.appendChild(tdKey);
        tr.appendChild(tdVal);
        modalTableBody.appendChild(tr);
      });
    }

    specModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  /**
   * Close Specification Modal
   */
  function closeSpecModal() {
    if (!specModal) return;
    specModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  /**
   * Toast notification helper for newsletter & appointments
   * @param {string} message 
   */
  function showToast(message) {
    let toast = document.querySelector('.toast-notice');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast-notice';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }

  /**
   * Setup UI interactions: Modal, Mobile Menu, Form, Smooth scrolling
   */
  function setupInteractions() {
    // Scroll event listener (passive for high performance)
    window.addEventListener('scroll', onScroll, { passive: true });

    // Resize event listener
    window.addEventListener('resize', () => {
      setupCanvasDimensions();
      updateScrollAnimation();
    }, { passive: true });

    // Mobile Menu Toggle
    if (mobileMenuToggle && siteHeader) {
      mobileMenuToggle.addEventListener('click', () => {
        siteHeader.classList.toggle('mobile-expanded');
      });
    }

    // Close mobile nav when clicking a link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (siteHeader) siteHeader.classList.remove('mobile-expanded');
      });
    });

    // Product Card "View Details" buttons
    document.querySelectorAll('[data-view-specs]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const watchId = btn.getAttribute('data-view-specs');
        openSpecModal(watchId);
      });
    });

    // Modal Close Button
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', closeSpecModal);
    }

    // Modal backdrop click to close
    if (specModal) {
      specModal.addEventListener('click', (e) => {
        if (e.target === specModal) closeSpecModal();
      });
    }

    // ESC key to close modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && specModal && specModal.classList.contains('open')) {
        closeSpecModal();
      }
    });

    // Concierge / Newsletter Form
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = newsletterForm.querySelector('input[type="email"]');
        if (input && input.value) {
          showToast(`Thank you. An official consultation invitation has been sent to ${input.value}`);
          input.value = '';
        }
      });
    }

    // Back to top button
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  // --- Initialize Immediately on DOMContentLoaded ---
  document.addEventListener('DOMContentLoaded', () => {
    setupCanvasDimensions();
    preloadFrames();
    setupInteractions();
  });

})();
