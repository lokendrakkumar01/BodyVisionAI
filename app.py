from flask import Flask, render_template, send_from_directory, jsonify, request
from datetime import datetime
import os
import json

app = Flask(__name__, static_folder='static', template_folder='templates')

# Store session data in memory (in production, use a database)
session_data = {
    'gestures': [],
    'analytics': [],
    'settings': {
        'theme': 'dark',
        'showPose': True,
        'showHands': True,
        'showFace': False,
        'multiPerson': False,
        'showLabels': True,
        'visualizationStyle': 'skeleton',
        'confidenceThreshold': 0.5
    }
}

@app.route('/')
def index():
    """Main page with body parts recognition"""
    return render_template('index.html')

@app.route('/static/<path:filename>')
def serve_static(filename):
    """Serve static files"""
    return send_from_directory('static', filename)

@app.route('/health')
def health():
    """Health check endpoint for Render"""
    return {'status': 'healthy', 'app': 'BodyVisionAI - Advanced Body Parts Recognition'}

@app.route('/api/gestures', methods=['GET', 'POST'])
def gestures():
    """Gesture recognition API endpoint"""
    if request.method == 'POST':
        data = request.json
        gesture_data = {
            'gesture': data.get('gesture'),
            'confidence': data.get('confidence'),
            'timestamp': datetime.now().isoformat()
        }
        session_data['gestures'].append(gesture_data)
        return jsonify({'status': 'success', 'data': gesture_data})
    else:
        return jsonify({'gestures': session_data['gestures'][-10:]})  # Last 10 gestures

@app.route('/api/analytics', methods=['GET', 'POST'])
def analytics():
    """Pose analytics API endpoint"""
    if request.method == 'POST':
        data = request.json
        analytics_data = {
            'posture_score': data.get('posture_score'),
            'joint_angles': data.get('joint_angles'),
            'body_alignment': data.get('body_alignment'),
            'timestamp': datetime.now().isoformat()
        }
        session_data['analytics'].append(analytics_data)
        return jsonify({'status': 'success', 'data': analytics_data})
    else:
        return jsonify({'analytics': session_data['analytics'][-10:]})

@app.route('/api/settings', methods=['GET', 'POST'])
def settings():
    """User settings API endpoint"""
    if request.method == 'POST':
        data = request.json
        session_data['settings'].update(data)
        return jsonify({'status': 'success', 'settings': session_data['settings']})
    else:
        return jsonify({'settings': session_data['settings']})

@app.route('/api/export', methods=['GET'])
def export_data():
    """Export session data"""
    export_format = request.args.get('format', 'json')
    
    if export_format == 'json':
        return jsonify({
            'export_date': datetime.now().isoformat(),
            'gestures': session_data['gestures'],
            'analytics': session_data['analytics'],
            'settings': session_data['settings']
        })
    
    return jsonify({'error': 'Unsupported format'}), 400

@app.route('/api/reset', methods=['POST'])
def reset_session():
    """Reset session data"""
    session_data['gestures'] = []
    session_data['analytics'] = []
    return jsonify({'status': 'success', 'message': 'Session data reset'})

@app.route('/api/agriculture/identify', methods=['POST'])
def identify_crop():
    """Identify crop and provide farming solutions"""
    data = request.json
    crop_type = data.get('crop_type', 'wheat')
    
    # Import crop database
    crop_database = {
        'wheat': {'hindi': 'गेहूं', 'english': 'Wheat', 'emoji': '🌾'},
        'rice': {'hindi': 'धान/चावल', 'english': 'Rice', 'emoji': '🌾'},
        'corn': {'hindi': 'मक्का', 'english': 'Maize', 'emoji': '🌽'},
        'potato': {'hindi': 'आलू', 'english': 'Potato', 'emoji': '🥔'},
        'tomato': {'hindi': 'टमाटर', 'english': 'Tomato', 'emoji': '🍅'},
    }
    
    if crop_type in crop_database:
        return jsonify({
            'status': 'success',
            'crop': crop_database[crop_type],
            'detected': True
        })
    
    return jsonify({'status': 'error', 'message': 'Crop not found'}), 404

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
