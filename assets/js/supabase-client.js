/**
 * Supabase Client - 데이터베이스 연동
 * 개인정보 수집 및 진단 결과 저장
 */

// Supabase 설정
const SUPABASE_URL = 'https://xvchfclpzxvuvtjmeuwp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2Y2hmY2xwenh2dXZ0am1ldXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NzQxMTAsImV4cCI6MjA3MTE1MDExMH0.ZunyePxPTmf2vNCjQrqvjEoiXAVJKKx-nRqrsRBRxNA';

// Supabase 클라이언트 초기화
let supabaseClient = null;

/**
 * Supabase 클라이언트 초기화
 */
function initializeSupabase() {
    try {
        // CDN에서 로드된 Supabase 라이브러리 확인
        if (typeof supabase !== 'undefined') {
            supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('[Supabase] 클라이언트 초기화 완료');
            return true;
        } else {
            console.error('[Supabase] 라이브러리가 로드되지 않음');
            return false;
        }
    } catch (error) {
        console.error('[Supabase] 초기화 실패:', error);
        return false;
    }
}

/**
 * 사용자 기본정보 저장
 * @param {Object} userInfo - 사용자 정보
 * @param {string} userInfo.name - 이름
 * @param {string} userInfo.gender - 성별
 * @param {string} userInfo.phone - 휴대폰번호
 * @param {string} userInfo.age_group - 연령대
 * @returns {Object} 저장 결과 및 사용자 ID
 */
async function saveUserProfile(userInfo) {
    try {
        if (!supabaseClient) {
            throw new Error('Supabase 클라이언트가 초기화되지 않음');
        }

        const { data, error } = await supabaseClient
            .from('user_profiles')
            .insert([
                {
                    name: userInfo.name,
                    gender: userInfo.gender,
                    phone: userInfo.phone,
                    age_group: userInfo.age_group,
                    privacy_consent: true
                }
            ])
            .select();

        if (error) {
            throw error;
        }

        console.log('[Supabase] 사용자 정보 저장 완료:', data[0].id);
        return {
            success: true,
            userId: data[0].id,
            data: data[0]
        };

    } catch (error) {
        console.error('[Supabase] 사용자 정보 저장 실패:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 진단 결과 저장
 * @param {string} userId - 사용자 ID
 * @param {Object} assessmentData - 진단 데이터
 * @returns {Object} 저장 결과
 */
async function saveAssessmentResult(userId, assessmentData) {
    try {
        if (!supabaseClient) {
            throw new Error('Supabase 클라이언트가 초기화되지 않음');
        }

        const { data, error } = await supabaseClient
            .from('assessments')
            .insert([
                {
                    user_id: userId,
                    step1_responses: assessmentData.step1,
                    step2_responses: assessmentData.step2,
                    step3_responses: assessmentData.step3,
                    recommended_jobs: assessmentData.recommendedJobs,
                    riasec_scores: assessmentData.riasecScores,
                    action_plan: assessmentData.actionPlan,
                    is_completed: true,
                    completed_at: new Date().toISOString()
                }
            ])
            .select();

        if (error) {
            throw error;
        }

        console.log('[Supabase] 진단 결과 저장 완료:', data[0].id);
        return {
            success: true,
            assessmentId: data[0].id,
            data: data[0]
        };

    } catch (error) {
        console.error('[Supabase] 진단 결과 저장 실패:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 진단 통계 조회 (관리자용)
 */
async function getAssessmentStats() {
    try {
        if (!supabaseClient) {
            throw new Error('Supabase 클라이언트가 초기화되지 않음');
        }

        // 총 진단 완료 수
        const { count: totalCount, error: totalError } = await supabaseClient
            .from('assessments')
            .select('*', { count: 'exact', head: true })
            .eq('is_completed', true);

        if (totalError) throw totalError;

        // 연령대별 통계
        const { data: ageGroupStats, error: ageError } = await supabaseClient
            .from('user_profiles')
            .select('age_group')
            .order('age_group');

        if (ageError) throw ageError;

        // 성별 통계
        const { data: genderStats, error: genderError } = await supabaseClient
            .from('user_profiles')
            .select('gender')
            .order('gender');

        if (genderError) throw genderError;

        return {
            success: true,
            stats: {
                total: totalCount,
                ageGroups: ageGroupStats,
                genders: genderStats
            }
        };

    } catch (error) {
        console.error('[Supabase] 통계 조회 실패:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// 전역 함수로 등록
window.initializeSupabase = initializeSupabase;
window.saveUserProfile = saveUserProfile;
window.saveAssessmentResult = saveAssessmentResult;
window.getAssessmentStats = getAssessmentStats;

// 전역 변수로 등록
window.supabaseClient = null;

console.log('[Supabase] 클라이언트 스크립트 로드 완료');