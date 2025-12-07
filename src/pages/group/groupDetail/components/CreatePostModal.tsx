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
import { createPost, updatePost } from "@/lib/api/posts";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { uploadGroupAlbum } from "@/lib/api/groups.ts";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

const schema = z.object({
    content: z.string().min(1, "내용은 필수입니다."),
    files: z.array(z.custom<File>()).optional(),
});

type FormValues = z.infer<typeof schema>;

type Post = {
    id: number;
    userId: number;
    nickname?: string;
    images: string[];
    content: string;
    likeCount: number;
    myLiked: boolean;
    commentCount: number;
};

const CreatePostModal = ({
                             open,
                             onOpenChange,
                             groupId,
                             type = "GENERAL",
                             meetingId,
                             editingPost,
                         }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    groupId: number;
    type?: string;
    meetingId?: number;
    editingPost?: Post | null;
}) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            content: "",
            files: [],
        },
    });

    useEffect(() => {
        if (editingPost && open) {
            form.reset({
                content: editingPost.content,
                files: [],
            });
            setExistingImages(editingPost.images || []);
            setPreviewUrls([]);
        } else if (!open) {
            // 모달이 닫힐 때 미리보기 URL 해제
            previewUrls.forEach(url => URL.revokeObjectURL(url));
            setPreviewUrls([]);
            form.reset({
                content: "",
                files: [],
            });
            setExistingImages([]);
        }
    }, [editingPost, open, form]);

    // 컴포넌트 언마운트 시 URL 해제
    useEffect(() => {
        return () => {
            previewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [previewUrls]);

    const handleRemoveExistingImage = (index: number) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleRemovePreviewImage = (index: number) => {
        const currentFiles = form.getValues("files") || [];
        const newFiles = currentFiles.filter((_, i) => i !== index);

        // 해당 미리보기 URL 해제
        if (previewUrls[index]) {
            URL.revokeObjectURL(previewUrls[index]);
        }

        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
        form.setValue("files", newFiles);
    };

    const handleFileChange = (files: File[]) => {
        // 기존 미리보기 URL 해제
        previewUrls.forEach(url => URL.revokeObjectURL(url));

        // 새로운 미리보기 URL 생성
        const newPreviewUrls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(newPreviewUrls);
    };

    const mutation = useMutation({
        mutationFn: async (values: FormValues) => {
            if (editingPost) {
                const newImageUrls: string[] = [];
                if (values.files && values.files.length > 0) {
                    const uploadPromises = values.files.map(async (file, index) => {
                        const result = await uploadGroupAlbum({
                            groupId,
                            title: values.content.slice(0, 20) + "... (" + (index + 1) + ")",
                            description: values.content,
                            file,
                        });
                        return result.imageUrl;
                    });
                    const uploadedUrls = await Promise.all(uploadPromises);
                    newImageUrls.push(...uploadedUrls.filter(Boolean));
                }

                const allImageUrls = [...existingImages, ...newImageUrls];

                await updatePost(groupId, editingPost.id, {
                    content: values.content,
                    newImages: allImageUrls,
                });
            } else {
                // 게시글 생성 - 백엔드에서 자동으로 앨범에도 저장됨
                await createPost(groupId, {
                    content: values.content,
                    type: type,
                    meetingId: meetingId,
                    files: values.files ?? [],
                });

                // ✅ uploadGroupAlbum 중복 호출 제거
                // 백엔드의 PostService.createPost()에서 이미지 업로드 및 AI 분석이 처리됨
            }
        },
        onSuccess: () => {
            toast({
                title: editingPost ? "게시글이 수정되었습니다." : "게시글이 등록되었습니다."
            });

            queryClient.invalidateQueries({ queryKey: ["feed", groupId] });
            queryClient.invalidateQueries({ queryKey: ["groupDetail", groupId] });

            onOpenChange(false);
            form.reset();

            setTimeout(() => {
                window.location.reload();
            }, 300);
        },
    });

    const handleSubmit = (values: FormValues) => {
        mutation.mutate(values);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg p-0">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="p-6 space-y-6"
                    >
                        <DialogHeader>
                            <DialogTitle>
                                {editingPost ? "게시글 수정" : "게시글 작성"}
                            </DialogTitle>
                        </DialogHeader>

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

                        {editingPost && existingImages.length > 0 && (
                            <div>
                                <FormLabel>기존 이미지</FormLabel>
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                    {existingImages.map((img, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={img}
                                                alt={`기존 이미지 ${index + 1}`}
                                                className="w-full h-24 object-cover rounded"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveExistingImage(index)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <FormField
                            control={form.control}
                            name="files"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {editingPost ? "새 이미지 추가 (선택)" : "이미지 (여러 개 선택 가능)"}
                                    </FormLabel>
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
                                                handleFileChange(selected);
                                            }}
                                        />
                                    </FormControl>

                                    {/* 새로 선택된 이미지 미리보기 */}
                                    {previewUrls.length > 0 && (
                                        <div className="mt-3">
                                            <p className="text-sm text-gray-600 mb-2 font-semibold">선택된 이미지 미리보기</p>
                                            <div className="grid grid-cols-3 gap-3">
                                                {previewUrls.map((url, index) => (
                                                    <div key={index} className="relative group">
                                                        <div className="w-full h-24 overflow-hidden rounded-lg border-2 border-gray-200 hover:border-[#2f7e33] transition-all">
                                                            <img
                                                                src={url}
                                                                alt={`미리보기 ${index + 1}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemovePreviewImage(index)}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg transition-all opacity-0 group-hover:opacity-100"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

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
                                {mutation.isPending
                                    ? (editingPost ? "수정 중..." : "등록 중...")
                                    : (editingPost ? "수정" : "등록")
                                }
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default CreatePostModal;

