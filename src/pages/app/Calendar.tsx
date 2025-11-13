import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus, Menu } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

/**
 * 캘린더 페이지
 * - 일정 조회 및 추가 기능
 * - 데이터는 추후 API로 연동 예정
 */
const Calendar = () => {
    const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];
    const [currentMonth, setCurrentMonth] = useState("2025년 1월");

    // 나중에 백엔드에서 일정 데이터를 불러올 예정
    const { data, isLoading } = useQuery({
        queryKey: ["calendar", currentMonth],
        queryFn: async () => {
            // TODO: 추후 백엔드 API로 교체 예정
            // const res = await fetch(`/calendar?month=${currentMonth}`);
            // if (!res.ok) throw new Error("일정을 불러오지 못했습니다.");
            // return res.json();
            return []; // 임시 비어 있는 데이터
        },
    });

    const events = data || [];

    // 달력 그리드 기본 구성 (35칸 고정, 실제 렌더링 시 월별로 동적으로 변경 가능)
    const calendarDays = Array.from({ length: 35 }, (_, i) => {
        const day = i - 2; // 이전 달 일부 표시
        return day > 0 && day <= 31 ? day : null;
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-muted-foreground">
                일정을 불러오는 중입니다...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* 상단 헤더 */}
            <header className="border-b bg-card">
                <div className="container flex h-16 items-center justify-between">
                    <Link to="/" className="text-2xl font-bold text-primary">
                        Once
                    </Link>
                    <nav className="hidden md:flex items-center gap-6">
                        <Link
                            to="/dashboard"
                            className="text-sm font-medium text-muted-foreground hover:text-primary"
                        >
                            대시보드
                        </Link>
                        <Link
                            to="/calendar"
                            className="text-sm font-medium text-primary"
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
                <div className="bg-card rounded-xl shadow-card p-6">
                    {/* 캘린더 헤더 */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-bold">{currentMonth}</h2>
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setCurrentMonth("2024년 12월")}
                                >
                                    <ChevronLeft size={20} />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setCurrentMonth("2025년 2월")}
                                >
                                    <ChevronRight size={20} />
                                </Button>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline">필터</Button>
                            <Button>
                                <Plus size={18} className="mr-2" />
                                일정 추가
                            </Button>
                        </div>
                    </div>

                    {/* 달력 그리드 */}
                    <div className="grid grid-cols-7 gap-2">
                        {/* 요일 헤더 */}
                        {daysOfWeek.map((day) => (
                            <div
                                key={day}
                                className="text-center text-sm font-semibold text-muted-foreground py-2"
                            >
                                {day}
                            </div>
                        ))}

                        {/* 날짜 */}
                        {calendarDays.map((day, index) => {
                            const dayEvents = events.filter(
                                (event: any) => event.day === day
                            );

                            return (
                                <div
                                    key={index}
                                    className={`aspect-square p-2 rounded-lg border ${
                                        day
                                            ? "bg-background hover:bg-muted/50 cursor-pointer"
                                            : "bg-transparent"
                                    }`}
                                >
                                    {day && (
                                        <>
                                            <div className="text-sm font-medium mb-1">{day}</div>

                                            {/* 일정 목록 (최대 2개 표시) */}
                                            {dayEvents.slice(0, 2).map((event: any, i: number) => (
                                                <div
                                                    key={i}
                                                    className={`text-xs rounded px-1 py-0.5 truncate ${
                                                        event.type === "personal"
                                                            ? "bg-primary/10 text-primary"
                                                            : event.type === "group"
                                                                ? "bg-secondary/10 text-secondary"
                                                                : "bg-accent/10 text-accent-foreground"
                                                    }`}
                                                >
                                                    {event.title}
                                                </div>
                                            ))}

                                            {/* 일정이 많을 경우 ‘+n’ 표시 */}
                                            {dayEvents.length > 2 && (
                                                <div className="text-xs text-muted-foreground">
                                                    +{dayEvents.length - 2}개
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* 일정 색상 범례 */}
                    <div className="mt-6 flex gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-primary/10"></div>
                            <span className="text-muted-foreground">개인 일정</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-secondary/10"></div>
                            <span className="text-muted-foreground">그룹 일정</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-accent/10"></div>
                            <span className="text-muted-foreground">공통 일정</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Calendar;