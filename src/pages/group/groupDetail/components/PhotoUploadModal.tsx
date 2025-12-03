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
import { uploadGroupAlbum } from "@/lib/api/groups";
import { useToast } from "@/hooks/use-toast";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// -----------------------------
// Zod Schema
// -----------------------------
const schema = z.object({
    title: z.string().min(1, "제목은 필수입니다."),
    description: z.string().optional(),
    file: z.custom<File>((value) => value instanceof File, {
        message: "이미지 파일을 선택해주세요.",
    }),
});

// z.infer로 타입 자동 생성
type UploadValues = z.infer<typeof schema>;

const PhotoUploadModal = ({
                              open,
                              onOpenChange,
                              groupId,
                          }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    groupId: number;
}) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // -----------------------------
    // form
    // -----------------------------
    const form = useForm<UploadValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            title: "",
            description: "",
            file: undefined,
        },
    });

    // -----------------------------
    // mutation (타입 명확히 지정해서 오류 제거)
    // -----------------------------
    const mutation = useMutation({
        mutationFn: (values: UploadValues) =>
            uploadGroupAlbum({
                groupId,
                title: values.title,
                description: values.description,
                file: values.file,
            }),
        onSuccess: () => {
            toast({ title: "업로드 완료", description: "사진이 앨범에 추가되었습니다." });

            queryClient.invalidateQueries({ queryKey: ["groupDetail", groupId] });

            onOpenChange(false);
            form.reset();
        },
    });

    const handleSubmit = (values: UploadValues) => {
        mutation.mutate(values);
    };

    // -----------------------------
    // 렌더링
    // -----------------------------
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg p-0">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="p-6 space-y-6">
                        <DialogHeader>
                            <DialogTitle>사진 업로드</DialogTitle>
                        </DialogHeader>

                        <FormField
                            control={form.control}
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
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>설명</FormLabel>
                                    <FormControl>
                                        <Textarea rows={3} {...field} placeholder="사진 설명" />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
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

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                취소
                            </Button>
                            <Button type="submit">업로드</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default PhotoUploadModal;