// Main Application Controller
class CareerAssessmentApp {
    constructor() {
        this.assessmentManager = null;
        this.resultsManager = null;
        this.currentSession = null;
        this.init();
    }

    async init() {
        try {
            // Wait for DOM to be fully loaded
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeApp());
            } else {
                this.initializeApp();
            }
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showError('애플리케이션을 초기화하는 중 오류가 발생했습니다.');
        }
    }

    initializeApp() {
        try {
            // Check if required dependencies are available
            if (typeof ASSESSMENT_DATA === 'undefined') {
                throw new Error('ASSESSMENT_DATA is not defined');
            }
            
            if (typeof Chart === 'undefined') {
                throw new Error('Chart.js is not loaded');
            }

            // Initialize managers
            console.log('Initializing AssessmentManager...');
            this.assessmentManager = new AssessmentManager();
            
            console.log('Initializing ResultsManager...');
            this.resultsManager = new ResultsManager(this.assessmentManager);
            
            // Create a clean namespace for backward compatibility (if needed)
            window.CareerApp = {
                assessmentManager: this.assessmentManager,
                resultsManager: this.resultsManager,
                app: this
            };

            // Setup global error handling
            this.setupErrorHandling();

            // Setup session management
            this.setupSessionManagement();

            // Setup UI enhancements
            this.setupUIEnhancements();

            // Previous session restoration removed - always start fresh

            console.log('Career Assessment App initialized successfully');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('애플리케이션을 초기화하는 중 오류가 발생했습니다: ' + error.message);
            throw error;
        }
    }

    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            // 오류 팝업 제거 - 콘솔에만 기록
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            // 오류 팝업 제거 - 콘솔에만 기록
        });
    }

    setupSessionManagement() {
        // Auto-save progress
        setInterval(() => {
            this.autoSave();
        }, 30000); // Save every 30 seconds

        // Handle browser close/refresh
        window.addEventListener('beforeunload', (event) => {
            if (this.assessmentManager && this.hasUnsavedProgress()) {
                event.preventDefault();
                event.returnValue = '진단이 완료되지 않았습니다. 페이지를 나가시겠습니까?';
            }
        });

        // Handle visibility change (mobile background/foreground)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.autoSave();
            }
        });
    }

    setupUIEnhancements() {
        // Add loading states (비활성화 - 사용자 경험 개선)
        this.addLoadingStates();

        // Add keyboard navigation
        this.setupKeyboardNavigation();

        // Add accessibility features
        this.setupAccessibilityFeatures();

        // Add mobile-specific enhancements
        this.setupMobileEnhancements();
    }

    addLoadingStates() {
        // 완전히 비활성화 - 사용자 경험 개선을 위해
        console.log('[App] Loading states disabled for better UX');
        return;
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (event) => {
            // Escape key to go back
            if (event.key === 'Escape') {
                this.handleEscapeKey();
            }

            // Enter key to proceed
            if (event.key === 'Enter' && event.target.classList.contains('btn-primary')) {
                event.target.click();
            }

            // Arrow keys for option navigation
            if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                this.handleArrowNavigation(event);
            }
        });
    }

    setupAccessibilityFeatures() {
        // Add ARIA labels
        document.querySelectorAll('.question').forEach((question, index) => {
            question.setAttribute('role', 'group');
            question.setAttribute('aria-labelledby', `question-${index}`);
        });

        // Add focus management
        this.setupFocusManagement();

        // Add screen reader announcements
        this.setupScreenReaderSupport();
    }

    setupMobileEnhancements() {
        // Detect mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            document.body.classList.add('mobile-device');
            
            // Add touch-friendly enhancements
            this.setupTouchEnhancements();
        }
    }

    setupTouchEnhancements() {
        // Add haptic feedback simulation
        document.addEventListener('touchstart', (event) => {
            if (event.target.classList.contains('option') || event.target.classList.contains('btn-primary')) {
                // Add brief highlight effect
                event.target.classList.add('touch-highlight');
                setTimeout(() => {
                    event.target.classList.remove('touch-highlight');
                }, 150);
            }
        });
    }

    // Previous session restoration functions removed

    autoSave() {
        if (this.assessmentManager && this.assessmentManager.responses) {
            try {
                localStorage.setItem('assessmentData', JSON.stringify(this.assessmentManager.responses));
                localStorage.setItem('lastSaveTime', new Date().toISOString());
            } catch (error) {
                console.warn('Failed to auto-save:', error);
            }
        }
    }

    hasUnsavedProgress() {
        return this.assessmentManager && 
               Object.keys(this.assessmentManager.responses).length > 0 &&
               !document.getElementById('results').classList.contains('active');
    }

    handleEscapeKey() {
        // Close modals or go back
        const modal = document.querySelector('.modal.active');
        if (modal) {
            modal.classList.remove('active');
            return;
        }

        // Go back one step
        if (this.assessmentManager) {
            const currentStep = this.assessmentManager.currentStep;
            if (currentStep > 1) {
                this.assessmentManager.handlePrevious(currentStep);
            }
        }
    }

    handleArrowNavigation(event) {
        const activeQuestion = document.querySelector('.question.active');
        if (!activeQuestion) return;

        const options = activeQuestion.querySelectorAll('.option');
        const currentFocus = document.activeElement;
        const currentIndex = Array.from(options).indexOf(currentFocus);

        let newIndex;
        if (event.key === 'ArrowDown') {
            newIndex = (currentIndex + 1) % options.length;
        } else {
            newIndex = (currentIndex - 1 + options.length) % options.length;
        }

        if (options[newIndex]) {
            options[newIndex].focus();
            event.preventDefault();
        }
    }

    setupFocusManagement() {
        // Focus first option when question becomes active
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const target = mutation.target;
                    if (target.classList.contains('question') && target.classList.contains('active')) {
                        const firstOption = target.querySelector('.option');
                        if (firstOption) {
                            setTimeout(() => firstOption.focus(), 100);
                        }
                    }
                }
            });
        });

        document.querySelectorAll('.question').forEach((question) => {
            observer.observe(question, { attributes: true });
        });
    }

    setupScreenReaderSupport() {
        // Create live region for announcements
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'live-region';
        document.body.appendChild(liveRegion);
    }

    announceToScreenReader(message) {
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
        }
    }

    showLoading(message = '처리 중...') {
        console.trace('[Main] showLoading called:', message);
        return; // 완전히 비활성화
        
        const existingLoader = document.querySelector('.app-loader');
        if (existingLoader) return;

        const loader = document.createElement('div');
        loader.className = 'app-loader';
        loader.innerHTML = `
            <div class="loader-content">
                <div class="loader-spinner"></div>
                <p>${message}</p>
            </div>
        `;
        
        document.body.appendChild(loader);
    }

    hideLoading() {
        const loader = document.querySelector('.app-loader');
        if (loader) {
            loader.remove();
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.innerHTML = `
            <div class="error-content">
                <span class="error-icon">⚠️</span>
                <span class="error-message">${message}</span>
                <button class="error-close" onclick="this.parentElement.parentElement.remove()">✕</button>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-notification';
        successDiv.innerHTML = `
            <div class="success-content">
                <span class="success-icon">✅</span>
                <span class="success-message">${message}</span>
                <button class="success-close" onclick="this.parentElement.parentElement.remove()">✕</button>
            </div>
        `;
        
        document.body.appendChild(successDiv);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.remove();
            }
        }, 3000);
    }

    // Analytics and tracking methods (for future implementation)
    trackEvent(eventName, properties = {}) {
        // Future: Send to analytics service
        console.log('Analytics Event:', eventName, properties);
        
        // For now, just log to localStorage for development
        const events = JSON.parse(localStorage.getItem('analyticsEvents') || '[]');
        events.push({
            event: eventName,
            properties,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 100 events
        if (events.length > 100) {
            events.splice(0, events.length - 100);
        }
        
        localStorage.setItem('analyticsEvents', JSON.stringify(events));
    }

    trackStepCompletion(stepNumber) {
        this.trackEvent('step_completed', {
            step: stepNumber,
            time_spent: this.getTimeSpent(),
            user_agent: navigator.userAgent
        });
    }

    trackAssessmentCompletion(results) {
        this.trackEvent('assessment_completed', {
            total_time: this.getTotalTimeSpent(),
            top_job: results.topJobs[0]?.title,
            riasec_dominant: this.getDominantRIASEC(results.riasecScores)
        });
    }

    getTimeSpent() {
        // Implementation for tracking time spent on current step
        return Date.now() - (this.stepStartTime || Date.now());
    }

    getTotalTimeSpent() {
        // Implementation for tracking total assessment time
        const startTime = localStorage.getItem('assessmentStartTime');
        return startTime ? Date.now() - parseInt(startTime) : 0;
    }

    getDominantRIASEC(scores) {
        return Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b)[0];
    }

    // Debug methods for development
    getDebugInfo() {
        return {
            currentStep: this.assessmentManager?.currentStep,
            responses: this.assessmentManager?.responses,
            localStorage: {
                assessmentData: localStorage.getItem('assessmentData'),
                lastSaveTime: localStorage.getItem('lastSaveTime')
            },
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };
    }

    exportDebugData() {
        const debugData = this.getDebugInfo();
        const blob = new Blob([JSON.stringify(debugData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `career-assessment-debug-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Global app instance
let app;

// Ensure initialization happens after all scripts are loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new CareerAssessmentApp();
    });
} else {
    app = new CareerAssessmentApp();
}

// Add development helpers
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('Development mode - Debug helpers available');
        console.log('Use app.getDebugInfo() or app.exportDebugData() for debugging');
        
        // Add debug panel
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                console.log('Debug Info:', app.getDebugInfo());
            }
        });
    });
}

// Service Worker registration for future offline support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Future: Register service worker for offline capability
        // navigator.serviceWorker.register('/sw.js');
    });
}

// Global functions for backward compatibility
function startAssessment() {
    // Wait for app to be initialized
    if (!app && !window.CareerApp) {
        console.warn('App not initialized yet, retrying...');
        setTimeout(startAssessment, 100);
        return;
    }
    
    // 개인정보 수집 페이지로 이동
    // 모든 섹션 숨기기
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // 개인정보 섹션 표시
    const personalInfoSection = document.getElementById('personal-info');
    if (personalInfoSection) {
        personalInfoSection.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        console.error('Personal info section not found');
        // 섹션이 없으면 기존 방식으로 1단계로 이동
        if (window.CareerApp && window.CareerApp.assessmentManager) {
            window.CareerApp.assessmentManager.showSection('step1');
            window.CareerApp.assessmentManager.loadStep(1);
        } else if (app && app.assessmentManager) {
            app.assessmentManager.showSection('step1');
            app.assessmentManager.loadStep(1);
        }
    }
}

function goBackToIncompleteStep() {
    if (window.CareerApp && window.CareerApp.assessmentManager) {
        window.CareerApp.assessmentManager.goBackToIncompleteStep();
    } else if (app && app.assessmentManager) {
        app.assessmentManager.goBackToIncompleteStep();
    }
}

function restartAssessment() {
    if (window.CareerApp && window.CareerApp.assessmentManager) {
        window.CareerApp.assessmentManager.restart();
    } else if (app && app.assessmentManager) {
        app.assessmentManager.restart();
    }
}

function retryCalculation() {
    if (window.CareerApp && window.CareerApp.assessmentManager) {
        window.CareerApp.assessmentManager.retryCalculation();
    } else if (app && app.assessmentManager) {
        app.assessmentManager.retryCalculation();
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CareerAssessmentApp;
}