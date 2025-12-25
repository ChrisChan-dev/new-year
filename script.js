// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyC2FujKVw17yVdjOagAC1GvWl1BR_Dw7pI",
    authDomain: "newyear-a8a0f.firebaseapp.com",
    databaseURL: "https://newyear-a8a0f-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "newyear-a8a0f",
    storageBucket: "newyear-a8a0f.firebasestorage.app",
    messagingSenderId: "305357971840",
    appId: "1:305357971840:web:727e70520743c91995a165",
    measurementId: "G-5W3J5VGDDY"
};

if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else if (typeof firebase === 'undefined') {
    console.error("Firebase SDK not loaded.");
}
const db = firebase.database();

// --- VISUAL & ANIMATION LOGIC ---
const starContainer = document.getElementById('stars');
for(let i=0; i<100; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.width = Math.random() * 3 + 'px';
    star.style.height = star.style.width;
    star.style.setProperty('--duration', (Math.random() * 3 + 2) + 's');
    starContainer.appendChild(star);
}

const intro = document.getElementById('step-intro');
const narrative = document.getElementById('step-narrative');
const narrativeText = document.getElementById('narrative-text');
const aquariusStep = document.getElementById('step-aquarius');
const aquariusBtnContainer = document.getElementById('aquarius-btn-container');
const finale = document.getElementById('step-finale');
const bgWishContainer = document.getElementById('background-wish-container');

// UPDATED Messages
const messages = [
    "2025 wasn’t perfect.",
    "But it had moments worth remembering.",
    "And people worth smiling about."
];

function startJourney() {
    intro.classList.remove('fade-in');
    intro.classList.add('fade-out');

    setTimeout(() => {
        intro.classList.add('hidden');
        narrative.classList.remove('hidden');
        playNarrative(0);
    }, 1000);
}

// --- UPDATED LOGIC FOR GOLD GLOW ANIMATION ---
function playNarrative(index) {
    if (index >= messages.length) {
        showAquarius();
        return;
    }

    // 1. Set text
    narrativeText.textContent = messages[index];
    
    // 2. Set the Base Class (White + Gold Shadow, but opacity 0)
    narrativeText.className = 'gold-glow-text';

    // 3. Trigger Fade In
    setTimeout(() => {
        narrativeText.classList.add('visible');
    }, 50);

    // 4. Wait for Read Time (4 seconds), then Fade Out
    setTimeout(() => {
        narrativeText.classList.remove('visible'); // Fade out

        // 5. Wait for fade out transition (1.5s), then Next Message
        setTimeout(() => {
            playNarrative(index + 1);
        }, 1500); 

    }, 4000); 
}

const aquariusPoints = [
    {x: 85, y: 10}, 
    {x: 65, y: 25}, 
    {x: 45, y: 40}, 
    {x: 30, y: 50}, 
    {x: 15, y: 60}, 
    {x: 60, y: 50}, 
    {x: 75, y: 55}, 
    {x: 25, y: 75}, 
    {x: 40, y: 85}, 
    {x: 60, y: 80}, 
    {x: 80, y: 90}
];

const aquariusConnections = [
    [0, 1], 
    [1, 2], 
    [2, 3], 
    [3, 4], 
    [2, 5], 
    [5, 6], 
    [4, 7], 
    [7, 8], 
    [8, 9], 
    [9, 10]
];

function showAquarius() {
    narrative.classList.add('hidden');
    aquariusStep.classList.remove('hidden');
    
    const svg = document.getElementById('constellation-svg');
    svg.innerHTML = ''; 

    aquariusPoints.forEach((point) => {
        const star = document.createElement('div');
        star.className = 'aquarius-star';
        star.innerHTML = '★'; 
        star.style.left = point.x + '%';
        star.style.top = point.y + '%';
        starContainer.appendChild(star);
    });

    aquariusConnections.forEach((pair, index) => {
        const p1 = aquariusPoints[pair[0]];
        const p2 = aquariusPoints[pair[1]];
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', p1.x + '%');
        line.setAttribute('y1', p1.y + '%');
        line.setAttribute('x2', p2.x + '%');
        line.setAttribute('y2', p2.y + '%');
        line.classList.add('constellation-line');
        line.style.animationDelay = (index * 0.2) + 's';
        svg.appendChild(line);
    });

    setTimeout(() => {
        document.querySelectorAll('.aquarius-star').forEach(el => el.classList.add('aquarius-star-glow'));
        document.querySelectorAll('.constellation-line').forEach(el => el.classList.add('constellation-line-glow'));
        
        setTimeout(() => {
            aquariusBtnContainer.classList.remove('hidden');
            setTimeout(() => { aquariusBtnContainer.classList.add('label-visible'); }, 50);
        }, 1000);

    }, 6500);
}

function finishAquariusStep() {
    aquariusStep.classList.add('fade-out');
    document.querySelectorAll('.aquarius-star').forEach(el => {
        el.classList.add('fade-out');
    });
    
    setTimeout(showFinale, 1500);
}

function showFinale() {
    aquariusStep.classList.add('hidden');
    document.querySelectorAll('.aquarius-star').forEach(el => el.remove());

    finale.classList.remove('hidden');
    startFireworks();
    listenForWishes();
}

// --- CLOUD DATABASE LOGIC ---
function saveMessage() {
    const input = document.getElementById('user-message');
    const val = input.value;
    if(val.trim() === "") return;

    db.ref('wishes').push({
        text: val,
        timestamp: Date.now()
    }).catch(error => {
        console.error("Error saving message:", error);
        alert("Could not save message. Check connection.");
    });

    input.value = '';

    const confirmMsg = document.getElementById('save-confirmation');
    confirmMsg.classList.remove('hidden');
    confirmMsg.classList.add('fade-in');
    
    setTimeout(() => {
        confirmMsg.classList.remove('fade-in');
        confirmMsg.classList.add('fade-out');
        setTimeout(() => { confirmMsg.classList.add('hidden'); confirmMsg.classList.remove('fade-out'); }, 1000);
    }, 2000);
}

function listenForWishes() {
    db.ref('wishes').limitToLast(50).on('child_added', (snapshot) => {
        const data = snapshot.val();
        if(data && data.text) {
            renderFloatingWish(data.text);
        }
    });
}

function renderFloatingWish(text) {
    const p = document.createElement('div');
    p.className = 'floating-wish';
    p.textContent = text;
    
    const randomTop = Math.floor(Math.random() * 80) + 10; 
    const randomLeft = Math.floor(Math.random() * 80) + 10; 
    const randomDuration = Math.floor(Math.random() * 15) + 10; 
    const randomSize = (Math.random() * 2 + 1) + 'rem'; 
    
    p.style.top = randomTop + '%';
    p.style.left = randomLeft + '%';
    p.style.animationDuration = randomDuration + 's';
    p.style.fontSize = randomSize;
    
    bgWishContainer.appendChild(p);
}


// --- FIREWORKS & MUSIC ---
const canvas = document.getElementById('fireworksCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resizeCanvas); resizeCanvas();

function createParticle(x, y) {
    const particleCount = 30;
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: x, y: y,
            color: `hsl(${Math.random() * 60 + 240}, 100%, 70%)`, 
            radius: Math.random() * 3,
            speed: { x: (Math.random() - 0.5) * 6, y: (Math.random() - 0.5) * 6 },
            life: 100, opacity: 1
        });
    }
}
function updateFireworks() {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';
    particles.forEach((p, index) => {
        p.x += p.speed.x; p.y += p.speed.y; p.life--; p.opacity -= 0.01;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.globalAlpha = p.opacity; ctx.fill();
        if (p.life <= 0 || p.opacity <= 0) particles.splice(index, 1);
    });
    requestAnimationFrame(updateFireworks);
}
function startFireworks() {
    updateFireworks();
    setInterval(() => { createParticle(Math.random() * canvas.width, Math.random() * canvas.height / 2); }, 800);
}
function toggleMusic() {
    const btn = document.getElementById('music-control');
    btn.style.opacity = btn.style.opacity === '1' ? '0.3' : '1';
}