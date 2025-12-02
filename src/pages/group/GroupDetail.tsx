import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import { useToast } from "@/hooks/use-toast";

import {
    fetchGroupDetail,
    GroupDetailData,
    uploadGroupAlbum,
    leaveGroup,
    deleteGroup,
    createInviteLink,
} from "@/lib/api/groups";

import {
    fetchMeetings,
    participate,
    decline,
    deleteMeeting,
} from "@/lib/api/meetings";
import type { Meeting } from "@/lib/api/meetings";

import {CreateMeetingModal} from "@/components/groups/CreateMeetingModal";
import GroupCalendar from "./GroupCalendar";

// -------------------
// 사진 업로드 검증 스키마
// -------------------


const uploadSchema = z.object({
    title: z.string().min(1, "제목을 입력해주세요."),
    description: z.string().optional(),
    file: z
        .custom<File>((val) => val instanceof File && val.size > 0, {
            message: "이미지 파일을 선택해주세요.",
        })
        .refine((file) => (file ? file.type.startsWith("image/") : true), {
            message: "이미지 파일만 업로드할 수 있습니다.",
        }),
});

const GroupDetail = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const parsedGroupId = useMemo(() => Number(groupId), [groupId]);

    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const [photoModalOpen, setPhotoModalOpen] = useState(false);
    const [meetingModalOpen, setMeetingModalOpen] = useState(false);
    const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
    const currentUserId = Number(localStorage.getItem("user_id"));

    // -------------------
    // 사진 업로드 Form
    // -------------------
    const uploadForm = useForm<z.infer<typeof uploadSchema>>({
        resolver: zodResolver(uploadSchema),
        defaultValues: {
            title: "",
            description: "",
            file: undefined,
        },
    });

    // -------------------
    // 그룹 상세 조회
    // -------------------
    const {
        data: group,
        isLoading,
        isError,
    } = useQuery<GroupDetailData>({
        queryKey: ["groupDetail", parsedGroupId],
        queryFn: () => fetchGroupDetail(parsedGroupId),
        enabled: Number.isFinite(parsedGroupId),
    });

    // -------------------
    // 모임 목록 조회
    // -------------------
    const { data: meetings } = useQuery({
        queryKey: ["meetings", parsedGroupId],
        queryFn: () => fetchMeetings(parsedGroupId),
        enabled: Number.isFinite(parsedGroupId),
    });

    // -------------------
    // 사진 업로드
    // -------------------
    const uploadMutation = useMutation({
        mutationFn: (payload: {
            groupId: number;
            title: string;
            description?: string;
            file: File;
        }) => uploadGroupAlbum(payload),
        onSuccess: () => {
            toast({
                title: "업로드 완료",
                description: "사진이 앨범에 추가되었습니다.",
            });
            queryClient.invalidateQueries({
                queryKey: ["groupDetail", parsedGroupId],
            });
            uploadForm.reset();
            setPhotoModalOpen(false);
        },
    });

    const handlePhotoSubmit = (data: z.infer<typeof uploadSchema>) => {
        uploadMutation.mutate({
            groupId: parsedGroupId,
            title: data.title,
            description: data.description,
            file: data.file as File,
        });
    };

    // -------------------
    // 그룹 나가기
    // -------------------
    const leaveMutation = useMutation({
        mutationFn: () => leaveGroup(parsedGroupId),
        onSuccess: () => {
            toast({
                title: "그룹 나가기 완료",
                description: "그룹에서 성공적으로 나갔습니다.",
            });
            queryClient.invalidateQueries({ queryKey: ["groups", "mine"] });
            navigate("/groups");
        },
    });

    const handleLeaveGroup = () => {
        if (!window.confirm("정말 그룹에서 나가시겠습니까?")) return;
        leaveMutation.mutate();
    };

    // -------------------
    // 그룹 삭제
    // -------------------
    const deleteMutation = useMutation({
        mutationFn: () => deleteGroup(parsedGroupId),
        onSuccess: () => {
            toast({
                title: "그룹 삭제 완료",
                description: "그룹이 성공적으로 삭제되었습니다.",
            });
            queryClient.invalidateQueries({ queryKey: ["groups", "mine"] });
            navigate("/groups");
        },
    });

    // -------------------
    // 초대 링크 생성
    // -------------------
    const inviteMutation = useMutation({
        mutationFn: () => createInviteLink(parsedGroupId),
        onSuccess: (data) => {
            navigator.clipboard.writeText(data.invite_link);
            toast({
                title: "초대 링크 복사됨",
                description: "친구에게 공유해보세요!",
            });
        },
        onError: () => {
            toast({
                title: "초대 링크 생성 실패",
                description: "다시 시도해주세요.",
            });
        },
    });

    // -------------------
    // 참여 / 불참
    // -------------------
    const participateMutation = useMutation({
        mutationFn: (meetingId: number) =>
            participate(parsedGroupId, meetingId),
        onSuccess: () => {
            toast({ title: "참여 완료" });
            queryClient.invalidateQueries({ queryKey: ["meetings", parsedGroupId] });
        },
    });

    const declineMutation = useMutation({
        mutationFn: (meetingId: number) =>
            decline(parsedGroupId, meetingId),
        onSuccess: () => {
            toast({ title: "불참 처리됨" });
            queryClient.invalidateQueries({ queryKey: ["meetings", parsedGroupId] });
        },
    });

    const deleteMeetingMutation = useMutation({
        mutationFn: (meetingId: number) =>
            deleteMeeting(parsedGroupId, meetingId),
        onSuccess: () => {
            toast({ title: "모임이 삭제되었습니다." });
            queryClient.invalidateQueries({ queryKey: ["meetings", parsedGroupId] });
        },
    });

    // -------------------
    // 로딩 / 오류 처리
    // -------------------
    if (!Number.isFinite(parsedGroupId))
        return <div className="container py-10 text-center">유효하지 않은 그룹입니다.</div>;
    if (isLoading)
        return <div className="container py-10 text-center">그룹 정보를 불러오는 중입니다...</div>;
    if (isError || !group)
        return <div className="container py-10 text-center">그룹 정보를 가져오지 못했습니다.</div>;

    // ============================
    // 렌더링 시작
    // ============================

    return (
        <div className="min-h-screen bg-background">

            {/* HEADER */}
            <header className="border-b bg-card">
                <div className="container flex h-16 items-center justify-between">
                    <h1 className="text-2xl font-bold text-primary">Once</h1>

                    <nav className="hidden md:flex items-center gap-6">
                        <a href="/dashboard" className="text-sm">대시보드</a>
                        <a href="/calendar" className="text-sm">캘린더</a>
                        <a href="/groups" className="text-sm text-primary">그룹</a>
                        <a href="/albums" className="text-sm">앨범</a>
                    </nav>
                </div>
            </header>

            <main className="container space-y-10 py-10">

                {/* ------------------- */}
                {/* 그룹 헤더 */}
                {/* ------------------- */}
                <section className="flex flex-col gap-6 rounded-xl border bg-card p-6 shadow-sm md:flex-row">
                    <div className="flex h-56 w-full items-center justify-center overflow-hidden rounded-lg bg-muted md:w-1/3">
                        {group.imageUrl ? (
                            <img
                                src={group.imageUrl}
                                alt="대표 이미지"
                                className="h-full w-full object-contain"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                                대표 이미지가 없습니다.
                            </div>
                        )}
                    </div>

                    <div className="flex flex-1 flex-col justify-center space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">그룹명</p>
                            <h1 className="text-3xl font-semibold">{group.name}</h1>
                        </div>

                        <p className="text-base text-muted-foreground">
                            {group.description || "등록된 설명이 없습니다."}
                        </p>

                        <div className="flex items-center gap-4">
                            <div className="text-sm font-semibold text-primary">
                                {group.members.length}명 참여중
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => inviteMutation.mutate()}
                                disabled={inviteMutation.isPending}
                            >
                                {inviteMutation.isPending ? "생성 중..." : "초대하기"}
                            </Button>
                        </div>
                    </div>
                </section>

                {/* ------------------- */}
                {/* 본문: 3단 레이아웃 */}
                {/* ------------------- */}
                <section className="flex justify-center gap-6 w-full">

                    {/* ------------------- */}
                    {/* LEFT COLUMN - 멤버 + 앨범 */}
                    {/* ------------------- */}
                    <div className="w-[320px] flex flex-col gap-10 shrink-0">

                        {/* 멤버 */}
                        <Card>
                            <CardHeader>
                                <CardTitle>멤버 ({group.members.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {group.members.length ? (
                                    <ul className="grid gap-3 md:grid-cols-2">
                                        {group.members.map((m, i) => (
                                            <li key={i} className="rounded-lg border bg-muted/40 px-4 py-3 text-sm">
                                                {m}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        등록된 멤버가 없습니다.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* 앨범 */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>앨범</CardTitle>
                                    <p className="text-sm text-muted-foreground">총 {group.albums.length}장</p>
                                </div>
                                <Button size="sm" variant="outline" onClick={() => setPhotoModalOpen(true)}>
                                    사진 업로드
                                </Button>
                            </CardHeader>

                            <CardContent>
                                {group.albums.length ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        {group.albums.slice(0, 4).map((url, i) => (
                                            <div key={i} className="aspect-square overflow-hidden rounded-lg border bg-muted">
                                                <img src={url} className="h-full w-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">등록된 사진이 없습니다.</p>
                                )}
                            </CardContent>
                        </Card>

                    </div>

                    {/* ------------------- */}
                    {/* CENTER COLUMN (피드) */}
                    {/* ------------------- */}
                    <div className="flex-1 max-w-[800px] mx-auto">
                        <div className="text-center text-muted-foreground py-10 border rounded-lg">
                            피드 기능 준비중...
                        </div>
                    </div>

                    {/* ------------------- */}
                    {/* RIGHT COLUMN - 모임 목록 */}
                    {/* ------------------- */}
                    <div className="max-w-[420px] w-full flex flex-col gap-6">

                        <Card className="flex flex-col">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>모임</CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        총 {meetings?.length ?? 0}건
                                    </p>
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setMeetingModalOpen(true)}
                                >
                                    모임 생성
                                </Button>
                            </CardHeader>

                            <CardContent className="flex-1 flex flex-col space-y-4">
                                {/* 모임 목록 */}
                                {meetings && meetings.length > 0 ? (
                                    <div className="max-h-60 overflow-y-auto space-y-3">
                                        {meetings.map((m: Meeting) => (
                                          <div
                                            key={m.id}
                                            className="rounded-lg border bg-muted/20 p-3 space-y-3"
                                          >
                                            <div className="flex justify-between items-start">
                                              <div className="flex flex-col">
                                                <span className="font-semibold text-base">{m.title}</span>
                                                <span className="text-xs text-muted-foreground">
                                                  {m.startDate === m.endDate
                                                    ? `${m.startDate}${m.time ? ` · ${m.time}` : ""}`
                                                    : `${m.startDate} ~ ${m.endDate}`}
                                                </span>
                                              </div>
                                              <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md">
                                                참여 {m.participantCount}명
                                              </div>
                                            </div>
                                            {m.location && (
                                              <p className="text-sm text-muted-foreground">장소: {m.location}</p>
                                            )}
                                            {m.description && (
                                              <p className="text-sm leading-5">{m.description}</p>
                                            )}
                                            {m.creatorId === currentUserId && (
                                              <div className="flex gap-2 justify-end">
                                                <Button
                                                  size="sm"
                                                  variant="secondary"
                                                  onClick={() => {
                                                    setEditingMeeting(m);
                                                    setMeetingModalOpen(true);
                                                  }}
                                                >
                                                  수정
                                                </Button>
                                                <Button
                                                  size="sm"
                                                  variant="destructive"
                                                  onClick={() => {
                                                    if (window.confirm("정말 삭제하시겠습니까?")) {
                                                      deleteMeetingMutation.mutate(m.id);
                                                    }
                                                  }}
                                                >
                                                  삭제
                                                </Button>
                                              </div>
                                            )}
                                              {m.creatorId !== currentUserId && (
                                                  <div className="flex gap-2 justify-end pt-1">
                                                      <Button
                                                          size="sm"
                                                          variant="secondary"
                                                          onClick={() => participateMutation.mutate(m.id)}
                                                      >
                                                          참여
                                                      </Button>
                                                      <Button
                                                          size="sm"
                                                          variant="outline"
                                                          onClick={() => declineMutation.mutate(m.id)}
                                                      >
                                                          불참
                                                      </Button>
                                                  </div>
                                              )}
                                          </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        등록된 모임이 없습니다.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="flex flex-col">
                            <CardHeader>
                                <CardTitle>캘린더</CardTitle>
                                <p className="text-sm text-muted-foreground">모임 날짜를 확인하세요</p>
                            </CardHeader>
                            <CardContent>
                                <GroupCalendar
                                    groupId={parsedGroupId}
                                    onDateSelect={() => {}}
                                />
                            </CardContent>
                        </Card>

                    </div>

                </section>

                {/* ------------------- */}
                {/* 그룹 나가기 / 삭제 */}
                {/* ------------------- */}
                <section className="flex justify-center pt-8 border-t">
                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            onClick={handleLeaveGroup}
                            disabled={leaveMutation.isPending || deleteMutation.isPending}
                        >
                            {leaveMutation.isPending ? "처리 중..." : "그룹 나가기"}
                        </Button>

                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (window.confirm("정말 그룹을 삭제하시겠습니까?"))
                                    deleteMutation.mutate();
                            }}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? "삭제 중..." : "그룹 삭제"}
                        </Button>
                    </div>
                </section>

                {/* ------------------- */}
                {/* 사진 업로드 모달 */}
                {/* ------------------- */}
                <Dialog open={photoModalOpen} onOpenChange={setPhotoModalOpen}>
                    <DialogContent className="max-w-lg p-0">
                        <Form {...uploadForm}>
                            <form
                                onSubmit={uploadForm.handleSubmit(handlePhotoSubmit)}
                                className="space-y-6 p-6"
                            >
                                <DialogHeader>
                                    <DialogTitle>사진 업로드</DialogTitle>
                                    <DialogDescription>
                                        그룹 앨범에 추가할 사진과 정보를 입력해주세요.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4">
                                    <FormField
                                        control={uploadForm.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>사진 제목 *</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="예: 첫 정모" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={uploadForm.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>설명</FormLabel>
                                                <FormControl>
                                                    <Textarea rows={4} {...field} placeholder="사진 설명" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={uploadForm.control}
                                        name="file"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>이미지 파일 *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => field.onChange(e.target.files?.[0])}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setPhotoModalOpen(false)}
                                    >
                                        취소
                                    </Button>

                                    <Button type="submit">업로드</Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>

                {/* ------------------- */}
                {/* 모임 생성 모달 */}
                {/* ------------------- */}
                <CreateMeetingModal
                    open={meetingModalOpen}
                    onOpenChange={(open) => {
                      if (!open) setEditingMeeting(null);
                      setMeetingModalOpen(open);
                    }}
                    groupId={parsedGroupId}
                    editingMeeting={editingMeeting}
                />

            </main>
        </div>
    );
};

export default GroupDetail;