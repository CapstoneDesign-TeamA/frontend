import { useQuery } from "@tanstack/react-query";
import { fetchFeed, Post } from "@/lib/api/posts";
import PostCard from "./PostCard";


const FeedList = ({
    groupId,
    userId,
    onEditPost
}: {
    groupId: number;
    userId: number;
    onEditPost?: (post: Post) => void;
}) => {
    const { data: feed } = useQuery<Post[]>({
        queryKey: ["feed", groupId],
        queryFn: () => fetchFeed(groupId),
    });

    if (!feed) return null;

    return (
        <div className="flex flex-col gap-4">
            {feed.map((post) => (
                <PostCard
                    key={post.id}
                    post={{ ...post, commentCount: post.commentCount ?? 0 }}
                    groupId={groupId}
                    userId={userId}
                    onEdit={onEditPost || (() => {})}
                />
            ))}
        </div>
    );
};

export default FeedList;

