import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form.tsx";

import { useToast } from "@/hooks/use-toast.ts";
import {
    createMeeting,
    updateMeeting,
    MeetingCreateBody,
    fetchAiRecommendByGroup,
} from "@/lib/api/meetings.ts";
import { createSchedule } from "@/lib/api/calendar.ts";

// ------------------------------
// Types
// ------------------------------

const meetingSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    startDate: z.string().min(1),
    endDate: z.string().optional(),
    time: z.string().optional(),
    location: z.string().min(1),
    singleDay: z.boolean(),
});

export type MeetingFormValues = z.infer<typeof meetingSchema>;

export interface AiRecommendItem {
    placeName: string;
    address: string;
    reason: string;
    imageUrl?: string;
}

export interface MeetingDto {
    id: number;
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    time?: string;
    location: string;
}

// ------------------------------
// Props
// ------------------------------

interface CreateMeetingModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    groupId: number;
    editingMeeting?: MeetingDto | null;
}

// ------------------------------
// Component
// ------------------------------

export const CreateMeetingModal = ({
                                       open,
                                       onOpenChange,
                                       groupId,
                                       editingMeeting,
                                   }: CreateMeetingModalProps) => {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [aiResult, setAiResult] = useState<AiRecommendItem[]>([]);
    const [loading, setLoading] = useState(false);

    const form = useForm<MeetingFormValues>({
        resolver: zodResolver(meetingSchema),
        defaultValues: {
            title: "",
            description: "",
            startDate: "",
            endDate: "",
            time: "",
            location: "",
            singleDay: true,
        },
    });

    // ------------------------------
    // Editing Mode
    // ------------------------------
    useEffect(() => {
        if (editingMeeting) {
            form.reset({
                title: editingMeeting.title,
                description: editingMeeting.description ?? "",
                startDate: editingMeeting.startDate,
                endDate: editingMeeting.endDate,
                time: editingMeeting.time ?? "",
                location: editingMeeting.location ?? "",
                singleDay: editingMeeting.startDate === editingMeeting.endDate,
            });
        } else {
            form.reset();
        }
    }, [editingMeeting]);

    const singleDay = form.watch("singleDay");
    const startDate = form.watch("startDate");

    useEffect(() => {
        if (singleDay && startDate) {
            form.setValue("endDate", startDate, { shouldValidate: true });
        }
    }, [singleDay, startDate]);

    // ------------------------------
    // Mutation (Create/Update Meeting)
    // ------------------------------
    const mutation = useMutation({
        mutationFn: async (values: MeetingFormValues) => {
            const body: MeetingCreateBody = {
                title: values.title,
                description: values.description,
                startDate: values.startDate,
                endDate: values.singleDay ? values.startDate : values.endDate || values.startDate,
                time: values.singleDay ? values.time : undefined,
                location: values.location,
            };

            if (editingMeeting) {
                return updateMeeting(groupId, editingMeeting.id, body);
            } else {
                // 모임 생성
                const result = await createMeeting(groupId, body);

                // 생성자의 캘린더에 일정 추가
                try {
                    const startTime = values.time || "00:00";
                    const startDateTime = `${values.startDate}T${startTime}:00`;

                    const endDate = values.singleDay ? values.startDate : values.endDate || values.startDate;
                    const [hour, minute] = startTime.split(":");
                    const endHour = String(Number(hour) + 1).padStart(2, "0");
                    const endDateTime = `${endDate}T${endHour}:${minute}:00`;

                    await createSchedule({
                        title: `[모임] ${values.title}`,
                        memo: values.description || `그룹 모임 - ${values.location}`,
                        startDateTime,
                        endDateTime,
                        groupId,
                    });
                } catch (error) {
                    console.error("캘린더 일정 추가 실패:", error);
                }

                return result;
            }
        },
        onSuccess: () => {
            toast({
                title: editingMeeting ? "모임이 수정되었습니다." : "모임이 생성되었습니다.",
                description: editingMeeting ? "" : "캘린더에 일정이 추가되었습니다."
            });
            queryClient.invalidateQueries({ queryKey: ["meetings", groupId] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            onOpenChange(false);
            form.reset();
        },
    });

    // ------------------------------
    // AI Recommend
    // ------------------------------
    const fetchAiRecommend = async () => {
        setLoading(true);
        setAiResult([]);

        try {
            const data = await fetchAiRecommendByGroup(groupId);
            setAiResult(data.recommendations);
        } finally {
            setLoading(false);
        }
    };

    // ------------------------------
    // JSX
    // ------------------------------
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl p-0">
                <div className="grid grid-cols-2 gap-6 p-6">

                    {/* LEFT FORM */}
                    <div>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-6">
                                <DialogHeader>
                                    <DialogTitle>{editingMeeting ? "모임 수정" : "모임 생성"}</DialogTitle>
                                </DialogHeader>

                                {/* 제목 */}
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>제목 *</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="예: 저녁 식사 모임" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* 당일치기 */}
                                <FormField
                                    control={form.control}
                                    name="singleDay"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center gap-2">
                                                <FormControl>
                                                    <input
                                                        type="checkbox"
                                                        checked={field.value}
                                                        onChange={(e) => field.onChange(e.target.checked)}
                                                        className="h-4 w-4"
                                                    />
                                                </FormControl>
                                                <FormLabel className="text-sm">당일치기 모임</FormLabel>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                {/* 날짜 */}
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="startDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>시작 날짜 *</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    {!singleDay && (
                                        <FormField
                                            control={form.control}
                                            name="endDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>종료 날짜 *</FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                </div>

                                {/* 시간 */}
                                {singleDay && (
                                    <FormField
                                        control={form.control}
                                        name="time"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>시간 *</FormLabel>
                                                <FormControl>
                                                    <Input type="time" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                )}

                                {/* 장소 */}
                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>장소 *</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="예: 교통대 신신마라탕" />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                {/* 설명 */}
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>설명</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} rows={3} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <DialogFooter>
                                    <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                                        취소
                                    </Button>
                                    <Button type="submit">
                                        {mutation.isPending
                                            ? editingMeeting
                                                ? "수정 중..."
                                                : "생성 중..."
                                            : editingMeeting
                                                ? "수정"
                                                : "생성"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </div>

                    {/* RIGHT: AI 추천 패널 */}
                    <div className="border-l pl-6 flex flex-col h-full">

                        <div className="p-4 rounded-lg border shadow-sm bg-gradient-to-br from-[#E9F5EC] to-white">
                            <h3 className="text-base font-semibold text-gray-800 mb-1">장소 선택이 고민되나요?</h3>
                            <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                                AI가 그룹의 활동 패턴을 분석해 가장 잘 맞는 장소를 추천해드릴게요.
                            </p>

                            <Button
                                type="button"
                                disabled={loading}
                                className="w-full bg-[#2A7E3B] hover:bg-[#256E34] text-white"
                                onClick={fetchAiRecommend}
                            >
                                {loading ? "활동 분석 중..." : "AI 추천 받아보기"}
                            </Button>
                        </div>

                        {/* 추천 리스트 with scroll + 고정 높이 */}
                        <div className="mt-6 space-y-4 flex-1 overflow-y-auto pr-2 max-h-[460px]">

                            {loading && (
                                <p className="text-sm text-gray-400 text-center mt-10">
                                    활동을 분석하고 있습니다...
                                </p>
                            )}

                            {!loading && aiResult.length === 0 && (
                                <p className="text-sm text-gray-400 text-center mt-10">
                                    추천 버튼을 눌러 제안받을 수 있어요.
                                </p>
                            )}

                            {!loading &&
                                aiResult.map((r, idx) => (
                                    <div
                                        key={idx}
                                        className="p-5 rounded-xl border bg-white shadow-sm hover:shadow-md transition flex flex-col gap-3"
                                    >
                                        {/* 장소 제목 + 주소 */}
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col gap-1">

                                                {/* 제목을 최우선으로 강하게 표시 */}
                                                <p className="font-semibold text-[17px] text-gray-900 leading-snug">
                                                    {r.placeName || "제목 없음"}
                                                </p>

                                                {/* 그 아래 주소 */}
                                                <p className="text-[12px] text-gray-500 leading-tight">
                                                    {r.address}
                                                </p>
                                            </div>

                                            <span className="text-[11px] font-medium bg-[#E5F4EA] text-[#2A7E3B] px-2 py-1 rounded-md">
                                                추천 {idx + 1}
                                            </span>
                                        </div>

                                        {/* 설명 글 (길어도 자연스럽게) */}
                                        <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-line break-words">
                                            {r.reason}
                                        </p>

                                        {/* 버튼 */}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-1 w-full border-[#2A7E3B] text-[#2A7E3B] hover:bg-[#E5F4EA]"
                                            onClick={() => {
                                                form.setValue("location", r.placeName);
                                                form.setValue("description", r.reason);  // 설명에도 자동 적용
                                            }}
                                        >
                                            이 장소로 설정하기
                                        </Button>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};