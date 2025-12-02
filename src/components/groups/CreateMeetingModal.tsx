import { useEffect } from "react";
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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { createMeeting, updateMeeting, MeetingCreateBody } from "@/lib/api/meetings";

// ======================
// Schema
// ======================
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

    // ======================
    // 수정 모드: 기존 데이터 세팅
    // ======================
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

    // 당일치기 자동 처리
    useEffect(() => {
        if (singleDay && startDate) {
            form.setValue("endDate", startDate, { shouldValidate: true });
        }
    }, [singleDay, startDate]);

    // ======================
    // Mutation (create / update)
    // ======================
    const mutation = useMutation({
        mutationFn: (values: MeetingFormValues) => {
            const body: MeetingCreateBody = {
                title: values.title,
                description: values.description,
                startDate: values.startDate,
                endDate: values.singleDay
                    ? values.startDate
                    : values.endDate || values.startDate, // 안전하게 처리
                time: values.singleDay ? values.time : undefined,
                location: values.location,
            };

            return editingMeeting
                ? updateMeeting(groupId, editingMeeting.id, body)
                : createMeeting(groupId, body);
        },
        onSuccess: () => {
            toast({
                title: editingMeeting ? "모임이 수정되었습니다." : "모임이 생성되었습니다.",
            });
            queryClient.invalidateQueries({ queryKey: ["meetings", groupId] });
            onOpenChange(false);
            form.reset();
        },
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg p-0">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
                        className="space-y-6 p-6"
                    >
                        <DialogHeader>
                            <DialogTitle>
                                {editingMeeting ? "모임 수정" : "모임 생성"}
                            </DialogTitle>
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
                            {/* 시작 */}
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

                            {/* 종료 */}
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
            </DialogContent>
        </Dialog>
    );
};