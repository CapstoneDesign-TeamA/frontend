import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Button } from "../../../../../../../../../../../Downloads/frontend-develop1/src/components/ui/button";
import { Link } from "react-router-dom";
import {
  X,
  Plus,
  Menu,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";

// ====================== axios 기본 URL ======================
axios.defaults.baseURL = "http://localhost:8080";

// ====================== 타입 정의 ======================
interface Schedule {
  scheduleId: number;
  title: string;
  memo?: string;
  startDateTime: string;
  endDateTime: string;
  type?: "PERSONAL" | "GROUP";
  color?: string;
}

interface MonthSchedulesResponse {
  schedules: Schedule[];
}

interface CreateScheduleResponse {
  scheduleId: number;
  message: string;
}

interface UpdateScheduleResponse {
  scheduleId: number;
  message: string;
}

interface DeleteScheduleResponse {
  message: string;
}

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
    startDate: editingSchedule
      ? editingSchedule.startDateTime.split("T")[0]
      : today,
    endDate: editingSchedule
      ? editingSchedule.endDateTime.split("T")[0]
      : today,
    startTime: editingSchedule
      ? editingSchedule.startDateTime.slice(11, 16)
      : "09:00",
    endTime: editingSchedule
      ? editingSchedule.endDateTime.slice(11, 16)
      : "10:00",
  });

  const [saving, setSaving] = useState(false);

  /** 유효성 검사 */
  const validate = () => {
    if (!form.title || !form.startDate || !form.endDate) {
      alert("제목, 시작일, 종료일은 필수입니다.");
      return false;
    }
    const start = new Date(`${form.startDate}T${form.startTime}`);
    const end = new Date(`${form.endDate}T${form.endTime}`);
    if (end < start) {
      alert("종료일시가 시작일시보다 빠릅니다.");
      return false;
    }
    return true;
  };

  /** 등록/수정 (실제 백엔드 연동) */
  const handleSubmit = async () => {
    if (!validate()) return;

    const requestBody = {
      title: form.title,
      memo: form.memo,
      startDateTime: `${form.startDate}T${form.startTime}`,
      endDateTime: `${form.endDate}T${form.endTime}`,
      // groupId: number | null 로 가야 하는데
      // 지금은 개인 일정만 다루니까 null로 고정
      groupId: null,
    };

    try {
      setSaving(true);

      // 신규 등록
      if (!editingSchedule) {
        const res = await axios.post<CreateScheduleResponse>(
          "/calendar",
          requestBody
        );

        const inserted: Schedule = {
          scheduleId: res.data.scheduleId,
          title: requestBody.title,
          memo: requestBody.memo,
          startDateTime: requestBody.startDateTime,
          endDateTime: requestBody.endDateTime,
          type: "PERSONAL",
        };

        alert(res.data.message || "일정이 등록되었습니다.");
        onAddedOrUpdated(inserted);
      }
      // 수정
      else {
        const res = await axios.put<UpdateScheduleResponse>(
          `/calendar/${editingSchedule.scheduleId}`,
          {
            title: requestBody.title,
            memo: requestBody.memo,
            startDateTime: requestBody.startDateTime,
            endDateTime: requestBody.endDateTime,
          }
        );

        const updated: Schedule = {
          ...editingSchedule,
          title: requestBody.title,
          memo: requestBody.memo,
          startDateTime: requestBody.startDateTime,
          endDateTime: requestBody.endDateTime,
        };

        alert(res.data.message || "일정이 수정되었습니다.");
        onAddedOrUpdated(updated);
      }

      onClose();
    } catch (err) {
      console.error("일정 저장 실패:", err);
      alert("일정 저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  /** 삭제 (실제 백엔드 연동) */
  const handleDelete = async () => {
    if (!editingSchedule) return;
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const res = await axios.delete<DeleteScheduleResponse>(
        `/calendar/${editingSchedule.scheduleId}`
      );
      alert(res.data.message || "일정이 삭제되었습니다.");

      if (onDelete) onDelete(editingSchedule.scheduleId);
      onClose();
    } catch (err) {
      console.error("삭제 실패:", err);
      alert("일정 삭제 중 오류가 발생했습니다.");
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

        <div className="space-y-4">
          {/* 제목 */}
          <div>
            <label className="text-sm block mb-1">제목 *</label>
            <input
              className="w-full border rounded p-2 text-sm"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
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
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    startDate: e.target.value,
                    // 필요하면 여기서 endDate 보정 가능
                  }))
                }
              />
            </div>
            <div className="flex-1">
              <label className="text-sm block mb-1">종료 날짜 *</label>
              <input
                type="date"
                className="w-full border rounded p-2 text-sm"
                value={form.endDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, endDate: e.target.value }))
                }
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
                onChange={(e) =>
                  setForm((f) => ({ ...f, startTime: e.target.value }))
                }
              />
            </div>
            <div className="flex-1">
              <label className="text-sm block mb-1">종료 시간</label>
              <input
                type="time"
                className="w-full border rounded p-2 text-sm"
                value={form.endTime}
                onChange={(e) =>
                  setForm((f) => ({ ...f, endTime: e.target.value }))
                }
              />
            </div>
          </div>

          {/* 메모 */}
          <div>
            <label className="text-sm block mb-1">메모</label>
            <textarea
              className="w-full border rounded p-2 text-sm"
              value={form.memo}
              onChange={(e) =>
                setForm((f) => ({ ...f, memo: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          {editingSchedule && (
            <Button variant="destructive" onClick={handleDelete}>
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

// ====================== 메인 캘린더 ======================
const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];
  const monthLabel = `${currentDate.getFullYear()}년 ${
    currentDate.getMonth() + 1
  }월`;

  /** 월별 일정 불러오기 (GET /calendar?year=&month=) */
  const loadMonth = useCallback(async () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    try {
      const res = await axios.get<MonthSchedulesResponse>(
        `/calendar?year=${year}&month=${month}`
      );
      setSchedules(res.data.schedules || []);
    } catch (err) {
      console.error("월별 일정 조회 실패:", err);
      setSchedules([]);
    }
  }, [currentDate]);

  useEffect(() => {
    loadMonth();
  }, [loadMonth]);

  /** 일정 추가/수정 반영 */
  const handleAddedOrUpdated = (schedule: Schedule) => {
    setSchedules((prev) => {
      const exists = prev.some((s) => s.scheduleId === schedule.scheduleId);
      return exists
        ? prev.map((s) =>
            s.scheduleId === schedule.scheduleId ? schedule : s
          )
        : [...prev, schedule];
    });
  };

  /** 삭제 반영 */
  const handleDelete = (id: number) => {
    setSchedules((prev) => prev.filter((s) => s.scheduleId !== id));
  };

  /** 월 이동 */
  const changeMonth = (offset: number) => {
    const d = new Date(currentDate);
    d.setMonth(currentDate.getMonth() + offset);
    setCurrentDate(d);
  };

  const ymd = (date: Date, day: number) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  };

  const calendarDays = Array.from({ length: 35 }, (_, i) => {
    const day = i - 2;
    return day > 0 && day <= 31 ? day : null;
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
            <Link
              to="/app/dashboard"
              className="hover:text-primary text-sm text-muted-foreground"
            >
              대시보드
            </Link>
            <Link
              to="/app/calendar"
              className="text-sm font-medium text-primary"
            >
              캘린더
            </Link>
            <Link
              to="/app/groups"
              className="hover:text-primary text-sm text-muted-foreground"
            >
              그룹
            </Link>
            <Link
              to="/app/albums"
              className="hover:text-primary text-sm text-muted-foreground"
            >
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
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">{monthLabel}</h2>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => changeMonth(-1)}>
                  <ChevronLeft size={20} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => changeMonth(1)}>
                  <ChevronRight size={20} />
                </Button>
              </div>
            </div>
            <Button
              onClick={() => {
                setEditingSchedule(null);
                setShowModal(true);
              }}
            >
              <Plus size={18} className="mr-2" /> 일정 추가
            </Button>
          </div>

          {/* 달력 */}
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
              if (!day) return <div key={i} />;

              const dateKey = ymd(currentDate, day);
              const daySchedules = schedules.filter((s) =>
                s.startDateTime.startsWith(dateKey)
              );

              return (
                <div
                  key={i}
                  className={`aspect-square rounded-lg border p-2 ${
                    daySchedules.length
                      ? "bg-primary/10 hover:bg-primary/20"
                      : "bg-background hover:bg-muted/50"
                  }`}
                >
                  <div className="mb-1 text-sm font-medium">{day}</div>
                  {daySchedules.map((s) => (
                    <div
                      key={s.scheduleId}
                      onClick={() => {
                        setEditingSchedule(s);
                        setShowModal(true);
                      }}
                      className="truncate cursor-pointer rounded px-1 py-0.5 text-left text-xs bg-primary/10 text-primary"
                    >
                      {s.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* 일정 모달 */}
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
