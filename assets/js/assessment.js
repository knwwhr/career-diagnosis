// Assessment Logic - Main functionality
class AssessmentManager {
    constructor() {
        this.currentStep = 1;
        this.currentQuestion = 0;
        this.responses = {};
        this.stepData = ASSESSMENT_DATA;
        this.strengthsChart = null; // 차트 인스턴스 관리
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadStep(1);
    }

    setupEventListeners() {
        // Start assessment button
        document.getElementById('start-assessment')?.addEventListener('click', () => {
            this.showSection('step1');
            this.currentStep = 1;
            this.loadQuestions(1);
        });

        // Navigation buttons
        ['step1', 'step2', 'step3'].forEach((step, index) => {
            const stepNum = index + 1;
            
            document.getElementById(`${step}-next`)?.addEventListener('click', () => {
                this.handleNext(stepNum);
            });
            
            document.getElementById(`${step}-prev`)?.addEventListener('click', () => {
                this.handlePrevious(stepNum);
            });
        });

        // Consulting button - 중복 방지
        const consultingBtn = document.getElementById('consulting-btn');
        if (consultingBtn && !consultingBtn.hasAttribute('data-event-attached')) {
            consultingBtn.addEventListener('click', (e) => {
                e.preventDefault(); // 기본 동작 방지
                e.stopPropagation(); // 이벤트 버블링 방지
                window.open('https://insidejob.kr', '_blank');
            });
            consultingBtn.setAttribute('data-event-attached', 'true');
        }


        // Results page previous button
        document.getElementById('results-prev')?.addEventListener('click', () => {
            this.showSection('step3');
            this.loadStep(3);
        });
    }

    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        document.getElementById(sectionId).classList.add('active');
        
        // 스크롤을 상단으로 이동
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    loadStep(stepNum) {
        this.currentStep = stepNum;
        this.currentQuestion = 0;
        this.loadQuestions(stepNum);
        // 이전에 저장된 응답 복원
        this.restoreResponses(stepNum);
    }

    loadQuestions(stepNum) {
        const stepKey = `step${stepNum}`;
        const stepData = this.stepData[stepKey];
        const container = document.getElementById(`${stepKey}-questions`);
        
        if (!stepData || !container) return;

        container.innerHTML = '';
        
        stepData.questions.forEach((question, index) => {
            const questionEl = this.createQuestionElement(question, stepNum, index);
            container.appendChild(questionEl);
        });

        // Show all questions at once (not just the first one)
        this.showAllQuestions(stepNum);
        this.updateNavigation(stepNum);
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
        }

        questionDiv.innerHTML = `
            <h3>${question.question}</h3>
            <div class="question-options">
                ${optionsHTML}
            </div>
        `;

        return questionDiv;
    }

    createMultipleChoiceOptions(question, stepNum) {
        return question.options.map(option => `
            <div class="option" onclick="selectSingleOption(event, '${stepNum}', '${question.id}', '${option.id}', this)">
                <input type="radio" name="${question.id}" value="${option.id}" id="${option.id}" onclick="event.stopPropagation(); selectSingleOption(event, '${stepNum}', '${question.id}', '${option.id}', this.closest('.option'))">
                <label for="${option.id}" onclick="event.stopPropagation(); selectSingleOption(event, '${stepNum}', '${question.id}', '${option.id}', this.closest('.option'))">${option.text}</label>
            </div>
        `).join('');
    }

    createMultipleSelectOptions(question, stepNum) {
        const maxText = question.maxSelections ? ` (최대 ${question.maxSelections}개)` : '';
        return `
            <p class="selection-info">여러 개 선택 가능${maxText}</p>
            ${question.options.map(option => `
                <div class="option multiple-select-option" onclick="selectMultipleOption(event, '${stepNum}', '${question.id}', '${option.id}', this, ${question.maxSelections || 999})">
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
                        <div class="scale-option" onclick="event.preventDefault(); document.getElementById('${option.id}_${value}').click();">
                            <input type="radio" name="${option.id}" value="${value}" id="${option.id}_${value}"
                                   onchange="saveScaleResponse('${stepNum}', '${question.id}', '${option.id}', ${value})" onclick="event.stopPropagation();">
                            <label for="${option.id}_${value}" class="scale-radio-label" onclick="event.stopPropagation(); document.getElementById('${option.id}_${value}').click();">${value}</label>
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
                        <div class="option ranking-option" onclick="selectRankingOption(event, '${stepNum}', '${question.id}', '${option.id}', this, ${question.maxSelections})">
                            <span class="rank-number"></span>
                            <input type="hidden" name="${question.id}" value="${option.id}" id="${option.id}">
                            <label for="${option.id}">
                                <span class="option-title">${option.text}</span>
                                ${option.desc ? `<span class="option-desc">${option.desc}</span>` : ''}
                            </label>
                        </div>
                    `).join('')}
                </div>
                <div class="selected-rankings" id="${question.id}_selected">
                    <p class="ranking-guide">선택한 순위가 여기에 표시됩니다</p>
                </div>
            </div>
        `;
    }

    showQuestion(stepNum, questionIndex) {
        const container = document.getElementById(`step${stepNum}-questions`);
        const questions = container.querySelectorAll('.question');
        
        questions.forEach((q, index) => {
            q.classList.toggle('active', index === questionIndex);
        });
    }

    showAllQuestions(stepNum) {
        const container = document.getElementById(`step${stepNum}-questions`);
        const questions = container.querySelectorAll('.question');
        
        // Show all questions at once
        questions.forEach((q) => {
            q.classList.add('active');
        });
        
        // 미완성 항목 표시 업데이트
        this.updateIncompleteQuestions(stepNum);
    }
    
    updateIncompleteQuestions(stepNum) {
        const stepKey = `step${stepNum}`;
        const stepData = this.stepData[stepKey];
        
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
            } else {
                questionElement.classList.add('incomplete');
            }
        });
    }

    handleNext(stepNum) {
        // 3단계가 아닌 경우에만 validation 체크
        if (stepNum < 3) {
            const validation = this.validateCurrentStepWithDetails(stepNum);
            if (!validation.isValid) {
                this.showMissingItemsPopup(validation.missingItems);
                return;
            }
            
            // 단계 완료 시 응원 팝업
            this.showStepCompletionPopup(stepNum, () => {
                this.showSection(`step${stepNum + 1}`);
                this.loadStep(stepNum + 1);
            });
        } else {
            // 3단계에서는 바로 결과 화면으로 (validation 체크 없이)
            this.calculateAndShowResults();
        }
    }

    handlePrevious(stepNum) {
        if (stepNum > 1) {
            this.showSection(`step${stepNum - 1}`);
            this.loadStep(stepNum - 1);
        } else {
            this.showSection('landing');
        }
    }

    validateCurrentStep(stepNum) {
        const stepKey = `step${stepNum}`;
        const stepData = this.stepData[stepKey];
        
        if (!stepData) return true;

        // Check if all required questions are answered
        let allValid = true;
        const missingQuestions = [];
        
        stepData.questions.forEach(question => {
            const response = this.getResponse(stepNum, question.id);
            let isValid = false;
            
            // 질문 타입별 검증 로직
            switch (question.type) {
                case 'multiple_choice':
                    isValid = response !== null && response !== undefined && response !== '';
                    break;
                    
                case 'ranking':
                    // ranking은 배열이고 maxSelections 개수만큼 선택되어야 함
                    isValid = Array.isArray(response) && 
                           response.length === (question.maxSelections || 3);
                    break;
                    
                case 'multiple_select':
                    // multiple_select는 배열이고 최소 1개 이상 선택
                    isValid = Array.isArray(response) && response.length > 0;
                    break;
                    
                case 'scale':
                    // scale 타입은 객체이고, 모든 옵션이 응답되어야 함
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
            
            if (!isValid) {
                allValid = false;
                missingQuestions.push(question.id + ' (' + question.type + ')');
            }
        });
        
        // 디버깅: 누락된 질문 표시
        if (!allValid && stepNum === 1) {
            console.log('누락된 질문들:', missingQuestions);
            console.log('현재 응답 상태:', this.responses[stepKey]);
        }
        
        return allValid;
    }

    validateCurrentStepWithDetails(stepNum) {
        const stepKey = `step${stepNum}`;
        const stepData = this.stepData[stepKey];
        
        if (!stepData) return { isValid: true, missingItems: [] };

        const missingItems = [];
        
        stepData.questions.forEach(question => {
            const response = this.getResponse(stepNum, question.id);
            let isValid = false;
            let itemName = '';
            
            // 사용자 친화적인 질문 이름
            const questionNames = {
                'values_priorities': '• 중요한 가치 3개 순위 선택',
                'work_environment': '• 업무 환경 선호도 평가 (5개 항목)',
                'personality_riasec': '• 흥미로운 활동 1개 선택', 
                'strengths_experience': '• 잘하는 영역 선택 (1개 이상)',
                'industry_interest': '• 관심 산업 분야 선택',
                'job_understanding': '• 직무 이해도 평가',
                'skill_confidence': '• 스킬 자신감 평가',
                'career_timeline': '• 취업 목표 시기 선택',
                'preparation_status': '• 현재 준비 상황 선택',
                'learning_preference': '• 선호하는 학습 방법 선택'
            };
            
            itemName = questionNames[question.id] || `• ${question.question}`;
            
            // 질문 타입별 검증 로직
            switch (question.type) {
                case 'multiple_choice':
                    isValid = response !== null && response !== undefined && response !== '';
                    break;
                    
                case 'ranking':
                    isValid = Array.isArray(response) && 
                           response.length === (question.maxSelections || 3);
                    if (!isValid && Array.isArray(response)) {
                        itemName += ` (${response.length}/${question.maxSelections || 3}개 선택됨)`;
                    }
                    break;
                    
                case 'multiple_select':
                    isValid = Array.isArray(response) && response.length > 0;
                    break;
                    
                case 'scale':
                    if (!response || typeof response !== 'object') {
                        isValid = false;
                    } else {
                        const answeredCount = question.options.filter(opt => 
                            response[opt.id] !== undefined && response[opt.id] !== null
                        ).length;
                        isValid = answeredCount === question.options.length;
                        if (!isValid) {
                            itemName += ` (${answeredCount}/${question.options.length}개 응답됨)`;
                        }
                    }
                    break;
                    
                default:
                    isValid = response !== null && response !== undefined && response !== '';
                    break;
            }
            
            if (!isValid) {
                missingItems.push(itemName);
            }
        });
        
        return {
            isValid: missingItems.length === 0,
            missingItems: missingItems
        };
    }

    showMissingItemsPopup(missingItems) {
        // 기존 팝업이 있으면 제거
        this.removeExistingPopups();
        
        // 중복 팝업 방지
        if (document.querySelector('.missing-items-popup')) {
            return;
        }
        
        const popup = document.createElement('div');
        popup.className = 'popup-overlay';
        popup.innerHTML = `
            <div class="popup-content missing-items-popup">
                <div class="popup-header">
                    <h3>🤔 아직 완성되지 않았어요!</h3>
                    <p>아래 항목들을 완료해주세요</p>
                </div>
                <div class="missing-items-list">
                    ${missingItems.map(item => `
                        <div class="missing-item">
                            <span class="missing-icon">❌</span>
                            <span class="missing-text">${item}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="popup-actions">
                    <button class="btn-primary" onclick="if(!this.disabled){this.disabled=true; this.closest('.popup-overlay').remove();}">
                        답변 계속하기
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(popup);
    }

    showStepCompletionPopup(stepNum, callback) {
        // 기존 팝업이 있으면 제거
        this.removeExistingPopups();
        
        // 중복 팝업 방지
        if (document.querySelector('.completion-popup')) {
            return;
        }
        
        const stepNames = {
            1: "적성에 맞는 직무 탐색",
            2: "적성에 맞는 직무 탐색"
        };
        
        const totalSteps = 3;
        const progress = Math.round((stepNum / totalSteps) * 100);
        
        const popup = document.createElement('div');
        popup.className = 'popup-overlay';
        popup.innerHTML = `
            <div class="popup-content completion-popup">
                <div class="popup-header">
                    <h3>🎉 ${stepNames[stepNum]}률 ${progress}%!</h3>
                    <div class="completion-progress-circle">
                        <span class="progress-text">${progress}%</span>
                    </div>
                    <p>잘하고 있어요! 계속 진행해볼까요?</p>
                </div>
                <div class="popup-actions">
                    <button class="btn-secondary" onclick="if(!this.disabled){this.disabled=true; this.closest('.popup-overlay').remove();}">
                        잠깐 멈추기
                    </button>
                    <button class="btn-primary" onclick="if(!this.disabled){this.disabled=true; this.closest('.popup-overlay').remove(); window.tempCallback();}">
                        다음 단계로
                    </button>
                </div>
            </div>
        `;
        
        // 임시로 콜백을 전역에 저장
        window.tempCallback = callback;
        
        document.body.appendChild(popup);
    }

    removeExistingPopups() {
        // 기존의 모든 팝업 제거 (더 포괄적으로)
        const existingPopups = document.querySelectorAll('.popup-overlay, .tooltip-overlay, .resume-dialog-overlay');
        existingPopups.forEach(popup => {
            if (popup && popup.parentNode) {
                popup.remove();
            }
        });
        
        // 이벤트 리스너도 정리
        document.removeEventListener('click', this.popupClickHandler);
    }

    restoreResponses(stepNum) {
        const stepKey = `step${stepNum}`;
        const stepData = this.stepData[stepKey];
        
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
            const option = document.querySelector(`input[value="${optionId}"]`);
            if (option) {
                const container = option.closest('.option');
                container.classList.add('selected');
                container.querySelector('.rank-number').textContent = index + 1;
            }
        });
        
        // 선택된 목록도 업데이트
        const container = document.querySelector(`#${questionId}_selected`);
        if (container) {
            this.updateRankingDisplayOnly(container, responses, questionId);
        }
    }

    restoreMultipleSelect(questionId, responses) {
        if (!Array.isArray(responses)) return;
        
        responses.forEach(optionId => {
            const option = document.querySelector(`input[value="${optionId}"]`);
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

    updateRankingDisplayOnly(container, ranking, questionId) {
        const question = document.querySelector(`input[name="${questionId}"]`)?.closest('.question');
        if (!question) return;

        const selectedContainer = question.querySelector('.selected-rankings');
        if (selectedContainer) {
            selectedContainer.innerHTML = `
                <div class="selected-list">
                    ${ranking.map((optionId, index) => {
                        const optionElement = document.querySelector(`input[value="${optionId}"]`);
                        const optionText = optionElement ? optionElement.nextElementSibling.textContent : optionId;
                        return `
                            <div class="selected-item">
                                <span class="selected-rank">${index + 1}위</span>
                                <span class="selected-text">${optionText}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }
    }

    updateNavigation(stepNum) {
        const prevBtn = document.getElementById(`step${stepNum}-prev`);
        const nextBtn = document.getElementById(`step${stepNum}-next`);
        
        if (prevBtn) {
            prevBtn.disabled = false; // 1단계에서도 랜딩페이지로 돌아갈 수 있음
        }
        
        if (nextBtn) {
            nextBtn.textContent = stepNum === 3 ? '결과 보기' : '다음';
        }
    }

    saveResponse(stepNum, questionId, response) {
        const stepKey = `step${stepNum}`;
        if (!this.responses[stepKey]) {
            this.responses[stepKey] = {};
        }
        this.responses[stepKey][questionId] = response;
        
        // Save to localStorage for persistence
        AssessmentAPI.saveUserResponse(stepKey, questionId, response);
        
        // 응답 후 미완성 항목 표시 업데이트
        this.updateIncompleteQuestions(stepNum);
    }

    getResponse(stepNum, questionId) {
        const stepKey = `step${stepNum}`;
        return this.responses[stepKey]?.[questionId];
    }

    async calculateAndShowResults() {
        try {
            // Show analysis loading screen first
            this.showAnalysisLoading();
            
            // Simulate analysis steps with progress
            await this.performAnalysisSteps();

            // Validate responses completeness - 매우 관대한 검증
            console.log('Validating responses:', this.responses);
            
            // 전체 응답 객체가 있는지 확인
            if (!this.responses || typeof this.responses !== 'object') {
                console.error('No responses object found');
                throw new Error('진단 데이터를 찾을 수 없습니다. 다시 진단해주세요.');
            }
            
            // 극도로 관대한 검증 - 최소한의 데이터만 있으면 통과
            const hasAnyData = this.responses && (
                (this.responses.step1 && Object.keys(this.responses.step1).length > 0) ||
                (this.responses.step2 && Object.keys(this.responses.step2).length > 0) ||  
                (this.responses.step3 && Object.keys(this.responses.step3).length > 0)
            );
            
            if (!hasAnyData) {
                console.error('No response data found at all');
                throw new Error('진단 응답이 저장되지 않았습니다. 다시 진단해주세요.');
            }
            
            // 추가 검증: 최소한 1단계는 있어야 함 (RIASEC 계산을 위해)
            if (!this.responses.step1 || Object.keys(this.responses.step1).length === 0) {
                console.error('Step 1 data missing - required for RIASEC calculation');
                throw new Error('1단계 데이터가 없습니다. 1단계부터 다시 진행해주세요.');
            }
            
            console.log('Validation passed. Proceeding with calculation...');

            // Calculate results
            const results = await AssessmentAPI.calculateResults(this.responses);
            console.log('Results from calculateResults:', results);
            
            if (!results || !results.riasecScores) {
                throw new Error('결과 계산에 실패했습니다. RIASEC 점수를 계산할 수 없습니다.');
            }
            
            const actionPlan = await AssessmentAPI.generateActionPlan(results, this.responses);

            // Show results section and display results
            this.showSection('results');
            this.displayResults(results, actionPlan);
            
            // PDF 다운로드를 위해 결과 저장
            this.lastCalculatedResults = results;
            this.lastActionPlan = actionPlan;
        } catch (error) {
            console.error('Error calculating results:', error);
            console.error('Error details:', error.message);
            console.error('Current responses:', this.responses);
            
            // Hide loading spinner and show custom error popup
            this.showSection('results');
            this.hideLoadingAndShowError(error.message);
        }
    }

    showAnalysisLoading() {
        // Show analysis loading section
        this.showSection('analysis-loading');
        
        // Reset all steps to initial state
        document.querySelectorAll('.analysis-step').forEach(step => {
            step.classList.remove('active', 'completed');
        });
        
        // Reset progress
        this.updateProgress(0);
    }

    async performAnalysisSteps() {
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
            stepElement.classList.add('active');
            
            // Update progress gradually
            await this.animateProgress(step.progress, step.duration);
            
            // Complete current step
            stepElement.classList.remove('active');
            stepElement.classList.add('completed');
            stepElement.querySelector('.step-status').textContent = '';
            
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

    displayResults(results, actionPlan) {
        // Initialize results display
        const resultsContainer = document.querySelector('.results-container');
        resultsContainer.innerHTML = `
            <div class="result-card">
                <h3>개인 성향 분석</h3>
                <div id="profile-summary"></div>
            </div>
            <div class="result-card">
                <h3>강점 분석</h3>
                <p class="chart-description">
                    <strong>RIASEC 성향 분석</strong> - 개인의 흥미와 성격을 6가지 유형(현실형, 탐구형, 예술형, 사회형, 진취형, 관습형)으로 분석하여 적합한 직업 환경을 제시하는 진단 도구입니다.
                </p>
                <canvas id="strengths-chart"></canvas>
            </div>
            <div class="result-card">
                <h3>추천 직무</h3>
                <div id="job-recommendations"></div>
            </div>
            <div class="result-card">
                <h3>취업 준비 가이드</h3>
                <div id="action-plan"></div>
            </div>
        `;

        // Display profile summary
        this.displayProfileSummary(results);

        // Display strengths chart
        this.displayStrengthsChart(results.riasecScores);

        // Display job recommendations
        this.displayJobRecommendations(results.topJobs);

        // Display action plan
        this.displayActionPlan(actionPlan);
    }

    displayProfileSummary(results) {
        const container = document.getElementById('profile-summary');
        const step1 = this.responses.step1 || {};
        
        let topValues = 'N/A';
        if (step1.values_priorities) {
            topValues = step1.values_priorities.slice(0, 3).map(valueId => {
                const option = ASSESSMENT_DATA.step1.questions[1].options.find(opt => opt.id === valueId);
                return option?.text || valueId;
            }).join(', ');
        }

        let personalityType = 'N/A';
        if (step1.personality_riasec) {
            const personalityOption = ASSESSMENT_DATA.step1.questions[3].options.find(opt => opt.id === step1.personality_riasec);
            if (personalityOption) {
                const typeMapping = {
                    'hands_on': {
                        name: '현실형 (Realistic)',
                        description: '실무적이고 체계적인 성향. 손으로 뭔가를 만들거나 기계를 다루는 일을 선호합니다.'
                    },
                    'research': {
                        name: '탐구형 (Investigative)', 
                        description: '분석적이고 논리적인 성향. 어려운 문제를 파헤쳐서 해답을 찾는 일을 좋아합니다.'
                    },
                    'creative': {
                        name: '예술형 (Artistic)',
                        description: '창의적이고 표현적인 성향. 새로운 아이디어로 창의적인 작품을 만드는 일을 즐깁니다.'
                    },
                    'helping': {
                        name: '사회형 (Social)',
                        description: '협력적이고 친화적인 성향. 사람들을 도와주고 함께 소통하는 일에서 보람을 느낍니다.'
                    },
                    'leadership': {
                        name: '진취형 (Enterprising)',
                        description: '리더십이 강하고 설득력 있는 성향. 앞장서서 팀을 이끌고 사업을 추진하는 일을 좋아합니다.'
                    },
                    'organizing': {
                        name: '관습형 (Conventional)',
                        description: '체계적이고 신중한 성향. 복잡한 일들을 체계적으로 정리하고 관리하는 일을 잘합니다.'
                    }
                };
                
                const typeInfo = typeMapping[step1.personality_riasec];
                personalityType = typeInfo ? typeInfo.name : personalityOption.text;
            }
        }

        let topIndustries = 'N/A';
        if (this.responses.step2?.industry_interest) {
            topIndustries = this.responses.step2.industry_interest.map(industryId => {
                const industryOption = ASSESSMENT_DATA.step2.questions[0].options.find(opt => opt.id === industryId);
                return industryOption?.text || industryId;
            }).join(', ');
        }

        let educationalBackground = 'N/A';
        if (this.responses.step1?.educational_background) {
            const educationOption = ASSESSMENT_DATA.step1.questions[0].options.find(opt => opt.id === this.responses.step1.educational_background);
            educationalBackground = educationOption?.text || this.responses.step1.educational_background;
        }

        // Get RIASEC scores from passed results
        const riasecScores = results?.riasecScores || { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
        const riasecDisplay = `R:${riasecScores.R || 0} I:${riasecScores.I || 0} A:${riasecScores.A || 0} S:${riasecScores.S || 0} E:${riasecScores.E || 0} C:${riasecScores.C || 0}`;

        // Get personality description for tooltip
        let personalityDescription = '';
        if (step1.personality_riasec) {
            const typeMapping = {
                'hands_on': '실무적이고 체계적인 성향. 손으로 뭔가를 만들거나 기계를 다루는 일을 선호합니다.',
                'research': '분석적이고 논리적인 성향. 어려운 문제를 파헤쳐서 해답을 찾는 일을 좋아합니다.',
                'creative': '창의적이고 표현적인 성향. 새로운 아이디어로 창의적인 작품을 만드는 일을 즐깁니다.',
                'helping': '협력적이고 친화적인 성향. 사람들을 도와주고 함께 소통하는 일에서 보람을 느낍니다.',
                'leadership': '리더십이 강하고 설득력 있는 성향. 앞장서서 팀을 이끌고 사업을 추진하는 일을 좋아합니다.',
                'organizing': '체계적이고 신중한 성향. 복잡한 일들을 체계적으로 정리하고 관리하는 일을 잘합니다.'
            };
            personalityDescription = typeMapping[step1.personality_riasec] || '';
        }

        // 성향과 강점 차이 분석
        const dominantStrength = this.getDominantRIASEC(riasecScores);
        const selectedPersonality = step1.personality_riasec;
        
        const personalityTypeMapping = {
            'hands_on': 'R',
            'research': 'I', 
            'creative': 'A',
            'helping': 'S',
            'leadership': 'E',
            'organizing': 'C'
        };
        
        const selectedPersonalityType = personalityTypeMapping[selectedPersonality];
        const showDifferenceExplanation = selectedPersonalityType && dominantStrength && selectedPersonalityType !== dominantStrength;

        container.innerHTML = `
            <div class="profile-item">
                <span class="profile-label">핵심 가치</span>
                <span class="profile-value">${topValues}</span>
            </div>
            <div class="profile-item">
                <span class="profile-label">성향 유형
                    ${personalityDescription ? `<span class="info-tooltip" onclick="showPersonalityTooltip('${personalityDescription}')">?</span>` : ''}
                </span>
                <span class="profile-value">${personalityType}</span>
            </div>
            <div class="profile-item">
                <span class="profile-label">전공 계열</span>
                <span class="profile-value">${educationalBackground}</span>
            </div>
            <div class="profile-item">
                <span class="profile-label">관심 분야</span>
                <span class="profile-value">${topIndustries}</span>
            </div>
            ${showDifferenceExplanation ? `
            <div class="personality-difference-explanation">
                <div class="explanation-header">
                    <span class="explanation-icon">💡</span>
                    <span class="explanation-title">성향과 강점이 다른 이유</span>
                </div>
                <div class="explanation-content">
                    개인 성향은 <strong>"좋아하는 활동"</strong>을, 강점 분석은 <strong>"실제 잘하는 역량"</strong>을 보여줍니다. 
                    이 둘이 다른 것은 매우 자연스러운 현상으로, 많은 사람들이 선호하는 것과 뛰어난 것이 다릅니다. 
                    이는 더 넓은 직업 선택권과 발전 가능성을 의미합니다.
                </div>
            </div>
            ` : ''}
        `;
        
        // Add global function for personality tooltip
        if (!window.showPersonalityTooltip) {
            window.showPersonalityTooltip = function(description) {
                // Get the selected personality type for more detailed explanation
                const selectedType = step1.personality_riasec;
                const detailedTypeInfo = {
                    'hands_on': {
                        name: '현실형 (Realistic)',
                        mainDesc: '실무적이고 체계적인 성향으로, 손으로 뭔가를 만들거나 기계를 다루는 일을 선호합니다.',
                        characteristics: ['실용적이고 현실적', '도구나 기계 다루기를 좋아함', '체계적이고 안정적인 환경 선호', '명확한 결과가 나오는 일을 좋아함'],
                        suitableJobs: '개발자, 엔지니어, 제조업, 건축가, 정비사',
                        workStyle: '정확하고 체계적으로 일하며, 실무 중심의 업무를 선호합니다.'
                    },
                    'research': {
                        name: '탐구형 (Investigative)',
                        mainDesc: '분석적이고 논리적인 성향으로, 어려운 문제를 파헤쳐서 해답을 찾는 일을 좋아합니다.',
                        characteristics: ['논리적이고 분석적 사고', '복잡한 문제 해결을 즐김', '지적 호기심이 강함', '독립적으로 일하는 것을 선호'],
                        suitableJobs: '연구원, 데이터 사이언티스트, 분석가, 의사, 과학자',
                        workStyle: '깊이 있는 분석과 연구를 통해 문제를 해결하며, 전문성을 중시합니다.'
                    },
                    'creative': {
                        name: '예술형 (Artistic)',
                        mainDesc: '창의적이고 표현적인 성향으로, 새로운 아이디어로 창의적인 작품을 만드는 일을 즐깁니다.',
                        characteristics: ['창의성과 상상력이 풍부', '예술적 표현을 좋아함', '독창적이고 혁신적', '자유로운 환경에서 일하기를 선호'],
                        suitableJobs: '디자이너, 작가, 예술가, 콘텐츠 크리에이터, 광고 기획자',
                        workStyle: '자유롭고 창의적인 환경에서 새로운 아이디어를 구현하는 일을 좋아합니다.'
                    },
                    'helping': {
                        name: '사회형 (Social)',
                        mainDesc: '협력적이고 친화적인 성향으로, 사람들을 도와주고 함께 소통하는 일에서 보람을 느낍니다.',
                        characteristics: ['사람과의 관계를 중시', '협력적이고 배려심이 많음', '소통과 상호작용을 즐김', '다른 사람을 돕는 일에 보람을 느낌'],
                        suitableJobs: '교사, 상담사, 간호사, 사회복지사, 인사담당자',
                        workStyle: '팀워크를 중시하며, 사람들과 협력하여 공동의 목표를 달성하는 일을 선호합니다.'
                    },
                    'leadership': {
                        name: '진취형 (Enterprising)',
                        mainDesc: '리더십이 강하고 설득력 있는 성향으로, 앞장서서 팀을 이끌고 사업을 추진하는 일을 좋아합니다.',
                        characteristics: ['리더십과 추진력이 강함', '목표 달성에 대한 의지가 강함', '경쟁적이고 도전적', '설득과 영향력 행사를 잘함'],
                        suitableJobs: '경영자, 영업담당자, 마케터, 기업가, 컨설턴트',
                        workStyle: '목표를 설정하고 이를 달성하기 위해 적극적으로 행동하며, 리더십을 발휘합니다.'
                    },
                    'organizing': {
                        name: '관습형 (Conventional)',
                        mainDesc: '체계적이고 신중한 성향으로, 복잡한 일들을 체계적으로 정리하고 관리하는 일을 잘합니다.',
                        characteristics: ['규칙과 절차를 중시', '정확성과 세심함', '안정적이고 예측 가능한 환경 선호', '체계적이고 조직적'],
                        suitableJobs: '회계사, 사무관리자, 은행원, 세무사, 행정직',
                        workStyle: '정확하고 체계적으로 업무를 처리하며, 안정적인 환경에서 일하는 것을 선호합니다.'
                    }
                };

                const typeDetail = detailedTypeInfo[selectedType];
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip-overlay';
                tooltip.innerHTML = `
                    <div class="tooltip-content personality-tooltip">
                        <div class="tooltip-header">
                            <h3>성향 유형 상세 분석</h3>
                            <button class="tooltip-close" onclick="this.closest('.tooltip-overlay').remove()">×</button>
                        </div>
                        <div class="tooltip-body">
                            <div class="theory-background">
                                <h4>📚 이론적 배경</h4>
                                <p><strong>홀랜드 RIASEC 이론</strong>은 심리학자 존 홀랜드(John Holland)가 1973년에 개발한 직업 선택 이론입니다.<br>
                                개인의 성격과 흥미를 6가지 유형으로 분류하여, 각자에게 맞는 직업 환경을 찾도록 도와줍니다.</p>
                            </div>
                            
                            ${typeDetail ? `
                            <div class="selected-type-detail">
                                <h4>🎯 당신의 성향: ${typeDetail.name}</h4>
                                <p class="main-description">${typeDetail.mainDesc}</p>
                                
                                <div class="characteristics-section">
                                    <h5>✨ 주요 특성</h5>
                                    <ul>
                                        ${typeDetail.characteristics.map(char => `<li>${char}</li>`).join('')}
                                    </ul>
                                </div>
                                
                                <div class="jobs-section">
                                    <h5>💼 적합한 직업</h5>
                                    <p>${typeDetail.suitableJobs}</p>
                                </div>
                                
                                <div class="workstyle-section">
                                    <h5>🎨 업무 스타일</h5>
                                    <p>${typeDetail.workStyle}</p>
                                </div>
                            </div>
                            ` : ''}
                            
                            <div class="riasec-overview">
                                <h4>🔍 RIASEC 6가지 성향 유형</h4>
                                <div class="types-grid">
                                    <div class="type-item"><strong>R(현실형)</strong>: 실무적, 체계적</div>
                                    <div class="type-item"><strong>I(탐구형)</strong>: 분석적, 논리적</div>
                                    <div class="type-item"><strong>A(예술형)</strong>: 창의적, 표현적</div>
                                    <div class="type-item"><strong>S(사회형)</strong>: 협력적, 친화적</div>
                                    <div class="type-item"><strong>E(진취형)</strong>: 리더십, 추진력</div>
                                    <div class="type-item"><strong>C(관습형)</strong>: 체계적, 신중함</div>
                                </div>
                                <p class="note"><small>💡 대부분의 사람들은 여러 성향이 혼합되어 있으며, 아래 차트에서 전체적인 성향 패턴을 확인할 수 있습니다.</small></p>
                            </div>
                        </div>
                    </div>
                `;
                document.body.appendChild(tooltip);
                
                // Close on background click
                tooltip.addEventListener('click', (e) => {
                    if (e.target === tooltip) {
                        tooltip.remove();
                    }
                });
            };
        }
        
        // RIASEC 점수를 강점 분석 섹션에 추가
        const chartDescription = document.querySelector('.chart-description');
        if (chartDescription) {
            chartDescription.innerHTML = `
                <strong>RIASEC 성향 점수:</strong> ${riasecDisplay}<br>
                아래 차트는 Holland의 RIASEC 이론에 기반한 직업 성향 분석 결과입니다. 
                각 영역별 점수가 높을수록 해당 성향이 강함을 의미합니다.
            `;
        }
    }

    displayJobRecommendations(topJobs) {
        const container = document.getElementById('job-recommendations');
        
        container.innerHTML = topJobs.map((job, index) => {
            return `
                <div class="job-item">
                    <div class="job-title">${index + 1}. ${job.title}</div>
                    <div class="job-match">적합도: ${Math.round(job.score)}점 (100점 만점)</div>
                    <div class="job-description">${job.description}</div>
                    <div class="job-explanation">
                        <strong>적합도 근거:</strong> ${job.explanation ? job.explanation.join(', ') : '종합 평가'}
                    </div>
                </div>
            `;
        }).join('');
    }

    displayActionPlan(actionPlan) {
        const container = document.getElementById('action-plan');
        
        if (!actionPlan || actionPlan.length === 0) {
            container.innerHTML = '<p>맞춤형 취업 준비 가이드를 준비 중입니다.</p>';
            return;
        }

        // Get priority colors for visual distinction
        const getPriorityColor = (priorityLabel) => {
            switch(priorityLabel) {
                case '🚨 긴급': return '#ff3838';        // Urgent Red
                case '⏰ 우선': return '#ff6b6b';        // Priority Orange-Red  
                case '👀 관심': return '#4834d4';        // Interest Blue
                case '🎯 탐색': return '#686de0';        // Exploration Purple
                case '📋 계획': return '#30336b';        // Planning Dark Blue
                default: return '#747d8c';              // Gray
            }
        };

        const getPriorityDescription = (priorityLabel) => {
            switch(priorityLabel) {
                case '🚨 긴급': return '즉시 착수하세요';
                case '⏰ 우선': return '빠른 시일 내 진행';  
                case '👀 관심': return '관심을 가지고 준비';
                case '🎯 탐색': return '탐색하며 시작';
                case '📋 계획': return '계획 수립 단계';
                default: return '차근차근 준비';
            }
        };

        container.innerHTML = actionPlan.map(action => `
            <div class="action-item">
                <div class="action-header">
                    <div class="action-title">${action.title}</div>
                    ${action.priorityLabel ? `
                        <div class="action-priority" style="background-color: ${getPriorityColor(action.priorityLabel)}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">
                            ${action.priorityLabel}
                        </div>
                        <div class="priority-description" style="color: #666; font-size: 12px; margin-top: 4px;">
                            ${getPriorityDescription(action.priorityLabel)}
                        </div>
                    ` : ''}
                </div>
                <div class="action-description">${action.description}</div>
                ${action.reason ? `
                    <div class="action-reason">
                        <span style="color: #666; font-size: 14px;">
                            📌 <strong>왜 중요한가요?</strong> ${action.reason}
                        </span>
                    </div>
                ` : ''}
                <div class="action-link">
                    <span class="practical-advice">
                        💡 <strong>실행 팁:</strong> ${action.practicalTip || '단계별로 차근차근 진행하되, 완벽함보다는 꾸준함을 목표로 하세요.'}
                    </span>
                </div>
            </div>
        `).join('');
    }

    displayStrengthsChart(riasecScores) {
        const ctx = document.getElementById('strengths-chart').getContext('2d');
        
        // 기존 차트 파괴 (중복 생성 방지)
        if (this.strengthsChart) {
            this.strengthsChart.destroy();
        }
        
        // RIASEC 점수 안전하게 처리
        const safeRiasecScores = riasecScores || { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
        
        // 차트 인스턴스 저장
        this.strengthsChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: [
                    ['현실형', 'Realistic', `(${safeRiasecScores.R || 0}점)`], 
                    ['탐구형', 'Investigative', `(${safeRiasecScores.I || 0}점)`], 
                    ['예술형', 'Artistic', `(${safeRiasecScores.A || 0}점)`], 
                    ['사회형', 'Social', `(${safeRiasecScores.S || 0}점)`], 
                    ['진취형', 'Enterprising', `(${safeRiasecScores.E || 0}점)`], 
                    ['관습형', 'Conventional', `(${safeRiasecScores.C || 0}점)`]
                ],
                datasets: [{
                    label: 'RIASEC 성향 분석',
                    data: [
                        safeRiasecScores.R || 0,
                        safeRiasecScores.I || 0, 
                        safeRiasecScores.A || 0,
                        safeRiasecScores.S || 0,
                        safeRiasecScores.E || 0,
                        safeRiasecScores.C || 0
                    ],
                    backgroundColor: 'rgba(102, 126, 234, 0.2)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(102, 126, 234, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(102, 126, 234, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: {
                            display: false
                        },
                        suggestedMin: 0,
                        suggestedMax: 20,
                        ticks: {
                            font: {
                                size: 12,
                                color: '#000000'
                            }
                        },
                        pointLabels: {
                            font: {
                                size: 13,
                                color: '#000000'
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: {
                                size: 14,
                                color: '#000000'
                            }
                        }
                    },
                    tooltip: {
                        titleFont: {
                            size: 14,
                            color: '#000000'
                        },
                        bodyFont: {
                            size: 13,
                            color: '#000000'
                        },
                        callbacks: {
                            label: function(context) {
                                return `${context.parsed.r}점 (20점 만점)`;
                            }
                        }
                    }
                }
            }
        });
    }


    restart() {
        this.currentStep = 1;
        this.currentQuestion = 0;
        this.responses = {};
        localStorage.removeItem('assessmentData');
        this.showSection('landing');
    }


    updateQuestionStates(stepNum) {
        // Update visual state of questions based on completion
        const stepKey = `step${stepNum}`;
        const stepData = this.stepData[stepKey];
        
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
            }
        });
    }

    getQuestionTitle(question) {
        // Extract short title from question text
        const questionText = question.question || '';
        if (questionText.length > 30) {
            return questionText.substring(0, 30) + '...';
        }
        return questionText;
    }

    showValidationPopup(missingItems, stepNum) {
        const popup = document.createElement('div');
        popup.className = 'validation-popup-overlay';
        
        const itemsList = missingItems.map(item => `<li>${item}</li>`).join('');
        
        popup.innerHTML = `
            <div class="validation-popup">
                <div class="validation-popup-header">
                    <h3>❗ 입력하지 않은 항목이 있어요</h3>
                </div>
                <div class="validation-popup-body">
                    <p>다음 항목들을 입력해주세요:</p>
                    <ul class="missing-items-list">
                        ${itemsList}
                    </ul>
                    <p><small>모든 항목을 입력해야 다음 단계로 진행할 수 있습니다.</small></p>
                </div>
                <div class="validation-popup-actions">
                    <button class="btn-primary" onclick="this.closest('.validation-popup-overlay').remove()">
                        확인
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(popup);

        // Close on background click
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.remove();
            }
        });

        // Auto focus on first incomplete question
        setTimeout(() => {
            this.focusFirstIncompleteQuestion(stepNum);
        }, 500);
    }

    focusFirstIncompleteQuestion(stepNum) {
        const stepSection = document.getElementById(`step${stepNum}`);
        if (!stepSection) return;

        const firstIncompleteQuestion = stepSection.querySelector('.question.incomplete');
        if (firstIncompleteQuestion) {
            firstIncompleteQuestion.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Add highlight effect
            firstIncompleteQuestion.classList.add('highlight-incomplete');
            setTimeout(() => {
                firstIncompleteQuestion.classList.remove('highlight-incomplete');
            }, 2000);
        }
    }

    saveCurrentStepResponses(stepNum) {
        // This method ensures current responses are saved to localStorage
        if (this.responses[`step${stepNum}`]) {
            localStorage.setItem('assessmentData', JSON.stringify(this.responses));
        }
    }


    hideLoadingAndShowError(errorMessage) {
        // Hide loading spinner
        const resultsContainer = document.querySelector('.results-container');
        if (resultsContainer) {
            resultsContainer.innerHTML = '';
        }

        // Show custom error popup instead of browser alert
        this.showErrorPopup(errorMessage);
    }

    showErrorPopup(errorMessage) {
        // Remove any existing error popups
        const existingPopup = document.querySelector('.error-popup-overlay');
        if (existingPopup) {
            existingPopup.remove();
        }

        const popup = document.createElement('div');
        popup.className = 'error-popup-overlay';
        
        // Determine if this is a validation error or calculation error
        const isValidationError = errorMessage.includes('미완료') || errorMessage.includes('단계');
        const isCompletionError = errorMessage.includes('완료되지 않았습니다');
        
        let title, description, actionText, actionHandler;
        
        if (isValidationError) {
            title = '❗ 아직 완료되지 않은 항목이 있어요';
            description = '모든 질문에 답변해야 결과를 확인할 수 있습니다.';
            actionText = '답변 완료하기';
            actionHandler = 'goBackToIncompleteStep()';
        } else if (isCompletionError) {
            title = '⚠️ 진단이 완료되지 않았습니다';
            description = '일부 응답이 저장되지 않았을 수 있습니다. 처음부터 다시 진행해주세요.';
            actionText = '처음부터 다시 시작';
            actionHandler = 'restartAssessment()';
        } else {
            title = '❌ 결과 계산 중 오류가 발생했습니다';
            description = errorMessage;
            actionText = '다시 시도하기';
            actionHandler = 'retryCalculation()';
        }
        
        popup.innerHTML = `
            <div class="error-popup">
                <div class="error-popup-header">
                    <h3>${title}</h3>
                </div>
                <div class="error-popup-body">
                    <p>${description}</p>
                    ${isValidationError ? `<p><small>문제: ${errorMessage}</small></p>` : ''}
                </div>
                <div class="error-popup-actions">
                    <button class="btn-secondary" onclick="this.closest('.error-popup-overlay').remove()">
                        닫기
                    </button>
                    <button class="btn-primary" onclick="${actionHandler}; this.closest('.error-popup-overlay').remove()">
                        ${actionText}
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(popup);

        // Close on background click
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.remove();
            }
        });
    }

    getDominantRIASEC(riasecScores) {
        if (!riasecScores) return null;
        
        let maxScore = -1;
        let dominantType = null;
        
        Object.entries(riasecScores).forEach(([type, score]) => {
            if (score > maxScore) {
                maxScore = score;
                dominantType = type;
            }
        });
        
        return dominantType;
    }
}

// Tooltip functions
function showTooltip(type) {
    const tooltips = {
        values: {
            title: '핵심 가치 유형',
            content: `
                • <strong>안정성:</strong> 평생 직장, 안정적인 월급을 중요시
                • <strong>성장:</strong> 계속 배우고 발전하는 것을 중요시  
                • <strong>창의성:</strong> 새로운 아이디어, 예술적 표현을 중요시
                • <strong>자율성:</strong> 내 맘대로 일할 수 있는 것을 중요시
                • <strong>사회적 기여:</strong> 세상을 더 좋게 만드는 일을 중요시
                • <strong>돈:</strong> 높은 연봉, 경제적 풍요를 중요시
                • <strong>여가시간:</strong> 일과 개인시간의 균형을 중요시
            `
        },
        riasec: {
            title: '성향 유형 판단 기준',
            content: `
                • <strong>hands_on (현실형):</strong> 기계나 도구를 다루는 실무적 작업을 선호하는 경우
                • <strong>research (탐구형):</strong> 복잡한 문제를 분석하고 해결하는 연구를 선호하는 경우
                • <strong>creative (예술형):</strong> 예술적이고 창의적인 표현 활동을 선호하는 경우
                • <strong>helping (사회형):</strong> 사람들을 돕고 소통하는 활동을 선호하는 경우
                • <strong>leadership (진취형):</strong> 사람들을 이끌고 사업을 추진하는 활동을 선호하는 경우
                • <strong>organizing (관습형):</strong> 체계적으로 정리하고 관리하는 활동을 선호하는 경우
                
                <br><br>
                <em>※ 선택한 활동 유형에 따라 성향을 분석합니다</em>
            `
        },
        industries: {
            title: '산업 분야 유형',
            content: `
                • <strong>IT/소프트웨어:</strong> 프로그래밍, 앱 개발, 시스템 구축
                • <strong>금융/보험:</strong> 은행, 증권, 보험회사, 핀테크
                • <strong>마케팅/광고:</strong> 브랜드 마케팅, 디지털 광고, 콘텐츠 제작
                • <strong>교육:</strong> 학교, 학원, 온라인 교육, 교육기술
                • <strong>의료/헬스케어:</strong> 병원, 제약, 의료기기, 바이오
                • <strong>제조업:</strong> 자동차, 전자, 기계, 화학 등 제조 분야
                • <strong>유통/소매:</strong> 백화점, 마트, 온라인 쇼핑몰, 물류
                • <strong>미디어/콘텐츠:</strong> 방송, 영화, 게임, 웹툰, 유튜브
                • <strong>컨설팅:</strong> 경영컨설팅, 전략기획, 회계법인
                • <strong>스타트업:</strong> 초기 단계 기업, 혁신적인 비즈니스 모델
            `
        }
    };
    
    const tooltip = tooltips[type];
    if (tooltip) {
        const popup = document.createElement('div');
        popup.className = 'tooltip-overlay';
        popup.innerHTML = `
            <div class="tooltip-content">
                <div class="tooltip-header">
                    <h3>${tooltip.title}</h3>
                    <button class="tooltip-close" onclick="this.closest('.tooltip-overlay').remove()">✕</button>
                </div>
                <div class="tooltip-body">
                    ${tooltip.content}
                </div>
            </div>
        `;
        document.body.appendChild(popup);
    }
}

// Question tooltip function
function showQuestionTooltip(questionId, tooltipText) {
    // 기존 툴팁이 있으면 제거
    const existingTooltip = document.querySelector('.question-tooltip-popup');
    if (existingTooltip) {
        existingTooltip.remove();
        return; // 토글 방식으로 동작
    }

    const popup = document.createElement('div');
    popup.className = 'question-tooltip-popup';
    popup.innerHTML = `
        <div class="tooltip-popup-content">
            <div class="tooltip-popup-header">
                <h4>도움말</h4>
                <button class="tooltip-popup-close" onclick="this.closest('.question-tooltip-popup').remove()">✕</button>
            </div>
            <div class="tooltip-popup-body">
                <p>${tooltipText}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    // 3초 후 자동 닫기 (모바일 UX 고려)
    setTimeout(() => {
        if (popup && popup.parentNode) {
            popup.remove();
        }
    }, 3000);
}

// Global functions for event handlers
function selectSingleOption(event, stepNum, questionId, optionId, element) {
    event.preventDefault();
    event.stopPropagation();
    
    // Clear other selections in this question
    const questionContainer = element.closest('.question');
    questionContainer.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
    
    // Select this option
    element.classList.add('selected');
    element.querySelector('input').checked = true;
    
    // Save response
    window.assessmentManager.saveResponse(parseInt(stepNum), questionId, optionId);
}

function selectMultipleOption(event, stepNum, questionId, optionId, element, maxSelections) {
    event.preventDefault();
    event.stopPropagation();
    
    const questionContainer = element.closest('.question');
    const selectedOptions = questionContainer.querySelectorAll('.option.selected');
    const isCurrentlySelected = element.classList.contains('selected');
    const isNoneOption = optionId === 'none'; // "아무것도 준비 안됨" 옵션
    
    if (isCurrentlySelected) {
        // Deselect
        element.classList.remove('selected');
        element.querySelector('input').checked = false;
        
        // "아무것도 준비 안됨" 해제시 다른 옵션들 활성화
        if (isNoneOption) {
            const allOptions = questionContainer.querySelectorAll('.option');
            allOptions.forEach(opt => {
                if (opt !== element) {
                    opt.classList.remove('disabled');
                    opt.style.opacity = '1';
                    opt.style.pointerEvents = 'auto';
                }
            });
        }
    } else {
        if (isNoneOption) {
            // "아무것도 준비 안됨" 선택시
            // 다른 모든 옵션 해제 및 비활성화
            const allOptions = questionContainer.querySelectorAll('.option');
            allOptions.forEach(opt => {
                if (opt !== element) {
                    opt.classList.remove('selected');
                    opt.querySelector('input').checked = false;
                    opt.classList.add('disabled');
                    opt.style.opacity = '0.5';
                    opt.style.pointerEvents = 'none';
                }
            });
            
            element.classList.add('selected');
            element.querySelector('input').checked = true;
        } else {
            // 다른 옵션 선택시
            const noneOption = questionContainer.querySelector('.option input[value="none"]');
            if (noneOption) {
                const noneElement = noneOption.closest('.option');
                if (noneElement.classList.contains('selected')) {
                    // "아무것도 준비 안됨"이 선택되어 있으면 무시
                    return;
                }
            }
            
            // Check if we can select more
            if (selectedOptions.length >= maxSelections) {
                showSimplePopup(`최대 ${maxSelections}개까지만 선택할 수 있습니다.`);
                return;
            }
            
            // Select
            element.classList.add('selected');
            element.querySelector('input').checked = true;
        }
    }
    
    // Get all selected values
    const selected = Array.from(questionContainer.querySelectorAll('.option.selected input'))
        .map(input => input.value);
    
    window.assessmentManager.saveResponse(parseInt(stepNum), questionId, selected);
}

function selectRankingOption(event, stepNum, questionId, optionId, element, maxSelections) {
    event.preventDefault();
    event.stopPropagation();
    
    const questionContainer = element.closest('.question');
    const isCurrentlySelected = element.classList.contains('selected');
    
    if (isCurrentlySelected) {
        // 선택 해제
        element.classList.remove('selected');
        element.querySelector('.rank-number').textContent = '';
        element.querySelector('input').checked = false;
    } else {
        const selectedOptions = questionContainer.querySelectorAll('.option.selected');
        if (selectedOptions.length >= maxSelections) {
            showSimplePopup(`최대 ${maxSelections}개까지만 선택할 수 있습니다.`);
            return;
        }
        
        element.classList.add('selected');
        element.querySelector('input').checked = true;
    }
    
    // 즉시 순위 업데이트 및 응답 저장
    updateRankingDisplay(questionContainer, stepNum, questionId);
}

function updateRankingDisplay(container, stepNum, questionId) {
    const selected = Array.from(container.querySelectorAll('.option.selected'));
    const ranking = selected.map(el => el.querySelector('input').value);
    
    // Update rank numbers
    selected.forEach((el, index) => {
        el.querySelector('.rank-number').textContent = index + 1;
    });
    
    // Update selected rankings display
    const selectedContainer = container.querySelector('.selected-rankings');
    if (selectedContainer) {
        if (selected.length === 0) {
            selectedContainer.innerHTML = '<p class="ranking-guide">선택한 순위가 여기에 표시됩니다</p>';
        } else {
            selectedContainer.innerHTML = `
                <div class="selected-list">
                    ${selected.map((el, index) => `
                        <div class="selected-item">
                            <span class="selected-rank">${index + 1}위</span>
                            <span class="selected-text">${el.querySelector('label').textContent}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }
    
    window.assessmentManager.saveResponse(parseInt(stepNum), questionId, ranking);
}

function saveScaleResponse(stepNum, questionId, optionId, value) {
    const currentResponses = window.assessmentManager.getResponse(parseInt(stepNum), questionId) || {};
    currentResponses[optionId] = value;
    window.assessmentManager.saveResponse(parseInt(stepNum), questionId, currentResponses);
}

// Global functions for error popup actions
function goBackToIncompleteStep() {
    // Find the first incomplete step and go back to it
    const manager = window.assessmentManager;
    
    for (let step = 1; step <= 3; step++) {
        const validation = manager.validateCurrentStepWithDetails(step);
        if (!validation.isValid) {
            manager.showSection(`step${step}`);
            manager.loadStep(step);
            manager.updateQuestionStates(step);
            return;
        }
    }
    
    // If all steps are complete, go to step 3
    manager.showSection('step3');
    manager.loadStep(3);
}

function restartAssessment() {
    if (window.assessmentManager) {
        window.assessmentManager.restart();
    }
}

function retryCalculation() {
    if (window.assessmentManager) {
        window.assessmentManager.calculateAndShowResults();
    }
}

function showSimplePopup(message) {
    // Remove any existing simple popups
    const existingPopup = document.querySelector('.simple-popup-overlay');
    if (existingPopup) {
        existingPopup.remove();
    }

    const popup = document.createElement('div');
    popup.className = 'simple-popup-overlay';
    popup.innerHTML = `
        <div class="simple-popup">
            <div class="simple-popup-content">
                <p>${message}</p>
                <button class="btn-primary" onclick="this.closest('.simple-popup-overlay').remove()">
                    확인
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    // Close on background click
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            popup.remove();
        }
    });
    
    // Auto close after 3 seconds
    setTimeout(() => {
        if (popup.parentNode) {
            popup.remove();
        }
    }, 3000);
}

// Note: AssessmentManager is initialized by CareerAssessmentApp in main.js
// to prevent duplicate initialization conflicts