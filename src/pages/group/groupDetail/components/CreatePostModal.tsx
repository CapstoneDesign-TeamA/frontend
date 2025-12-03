import { useEffect, useMemo, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost } from "@/lib/api/posts";
import { useToast } from "@/hooks/use-toast";

interface CreatePostModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    groupId: number;
    userId: number;
}

const CreatePostModal = ({ open, onOpenChange, groupId, userId }: CreatePostModalProps) => {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [content, setContent] = useState("");
    const [imageInput, setImageInput] = useState("");
    const [imageUrls, setImageUrls] = useState<string[]>([]);

    const resetForm = () => {
        setContent("");
        setImageInput("");
        setImageUrls([]);
    };

    useEffect(() => {
        if (!open) {
            resetForm();
        }
    }, [open]);

    const addImageUrl = () => {
        const trimmed = imageInput.trim();
        if (!trimmed) return;
        setImageUrls((prev) => [...prev, trimmed]);
        setImageInput("");
    };

    const removeImageUrl = (index: number) => {
        setImageUrls((prev) => prev.filter((_, idx) => idx !== index));
    };

    const mutation = useMutation({
        mutationFn: () =>
            createPost(groupId, {
                content,
                type: "GENERAL",
                imageUrls,
            }),
        onSuccess: () => {
            toast({ title: "게시글이 등록되었습니다." });
            queryClient.invalidateQueries({ queryKey: ["feed", groupId, userId] });
            onOpenChange(false);
            resetForm();
        },
        onError: () => {
            toast({ title: "등록 실패", description: "잠시 후 다시 시도해주세요.", variant: "destructive" });
        },
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!content.trim()) {
            toast({ title: "내용을 입력해주세요.", variant: "destructive" });
            return;
        }
        mutation.mutate();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <DialogHeader>
                        <DialogTitle>게시글 작성</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">내용</label>
                        <Textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="오늘 그룹에 어떤 일이 있었나요?"
                            rows={6}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">이미지 URL</label>
                        <Input
                            value={imageInput}
                            onChange={(e) => setImageInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    addImageUrl();
                                }
                            }}
                            placeholder="이미지 URL 입력 후 Enter"
                        />
                        {imageUrls.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                                {imageUrls.map((url, index) => (
                                    <div key={url + index} className="relative rounded border">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={url} alt="preview" className="h-32 w-full object-cover rounded" />
                                        <button
                                            type="button"
                                            className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded"
                                            onClick={() => removeImageUrl(index)}
                                        >
                                            삭제
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            취소
                        </Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? "등록 중..." : "등록"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreatePostModal;

