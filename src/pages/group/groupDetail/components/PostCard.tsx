import { toggleLike } from "@/lib/api/posts";
import { Heart } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const PostCard = ({ post, groupId, userId }) => {
    const queryClient = useQueryClient();

    const likeMut = useMutation({
        mutationFn: () => toggleLike(groupId, post.id),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ["feed", groupId, userId] }),
    });

    return (
        <div className="bg-card rounded-xl p-4 shadow-sm border mb-4">
            <div className="font-semibold mb-2">{post.content}</div>

            {post.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2 my-3">
                    {post.images.map((img, i) => (
                        <img
                            key={i}
                            src={img}
                            className="rounded-lg h-40 w-full object-cover"
                        />
                    ))}
                </div>
            )}

            <button
                onClick={() => likeMut.mutate()}
                className={`flex items-center gap-2 text-sm ${
                    post.myLiked ? "text-red-500" : "text-muted-foreground"
                }`}
            >
                <Heart fill={post.myLiked ? "red" : "none"} size={18} />
                {post.likeCount}
            </button>
        </div>
    );
};

export default PostCard;