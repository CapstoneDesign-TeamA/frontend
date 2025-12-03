import { useQuery } from "@tanstack/react-query";
import { fetchFeed } from "@/lib/api/posts";
import PostCard from "./PostCard";

const FeedList = ({ groupId, userId }) => {
    const { data: feed } = useQuery({
        queryKey: ["feed", groupId, userId],
        queryFn: () => fetchFeed(groupId),
    });

    if (!feed) return null;

    return (
        <div className="flex flex-col gap-4">
            {feed.map((post) => (
                <PostCard key={post.id} post={post} groupId={groupId} userId={userId} />
            ))}
        </div>
    );
};

export default FeedList;