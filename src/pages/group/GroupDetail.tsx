// src/pages/group/GroupDetail.tsx

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
} from "@/lib/api/groups";


// 업로드 스키마
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

    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
    const [photoModalOpen, setPhotoModalOpen] = useState(false);


    // 업로드 폼
    const uploadForm = useForm<z.infer<typeof uploadSchema>>({
        resolver: zodResolver(uploadSchema),
        defaultValues: {
            title: "",
            description: "",
            file: undefined,
        },
    });


    // 사진 업로드
    const uploadMutation = useMutation({
        mutationFn: (payload: {
            groupId: number;
            title: string;
            description?: string;
            file: File;
        }) => uploadGroupAlbum(payload),

        onSuccess: () => {
            toast({ title: "업로드 완료", description: "사진이 앨범에 추가되었습니다." });

            queryClient.invalidateQueries({
                queryKey: ["groupDetail", parsedGroupId],
            });

            uploadForm.reset();
            setPhotoModalOpen(false);
        },

        onError: (error: unknown) => {
            const message =
                error instanceof Error
                    ? error.message
                    : "업로드 중 오류가 발생했습니다.";

            toast({ title: "업로드 실패", description: message });
        },
    });


    const handlePhotoSubmit = (data: z.infer<typeof uploadSchema>) => {
        if (!Number.isFinite(parsedGroupId)) return;

        uploadMutation.mutate({
            groupId: parsedGroupId,
            title: data.title,
            description: data.description,
            file: data.file as File,
        });
    };


    // 그룹 상세 조회
    const {
        data: group,
        isLoading,
        isError,
    } = useQuery<GroupDetailData>({
        queryKey: ["groupDetail", parsedGroupId],
        queryFn: () => fetchGroupDetail(parsedGroupId),
        enabled: Number.isFinite(parsedGroupId),
    });


    // 그룹 나가기
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

        onError: (error: unknown) => {
            const message =
                error instanceof Error
                    ? error.message
                    : "그룹 나가기 중 문제가 발생했습니다.";

            toast({
                title: "오류 발생",
                description: message,
            });
        }
    });


    const handleLeaveGroup = () => {
        if (!window.confirm("정말 그룹에서 나가시겠습니까?")) return;
        leaveMutation.mutate();
    };


    // ✅ 그룹 삭제
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

        onError: (error: unknown) => {
            const message =
                error instanceof Error
                    ? error.message
                    : "그룹 삭제 중 문제가 발생했습니다.";

            toast({
                title: "오류 발생",
                description: message,
            });
        },
    });

    const handleDeleteGroup = () => {
        if (!Number.isFinite(parsedGroupId)) return;

        if (!window.confirm("정말 이 그룹을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
            return;
        }

        deleteMutation.mutate();
    };


    // 상태 렌더링
    if (!Number.isFinite(parsedGroupId)) {
        return (
            <div className="container py-10 text-center text-muted-foreground">
                유효하지 않은 그룹입니다.
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="container py-10 text-center text-muted-foreground">
                그룹 정보를 불러오는 중입니다...
            </div>
        );
    }

    if (isError || !group) {
        return (
            <div className="container py-10 text-center text-muted-foreground">
                그룹 정보를 가져오지 못했습니다.
            </div>
        );
    }


    // 실제 화면
    return (
        <div className="container space-y-10 py-10">
            {/* 그룹 헤더 */}
            <section className="flex flex-col gap-6 rounded-xl border bg-card p-6 shadow-sm md:flex-row">
                <div className="flex h-56 w-full items-center justify-center overflow-hidden rounded-lg bg-muted md:w-1/3">
                    {group.imageUrl ? (
                        <img
                            src={group.imageUrl}
                            alt={`${group.name} 대표 이미지`}
                            className="h-full w-full rounded-lg bg-muted object-contain"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
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
                        {group.description?.trim() || "등록된 설명이 없습니다."}
                    </p>

                    <div className="text-sm font-semibold text-primary">
                        {group.members.length}명 참여중
                    </div>
                </div>
            </section>


            {/* 멤버 + 일정 */}
            <section className="grid gap-8 lg:grid-cols-[2fr,3fr]">

                {/* 멤버 */}
                <Card>
                    <CardHeader>
                        <CardTitle>멤버 ({group.members.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {group.members.length ? (
                            <ul className="grid gap-3 md:grid-cols-2">
                                {group.members.map((member, index) => (
                                    <li
                                        key={index}
                                        className="rounded-lg border bg-muted/40 px-4 py-3 text-sm font-medium"
                                    >
                                        {member}
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

                {/* 일정 */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>일정</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                총 {group.schedules.length}건
                            </p>
                        </div>
                        <Button size="sm" onClick={() => setScheduleModalOpen(true)}>
                            일정 추가
                        </Button>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {group.schedules.length ? (
                            group.schedules.map((schedule) => (
                                <div
                                    key={schedule.scheduleId}
                                    className="space-y-2 rounded-lg border bg-muted/20 p-4"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <h3 className="text-base font-semibold">
                                            {schedule.title}
                                        </h3>
                                        <span className="text-sm text-muted-foreground">
                                            {schedule.date} {schedule.time}
                                        </span>
                                    </div>

                                    <p className="text-sm text-muted-foreground">
                                        {schedule.description}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                등록된 일정이 없습니다.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </section>


            {/* 앨범 */}
            <section>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>앨범</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                총 {group.albums.length}장
                            </p>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPhotoModalOpen(true)}
                        >
                            사진 업로드
                        </Button>
                    </CardHeader>

                    <CardContent>
                        {group.albums.length ? (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {group.albums.map((albumUrl, index) => (
                                    <div
                                        key={index}
                                        className="aspect-square overflow-hidden rounded-lg border bg-muted"
                                    >
                                        <img
                                            src={albumUrl}
                                            alt={`앨범 ${index + 1}`}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                등록된 사진이 없습니다.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </section>


            {/* 일정 모달 */}
            <Dialog open={scheduleModalOpen} onOpenChange={setScheduleModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>새 일정 추가</DialogTitle>
                        <DialogDescription>
                            추후 일정 생성 폼이 들어갈 예정입니다.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button onClick={() => setScheduleModalOpen(false)}>
                            닫기
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


            {/* 사진 업로드 모달 */}
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
                                                <Input placeholder="예: 첫 정모" {...field} />
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
                                                <Textarea
                                                    rows={4}
                                                    placeholder="사진 설명"
                                                    {...field}
                                                />
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
                                                    onChange={(event) => {
                                                        const file = event.target.files?.[0];
                                                        field.onChange(file ?? undefined);
                                                    }}
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
                                    disabled={uploadMutation.isPending}
                                >
                                    취소
                                </Button>

                                <Button type="submit" disabled={uploadMutation.isPending}>
                                    {uploadMutation.isPending ? "업로드 중..." : "업로드"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>


            {/* 그룹 나가기 / 삭제 버튼 */}
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
                        onClick={handleDeleteGroup}
                        disabled={deleteMutation.isPending}
                    >
                        {deleteMutation.isPending ? "삭제 중..." : "그룹 삭제"}
                    </Button>
                </div>
            </section>
        </div>
    );
};


export default GroupDetail;