document.addEventListener('DOMContentLoaded', () => {
  // --- 1. PRELOADER TERMINAL BOOT SEQUENCE ---
  const preloader = document.getElementById('preloader');
  const progressFill = document.querySelector('.loader-progress-fill');
  const lines = document.querySelectorAll('.loader-line');
  
  let currentLine = 0;
  const bootTimeline = gsap.timeline({
    onComplete: () => {
      // Fade out preloader
      gsap.to(preloader, {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        onComplete: () => {
          preloader.style.display = 'none';
          // Trigger Hero entry animations once loader completes
          triggerHeroAnimations();
        }
      });
    }
  });

  // Animate terminal lines and progress bar
  lines.forEach((line, index) => {
    bootTimeline.to(line, {
      opacity: 1,
      y: 0,
      duration: 0.15,
      ease: 'power1.out'
    }, index * 0.22);
  });

  bootTimeline.to(progressFill, {
    width: '100%',
    duration: 1.5,
    ease: 'power2.inOut'
  }, 0.2);


  // --- 2. THEME ENGINE: DARK & LIGHT HOLOGRAPHIC MODE ---
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeIconSun = document.getElementById('theme-icon-sun');
  const themeIconMoon = document.getElementById('theme-icon-moon');

  // Check saved preference
  const savedTheme = localStorage.getItem('portfolio-theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    themeIconMoon.classList.remove('hidden');
    themeIconSun.classList.add('hidden');
  } else {
    document.body.classList.remove('light-theme');
    themeIconSun.classList.remove('hidden');
    themeIconMoon.classList.add('hidden');
  }

  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    
    // Toggle icons
    if (isLight) {
      themeIconSun.classList.add('hidden');
      themeIconMoon.classList.remove('hidden');
      localStorage.setItem('portfolio-theme', 'light');
    } else {
      themeIconMoon.classList.add('hidden');
      themeIconSun.classList.remove('hidden');
      localStorage.setItem('portfolio-theme', 'dark');
    }

    // Refresh particle colors instantly
    particles.forEach(p => p.updateColor());
  });


  // --- 3. CUSTOM CURSOR GLOW ENGINE ---
  const cursorDot = document.querySelector('.custom-cursor');
  const cursorGlow = document.querySelector('.custom-cursor-glow');

  window.addEventListener('mousemove', (e) => {
    // Immediate dot movement
    cursorDot.style.left = e.clientX + 'px';
    cursorDot.style.top = e.clientY + 'px';

    // Delayed smooth glow movement using GSAP
    gsap.to(cursorGlow, {
      left: e.clientX,
      top: e.clientY,
      duration: 0.12,
      ease: 'power2.out'
    });
  });

  // Track hover states for links and interactive elements
  function initCursorHovers() {
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, .glass-card, .clickable');
    interactiveElements.forEach(el => {
      // Clean up previous event listeners to avoid duplicates
      el.removeEventListener('mouseenter', addCursorHover);
      el.removeEventListener('mouseleave', removeCursorHover);
      el.addEventListener('mouseenter', addCursorHover);
      el.addEventListener('mouseleave', removeCursorHover);
    });
  }

  function addCursorHover() {
    document.body.classList.add('hovering-link');
  }

  function removeCursorHover() {
    document.body.classList.remove('hovering-link');
  }

  initCursorHovers();


  // --- 4. INTERACTIVE SPOTLIGHT GLOW ON GLASS CARDS ---
  const glassCards = document.querySelectorAll('.glass-card');
  glassCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // x position within the element.
      const y = e.clientY - rect.top;  // y position within the element.
      card.style.setProperty('--cursor-x', `${x}px`);
      card.style.setProperty('--cursor-y', `${y}px`);
    });
  });


  // --- 5. DYNAMIC CANVAS NEON PARTICLES ---
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const maxParticles = Math.min(60, Math.floor((width * height) / 25000)); // Responsive count

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.size = Math.random() * 2 + 1;
      this.alpha = Math.random() * 0.5 + 0.2;
      this.updateColor();
    }

    updateColor() {
      const isLight = document.body.classList.contains('light-theme');
      if (isLight) {
        this.color = Math.random() > 0.5 ? '#0088cc' : '#9900cc';
      } else {
        this.color = Math.random() > 0.5 ? '#00f0ff' : '#bd00ff';
      }
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.shadowBlur = document.body.classList.contains('light-theme') ? 2 : 10;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.shadowBlur = 0; // Reset
    }
  }

  // Populate particles
  for (let i = 0; i < maxParticles; i++) {
    particles.push(new Particle());
  }

  function animateParticles() {
    ctx.clearRect(0, 0, width, height);

    // Update and draw particles
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    // Draw connecting lines
    ctx.globalAlpha = 0.08;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          // Interpolate line color
          const grad = ctx.createLinearGradient(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
          grad.addColorStop(0, particles[i].color);
          grad.addColorStop(1, particles[j].color);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animateParticles);
  }
  animateParticles();


  // --- 6. FUTURISTIC TYPING ANIMATION ENGINE ---
  const typingElement = document.getElementById('typing-text');
  const roles = [
    'ECE Student',
    'Tech Enthusiast',
    'Developer'
  ];
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;

  function typeEffect() {
    const currentRole = roles[roleIndex];
    if (isDeleting) {
      // Deleting characters
      typingElement.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50;
    } else {
      // Adding characters
      typingElement.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 120;
    }

    // State change checks
    if (!isDeleting && charIndex === currentRole.length) {
      isDeleting = true;
      typingSpeed = 1800; // Display wait time
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typingSpeed = 400; // Pause before typing next role
    }

    setTimeout(typeEffect, typingSpeed);
  }
  
  // Start typing slightly after preloader hides
  setTimeout(typeEffect, 2500);


  // --- 7. VIEWPORT INTERSECTION NUMERIC COUNTERS ---
  const statsElements = document.querySelectorAll('.stat-counter');
  
  const runCounter = (el) => {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const speed = 1200; // Counter total duration in ms
    const increment = target / (speed / 16); // ~60fps
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        el.textContent = target + suffix;
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current) + suffix;
      }
    }, 16);
  };

  const observerOptions = {
    threshold: 0.5
  };

  const statsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        runCounter(entry.target);
        observer.unobserve(entry.target); // Trigger only once
      }
    });
  }, observerOptions);

  statsElements.forEach(el => statsObserver.observe(el));


  // --- 8. CORE GSAP ENTRY & SCROLL TRIGGER REVEALS ---
  
  // Hero entry sequence
  function triggerHeroAnimations() {
    gsap.from('.hero-profile-column', {
      scale: 0.8,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.out'
    });

    gsap.from('.hero-title-name', {
      y: 60,
      opacity: 0,
      duration: 1,
      delay: 0.2,
      ease: 'back.out(1.5)'
    });

    gsap.from('.hero-subtitle', {
      y: 40,
      opacity: 0,
      duration: 0.8,
      delay: 0.4,
      ease: 'power3.out'
    });

    gsap.from('.hero-intro-text', {
      y: 30,
      opacity: 0,
      duration: 0.8,
      delay: 0.5,
      ease: 'power3.out'
    });

    gsap.from('.hero-ctas > *', {
      scale: 0.8,
      opacity: 0,
      duration: 0.6,
      stagger: 0.12,
      delay: 0.7,
      ease: 'back.out(2)'
    });

    gsap.from('.hero-socials > *', {
      y: 20,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      delay: 1.1,
      ease: 'power3.out'
    });

    gsap.from('header', {
      y: -50,
      opacity: 0,
      duration: 1,
      delay: 0.6,
      ease: 'power3.out'
    });
  }

  // Register ScrollTrigger plugin
  gsap.registerPlugin(ScrollTrigger);

  // Section Heading Reveals
  const sectionHeadings = document.querySelectorAll('.section-heading');
  sectionHeadings.forEach(heading => {
    gsap.from(heading, {
      scrollTrigger: {
        trigger: heading,
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    });
  });

  // About Section animations
  gsap.from('.about-content-left', {
    scrollTrigger: {
      trigger: '#about',
      start: 'top 75%'
    },
    x: -80,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
  });

  gsap.from('.about-content-right', {
    scrollTrigger: {
      trigger: '#about',
      start: 'top 75%'
    },
    x: 80,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
  });

  // Education Timeline cards Scroll Trigger
  const timelineItems = document.querySelectorAll('.timeline-item');
  timelineItems.forEach((item, index) => {
    gsap.from(item, {
      scrollTrigger: {
        trigger: item,
        start: 'top 80%'
      },
      x: -50,
      opacity: 0,
      duration: 0.8,
      delay: index * 0.1,
      ease: 'power3.out'
    });
  });

  // Linear skill progress bars filling animation
  const skillFills = document.querySelectorAll('.progress-bar-fill');
  skillFills.forEach(fill => {
    const percent = fill.getAttribute('data-percent');
    gsap.to(fill, {
      scrollTrigger: {
        trigger: '#skills',
        start: 'top 75%'
      },
      width: `${percent}%`,
      duration: 1.5,
      ease: 'power2.out'
    });
  });

  // Circular Skills ring loads
  gsap.from('.skill-card', {
    scrollTrigger: {
      trigger: '#skills',
      start: 'top 75%'
    },
    y: 50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.08,
    ease: 'power3.out',
    onComplete: () => {
      const skillRings = document.querySelectorAll('.glow-ring');
      skillRings.forEach(ring => {
        const percent = ring.getAttribute('data-percent');
        const offset = 283 - (283 * percent) / 100;
        ring.style.strokeDashoffset = offset;
      });
    }
  });

  // Achievements cards animations
  gsap.from('.achievement-card', {
    scrollTrigger: {
      trigger: '#achievements',
      start: 'top 75%'
    },
    scale: 0.9,
    opacity: 0,
    duration: 0.8,
    stagger: 0.12,
    ease: 'back.out(1.2)'
  });

  // Project cards reveals
  gsap.from('.project-card', {
    scrollTrigger: {
      trigger: '#projects',
      start: 'top 75%'
    },
    y: 60,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power3.out'
  });

  // Experience and activities cards
  gsap.from('.experience-card', {
    scrollTrigger: {
      trigger: '#experience',
      start: 'top 75%'
    },
    x: (i) => i % 2 === 0 ? -60 : 60,
    opacity: 0,
    duration: 1,
    stagger: 0.15,
    ease: 'power3.out'
  });

  // Contact form & details reveal
  gsap.from('.contact-info', {
    scrollTrigger: {
      trigger: '#contact',
      start: 'top 80%'
    },
    x: -60,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out'
  });

  gsap.from('.contact-form-wrapper', {
    scrollTrigger: {
      trigger: '#contact',
      start: 'top 80%'
    },
    x: 60,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out'
  });


  // --- 9. MOBILE NAVIGATION & ACTIVE LINK TRACKING ---
  const burgerMenuBtn = document.getElementById('burger-menu');
  const mobileNav = document.getElementById('mobile-nav');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');

  // Toggle Mobile Menu
  burgerMenuBtn.addEventListener('click', () => {
    const isExpanded = burgerMenuBtn.getAttribute('aria-expanded') === 'true';
    burgerMenuBtn.setAttribute('aria-expanded', !isExpanded);
    mobileNav.classList.toggle('hidden');
    mobileNav.classList.toggle('flex');
    burgerMenuBtn.querySelector('.hamburger').classList.toggle('open');
  });

  // Close Mobile Menu when link clicked
  const mobileNavLinks = mobileNav.querySelectorAll('a');
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.add('hidden');
      mobileNav.classList.remove('flex');
      burgerMenuBtn.setAttribute('aria-expanded', 'false');
      burgerMenuBtn.querySelector('.hamburger').classList.remove('open');
    });
  });

  // Highlight Nav Links on Scroll
  window.addEventListener('scroll', () => {
    let currentSectionId = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= (sectionTop - 200)) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('text-cyan-400', 'border-b-2', 'border-cyan-400');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('text-cyan-400', 'border-b-2', 'border-cyan-400');
      }
    });
  });


  // --- 10. CONTACT FORM INTERACTIVE SUCCESS HANDLER ---
  const contactForm = document.getElementById('cyber-contact-form');
  const formStatus = document.getElementById('form-status');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="inline-flex items-center">
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        TRANSMITTING...
      </span>
    `;

    setTimeout(() => {
      // Success feedback
      submitBtn.innerHTML = `TRANSMISSION SECURED`;
      submitBtn.classList.remove('btn-cyber-primary');
      submitBtn.style.borderColor = '#10b981';
      submitBtn.style.color = '#10b981';
      submitBtn.style.boxShadow = '0 0 20px #10b981';

      formStatus.classList.remove('hidden');
      formStatus.textContent = 'SECURE LINK ESTABLISHED: Message transmitted successfully to Deepan\'s terminal.';
      formStatus.style.color = '#10b981';
      
      // Reset after delay
      setTimeout(() => {
        contactForm.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        submitBtn.style = '';
        submitBtn.classList.add('btn-cyber-primary');
        formStatus.classList.add('hidden');
      }, 5000);

    }, 2000);
  });

  // Re-run listener hook on dynamic additions
  initCursorHovers();
});
