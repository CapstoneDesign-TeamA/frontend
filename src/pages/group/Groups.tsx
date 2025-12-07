// src/pages/group/Group.tsx

import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Plus as PlusIcon, Users, Link as LinkIcon } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMyGroups, createGroup, Group, fetchGroupDetail } from "@/lib/api/groups";
import { fetchMeetings } from "@/lib/api/meetings";
import { CreateGroupModal, CreateGroupPayload } from "@/components/groups/CreateGroupModal";
import { useState } from "react";
import AppHeader from "@/components/layout/AppHeader";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Groups = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // 내 그룹 목록 가져오기
    const { data, isLoading: groupsLoading, isError, error } = useQuery<Group[]>({
        queryKey: ["groups", "mine"],
        queryFn: fetchMyGroups,
        retry: 1,
    });

    // 그룹 상세 정보 가져오기 (이미지와 멤버 수 포함)
    const { data: groupDetails, isLoading: detailsLoading } = useQuery({
        queryKey: ["groupsWithDetails", data?.map((g) => g.groupId)],
        queryFn: async () => {
            if (!data || data.length === 0) return [];
            const details = await Promise.all(
                data.map((group) => fetchGroupDetail(group.groupId))
            );
            return details;
        },
        enabled: !!data && data.length > 0,
    });

    // 각 그룹의 모임 정보 가져오기
    const { data: allMeetings, isLoading: meetingsLoading } = useQuery({
        queryKey: ["allGroupMeetings", data?.map((g) => g.groupId)],
        queryFn: async () => {
            if (!data || data.length === 0) return {};
            const meetingsData = await Promise.all(
                data.map(async (group) => {
                    try {
                        // groupId 유효성 검사
                        if (!group.groupId || !Number.isFinite(group.groupId)) {
                            console.warn(`Invalid groupId: ${group.groupId}`);
                            return { groupId: group.groupId || 0, count: 0 };
                        }

                        const meetings = await fetchMeetings(group.groupId);
                        // 오늘 이후의 모임만 카운트
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const upcomingMeetings = meetings.filter((m) => {
                            const meetingDate = new Date(m.startDate);
                            return meetingDate >= today;
                        });
                        return { groupId: group.groupId, count: upcomingMeetings.length };
                    } catch (error) {
                        console.error(`Error fetching meetings for group ${group.groupId}:`, error);
                        return { groupId: group.groupId || 0, count: 0 };
                    }
                })
            );
            // { groupId: count } 형태의 객체로 변환
            return meetingsData.reduce((acc, item) => {
                if (item.groupId) {
                    acc[item.groupId] = item.count;
                }
                return acc;
            }, {} as Record<number, number>);
        },
        enabled: !!data && data.length > 0,
    });

    const isLoading = groupsLoading || detailsLoading || meetingsLoading;

    // 그룹 생성 요청
    const createMutation = useMutation({
        mutationFn: (payload: CreateGroupPayload) => createGroup(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["groups", "mine"] });
            queryClient.invalidateQueries({ queryKey: ["groupsWithDetails"] });
            queryClient.invalidateQueries({ queryKey: ["allGroupMeetings"] });
            alert("그룹이 생성되었습니다.");
        },
        onError: (err: unknown) => {
            const msg = err instanceof Error ? err.message : "그룹 생성 중 오류가 발생했습니다.";
            alert(msg);
        },
    });

    // 그룹 목록과 상세 정보 병합
    const groupsWithDetails = data?.map((group) => {
        const detail = groupDetails?.find((d) => d.groupId === group.groupId);
        const upcomingEvents = allMeetings?.[group.groupId] || 0;
        return {
            ...group,
            imageUrl: detail?.imageUrl || null,
            membersCount: detail?.members?.length || 0,
            upcomingEvents,
        };
    }) || [];

    const [openCreate, setOpenCreate] = useState(false);
    const [openJoinModal, setOpenJoinModal] = useState(false);
    const [inviteToken, setInviteToken] = useState("");

    const handleCreateSubmit = (payload: CreateGroupPayload) => {
        createMutation.mutate(payload, { onSuccess: () => setOpenCreate(false) });
    };

    const handleJoinGroup = () => {
        if (!inviteToken.trim()) {
            alert("초대 링크 또는 토큰을 입력해주세요.");
            return;
        }

        // 전체 URL인 경우 토큰만 추출
        let token = inviteToken.trim();
        if (token.includes("?token=")) {
            const urlParams = new URLSearchParams(token.split("?")[1]);
            token = urlParams.get("token") || token;
        }

        // 초대 수락 페이지로 이동
        navigate(`/invite?token=${token}`);
    };

    // 로딩 중
    if (isLoading) {
        return (
            <>
                <AppHeader />
                <div className="min-h-screen bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#2f7e33] border-t-transparent"></div>
                        <p className="text-lg font-medium text-gray-700">그룹 목록을 불러오는 중입니다...</p>
                        <p className="text-sm text-gray-500">잠시만 기다려주세요</p>
                    </div>
                </div>
            </>
        );
    }

    // 에러 발생
    if (isError) {
        return (
            <div className="min-h-screen flex items-center justify-center text-center">
                <div>
                    <p>그룹 정보를 가져오는 중 오류가 발생했습니다.</p>
                    <p className="text-muted-foreground text-sm mt-2">{String(error)}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30">
            <AppHeader />

            {/* 본문 */}
            <main className="container py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">내 그룹</h1>
                        <p className="text-muted-foreground">
                            참여 중인 그룹: {groupsWithDetails.length}개
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            onClick={() => setOpenJoinModal(true)}
                            variant="outline"
                            className="border-[#2f7e33] text-[#2f7e33] hover:bg-[#2f7e33] hover:text-white"
                        >
                            <LinkIcon className="mr-2 h-4 w-4" /> 초대 링크로 참여
                        </Button>

                        <Button
                            onClick={() => setOpenCreate(true)}
                            disabled={createMutation.isPending}
                            className="bg-[#2f7e33] text-white hover:bg-[#2f7e33]/90"
                        >
                            <PlusIcon className="mr-2 h-4 w-4" /> 새 그룹 만들기
                        </Button>
                    </div>
                </div>

                {/* 그룹 목록 */}
                {groupsWithDetails.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groupsWithDetails.map((group) => (
                            <div
                                key={group.groupId}
                                onClick={() => navigate(`/groups/${group.groupId}`)}
                                className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 hover:shadow-xl hover:border-[#2f7e33]/30 transition-all cursor-pointer overflow-hidden"
                            >
                                {/* 그룹 대표 이미지 */}
                                <div className="h-40 bg-gradient-to-br from-green-50 to-emerald-50 relative overflow-hidden flex items-center justify-center">
                                    {group.imageUrl ? (
                                        <img
                                            src={group.imageUrl}
                                            alt={group.name}
                                            className="max-h-full max-w-full object-contain"
                                            onError={(e) => {
                                                e.currentTarget.style.display = "none";
                                                const parent = e.currentTarget.parentElement;
                                                if (parent) {
                                                    parent.innerHTML = "";
                                                }
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Users size={48} className="text-[#2f7e33] opacity-40" />
                                        </div>
                                    )}
                                </div>

                                {/* 그룹 정보 */}
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-3 text-gray-900">{group.name}</h3>

                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Users size={16} className="text-[#2f7e33]" />
                                            <span>멤버 {group.membersCount ?? 0}명</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[#2f7e33]">📅</span>
                                            <span>
                                                예정된 일정{" "}
                                                <span className="font-medium text-gray-900">
                                                    {group.upcomingEvents ?? 0}개
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center mt-20">
                        <Users size={48} className="mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">참여 중인 그룹이 없습니다</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                            새로운 그룹을 만들어 친구들과 활동을 시작해보세요.
                        </p>

                        <Button onClick={() => setOpenCreate(true)}>
                            <PlusIcon className="mr-2 h-4 w-4" /> 새 그룹 만들기
                        </Button>
                    </div>
                )}

                {/* 그룹 생성 모달 */}
                <CreateGroupModal
                    open={openCreate}
                    onClose={() => setOpenCreate(false)}
                    onSubmit={handleCreateSubmit}
                    loading={createMutation.isPending}
                />

                {/* 초대 링크로 참여하기 모달 */}
                <Dialog open={openJoinModal} onOpenChange={setOpenJoinModal}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>초대 링크로 그룹 참여</DialogTitle>
                            <DialogDescription>
                                받은 초대 링크 또는 토큰을 입력하여 그룹에 참여하세요.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="inviteToken">초대 링크 또는 토큰</Label>
                                <Input
                                    id="inviteToken"
                                    placeholder="https://once.com/invite?token=... 또는 토큰만 입력"
                                    value={inviteToken}
                                    onChange={(e) => setInviteToken(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleJoinGroup();
                                        }
                                    }}
                                />
                                <p className="text-xs text-gray-500">
                                    전체 URL 또는 토큰 문자열만 입력하세요
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={handleJoinGroup}
                                    className="flex-1 bg-[#2f7e33] text-white hover:bg-[#2f7e33]/90"
                                >
                                    참여하기
                                </Button>
                                <Button
                                    onClick={() => {
                                        setOpenJoinModal(false);
                                        setInviteToken("");
                                    }}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    취소
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

            </main>
        </div>
    );
};

export default Groups;
