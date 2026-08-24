    /**
     * WORMHOLE / WARP SPEED STARFIELD
     * Creates a stunning tunnel effect with trails and depth.
     */
    (function() {
        const canvas = document.getElementById('bg-canvas');
        if (!canvas) return; // Safety check
        const ctx = canvas.getContext('2d');

        let width, height;
        let particles = [];
        let animationId;

        // CONFIGURATION
        const CONFIG = {
            particleCount: 1200,       // Number of stars
            speed: 2.5,                // Base speed (lower = slower)
            speedBoost: 15,            // Speed when "warping"
            starSize: 2.5,             // Base size
            trailLength: 0.2,          // Trail fading (0.0 = long trails, 1.0 = no trails)
            depth: 1000,               // Total depth of the tunnel
            fov: 300,                  // Field of view (lower = more intense tunnel)
            colorBase: { r: 200, g: 220, b: 255 }, // White/Blue tint
            colorDeep: { r: 150, g: 180, b: 255 }, // Deep blue tint for distance
            warpThreshold: 0.8         // When to trigger warp effect
        };

        // Resize handler
        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            // Reset center
            center.x = width / 2;
            center.y = height / 2;
        }

        const center = { x: 0, y: 0 };
        window.addEventListener('resize', resize);
        resize();

        // Particle Class
        class Star {
            constructor() {
                this.reset(true);
            }

            reset(randomStart = false) {
                // Random position in 3D space
                // x, y are spread wide, z is depth
                this.x = (Math.random() - 0.5) * width * 3;
                this.y = (Math.random() - 0.5) * height * 3;
                this.z = randomStart ? Math.random() * CONFIG.depth : CONFIG.depth;

                // Random speed variation
                this.baseSpeed = CONFIG.speed * (0.8 + Math.random() * 0.4);

                // Visual properties
                this.size = Math.random() * CONFIG.starSize;
                this.alpha = Math.random() * 0.5 + 0.3;
            }

            update(warping) {
                // Move closer to camera
                const currentSpeed = warping ? CONFIG.speedBoost : this.baseSpeed;
                this.z -= currentSpeed;

                // Reset if it passes the camera
                if (this.z <= 0) {
                    this.reset();
                    this.z = CONFIG.depth;
                }
            }

            draw() {
                // 3D Projection Formula
                const scale = CONFIG.fov / (CONFIG.fov + this.z);

                // Project 3D point to 2D screen
                const x2d = (this.x * scale) + center.x;
                const y2d = (this.y * scale) + center.y;

                // Calculate size based on depth
                const currentSize = this.size * scale * 4;

                // Calculate color based on depth (closer = brighter, further = bluer)
                const distRatio = this.z / CONFIG.depth;
                const r = Math.min(255, CONFIG.colorBase.r + (CONFIG.colorDeep.r - CONFIG.colorBase.r) * (1 - distRatio));
                const g = Math.min(255, CONFIG.colorBase.g + (CONFIG.colorDeep.g - CONFIG.colorBase.g) * (1 - distRatio));
                const b = Math.min(255, CONFIG.colorBase.b + (CONFIG.colorDeep.b - CONFIG.colorBase.b) * (1 - distRatio));

                // Opacity increases as it gets closer
                const opacity = Math.min(1, (1 - distRatio) * this.alpha + 0.2);

                // Draw the star
                if (x2d >= 0 && x2d <= width && y2d >= 0 && y2d <= height) {
                    ctx.beginPath();
                    ctx.arc(x2d, y2d, Math.max(0.1, currentSize), 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
                    ctx.fill();
                }
            }
        }

        // Initialize particles
        function init() {
            particles = [];
            for (let i = 0; i < CONFIG.particleCount; i++) {
                particles.push(new Star());
            }
        }

        // Animation Loop
        function animate() {
            // Create trails by not clearing the canvas completely
            // Using a semi-transparent fill creates the "trail" effect
            ctx.fillStyle = `rgba(5, 5, 10, ${CONFIG.trailLength})`;
            ctx.fillRect(0, 0, width, height);

            // Check for warp state (could be mouse movement, scroll, or button)
            // For now, we'll simulate a constant gentle warp
            const warping = false; // Change to true to force warp mode

            particles.forEach(p => {
                p.update(warping);
                p.draw();
            });

            animationId = requestAnimationFrame(animate);
        }

        // Start
        init();
        animate();

        // Optional: Add a "Warp" effect on mouse move
        let mouseX = 0, mouseY = 0;
        document.addEventListener('mousemove', (e) => {
            const x = e.clientX - width / 2;
            const y = e.clientY - height / 2;
            // Scale mouse movement to affect particles slightly
            particles.forEach(p => {
                p.x += x * 0.0001;
                p.y += y * 0.0001;
            });
        });

    })();
