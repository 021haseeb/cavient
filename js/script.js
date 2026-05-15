/*
  Premium SaaS homepage interactions:
  - Preloader fade-out
  - Sticky header blur on scroll
  - Mobile menu slide animation
  - GSAP: entrance animations + device parallax + floating mini-cards
  - AOS: scroll reveal
  - Animated counters
  - Hero particles + subtle mouse parallax
  - Button ripple micro-interaction
*/

(function(){
  const $ = (sel, root=document)=>root.querySelector(sel);
  const $$ = (sel, root=document)=>Array.from(root.querySelectorAll(sel));

  // ---------------- Preloader ----------------
  const preloader = $('.preloader');
  window.addEventListener('load', ()=>{
    if(!preloader) return;
    preloader.classList.add('preloader--hide');
    // Remove from DOM after transition
    setTimeout(()=>{ preloader?.remove(); }, 600);
  });

  // ---------------- Header sticky effect ----------------
  const header = document.querySelector('[data-scroll-header]');
  const onScroll = ()=>{
    if(!header) return;
    header.classList.toggle('site-header--scrolled', window.scrollY > 8);
  };
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  // ---------------- Mobile hamburger + mobile dropdowns ----------------
  const hamburger = $('[data-hamburger]');
  const mobileMenu = $('[data-mobile-menu]');
  if(hamburger && mobileMenu){
    const setOpen = (open)=>{
      hamburger.setAttribute('aria-expanded', String(open));
      mobileMenu.classList.toggle('mobile-menu--open', open);
    };
    hamburger.addEventListener('click', ()=>{
      const open = hamburger.getAttribute('aria-expanded') !== 'true';
      setOpen(open);
    });

    // Mobile dropdown toggles
    const mobileTriggers = $$('[data-mobile-dd-trigger]', mobileMenu);
    mobileTriggers.forEach(btn=>{
      const key = btn.getAttribute('data-mobile-dd-trigger');
      const menu = $(`[data-mobile-dd-menu="${key}"]`, mobileMenu);
      if(!menu) return;

      btn.addEventListener('click', ()=>{
        const open = btn.getAttribute('aria-expanded') !== 'true';
        btn.setAttribute('aria-expanded', String(open));
        menu.hidden = !open;
      });
    });

    // Close menu when selecting an item
    $$('a', mobileMenu).forEach(a=>{
      a.addEventListener('click', ()=>setOpen(false));
    });

    // Close when resizing to desktop
    window.addEventListener('resize', ()=>{
      if(window.innerWidth > 860) setOpen(false);
    });
  }

  // ---------------- Desktop navbar dropdowns ----------------
  const ddWrappers = $$('.nav-dd');
  const openDD = (key)=>{
    ddWrappers.forEach(w=>{
      const isThis = w.getAttribute('data-dd') === key;
      w.dataset.open = isThis ? 'true' : 'false';
      const trigger = w.querySelector('[data-dd-trigger]');
      if(trigger) trigger.setAttribute('aria-expanded', isThis ? 'true' : 'false');
    });
  };
  const closeAllDD = ()=>{
    ddWrappers.forEach(w=>{
      w.dataset.open = 'false';
      const trigger = w.querySelector('[data-dd-trigger]');
      if(trigger) trigger.setAttribute('aria-expanded','false');
    });
  };

  ddWrappers.forEach(w=>{
    const key = w.getAttribute('data-dd');
    const trigger = w.querySelector('[data-dd-trigger]');
    if(!trigger) return;

    trigger.addEventListener('click', (e)=>{
      e.stopPropagation();
      const isOpen = w.dataset.open === 'true';
      if(isOpen) closeAllDD();
      else openDD(key);
    });

    // close after selection
    $$('.nav-dd__item', w).forEach(item=>{
      item.addEventListener('click', ()=>closeAllDD());
    });
  });


  document.addEventListener('click', closeAllDD);
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape') closeAllDD();
  });

  // ---------------- Service card expandable “Learn More” ----------------
  const serviceMoreToggles = $$('[data-service-more]');
  serviceMoreToggles.forEach(toggle=>{
    const card = toggle.closest('.service-card');
    if(!card) return;
    const more = card.querySelector('.service-card__more');
    if(!more) return;

    const setExpanded = (open)=>{
      toggle.setAttribute('aria-expanded', String(open));
      more.hidden = !open;
    };

    // Initialize
    setExpanded(false);

    toggle.addEventListener('click', (e)=>{
      e.preventDefault();
      e.stopPropagation();
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      setExpanded(!isOpen);
    });
  });

  // ---------------- Video modal (Watch Platform Overview) ----------------
  const videoTriggers = $$('[data-video-trigger]');
  if(videoTriggers.length){
    const modal = document.querySelector('#platform-video');
    const videoEl = modal ? modal.querySelector('video') : null;

    const openModal = ()=>{
      if(!modal) return;
      modal.setAttribute('aria-hidden','false');
      modal.dataset.open = 'true';
      // Let modal render before play
      if(videoEl){
        videoEl.currentTime = 0;
        videoEl.play().catch(()=>{});
      }
    };

    const closeModal = ()=>{
      if(!modal) return;
      modal.setAttribute('aria-hidden','true');
      modal.dataset.open = 'false';
      if(videoEl){
        videoEl.pause();
      }
    };

    videoTriggers.forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        e.preventDefault();
        e.stopPropagation();
        openModal();
      });
    });

    $$('#platform-video [data-video-close]').forEach(el=>{
      el.addEventListener('click', (e)=>{
        e.preventDefault();
        e.stopPropagation();
        closeModal();
      });
    });

    document.addEventListener('keydown', (e)=>{
      if(e.key === 'Escape') closeModal();
    });
  }

  // ---------------- Ripple ----------------


  $$('.btn[data-ripple]').forEach(btn=>{
    btn.addEventListener('pointerdown', (e)=>{
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      btn.style.setProperty('--rx', x + 'px');
      btn.style.setProperty('--ry', y + 'px');
      btn.classList.remove('ripple-animate');
      // force reflow
      void btn.offsetWidth;
      btn.classList.add('ripple-animate');
      setTimeout(()=>btn.classList.remove('ripple-animate'), 650);
    });
  });

  // ---------------- AOS init ----------------
  if(window.AOS){
    AOS.init({
      once:true,
      mirror:false,
      duration:900,
      easing:'ease-out-cubic'
    });
  }

  // ---------------- Counters ----------------
  const counterTargets = $$('.stat-card [data-counter], [data-counter]', document);
  const counterEls = [];

  // map name -> end value & suffix behavior
  const counterConfig = {
    activeTeams: {end: 1280, format:'compact'},
    engagement: {end: 98, suffix:'%', format:'int'},
    completion: {end: 82, suffix:'%', format:'int'},
    vitals: {end: 124, format:'int'},
    insights: {end: 38, format:'int'},
    workflows: {end: 40, suffix:'+', format:'int'},
    orgs: {end: 1500, format:'compact'},
    employees: {end: 200000, format:'compact'},
    patients: {end: 2000000, format:'compact'},
    satisfaction: {end: 98, suffix:'%', format:'int'}
  };

  function formatCompact(n){
    if(n >= 1_000_000) return (n/1_000_000).toFixed(n%1_000_000===0?0:1) + 'M';
    if(n >= 1_000) return (n/1_000).toFixed(n%1_000===0?0:1) + 'K';
    return String(n);
  }

  function animateCounter(el, key){
    const cfg = counterConfig[key];
    if(!cfg) return;

    // Progress bar handling
    const isProgressFill = el.classList.contains('progress__fill');

    const end = cfg.end;
    const suffix = cfg.suffix ?? '';
    const format = cfg.format ?? 'int';

    const start = 0;
    const duration = 1100;
    const startTime = performance.now();

    const tick = (now)=>{
      const t = Math.min(1, (now - startTime) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(start + (end - start) * eased);

      if(isProgressFill){
        const p = Math.max(0, Math.min(100, value));
        el.style.width = p + '%';
        return (t < 1) ? requestAnimationFrame(tick) : undefined;
      }

      if(format === 'compact'){
        el.textContent = formatCompact(value) + (suffix || '');
      } else {
        el.textContent = value + suffix;
      }

      if(t < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  // Use IntersectionObserver to start when visible
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting) return;
      const el = entry.target;
      const key = el.getAttribute('data-counter');
      if(!key) return;
      io.unobserve(el);
      animateCounter(el, key);
    });
  }, {threshold:0.35});

  counterEls.push(...counterTargets);
  counterEls.forEach(el=>io.observe(el));

  // ---------------- GSAP animations ----------------
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if(gsap && ScrollTrigger){
    gsap.registerPlugin(ScrollTrigger);

    // Entrance: hero content + devices
    gsap.from('.hero__content > *', {
      y: 18,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.08
    });

    // Floating devices (photo-based)
    gsap.to('.device--laptop', {
      y: -10,
      x: 4,
      duration: 3.6,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true
    });
    gsap.to('.device--phone', {
      y: -14,
      x: -6,
      duration: 3.2,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true
    });

    gsap.to('.mini-float--1', { y: -14, duration: 3.8, ease:'sine.inOut', repeat:-1, yoyo:true });
    gsap.to('.mini-float--2', { y: -10, duration: 3.4, ease:'sine.inOut', repeat:-1, yoyo:true });
    gsap.to('.mini-float--3', { y: -12, duration: 4.2, ease:'sine.inOut', repeat:-1, yoyo:true });

    // subtle scroll parallax for device stack
    gsap.to('.device-stack', {
      y: 18,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });

    // reveal cards on scroll (fallback if AOS disabled)
    $$('.feature-card, .service-card, .stat-card').forEach((card)=>{
      gsap.from(card, {
        y: 14,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%'
        }
      });
    });
  }

  // ---------------- Mouse parallax ----------------
  const visual = $('[data-tilt-parallax]');
  if(visual && gsap){
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSmallScreen = window.matchMedia('(max-width: 768px)').matches;
    if(!prefersReduced && !isSmallScreen){
      const laptop = $('.device--laptop');
      const phone = $('.device--phone');

      window.addEventListener('mousemove', (e)=>{

        const rect = visual.getBoundingClientRect();
        const cx = rect.left + rect.width/2;
        const cy = rect.top + rect.height/2;
        const dx = (e.clientX - cx) / rect.width;
        const dy = (e.clientY - cy) / rect.height;

        const rotY = dx * 10;
        const rotX = -dy * 8;
        gsap.to(laptop, {rotationY: rotY, rotationX: rotX, duration: 0.35, ease:'power2.out'});
        gsap.to(phone, {rotationY: rotY*0.7, rotationX: rotX*0.7, x: dx*10, y: dy*10, duration: 0.35, ease:'power2.out'});
      }, {passive:true});
    }
  }

  // ---------------- Hero particles ----------------
  // const particlesHost = $('.hero__particles');
  // if(particlesHost){
  //   const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  //   if(!prefersReduced){
  //     const count = Math.min(42, Math.floor(window.innerWidth / 24));
  //     for(let i=0;i<count;i++){
  //       const p = document.createElement('span');
  //       p.className = 'hero-particle';
  //       const x = Math.random()*100;
  //       const y = Math.random()*100;
  //       const s = 2 + Math.random()*3;
  //       const d = 2 + Math.random()*6;
  //       const o = 0.25 + Math.random()*0.55;
  //       p.style.left = x + '%';
  //       p.style.top = y + '%';
  //       p.style.width = s + 'px';
  //       p.style.height = s + 'px';
  //       p.style.opacity = o;
  //       p.style.setProperty('--dur', d + 's');
  //       p.style.setProperty('--delay', (Math.random()*1.5) + 's');
  //       particlesHost.appendChild(p);
  //     }

  //     const style = document.createElement('style');
  //     style.textContent = `
  //       .hero-particle{position:absolute; border-radius:999px; background:linear-gradient(180deg, rgba(29,78,216,.95), rgba(124,58,237,.7));
  //         box-shadow:0 0 22px rgba(37,99,235,.35);
  //         animation:particleFloat var(--dur) ease-in-out infinite; transform:translateZ(0);
  //       }
  //       @keyframes particleFloat{
  //         0%,100%{transform:translateY(0) translateX(0) scale(1)}
  //         50%{transform:translateY(-18px) translateX(10px) scale(1.15)}
  //       }
  //     `;
  //     document.head.appendChild(style);

  //     // Slow drift with GSAP if available
  //     if(gsap){
  //       gsap.to(particlesHost, {opacity: 1, duration: 1});
  //     }
  //   }
  // }

  // ---------------- Year ----------------
  const year = $('#year');
  if(year) year.textContent = String(new Date().getFullYear());
})();

