/**
 * Personal Information Manager
 * 개인정보 수집 폼 관리 및 Supabase 연동
 */
class PersonalInfoManager {
    constructor() {
        this.formData = {};
        this.userId = null;
        this.isValid = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupValidation();
        this.resetFormState();
        // Supabase 초기화
        if (typeof initializeSupabase === 'function') {
            initializeSupabase();
        }
    }

    setupEventListeners() {
        // 동의 체크박스
        const consentCheckbox = document.getElementById('privacy-consent');
        if (consentCheckbox) {
            consentCheckbox.addEventListener('change', () => {
                this.validateForm();
            });
        }

        // 폼 필드들
        const formInputs = document.querySelectorAll('#personal-info input');
        formInputs.forEach(input => {
            input.addEventListener('input', () => {
                this.validateField(input);
                this.validateForm();
            });
            
            input.addEventListener('change', () => {
                this.validateField(input);
                this.validateForm();
            });
        });

        // 휴대폰 번호 자동 포맷팅
        const phoneInput = document.getElementById('user-phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                this.formatPhoneNumber(e.target);
            });
        }

        // 네비게이션 버튼
        const prevBtn = document.getElementById('personal-info-prev');
        const nextBtn = document.getElementById('personal-info-next');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.goBack();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.submitPersonalInfo();
            });
        }
    }

    setupValidation() {
        // 실시간 유효성 검사 설정
        this.validationRules = {
            name: {
                required: true,
                minLength: 2,
                maxLength: 10,
                pattern: /^[가-힣a-zA-Z\s]+$/,
                message: '이름을 입력해주세요'
            },
            phone: {
                required: true,
                pattern: /^010-\d{4}-\d{4}$/,
                message: '휴대폰번호를 입력해주세요'
            },
            gender: {
                required: true,
                message: '성별을 선택해주세요'
            },
            age_group: {
                required: true,
                message: '연령대를 선택해주세요'
            }
        };
    }

    validateField(input) {
        const fieldName = input.name;
        let value = '';
        
        if (input.type === 'radio') {
            value = document.querySelector(`input[name="${fieldName}"]:checked`)?.value || '';
        } else if (input.type === 'checkbox') {
            value = document.querySelector(`input[name="${fieldName}"]:checked`)?.value || '';
        } else {
            value = input.value.trim();
        }

        const rule = this.validationRules[fieldName];
        if (!rule) return true;

        const formGroup = input.closest('.form-group') || input.closest('.radio-group')?.parentElement;
        let errorElement = formGroup?.querySelector('.form-validation-error');

        // 오류 메시지 요소가 없으면 생성
        if (!errorElement && formGroup) {
            errorElement = document.createElement('div');
            errorElement.className = 'form-validation-error';
            formGroup.appendChild(errorElement);
        }

        let isValid = true;
        let errorMessage = '';

        // 필수 필드 검사
        if (rule.required && !value) {
            isValid = false;
            errorMessage = rule.message;
        }
        // 패턴 검사
        else if (value && rule.pattern && !rule.pattern.test(value)) {
            isValid = false;
            errorMessage = rule.message;
        }
        // 길이 검사
        else if (value && rule.minLength && value.length < rule.minLength) {
            isValid = false;
            errorMessage = rule.message;
        }
        else if (value && rule.maxLength && value.length > rule.maxLength) {
            isValid = false;
            errorMessage = rule.message;
        }

        // UI 업데이트
        if (formGroup) {
            formGroup.classList.remove('error', 'success');
            if (errorElement) {
                if (isValid && value) {
                    formGroup.classList.add('success');
                    errorElement.classList.remove('show');
                } else if (!isValid) {
                    formGroup.classList.add('error');
                    errorElement.textContent = errorMessage;
                    errorElement.classList.add('show');
                } else {
                    errorElement.classList.remove('show');
                }
            }
        }

        return isValid;
    }

    validateForm() {
        const consentChecked = document.getElementById('privacy-consent')?.checked || false;
        const nameValid = this.validateField(document.getElementById('user-name'));
        const phoneValid = this.validateField(document.getElementById('user-phone'));
        const genderValid = document.querySelector('input[name="gender"]:checked') !== null;
        const ageGroupValid = document.querySelector('input[name="age_group"]:checked') !== null;

        this.isValid = consentChecked && nameValid && phoneValid && genderValid && ageGroupValid;

        // 다음 버튼 활성화/비활성화
        const nextBtn = document.getElementById('personal-info-next');
        if (nextBtn) {
            nextBtn.disabled = !this.isValid;
        }

        return this.isValid;
    }

    formatPhoneNumber(input) {
        let value = input.value.replace(/\D/g, ''); // 숫자만 남기기
        
        if (value.length >= 3) {
            if (value.length >= 7) {
                value = value.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
            } else {
                value = value.replace(/(\d{3})(\d{4})/, '$1-$2');
            }
        }
        
        input.value = value;
    }

    collectFormData() {
        this.formData = {
            name: document.getElementById('user-name')?.value.trim() || '',
            phone: document.getElementById('user-phone')?.value.trim() || '',
            gender: document.querySelector('input[name="gender"]:checked')?.value || '',
            age_group: document.querySelector('input[name="age_group"]:checked')?.value || ''
        };

        return this.formData;
    }

    async submitPersonalInfo() {
        try {
            // 폼 검증
            if (!this.validateForm()) {
                alert('모든 필수 정보를 올바르게 입력해주세요.');
                return;
            }

            // 로딩 상태
            const nextBtn = document.getElementById('personal-info-next');
            if (nextBtn) {
                nextBtn.classList.add('loading');
                nextBtn.disabled = true;
            }

            // 이전 사용자 데이터 완전 삭제
            this.clearPreviousUserData();

            // 폼 데이터 수집
            this.collectFormData();

            // Supabase에 저장
            const result = await saveUserProfile(this.formData);

            if (result.success) {
                // 사용자 ID 저장
                this.userId = result.userId;
                localStorage.setItem('currentUserId', this.userId);
                localStorage.setItem('userInfo', JSON.stringify(this.formData));

                // Analytics 이벤트
                if (window.analyticsManager) {
                    window.analyticsManager.trackCustomEvent('personal_info_submitted', {
                        age_group: this.formData.age_group,
                        gender: this.formData.gender
                    });
                }

                console.log('[PersonalInfo] 개인정보 저장 완료:', this.userId);

                // 1단계로 이동
                this.goToStep1();

            } else {
                throw new Error(result.error || '저장 실패');
            }

        } catch (error) {
            console.error('[PersonalInfo] 저장 실패:', error);
            alert('정보 저장 중 오류가 발생했습니다. 다시 시도해주세요.');
            
            // 로딩 상태 해제
            const nextBtn = document.getElementById('personal-info-next');
            if (nextBtn) {
                nextBtn.classList.remove('loading');
                nextBtn.disabled = false;
            }
        }
    }

    goToStep1() {
        // 1단계로 이동
        if (window.CareerApp && window.CareerApp.assessmentManager) {
            window.CareerApp.assessmentManager.showSection('step1');
            window.CareerApp.assessmentManager.loadStep(1);
        } else if (window.app && window.app.assessmentManager) {
            window.app.assessmentManager.showSection('step1');
            window.app.assessmentManager.loadStep(1);
        }
    }

    goBack() {
        // 랜딩 페이지로 이동
        if (window.CareerApp && window.CareerApp.assessmentManager) {
            window.CareerApp.assessmentManager.showSection('landing');
        } else if (window.app && window.app.assessmentManager) {
            window.app.assessmentManager.showSection('landing');
        }
    }

    // 저장된 개인정보 조회
    getSavedUserInfo() {
        const saved = localStorage.getItem('userInfo');
        if (saved) {
            return JSON.parse(saved);
        }
        return null;
    }

    // 현재 사용자 ID 조회
    getCurrentUserId() {
        return localStorage.getItem('currentUserId') || this.userId;
    }

    // 폼 상태 초기화
    resetFormState() {
        console.log('[PersonalInfo] 폼 상태 초기화');
        
        // 로딩 상태 제거
        const nextBtn = document.getElementById('personal-info-next');
        if (nextBtn) {
            nextBtn.classList.remove('loading');
            nextBtn.disabled = true; // 초기에는 비활성화
            nextBtn.textContent = '진단 시작하기 →';
        }
        
        // 폼 필드 초기화 (기존에 저장된 정보가 있다면 유지하지 않음)
        const nameInput = document.getElementById('user-name');
        const phoneInput = document.getElementById('user-phone');
        const consentCheckbox = document.getElementById('privacy-consent');
        
        if (nameInput) nameInput.value = '';
        if (phoneInput) phoneInput.value = '';
        if (consentCheckbox) consentCheckbox.checked = false;
        
        // 체크박스 초기화
        const genderCheckboxes = document.querySelectorAll('input[name="gender"]');
        const ageCheckboxes = document.querySelectorAll('input[name="age_group"]');
        
        genderCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
            const customBox = checkbox.nextElementSibling;
            const label = checkbox.closest('.checkbox-option');
            
            if (customBox && customBox.classList.contains('checkbox-custom')) {
                customBox.style.backgroundColor = '';
                customBox.style.borderColor = '#d1d5db';
                customBox.innerHTML = '';
            }
            if (label) {
                label.style.borderColor = '#e5e7eb';
                label.style.color = '';
            }
        });
        
        ageCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
            const customBox = checkbox.nextElementSibling;
            const label = checkbox.closest('.checkbox-option');
            
            if (customBox && customBox.classList.contains('checkbox-custom')) {
                customBox.style.backgroundColor = '';
                customBox.style.borderColor = '#d1d5db';
                customBox.innerHTML = '';
            }
            if (label) {
                label.style.borderColor = '#e5e7eb';
                label.style.color = '';
            }
        });
        
        // 에러 메시지 제거
        const errorElements = document.querySelectorAll('.form-validation-error');
        errorElements.forEach(error => {
            error.classList.remove('show');
        });
        
        // 폼 그룹 상태 초기화
        const formGroups = document.querySelectorAll('#personal-info .form-group');
        formGroups.forEach(group => {
            group.classList.remove('error', 'success');
        });
        
        // 내부 상태 초기화
        this.formData = {};
        this.isValid = false;
    }

    // 이전 사용자 데이터 완전 삭제
    clearPreviousUserData() {
        console.log('[PersonalInfo] 이전 사용자 데이터 삭제 시작');
        
        // localStorage에서 이전 사용자 관련 데이터 모두 삭제
        const keysToRemove = [
            'currentUserId',
            'userInfo',
            'assessmentData',
            'assessmentResults',
            'step1Data',
            'step2Data', 
            'step3Data',
            'currentStep',
            'riasecScores',
            'jobRecommendations',
            'personalityAnalysis'
        ];
        
        keysToRemove.forEach(key => {
            if (localStorage.getItem(key)) {
                console.log(`[PersonalInfo] 삭제: ${key}`);
                localStorage.removeItem(key);
            }
        });
        
        // 클래스 내부 상태도 초기화
        this.userId = null;
        this.formData = {};
        this.isValid = false;
        
        // 다른 관리자들도 초기화
        if (window.CareerApp?.assessmentManager) {
            console.log('[PersonalInfo] AssessmentManager 초기화');
            window.CareerApp.assessmentManager.currentStep = 0;
            window.CareerApp.assessmentManager.responses = {};
        } else if (window.app?.assessmentManager) {
            console.log('[PersonalInfo] AssessmentManager 초기화');
            window.app.assessmentManager.currentStep = 0;
            window.app.assessmentManager.responses = {};
        }
        
        console.log('[PersonalInfo] 이전 사용자 데이터 삭제 완료');
    }
}

// 전역 인스턴스 생성
window.personalInfoManager = new PersonalInfoManager();

// 전역 함수로 등록
window.getPersonalInfo = () => {
    return window.personalInfoManager.getSavedUserInfo();
};

window.getCurrentUserId = () => {
    return window.personalInfoManager.getCurrentUserId();
};

console.log('[PersonalInfo] PersonalInfoManager 초기화 완료');