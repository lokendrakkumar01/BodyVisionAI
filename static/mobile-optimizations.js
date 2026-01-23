// ===== MOBILE OPTIMIZATIONS MODULE =====

/**
 * Mobile-specific optimizations and utilities
 * Handles device detection, performance monitoring, and mobile UI enhancements
 */

class MobileOptimizer {
      constructor() {
            this.isMobile = this.detectMobile();
            this.isTablet = this.detectTablet();
            this.deviceType = this.getDeviceType();
            this.performanceMode = 'auto';
            this.fpsHistory = [];
            this.loadingProgress = 0;
      }

      // ===== DEVICE DETECTION =====

      detectMobile() {
            const userAgent = navigator.userAgent || navigator.vendor || window.opera;
            return /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      }

      detectTablet() {
            const userAgent = navigator.userAgent.toLowerCase();
            return /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(userAgent);
      }

      getDeviceType() {
            if (this.isMobile && !this.isTablet) return 'mobile';
            if (this.isTablet) return 'tablet';
            return 'desktop';
      }

      getOptimalVideoResolution() {
            const width = window.innerWidth;
            const height = window.innerHeight;

            if (this.isMobile && !this.isTablet) {
                  // Mobile phones - lower resolution for performance
                  return { width: 640, height: 480 };
            } else if (this.isTablet) {
                  // Tablets - medium resolution
                  return { width: 960, height: 720 };
            } else if (width >= 1920) {
                  // Desktop HD
                  return { width: 1280, height: 720 };
            } else {
                  // Desktop standard
                  return { width: 1280, height: 720 };
            }
      }

      getModelComplexity() {
            // Return appropriate complexity based on device
            if (this.isMobile && !this.isTablet) {
                  return 0; // Lite model for mobile
            } else if (this.isTablet) {
                  return 1; // Full model for tablets
            } else {
                  return 1; // Full model for desktop
            }
      }

      // ===== PERFORMANCE MONITORING =====

      monitorFPS(currentFPS) {
            this.fpsHistory.push(currentFPS);
            if (this.fpsHistory.length > 60) {
                  this.fpsHistory.shift();
            }

            const avgFPS = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;

            // Auto-adjust performance mode
            if (this.performanceMode === 'auto') {
                  if (avgFPS < 15 && this.isMobile) {
                        this.suggestPerformanceMode('low');
                  } else if (avgFPS < 24) {
                        this.suggestPerformanceMode('balanced');
                  }
            }

            return avgFPS;
      }

      suggestPerformanceMode(mode) {
            console.log(`📊 Performance mode suggestion: ${mode}`);
            // Could show a toast notification to user
      }

      // ===== LOADING PROGRESS =====

      updateLoadingProgress(step, total) {
            this.loadingProgress = Math.round((step / total) * 100);

            const progressBar = document.getElementById('loadingProgressBar');
            const progressText = document.getElementById('loadingProgressText');
            const loadingMessage = document.getElementById('loadingMessage');

            if (progressBar) {
                  progressBar.style.width = this.loadingProgress + '%';
            }

            if (progressText) {
                  progressText.textContent = this.loadingProgress + '%';
            }

            return this.loadingProgress;
      }

      setLoadingMessage(message) {
            const loadingMessage = document.getElementById('loadingMessage');
            if (loadingMessage) {
                  loadingMessage.textContent = message;
            }
      }

      // ===== MOBILE UI ENHANCEMENTS =====

      initMobileUI() {
            if (!this.isMobile) return;

            // Add mobile class to body
            document.body.classList.add('mobile-device');

            if (this.isTablet) {
                  document.body.classList.add('tablet-device');
            }

            // Initialize mobile controls
            this.initControlsToggle();
            this.initTouchOptimizations();
            this.handleOrientationChange();
      }

      initControlsToggle() {
            const controlsPanel = document.querySelector('.controls-panel');
            const demoContainer = document.querySelector('.demo-container');

            if (!controlsPanel || !this.isMobile) return;

            // Create toggle button for mobile
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'controls-toggle-btn';
            toggleBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12h18M3 6h18M3 18h18"></path>
            </svg>
            <span>Controls</span>
        `;
            toggleBtn.setAttribute('aria-label', 'Toggle Controls');

            // Insert toggle button before controls panel
            if (demoContainer) {
                  demoContainer.insertBefore(toggleBtn, controlsPanel);
            }

            // Handle toggle
            let isControlsOpen = false;
            toggleBtn.addEventListener('click', () => {
                  isControlsOpen = !isControlsOpen;
                  controlsPanel.classList.toggle('mobile-open', isControlsOpen);
                  toggleBtn.classList.toggle('active', isControlsOpen);
            });

            // Close when clicking outside
            document.addEventListener('click', (e) => {
                  if (isControlsOpen &&
                        !controlsPanel.contains(e.target) &&
                        !toggleBtn.contains(e.target)) {
                        isControlsOpen = false;
                        controlsPanel.classList.remove('mobile-open');
                        toggleBtn.classList.remove('active');
                  }
            });
      }

      initTouchOptimizations() {
            // Prevent double-tap zoom on buttons
            const buttons = document.querySelectorAll('button, .btn');
            buttons.forEach(button => {
                  button.addEventListener('touchend', (e) => {
                        e.preventDefault();
                        button.click();
                  });
            });

            // Add touch feedback
            const interactive = document.querySelectorAll('button, .btn, .control-label');
            interactive.forEach(element => {
                  element.addEventListener('touchstart', () => {
                        element.style.transform = 'scale(0.95)';
                  });
                  element.addEventListener('touchend', () => {
                        element.style.transform = '';
                  });
            });
      }

      handleOrientationChange() {
            window.addEventListener('orientationchange', () => {
                  setTimeout(() => {
                        this.adjustLayoutForOrientation();
                  }, 100);
            });

            // Initial adjustment
            this.adjustLayoutForOrientation();
      }

      adjustLayoutForOrientation() {
            const isPortrait = window.innerHeight > window.innerWidth;
            document.body.classList.toggle('portrait', isPortrait);
            document.body.classList.toggle('landscape', !isPortrait);
      }

      // ===== UTILITY METHODS =====

      vibrate(pattern = 10) {
            if ('vibrate' in navigator) {
                  navigator.vibrate(pattern);
            }
      }

      showToast(message, duration = 3000) {
            // Create toast notification
            const toast = document.createElement('div');
            toast.className = 'mobile-toast';
            toast.textContent = message;
            document.body.appendChild(toast);

            // Animate in
            setTimeout(() => toast.classList.add('show'), 10);

            // Remove after duration
            setTimeout(() => {
                  toast.classList.remove('show');
                  setTimeout(() => toast.remove(), 300);
            }, duration);
      }

      // ===== CONNECTION MONITORING =====

      monitorConnection() {
            if ('connection' in navigator) {
                  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

                  if (connection) {
                        const type = connection.effectiveType;
                        console.log('📡 Connection type:', type);

                        if (type === 'slow-2g' || type === '2g') {
                              this.showToast('⚠️ Slow connection detected. Performance may be affected.');
                              return 'slow';
                        } else if (type === '3g') {
                              return 'medium';
                        } else {
                              return 'fast';
                        }
                  }
            }
            return 'unknown';
      }

      // ===== MEMORY & BATTERY =====

      checkBatteryStatus() {
            if ('getBattery' in navigator) {
                  navigator.getBattery().then(battery => {
                        const level = battery.level * 100;
                        const isCharging = battery.charging;

                        console.log(`🔋 Battery: ${level}% ${isCharging ? '(charging)' : ''}`);

                        // Suggest power saving if battery is low
                        if (level < 20 && !isCharging) {
                              this.showToast('🔋 Low battery. Consider reducing features for better performance.');
                        }

                        battery.addEventListener('levelchange', () => {
                              console.log('Battery level changed:', battery.level * 100);
                        });
                  });
            }
      }

      estimateMemoryUsage() {
            if ('memory' in performance) {
                  const memory = performance.memory;
                  const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
                  const totalMB = Math.round(memory.jsHeapSizeLimit / 1048576);

                  console.log(`💾 Memory: ${usedMB}MB / ${totalMB}MB`);

                  return {
                        used: usedMB,
                        total: totalMB,
                        percentage: (usedMB / totalMB) * 100
                  };
            }
            return null;
      }
}

// Export for use in main script
window.MobileOptimizer = MobileOptimizer;
