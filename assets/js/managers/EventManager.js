// Event Management Class - Handles all event delegation and management
class EventManager {
    constructor(assessmentManager, uiManager, questionRenderer) {
        this.assessmentManager = assessmentManager;
        this.uiManager = uiManager;
        this.questionRenderer = questionRenderer;
        this.eventListeners = new Map();
        this.init();
    }

    init() {
        // Bind methods to preserve context
        this.boundHandleClick = this.handleClick.bind(this);
        this.boundHandleChange = this.handleChange.bind(this);
        this.boundHandleInput = this.handleInput.bind(this);
        this.boundHandleKeydown = this.handleKeydown.bind(this);
        this.boundHandleFocusIn = this.handleFocusIn.bind(this);
        this.boundHandleFocusOut = this.handleFocusOut.bind(this);
        
        this.setupEventDelegation();
        this.setupKeyboardShortcuts();
        this.setupAccessibilityEvents();
    }

    setupEventDelegation() {
        // Main event delegation handler
        document.addEventListener('click', this.boundHandleClick);
        document.addEventListener('change', this.boundHandleChange);
        document.addEventListener('input', this.boundHandleInput);
        document.addEventListener('keydown', this.boundHandleKeydown);
    }

    handleClick(e) {
        const target = e.target;
        
        // Analytics: 버튼 클릭 추적
        if (target.tagName === 'BUTTON' || target.closest('button')) {
            const button = target.tagName === 'BUTTON' ? target : target.closest('button');
            if (window.analyticsManager) {
                window.analyticsManager.trackButtonClick(button.id || button.className, button.getAttribute('data-location') || 'unknown');
            }
        }
        
        // Handle option selections
        if (target.closest('.option[data-type]')) {
            this.handleOptionClick(e);
            return;
        }

        // Handle navigation buttons - more specific matching
        if (target.id === 'step1-next' || target.id === 'step2-next' || target.id === 'step3-next') {
            this.handleNextButton(e);
            return;
        }

        if (target.id === 'step1-prev' || target.id === 'step2-prev' || target.id === 'step3-prev' || target.id === 'results-prev') {
            this.handlePrevButton(e);
            return;
        }

        // Handle start assessment button
        if (target.id === 'start-assessment') {
            this.handleStartAssessment(e);
            return;
        }

        // Handle consulting button
        if (target.id === 'consulting-btn') {
            this.handleConsultingButton(e);
            return;
        }

        // Handle tooltip buttons
        if (target.matches('.tooltip-trigger')) {
            this.handleTooltipTrigger(e);
            return;
        }

        // Handle popup close buttons
        if (target.matches('.popup-close, .tooltip-close, .notification-close')) {
            this.handlePopupClose(e);
            return;
        }

        // Handle action buttons in popups
        if (target.matches('[data-action]')) {
            this.handleActionButton(e);
            return;
        }
    }

    handleOptionClick(e) {
        const option = e.target.closest('.option[data-type]');
        if (!option) return;

        const stepNum = option.dataset.step;
        const questionId = option.dataset.question;
        const optionId = option.dataset.option;
        const type = option.dataset.type;

        switch (type) {
            case 'single':
                this.assessmentManager.optionHandler.selectSingleOption(e, stepNum, questionId, optionId, option);
                break;
            case 'multiple':
                const maxSelections = parseInt(option.dataset.max);
                this.assessmentManager.optionHandler.selectMultipleOption(e, stepNum, questionId, optionId, option, maxSelections);
                break;
            case 'ranking':
                const maxRank = parseInt(option.dataset.max);
                this.assessmentManager.optionHandler.selectRankingOption(e, stepNum, questionId, optionId, option, maxRank);
                break;
            case 'scale':
                const value = parseInt(option.dataset.value);
                this.assessmentManager.optionHandler.saveScaleResponse(stepNum, questionId, optionId, value);
                // Also update the radio button
                const radio = option.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
                break;
        }
    }

    handleNextButton(e) {
        // 중복 클릭 방지
        if (e.target.classList.contains('processing') || e.target.disabled) {
            return;
        }
        
        const stepMatch = e.target.id.match(/step(\d+)-next/);
        if (stepMatch) {
            const stepNum = parseInt(stepMatch[1]);
            
            // 즉시 실행 (딜레이 제거)
            this.assessmentManager.handleNext(stepNum);
        }
    }

    handlePrevButton(e) {
        const buttonId = e.target.id;
        console.log('Previous button clicked:', buttonId); // 디버깅용
        
        if (buttonId === 'results-prev') {
            // 결과 화면에서 3단계로 돌아가기
            console.log('Going back to step 3 from results'); // 디버깅용
            this.assessmentManager.showSection('step3');
            this.assessmentManager.loadStep(3);
            return;
        }
        
        const stepMatch = buttonId.match(/step(\d+)-prev/);
        if (stepMatch) {
            const stepNum = parseInt(stepMatch[1]);
            console.log('Going to previous step from:', stepNum); // 디버깅용
            this.assessmentManager.handlePrevious(stepNum);
        } else {
            console.warn('Could not match step number from button ID:', buttonId);
        }
    }

    handleStartAssessment(e) {
        // 개인정보 수집 페이지로 이동
        // 모든 섹션 숨기기
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        // 개인정보 폼 상태 초기화 및 이전 데이터 삭제
        if (window.personalInfoManager) {
            window.personalInfoManager.clearPreviousUserData();
            window.personalInfoManager.resetFormState();
        }
        
        // 개인정보 섹션 표시
        const personalInfoSection = document.getElementById('personal-info');
        if (personalInfoSection) {
            personalInfoSection.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            console.error('Personal info section not found');
            // 섹션이 없으면 기존 방식으로 1단계로 이동
            this.assessmentManager.showSection('step1');
            this.assessmentManager.currentStep = 1;
            this.assessmentManager.loadQuestions(1);
        }
    }

    handleConsultingButton(e) {
        e.preventDefault();
        e.stopPropagation();
        window.open('https://insidejob.kr', '_blank');
    }

    handleTooltipTrigger(e) {
        const type = e.target.dataset.tooltipType;
        if (type) {
            this.uiManager.showTooltip(type);
        }
    }

    handlePopupClose(e) {
        const popup = e.target.closest('.popup-overlay, .tooltip-overlay, .notification');
        if (popup) {
            this.uiManager.closePopup(popup);
        }
    }

    handleActionButton(e) {
        const actionId = e.target.dataset.action;
        const popup = e.target.closest('.popup-overlay');
        
        // Find and execute the action
        if (actionId && popup) {
            this.executeAction(actionId, popup);
        }
    }

    handleChange(e) {
        const target = e.target;
        
        // Handle radio button changes for scale questions
        if (target.type === 'radio' && target.closest('.scale-option')) {
            const scaleOption = target.closest('.scale-option');
            const stepNum = scaleOption.dataset.step;
            const questionId = scaleOption.dataset.question;
            const optionId = scaleOption.dataset.option;
            const value = parseInt(scaleOption.dataset.value);
            
            this.assessmentManager.optionHandler.saveScaleResponse(stepNum, questionId, optionId, value);
        }
    }

    handleInput(e) {
        // Handle real-time validation for text inputs if any are added in the future
        const target = e.target;
        
        if (target.matches('input[type="text"], textarea')) {
            this.handleTextInput(e);
        }
    }

    handleTextInput(e) {
        // Debounced validation for text inputs
        clearTimeout(this.textInputTimeout);
        this.textInputTimeout = setTimeout(() => {
            this.validateTextInput(e.target);
        }, 300);
    }

    handleKeydown(e) {
        // Global keyboard shortcuts
        switch (e.key) {
            case 'Escape':
                this.handleEscapeKey(e);
                break;
            case 'Enter':
                this.handleEnterKey(e);
                break;
            case 'ArrowUp':
            case 'ArrowDown':
                this.handleArrowKeys(e);
                break;
            case 'Tab':
                this.handleTabKey(e);
                break;
        }
    }

    setupKeyboardShortcuts() {
        // Add keyboard shortcut indicators
        this.addKeyboardShortcuts({
            'Escape': 'Close popup or go back',
            'Enter': 'Activate focused button',
            'Arrow Keys': 'Navigate options',
            'Tab': 'Navigate between elements'
        });
    }

    setupAccessibilityEvents() {
        // Focus management for better accessibility
        document.addEventListener('focusin', this.boundHandleFocusIn);
        document.addEventListener('focusout', this.boundHandleFocusOut);
        
        // Screen reader announcements
        this.setupScreenReaderEvents();
    }

    handleEscapeKey(e) {
        // Close any open popups first
        if (this.uiManager.isPopupActive()) {
            this.uiManager.closeAllPopups();
            return;
        }

        // Go back one step
        if (this.assessmentManager.currentStep > 1) {
            this.assessmentManager.handlePrevious(this.assessmentManager.currentStep);
        }
    }

    handleEnterKey(e) {
        // Activate focused button
        if (e.target.matches('button, .btn-primary, .btn-secondary')) {
            e.target.click();
        }
        
        // Select focused option
        if (e.target.closest('.option')) {
            e.target.closest('.option').click();
        }
    }

    handleArrowKeys(e) {
        const focusedElement = document.activeElement;
        const question = focusedElement.closest('.question');
        
        if (!question) return;
        
        const options = question.querySelectorAll('.option');
        const currentIndex = Array.from(options).indexOf(focusedElement.closest('.option'));
        
        if (currentIndex === -1) return;
        
        let newIndex;
        if (e.key === 'ArrowDown') {
            newIndex = (currentIndex + 1) % options.length;
        } else if (e.key === 'ArrowUp') {
            newIndex = (currentIndex - 1 + options.length) % options.length;
        }
        
        if (options[newIndex]) {
            options[newIndex].focus();
            e.preventDefault();
        }
    }

    handleTabKey(e) {
        // Ensure tab navigation stays within popups when they're open
        if (this.uiManager.isPopupActive()) {
            this.trapFocusInPopup(e);
        }
    }

    handleFocusIn(e) {
        // Add visual focus indicators
        const focusedElement = e.target;
        
        if (focusedElement.matches('.option')) {
            focusedElement.classList.add('keyboard-focused');
        }
        
        // Announce to screen readers
        this.announceToScreenReader(focusedElement);
    }

    handleFocusOut(e) {
        // Remove visual focus indicators
        const element = e.target;
        element.classList.remove('keyboard-focused');
    }

    setupScreenReaderEvents() {
        // Create announcement region if it doesn't exist
        if (!document.getElementById('announcements')) {
            const announceRegion = document.createElement('div');
            announceRegion.id = 'announcements';
            announceRegion.setAttribute('aria-live', 'polite');
            announceRegion.setAttribute('aria-atomic', 'true');
            announceRegion.style.position = 'absolute';
            announceRegion.style.left = '-10000px';
            announceRegion.style.width = '1px';
            announceRegion.style.height = '1px';
            announceRegion.style.overflow = 'hidden';
            document.body.appendChild(announceRegion);
        }
    }

    // Utility methods
    executeAction(actionId, popup) {
        switch (actionId) {
            case 'restart':
                this.assessmentManager.restart();
                break;
            case 'retry':
                this.assessmentManager.retryCalculation();
                break;
            case 'go-back':
                this.assessmentManager.goBackToIncompleteStep();
                break;
            default:
                console.warn('Unknown action:', actionId);
        }
        
        this.uiManager.closePopup(popup);
    }

    addKeyboardShortcuts(shortcuts) {
        // Add keyboard shortcut help (for development/accessibility)
        if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
            console.log('Keyboard shortcuts:', shortcuts);
        }
    }

    trapFocusInPopup(e) {
        const popup = document.querySelector('.popup-overlay:last-of-type');
        if (!popup) return;
        
        const focusableElements = popup.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey && document.activeElement === firstFocusable) {
            lastFocusable.focus();
            e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === lastFocusable) {
            firstFocusable.focus();
            e.preventDefault();
        }
    }

    announceToScreenReader(element) {
        const announceRegion = document.getElementById('announcements');
        if (!announceRegion) return;
        
        let announcement = '';
        
        if (element.matches('.option')) {
            const question = element.closest('.question');
            const questionText = question.querySelector('h3')?.textContent || '';
            const optionText = element.textContent || '';
            announcement = `${questionText}, ${optionText}`;
        } else if (element.matches('button')) {
            announcement = element.textContent || element.getAttribute('aria-label') || '';
        }
        
        if (announcement) {
            announceRegion.textContent = announcement;
        }
    }

    validateTextInput(input) {
        // Placeholder for future text input validation
        const value = input.value;
        const isValid = value.length > 0;
        
        input.classList.toggle('invalid', !isValid);
        
        // Show/hide validation message
        let validationMsg = input.parentNode.querySelector('.validation-message');
        if (!isValid && !validationMsg) {
            validationMsg = document.createElement('div');
            validationMsg.className = 'validation-message';
            validationMsg.textContent = 'This field is required';
            input.parentNode.appendChild(validationMsg);
        } else if (isValid && validationMsg) {
            validationMsg.remove();
        }
    }

    // Event listener management
    addEventListener(element, event, handler, options = {}) {
        const key = `${event}-${Date.now()}-${Math.random()}`;
        element.addEventListener(event, handler, options);
        
        this.eventListeners.set(key, {
            element,
            event,
            handler,
            options
        });
        
        return key;
    }

    removeEventListener(key) {
        const listener = this.eventListeners.get(key);
        if (listener) {
            listener.element.removeEventListener(listener.event, listener.handler, listener.options);
            this.eventListeners.delete(key);
        }
    }

    removeAllEventListeners() {
        this.eventListeners.forEach((listener, key) => {
            this.removeEventListener(key);
        });
    }

    // Cleanup
    destroy() {
        this.removeAllEventListeners();
        
        // Remove main event delegation handlers
        if (this.boundHandleClick) {
            document.removeEventListener('click', this.boundHandleClick);
        }
        if (this.boundHandleChange) {
            document.removeEventListener('change', this.boundHandleChange);
        }
        if (this.boundHandleInput) {
            document.removeEventListener('input', this.boundHandleInput);
        }
        if (this.boundHandleKeydown) {
            document.removeEventListener('keydown', this.boundHandleKeydown);
        }
        if (this.boundHandleFocusIn) {
            document.removeEventListener('focusin', this.boundHandleFocusIn);
        }
        if (this.boundHandleFocusOut) {
            document.removeEventListener('focusout', this.boundHandleFocusOut);
        }
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.EventManager = EventManager;
}