// Giant pixel-confetti celebration for when the whole checklist is done.
// Square (un-rounded) particles to match the site's pixel aesthetic.

let rafId = null;

const COLORS = [
  "#ff5d6c", "#ffe27a", "#5bd96a", "#7ce0ff",
  "#c879ff", "#ff9f43", "#ffffff",
];

export function celebrate(durationMs = 6500) {
  let canvas = document.getElementById("confetti-canvas");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "confetti-canvas";
    canvas.style.position = "fixed";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "5000";
    document.body.appendChild(canvas);
  }

  const ctx = canvas.getContext("2d");
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.imageSmoothingEnabled = false;
  }
  resize();
  window.addEventListener("resize", resize);

  const W = () => canvas.width;
  const H = () => canvas.height;
  const particles = [];

  function makeParticle(p) {
    particles.push({
      g: 0.16,
      drag: 0.995,
      size: 6 + Math.random() * 9,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.35,
      ...p,
    });
  }

  // Two confetti cannons firing up-and-inward from the bottom corners.
  function cannon(x, angle) {
    for (let i = 0; i < 140; i++) {
      const a = angle + (Math.random() - 0.5) * (Math.PI / 4);
      const sp = 9 + Math.random() * 13;
      makeParticle({ x, y: H() + 10, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp });
    }
  }
  cannon(0, -Math.PI / 3);
  cannon(W(), (-2 * Math.PI) / 3);

  const start = performance.now();
  let lastRain = 0;

  function frame(now) {
    const elapsed = now - start;
    ctx.clearRect(0, 0, W(), H());

    // Steady confetti rain from the top for the first few seconds.
    if (elapsed < 4000 && now - lastRain > 35) {
      lastRain = now;
      for (let i = 0; i < 7; i++) {
        makeParticle({
          x: Math.random() * W(),
          y: -12,
          vx: (Math.random() - 0.5) * 2.5,
          vy: 2 + Math.random() * 3,
          g: 0.1,
          drag: 1,
        });
      }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.vy += p.g;
      p.vx *= p.drag;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;

      if (p.y > H() + 24) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    }

    if (elapsed < durationMs || particles.length > 0) {
      rafId = requestAnimationFrame(frame);
    } else {
      window.removeEventListener("resize", resize);
      rafId = null;
      canvas.remove();
    }
  }

  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(frame);

  showBanner();
}

function showBanner() {
  const banner = document.createElement("div");
  banner.textContent = "\u2605 YOU EXPLORED EVERYTHING! \u2605";
  Object.assign(banner.style, {
    position: "fixed",
    top: "20%",
    left: "50%",
    zIndex: "5001",
    pointerEvents: "none",
    background: "#2b2440",
    color: "#ffe27a",
    border: "4px solid #ffffff",
    boxShadow: "0 0 0 4px #2b2440, 8px 8px 0 0 rgba(0, 0, 0, 0.5)",
    padding: "1rem 2rem",
    fontSize: "clamp(1.2rem, 5vw, 2.6rem)",
    letterSpacing: "2px",
    textShadow: "3px 3px 0 #000",
    whiteSpace: "nowrap",
    textAlign: "center",
  });
  document.body.appendChild(banner);

  const anim = banner.animate(
    [
      { transform: "translate(-50%, -50%) scale(0)", opacity: 0 },
      { transform: "translate(-50%, -50%) scale(1.15)", opacity: 1, offset: 0.15 },
      { transform: "translate(-50%, -50%) scale(1)", opacity: 1, offset: 0.25 },
      { transform: "translate(-50%, -50%) scale(1)", opacity: 1, offset: 0.82 },
      { transform: "translate(-50%, -50%) scale(1)", opacity: 0 },
    ],
    { duration: 4800, easing: "ease-out" }
  );
  anim.onfinish = () => banner.remove();
}
