const body = document.body;
const canvas = document.querySelector("#field");
const ctx = canvas.getContext("2d");
const modeButtons = document.querySelectorAll(".mode-button");
const zoneLetters = document.querySelectorAll(".zone-word button");
const copyButton = document.querySelector("#copyEmail");

let width = 0;
let height = 0;
let pointer = { x: 0, y: 0, active: false };
let particles = [];

function setSize() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function createParticles() {
  const count = Math.min(90, Math.max(42, Math.floor(width / 18)));
  particles = Array.from({ length: count }, (_, index) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.38,
    vy: (Math.random() - 0.5) * 0.38,
    size: 1 + Math.random() * 2,
    phase: index * 0.21
  }));
}

function draw() {
  ctx.clearRect(0, 0, width, height);
  const mode = body.dataset.mode || "orbit";

  particles.forEach((p, index) => {
    if (pointer.active) {
      const dx = pointer.x - p.x;
      const dy = pointer.y - p.y;
      const distance = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
      if (distance < 190) {
        p.vx -= (dx / distance) * 0.012;
        p.vy -= (dy / distance) * 0.012;
      }
    }

    p.x += p.vx + Math.sin(Date.now() * 0.001 + p.phase) * 0.08;
    p.y += p.vy + Math.cos(Date.now() * 0.001 + p.phase) * 0.08;
    p.vx *= 0.992;
    p.vy *= 0.992;

    if (p.x < -20) p.x = width + 20;
    if (p.x > width + 20) p.x = -20;
    if (p.y < -20) p.y = height + 20;
    if (p.y > height + 20) p.y = -20;

    const hue = mode === "night" ? 160 : mode === "focus" ? 285 : index % 3 === 0 ? 190 : 18;
    ctx.fillStyle = `hsla(${hue}, 92%, 68%, 0.54)`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();

    for (let j = index + 1; j < particles.length; j += 1) {
      const next = particles[j];
      const dx = p.x - next.x;
      const dy = p.y - next.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 105) {
        ctx.strokeStyle = `rgba(255,255,255,${0.09 * (1 - distance / 105)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(next.x, next.y);
        ctx.stroke();
      }
    }
  });

  requestAnimationFrame(draw);
}

function activateLetter(button) {
  button.classList.add("is-lit");
  window.setTimeout(() => button.classList.remove("is-lit"), 520);
}

function init() {
  body.dataset.mode = "orbit";
  setSize();
  createParticles();
  draw();
}

window.addEventListener("resize", () => {
  setSize();
  createParticles();
});

window.addEventListener("pointermove", (event) => {
  pointer = { x: event.clientX, y: event.clientY, active: true };
});

window.addEventListener("pointerleave", () => {
  pointer.active = false;
});

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    body.dataset.mode = button.dataset.mode;
    modeButtons.forEach((item) => item.classList.toggle("is-active", item === button));
  });
});

zoneLetters.forEach((button, index) => {
  button.addEventListener("click", () => activateLetter(button));
  window.setTimeout(() => activateLetter(button), 420 + index * 150);
});

copyButton.addEventListener("click", async () => {
  const email = "ZONE@yourmail.com";
  try {
    await navigator.clipboard.writeText(email);
    copyButton.textContent = "Copied";
  } catch {
    copyButton.textContent = email;
  }
  window.setTimeout(() => {
    copyButton.textContent = "Copy Email";
  }, 1500);
});

init();
