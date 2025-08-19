/**
 * Checkbox Handler - 단일 선택 체크박스 관리
 * 성별과 연령대는 하나만 선택 가능하도록 처리
 */

// 단일 선택 체크박스 처리
function handleSingleCheckbox(checkboxName) {
    const checkboxes = document.querySelectorAll(`input[name="${checkboxName}"]`);
    console.log(`[CheckboxHandler] ${checkboxName} 체크박스 개수:`, checkboxes.length);
    
    checkboxes.forEach((checkbox, index) => {
        console.log(`[CheckboxHandler] 체크박스 ${index + 1}:`, checkbox.value);
        checkbox.addEventListener('change', function() {
            console.log(`[CheckboxHandler] ${checkboxName} 체크박스 변경:`, this.value, this.checked);
            
            // 모든 체크박스의 스타일 초기화
            checkboxes.forEach(otherCheckbox => {
                const customBox = otherCheckbox.nextElementSibling;
                const label = otherCheckbox.closest('.checkbox-option');
                
                if (otherCheckbox !== this) {
                    otherCheckbox.checked = false;
                    if (customBox && customBox.classList.contains('checkbox-custom')) {
                        customBox.style.backgroundColor = '';
                        customBox.style.borderColor = '#d1d5db';
                        customBox.innerHTML = '';
                    }
                    if (label) {
                        label.style.borderColor = '#e5e7eb';
                        label.style.color = '';
                    }
                }
            });
            
            // 선택된 체크박스 스타일 적용
            if (this.checked) {
                const customBox = this.nextElementSibling;
                const label = this.closest('.checkbox-option');
                
                if (customBox && customBox.classList.contains('checkbox-custom')) {
                    customBox.style.backgroundColor = '#3b82f6';
                    customBox.style.borderColor = '#3b82f6';
                    customBox.innerHTML = '<span style="color: white; font-weight: bold; font-size: 14px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">✓</span>';
                }
                if (label) {
                    label.style.borderColor = '#3b82f6';
                    label.style.color = '#3b82f6';
                }
            }
        });
        
        // 초기 로드 시 클릭 이벤트도 추가
        const label = checkbox.closest('.checkbox-option');
        if (label) {
            label.addEventListener('click', function(e) {
                // label 클릭시 체크박스 토글
                if (e.target !== checkbox) {
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change'));
                }
            });
        }
    });
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('[CheckboxHandler] DOM이 로드됨, 체크박스 초기화 시작');
    
    // 성별 단일 선택 처리
    handleSingleCheckbox('gender');
    
    // 연령대 단일 선택 처리
    handleSingleCheckbox('age_group');
});

// 또는 즉시 실행 (이미 DOM이 로드된 경우를 대비)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCheckboxes);
} else {
    initCheckboxes();
}

function initCheckboxes() {
    console.log('[CheckboxHandler] 체크박스 초기화 실행');
    handleSingleCheckbox('gender');
    handleSingleCheckbox('age_group');
}

console.log('[CheckboxHandler] 단일 선택 체크박스 핸들러 로드 완료');