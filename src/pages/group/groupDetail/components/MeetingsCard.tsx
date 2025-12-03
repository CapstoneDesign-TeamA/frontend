import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import MeetingItem from "./MeetingItem.tsx";

const MeetingsCard = ({ meetings, groupId, currentUserId }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>모임 ({meetings.length})</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 max-h-60 overflow-y-auto">
                {meetings.length ? (
                    meetings.map((m) => (
                        <MeetingItem
                            key={m.id}
                            meeting={m}
                            groupId={groupId}
                            currentUserId={currentUserId}
                        />
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground">등록된 모임이 없습니다.</p>
                )}
            </CardContent>
        </Card>
    );
};

export default MeetingsCard;