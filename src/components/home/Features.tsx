import {Calendar, Users, Sparkles, Image} from "lucide-react";

/**
 * Features 컴포넌트
 * - 서비스의 주요 기능(캘린더, 그룹, AI 추천, 앨범)을 소개하는 섹션
 * - 아이콘 + 제목 + 설명으로 구성됨
 */
const Features = () => {
    // 각 기능의 정보(아이콘, 제목, 설명)
    const features = [
        {
            icon: Calendar,
            title: "공유 캘린더",
            description: "개인/그룹 일정 한눈에, 일정 등록(날짜·시간대·메모), 전원 비는 요일 자동 표시",
        },
        {
            icon: Users,
            title: "그룹 관리",
            description: "그룹 생성·초대, 내 그룹 목록, 그룹별 전용 캘린더/앨범",
        },
        {
            icon: Sparkles,
            title: "AI 추천",
            description: "가입 설문 기반 관심사 분석, 첫 모임 활동/번개 주제 추천",
        },
        {
            icon: Image,
            title: "추억 앨범",
            description: "사진·메모 업로드, 그룹 공유, 댓글",
        },
    ];

    return (
        // 기능 섹션 전체 영역
        <section className="py-20">
            <div className="container">
                {/* 제목 및 부제 영역 */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        핵심 기능
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        모임 준비부터 추억까지, 필요한 모든 것
                    </p>
                </div>

                {/* 기능 카드 목록 */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            // 개별 기능 카드
                            <div
                                key={index}
                                className="bg-card p-6 rounded-xl shadow-card hover:shadow-hover transition-all hover:-translate-y-1"
                            >
                                {/* 아이콘 영역 */}
                                <div
                                    className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                                    <Icon className="w-6 h-6 text-primary"/>
                                </div>

                                {/* 기능 제목 */}
                                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>

                                {/* 기능 설명 */}
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Features;