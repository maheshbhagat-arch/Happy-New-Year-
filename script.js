const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
let fireworks = [];

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}
window.addEventListener('resize', resize);
resize();

// Utility functions
const random = (min, max) => Math.random() * (max - min) + min;

// Firework Class
// Firework Class
class Firework {
    constructor(x, targetY, text) {
        this.x = x;
        this.y = height;
        this.targetY = targetY;
        this.speed = 3;
        this.angle = -Math.PI / 2;
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed * random(3, 5);
        this.hue = random(0, 360);
        this.brightness = random(50, 80);
        this.alpha = 1;
        this.dead = false;
        this.text = text; // Optional text payload

        this.trail = [];
        this.trailLength = 5;
    }

    update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.trailLength) this.trail.shift();

        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.05;

        if (this.vy >= 0 || this.y <= this.targetY) {
            this.dead = true;
            if (this.text) {
                createTextExplosion(this.x, this.y, this.text, this.hue);
            } else {
                createExplosion(this.x, this.y, this.hue);
            }
        }
    }

    draw() {
        ctx.save();
        ctx.beginPath();
        if (this.trail.length > 1) {
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
            ctx.stroke();
        }

        ctx.fillStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Text Effect Class
class TextFloating {
    constructor(x, y, text, hue) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.hue = hue;
        this.alpha = 1;
        this.size = 0;
        this.maxSize = 60; // Final font size
        this.life = 0;
        this.maxLife = 150;
    }

    update() {
        this.life++;
        if (this.size < this.maxSize) {
            this.size += 2; // Grow rapid
        }
        this.y -= 0.5; // Float up
        if (this.life > 100) {
            this.alpha -= 0.02;
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.font = `900 ${this.size}px 'Orbitron'`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = `hsl(${this.hue}, 100%, 50%)`;
        ctx.shadowBlur = 20;
        ctx.fillStyle = "#fff";
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

// Particle Class for Explosion
class Particle {
    constructor(x, y, hue) {
        this.x = x;
        this.y = y;
        this.hue = hue;
        const angle = random(0, Math.PI * 2);
        const speed = random(1, 8);
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.friction = 0.95;
        this.gravity = 0.2;
        this.alpha = 1;
        this.decay = random(0.01, 0.03);
        this.brightness = random(50, 80);
    }

    update() {
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
    }

    draw() {
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
    }
}

let floatingTexts = [];

function createExplosion(x, y, hue) {
    const particleCount = 60;
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(x, y, hue || random(0, 360)));
    }
}

function createTextExplosion(x, y, text, hue) {
    floatingTexts.push(new TextFloating(x, y, text, hue));
    createExplosion(x, y, hue);
}

// Animation Loop
function loop() {
    requestAnimationFrame(loop);

    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'source-over';

    fireworks.forEach((firework, index) => {
        firework.update();
        firework.draw();
        if (firework.dead) {
            fireworks.splice(index, 1);
        }
    });

    particles.forEach((particle, index) => {
        particle.update();
        particle.draw();
        if (particle.alpha <= 0) {
            particles.splice(index, 1);
        }
    });

    floatingTexts.forEach((textObj, index) => {
        textObj.update();
        textObj.draw();
        if (textObj.alpha <= 0) {
            floatingTexts.splice(index, 1);
        }
    });

    // Occasional random firework
    if (Math.random() < fireworkChance) {
        fireworks.push(new Firework(random(width * 0.1, width * 0.9), random(height * 0.1, height * 0.5)));
    }
}

// Global intensity control
let fireworkChance = 0.02;

// Function to launch specific text sequence
function launchTextSequence() {
    const sequence = [
        { text: "Happy", delay: 1000, x: 0.2 },
        { text: "New", delay: 2500, x: 0.5 },
        { text: "Year", delay: 4000, x: 0.8 },
        { text: "2026", delay: 5500, x: 0.5, hue: 180 }
    ];

    sequence.forEach(item => {
        setTimeout(() => {
            const fw = new Firework(width * item.x, height * 0.3);
            fw.text = item.text;
            if (item.hue) fw.hue = item.hue;
            fireworks.push(fw);
        }, item.delay);
    });

    // Increase background chaos after sequence
    setTimeout(() => {
        fireworkChance = 0.1; // 10% chance per frame = lots of fireworks!
    }, 7000);
}

// User Interaction Handler
function handleInteraction(clientX, clientY) {
    createExplosion(clientX, clientY);
    setTimeout(() => createExplosion(clientX + random(-30, 30), clientY + random(-30, 30)), 100);
    initAudio();
}

// Mouse Click
window.addEventListener('click', (e) => {
    handleInteraction(e.clientX, e.clientY);
});

// Touch Support (Android/Mobile)
window.addEventListener('touchstart', (e) => {
    for (let i = 0; i < e.touches.length; i++) {
        handleInteraction(e.touches[i].clientX, e.touches[i].clientY);
    }
}, { passive: true });

// Audio Handling
let audioInitialized = false;
const bgMusic = document.getElementById('bgMusic');
const musicBtn = document.getElementById('musicControl');

// Elements
const envelope = document.getElementById('envelope');
const mainContent = document.getElementById('mainContent');

// Voice Synthesis
function speakGreeting() {
    if ('speechSynthesis' in window) {
        const msg = new SpeechSynthesisUtterance("Happy New Year Dear");
        msg.volume = 1;
        msg.rate = 0.9;
        msg.pitch = 1.1;
        window.speechSynthesis.speak(msg);
    }
}

// Envelope Interaction
envelope.addEventListener('click', (e) => {
    e.stopPropagation();
    startCelebration();
});

envelope.addEventListener('touchstart', (e) => {
    e.stopPropagation();
    startCelebration();
}, { passive: true });

function startCelebration() {
    if (envelope.classList.contains('falling')) return; // Already started

    envelope.classList.add('falling');
    speakGreeting();
    initAudio();

    setTimeout(() => {
        mainContent.classList.remove('content-hidden');
        mainContent.classList.add('content-visible');

        // Launch Celebration Sequence
        launchTextSequence();

    }, 1000);
}

function initAudio() {
    if (!audioInitialized) {
        bgMusic.volume = 0.5;
        bgMusic.play().then(() => {
            musicBtn.textContent = "Music: ON";
            musicBtn.style.borderColor = "var(--primary-color)";
            musicBtn.style.color = "var(--primary-color)";
        }).catch(e => {
            console.log("Audio play failed", e);
        });
        audioInitialized = true;
    }
}

musicBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMusic();
});

musicBtn.addEventListener('touchstart', (e) => {
    e.stopPropagation();
    toggleMusic();
}, { passive: true });

function toggleMusic() {
    if (bgMusic.paused) {
        bgMusic.play();
        musicBtn.textContent = "Music: ON";
    } else {
        bgMusic.pause();
        musicBtn.textContent = "Music: PAUSED";
    }
}

// Start
loop();
