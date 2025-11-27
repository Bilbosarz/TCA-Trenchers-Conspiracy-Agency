// Simple infinite carousel that shows 2 slides on desktop and 1 on narrow screens.
// Assumes .carousel-track contains the original slides (not duplicated).
(function () {
  const track = document.getElementById('carousel-track');
  if (!track) return;

  let slides = Array.from(track.children);
  let slideCount = slides.length;
  let index = 0;
  let slideWidth = 0;
  let slidesToShow = getSlidesToShow();
  let animating = false;
  let interval = null;
  const GAP = 16; // px, matches CSS gap

  // Clone slides at end for smooth infinite loop (clone all original slides)
  function setupClones() {
    // remove existing clones if any
    track.querySelectorAll('.clone').forEach(n => n.remove());
    slides.forEach((s) => {
      const clone = s.cloneNode(true);
      clone.classList.add('clone');
      track.appendChild(clone);
    });
  }

  function getSlidesToShow() {
    return window.innerWidth <= 700 ? 1 : 2;
  }

  function calculateSizes() {
    slidesToShow = getSlidesToShow();
    const viewport = track.parentElement;
    const viewportWidth = viewport.clientWidth;
    // slide width = (viewportWidth - totalGap) / slidesToShow
    const totalGap = GAP * (slidesToShow - 1);
    slideWidth = (viewportWidth - totalGap) / slidesToShow;
    // apply widths to all slides including clones
    Array.from(track.children).forEach(slide => {
      slide.style.flex = `0 0 ${Math.round(slideWidth)}px`;
    });
  }

  function setPosition(instant = false) {
    const offset = -index * (slideWidth + GAP);
    if (instant) {
      track.style.transition = 'none';
    } else {
      track.style.transition = 'transform 520ms cubic-bezier(.2,.9,.2,1)';
    }
    track.style.transform = `translateX(${offset}px)`;
    if (instant) {
      // allow the browser to render immediately then re-enable transition
      requestAnimationFrame(() => {
        track.style.transition = '';
      });
    }
  }

  function moveToNext() {
    if (animating) return;
    animating = true;
    index++;
    setPosition();
  }

  function startAuto() {
    stopAuto();
    interval = setInterval(() => {
      moveToNext();
    }, 3000);
  }
  function stopAuto() {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  }

  // handle transition end for infinite looping
  track.addEventListener('transitionend', () => {
    animating = false;
    // If we've moved into the cloned region, jump back to the equivalent original
    if (index >= slideCount) {
      index = index - slideCount;
      setPosition(true); // jump instantly
    }
  });

  // Pause on hover/touch
  const carousel = document.getElementById('carousel');
  carousel.addEventListener('mouseenter', stopAuto);
  carousel.addEventListener('mouseleave', startAuto);
  carousel.addEventListener('touchstart', stopAuto, {passive:true});
  carousel.addEventListener('touchend', startAuto, {passive:true});

  // Handle resize
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const newShow = getSlidesToShow();
      // if slidesToShow changed (mobile <-> desktop) we need to re-calc and reset
      if (newShow !== slidesToShow) {
        init(true);
      } else {
        calculateSizes();
        setPosition(true);
      }
    }, 120);
  });

  function init(force=false) {
    // only initialize once or when forced (on breakpoint change)
    if (!force && track.dataset.initialized === 'true') return;
    // reset any inline transforms
    track.style.transition = '';
    track.style.transform = '';
    // rebuild slides refs
    slides = Array.from(track.querySelectorAll(':not(.clone)'));
    slideCount = slides.length;
    // remove existing clones then create clones
    setupClones();
    calculateSizes();
    // start at beginning
    index = 0;
    setPosition(true);
    track.dataset.initialized = 'true';
    startAuto();
  }

  // Allow gentle swipe left/right to advance
  let startX = 0;
  let isDragging = false;
  track.addEventListener('pointerdown', (e) => {
    isDragging = true;
    startX = e.clientX;
    track.style.transition = 'none';
    stopAuto();
    track.setPointerCapture(e.pointerId);
  });
  track.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    track.style.transform = `translateX(${ -index * (slideWidth + GAP) + dx }px)`;
  });
  track.addEventListener('pointerup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    const dx = e.clientX - startX;
    track.style.transition = '';
    // threshold
    if (dx < -40) {
      moveToNext();
    } else if (dx > 40) {
      // move to previous
      if (index === 0) {
        // jump to clones end equivalent first
        index = slideCount;
        setPosition(true);
      }
      index = Math.max(0, index - 1);
      setPosition();
    } else {
      setPosition();
    }
    startAuto();
  });

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', init);
})();
