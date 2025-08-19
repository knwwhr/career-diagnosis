// State Management Class - Handles response storage and restoration
class StateManager {
    constructor(assessmentManager) {
        this.assessmentManager = assessmentManager;
    }

    saveResponse(stepNum, questionId, response) {
        const stepKey = `step${stepNum}`;
        if (!this.assessmentManager.responses[stepKey]) {
            this.assessmentManager.responses[stepKey] = {};
        }
        this.assessmentManager.responses[stepKey][questionId] = response;
        
        // Save to localStorage for persistence
        AssessmentAPI.saveUserResponse(stepKey, questionId, response);
        
        // 응답 후 미완성 항목 표시 업데이트
        this.updateIncompleteQuestions(stepNum);
    }

    getResponse(stepNum, questionId) {
        const stepKey = `step${stepNum}`;
        return this.assessmentManager.responses[stepKey]?.[questionId];
    }

    restoreResponses(stepNum) {
        const stepKey = `step${stepNum}`;
        const stepData = this.assessmentManager.stepData[stepKey];
        
        if (!stepData) return;

        stepData.questions.forEach(question => {
            const response = this.getResponse(stepNum, question.id);
            if (!response) return;

            switch (question.type) {
                case 'multiple_choice':
                    this.restoreMultipleChoice(question.id, response);
                    break;
                case 'ranking':
                    this.restoreRanking(question.id, response);
                    break;
                case 'multiple_select':
                    this.restoreMultipleSelect(question.id, response);
                    break;
                case 'scale':
                    this.restoreScale(question.id, response);
                    break;
            }
        });
    }

    restoreMultipleChoice(questionId, response) {
        const radio = document.querySelector(`input[name="${questionId}"][value="${response}"]`);
        if (radio) {
            radio.checked = true;
            const option = radio.closest('.option');
            if (option) option.classList.add('selected');
        }
    }

    restoreRanking(questionId, responses) {
        if (!Array.isArray(responses)) return;
        
        responses.forEach((optionId, index) => {
            const option = document.querySelector(`input[name="${questionId}"][value="${optionId}"]`);
            if (option) {
                const container = option.closest('.option');
                container.classList.add('selected');
                const rankNumber = container.querySelector('.rank-number');
                if (rankNumber) {
                    rankNumber.textContent = index + 1;
                }
            }
        });
        
        // Display container removed - ranking restored directly
    }

    restoreMultipleSelect(questionId, responses) {
        if (!Array.isArray(responses)) return;
        
        responses.forEach(optionId => {
            const option = document.querySelector(`input[name="${questionId}"][value="${optionId}"]`);
            if (option) {
                const container = option.closest('.option');
                container.classList.add('selected');
                const checkIcon = container.querySelector('.check-icon');
                if (checkIcon) {
                    checkIcon.style.background = '#667eea';
                    checkIcon.style.color = 'white';
                }
            }
        });
    }

    restoreScale(questionId, responses) {
        if (!responses || typeof responses !== 'object') return;
        
        Object.keys(responses).forEach(optionId => {
            const value = responses[optionId];
            const radio = document.querySelector(`input[name="${optionId}"][value="${value}"]`);
            if (radio) {
                radio.checked = true;
            }
        });
    }


    updateIncompleteQuestions(stepNum) {
        const stepKey = `step${stepNum}`;
        const stepData = this.assessmentManager.stepData[stepKey];
        
        if (!stepData) return;
        
        const container = document.getElementById(`step${stepNum}-questions`);
        const questions = container.querySelectorAll('.question');
        
        stepData.questions.forEach((question, index) => {
            const response = this.getResponse(stepNum, question.id);
            const questionElement = questions[index];
            if (!questionElement) return;
            
            let isCompleted = false;
            
            switch (question.type) {
                case 'multiple_choice':
                    isCompleted = response !== null && response !== undefined && response !== '';
                    break;
                case 'ranking':
                    isCompleted = Array.isArray(response) && response.length === (question.maxSelections || 3);
                    break;
                case 'multiple_select':
                    isCompleted = Array.isArray(response) && response.length > 0;
                    break;
                case 'scale':
                    if (!response || typeof response !== 'object') {
                        isCompleted = false;
                    } else {
                        isCompleted = question.options.every(opt => 
                            response[opt.id] !== undefined && response[opt.id] !== null
                        );
                    }
                    break;
                default:
                    isCompleted = response !== null && response !== undefined && response !== '';
                    break;
            }
            
            // 미완성 항목 표시
            if (isCompleted) {
                questionElement.classList.remove('incomplete');
                questionElement.classList.remove('highlight-incomplete');
            } else {
                questionElement.classList.add('incomplete');
            }
        });
    }

    updateQuestionStates(stepNum) {
        // Update visual state of questions based on completion
        const stepKey = `step${stepNum}`;
        const stepData = this.assessmentManager.stepData[stepKey];
        
        if (!stepData || !stepData.questions) return;

        stepData.questions.forEach((question, index) => {
            const questionElement = document.querySelector(`[data-question-index="${index}"]`);
            if (!questionElement) return;

            const response = this.getResponse(stepNum, question.id);
            let isValid = false;

            switch (question.type) {
                case 'multiple_choice':
                    isValid = response !== null && response !== undefined && response !== '';
                    break;
                case 'ranking':
                    isValid = Array.isArray(response) && response.length > 0;
                    break;
                case 'multiple_select':
                    isValid = Array.isArray(response) && response.length > 0;
                    break;
                case 'scale':
                    if (!response || typeof response !== 'object') {
                        isValid = false;
                    } else {
                        isValid = question.options.every(opt => 
                            response[opt.id] !== undefined && response[opt.id] !== null
                        );
                    }
                    break;
                default:
                    isValid = response !== null && response !== undefined && response !== '';
                    break;
            }

            // Add or remove incomplete class
            if (!isValid) {
                questionElement.classList.add('incomplete');
            } else {
                questionElement.classList.remove('incomplete');
                questionElement.classList.remove('highlight-incomplete');
            }
        });
    }

    saveCurrentStepResponses(stepNum) {
        // This method ensures current responses are saved to localStorage
        if (this.assessmentManager.responses[`step${stepNum}`]) {
            localStorage.setItem('assessmentData', JSON.stringify(this.assessmentManager.responses));
        }
    }

    // Clear all data
    clearAllData() {
        this.assessmentManager.responses = {};
        localStorage.removeItem('assessmentData');
        localStorage.removeItem('assessment_responses');
        localStorage.removeItem('assessment_progress');
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.StateManager = StateManager;
}