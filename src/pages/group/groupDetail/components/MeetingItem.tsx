import { useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";

const MeetingItem = ({
                         meeting,
                         currentUserId,
                         onParticipate,
                         onDecline,
                         onEdit,
                         onDelete,
                     }) => {
    const [tooltip, setTooltip] = useState({
        visible: false,
        x: 0,
        y: 0,
        title: "",
        items: [] as string[],
    });

    const participants = meeting.participants ?? [];
    const declined = meeting.declined ?? [];

    const showTooltip = (e, title, list) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltip({
            visible: true,
            x: rect.left + rect.width / 2,
            y: rect.bottom,
            title,
            items: list,
        });
    };

    const hideTooltip = () => setTooltip((t) => ({ ...t, visible: false }));

    return (
        <div className="relative rounded-lg border bg-muted/20 p-3 space-y-3">

            {/* Tooltip */}
            {tooltip.visible &&
                createPortal(
                    <div
                        className="fixed z-50 bg-gray-900 text-white border border-gray-700 shadow-xl rounded-md px-3 py-2 text-sm pointer-events-none"
                        style={{
                            top: tooltip.y + 4,
                            left: tooltip.x,
                            transform: "translate(-50%, 0)",
                            whiteSpace: "nowrap",
                        }}
                    >
                        <div className="font-semibold">{tooltip.title}</div>
                        {tooltip.items.length ? (
                            <ul className="mt-1 text-gray-300 text-xs space-y-1">
                                {tooltip.items.map((name, idx) => (
                                    <li key={idx}>• {name}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-xs text-gray-400">없음</p>
                        )}
                    </div>,
                    document.body
                )}

            {/* 제목 + 날짜 */}
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <span className="font-semibold text-base">{meeting.title}</span>
                    <span className="text-xs text-muted-foreground">
                        {meeting.startDate === meeting.endDate
                            ? meeting.startDate
                            : `${meeting.startDate} ~ ${meeting.endDate}`}
                    </span>
                </div>

                {/* 참여 / 불참 인원 */}
                <div className="flex gap-2 text-xs">
                    <div
                        className="bg-primary/10 text-primary px-2 py-1 rounded-md cursor-pointer"
                        onMouseEnter={(e) => showTooltip(e, "참여자", participants)}
                        onMouseLeave={hideTooltip}
                    >
                        참여 {participants.length}명
                    </div>

                    <div
                        className="bg-muted text-muted-foreground px-2 py-1 rounded-md cursor-pointer"
                        onMouseEnter={(e) => showTooltip(e, "불참자", declined)}
                        onMouseLeave={hideTooltip}
                    >
                        불참 {declined.length}명
                    </div>
                </div>
            </div>

            {/* 장소 */}
            {meeting.location && (
                <p className="text-sm text-muted-foreground">장소: {meeting.location}</p>
            )}

            {/* 설명 */}
            {meeting.description && (
                <p className="text-sm leading-5">{meeting.description}</p>
            )}

            {/* 버튼 영역 */}
            {meeting.creatorId === currentUserId ? (
                <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="secondary" onClick={() => onEdit(meeting)}>
                        수정
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(meeting.id)}>
                        삭제
                    </Button>
                </div>
            ) : (
                <div className="flex gap-2 justify-end">
                    <Button
                        size="sm"
                        className="bg-[#2f7e33] hover:bg-[#276a2c] text-white"
                        disabled={meeting.myStatus === "ACCEPTED"}
                        onClick={() => onParticipate(meeting.id)}
                    >
                        참여
                    </Button>

                    <Button
                        size="sm"
                        variant="outline"
                        disabled={meeting.myStatus === "DECLINED"}
                        onClick={() => onDecline(meeting.id)}
                    >
                        불참
                    </Button>
                </div>
            )}
        </div>
    );
};

export default MeetingItem;