// src/pages/app/Calendar.tsx

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  X,
  Plus,
  Menu,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";

// === API 분리 버전 import ===
import {
  fetchMonthSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  Schedule,
} from "@/lib/api/calendar";

// ====================== 일정 추가/수정 모달 ======================
function ScheduleModal({
  onClose,
  onAddedOrUpdated,
  editingSchedule,
  onDelete,
}: {
  onClose: () => void;
  onAddedOrUpdated: (schedule: Schedule) => void;
  editingSchedule?: Schedule | null;
  onDelete?: (id: number) => void;
}) {
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    title: editingSchedule?.title || "",
    memo: editingSchedule?.memo || "",
    startDate: editingSchedule ? editingSchedule.startDateTime.split("T")[0] : today,
    endDate: editingSchedule ? editingSchedule.endDateTime.split("T")[0] : today,
    startTime: editingSchedule ? editingSchedule.startDateTime.slice(11, 16) : "09:00",
    endTime: editingSchedule ? editingSchedule.endDateTime.slice(11, 16) : "10:00",
  });

  const [saving, setSaving] = useState(false);

  const validate = () => {
    if (!form.title || !form.startDate || !form.endDate) {
      alert("제목, 시작일, 종료일은 필수입니다.");
      return false;
    }
    const start = new Date(`${form.startDate}T${form.startTime}:00`);
    const end = new Date(`${form.endDate}T${form.endTime}:00`);
    if (end < start) {
      alert("종료일시가 시작일시보다 빠릅니다.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload = {
      title: form.title,
      memo: form.memo,
      startDateTime: `${form.startDate}T${form.startTime}:00`,
      endDateTime: `${form.endDate}T${form.endTime}:00`,
      groupId: null,
    };

    try {
      setSaving(true);

      // 신규
      if (!editingSchedule) {
        const inserted = await createSchedule(payload);
        alert("일정이 등록되었습니다.");
        onAddedOrUpdated(inserted);
      }
      // 수정
      else {
        const updated = await updateSchedule(editingSchedule.scheduleId, payload);
        alert("일정이 수정되었습니다.");
        onAddedOrUpdated(updated);
      }

      onClose();
    } catch (e) {
      console.error("일정 저장 실패:", e);
      alert("일정 저장 중 오류");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = async () => {
    if (!editingSchedule) return;
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      await deleteSchedule(editingSchedule.scheduleId);
      alert("일정이 삭제되었습니다.");
      if (onDelete) onDelete(editingSchedule.scheduleId);
      onClose();
    } catch (e) {
      console.error("삭제 실패:", e);
      alert("삭제 중 오류");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-[520px] bg-white dark:bg-card p-6 rounded-xl shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {editingSchedule ? "일정 수정" : "새 일정 추가"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>

        {/* 폼 입력 */}
        <div className="space-y-4">
          {/* 제목 */}
          <div>
            <label className="text-sm block mb-1">제목 *</label>
            <input
              className="w-full border rounded p-2 text-sm"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>

          {/* 날짜 */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-sm block mb-1">시작 날짜 *</label>
              <input
                type="date"
                className="w-full border rounded p-2 text-sm"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              />
            </div>

            <div className="flex-1">
              <label className="text-sm block mb-1">종료 날짜 *</label>
              <input
                type="date"
                className="w-full border rounded p-2 text-sm"
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
              />
            </div>
          </div>

          {/* 시간 */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-sm block mb-1">시작 시간</label>
              <input
                type="time"
                className="w-full border rounded p-2 text-sm"
                value={form.startTime}
                onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
              />
            </div>
            <div className="flex-1">
              <label className="text-sm block mb-1">종료 시간</label>
              <input
                type="time"
                className="w-full border rounded p-2 text-sm"
                value={form.endTime}
                onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
              />
            </div>
          </div>

          {/* 메모 */}
          <div>
            <label className="text-sm block mb-1">메모</label>
            <textarea
              className="w-full border rounded p-2 text-sm"
              value={form.memo}
              onChange={(e) => setForm((f) => ({ ...f, memo: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          {editingSchedule && (
            <Button variant="destructive" onClick={handleDeleteClick}>
              <Trash2 size={16} className="mr-1" />
              삭제
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "저장 중..." : editingSchedule ? "수정" : "등록"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ====================== 메인 캘린더 페이지 ======================
const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  // month / week / year
  const [viewMode, setViewMode] = useState<"month" | "week" | "year">("month");

  const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];

  const topLabel =
    viewMode === "year"
      ? `${currentDate.getFullYear()}년`
      : viewMode === "week"
      ? `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`
      : `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`;

  /** 월 / 주 / 년 이동 */
  const changePeriod = (offset: number) => {
    const d = new Date(currentDate);

    if (viewMode === "month") d.setMonth(d.getMonth() + offset);
    else if (viewMode === "week") d.setDate(d.getDate() + offset * 7);
    else if (viewMode === "year") d.setFullYear(d.getFullYear() + offset);

    setCurrentDate(d);
  };

  /** 월별 일정 불러오기 */
  const loadMonth = useCallback(async () => {
    if (viewMode !== "month") return;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    const data = await fetchMonthSchedules(year, month);
    setSchedules(data);
  }, [currentDate, viewMode]);

  useEffect(() => {
    loadMonth();
  }, [loadMonth]);

  const handleAddedOrUpdated = (schedule: Schedule) => {
    setSchedules((prev) =>
      prev.some((s) => s.scheduleId === schedule.scheduleId)
        ? prev.map((s) => (s.scheduleId === schedule.scheduleId ? schedule : s))
        : [...prev, schedule]
    );
  };

  const handleDelete = (id: number) =>
    setSchedules((prev) => prev.filter((s) => s.scheduleId !== id));

  /** week 계산 */
  const getWeekDays = (date: Date) => {
    const curr = new Date(date);
    const day = curr.getDay();
    const diff = curr.getDate() - day;
    const start = new Date(curr.setDate(diff));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  /** year 계산 */
  const getYearMonths = () =>
    Array.from({ length: 12 }, (_, i) => new Date(currentDate.getFullYear(), i, 1));

  /** month view 계산 */
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const startWeekDay = firstDayOfMonth.getDay();
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const calendarDays = Array.from({ length: 42 }, (_, idx) => {
    const dateNum = idx - startWeekDay + 1;
    return dateNum < 1 || dateNum > daysInMonth ? null : dateNum;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary">
            Once
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/dashboard" className="hover:text-primary text-sm text-muted-foreground">
              대시보드
            </Link>
            <Link to="/calendar" className="text-sm font-medium text-primary">
              캘린더
            </Link>
            <Link to="/groups" className="hover:text-primary text-sm text-muted-foreground">
              그룹
            </Link>
            <Link to="/albums" className="hover:text-primary text-sm text-muted-foreground">
              앨범
            </Link>
          </nav>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu size={24} />
          </Button>
        </div>
      </header>

      {/* 메인 */}
      <main className="container py-8">
        <div className="rounded-xl bg-card p-6 shadow-card">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">{topLabel}</h2>

            <div className="flex gap-2 items-center">
              <Button
                variant={viewMode === "month" ? "default" : "outline"}
                onClick={() => setViewMode("month")}
              >
                월
              </Button>
              <Button
                variant={viewMode === "week" ? "default" : "outline"}
                onClick={() => setViewMode("week")}
              >
                주
              </Button>
              <Button
                variant={viewMode === "year" ? "default" : "outline"}
                onClick={() => setViewMode("year")}
              >
                년
              </Button>

              <Button variant="ghost" size="icon" onClick={() => changePeriod(-1)}>
                <ChevronLeft size={20} />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => changePeriod(1)}>
                <ChevronRight size={20} />
              </Button>

              <Button
                onClick={() => {
                  setEditingSchedule(null);
                  setShowModal(true);
                }}
              >
                <Plus size={18} className="mr-2" /> 일정 추가
              </Button>
            </div>
          </div>

          {/* ===== Month View ===== */}
          {viewMode === "month" && (
            <div className="grid grid-cols-7 gap-2">
              {daysOfWeek.map((d) => (
                <div
                  key={d}
                  className="text-center text-sm font-semibold text-muted-foreground py-2"
                >
                  {d}
                </div>
              ))}

              {calendarDays.map((day, i) => {
                if (!day) return <div key={i} className="aspect-square" />;

                const dateKey = `${currentDate.getFullYear()}-${String(
                  currentDate.getMonth() + 1
                ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

                const daySchedules = schedules.filter((s) =>
                  s.startDateTime.startsWith(dateKey)
                );

                return (
                  <div key={i} className="aspect-square rounded-lg border p-2">
                    <div className="mb-1 text-sm font-medium">{day}</div>

                    {daySchedules.map((s) => (
                      <div
                        key={s.scheduleId}
                        onClick={() => {
                          setEditingSchedule(s);
                          setShowModal(true);
                        }}
                        className="truncate cursor-pointer rounded px-1 py-0.5 text-xs bg-primary/10 text-primary"
                      >
                        {s.title}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          {/* ===== Week View ===== */}
          {viewMode === "week" && (
            <div className="grid grid-cols-7 gap-2">
              {getWeekDays(currentDate).map((day, idx) => {
                const dateKey = `${day.getFullYear()}-${String(
                  day.getMonth() + 1
                ).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;

                const daySchedules = schedules.filter((s) =>
                  s.startDateTime.startsWith(dateKey)
                );

                return (
                  <div key={idx} className="aspect-video rounded-lg border p-2">
                    <div className="mb-1 text-sm font-medium">
                      {day.getMonth() + 1}/{day.getDate()}
                    </div>

                    {daySchedules.map((s) => (
                      <div
                        key={s.scheduleId}
                        onClick={() => {
                          setEditingSchedule(s);
                          setShowModal(true);
                        }}
                        className="truncate cursor-pointer rounded px-1 py-0.5 text-xs bg-primary/10 text-primary"
                      >
                        {s.title}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          {/* ===== Year View ===== */}
          {viewMode === "year" && (
            <div className="grid grid-cols-3 gap-4">
              {getYearMonths().map((dt, idx) => (
                <div
                  key={idx}
                  className="border rounded-xl p-4 cursor-pointer hover:bg-muted/50"
                  onClick={() => {
                    const d = new Date(currentDate);
                    d.setMonth(idx);
                    setCurrentDate(d);
                    setViewMode("month");
                  }}
                >
                  <h3 className="font-bold text-center">{dt.getMonth() + 1}월</h3>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 모달 */}
      {showModal && (
        <ScheduleModal
          onClose={() => setShowModal(false)}
          onAddedOrUpdated={handleAddedOrUpdated}
          editingSchedule={editingSchedule}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default Calendar;
