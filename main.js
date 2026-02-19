/* ============================================================
   main.js — Portfolio Logic
   WebGL (Three.js) | GSAP ScrollTrigger | Typewriter | Data
   ============================================================ */

// ── 1. LUCIDE ICONS ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
});

// ── 2. WEBGL ANIMATED MESH BACKGROUND ───────────────────────
(function initWebGL() {
  const canvas = document.getElementById('webgl-canvas');
  if (!window.THREE) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 4);

  // Plane geometry with many segments for wave effect
  const geo = new THREE.PlaneGeometry(10, 10, 60, 60);
  const positions = geo.attributes.position;

  // Store original Z values for wave animation
  const origZ = new Float32Array(positions.count);
  for (let i = 0; i < positions.count; i++) {
    origZ[i] = positions.getZ(i);
  }

  const mat = new THREE.MeshStandardMaterial({
    color: 0x7c3aed,
    wireframe: true,
    opacity: 0.18,
    transparent: true,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 3.5;
  mesh.position.y = -1.5;
  scene.add(mesh);

  // Ambient & point lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const pLight = new THREE.PointLight(0x06b6d4, 2, 20);
  pLight.position.set(3, 3, 3);
  scene.add(pLight);
  const pLight2 = new THREE.PointLight(0x7c3aed, 2, 20);
  pLight2.position.set(-3, -2, 2);
  scene.add(pLight2);

  // Mouse parallax
  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Animation loop
  let clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Wave deformation
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const wave = Math.sin(x * 0.8 + t * 0.6) * 0.15 +
        Math.sin(y * 0.6 + t * 0.4) * 0.12 +
        Math.sin((x + y) * 0.5 + t * 0.8) * 0.08;
      positions.setZ(i, origZ[i] + wave);
    }
    positions.needsUpdate = true;
    geo.computeVertexNormals();

    // Subtle rotation + mouse parallax
    mesh.rotation.z = t * 0.02;
    camera.position.x += (mouseX * 0.3 - camera.position.x) * 0.04;
    camera.position.y += (-mouseY * 0.2 - camera.position.y) * 0.04;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }
  animate();
})();


// ── 3. GSAP ScrollTrigger SETUP ─────────────────────────────
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
}

// Scroll reveal using IntersectionObserver
(function initReveal() {
  const targets = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = el.dataset.delay || 0;
        setTimeout(() => el.classList.add('revealed'), delay);
        io.unobserve(el);
      }
    });
  }, { threshold: 0.15 });

  // Add stagger delays per section
  document.querySelectorAll('.section').forEach(section => {
    const revealEls = section.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
    revealEls.forEach((el, i) => {
      el.dataset.delay = i * 100;
    });
  });

  targets.forEach(el => io.observe(el));
})();


// ── 4. NAVBAR — active section tracking ─────────────────────
(function initNavbar() {
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  const links = document.querySelectorAll('.nav-link');

  navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));

  // Close on link click
  links.forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Active link on scroll
  const sections = document.querySelectorAll('section[id]');
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-link[data-section="${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => io.observe(s));
})();


// ── 5. TYPEWRITER EFFECT ────────────────────────────────────
(function initTypewriter() {
  const roles = [
    'beautiful UIs.',
    'scalable backends.',
    'smooth animations.',
    'great products.',
    'immersive WebGL.',
  ];
  const el = document.getElementById('typewriter');
  let ri = 0, ci = 0, deleting = false;

  function type() {
    const word = roles[ri];
    if (!deleting) {
      el.textContent = word.slice(0, ++ci);
      if (ci === word.length) {
        deleting = true;
        setTimeout(type, 1600);
        return;
      }
    } else {
      el.textContent = word.slice(0, --ci);
      if (ci === 0) {
        deleting = false;
        ri = (ri + 1) % roles.length;
      }
    }
    setTimeout(type, deleting ? 45 : 80);
  }
  setTimeout(type, 800);
})();


// ── 6. COUNTER ANIMATION ────────────────────────────────────
(function initCounters() {
  const counters = document.querySelectorAll('.stat-num');
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = +el.dataset.target;
      let cur = 0;
      const step = target / 50;
      const inc = () => {
        cur = Math.min(cur + step, target);
        el.textContent = Math.ceil(cur);
        if (cur < target) requestAnimationFrame(inc);
      };
      inc();
      io.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => io.observe(c));
})();


// ── 7. HERO GSAP entrance ───────────────────────────────────
window.addEventListener('load', () => {
  if (!window.gsap) return;
  gsap.from('.hero-content > *', {
    y: 50,
    opacity: 0,
    duration: 0.9,
    stagger: 0.12,
    ease: 'power3.out',
    delay: 0.3,
  });
});


// ── 8. SKILLS DATA & RENDER ─────────────────────────────────
const skillsData = [
  { name: 'HTML5', pct: 95, cat: 'frontend', emoji: '🌐', color: '#e34f26' },
  { name: 'CSS3', pct: 90, cat: 'frontend', emoji: '🎨', color: '#1572b6' },
  { name: 'JavaScript', pct: 88, cat: 'frontend', emoji: '⚡', color: '#f7df1e' },
  { name: 'React', pct: 85, cat: 'frontend', emoji: '⚛️', color: '#61dafb' },
  { name: 'Three.js', pct: 70, cat: 'frontend', emoji: '🔮', color: '#ff6b35' },
  { name: 'GSAP', pct: 78, cat: 'frontend', emoji: '🎬', color: '#88ce02' },
  { name: 'Node.js', pct: 82, cat: 'backend', emoji: '🟢', color: '#339933' },
  { name: 'Python', pct: 80, cat: 'backend', emoji: '🐍', color: '#3776ab' },
  { name: 'MongoDB', pct: 75, cat: 'backend', emoji: '🍃', color: '#47a248' },
  { name: 'PostgreSQL', pct: 72, cat: 'backend', emoji: '🐘', color: '#336791' },
  { name: 'Git', pct: 90, cat: 'tools', emoji: '🌿', color: '#f05032' },
  { name: 'Docker', pct: 65, cat: 'tools', emoji: '🐳', color: '#2496ed' },
  { name: 'Figma', pct: 80, cat: 'tools', emoji: '🖌️', color: '#f24e1e' },
  { name: 'VS Code', pct: 95, cat: 'tools', emoji: '💻', color: '#007acc' },
];

function renderSkills(cat) {
  const grid = document.getElementById('skills-grid');
  const filtered = cat === 'all' ? skillsData : skillsData.filter(s => s.cat === cat);
  grid.innerHTML = filtered.map((s, i) => `
    <div class="skill-card" style="animation-delay:${i * 60}ms">
      <div class="skill-header">
        <div class="skill-icon" style="background:${s.color}22;border:1px solid ${s.color}44">
          <span>${s.emoji}</span>
        </div>
        <span class="skill-name">${s.name}</span>
      </div>
      <div class="skill-bar-wrap">
        <div class="skill-bar" data-pct="${s.pct}"></div>
      </div>
      <div class="skill-pct">${s.pct}%</div>
    </div>
  `).join('');

  // Animate bars
  requestAnimationFrame(() => {
    document.querySelectorAll('.skill-bar').forEach(bar => {
      setTimeout(() => { bar.style.width = bar.dataset.pct + '%'; }, 200);
    });
  });
}

renderSkills('all');

document.querySelectorAll('.cat-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderSkills(btn.dataset.cat);
  });
});


// ── 9. PROJECTS DATA & RENDER ────────────────────────────────
const projectsData = [
  {
    title: '3D Portfolio Visualizer',
    desc: 'An interactive 3D portfolio built with Three.js and WebGL, featuring animated mesh environments and smooth transitions.',
    tags: ['Three.js', 'WebGL', 'GSAP'],
    filter: 'web',
    emoji: '🌐',
    bg: 'linear-gradient(135deg,#0f0035,#1a0050)',
    github: '#',
    live: '#',
  },
  {
    title: 'E-Commerce Platform',
    desc: 'Full-stack e-commerce with React, Node.js, and Stripe integration. Real-time inventory and admin dashboard.',
    tags: ['React', 'Node.js', 'MongoDB', 'Stripe'],
    filter: 'web',
    emoji: '🛍️',
    bg: 'linear-gradient(135deg,#001a2e,#002244)',
    github: '#',
    live: '#',
  },
  {
    title: 'AI Chat Interface',
    desc: 'Sleek conversational AI frontend with streaming responses, markdown rendering, and persistent chat history.',
    tags: ['React', 'WebSockets', 'OpenAI API'],
    filter: 'web',
    emoji: '🤖',
    bg: 'linear-gradient(135deg,#001a00,#002800)',
    github: '#',
    live: '#',
  },
  {
    title: 'Mobile Fitness App',
    desc: 'Cross-platform fitness tracker with workout plans, progress charts, and social challenges.',
    tags: ['React Native', 'Firebase', 'Redux'],
    filter: 'mobile',
    emoji: '💪',
    bg: 'linear-gradient(135deg,#1a0000,#2d0000)',
    github: '#',
    live: '#',
  },
  {
    title: 'Design System',
    desc: 'A comprehensive UI component library with dark/light mode, accessibility, and Storybook documentation.',
    tags: ['Figma', 'React', 'Storybook'],
    filter: 'design',
    emoji: '🎨',
    bg: 'linear-gradient(135deg,#1a0020,#2d0035)',
    github: '#',
    live: '#',
  },
  {
    title: 'Real-time Dashboard',
    desc: 'Analytics dashboard with live data, dynamic charts, and WebSocket-powered notifications.',
    tags: ['React', 'D3.js', 'WebSockets'],
    filter: 'web',
    emoji: '📊',
    bg: 'linear-gradient(135deg,#001818,#002525)',
    github: '#',
    live: '#',
  },
];

function renderProjects(filter) {
  const grid = document.getElementById('projects-grid');
  const filtered = filter === 'all' ? projectsData : projectsData.filter(p => p.filter === filter);
  grid.innerHTML = filtered.map(p => `
    <div class="project-card">
      <div class="project-image" style="background:${p.bg}">
        <div class="project-image-inner">${p.emoji}</div>
        <div class="project-overlay"></div>
      </div>
      <div class="project-body">
        <h3 class="project-title">${p.title}</h3>
        <p class="project-desc">${p.desc}</p>
        <div class="project-tags">
          ${p.tags.map(t => `<span class="project-tag">${t}</span>`).join('')}
        </div>
        <div class="project-links">
          <a href="${p.github}" class="proj-link" target="_blank">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
            GitHub
          </a>
          <a href="${p.live}" class="proj-link" target="_blank">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Live Demo
          </a>
        </div>
      </div>
    </div>
  `).join('');
}

renderProjects('all');

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderProjects(btn.dataset.filter);
  });
});


// ── 10. CERTIFICATES DATA & RENDER ──────────────────────────
const certsData = [
  {
    title: 'AWS Certified Developer',
    org: 'Amazon Web Services',
    year: '2023',
    emoji: '☁️',
    desc: 'Expertise in developing, deploying, and debugging cloud-based applications using AWS.',
    link: '#',
  },
  {
    title: 'Meta Frontend Developer',
    org: 'Meta / Coursera',
    year: '2023',
    emoji: '⚛️',
    desc: 'Professional certificate covering React, UI/UX principles, and frontend best practices.',
    link: '#',
  },
  {
    title: 'Google UX Design',
    org: 'Google / Coursera',
    year: '2022',
    emoji: '🎨',
    desc: 'Foundational UX design including empathy mapping, wireframing, prototyping, and usability testing.',
    link: '#',
  },
  {
    title: 'MongoDB Developer',
    org: 'MongoDB University',
    year: '2022',
    emoji: '🍃',
    desc: 'Advanced document modelling, aggregation pipelines, indexing strategies, and performance tuning.',
    link: '#',
  },
  {
    title: 'JavaScript Algorithms',
    org: 'freeCodeCamp',
    year: '2021',
    emoji: '⚡',
    desc: 'Data structures, algorithm design, and problem solving with vanilla JavaScript.',
    link: '#',
  },
  {
    title: 'Responsive Web Design',
    org: 'freeCodeCamp',
    year: '2021',
    emoji: '📱',
    desc: 'Modern HTML5 semantics, CSS Flexbox/Grid, accessibility, and responsive design patterns.',
    link: '#',
  },
];

const certsGrid = document.getElementById('certs-grid');
certsGrid.innerHTML = certsData.map(c => `
  <div class="cert-card">
    <div class="cert-inner">
      <div class="cert-front">
        <div class="cert-badge">${c.emoji}</div>
        <div class="cert-title">${c.title}</div>
        <div class="cert-org">${c.org}</div>
        <div class="cert-year">${c.year}</div>
        <div class="cert-year" style="color:var(--accent-2);font-size:0.72rem;margin-top:0.25rem;">Hover to flip ↻</div>
      </div>
      <div class="cert-back">
        <div class="cert-badge">${c.emoji}</div>
        <p>${c.desc}</p>
        <a href="${c.link}" class="btn btn-ghost" style="font-size:0.8rem;padding:0.4rem 1.2rem;">View Certificate</a>
      </div>
    </div>
  </div>
`).join('');


// ── 11. CONTACT FORM ─────────────────────────────────────────
(function initContactForm() {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const btnLabel = document.getElementById('btn-label');

  form.addEventListener('submit', e => {
    e.preventDefault();
    btnLabel.textContent = 'Sending…';
    submitBtn.disabled = true;

    setTimeout(() => {
      btnLabel.textContent = '✓ Message Sent!';
      submitBtn.style.background = 'linear-gradient(135deg,#059669,#047857)';
      form.reset();
      setTimeout(() => {
        btnLabel.textContent = 'Send Message';
        submitBtn.disabled = false;
        submitBtn.style.background = '';
      }, 3000);
    }, 1500);
  });
})();


// ── 12. GSAP SCROLL ANIMATIONS (if loaded) ──────────────────
window.addEventListener('load', () => {
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  // Skill cards stagger
  gsap.fromTo('.skill-card', { y: 30, opacity: 0 }, {
    y: 0, opacity: 1, duration: 0.6, stagger: 0.07, ease: 'power2.out',
    scrollTrigger: { trigger: '#skills', start: 'top 70%' },
  });

  // Project cards stagger
  gsap.fromTo('.project-card', { y: 40, opacity: 0 }, {
    y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: 'power2.out',
    scrollTrigger: { trigger: '#projects', start: 'top 70%' },
  });

  // Cert cards stagger  
  gsap.fromTo('.cert-card', { scale: 0.9, opacity: 0 }, {
    scale: 1, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'back.out(1.5)',
    scrollTrigger: { trigger: '#certificates', start: 'top 70%' },
  });
});


// ── 13. CURSOR GLOW ──────────────────────────────────────────
(function initCursorGlow() {
  const glow = document.getElementById('cursor-glow');
  if (!glow || window.matchMedia('(pointer:coarse)').matches) return;
  let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
  let tx = cx, ty = cy;

  window.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });

  (function animateGlow() {
    cx += (tx - cx) * 0.1;
    cy += (ty - cy) * 0.1;
    glow.style.left = cx + 'px';
    glow.style.top = cy + 'px';
    requestAnimationFrame(animateGlow);
  })();
})();


// ── 14. BACK TO TOP ──────────────────────────────────────────
(function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


// ── 15. PAGE TRANSITION (links to other pages) ───────────────
(function initPageTransition() {
  const overlay = document.getElementById('page-transition');
  if (!overlay) return;

  // Play exit animation on arrive
  setTimeout(() => {
    overlay.classList.add('out');
    overlay.addEventListener('animationend', () => {
      overlay.classList.remove('out');
    }, { once: true });
  }, 50);

  // Intercept same-origin page links (not # anchors, not _blank)
  document.querySelectorAll('a[href]:not([href^="#"]):not([target="_blank"])').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      e.preventDefault();
      overlay.classList.remove('out');
      overlay.classList.add('in');
      overlay.addEventListener('animationend', () => {
        window.location.href = href;
      }, { once: true });
    });
  });
})();

