// UI Management Class - Handles all popup and modal interactions
class UIManager {
    constructor() {
        this.activePopups = new Set();
    }

    // Popup management methods
    showMissingItemsPopup(missingItems) {
        this.removeExistingPopups();
        
        const popup = document.createElement('div');
        popup.className = 'popup-overlay';
        popup.innerHTML = `
            <div class="popup-content missing-items-popup">
                <div class="popup-header">
                    <h3>📝 아직 답변하지 않은 질문이 있어요</h3>
                    <p>모든 질문에 답변해야 다음 단계로 넘어갈 수 있습니다.</p>
                </div>
                <div class="missing-items">
                    <h4>빠뜨린 질문들:</h4>
                    <ul>
                        ${missingItems.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
                <div class="popup-actions">
                    <button class="btn-primary close-popup-btn">
                        답변 계속하기
                    </button>
                </div>
            </div>
        `;
        
        // Add event listener for close button
        const closeBtn = popup.querySelector('.close-popup-btn');
        closeBtn.addEventListener('click', () => {
            if (!closeBtn.disabled) {
                closeBtn.disabled = true;
                this.closePopup(popup);
            }
        });
        
        document.body.appendChild(popup);
        this.activePopups.add(popup);
    }

    showStepCompletionPopup(stepNum) {
        return new Promise((resolve) => {
            this.removeExistingPopups();
            
            // 중복 팝업 방지
            if (document.querySelector('.completion-popup')) {
                resolve();
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
                        <button class="btn-secondary stop-btn">
                            잠깐 멈추기
                        </button>
                        <button class="btn-primary continue-btn">
                            다음 단계로
                        </button>
                    </div>
                </div>
            `;
            
            // Event listeners for buttons
            const stopBtn = popup.querySelector('.stop-btn');
            const continueBtn = popup.querySelector('.continue-btn');
            
            const closePopup = () => {
                this.closePopup(popup);
            };
            
            stopBtn.addEventListener('click', () => {
                if (!stopBtn.disabled) {
                    stopBtn.disabled = true;
                    closePopup();
                    resolve(false); // User chose to stop
                }
            });
            
            continueBtn.addEventListener('click', () => {
                if (!continueBtn.disabled) {
                    continueBtn.disabled = true;
                    closePopup();
                    resolve(true); // User chose to continue
                }
            });
            
            document.body.appendChild(popup);
            this.activePopups.add(popup);
        });
    }

    showErrorPopup(title, message, actions = []) {
        this.removeExistingPopups();
        
        const popup = document.createElement('div');
        popup.className = 'popup-overlay error-popup';
        
        const actionsHTML = actions.length > 0 
            ? actions.map(action => `
                <button class="btn-${action.type || 'secondary'}" data-action="${action.id}">
                    ${action.text}
                </button>
            `).join('')
            : `<button class="btn-primary close-popup-btn">확인</button>`;
        
        popup.innerHTML = `
            <div class="popup-content">
                <div class="popup-header">
                    <h3>⚠️ ${title}</h3>
                    <p>${message}</p>
                </div>
                <div class="popup-actions">
                    ${actionsHTML}
                </div>
            </div>
        `;
        
        // Add event listeners for action buttons
        popup.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!btn.disabled) {
                    btn.disabled = true;
                    const actionId = btn.dataset.action;
                    this.closePopup(popup);
                    
                    // Trigger action callback if provided
                    const action = actions.find(a => a.id === actionId);
                    if (action && action.callback) {
                        action.callback();
                    }
                }
            });
        });
        
        document.body.appendChild(popup);
        this.activePopups.add(popup);
    }

    showSimplePopup(message) {
        // Remove any existing simple popups
        const existingPopup = document.querySelector('.simple-popup-overlay');
        if (existingPopup) {
            this.closePopup(existingPopup);
        }

        const popup = document.createElement('div');
        popup.className = 'simple-popup-overlay';
        popup.innerHTML = `
            <div class="simple-popup">
                <div class="simple-popup-content">
                    <p>${message}</p>
                    <button class="btn-primary close-btn">
                        확인
                    </button>
                </div>
            </div>
        `;
        
        // Event listener for close button
        const closeBtn = popup.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => {
            this.closePopup(popup);
        });
        
        // Close on background click
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                this.closePopup(popup);
            }
        });
        
        document.body.appendChild(popup);
        this.activePopups.add(popup);
        
        // Auto close after 3 seconds
        setTimeout(() => {
            if (popup.parentNode) {
                this.closePopup(popup);
            }
        }, 3000);
    }

    showTooltip(type) {
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
                        <button class="tooltip-close">✕</button>
                    </div>
                    <div class="tooltip-body">
                        ${tooltip.content}
                    </div>
                </div>
            `;
            
            // Add close event listener
            const closeBtn = popup.querySelector('.tooltip-close');
            closeBtn.addEventListener('click', () => {
                this.closePopup(popup);
            });
            
            document.body.appendChild(popup);
            this.activePopups.add(popup);
        }
    }

    showQuestionTooltip(questionId, tooltipText) {
        // 기존 툴팁이 있으면 제거
        const existingTooltip = document.querySelector('.question-tooltip-popup');
        if (existingTooltip) {
            this.closePopup(existingTooltip);
            return; // 토글 방식으로 동작
        }

        const popup = document.createElement('div');
        popup.className = 'question-tooltip-popup';
        popup.innerHTML = `
            <div class="tooltip-popup-content">
                <div class="tooltip-popup-header">
                    <h4>도움말</h4>
                    <button class="tooltip-popup-close">✕</button>
                </div>
                <div class="tooltip-popup-body">
                    <p>${tooltipText}</p>
                </div>
            </div>
        `;
        
        // Add close event listener
        const closeBtn = popup.querySelector('.tooltip-popup-close');
        closeBtn.addEventListener('click', () => {
            this.closePopup(popup);
        });
        
        document.body.appendChild(popup);
        this.activePopups.add(popup);
        
        // 3초 후 자동 닫기 (모바일 UX 고려)
        setTimeout(() => {
            if (popup && popup.parentNode) {
                this.closePopup(popup);
            }
        }, 3000);
    }

    closePopup(popup) {
        if (popup && popup.parentNode) {
            popup.remove();
            this.activePopups.delete(popup);
        }
    }

    removeExistingPopups() {
        // 기존의 모든 팝업 제거 (더 포괄적으로)
        const existingPopups = document.querySelectorAll('.popup-overlay, .tooltip-overlay, .resume-dialog-overlay');
        existingPopups.forEach(popup => {
            this.closePopup(popup);
        });
        
        // Clear the active popups set
        this.activePopups.clear();
    }

    // Loading states
    showLoading(message = '처리 중...') {
        console.trace('[UIManager] showLoading called:', message);
        return; // 완전히 비활성화
        
        const existingLoader = document.querySelector('.ui-loader');
        if (existingLoader) return;

        const loader = document.createElement('div');
        loader.className = 'ui-loader';
        loader.innerHTML = `
            <div class="loader-content">
                <div class="loader-spinner"></div>
                <p>${message}</p>
            </div>
        `;
        
        document.body.appendChild(loader);
    }

    hideLoading() {
        const loader = document.querySelector('.ui-loader');
        if (loader) {
            loader.remove();
        }
    }

    // Notification methods
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icon = {
            'success': '✅',
            'error': '⚠️',
            'warning': '⚠️',
            'info': 'ℹ️'
        }[type] || 'ℹ️';
        
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${icon}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close">✕</button>
            </div>
        `;
        
        // Add close event listener
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });
        
        document.body.appendChild(notification);
        
        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, duration);
        }
    }

    // Utility methods
    isPopupActive() {
        return this.activePopups.size > 0;
    }

    closeAllPopups() {
        this.removeExistingPopups();
    }

    showValidationPopup(missingItems, stepNum) {
        const popup = document.createElement('div');
        popup.className = 'validation-popup-overlay';
        
        const itemsList = missingItems.map(item => `<li>${item}</li>`).join('');
        
        popup.innerHTML = `
            <div class="validation-popup">
                <div class="validation-popup-header">
                    <h3>📝 아직 답변하지 않은 질문이 있어요</h3>
                </div>
                <div class="validation-popup-body">
                    <p>모든 질문에 답변해야 다음 단계로 넘어갈 수 있습니다.</p>
                    <div class="missing-items">
                        <h4>빠뜨린 질문들:</h4>
                        <ul>
                            ${itemsList}
                        </ul>
                    </div>
                </div>
                <div class="validation-popup-actions">
                    <button class="btn-primary" onclick="this.closest('.validation-popup-overlay').remove()">
                        답변 계속하기
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(popup);
        this.activePopups.add(popup);

        // Close on background click
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.remove();
                this.activePopups.delete(popup);
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

        // Get all incomplete questions, not just the first one
        const incompleteQuestions = stepSection.querySelectorAll('.question.incomplete');
        if (incompleteQuestions.length > 0) {
            // Scroll to the first incomplete question
            incompleteQuestions[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Add simple highlight effect to all incomplete questions
            incompleteQuestions.forEach(question => {
                question.classList.add('highlight-incomplete');
            });
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
        this.activePopups.add(popup);

        // Close on background click
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.remove();
                this.activePopups.delete(popup);
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
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.UIManager = UIManager;
}