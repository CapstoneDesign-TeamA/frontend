import { Button } from "@/components/ui/button";
import { useMeetingActions } from "../hooks/useMeetingActions";

const MeetingItem = ({ meeting, groupId, currentUserId }) => {
    const { participate, decline } = useMeetingActions(groupId);

    return (
        <div className="rounded-lg border bg-muted/20 p-3 space-y-2">

            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <span className="font-semibold">{meeting.title}</span>
                    <span className="text-xs text-muted-foreground">
            {meeting.startDate === meeting.endDate
                ? meeting.startDate
                : `${meeting.startDate} ~ ${meeting.endDate}`}
          </span>
                </div>

                <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md">
                    참여 {meeting.participantCount}명
                </div>
            </div>

            {meeting.creatorId !== currentUserId && (
                <div className="flex gap-2 justify-end pt-2">
                    <Button
                        size="sm"
                        className="bg-[#2f7e33] hover:bg-[#276a2c] text-white"
                        disabled={meeting.myStatus === "ACCEPTED"}
                        onClick={() => participate(meeting.id)}
                    >
                        참여
                    </Button>

                    <Button
                        size="sm"
                        variant="outline"
                        disabled={meeting.myStatus === "DECLINED"}
                        onClick={() => decline(meeting.id)}
                    >
                        불참
                    </Button>
                </div>
            )}
        </div>
    );
};

export default MeetingItem;