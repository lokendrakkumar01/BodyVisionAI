/**
 * Object Detection Module
 * Uses TensorFlow.js COCO-SSD model to detect and classify objects
 */

class ObjectDetector {
      constructor() {
            this.model = null;
            this.isLoading = false;
            this.isLoaded = false;
            this.detectedObjects = [];
            this.confidenceThreshold = 0.5;
            this.maxObjects = 10;

            // COCO dataset classes (80 objects)
            this.objectCategories = {
                  person: '🧍',
                  bicycle: '🚲',
                  car: '🚗',
                  motorcycle: '🏍️',
                  airplane: '✈️',
                  bus: '🚌',
                  train: '🚆',
                  truck: '🚚',
                  boat: '⛵',
                  'traffic light': '🚦',
                  'fire hydrant': '🧯',
                  'stop sign': '🛑',
                  'parking meter': '🅿️',
                  bench: '🪑',
                  bird: '🐦',
                  cat: '🐱',
                  dog: '🐕',
                  horse: '🐴',
                  sheep: '🐑',
                  cow: '🐄',
                  elephant: '🐘',
                  bear: '🐻',
                  zebra: '🦓',
                  giraffe: '🦒',
                  backpack: '🎒',
                  umbrella: '☂️',
                  handbag: '👜',
                  tie: '👔',
                  suitcase: '🧳',
                  frisbee: '🥏',
                  skis: '🎿',
                  snowboard: '🏂',
                  'sports ball': '⚽',
                  kite: '🪁',
                  'baseball bat': '⚾',
                  'baseball glove': '🥎',
                  skateboard: '🛹',
                  surfboard: '🏄',
                  'tennis racket': '🎾',
                  bottle: '🍾',
                  'wine glass': '🍷',
                  cup: '☕',
                  fork: '🍴',
                  knife: '🔪',
                  spoon: '🥄',
                  bowl: '🥣',
                  banana: '🍌',
                  apple: '🍎',
                  sandwich: '🥪',
                  orange: '🍊',
                  broccoli: '🥦',
                  carrot: '🥕',
                  'hot dog': '🌭',
                  pizza: '🍕',
                  donut: '🍩',
                  cake: '🍰',
                  chair: '🪑',
                  couch: '🛋️',
                  'potted plant': '🪴',
                  bed: '🛏️',
                  'dining table': '🍽️',
                  toilet: '🚽',
                  tv: '📺',
                  laptop: '💻',
                  mouse: '🖱️',
                  remote: '📱',
                  keyboard: '⌨️',
                  'cell phone': '📱',
                  microwave: '🔬',
                  oven: '🍳',
                  toaster: '🍞',
                  sink: '🚰',
                  refrigerator: '🧊',
                  book: '📚',
                  clock: '🕐',
                  vase: '🏺',
                  scissors: '✂️',
                  'teddy bear': '🧸',
                  'hair drier': '💇',
                  toothbrush: '🪥'
            };
      }

      /**
       * Initialize and load the COCO-SSD model
       */
      async loadModel() {
            if (this.isLoaded || this.isLoading) {
                  return this.model;
            }

            try {
                  this.isLoading = true;
                  console.log('Loading COCO-SSD object detection model...');

                  // Load the model from CDN
                  this.model = await cocoSsd.load();

                  this.isLoaded = true;
                  this.isLoading = false;
                  console.log('COCO-SSD model loaded successfully!');

                  return this.model;
            } catch (error) {
                  console.error('Error loading COCO-SSD model:', error);
                  this.isLoading = false;
                  throw error;
            }
      }

      /**
       * Detect objects in an image/video frame
       * @param {HTMLImageElement|HTMLVideoElement|HTMLCanvasElement} image - Input image
       * @returns {Array} Array of detected objects
       */
      async detectObjects(image) {
            if (!this.isLoaded) {
                  console.warn('Model not loaded yet');
                  return [];
            }

            try {
                  // Run detection
                  const predictions = await this.model.detect(image);

                  // Filter by confidence threshold
                  const filteredPredictions = predictions
                        .filter(pred => pred.score >= this.confidenceThreshold)
                        .slice(0, this.maxObjects)
                        .map(pred => ({
                              class: pred.class,
                              confidence: pred.score,
                              bbox: pred.bbox, // [x, y, width, height]
                              emoji: this.objectCategories[pred.class] || '📦'
                        }));

                  this.detectedObjects = filteredPredictions;
                  return filteredPredictions;

            } catch (error) {
                  console.error('Error detecting objects:', error);
                  return [];
            }
      }

      /**
       * Get statistics about detected objects
       */
      getStatistics() {
            const stats = {};
            this.detectedObjects.forEach(obj => {
                  stats[obj.class] = (stats[obj.class] || 0) + 1;
            });
            return stats;
      }

      /**
       * Get unique object count
       */
      getUniqueObjectCount() {
            return new Set(this.detectedObjects.map(obj => obj.class)).size;
      }

      /**
       * Get total object count
       */
      getTotalObjectCount() {
            return this.detectedObjects.length;
      }

      /**
       * Clear detected objects
       */
      clearDetections() {
            this.detectedObjects = [];
      }

      /**
       * Set confidence threshold
       */
      setConfidenceThreshold(threshold) {
            this.confidenceThreshold = Math.max(0, Math.min(1, threshold));
      }

      /**
       * Check if model is ready
       */
      isReady() {
            return this.isLoaded && this.model !== null;
      }
}

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
      module.exports = ObjectDetector;
}
