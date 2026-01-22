// ===== BODYVISIONAI - ADVANCED BODY PARTS RECOGNITION SYSTEM =====

// DOM Elements
const videoElement = document.getElementById('videoInput');
const canvasElement = document.getElementById('outputCanvas');
const canvasCtx = canvasElement.getContext('2d');

// Control Elements
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const screenshotBtn = document.getElementById('screenshotBtn');
const recordBtn = document.getElementById('recordBtn');
const exportBtn = document.getElementById('exportBtn');
const settingsBtn = document.getElementById('settingsBtn');
const closeSettings = document.getElementById('closeSettings');

// Checkbox Controls
const showPoseCheckbox = document.getElementById('showPose');
const showHandsCheckbox = document.getElementById('showHands');
const showFaceCheckbox = document.getElementById('showFace');
const detectGesturesCheckbox = document.getElementById('detectGestures');
const showAnalyticsCheckbox = document.getElementById('showAnalytics');
const detectObjectsCheckbox = document.getElementById('detectObjects');
const multiPersonCheckbox = document.getElementById('multiPerson');
const showLabelsCheckbox = document.getElementById('showLabels');

// Display Elements
const videoOverlay = document.getElementById('videoOverlay');
const loadingSpinner = document.getElementById('loadingSpinner');
const bodyCountEl = document.getElementById('bodyCount');
const handCountEl = document.getElementById('handCount');
const fpsCountEl = document.getElementById('fpsCount');
const currentGestureEl = document.getElementById('currentGesture');
const objectCountEl = document.getElementById('objectCount');
const gestureDisplay = document.getElementById('gestureDisplay');
const gestureIcon = document.getElementById('gestureIcon');
const gestureName = document.getElementById('gestureName');
const postureBadge = document.getElementById('postureBadge');
const postureScore = document.getElementById('postureScore');
const analyticsDashboard = document.getElementById('analyticsDashboard');
const settingsModal = document.getElementById('settingsModal');

// Analytics Elements
const analyticsPosture = document.getElementById('analyticsPosture');
const analyticsTorso = document.getElementById('analyticsTorso');
const analyticsSymmetry = document.getElementById('analyticsSymmetry');
const analyticsMovement = document.getElementById('analyticsMovement');
const angleLeftElbow = document.getElementById('angleLeftElbow');
const angleRightElbow = document.getElementById('angleRightElbow');
const angleLeftKnee = document.getElementById('angleLeftKnee');
const angleRightKnee = document.getElementById('angleRightKnee');
const postureBar = document.getElementById('postureBar');

// State
let pose = null;
let hands = null;
let faceMesh = null;
let camera = null;
let isRunning = false;
let lastFrameTime = 0;
let frameCount = 0;
let fps = 0;
let mediaRecorder = null;
let recordedChunks = [];

// Initialize gesture recognizer, pose analytics, and object detector
const gestureRecognizer = new GestureRecognizer();
const poseAnalytics = new PoseAnalytics();
const objectDetector = new ObjectDetector();

// Results storage
let poseResults = null;
let handsResults = null;
let faceMeshResults = null;

// Pose landmark labels
const POSE_LANDMARKS = {
    0: 'Nose',
    11: 'Left Shoulder', 12: 'Right Shoulder',
    13: 'Left Elbow', 14: 'Right Elbow',
    15: 'Left Wrist', 16: 'Right Wrist',
    23: 'Left Hip', 24: 'Right Hip',
    25: 'Left Knee', 26: 'Right Knee',
    27: 'Left Ankle', 28: 'Right Ankle'
};

// Hand landmark labels
const HAND_LANDMARKS = {
    0: 'Wrist',
    4: 'Thumb Tip', 8: 'Index Tip',
    12: 'Middle Tip', 16: 'Ring Tip', 20: 'Pinky Tip'
};

// Colors
const COLORS = {
    pose: {
        connection: 'rgba(0, 255, 170, 0.8)',
        landmark: '#00ffaa',
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

// ===== INITIALIZE MEDIAPIPE MODELS =====

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
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    pose.onResults(onPoseResults);
}

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

    hands.onResults(onHandsResults);
}

function initFaceMesh() {
    faceMesh = new FaceMesh({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
    });

    faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    faceMesh.onResults(onFaceMeshResults);
}

// ===== RESULTS HANDLERS =====

function onPoseResults(results) {
    poseResults = results;
}

function onHandsResults(results) {
    handsResults = results;
}

function onFaceMeshResults(results) {
    faceMeshResults = results;
}

// ===== DRAWING FUNCTIONS =====

function drawPoseLandmarks(landmarks) {
    if (!showPoseCheckbox.checked) return;

    const connections = window.POSE_CONNECTIONS;

    // Draw connections
    canvasCtx.strokeStyle = COLORS.pose.connection;
    canvasCtx.lineWidth = 3;

    connections.forEach(([start, end]) => {
        const startPoint = landmarks[start];
        const endPoint = landmarks[end];

        if (startPoint && endPoint && startPoint.visibility > 0.5 && endPoint.visibility > 0.5) {
            canvasCtx.beginPath();
            canvasCtx.moveTo(startPoint.x * canvasElement.width, startPoint.y * canvasElement.height);
            canvasCtx.lineTo(endPoint.x * canvasElement.width, endPoint.y * canvasElement.height);
            canvasCtx.stroke();
        }
    });

    // Draw landmarks
    landmarks.forEach((landmark, idx) => {
        if (landmark.visibility > 0.5) {
            const x = landmark.x * canvasElement.width;
            const y = landmark.y * canvasElement.height;

            // Draw point
            canvasCtx.fillStyle = COLORS.pose.landmark;
            canvasCtx.beginPath();
            canvasCtx.arc(x, y, 5, 0, 2 * Math.PI);
            canvasCtx.fill();

            // Draw label
            if (showLabelsCheckbox.checked && POSE_LANDMARKS[idx]) {
                canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                canvasCtx.fillRect(x - 30, y - 25, 60, 18);
                canvasCtx.fillStyle = COLORS.pose.label;
                canvasCtx.font = '10px Inter';
                canvasCtx.textAlign = 'center';
                canvasCtx.fillText(POSE_LANDMARKS[idx], x, y - 12);
            }
        }
    });

    // Update body count
    bodyCountEl.textContent = landmarks.length;
}

function drawHandLandmarks(landmarksList, handednessList) {
    if (!showHandsCheckbox.checked) return;

    landmarksList.forEach((landmarks, index) => {
        const handedness = handednessList[index].label;
        const color = handedness === 'Left' ? COLORS.leftHand : COLORS.rightHand;
        const connections = window.HAND_CONNECTIONS;

        // Draw connections
        canvasCtx.strokeStyle = color.connection;
        canvasCtx.lineWidth = 2;

        connections.forEach(([start, end]) => {
            const startPoint = landmarks[start];
            const endPoint = landmarks[end];

            canvasCtx.beginPath();
            canvasCtx.moveTo(startPoint.x * canvasElement.width, startPoint.y * canvasElement.height);
            canvasCtx.lineTo(endPoint.x * canvasElement.width, endPoint.y * canvasElement.height);
            canvasCtx.stroke();
        });

        // Draw landmarks
        landmarks.forEach((landmark, idx) => {
            const x = landmark.x * canvasElement.width;
            const y = landmark.y * canvasElement.height;

            canvasCtx.fillStyle = color.landmark;
            canvasCtx.beginPath();
            canvasCtx.arc(x, y, 4, 0, 2 * Math.PI);
            canvasCtx.fill();

            // Draw labels for key points
            if (showLabelsCheckbox.checked && HAND_LANDMARKS[idx]) {
                canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                canvasCtx.fillRect(x - 25, y - 25, 50, 16);
                canvasCtx.fillStyle = color.label;
                canvasCtx.font = '9px Inter';
                canvasCtx.textAlign = 'center';
                canvasCtx.fillText(HAND_LANDMARKS[idx], x, y - 12);
            }
        });

        // Gesture recognition
        if (detectGesturesCheckbox.checked) {
            const gesture = gestureRecognizer.detectGesture(landmarks, handedness);
            if (gesture.confidence > 0.7) {
                updateGestureDisplay(gesture);
            }
        }
    });

    // Update hand count
    handCountEl.textContent = landmarksList.length;
}

function drawFaceMesh(landmarks) {
    if (!showFaceCheckbox.checked || !landmarks) return;

    canvasCtx.strokeStyle = 'rgba(100, 200, 255, 0.5)';
    canvasCtx.lineWidth = 1;

    // Draw face mesh connections
    if (window.FACEMESH_TESSELATION) {
        window.FACEMESH_TESSELATION.forEach(([start, end]) => {
            const startPoint = landmarks[start];
            const endPoint = landmarks[end];

            if (startPoint && endPoint) {
                canvasCtx.beginPath();
                canvasCtx.moveTo(startPoint.x * canvasElement.width, startPoint.y * canvasElement.height);
                canvasCtx.lineTo(endPoint.x * canvasElement.width, endPoint.y * canvasElement.height);
                canvasCtx.stroke();
            }
        });
    }
}

// ===== OBJECT DETECTION =====

async function drawObjectDetections() {
    if (!detectObjectsCheckbox.checked || !objectDetector.isReady()) return;

    try {
        const detections = await objectDetector.detectObjects(videoElement);

        // Update object count
        objectCountEl.textContent = detections.length;

        // Draw bounding boxes and labels
        detections.forEach(detection => {
            const [x, y, width, height] = detection.bbox;

            // Scale bbox to canvas size
            const scaleX = canvasElement.width / videoElement.videoWidth;
            const scaleY = canvasElement.height / videoElement.videoHeight;

            const scaledX = x * scaleX;
            const scaledY = y * scaleY;
            const scaledWidth = width * scaleX;
            const scaledHeight = height * scaleY;

            // Draw bounding box
            canvasCtx.strokeStyle = '#00ffaa';
            canvasCtx.lineWidth = 3;
            canvasCtx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);

            // Draw label background
            const label = `${detection.emoji} ${detection.class}`;
            const confidence = `${Math.round(detection.confidence * 100)}%`;
            canvasCtx.font = '14px Inter';
            const labelWidth = canvasCtx.measureText(label + ' ' + confidence).width + 16;

            canvasCtx.fillStyle = 'rgba(0, 255, 170, 0.9)';
            canvasCtx.fillRect(scaledX, scaledY - 28, labelWidth, 24);

            // Draw label text
            canvasCtx.fillStyle = '#000';
            canvasCtx.textAlign = 'left';
            canvasCtx.textBaseline = 'middle';
            canvasCtx.fillText(label, scaledX + 8, scaledY - 16);

            // Draw confidence
            canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            canvasCtx.font = '11px Inter';
            canvasCtx.fillText(confidence, scaledX + 8 + canvasCtx.measureText(label).width + 4, scaledY - 16);
        });
    } catch (error) {
        console.error('Error detecting objects:', error);
    }
}

// ===== RENDER FRAME =====

function render() {
    // Clear canvas
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Draw video frame
    canvasCtx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

    // Draw face mesh
    if (faceMeshResults && faceMeshResults.multiFaceLandmarks) {
        faceMeshResults.multiFaceLandmarks.forEach(landmarks => {
            drawFaceMesh(landmarks);
        });
    }

    // Draw pose landmarks
    if (poseResults && poseResults.poseLandmarks) {
        drawPoseLandmarks(poseResults.poseLandmarks);

        // Pose analytics
        if (showAnalyticsCheckbox.checked) {
            const analytics = poseAnalytics.analyzePose(poseResults.poseLandmarks);
            if (analytics) {
                updateAnalyticsDisplay(analytics);
            }
        }
    }

    // Draw hand landmarks
    if (handsResults && handsResults.multiHandLandmarks) {
        drawHandLandmarks(handsResults.multiHandLandmarks, handsResults.multiHandedness);
    }

    // Draw object detections
    if (detectObjectsCheckbox.checked) {
        drawObjectDetections();
    }

    // Calculate FPS
    frameCount++;
    const now = performance.now();
    const elapsed = now - lastFrameTime;

    if (elapsed >= 1000) {
        fps = Math.round((frameCount * 1000) / elapsed);
        fpsCountEl.textContent = fps;
        frameCount = 0;
        lastFrameTime = now;
    }
}

// ===== UPDATE DISPLAYS =====

function updateGestureDisplay(gesture) {
    gestureIcon.textContent = gesture.emoji;
    gestureName.textContent = gesture.gesture.replace('_', ' ');
    currentGestureEl.textContent = gesture.gesture;

    // Show gesture display briefly
    gestureDisplay.style.opacity = '1';
    setTimeout(() => {
        gestureDisplay.style.opacity = '0';
    }, 2000);

    // Send to backend
    sendGestureData(gesture);
}

function updateAnalyticsDisplay(analytics) {
    const score = Math.round(analytics.postureScore);
    analyticsPosture.textContent = score;
    postureScore.textContent = score;
    postureBar.style.width = score + '%';

    // Color code based on score
    if (score >= 80) {
        postureBar.style.background = 'linear-gradient(90deg, #00ff88, #00cc66)';
    } else if (score >= 60) {
        postureBar.style.background = 'linear-gradient(90deg, #ffaa00, #ff8800)';
    } else {
        postureBar.style.background = 'linear-gradient(90deg, #ff4444, #cc0000)';
    }

    analyticsTorso.textContent = Math.round(analytics.jointAngles.torsoLean) + '°';
    analyticsSymmetry.textContent = Math.round(analytics.bodyAlignment.symmetryScore) + '%';
    analyticsMovement.textContent = analytics.movements.movement;

    // Update joint angles
    angleLeftElbow.textContent = Math.round(analytics.jointAngles.leftElbow) + '°';
    angleRightElbow.textContent = Math.round(analytics.jointAngles.rightElbow) + '°';
    angleLeftKnee.textContent = Math.round(analytics.jointAngles.leftKnee) + '°';
    angleRightKnee.textContent = Math.round(analytics.jointAngles.rightKnee) + '°';

    // Show analytics dashboard
    analyticsDashboard.style.display = 'block';

    // Send to backend
    sendAnalyticsData(analytics);
}

// ===== PROCESS FRAME =====

async function processFrame() {
    if (!isRunning) return;

    try {
        // Process pose
        if (showPoseCheckbox.checked && pose) {
            await pose.send({ image: videoElement });
        }

        // Process hands
        if (showHandsCheckbox.checked && hands) {
            await hands.send({ image: videoElement });
        }

        // Process face mesh
        if (showFaceCheckbox.checked && faceMesh) {
            await faceMesh.send({ image: videoElement });
        }

        // Render results
        render();
    } catch (error) {
        console.error('Error processing frame:', error);
    }

    if (isRunning) {
        requestAnimationFrame(processFrame);
    }
}

// ===== START DETECTION =====

async function startDetection() {
    if (isRunning) return;

    try {
        startBtn.disabled = true;
        loadingSpinner.style.display = 'flex';

        // Initialize models
        if (!pose) initPose();
        if (!hands) initHands();
        if (!faceMesh) initFaceMesh();

        // Load object detection model if needed
        if (detectObjectsCheckbox.checked && !objectDetector.isLoaded) {
            console.log('Loading object detection model...');
            await objectDetector.loadModel();
        }

        // Get camera
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user'
            },
            audio: false
        });

        videoElement.srcObject = stream;

        videoElement.onloadedmetadata = () => {
            // Set canvas size
            canvasElement.width = videoElement.videoWidth;
            canvasElement.height = videoElement.videoHeight;

            // Hide overlay, show canvas
            videoOverlay.style.display = 'none';
            loadingSpinner.style.display = 'none';
            canvasElement.style.display = 'block';

            // Update UI
            isRunning = true;
            startBtn.disabled = true;
            stopBtn.disabled = false;
            lastFrameTime = performance.now();

            // Start processing
            processFrame();
        };

    } catch (error) {
        console.error('Error starting detection:', error);
        alert('Could not access camera. Please ensure camera permissions are granted.');
        loadingSpinner.style.display = 'none';
        startBtn.disabled = false;
    }
}

// ===== STOP DETECTION =====

function stopDetection() {
    isRunning = false;

    // Stop camera
    if (videoElement.srcObject) {
        videoElement.srcObject.getTracks().forEach(track => track.stop());
        videoElement.srcObject = null;
    }

    // Stop recording if active
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
    }

    // Reset UI
    startBtn.disabled = false;
    stopBtn.disabled = true;
    canvasElement.style.display = 'none';
    videoOverlay.style.display = 'flex';
    bodyCountEl.textContent = '0';
    handCountEl.textContent = '0';
    fpsCountEl.textContent = '0';
    objectCountEl.textContent = '0';
}

// ===== SCREENSHOT =====

function takeScreenshot() {
    if (!isRunning) {
        alert('Please start detection first');
        return;
    }

    const link = document.createElement('a');
    link.download = `bodyvision-${Date.now()}.png`;
    link.href = canvasElement.toDataURL('image/png');
    link.click();
}

// ===== VIDEO RECORDING =====

function toggleRecording() {
    if (!isRunning) {
        alert('Please start detection first');
        return;
    }

    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        recordBtn.textContent = '🎥 Record';
        recordBtn.classList.remove('recording');
    } else {
        startRecording();
    }
}

function startRecording() {
    recordedChunks = [];
    const stream = canvasElement.captureStream(30);

    mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
    });

    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };

    mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `bodyvision-recording-${Date.now()}.webm`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    };

    mediaRecorder.start();
    recordBtn.textContent = '⏹ Stop Recording';
    recordBtn.classList.add('recording');
}

// ===== DATA EXPORT =====

async function exportData() {
    try {
        const response = await fetch('/api/export?format=json');
        const data = await response.json();

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `bodyvision-data-${Date.now()}.json`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting data:', error);
        alert('Failed to export data');
    }
}

// ===== SETTINGS =====

function openSettings() {
    settingsModal.style.display = 'flex';
}

function closeSettingsModal() {
    settingsModal.style.display = 'none';
}

async function clearData() {
    if (confirm('Are you sure you want to clear all session data?')) {
        try {
            await fetch('/api/reset', { method: 'POST' });
            alert('Session data cleared successfully');
        } catch (error) {
            console.error('Error clearing data:', error);
        }
    }
}

// ===== API COMMUNICATION =====

async function sendGestureData(gesture) {
    try {
        await fetch('/api/gestures', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                gesture: gesture.gesture,
                confidence: gesture.confidence
            })
        });
    } catch (error) {
        console.error('Error sending gesture data:', error);
    }
}

async function sendAnalyticsData(analytics) {
    try {
        await fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                posture_score: analytics.postureScore,
                joint_angles: analytics.jointAngles,
                body_alignment: analytics.bodyAlignment
            })
        });
    } catch (error) {
        console.error('Error sending analytics data:', error);
    }
}

// ===== EVENT LISTENERS =====

startBtn.addEventListener('click', startDetection);
stopBtn.addEventListener('click', stopDetection);
screenshotBtn.addEventListener('click', takeScreenshot);
recordBtn.addEventListener('click', toggleRecording);
exportBtn.addEventListener('click', exportData);
settingsBtn.addEventListener('click', openSettings);
closeSettings.addEventListener('click', closeSettingsModal);
document.getElementById('clearDataBtn').addEventListener('click', clearData);

// Fullscreen functionality
const fullscreenBtn = document.getElementById('fullscreenBtn');
const videoWrapper = document.querySelector('.video-wrapper');

fullscreenBtn.addEventListener('click', toggleFullscreen);

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        // Enter fullscreen
        if (videoWrapper.requestFullscreen) {
            videoWrapper.requestFullscreen();
        } else if (videoWrapper.webkitRequestFullscreen) {
            videoWrapper.webkitRequestFullscreen(); // Safari
        } else if (videoWrapper.msRequestFullscreen) {
            videoWrapper.msRequestFullscreen(); // IE11
        }
    } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

// Update fullscreen button icon on fullscreen change
document.addEventListener('fullscreenchange', updateFullscreenButton);
document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
document.addEventListener('msfullscreenchange', updateFullscreenButton);

function updateFullscreenButton() {
    const isFullscreen = document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement;

    if (isFullscreen) {
        // Change to exit fullscreen icon
        fullscreenBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
            </svg>
        `;
        fullscreenBtn.title = 'Exit Fullscreen';
    } else {
        // Change to enter fullscreen icon
        fullscreenBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
            </svg>
        `;
        fullscreenBtn.title = 'Toggle Fullscreen';
    }
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Close modal on outside click
settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        closeSettingsModal();
    }
});

// Confidence slider
const confidenceSlider = document.getElementById('confidenceSlider');
const confidenceValue = document.getElementById('confidenceValue');

confidenceSlider.addEventListener('input', (e) => {
    confidenceValue.textContent = e.target.value + '%';
});

// ===== PARTICLES EFFECT =====

function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (15 + Math.random() * 10) + 's';
        particlesContainer.appendChild(particle);
    }
}

// ===== AGRICULTURE MODULE =====

const cropRecognizer = new CropRecognizer();
const cropImageInput = document.getElementById('cropImageInput');
const imageUploadBox = document.getElementById('imageUploadBox');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');
const previewImage = document.getElementById('previewImage');
const cropSelect = document.getElementById('cropSelect');
const identifyCropBtn = document.getElementById('identifyCropBtn');
const cropResults = document.getElementById('cropResults');

let selectedCropImage = null;
let selectedCropType = null;

// Image upload handling
imageUploadBox.addEventListener('click', () => {
    cropImageInput.click();
});

cropImageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            previewImage.src = event.target.result;
            previewImage.style.display = 'block';
            uploadPlaceholder.style.display = 'none';
            selectedCropImage = file;
            identifyCropBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }
});

// Crop selector handling
cropSelect.addEventListener('change', (e) => {
    selectedCropType = e.target.value;
    if (selectedCropType) {
        identifyCropBtn.disabled = false;
    }
});

// Identify crop button
identifyCropBtn.addEventListener('click', async () => {
    if (selectedCropType) {
        displayCropInfo(selectedCropType);
    } else if (selectedCropImage) {
        // In future, use actual AI model
        const result = await cropRecognizer.identifyCrop(selectedCropImage);
        if (result.detected) {
            displayCropInfo(result.crop);
        }
    }
});

function displayCropInfo(cropType) {
    const info = cropRecognizer.getCropInfo(cropType);

    if (!info.found) {
        alert('Crop information not available. Please select a different crop.');
        return;
    }

    // Show results section
    cropResults.style.display = 'block';
    cropResults.scrollIntoView({ behavior: 'smooth' });

    // Update crop names
    document.getElementById('resultEmoji').textContent = info.name.emoji;
    document.getElementById('resultEnglish').textContent = info.name.english;
    document.getElementById('resultHindi').textContent = info.name.hindi;

    // Update season
    document.getElementById('cropSeason').textContent = info.season;

    // Update solutions
    const solutionsList = document.getElementById('cropSolutions');
    solutionsList.innerHTML = '';
    info.solutions.forEach(solution => {
        const li = document.createElement('li');
        li.textContent = solution;
        solutionsList.appendChild(li);
    });

    // Update diseases
    const diseasesList = document.getElementById('cropDiseases');
    diseasesList.innerHTML = '';
    Object.entries(info.diseases).forEach(([disease, remedy]) => {
        const diseaseItem = document.createElement('div');
        diseaseItem.className = 'disease-item';
        diseaseItem.innerHTML = `
            <div class="disease-name">🔴 ${disease.replace(/_/g, ' ').toUpperCase()}</div>
            <div class="disease-remedy">✅ ${remedy}</div>
        `;
        diseasesList.appendChild(diseaseItem);
    });

    // Update general tips
    const tipsList = document.getElementById('generalTips');
    tipsList.innerHTML = '';
    info.generalTips.forEach(tip => {
        const li = document.createElement('li');
        li.textContent = tip;
        tipsList.appendChild(li);
    });
}

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    console.log('BodyVisionAI - Advanced Body Parts Recognition System initialized');
    console.log('Agriculture module loaded with 10+ crop types');
});
