import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchGroupDetail, createInviteLink } from "@/lib/api/groups";
import {decline, fetchMeetings, participate} from "@/lib/api/meetings";

import AppHeader from "@/components/layout/AppHeader";

import GroupHeader from "./components/GroupHeader.tsx";
import MembersCard from "./components/MembersCard.tsx";
import AlbumCard from "./components/AlbumCard";
import MeetingsCard from "./components/MeetingsCard";
import CalendarCard from "./components/CalendarCard";
import FeedList from "./components/FeedList";
import { CreateMeetingModal } from "./components/CreateMeetingModal";
import CreatePostModal from "./components/CreatePostModal";

import { useToast } from "@/hooks/use-toast";
import sproutImg from "@/assets/sprout.png";

const GroupDetail = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const parsedGroupId = Number(groupId);
    const userId = Number(localStorage.getItem("user_id"));
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: group } = useQuery({
        queryKey: ["groupDetail", parsedGroupId],
        queryFn: () => fetchGroupDetail(parsedGroupId),
    });

    const { data: meetings } = useQuery({
        queryKey: ["meetings", parsedGroupId],
        queryFn: () => fetchMeetings(parsedGroupId),
    });

    const inviteMutation = useMutation({
        mutationFn: () => createInviteLink(parsedGroupId),
        onSuccess: (data) => {
            navigator.clipboard.writeText(data.invite_link);
            toast({
                title: "초대 링크가 복사되었습니다",
                description: "친구에게 전달해보세요!",
            });
        },
    });

    const participateMutation = useMutation({
        mutationFn: (meetingId: number) => participate(parsedGroupId, meetingId),
        onSuccess: () => {
            toast({
                title: "모임에 참여했습니다",
                description: "캘린더에 일정이 추가되었습니다.",
            });
            queryClient.invalidateQueries({ queryKey: ["meetings", parsedGroupId] });
        },
    });

    const declineMutation = useMutation({
        mutationFn: (meetingId: number) => decline(parsedGroupId, meetingId),
        onSuccess: () => {
            toast({
                title: "불참 처리되었습니다",
                description: "캘린더에서 일정이 삭제되었습니다.",
            });
            queryClient.invalidateQueries({ queryKey: ["meetings", parsedGroupId] });
        },
    });

    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [openPostModal, setOpenPostModal] = useState(false);
    const [editingMeeting, setEditingMeeting] = useState(null);

    const handleCreateMeeting = () => {
        setEditingMeeting(null);
        setOpenCreateModal(true);
    };

    // 사용자 프로필 이미지
    const userProfileImage = localStorage.getItem("user_profile_image") || "";

    if (!group) return null;

    return (
        <>
            <AppHeader />

            <div className="min-h-screen bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30">
                <div className="container py-10 space-y-8">

                    <GroupHeader
                        group={group}
                        onInvite={() => inviteMutation.mutate()}
                        invitePending={inviteMutation.isPending}
                    />

                    <div className="flex gap-8 w-full">

                        {/* 왼쪽 */}
                        <div className="w-[320px] flex flex-col gap-6 sticky top-6 self-start">
                            <MembersCard members={group.members} />
                            <AlbumCard albums={group.albums} groupId={parsedGroupId} />
                        </div>

                    {/* 가운데 */}
                    <div className="flex-1 max-w-[600px] space-y-6">
                        {/* ★ 게시글 작성 버튼 */}
                        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-4 hover:shadow-xl transition-all">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md"
                                     style={{ backgroundColor: '#e8f5e9' }}>
                                    {userProfileImage ? (
                                        <img
                                            src={userProfileImage}
                                            alt="profile"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = sproutImg;
                                                e.currentTarget.className = "w-7 h-7 object-contain";
                                            }}
                                        />
                                    ) : (
                                        <img src={sproutImg} alt="profile" className="w-7 h-7 object-contain" />
                                    )}
                                </div>
                                <button
                                    className="flex-1 text-left px-5 py-3.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-500 transition-all font-medium border border-gray-200"
                                    onClick={() => setOpenPostModal(true)}
                                >
                                    무슨 생각을 하고 계신가요?
                                </button>
                            </div>
                        </div>

                        <FeedList groupId={parsedGroupId} userId={userId} />
                    </div>

                        {/* 오른쪽 */}
                        <div className="max-w-[380px] w-full flex flex-col gap-6 sticky top-6 self-start">
                            <MeetingsCard
                                meetings={meetings ?? []}
                                groupId={parsedGroupId}
                                currentUserId={userId}
                                onCreateMeeting={handleCreateMeeting}
                                onEditMeeting={setEditingMeeting}
                                onDeleteMeeting={undefined}
                                onParticipate={(meetingId) => participateMutation.mutate(meetingId)}
                                onDecline={(meetingId) => declineMutation.mutate(meetingId)}
                            />
                            <CalendarCard groupId={parsedGroupId} />
                        </div>
                    </div>

                    {/* 모달들 */}
                    <CreateMeetingModal
                        open={openCreateModal}
                        onOpenChange={setOpenCreateModal}
                        groupId={parsedGroupId}
                        editingMeeting={editingMeeting}
                    />

                    <CreatePostModal
                        open={openPostModal}
                        onOpenChange={setOpenPostModal}
                        groupId={parsedGroupId}
                    />
                </div>
            </div>
        </>
    );
};

export default GroupDetail;