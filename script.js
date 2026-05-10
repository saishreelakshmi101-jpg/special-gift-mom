document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const introScreen = document.getElementById('intro-screen');
    const balloonScreen = document.getElementById('balloon-screen');
    const nextBtn = document.getElementById('next-btn');
    const bgMusic = document.getElementById('bg-music');
    const popSound = document.getElementById('pop-sound');
    const typingText = document.getElementById('typing-text');
    const balloonContainer = document.getElementById('balloon-container');
    const photoModal = document.getElementById('photo-modal');
    const revealedPhoto = document.getElementById('revealed-photo');
    const revealedMessage = document.getElementById('revealed-message');
    const continueBtn = document.getElementById('continue-btn');
    const finalMessage = document.getElementById('final-message');
    
    // Data
    const textToType = "I made this for you ❤️";
    const photos = [
        { src: 'images/photo1.jpg', msg: 'ಅಮ್ಮಾ… ನೀನೆ ನನ್ನ ಜಗತ್ತು ❤️ ❤️' },
        { src: 'images/photo2.jpg', msg: 'ದೇವರನ್ನು ನೋಡಿಲ್ಲ, ಅಮ್ಮನಲ್ಲಿ ಕಂಡಿದ್ದೇನೆ. ✨' },
        { src: 'images/photo3.jpg', msg: 'ಜೀವನದ ಅತ್ಯಂತ ಅಮೂಲ್ಯ ಉಡುಗೊರೆ — ಅಮ್ಮಾ 😊' },
        { src: 'images/photo4.jpg', msg: 'ನನ್ನ ಬದುಕಿನ ಮೊದಲ ದೇವತೆ — ಅಮ್ಮಾ🌟' },
        { src: 'images/photo5.jpg', msg: 'ನನ್ನ ಶಕ್ತಿ ನನ್ನ ಪ್ರೇರಣೆ ನನ್ನ ಅಮ್ಮ 💖' }
    ];
    let poppedCount = 0;
    const totalBalloons = photos.length;
    
    // Colors for balloons
    const colors = [
        '#ff0000'
    ];

    // Typing Effect
    let charIndex = 0;
    function typeText() {
        if (charIndex < textToType.length) {
            typingText.innerHTML += textToType.charAt(charIndex);
            charIndex++;
            setTimeout(typeText, 100);
        }
    }
    
    // Start typing after a short delay
    setTimeout(typeText, 500);

    // Create background slow floating balloons for Intro
    function createBgBalloons() {
        const bgBalloonsContainer = document.getElementById('bg-balloons');
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                createSingleBgBalloon(bgBalloonsContainer);
            }, Math.random() * 10000);
        }
    }

    function createSingleBgBalloon(container) {
        if(introScreen.classList.contains('hidden')) return;
        const balloon = document.createElement('div');
        balloon.className = 'bg-balloon';
        balloon.style.left = Math.random() * 100 + 'vw';
        // Very slow duration (20s to 40s)
        balloon.style.animationDuration = (Math.random() * 20 + 20) + 's';
        balloon.style.opacity = Math.random() * 0.5 + 0.2;
        balloon.style.transform = `scale(${Math.random() * 0.5 + 0.5})`;
        container.appendChild(balloon);
        
        balloon.addEventListener('animationend', () => {
            balloon.remove();
            createSingleBgBalloon(container);
        });
    }

    createBgBalloons();

    // Next Button Click Event
    nextBtn.addEventListener('click', () => {
        // Start music
        bgMusic.volume = 0.5;
        bgMusic.play().catch(e => console.log("Audio play failed:", e));
        
        // Transition screens
        introScreen.classList.remove('active');
        introScreen.classList.add('hidden');
        
        setTimeout(() => {
            balloonScreen.classList.remove('hidden');
            balloonScreen.classList.add('active');
            startBalloonGame();
        }, 1000);
    });

    // Main Balloon Interaction Logic
    let activeBalloons = [];
    
    function startBalloonGame() {
        // Spawn balloons continuously until they are all popped
        spawnBalloonsLoop();
    }
    
    function spawnBalloonsLoop() {
        if (poppedCount >= totalBalloons) return;
        
        // Count currently active balloons on screen
        const currentActive = activeBalloons.filter(b => document.body.contains(b)).length;
        
        // Maintain around 3-4 balloons on screen
        if (currentActive < 4 && poppedCount + currentActive < totalBalloons) {
            spawnBalloon();
        }
        
        // Check again after a delay
        setTimeout(spawnBalloonsLoop, 2000);
    }

    function spawnBalloon() {
        const balloon = document.createElement('div');
        balloon.className = 'interactive-balloon';
        
        // Random horizontal position (10% to 90% to avoid edges)
        const leftPos = 10 + Math.random() * 80;
        balloon.style.left = `${leftPos}%`;
        
        // Random color
        const color = colors[Math.floor(Math.random() * colors.length)];
        balloon.style.setProperty('--balloon-color', color);
        
        // SLOW animation duration (15s to 25s)
        const duration = 15 + Math.random() * 10;
        balloon.style.animationDuration = `${duration}s`;
        
        // Thread
        const thread = document.createElement('div');
        thread.className = 'balloon-thread';
        balloon.appendChild(thread);
        
        // Interaction
        balloon.addEventListener('click', (e) => popBalloon(e, balloon));
        balloon.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent double fire
            popBalloon(e.touches[0] || e, balloon);
        });
        
        balloonContainer.appendChild(balloon);
        activeBalloons.push(balloon);
        
        // If it reaches top without being popped
        balloon.addEventListener('animationend', () => {
            if (balloonContainer.contains(balloon)) {
                balloon.remove();
                // Another one will be spawned automatically via the loop
            }
        });
    }

    function popBalloon(e, balloon) {
        if (!balloonContainer.contains(balloon)) return; // Already popped
        
        // Play pop sound
        popSound.currentTime = 0;
        popSound.play().catch(e => console.log("Pop sound error:", e));
        
        // Get coordinates for confetti
        const rect = balloon.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        // Explode Confetti
        createExplosion(x, y);
        
        // Remove balloon
        balloon.remove();
        
        // Show Photo Modal
        showPhotoReveal();
    }
    
    function showPhotoReveal() {
        if (poppedCount >= totalBalloons) return;
        
        const photoData = photos[poppedCount];
        revealedPhoto.src = photoData.src;
        revealedMessage.innerText = photoData.msg;
        
        photoModal.classList.remove('hidden');
        setTimeout(() => photoModal.classList.add('show'), 10);
        
        poppedCount++;
    }
    
    continueBtn.addEventListener('click', () => {
        photoModal.classList.remove('show');
        setTimeout(() => {
            photoModal.classList.add('hidden');
            
            if (poppedCount >= totalBalloons) {
                showFinalMessage();
            } else {
                // Keep spawning balloons
                spawnBalloonsLoop();
            }
        }, 500);
    });
    
    function showFinalMessage() {
        // Clear remaining balloons
        balloonContainer.innerHTML = '';
        
        finalMessage.classList.remove('hidden');
        setTimeout(() => {
            finalMessage.classList.add('show');
            // Grand Confetti
            startGrandConfetti();
        }, 100);
    }

    // --- CANVAS CONFETTI SYSTEM ---
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    let particles = [];
    let animationId = null;
    
    function createExplosion(x, y) {
        const particleCount = 40;
        const colors = ['#ff758c', '#ff7eb3', '#fecfef', '#ffffff', '#ffd700'];
        
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 0.5) * 15,
                size: Math.random() * 5 + 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 1,
                decay: Math.random() * 0.02 + 0.015
            });
        }
        
        if (!animationId) animateParticles();
    }
    
    function startGrandConfetti() {
        const colors = ['#ff758c', '#ff7eb3', '#fecfef', '#ffffff', '#ffd700', '#00ffcc', '#ff0066'];
        
        // Spawn from bottom continuously for a few seconds
        let grandFrames = 0;
        function grandSpawn() {
            if (grandFrames > 200) return; // Stop after ~3 seconds
            
            for(let i=0; i<3; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: canvas.height + 10,
                    vx: (Math.random() - 0.5) * 5,
                    vy: -(Math.random() * 10 + 10),
                    size: Math.random() * 8 + 4,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    life: 1,
                    decay: Math.random() * 0.01 + 0.005,
                    gravity: 0.2
                });
            }
            grandFrames++;
            requestAnimationFrame(grandSpawn);
        }
        
        grandSpawn();
        if (!animationId) animateParticles();
    }
    
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let activeParticles = false;
        
        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity || 0.5; // gravity
            p.life -= p.decay;
            
            if (p.life <= 0) {
                particles.splice(i, 1);
            } else {
                activeParticles = true;
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                // Draw circle or square
                if (i % 2 === 0) {
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                } else {
                    ctx.fillRect(p.x, p.y, p.size, p.size);
                }
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1;
        
        if (activeParticles) {
            animationId = requestAnimationFrame(animateParticles);
        } else {
            animationId = null;
        }
    }
});
