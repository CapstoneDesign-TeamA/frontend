import { Calendar, Users, Image, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

/**
 * 대시보드: 모든 데이터는 나중에 캘린더, 그룹, 앨범, 추천 API와 연동 예정
 */
const Dashboard = () => {
    // 추후 실제 API 연동 시 사용할 Query
    const { data, isLoading } = useQuery({
        queryKey: ["dashboard"],
        queryFn: async () => {
            // TODO: 나중에 백엔드 API 호출 추가 예정
            // const res = await fetch("/dashboard");
            // return res.json();
            return {
                events: [],
                recommendations: [],
                recentPhotos: [],
            };
        },
    });

    const { events = [], recommendations = [], recentPhotos = [] } = data || {};

    // 로딩 중 UI
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-muted-foreground">
                대시보드 데이터를 불러오는 중입니다...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* 헤더 */}
            <header className="border-b bg-card">
                <div className="container flex h-16 items-center justify-between">
                    <Link to="/" className="text-2xl font-bold text-primary">
                        Once
                    </Link>
                    <nav className="hidden md:flex items-center gap-6">
                        <Link to="/dashboard" className="text-sm font-medium text-primary">
                            대시보드
                        </Link>
                        <Link to="/calendar" className="text-sm font-medium text-muted-foreground hover:text-primary">
                            캘린더
                        </Link>
                        <Link to="/groups" className="text-sm font-medium text-muted-foreground hover:text-primary">
                            그룹
                        </Link>
                        <Link to="/albums" className="text-sm font-medium text-muted-foreground hover:text-primary">
                            앨범
                        </Link>
                    </nav>
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu size={24} />
                    </Button>
                </div>
            </header>

            {/* 메인 콘텐츠 */}
            <main className="container py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">대시보드</h1>
                    <p className="text-muted-foreground">다가오는 일정과 추천 활동을 확인하세요</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* 좌측 - 빠른 작업 / 최근 앨범 */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* 빠른 작업 */}
                        <div className="bg-card rounded-xl shadow-card p-6">
                            <h2 className="text-lg font-bold mb-4">빠른 작업</h2>
                            <div className="space-y-3">
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link to="/calendar">
                                        <Calendar className="mr-2 h-4 w-4" />
                                        일정 추가
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link to="/groups">
                                        <Users className="mr-2 h-4 w-4" />
                                        그룹 만들기
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link to="/albums">
                                        <Image className="mr-2 h-4 w-4" />
                                        사진 올리기
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        {/* 최근 앨범 */}
                        <div className="bg-card rounded-xl shadow-card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold">최근 앨범</h2>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link to="/albums">전체보기</Link>
                                </Button>
                            </div>

                            {recentPhotos.length > 0 ? (
                                <div className="grid grid-cols-2 gap-3">
                                    {recentPhotos.map((photo) => (
                                        <Link
                                            key={photo.id}
                                            to="/albums"
                                            className="group relative aspect-square rounded-lg overflow-hidden bg-muted hover:opacity-90 transition-opacity"
                                        >
                                            <img
                                                src={photo.thumbnailUrl || "/placeholder.svg"}
                                                alt={photo.group}
                                                className="w-full h-full object-cover"
                                            />
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">최근 업로드된 사진이 없습니다.</p>
                            )}
                        </div>
                    </div>

                    {/* 우측 - 일정 + 추천 */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* 일정 */}
                        <div className="bg-card rounded-xl shadow-card p-6">
                            <h2 className="text-lg font-bold mb-4">이번 주 일정</h2>
                            {events.length > 0 ? (
                                <div className="space-y-4">
                                    {events.map((event) => (
                                        <div
                                            key={event.id}
                                            className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                                        >
                                            <div>
                                                <h3 className="font-semibold">{event.title}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {event.date} • {event.time}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">{event.group}</p>
                                            </div>
                                            <Button variant="ghost" size="sm">
                                                상세보기
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">등록된 일정이 없습니다.</p>
                            )}
                        </div>

                        {/* 추천 활동 */}
                        <div className="bg-card rounded-xl shadow-card p-6">
                            <h2 className="text-lg font-bold mb-4">추천 활동</h2>
                            {recommendations.length > 0 ? (
                                <div className="grid md:grid-cols-3 gap-4">
                                    {recommendations.map((rec, index) => (
                                        <div key={index} className="p-4 bg-primary/5 rounded-lg">
                                            <h3 className="font-semibold mb-1">{rec.title}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {rec.category} • {rec.location}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">추천 활동이 없습니다.</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;