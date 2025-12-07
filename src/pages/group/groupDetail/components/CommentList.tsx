import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchComments, deleteComment, updateComment } from "@/lib/api/comments";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import sproutImg from "@/assets/sprout.png";
import { fetchMyProfile } from "@/lib/api/user";

const CommentList = ({
                         groupId,
                         postId,
                         userId,
                     }: {
    groupId: number;
    postId: number;
    userId: number;
}) => {
    const queryClient = useQueryClient();

    // 사용자 프로필 정보 가져오기
    const { data: userInfo } = useQuery({
        queryKey: ["userInfo"],
        queryFn: fetchMyProfile,
    });

    const userProfileImage = userInfo?.profileImage;

    const { data: comments } = useQuery({
        queryKey: ["comments", postId],
        queryFn: () => fetchComments(groupId, postId),
    });

    const [editId, setEditId] = useState<number | null>(null);
    const [editText, setEditText] = useState("");

    // 댓글 삭제
    const deleteMutation = useMutation({
        mutationFn: (commentId: number) =>
            deleteComment(groupId, postId, commentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["comments", postId] });
        },
    });

    // 댓글 수정
    const updateMutation = useMutation({
        mutationFn: () => updateComment(groupId, postId, editId!, editText),
        onSuccess: () => {
            setEditId(null);
            setEditText("");
            queryClient.invalidateQueries({ queryKey: ["comments", postId] });
        },
    });

    if (!comments) return null;

    return (
        <div className="mt-4 space-y-4 border-t border-gray-200 pt-4">
            {comments.map((c) => {
                const isWriter = c.userId === userId;

                return (
                    <div key={c.id} className="pb-3 border-b border-gray-200">
                        {/* 상단: 프로필 + 닉네임 + 버튼 */}
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center overflow-hidden">
                                    {userProfileImage && isWriter ? (
                                        <img
                                            src={userProfileImage}
                                            alt="profile"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = sproutImg;
                                                e.currentTarget.className = "w-5 h-5 object-contain";
                                            }}
                                        />
                                    ) : (
                                        <img src={sproutImg} alt="profile" className="w-5 h-5 object-contain" />
                                    )}
                                </div>
                                <span className="font-medium text-sm">
                                    {c.nickname ?? `사용자 ${c.userId}`}
                                </span>
                            </div>

                            {isWriter && (
                                <div className="flex gap-2 items-center">
                                    <button
                                        onClick={() => {
                                            setEditId(c.id);
                                            setEditText(c.content);
                                        }}
                                    >
                                        <Pencil size={16} className="text-gray-600" />
                                    </button>
                                    <button onClick={() => deleteMutation.mutate(c.id)}>
                                        <Trash2 size={16} className="text-red-500" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 수정 중인지 여부 */}
                        {editId === c.id ? (
                            <div className="mt-2 flex gap-2 items-center">
                                <Input
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    className="flex-1"
                                />
                                <Button onClick={() => updateMutation.mutate()}>
                                    저장
                                </Button>
                                <Button variant="outline" onClick={() => setEditId(null)}>
                                    취소
                                </Button>
                            </div>
                        ) : (
                            <p className="text-sm mt-1">{c.content}</p>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default CommentList;