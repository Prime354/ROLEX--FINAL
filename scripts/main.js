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

  // ==========================================================================
  // ROLEX VIRTUAL CONCIERGE CHATBOT MODULE (HAUTE HORLOGERIE SUITE)
  // ==========================================================================
  function setupChatbot() {
    const toggleBtn = document.getElementById('chatbot-toggle-btn');
    const widget = document.getElementById('chatbot-widget');
    const closeBtn = document.getElementById('chatbot-close-btn');
    const messagesContainer = document.getElementById('chatbot-messages');
    const form = document.getElementById('chatbot-form');
    const input = document.getElementById('chatbot-input');
    const chipsContainer = document.getElementById('chatbot-chips');
    const soundBtn = document.getElementById('chatbot-sound-btn');
    const clearBtn = document.getElementById('chatbot-clear-btn');
    const genevaClockEl = document.getElementById('geneva-clock-time');

    if (!toggleBtn || !widget || !messagesContainer) return;

    // --- State ---
    let soundEnabled = true;
    let hasGreeted = false;
    let audioCtx = null;

    // --- 1. Real-Time Geneva Clock (Europe/Zurich) ---
    function updateGenevaClock() {
      if (!genevaClockEl) return;
      try {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-GB', {
          timeZone: 'Europe/Zurich',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        genevaClockEl.textContent = `${timeString} CET`;
      } catch (err) {
        // Fallback for older browsers
        const now = new Date();
        const utcHours = now.getUTCHours();
        const cetHours = (utcHours + 1) % 24;
        const pad = (n) => String(n).padStart(2, '0');
        genevaClockEl.textContent = `${pad(cetHours)}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())} CET`;
      }
    }
    updateGenevaClock();
    setInterval(updateGenevaClock, 1000);

    // --- 2. Web Audio API Synthetic Mechanical Watch Escapement Sound ---
    function playEscapementTick() {
      if (!soundEnabled) return;
      try {
        const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtxClass) return;
        if (!audioCtx) {
          audioCtx = new AudioCtxClass();
        }
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }

        const now = audioCtx.currentTime;

        // Simulate high-beat Swiss escapement pallet jewels (2 micro clicks: tick-tock)
        [0, 0.045].forEach((offset, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          const filter = audioCtx.createBiquadFilter();

          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(idx === 0 ? 3200 : 4600, now + offset);
          filter.Q.setValueAtTime(12, now + offset);

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(idx === 0 ? 1200 : 1800, now + offset);
          osc.frequency.exponentialRampToValueAtTime(300, now + offset + 0.025);

          gain.gain.setValueAtTime(0.08, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.03);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(audioCtx.destination);

          osc.start(now + offset);
          osc.stop(now + offset + 0.035);
        });
      } catch (e) {
        // AudioContext not allowed before user gesture or unsupported
      }
    }

    // Toggle Sound Button
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundBtn.classList.toggle('muted', !soundEnabled);
        soundBtn.setAttribute('title', soundEnabled ? 'Mute Mechanical Sound' : 'Enable Mechanical Sound');
        soundBtn.setAttribute('aria-label', soundEnabled ? 'Mute Mechanical Sound' : 'Enable Mechanical Sound');
        if (soundEnabled) {
          playEscapementTick();
        }
      });
    }

    // --- 3. Format Time ---
    function formatTime() {
      const now = new Date();
      return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // --- 4. Toggle Chatbot Panel ---
    function toggleChat(open) {
      const isOpen = open !== undefined ? open : !widget.classList.contains('open');
      if (isOpen) {
        widget.classList.add('open');
        widget.setAttribute('aria-hidden', 'false');
        if (!hasGreeted && messagesContainer.children.length === 0) {
          sendBotMessage(
            "Good day. Welcome to the official **Rolex Virtual Concierge** in Geneva.\n\nIt is our supreme privilege to advise your horological acquisition. You may inquire about our iconic timepieces, in-house mechanical calibres, or reserve a private consultation.",
            null,
            250
          );
          hasGreeted = true;
        }
        if (input) input.focus();
        playEscapementTick();
      } else {
        widget.classList.remove('open');
        widget.setAttribute('aria-hidden', 'true');
      }
    }

    toggleBtn.addEventListener('click', () => toggleChat());
    if (closeBtn) closeBtn.addEventListener('click', () => toggleChat(false));

    // --- 5. Reset Conversation ---
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        messagesContainer.innerHTML = '';
        hasGreeted = false;
        playEscapementTick();
        sendBotMessage(
          "Conversation reset. How may the Geneva Concierge assist your horological inquiries today?",
          null,
          200
        );
      });
    }

    // --- 6. Append Message to Stream ---
    function appendMessage(text, isUser, actionHtml) {
      const msgWrapper = document.createElement('div');
      msgWrapper.className = `chat-msg ${isUser ? 'chat-msg-user' : 'chat-msg-bot'}`;

      const bubble = document.createElement('div');
      bubble.className = isUser ? 'chat-bubble-user' : 'chat-bubble-bot';

      // Convert markdown **bold** to <strong>
      let formattedText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
      bubble.innerHTML = formattedText;

      if (actionHtml) {
        const actionContainer = document.createElement('div');
        actionContainer.innerHTML = actionHtml;
        bubble.appendChild(actionContainer);

        // Bind spec modal triggers inside the chat bubble
        actionContainer.querySelectorAll('[data-chat-spec]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            const watchId = btn.getAttribute('data-chat-spec');
            openSpecModal(watchId);
            playEscapementTick();
          });
        });

        // Bind scroll triggers inside the chat bubble
        actionContainer.querySelectorAll('[data-chat-scroll]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = btn.getAttribute('data-chat-scroll');
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
              targetEl.scrollIntoView({ behavior: 'smooth' });
              // On mobile, close chat so user sees target
              if (window.innerWidth <= 768) {
                toggleChat(false);
              }
            }
          });
        });
      }

      const time = document.createElement('span');
      time.className = 'chat-time';
      time.textContent = formatTime();

      msgWrapper.appendChild(bubble);
      msgWrapper.appendChild(time);
      messagesContainer.appendChild(msgWrapper);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      if (!isUser) {
        playEscapementTick();
      }
    }

    // --- 7. Typing Indicator ---
    function showTypingIndicator() {
      const typingEl = document.createElement('div');
      typingEl.className = 'chat-msg chat-msg-bot chat-typing-wrapper';
      typingEl.innerHTML = `
        <div class="chat-typing">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
      `;
      messagesContainer.appendChild(typingEl);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      return typingEl;
    }

    function sendBotMessage(text, actionHtml, delay = 450) {
      const indicator = showTypingIndicator();
      setTimeout(() => {
        if (indicator && indicator.parentNode) {
          indicator.parentNode.removeChild(indicator);
        }
        appendMessage(text, false, actionHtml);
      }, delay);
    }

    // --- 8. Timepiece Card Templates ---
    const watchCards = {
      'submariner': `
        <div class="chat-watch-card">
          <img src="assets/images/submariner.jpg" alt="Rolex Submariner Date" class="chat-watch-img">
          <div class="chat-watch-info">
            <span class="chat-watch-series">Professional Sea-Dweller</span>
            <span class="chat-watch-name">Submariner Date 41 mm</span>
            <span class="chat-watch-price">$10,250</span>
            <span class="chat-watch-specs">Oystersteel &bull; 300m Waterproof &bull; Cerachrom</span>
            <button class="chat-action-btn" data-chat-spec="submariner-date">Inspect Technical Specs &rarr;</button>
          </div>
        </div>
      `,
      'daytona': `
        <div class="chat-watch-card">
          <img src="assets/images/daytona.jpg" alt="Rolex Cosmograph Daytona" class="chat-watch-img">
          <div class="chat-watch-info">
            <span class="chat-watch-series">Professional Motorsport</span>
            <span class="chat-watch-name">Cosmograph Daytona</span>
            <span class="chat-watch-price">$32,100</span>
            <span class="chat-watch-specs">18 ct Yellow Gold &bull; Calibre 4131 &bull; Chronograph</span>
            <button class="chat-action-btn" data-chat-spec="daytona">Inspect Technical Specs &rarr;</button>
          </div>
        </div>
      `,
      'datejust': `
        <div class="chat-watch-card">
          <img src="assets/images/datejust.jpg" alt="Rolex Datejust 36" class="chat-watch-img">
          <div class="chat-watch-info">
            <span class="chat-watch-series">Classic Horology</span>
            <span class="chat-watch-name">Datejust 36</span>
            <span class="chat-watch-price">$14,350</span>
            <span class="chat-watch-specs">Yellow Rolesor &bull; Fluted Bezel &bull; Jubilee</span>
            <button class="chat-action-btn" data-chat-spec="datejust-36">Inspect Technical Specs &rarr;</button>
          </div>
        </div>
      `,
      'daydate': `
        <div class="chat-watch-card">
          <img src="assets/images/daydate.jpg" alt="Rolex Day-Date 40" class="chat-watch-img">
          <div class="chat-watch-info">
            <span class="chat-watch-series">The Presidents' Watch</span>
            <span class="chat-watch-name">Day-Date 40</span>
            <span class="chat-watch-price">$41,500</span>
            <span class="chat-watch-specs">18 ct Everose Gold &bull; Olive Green &bull; Calibre 3255</span>
            <button class="chat-action-btn" data-chat-spec="day-date-40">Inspect Technical Specs &rarr;</button>
          </div>
        </div>
      `,
      'gmt': `
        <div class="chat-watch-card">
          <img src="assets/images/gmt.jpg" alt="Rolex GMT-Master II" class="chat-watch-img">
          <div class="chat-watch-info">
            <span class="chat-watch-series">Aviation Dual-Time</span>
            <span class="chat-watch-name">GMT-Master II "Pepsi"</span>
            <span class="chat-watch-price">$11,100</span>
            <span class="chat-watch-specs">Cerachrom Red/Blue &bull; Calibre 3285 &bull; Jubilee</span>
            <button class="chat-action-btn" data-chat-spec="gmt-master-ii">Inspect Technical Specs &rarr;</button>
          </div>
        </div>
      `,
      'yachtmaster': `
        <div class="chat-watch-card">
          <img src="assets/images/yachtmaster.jpg" alt="Rolex Yacht-Master 42" class="chat-watch-img">
          <div class="chat-watch-info">
            <span class="chat-watch-series">Regatta Navigation</span>
            <span class="chat-watch-name">Yacht-Master 42</span>
            <span class="chat-watch-price">$14,050</span>
            <span class="chat-watch-specs">RLX Titanium &bull; Matte Ceramic Bezel &bull; Calibre 3235</span>
            <button class="chat-action-btn" data-chat-spec="yacht-master-42">Inspect Technical Specs &rarr;</button>
          </div>
        </div>
      `
    };

    // --- 9. Comprehensive Horological Advisory Engine ---
    function getBotResponse(userText) {
      const q = userText.toLowerCase();

      // 1. Submariner / Divers / Underwater / Deep Sea / Waterproof
      if (q.includes('submariner') || q.includes('diver') || q.includes('diving') || q.includes('waterproof') || q.includes('sea') || q.includes('underwater')) {
        return {
          text: "The benchmark of oceanic exploration: the **Submariner Date** ($10,250) is crafted from corrosion-proof aerospace Oystersteel. Featuring a unidirectional rotatable 60-minute Cerachrom ceramic bezel and the Triplock triple waterproofness system hermetically sealed to 300 metres (1,000 feet).",
          action: watchCards.submariner
        };
      }

      // 2. Daytona / Chronograph / Racing / Motorsports / Speed / Tachymeter
      if (q.includes('daytona') || q.includes('chronograph') || q.includes('racing') || q.includes('motorsport') || q.includes('tachymeter') || q.includes('speed')) {
        return {
          text: "Born for speed and endurance on the Daytona International Speedway: the **Cosmograph Daytona** ($32,100). Forged from 18 ct yellow gold with a high-performance black Cerachrom tachymetric scale and powered by our in-house Calibre 4131 mechanical chronograph movement.",
          action: watchCards.daytona
        };
      }

      // 3. Datejust / Classic / Jubilee / Everyday / Dress
      if (q.includes('datejust') || q.includes('classic') || q.includes('everyday') || q.includes('jubilee') || q.includes('rolesor') || q.includes('36')) {
        return {
          text: "The pure definition of horological timelessness: the **Datejust 36** ($14,350). Cast in Yellow Rolesor (a harmonious marriage of resilient Oystersteel and pure 18 ct yellow gold), boasting the iconic fluted bezel, champagne sunray dial, and supple five-piece Jubilee bracelet.",
          action: watchCards.datejust
        };
      }

      // 4. Day-Date / President / Everose / Gold / Elite
      if (q.includes('day-date') || q.includes('daydate') || q.includes('president') || q.includes('everose') || q.includes('leaders')) {
        return {
          text: "Known universally as **The Presidents' Watch**: the **Day-Date 40** ($41,500). Exclusively sculpted in noble precious metals, this edition features patented 18 ct Everose gold, an olive green sunray dial, the full day-of-the-week spelled out at 12 o'clock, and the signature President bracelet.",
          action: watchCards.daydate
        };
      }

      // 5. GMT / Pepsi / Aviation / Pilot / Dual Time / Timezone
      if (q.includes('gmt') || q.includes('pepsi') || q.includes('aviation') || q.includes('pilot') || q.includes('flight') || q.includes('dual time') || q.includes('timezone') || q.includes('travel')) {
        return {
          text: "Engineered for international aviators and intercontinental travelers: the **GMT-Master II** ($11,100). Equipped with the renowned two-colour red and blue 'Pepsi' Cerachrom ceramic bezel and an independent 24-hour arrow hand to display two time zones simultaneously.",
          action: watchCards.gmt
        };
      }

      // 6. Yacht-Master / Sailing / Titanium / Regatta
      if (q.includes('yacht') || q.includes('regatta') || q.includes('sailing') || q.includes('boat') || q.includes('titanium') || q.includes('rlx')) {
        return {
          text: "Created for elite regatta navigators: the **Yacht-Master 42** ($14,050). Milled from lightweight, ultra-tough grade 5 **RLX titanium** with a satin finish, bidirectional matte black Cerachrom bezel with polished numerals, and high-contrast Chromalight display.",
          action: watchCards.yachtmaster
        };
      }

      // 7. Calibre / Movement / Mechanism / Escapement / Parachrom / Chronergy / Accuracy / Precision
      if (q.includes('calibre') || q.includes('caliber') || q.includes('movement') || q.includes('mechanism') || q.includes('escapement') || q.includes('parachrom') || q.includes('chronergy') || q.includes('accuracy') || q.includes('precision') || q.includes('reserve') || q.includes('3235') || q.includes('4131') || q.includes('3255') || q.includes('3285')) {
        return {
          text: "Every Rolex calibre is conceived, developed, and hand-regulated entirely in-house in Geneva:\n&bull; **Calibre 3235 & 3255**: Features our patented Chronergy escapement (paramagnetic nickel-phosphorus alloy with 15% higher energy efficiency) and blue Parachrom hairspring offering 10x greater shock resistance.\n&bull; **70-72 Hour Power Reserve**: Enjoy weekend autonomy from Friday evening through Monday morning.\n&bull; **Superlative Chronometer**: Regulated to -2/+2 seconds per day after casing — more than twice as stringent as official Swiss COSC standards.",
          action: `<button class="chat-action-btn" data-chat-scroll="craftsmanship">Inspect Geneva Engineering &rarr;</button>`
        };
      }

      // 8. Pricing / Price / Cost / Catalog / MSRP
      if (q.includes('price') || q.includes('cost') || q.includes('how much') || q.includes('worth') || q.includes('catalog') || q.includes('quote') || q.includes('rate')) {
        return {
          text: "Current official collection manufacturer suggested pricing:\n&bull; **Submariner Date** (41 mm, Oystersteel): **$10,250**\n&bull; **GMT-Master II** (40 mm, 'Pepsi' Bezel): **$11,100**\n&bull; **Yacht-Master 42** (42 mm, RLX Titanium): **$14,050**\n&bull; **Datejust 36** (Two-Tone Gold & Steel): **$14,350**\n&bull; **Cosmograph Daytona** (18 ct Gold): **$32,100**\n&bull; **Day-Date 40** (18 ct Everose Gold): **$41,500**\n\nAll timepieces carry our 5-year international warranty seal.",
          action: `<button class="chat-action-btn" data-chat-scroll="collection">Browse Collection Gallery &rarr;</button>`
        };
      }

      // 9. Appointment / Consultation / Book / Boutique / Jewelers / Availability / Buy / Waitlist
      if (q.includes('appointment') || q.includes('book') || q.includes('consultation') || q.includes('boutique') || q.includes('store') || q.includes('jeweler') || q.includes('buy') || q.includes('purchase') || q.includes('order') || q.includes('waitlist') || q.includes('allocation')) {
        return {
          text: "To experience a timepiece or discuss allocation priorities, we recommend reserving a private one-on-one consultation with an Official Rolex Jeweler.\n\nYou may submit your request directly via our private concierge form below, and a client advisor will contact you confidentially.",
          action: `<button class="chat-action-btn" data-chat-scroll="concierge">Reserve Private Appointment &rarr;</button>`
        };
      }

      // 10. Disassembly / Scroll / Animation / 3D / Background
      if (q.includes('scroll') || q.includes('disassembly') || q.includes('animation') || q.includes('background') || q.includes('3d') || q.includes('exploded') || q.includes('frames') || q.includes('render')) {
        return {
          text: "Our interactive digital experience renders an ultra-high-definition 300-frame horological disassembly directly behind this interface! As you scroll down the page, the Datejust 36 deconstructs into its balance wheel, mainspring barrel, train wheel bridge, and case architecture in synchronization with your scroll scrub.",
          action: null
        };
      }

      // 11. Materials / Steel / Gold / Ceramic / Titanium
      if (q.includes('material') || q.includes('steel') || q.includes('gold') || q.includes('ceramic') || q.includes('scratch') || q.includes('cerachrom') || q.includes('oystersteel')) {
        return {
          text: "Rolex is one of the rare manufactures to operate its own dedicated in-house foundry:\n&bull; **Oystersteel**: Specially developed 904L aerospace superalloy offering supreme sheen and corrosion resistance.\n&bull; **18 ct Everose Gold**: Patented alloy containing a touch of platinum to preserve its warm pink hue indefinitely.\n&bull; **Cerachrom Ceramic**: Diamond-hard ceramic that is virtually impervious to scratches, corrosion, and UV discoloration.",
          action: `<button class="chat-action-btn" data-chat-scroll="craftsmanship">View Material Innovations &rarr;</button>`
        };
      }

      // 12. Heritage / History / Hans Wilsdorf / Foundation
      if (q.includes('history') || q.includes('heritage') || q.includes('wilsdorf') || q.includes('founded') || q.includes('1905') || q.includes('geneva') || q.includes('switzerland') || q.includes('swiss')) {
        return {
          text: "Founded in 1905 by visionary Hans Wilsdorf, Rolex has pioneered modern watchmaking for over a century:\n&bull; **1926**: The first waterproof wristwatch, the legendary 'Oyster'.\n&bull; **1931**: The patented Perpetual rotor self-winding mechanism.\n&bull; **1945**: The Datejust, first self-winding chronometer with date window.\n&bull; **1953**: The Submariner, first diver's watch waterproof to 100 metres.",
          action: null
        };
      }

      // 13. Greetings
      if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('good day') || q.includes('good morning') || q.includes('good afternoon') || q.includes('greetings')) {
        return {
          text: "Greetings. It is an honor to welcome you to Rolex. Would you like a personalized recommendation for professional sports timepieces, our classic dress collection, or technical calibre insights?",
          action: null
        };
      }

      // 14. Thank you
      if (q.includes('thank') || q.includes('thanks') || q.includes('merci') || q.includes('danke')) {
        return {
          text: "You are most cordially welcome. It is our pleasure to assist. Please let us know whenever you wish to explore further or schedule an appointment at an Official Rolex Jeweler.",
          action: null
        };
      }

      // Default Luxury Fallback
      return {
        text: "Rolex timepieces represent the pinnacle of Swiss precision, endurance, and timeless aesthetics. How may I assist your exploration? You may ask regarding our professional models (Submariner, Daytona, GMT-Master II), classic icons (Datejust, Day-Date), movement specifications, or arranging a boutique consultation.",
        action: `<button class="chat-action-btn" data-chat-scroll="collection">Explore All Models &rarr;</button>`
      };
    }

    // --- 10. Handle Form Submission ---
    if (form && input) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const userText = input.value.trim();
        if (!userText) return;

        appendMessage(userText, true);
        input.value = '';

        const reply = getBotResponse(userText);
        sendBotMessage(reply.text, reply.action);
      });
    }

    // --- 11. Handle Prompt Chips ---
    if (chipsContainer) {
      chipsContainer.querySelectorAll('.chat-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const query = chip.getAttribute('data-query');
          if (!query) return;

          appendMessage(query, true);
          const reply = getBotResponse(query);
          sendBotMessage(reply.text, reply.action);
        });
      });
    }
  }

  // --- Initialize Immediately on DOMContentLoaded ---
  document.addEventListener('DOMContentLoaded', () => {
    setupCanvasDimensions();
    preloadFrames();
    setupInteractions();
    setupChatbot();
  });

})();

