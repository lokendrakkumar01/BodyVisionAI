// ===== BODY PARTS RECOGNITION SYSTEM - JAVASCRIPT =====

// DOM Elements
const videoElement = document.getElementById('videoInput');
const canvasElement = document.getElementById('outputCanvas');
const canvasCtx = canvasElement.getContext('2d');
const videoOverlay = document.getElementById('videoOverlay');
const loadingSpinner = document.getElementById('loadingSpinner');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');

// Control checkboxes
const showPoseCheck = document.getElementById('showPose');
const showHandsCheck = document.getElementById('showHands');
const showLabelsCheck = document.getElementById('showLabels');

// Stats elements
const bodyCountEl = document.getElementById('bodyCount');
const handCountEl = document.getElementById('handCount');
const fpsCountEl = document.getElementById('fpsCount');

// State
let pose = null;
let hands = null;
let camera = null;
let isRunning = false;
let lastFrameTime = 0;
let frameCount = 0;
let fps = 0;

// Body part labels for pose landmarks
const POSE_LANDMARKS = {
    0: 'Nose',
    1: 'Left Eye Inner', 2: 'Left Eye', 3: 'Left Eye Outer',
    4: 'Right Eye Inner', 5: 'Right Eye', 6: 'Right Eye Outer',
    7: 'Left Ear', 8: 'Right Ear',
    9: 'Mouth Left', 10: 'Mouth Right',
    11: 'Left Shoulder', 12: 'Right Shoulder',
    13: 'Left Elbow', 14: 'Right Elbow',
    15: 'Left Wrist', 16: 'Right Wrist',
    17: 'Left Pinky', 18: 'Right Pinky',
    19: 'Left Index', 20: 'Right Index',
    21: 'Left Thumb', 22: 'Right Thumb',
    23: 'Left Hip', 24: 'Right Hip',
    25: 'Left Knee', 26: 'Right Knee',
    27: 'Left Ankle', 28: 'Right Ankle',
    29: 'Left Heel', 30: 'Right Heel',
    31: 'Left Foot', 32: 'Right Foot'
};

// Hand landmark labels
const HAND_LANDMARKS = {
    0: 'Wrist',
    4: 'Thumb Tip', 8: 'Index Tip', 12: 'Middle Tip', 16: 'Ring Tip', 20: 'Pinky Tip'
};

// Colors
const COLORS = {
    pose: {
        connection: 'rgba(0, 255, 128, 0.7)',
        landmark: '#00ff80',
        label: '#ffffff'
    },
    leftHand: {
        connection: 'rgba(255, 100, 0, 0.8)',
        landmark: '#ff6400',
        label: '#ffffff'
    },
    rightHand: {
        connection: 'rgba(0, 100, 255, 0.8)',
        landmark: '#0064ff',
        label: '#ffffff'
    }
};

// Initialize MediaPipe Pose
function initPose() {
    pose = new Pose({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        }
    });
    
    pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });
    
    return pose;
}

// Initialize MediaPipe Hands
function initHands() {
    hands = new Hands({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
    });
    
    hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });
    
    return hands;
}

// Draw pose landmarks
function drawPoseLandmarks(landmarks) {
    if (!landmarks || !showPoseCheck.checked) return 0;
    
    const width = canvasElement.width;
    const height = canvasElement.height;
    
    // Draw connections
    const connections = [
        // Face
        [0, 1], [1, 2], [2, 3], [3, 7],
        [0, 4], [4, 5], [5, 6], [6, 8],
        [9, 10],
        // Body
        [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
        [11, 23], [12, 24], [23, 24],
        [23, 25], [25, 27], [27, 29], [29, 31],
        [24, 26], [26, 28], [28, 30], [30, 32],
        // Hands to body
        [15, 17], [15, 19], [15, 21],
        [16, 18], [16, 20], [16, 22]
    ];
    
    canvasCtx.strokeStyle = COLORS.pose.connection;
    canvasCtx.lineWidth = 3;
    
    connections.forEach(([i, j]) => {
        if (landmarks[i] && landmarks[j] && 
            landmarks[i].visibility > 0.5 && landmarks[j].visibility > 0.5) {
            canvasCtx.beginPath();
            canvasCtx.moveTo(landmarks[i].x * width, landmarks[i].y * height);
            canvasCtx.lineTo(landmarks[j].x * width, landmarks[j].y * height);
            canvasCtx.stroke();
        }
    });
    
    // Draw landmarks
    let visibleCount = 0;
    landmarks.forEach((lm, idx) => {
        if (lm.visibility > 0.5) {
            visibleCount++;
            const x = lm.x * width;
            const y = lm.y * height;
            
            // Draw point
            canvasCtx.beginPath();
            canvasCtx.arc(x, y, 5, 0, 2 * Math.PI);
            canvasCtx.fillStyle = COLORS.pose.landmark;
            canvasCtx.fill();
            canvasCtx.strokeStyle = '#ffffff';
            canvasCtx.lineWidth = 2;
            canvasCtx.stroke();
            
            // Draw label for key points
            if (showLabelsCheck.checked && POSE_LANDMARKS[idx] && 
                [0, 11, 12, 15, 16, 23, 24, 27, 28].includes(idx)) {
                canvasCtx.font = 'bold 12px Inter';
                canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                const textWidth = canvasCtx.measureText(POSE_LANDMARKS[idx]).width;
                canvasCtx.fillRect(x - 2, y - 20, textWidth + 6, 18);
                canvasCtx.fillStyle = COLORS.pose.label;
                canvasCtx.fillText(POSE_LANDMARKS[idx], x, y - 6);
            }
        }
    });
    
    return visibleCount;
}

// Draw hand landmarks
function drawHandLandmarks(landmarksList, handednessList) {
    if (!landmarksList || !showHandsCheck.checked) return 0;
    
    const width = canvasElement.width;
    const height = canvasElement.height;
    
    let handCount = 0;
    
    landmarksList.forEach((landmarks, handIdx) => {
        handCount++;
        const isLeft = handednessList && handednessList[handIdx] && 
                       handednessList[handIdx].label === 'Left';
        const colors = isLeft ? COLORS.leftHand : COLORS.rightHand;
        const handLabel = isLeft ? 'L' : 'R';
        
        // Hand connections
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4],  // Thumb
            [0, 5], [5, 6], [6, 7], [7, 8],  // Index
            [0, 9], [9, 10], [10, 11], [11, 12],  // Middle
            [0, 13], [13, 14], [14, 15], [15, 16],  // Ring
            [0, 17], [17, 18], [18, 19], [19, 20],  // Pinky
            [5, 9], [9, 13], [13, 17]  // Palm
        ];
        
        canvasCtx.strokeStyle = colors.connection;
        canvasCtx.lineWidth = 3;
        
        connections.forEach(([i, j]) => {
            if (landmarks[i] && landmarks[j]) {
                canvasCtx.beginPath();
                canvasCtx.moveTo(landmarks[i].x * width, landmarks[i].y * height);
                canvasCtx.lineTo(landmarks[j].x * width, landmarks[j].y * height);
                canvasCtx.stroke();
            }
        });
        
        // Draw landmarks
        landmarks.forEach((lm, idx) => {
            const x = lm.x * width;
            const y = lm.y * height;
            
            // Draw point
            canvasCtx.beginPath();
            canvasCtx.arc(x, y, 4, 0, 2 * Math.PI);
            canvasCtx.fillStyle = colors.landmark;
            canvasCtx.fill();
            canvasCtx.strokeStyle = '#ffffff';
            canvasCtx.lineWidth = 1;
            canvasCtx.stroke();
            
            // Draw labels for fingertips
            if (showLabelsCheck.checked && HAND_LANDMARKS[idx]) {
                const label = `${handLabel}-${HAND_LANDMARKS[idx]}`;
                canvasCtx.font = 'bold 10px Inter';
                canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                const textWidth = canvasCtx.measureText(label).width;
                canvasCtx.fillRect(x - 2, y - 16, textWidth + 4, 14);
                canvasCtx.fillStyle = colors.label;
                canvasCtx.fillText(label, x, y - 4);
            }
        });
    });
    
    return handCount;
}

// Combined results handler
let poseResults = null;
let handsResults = null;

function onPoseResults(results) {
    poseResults = results;
    render();
}

function onHandsResults(results) {
    handsResults = results;
    render();
}

function render() {
    // Calculate FPS
    const now = performance.now();
    frameCount++;
    if (now - lastFrameTime >= 1000) {
        fps = frameCount;
        frameCount = 0;
        lastFrameTime = now;
        fpsCountEl.textContent = fps;
    }
    
    // Set canvas size
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
    
    // Clear canvas
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    // Mirror the canvas to match video
    canvasCtx.save();
    canvasCtx.scale(-1, 1);
    canvasCtx.translate(-canvasElement.width, 0);
    
    // Draw pose
    let bodyParts = 0;
    if (poseResults && poseResults.poseLandmarks) {
        bodyParts = drawPoseLandmarks(poseResults.poseLandmarks);
    }
    bodyCountEl.textContent = bodyParts;
    
    // Draw hands
    let handCount = 0;
    if (handsResults && handsResults.multiHandLandmarks) {
        handCount = drawHandLandmarks(
            handsResults.multiHandLandmarks,
            handsResults.multiHandedness
        );
    }
    handCountEl.textContent = handCount;
    
    canvasCtx.restore();
}

// Start detection
async function startDetection() {
    startBtn.disabled = true;
    loadingSpinner.classList.add('active');
    
    try {
        // Initialize models
        if (!pose) {
            pose = initPose();
            pose.onResults(onPoseResults);
        }
        
        if (!hands) {
            hands = initHands();
            hands.onResults(onHandsResults);
        }
        
        // Get camera access
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user'
            }
        });
        
        videoElement.srcObject = stream;
        
        await new Promise((resolve) => {
            videoElement.onloadedmetadata = () => {
                videoElement.play();
                resolve();
            };
        });
        
        // Start processing loop
        isRunning = true;
        videoOverlay.classList.add('hidden');
        loadingSpinner.classList.remove('active');
        stopBtn.disabled = false;
        startBtn.textContent = '● Running';
        
        processFrame();
        
    } catch (error) {
        console.error('Error starting detection:', error);
        alert('Failed to start detection. Please ensure camera access is allowed.');
        loadingSpinner.classList.remove('active');
        startBtn.disabled = false;
    }
}

// Process video frame
async function processFrame() {
    if (!isRunning) return;
    
    if (videoElement.readyState === 4) {
        if (showPoseCheck.checked) {
            await pose.send({ image: videoElement });
        }
        if (showHandsCheck.checked) {
            await hands.send({ image: videoElement });
        }
    }
    
    requestAnimationFrame(processFrame);
}

// Stop detection
function stopDetection() {
    isRunning = false;
    
    if (videoElement.srcObject) {
        videoElement.srcObject.getTracks().forEach(track => track.stop());
        videoElement.srcObject = null;
    }
    
    videoOverlay.classList.remove('hidden');
    startBtn.disabled = false;
    startBtn.innerHTML = '<span class="btn-icon">▶</span> Start Detection';
    stopBtn.disabled = true;
    
    // Reset stats
    bodyCountEl.textContent = '0';
    handCountEl.textContent = '0';
    fpsCountEl.textContent = '0';
    
    // Clear canvas
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
}

// Event listeners
startBtn.addEventListener('click', startDetection);
stopBtn.addEventListener('click', stopDetection);

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Add particles effect
function createParticles() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 1}px;
            height: ${Math.random() * 4 + 1}px;
            background: rgba(99, 102, 241, ${Math.random() * 0.3 + 0.1});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float ${Math.random() * 10 + 10}s ease-in-out infinite;
            animation-delay: ${Math.random() * 5}s;
        `;
        container.appendChild(particle);
    }
}

// Initialize particles on load
document.addEventListener('DOMContentLoaded', createParticles);

console.log('Body Parts Recognition System initialized');
