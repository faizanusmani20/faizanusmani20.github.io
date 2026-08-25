/**
 * Cinematic Space Background
 * Requires:
 * <canvas id="bg-canvas"></canvas>
 */

const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d", { alpha: true });

let width = 0;
let height = 0;
let dpr = 1;
let lastTime = performance.now();

const pointer = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0
};

const config = {
    starCount: 280,
    planetCount: 6,
    cometCount: 3,
    maxDpr: 2,
    orbitSpeed: 0.00022,
    parallax: 18,
    background: "#02030b"
};

const stars = [];
const planets = [];
const comets = [];
const particles = [];

const random = (min, max) => Math.random() * (max - min) + min;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;

    dpr = Math.min(window.devicePixelRatio || 1, config.maxDpr);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    initStars();
    initPlanets();
    initComets();
}

class Star {
    constructor() {
        this.reset(true);
    }

    reset(initial = false) {
        this.x = random(0, width);
        this.y = random(0, height);
        this.z = random(0.15, 1);
        this.radius = random(0.25, 1.45) * this.z;
        this.alpha = random(0.25, 0.95);
        this.twinkleSpeed = random(0.0006, 0.002);
        this.twinkleOffset = random(0, Math.PI * 2);
        this.hue = random(190, 250);

        if (!initial) {
            this.x = random(-50, width + 50);
            this.y = random(-50, height + 50);
        }
    }

    update(time) {
        this.alpha =
            0.4 +
            Math.sin(time * this.twinkleSpeed + this.twinkleOffset) * 0.3;
    }

    draw() {
        const px = (pointer.x * this.z * config.parallax) / 100;
        const py = (pointer.y * this.z * config.parallax) / 100;

        const x = this.x + px;
        const y = this.y + py;

        ctx.fillStyle = `hsla(${this.hue}, 80%, 85%, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        if (this.radius > 0.9) {
            ctx.strokeStyle = `rgba(150, 220, 255, ${this.alpha * 0.35})`;
            ctx.lineWidth = 0.5;

            ctx.beginPath();
            ctx.moveTo(x - 5, y);
            ctx.lineTo(x + 5, y);
            ctx.moveTo(x, y - 5);
            ctx.lineTo(x, y + 5);
            ctx.stroke();
        }
    }
}

class Planet {
    constructor(index) {
        this.index = index;
        this.reset();
    }

    reset() {
        this.angle = random(0, Math.PI * 2);
        this.orbitX = 75 + this.index * 58 + random(-10, 14);
        this.orbitY = this.orbitX * random(0.55, 0.82);
        this.radius = random(4, 10);
        this.speed =
            random(0.00025, 0.0008) *
            (this.index % 2 ? -1 : 1);

        this.color = [
            ["#507cff", "#a8c7ff"],
            ["#ff704f", "#ffd0a8"],
            ["#a75cff", "#e4b7ff"],
            ["#20c9a6", "#a4fff0"],
            ["#f5b63c", "#fff0a3"],
            ["#d9579d", "#ffc2e5"]
        ][this.index % 6];

        this.hasMoon = Math.random() > 0.3;
        this.hasRing = Math.random() > 0.7;

        this.moonAngle = random(0, Math.PI * 2);
        this.moonDistance = this.radius + random(9, 17);
        this.moonRadius = random(1, 2.2);
        this.moonSpeed = random(0.002, 0.006);

        this.rotation = random(0, Math.PI * 2);
    }

    update(delta) {
        this.angle += this.speed * delta;
        this.moonAngle += this.moonSpeed * delta;
        this.rotation += 0.0005 * delta;
    }

    position() {
        const cx = width / 2 + pointer.x * 12;
        const cy = height / 2 + pointer.y * 8;

        return {
            x: cx + Math.cos(this.angle) * this.orbitX,
            y: cy + Math.sin(this.angle) * this.orbitY,
            depth: Math.sin(this.angle)
        };
    }

    drawOrbit() {
        const cx = width / 2 + pointer.x * 12;
        const cy = height / 2 + pointer.y * 8;

        ctx.save();
        ctx.beginPath();
        ctx.ellipse(
            cx,
            cy,
            this.orbitX,
            this.orbitY,
            0,
            0,
            Math.PI * 2
        );
        ctx.strokeStyle = "rgba(140, 170, 255, 0.075)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
    }

    draw() {
        const { x, y } = this.position();

        ctx.save();

        // Planet shadow/glow
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color[0];

        // Rings behind planet
        if (this.hasRing) {
            ctx.shadowBlur = 0;
            ctx.translate(x, y);
            ctx.rotate(-0.25);
            ctx.beginPath();
            ctx.ellipse(0, 0, this.radius * 2.3, this.radius * 0.65, 0, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(255, 220, 170, 0.7)";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.rotate(0.25);
            ctx.translate(-x, -y);
        }

        const gradient = ctx.createRadialGradient(
            x - this.radius * 0.35,
            y - this.radius * 0.4,
            this.radius * 0.1,
            x,
            y,
            this.radius * 1.3
        );

        gradient.addColorStop(0, this.color[1]);
        gradient.addColorStop(0.45, this.color[0]);
        gradient.addColorStop(1, "#050612");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;

        // Surface highlight
        ctx.globalAlpha = 0.25;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.arc(
            x - this.radius * 0.2,
            y - this.radius * 0.2,
            this.radius * 0.65,
            Math.PI * 1.1,
            Math.PI * 1.8
        );
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Moon
        if (this.hasMoon) {
            const moonX = x + Math.cos(this.moonAngle) * this.moonDistance;
            const moonY = y + Math.sin(this.moonAngle) * this.moonDistance;

            ctx.fillStyle = "#c8d4e8";
            ctx.shadowBlur = 5;
            ctx.shadowColor = "#c8d4e8";

            ctx.beginPath();
            ctx.arc(moonX, moonY, this.moonRadius, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

class Comet {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = random(-width, width);
        this.y = random(-height, height);
        this.speed = random(0.3, 1);
        this.angle = random(-0.5, 0.5);
        this.length = random(35, 100);
        this.size = random(1, 2.5);
        this.alpha = random(0.4, 1);
    }

    update(delta) {
        this.x += Math.cos(this.angle) * this.speed * delta;
        this.y += Math.sin(this.angle) * this.speed * delta;

        if (
            this.x > width + this.length ||
            this.y > height + this.length
        ) {
            this.reset();
            this.x = -this.length;
            this.y = random(0, height * 0.7);
        }
    }

    draw() {
        const tailX = this.x - Math.cos(this.angle) * this.length;
        const tailY = this.y - Math.sin(this.angle) * this.length;

        const gradient = ctx.createLinearGradient(
            this.x,
            this.y,
            tailX,
            tailY
        );

        gradient.addColorStop(0, `rgba(255,255,255,${this.alpha})`);
        gradient.addColorStop(1, "rgba(80,150,255,0)");

        ctx.strokeStyle = gradient;
        ctx.lineWidth = this.size;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.shadowBlur = 12;
        ctx.shadowColor = "#a9ddff";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

function drawNebula(time) {
    const cx = width / 2 + Math.sin(time * 0.0001) * 80;
    const cy = height / 2 + Math.cos(time * 0.00012) * 50;

    const nebula = ctx.createRadialGradient(cx, cy, 0, cx, cy, width * 0.7);
    nebula.addColorStop(0, "rgba(70, 25, 150, 0.12)");
    nebula.addColorStop(0.4, "rgba(20, 80, 180, 0.06)");
    nebula.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = nebula;
    ctx.fillRect(0, 0, width, height);
}

function drawSun(time) {
    const cx = width / 2 + pointer.x * 12;
    const cy = height / 2 + pointer.y * 8;
    const pulse = Math.sin(time * 0.002) * 2;
    const radius = 25 + pulse;

    ctx.save();

    // Large atmospheric glow
    const glow = ctx.createRadialGradient(cx, cy, 2, cx, cy, radius * 6);
    glow.addColorStop(0, "rgba(255,245,150,0.9)");
    glow.addColorStop(0.18, "rgba(255,170,35,0.35)");
    glow.addColorStop(0.55, "rgba(255,80,20,0.08)");
    glow.addColorStop(1, "rgba(255,30,0,0)");

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 6, 0, Math.PI * 2);
    ctx.fill();

    // Corona rays
    ctx.translate(cx, cy);
    ctx.rotate(time * 0.00015);

    for (let i = 0; i < 18; i++) {
        const angle = (Math.PI * 2 * i) / 18;
        const rayLength = random(35, 60);

        ctx.save();
        ctx.rotate(angle);
        ctx.fillStyle = "rgba(255, 190, 50, 0.18)";
        ctx.beginPath();
        ctx.moveTo(radius, -1);
        ctx.lineTo(radius + rayLength, 0);
        ctx.lineTo(radius, 1);
        ctx.fill();
        ctx.restore();
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Sun body
    const sun = ctx.createRadialGradient(
        cx - radius * 0.35,
        cy - radius * 0.4,
        2,
        cx,
        cy,
        radius
    );

    sun.addColorStop(0, "#fffbd1");
    sun.addColorStop(0.35, "#ffd45b");
    sun.addColorStop(0.8, "#ff8b16");
    sun.addColorStop(1, "#d93600");

    ctx.fillStyle = sun;
    ctx.shadowBlur = 30;
    ctx.shadowColor = "#ff8c1a";

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function initStars() {
    stars.length = 0;

    for (let i = 0; i < config.starCount; i++) {
        stars.push(new Star());
    }
}

function initPlanets() {
    planets.length = 0;

    for (let i = 0; i < config.planetCount; i++) {
        planets.push(new Planet(i));
    }
}

function initComets() {
    comets.length = 0;

    for (let i = 0; i < config.cometCount; i++) {
        comets.push(new Comet());
    }
}

function drawBackground() {
    ctx.fillStyle = config.background;
    ctx.fillRect(0, 0, width, height);
}

function animate(time) {
    const delta = Math.min(time - lastTime, 40);
    lastTime = time;

    pointer.x += (pointer.targetX - pointer.x) * 0.04;
    pointer.y += (pointer.targetY - pointer.y) * 0.04;

    drawBackground();
    drawNebula(time);

    stars.forEach(star => {
        star.update(time);
        star.draw();
    });

    comets.forEach(comet => {
        comet.update(delta);
        comet.draw();
    });

    planets.forEach(planet => planet.drawOrbit());

    drawSun(time);

    // Draw far planets first and near planets last for depth
    planets
        .sort((a, b) => a.position().depth - b.position().depth)
        .forEach(planet => {
            planet.update(delta);
            planet.draw();
        });

    requestAnimationFrame(animate);
}

window.addEventListener("resize", resize);

window.addEventListener("pointermove", event => {
    pointer.targetX = (event.clientX / width - 0.5) * 2;
    pointer.targetY = (event.clientY / height - 0.5) * 2;
});

window.addEventListener("pointerleave", () => {
    pointer.targetX = 0;
    pointer.targetY = 0;
});

resize();
requestAnimationFrame(animate);


/* --------------------------- CURSOR COMET TRAIL --------------------------- */
/**
 * Turns the user's actual mouse/touch movement into a comet: a short-lived
 * trail of points, drawn as a tapering, glowing streak that fades out
 * behind the cursor, plus a bright head with a soft flare.
 */

const cursorTrailConfig = {
  maxPoints: 26, // how long the trail can get
  pointLifetime: 420, // ms a single point stays visible
  minDistance: 2, // px the cursor must move before adding a new point
  headSize: 2.6,
  hue: 200
};

function addCursorPoint(x, y) {
  const last = cursorTrail[cursorTrail.length - 1];
  if (last) {
    const dx = x - last.x;
    const dy = y - last.y;
    if (Math.sqrt(dx * dx + dy * dy) < cursorTrailConfig.minDistance) return;
  }

  cursorTrail.push({ x, y, born: performance.now() });

  if (cursorTrail.length > cursorTrailConfig.maxPoints) {
    cursorTrail.shift();
  }
}

function updateCursorTrail(now) {
  while (
    cursorTrail.length &&
    now - cursorTrail[0].born > cursorTrailConfig.pointLifetime
  ) {
    cursorTrail.shift();
  }
}

function drawCursorTrail(now) {
  if (cursorTrail.length < 2) return;

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (let i = 1; i < cursorTrail.length; i++) {
    const p0 = cursorTrail[i - 1];
    const p1 = cursorTrail[i];

    const age = (now - p1.born) / cursorTrailConfig.pointLifetime;
    const life = clamp(1 - age, 0, 1);

    // taper: older segments (closer to index 0) are thinner and dimmer
    const t = i / cursorTrail.length;
    const width_ = cursorTrailConfig.headSize * t * life;
    const alpha = 0.75 * t * life;

    if (width_ <= 0.05 || alpha <= 0.02) continue;

    const grad = ctx.createLinearGradient(p0.x, p0.y, p1.x, p1.y);
    grad.addColorStop(0, `hsla(${cursorTrailConfig.hue}, 95%, 80%, ${alpha * 0.4})`);
    grad.addColorStop(1, `hsla(${cursorTrailConfig.hue}, 100%, 90%, ${alpha})`);

    ctx.strokeStyle = grad;
    ctx.lineWidth = width_;
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
  }

  // bright glowing head at the cursor's live position
  if (cursor.active) {
    const headGlow = ctx.createRadialGradient(
      cursor.x, cursor.y, 0,
      cursor.x, cursor.y, cursorTrailConfig.headSize * 7
    );
    headGlow.addColorStop(0, `hsla(${cursorTrailConfig.hue}, 100%, 90%, 0.55)`);
    headGlow.addColorStop(1, "hsla(0, 0%, 0%, 0)");
    ctx.fillStyle = headGlow;
    ctx.beginPath();
    ctx.arc(cursor.x, cursor.y, cursorTrailConfig.headSize * 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.shadowBlur = 16;
    ctx.shadowColor = `hsla(${cursorTrailConfig.hue}, 100%, 85%, 1)`;
    ctx.beginPath();
    ctx.arc(cursor.x, cursor.y, cursorTrailConfig.headSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  ctx.restore();
}
