/**
 * Space Background Animation
 * Features: Central Sun, Orbiting Planets, Moons, and Starfield
 */

const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let stars = [];
let planets = [];

// Configuration
const config = {
    starCount: 150,
    planetCount: 4,
    sunColor: '#ffcc00',
    sunGlow: 'rgba(255, 200, 0, 0.4)',
    orbitColor: 'rgba(255, 255, 255, 0.1)',
    speeds: {
        rotation: 0.002,
        planetBase: 0.005
    }
};

// Resize handler
function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    initStars();
    initPlanets();
}

// Star Class
class Star {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.5;
        this.opacity = Math.random();
        this.fadeSpeed = 0.005 + Math.random() * 0.01;
        this.fadingIn = true;
    }

    update() {
        if (this.fadingIn) {
            this.opacity += this.fadeSpeed;
            if (this.opacity >= 1) this.fadingIn = false;
        } else {
            this.opacity -= this.fadeSpeed;
            if (this.opacity <= 0.2) this.fadingIn = true;
        }
    }

    draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Planet Class
class Planet {
    constructor(index, total) {
        this.index = index;
        this.total = total;
        this.reset();
    }

    reset() {
        this.angle = (Math.PI * 2 / this.total) * this.index + Math.random();
        this.distance = 60 + (this.index * 45) + Math.random() * 20;
        this.size = 3 + Math.random() * 5;
        this.speed = config.speeds.planetBase * (0.5 + Math.random() * 0.5) * (Math.random() > 0.5 ? 1 : -1);

        const colors = ['#5b9dff', '#ff6b6b', '#a855f7', '#2dd4bf', '#fbbf24'];
        this.color = colors[Math.floor(Math.random() * colors.length)];

        this.hasMoon = Math.random() > 0.4;
        if (this.hasMoon) {
            this.moonDistance = this.size + 8 + Math.random() * 10;
            this.moonSize = 1 + Math.random() * 1.5;
            this.moonAngle = Math.random() * Math.PI * 2;
            this.moonSpeed = this.speed * 3;
        }
    }

    update() {
        this.angle += this.speed;
        if (this.hasMoon) {
            this.moonAngle += this.moonSpeed;
        }
    }

    draw() {
        const centerX = width / 2;
        const centerY = height / 2;

        const x = centerX + Math.cos(this.angle) * this.distance;
        const y = centerY + Math.sin(this.angle) * this.distance;

        // Draw Orbit Path
        ctx.beginPath();
        ctx.strokeStyle = config.orbitColor;
        ctx.lineWidth = 1;
        ctx.arc(centerX, centerY, this.distance, 0, Math.PI * 2);
        ctx.stroke();

        // Draw Planet
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(x, y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw Moon
        if (this.hasMoon) {
            const moonX = x + Math.cos(this.moonAngle) * this.moonDistance;
            const moonY = y + Math.sin(this.moonAngle) * this.moonDistance;

            ctx.fillStyle = '#cccccc';
            ctx.beginPath();
            ctx.arc(moonX, moonY, this.moonSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// Sun Drawing Function (No variable declaration conflict)
function drawSun() {
    const centerX = width / 2;
    const centerY = height / 2;
    const sunRadius = 25;

    // Sun Glow
    const gradient = ctx.createRadialGradient(centerX, centerY, sunRadius * 0.2, centerX, centerY, sunRadius * 2.5);
    gradient.addColorStop(0, config.sunColor);
    gradient.addColorStop(0.4, config.sunGlow);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, sunRadius * 3, 0, Math.PI * 2);
    ctx.fill();

    // Solid Sun Core
    ctx.fillStyle = config.sunColor;
    ctx.shadowBlur = 20;
    ctx.shadowColor = config.sunColor;
    ctx.beginPath();
    ctx.arc(centerX, centerY, sunRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}

// Initialization
function initStars() {
    stars = [];
    for (let i = 0; i < config.starCount; i++) {
        stars.push(new Star());
    }
}

function initPlanets() {
    planets = [];
    for (let i = 0; i < config.planetCount; i++) {
        planets.push(new Planet(i, config.planetCount));
    }
}

// Animation Loop
function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw Stars
    stars.forEach(star => {
        star.update();
        star.draw();
    });

    // Draw Sun
    drawSun();

    // Draw Planets
    planets.forEach(planet => {
        planet.update();
        planet.draw();
    });

    requestAnimationFrame(animate);
}

// Event Listeners
window.addEventListener('resize', resize);

// Start
resize();
animate();
