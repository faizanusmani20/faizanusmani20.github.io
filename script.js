const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

// Configuration
const PARTICLE_COUNT = 800;
const SPEED = 2; // How fast they fall
const STAR_SIZE = 2;
const FIELD_OF_VIEW = 600; // Controls the "zoom" intensity

// Resize canvas to fill window
function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

window.addEventListener('resize', resize);
resize();

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        // Start at random X, Y but deep in Z space
        this.x = (Math.random() - 0.5) * width * 2;
        this.y = (Math.random() - 0.5) * height * 2;
        this.z = Math.random() * FIELD_OF_VIEW + FIELD_OF_VIEW; // Start far away
        this.pz = this.z; // Previous Z for trail effect (optional)
    }

    update() {
        // Move particle closer (decrease Z)
        this.z -= SPEED;

        // If it passes the camera (z <= 0), reset it to the back
        if (this.z <= 1) {
            this.reset();
            this.z = FIELD_OF_VIEW;
        }
    }

    draw() {
        // Perspective projection math
        // Scale = FOV / (FOV + Z)
        const scale = FIELD_OF_VIEW / (FIELD_OF_VIEW + this.z);

        const x2d = (this.x * scale) + width / 2;
        const y2d = (this.y * scale) + height / 2;

        // Calculate size based on depth (closer = bigger)
        const size = STAR_SIZE * (1 - scale) * 4;

        // Opacity based on depth (fading in as they come closer)
        const alpha = Math.min(1, (FIELD_OF_VIEW - this.z) / (FIELD_OF_VIEW / 2));

        if (x2d < 0 || x2d > width || y2d < 0 || y2d > height) return;

        ctx.beginPath();
        ctx.arc(x2d, y2d, Math.max(0.1, size), 0, Math.PI * 2);

        // Color: White with blueish tint for sci-fi feel, or pure white
        ctx.fillStyle = `rgba(200, 230, 255, ${alpha})`;
        ctx.fill();
    }
}

// Initialize particles
for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
}

function animate() {
    // Clear screen with a slight fade for motion blur effect (optional)
    // Remove the second argument (0.2) and use 'clearRect' for crisp movement
    ctx.fillStyle = 'rgba(5, 5, 5, 0.4)';
    ctx.fillRect(0, 0, width, height);

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    requestAnimationFrame(animate);
}

animate();
