// FILE: frontend/js/home.js
document.addEventListener("DOMContentLoaded", () => {
  renderParticles();

  // Fill in icon-based elements on the home page
  const heroBadge = document.getElementById("heroBadge");
  if (heroBadge) {
    heroBadge.innerHTML = Icons.svg("sparkle", { size: 14 }) + " AI-Powered Logistics Platform";
  }

  const heroIconCircle = document.getElementById("heroIconCircle");
  if (heroIconCircle) heroIconCircle.innerHTML = Icons.svg("ship", { size: 120 });

  const heroBadge1 = document.getElementById("heroBadge1");
  if (heroBadge1) heroBadge1.innerHTML = Icons.svg("check", { size: 16 }) + " Booking Confirmed";

  const heroBadge2 = document.getElementById("heroBadge2");
  if (heroBadge2) heroBadge2.innerHTML = Icons.svg("chart", { size: 16 }) + " +18% Savings";

  const stepIcon1 = document.getElementById("stepIcon1");
  if (stepIcon1) stepIcon1.innerHTML = Icons.svg("search", { size: 28 });

  const stepIcon2 = document.getElementById("stepIcon2");
  if (stepIcon2) stepIcon2.innerHTML = Icons.svg("sparkle", { size: 28 });

  const stepIcon3 = document.getElementById("stepIcon3");
  if (stepIcon3) stepIcon3.innerHTML = Icons.svg("truck", { size: 28 });

  const featIcon1 = document.getElementById("featIcon1");
  if (featIcon1) featIcon1.innerHTML = Icons.svg("sparkle", { size: 24 });

  const featIcon2 = document.getElementById("featIcon2");
  if (featIcon2) featIcon2.innerHTML = Icons.svg("mapPin", { size: 24 });

  const featIcon3 = document.getElementById("featIcon3");
  if (featIcon3) featIcon3.innerHTML = Icons.svg("shield", { size: 24 });

  const featIcon4 = document.getElementById("featIcon4");
  if (featIcon4) featIcon4.innerHTML = Icons.svg("chart", { size: 24 });

  ["stars1", "stars2", "stars3"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = Icons.svg("star", { size: 16 }).repeat(5);
  });

  initScrollReveal();
  initCounters();
  initTestimonialCarousel();
});

// Lightweight animated background particles for hero sections.
// Renders a fixed canvas of slow-moving dots behind the hero content.
function renderParticles(targetId = "particles-root") {
  const container = document.getElementById(targetId);
  if (!container) return;

  const canvas = document.createElement("canvas");
  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";
  container.style.position = "relative";
  container.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  let particles = [];

  function resize() {
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
  }

  function createParticles() {
    const count = Math.floor((canvas.width * canvas.height) / 28000);
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 1,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
    }));
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(37, 99, 235, 0.25)";
    particles.forEach((p) => {
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(tick);
  }

  resize();
  createParticles();
  tick();

  window.addEventListener("resize", () => {
    resize();
    createParticles();
  });
}

// Fade/slide elements into view as the user scrolls
function initScrollReveal() {
  const items = document.querySelectorAll(".reveal");
  if (items.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  items.forEach((el) => observer.observe(el));
}

// Animate the stat numbers in the hero section once visible
function initCounters() {
  const counters = document.querySelectorAll(".counter");
  if (counters.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const duration = 1200;
        const start = performance.now();

        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          el.textContent = Math.floor(progress * target).toLocaleString();
          if (progress < 1) {
            requestAnimationFrame(tick);
          } else {
            el.textContent = target.toLocaleString() + (el.dataset.suffix || "");
          }
        }
        requestAnimationFrame(tick);
        observer.unobserve(el);
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach((el) => observer.observe(el));
}

// Simple dot-controlled testimonial carousel
function initTestimonialCarousel() {
  const track = document.getElementById("testimonialTrack");
  const dots = document.querySelectorAll(".carousel-dot");
  if (!track || dots.length === 0) return;

  let index = 0;
  let autoTimer = null;

  function goTo(i) {
    index = i;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, di) => d.classList.toggle("active", di === index));
  }

  dots.forEach((dot, i) =>
    dot.addEventListener("click", () => {
      goTo(i);
      restartAutoplay();
    })
  );

  function restartAutoplay() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo((index + 1) % dots.length), 6000);
  }

  restartAutoplay();
}

// Shared lightweight toast helper (used by footer newsletter + future pages)
function showToast(message, type = "info") {
  let container = document.getElementById("cv-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "cv-toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => toast.classList.add("toast-out"), 3200);
  setTimeout(() => toast.remove(), 3600);
}