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
  createInviteLink,
} from "@/lib/api/groups";

import {
  fetchGroupSchedules,
  createGroupSchedule,
} from "@/lib/api/calendar";

import GroupCalendar from "./GroupCalendar";
import GroupScheduleModal from "./GroupScheduleModal";

// 업로드 검증 스키마
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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [editingSchedule, setEditingSchedule] = useState<{
    scheduleId: number;
    title: string;
    date: string;
    location?: string;
    memo?: string;
  } | null>(null);

  // 사진 업로드 Form
  const uploadForm = useForm<z.infer<typeof uploadSchema>>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
      description: "",
      file: undefined,
    },
  });

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

  // 이번 달 일정 조회
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const { data: groupSchedules } = useQuery({
    queryKey: ["groupSchedules", parsedGroupId, currentYear, currentMonth],
    queryFn: () => fetchGroupSchedules(parsedGroupId, currentYear, currentMonth),
    enabled: Number.isFinite(parsedGroupId),
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

  // 일정 생성 및 수정
  const handleGroupScheduleSubmit = async (data: {
    title: string;
    date: string;
    time: string;
    location: string;
    memo?: string;
  }) => {
    if (editingSchedule) {
      await fetch(
        `/api/groups/${parsedGroupId}/schedules/${editingSchedule.scheduleId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      toast({ title: "일정 수정 완료" });
      setEditingSchedule(null);
    } else {
      await createGroupSchedule(parsedGroupId, {
        title: data.title,
        date: data.date,
        time: data.time,
        location: data.location,
        description: data.memo ?? "",
      });

      toast({ title: "일정 등록 완료" });
    }

    queryClient.invalidateQueries({
      queryKey: ["groupSchedules", parsedGroupId, currentYear, currentMonth],
    });

    setScheduleModalOpen(false);
    setSelectedDate(null);
  };

  // 일정 삭제
  const handleDeleteSchedule = async (scheduleId: number) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    await fetch(`/api/groups/${parsedGroupId}/schedules/${scheduleId}`, {
      method: "DELETE",
    });

    toast({ title: "일정 삭제 완료" });

    queryClient.invalidateQueries({
      queryKey: ["groupSchedules", parsedGroupId, currentYear, currentMonth],
    });
  };

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
  });

  const handleLeaveGroup = () => {
    if (!window.confirm("정말 그룹에서 나가시겠습니까?")) return;
    leaveMutation.mutate();
  };

  // 그룹 삭제
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

  // 초대 링크 생성
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

  if (!Number.isFinite(parsedGroupId))
    return (
      <div className="container py-10 text-center text-muted-foreground">
        유효하지 않은 그룹입니다.
      </div>
    );
  if (isLoading)
    return (
      <div className="container py-10 text-center text-muted-foreground">
        그룹 정보를 불러오는 중입니다...
      </div>
    );
  if (isError || !group)
    return (
      <div className="container py-10 text-center text-muted-foreground">
        그룹 정보를 가져오지 못했습니다.
      </div>
    );

  return (
    <div className="container space-y-10 py-10">
      {/* 그룹 헤더 */}
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

      {/* 멤버 + 앨범 + 일정 */}
      <section className="grid gap-10 lg:grid-cols-2">
        {/* 왼쪽: 멤버 + 앨범 */}
        <div className="flex flex-col gap-10">
          {/* 멤버 */}
          <Card>
            <CardHeader>
              <CardTitle>멤버 ({group.members.length})</CardTitle>
            </CardHeader>

            <CardContent>
              {group.members.length ? (
                <ul className="grid gap-3 md:grid-cols-2">
                  {group.members.map((m, i) => (
                    <li
                      key={i}
                      className="rounded-lg border bg-muted/40 px-4 py-3 text-sm font-medium"
                    >
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
                <p className="text-sm text-muted-foreground">
                  총 {group.albums.length}장
                </p>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setPhotoModalOpen(true)}
              >
                사진 업로드
              </Button>
            </CardHeader>

            <CardContent>
              {group.albums.length ? (
                <div className="grid grid-cols-2 gap-4">
                  {group.albums.slice(0, 4).map((url, i) => (
                    <div
                      key={i}
                      className="aspect-square overflow-hidden rounded-lg border bg-muted"
                    >
                      <img src={url} className="h-full w-full object-cover" />
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
        </div>

        {/* 오른쪽: 일정 + 캘린더 */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>일정</CardTitle>
              <p className="text-sm text-muted-foreground">
                총 {groupSchedules?.length ?? 0}건
              </p>
            </div>

            <Button
              size="sm"
              onClick={() => {
                setSelectedDate(null);
                setEditingSchedule(null);
                setScheduleModalOpen(true);
              }}
            >
              일정 추가
            </Button>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col space-y-4">
            {/* 일정 목록 */}
            {groupSchedules && groupSchedules.length > 0 ? (
              <div className="max-h-40 overflow-y-auto space-y-3">
                {groupSchedules.map((s) => (
                  <div
                    key={s.scheduleId}
                    className="rounded-lg border bg-muted/20 p-3 space-y-2"
                  >
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">{s.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {s.date}
                      </span>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditingSchedule(s);
                          setSelectedDate(s.date);
                          setScheduleModalOpen(true);
                        }}
                      >
                        수정
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteSchedule(s.scheduleId)}
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                등록된 일정이 없습니다.
              </p>
            )}

            {/* 캘린더 */}
            <div className="flex-1">
              <GroupCalendar
                groupId={parsedGroupId}
                onDateSelect={(dateStr) => {
                  setSelectedDate(dateStr);
                  setEditingSchedule(null);
                  setScheduleModalOpen(true);
                }}
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 그룹 나가기 / 삭제 */}
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
              if (window.confirm("정말 그룹을 삭제하시겠습니까?")) {
                deleteMutation.mutate();
              }
            }}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "삭제 중..." : "그룹 삭제"}
          </Button>
        </div>
      </section>

      {/* 일정 추가/수정 모달 */}
      {scheduleModalOpen && (
        <GroupScheduleModal
          defaultDate={selectedDate ?? undefined}
          editingData={editingSchedule ?? undefined}
          onClose={() => {
            setScheduleModalOpen(false);
            setSelectedDate(null);
            setEditingSchedule(null);
          }}
          onSubmit={handleGroupScheduleSubmit}
        />
      )}

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
                        <Textarea
                          rows={4}
                          {...field}
                          placeholder="사진 설명"
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
                          onChange={(e) =>
                            field.onChange(e.target.files?.[0])
                          }
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
    </div>
  );
};

export default GroupDetail;