import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchGroupDetail, createInviteLink } from "@/lib/api/groups";
import { fetchMeetings } from "@/lib/api/meetings";

import Header from "@/components/layout/Header";

import GroupHeader from "./components/GroupHeader.tsx";
import MembersCard from "./components/MembersCard.tsx";
import AlbumCard from "./components/AlbumCard";
import MeetingsCard from "./components/MeetingsCard";
import CalendarCard from "./components/CalendarCard";
import FeedList from "./components/FeedList";
import { CreateMeetingModal } from "./components/CreateMeetingModal";
import CreatePostModal from "./components/CreatePostModal"; // ★ 추가

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button.tsx";
import { Menu } from "lucide-react";

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

    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [openPostModal, setOpenPostModal] = useState(false); // ★ 추가
    const [editingMeeting, setEditingMeeting] = useState(null);

    const handleCreateMeeting = () => {
        setEditingMeeting(null);
        setOpenCreateModal(true);
    };

    if (!group) return null;

    return (
        <>
            <header className="border-b bg-card">
                <div className="container flex h-16 items-center justify-between">
                    <Link to="/" className="text-2xl font-bold text-primary">
                        Once
                    </Link>
                    <nav className="hidden md:flex items-center gap-6">
                        <Link to="/dashboard" className="text-sm font-medium text-primary">
                            대시보드
                        </Link>
                        <Link to="/calendar" className="text-sm font-medium text-muted-foreground hover:text-primary">
                            캘린더
                        </Link>
                        <Link to="/groups" className="text-sm font-medium text-muted-foreground hover:text-primary">
                            그룹
                        </Link>
                        <Link to="/albums" className="text-sm font-medium text-muted-foreground hover:text-primary">
                            앨범
                        </Link>
                    </nav>
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu size={24} />
                    </Button>
                </div>
            </header>

            <div className="container py-10 space-y-8">

                <GroupHeader
                    group={group}
                    onInvite={() => inviteMutation.mutate()}
                    invitePending={inviteMutation.isPending}
                />

                <div className="flex gap-6 w-full">

                    {/* 왼쪽 */}
                    <div className="w-[320px] flex flex-col gap-6">
                        <MembersCard members={group.members} />
                        <AlbumCard albums={group.albums} groupId={parsedGroupId} />
                    </div>

                    {/* 가운데 */}
                    <div className="flex-1 max-w-[800px]">
                        {/* ★ 게시글 작성 버튼 */}
                        <Button className="mb-4" onClick={() => setOpenPostModal(true)}>
                            게시글 작성
                        </Button>

                        <FeedList groupId={parsedGroupId} userId={userId} />
                    </div>

                    {/* 오른쪽 */}
                    <div className="max-w-[420px] w-full flex flex-col gap-6">
                        <MeetingsCard
                            meetings={meetings ?? []}
                            groupId={parsedGroupId}
                            currentUserId={userId}
                            onCreateMeeting={handleCreateMeeting}
                            onEditMeeting={setEditingMeeting} onDeleteMeeting={undefined} onParticipate={undefined}
                            onDecline={undefined}                        />
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
                    userId={userId}
                />
            </div>
        </>
    );
};

export default GroupDetail;