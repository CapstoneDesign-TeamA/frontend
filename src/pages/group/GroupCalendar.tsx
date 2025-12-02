// src/pages/group/GroupCalendar.tsx

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
    fetchGroupSchedules,
    fetchMonthSchedules
} from "@/lib/api/calendar";

import { fetchMeetings } from "@/lib/api/meetings";

const HOLIDAYS: Record<string, string> = {
    "2025-01-01": "신정",
    "2025-01-28": "설날 연휴",
    "2025-01-29": "설날",
    "2025-01-30": "설날 연휴",
    "2025-03-01": "삼일절",
    "2025-05-05": "어린이날",
    "2025-05-06": "대체공휴일",
    "2025-05-12": "부처님 오신 날",
    "2025-06-06": "현충일",
    "2025-08-15": "광복절",
    "2025-10-03": "개천절",
    "2025-10-04": "추석 연휴",
    "2025-10-05": "추석",
    "2025-10-06": "추석 연휴 + 한글날",
    "2025-12-25": "성탄절",

    "2026-01-01": "신정",
    "2026-02-16": "설날 연휴",
    "2026-02-17": "설날",
    "2026-02-18": "설날 연휴",
    "2026-03-01": "삼일절",
    "2026-03-02": "대체공휴일",
    "2026-05-05": "어린이날",
    "2026-05-31": "부처님 오신 날",
    "2026-06-06": "현충일",
    "2026-08-15": "광복절",
    "2026-09-24": "추석 연휴",
    "2026-09-25": "추석",
    "2026-09-26": "추석 연휴",
    "2026-10-03": "개천절",
    "2026-10-09": "한글날",
    "2026-12-25": "성탄절"
};

function isHoliday(dateStr: string): string | null {
    return HOLIDAYS[dateStr] || null;
}

interface GroupCalendarProps {
    groupId: number;
    onDateSelect?: (date: string) => void;
}

interface Meeting {
    id: number;
    title: string;
    startDate: string;
    endDate: string;
}

const GroupCalendar = ({ groupId, onDateSelect }: GroupCalendarProps) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const [groupSchedules, setGroupSchedules] = useState<
        { scheduleId: number; title: string; date: string }[]
    >([]);

    const [meetings, setMeetings] = useState<Meeting[]>([]);

    const [personalSchedules, setPersonalSchedules] = useState<
        { title: string; startDate: string; endDate: string; userName: string; userId: number }[]
    >([]);

    const [personalCountByDay, setPersonalCountByDay] = useState<Record<string, number>>({});

    const [tooltip, setTooltip] = useState<{
        visible: boolean;
        x: number;
        y: number;
        title: string;
        items: string[];
    }>({
        visible: false,
        x: 0,
        y: 0,
        title: "",
        items: []
    });

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    const firstDay = new Date(year, month - 1, 1);
    const firstDayWeek = firstDay.getDay();
    const daysInMonth = new Date(year, month, 0).getDate();

    const calendarGrid = Array.from({ length: 42 }, (_, i) => {
        const date = i - firstDayWeek + 1;
        return date < 1 || date > daysInMonth ? null : date;
    });

    // 데이터 로드
    const loadData = useCallback(async () => {
        const schedules = await fetchGroupSchedules(groupId, year, month);
        setGroupSchedules(schedules);

        const meetingList = await fetchMeetings(groupId);
        setMeetings(meetingList);

        const personal = await fetchMonthSchedules(year, month);

        const filteredPersonal = personal
            .filter((s) => s.type === "PERSONAL")
            .map((s) => ({
                title: s.title,
                startDate: s.startDateTime.substring(0, 10),
                endDate: s.endDateTime.substring(0, 10),
                userName: s.userName,
                userId: s.userId
            }));

        setPersonalSchedules(filteredPersonal);

        const newCounts: Record<string, number> = {};
        filteredPersonal.forEach((s) => {
            const cur = new Date(s.startDate);
            const end = new Date(s.endDate);
            while (cur <= end) {
                const key = cur.toISOString().slice(0, 10);
                newCounts[key] = (newCounts[key] ?? 0) + 1;
                cur.setDate(cur.getDate() + 1);
            }
        });

        setPersonalCountByDay(newCounts);
    }, [groupId, year, month, daysInMonth]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const isMeetingDay = (dateStr: string): boolean => {
        return meetings.some((m) => dateStr >= m.startDate && dateStr <= m.endDate);
    };

    const getPersonalOpacity = (count: number): string => {
        if (count === 1) return "bg-opacity-50";
        if (count === 2) return "bg-opacity-70";
        if (count >= 3) return "bg-opacity-100";
        return "bg-opacity-20";
    };

    const showTooltip = (e: React.MouseEvent, title: string, items: string[]) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setTooltip({
            visible: true,
            x: rect.left + rect.width / 2,
            y: rect.bottom,
            title,
            items
        });
    };

    const hideTooltip = () => setTooltip((t) => ({ ...t, visible: false }));

    const moveMonth = (offset: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentDate(newDate);
    };

    return (
        <div className="relative">
            {tooltip.visible &&
                createPortal(
                    <div
                        className="fixed z-50 bg-gray-900 text-white border border-gray-700 shadow-xl rounded-md px-3 py-2 text-sm pointer-events-none"
                        style={{
                            top: tooltip.y + 4,
                            left: tooltip.x,
                            transform: "translate(-50%, 0)",
                            whiteSpace: "nowrap"
                        }}
                    >
                        <div className="font-semibold text-white">{tooltip.title}</div>
                        {tooltip.items.length > 0 && (
                            <ul className="mt-1 text-gray-300 text-xs space-y-1">
                                {tooltip.items.map((t, idx) => (
                                    <li key={idx}>• {t}</li>
                                ))}
                            </ul>
                        )}
                    </div>,
                    document.body
                )}

            <div className="w-full rounded-xl border bg-card p-4 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                        {year}년 {month}월
                    </h2>
                    <div className="flex gap-2">
                        <Button size="icon" variant="ghost" onClick={() => moveMonth(-1)}>
                            <ChevronLeft />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => moveMonth(1)}>
                            <ChevronRight />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center">
                    {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
                        <div key={d} className="text-xs font-semibold text-muted-foreground">
                            {d}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {calendarGrid.map((day, i) => {
                        if (!day) return <div key={i} className="aspect-square" />;

                        const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(
                            day
                        ).padStart(2, "0")}`;

                        const personalCount = personalCountByDay[dateStr] ?? 0;

                        let bgColor = "bg-muted";

                        if (personalCount > 0) {
                            bgColor = `bg-orange-400 ${getPersonalOpacity(personalCount)}`;
                        }

                        if (isMeetingDay(dateStr)) {
                            bgColor = "bg-green-200 border-green-600";
                        }

                        const holidayName = isHoliday(dateStr);
                        if (holidayName) {
                            bgColor = "bg-red-300 border-red-600";
                        }

                        return (
                            <div
                                key={i}
                                className={`aspect-square rounded-lg border p-1 flex flex-col cursor-pointer relative transition-all ${bgColor}`}
                                onClick={() => onDateSelect?.(dateStr)}
                                onMouseEnter={(e) => {
                                    const items: string[] = [];

                                    meetings
                                        .filter((m) => dateStr >= m.startDate && dateStr <= m.endDate)
                                        .forEach((m) => items.push(m.title));

                                    personalSchedules
                                        .filter((s) => s.startDate <= dateStr && dateStr <= s.endDate)
                                        .forEach((s) => items.push(`${s.userName} (개인 일정)`));

                                    if (holidayName) items.unshift(holidayName);

                                    if (items.length === 0) {
                                        showTooltip(e, "일정 없음", []);
                                    } else {
                                        showTooltip(e, "일정", items);
                                    }
                                }}
                                onMouseLeave={hideTooltip}
                            >
                                <span className="text-xs font-medium">{day}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-6 text-sm text-muted-foreground justify-center">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-300 border border-red-600"></div>
                    <span>공휴일</span>
                </div>

                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-200 border border-green-600"></div>
                    <span>그룹 모임</span>
                </div>

                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-orange-400 bg-opacity-50 border border-orange-500"></div>
                    <span>개인 일정</span>
                </div>
            </div>
        </div>
    );
};

export default GroupCalendar;