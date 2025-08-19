/**
 * AnalyticsManager - GA4 이벤트 추적 및 사용자 행동 분석
 * 
 * 주요 이벤트:
 * - assessment_start: 진단 시작
 * - step_completed: 단계별 완료 
 * - assessment_completed: 전체 진단 완료
 * - button_click: 중요 버튼 클릭
 * - form_interaction: 폼 상호작용
 */
class AnalyticsManager {
    constructor() {
        this.isGoogleAnalyticsLoaded = false;
        this.eventQueue = [];
        this.sessionId = this.generateSessionId();
        this.initStartTime = Date.now();
        this.initializeAnalytics();
    }

    /**
     * Google Analytics 초기화 및 로드 상태 확인
     */
    initializeAnalytics() {
        // gtag 함수가 로드될 때까지 대기 (최대 10초)
        if (typeof gtag !== 'undefined') {
            this.isGoogleAnalyticsLoaded = true;
            this.flushEventQueue();
        } else if ((Date.now() - this.initStartTime) < 10000) {
            // 10초 내에서만 재시도, 간격도 늘림
            setTimeout(() => this.initializeAnalytics(), 500);
        } else {
            console.log('[Analytics] gtag 로드 시간 초과, Analytics 비활성화');
        }
    }

    /**
     * 세션 ID 생성
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 이벤트 전송 (큐 시스템 사용)
     */
    trackEvent(eventName, parameters = {}) {
        const eventData = {
            event_name: eventName,
            timestamp: new Date().toISOString(),
            session_id: this.sessionId,
            ...parameters
        };

        if (this.isGoogleAnalyticsLoaded && typeof gtag !== 'undefined') {
            try {
                gtag('event', eventName, eventData);
                console.log('[Analytics] 이벤트 전송:', eventName, eventData);
            } catch (error) {
                console.error('[Analytics] 이벤트 전송 실패:', error);
            }
        } else {
            // GA가 로드되지 않은 경우 큐에 저장
            this.eventQueue.push({ eventName, parameters: eventData });
            console.log('[Analytics] 이벤트 큐에 저장:', eventName);
        }
    }

    /**
     * 큐에 저장된 이벤트들을 전송
     */
    flushEventQueue() {
        while (this.eventQueue.length > 0) {
            const { eventName, parameters } = this.eventQueue.shift();
            this.trackEvent(eventName, parameters);
        }
    }

    /**
     * 진단 시작 이벤트
     */
    trackAssessmentStart() {
        this.trackEvent('assessment_start', {
            event_category: 'engagement',
            event_label: 'career_assessment_begin',
            value: 1
        });
    }

    /**
     * 단계 완료 이벤트
     */
    trackStepCompleted(stepNumber, stepName, timeSpent = null) {
        this.trackEvent('step_completed', {
            event_category: 'progress',
            event_label: `step_${stepNumber}_${stepName}`,
            step_number: stepNumber,
            step_name: stepName,
            time_spent_seconds: timeSpent,
            value: stepNumber
        });
    }

    /**
     * 진단 완료 이벤트
     */
    trackAssessmentCompleted(totalTimeSpent = null, totalQuestions = null) {
        // 저장된 유입 경로 데이터 가져오기
        const entryData = JSON.parse(sessionStorage.getItem('entry_data') || '{}');
        
        this.trackEvent('assessment_completed', {
            event_category: 'conversion',
            event_label: 'career_assessment_finished',
            total_time_spent_seconds: totalTimeSpent,
            total_questions: totalQuestions,
            // 유입 경로 정보 포함
            ...entryData,
            completion_rate: 100,
            value: 10 // 높은 가치 이벤트
        });
    }

    /**
     * 질문 응답 이벤트
     */
    trackQuestionAnswer(questionId, questionType, answerValue = null) {
        this.trackEvent('question_answered', {
            event_category: 'interaction',
            event_label: `question_${questionId}`,
            question_id: questionId,
            question_type: questionType,
            answer_value: answerValue
        });
    }

    /**
     * 결과 조회 이벤트
     */
    trackResultsViewed(topJob = null, riasecType = null) {
        this.trackEvent('results_viewed', {
            event_category: 'engagement',
            event_label: 'career_results_displayed',
            top_recommended_job: topJob,
            primary_riasec_type: riasecType,
            value: 5
        });
    }

    /**
     * 액션플랜 조회 이벤트
     */
    trackActionPlanViewed() {
        this.trackEvent('action_plan_viewed', {
            event_category: 'engagement',
            event_label: 'personalized_action_plan',
            value: 3
        });
    }

    /**
     * 버튼 클릭 이벤트
     */
    trackButtonClick(buttonName, buttonLocation = null) {
        this.trackEvent('button_click', {
            event_category: 'interaction',
            event_label: buttonName,
            button_name: buttonName,
            button_location: buttonLocation
        });
    }

    /**
     * 폼 상호작용 이벤트
     */
    trackFormInteraction(interactionType, formElement = null) {
        this.trackEvent('form_interaction', {
            event_category: 'interaction',
            event_label: interactionType,
            interaction_type: interactionType,
            form_element: formElement
        });
    }

    /**
     * 오류 이벤트
     */
    trackError(errorType, errorMessage = null, errorLocation = null) {
        this.trackEvent('error_occurred', {
            event_category: 'error',
            event_label: errorType,
            error_type: errorType,
            error_message: errorMessage,
            error_location: errorLocation
        });
    }

    /**
     * 페이지 체류 시간 이벤트
     */
    trackTimeSpent(pageName, timeSpentSeconds) {
        this.trackEvent('time_on_page', {
            event_category: 'engagement',
            event_label: pageName,
            page_name: pageName,
            time_spent_seconds: timeSpentSeconds
        });
    }

    /**
     * 사용자 속성 설정
     */
    setUserProperty(propertyName, propertyValue) {
        if (this.isGoogleAnalyticsLoaded && typeof gtag !== 'undefined') {
            gtag('config', 'G-736XG0NZE4', {
                custom_map: {[propertyName]: propertyValue}
            });
        }
    }

    /**
     * 커스텀 이벤트 전송
     */
    trackCustomEvent(eventName, customParameters = {}) {
        this.trackEvent(eventName, {
            event_category: 'custom',
            ...customParameters
        });
    }

    /**
     * UTM 파라미터 및 Referrer 추적
     */
    trackPageEntry() {
        const urlParams = new URLSearchParams(window.location.search);
        const referrer = document.referrer;
        
        // UTM 파라미터 수집
        const utmData = {
            utm_source: urlParams.get('utm_source') || 'direct',
            utm_medium: urlParams.get('utm_medium') || 'none',
            utm_campaign: urlParams.get('utm_campaign') || 'none',
            utm_content: urlParams.get('utm_content') || 'none',
            utm_term: urlParams.get('utm_term') || 'none',
            referrer: referrer || 'direct',
            landing_page: window.location.pathname + window.location.search
        };

        // Referrer 도메인 추출
        if (referrer) {
            try {
                const referrerDomain = new URL(referrer).hostname;
                utmData.referrer_domain = referrerDomain;
            } catch (e) {
                utmData.referrer_domain = 'unknown';
            }
        }

        // 페이지 진입 이벤트 전송
        this.trackEvent('page_entry', utmData);
        
        // 세션 스토리지에 저장 (진단 완료시 함께 전송)
        sessionStorage.setItem('entry_data', JSON.stringify(utmData));
        
        console.log('[Analytics] 유입 경로 추적:', utmData);
    }
}

// 전역 인스턴스 생성
window.analyticsManager = new AnalyticsManager();

// 페이지 로드시 유입 경로 자동 추적
document.addEventListener('DOMContentLoaded', () => {
    window.analyticsManager.trackPageEntry();
});

// 전역 함수로 등록 (호환성)
window.trackEvent = (eventName, parameters) => {
    window.analyticsManager.trackEvent(eventName, parameters);
};

window.trackAssessmentStart = () => {
    window.analyticsManager.trackAssessmentStart();
};

window.trackStepCompleted = (stepNumber, stepName, timeSpent) => {
    window.analyticsManager.trackStepCompleted(stepNumber, stepName, timeSpent);
};

window.trackAssessmentCompleted = (totalTimeSpent, totalQuestions) => {
    window.analyticsManager.trackAssessmentCompleted(totalTimeSpent, totalQuestions);
};

console.log('[Analytics] AnalyticsManager 초기화 완료');