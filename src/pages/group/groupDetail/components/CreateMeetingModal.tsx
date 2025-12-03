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
import { createMeeting, updateMeeting, MeetingCreateBody } from "@/lib/api/meetings.ts";

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

interface CreateMeetingModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    groupId: number;
    editingMeeting?: any;
}

export const CreateMeetingModal = ({
                                       open,
                                       onOpenChange,
                                       groupId,
                                       editingMeeting,
                                   }: CreateMeetingModalProps) => {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [aiResult, setAiResult] = useState<any[]>([]);

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
        } else form.reset();
    }, [editingMeeting]);

    const singleDay = form.watch("singleDay");
    const startDate = form.watch("startDate");

    useEffect(() => {
        if (singleDay && startDate) {
            form.setValue("endDate", startDate, { shouldValidate: true });
        }
    }, [singleDay, startDate]);

    const mutation = useMutation({
        mutationFn: (values: MeetingFormValues) => {
            const body: MeetingCreateBody = {
                title: values.title,
                description: values.description,
                startDate: values.startDate,
                endDate: values.singleDay
                    ? values.startDate
                    : values.endDate || values.startDate,
                time: values.singleDay ? values.time : undefined,
                location: values.location,
            };

            return editingMeeting
                ? updateMeeting(groupId, editingMeeting.id, body)
                : createMeeting(groupId, body);
        },
        onSuccess: () => {
            toast({ title: editingMeeting ? "모임이 수정되었습니다." : "모임이 생성되었습니다." });
            queryClient.invalidateQueries({ queryKey: ["meetings", groupId] });
            onOpenChange(false);
            form.reset();
        },
    });

    // AI 추천 호출 (스텁 상태)
    const fetchAiRecommend = async () => {
        // TODO: 실제 /ai/recommend 연동
        setAiResult([
            {
                place_name: "홍대 카페 ○○",
                address: "서울 마포구 …",
                reason: "가벼운 모임 성향과 잘 맞습니다.",
            },
            {
                place_name: "보드게임 카페 △△",
                address: "충주 …",
                reason: "조금 더 색다른 활동으로 적당합니다.",
            },
            {
                place_name: "스파 이색 테마",
                address: "서울 강남구 …",
                reason: "완전히 새로운 경험을 원하는 경우 적합합니다.",
            },
        ]);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl p-0">
                <div className="grid grid-cols-2 gap-6 p-6">
                    {/* LEFT: FORM */}
                    <div>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
                                className="space-y-6"
                            >
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

                        {/* 헤더 영역 */}
                        <div className="p-4 rounded-lg border shadow-sm bg-gradient-to-br from-[#E9F5EC] to-white">
                            <h3 className="text-base font-semibold text-gray-800 mb-1">
                                장소 선택이 고민되나요?
                            </h3>
                            <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                                AI가 그룹의 활동 패턴을 분석해 가장 잘 맞는 장소를 추천해드릴게요.
                            </p>

                            <Button
                                type="button"
                                className="w-full bg-[#2A7E3B] hover:bg-[#256E34] text-white"
                                onClick={fetchAiRecommend}
                            >
                                AI 추천 받아보기
                            </Button>
                        </div>

                        {/* 추천 결과 리스트 */}
                        <div className="mt-6 space-y-4 flex-1 overflow-y-auto pr-2">

                            {aiResult.length === 0 && (
                                <p className="text-sm text-gray-400 text-center mt-10">
                                    추천 버튼을 눌러 제안받을 수 있어요.
                                </p>
                            )}

                            {aiResult.map((r, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 rounded-xl border bg-white shadow-sm hover:shadow-md transition"
                                >
                                    {/* 상단 영역 */}
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm">
                                                {r.place_name}
                                            </p>
                                            <p className="text-xs text-gray-500">{r.address}</p>
                                        </div>

                                        <span className="text-xs font-medium bg-[#E5F4EA] text-[#2A7E3B] px-2 py-1 rounded-md">
                        추천 {idx + 1}
                    </span>
                                    </div>

                                    {/* 이유 */}
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {r.reason}
                                    </p>

                                    {/* 선택 버튼 */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-3 w-full border-[#2A7E3B] text-[#2A7E3B] hover:bg-[#E5F4EA]"
                                        onClick={() => form.setValue("location", r.place_name)}
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