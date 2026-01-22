/**
 * Gesture Recognition Module
 * Detects and classifies hand gestures using MediaPipe hand landmarks
 */

class GestureRecognizer {
      constructor() {
            this.gestures = {
                  THUMBS_UP: '👍',
                  THUMBS_DOWN: '👎',
                  PEACE: '✌️',
                  OK: '👌',
                  ROCK: '🤘',
                  FIST: '✊',
                  OPEN_PALM: '🖐️',
                  POINTING: '☝️'
            };

            this.lastGesture = null;
            this.gestureHistory = [];
            this.confidenceThreshold = 0.7;
      }

      /**
       * Detect gesture from hand landmarks
       * @param {Object} handLandmarks - MediaPipe hand landmarks
       * @param {String} handedness - 'Left' or 'Right'
       * @returns {Object} Detected gesture with confidence
       */
      detectGesture(handLandmarks, handedness) {
            if (!handLandmarks || !handLandmarks.length) {
                  return { gesture: 'NONE', confidence: 0, emoji: '' };
            }

            const landmarks = handLandmarks;

            // Get finger states (extended or curled)
            const fingerStates = this.getFingerStates(landmarks, handedness);

            // Detect specific gestures
            const gesture = this.classifyGesture(fingerStates, landmarks);

            // Add to history
            if (gesture.confidence > this.confidenceThreshold) {
                  this.addToHistory(gesture);
            }

            return gesture;
      }

      /**
       * Determine which fingers are extended
       * @param {Array} landmarks - Hand landmark array
       * @param {String} handedness - 'Left' or 'Right'
       * @returns {Object} States of each finger
       */
      getFingerStates(landmarks, handedness) {
            const isLeft = handedness === 'Left';

            return {
                  thumb: this.isThumbExtended(landmarks, isLeft),
                  index: this.isFingerExtended(landmarks, 8, 6, 5),
                  middle: this.isFingerExtended(landmarks, 12, 10, 9),
                  ring: this.isFingerExtended(landmarks, 16, 14, 13),
                  pinky: this.isFingerExtended(landmarks, 20, 18, 17)
            };
      }

      /**
       * Check if thumb is extended
       */
      isThumbExtended(landmarks, isLeft) {
            const thumbTip = landmarks[4];
            const thumbIP = landmarks[3];
            const thumbMCP = landmarks[2];
            const indexMCP = landmarks[5];

            // Calculate horizontal distance
            const tipToIndex = Math.abs(thumbTip.x - indexMCP.x);
            const mcpToIndex = Math.abs(thumbMCP.x - indexMCP.x);

            return tipToIndex > mcpToIndex * 1.3;
      }

      /**
       * Check if a finger is extended
       */
      isFingerExtended(landmarks, tipIdx, pipIdx, mcpIdx) {
            const tip = landmarks[tipIdx];
            const pip = landmarks[pipIdx];
            const mcp = landmarks[mcpIdx];

            // Finger is extended if tip is higher than pip and mcp
            return tip.y < pip.y && pip.y < mcp.y;
      }

      /**
       * Classify gesture based on finger states
       */
      classifyGesture(states, landmarks) {
            const { thumb, index, middle, ring, pinky } = states;

            // Thumbs Up
            if (thumb && !index && !middle && !ring && !pinky) {
                  return { gesture: 'THUMBS_UP', confidence: 0.9, emoji: this.gestures.THUMBS_UP };
            }

            // Peace Sign
            if (!thumb && index && middle && !ring && !pinky) {
                  return { gesture: 'PEACE', confidence: 0.85, emoji: this.gestures.PEACE };
            }

            // Rock Sign
            if (!thumb && index && !middle && !ring && pinky) {
                  return { gesture: 'ROCK', confidence: 0.85, emoji: this.gestures.ROCK };
            }

            // Open Palm
            if (thumb && index && middle && ring && pinky) {
                  return { gesture: 'OPEN_PALM', confidence: 0.9, emoji: this.gestures.OPEN_PALM };
            }

            // Fist
            if (!thumb && !index && !middle && !ring && !pinky) {
                  return { gesture: 'FIST', confidence: 0.8, emoji: this.gestures.FIST };
            }

            // Pointing
            if (!thumb && index && !middle && !ring && !pinky) {
                  return { gesture: 'POINTING', confidence: 0.85, emoji: this.gestures.POINTING };
            }

            // OK Sign (thumb and index forming circle)
            if (this.isOKSign(landmarks)) {
                  return { gesture: 'OK', confidence: 0.8, emoji: this.gestures.OK };
            }

            return { gesture: 'UNKNOWN', confidence: 0, emoji: '❓' };
      }

      /**
       * Detect OK sign (thumb and index finger forming a circle)
       */
      isOKSign(landmarks) {
            const thumbTip = landmarks[4];
            const indexTip = landmarks[8];
            const middle = landmarks[12];
            const ring = landmarks[16];
            const pinky = landmarks[20];

            // Distance between thumb and index tips
            const distance = Math.sqrt(
                  Math.pow(thumbTip.x - indexTip.x, 2) +
                  Math.pow(thumbTip.y - indexTip.y, 2)
            );

            // Check if other fingers are extended
            const othersExtended = middle.y < landmarks[10].y &&
                  ring.y < landmarks[14].y &&
                  pinky.y < landmarks[18].y;

            return distance < 0.05 && othersExtended;
      }

      /**
       * Add gesture to history
       */
      addToHistory(gesture) {
            this.gestureHistory.push({
                  ...gesture,
                  timestamp: Date.now()
            });

            // Keep only last 50 gestures
            if (this.gestureHistory.length > 50) {
                  this.gestureHistory.shift();
            }

            this.lastGesture = gesture;
      }

      /**
       * Get gesture statistics
       */
      getStatistics() {
            const stats = {};
            this.gestureHistory.forEach(g => {
                  stats[g.gesture] = (stats[g.gesture] || 0) + 1;
            });
            return stats;
      }

      /**
       * Clear history
       */
      clearHistory() {
            this.gestureHistory = [];
            this.lastGesture = null;
      }
}

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
      module.exports = GestureRecognizer;
}
