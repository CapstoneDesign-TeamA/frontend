import {Button} from "@/components/ui/button";
import {Link} from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";


const Hero = () => {
    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20 md:py-32">
            <div className="container">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Content */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                                모임 캘린더 & 추억 공유<br/>
                                <span className="text-primary">한때(Once)</span>
                            </h1>
                            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                                한때(Once)는 모임 준비와 일정 조율, 그리고 추억 보관까지 한 번에 해결하는 모임 캘린더입니다.
                            </p>
                            <p className="text-base md:text-lg text-muted-foreground">
                                겹치는 일정을 찾고, 모두가 즐길 첫 모임 활동을 추천받고, 다녀온 뒤엔 사진으로 남기세요.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* 지금 시작하기 → 로그인 페이지로 이동 */}
                            <Button size="lg" asChild className="text-base">
                                <Link to="/auth/login">지금 시작하기</Link>
                            </Button>
                        </div>
                    </div>

                    {/* Images */}
                    <div className="relative">
                        <div className="relative z-10">
                            <img
                                src={heroImage}
                                alt="대학생들이 함께 캘린더를 보며 일정을 조율하는 모습"
                                className="rounded-2xl shadow-2xl"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
