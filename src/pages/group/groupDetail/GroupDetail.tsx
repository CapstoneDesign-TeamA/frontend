import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchGroupDetail } from "@/lib/api/groups";
import { fetchMeetings } from "@/lib/api/meetings";

import GroupHeader from "./components/GroupHeader.tsx";
import MembersCard from "./components/MembersCard.tsx";
import AlbumCard from "./components/AlbumCard";
import MeetingsCard from "./components/MeetingsCard";
import CalendarCard from "./components/CalendarCard";

const GroupDetail = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const parsedGroupId = Number(groupId);

    const { data: group } = useQuery({
        queryKey: ["groupDetail", parsedGroupId],
        queryFn: () => fetchGroupDetail(parsedGroupId),
    });

    const { data: meetings } = useQuery({
        queryKey: ["meetings", parsedGroupId],
        queryFn: () => fetchMeetings(parsedGroupId),
    });

    if (!group) return null;

    return (
        <div className="container py-10 space-y-8">
            <GroupHeader group={group} />

            <div className="flex gap-6 w-full">
                <div className="w-[320px] flex flex-col gap-6">
                    <MembersCard members={group.members} />
                    <AlbumCard albums={group.albums} groupId={parsedGroupId} />
                </div>

                <div className="flex-1 max-w-[800px]">
                    {/* 향후 피드 자리 */}
                </div>

                <div className="max-w-[420px] w-full flex flex-col gap-6">
                    <MeetingsCard
                        meetings={meetings ?? []}
                        groupId={parsedGroupId}
                        currentUserId={Number(localStorage.getItem("user_id"))}
                    />
                    <CalendarCard groupId={parsedGroupId} />
                </div>
            </div>
        </div>
    );
};

export default GroupDetail;