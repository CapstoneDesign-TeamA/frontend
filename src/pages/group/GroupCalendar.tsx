// src/pages/group/GroupCalendar.tsx

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  fetchGroupSchedules,
  fetchGroupFreeBusy,
  fetchUnavailableWeeks,
  RawGroupSchedule
} from "@/lib/api/calendar";

interface GroupCalendarProps {
  groupId: number;
  onDateSelect: (date: string) => void;
}

const GroupCalendar = ({ groupId, onDateSelect }: GroupCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [groupSchedules, setGroupSchedules] = useState<
    { scheduleId: number; title: string; date: string; time?: string }[]
  >([]);
  const [freeDays, setFreeDays] = useState<string[]>([]);
  const [unavailableWeeks, setUnavailableWeeks] = useState<number[]>([]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const firstDay = new Date(year, month - 1, 1);
  const firstDayWeek = firstDay.getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const calendarGrid = Array.from({ length: 42 }, (_, i) => {
    const date = i - firstDayWeek + 1;
    return date < 1 || date > daysInMonth ? null : date;
  });

  const getWeekNumber = (day: number): number =>
    Math.floor((day + firstDayWeek - 1) / 7) + 1;

  // 데이터 로딩 
  const loadData = useCallback(async () => {
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = `${year}-${String(month).padStart(2, "0")}-${String(
      daysInMonth
    ).padStart(2, "0")}`;

    const schedules = await fetchGroupSchedules(groupId, year, month);
    setGroupSchedules(schedules);

    const fb = await fetchGroupFreeBusy(groupId, startDate, endDate);
    setFreeDays(fb.allMembersFreeDays ?? []);

    const un = await fetchUnavailableWeeks(groupId, year, month);
    setUnavailableWeeks(un.unavailableWeeks.map((w) => w.weekNumber));
  }, [groupId, year, month, daysInMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 날짜 색상 규칙 
  const getDayColor = (day: number): string => {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    const week = getWeekNumber(day);

    if (unavailableWeeks.includes(week)) {
      return "bg-red-200 border-red-600";
    }
    if (groupSchedules.some((s) => s.date === dateStr)) {
      return "bg-blue-200 border-blue-600";
    }
    if (freeDays.includes(dateStr)) {
      return "bg-green-200 border-green-600";
    }
    return "bg-muted border-muted-foreground/30";
  };

  const moveMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  return (
    <div className="w-full rounded-xl border bg-card p-4 shadow-sm space-y-4">
      {/* 헤더 */}
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

      {/* 요일 */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
          <div key={d} className="text-xs font-semibold text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 */}
      <div className="grid grid-cols-7 gap-1">
        {calendarGrid.map((day, i) => {
          if (!day) return <div key={i} className="aspect-square" />;

          const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(
            day
          ).padStart(2, "0")}`;

          const week = getWeekNumber(day);
          const isUnavailableWeek = unavailableWeeks.includes(week);

          return (
            <div
              key={i}
              className={`aspect-square rounded-lg border p-1 flex flex-col cursor-pointer relative ${getDayColor(
                day
              )}`}
              onClick={() => onDateSelect(dateStr)}
            >
              <span className="text-xs font-medium">{day}</span>

              {isUnavailableWeek && (
                <span className="absolute bottom-1 right-1 text-[10px] font-semibold text-red-700">
                  X
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GroupCalendar;
