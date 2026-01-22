# BodyVisionAI - Advanced Body Parts Recognition System

🚀 **Next-Generation AI-Powered Human Body Detection with Advanced Features**

A cutting-edge real-time body, hand, and face detection web application powered by Google's MediaPipe. Features advanced gesture recognition, pose analytics, multi-person tracking, and comprehensive visualization options.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![MediaPipe](https://img.shields.io/badge/MediaPipe-Latest-green)
![Python](https://img.shields.io/badge/Python-3.11+-yellow)
![License](https://img.shields.io/badge/license-MIT-purple)

## 🌟 Advanced Features

### Core Detection Capabilities
- 🦴 **Full Body Tracking** - 33 key body landmarks with real-time skeletal overlay
- 🖐️ **Advanced Hand Detection** - 21 landmarks per hand with gesture recognition
- 😊 **Face Mesh** - 468-point facial landmark detection for detailed face tracking
- 👥 **Multi-Person Detection** - Track multiple people simultaneously

### Intelligent Recognition
- 🤟 **Gesture Recognition** - Real-time classification of 8+ hand gestures:
  - Thumbs Up 👍
  - Peace Sign ✌️
  - OK Sign 👌
  - Rock Sign 🤘
  - Fist ✊
  - Open Palm 🖐️
  - Pointing ☝️
  - And more...

### Advanced Analytics
- 📊 **Pose Analytics Dashboard** - Real-time body metrics:
  - Posture Score (0-100)
  - Torso Lean Angle
  - Body Symmetry Analysis
  - Movement Detection (Static/Slow/Moderate/Fast)
- 📐 **Joint Angle Calculations** - Precise measurements for:
  - Elbows, Knees, Shoulders, Hips
  - Custom angle tracking
- ⚖️ **Body Alignment** - Shoulder and hip tilt detection

### Recording & Export
- 📹 **Video Recording** - Capture detection sessions in WebM format
- 📸 **Screenshots** - Save high-quality snapshots
- 💾 **Data Export** - Export session data in JSON format:
  - Gesture history
  - Analytics timeline
  - Pose coordinates
  - Performance metrics

### User Interface
- 🎨 **Premium Modern Design** - Glassmorphism, gradients, and smooth animations
- 📱 **Fully Responsive** - Optimized for desktop, tablet, and mobile devices
- ⚙️ **Advanced Settings Modal** - Customize:
  - Visualization styles
  - Confidence thresholds
  - Performance settings
  - Theme preferences
- 🎯 **Live Stats Display** - Real-time FPS, detection counts, and gesture feedback
- 🔒 **Privacy First** - All processing happens locally in the browser

## 🎯 Use Cases

- **Fitness & Yoga** - Posture analysis and form correction
- **Physical Therapy** - Track patient movement and progress
- **Gaming & VR** - Gesture-based controls
- **Sign Language** - Hand gesture recognition
- **Education** - Human anatomy and movement study
- **Research** - Body mechanics analysis
- **Sports Training** - Movement optimization

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Modern web browser with WebGL support
- Webcam/Camera access

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd body-parts-recognition

# Install dependencies
pip install -r requirements.txt

# Run locally
python app.py
```

Open http://localhost:5000 in your browser.

### First-Time Use

1. Click **"Start Detection"** to begin
2. Allow camera access when prompted
3. Toggle detection features in the control panel:
   - Body Pose
   - Hand Tracking
   - Face Mesh
   - Gesture Recognition
   - Pose Analytics
4. View real-time stats and analytics
5. Use recording controls to capture sessions
6. Export data for further analysis

## 📊 API Endpoints

### Gestures
- `GET /api/gestures` - Get recent gesture detections
- `POST /api/gestures` - Save gesture data
  ```json
  {
    "gesture": "THUMBS_UP",
    "confidence": 0.95
  }
  ```

### Analytics
- `GET /api/analytics` - Get pose analytics
- `POST /api/analytics` - Save analytics data
  ```json
  {
    "posture_score": 85,
    "joint_angles": {...},
    "body_alignment": {...}
  }
  ```

### Settings
- `GET /api/settings` - Get user settings
- `POST /api/settings` - Update settings
  ```json
  {
    "theme": "dark",
    "showPose": true,
    "confidenceThreshold": 0.5
  }
  ```

### Export
- `GET /api/export?format=json` - Export all session data

### Utility
- `GET /health` - Health check
- `POST /api/reset` - Clear session data

## 🎨 Technology Stack

### Frontend
- **HTML5** - Semantic structure
- **CSS3** - Advanced styling with variables, animations, glassmorphism
- **JavaScript (ES6+)** - Modular architecture
- **MediaPipe** - ML models (Pose, Hands, Face Mesh)
- **WebGL** - GPU-accelerated rendering

### Backend
- **Flask** - Python web framework
- **Gunicorn** - Production WSGI server

### ML/AI
- **MediaPipe Pose** - 33-point body detection
- **MediaPipe Hands** - 21-point hand tracking
- **MediaPipe Face Mesh** - 468-point face detection
- **Custom Gesture Recognition** - Pattern matching algorithms
- **Pose Analytics Engine** - Real-time calculations

### Deployment
- **Render** - Cloud hosting platform
- **Git** - Version control

## 📁 Project Structure

```
bodyvisionai/
├── app.py                 # Flask backend with API endpoints
├── requirements.txt       # Python dependencies
├── render.yaml           # Render deployment config
├── Procfile              # Process configuration
├── templates/
│   └── index.html        # Main web interface
├── static/
│   ├── style.css         # Advanced responsive styling
│   ├── script.js         # Main application logic
│   ├── gestures.js       # Gesture recognition module
│   └── analytics.js      # Pose analytics module
├── pose_estimator.py     # Python pose estimation (desktop)
├── main.py               # Desktop version
└── utils/
    └── drawing_utils.py  # Visualization utilities
```

## 🎯 Advanced Features Guide

### Gesture Recognition
Enable gesture detection to recognize hand gestures in real-time. Gestures are displayed on-screen with confidence scores and saved to the session history.

### Pose Analytics
The analytics dashboard provides:
- **Posture Score**: Overall body alignment (0-100)
- **Joint Angles**: Precise angle measurements for major joints
- **Movement Tracking**: Detects static vs. dynamic states
- **Symmetry Analysis**: Left-right body balance

### Multi-Person Mode
Enable to detect and track multiple people in the camera frame. Each person is tracked independently with their own pose data.

### Recording & Export
- **Screenshots**: Click the screenshot button to save the current frame
- **Video Recording**: Start/stop recording to capture detection sessions
- **Data Export**: Download JSON files with complete session data

### Settings & Customization
Access the settings modal to configure:
- **Theme**: Dark/Light mode
- **Visualization Style**: Default, Neon, Minimal, Detailed
- **Confidence Threshold**: Adjust detection sensitivity (0-100%)
- **Performance**: GPU acceleration, landmark smoothing

## 🌐 Deploy to Render

### Automatic Deployment

1. Push code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click "New" → "Web Service"
4. Connect your repository
5. Render auto-detects configuration from `render.yaml`
6. Deploy!

### Manual Configuration

- **Environment**: Python 3
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn app:app --bind 0.0.0.0:$PORT`
- **Health Check**: `/health`

## 📱 Mobile Optimization

The application is fully optimized for mobile devices:
- Responsive layouts adapt to screen size
- Touch-friendly controls
- Optimized camera handling
- Reduced UI for small screens
- Performance optimizations for mobile browsers

## 🔐 Privacy & Security

- ✅ 100% client-side processing
- ✅ Camera feed never leaves your device
- ✅ No data sent to external servers
- ✅ Session data stored in memory only
- ✅ Open-source and transparent

## 🎓 Credits

- **MediaPipe** - Google's ML solution for live perception
- **TensorFlow** - Machine learning framework
- **Inter Font** - UI typography

## 📄 License

MIT License - Free to use and modify.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Built with ❤️ using MediaPipe and Flask**

**BodyVisionAI © 2026 | Advanced AI Body Detection**
