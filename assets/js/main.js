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
        // Initialize managers
        this.assessmentManager = new AssessmentManager();
        this.resultsManager = new ResultsManager(this.assessmentManager);
        
        // Set global reference for backwards compatibility
        window.assessmentManager = this.assessmentManager;
        window.resultsManager = this.resultsManager;

        // Setup global error handling
        this.setupErrorHandling();

        // Setup session management
        this.setupSessionManagement();

        // Setup UI enhancements
        this.setupUIEnhancements();

        // Check for existing session
        this.checkExistingSession();

        console.log('Career Assessment App initialized successfully');
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
        // Add loading states
        this.addLoadingStates();

        // Add keyboard navigation
        this.setupKeyboardNavigation();

        // Add accessibility features
        this.setupAccessibilityFeatures();

        // Add mobile-specific enhancements
        this.setupMobileEnhancements();
    }

    addLoadingStates() {
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            this.showLoading();
            try {
                const response = await originalFetch(...args);
                this.hideLoading();
                return response;
            } catch (error) {
                this.hideLoading();
                throw error;
            }
        };
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

    checkExistingSession() {
        const existingData = localStorage.getItem('assessmentData');
        if (existingData) {
            // 스마트 복원: 완료되지 않은 진단만 복원 물어보기
            const parsedData = JSON.parse(existingData);
            const isCompleted = this.isAssessmentCompleted(parsedData);
            
            if (!isCompleted) {
                this.showResumeDialog();
            }
        }
    }

    isAssessmentCompleted(data) {
        // 3단계 모두 완료되었는지 확인
        return data.step1 && data.step2 && data.step3 && 
               Object.keys(data.step1).length > 0 &&
               Object.keys(data.step2).length > 0 &&
               Object.keys(data.step3).length > 0;
    }

    showResumeDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'resume-dialog-overlay';
        dialog.innerHTML = `
            <div class="resume-dialog">
                <h3>이전 진단을 계속하시겠습니까?</h3>
                <p>저장된 진단 데이터가 있습니다.<br>이어서 진행하시겠습니까?</p>
                <div class="dialog-buttons">
                    <button class="btn-secondary" onclick="this.closest('.resume-dialog-overlay').remove()">새로 시작</button>
                    <button class="btn-primary" onclick="app.resumeAssessment()">계속하기</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
    }

    resumeAssessment() {
        // Remove dialog
        document.querySelector('.resume-dialog-overlay')?.remove();
        
        // Resume from saved state
        const savedData = JSON.parse(localStorage.getItem('assessmentData') || '{}');
        this.assessmentManager.responses = savedData;
        
        // Determine which step to resume from
        const lastCompletedStep = this.getLastCompletedStep(savedData);
        this.assessmentManager.showSection(`step${lastCompletedStep + 1}`);
        this.assessmentManager.loadStep(lastCompletedStep + 1);
    }

    getLastCompletedStep(savedData) {
        if (savedData.step3) return 3;
        if (savedData.step2) return 2;
        if (savedData.step1) return 1;
        return 0;
    }

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

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    app = new CareerAssessmentApp();
    
    // Make app globally available for debugging
    window.app = app;
    
    // Add development helpers
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('Development mode - Debug helpers available');
        console.log('Use app.getDebugInfo() or app.exportDebugData() for debugging');
        
        // Add debug panel
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                console.log('Debug Info:', app.getDebugInfo());
            }
        });
    }
});

// Service Worker registration for future offline support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Future: Register service worker for offline capability
        // navigator.serviceWorker.register('/sw.js');
    });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CareerAssessmentApp;
}