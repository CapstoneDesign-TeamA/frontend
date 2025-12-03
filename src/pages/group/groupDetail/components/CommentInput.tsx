import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createComment } from "@/lib/api/comments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CommentInput = ({
                          groupId,
                          postId,
                      }: {
    groupId: number;
    postId: number;
}) => {
    const queryClient = useQueryClient();
    const [content, setContent] = useState("");

    const mutation = useMutation({
        mutationFn: () => createComment(groupId, postId, content),
        onSuccess: () => {
            setContent("");
            queryClient.invalidateQueries({ queryKey: ["comments", postId] });
        }
    });

    return (
        <div className="flex gap-2 mt-3">
            <Input
                placeholder="댓글 입력..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1"
            />
            <Button
                onClick={() => content.trim() && mutation.mutate()}
                disabled={!content.trim()}
            >
                등록
            </Button>
        </div>
    );
};

export default CommentInput;