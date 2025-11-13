import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Calendar, Users, Sparkles, Image, CheckCircle2 } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Calendar,
      title: "공유 캘린더",
      description: "개인 일정과 그룹 일정을 한눈에 관리하세요",
      details: [
        "월/주 보기 지원",
        "일정 필터 (개인/그룹)",
        "전원 비는 요일 자동 하이라이트",
        "일정 생성 시 날짜·시간대·메모 입력",
        "알림 설정",
      ],
    },
    {
      icon: Users,
      title: "그룹 관리",
      description: "여러 모임을 효율적으로 관리하세요",
      details: [
        "간편한 그룹 생성",
        "초대 코드로 멤버 초대",
        "관리자/멤버 권한 구분",
        "그룹별 공지 고정",
        "그룹 전용 캘린더와 앨범",
      ],
    },
    {
      icon: Sparkles,
      title: "AI 추천",
      description: "그룹의 취향에 맞는 활동을 추천받으세요",
      details: [
        "가입 시 관심사 설문",
        "그룹 공통 관심사 자동 추출",
        "첫 모임 활동 제안",
        "장소 및 준비물 추천",
        "번개 주제 아이디어",
      ],
    },
    {
      icon: Image,
      title: "추억 앨범",
      description: "소중한 순간을 기록하고 공유하세요",
      details: [
        "사진 및 노트 업로드",
        "모임별 자동 정렬",
        "댓글과 하트 기능",
        "고화질 다운로드 지원",
        "그룹 멤버 전체 공유",
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-20">
          <div className="container text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              모임을 위한 완벽한 도구
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              일정 조율부터 추억 보관까지, Once가 제공하는 모든 기능을 살펴보세요
            </p>
          </div>
        </section>

        {/* Features Detail */}
        <section className="py-20">
          <div className="container">
            <div className="space-y-24">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                const isEven = index % 2 === 0;
                
                return (
                  <div
                    key={index}
                    className={`grid lg:grid-cols-2 gap-12 items-center ${
                      isEven ? "" : "lg:grid-flow-dense"
                    }`}
                  >
                    <div className={isEven ? "" : "lg:col-start-2"}>
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      <h2 className="text-3xl font-bold mb-4">{feature.title}</h2>
                      <p className="text-lg text-muted-foreground mb-6">
                        {feature.description}
                      </p>
                      <ul className="space-y-3">
                        {feature.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className={isEven ? "lg:order-last" : ""}>
                      <div className="bg-muted/50 rounded-2xl p-8 h-80 flex items-center justify-center">
                        <Icon className="w-32 h-32 text-muted-foreground/20" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              지금 바로 시작해보세요
            </h2>
            <p className="text-lg mb-8 opacity-90">
              모든 기능을 무료로 이용할 수 있습니다
            </p>
            <a
              href="/app"
              className="inline-flex items-center justify-center rounded-lg bg-background text-foreground px-8 py-3 text-lg font-semibold hover:bg-background/90 transition-colors"
            >
              지금 시작하기
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Features;
