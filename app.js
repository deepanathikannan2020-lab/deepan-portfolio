document.addEventListener('DOMContentLoaded', () => {

  // ==================== 1. PRELOADER & AUTHENTICATION PROTOCOL ====================
  const preloader = document.getElementById('preloader');
  const progressFill = document.querySelector('.loader-progress-fill');
  const loaderLines = document.querySelectorAll('.loader-line');
  const loginScreen = document.getElementById('login-screen');
  const dashboardScreen = document.getElementById('dashboard-screen');
  
  let isBootComplete = false;

  // Preloader boot timeline sequence
  const bootTimeline = gsap.timeline({
    onComplete: () => {
      gsap.to(preloader, {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => {
          preloader.style.display = 'none';
          isBootComplete = true;
          checkAuthStatus(); // Route to appropriate screen after boot
        }
      });
    }
  });

  loaderLines.forEach((line, index) => {
    bootTimeline.to(line, {
      opacity: 1,
      y: 0,
      duration: 0.15,
      ease: 'power1.out'
    }, index * 0.18);
  });

  bootTimeline.to(progressFill, {
    width: '100%',
    duration: 1.4,
    ease: 'power2.inOut'
  }, 0.2);

  // Authenticate user
  const loginForm = document.getElementById('login-form');
  const loginStatusConsole = document.getElementById('login-status-console');
  
  function checkAuthStatus() {
    const isAuthenticated = localStorage.getItem('aathi-auth') === 'true';
    if (isAuthenticated) {
      // Direct pass to dashboard
      loginScreen.classList.add('hidden');
      dashboardScreen.classList.remove('hidden');
      triggerHeroAnimations();
      initThreeJSBackground();
      fetchGitHubProfile();
      loadCertificates();
    } else {
      // Show login portal
      loginScreen.classList.remove('hidden');
      dashboardScreen.classList.add('hidden');
      initLoginCanvas();
    }
  }

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userVal = document.getElementById('login-username').value.trim();
    const passVal = document.getElementById('login-password').value;
    
    // Clear log console
    loginStatusConsole.classList.add('hidden');
    loginStatusConsole.textContent = '';

    if (userVal === 'aathi' && passVal === 'aathi123') {
      // Access Granted
      loginStatusConsole.classList.remove('hidden', 'text-neonMagenta', 'bg-neonMagenta/5', 'border-neonMagenta/20');
      loginStatusConsole.classList.add('text-neonGreen', 'bg-neonGreen/5', 'border-neonGreen/20');
      loginStatusConsole.textContent = '[SUCCESS] SIGNAL DECRYPTED. REDIRECTING...';
      
      localStorage.setItem('aathi-auth', 'true');
      
      // Animate transition
      gsap.to(loginScreen, {
        opacity: 0,
        scale: 0.95,
        duration: 0.8,
        ease: 'power2.inOut',
        onComplete: () => {
          loginScreen.classList.add('hidden');
          dashboardScreen.classList.remove('hidden');
          dashboardScreen.style.opacity = 0;
          gsap.to(dashboardScreen, {
            opacity: 1,
            duration: 0.6,
            onComplete: () => {
              triggerHeroAnimations();
              initThreeJSBackground();
              fetchGitHubProfile();
              loadCertificates();
            }
          });
        }
      });
    } else {
      // Access Denied shake card
      const loginCard = loginForm.closest('.glass-card');
      loginCard.classList.remove('auth-shake');
      void loginCard.offsetWidth; // Force repaint
      loginCard.classList.add('auth-shake');
      
      loginStatusConsole.classList.remove('hidden', 'text-neonGreen', 'bg-neonGreen/5', 'border-neonGreen/20');
      loginStatusConsole.classList.add('text-neonMagenta', 'bg-neonMagenta/5', 'border-neonMagenta/20');
      loginStatusConsole.textContent = '[ERROR] INVALID ENCRYPT KEY OR IDENT USERNAME. LOG ATTEMPTED REJECTED.';
    }
  });


  // ==================== 2. HOLOGRAPHIC THREE.JS CIRCUIT GRID ====================
  let threeScene, threeCamera, threeRenderer, threeGridNodes;

  function initThreeJSBackground() {
    const isLight = document.body.classList.contains('light-theme');
    const container = document.body;
    
    // Create ThreeJS canvas behind everything
    const threeCanvas = document.createElement('canvas');
    threeCanvas.id = 'three-canvas';
    threeCanvas.style.position = 'fixed';
    threeCanvas.style.top = '0';
    threeCanvas.style.left = '0';
    threeCanvas.style.width = '100vw';
    threeCanvas.style.height = '100vh';
    threeCanvas.style.zIndex = '0';
    threeCanvas.style.pointerEvents = 'none';
    container.appendChild(threeCanvas);

    // Initialize ThreeJS Scene
    threeScene = new THREE.Scene();
    threeCamera = new THREE.Camera();
    threeCamera.position.z = 1;

    // Custom shader material for ECE grid lines / floating dots
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float time;
      uniform vec2 resolution;
      varying vec2 vUv;

      float grid(vec2 uv, float spacing) {
        vec2 grid = abs(fract(uv - 0.5) - 0.5) / fwidth(uv);
        float line = min(grid.x, grid.y);
        return 1.0 - min(line, 1.0);
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / resolution.y;
        uv *= 3.0; // zoom level
        
        // Dynamic waveform signal lines
        float signal = sin(uv.x * 2.0 + time * 1.5) * 0.4;
        float pulse = smoothstep(0.02, 0.0, abs(uv.y - signal));
        
        // Color mapping
        vec3 color = vec3(0.00, 0.94, 1.00) * pulse * 0.6; // Cyan wave
        color += vec3(0.22, 1.00, 0.08) * grid(uv * 1.5, 0.2) * 0.04; // Green network grid
        
        gl_FragColor = vec4(color, color.r > 0.0 || color.g > 0.0 ? 0.08 : 0.0);
      }
    `;

    // Fallback simple 3D system using standard points:
    threeScene = new THREE.Scene();
    threeCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    threeCamera.position.z = 30;

    threeRenderer = new THREE.WebGLRenderer({ canvas: threeCanvas, alpha: true, antialias: true });
    threeRenderer.setSize(window.innerWidth, window.innerHeight);
    threeRenderer.setPixelRatio(window.devicePixelRatio);

    // Create particles nodes representing semiconductor atoms
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 70;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const cyanColor = new THREE.Color(isLight ? 0x0055bb : 0x00f0ff);
    const greenColor = new THREE.Color(isLight ? 0x00aa00 : 0x39ff14);

    for (let i = 0; i < particleCount * 3; i += 3) {
      // Floating coordinates
      positions[i] = (Math.random() - 0.5) * 60;
      positions[i+1] = (Math.random() - 0.5) * 60;
      positions[i+2] = (Math.random() - 0.5) * 40;

      const randomColor = Math.random() > 0.5 ? cyanColor : greenColor;
      colors[i] = randomColor.r;
      colors[i+1] = randomColor.g;
      colors[i+2] = randomColor.b;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Custom material for points
    const pointsMaterial = new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending
    });

    threeGridNodes = new THREE.Points(particleGeometry, pointsMaterial);
    threeScene.add(threeGridNodes);

    // Add glowing lines connecting nodes
    const lineMaterial = new THREE.LineBasicMaterial({
      color: isLight ? 0x0055bb : 0x00f0ff,
      transparent: true,
      opacity: 0.1,
      blending: THREE.AdditiveBlending
    });

    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = [];
    
    // Connect nodes near to each other
    const posArr = threeGridNodes.geometry.attributes.position.array;
    for (let i = 0; i < posArr.length; i += 3) {
      for (let j = i + 3; j < posArr.length; j += 3) {
        const dx = posArr[i] - posArr[j];
        const dy = posArr[i+1] - posArr[j+1];
        const dz = posArr[i+2] - posArr[j+2];
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        
        if (dist < 15) {
          linePositions.push(posArr[i], posArr[i+1], posArr[i+2]);
          linePositions.push(posArr[j], posArr[j+1], posArr[j+2]);
        }
      }
    }

    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    threeScene.add(lines);

    // Animation Loop
    function animateThree() {
      if (!dashboardScreen.classList.contains('hidden')) {
        requestAnimationFrame(animateThree);
      }
      
      // Rotate whole points structure
      threeGridNodes.rotation.y += 0.0006;
      threeGridNodes.rotation.x += 0.0003;
      lines.rotation.y += 0.0006;
      lines.rotation.x += 0.0003;

      // Pulse sizes
      pointsMaterial.size = 1.0 + Math.sin(Date.now() * 0.001) * 0.2;

      threeRenderer.render(threeScene, threeCamera);
    }
    
    animateThree();
  }

  // Handle Resize
  window.addEventListener('resize', () => {
    if (threeCamera && threeRenderer) {
      threeCamera.aspect = window.innerWidth / window.innerHeight;
      threeCamera.updateProjectionMatrix();
      threeRenderer.setSize(window.innerWidth, window.innerHeight);
    }
  });


  // ==================== 3. 2D LOGIN PCB CANVAS ====================
  function initLoginCanvas() {
    const canvas = document.getElementById('login-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      if (loginScreen.classList.contains('hidden')) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const linesList = [];
    const lineCount = 18;

    class PCBLine {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.dir = Math.floor(Math.random() * 4) * (Math.PI / 2); // 90 degree routes
        this.length = Math.random() * 80 + 30;
        this.currentLen = 0;
        this.speed = Math.random() * 1.5 + 0.8;
        this.width = Math.random() * 1.5 + 0.8;
        this.points = [{ x: this.x, y: this.y }];
        this.turnProb = 0.02;
        this.color = Math.random() > 0.5 ? '#00f0ff' : '#39ff14';
      }

      update() {
        const lastPoint = this.points[this.points.length - 1];
        
        // Progress in current direction
        const dx = Math.cos(this.dir) * this.speed;
        const dy = Math.sin(this.dir) * this.speed;
        
        lastPoint.x += dx;
        lastPoint.y += dy;
        this.currentLen += this.speed;

        // Turn randomly or when maximum segment length is hit
        if (this.currentLen > this.length) {
          if (this.points.length > 5) {
            this.reset();
          } else {
            this.currentLen = 0;
            // 90 deg turn
            const oldDir = this.dir;
            this.dir += Math.random() > 0.5 ? (Math.PI/2) : -(Math.PI/2);
            this.points.push({ x: lastPoint.x, y: lastPoint.y });
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
          ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.width;
        ctx.globalAlpha = 0.15;
        ctx.stroke();

        // Draw terminal joints
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.points[0].x, this.points[0].y, 3, 0, Math.PI * 2);
        ctx.fill();
        
        const last = this.points[this.points.length - 1];
        ctx.beginPath();
        ctx.arc(last.x, last.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < lineCount; i++) {
      linesList.push(new PCBLine());
    }

    function animateLogin() {
      if (loginScreen.classList.contains('hidden')) return;
      requestAnimationFrame(animateLogin);
      
      ctx.fillStyle = 'rgba(2, 2, 5, 0.05)';
      ctx.fillRect(0, 0, width, height);

      linesList.forEach(line => {
        line.update();
        line.draw();
      });
    }

    animateLogin();
  }


  // ==================== 4. DYNAMIC CANVAS OSCILLOSCOPE SIGNAL WAVES ====================
  // 3 Canvas scopes: hero scope, about scope, footer pulse
  function initOscilloscopes() {
    const heroCanvas = document.getElementById('hero-signal-canvas');
    const aboutCanvas = document.getElementById('about-canvas-waves');
    const footerCanvas = document.getElementById('footer-pulse-canvas');

    let mouseXRatio = 0.5;

    window.addEventListener('mousemove', (e) => {
      mouseXRatio = e.clientX / window.innerWidth;
    });

    // Helper to start oscilloscope
    function animateScope(canvas, color, speedScale, waveCount, type) {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      let width = canvas.width = canvas.clientWidth;
      let height = canvas.height = canvas.clientHeight;
      let phase = 0;

      // Handle Resize
      const resizeObserver = new ResizeObserver(() => {
        width = canvas.width = canvas.clientWidth;
        height = canvas.height = canvas.clientHeight;
      });
      resizeObserver.observe(canvas);

      function draw() {
        if (dashboardScreen.classList.contains('hidden')) {
          requestAnimationFrame(draw);
          return;
        }
        requestAnimationFrame(draw);
        ctx.clearRect(0, 0, width, height);

        // Draw grid lines inside CRT monitoring panels
        if (type === 'crt') {
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.03)';
          ctx.lineWidth = 1;
          const gridSize = 15;
          for (let x = 0; x < width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
          }
          for (let y = 0; y < height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
          }
        }

        // Draw sine wave lines
        ctx.lineWidth = type === 'footer' ? 1.5 : 2;
        ctx.shadowBlur = document.body.classList.contains('light-theme') ? 0 : 8;
        ctx.shadowColor = color;

        for (let w = 0; w < waveCount; w++) {
          ctx.beginPath();
          ctx.strokeStyle = color;
          ctx.globalAlpha = type === 'footer' ? 0.3 : 1.0 - (w * 0.45);

          // Modulate based on mouse positions
          const amplitude = (height * 0.3) * (1.0 - w * 0.3) * (0.4 + mouseXRatio * 0.8);
          const frequency = (0.015 + w * 0.005) * (0.6 + (1.0 - mouseXRatio) * 1.2);

          for (let x = 0; x < width; x++) {
            const y = (height / 2) + Math.sin(x * frequency + phase + w * Math.PI/2) * amplitude;
            if (x === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.stroke();
        }

        ctx.shadowBlur = 0; // Reset
        phase += 0.04 * speedScale;
      }
      draw();
    }

    // Launch all scopes
    const isLight = document.body.classList.contains('light-theme');
    animateScope(heroCanvas, isLight ? '#0066cc' : '#00f0ff', 1.0, 3, 'hero');
    animateScope(aboutCanvas, isLight ? '#00aa00' : '#39ff14', 1.5, 2, 'crt');
    animateScope(footerCanvas, isLight ? '#0066cc' : '#00f0ff', 0.8, 1, 'footer');
  }

  // Trigger scopes immediately after dashboard mounts
  setTimeout(initOscilloscopes, 100);


  // ==================== 5. OFF-LINE AMBIENT WEB AUDIO SYNTHESIZER ====================
  let audioCtx = null;
  let synthOsc = null;
  let synthGain = null;
  let isPlayingAudio = false;

  const soundToggleBtn = document.getElementById('sound-toggle');
  
  function initAudioSynthesizer() {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Drone Generator (Low 55Hz cinematic synth wave)
      synthOsc = audioCtx.createOscillator();
      synthGain = audioCtx.createGain();
      const lowpassFilter = audioCtx.createBiquadFilter();

      // Configure synth low drone
      synthOsc.type = 'sawtooth';
      synthOsc.frequency.setValueAtTime(55, audioCtx.currentTime); // A1 note
      
      lowpassFilter.type = 'lowpass';
      lowpassFilter.frequency.setValueAtTime(140, audioCtx.currentTime);
      lowpassFilter.Q.setValueAtTime(4, audioCtx.currentTime);

      // Volume settings
      synthGain.gain.setValueAtTime(0.0, audioCtx.currentTime);

      // Interconnect nodes
      synthOsc.connect(lowpassFilter);
      lowpassFilter.connect(synthGain);
      synthGain.connect(audioCtx.destination);

      synthOsc.start();

      // Moderate LFO Sweep to generate filters pulsation
      const lfo = audioCtx.createOscillator();
      const lfoGain = audioCtx.createGain();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.15, audioCtx.currentTime); // 0.15Hz rate
      lfoGain.gain.setValueAtTime(45, audioCtx.currentTime); // sweeping range

      lfo.connect(lfoGain);
      lfoGain.connect(lowpassFilter.frequency);
      lfo.start();

    } catch (err) {
      console.log('Web Audio API not supported on this browser context.');
    }
  }

  // Short beep feedback sound on button triggers
  function triggerBeep() {
    if (!audioCtx || !isPlayingAudio) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // high note click
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch(e) {}
  }

  soundToggleBtn.addEventListener('click', () => {
    // Instantiate on first user interaction
    if (!audioCtx) {
      initAudioSynthesizer();
    }

    if (isPlayingAudio) {
      // Mute synth
      synthGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      soundToggleBtn.classList.remove('text-neonGreen');
      soundToggleBtn.classList.add('text-slate-400');
      isPlayingAudio = false;
    } else {
      // Unmute synth
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      synthGain.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 0.5); // safe low volume
      soundToggleBtn.classList.remove('text-slate-400');
      soundToggleBtn.classList.add('text-neonGreen');
      isPlayingAudio = true;
      triggerBeep(); // Beep feedback
    }
  });

  // Attach dynamic clicks audios to all interactive tags
  document.body.addEventListener('click', (e) => {
    if (e.target.closest('a, button, input, .clickable')) {
      triggerBeep();
    }
  });


  // ==================== 6. THEME ENGINE: DARK & LIGHT HOLOGRAPHIC MODE ====================
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

    // Reset ThreeJS colors and particle updates
    const canvasObj = document.getElementById('three-canvas');
    if (canvasObj) {
      canvasObj.remove();
      initThreeJSBackground();
    }
    particles.forEach(p => p.updateColor());
  });


  // ==================== 7. CUSTOM CURSOR GLOW ENGINE ====================
  const cursorDot = document.querySelector('.custom-cursor');
  const cursorGlow = document.querySelector('.custom-cursor-glow');

  window.addEventListener('mousemove', (e) => {
    cursorDot.style.left = e.clientX + 'px';
    cursorDot.style.top = e.clientY + 'px';

    gsap.to(cursorGlow, {
      left: e.clientX,
      top: e.clientY,
      duration: 0.1,
      ease: 'power2.out'
    });
  });

  // Track hover states for links and interactive elements
  function initCursorHovers() {
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, .glass-card, .clickable');
    interactiveElements.forEach(el => {
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


  // ==================== 8. INTERACTIVE SPOTLIGHT GLOW ON GLASS CARDS ====================
  function initSpotlightGlow() {
    const glassCards = document.querySelectorAll('.glass-card');
    glassCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--cursor-x', `${x}px`);
        card.style.setProperty('--cursor-y', `${y}px`);
      });
    });
  }
  initSpotlightGlow();


  // ==================== 9. DYNAMIC CANVAS NEON PARTICLES ====================
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const maxParticles = Math.min(50, Math.floor((width * height) / 32000));

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.size = Math.random() * 1.5 + 0.8;
      this.alpha = Math.random() * 0.4 + 0.2;
      this.updateColor();
    }

    updateColor() {
      const isLight = document.body.classList.contains('light-theme');
      if (isLight) {
        this.color = Math.random() > 0.5 ? '#0066cc' : '#00aa00';
      } else {
        this.color = Math.random() > 0.5 ? '#00f0ff' : '#39ff14';
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
      ctx.fill();
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

    // Draw connecting circuit lines
    ctx.globalAlpha = 0.05;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          
          const grad = ctx.createLinearGradient(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
          grad.addColorStop(0, particles[i].color);
          grad.addColorStop(1, particles[j].color);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animateParticles);
  }
  animateParticles();


  // ==================== 10. FUTURISTIC TYPING ANIMATION ENGINE ====================
  const typingElement = document.getElementById('typing-text');
  const roles = [
    'Hi, I am Deepan Athi. K',
    'Electronics and Communication Engineering Student',
    'Future Semiconductor & Embedded Systems Engineer'
  ];
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 80;

  function typeEffect() {
    // Only type if dashboard is visible
    if (dashboardScreen.classList.contains('hidden')) {
      setTimeout(typeEffect, 1000);
      return;
    }

    const currentRole = roles[roleIndex];
    if (isDeleting) {
      typingElement.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 30;
    } else {
      typingElement.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 70;
    }

    // Pause/state management
    if (!isDeleting && charIndex === currentRole.length) {
      isDeleting = true;
      typingSpeed = 2200; // time showing text
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typingSpeed = 350; // pause before starting next role
    }

    setTimeout(typeEffect, typingSpeed);
  }
  
  // Launch typing slightly after preloader hides
  setTimeout(typeEffect, 2000);


  // ==================== 11. VIEWPORT INTERSECTION NUMERIC COUNTERS ====================
  const statsElements = document.querySelectorAll('.stat-counter');
  
  const runCounter = (el) => {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const speed = 1000; // Counter total duration in ms
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
    threshold: 0.3
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


  // ==================== 12. DYNAMIC GITHUB PROFILE & REPOSITORIES ====================
  const githubUsername = 'deepanathikannan2020-lab';
  
  function fetchGitHubProfile() {
    const reposGrid = document.getElementById('github-repos-grid');
    
    // Query Github Repo endpoint
    fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=6`)
      .then(res => {
        if (!res.ok) throw new Error('API Rate Limited or Unavailable');
        return res.json();
      })
      .then(repos => {
        reposGrid.innerHTML = ''; // Clear loaders
        
        if (repos.length === 0) {
          reposGrid.innerHTML = `
            <div class="col-span-3 text-center py-8 font-mono text-sm text-slate-500">
              No public repositories found.
            </div>
          `;
          return;
        }

        // Render Repository Cards
        repos.forEach(repo => {
          const card = document.createElement('div');
          card.className = 'glass-card cyber-card p-6 flex flex-col justify-between items-start space-y-4 h-52 clickable';
          card.innerHTML = `
            <div class="space-y-2 w-full text-left">
              <div class="flex justify-between items-center w-full">
                <i class="fa-solid fa-code text-neonGreen text-sm"></i>
                <span class="font-mono text-[8px] border border-white/10 px-1 py-0.5 rounded text-slate-500 uppercase">${repo.language || 'DATA'}</span>
              </div>
              <h4 class="font-space text-lg font-bold text-white truncate max-w-[200px]">${repo.name}</h4>
              <p class="text-xs text-slate-400 line-clamp-3">${repo.description || 'No description provided for this repository.'}</p>
            </div>
            
            <div class="flex justify-between items-center w-full pt-2 border-t border-white/5 font-mono text-[10px] text-slate-500">
              <span>★ ${repo.stargazers_count} Stars</span>
              <a href="${repo.html_url}" target="_blank" class="text-neonCyan hover:text-white transition">OPEN REPO →</a>
            </div>
          `;
          reposGrid.appendChild(card);
        });
        
        initSpotlightGlow();
        initCursorHovers();
      })
      .catch(err => {
        console.warn('GitHub Dynamic fetch failed. Rendering local backup cards.', err);
        renderBackupRepos();
      });

    // Generate contribution matrix grid cells (ECE style)
    const contribGrid = document.getElementById('contrib-grid');
    contribGrid.innerHTML = '';
    
    // Generate 371 cells (53 weeks * 7 rows)
    for (let i = 0; i < 371; i++) {
      const cell = document.createElement('div');
      cell.className = 'contrib-cell w-3.5 h-3.5 rounded';
      
      // Random mock signals level representing laboratory commits activity
      const seed = Math.random();
      if (seed < 0.5) {
        cell.className += ' bg-slate-900 border border-white/5';
        cell.style.color = 'rgba(255,255,255,0.05)';
      } else if (seed < 0.75) {
        cell.className += ' bg-emerald-950';
        cell.style.color = '#022c22';
      } else if (seed < 0.9) {
        cell.className += ' bg-emerald-700';
        cell.style.color = '#047857';
      } else if (seed < 0.97) {
        cell.className += ' bg-emerald-500';
        cell.style.color = '#10b981';
      } else {
        cell.className += ' bg-neonGreen';
        cell.style.color = '#39ff14';
      }

      contribGrid.appendChild(cell);
    }
  }

  function renderBackupRepos() {
    const reposGrid = document.getElementById('github-repos-grid');
    reposGrid.innerHTML = ''; // Clear loaders

    const backupData = [
      { name: 'safety-helmet-system', desc: 'Embedded microcontroller node logic. Alcohol, infrared, and accelerometer checks with RF link alert codes.', lang: 'Embedded C', url: `https://github.com/${githubUsername}` },
      { name: 'lifi-transceiver-protocols', desc: 'Visible Light Communication setup maps. Serial data transfer via high frequency LED sweeps.', lang: 'Hardware', url: `https://github.com/${githubUsername}` },
      { name: 'grocery-billing-c', desc: 'CLI-based discount algorithmic matrices, item registers, and sales aggregation parser.', lang: 'C Language', url: `https://github.com/${githubUsername}` }
    ];

    backupData.forEach(repo => {
      const card = document.createElement('div');
      card.className = 'glass-card cyber-card p-6 flex flex-col justify-between items-start space-y-4 h-52 clickable';
      card.innerHTML = `
        <div class="space-y-2 w-full text-left">
          <div class="flex justify-between items-center w-full">
            <i class="fa-solid fa-code text-neonCyan text-sm"></i>
            <span class="font-mono text-[8px] border border-white/10 px-1 py-0.5 rounded text-slate-500 uppercase">${repo.lang}</span>
          </div>
          <h4 class="font-space text-lg font-bold text-white truncate max-w-[200px]">${repo.name}</h4>
          <p class="text-xs text-slate-400 line-clamp-3">${repo.desc}</p>
        </div>
        
        <div class="flex justify-between items-center w-full pt-2 border-t border-white/5 font-mono text-[10px] text-slate-500">
          <span>★ Local Node Cache</span>
          <a href="${repo.url}" target="_blank" class="text-neonGreen hover:text-white transition">OPEN REPO →</a>
        </div>
      `;
      reposGrid.appendChild(card);
    });

    initSpotlightGlow();
    initCursorHovers();
  }


  // ==================== 13. CERTIFICATES HANDLER & BASE64 SAVE ====================
  const uploadInput = document.getElementById('cert-upload-input');
  const certTitleInput = document.getElementById('cert-title');
  const certIssuerInput = document.getElementById('cert-issuer');
  const addCertBtn = document.getElementById('add-cert-btn');
  const uploadConsoleLog = document.getElementById('upload-console-log');
  const certificatesGrid = document.getElementById('certificates-grid');

  addCertBtn.addEventListener('click', () => {
    const file = uploadInput.files[0];
    const title = certTitleInput.value.trim();
    const issuer = certIssuerInput.value.trim();

    uploadConsoleLog.classList.add('hidden');
    uploadConsoleLog.textContent = '';

    if (!file) {
      uploadConsoleLog.classList.remove('hidden');
      uploadConsoleLog.textContent = '[FAIL] CHOOSE A CERTIFICATE IMAGE FILE.';
      return;
    }
    if (!title || !issuer) {
      uploadConsoleLog.classList.remove('hidden');
      uploadConsoleLog.textContent = '[FAIL] HEADER AND ISSUING LAB NAME MUST BE SPECIFIED.';
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const base64Data = e.target.result;
      
      const newCert = {
        id: Date.now(),
        image: base64Data,
        title: title,
        issuer: issuer,
        date: new Date().getFullYear()
      };

      // Retrieve and save to local storage
      const stored = JSON.parse(localStorage.getItem('aathi-certs') || '[]');
      stored.unshift(newCert);
      localStorage.setItem('aathi-certs', JSON.stringify(stored));

      // Reset fields
      certTitleInput.value = '';
      certIssuerInput.value = '';
      uploadInput.value = '';
      
      uploadConsoleLog.classList.remove('hidden');
      uploadConsoleLog.style.color = '#39ff14';
      uploadConsoleLog.textContent = '[SUCCESS] NEW CERTIFICATE METADATA WRITTEN.';
      
      loadCertificates(); // Refresh gallery view
    };

    reader.readAsDataURL(file);
  });

  function loadCertificates() {
    // Keep initial hardcoded nodes in HTML structure
    const defaultHTML = `
      <div class="project-card glass-card cyber-card flex flex-col relative group overflow-hidden clickable" onclick="previewCertificate('https://images.unsplash.com/photo-1589330694653-ded6df53f6ee?q=80&w=600&auto=format&fit=crop', 'Industrial Training Certificate', 'Indus Electronics')">
        <div class="h-44 bg-slate-950/60 overflow-hidden relative">
          <img src="https://images.unsplash.com/photo-1589330694653-ded6df53f6ee?q=80&w=600&auto=format&fit=crop" alt="Industrial Training Certificate" class="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500">
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
          <div class="cert-card-overlay absolute inset-0 flex items-center justify-center">
            <span class="px-4 py-2 border border-neonCyan/40 bg-neonCyan/10 text-neonCyan font-mono text-[10px] tracking-wider rounded font-bold">
              INITIALIZE PREVIEW
            </span>
          </div>
        </div>
        <div class="p-4 bg-slate-950/40 border-t border-white/5 flex-grow">
          <span class="font-mono text-[9px] text-neonCyan uppercase block mb-1">INDUS ELECTRONICS</span>
          <h4 class="font-space text-base font-bold text-white">Industrial Training Certificate</h4>
          <p class="text-[11px] text-slate-500 font-mono mt-1">ISSUED: 2025</p>
        </div>
      </div>

      <div class="project-card glass-card cyber-card flex flex-col relative group overflow-hidden clickable" onclick="previewCertificate('https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?q=80&w=600&auto=format&fit=crop', 'VIT Symposium Participation', 'VIT Vellore')">
        <div class="h-44 bg-slate-950/60 overflow-hidden relative">
          <img src="https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?q=80&w=600&auto=format&fit=crop" alt="VIT Participation" class="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500">
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
          <div class="cert-card-overlay absolute inset-0 flex items-center justify-center">
            <span class="px-4 py-2 border border-neonCyan/40 bg-neonCyan/10 text-neonCyan font-mono text-[10px] tracking-wider rounded font-bold">
              INITIALIZE PREVIEW
            </span>
          </div>
        </div>
        <div class="p-4 bg-slate-950/40 border-t border-white/5 flex-grow">
          <span class="font-mono text-[9px] text-neonGreen uppercase block mb-1">VIT VELLORE</span>
          <h4 class="font-space text-base font-bold text-white">VIT Symposium Participation</h4>
          <p class="text-[11px] text-slate-500 font-mono mt-1">ISSUED: 2024</p>
        </div>
      </div>
    `;

    // Render local storage items
    const customCerts = JSON.parse(localStorage.getItem('aathi-certs') || '[]');
    let customHTML = '';
    
    customCerts.forEach(cert => {
      customHTML += `
        <div class="project-card glass-card cyber-card flex flex-col relative group overflow-hidden clickable" onclick="previewCertificate('${cert.image}', '${cert.title}', '${cert.issuer}')">
          <div class="h-44 bg-slate-950/60 overflow-hidden relative">
            <img src="${cert.image}" alt="${cert.title}" class="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500">
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
            <div class="cert-card-overlay absolute inset-0 flex items-center justify-center">
              <span class="px-4 py-2 border border-neonCyan/40 bg-neonCyan/10 text-neonCyan font-mono text-[10px] tracking-wider rounded font-bold">
                INITIALIZE PREVIEW
              </span>
            </div>
          </div>
          <div class="p-4 bg-slate-950/40 border-t border-white/5 flex-grow">
            <span class="font-mono text-[9px] text-neonGreen uppercase block mb-1">${cert.issuer}</span>
            <h4 class="font-space text-base font-bold text-white">${cert.title}</h4>
            <p class="text-[11px] text-slate-500 font-mono mt-1">ISSUED: ${cert.date}</p>
          </div>
        </div>
      `;
    });

    certificatesGrid.innerHTML = customHTML + defaultHTML;
    initSpotlightGlow();
    initCursorHovers();
  }

  // Preview modals calls
  window.previewCertificate = function(imgUrl, title, issuer) {
    const modal = document.getElementById('cert-preview-modal');
    document.getElementById('modal-cert-img').src = imgUrl;
    document.getElementById('modal-cert-title').textContent = title;
    document.getElementById('modal-cert-issuer').textContent = issuer.toUpperCase();
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    gsap.from(modal.querySelector('.glass-card'), {
      scale: 0.9,
      opacity: 0,
      duration: 0.35,
      ease: 'back.out(1.5)'
    });
  };

  window.closeCertPreview = function() {
    const modal = document.getElementById('cert-preview-modal');
    gsap.to(modal.querySelector('.glass-card'), {
      scale: 0.95,
      opacity: 0,
      duration: 0.2,
      onComplete: () => {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
      }
    });
  };


  // ==================== 14. CURRICULUM VITAE RESUME MODAL ====================
  const resumeModal = document.getElementById('resume-modal');
  const resumeIframe = document.getElementById('resume-iframe');
  let isResumeOpen = false;

  window.toggleResumeModal = function() {
    isResumeOpen = !isResumeOpen;
    if (isResumeOpen) {
      resumeModal.classList.remove('hidden');
      resumeModal.classList.add('flex');
      
      // Inject PDF source
      resumeIframe.src = 'assets/Deepan_Athi_K_Resume.pdf';
      
      gsap.from(resumeModal.querySelector('.glass-card'), {
        scale: 0.92,
        opacity: 0,
        duration: 0.4,
        ease: 'power3.out'
      });
    } else {
      gsap.to(resumeModal.querySelector('.glass-card'), {
        scale: 0.95,
        opacity: 0,
        duration: 0.25,
        onComplete: () => {
          resumeModal.classList.remove('flex');
          resumeModal.classList.add('hidden');
          resumeIframe.src = ''; // reset source
        }
      });
    }
  };


  // ==================== 15. CORE GSAP ENTRY & SCROLL TRIGGER REVEALS ====================
  function triggerHeroAnimations() {
    gsap.from('.profile-glow-wrapper', {
      scale: 0.8,
      opacity: 0,
      duration: 1.1,
      ease: 'power3.out'
    });

    gsap.from('#hero h1', {
      y: 50,
      opacity: 0,
      duration: 0.9,
      delay: 0.15,
      ease: 'back.out(1.4)'
    });

    gsap.from('#hero p', {
      y: 30,
      opacity: 0,
      duration: 0.8,
      delay: 0.35,
      ease: 'power3.out'
    });

    gsap.from('#hero .btn-cyber, #hero a', {
      scale: 0.85,
      opacity: 0,
      duration: 0.65,
      stagger: 0.1,
      delay: 0.5,
      ease: 'back.out(1.8)'
    });

    gsap.from('header', {
      y: -50,
      opacity: 0,
      duration: 0.9,
      delay: 0.4,
      ease: 'power3.out'
    });
  }

  // Register GSAP ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);

  // General Section Heading Reveals
  const sectionHeadings = document.querySelectorAll('.section-heading');
  sectionHeadings.forEach(heading => {
    gsap.from(heading, {
      scrollTrigger: {
        trigger: heading,
        start: 'top 88%',
        toggleActions: 'play none none none'
      },
      y: 35,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    });
  });

  // About Section card animations
  gsap.from('#about .lg\\:col-span-5', {
    scrollTrigger: {
      trigger: '#about',
      start: 'top 78%'
    },
    x: -60,
    opacity: 0,
    duration: 0.95,
    ease: 'power3.out'
  });

  gsap.from('#about .lg\\:col-span-7', {
    scrollTrigger: {
      trigger: '#about',
      start: 'top 78%'
    },
    x: 60,
    opacity: 0,
    duration: 0.95,
    ease: 'power3.out'
  });

  // Education cards timeline reveals
  const timelineItems = document.querySelectorAll('.timeline-item');
  timelineItems.forEach((item, idx) => {
    gsap.from(item, {
      scrollTrigger: {
        trigger: item,
        start: 'top 82%'
      },
      x: -45,
      opacity: 0,
      duration: 0.8,
      delay: idx * 0.1,
      ease: 'power3.out'
    });
  });

  // Skills loading
  gsap.from('.skill-card', {
    scrollTrigger: {
      trigger: '#skills',
      start: 'top 80%'
    },
    y: 40,
    opacity: 0,
    duration: 0.8,
    stagger: 0.08,
    ease: 'power3.out',
    onComplete: () => {
      // Animate circular meters
      const skillRings = document.querySelectorAll('.glow-ring');
      skillRings.forEach(ring => {
        const percent = ring.getAttribute('data-percent');
        const offset = 283 - (283 * percent) / 100;
        ring.style.strokeDashoffset = offset;
      });
    }
  });

  const skillFills = document.querySelectorAll('.progress-bar-fill');
  skillFills.forEach(fill => {
    const percent = fill.getAttribute('data-percent');
    gsap.to(fill, {
      scrollTrigger: {
        trigger: '#skills',
        start: 'top 80%'
      },
      width: `${percent}%`,
      duration: 1.4,
      ease: 'power2.out'
    });
  });

  // Projects reveals
  gsap.from('.project-card', {
    scrollTrigger: {
      trigger: '#projects',
      start: 'top 78%'
    },
    y: 50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.12,
    ease: 'power3.out'
  });

  // Experience container
  gsap.from('#experience .glass-card', {
    scrollTrigger: {
      trigger: '#experience',
      start: 'top 80%'
    },
    scale: 0.95,
    opacity: 0,
    duration: 0.85,
    ease: 'back.out(1.2)'
  });


  // ==================== 16. MOBILE MENU & NAVIGATION LINK HIGHLIGHTING ====================
  const burgerMenuBtn = document.getElementById('burger-menu');
  const mobileNav = document.getElementById('mobile-nav');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');

  burgerMenuBtn.addEventListener('click', () => {
    const isExpanded = burgerMenuBtn.getAttribute('aria-expanded') === 'true';
    burgerMenuBtn.setAttribute('aria-expanded', !isExpanded);
    mobileNav.classList.toggle('hidden');
    mobileNav.classList.toggle('flex');
  });

  const mobileNavLinks = mobileNav.querySelectorAll('a');
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.add('hidden');
      mobileNav.classList.remove('flex');
      burgerMenuBtn.setAttribute('aria-expanded', 'false');
    });
  });

  // Smooth scroll offset highlighter
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.clientHeight;
      if (window.scrollY >= (top - 240)) {
        current = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('text-neonCyan', 'border-b-2', 'border-neonCyan');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('text-neonCyan', 'border-b-2', 'border-neonCyan');
      }
    });
  });


  // ==================== 17. CONTACT FORM INTERACTIVE HANDLER ====================
  const contactForm = document.getElementById('cyber-contact-form');
  const formStatus = document.getElementById('form-status');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalContent = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="inline-flex items-center gap-2">
        <i class="fa-solid fa-spinner animate-spin"></i>
        TRANSMITTING CORE DATA PACKETS...
      </span>
    `;

    setTimeout(() => {
      // Transmit Secured feedback
      submitBtn.innerHTML = `<i class="fa-solid fa-check"></i> LINK SECURED & TRANSMITTED`;
      submitBtn.classList.remove('btn-cyber-primary');
      submitBtn.style.borderColor = '#39ff14';
      submitBtn.style.color = '#39ff14';
      submitBtn.style.boxShadow = '0 0 20px #39ff14';

      formStatus.classList.remove('hidden');
      formStatus.textContent = '[SUCCESS] SECURE TRANSCEIVER LINK ONLINE: MESSAGE DELIVERED TO DEEPAN\'S TERMINAL.';
      formStatus.style.color = '#39ff14';
      
      // Reset form controls
      setTimeout(() => {
        contactForm.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalContent;
        submitBtn.style = '';
        submitBtn.classList.add('btn-cyber-primary');
        formStatus.classList.add('hidden');
      }, 5000);

    }, 2000);
  });

  // Re-run listener highlights
  initCursorHovers();
});
