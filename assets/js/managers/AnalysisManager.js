// Analysis Loading Manager - Handles analysis loading UI and progress
class AnalysisManager {
    constructor(assessmentManager) {
        this.assessmentManager = assessmentManager;
    }

    showAnalysisLoading() {
        console.log('[AnalysisManager] Showing analysis loading');
        
        // Show analysis loading section
        this.assessmentManager.showSection('analysis-loading');
        
        // Reset all steps to initial state
        document.querySelectorAll('.analysis-step').forEach(step => {
            step.classList.remove('active', 'completed');
        });
        
        // Reset progress
        this.updateProgress(0);
    }

    async performAnalysisSteps() {
        console.log('[AnalysisManager] Performing analysis steps');
        
        const steps = [
            { id: 'step-riasec', duration: 1200, progress: 25 },
            { id: 'step-matching', duration: 1500, progress: 50 },
            { id: 'step-scoring', duration: 1000, progress: 75 },
            { id: 'step-recommendations', duration: 1300, progress: 100 }
        ];

        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            
            // Activate current step
            const stepElement = document.getElementById(step.id);
            if (stepElement) {
                stepElement.classList.add('active');
            }
            
            // Update progress gradually
            await this.animateProgress(step.progress, step.duration);
            
            // Complete current step
            if (stepElement) {
                stepElement.classList.remove('active');
                stepElement.classList.add('completed');
                const statusElement = stepElement.querySelector('.step-status');
                if (statusElement) {
                    statusElement.textContent = '✅';
                }
            }
            
            // Small delay between steps
            if (i < steps.length - 1) {
                await this.delay(200);
            }
        }
        
        // Final completion delay
        await this.delay(500);
    }

    async animateProgress(targetProgress, duration) {
        return new Promise(resolve => {
            const startProgress = parseInt(document.querySelector('.progress-text-simple').textContent) || 0;
            const progressDiff = targetProgress - startProgress;
            const startTime = performance.now();

            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                const currentProgress = Math.round(startProgress + (progressDiff * progress));
                this.updateProgress(currentProgress);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            requestAnimationFrame(animate);
        });
    }

    updateProgress(percentage) {
        const progressText = document.querySelector('.progress-text-simple');
        const progressFill = document.querySelector('.progress-fill-simple');
        
        if (progressText) {
            progressText.textContent = `${percentage}%`;
        }
        
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.AnalysisManager = AnalysisManager;
}