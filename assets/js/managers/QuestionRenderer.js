// Question Rendering Class - Handles all question HTML generation
class QuestionRenderer {
    constructor() {
        this.renderedQuestions = new Map();
    }

    createQuestionElement(question, stepNum, questionIndex) {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';
        questionDiv.dataset.questionIndex = questionIndex;

        let optionsHTML = '';
        
        switch (question.type) {
            case 'multiple_choice':
                optionsHTML = this.createMultipleChoiceOptions(question, stepNum);
                break;
            case 'multiple_select':
                optionsHTML = this.createMultipleSelectOptions(question, stepNum);
                break;
            case 'scale':
                optionsHTML = this.createScaleOptions(question, stepNum);
                break;
            case 'ranking':
                optionsHTML = this.createRankingOptions(question, stepNum);
                break;
            default:
                optionsHTML = '<p>Unknown question type</p>';
        }

        questionDiv.innerHTML = `
            <h3>${question.question}</h3>
            <div class="question-options">
                ${optionsHTML}
            </div>
        `;

        // Store rendered question for potential reuse
        this.renderedQuestions.set(`${stepNum}-${question.id}`, questionDiv.cloneNode(true));

        return questionDiv;
    }

    createMultipleChoiceOptions(question, stepNum) {
        return question.options.map(option => `
            <div class="option" data-step="${stepNum}" data-question="${question.id}" data-option="${option.id}" data-type="single">
                <input type="radio" name="${question.id}" value="${option.id}" id="${option.id}">
                <label for="${option.id}">${option.text}</label>
            </div>
        `).join('');
    }

    createMultipleSelectOptions(question, stepNum) {
        const maxText = question.maxSelections ? ` (최대 ${question.maxSelections}개)` : '';
        return `
            <p class="selection-info">여러 개 선택 가능${maxText}</p>
            ${question.options.map(option => `
                <div class="option multiple-select-option" data-step="${stepNum}" data-question="${question.id}" data-option="${option.id}" data-type="multiple" data-max="${question.maxSelections || 999}">
                    <span class="check-icon">✓</span>
                    <input type="hidden" name="${question.id}" value="${option.id}" id="${option.id}">
                    <label for="${option.id}">
                        <span class="option-title">${option.text}</span>
                        ${option.desc ? `<span class="option-desc">${option.desc}</span>` : ''}
                    </label>
                </div>
            `).join('')}
        `;
    }

    createScaleOptions(question, stepNum) {
        // 질문 유형에 따라 다른 척도 설명 사용
        let scaleDescriptions, guideText;
        
        if (question.id === 'job_understanding') {
            scaleDescriptions = {
                1: "전혀 모름",
                2: "조금 알고 있음",
                3: "보통",
                4: "잘 알고 있음",
                5: "매우 잘 알고 있음"
            };
            guideText = "1점: 전혀 모름 · 2점: 조금 알고 있음 · 3점: 보통 · 4점: 잘 알고 있음 · 5점: 매우 잘 알고 있음";
        } else if (question.id === 'skill_confidence') {
            scaleDescriptions = {
                1: "전혀 자신없음",
                2: "조금 자신없음",
                3: "보통",
                4: "자신있음",
                5: "매우 자신있음"
            };
            guideText = "1점: 전혀 자신없음 · 2점: 조금 자신없음 · 3점: 보통 · 4점: 자신있음 · 5점: 매우 자신있음";
        } else if (question.id === 'work_environment') {
            scaleDescriptions = {
                1: "별로",
                2: "그냥 그래요",
                3: "보통",
                4: "좋아요",
                5: "정말 좋아요"
            };
            guideText = "1점: 별로 · 2점: 그냥 그래요 · 3점: 보통 · 4점: 좋아요 · 5점: 정말 좋아요";
        } else {
            // 기본 선호도 척도
            scaleDescriptions = {
                1: "전혀 안 좋음",
                2: "별로",
                3: "보통",
                4: "좋음",
                5: "완전 좋음"
            };
            guideText = "1점: 전혀 안 좋음 · 2점: 별로 · 3점: 보통 · 4점: 좋음 · 5점: 완전 좋음";
        }
        
        return `
            <div class="scale-guide">
                <span class="scale-guide-text">${guideText}</span>
            </div>
            ${question.options.map(option => `
            <div class="scale-question">
                <div class="scale-label-container">
                    <label class="scale-label">${option.text}</label>
                    ${option.desc ? `<span class="scale-item-desc">${option.desc}</span>` : ''}
                </div>
                <div class="scale-rating">
                    ${option.scale.map(value => `
                        <div class="scale-option" data-step="${stepNum}" data-question="${question.id}" data-option="${option.id}" data-value="${value}" data-type="scale">
                            <input type="radio" name="${option.id}" value="${value}" id="${option.id}_${value}">
                            <label for="${option.id}_${value}" class="scale-radio-label">${value}</label>
                            <div class="scale-description">${scaleDescriptions[value]}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('')}`;
    }

    createRankingOptions(question, stepNum) {
        return `
            <div class="ranking-container">
                <p class="selection-info">중요한 순서대로 ${question.maxSelections}개를 선택하세요</p>
                <div class="ranking-options">
                    ${question.options.map(option => `
                        <div class="option ranking-option" data-step="${stepNum}" data-question="${question.id}" data-option="${option.id}" data-type="ranking" data-max="${question.maxSelections}">
                            <span class="rank-number"></span>
                            <input type="hidden" name="${question.id}" value="${option.id}" id="${option.id}">
                            <label for="${option.id}">
                                <span class="option-title">${option.text}</span>
                                ${option.desc ? `<span class="option-desc">${option.desc}</span>` : ''}
                            </label>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Helper methods for rendering specific UI elements
    createProgressBar(currentStep, totalSteps) {
        const progress = Math.round((currentStep / totalSteps) * 100);
        return `
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="progress-text">${progress}% 완료</div>
            </div>
        `;
    }

    createStepIndicator(currentStep, totalSteps) {
        const steps = [];
        for (let i = 1; i <= totalSteps; i++) {
            const stepClass = i === currentStep ? 'current' : (i < currentStep ? 'completed' : 'upcoming');
            steps.push(`
                <div class="step-indicator-item ${stepClass}">
                    <div class="step-number">${i}</div>
                    <div class="step-label">단계 ${i}</div>
                </div>
            `);
        }
        
        return `
            <div class="step-indicator">
                ${steps.join('')}
            </div>
        `;
    }

    createNavButtons(stepNum, totalSteps) {
        const prevButton = stepNum > 1 
            ? `<button id="step${stepNum}-prev" class="btn-secondary">이전</button>`
            : '';
        
        const nextButton = stepNum < totalSteps
            ? `<button id="step${stepNum}-next" class="btn-primary">다음</button>`
            : `<button id="step${stepNum}-next" class="btn-primary">결과 보기</button>`;
        
        return `
            <div class="navigation-buttons">
                ${prevButton}
                ${nextButton}
            </div>
        `;
    }

    // Utility methods
    updateRankingDisplay(container, selectedItems) {
        const selectedContainer = container.querySelector('.selected-rankings');
        if (!selectedContainer) return;

        if (selectedItems.length === 0) {
            selectedContainer.innerHTML = '<p class="ranking-guide">선택한 순위가 여기에 표시됩니다</p>';
        } else {
            selectedContainer.innerHTML = `
                <div class="selected-list">
                    ${selectedItems.map((item, index) => `
                        <div class="selected-item">
                            <span class="selected-rank">${index + 1}위</span>
                            <span class="selected-text">${item.text}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }

    highlightIncompleteQuestions(questionIds) {
        questionIds.forEach(questionId => {
            const questionElement = document.querySelector(`[data-question="${questionId}"]`)?.closest('.question');
            if (questionElement) {
                questionElement.classList.add('incomplete');
                
                // Add a visual indicator
                if (!questionElement.querySelector('.incomplete-indicator')) {
                    const indicator = document.createElement('div');
                    indicator.className = 'incomplete-indicator';
                    indicator.innerHTML = '⚠️ 답변 필요';
                    questionElement.insertBefore(indicator, questionElement.firstChild);
                }
            }
        });
    }

    clearIncompleteHighlights() {
        document.querySelectorAll('.question.incomplete').forEach(question => {
            question.classList.remove('incomplete');
            const indicator = question.querySelector('.incomplete-indicator');
            if (indicator) {
                indicator.remove();
            }
        });
    }

    // Cache management
    getCachedQuestion(stepNum, questionId) {
        return this.renderedQuestions.get(`${stepNum}-${questionId}`);
    }

    clearCache() {
        this.renderedQuestions.clear();
    }

    // Accessibility helpers
    addAccessibilityAttributes(questionElement, questionIndex) {
        questionElement.setAttribute('role', 'group');
        questionElement.setAttribute('aria-labelledby', `question-${questionIndex}`);
        
        const heading = questionElement.querySelector('h3');
        if (heading) {
            heading.id = `question-${questionIndex}`;
        }
        
        // Add proper labels to form controls
        const inputs = questionElement.querySelectorAll('input');
        inputs.forEach((input, index) => {
            if (!input.id) {
                input.id = `input-${questionIndex}-${index}`;
            }
            
            const label = questionElement.querySelector(`label[for="${input.id}"]`);
            if (!label && input.type !== 'hidden') {
                const newLabel = document.createElement('label');
                newLabel.setAttribute('for', input.id);
                newLabel.textContent = input.value || `Option ${index + 1}`;
                input.parentNode.insertBefore(newLabel, input.nextSibling);
            }
        });
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.QuestionRenderer = QuestionRenderer;
}