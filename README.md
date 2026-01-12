# Body Parts Recognition System

A real-time AI-powered body and hand detection web application using MediaPipe.

## Features

- 🦴 **Full Body Detection** - 33 body landmarks
- 🖐️ **Hand Tracking** - 21 landmarks per hand
- ⚡ **Real-Time** - 60+ FPS processing
- 🔒 **Privacy First** - All processing in browser
- 📱 **Cross-Platform** - Works on any device

## Live Demo

Once deployed, the application will be available at your Render URL.

## Local Development

### Prerequisites
- Python 3.11+
- pip

### Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Run locally
python app.py
```

Open http://localhost:5000 in your browser.

## Deploy to Render

### Option 1: One-Click Deploy

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Render will auto-detect the configuration

### Option 2: Manual Setup

1. Create a new Web Service on Render
2. Connect your repository
3. Set these options:
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app --bind 0.0.0.0:$PORT`

## Project Structure

```
body-parts-recognition/
├── app.py              # Flask backend
├── requirements.txt    # Python dependencies
├── render.yaml         # Render deployment config
├── Procfile           # Heroku-compatible config
├── templates/
│   └── index.html     # Main web page
├── static/
│   ├── style.css      # Styling
│   └── script.js      # MediaPipe integration
├── main.py            # Desktop version (webcam)
├── pose_estimator.py  # Desktop pose detection
└── utils/
    └── drawing_utils.py
```

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Flask (Python)
- **AI/ML**: MediaPipe (Pose, Hands)
- **Hosting**: Render

## API Endpoints

- `GET /` - Main application page
- `GET /health` - Health check endpoint

## License

MIT License - Free to use and modify.
