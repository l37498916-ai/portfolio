document.querySelectorAll(".asset-frame img").forEach((image) => {
  image.addEventListener("load", () => {
    image.closest(".asset-frame")?.classList.add("has-image");
  });

  image.addEventListener("error", () => {
    image.remove();
  });
});

const revealSections = document.querySelectorAll(".reveal-section");

if (revealSections.length > 0) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.22 }
  );

  revealSections.forEach((section) => revealObserver.observe(section));
}

document.querySelectorAll("[data-about-objects]").forEach((stage) => {
  const objects = Array.from(stage.querySelectorAll("[data-object-panel]"));
  const drawer = stage.querySelector(".about-object-drawer");
  const panels = {
    me: {
      label: "About me",
      title: "关于我",
      summary: "艺术与科技专业学生，探索 AI 创意体验、智能视觉叙事与沉浸式交互。",
      items: ["教育背景：广州美术学院", "专业方向：AI × 叙事 × 交互", "职业目标：AI 产品设计 / 创意工程"],
    },
    tools: {
      label: "Tools",
      title: "工具与技能",
      summary: "用 AI 和原型工具把想法推进到可演示、可测试、可继续迭代的状态。",
      items: ["Figma", "Vibe Coding", "Godot", "Unity", "Arduino"],
    },
    projects: {
      label: "Projects",
      title: "项目经历",
      summary: "项目围绕叙事型原型、空间化教学体验和跨领域交互装置展开。",
      items: ["第零夜", "玉雕虚拟仿真", "AI 互动装置"],
    },
    methods: {
      label: "Methods",
      title: "方法论",
      summary: "把模糊灵感拆解成可查询、可筛选、可验证的创作路径。",
      items: ["调研", "生成", "筛选", "原型验证"],
    },
  };

  function setDefaultState() {
    stage.classList.remove("has-selection");
    objects.forEach((object) => {
      object.classList.remove("is-active");
      object.setAttribute("aria-pressed", "false");
    });

    if (drawer) {
      drawer.innerHTML = '<div class="about-object-prompt">点击左侧物件，查看我的背景、工具、项目和方法。</div>';
    }
  }

  function activateObject(target) {
    const content = panels[target];
    if (!content || !drawer) {
      return;
    }

    stage.classList.add("has-selection");
    objects.forEach((object) => {
      const isActive = object.dataset.objectPanel === target;
      object.classList.toggle("is-active", isActive);
      object.setAttribute("aria-pressed", String(isActive));
    });

    drawer.innerHTML = `
      <article class="about-object-card" data-about-card>
        <button class="about-object-close" type="button" aria-label="关闭信息卡片">×</button>
        <span>${content.label}</span>
        <h3>${content.title}</h3>
        <p>${content.summary}</p>
        <ul>${content.items.map((item) => `<li>${item}</li>`).join("")}</ul>
      </article>
    `;
    drawer.querySelector(".about-object-close")?.addEventListener("click", setDefaultState);
  }

  setDefaultState();
  objects.forEach((object) => {
    object.addEventListener("click", () => activateObject(object.dataset.objectPanel));
  });
});

const detailRevealSections = document.querySelectorAll(".detail-reveal");

if (detailRevealSections.length > 0) {
  const detailObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          detailObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  detailRevealSections.forEach((section) => detailObserver.observe(section));
}

document.querySelectorAll(".reading-progress").forEach((progress) => {
  const value = progress.querySelector("strong");
  let ticking = false;

  function updateProgress() {
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const ratio = Math.min(1, Math.max(0, window.scrollY / scrollable));
    progress.style.setProperty("--read-progress", ratio.toFixed(4));
    if (value) {
      value.textContent = `${Math.round(ratio * 100)}%`;
    }
    ticking = false;
  }

  function requestProgressUpdate() {
    if (ticking) {
      return;
    }
    ticking = true;
    requestAnimationFrame(updateProgress);
  }

  updateProgress();
  window.addEventListener("scroll", requestProgressUpdate, { passive: true });
  window.addEventListener("resize", requestProgressUpdate);
});

document.querySelectorAll("[data-zero-marquee] .zero-marquee-row").forEach((row) => {
  const track = row.querySelector(".zero-marquee-track");
  const set = row.querySelector(".zero-marquee-set");

  if (!track || !set) {
    return;
  }

  const speed = Number(row.dataset.speed);
  if (Number.isFinite(speed) && speed > 0) {
    row.style.setProperty("--marquee-duration", `${speed}s`);
  }

  if (track.querySelectorAll(".zero-marquee-set").length === 1) {
    const clone = set.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);
  }
});

const canvas = document.querySelector("#opening-canvas");

if (canvas) {
  const context = canvas.getContext("2d");
  const scene = canvas.closest(".hero");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let frame = 0;
  let particles = [];
  let pointer = { x: 0.72, y: 0.34, active: false };
  let trails = [];

  const palette = ["#256fe6", "#4f94ff", "#8bb6ff", "#aab7c8", "#ffffff"];

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    const particleCount = width < 640 ? Math.max(42, Math.floor(width / 18)) : Math.max(70, Math.floor(width / 13));
    particles = Array.from({ length: particleCount }, (_, index) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 0.8 + Math.random() * 2.4,
      speed: 0.12 + Math.random() * 0.42,
      phase: Math.random() * Math.PI * 2,
      color: palette[index % palette.length],
    }));
  }

  function drawMist(time) {
    context.save();
    const drift = Math.sin(time * 0.00035) * 46;
    const gradientA = context.createRadialGradient(width * 0.74 + drift, height * 0.25, 20, width * 0.74 + drift, height * 0.25, width * 0.36);
    gradientA.addColorStop(0, "rgba(53,119,232,0.28)");
    gradientA.addColorStop(0.55, "rgba(120,169,255,0.16)");
    gradientA.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = gradientA;
    context.fillRect(0, 0, width, height);

    const gradientB = context.createRadialGradient(width * 0.9, height * 0.8 + drift * 0.4, 10, width * 0.9, height * 0.8 + drift * 0.4, width * 0.3);
    gradientB.addColorStop(0, "rgba(139,182,255,0.2)");
    gradientB.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = gradientB;
    context.fillRect(0, 0, width, height);
    context.restore();
  }

  function drawParticles(time) {
    particles.forEach((particle, index) => {
      particle.y -= particle.speed;
      particle.x += Math.sin(time * 0.0012 + particle.phase) * 0.38;

      if (pointer.active) {
        const pointerX = pointer.x * width;
        const pointerY = pointer.y * height;
        const dx = particle.x - pointerX;
        const dy = particle.y - pointerY;
        const distance = Math.hypot(dx, dy);
        const pointerRange = width < 640 ? 180 : 260;
        if (distance < pointerRange && distance > 0) {
          const force = (1 - distance / pointerRange) * 2.6;
          particle.x += (dx / distance) * force;
          particle.y += (dy / distance) * force;
        }
      }

      if (particle.y < -20) {
        particle.y = height + 20;
        particle.x = Math.random() * width;
      }

      context.beginPath();
      context.fillStyle = particle.color;
      context.globalAlpha = index % 4 === 0 ? 0.72 : 0.4;
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fill();
    });
    context.globalAlpha = 1;

    context.strokeStyle = "rgba(53,119,232,0.22)";
    context.lineWidth = 1;
    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        const a = particles[i];
        const b = particles[j];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        const linkRange = width < 640 ? 92 : 116;
        if (distance < linkRange) {
          context.globalAlpha = (1 - distance / linkRange) * 0.8;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
        }
      }
    }
    context.globalAlpha = 1;
  }

  function drawTrails() {
    for (let index = trails.length - 1; index >= 0; index -= 1) {
      const trail = trails[index];
      trail.life -= 0.014;
      trail.radius *= 0.992;
      trail.x += trail.vx;
      trail.y += trail.vy;
      trail.vx *= 0.985;
      trail.vy *= 0.985;

      if (trail.life <= 0) {
        trails.splice(index, 1);
        continue;
      }

      context.globalAlpha = trail.life;
      context.fillStyle = trail.color;
      context.beginPath();
      context.arc(trail.x, trail.y, trail.radius, 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;
  }

  function render(time = 0) {
    frame = requestAnimationFrame(render);
    context.clearRect(0, 0, width, height);
    drawMist(time);
    drawTrails();
    drawParticles(time);
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  scene?.addEventListener("pointermove", (event) => {
    const rect = scene.getBoundingClientRect();
    pointer = {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
      active: true,
    };
    scene.style.setProperty("--cursor-x", `${pointer.x * 100}%`);
    scene.style.setProperty("--cursor-y", `${pointer.y * 100}%`);

    for (let i = 0; i < 4; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 1.8;
      trails.push({
        x: pointer.x * width + (Math.random() - 0.5) * 10,
        y: pointer.y * height + (Math.random() - 0.5) * 10,
        radius: 1.6 + Math.random() * 3.2,
        life: 0.82 + Math.random() * 0.36,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: palette[Math.floor(Math.random() * palette.length)],
      });
    }

    if (trails.length > 150) {
      trails.splice(0, trails.length - 150);
    }
  });

  scene?.addEventListener("pointerleave", () => {
    pointer.active = false;
  });

  if (!prefersReducedMotion.matches) {
    render();
  } else {
    drawMist(0);
    drawTrails();
    drawParticles(0);
  }

  window.addEventListener("beforeunload", () => cancelAnimationFrame(frame));
}

document.querySelectorAll(".ambient-canvas").forEach((ambientCanvas) => {
  const context = ambientCanvas.getContext("2d");
  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let frame = 0;
  let particles = [];
  const palette = ["#3577e8", "#78a9ff", "#b8c3d4", "#ffffff"];
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function resizeAmbientCanvas() {
    const rect = ambientCanvas.getBoundingClientRect();
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    ambientCanvas.width = Math.floor(width * pixelRatio);
    ambientCanvas.height = Math.floor(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    particles = Array.from({ length: Math.max(42, Math.floor(width / 24)) }, (_, index) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 0.7 + Math.random() * 1.9,
      speed: 0.08 + Math.random() * 0.28,
      phase: Math.random() * Math.PI * 2,
      color: palette[index % palette.length],
    }));
  }

  function drawAmbientMist(time) {
    const drift = Math.sin(time * 0.00028) * 40;
    const gradient = context.createRadialGradient(width * 0.8 + drift, height * 0.18, 20, width * 0.8 + drift, height * 0.18, width * 0.34);
    gradient.addColorStop(0, "rgba(53,119,232,0.16)");
    gradient.addColorStop(0.6, "rgba(120,169,255,0.08)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
  }

  function drawAmbientParticles(time) {
    particles.forEach((particle, index) => {
      particle.y -= particle.speed;
      particle.x += Math.sin(time * 0.001 + particle.phase) * 0.22;

      if (particle.y < -20) {
        particle.y = height + 20;
        particle.x = Math.random() * width;
      }

      context.beginPath();
      context.fillStyle = particle.color;
      context.globalAlpha = index % 4 === 0 ? 0.42 : 0.24;
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fill();
    });

    context.globalAlpha = 1;
    context.strokeStyle = "rgba(53,119,232,0.08)";
    context.lineWidth = 1;
    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        const a = particles[i];
        const b = particles[j];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance < 98) {
          context.globalAlpha = (1 - distance / 98) * 0.45;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
        }
      }
    }
    context.globalAlpha = 1;
  }

  function renderAmbient(time = 0) {
    frame = requestAnimationFrame(renderAmbient);
    context.clearRect(0, 0, width, height);
    drawAmbientMist(time);
    drawAmbientParticles(time);
  }

  resizeAmbientCanvas();
  window.addEventListener("resize", resizeAmbientCanvas);

  if (!prefersReducedMotion.matches) {
    renderAmbient();
  } else {
    drawAmbientMist(0);
    drawAmbientParticles(0);
  }

  window.addEventListener("beforeunload", () => cancelAnimationFrame(frame));
});

document.querySelectorAll(".tech-evidence-board").forEach((board) => {
  const cards = Array.from(board.querySelectorAll(".tech-media-card"));

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      cards.forEach((item) => {
        const isSelected = item === card;
        item.classList.toggle("is-selected", isSelected);
        item.setAttribute("aria-pressed", String(isSelected));
      });
    });
  });
});
