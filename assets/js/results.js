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