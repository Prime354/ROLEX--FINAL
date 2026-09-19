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
  // ROLEX VIRTUAL CONCIERGE CHATBOT MODULE
  // ==========================================================================
  function setupChatbot() {
    const toggleBtn = document.getElementById('chatbot-toggle-btn');
    const widget = document.getElementById('chatbot-widget');
    const closeBtn = document.getElementById('chatbot-close-btn');
    const messagesContainer = document.getElementById('chatbot-messages');
    const form = document.getElementById('chatbot-form');
    const input = document.getElementById('chatbot-input');
    const chipsContainer = document.getElementById('chatbot-chips');

    if (!toggleBtn || !widget || !messagesContainer) return;

    let hasGreeted = false;

    function formatTime() {
      const now = new Date();
      return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function toggleChat(open) {
      const isOpen = open !== undefined ? open : !widget.classList.contains('open');
      if (isOpen) {
        widget.classList.add('open');
        widget.setAttribute('aria-hidden', 'false');
        if (!hasGreeted) {
          sendBotMessage(
            "Good day. Welcome to the official Rolex Virtual Concierge. It is my distinct privilege to assist you with our horological collections, technical movements, or reserving a private consultation.\n\nHow may I advise your exploration today?"
          );
          hasGreeted = true;
        }
        if (input) input.focus();
      } else {
        widget.classList.remove('open');
        widget.setAttribute('aria-hidden', 'true');
      }
    }

    toggleBtn.addEventListener('click', () => toggleChat());
    if (closeBtn) closeBtn.addEventListener('click', () => toggleChat(false));

    function appendMessage(text, isUser, actionHtml) {
      const msgWrapper = document.createElement('div');
      msgWrapper.className = `chat-msg ${isUser ? 'chat-msg-user' : 'chat-msg-bot'}`;

      const bubble = document.createElement('div');
      bubble.className = isUser ? 'chat-bubble-user' : 'chat-bubble-bot';
      bubble.innerHTML = text.replace(/\n/g, '<br>');

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
              toggleChat(false);
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
    }

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

    function getBotResponse(userText) {
      const q = userText.toLowerCase();

      // 1. Diver / Submariner / Underwater
      if (q.includes('submariner') || q.includes('diver') || q.includes('diving') || q.includes('waterproof') || q.includes('sea')) {
        return {
          text: "The quintessential divers' instrument is the **Submariner Date** ($10,250). Forged from aerospace-grade Oystersteel with an impervious 300 metres (1,000 ft) water resistance, a unidirectional Cerachrom ceramic bezel with 60-minute graduations, and high-legibility Chromalight luminescence.",
          action: `<button class="chat-action-btn" data-chat-spec="submariner-date">Inspect Submariner Specs &rarr;</button>`
        };
      }

      // 2. Daytona / Chronograph / Racing / Speed
      if (q.includes('daytona') || q.includes('chronograph') || q.includes('racing') || q.includes('tachymeter')) {
        return {
          text: "Born for motorsport champions, the **Cosmograph Daytona** ($32,100) is forged from 18 ct yellow gold with a high-tech black Cerachrom tachymetric bezel. Powered by the in-house Calibre 4131 chronograph movement with a 72-hour power reserve.",
          action: `<button class="chat-action-btn" data-chat-spec="daytona">Inspect Daytona Specs &rarr;</button>`
        };
      }

      // 3. Datejust / Classic / Jubilee / Everyday
      if (q.includes('datejust') || q.includes('classic') || q.includes('36')) {
        return {
          text: "The **Datejust 36** ($14,350) represents the benchmark of classic horology. Crafted in Yellow Rolesor (Oystersteel and 18 ct yellow gold) with a fluted bezel, champagne sunray dial, comfortable Jubilee bracelet, and the self-winding Calibre 3235 with 70 hours of autonomy.",
          action: `<button class="chat-action-btn" data-chat-spec="datejust-36">Inspect Datejust Specs &rarr;</button>`
        };
      }

      // 4. Day-Date / Presidents / Everose / Gold
      if (q.includes('day-date') || q.includes('daydate') || q.includes('president') || q.includes('everose')) {
        return {
          text: "Renowned as 'The Presidents' Watch', the **Day-Date 40** ($41,500) is cast exclusively in precious metals. Presented in 18 ct Everose gold with an olive green dial and the iconic semi-circular three-piece President bracelet.",
          action: `<button class="chat-action-btn" data-chat-spec="day-date-40">Inspect Day-Date Specs &rarr;</button>`
        };
      }

      // 5. GMT / Pepsi / Aviation / Travel / Dual Time
      if (q.includes('gmt') || q.includes('pepsi') || q.includes('aviation') || q.includes('travel') || q.includes('dual time') || q.includes('timezone')) {
        return {
          text: "Designed for international globetrotters, the **GMT-Master II** ($11,100) boasts the celebrated red and blue 'Pepsi' Cerachrom ceramic bezel. It reads two distinct timezones simultaneously driven by Calibre 3285.",
          action: `<button class="chat-action-btn" data-chat-spec="gmt-master-ii">Inspect GMT-Master Specs &rarr;</button>`
        };
      }

      // 6. Yacht-Master / Titanium
      if (q.includes('yacht') || q.includes('titanium') || q.includes('rlx')) {
        return {
          text: "Engineered for sailing navigators, the **Yacht-Master 42** ($14,050) is sculpted from aerospace-grade RLX titanium (grade 5 alloy), featuring a bidirectional matte black ceramic bezel with polished raised numerals.",
          action: `<button class="chat-action-btn" data-chat-spec="yacht-master-42">Inspect Yacht-Master Specs &rarr;</button>`
        };
      }

      // 7. Calibre / Movement / Mechanism / Escapement / Parachrom
      if (q.includes('calibre') || q.includes('movement') || q.includes('mechanism') || q.includes('chronergy') || q.includes('parachrom') || q.includes('accuracy') || q.includes('precision') || q.includes('reserve')) {
        return {
          text: "Rolex movements are developed and assembled entirely in-house in Geneva. The new-generation **Calibre 3235** features our patented Chronergy escapement (high energy efficiency, paramagnetic nickel-phosphorus), blue Parachrom hairspring (10x more resistant to shocks), and provides ~70 hours of autonomy with Superlative Chronometer accuracy (-2/+2 sec/day).",
          action: `<button class="chat-action-btn" data-chat-scroll="craftsmanship">View Engineering Grid &rarr;</button>`
        };
      }

      // 8. Pricing / Cost / How much
      if (q.includes('price') || q.includes('cost') || q.includes('how much') || q.includes('worth') || q.includes('quote')) {
        return {
          text: "Current official collection pricing:\n&bull; Submariner Date: **$10,250**\n&bull; GMT-Master II: **$11,100**\n&bull; Yacht-Master 42 (RLX Titanium): **$14,050**\n&bull; Datejust 36 (Two-Tone Gold): **$14,350**\n&bull; Cosmograph Daytona: **$32,100**\n&bull; Day-Date 40 (Everose Gold): **$41,500**",
          action: `<button class="chat-action-btn" data-chat-scroll="collection">Browse Timepieces &rarr;</button>`
        };
      }

      // 9. Appointment / Consultation / Book / Viewing / Boutique / Buy
      if (q.includes('appointment') || q.includes('book') || q.includes('consultation') || q.includes('viewing') || q.includes('boutique') || q.includes('jeweler') || q.includes('buy') || q.includes('purchase')) {
        return {
          text: "We would be honored to arrange an exclusive private consultation at an Official Rolex Jeweler for you. You may submit your contact information in our VIP Concierge reservation form.",
          action: `<button class="chat-action-btn" data-chat-scroll="concierge">Book Appointment &rarr;</button>`
        };
      }

      // 10. Animation / Scroll / Disassembly / 3D
      if (q.includes('scroll') || q.includes('disassembly') || q.includes('animation') || q.includes('background') || q.includes('3d') || q.includes('frames')) {
        return {
          text: "Our interactive website renders a continuous 300-frame horological deconstruction directly behind the content! As you scroll from the top to the bottom, the Datejust 36 deconstructs into individual mechanical components and reassembles fluidly.",
          action: null
        };
      }

      // 11. Materials / Steel / Gold / Ceramic
      if (q.includes('material') || q.includes('steel') || q.includes('gold') || q.includes('ceramic') || q.includes('scratch')) {
        return {
          text: "Rolex operates its own exclusive foundry, engineering proprietary alloys: **Oystersteel** (904L aerospace grade with supreme corrosion resistance), **18 ct Everose Gold** (patented formula resisting chlorine and UV discoloration), and **Cerachrom** (high-tech ceramic virtually impossible to scratch).",
          action: null
        };
      }

      // 12. Greetings
      if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('good morning') || q.includes('good afternoon') || q.includes('greetings')) {
        return {
          text: "Greetings. It is our absolute pleasure to welcome you. Would you like a recommendation on our professional timepieces, technical calibre specifications, or boutique availability?",
          action: null
        };
      }

      // Default Luxury Fallback
      return {
        text: "Rolex watches are crafted with uncompromised precision and tested to the highest standards of Swiss watchmaking. How may I assist your inquiry? You may ask about our collections (Submariner, Daytona, Datejust, Day-Date, GMT-Master), our in-house calibres, or booking an appointment.",
        action: `<button class="chat-action-btn" data-chat-scroll="collection">Explore Collection &rarr;</button>`
      };
    }

    // Handle form submit
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

    // Handle quick suggestion chips
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

