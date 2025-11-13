const UserScenarios = () => {
    const scenarios = [
        {
            title: "가까운 친구들과 간편한 모임 만들기",
            description:
                "동네 친구들과 번거로운 단톡방 조율 없이, Once에서 손쉽게 모임을 개설하고 일정까지 한 번에!",
            emoji: "🤝",
        },
        {
            title: "관심사 기반 맞춤 컨텐츠 추천",
            description:
                "친구들의 관심사를 분석해 취향에 꼭 맞는 장소와 활동을 추천받고, 모임 주제 정하기도 간편하게!",
            emoji: "✨",
        },
        {
            title: "추억을 기록하고 공유하기",
            description:
                "모임이 끝난 후엔 사진과 순간들을 앨범으로 함께 남겨요. 한눈에 보이는 우리의 추억 타임라인!",
            emoji: "📸",
        },
        {
            title: "이색적인 번개 모임 제안",
            description:
                "AI가 제안하는 새로운 체험! 예상치 못한 장소나 주제로 친구들과 즉흥적인 번개를 즐겨보세요.",
            emoji: "⚡",
        },
    ];

    return (
        <section className="py-20 bg-muted/30">
            <div className="container">
                {/* 제목 영역 */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        이런 순간에 Once를 써보세요
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        모임부터 추억까지, 당신의 시간을 더 가치 있게
                    </p>
                </div>

                {/* 시나리오 카드 */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {scenarios.map((scenario, index) => (
                        <div
                            key={index}
                            className="bg-card p-8 rounded-xl shadow-card hover:shadow-hover transition-all hover:-translate-y-1 text-center"
                        >
                            <div className="text-6xl mb-4">{scenario.emoji}</div>
                            <h3 className="text-xl font-bold mb-3">{scenario.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {scenario.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default UserScenarios;