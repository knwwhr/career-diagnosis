// Assessment Logic - Main functionality
class AssessmentManager {
    constructor() {
        this.currentStep = 1;
        this.currentQuestion = 0;
        this.responses = {};
        this.stepData = ASSESSMENT_DATA;
        
        // Initialize manager dependencies
        this.uiManager = new UIManager();
        this.questionRenderer = new QuestionRenderer();
        this.validationManager = new ValidationManager(typeof ASSESSMENT_DATA !== 'undefined' ? ASSESSMENT_DATA : {});
        this.optionHandler = new OptionHandler(this);
        this.stateManager = new StateManager(this);
        this.analysisManager = new AnalysisManager(this);
        
        this.init();
    }

    init() {
        // Initialize event manager after other managers are ready
        this.eventManager = new EventManager(this, this.uiManager, this.questionRenderer);
        this.setupEventListeners();
        this.loadStep(1);
    }

    setupEventListeners() {
        // Basic navigation - EventManager handles the detailed event delegation
        // This is kept for backwards compatibility
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
        this.stateManager.restoreResponses(stepNum);
    }

    loadQuestions(stepNum) {
        const stepKey = `step${stepNum}`;
        const stepData = this.stepData[stepKey];
        const container = document.getElementById(`${stepKey}-questions`);
        
        if (!stepData || !container) return;

        container.innerHTML = '';
        
        stepData.questions.forEach((question, index) => {
            const questionEl = this.questionRenderer.createQuestionElement(question, stepNum, index);
            container.appendChild(questionEl);
        });

        // Show all questions at once (not just the first one)
        this.showAllQuestions(stepNum);
        this.updateNavigation(stepNum);
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
        this.stateManager.updateIncompleteQuestions(stepNum);
    }

    handleNext(stepNum) {
        // 모든 단계에서 validation 체크
        const validation = this.validationManager.validateCurrentStepWithDetails(stepNum, this.responses);
        if (!validation.isValid) {
            this.uiManager.showValidationPopup(validation.missingItems, stepNum);
            return;
        }
        
        if (stepNum < 3) {
            // 1-2단계: 단계 완료 시 응원 팝업
            this.uiManager.showStepCompletionPopup(stepNum).then((shouldContinue) => {
                if (shouldContinue) {
                    this.showSection(`step${stepNum + 1}`);
                    this.loadStep(stepNum + 1);
                }
                // shouldContinue가 false면 사용자가 멈추기를 선택한 것이므로 아무것도 하지 않음
            });
            
            // Analytics: 단계 완료 이벤트 (비동기로 나중에 처리)
            setTimeout(() => {
                if (window.analyticsManager) {
                    const stepNames = ['', '강점발견', '직무매칭', '실행계획'];
                    window.analyticsManager.trackStepCompleted(stepNum, stepNames[stepNum]);
                }
            }, 10);
        } else {
            // 3단계: validation 통과 후 결과 화면으로
            this.calculateAndShowResults();
            
            // Analytics: 마지막 단계 완료 이벤트 (비동기로 나중에 처리)
            setTimeout(() => {
                if (window.analyticsManager) {
                    window.analyticsManager.trackStepCompleted(3, '실행계획');
                }
            }, 10);
        }
    }

    handlePrevious(stepNum) {
        console.log('handlePrevious called with stepNum:', stepNum); // 디버깅용
        
        if (stepNum > 1) {
            const previousStep = stepNum - 1;
            console.log('Moving to step:', previousStep); // 디버깅용
            this.showSection(`step${previousStep}`);
            this.loadStep(previousStep);
        } else {
            console.log('Moving to landing page'); // 디버깅용
            this.showSection('landing');
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


    async calculateAndShowResults() {
        try {
            // Show analysis loading screen first
            this.analysisManager.showAnalysisLoading();
            
            // Simulate analysis steps with progress
            await this.analysisManager.performAnalysisSteps();

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
            this.uiManager.hideLoadingAndShowError(error.message);
        }
    }


    displayResults(results, actionPlan) {
        // Analytics: 진단 완료 및 결과 조회 이벤트
        if (window.analyticsManager) {
            window.analyticsManager.trackAssessmentCompleted();
            
            // 상위 추천 직업 추적
            if (results && results.length > 0) {
                const topJob = results[0].name;
                window.analyticsManager.trackResultsViewed(topJob);
            }
        }

        // Supabase에 진단 결과 저장
        this.saveAssessmentResults(results, actionPlan);
        
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

        // Display profile summary via ResultsManager
        if (window.CareerApp && window.CareerApp.resultsManager) {
            window.CareerApp.resultsManager.displayProfileSummary(results, this.responses);
        }

        // Display strengths chart via ResultsManager
        if (window.CareerApp && window.CareerApp.resultsManager) {
            window.CareerApp.resultsManager.displayStrengthsChart(results.riasecScores);
        }

        // Display job recommendations via ResultsManager
        if (window.CareerApp && window.CareerApp.resultsManager) {
            window.CareerApp.resultsManager.displayJobRecommendations(results.topJobs);
        }

        // Display action plan via ResultsManager
        if (window.CareerApp && window.CareerApp.resultsManager) {
            window.CareerApp.resultsManager.displayActionPlan(actionPlan);
        }
    }










    // Navigation methods
    goBackToIncompleteStep() {
        // Find the first incomplete step and go back to it
        for (let step = 1; step <= 3; step++) {
            const validation = this.validationManager.validateCurrentStepWithDetails(step, this.responses);
            if (!validation.isValid) {
                this.showSection(`step${step}`);
                this.loadStep(step);
                this.stateManager.updateQuestionStates(step);
                return;
            }
        }
        
        // If all steps are complete, go to step 3
        this.showSection('step3');
        this.loadStep(3);
    }

    async saveAssessmentResults(results, actionPlan) {
        try {
            const userId = getCurrentUserId();
            if (!userId) {
                console.warn('[Assessment] 사용자 ID가 없어 결과 저장 건너뜀');
                return;
            }

            // RIASEC 점수 계산
            const riasecScores = this.calculateRiasecScores();

            const assessmentData = {
                step1: this.responses.step1 || {},
                step2: this.responses.step2 || {},
                step3: this.responses.step3 || {},
                recommendedJobs: results || [],
                riasecScores: riasecScores,
                actionPlan: actionPlan || []
            };

            const result = await saveAssessmentResult(userId, assessmentData);
            
            if (result.success) {
                console.log('[Assessment] 진단 결과 저장 완료:', result.assessmentId);
            } else {
                console.error('[Assessment] 진단 결과 저장 실패:', result.error);
            }

        } catch (error) {
            console.error('[Assessment] 진단 결과 저장 중 오류:', error);
        }
    }

    calculateRiasecScores() {
        // RIASEC 점수 계산 로직
        const step1 = this.responses.step1 || {};
        const riasecResponse = step1.personality_riasec;
        
        if (!riasecResponse) return {};

        // 기본 RIASEC 매핑
        const riasecMapping = {
            'hands_on': { R: 5, I: 2, A: 1, S: 2, E: 3, C: 3 },
            'analytical': { R: 2, I: 5, A: 2, S: 2, E: 2, C: 4 },
            'creative': { R: 2, I: 3, A: 5, S: 3, E: 2, C: 1 },
            'collaborative': { R: 2, I: 2, A: 3, S: 5, E: 3, C: 2 },
            'leadership': { R: 3, I: 2, A: 2, S: 3, E: 5, C: 3 },
            'organized': { R: 3, I: 3, A: 1, S: 2, E: 3, C: 5 }
        };

        return riasecMapping[riasecResponse] || {};
    }

    restart() {
        // Clear all stored data via StateManager
        this.stateManager.clearAllData();
        
        // Reset state
        this.currentStep = 1;
        this.currentQuestion = 0;
        
        // Return to landing page
        this.showSection('landing');
    }

    retryCalculation() {
        this.calculateAndShowResults();
    }

}
// to prevent duplicate initialization conflicts