// Results Display and Analysis
class ResultsManager {
    constructor(assessmentManager) {
        this.assessmentManager = assessmentManager;
        this.charts = {};
    }

    async generateDetailedResults(responses) {
        try {
            const analysis = await this.performDetailedAnalysis(responses);
            const insights = this.generatePersonalInsights(analysis, responses);
            const recommendations = this.generateDetailedRecommendations(analysis, responses);
            
            return {
                analysis,
                insights,
                recommendations,
                summary: this.generateResultSummary(analysis)
            };
        } catch (error) {
            console.error('Error generating detailed results:', error);
            throw error;
        }
    }

    performDetailedAnalysis(responses) {
        // Enhanced analysis beyond basic RIASEC scoring
        const analysis = {
            personality: this.analyzePersonality(responses),
            strengths: this.analyzeStrengths(responses),
            values: this.analyzeValues(responses),
            skills: this.analyzeSkills(responses),
            readiness: this.analyzeCareerReadiness(responses)
        };

        return analysis;
    }

    analyzePersonality(responses) {
        const step1 = responses.step1 || {};
        const personality = {
            dominant_types: [],
            secondary_types: [],
            characteristics: [],
            work_style: {}
        };

        // Analyze RIASEC pattern
        if (step1.personality_riasec) {
            const riasecMapping = {
                'hands_on': { type: 'R', name: '현실형', traits: ['실무적', '실용적', '체계적'] },
                'research': { type: 'I', name: '탐구형', traits: ['분석적', '독립적', '논리적'] },
                'creative': { type: 'A', name: '예술형', traits: ['창의적', '표현적', '직관적'] },
                'helping': { type: 'S', name: '사회형', traits: ['협력적', '친화적', '이타적'] },
                'leadership': { type: 'E', name: '진취형', traits: ['리더십', '경쟁적', '설득적'] },
                'organizing': { type: 'C', name: '관습형', traits: ['체계적', '신중한', '정확한'] }
            };

            const selected = riasecMapping[step1.personality_riasec];
            if (selected) {
                personality.dominant_types.push(selected.name);
                personality.characteristics.push(...selected.traits);
            }
        }

        // Analyze work environment preferences
        if (step1.work_environment) {
            const preferences = step1.work_environment;
            personality.work_style = {
                location: preferences.indoor_work >= 4 ? '실내 근무 선호' : '실내외 무관',
                schedule: preferences.flexible_schedule >= 4 ? '유연한 일정 선호' : '규칙적 일정 선호',
                collaboration: preferences.team_collaboration >= 4 ? '팀워크 중시' : '독립적 업무 선호',
                creativity: preferences.creative_tasks >= 4 ? '창의적 업무 선호' : '체계적 업무 선호',
                challenge: preferences.challenging_work >= 4 ? '도전적 업무 선호' : '안정적 업무 선호'
            };
        }

        return personality;
    }

    analyzeStrengths(responses) {
        const step1 = responses.step1 || {};
        const strengths = {
            categories: {},
            top_strengths: [],
            development_areas: [],
            strength_score: 0
        };

        if (step1.strengths_experience) {
            const selectedStrengths = step1.strengths_experience;
            
            // Categorize strengths
            Object.keys(STRENGTHS_CATEGORIES).forEach(category => {
                const categoryStrengths = STRENGTHS_CATEGORIES[category].strengths;
                const matches = selectedStrengths.filter(s => categoryStrengths.includes(s));
                
                strengths.categories[category] = {
                    name: STRENGTHS_CATEGORIES[category].name,
                    count: matches.length,
                    strengths: matches,
                    percentage: (matches.length / categoryStrengths.length) * 100
                };
            });

            // Identify top categories
            strengths.top_strengths = Object.entries(strengths.categories)
                .sort(([,a], [,b]) => b.count - a.count)
                .slice(0, 2)
                .map(([category, data]) => ({
                    category,
                    ...data
                }));

            strengths.strength_score = selectedStrengths.length;
        }

        return strengths;
    }

    analyzeValues(responses) {
        const step1 = responses.step1 || {};
        const values = {
            primary_values: [],
            value_alignment: {},
            motivation_drivers: []
        };

        if (step1.values_priorities) {
            const valueMapping = {
                'stability': { name: '안정성', driver: '보안 추구', career_impact: '대기업, 공무원 선호' },
                'growth': { name: '성장', driver: '자기계발', career_impact: '학습기회 중시' },
                'creativity': { name: '창의성', driver: '자기표현', career_impact: '혁신적 업무 선호' },
                'autonomy': { name: '자율성', driver: '독립성', career_impact: '프리랜서, 스타트업 적합' },
                'social_impact': { name: '사회기여', driver: '의미추구', career_impact: 'NGO, 사회적기업 관심' },
                'income': { name: '수입', driver: '물질적보상', career_impact: '고수익 직종 선호' },
                'work_life_balance': { name: '워라밸', driver: '균형추구', career_impact: '근무환경 중시' }
            };

            values.primary_values = step1.values_priorities.slice(0, 3).map(valueId => {
                const mapped = valueMapping[valueId];
                return mapped ? mapped.name : valueId;
            });

            // Analyze career implications
            values.motivation_drivers = step1.values_priorities.slice(0, 3).map(valueId => {
                const mapped = valueMapping[valueId];
                return mapped ? mapped.driver : '';
            }).filter(d => d);
        }

        return values;
    }

    analyzeSkills(responses) {
        const step2 = responses.step2 || {};
        const skills = {
            current_skills: {},
            skill_gaps: [],
            development_priority: [],
            skill_confidence_avg: 0
        };

        if (step2.skill_confidence) {
            const skillData = step2.skill_confidence;
            skills.current_skills = skillData;
            
            // Calculate average confidence
            const scores = Object.values(skillData);
            skills.skill_confidence_avg = scores.reduce((a, b) => a + b, 0) / scores.length;

            // Identify skill gaps (low confidence areas)
            skills.skill_gaps = Object.entries(skillData)
                .filter(([_, score]) => score <= 2)
                .map(([skill, score]) => ({ skill, score }));

            // Identify development priorities (medium confidence areas)
            skills.development_priority = Object.entries(skillData)
                .filter(([_, score]) => score === 3)
                .map(([skill, score]) => ({ skill, score }));
        }

        return skills;
    }

    analyzeCareerReadiness(responses) {
        const step3 = responses.step3 || {};
        const readiness = {
            urgency_level: 'medium',
            preparation_score: 0,
            readiness_areas: {},
            timeline_recommendation: ''
        };

        if (step3.career_timeline) {
            const urgencyMapping = {
                '3months': { level: 'high', score: 4, recommendation: '즉시 실행 전략 필요' },
                '6months': { level: 'medium-high', score: 3, recommendation: '체계적 준비 계획 수립' },
                '1year': { level: 'medium', score: 2, recommendation: '장기 역량 개발 중심' },
                'flexible': { level: 'low', score: 1, recommendation: '탐색 중심의 접근' }
            };

            const mapping = urgencyMapping[step3.career_timeline];
            if (mapping) {
                readiness.urgency_level = mapping.level;
                readiness.timeline_recommendation = mapping.recommendation;
            }
        }

        if (step3.preparation_status) {
            const preparationItems = step3.preparation_status;
            const totalItems = 8; // Total possible preparation items
            readiness.preparation_score = (preparationItems.length / totalItems) * 100;

            // Categorize preparation areas
            const categories = {
                documents: ['resume', 'portfolio'],
                skills: ['certification'],
                experience: ['internship', 'projects'],
                network: ['networking'],
                preparation: ['interview_prep'],
                none: ['none']
            };

            Object.keys(categories).forEach(category => {
                readiness.readiness_areas[category] = {
                    completed: categories[category].filter(item => preparationItems.includes(item)).length,
                    total: categories[category].length
                };
            });
        }

        return readiness;
    }

    generatePersonalInsights(analysis, responses) {
        const insights = [];

        // Personality insights
        if (analysis.personality.dominant_types.length > 0) {
            insights.push({
                type: 'personality',
                title: '성격 유형 분석',
                content: `당신은 ${analysis.personality.dominant_types[0]} 성향이 강하며, ${analysis.personality.characteristics.slice(0, 3).join(', ')} 특성을 보입니다.`,
                icon: '🎯'
            });
        }

        // Strengths insights
        if (analysis.strengths.top_strengths.length > 0) {
            const topStrength = analysis.strengths.top_strengths[0];
            insights.push({
                type: 'strengths',
                title: '핵심 강점 영역',
                content: `${topStrength.name} 영역에서 특히 강점을 보이며, 이는 ${topStrength.count}개의 관련 역량을 보유하고 있음을 의미합니다.`,
                icon: '💪'
            });
        }

        // Values insights
        if (analysis.values.primary_values.length > 0) {
            insights.push({
                type: 'values',
                title: '핵심 가치관',
                content: `${analysis.values.primary_values.slice(0, 2).join('과 ')}을 가장 중요하게 생각하며, 이는 커리어 선택의 주요 기준이 될 것입니다.`,
                icon: '🎖️'
            });
        }

        // Readiness insights
        if (analysis.readiness.preparation_score > 0) {
            const readinessLevel = analysis.readiness.preparation_score >= 60 ? '높은' : 
                                 analysis.readiness.preparation_score >= 40 ? '보통' : '낮은';
            insights.push({
                type: 'readiness',
                title: '취업 준비도',
                content: `현재 취업 준비도는 ${Math.round(analysis.readiness.preparation_score)}%로 ${readinessLevel} 수준입니다. ${analysis.readiness.timeline_recommendation}`,
                icon: '📈'
            });
        }

        return insights;
    }

    generateDetailedRecommendations(analysis, responses) {
        const recommendations = {
            immediate_actions: [],
            medium_term_goals: [],
            long_term_strategy: [],
            skill_development: [],
            networking: []
        };

        // Based on urgency level
        if (analysis.readiness.urgency_level === 'high') {
            recommendations.immediate_actions.push(
                '이력서와 자기소개서 최적화',
                '목표 기업 리스트 작성 및 지원',
                '면접 준비 및 모의 면접 실시'
            );
        }

        // Based on preparation gaps
        if (analysis.readiness.readiness_areas.documents?.completed < analysis.readiness.readiness_areas.documents?.total) {
            recommendations.immediate_actions.push('포트폴리오 및 이력서 완성');
        }

        // Based on skill gaps
        if (analysis.skills.skill_gaps.length > 0) {
            recommendations.skill_development = analysis.skills.skill_gaps.map(gap => 
                `${gap.skill} 스킬 향상 (현재 수준: ${gap.score}/5)`
            );
        }

        // Based on top job matches
        const step2 = responses.step2 || {};
        if (step2.industry_interest) {
            recommendations.networking.push(
                ...step2.industry_interest.map(industry => `${industry} 업계 네트워킹`)
            );
        }

        return recommendations;
    }

    generateResultSummary(analysis) {
        return {
            personality_summary: analysis.personality.dominant_types.join(', ') || 'N/A',
            top_strength: analysis.strengths.top_strengths[0]?.name || 'N/A',
            primary_value: analysis.values.primary_values[0] || 'N/A',
            readiness_score: Math.round(analysis.readiness.preparation_score) || 0,
            skill_confidence: Math.round(analysis.skills.skill_confidence_avg * 20) || 0 // Convert to percentage
        };
    }

    displayDetailedInsights(insights) {
        const container = document.getElementById('detailed-insights');
        if (!container) return;

        container.innerHTML = insights.map(insight => `
            <div class="insight-card">
                <div class="insight-icon">${insight.icon}</div>
                <div class="insight-content">
                    <h4>${insight.title}</h4>
                    <p>${insight.content}</p>
                </div>
            </div>
        `).join('');
    }

    displayRecommendationTimeline(recommendations) {
        const container = document.getElementById('recommendation-timeline');
        if (!container) return;

        const timelineData = [
            { period: '즉시 실행', items: recommendations.immediate_actions },
            { period: '1-3개월', items: recommendations.medium_term_goals },
            { period: '장기 계획', items: recommendations.long_term_strategy }
        ];

        container.innerHTML = timelineData.map(period => `
            <div class="timeline-period">
                <h4>${period.period}</h4>
                <ul>
                    ${period.items.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        `).join('');
    }

    createStrengthsRadarChart(riasecScores, containerId = 'strengths-chart') {
        const ctx = document.getElementById(containerId);
        if (!ctx) return;

        const chart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: [
                    '현실형 (Realistic)',
                    '탐구형 (Investigative)', 
                    '예술형 (Artistic)',
                    '사회형 (Social)',
                    '진취형 (Enterprising)',
                    '관습형 (Conventional)'
                ],
                datasets: [{
                    label: 'RIASEC 성향 분석',
                    data: [
                        riasecScores.R || 0,
                        riasecScores.I || 0,
                        riasecScores.A || 0,
                        riasecScores.S || 0,
                        riasecScores.E || 0,
                        riasecScores.C || 0
                    ],
                    backgroundColor: 'rgba(102, 126, 234, 0.2)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(102, 126, 234, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(102, 126, 234, 1)',
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 20,
                        ticks: {
                            stepSize: 5,
                            showLabelBackdrop: false
                        },
                        grid: {
                            circular: true
                        },
                        angleLines: {
                            display: true
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.parsed.r + '점 (20점 만점)';
                            }
                        }
                    }
                },
                elements: {
                    line: {
                        tension: 0.3
                    }
                }
            }
        });

        this.charts.strengths = chart;
        return chart;
    }

    createSkillsBarChart(skillData, containerId = 'skills-chart') {
        const ctx = document.getElementById(containerId);
        if (!ctx) return;

        const skillNames = {
            'coding': '프로그래밍',
            'data_analysis': '데이터 분석',
            'design': '디자인',
            'writing': '글쓰기',
            'presentation': '발표',
            'project_mgmt': '프로젝트 관리'
        };

        const labels = Object.keys(skillData).map(skill => skillNames[skill] || skill);
        const data = Object.values(skillData);

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '스킬 자신감 수준',
                    data: data,
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 5,
                        ticks: {
                            stepSize: 1,
                            callback: function(value) {
                                const levels = ['', '낮음', '약간 낮음', '보통', '높음', '매우 높음'];
                                return levels[value] || value;
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const levels = ['', '낮음', '약간 낮음', '보통', '높음', '매우 높음'];
                                return `${context.parsed.y}점 (${levels[context.parsed.y]})`;
                            }
                        }
                    }
                }
            }
        });

        this.charts.skills = chart;
        return chart;
    }

    displayProfileSummary(results, responses) {
        const container = document.getElementById('profile-summary');
        const step1 = responses.step1 || {};
        
        let topValues = 'N/A';
        if (step1.values_priorities) {
            topValues = step1.values_priorities.slice(0, 3).map(valueId => {
                const option = ASSESSMENT_DATA.step1.questions[1].options.find(opt => opt.id === valueId);
                return option?.text || valueId;
            }).join(', ');
        }

        let personalityType = 'N/A';
        if (step1.personality_riasec) {
            const personalityOption = ASSESSMENT_DATA.step1.questions[3].options.find(opt => opt.id === step1.personality_riasec);
            if (personalityOption) {
                const typeMapping = {
                    'hands_on': {
                        name: '현실형 (Realistic)',
                        description: '실무적이고 체계적인 성향. 손으로 뭔가를 만들거나 기계를 다루는 일을 선호합니다.'
                    },
                    'research': {
                        name: '탐구형 (Investigative)', 
                        description: '분석적이고 논리적인 성향. 어려운 문제를 파헤쳐서 해답을 찾는 일을 좋아합니다.'
                    },
                    'creative': {
                        name: '예술형 (Artistic)',
                        description: '창의적이고 표현적인 성향. 새로운 아이디어로 창의적인 작품을 만드는 일을 즐깁니다.'
                    },
                    'helping': {
                        name: '사회형 (Social)',
                        description: '협력적이고 친화적인 성향. 사람들을 도와주고 함께 소통하는 일에서 보람을 느낍니다.'
                    },
                    'leadership': {
                        name: '진취형 (Enterprising)',
                        description: '리더십이 강하고 설득력 있는 성향. 앞장서서 팀을 이끌고 사업을 추진하는 일을 좋아합니다.'
                    },
                    'organizing': {
                        name: '관습형 (Conventional)',
                        description: '체계적이고 신중한 성향. 복잡한 일들을 체계적으로 정리하고 관리하는 일을 잘합니다.'
                    }
                };
                
                const typeInfo = typeMapping[step1.personality_riasec];
                personalityType = typeInfo ? typeInfo.name : personalityOption.text;
            }
        }

        let topIndustries = 'N/A';
        if (responses.step2?.industry_interest) {
            topIndustries = responses.step2.industry_interest.map(industryId => {
                const industryOption = ASSESSMENT_DATA.step2.questions[0].options.find(opt => opt.id === industryId);
                return industryOption?.text || industryId;
            }).join(', ');
        }

        let educationalBackground = 'N/A';
        if (responses.step1?.educational_background) {
            const educationOption = ASSESSMENT_DATA.step1.questions[0].options.find(opt => opt.id === responses.step1.educational_background);
            educationalBackground = educationOption?.text || responses.step1.educational_background;
        }

        // Get RIASEC scores from passed results
        const riasecScores = results?.riasecScores || { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
        const riasecDisplay = `R:${riasecScores.R || 0} I:${riasecScores.I || 0} A:${riasecScores.A || 0} S:${riasecScores.S || 0} E:${riasecScores.E || 0} C:${riasecScores.C || 0}`;

        // Get personality description for tooltip
        let personalityDescription = '';
        if (step1.personality_riasec) {
            const typeMapping = {
                'hands_on': '실무적이고 체계적인 성향. 손으로 뭔가를 만들거나 기계를 다루는 일을 선호합니다.',
                'research': '분석적이고 논리적인 성향. 어려운 문제를 파헤쳐서 해답을 찾는 일을 좋아합니다.',
                'creative': '창의적이고 표현적인 성향. 새로운 아이디어로 창의적인 작품을 만드는 일을 즐깁니다.',
                'helping': '협력적이고 친화적인 성향. 사람들을 도와주고 함께 소통하는 일에서 보람을 느낍니다.',
                'leadership': '리더십이 강하고 설득력 있는 성향. 앞장서서 팀을 이끌고 사업을 추진하는 일을 좋아합니다.',
                'organizing': '체계적이고 신중한 성향. 복잡한 일들을 체계적으로 정리하고 관리하는 일을 잘합니다.'
            };
            personalityDescription = typeMapping[step1.personality_riasec] || '';
        }

        // 성향과 강점 차이 분석
        const dominantStrength = this.getDominantRIASEC(riasecScores);
        const selectedPersonality = step1.personality_riasec;
        
        const personalityTypeMapping = {
            'hands_on': 'R',
            'research': 'I', 
            'creative': 'A',
            'helping': 'S',
            'leadership': 'E',
            'organizing': 'C'
        };
        
        const selectedPersonalityType = personalityTypeMapping[selectedPersonality];
        const showDifferenceExplanation = selectedPersonalityType && dominantStrength && selectedPersonalityType !== dominantStrength;

        container.innerHTML = `
            <div class="profile-item">
                <span class="profile-label">핵심 가치</span>
                <span class="profile-value">${topValues}</span>
            </div>
            <div class="profile-item">
                <span class="profile-label">성향 유형
                    ${personalityDescription ? `<span class="info-tooltip" onclick="showPersonalityTooltip('${personalityDescription}')">?</span>` : ''}
                </span>
                <span class="profile-value">${personalityType}</span>
            </div>
            <div class="profile-item">
                <span class="profile-label">전공 계열</span>
                <span class="profile-value">${educationalBackground}</span>
            </div>
            <div class="profile-item">
                <span class="profile-label">관심 분야</span>
                <span class="profile-value">${topIndustries}</span>
            </div>
            ${showDifferenceExplanation ? `
            <div class="personality-difference-explanation">
                <div class="explanation-header">
                    <span class="explanation-icon">💡</span>
                    <span class="explanation-title">성향과 강점이 다른 이유</span>
                </div>
                <div class="explanation-content">
                    개인 성향은 <strong>"좋아하는 활동"</strong>을, 강점 분석은 <strong>"실제 잘하는 역량"</strong>을 보여줍니다. 
                    이 둘이 다른 것은 매우 자연스러운 현상으로, 많은 사람들이 선호하는 것과 뛰어난 것이 다릅니다. 
                    이는 더 넓은 직업 선택권과 발전 가능성을 의미합니다.
                </div>
            </div>
            ` : ''}
        `;
        
        // Add global function for personality tooltip
        if (!window.showPersonalityTooltip) {
            window.showPersonalityTooltip = function(description) {
                // Get the selected personality type for more detailed explanation
                const selectedType = step1.personality_riasec;
                const detailedTypeInfo = {
                    'hands_on': {
                        name: '현실형 (Realistic)',
                        mainDesc: '실무적이고 체계적인 성향으로, 손으로 뭔가를 만들거나 기계를 다루는 일을 선호합니다.',
                        characteristics: ['실용적이고 현실적', '도구나 기계 다루기를 좋아함', '체계적이고 안정적인 환경 선호', '명확한 결과가 나오는 일을 좋아함'],
                        suitableJobs: '개발자, 엔지니어, 제조업, 건축가, 정비사',
                        workStyle: '정확하고 체계적으로 일하며, 실무 중심의 업무를 선호합니다.'
                    },
                    'research': {
                        name: '탐구형 (Investigative)',
                        mainDesc: '분석적이고 논리적인 성향으로, 어려운 문제를 파헤쳐서 해답을 찾는 일을 좋아합니다.',
                        characteristics: ['논리적이고 분석적 사고', '복잡한 문제 해결을 즐김', '지적 호기심이 강함', '독립적으로 일하는 것을 선호'],
                        suitableJobs: '연구원, 데이터 사이언티스트, 분석가, 의사, 과학자',
                        workStyle: '깊이 있는 분석과 연구를 통해 문제를 해결하며, 전문성을 중시합니다.'
                    },
                    'creative': {
                        name: '예술형 (Artistic)',
                        mainDesc: '창의적이고 표현적인 성향으로, 새로운 아이디어로 창의적인 작품을 만드는 일을 즐깁니다.',
                        characteristics: ['창의성과 상상력이 풍부', '예술적 표현을 좋아함', '독창적이고 혁신적', '자유로운 환경에서 일하기를 선호'],
                        suitableJobs: '디자이너, 작가, 예술가, 콘텐츠 크리에이터, 광고 기획자',
                        workStyle: '자유롭고 창의적인 환경에서 새로운 아이디어를 구현하는 일을 좋아합니다.'
                    },
                    'helping': {
                        name: '사회형 (Social)',
                        mainDesc: '협력적이고 친화적인 성향으로, 사람들을 도와주고 함께 소통하는 일에서 보람을 느낍니다.',
                        characteristics: ['사람과의 관계를 중시', '협력적이고 배려심이 많음', '소통과 상호작용을 즐김', '다른 사람을 돕는 일에 보람을 느낌'],
                        suitableJobs: '교사, 상담사, 간호사, 사회복지사, 인사담당자',
                        workStyle: '팀워크를 중시하며, 사람들과 협력하여 공동의 목표를 달성하는 일을 선호합니다.'
                    },
                    'leadership': {
                        name: '진취형 (Enterprising)',
                        mainDesc: '리더십이 강하고 설득력 있는 성향으로, 앞장서서 팀을 이끌고 사업을 추진하는 일을 좋아합니다.',
                        characteristics: ['리더십과 추진력이 강함', '목표 달성에 대한 의지가 강함', '경쟁적이고 도전적', '설득과 영향력 행사를 잘함'],
                        suitableJobs: '경영자, 영업담당자, 마케터, 기업가, 컨설턴트',
                        workStyle: '목표를 설정하고 이를 달성하기 위해 적극적으로 행동하며, 리더십을 발휘합니다.'
                    },
                    'organizing': {
                        name: '관습형 (Conventional)',
                        mainDesc: '체계적이고 신중한 성향으로, 복잡한 일들을 체계적으로 정리하고 관리하는 일을 잘합니다.',
                        characteristics: ['규칙과 절차를 중시', '정확성과 세심함', '안정적이고 예측 가능한 환경 선호', '체계적이고 조직적'],
                        suitableJobs: '회계사, 사무관리자, 은행원, 세무사, 행정직',
                        workStyle: '정확하고 체계적으로 업무를 처리하며, 안정적인 환경에서 일하는 것을 선호합니다.'
                    }
                };

                const typeDetail = detailedTypeInfo[selectedType];
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip-overlay';
                tooltip.innerHTML = `
                    <div class="tooltip-content personality-tooltip">
                        <div class="tooltip-header">
                            <h3>성향 유형 상세 분석</h3>
                            <button class="tooltip-close" onclick="this.closest('.tooltip-overlay').remove()">×</button>
                        </div>
                        <div class="tooltip-body">
                            <div class="theory-background">
                                <h4>📚 이론적 배경</h4>
                                <p><strong>홀랜드 RIASEC 이론</strong>은 심리학자 존 홀랜드(John Holland)가 1973년에 개발한 직업 선택 이론입니다.<br>
                                개인의 성격과 흥미를 6가지 유형으로 분류하여, 각자에게 맞는 직업 환경을 찾도록 도와줍니다.</p>
                            </div>
                            
                            ${typeDetail ? `
                            <div class="selected-type-detail">
                                <h4>🎯 당신의 성향: ${typeDetail.name}</h4>
                                <p class="main-description">${typeDetail.mainDesc}</p>
                                
                                <div class="characteristics-section">
                                    <h5>✨ 주요 특성</h5>
                                    <ul>
                                        ${typeDetail.characteristics.map(char => `<li>${char}</li>`).join('')}
                                    </ul>
                                </div>
                                
                                <div class="jobs-section">
                                    <h5>💼 적합한 직업</h5>
                                    <p>${typeDetail.suitableJobs}</p>
                                </div>
                                
                                <div class="workstyle-section">
                                    <h5>🎨 업무 스타일</h5>
                                    <p>${typeDetail.workStyle}</p>
                                </div>
                            </div>
                            ` : ''}
                            
                            <div class="riasec-overview">
                                <h4>🔍 RIASEC 6가지 성향 유형</h4>
                                <div class="types-grid">
                                    <div class="type-item"><strong>R(현실형)</strong>: 실무적, 체계적</div>
                                    <div class="type-item"><strong>I(탐구형)</strong>: 분석적, 논리적</div>
                                    <div class="type-item"><strong>A(예술형)</strong>: 창의적, 표현적</div>
                                    <div class="type-item"><strong>S(사회형)</strong>: 협력적, 친화적</div>
                                    <div class="type-item"><strong>E(진취형)</strong>: 리더십, 추진력</div>
                                    <div class="type-item"><strong>C(관습형)</strong>: 체계적, 신중함</div>
                                </div>
                                <p class="note"><small>💡 대부분의 사람들은 여러 성향이 혼합되어 있으며, 아래 차트에서 전체적인 성향 패턴을 확인할 수 있습니다.</small></p>
                            </div>
                        </div>
                    </div>
                `;
                document.body.appendChild(tooltip);
                
                // Close on background click
                tooltip.addEventListener('click', (e) => {
                    if (e.target === tooltip) {
                        tooltip.remove();
                    }
                });
            };
        }
        
        // RIASEC 점수를 강점 분석 섹션에 추가
        const chartDescription = document.querySelector('.chart-description');
        if (chartDescription) {
            chartDescription.innerHTML = `
                <strong>RIASEC 성향 점수:</strong> ${riasecDisplay}<br>
                아래 차트는 Holland의 RIASEC 이론에 기반한 직업 성향 분석 결과입니다. 
                각 영역별 점수가 높을수록 해당 성향이 강함을 의미합니다.
            `;
        }
    }

    getDominantRIASEC(riasecScores) {
        if (!riasecScores) return null;
        
        let maxScore = -1;
        let dominantType = null;
        
        Object.entries(riasecScores).forEach(([type, score]) => {
            if (score > maxScore) {
                maxScore = score;
                dominantType = type;
            }
        });
        
        return dominantType;
    }

    displayStrengthsChart(riasecScores) {
        const ctx = document.getElementById('strengths-chart').getContext('2d');
        
        // 기존 차트 파괴 (중복 생성 방지)
        if (this.charts.strengths) {
            this.charts.strengths.destroy();
        }
        
        // RIASEC 점수 안전하게 처리
        const safeRiasecScores = riasecScores || { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
        
        // 차트 인스턴스 저장
        this.charts.strengths = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: [
                    ['현실형', 'Realistic', `(${safeRiasecScores.R || 0}점)`], 
                    ['탐구형', 'Investigative', `(${safeRiasecScores.I || 0}점)`], 
                    ['예술형', 'Artistic', `(${safeRiasecScores.A || 0}점)`], 
                    ['사회형', 'Social', `(${safeRiasecScores.S || 0}점)`], 
                    ['진취형', 'Enterprising', `(${safeRiasecScores.E || 0}점)`], 
                    ['관습형', 'Conventional', `(${safeRiasecScores.C || 0}점)`]
                ],
                datasets: [{
                    label: 'RIASEC 성향 분석',
                    data: [
                        safeRiasecScores.R || 0,
                        safeRiasecScores.I || 0, 
                        safeRiasecScores.A || 0,
                        safeRiasecScores.S || 0,
                        safeRiasecScores.E || 0,
                        safeRiasecScores.C || 0
                    ],
                    backgroundColor: 'rgba(102, 126, 234, 0.2)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(102, 126, 234, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(102, 126, 234, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: {
                            display: false
                        },
                        suggestedMin: 0,
                        suggestedMax: 20,
                        ticks: {
                            font: {
                                size: 12,
                                color: '#000000'
                            }
                        },
                        pointLabels: {
                            font: {
                                size: 13,
                                color: '#000000'
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: {
                                size: 14,
                                color: '#000000'
                            }
                        }
                    },
                    tooltip: {
                        titleFont: {
                            size: 14,
                            color: '#000000'
                        },
                        bodyFont: {
                            size: 13,
                            color: '#000000'
                        },
                        callbacks: {
                            label: function(context) {
                                return `${context.parsed.r}점 (20점 만점)`;
                            }
                        }
                    }
                }
            }
        });
    }

    displayActionPlan(actionPlan) {
        // Analytics: 액션 플랜 조회 이벤트
        if (window.analyticsManager) {
            window.analyticsManager.trackActionPlanViewed();
        }
        
        const container = document.getElementById('action-plan');
        
        if (!actionPlan || actionPlan.length === 0) {
            container.innerHTML = '<p>맞춤형 취업 준비 가이드를 준비 중입니다.</p>';
            return;
        }

        // Get priority colors for visual distinction
        const getPriorityColor = (priorityLabel) => {
            switch(priorityLabel) {
                case '🚨 긴급': return '#ff3838';        // Urgent Red
                case '⏰ 우선': return '#ff6b6b';        // Priority Orange-Red  
                case '👀 관심': return '#4834d4';        // Interest Blue
                case '🎯 탐색': return '#686de0';        // Exploration Purple
                case '📋 계획': return '#30336b';        // Planning Dark Blue
                default: return '#747d8c';              // Gray
            }
        };

        const getPriorityDescription = (priorityLabel) => {
            switch(priorityLabel) {
                case '🚨 긴급': return '즉시 착수하세요';
                case '⏰ 우선': return '빠른 시일 내 진행';  
                case '👀 관심': return '관심을 가지고 준비';
                case '🎯 탐색': return '탐색하며 시작';
                case '📋 계획': return '계획 수립 단계';
                default: return '차근차근 준비';
            }
        };

        container.innerHTML = actionPlan.map(action => `
            <div class="action-item">
                <div class="action-header">
                    <div class="action-title">${action.title}</div>
                    ${action.priorityLabel ? `
                        <div class="action-priority" style="background-color: ${getPriorityColor(action.priorityLabel)}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">
                            ${action.priorityLabel}
                        </div>
                        <div class="priority-description" style="color: #666; font-size: 12px; margin-top: 4px;">
                            ${getPriorityDescription(action.priorityLabel)}
                        </div>
                    ` : ''}
                </div>
                <div class="action-description">${action.description}</div>
                ${action.reason ? `
                    <div class="action-reason">
                        <span style="color: #666; font-size: 14px;">
                            📌 <strong>왜 중요한가요?</strong> ${action.reason}
                        </span>
                    </div>
                ` : ''}
                <div class="action-link">
                    <span class="practical-advice">
                        💡 <strong>실행 팁:</strong> ${action.practicalTip || '단계별로 차근차근 진행하되, 완벽함보다는 꾸준함을 목표로 하세요.'}
                    </span>
                </div>
            </div>
        `).join('');
    }

    displayJobRecommendations(topJobs) {
        const container = document.getElementById('job-recommendations');
        
        container.innerHTML = topJobs.map((job, index) => {
            return `
                <div class="job-item">
                    <div class="job-title">${index + 1}. ${job.title}</div>
                    <div class="job-match">적합도: ${Math.round(job.score)}점 (100점 만점)</div>
                    <div class="job-description">${job.description}</div>
                    <div class="job-explanation">
                        <strong>적합도 근거:</strong> ${job.explanation ? job.explanation.join(', ') : '종합 평가'}
                    </div>
                </div>
            `;
        }).join('');
    }

    destroyCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
    }
}

// Export for use in other modules
window.ResultsManager = ResultsManager;