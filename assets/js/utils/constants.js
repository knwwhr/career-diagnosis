// Constants - Centralized constant values
const CONSTANTS = {
    // Auto-save settings
    AUTO_SAVE_INTERVAL: 30000, // 30 seconds

    // Progress percentages
    PROGRESS_STEP_1: 33,
    PROGRESS_STEP_2: 66,
    PROGRESS_STEP_3: 100,

    // Chart settings
    CHART_MAX_VALUE: 20,
    CHART_STEP_SIZE: 5,

    // Timeout settings
    POPUP_AUTO_CLOSE_TIMEOUT: 3000, // 3 seconds
    TOOLTIP_AUTO_CLOSE_TIMEOUT: 3000, // 3 seconds
    LOADING_TIMEOUT: 120000, // 2 minutes

    // Validation settings
    MAX_INDUSTRY_SELECTIONS: 3,
    MAX_VALUE_SELECTIONS: 3,
    MIN_SCALE_VALUE: 1,
    MAX_SCALE_VALUE: 5,

    // CSS Classes
    CSS_CLASSES: {
        POPUP_OVERLAY: 'popup-overlay',
        TOOLTIP_OVERLAY: 'tooltip-overlay',
        SIMPLE_POPUP: 'simple-popup-overlay',
        QUESTION_TOOLTIP: 'question-tooltip-popup',
        COMPLETION_POPUP: 'completion-popup',
        ERROR_POPUP: 'error-popup',
        BTN_PRIMARY: 'btn-primary',
        BTN_SECONDARY: 'btn-secondary',
        OPTION: 'option',
        SELECTED: 'selected',
        DISABLED: 'disabled',
        INCOMPLETE: 'incomplete',
        KEYBOARD_FOCUSED: 'keyboard-focused',
        TOUCH_HIGHLIGHT: 'touch-highlight',
        LOADING: 'loading',
        ACTIVE: 'active'
    },

    // ID Patterns
    ID_PATTERNS: {
        STEP_SECTION: (step) => `step${step}`,
        STEP_NEXT: (step) => `step${step}-next`,
        STEP_PREV: (step) => `step${step}-prev`,
        QUESTION: (step, questionId) => `${step}-${questionId}`,
        OPTION: (questionId, optionId) => `${questionId}_${optionId}`
    },

    // Local Storage Keys
    STORAGE_KEYS: {
        ASSESSMENT_RESPONSES: 'assessment_responses',
        ASSESSMENT_PROGRESS: 'assessment_progress',
        LAST_SAVE_TIME: 'lastSaveTime',
        ASSESSMENT_DATA: 'assessmentData',
        ANALYTICS_EVENTS: 'analyticsEvents',
        ASSESSMENT_START_TIME: 'assessmentStartTime'
    },

    // Event Types
    EVENTS: {
        ASSESSMENT_START: 'assessment_start',
        STEP_COMPLETED: 'step_completed', 
        ASSESSMENT_COMPLETED: 'assessment_completed',
        OPTION_SELECTED: 'option_selected',
        VALIDATION_ERROR: 'validation_error',
        POPUP_SHOWN: 'popup_shown',
        POPUP_CLOSED: 'popup_closed'
    },

    // Response Types
    RESPONSE_TYPES: {
        SINGLE: 'single',
        MULTIPLE: 'multiple',
        SCALE: 'scale',
        RANKING: 'ranking'
    },

    // Question Types
    QUESTION_TYPES: {
        MULTIPLE_CHOICE: 'multiple_choice',
        MULTIPLE_SELECT: 'multiple_select',
        SCALE: 'scale',
        RANKING: 'ranking'
    },

    // Validation Messages
    VALIDATION_MESSAGES: {
        REQUIRED: '이 질문은 필수입니다.',
        SELECT_AT_LEAST_ONE: '최소 하나의 옵션을 선택해주세요.',
        SELECT_EXACTLY: (count) => `정확히 ${count}개를 선택해주세요.`,
        SELECT_MAX: (max) => `최대 ${max}개까지만 선택할 수 있습니다.`,
        ANSWER_ALL_SCALE: '모든 항목에 답변해주세요.',
        INVALID_VALUE: '올바른 값을 입력해주세요.'
    },

    // Step Names
    STEP_NAMES: {
        1: '강점 발견',
        2: '직무 매칭',
        3: '실행 계획'
    },

    // RIASEC Types
    RIASEC_TYPES: {
        R: '현실형',
        I: '탐구형', 
        A: '예술형',
        S: '사회형',
        E: '진취형',
        C: '관습형'
    },

    // Score Ranges
    SCORE_RANGES: {
        MIN_TOTAL_SCORE: 10,
        MAX_TOTAL_SCORE: 95,
        RIASEC_MAX: 20,
        INDUSTRY_MATCH_MAX: 20,
        SKILL_CONFIDENCE_MAX: 25,
        JOB_UNDERSTANDING_MAX: 20,
        VALUE_MATCH_MAX: 8,
        WORK_ENVIRONMENT_MAX: 15,
        PREPARATION_PENALTY: -10
    },

    // Timing
    TIMING: {
        STEP_1_ESTIMATED: 4, // minutes
        STEP_2_ESTIMATED: 3, // minutes
        STEP_3_ESTIMATED: 3, // minutes
        TOTAL_ESTIMATED: 10  // minutes
    },

    // URLs
    URLS: {
        CONSULTING: 'https://insidejob.kr',
        HELP: '#',
        PRIVACY: '#',
        TERMS: '#'
    },

    // Device Detection
    MOBILE_BREAKPOINT: 768,
    TABLET_BREAKPOINT: 1024,

    // Touch Settings
    TOUCH: {
        MIN_TARGET_SIZE: 44, // pixels
        HIGHLIGHT_DURATION: 150 // milliseconds
    },

    // Accessibility
    ACCESSIBILITY: {
        FOCUS_OUTLINE_WIDTH: 2,
        HIGH_CONTRAST_RATIO: 4.5,
        KEYBOARD_NAV_DELAY: 100
    },

    // Animation Durations
    ANIMATIONS: {
        POPUP_FADE: 300,
        SECTION_TRANSITION: 500,
        OPTION_HIGHLIGHT: 200,
        LOADING_FADE: 200
    },

    // Analytics
    ANALYTICS: {
        MAX_EVENTS_STORED: 100,
        BATCH_SIZE: 10,
        FLUSH_INTERVAL: 60000 // 1 minute
    },

    // Error Codes
    ERROR_CODES: {
        VALIDATION_FAILED: 'VALIDATION_FAILED',
        CALCULATION_FAILED: 'CALCULATION_FAILED',
        STORAGE_FAILED: 'STORAGE_FAILED',
        NETWORK_ERROR: 'NETWORK_ERROR',
        UNKNOWN_ERROR: 'UNKNOWN_ERROR'
    },

    // Debug Settings
    DEBUG: {
        ENABLED: false, // Set to true for development
        LOG_LEVEL: 'warn', // 'error', 'warn', 'info', 'debug'
        MOCK_DELAYS: false
    }
};

// Freeze the constants object to prevent modification
Object.freeze(CONSTANTS);

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.CONSTANTS = CONSTANTS;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONSTANTS;
}