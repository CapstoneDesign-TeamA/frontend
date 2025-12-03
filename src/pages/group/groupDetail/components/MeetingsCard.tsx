import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import MeetingItem from "./MeetingItem";
import { Button } from "@/components/ui/button";

const MeetingsCard = ({
                          meetings,
                          groupId,
                          currentUserId,
                          onCreateMeeting,
                          onEditMeeting,
                          onDeleteMeeting,
                          onParticipate,
                          onDecline
                      }) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>모임 ({meetings.length})</CardTitle>

                <Button size="sm" onClick={onCreateMeeting}>
                    모임 생성
                </Button>
            </CardHeader>

            <CardContent className="space-y-3 max-h-60 overflow-y-auto">
                {meetings.length ? (
                    meetings.map((meeting) => (
                        <MeetingItem
                            key={meeting.id}
                            meeting={meeting}
                            currentUserId={currentUserId}
                            onParticipate={onParticipate}
                            onDecline={onDecline}
                            onEdit={onEditMeeting}
                            onDelete={onDeleteMeeting}
                        />
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground">
                        등록된 모임이 없습니다.
                    </p>
                )}
            </CardContent>
        </Card>
    );
};

export default MeetingsCard;