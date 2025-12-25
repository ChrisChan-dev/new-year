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

// Initialize Firebase
// (Check if firebase is loaded first to prevent errors)
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else if (typeof firebase === 'undefined') {
    console.error("Firebase SDK not loaded. Make sure you added the <script> tags in index.html");
}

// Initialize Database
const db = firebase.database();


// --- VISUAL & ANIMATION LOGIC ---

const starContainer = document.getElementById('stars');
// Create background stars
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
const virgoStep = document.getElementById('step-virgo');
const virgoLabel = document.getElementById('virgo-label');
const virgoBtnContainer = document.getElementById('virgo-btn-container');
const finale = document.getElementById('step-finale');
const bgWishContainer = document.getElementById('background-wish-container');

const messages = [
    "2025 wasn’t perfect.",
    "But it had moments worth remembering.",
    "“And people worth smiling about."
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

function playNarrative(index) {
    if (index >= messages.length) {
        showVirgo();
        return;
    }

    narrativeText.textContent = messages[index];
    narrativeText.style.opacity = '0';
    narrativeText.className = 'fade-in';

    setTimeout(() => {
        narrativeText.className = 'fade-out';
        setTimeout(() => {
            playNarrative(index + 1);
        }, 1000); 
    }, 3500);
}

// Virgo "Maiden" Coordinates
const virgoPoints = [
    {x: 76, y: 5},   
    {x: 78, y: 22},  
    {x: 66, y: 35},  
    {x: 15, y: 30},  
    {x: 46, y: 38},  
    {x: 44, y: 58},  
    {x: 68, y: 53},  
    {x: 27, y: 68},  
    {x: 6, y: 85},   
    {x: 85, y: 65},  
    {x: 60, y: 83},  
    {x: 38, y: 92}   
];

const virgoConnections = [
    [0, 1], [1, 2],         
    [2, 4], [3, 4],         
    [4, 5], [2, 6], [5, 6], 
    [5, 7], [7, 8],         
    [6, 9], [9, 10], [10, 11] 
];

function showVirgo() {
    narrative.classList.add('hidden');
    virgoStep.classList.remove('hidden');
    
    const svg = document.getElementById('constellation-svg');
    svg.innerHTML = ''; 

    virgoPoints.forEach((point, index) => {
        const star = document.createElement('div');
        star.className = 'star virgo-star';
        star.style.left = point.x + '%';
        star.style.top = point.y + '%';
        
        if(index === 11) { 
            star.style.width = '8px';
            star.style.height = '8px';
            star.style.boxShadow = '0 0 15px #FFBF00';
        } else {
            star.style.width = '5px';
            star.style.height = '5px';
        }
        star.style.setProperty('--duration', '2s');
        starContainer.appendChild(star);
    });

    virgoConnections.forEach((pair, index) => {
        const p1 = virgoPoints[pair[0]];
        const p2 = virgoPoints[pair[1]];
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', p1.x + '%');
        line.setAttribute('y1', p1.y + '%');
        line.setAttribute('x2', p2.x + '%');
        line.setAttribute('y2', p2.y + '%');
        line.classList.add('constellation-line');
        line.style.animationDelay = (index * 0.3) + 's';
        svg.appendChild(line);
    });

    setTimeout(() => {
        virgoLabel.classList.add('label-visible');
    }, 2500);

    setTimeout(() => {
        virgoBtnContainer.classList.remove('hidden');
        setTimeout(() => {
            virgoBtnContainer.classList.add('label-visible');
        }, 50);
    }, 4500);
}

function finishVirgoStep() {
    virgoStep.classList.add('fade-out');
    document.querySelectorAll('.virgo-star').forEach(el => el.classList.add('fade-out'));
    
    setTimeout(showFinale, 1500);
}

function showFinale() {
    virgoStep.classList.add('hidden');
    document.querySelectorAll('.virgo-star').forEach(el => el.remove());

    finale.classList.remove('hidden');
    startFireworks();

    // START LISTENING FOR WISHES FROM FIREBASE
    listenForWishes();
}


// --- CLOUD DATABASE LOGIC ---

function saveMessage() {
    const input = document.getElementById('user-message');
    const val = input.value;
    if(val.trim() === "") return;

    // Push to Firebase Cloud (This saves it online!)
    db.ref('wishes').push({
        text: val,
        timestamp: Date.now()
    }).catch(error => {
        console.error("Error saving message:", error);
        alert("Could not save message. Check your internet or Firebase rules.");
    });

    // Clear input
    input.value = '';

    // Show Confirmation
    const confirmMsg = document.getElementById('save-confirmation');
    confirmMsg.classList.remove('hidden');
    confirmMsg.classList.add('fade-in');
    
    setTimeout(() => {
        confirmMsg.classList.remove('fade-in');
        confirmMsg.classList.add('fade-out');
        setTimeout(() => {
             confirmMsg.classList.add('hidden');
             confirmMsg.classList.remove('fade-out');
        }, 1000);
    }, 2000);
}

function listenForWishes() {
    // This runs whenever ANYONE adds a wish, even on another device
    // It grabs the last 50 wishes so the screen isn't empty
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
    
    // Random Positioning
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

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function createParticle(x, y) {
    const particleCount = 30;
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: x,
            y: y,
            color: `hsl(${Math.random() * 50 + 20}, 100%, 50%)`, 
            radius: Math.random() * 3,
            speed: {
                x: (Math.random() - 0.5) * 6,
                y: (Math.random() - 0.5) * 6
            },
            life: 100,
            opacity: 1
        });
    }
}

function updateFireworks() {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';

    particles.forEach((p, index) => {
        p.x += p.speed.x;
        p.y += p.speed.y;
        p.life--;
        p.opacity -= 0.01;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();

        if (p.life <= 0 || p.opacity <= 0) {
            particles.splice(index, 1);
        }
    });

    requestAnimationFrame(updateFireworks);
}

function startFireworks() {
    updateFireworks();
    setInterval(() => {
        createParticle(
            Math.random() * canvas.width, 
            Math.random() * canvas.height / 2 
        );
    }, 800);
}

function toggleMusic() {
    const btn = document.getElementById('music-control');
    btn.style.opacity = btn.style.opacity === '1' ? '0.3' : '1';
}
