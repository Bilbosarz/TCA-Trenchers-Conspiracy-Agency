// Lightweight interactive behaviors for the TCA site.
// - Injects floating lizards in hero
// - Gallery arrow control and touch dragging
// - Tiny motion preferences handling

(function(){
  const floatingArea = document.getElementById('floating-area');

  // Names of assets (ensure these files exist in assets/)
  const lizards = [
    'assets/1lizard.png',
    'assets/2lizard.png',
    'assets/3lizard.png',
    'assets/4lizard.png',
    'assets/5lizard.png'
  ];

  // Respect reduced motion preference
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Create a few floating elements
  function createFloating(){
    const count = 6;
    for(let i=0;i<count;i++){
      const el = document.createElement('img');
      el.src = lizards[i % lizards.length];
      el.className = 'floating-lizard';
      el.style.position = 'absolute';
      el.style.width = `${80 + Math.round(Math.random()*80)}px`;
      el.style.left = Math.round(Math.random()*100) + '%';
      el.style.top = Math.round(Math.random()*60) + '%';
      el.style.opacity = 0.95 - Math.random()*0.35;
      el.style.transform = `translateY(0) rotate(${(Math.random()*40)-20}deg)`;
      el.style.pointerEvents = 'none';
      // random animation duration and delay
      const dur = 8 + Math.random()*8;
      const delay = Math.random()*4;
      el.style.animation = prefersReduced ? 'none' : `floatHero ${dur}s ease-in-out ${delay}s infinite`;
      floatingArea.appendChild(el);
    }
  }

  // Add CSS for floating animations (dynamically, so we don't bloat the stylesheet)
  const style = document.createElement('style');
  style.textContent = `
  @keyframes floatHero {
    0%{ transform: translateY(0) rotate(-4deg); }
    50%{ transform: translateY(-28px) rotate(4deg); }
    100%{ transform: translateY(0) rotate(-4deg); }
  }
  .floating-lizard{ will-change: transform; filter: drop-shadow(0 12px 18px rgba(0,0,0,0.10)); border-radius:12px; }
  `;
  document.head.appendChild(style);

  // Gallery controls
  const gallery = document.getElementById('gallery');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  function scrollGalleryBy(offset){
    gallery.scrollBy({ left: offset, behavior: 'smooth' });
  }

  if(prevBtn && nextBtn){
    prevBtn.addEventListener('click', ()=> scrollGalleryBy(-300));
    nextBtn.addEventListener('click', ()=> scrollGalleryBy(300));
  }

  // Touch / drag support for gallery
  (function enableDrag(g){
    let isDown=false, startX, scrollLeft;
    g.addEventListener('pointerdown', (e)=>{
      isDown=true;
      g.setPointerCapture(e.pointerId);
      startX = e.clientX;
      scrollLeft = g.scrollLeft;
      g.style.cursor = 'grabbing';
    });
    g.addEventListener('pointermove', (e)=>{
      if(!isDown) return;
      const dx = e.clientX - startX;
      g.scrollLeft = scrollLeft - dx;
    });
    g.addEventListener('pointerup', (e)=>{
      isDown=false;
      g.style.cursor='';
      try{ g.releasePointerCapture(e.pointerId); }catch(_){}
    });
    g.addEventListener('pointerleave', ()=> { isDown=false; g.style.cursor=''; });
  })(gallery);

  // Create floating elements if not reduced motion
  if(!prefersReduced){
    createFloating();
  }

  // Small accessibility: reduce animation if user prefers reduced motion
  if(prefersReduced){
    document.documentElement.classList.add('reduced-motion');
  }

  // Minor: lazy-load gallery images for perf
  document.querySelectorAll('.gallery img').forEach(img=>{
    img.loading = 'lazy';
  });

})();
