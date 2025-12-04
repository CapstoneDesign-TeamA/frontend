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

import sproutImg from "@/assets/sprout.png";

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

    // 프로필 이미지 가져오기
    const userProfileImage = localStorage.getItem("user_profile_image") || "";

    return (
        <div className="border rounded-xl shadow-md hover:shadow-lg transition-shadow bg-white w-full overflow-hidden">

            {/* 작성자 + 메뉴 */}
            <div className="flex items-center justify-between p-4 pb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center overflow-hidden">
                        {userProfileImage && isAuthor ? (
                            <img
                                src={userProfileImage}
                                alt="profile"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = sproutImg;
                                    e.currentTarget.className = "w-7 h-7 object-contain";
                                }}
                            />
                        ) : (
                            <img src={sproutImg} alt="profile" className="w-7 h-7 object-contain" />
                        )}
                    </div>
                    <span className="font-semibold text-base">
                        {post.nickname ?? `사용자 ${post.userId}`}
                    </span>
                </div>

                {isAuthor && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onEdit(post)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <Edit3 size={18} className="text-gray-600" />
                        </button>

                        {/* 삭제 */}
                        <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
                            <AlertDialogTrigger asChild>
                                <button className="p-2 hover:bg-red-50 rounded-full transition-colors">
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

                        <button
                            onClick={handleDownloadAll}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <Download size={18} className="text-gray-600" />
                        </button>
                    </div>
                )}
            </div>

            {/* 이미지 슬라이더 */}
            <div className="relative w-full h-[500px] bg-white overflow-hidden flex items-center justify-center">
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
                                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                            >
                                <ChevronLeft size={20} />
                            </button>
                        )}
                        {index < images.length - 1 && (
                            <button
                                onClick={next}
                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                            >
                                <ChevronRight size={20} />
                            </button>
                        )}
                    </>
                )}

                {hasMultiple && (
                    <div className="absolute bottom-3 w-full flex justify-center gap-1.5">
                        {images.map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full transition-all ${
                                    i === index ? "bg-white w-6" : "bg-white/50"
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* 버튼 */}
            <div className="flex items-center gap-6 px-4 py-3 border-t">

                {/* 좋아요 */}
                <button
                    onClick={() => likeMutation.mutate()}
                    className="flex items-center gap-2 hover:scale-105 transition-transform"
                >
                    <Heart
                        size={24}
                        className={post.myLiked ? "text-red-500 fill-red-500" : "text-gray-600"}
                    />
                    <span className="text-sm font-medium">{post.likeCount}</span>
                </button>

                {/* 댓글 */}
                <button
                    className="flex items-center gap-2 hover:scale-105 transition-transform"
                    onClick={() => setShowComments(!showComments)}
                >
                    <MessageCircle size={24} className="text-gray-600" />
                    <span className="text-sm font-medium">
                        {post.commentCount}
                    </span>
                </button>
            </div>

            {/* 내용 */}
            <div className="px-4 pb-3 text-sm leading-relaxed whitespace-pre-line">
                {post.content}
            </div>

            {/* 댓글 영역 */}
            {showComments && (
                <div className="border-t bg-gray-50 px-4 py-4">
                    <CommentList groupId={groupId} postId={post.id} userId={userId} />
                    <CommentInput groupId={groupId} postId={post.id} />
                </div>
            )}
        </div>
    );
};

export default PostCard;