// src/pages/Dashboard.tsx

import { Calendar, Users, Image, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

import { fetchMyGroups } from "@/lib/api/groups";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

/** 백엔드 /calendar 응답 타입 */
type CalendarSchedule = {
    schedule_id: number;
    title: string;
    start_date_time: string; // "2025-11-20T19:00:00"
    end_date_time: string;
    type: string; // "PERSONAL", "GROUP" 등
    color: string;
};

/** 대시보드에서 쓸 일정 타입 */
type DashboardEvent = {
    id: number;
    title: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    type: string;
    color: string;
};

/** 대시보드에서 쓸 최근 사진 타입 */
type DashboardPhoto = {
    id: string;
    groupId: number;
    groupName: string;
    thumbnailUrl: string;
};

const Dashboard = () => {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["dashboard"],
        queryFn: async () => {
            // 1) 참여 중인 그룹 목록
            const groups = await fetchMyGroups(); // [{ groupId, name, ... }]

            // 2) 이번 달 기준으로 /calendar 호출
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth() + 1;

            const token = localStorage.getItem("accessToken");

            const res = await fetch(
                `${API_BASE}/calendar?year=${year}&month=${month}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                }
            );

            if (!res.ok) {
                throw new Error(`캘린더 조회 실패 (${res.status})`);
            }

            const json: { schedules: CalendarSchedule[] } = await res.json();

            // 3) 캘린더 일정 → 대시보드 이벤트로 매핑
            const events: DashboardEvent[] = (json.schedules || []).map((s) => {
                const [date, timeFull] = s.start_date_time.split("T");
                const time = timeFull?.slice(0, 5) ?? ""; // HH:mm만 추출

                return {
                    id: s.schedule_id,
                    title: s.title,
                    date,
                    time,
                    type: s.type,
                    color: s.color,
                };
            });

            // 4) 최근 사진: 일단 지금은 그룹별 앨범 API랑 연결 안 했으니 빈 배열로 둠
            const recentPhotos: DashboardPhoto[] = [];

            // 5) 추천 활동은 아직 없음
            const recommendations: any[] = [];

            return {
                groups,
                events,
                recentPhotos,
                recommendations,
            };
        },
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-muted-foreground">
                대시보드 데이터를 불러오는 중입니다...
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-500">
                대시보드 데이터를 불러오는 중 오류가 발생했습니다.
                {error instanceof Error && (
                    <span className="ml-2 text-xs text-muted-foreground">
            {error.message}
          </span>
                )}
            </div>
        );
    }

    const {
        groups = [],
        events = [],
        recentPhotos = [],
        recommendations = [],
    } = data || {};

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
                        <Link
                            to="/calendar"
                            className="text-sm font-medium text-muted-foreground hover:text-primary"
                        >
                            캘린더
                        </Link>
                        <Link
                            to="/groups"
                            className="text-sm font-medium text-muted-foreground hover:text-primary"
                        >
                            그룹
                        </Link>
                        <Link
                            to="/albums"
                            className="text-sm font-medium text-muted-foreground hover:text-primary"
                        >
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
                    <p className="text-muted-foreground">
                        이번 달 일정과 참여 중인 그룹, 최근 앨범을 한눈에 확인하세요.
                    </p>
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
                                                alt={photo.groupName}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-2 py-1 text-[10px] text-white">
                                                {photo.groupName}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    최근 업로드된 사진이 없습니다.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* 우측 - 일정 + 참여중인 그룹 + 추천 */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* 일정: /calendar 기반 */}
                        <div className="bg-card rounded-xl shadow-card p-6">
                            <h2 className="text-lg font-bold mb-4">이번 달 일정</h2>
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
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {event.type === "PERSONAL" ? "개인 일정" : event.type}
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                            >
                                                <Link to="/calendar">캘린더로 이동</Link>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    이번 달 등록된 일정이 없습니다.
                                </p>
                            )}
                        </div>

                        {/* 참여중인 그룹 */}
                        <div className="bg-card rounded-xl shadow-card p-6">
                            <h2 className="text-lg font-bold mb-4">참여 중인 그룹</h2>
                            {groups.length > 0 ? (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {groups.map((g) => (
                                        <Link
                                            key={g.groupId}
                                            to={`/groups/${g.groupId}`}
                                            className="p-4 bg-muted/30 rounded-lg hover:bg-muted transition-colors"
                                        >
                                            <div className="font-semibold mb-1">{g.name}</div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    참여 중인 그룹이 없습니다.
                                </p>
                            )}
                        </div>

                        {/* 추천 활동 (더미) */}
                        <div className="bg-card rounded-xl shadow-card p-6">
                            <h2 className="text-lg font-bold mb-4">추천 활동</h2>
                            {recommendations.length > 0 ? (
                                <div className="grid md:grid-cols-3 gap-4">
                                    {recommendations.map((rec: any, index: number) => (
                                        <div key={index} className="p-4 bg-primary/5 rounded-lg">
                                            <h3 className="font-semibold mb-1">{rec.title}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {rec.category} • {rec.location}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    추천 활동이 없습니다.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;