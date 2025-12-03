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
    FormField,
    FormItem,
    FormControl,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost } from "@/lib/api/posts";
import { useToast } from "@/hooks/use-toast";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// -----------------------------
// Zod Schema (여러 파일 업로드)
// -----------------------------
const schema = z.object({
    content: z.string().min(1, "내용은 필수입니다."),
    files: z.array(z.custom<File>()).optional(),
});

type FormValues = z.infer<typeof schema>;

const CreatePostModal = ({
                             open,
                             onOpenChange,
                             groupId,
                             userId,
                             type = "GENERAL",
                             meetingId,
                         }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    groupId: number;
    userId: number;
    type?: string;
    meetingId?: number;
}) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            content: "",
            files: [],
        },
    });

    // -----------------------------
    // mutation
    // -----------------------------
    const mutation = useMutation({
        mutationFn: (values: FormValues) =>
            createPost(groupId, {
                content: values.content,
                type: type,
                meetingId: meetingId,
                files: values.files ?? [],
            }),
        onSuccess: () => {
            toast({ title: "게시글이 등록되었습니다." });

            queryClient.invalidateQueries({ queryKey: ["feed", groupId] });

            onOpenChange(false);
            form.reset();

            // 새로고침 (UI 잔상/캐싱 문제 해결)
            setTimeout(() => {
                window.location.reload();
            }, 300);
        },
    });

    const handleSubmit = (values: FormValues) => {
        mutation.mutate(values);
    };

    // -----------------------------
    // UI
    // -----------------------------
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg p-0">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="p-6 space-y-6"
                    >
                        <DialogHeader>
                            <DialogTitle>게시글 작성</DialogTitle>
                        </DialogHeader>

                        {/* 내용 입력 */}
                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>내용 *</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            rows={5}
                                            {...field}
                                            placeholder="내용 입력"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* 파일 입력 */}
                        <FormField
                            control={form.control}
                            name="files"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>이미지 (여러 개 선택 가능)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={(e) => {
                                                const selected = Array.from(
                                                    e.target.files || []
                                                );
                                                field.onChange(selected);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                취소
                            </Button>
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending ? "등록 중..." : "등록"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default CreatePostModal;