/* =========================================================
   ASTRONOMY CURSOR
   Professional stellar cursor + comet trail
   ========================================================= */

const CURSOR_CONFIG = {
    enabled: true,

    // Easy to change later
    color: "#b9dcff",
    glow: "rgba(100, 190, 255, 0.55)",
    trailColor: "rgba(150, 220, 255, 0.9)",

    // Size and animation
    cursorSize: 22,
    trailSize: 5,
    trailCount: 18,
    trailLife: 520,
    smoothness: 0.22
};


/* ---------------------------------------------------------
   Stop here if cursor effect is disabled
   --------------------------------------------------------- */

if (CURSOR_CONFIG.enabled && !("ontouchstart" in window)) {

    // -----------------------------------------------------
    // Create cursor canvas
    // -----------------------------------------------------

    const cursorCanvas = document.createElement("canvas");

    cursorCanvas.id = "astronomy-cursor";

    Object.assign(cursorCanvas.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: "999999",
        overflow: "hidden"
    });

    document.body.appendChild(cursorCanvas);

    const cursorCtx = cursorCanvas.getContext("2d");


    // -----------------------------------------------------
    // Cursor state
    // -----------------------------------------------------

    let cursorWidth = window.innerWidth;
    let cursorHeight = window.innerHeight;

    let mouseX = cursorWidth / 2;
    let mouseY = cursorHeight / 2;

    let cursorX = mouseX;
    let cursorY = mouseY;

    let isMouseMoving = false;
    let mouseDown = false;

    const trail = [];


    // -----------------------------------------------------
    // Resize
    // -----------------------------------------------------

    function resizeAstronomyCursor() {

        cursorWidth = window.innerWidth;
        cursorHeight = window.innerHeight;

        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

        cursorCanvas.width = cursorWidth * pixelRatio;
        cursorCanvas.height = cursorHeight * pixelRatio;

        cursorCanvas.style.width = `${cursorWidth}px`;
        cursorCanvas.style.height = `${cursorHeight}px`;

        cursorCtx.setTransform(
            pixelRatio,
            0,
            0,
            pixelRatio,
            0,
            0
        );
    }


    // -----------------------------------------------------
    // Mouse movement
    // -----------------------------------------------------

    window.addEventListener("pointermove", (event) => {

        mouseX = event.clientX;
        mouseY = event.clientY;

        isMouseMoving = true;

        trail.push({
            x: mouseX,
            y: mouseY,
            time: performance.now()
        });

        // Keep trail small
        if (trail.length > CURSOR_CONFIG.trailCount) {
            trail.shift();
        }
    });


    // -----------------------------------------------------
    // Mouse click
    // -----------------------------------------------------

    window.addEventListener("pointerdown", () => {
        mouseDown = true;
    });

    window.addEventListener("pointerup", () => {
        mouseDown = false;
    });


    // -----------------------------------------------------
    // Mouse leave
    // -----------------------------------------------------

    document.addEventListener("mouseleave", () => {
        isMouseMoving = false;
    });

    document.addEventListener("mouseenter", () => {
        isMouseMoving = true;
    });


    // -----------------------------------------------------
    // Draw comet trail
    // -----------------------------------------------------

    function drawCursorTrail(time) {

        if (trail.length < 2) return;

        for (let i = 1; i < trail.length; i++) {

            const current = trail[i];
            const previous = trail[i - 1];

            const progress = i / trail.length;

            const age = time - current.time;

            const life = Math.max(
                0,
                1 - age / CURSOR_CONFIG.trailLife
            );

            const opacity = progress * life * 0.65;

            if (opacity <= 0) continue;

            const lineWidth =
                CURSOR_CONFIG.trailSize *
                progress *
                life;

            cursorCtx.beginPath();

            cursorCtx.moveTo(
                previous.x,
                previous.y
            );

            cursorCtx.lineTo(
                current.x,
                current.y
            );

            cursorCtx.strokeStyle =
                `rgba(150, 220, 255, ${opacity})`;

            cursorCtx.lineWidth = Math.max(
                lineWidth,
                0.4
            );

            cursorCtx.lineCap = "round";

            cursorCtx.shadowBlur = 10;

            cursorCtx.shadowColor =
                CURSOR_CONFIG.glow;

            cursorCtx.stroke();
        }

        cursorCtx.shadowBlur = 0;
    }


    // -----------------------------------------------------
    // Draw tiny stars inside trail
    // -----------------------------------------------------

    function drawTrailStars(time) {

        for (let i = 0; i < trail.length; i++) {

            const point = trail[i];

            const age = time - point.time;

            const life = Math.max(
                0,
                1 - age / CURSOR_CONFIG.trailLife
            );

            if (life <= 0) continue;

            // Only some points become stars
            if (i % 3 !== 0) continue;

            const size =
                0.8 +
                Math.sin(time * 0.008 + i) * 0.4;

            cursorCtx.beginPath();

            cursorCtx.arc(
                point.x,
                point.y,
                size,
                0,
                Math.PI * 2
            );

            cursorCtx.fillStyle =
                `rgba(220, 240, 255, ${life * 0.8})`;

            cursorCtx.shadowBlur = 8;

            cursorCtx.shadowColor =
                CURSOR_CONFIG.glow;

            cursorCtx.fill();
        }

        cursorCtx.shadowBlur = 0;
    }


    // -----------------------------------------------------
    // Draw astronomy cursor
    // -----------------------------------------------------

    function drawAstronomyCursor(time) {

        if (!isMouseMoving) return;

        const targetSize =
            mouseDown
                ? CURSOR_CONFIG.cursorSize * 0.78
                : CURSOR_CONFIG.cursorSize;

        const pulse =
            Math.sin(time * 0.004) * 1.5;

        const radius =
            targetSize / 2 + pulse;


        // ---------------------------------------------
        // Outer orbital ring
        // ---------------------------------------------

        cursorCtx.save();

        cursorCtx.translate(
            cursorX,
            cursorY
        );

        cursorCtx.rotate(
            time * 0.0007
        );

        cursorCtx.beginPath();

        cursorCtx.ellipse(
            0,
            0,
            radius * 1.55,
            radius * 0.58,
            0,
            0,
            Math.PI * 2
        );

        cursorCtx.strokeStyle =
            `rgba(180, 220, 255, 0.75)`;

        cursorCtx.lineWidth = 1;

        cursorCtx.shadowBlur = 10;

        cursorCtx.shadowColor =
            CURSOR_CONFIG.glow;

        cursorCtx.stroke();


        // ---------------------------------------------
        // Small orbital planet
        // ---------------------------------------------

        const planetAngle =
            time * 0.0025;

        const planetX =
            Math.cos(planetAngle) *
            radius *
            1.55;

        const planetY =
            Math.sin(planetAngle) *
            radius *
            0.58;

        cursorCtx.beginPath();

        cursorCtx.arc(
            planetX,
            planetY,
            2.2,
            0,
            Math.PI * 2
        );

        cursorCtx.fillStyle =
            CURSOR_CONFIG.color;

        cursorCtx.shadowBlur = 12;

        cursorCtx.shadowColor =
            CURSOR_CONFIG.glow;

        cursorCtx.fill();

        cursorCtx.restore();


        // ---------------------------------------------
        // Stellar core glow
        // ---------------------------------------------

        const glowRadius =
            radius * 1.35;

        const glow =
            cursorCtx.createRadialGradient(
                cursorX,
                cursorY,
                0,
                cursorX,
                cursorY,
                glowRadius
            );

        glow.addColorStop(
            0,
            "rgba(230, 245, 255, 0.95)"
        );

        glow.addColorStop(
            0.25,
            "rgba(160, 215, 255, 0.65)"
        );

        glow.addColorStop(
            0.6,
            "rgba(100, 180, 255, 0.15)"
        );

        glow.addColorStop(
            1,
            "rgba(100, 180, 255, 0)"
        );

        cursorCtx.beginPath();

        cursorCtx.arc(
            cursorX,
            cursorY,
            glowRadius,
            0,
            Math.PI * 2
        );

        cursorCtx.fillStyle = glow;

        cursorCtx.fill();


        // ---------------------------------------------
        // Bright stellar center
        // ---------------------------------------------

        cursorCtx.beginPath();

        cursorCtx.arc(
            cursorX,
            cursorY,
            radius * 0.25,
            0,
            Math.PI * 2
        );

        cursorCtx.fillStyle =
            "#f4fbff";

        cursorCtx.shadowBlur = 18;

        cursorCtx.shadowColor =
            CURSOR_CONFIG.glow;

        cursorCtx.fill();


        // ---------------------------------------------
        // Four-point star flare
        // ---------------------------------------------

        cursorCtx.beginPath();

        cursorCtx.moveTo(
            cursorX,
            cursorY - radius * 0.8
        );

        cursorCtx.lineTo(
            cursorX + 0.8,
            cursorY - 0.8
        );

        cursorCtx.lineTo(
            cursorX + radius * 0.8,
            cursorY
        );

        cursorCtx.lineTo(
            cursorX + 0.8,
            cursorY + 0.8
        );

        cursorCtx.lineTo(
            cursorX,
            cursorY + radius * 0.8
        );

        cursorCtx.lineTo(
            cursorX - 0.8,
            cursorY + 0.8
        );

        cursorCtx.lineTo(
            cursorX - radius * 0.8,
            cursorY
        );

        cursorCtx.lineTo(
            cursorX - 0.8,
            cursorY - 0.8
        );

        cursorCtx.closePath();

        cursorCtx.fillStyle =
            "rgba(240, 250, 255, 0.9)";

        cursorCtx.fill();

        cursorCtx.shadowBlur = 0;
    }


    // -----------------------------------------------------
    // Animation
    // -----------------------------------------------------

    function animateAstronomyCursor(time) {

        // Smooth cursor movement
        cursorX +=
            (mouseX - cursorX) *
            CURSOR_CONFIG.smoothness;

        cursorY +=
            (mouseY - cursorY) *
            CURSOR_CONFIG.smoothness;


        // Clear
        cursorCtx.clearRect(
            0,
            0,
            cursorWidth,
            cursorHeight
        );


        // Remove old trail points
        while (
            trail.length > 0 &&
            time - trail[0].time >
                CURSOR_CONFIG.trailLife
        ) {
            trail.shift();
        }


        // Draw
        drawCursorTrail(time);
        drawTrailStars(time);
        drawAstronomyCursor(time);


        requestAnimationFrame(
            animateAstronomyCursor
        );
    }


    // -----------------------------------------------------
    // Start
    // -----------------------------------------------------

    resizeAstronomyCursor();

    window.addEventListener(
        "resize",
        resizeAstronomyCursor
    );

    requestAnimationFrame(
        animateAstronomyCursor
    );
}


/* =========================================================
   END ASTRONOMY CURSOR
   ========================================================= */
