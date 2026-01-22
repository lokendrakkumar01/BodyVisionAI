/**
 * Pose Analytics Module
 * Calculate body metrics, joint angles, and posture analysis
 */

class PoseAnalytics {
      constructor() {
            this.history = [];
            this.maxHistory = 100;
      }

      /**
       * Calculate angle between three points
       * @param {Object} a - First point {x, y, z}
       * @param {Object} b - Middle point (vertex)
       * @param {Object} c - Third point
       * @returns {Number} Angle in degrees
       */
      calculateAngle(a, b, c) {
            const radians = Math.atan2(c.y - b.y, c.x - b.x) -
                  Math.atan2(a.y - b.y, a.x - b.x);
            let angle = Math.abs(radians * 180.0 / Math.PI);

            if (angle > 180.0) {
                  angle = 360 - angle;
            }

            return angle;
      }

      /**
       * Calculate distance between two points
       */
      calculateDistance(a, b) {
            return Math.sqrt(
                  Math.pow(a.x - b.x, 2) +
                  Math.pow(a.y - b.y, 2) +
                  Math.pow((a.z || 0) - (b.z || 0), 2)
            );
      }

      /**
       * Analyze full body pose
       * @param {Object} landmarks - MediaPipe pose landmarks
       * @returns {Object} Comprehensive pose analytics
       */
      analyzePose(landmarks) {
            if (!landmarks || landmarks.length < 33) {
                  return null;
            }

            const analytics = {
                  jointAngles: this.calculateJointAngles(landmarks),
                  bodyAlignment: this.calculateBodyAlignment(landmarks),
                  postureScore: 0,
                  movements: this.detectMovements(landmarks),
                  timestamp: Date.now()
            };

            analytics.postureScore = this.calculatePostureScore(analytics);

            this.addToHistory(analytics);

            return analytics;
      }

      /**
       * Calculate all major joint angles
       */
      calculateJointAngles(landmarks) {
            return {
                  // Left arm
                  leftShoulder: this.calculateAngle(
                        landmarks[11], // left hip
                        landmarks[11], // left shoulder (this is actually index 11)
                        landmarks[13]  // left elbow
                  ),
                  leftElbow: this.calculateAngle(
                        landmarks[11], // left shoulder
                        landmarks[13], // left elbow
                        landmarks[15]  // left wrist
                  ),

                  // Right arm
                  rightShoulder: this.calculateAngle(
                        landmarks[12], // right hip
                        landmarks[12], // right shoulder
                        landmarks[14]  // right elbow
                  ),
                  rightElbow: this.calculateAngle(
                        landmarks[12], // right shoulder
                        landmarks[14], // right elbow
                        landmarks[16]  // right wrist
                  ),

                  // Left leg
                  leftHip: this.calculateAngle(
                        landmarks[11], // left shoulder
                        landmarks[23], // left hip
                        landmarks[25]  // left knee
                  ),
                  leftKnee: this.calculateAngle(
                        landmarks[23], // left hip
                        landmarks[25], // left knee
                        landmarks[27]  // left ankle
                  ),

                  // Right leg
                  rightHip: this.calculateAngle(
                        landmarks[12], // right shoulder
                        landmarks[24], // right hip
                        landmarks[26]  // right knee
                  ),
                  rightKnee: this.calculateAngle(
                        landmarks[24], // right hip
                        landmarks[26], // right knee
                        landmarks[28]  // right ankle
                  ),

                  // Torso
                  torsoLean: this.calculateTorsoLean(landmarks)
            };
      }

      /**
       * Calculate torso lean angle
       */
      calculateTorsoLean(landmarks) {
            const leftShoulder = landmarks[11];
            const rightShoulder = landmarks[12];
            const leftHip = landmarks[23];
            const rightHip = landmarks[24];

            const shoulderMid = {
                  x: (leftShoulder.x + rightShoulder.x) / 2,
                  y: (leftShoulder.y + rightShoulder.y) / 2
            };

            const hipMid = {
                  x: (leftHip.x + rightHip.x) / 2,
                  y: (leftHip.y + rightHip.y) / 2
            };

            const angle = Math.atan2(
                  shoulderMid.x - hipMid.x,
                  shoulderMid.y - hipMid.y
            ) * 180 / Math.PI;

            return Math.abs(angle);
      }

      /**
       * Calculate body alignment and symmetry
       */
      calculateBodyAlignment(landmarks) {
            const leftShoulder = landmarks[11];
            const rightShoulder = landmarks[12];
            const leftHip = landmarks[23];
            const rightHip = landmarks[24];

            // Shoulder alignment
            const shoulderTilt = Math.abs(leftShoulder.y - rightShoulder.y);

            // Hip alignment
            const hipTilt = Math.abs(leftHip.y - rightHip.y);

            // Spinal alignment (vertical)
            const noseToHip = this.calculateDistance(landmarks[0], {
                  x: (leftHip.x + rightHip.x) / 2,
                  y: (leftHip.y + rightHip.y) / 2,
                  z: 0
            });

            return {
                  shoulderTilt: shoulderTilt,
                  hipTilt: hipTilt,
                  spinalAlignment: noseToHip,
                  symmetryScore: 100 - (shoulderTilt + hipTilt) * 100
            };
      }

      /**
       * Calculate overall posture score
       */
      calculatePostureScore(analytics) {
            let score = 100;

            // Penalize for torso lean
            if (analytics.jointAngles.torsoLean > 10) {
                  score -= (analytics.jointAngles.torsoLean - 10) * 2;
            }

            // Penalize for shoulder/hip tilt
            score -= analytics.bodyAlignment.shoulderTilt * 50;
            score -= analytics.bodyAlignment.hipTilt * 50;

            // Bonus for good symmetry
            if (analytics.bodyAlignment.symmetryScore > 90) {
                  score += 5;
            }

            return Math.max(0, Math.min(100, score));
      }

      /**
       * Detect body movements
       */
      detectMovements(landmarks) {
            if (this.history.length < 2) {
                  return { movement: 'STATIC', speed: 0 };
            }

            const prev = this.history[this.history.length - 1];
            const prevLandmarks = prev.rawLandmarks;

            if (!prevLandmarks) {
                  return { movement: 'STATIC', speed: 0 };
            }

            // Calculate average displacement
            let totalDisplacement = 0;
            for (let i = 0; i < Math.min(landmarks.length, prevLandmarks.length); i++) {
                  totalDisplacement += this.calculateDistance(landmarks[i], prevLandmarks[i]);
            }

            const avgDisplacement = totalDisplacement / landmarks.length;

            // Classify movement
            let movement = 'STATIC';
            if (avgDisplacement > 0.05) {
                  movement = 'FAST';
            } else if (avgDisplacement > 0.02) {
                  movement = 'MODERATE';
            } else if (avgDisplacement > 0.005) {
                  movement = 'SLOW';
            }

            return {
                  movement: movement,
                  speed: avgDisplacement,
                  velocity: avgDisplacement * 60 // assuming 60 FPS
            };
      }

      /**
       * Add analytics to history
       */
      addToHistory(analytics) {
            this.history.push(analytics);

            if (this.history.length > this.maxHistory) {
                  this.history.shift();
            }
      }

      /**
       * Get analytics trends
       */
      getTrends(duration = 10) {
            const recent = this.history.slice(-duration);

            if (recent.length === 0) return null;

            const avgPosture = recent.reduce((sum, a) => sum + a.postureScore, 0) / recent.length;
            const avgTorsoLean = recent.reduce((sum, a) => sum + a.jointAngles.torsoLean, 0) / recent.length;

            return {
                  averagePostureScore: avgPosture,
                  averageTorsoLean: avgTorsoLean,
                  samples: recent.length
            };
      }

      /**
       * Clear history
       */
      clearHistory() {
            this.history = [];
      }
}

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
      module.exports = PoseAnalytics;
}
