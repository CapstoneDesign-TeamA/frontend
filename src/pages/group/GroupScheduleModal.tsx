// src/pages/group/GroupScheduleModal.tsx

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface GroupScheduleModalProps {
  defaultDate?: string;
  editingData?: {
    scheduleId: number;
    title: string;
    date: string;
    time?: string;
    location?: string;
    memo?: string;
  } | null;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    date: string;
    time: string;
    location: string;
    description?: string;
  }) => Promise<void> | void;
}

// 그룹 일정 추가 / 수정 모달
const GroupScheduleModal = ({
  defaultDate,
  editingData,
  onClose,
  onSubmit,
}: GroupScheduleModalProps) => {

  // 제목
  const [title, setTitle] = useState("");

  // 날짜
  const [date, setDate] = useState(defaultDate ?? "");

  // 시간 (백엔드 필수 → 기본값 00:00)
  const [time, setTime] = useState("00:00");

  // 장소
  const [location, setLocation] = useState("");

  // 메모
  const [memo, setMemo] = useState("");

  // 일정 수정 모드일 경우 기존 값 세팅
  useEffect(() => {
    if (editingData) {
      setTitle(editingData.title);
      setDate(editingData.date);
      setTime(editingData.time ?? "00:00");
      setLocation(editingData.location || "");
      setMemo(editingData.memo || "");
    }
  }, [editingData]);

  // 제출
  const handleSubmit = async () => {
    if (!title.trim() || !date.trim()) {
      alert("제목과 날짜는 필수입니다.");
      return;
    }

    await onSubmit({
      title,
      date,
      location,
      description : memo,
      time,         
    });

    onClose(); // 제출 후 모달 자동 닫기
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingData ? "일정 수정" : "그룹 일정 추가"}
          </DialogTitle>

          <DialogDescription>
            {editingData
              ? "선택한 일정 내용을 수정합니다."
              : "새로운 그룹 일정을 등록합니다."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">

          {/* 제목 */}
          <div>
            <label className="text-sm font-semibold">제목 *</label>
            <input
              className="w-full border rounded-lg p-2 mt-1 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 정기 모임"
            />
          </div>

          {/* 날짜 */}
          <div>
            <label className="text-sm font-semibold">날짜 *</label>
            <input
              type="date"
              className="w-full border rounded-lg p-2 mt-1 text-sm"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* 시간 */}
          <div>
            <label className="text-sm font-semibold">시간</label>
            <input
              type="time"
              className="w-full border rounded-lg p-2 mt-1 text-sm"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          {/* 장소 */}
          <div>
            <label className="text-sm font-semibold">장소</label>
            <input
              className="w-full border rounded-lg p-2 mt-1 text-sm"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="예: 강의동 225"
            />
          </div>

          {/* 메모 */}
          <div>
            <label className="text-sm font-semibold">메모</label>
            <textarea
              className="w-full border rounded-lg p-2 mt-1 text-sm"
              rows={3}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="추가 메모"
            />
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>

          <Button onClick={handleSubmit}>
            {editingData ? "수정" : "등록"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupScheduleModal;
