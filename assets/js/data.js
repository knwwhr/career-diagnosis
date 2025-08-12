// Assessment Data Structure
// Designed for future backend integration

const ASSESSMENT_DATA = {
    // Step 1: Strengths Discovery Questions
    step1: {
        title: "강점 발견",
        questions: [
            {
                id: "values_priorities",
                type: "ranking",
                question: "일할 때 가장 중요하게 생각하는 가치를 3개 골라 순서대로 선택해주세요",
                options: [
                    { id: "stability", text: "안정성", desc: "평생 직장, 월급 걱정 없는 삶", weight: { R: 2, I: 1, A: 0, S: 1, E: 1, C: 3 } },
                    { id: "growth", text: "성장", desc: "계속 배우고 발전할 수 있는 환경", weight: { R: 1, I: 2, A: 2, S: 1, E: 3, C: 1 } },
                    { id: "creativity", text: "창의성", desc: "새로운 아이디어를 마음껏 펼칠 수 있는 일", weight: { R: 0, I: 1, A: 3, S: 1, E: 2, C: 0 } },
                    { id: "autonomy", text: "자유로움", desc: "내 방식대로 일할 수 있는 자율성", weight: { R: 2, I: 2, A: 2, S: 0, E: 3, C: 1 } },
                    { id: "social_impact", text: "의미있는 일", desc: "사회에 도움이 되고 가치있는 일", weight: { R: 1, I: 1, A: 1, S: 3, E: 1, C: 1 } },
                    { id: "income", text: "높은 수입", desc: "돈을 많이 벌 수 있는 일", weight: { R: 1, I: 1, A: 0, S: 1, E: 3, C: 2 } },
                    { id: "work_life_balance", text: "워라밸", desc: "일과 개인 시간의 적절한 균형", weight: { R: 2, I: 1, A: 1, S: 2, E: 0, C: 2 } }
                ],
                maxSelections: 3
            },
            {
                id: "work_environment",
                type: "scale",
                question: "어떤 업무 환경을 선호하는지 알려주세요 (1: 별로, 5: 정말 좋아요)",
                options: [
                    { id: "indoor_work", text: "실내에서 일하기", scale: [1, 2, 3, 4, 5] },
                    { id: "flexible_schedule", text: "자유로운 근무시간", scale: [1, 2, 3, 4, 5] },
                    { id: "team_collaboration", text: "팀원들과 함께 일하기", scale: [1, 2, 3, 4, 5] },
                    { id: "creative_tasks", text: "창의적인 업무", scale: [1, 2, 3, 4, 5] },
                    { id: "challenging_work", text: "어렵고 도전적인 업무", scale: [1, 2, 3, 4, 5] }
                ]
            },
            {
                id: "personality_riasec",
                type: "multiple_choice",
                question: "이런 일들 중에서 어떤 게 가장 재미있을 것 같나요?",
                options: [
                    { id: "hands_on", text: "손으로 뭔가를 만들거나 기계를 다루는 일", riasec: "R", weight: 3 },
                    { id: "research", text: "어려운 문제를 파헤쳐서 해답을 찾는 일", riasec: "I", weight: 3 },
                    { id: "creative", text: "새로운 아이디어로 창의적인 작품을 만드는 일", riasec: "A", weight: 3 },
                    { id: "helping", text: "사람들을 도와주고 함께 소통하는 일", riasec: "S", weight: 3 },
                    { id: "leadership", text: "앞장서서 팀을 이끌고 사업을 추진하는 일", riasec: "E", weight: 3 },
                    { id: "organizing", text: "복잡한 일들을 체계적으로 정리하고 관리하는 일", riasec: "C", weight: 3 }
                ]
            },
            {
                id: "strengths_experience",
                type: "multiple_select",
                question: "지금까지 살면서 '이것만큼은 꽤 잘하는 것 같다'고 느낀 것들을 골라보세요 (여러 개 선택 가능)",
                options: [
                    { id: "problem_solving", text: "문제가 생겼을 때 해결책 찾기", category: "thinking" },
                    { id: "communication", text: "다른 사람과 대화하고 소통하기", category: "social" },
                    { id: "leadership", text: "그룹에서 리더 역할 하기", category: "social" },
                    { id: "creativity", text: "새로운 아이디어 떠올리기", category: "thinking" },
                    { id: "analysis", text: "복잡한 정보를 정리하고 분석하기", category: "thinking" },
                    { id: "teamwork", text: "팀원들과 협력해서 일하기", category: "social" },
                    { id: "planning", text: "계획을 세우고 체계적으로 준비하기", category: "organizing" },
                    { id: "presentation", text: "앞에서 발표하고 설명하기", category: "social" },
                    { id: "technical", text: "컴퓨터나 기술 관련된 것들", category: "technical" },
                    { id: "learning", text: "새로운 것을 빨리 배우기", category: "thinking" }
                ]
            }
        ]
    },

    // Step 2: Job Matching Questions  
    step2: {
        title: "직무 매칭",
        questions: [
            {
                id: "industry_interest",
                type: "multiple_select",
                question: "어떤 분야에서 일해보고 싶나요? 3개까지 골라주세요",
                options: [
                    { id: "it", text: "IT/테크", category: "technology" },
                    { id: "finance", text: "금융/투자", category: "business" },
                    { id: "marketing", text: "마케팅/광고", category: "creative" },
                    { id: "education", text: "교육", category: "service" },
                    { id: "healthcare", text: "의료/건강", category: "service" },
                    { id: "manufacturing", text: "제조업", category: "production" },
                    { id: "retail", text: "유통/쇼핑", category: "business" },
                    { id: "media", text: "미디어/콘텐츠", category: "creative" },
                    { id: "consulting", text: "컨설팅", category: "business" },
                    { id: "startup", text: "스타트업", category: "technology" }
                ],
                maxSelections: 3
            },
            {
                id: "job_understanding",
                type: "scale",
                question: "이런 직업들에 대해 얼마나 알고 있나요? (1: 잘 모르겠어요, 5: 잘 알고 있어요)",
                options: [
                    { id: "software_dev", text: "개발자", scale: [1, 2, 3, 4, 5] },
                    { id: "data_analyst", text: "데이터 분석가", scale: [1, 2, 3, 4, 5] },
                    { id: "marketing_manager", text: "마케터", scale: [1, 2, 3, 4, 5] },
                    { id: "product_manager", text: "기획자", scale: [1, 2, 3, 4, 5] },
                    { id: "consultant", text: "컨설턴트", scale: [1, 2, 3, 4, 5] },
                    { id: "designer", text: "디자이너", scale: [1, 2, 3, 4, 5] }
                ]
            },
            {
                id: "skill_confidence",
                type: "scale", 
                question: "이런 스킬들에 대해 얼마나 자신 있나요? (1: 전혀 자신없어요, 5: 자신있어요)",
                options: [
                    { id: "coding", text: "코딩/프로그래밍", scale: [1, 2, 3, 4, 5] },
                    { id: "data_analysis", text: "데이터 분석", scale: [1, 2, 3, 4, 5] },
                    { id: "design", text: "디자인", scale: [1, 2, 3, 4, 5] },
                    { id: "writing", text: "글쓰기", scale: [1, 2, 3, 4, 5] },
                    { id: "presentation", text: "발표하기", scale: [1, 2, 3, 4, 5] },
                    { id: "project_mgmt", text: "프로젝트 관리", scale: [1, 2, 3, 4, 5] }
                ]
            }
        ]
    },

    // Step 3: Action Plan Questions
    step3: {
        title: "실행 계획",
        questions: [
            {
                id: "career_timeline",
                type: "multiple_choice",
                question: "언제쯤 첫 직장에 들어가고 싶나요?",
                options: [
                    { id: "3months", text: "빨리 해야 해요 (3개월 안)", urgency: "high" },
                    { id: "6months", text: "6개월 정도", urgency: "medium" },
                    { id: "1year", text: "1년 정도", urgency: "low" },
                    { id: "flexible", text: "여유롭게 준비하고 싶어요", urgency: "flexible" }
                ]
            },
            {
                id: "preparation_status",
                type: "multiple_select",
                question: "지금 취업을 위해 준비된 것들이 있다면 골라주세요 (여러 개 선택 가능)",
                options: [
                    { id: "resume", text: "이력서가 준비되어 있어요", category: "documents" },
                    { id: "portfolio", text: "포트폴리오가 있어요", category: "documents" },
                    { id: "certification", text: "자격증을 가지고 있어요", category: "skills" },
                    { id: "internship", text: "인턴 경험이 있어요", category: "experience" },
                    { id: "projects", text: "프로젝트를 해본 적이 있어요", category: "experience" },
                    { id: "networking", text: "업계 사람들과 아는 사이예요", category: "network" },
                    { id: "interview_prep", text: "면접 연습을 해봤어요", category: "preparation" },
                    { id: "none", text: "아직 아무것도 준비 안 됐어요", category: "none" }
                ]
            },
            {
                id: "learning_preference",
                type: "multiple_choice",
                question: "새로운 걸 배울 때 어떤 방법이 가장 좋나요?",
                options: [
                    { id: "online_course", text: "유튜브나 온라인 강의로 배우기", method: "self_study" },
                    { id: "bootcamp", text: "부트캠프나 학원에서 체계적으로 배우기", method: "structured" },
                    { id: "mentoring", text: "선생님이나 멘토에게 직접 배우기", method: "personal" },
                    { id: "self_study", text: "책이나 자료로 혼자 공부하기", method: "self_study" },
                    { id: "project_based", text: "직접 만들어보면서 배우기", method: "practical" }
                ]
            }
        ]
    }
};

// Job Database - Expanded to 50+ careers
const JOB_DATABASE = {
    // IT/개발 분야 (12개)
    "software_developer": {
        title: "소프트웨어 개발자",
        category: "IT/개발",
        required_skills: ["coding", "problem_solving", "technical"],
        riasec_match: ["I", "R"],
        industry: ["it", "startup"],
        description: "웹, 모바일, 시스템 소프트웨어를 설계하고 개발하는 일을 해요",
        growth_outlook: "매우 높음",
        avg_salary: "3500-6000만원",
        work_environment: {
            indoor_work: 5,
            flexible_schedule: 4,
            team_collaboration: 4,
            creative_tasks: 4,
            challenging_work: 5
        }
    },
    "frontend_developer": {
        title: "프론트엔드 개발자",
        category: "IT/개발",
        required_skills: ["coding", "design", "creativity"],
        riasec_match: ["A", "I"],
        industry: ["it", "startup", "media"],
        description: "사용자가 직접 보고 사용하는 웹사이트 화면을 만들어요",
        growth_outlook: "높음",
        avg_salary: "3200-5500만원",
        work_environment: {
            indoor_work: 5,
            flexible_schedule: 5,
            team_collaboration: 4,
            creative_tasks: 5,
            challenging_work: 4
        }
    },
    "backend_developer": {
        title: "백엔드 개발자", 
        category: "IT/개발",
        required_skills: ["coding", "analysis", "technical"],
        riasec_match: ["I", "R"],
        industry: ["it", "startup", "finance"],
        description: "사용자 눈에 보이지 않는 서버와 데이터베이스 시스템을 만들어요",
        growth_outlook: "매우 높음",
        avg_salary: "3800-6500만원",
        work_environment: {
            indoor_work: 5,
            flexible_schedule: 4,
            team_collaboration: 3,
            creative_tasks: 3,
            challenging_work: 5
        }
    },
    "mobile_developer": {
        title: "모바일 앱 개발자",
        category: "IT/개발", 
        required_skills: ["coding", "design", "technical"],
        riasec_match: ["I", "A"],
        industry: ["it", "startup", "media"],
        description: "스마트폰에서 사용하는 앱을 만들고 관리해요",
        growth_outlook: "높음",
        avg_salary: "3500-6000만원",
        work_environment: {
            indoor_work: 5,
            flexible_schedule: 4,
            team_collaboration: 4,
            creative_tasks: 4,
            challenging_work: 4
        }
    },
    "data_scientist": {
        title: "데이터 사이언티스트",
        category: "IT/분석",
        required_skills: ["analysis", "data_analysis", "coding"],
        riasec_match: ["I", "R"],
        industry: ["it", "finance", "consulting"],
        description: "빅데이터와 AI 기술로 비즈니스 문제를 해결해요",
        growth_outlook: "매우 높음",
        avg_salary: "5000-9000만원",
        work_environment: {
            indoor_work: 5,
            flexible_schedule: 4,
            team_collaboration: 3,
            creative_tasks: 4,
            challenging_work: 5
        }
    },
    "data_analyst": {
        title: "데이터 분석가", 
        category: "IT/분석",
        required_skills: ["analysis", "data_analysis", "problem_solving"],
        riasec_match: ["I", "C"],
        industry: ["it", "finance", "consulting"],
        description: "데이터를 수집하고 분석해서 의미 있는 인사이트를 찾아내요",
        growth_outlook: "매우 높음",
        avg_salary: "4000-7000만원",
        work_environment: {
            indoor_work: 5,
            flexible_schedule: 3,
            team_collaboration: 3,
            creative_tasks: 3,
            challenging_work: 4
        }
    },
    "ai_engineer": {
        title: "AI 엔지니어",
        category: "IT/개발",
        required_skills: ["coding", "analysis", "technical"],
        riasec_match: ["I", "R"],
        industry: ["it", "startup"],
        description: "인공지능 시스템과 머신러닝 모델을 개발하고 구현해요",
        growth_outlook: "매우 높음",
        avg_salary: "5500-10000만원",
        work_environment: {
            indoor_work: 5,
            flexible_schedule: 4,
            team_collaboration: 3,
            creative_tasks: 4,
            challenging_work: 5
        }
    },
    "devops_engineer": {
        title: "데브옵스 엔지니어",
        category: "IT/인프라",
        required_skills: ["technical", "problem_solving", "analysis"],
        riasec_match: ["I", "R"],
        industry: ["it", "startup"],
        description: "개발과 운영 환경을 연결하고 자동화 시스템을 만들어요",
        growth_outlook: "높음",
        avg_salary: "4500-8000만원",
        work_environment: {
            indoor_work: 5,
            flexible_schedule: 3,
            team_collaboration: 4,
            creative_tasks: 3,
            challenging_work: 5
        }
    },
    "security_specialist": {
        title: "정보보안 전문가",
        category: "IT/보안",
        required_skills: ["technical", "analysis", "problem_solving"],
        riasec_match: ["I", "C"],
        industry: ["it", "finance"],
        description: "해킹과 사이버 공격으로부터 시스템을 보호하는 일을 해요",
        growth_outlook: "매우 높음",
        avg_salary: "4000-8000만원",
        work_environment: {
            indoor_work: 5,
            flexible_schedule: 2,
            team_collaboration: 3,
            creative_tasks: 3,
            challenging_work: 5
        }
    },
    "system_admin": {
        title: "시스템 관리자",
        category: "IT/인프라",
        required_skills: ["technical", "problem_solving", "planning"],
        riasec_match: ["R", "C"],
        industry: ["it", "manufacturing"],
        description: "회사의 컴퓨터 시스템과 네트워크를 관리하고 유지보수해요",
        growth_outlook: "보통",
        avg_salary: "3200-5500만원",
        work_environment: {
            indoor_work: 5,
            flexible_schedule: 2,
            team_collaboration: 3,
            creative_tasks: 2,
            challenging_work: 4
        }
    },
    "blockchain_developer": {
        title: "블록체인 개발자",
        category: "IT/개발",
        required_skills: ["coding", "technical", "analysis"],
        riasec_match: ["I", "R"],
        industry: ["it", "startup", "finance"],
        description: "암호화폐와 블록체인 기술을 사용한 시스템을 개발해요",
        growth_outlook: "높음",
        avg_salary: "4500-8500만원",
        work_environment: {
            indoor_work: 5,
            flexible_schedule: 4,
            team_collaboration: 3,
            creative_tasks: 4,
            challenging_work: 5
        }
    },
    "quality_assurance": {
        title: "QA 엔지니어",
        category: "IT/품질관리",
        required_skills: ["analysis", "technical", "problem_solving"],
        riasec_match: ["C", "I"],
        industry: ["it", "manufacturing"],
        description: "소프트웨어의 버그를 찾아내고 품질을 검증하는 일을 해요",
        growth_outlook: "높음",
        avg_salary: "3200-5800만원",
        work_environment: {
            indoor_work: 5,
            flexible_schedule: 3,
            team_collaboration: 3,
            creative_tasks: 2,
            challenging_work: 4
        }
    },
    // 비즈니스/마케팅 분야 (10개)
    "marketing_manager": {
        title: "마케팅 매니저",
        category: "마케팅/기획", 
        required_skills: ["communication", "creativity", "planning"],
        riasec_match: ["E", "A"],
        industry: ["marketing", "startup", "retail"],
        description: "브랜드와 제품을 알리기 위한 마케팅 전략을 세우고 실행해요",
        growth_outlook: "높음",
        avg_salary: "3000-5500만원",
        work_environment: {
            indoor_work: 4,
            flexible_schedule: 4,
            team_collaboration: 5,
            creative_tasks: 5,
            challenging_work: 4
        }
    },
    "digital_marketer": {
        title: "디지털 마케터",
        category: "마케팅/광고",
        required_skills: ["creativity", "communication", "data_analysis"],
        riasec_match: ["E", "A"],
        industry: ["marketing", "startup", "media"],
        description: "SNS, 검색광고, 이메일 등 온라인 채널로 고객을 유치해요",
        growth_outlook: "높음",
        avg_salary: "3200-5500만원",
        work_environment: {
            indoor_work: 5,
            flexible_schedule: 4,
            team_collaboration: 4,
            creative_tasks: 5,
            challenging_work: 4
        }
    },
    "performance_marketer": {
        title: "퍼포먼스 마케터",
        category: "마케팅/분석",
        required_skills: ["data_analysis", "creativity", "planning"],
        riasec_match: ["E", "I"],
        industry: ["marketing", "startup", "retail"],
        description: "광고 성과를 데이터로 분석하고 최적화하는 일을 해요",
        growth_outlook: "매우 높음",
        avg_salary: "3500-6500만원",
        work_environment: {
            indoor_work: 5,
            flexible_schedule: 4,
            team_collaboration: 3,
            creative_tasks: 4,
            challenging_work: 4
        }
    },
    "brand_manager": {
        title: "브랜드 매니저",
        category: "마케팅/기획",
        required_skills: ["creativity", "communication", "planning"],
        riasec_match: ["A", "E"],
        industry: ["marketing", "retail", "media"],
        description: "브랜드의 정체성을 만들고 일관된 브랜드 경험을 관리해요",
        growth_outlook: "보통",
        avg_salary: "3800-6200만원",
        work_environment: {
            indoor_work: 4,
            flexible_schedule: 4,
            team_collaboration: 5,
            creative_tasks: 5,
            challenging_work: 4
        }
    },
    "business_analyst": {
        title: "비즈니스 분석가",
        category: "기획/전략",
        required_skills: ["analysis", "communication", "planning"],
        riasec_match: ["I", "E"],
        industry: ["it", "consulting", "finance"],
        description: "회사의 업무 과정을 분석하고 개선 방안을 찾아내요",
        growth_outlook: "높음",
        avg_salary: "3800-6500만원",
        work_environment: {
            indoor_work: 4,
            flexible_schedule: 3,
            team_collaboration: 4,
            creative_tasks: 3,
            challenging_work: 4
        }
    },
    "sales_manager": {
        title: "세일즈 매니저",
        category: "영업/판매",
        required_skills: ["communication", "leadership", "presentation"],
        riasec_match: ["E", "S"],
        industry: ["retail", "manufacturing", "finance"],
        description: "고객에게 제품을 판매하고 영업팀을 이끌어가요",
        growth_outlook: "보통",
        avg_salary: "3500-6500만원",
        work_environment: {
            indoor_work: 3,
            flexible_schedule: 3,
            team_collaboration: 5,
            creative_tasks: 3,
            challenging_work: 4
        }
    },
    "account_manager": {
        title: "어카운트 매니저",
        category: "영업/관계관리",
        required_skills: ["communication", "planning", "teamwork"],
        riasec_match: ["S", "E"],
        industry: ["marketing", "consulting", "startup"],
        description: "기존 고객과의 관계를 유지하고 더 많은 비즈니스를 창출해요",
        growth_outlook: "높음",
        avg_salary: "3200-5800만원",
        work_environment: {
            indoor_work: 4,
            flexible_schedule: 3,
            team_collaboration: 5,
            creative_tasks: 3,
            challenging_work: 4
        }
    },
    "business_development": {
        title: "사업 개발자",
        category: "기획/사업",
        required_skills: ["communication", "analysis", "leadership"],
        riasec_match: ["E", "I"],
        industry: ["startup", "consulting", "it"],
        description: "새로운 사업 기회를 찾아내고 파트너십을 만들어요",
        growth_outlook: "높음",
        avg_salary: "4000-7500만원",
        work_environment: {
            indoor_work: 3,
            flexible_schedule: 4,
            team_collaboration: 5,
            creative_tasks: 4,
            challenging_work: 5
        }
    },
    "growth_hacker": {
        title: "그로스 해커",
        category: "마케팅/분석",
        required_skills: ["data_analysis", "creativity", "technical"],
        riasec_match: ["I", "E"],
        industry: ["startup", "it", "marketing"],
        description: "데이터 분석과 실험을 통해 사업 성장을 가속화해요",
        growth_outlook: "매우 높음",
        avg_salary: "4200-7800만원",
        work_environment: {
            indoor_work: 5,
            flexible_schedule: 5,
            team_collaboration: 3,
            creative_tasks: 5,
            challenging_work: 5
        }
    },
    "cro_specialist": {
        title: "CRO 전문가",
        category: "마케팅/최적화",
        required_skills: ["data_analysis", "creativity", "technical"],
        riasec_match: ["I", "A"],
        industry: ["marketing", "startup", "retail"],
        description: "웹사이트의 전환율을 높이기 위한 최적화 작업을 해요",
        growth_outlook: "높음",
        avg_salary: "3800-6500만원",
        work_environment: {
            indoor_work: 5,
            flexible_schedule: 4,
            team_collaboration: 3,
            creative_tasks: 4,
            challenging_work: 4
        }
    },
    // 기획/제품 관리 분야 (5개)
    "product_manager": {
        title: "프로덕트 매니저",
        category: "기획/제품",
        required_skills: ["planning", "communication", "analysis"],
        riasec_match: ["E", "I"],
        industry: ["it", "startup", "manufacturing"],
        description: "사용자가 원하는 제품을 기획하고 개발팀과 함께 만들어가요",
        growth_outlook: "높음", 
        avg_salary: "4000-7000만원",
        work_environment: {
            indoor_work: 4,
            flexible_schedule: 4,
            team_collaboration: 5,
            creative_tasks: 4,
            challenging_work: 5
        }
    },
    "product_owner": {
        title: "프로덕트 오너",
        category: "기획/제품",
        required_skills: ["communication", "planning", "analysis"],
        riasec_match: ["E", "I"],
        industry: ["it", "startup"],
        description: "사용자의 요구사항을 정리하고 개발 우선순위를 정해요",
        growth_outlook: "높음",
        avg_salary: "3800-6500만원",
        work_environment: {
            indoor_work: 5,
            flexible_schedule: 4,
            team_collaboration: 5,
            creative_tasks: 3,
            challenging_work: 4
        }
    },
    "project_manager": {
        title: "프로젝트 매니저",
        category: "기획/관리",
        required_skills: ["planning", "communication", "leadership"],
        riasec_match: ["C", "E"],
        industry: ["it", "consulting", "manufacturing"],
        description: "프로젝트 일정과 예산을 관리하고 팀을 조율해요",
        growth_outlook: "높음",
        avg_salary: "3300-5500만원",
        work_environment: {
            indoor_work: 4,
            flexible_schedule: 3,
            team_collaboration: 5,
            creative_tasks: 3,
            challenging_work: 4
        }
    },
    "scrum_master": {
        title: "스크럼 마스터",
        category: "기획/애자일",
        required_skills: ["communication", "leadership", "teamwork"],
        riasec_match: ["S", "E"],
        industry: ["it", "startup"],
        description: "개발팀이 효율적으로 협업할 수 있도록 프로세스를 도와줘요",
        growth_outlook: "높음",
        avg_salary: "3500-6000만원",
        work_environment: {
            indoor_work: 5,
            flexible_schedule: 4,
            team_collaboration: 5,
            creative_tasks: 3,
            challenging_work: 4
        }
    },
    "service_planner": {
        title: "서비스 기획자",
        category: "기획/서비스",
        required_skills: ["creativity", "analysis", "communication"],
        riasec_match: ["A", "I"],
        industry: ["it", "startup", "media"],
        description: "새로운 서비스를 기획하고 사용자 경험을 설계해요",
        growth_outlook: "높음",
        avg_salary: "3500-6200만원",
        work_environment: {
            indoor_work: 5,
            flexible_schedule: 4,
            team_collaboration: 4,
            creative_tasks: 5,
            challenging_work: 4
        }
    },
    // 디자인/크리에이티브 분야 (8개)
    "ux_designer": {
        title: "UX/UI 디자이너",
        category: "디자인/UX",
        required_skills: ["design", "creativity", "analysis"],
        riasec_match: ["A", "I"],
        industry: ["it", "startup", "media"],
        description: "사용자가 쓰기 편한 앱과 웹사이트 화면을 디자인해요",
        growth_outlook: "높음",
        avg_salary: "3500-6000만원",
        work_environment: {
            indoor_work: 5,
            flexible_schedule: 5,
            team_collaboration: 4,
            creative_tasks: 5,
            challenging_work: 4
        }
    },
    "graphic_designer": {
        title: "그래픽 디자이너",
        category: "디자인/시각",
        required_skills: ["design", "creativity"],
        riasec_match: ["A", "R"],
        industry: ["media", "marketing", "startup"],
        description: "포스터, 로고, 브랜드 이미지 등 시각적인 디자인을 만들어요",
        growth_outlook: "보통",
        avg_salary: "2800-4800만원",
        work_environment: {
            indoor_work: 5,
            flexible_schedule: 4,
            team_collaboration: 3,
            creative_tasks: 5,
            challenging_work: 3
        }
    },
    "web_designer": {
        title: "웹 디자이너",
        category: "디자인/웹",
        required_skills: ["design", "technical", "creativity"],
        riasec_match: ["A", "R"],
        industry: ["it", "startup", "media"],
        description: "웹사이트의 레이아웃과 디자인을 기획하고 구현해요",
        growth_outlook: "높음",
        avg_salary: "3000-5200만원",
        work_environment: {
            indoor_work: 5,
            flexible_schedule: 4,
            team_collaboration: 3,
            creative_tasks: 5,
            challenging_work: 3
        }
    },
    "brand_designer": {
        title: "브랜드 디자이너",
        category: "디자인/브랜드",
        required_skills: ["creativity", "design", "communication"],
        riasec_match: ["A", "E"],
        industry: ["marketing", "media", "startup"],
        description: "브랜드의 정체성을 시각적으로 표현하는 디자인을 만들어요",
        growth_outlook: "보통",
        avg_salary: "3200-5500만원",
        work_environment: {
            indoor_work: 4,
            flexible_schedule: 4,
            team_collaboration: 4,
            creative_tasks: 5,
            challenging_work: 4
        }
    },
    "motion_graphics": {
        title: "모션 그래픽 디자이너",
        category: "디자인/영상",
        required_skills: ["creativity", "design", "technical"],
        riasec_match: ["A", "R"],
        industry: ["media", "marketing", "startup"],
        description: "영상과 애니메이션을 사용한 시각적 콘텐츠를 만들어요",
        growth_outlook: "높음",
        avg_salary: "3000-5800만원",
        work_environment: {
            indoor_work: 5,
            flexible_schedule: 4,
            team_collaboration: 3,
            creative_tasks: 5,
            challenging_work: 4
        }
    },
    "game_designer": {
        title: "게임 디자이너",
        category: "디자인/게임",
        required_skills: ["creativity", "design", "planning"],
        riasec_match: ["A", "I"],
        industry: ["media", "startup"],
        description: "게임의 규칙, 스토리, 캐릭터 등을 기획하고 디자인해요",
        growth_outlook: "보통",
        avg_salary: "3200-6000만원",
        work_environment: {
            indoor_work: 5,
            flexible_schedule: 4,
            team_collaboration: 4,
            creative_tasks: 5,
            challenging_work: 4
        }
    },
    "video_editor": {
        title: "영상 편집자",
        category: "미디어/편집",
        required_skills: ["creativity", "technical", "design"],
        riasec_match: ["A", "R"],
        industry: ["media", "marketing"],
        description: "촬영된 영상을 편집하고 후작업으로 완성도를 높여요",
        growth_outlook: "높음",
        avg_salary: "2500-4800만원",
        work_environment: {
            indoor_work: 5,
            flexible_schedule: 4,
            team_collaboration: 3,
            creative_tasks: 5,
            challenging_work: 3
        }
    },
    "photographer": {
        title: "사진작가",
        category: "미디어/사진",
        required_skills: ["creativity", "technical"],
        riasec_match: ["A", "R"],
        industry: ["media", "marketing"],
        description: "상업용 사진 촬영부터 예술적 작품까지 다양한 사진 작업을 해요",
        growth_outlook: "보통",
        avg_salary: "2200-5000만원",
        work_environment: {
            indoor_work: 2,
            flexible_schedule: 5,
            team_collaboration: 3,
            creative_tasks: 5,
            challenging_work: 4
        }
    },
    // 컨설팅/전문직 분야 (6개)
    "consultant": {
        title: "경영 컨설턴트",
        category: "컨설팅/경영",
        required_skills: ["analysis", "communication", "problem_solving"],
        riasec_match: ["E", "I"],
        industry: ["consulting", "finance"],
        description: "기업의 문제점을 분석하고 더 나은 경영 방법을 제안해요",
        growth_outlook: "보통",
        avg_salary: "4500-8000만원",
        work_environment: {
            indoor_work: 4,
            flexible_schedule: 2,
            team_collaboration: 4,
            creative_tasks: 3,
            challenging_work: 5
        }
    },
    "financial_analyst": {
        title: "금융 분석가",
        category: "금융/투자",
        required_skills: ["analysis", "data_analysis", "problem_solving"],
        riasec_match: ["I", "C"],
        industry: ["finance", "consulting"],
        description: "기업의 재무 상태를 분석하고 투자 의견을 제시해요",
        growth_outlook: "높음",
        avg_salary: "4000-7500만원",
        work_environment: {
            indoor_work: 5,
            flexible_schedule: 2,
            team_collaboration: 3,
            creative_tasks: 2,
            challenging_work: 5
        }
    },
    "investment_banker": {
        title: "투자은행가",
        category: "금융/투자",
        required_skills: ["analysis", "communication", "presentation"],
        riasec_match: ["E", "I"],
        industry: ["finance"],
        description: "기업의 자금 조달이나 인수합병을 도와주는 금융 전문가에요",
        growth_outlook: "보통",
        avg_salary: "6000-15000만원",
        work_environment: {
            indoor_work: 5,
            flexible_schedule: 1,
            team_collaboration: 4,
            creative_tasks: 2,
            challenging_work: 5
        }
    },
    "tax_accountant": {
        title: "세무사",
        category: "회계/세무",
        required_skills: ["analysis", "planning", "technical"],
        riasec_match: ["C", "I"],
        industry: ["finance", "consulting"],
        description: "개인이나 기업의 세금 문제를 해결하고 절세 방안을 제안해요",
        growth_outlook: "보통",
        avg_salary: "3500-7000만원",
        work_environment: {
            indoor_work: 5,
            flexible_schedule: 3,
            team_collaboration: 3,
            creative_tasks: 2,
            challenging_work: 4
        }
    },
    "lawyer": {
        title: "변호사",
        category: "법무/법률",
        required_skills: ["analysis", "communication", "writing"],
        riasec_match: ["I", "S"],
        industry: ["consulting"],
        description: "법률 문제를 다루고 고객의 권익을 보호하는 일을 해요",
        growth_outlook: "보통",
        avg_salary: "4000-12000만원",
        work_environment: {
            indoor_work: 4,
            flexible_schedule: 3,
            team_collaboration: 3,
            creative_tasks: 3,
            challenging_work: 5
        }
    },
    "patent_attorney": {
        title: "변리사",
        category: "법무/지식재산",
        required_skills: ["analysis", "technical", "writing"],
        riasec_match: ["I", "C"],
        industry: ["consulting", "it"],
        description: "특허, 상표 등 지식재산권을 보호하고 관리하는 일을 해요",
        growth_outlook: "높음",
        avg_salary: "4500-9000만원",
        work_environment: {
            indoor_work: 5,
            flexible_schedule: 3,
            team_collaboration: 3,
            creative_tasks: 3,
            challenging_work: 4
        }
    },
    // 교육/연구 분야 (4개)
    "teacher": {
        title: "교사/강사",
        category: "교육/강의",
        required_skills: ["communication", "planning", "presentation"],
        riasec_match: ["S", "A"],
        industry: ["education"],
        description: "학생들에게 지식을 전달하고 성장을 도와주는 일을 해요",
        growth_outlook: "보통",
        avg_salary: "2800-4500만원",
        work_environment: {
            indoor_work: 4,
            flexible_schedule: 2,
            team_collaboration: 3,
            creative_tasks: 4,
            challenging_work: 4
        }
    },
    "curriculum_designer": {
        title: "교육과정 개발자",
        category: "교육/기획",
        required_skills: ["planning", "creativity", "communication"],
        riasec_match: ["A", "I"],
        industry: ["education", "startup"],
        description: "효과적인 교육 프로그램과 커리큘럼을 기획하고 개발해요",
        growth_outlook: "높음",
        avg_salary: "3200-5500만원",
        work_environment: {
            indoor_work: 4,
            flexible_schedule: 4,
            team_collaboration: 4,
            creative_tasks: 5,
            challenging_work: 4
        }
    },
    "researcher": {
        title: "연구원",
        category: "연구/개발",
        required_skills: ["analysis", "problem_solving", "writing"],
        riasec_match: ["I", "C"],
        industry: ["education", "it"],
        description: "특정 분야의 새로운 지식을 연구하고 발견하는 일을 해요",
        growth_outlook: "보통",
        avg_salary: "3500-6500만원",
        work_environment: {
            indoor_work: 5,
            flexible_schedule: 4,
            team_collaboration: 3,
            creative_tasks: 4,
            challenging_work: 5
        }
    },
    "instructional_designer": {
        title: "교육 콘텐츠 디자이너",
        category: "교육/콘텐츠",
        required_skills: ["creativity", "communication", "technical"],
        riasec_match: ["A", "S"],
        industry: ["education", "startup"],
        description: "온라인 강의나 교육 자료를 디자인하고 제작해요",
        growth_outlook: "높음",
        avg_salary: "3000-5200만원",
        work_environment: {
            indoor_work: 5,
            flexible_schedule: 4,
            team_collaboration: 3,
            creative_tasks: 5,
            challenging_work: 3
        }
    },
    // 인사/관리 분야 (3개)
    "hr_specialist": {
        title: "HR 전문가",
        category: "인사/채용",
        required_skills: ["communication", "planning", "teamwork"],
        riasec_match: ["S", "E"],
        industry: ["consulting", "manufacturing", "finance"],
        description: "사람을 뽑고 교육시키며 회사 조직을 관리하는 일을 해요",
        growth_outlook: "보통",
        avg_salary: "3000-5000만원",
        work_environment: {
            indoor_work: 4,
            flexible_schedule: 3,
            team_collaboration: 5,
            creative_tasks: 3,
            challenging_work: 3
        }
    },
    "operations_manager": {
        title: "운영 매니저",
        category: "운영/관리",
        required_skills: ["planning", "leadership", "analysis"],
        riasec_match: ["E", "C"],
        industry: ["manufacturing", "retail", "consulting"],
        description: "회사의 일상적인 업무 과정을 효율적으로 관리하고 개선해요",
        growth_outlook: "보통",
        avg_salary: "3800-6200만원",
        work_environment: {
            indoor_work: 4,
            flexible_schedule: 3,
            team_collaboration: 4,
            creative_tasks: 2,
            challenging_work: 4
        }
    },
    "office_manager": {
        title: "오피스 매니저",
        category: "총무/관리",
        required_skills: ["planning", "communication", "teamwork"],
        riasec_match: ["C", "S"],
        industry: ["startup", "consulting"],
        description: "사무실 운영과 직원들의 업무 환경을 관리하는 일을 해요",
        growth_outlook: "보통",
        avg_salary: "2800-4500만원",
        work_environment: {
            indoor_work: 5,
            flexible_schedule: 3,
            team_collaboration: 4,
            creative_tasks: 2,
            challenging_work: 3
        }
    },

    // 미디어/콘텐츠 분야 (8개)
    "content_creator": {
        title: "콘텐츠 크리에이터",
        category: "미디어/콘텐츠",
        required_skills: ["creativity", "writing", "presentation"],
        riasec_match: ["A", "E"],
        industry: ["media", "startup", "marketing"],
        description: "유튜브, 인스타그램 등에서 사람들이 좋아할 콘텐츠를 만들어요",
        growth_outlook: "매우 높음",
        avg_salary: "2800-6000만원",
        work_environment: {
            indoor_work: 4,
            flexible_schedule: 5,
            team_collaboration: 3,
            creative_tasks: 5,
            challenging_work: 4
        }
    },
    "youtube_creator": {
        title: "유튜버",
        category: "미디어/영상",
        required_skills: ["creativity", "presentation", "technical"],
        riasec_match: ["A", "E"],
        industry: ["media"],
        description: "유튜브에서 영상을 제작하고 많은 구독자와 소통해요",
        growth_outlook: "높음",
        avg_salary: "0-10000만원",
        work_environment: {
            indoor_work: 3,
            flexible_schedule: 5,
            team_collaboration: 2,
            creative_tasks: 5,
            challenging_work: 4
        }
    },
    "influencer": {
        title: "인플루언서",
        category: "미디어/SNS",
        required_skills: ["creativity", "communication", "presentation"],
        riasec_match: ["A", "E"],
        industry: ["media", "marketing"],
        description: "SNS에서 팔로워들에게 영향력을 발휘하며 브랜드와 협업해요",
        growth_outlook: "높음",
        avg_salary: "1000-8000만원",
        work_environment: {
            indoor_work: 3,
            flexible_schedule: 5,
            team_collaboration: 3,
            creative_tasks: 5,
            challenging_work: 4
        }
    },
    "copywriter": {
        title: "카피라이터",
        category: "마케팅/글쓰기",
        required_skills: ["writing", "creativity", "communication"],
        riasec_match: ["A", "E"],
        industry: ["marketing", "media"],
        description: "광고나 마케팅에 사용될 매력적인 문구와 글을 써요",
        growth_outlook: "보통",
        avg_salary: "3000-5500만원",
        work_environment: {
            indoor_work: 5,
            flexible_schedule: 4,
            team_collaboration: 3,
            creative_tasks: 5,
            challenging_work: 4
        }
    },
    "journalist": {
        title: "기자/에디터",
        category: "미디어/언론",
        required_skills: ["writing", "communication", "analysis"],
        riasec_match: ["I", "A"],
        industry: ["media"],
        description: "뉴스를 취재하고 기사를 작성해서 사람들에게 정보를 전달해요",
        growth_outlook: "보통",
        avg_salary: "2800-5000만원",
        work_environment: {
            indoor_work: 3,
            flexible_schedule: 2,
            team_collaboration: 3,
            creative_tasks: 4,
            challenging_work: 4
        }
    },
    "podcast_producer": {
        title: "팟캐스트 프로듀서",
        category: "미디어/오디오",
        required_skills: ["creativity", "technical", "communication"],
        riasec_match: ["A", "R"],
        industry: ["media", "startup"],
        description: "팟캐스트 프로그램을 기획하고 제작하는 일을 해요",
        growth_outlook: "높음",
        avg_salary: "2500-4800만원",
        work_environment: {
            indoor_work: 5,
            flexible_schedule: 4,
            team_collaboration: 3,
            creative_tasks: 5,
            challenging_work: 3
        }
    },
    "streaming_producer": {
        title: "스트리밍 PD",
        category: "미디어/라이브",
        required_skills: ["creativity", "technical", "communication"],
        riasec_match: ["A", "E"],
        industry: ["media", "startup"],
        description: "라이브 방송 콘텐츠를 기획하고 연출하는 일을 해요",
        growth_outlook: "매우 높음",
        avg_salary: "3200-6000만원",
        work_environment: {
            indoor_work: 4,
            flexible_schedule: 2,
            team_collaboration: 4,
            creative_tasks: 5,
            challenging_work: 4
        }
    },
    "community_manager": {
        title: "커뮤니티 매니저",
        category: "마케팅/소통",
        required_skills: ["communication", "creativity", "teamwork"],
        riasec_match: ["S", "E"],
        industry: ["startup", "media", "marketing"],
        description: "온라인 커뮤니티를 관리하고 사용자들과 소통해요",
        growth_outlook: "높음",
        avg_salary: "2800-4800만원",
        work_environment: {
            indoor_work: 5,
            flexible_schedule: 4,
            team_collaboration: 4,
            creative_tasks: 4,
            challenging_work: 3
        }
    },
    // 신직업/특수 분야 (5개)
    "esports_manager": {
        title: "e스포츠 매니저",
        category: "게임/스포츠",
        required_skills: ["communication", "planning", "teamwork"],
        riasec_match: ["E", "S"],
        industry: ["media", "startup"],
        description: "프로게이머나 e스포츠 팀을 관리하고 대회 운영을 도와요",
        growth_outlook: "매우 높음",
        avg_salary: "2800-6000만원",
        work_environment: {
            indoor_work: 4,
            flexible_schedule: 3,
            team_collaboration: 5,
            creative_tasks: 3,
            challenging_work: 4
        }
    },
    "pet_care_specialist": {
        title: "펫시터/반려동물 전문가",
        category: "서비스/동물",
        required_skills: ["communication", "teamwork"],
        riasec_match: ["S", "R"],
        industry: ["retail"],
        description: "반려동물을 돌보고 주인들에게 돌봄 서비스를 해드려요",
        growth_outlook: "높음",
        avg_salary: "2000-4000만원",
        work_environment: {
            indoor_work: 3,
            flexible_schedule: 4,
            team_collaboration: 3,
            creative_tasks: 2,
            challenging_work: 3
        }
    },
    "vr_ar_developer": {
        title: "VR/AR 개발자",
        category: "IT/신기술",
        required_skills: ["coding", "creativity", "technical"],
        riasec_match: ["I", "A"],
        industry: ["it", "startup", "media"],
        description: "가상현실과 증강현실 콘텐츠를 개발하고 구현해요",
        growth_outlook: "매우 높음",
        avg_salary: "4000-8000만원",
        work_environment: {
            indoor_work: 5,
            flexible_schedule: 4,
            team_collaboration: 3,
            creative_tasks: 5,
            challenging_work: 5
        }
    },
    "sustainability_consultant": {
        title: "ESG/지속가능성 컨설턴트",
        category: "컨설팅/환경",
        required_skills: ["analysis", "communication", "planning"],
        riasec_match: ["I", "S"],
        industry: ["consulting", "manufacturing"],
        description: "기업의 친환경 경영과 사회적 책임을 컨설팅해요",
        growth_outlook: "매우 높음",
        avg_salary: "3500-7000만원",
        work_environment: {
            indoor_work: 4,
            flexible_schedule: 3,
            team_collaboration: 4,
            creative_tasks: 3,
            challenging_work: 4
        }
    },
    "drone_operator": {
        title: "드론 조종사/영상 촬영사",
        category: "기술/촬영",
        required_skills: ["technical", "creativity"],
        riasec_match: ["R", "A"],
        industry: ["media", "manufacturing"],
        description: "드론을 조종해서 항공 촬영이나 배송, 점검 업무를 해요",
        growth_outlook: "높음",
        avg_salary: "2800-5500만원",
        work_environment: {
            indoor_work: 2,
            flexible_schedule: 4,
            team_collaboration: 3,
            creative_tasks: 4,
            challenging_work: 4
        }
    }
};

// Strengths mapping for results
const STRENGTHS_CATEGORIES = {
    thinking: {
        name: "사고형 강점",
        strengths: ["problem_solving", "analysis", "creativity", "learning"],
        description: "분석적이고 창의적인 사고를 통해 문제를 해결하는 능력"
    },
    social: {
        name: "관계형 강점", 
        strengths: ["communication", "leadership", "teamwork", "presentation"],
        description: "사람들과 소통하고 협업하며 영향력을 발휘하는 능력"
    },
    organizing: {
        name: "실행형 강점",
        strengths: ["planning", "project_mgmt", "organizing"],
        description: "체계적으로 계획하고 효율적으로 실행하는 능력"
    },
    technical: {
        name: "기술형 강점",
        strengths: ["technical", "coding", "data_analysis", "design"],
        description: "전문적인 기술과 도구를 사용하는 능력"
    }
};

// API-like functions for future backend integration
class AssessmentAPI {
    static async saveUserResponse(stepId, questionId, response) {
        // Future: POST /api/assessment/response
        const currentData = JSON.parse(localStorage.getItem('assessmentData') || '{}');
        if (!currentData[stepId]) currentData[stepId] = {};
        currentData[stepId][questionId] = response;
        localStorage.setItem('assessmentData', JSON.stringify(currentData));
    }

    static async getUserResponses() {
        // Future: GET /api/assessment/responses
        return JSON.parse(localStorage.getItem('assessmentData') || '{}');
    }

    static async calculateResults(responses) {
        // Future: POST /api/assessment/calculate
        // For now, calculate client-side
        return this.clientSideCalculation(responses);
    }

    static clientSideCalculation(responses) {
        // RIASEC scoring
        const riasecScores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
        
        // Calculate RIASEC from various responses
        if (responses.step1) {
            // From personality question
            if (responses.step1.personality_riasec) {
                const selected = responses.step1.personality_riasec;
                const option = ASSESSMENT_DATA.step1.questions[2].options.find(opt => opt.id === selected);
                if (option) {
                    riasecScores[option.riasec] += option.weight;
                }
            }

            // From values (weighted)
            if (responses.step1.values_priorities) {
                responses.step1.values_priorities.forEach((valueId, index) => {
                    const option = ASSESSMENT_DATA.step1.questions[0].options.find(opt => opt.id === valueId);
                    if (option) {
                        Object.keys(option.weight).forEach(riasec => {
                            riasecScores[riasec] += option.weight[riasec] * (3 - index); // Higher weight for higher priority
                        });
                    }
                });
            }
        }

        // Job matching calculation (개선된 차별화된 계산)
        const jobScores = {};
        const jobExplanations = {};
        
        Object.keys(JOB_DATABASE).forEach(jobId => {
            const job = JOB_DATABASE[jobId];
            let score = 0;
            let explanations = [];
            
            // 기본 점수 (10점 시작)
            score = 10;
            explanations.push("기본 적합도");
            
            // RIASEC 성향 매칭 (최대 30점)
            let riasecBonus = 0;
            job.riasec_match.forEach(riasec => {
                const riasecScore = riasecScores[riasec] || 0;
                riasecBonus += riasecScore * 2; // 가중치 감소
            });
            score += Math.min(riasecBonus, 30);
            if (riasecBonus > 0) {
                explanations.push(`성향 일치도 (+${Math.min(riasecBonus, 30)}점)`);
            }

            // 관심 산업 분야 매칭 (최대 20점)
            let industryBonus = 0;
            if (responses.step2?.industry_interest) {
                job.industry.forEach(industry => {
                    if (responses.step2.industry_interest.includes(industry)) {
                        industryBonus += 8; // 산업별 8점으로 감소
                    }
                });
            }
            score += Math.min(industryBonus, 20);
            if (industryBonus > 0) {
                explanations.push(`관심 분야 일치 (+${Math.min(industryBonus, 20)}점)`);
            }

            // 스킬 자신감 매칭 (최대 25점)
            let skillBonus = 0;
            if (responses.step2?.skill_confidence) {
                job.required_skills.forEach(skill => {
                    const skillMapping = {
                        'coding': 'coding',
                        'analysis': 'data_analysis', 
                        'technical': 'coding',
                        'communication': 'presentation',
                        'creativity': 'design',
                        'planning': 'project_mgmt',
                        'problem_solving': 'data_analysis',
                        'user_research': 'data_analysis',
                        'leadership': 'presentation',
                        'teamwork': 'presentation',
                        'writing': 'writing'
                    };
                    const mappedSkill = skillMapping[skill];
                    if (mappedSkill && responses.step2.skill_confidence[mappedSkill]) {
                        const skillScore = responses.step2.skill_confidence[mappedSkill];
                        skillBonus += skillScore * 3; // 스킬별 가중치 감소
                    }
                });
            }
            score += Math.min(skillBonus, 25);
            if (skillBonus > 0) {
                explanations.push(`보유 스킬 일치도 (+${Math.min(skillBonus, 25)}점)`);
            }

            // 직무 이해도 보너스 (최대 20점 - 가중치 증가)
            let understandingBonus = 0;
            if (responses.step2?.job_understanding) {
                const jobUnderstandingMapping = {
                    'software_developer': 'software_dev',
                    'data_analyst': 'data_analyst',
                    'marketing_manager': 'marketing_manager',
                    'product_manager': 'product_manager',
                    'consultant': 'consultant',
                    'ux_designer': 'designer',
                    'digital_marketer': 'marketing_manager',
                    'hr_specialist': 'consultant',
                    'financial_analyst': 'data_analyst',
                    'business_analyst': 'data_analyst',
                    'content_creator': 'marketing_manager',
                    'sales_manager': 'marketing_manager',
                    'teacher': 'consultant',
                    'project_coordinator': 'product_manager',
                    'quality_assurance': 'software_dev',
                    'graphic_designer': 'designer',
                    'operations_manager': 'consultant'
                };
                const understandingKey = jobUnderstandingMapping[jobId];
                if (understandingKey && responses.step2.job_understanding[understandingKey]) {
                    const understandingLevel = responses.step2.job_understanding[understandingKey];
                    // 이해도에 따른 차등 점수 부여
                    if (understandingLevel >= 4) {
                        understandingBonus = 20; // 높은 이해도
                    } else if (understandingLevel === 3) {
                        understandingBonus = 12; // 보통 이해도
                    } else if (understandingLevel === 2) {
                        understandingBonus = 6; // 낮은 이해도
                    } else {
                        understandingBonus = 2; // 매우 낮은 이해도
                    }
                }
            }
            score += understandingBonus;
            if (understandingBonus > 0) {
                explanations.push(`직무 이해도 (+${understandingBonus}점)`);
            }

            // 가치관 일치도 보너스 (최대 8점) 
            let valuesBonus = 0;
            if (responses.step1?.values_priorities) {
                const topValues = responses.step1.values_priorities.slice(0, 3);
                const jobValueMapping = {
                    // IT/개발 분야
                    'software_developer': ['growth', 'autonomy', 'creativity'],
                    'frontend_developer': ['creativity', 'growth', 'autonomy'],
                    'backend_developer': ['growth', 'autonomy', 'stability'],
                    'mobile_developer': ['growth', 'creativity', 'autonomy'],
                    'data_scientist': ['growth', 'income', 'autonomy'],
                    'data_analyst': ['growth', 'stability', 'income'],
                    'ai_engineer': ['growth', 'income', 'creativity'],
                    'devops_engineer': ['growth', 'autonomy', 'stability'],
                    'security_specialist': ['stability', 'income', 'growth'],
                    'system_admin': ['stability', 'autonomy', 'growth'],
                    'blockchain_developer': ['growth', 'income', 'autonomy'],
                    'quality_assurance': ['stability', 'growth', 'work_life_balance'],
                    
                    // 비즈니스/마케팅
                    'marketing_manager': ['creativity', 'growth', 'social_impact'],
                    'digital_marketer': ['creativity', 'growth', 'income'],
                    'performance_marketer': ['growth', 'income', 'autonomy'],
                    'brand_manager': ['creativity', 'growth', 'autonomy'],
                    'business_analyst': ['growth', 'income', 'autonomy'],
                    'sales_manager': ['income', 'growth', 'social_impact'],
                    'account_manager': ['growth', 'income', 'social_impact'],
                    'business_development': ['growth', 'income', 'autonomy'],
                    'growth_hacker': ['growth', 'creativity', 'autonomy'],
                    'cro_specialist': ['growth', 'autonomy', 'creativity'],
                    
                    // 기획/제품 관리
                    'product_manager': ['growth', 'autonomy', 'income'],
                    'product_owner': ['growth', 'autonomy', 'creativity'],
                    'project_manager': ['stability', 'growth', 'work_life_balance'],
                    'scrum_master': ['stability', 'social_impact', 'work_life_balance'],
                    'service_planner': ['creativity', 'growth', 'autonomy'],
                    
                    // 디자인/크리에이티브
                    'ux_designer': ['creativity', 'growth', 'work_life_balance'],
                    'graphic_designer': ['creativity', 'autonomy', 'work_life_balance'],
                    'web_designer': ['creativity', 'autonomy', 'growth'],
                    'brand_designer': ['creativity', 'growth', 'autonomy'],
                    'motion_graphics': ['creativity', 'growth', 'autonomy'],
                    'game_designer': ['creativity', 'growth', 'autonomy'],
                    'video_editor': ['creativity', 'autonomy', 'work_life_balance'],
                    'photographer': ['creativity', 'autonomy', 'work_life_balance'],
                    
                    // 컨설팅/전문직
                    'consultant': ['income', 'growth', 'autonomy'],
                    'financial_analyst': ['income', 'stability', 'growth'],
                    'investment_banker': ['income', 'growth', 'stability'],
                    'tax_accountant': ['stability', 'income', 'autonomy'],
                    'lawyer': ['income', 'social_impact', 'stability'],
                    'patent_attorney': ['income', 'growth', 'autonomy'],
                    
                    // 교육/연구
                    'teacher': ['social_impact', 'stability', 'work_life_balance'],
                    'curriculum_designer': ['creativity', 'social_impact', 'growth'],
                    'researcher': ['growth', 'autonomy', 'social_impact'],
                    'instructional_designer': ['creativity', 'social_impact', 'growth'],
                    
                    // 인사/관리
                    'hr_specialist': ['social_impact', 'stability', 'work_life_balance'],
                    'operations_manager': ['stability', 'income', 'work_life_balance'],
                    'office_manager': ['stability', 'work_life_balance', 'social_impact'],
                    
                    // 미디어/콘텐츠
                    'content_creator': ['creativity', 'autonomy', 'growth'],
                    'youtube_creator': ['creativity', 'autonomy', 'growth'],
                    'influencer': ['creativity', 'autonomy', 'income'],
                    'copywriter': ['creativity', 'autonomy', 'growth'],
                    'journalist': ['social_impact', 'growth', 'autonomy'],
                    'podcast_producer': ['creativity', 'autonomy', 'work_life_balance'],
                    'streaming_producer': ['creativity', 'growth', 'income'],
                    'community_manager': ['social_impact', 'work_life_balance', 'growth'],
                    
                    // 신직업/특수 분야
                    'esports_manager': ['growth', 'creativity', 'income'],
                    'pet_care_specialist': ['social_impact', 'work_life_balance', 'autonomy'],
                    'vr_ar_developer': ['growth', 'creativity', 'income'],
                    'sustainability_consultant': ['social_impact', 'growth', 'autonomy'],
                    'drone_operator': ['autonomy', 'creativity', 'growth']
                };
                
                const jobValues = jobValueMapping[jobId] || [];
                topValues.forEach((value, index) => {
                    if (jobValues.includes(value)) {
                        valuesBonus += Math.max(3 - index, 1); // 순위별 가중치
                    }
                });
            }
            score += valuesBonus;
            if (valuesBonus > 0) {
                explanations.push(`가치관 일치도 (+${valuesBonus}점)`);
            }

            // 업무 환경 일치도 보너스 (최대 15점)
            let environmentBonus = 0;
            if (responses.step1?.work_environment && job.work_environment) {
                const userPrefs = responses.step1.work_environment;
                const jobEnv = job.work_environment;
                
                // 각 환경 요소별로 일치도 계산
                Object.keys(jobEnv).forEach(envKey => {
                    if (userPrefs[envKey]) {
                        const userPref = userPrefs[envKey]; // 1-5점
                        const jobReq = jobEnv[envKey]; // 1-5점
                        
                        // 선호도와 직무 요구사항이 일치할수록 높은 점수
                        const diff = Math.abs(userPref - jobReq);
                        if (diff === 0) {
                            environmentBonus += 3; // 완전 일치
                        } else if (diff === 1) {
                            environmentBonus += 2; // 거의 일치
                        } else if (diff === 2) {
                            environmentBonus += 1; // 부분 일치
                        }
                        // diff > 2는 점수 없음
                    }
                });
            }
            score += environmentBonus;
            if (environmentBonus > 0) {
                explanations.push(`업무 환경 일치도 (+${environmentBonus}점)`);
            }

            // 경험 부족 페널티 (미경험 직무에 대한 현실적 조정)
            let experiencePenalty = 0;
            if (responses.step1?.strengths_experience) {
                const userStrengths = responses.step1.strengths_experience;
                const requiredCount = job.required_skills.length;
                const matchingStrengths = job.required_skills.filter(skill => {
                    const strengthMapping = {
                        'coding': ['technical', 'problem_solving'],
                        'analysis': ['analysis', 'problem_solving'],
                        'communication': ['communication', 'presentation'],
                        'creativity': ['creativity'],
                        'leadership': ['leadership'],
                        'planning': ['planning'],
                        'technical': ['technical'],
                        'teamwork': ['teamwork'],
                        'problem_solving': ['problem_solving'],
                        'user_research': ['analysis'],
                        'design': ['creativity'],
                        'writing': ['communication']
                    };
                    const relatedStrengths = strengthMapping[skill] || [];
                    return relatedStrengths.some(s => userStrengths.includes(s));
                }).length;
                
                const experienceRatio = matchingStrengths / requiredCount;
                if (experienceRatio < 0.5) {
                    experiencePenalty = 10; // 경험 부족 시 10점 감점
                    explanations.push(`경험 부족 (-${experiencePenalty}점)`);
                }
            }
            score -= experiencePenalty;

            // 최종 점수는 25-95점 범위로 조정 (더 현실적인 분포)
            const finalScore = Math.max(25, Math.min(score, 95));
            
            jobScores[jobId] = finalScore;
            jobExplanations[jobId] = explanations;
        });

        return {
            riasecScores,
            jobScores,
            jobExplanations,
            topJobs: Object.entries(jobScores)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([jobId, score]) => ({ 
                    jobId, 
                    score, 
                    explanation: jobExplanations[jobId],
                    ...JOB_DATABASE[jobId] 
                }))
        };
    }

    static async generateActionPlan(results, responses) {
        // Future: POST /api/assessment/action-plan
        const actionPlan = [];
        const urgency = responses.step3?.career_timeline || 'flexible';
        const preparationStatus = responses.step3?.preparation_status || [];
        
        // Based on urgency and current preparation
        if (urgency === 'high' || urgency === '3months') {
            if (!preparationStatus.includes('resume')) {
                actionPlan.push({
                    title: "이력서 완성 (우선)",
                    description: "3개월 이내 목표이므로 이력서를 즉시 완성하세요.",
                    timeline: "1주일",
                    priority: "높음"
                });
            }
        }

        if (!preparationStatus.includes('portfolio') && results.topJobs[0]?.category !== "컨설팅") {
            actionPlan.push({
                title: "포트폴리오 만들기",
                description: `${results.topJobs[0]?.title} 분야에 맞는 포트폴리오를 만들어보세요.`,
                timeline: "1-2개월",
                priority: "높음"
            });
        }

        // Skill development recommendations (학습 방법 선호도 반영)
        const topJob = results.topJobs[0];
        const learningMethod = responses.step3?.learning_preference || 'online_course';
        
        if (topJob) {
            topJob.required_skills.forEach(skill => {
                const skillNames = {
                    'coding': '프로그래밍 스킬',
                    'analysis': '데이터 분석 역량',
                    'communication': '커뮤니케이션 스킬',
                    'creativity': '창의적 사고력',
                    'planning': '기획 역량',
                    'technical': '기술 역량',
                    'design': '디자인 스킬',
                    'problem_solving': '문제해결 능력',
                    'user_research': '사용자 조사 역량'
                };
                
                const learningMethodDetails = {
                    'online_course': {
                        method: '온라인 강의',
                        description: '체계적인 커리큘럼으로 기초부터 단계별 학습',
                        platforms: 'Coursera, 인프런, 유데미 등'
                    },
                    'bootcamp': {
                        method: '부트캠프/학원',
                        description: '집중적인 실습과 멘토링으로 단기간 실력 향상',
                        platforms: '코드스쿠드, 패스트캠퍼스 등'
                    },
                    'mentoring': {
                        method: '멘토링/개인지도',
                        description: '1:1 맞춤형 지도로 개인 약점 집중 보완',
                        platforms: '크몽, 탈잉, 업계 전문가 네트워킹'
                    },
                    'self_study': {
                        method: '독학/책',
                        description: '자기주도적 학습으로 깊이 있는 이론 습득',
                        platforms: '전문 서적, 공식 문서, 블로그'
                    },
                    'project_based': {
                        method: '실전 프로젝트',
                        description: '실무 프로젝트 경험으로 포트폴리오를 만들기',
                        platforms: '사이드 프로젝트, 오픈소스, 해커톤'
                    }
                };
                
                if (skillNames[skill]) {
                    const methodInfo = learningMethodDetails[learningMethod];
                    actionPlan.push({
                        title: `${skillNames[skill]} 향상`,
                        description: `${topJob.title} 직무 필수 역량입니다. ${methodInfo.method}를 통해 ${methodInfo.description}하세요.`,
                        timeline: learningMethod === 'bootcamp' ? '3-6개월' : learningMethod === 'project_based' ? '2-4개월' : '2-3개월',
                        priority: "높음",
                        resources: methodInfo.platforms,
                        learning_method: methodInfo.method
                    });
                }
            });
        }
        
        // 학습 방법별 추가 권장사항
        const generalLearningAdvice = {
            'online_course': {
                title: '온라인 학습 효율화 팁',
                description: '강의 노트 정리, 실습 프로젝트 병행, 학습 일정 관리로 완주율을 높이세요.',
                timeline: '지속적',
                priority: '보통'
            },
            'bootcamp': {
                title: '부트캠프 준비사항',
                description: '사전 기초 학습, 학습 시간 확보, 동기들과 네트워킹 준비를 하세요.',
                timeline: '입학 전 1개월',
                priority: '보통'
            },
            'mentoring': {
                title: '멘토링을 최대한 활용하는 방법',
                description: '구체적인 질문 준비, 정기적인 피드백 요청, 업계 인사이트 습득에 집중하세요.',
                timeline: '멘토링 기간 내',
                priority: '보통'
            },
            'self_study': {
                title: '독학 성공 전략',
                description: '학습 계획 수립, 온라인 커뮤니티 참여, 정기적인 진도 점검을 하세요.',
                timeline: '지속적',
                priority: '보통'
            },
            'project_based': {
                title: '프로젝트 기반 학습 가이드',
                description: '작은 프로젝트부터 시작, 코드 리뷰 요청, GitHub 포트폴리오 관리를 하세요.',
                timeline: '각 프로젝트마다',
                priority: '보통'
            }
        };
        
        if (generalLearningAdvice[learningMethod]) {
            actionPlan.push(generalLearningAdvice[learningMethod]);
        }

        return actionPlan;
    }
}