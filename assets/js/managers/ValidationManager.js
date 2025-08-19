// Validation Management Class - Handles all validation logic
class ValidationManager {
    constructor(assessmentData) {
        this.assessmentData = assessmentData || {};
        this.validationRules = this.initializeValidationRules();
    }

    initializeValidationRules() {
        return {
            step1: {
                required: ['educational_background', 'values_priorities', 'work_environment', 'personality_riasec', 'strengths_experience'],
                validation: {
                    values_priorities: (value) => Array.isArray(value) && value.length === 3,
                    work_environment: (value) => typeof value === 'object' && Object.keys(value).length === 5,
                    strengths_experience: (value) => Array.isArray(value) && value.length > 0
                }
            },
            step2: {
                required: ['industry_interest', 'job_understanding', 'skill_confidence'],
                validation: {
                    industry_interest: (value) => Array.isArray(value) && value.length > 0 && value.length <= 3,
                    job_understanding: (value) => typeof value === 'object' && Object.keys(value).length === 10,
                    skill_confidence: (value) => typeof value === 'object' && Object.keys(value).length === 10
                }
            },
            step3: {
                required: ['career_timeline', 'preparation_status', 'learning_preference'],
                validation: {
                    career_timeline: (value) => typeof value === 'string' && value.length > 0,
                    preparation_status: (value) => Array.isArray(value) && value.length > 0,
                    learning_preference: (value) => typeof value === 'string' && value.length > 0
                }
            }
        };
    }

    validateStep(stepNum, responses) {
        const stepKey = `step${stepNum}`;
        const stepResponses = responses[stepKey] || {};
        const rules = this.validationRules[stepKey];
        
        if (!rules) {
            return { isValid: false, errors: ['Invalid step number'], missingItems: [] };
        }

        const errors = [];
        const missingItems = [];

        // Check required fields
        rules.required.forEach(field => {
            if (!stepResponses[field] || stepResponses[field] === null || stepResponses[field] === undefined) {
                const questionText = this.getQuestionText(stepNum, field);
                missingItems.push(questionText);
                errors.push(`${field} is required`);
            }
        });

        // Check validation rules
        Object.entries(rules.validation || {}).forEach(([field, validator]) => {
            const value = stepResponses[field];
            if (value !== undefined && value !== null && !validator(value)) {
                const questionText = this.getQuestionText(stepNum, field);
                errors.push(`Invalid value for ${field}`);
                if (!missingItems.includes(questionText)) {
                    missingItems.push(questionText);
                }
            }
        });

        return {
            isValid: errors.length === 0,
            errors,
            missingItems,
            stepResponses
        };
    }

    validateCurrentStepWithDetails(stepNum, responses) {
        const validation = this.validateStep(stepNum, responses);
        
        if (!validation.isValid) {
            return {
                isValid: false,
                missingItems: validation.missingItems,
                errors: validation.errors
            };
        }

        return { isValid: true, missingItems: [], errors: [] };
    }

    validateAllSteps(responses) {
        const results = {
            isValid: true,
            stepResults: {},
            allErrors: [],
            allMissingItems: []
        };

        for (let step = 1; step <= 3; step++) {
            const stepResult = this.validateStep(step, responses);
            results.stepResults[`step${step}`] = stepResult;
            
            if (!stepResult.isValid) {
                results.isValid = false;
                results.allErrors.push(...stepResult.errors);
                results.allMissingItems.push(...stepResult.missingItems);
            }
        }

        return results;
    }

    getQuestionText(stepNum, questionId) {
        const stepKey = `step${stepNum}`;
        const stepData = this.assessmentData[stepKey];
        
        if (!stepData || !stepData.questions) {
            return questionId; // Fallback to questionId if not found
        }

        const question = stepData.questions.find(q => q.id === questionId);
        if (!question) return questionId;
        
        // 축약된 질문 텍스트 제공
        const shortTitles = {
            'educational_background': '전공/학과 선택',
            'values_priorities': '가치관 우선순위 (3개 선택)',
            'work_environment': '업무환경 선호도',
            'personality_riasec': '성향 분석',
            'strengths_experience': '강점 경험',
            'industry_interest': '관심 산업 분야',
            'job_understanding': '직무 이해도',
            'skill_confidence': '스킬 자신감',
            'career_timeline': '취업 희망 시기',
            'preparation_status': '현재 준비 상황',
            'learning_preference': '학습 방법 선호도'
        };
        
        return shortTitles[questionId] || question.question;
    }

    // Specific validation methods for different question types
    validateMultipleChoice(value) {
        return typeof value === 'string' && value.length > 0;
    }

    validateMultipleSelect(value, maxSelections = 999) {
        return Array.isArray(value) && 
               value.length > 0 && 
               value.length <= maxSelections &&
               value.every(item => typeof item === 'string');
    }

    validateScale(value, requiredOptions = []) {
        if (typeof value !== 'object' || value === null) return false;
        
        // Check if all required options have values
        if (requiredOptions.length > 0) {
            return requiredOptions.every(option => 
                value[option] !== undefined && 
                value[option] !== null &&
                typeof value[option] === 'number' &&
                value[option] >= 1 && 
                value[option] <= 5
            );
        }
        
        // General scale validation
        return Object.values(value).every(val => 
            typeof val === 'number' && val >= 1 && val <= 5
        );
    }

    validateRanking(value, requiredLength) {
        return Array.isArray(value) && 
               value.length === requiredLength &&
               value.every(item => typeof item === 'string') &&
               new Set(value).size === value.length; // No duplicates
    }

    // Real-time validation helpers
    validateFieldInRealTime(stepNum, questionId, value, questionType) {
        const stepKey = `step${stepNum}`;
        const rules = this.validationRules[stepKey];
        
        if (!rules) return { isValid: true, message: '' };

        // Check if field is required
        const isRequired = rules.required.includes(questionId);
        
        if (isRequired && (value === null || value === undefined || 
            (Array.isArray(value) && value.length === 0) ||
            (typeof value === 'object' && Object.keys(value).length === 0) ||
            (typeof value === 'string' && value.trim() === ''))) {
            return { 
                isValid: false, 
                message: '이 질문은 필수입니다.' 
            };
        }

        // Check specific validation rules
        const validator = rules.validation && rules.validation[questionId];
        if (validator && value !== null && value !== undefined && !validator(value)) {
            return this.getValidationMessage(questionId, questionType, value);
        }

        return { isValid: true, message: '' };
    }

    getValidationMessage(questionId, questionType, value) {
        switch (questionId) {
            case 'values_priorities':
                if (!Array.isArray(value) || value.length !== 3) {
                    return { isValid: false, message: '정확히 3개의 가치를 순서대로 선택해주세요.' };
                }
                break;
                
            case 'industry_interest':
                if (!Array.isArray(value) || value.length === 0) {
                    return { isValid: false, message: '최소 1개의 관심 분야를 선택해주세요.' };
                }
                if (value.length > 3) {
                    return { isValid: false, message: '최대 3개까지만 선택할 수 있습니다.' };
                }
                break;
                
            case 'work_environment':
                if (typeof value !== 'object' || Object.keys(value).length < 5) {
                    return { isValid: false, message: '모든 업무환경 질문에 답변해주세요.' };
                }
                break;
                
            case 'job_understanding':
                if (typeof value !== 'object' || Object.keys(value).length < 10) {
                    return { isValid: false, message: '모든 직업에 대한 이해도를 답변해주세요.' };
                }
                break;
                
            case 'skill_confidence':
                if (typeof value !== 'object' || Object.keys(value).length < 10) {
                    return { isValid: false, message: '모든 스킬에 대한 자신감을 답변해주세요.' };
                }
                break;
                
            case 'strengths_experience':
                if (!Array.isArray(value) || value.length === 0) {
                    return { isValid: false, message: '최소 하나의 강점을 선택해주세요.' };
                }
                break;
                
            case 'career_timeline':
                if (typeof value !== 'string' || value.length === 0) {
                    return { isValid: false, message: '취업 희망 시기를 선택해주세요.' };
                }
                break;
                
            case 'preparation_status':
                if (!Array.isArray(value) || value.length === 0) {
                    return { isValid: false, message: '현재 준비 상황을 선택해주세요.' };
                }
                break;
                
            case 'learning_preference':
                if (typeof value !== 'string' || value.length === 0) {
                    return { isValid: false, message: '선호하는 학습 방법을 선택해주세요.' };
                }
                break;
        }
        
        return { isValid: false, message: '올바른 값을 입력해주세요.' };
    }

    // Progress calculation
    calculateStepProgress(stepNum, responses) {
        const stepKey = `step${stepNum}`;
        const stepResponses = responses[stepKey] || {};
        const rules = this.validationRules[stepKey];
        
        if (!rules) return 0;

        const totalQuestions = rules.required.length;
        const completedQuestions = rules.required.filter(field => {
            const value = stepResponses[field];
            return value !== null && value !== undefined && 
                   !(Array.isArray(value) && value.length === 0) &&
                   !(typeof value === 'object' && Object.keys(value).length === 0);
        }).length;

        return Math.round((completedQuestions / totalQuestions) * 100);
    }

    calculateOverallProgress(responses) {
        let totalProgress = 0;
        
        for (let step = 1; step <= 3; step++) {
            totalProgress += this.calculateStepProgress(step, responses);
        }
        
        return Math.round(totalProgress / 3);
    }

    // Get incomplete questions for highlighting
    getIncompleteQuestions(stepNum, responses) {
        const validation = this.validateStep(stepNum, responses);
        const stepKey = `step${stepNum}`;
        const stepResponses = responses[stepKey] || {};
        const rules = this.validationRules[stepKey];
        
        const incompleteQuestions = [];
        
        rules.required.forEach(field => {
            const value = stepResponses[field];
            if (value === null || value === undefined || 
                (Array.isArray(value) && value.length === 0) ||
                (typeof value === 'object' && Object.keys(value).length === 0)) {
                incompleteQuestions.push(field);
            }
        });

        return incompleteQuestions;
    }

    // Data sanitization
    sanitizeResponse(questionType, value) {
        switch (questionType) {
            case 'multiple_choice':
                return typeof value === 'string' ? value.trim() : '';
                
            case 'multiple_select':
                return Array.isArray(value) ? value.filter(item => typeof item === 'string' && item.trim()) : [];
                
            case 'scale':
                if (typeof value === 'object' && value !== null) {
                    const sanitized = {};
                    Object.entries(value).forEach(([key, val]) => {
                        const numVal = parseInt(val);
                        if (!isNaN(numVal) && numVal >= 1 && numVal <= 5) {
                            sanitized[key] = numVal;
                        }
                    });
                    return sanitized;
                }
                return {};
                
            case 'ranking':
                return Array.isArray(value) ? value.filter(item => typeof item === 'string' && item.trim()) : [];
                
            default:
                return value;
        }
    }

    // Validation state management
    getValidationState(stepNum, responses) {
        const validation = this.validateStep(stepNum, responses);
        const progress = this.calculateStepProgress(stepNum, responses);
        const incompleteQuestions = this.getIncompleteQuestions(stepNum, responses);
        
        return {
            isValid: validation.isValid,
            progress,
            errors: validation.errors,
            missingItems: validation.missingItems,
            incompleteQuestions
        };
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.ValidationManager = ValidationManager;
}