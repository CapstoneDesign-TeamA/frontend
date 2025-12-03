// src/pages/group/groupDetail/components/PostCard.tsx

import { useState } from "react";
import { toggleLike, deletePost } from "@/lib/api/posts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Heart,
    MessageCircle,
    Edit3,
    Trash2,
    Download,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useToast } from "@/hooks/use-toast";

// AlertDialog
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";

// 댓글 컴포넌트
import CommentList from "./CommentList";
import CommentInput from "./CommentInput";

type PostType = {
    id: number;
    userId: number;
    nickname?: string;
    images: string[];
    content: string;
    likeCount: number;
    myLiked: boolean;
    commentCount: number; // ← 추가됨
};

type DeleteResponse = { message: string };

const PostCard = ({
                      post,
                      groupId,
                      userId,
                      onEdit,
                  }: {
    post: PostType;
    groupId: number;
    userId: number;
    onEdit: (post: PostType) => void;
}) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const [index, setIndex] = useState(0);
    const [openDelete, setOpenDelete] = useState(false);
    const [showComments, setShowComments] = useState(false);

    const images = post.images ?? [];
    const hasMultiple = images.length > 1;

    // 좋아요
    const likeMutation = useMutation({
        mutationFn: () => toggleLike(groupId, post.id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feed", groupId] }),
    });

    // 삭제
    const deleteMutation = useMutation<DeleteResponse>({
        mutationFn: () => deletePost(groupId, post.id),
        onSuccess: (data) => {
            toast({ title: data.message });
            setOpenDelete(false);
            setTimeout(() => window.location.reload(), 200);
        },
        onError: () => {
            toast({
                title: "게시글 삭제 실패",
                description: "다시 시도해주세요.",
            });
        },
    });

    // ZIP 다운로드
    const handleDownloadAll = async () => {
        const zip = new JSZip();
        for (let i = 0; i < images.length; i++) {
            const blob = await fetch(images[i]).then((r) => r.blob());
            zip.file(`image_${i + 1}.jpg`, blob);
        }
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `post_${post.id}_images.zip`);
    };

    const next = () => index < images.length - 1 && setIndex(index + 1);
    const prev = () => index > 0 && setIndex(index - 1);

    const isAuthor = userId === post.userId;

    return (
        <div className="border rounded-lg p-4 shadow-sm bg-white w-full">

            {/* 작성자 + 메뉴 */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-300" />
                    <span className="font-semibold text-sm">
                        {post.nickname ?? `사용자 ${post.userId}`}
                    </span>
                </div>

                {isAuthor && (
                    <div className="flex items-center gap-3">
                        <button onClick={() => onEdit(post)}>
                            <Edit3 size={18} />
                        </button>

                        {/* 삭제 */}
                        <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
                            <AlertDialogTrigger asChild>
                                <button>
                                    <Trash2 size={18} className="text-red-500" />
                                </button>
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>취소</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => deleteMutation.mutate()}
                                        className="bg-red-500 text-white hover:bg-red-600"
                                    >
                                        삭제
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <button onClick={handleDownloadAll}>
                            <Download size={18} />
                        </button>
                    </div>
                )}
            </div>

            {/* 이미지 슬라이더 */}
            <div className="relative w-full aspect-square bg-black rounded-lg overflow-hidden">
                {images.length > 0 && (
                    <img
                        src={images[index]}
                        className="w-full h-full object-cover"
                        alt="게시글 이미지"
                    />
                )}

                {hasMultiple && (
                    <>
                        {index > 0 && (
                            <button
                                onClick={prev}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full"
                            >
                                <ChevronLeft size={18} />
                            </button>
                        )}
                        {index < images.length - 1 && (
                            <button
                                onClick={next}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full"
                            >
                                <ChevronRight size={18} />
                            </button>
                        )}
                    </>
                )}

                {hasMultiple && (
                    <div className="absolute bottom-2 w-full flex justify-center gap-1">
                        {images.map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${
                                    i === index ? "bg-white" : "bg-white/40"
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* 내용 */}
            <div className="mt-3 text-sm whitespace-pre-line">
                {post.content}
            </div>

            {/* 버튼 */}
            <div className="flex items-center gap-4 mt-4">

                {/* 좋아요 */}
                <button
                    onClick={() => likeMutation.mutate()}
                    className="flex items-center gap-1"
                >
                    <Heart
                        size={22}
                        className={post.myLiked ? "text-red-500 fill-red-500" : "text-gray-600"}
                    />
                    <span className="text-sm">{post.likeCount}</span>
                </button>

                {/* 댓글 */}
                <button
                    className="flex items-center gap-1"
                    onClick={() => setShowComments(!showComments)}
                >
                    <MessageCircle size={22} />
                    <span className="text-sm">
                        댓글 {post.commentCount}
                    </span>
                </button>
            </div>

            {/* 댓글 영역 */}
            {showComments && (
                <div className="mt-4">
                    <CommentList groupId={groupId} postId={post.id} userId={userId} />
                    <CommentInput groupId={groupId} postId={post.id} />
                </div>
            )}
        </div>
    );
};

export default PostCard;