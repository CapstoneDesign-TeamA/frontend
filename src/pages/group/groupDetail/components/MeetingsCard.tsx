import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import MeetingItem from "./MeetingItem";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

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
        <Card className="shadow-lg hover:shadow-xl transition-all border-2 border-gray-100">
            <CardHeader className="flex flex-row items-center justify-between pb-3 bg-gradient-to-r from-white to-gray-50">
                <div className="flex items-center gap-2">
                    <CardTitle className="text-lg font-bold text-gray-900">모임</CardTitle>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-sm font-bold shadow-md"
                         style={{ backgroundColor: '#2f7e33' }}>
                        <Calendar size={14} />
                        <span>{meetings.length}</span>
                    </div>
                </div>

                <Button
                    size="sm"
                    className="text-white shadow-md hover:shadow-lg transition-all hover:scale-105 rounded-full px-4"
                    style={{ backgroundColor: '#2f7e33' }}
                    onClick={onCreateMeeting}
                >
                    + 생성
                </Button>
            </CardHeader>

            <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
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
                    <div className="text-center py-8 text-gray-400">
                        <div className="text-4xl mb-2">📅</div>
                        <p className="text-sm">등록된 모임이 없습니다</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default MeetingsCard;