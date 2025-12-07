// src/pages/Dashboard.tsx

import { Calendar, Users, Image } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import AppHeader from "@/components/layout/AppHeader";

import { fetchMyGroups, fetchGroupDetail } from "@/lib/api/groups";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

/** 백엔드 /calendar 응답 타입 */
type CalendarSchedule = {
    schedule_id: number;
    title: string;
    start_date_time: string;
    end_date_time: string;
    type: string;
    color: string;
};

/** 대시보드에서 쓸 일정 타입 */
type DashboardEvent = {
    id: number;
    title: string;
    date: string;
    time: string;
    type: string;
    color: string;
};

/** 대시보드에서 쓸 최근 사진 타입 */
type DashboardPhoto = {
    url: string;
    groupId: number;
    groupName: string;
    addedDate: Date;
};

// 한국 공휴일 데이터 (2025년 기준)
const koreanHolidays: Record<string, Record<number, string>> = {
    '2025': {
        1: '신정',
        28: '구정 연휴',
        29: '설날',
        30: '구정 연휴',
        61: '삼일절', // 3월 1일
        95: '식목일', // 4월 5일
        121: '어린이날', // 5월 5일
        122: '어린이날 대체공휴일', // 5월 6일
        167: '현충일', // 6월 6일
        228: '광복절', // 8월 15일
        276: '추석 연휴', // 10월 3일
        277: '개천절', // 10월 4일
        278: '추석', // 10월 5일
        279: '추석 연휴', // 10월 6일
        282: '한글날', // 10월 9일
        359: '크리스마스', // 12월 25일
    }
};

// 날짜를 일년 중 몇 번째 날인지 계산하는 함수
const getDayOfYear = (year: number, month: number, day: number): number => {
    const date = new Date(year, month, day);
    const start = new Date(year, 0, 1);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
};

// 미니 캘린더 컴포넌트
const MiniCalendar = ({ events }: { events: DashboardEvent[] }) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // 이번 달의 첫날과 마지막날
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // 시작 요일 (0: 일요일)
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    // 날짜별 이벤트 맵 생성 (시작일~종료일 범위 포함)
    const eventsByDate = events.reduce((acc, event) => {
        const startDate = new Date(event.date);
        const startDay = startDate.getDate();

        // endDate는 start_date_time에서 계산 (백엔드에서 제공되지 않으면 시작일과 동일)
        // 만약 이벤트 객체에 endDate가 있다면 사용, 없으면 시작일과 동일하게 처리
        const endDay = startDay; // 기본값은 시작일과 동일

        // 시작일부터 종료일까지 모든 날짜에 이벤트 추가
        for (let day = startDay; day <= endDay; day++) {
            if (!acc[day]) acc[day] = [];
            acc[day].push(event);
        }
        return acc;
    }, {} as Record<number, DashboardEvent[]>);

    // 캘린더 그리드 생성
    const calendarDays = [];
    for (let i = 0; i < startDay; i++) {
        calendarDays.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push(i);
    }

    const today = now.getDate();
    const isToday = (day: number | null) => day === today;

    return (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="text-center mb-3">
                <h3 className="text-sm font-bold text-gray-900">
                    {year}년 {month + 1}월
                </h3>
            </div>

            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
                    <div
                        key={day}
                        className="text-center text-xs font-semibold"
                        style={{ color: idx === 0 ? '#ef4444' : idx === 6 ? '#3b82f6' : '#6b7280' }}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* 날짜 그리드 */}
            <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, idx) => {
                    const dayEvents = day ? eventsByDate[day] : null;
                    const hasEvent = dayEvents && dayEvents.length > 0;
                    const todayClass = isToday(day);

                    // 공휴일 체크
                    const dayOfYear = day ? getDayOfYear(year, month, day) : null;
                    const holidayName = dayOfYear && koreanHolidays[year.toString()]?.[dayOfYear];
                    const isHoliday = !!holidayName;

                    // 요일 인덱스 (일요일: 0)
                    const dayOfWeek = day ? new Date(year, month, day).getDay() : null;
                    const isSunday = dayOfWeek === 0;

                    return (
                        <div
                            key={idx}
                            className={`
                                aspect-square flex items-center justify-center rounded-lg text-xs font-medium
                                transition-all relative group cursor-pointer
                                ${day ? 'hover:bg-gray-200 hover:shadow-sm' : ''}
                                ${hasEvent ? 'bg-green-100 font-semibold' : ''}
                                ${!day ? 'text-transparent' : ''}
                            `}
                        >
                            {todayClass ? (
                                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-green-500 text-white font-bold">
                                    {day}
                                </span>
                            ) : (
                                <span className={isHoliday || isSunday ? 'text-red-500 font-bold' : 'text-gray-900'}>
                                    {day || '-'}
                                </span>
                            )}
                            {hasEvent && (
                                <>
                                    <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-green-600" />

                                    {/* 툴팁 - 일정 */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 pointer-events-none">
                                        <div className="bg-gray-900 text-white rounded-lg shadow-xl p-3 text-xs whitespace-nowrap max-w-xs">
                                            <div className="font-bold mb-1.5 text-center border-b border-gray-700 pb-1">
                                                {month + 1}월 {day}일
                                                {isHoliday && <span className="text-red-400 ml-1">({holidayName})</span>}
                                            </div>
                                            <div className="space-y-1.5">
                                                {dayEvents?.slice(0, 3).map((event, i) => (
                                                    <div key={i} className="flex items-start gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1 flex-shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium truncate">{event.title}</div>
                                                            <div className="text-gray-400 text-[10px]">{event.time}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {dayEvents && dayEvents.length > 3 && (
                                                    <div className="text-gray-400 text-[10px] text-center pt-1 border-t border-gray-700">
                                                        +{dayEvents.length - 3}개 더
                                                    </div>
                                                )}
                                            </div>
                                            {/* 화살표 */}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                                                <div className="w-2 h-2 bg-gray-900 rotate-45"></div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* 공휴일 툴팁 (일정이 없는 경우) */}
                            {isHoliday && !hasEvent && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 pointer-events-none">
                                    <div className="bg-gray-900 text-white rounded-lg shadow-xl px-3 py-2 text-xs whitespace-nowrap">
                                        <div className="font-bold text-center text-red-400">
                                            {holidayName}
                                        </div>
                                        {/* 화살표 */}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                                            <div className="w-2 h-2 bg-gray-900 rotate-45"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-center gap-3 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-600" />
                        <span>일정</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["dashboard"],
        queryFn: async () => {
            // 1) 참여 중인 그룹 목록
            const groups = await fetchMyGroups();

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
                const time = timeFull?.slice(0, 5) ?? "";

                return {
                    id: s.schedule_id,
                    title: s.title,
                    date,
                    time,
                    type: s.type,
                    color: s.color,
                };
            });

            // 4) 모든 그룹의 앨범 이미지 가져오기
            const groupDetails = await Promise.all(
                groups.map((group) => fetchGroupDetail(group.groupId))
            );

            // 5) 모든 앨범 이미지를 하나의 배열로 통합하고 날짜순 정렬
            const allPhotos: DashboardPhoto[] = groupDetails.flatMap((detail) =>
                detail.albums.map((url) => ({
                    url,
                    groupId: detail.groupId,
                    groupName: detail.name,
                    addedDate: new Date(), // 실제로는 API에서 날짜를 받아야 함
                }))
            );

            // 최근 순으로 정렬하고 상위 6개만
            const recentPhotos = allPhotos
                .sort((a, b) => b.addedDate.getTime() - a.addedDate.getTime())
                .slice(0, 6);

            // 6) 그룹에 이미지와 멤버 수 정보 추가
            const groupsWithDetails = groups.map((group) => {
                const detail = groupDetails.find(d => d.groupId === group.groupId);
                return {
                    ...group,
                    imageUrl: detail?.imageUrl || null,
                    memberCount: detail?.members.length || 0,
                };
            });

            return {
                groups: groupsWithDetails,
                events,
                recentPhotos,
            };
        },
    });

    if (isLoading) {
        return (
            <>
                <AppHeader />
                <div className="min-h-screen bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#2f7e33] border-t-transparent"></div>
                        <p className="text-lg font-medium text-gray-700">대시보드를 불러오는 중입니다...</p>
                        <p className="text-sm text-gray-500">잠시만 기다려주세요</p>
                    </div>
                </div>
            </>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-500">
                대시보드 데이터를 불러오는 중 오류가 발생했습니다.
                {error instanceof Error && (
                    <span className="ml-2 text-xs text-gray-500">
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
    } = data || {};

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30">
            <AppHeader />

            {/* 메인 콘텐츠 */}
            <main className="container py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2 text-gray-900">대시보드</h1>
                    <p className="text-gray-600">
                        이번 달 일정과 참여 중인 그룹, 최근 앨범을 한눈에 확인하세요.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* 좌측 - 빠른 작업 / 최근 앨범 */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* 빠른 작업 */}
                        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 hover:shadow-xl transition-shadow">
                            <h2 className="text-lg font-bold mb-4 text-gray-900">빠른 작업</h2>
                            <div className="space-y-3">
                                <Button
                                    className="w-full justify-start shadow-sm hover:shadow-md transition-all"
                                    style={{ backgroundColor: '#4a9d4e', color: 'white' }}
                                    asChild
                                >
                                    <Link to="/calendar">
                                        <Calendar className="mr-2 h-4 w-4" />
                                        일정 추가
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start border-2 hover:bg-green-50 transition-all"
                                    asChild
                                >
                                    <Link to="/groups">
                                        <Users className="mr-2 h-4 w-4" />
                                        그룹 만들기
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start border-2 hover:bg-green-50 transition-all"
                                    asChild
                                >
                                    <Link to="/albums">
                                        <Image className="mr-2 h-4 w-4" />
                                        앨범 보기
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        {/* 최근 앨범 */}
                        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-gray-900">최근 앨범</h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-600 hover:text-gray-900"
                                    asChild
                                >
                                    <Link to="/albums">전체보기</Link>
                                </Button>
                            </div>

                            {recentPhotos.length > 0 ? (
                                <div className="grid grid-cols-2 gap-3">
                                    {recentPhotos.map((photo, idx) => (
                                        <Link
                                            key={idx}
                                            to="/albums"
                                            className="group relative aspect-square rounded-xl overflow-hidden border-2 border-gray-100 hover:border-gray-300 hover:shadow-md transition-all"
                                        >
                                            <img
                                                src={photo.url}
                                                alt={photo.groupName}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-2">
                                                <p className="text-[10px] text-white font-medium truncate">
                                                    {photo.groupName}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    <Image size={32} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">
                                        최근 업로드된 사진이 없습니다.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 우측 - 일정 + 참여중인 그룹 */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* 일정 */}
                        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-gray-900">이번 달 일정</h2>
                                <div
                                    className="px-3 py-1 rounded-full text-sm font-bold shadow-sm"
                                    style={{ backgroundColor: '#e8f5e9', color: '#4a9d4e' }}
                                >
                                    {events.length}개
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* 일정 목록 */}
                                <div>
                                    {events.length > 0 ? (
                                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                            {events.slice(0, 8).map((event) => (
                                                <div
                                                    key={event.id}
                                                    className="p-3 bg-gradient-to-r from-green-50/50 to-emerald-50/30 rounded-lg border border-gray-100 hover:shadow-md transition-all"
                                                >
                                                    <h3 className="font-semibold text-sm text-gray-900 truncate">{event.title}</h3>
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        {event.date} • {event.time}
                                                    </p>
                                                    <span
                                                        className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium"
                                                        style={{ backgroundColor: '#e8f5e9', color: '#4a9d4e' }}
                                                    >
                                                        {event.type === "PERSONAL" ? "개인 일정" : event.type === "GROUP" ? "모임 일정" : event.type}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-gray-400">
                                            <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                                            <p className="text-xs">
                                                이번 달 등록된 일정이 없습니다.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* 미니 캘린더 */}
                                <div className="flex flex-col">
                                    <MiniCalendar events={events} />
                                </div>
                            </div>
                        </div>

                        {/* 참여중인 그룹 */}
                        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-gray-900">참여 중인 그룹</h2>
                                <div
                                    className="px-3 py-1 rounded-full text-sm font-bold shadow-sm"
                                    style={{ backgroundColor: '#e8f5e9', color: '#4a9d4e' }}
                                >
                                    {groups.length}개
                                </div>
                            </div>
                            {groups.length > 0 ? (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {groups.map((g) => (
                                        <Link
                                            key={g.groupId}
                                            to={`/groups/${g.groupId}`}
                                            className="group rounded-xl border-2 border-gray-100 hover:border-gray-300 hover:shadow-lg transition-all overflow-hidden bg-white"
                                        >
                                            {/* 대표 이미지 */}
                                            <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex items-center justify-center">
                                                {g.imageUrl ? (
                                                    <img
                                                        src={g.imageUrl}
                                                        alt={g.name}
                                                        className="max-w-full max-h-full object-contain"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = "none";
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Users size={40} className="text-gray-400 opacity-50" />
                                                    </div>
                                                )}

                                                {/* 멤버 수 뱃지 */}
                                                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm">
                                                    <Users size={12} className="text-white" />
                                                    <span className="text-xs font-bold text-white">{g.memberCount || 0}</span>
                                                </div>
                                            </div>

                                            {/* 그룹 정보 */}
                                            <div className="p-4">
                                                <h3 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors truncate">
                                                    {g.name}
                                                </h3>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    그룹 상세보기 →
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-400">
                                    <Users size={40} className="mx-auto mb-3 opacity-50" />
                                    <p className="text-sm">
                                        참여 중인 그룹이 없습니다.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;