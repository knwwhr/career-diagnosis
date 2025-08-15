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
                <div class="option multiple-select-option" onclick="selectMultipleOption(event, '${stepNum}', '${question.id}', '${option.id}', this, ${question.maxSelections || 999})">
                    <span class="check-icon">✓</span>
                    <input type="hidden" name="${question.id}" value="${option.id}" id="${option.id}">
                    <label for="${option.id}">${option.text}</label>
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
                <label class="scale-label">${option.text}</label>
                <div class="scale-rating">
                    ${option.scale.map(value => `
                        <div class="scale-option">
                            <input type="radio" name="${option.id}" value="${value}" id="${option.id}_${value}"
                                   onchange="saveScaleResponse('${stepNum}', '${question.id}', '${option.id}', ${value})">
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
                    <div class="progress-circle">
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
            prevBtn.disabled = stepNum === 1;
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
            // Show loading state
            this.showSection('results');
            document.querySelector('.results-container').innerHTML = '<div class="loading">결과를 계산하고 있습니다...</div>';

            // Calculate results
            const results = await AssessmentAPI.calculateResults(this.responses);
            const actionPlan = await AssessmentAPI.generateActionPlan(results, this.responses);

            // Display results
            this.displayResults(results, actionPlan);
            
            // PDF 다운로드를 위해 결과 저장
            this.lastCalculatedResults = results;
            this.lastActionPlan = actionPlan;
        } catch (error) {
            console.error('Error calculating results:', error);
            alert('결과 계산 중 오류가 발생했습니다.');
        }
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
                <h3>실행 계획</h3>
                <div id="action-plan"></div>
            </div>
        `;

        // Display profile summary
        this.displayProfileSummary();

        // Display strengths chart
        this.displayStrengthsChart(results.riasecScores);

        // Display job recommendations
        this.displayJobRecommendations(results.topJobs);

        // Display action plan
        this.displayActionPlan(actionPlan);
    }

    displayProfileSummary() {
        const container = document.getElementById('profile-summary');
        const step1 = this.responses.step1 || {};
        
        let topValues = 'N/A';
        if (step1.values_priorities) {
            topValues = step1.values_priorities.slice(0, 3).map(valueId => {
                const option = ASSESSMENT_DATA.step1.questions[0].options.find(opt => opt.id === valueId);
                return option?.text || valueId;
            }).join(', ');
        }

        let personalityType = 'N/A';
        if (step1.personality_riasec) {
            const personalityOption = ASSESSMENT_DATA.step1.questions[2].options.find(opt => opt.id === step1.personality_riasec);
            if (personalityOption) {
                const typeMapping = {
                    'hands_on': 'hands_on (현실형)',
                    'research': 'research (탐구형)',
                    'creative': 'creative (예술형)',
                    'helping': 'helping (사회형)',
                    'leadership': 'leadership (진취형)',
                    'organizing': 'organizing (관습형)'
                };
                personalityType = typeMapping[step1.personality_riasec] || personalityOption.text;
            }
        }

        let topIndustries = 'N/A';
        if (this.responses.step2?.industry_interest) {
            topIndustries = this.responses.step2.industry_interest.map(industryId => {
                const industryOption = ASSESSMENT_DATA.step2.questions[0].options.find(opt => opt.id === industryId);
                return industryOption?.text || industryId;
            }).join(', ');
        }

        container.innerHTML = `
            <div class="profile-item">
                <span class="profile-label">핵심 가치 
                    <span class="info-tooltip" onclick="showTooltip('values')">ⓘ</span>
                </span>
                <span class="profile-value">${topValues}</span>
            </div>
            <div class="profile-item">
                <span class="profile-label">성향 유형 
                    <span class="info-tooltip" onclick="showTooltip('riasec')">ⓘ</span>
                </span>
                <span class="profile-value">${personalityType}</span>
            </div>
            <div class="profile-item">
                <span class="profile-label">관심 분야 
                    <span class="info-tooltip" onclick="showTooltip('industries')">ⓘ</span>
                </span>
                <span class="profile-value">${topIndustries}</span>
            </div>
        `;
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
                    <div class="job-details">
                        <small>성장 전망: ${job.growth_outlook} | 예상 연봉: ${job.avg_salary}</small>
                    </div>
                </div>
            `;
        }).join('');
    }

    displayActionPlan(actionPlan) {
        const container = document.getElementById('action-plan');
        
        if (!actionPlan || actionPlan.length === 0) {
            container.innerHTML = '<p>맞춤형 실행 계획을 준비 중입니다.</p>';
            return;
        }

        container.innerHTML = actionPlan.map(action => `
            <div class="action-item">
                <div class="action-title">${action.title}</div>
                <div class="action-description">${action.description}</div>
                <div class="action-timeline">
                    <small>예상 기간: ${action.timeline} | 우선순위: ${action.priority}</small>
                </div>
                <div class="action-link">
                    <a href="https://insidejob.kr" target="_blank" class="btn-link">
                        📊 좀 더 자세히 알아보기
                    </a>
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
        
        // 차트 인스턴스 저장
        this.strengthsChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['현실형(Realistic)', '탐구형(Investigative)', '예술형(Artistic)', '사회형(Social)', '진취형(Enterprising)', '관습형(Conventional)'],
                datasets: [{
                    label: 'RIASEC 성향 분석',
                    data: [
                        riasecScores.R,
                        riasecScores.I, 
                        riasecScores.A,
                        riasecScores.S,
                        riasecScores.E,
                        riasecScores.C
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
    
    if (isCurrentlySelected) {
        // Deselect
        element.classList.remove('selected');
        element.querySelector('input').checked = false;
    } else {
        // Check if we can select more
        if (selectedOptions.length >= maxSelections) {
            alert(`최대 ${maxSelections}개까지만 선택할 수 있습니다.`);
            return;
        }
        
        // Select
        element.classList.add('selected');
        element.querySelector('input').checked = true;
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
            alert(`최대 ${maxSelections}개까지만 선택할 수 있습니다.`);
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.assessmentManager = new AssessmentManager();
});