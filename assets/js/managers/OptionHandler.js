// Option Selection Handler - Manages all option selection logic
class OptionHandler {
    constructor(assessmentManager) {
        this.assessmentManager = assessmentManager;
    }

    selectSingleOption(event, stepNum, questionId, optionId, element) {
        event.preventDefault();
        event.stopPropagation();
        
        // Remove selection from siblings
        const container = element.closest('.question');
        container.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Select current option
        element.classList.add('selected');
        
        // Update the radio button
        const radio = element.querySelector('input[type="radio"]');
        if (radio) {
            radio.checked = true;
        }
        
        // Analytics: 질문 응답 이벤트
        if (window.analyticsManager) {
            window.analyticsManager.trackQuestionAnswer(questionId, 'single_choice', optionId);
        }
        
        // Save response
        this.assessmentManager.stateManager.saveResponse(stepNum, questionId, optionId);
    }

    selectMultipleOption(event, stepNum, questionId, optionId, element, maxSelections) {
        event.preventDefault();
        event.stopPropagation();
        
        const container = element.closest('.question');
        const isCurrentlySelected = element.classList.contains('selected');
        const isNoneOption = optionId === 'none';
        
        if (isCurrentlySelected) {
            // Deselect current option
            element.classList.remove('selected');
            const checkIcon = element.querySelector('.check-icon');
            if (checkIcon) {
                checkIcon.style.background = '';
                checkIcon.style.color = '';
            }
        } else {
            // Select current option
            if (isNoneOption) {
                // Clear all other selections when "None" is selected
                container.querySelectorAll('.option').forEach(opt => {
                    if (opt !== element) {
                        opt.classList.remove('selected');
                        const checkIcon = opt.querySelector('.check-icon');
                        if (checkIcon) {
                            checkIcon.style.background = '';
                            checkIcon.style.color = '';
                        }
                    }
                });
            } else {
                // If selecting non-none option, clear "None" selection
                if (isNoneOption) {
                    container.querySelectorAll('.option').forEach(opt => {
                        if (opt !== element) {
                            opt.classList.remove('selected');
                            const checkIcon = opt.querySelector('.check-icon');
                            if (checkIcon) {
                                checkIcon.style.background = '';
                                checkIcon.style.color = '';
                            }
                        }
                    });
                } else {
                    const noneOption = container.querySelector('.option[data-option="none"]');
                    if (noneOption) {
                        noneOption.classList.remove('selected');
                        const checkIcon = noneOption.querySelector('.check-icon');
                        if (checkIcon) {
                            checkIcon.style.background = '';
                            checkIcon.style.color = '';
                        }
                    }
                }
                
                // Check max selections limit
                const selectedOptions = container.querySelectorAll('.option.selected');
                if (selectedOptions.length >= maxSelections) {
                    return; // Don't select if limit reached
                }
            }
            
            element.classList.add('selected');
            const checkIcon = element.querySelector('.check-icon');
            if (checkIcon) {
                checkIcon.style.background = '#667eea';
                checkIcon.style.color = 'white';
            }
        }
        
        // Get all selected options
        const selectedOptions = Array.from(container.querySelectorAll('.option.selected'))
            .map(opt => opt.dataset.option);
        
        // Analytics: 다중 선택 질문 응답 이벤트
        if (window.analyticsManager) {
            window.analyticsManager.trackQuestionAnswer(questionId, 'multiple_choice', selectedOptions.join(','));
        }
        
        // Save response
        this.assessmentManager.stateManager.saveResponse(stepNum, questionId, selectedOptions);
    }

    selectRankingOption(event, stepNum, questionId, optionId, element, maxSelections) {
        event.preventDefault();
        event.stopPropagation();
        
        const container = element.closest('.question');
        const isCurrentlySelected = element.classList.contains('selected');
        
        if (isCurrentlySelected) {
            // Remove from ranking
            element.classList.remove('selected');
            element.querySelector('.rank-number').textContent = '';
            
            // Reorder remaining selections
            this.reorderRankingNumbers(container);
        } else {
            // Add to ranking
            const selectedOptions = container.querySelectorAll('.option.selected');
            if (selectedOptions.length >= maxSelections) {
                return; // Don't add if limit reached
            }
            
            element.classList.add('selected');
            element.querySelector('.rank-number').textContent = selectedOptions.length + 1;
        }
        
        // Save the ranking directly without display container
        this.saveCurrentRanking(stepNum, questionId);
    }

    reorderRankingNumbers(container) {
        const selectedOptions = Array.from(container.querySelectorAll('.option.selected'))
            .sort((a, b) => {
                const rankA = parseInt(a.querySelector('.rank-number').textContent) || 0;
                const rankB = parseInt(b.querySelector('.rank-number').textContent) || 0;
                return rankA - rankB;
            });
        
        // Reassign sequential numbers
        selectedOptions.forEach((option, index) => {
            option.querySelector('.rank-number').textContent = index + 1;
        });
    }

    saveCurrentRanking(stepNum, questionId) {
        const question = document.querySelector(`input[name="${questionId}"]`)?.closest('.question');
        if (!question) return;

        // Get all selected options and ensure they have proper ranking numbers
        const selectedOptions = Array.from(question.querySelectorAll('.option.selected'));
        
        // Sort by current rank numbers, handling NaN values
        selectedOptions.sort((a, b) => {
            const rankA = parseInt(a.querySelector('.rank-number').textContent) || 999;
            const rankB = parseInt(b.querySelector('.rank-number').textContent) || 999;
            return rankA - rankB;
        });

        // Ensure rank numbers are sequential
        selectedOptions.forEach((opt, index) => {
            opt.querySelector('.rank-number').textContent = index + 1;
        });

        // Save current ranking
        const ranking = selectedOptions.map(opt => opt.dataset.option);
        
        // Analytics: 랭킹 선택 질문 응답 이벤트
        if (window.analyticsManager) {
            window.analyticsManager.trackQuestionAnswer(questionId, 'ranking', ranking.join(','));
        }
        
        this.assessmentManager.stateManager.saveResponse(stepNum, questionId, ranking);
    }

    saveScaleResponse(stepNum, questionId, optionId, value) {
        const currentResponse = this.assessmentManager.stateManager.getResponse(stepNum, questionId) || {};
        currentResponse[optionId] = value;
        
        // Analytics: 스케일 응답 이벤트
        if (window.analyticsManager) {
            window.analyticsManager.trackQuestionAnswer(questionId + '_' + optionId, 'scale', value);
        }
        
        this.assessmentManager.stateManager.saveResponse(stepNum, questionId, currentResponse);
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.OptionHandler = OptionHandler;
}