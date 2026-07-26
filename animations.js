window.createParticles = function() {
    const container = document.getElementById('particlesContainer');
    if (!container) return;
    container.innerHTML = '';
    const particleCount = window.innerWidth < 768 ? 20 : 40;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const size = Math.random() * 3 + 1;
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.background = 'radial-gradient(circle, rgba(255,255,255,0.8), rgba(255,255,255,0))';
        particle.style.borderRadius = '50%';
        particle.style.boxShadow = `0 0 ${size * 2}px rgba(255, 255, 255, 0.8)`;
        particle.style.animation = `floatParticle ${duration}s linear ${delay}s infinite`;
        container.appendChild(particle);
    }
    if (!document.getElementById('particle-animation-style')) {
        const style = document.createElement('style');
        style.id = 'particle-animation-style';
        style.textContent = `
            @keyframes floatParticle {
                0% { transform: translateY(0) translateX(0); opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { transform: translateY(-100px) translateX(${Math.random() * 200 - 100}px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
};

window.createFloatingHearts = function() {
    const container = document.getElementById('floatingHeartsContainer');
    if (!container) return;
    const heartCount = window.innerWidth < 768 ? 8 : 15;
    const hearts = ['❤️', '💖', '💕', '💗', '💝'];
    for (let i = 0; i < heartCount; i++) {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        const randomHeart = hearts[Math.floor(Math.random() * hearts.length)];
        const x = Math.random() * window.innerWidth;
        const duration = Math.random() * 6 + 6;
        const delay = Math.random() * 5;
        heart.textContent = randomHeart;
        heart.style.left = x + 'px';
        heart.style.animation = `float ${duration}s ease-in ${delay}s infinite`;
        container.appendChild(heart);
    }
};

window.launchConfetti = function(duration = 3) {
    const colors = ['#ff6b9d', '#ffa502', '#ff9a56', '#ff1493', '#00ff88'];
    const confettiCount = 100;
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        const startX = Math.random() * window.innerWidth;
        const endX = Math.random() * window.innerWidth;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const delay = Math.random() * 0.5;
        const rotation = Math.random() * 360;
        confetti.style.left = startX + 'px';
        confetti.style.top = '-10px';
        confetti.style.background = color;
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        confetti.style.opacity = Math.random() * 0.7 + 0.3;
        const keyframes = `@keyframes confetti-fall-${i} { to { transform: translateY(${window.innerHeight + 20}px) translateX(${endX - startX}px) rotate(${rotation * 3}deg); opacity: 0; } }`;
        confetti.style.animation = `confetti-fall-${i} ${duration}s ease-in ${delay}s forwards`;
        const style = document.createElement('style');
        style.textContent = keyframes;
        document.head.appendChild(style);
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), (duration + delay) * 1000);
    }
};

window.launchEmojiRain = function(emojis, duration = 3) {
    if (!Array.isArray(emojis)) emojis = [emojis];
    const emojiCount = 50;
    for (let i = 0; i < emojiCount; i++) {
        const emoji = document.createElement('div');
        emoji.className = 'celebration-rain';
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        const startX = Math.random() * window.innerWidth;
        const delay = Math.random() * 0.5;
        const swayX = Math.random() * 100 - 50;
        const rotation = Math.random() * 360;
        emoji.textContent = randomEmoji;
        emoji.style.left = startX + 'px';
        emoji.style.top = '-20px';
        emoji.style.fontSize = Math.random() * 1 + 1.5 + 'rem';
        emoji.style.animation = `emoji-rain-${i} ${duration}s ease-in ${delay}s forwards`;
        const keyframes = `@keyframes emoji-rain-${i} { 0% { transform: translateY(-20px) rotate(0deg); opacity: 1; } 100% { transform: translateY(${window.innerHeight + 20}px) translateX(${swayX}px) rotate(${rotation * 2}deg); opacity: 0; } }`;
        const style = document.createElement('style');
        style.textContent = keyframes;
        document.head.appendChild(style);
        document.body.appendChild(emoji);
        setTimeout(() => emoji.remove(), (duration + delay) * 1000);
    }
};

window.launchHeartRain = function(duration = 3) {
    const hearts = ['❤️', '💖', '💕', '💗', '💝', '💓', '💞', '💘'];
    window.launchEmojiRain(hearts, duration);
};

window.launchCelebrationRain = function(duration = 3) {
    const emojis = ['❤️', '😍', '🥳', '🎉', '💖', '✨', '🎊', '🌟', '💫', '⭐'];
    window.launchEmojiRain(emojis, duration);
};

window.launchSmileRain = function(duration = 3) {
    const emojis = ['😊', '🙂', '😌', '🌻', '🌸', '🌼', '🌺', '🌷', '🌹'];
    window.launchEmojiRain(emojis, duration);
};

window.launchFlowerPetals = function(duration = 4) {
    const petals = ['🌸', '🌺', '🌼', '🌻', '🌷', '🌹', '💐'];
    const petalCount = 40;
    for (let i = 0; i < petalCount; i++) {
        const petal = document.createElement('div');
        petal.className = 'celebration-rain';
        const randomPetal = petals[Math.floor(Math.random() * petals.length)];
        const startX = Math.random() * window.innerWidth;
        const delay = Math.random() * 0.8;
        const xWave = Math.sin((i / petalCount) * Math.PI * 2) * 100;
        const rotation = Math.random() * 360;
        petal.textContent = randomPetal;
        petal.style.left = startX + 'px';
        petal.style.top = '-20px';
        petal.style.fontSize = '1.5rem';
        petal.style.animation = `petal-fall-${i} ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s forwards`;
        const keyframes = `@keyframes petal-fall-${i} { 0% { transform: translateY(-20px) translateX(0) rotate(0deg); opacity: 1; } 50% { transform: translateY(${window.innerHeight / 2}px) translateX(${xWave}px) rotate(${rotation / 2}deg); opacity: 1; } 100% { transform: translateY(${window.innerHeight + 20}px) translateX(${xWave * 1.5}px) rotate(${rotation * 3}deg); opacity: 0; } }`;
        const style = document.createElement('style');
        style.textContent = keyframes;
        document.head.appendChild(style);
        document.body.appendChild(petal);
        setTimeout(() => petal.remove(), (duration + delay) * 1000);
    }
};

window.launchFireworks = function(x = null, y = null, count = 5) {
    if (!x) x = window.innerWidth / 2;
    if (!y) y = window.innerHeight / 2;
    const colors = ['#ff6b9d', '#ffa502', '#00ff88', '#ff1493', '#00d4ff'];
    for (let f = 0; f < count; f++) {
        setTimeout(() => {
            const particlesPerFirework = 30;
            for (let i = 0; i < particlesPerFirework; i++) {
                const particle = document.createElement('div');
                particle.className = 'firework';
                const angle = (i / particlesPerFirework) * Math.PI * 2;
                const velocity = Math.random() * 5 + 3;
                const endX = x + Math.cos(angle) * velocity * 100;
                const endY = y + Math.sin(angle) * velocity * 100;
                const color = colors[Math.floor(Math.random() * colors.length)];
                const size = Math.random() * 6 + 3;
                const duration = Math.random() * 1 + 1;
                particle.style.width = size + 'px';
                particle.style.height = size + 'px';
                particle.style.left = x + 'px';
                particle.style.top = y + 'px';
                particle.style.background = color;
                particle.style.borderRadius = '50%';
                particle.style.boxShadow = `0 0 ${size}px ${color}`;
                particle.style.animation = `firework-burst-${i}-${f} ${duration}s ease-out forwards`;
                const keyframes = `@keyframes firework-burst-${i}-${f} { to { transform: translate(${endX - x}px, ${endY - y}px); opacity: 0; } }`;
                const style = document.createElement('style');
                style.textContent = keyframes;
                document.head.appendChild(style);
                document.body.appendChild(particle);
                setTimeout(() => particle.remove(), duration * 1000);
            }
        }, f * 200);
    }
};

window.showCelebration = function() {
    window.launchFireworks(window.innerWidth * 0.25, window.innerHeight * 0.3, 2);
    setTimeout(() => { window.launchFireworks(window.innerWidth * 0.75, window.innerHeight * 0.3, 2); }, 200);
    setTimeout(() => { window.launchConfetti(2.5); }, 400);
    setTimeout(() => { window.launchCelebrationRain(3); }, 600);
    setTimeout(() => { window.launchHeartRain(3); }, 1200);
};

window.showNoAnimation = function() {
    window.launchSmileRain(3);
    setTimeout(() => { window.launchFlowerPetals(3); }, 300);
};

window.initializeAnimations = function() {
    window.createParticles();
    window.createFloatingHearts();
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            window.createParticles();
            window.createFloatingHearts();
        }, 250);
    });
};

window.generateGoogleCalendarUrl = function(date, time, title = 'Lunch/Dinner Meeting', description = '') {
    if (!date || !time) return null;
    const [year, month, day] = date.split('-');
    const [hours, minutes] = time.split(':');
    const startTime = `${year}${month}${day}T${hours}${minutes}00`;
    const endTime = `${year}${month}${day}T${String(parseInt(hours) + 1).padStart(2, '0')}${minutes}00`;
    const params = {
        action: 'TEMPLATE',
        text: encodeURIComponent(title),
        dates: `${startTime}/${endTime}`,
        details: encodeURIComponent(description),
        location: encodeURIComponent('Restaurant')
    };
    const url = new URL('https://calendar.google.com/calendar/render');
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    return url.toString();
};

window.getDeviceInfo = function() {
    const ua = navigator.userAgent;
    let device = 'Desktop';
    let browser = 'Unknown';
    if (/mobile/i.test(ua)) device = 'Mobile';
    else if (/tablet|ipad|playbook|silk/i.test(ua)) device = 'Tablet';
    if (/firefox/i.test(ua)) browser = 'Firefox';
    else if (/chrome/i.test(ua)) browser = 'Chrome';
    else if (/safari/i.test(ua)) browser = 'Safari';
    else if (/edge/i.test(ua)) browser = 'Edge';
    else if (/opera|opr/i.test(ua)) browser = 'Opera';
    return { device, browser, userAgent: ua };
};

document.addEventListener('DOMContentLoaded', window.initializeAnimations);