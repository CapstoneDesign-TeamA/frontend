// src/lib/api/posts.ts
import { fetcher } from "./fetcher";

export type Post = {
    id: number;
    groupId: number;
    userId: number;
    type: string;
    content: string;
    createdAt: string;
    meetingId?: number;
    images: string[];
    likeCount: number;
    myLiked: boolean;
    commentCount?: number;
    nickname?: string;
    aiKeywords?: string;
    aiSentiment?: string;
    aiSummary?: string;
};

// ----------------------
// 게시글 생성 (파일 여러개 업로드 지원)
// ----------------------
export async function createPost(
    groupId: number,
    body: { content: string; type: string; meetingId?: number; files: File[] }
) {
    const formData = new FormData();
    formData.append("content", body.content);
    formData.append("type", body.type);

    if (body.meetingId) {
        formData.append("meetingId", String(body.meetingId));
    }

    body.files.forEach((file) => {
        formData.append("files", file); // MultipartFile[] files 로 매핑
    });

    return fetcher(`/groups/${groupId}/posts`, {
        method: "POST",
        body: formData,
    });
}

// ----------------------
// 피드 조회
// ----------------------
export async function fetchFeed(groupId: number): Promise<Post[]> {
    const data = await fetcher(`/groups/${groupId}/posts`);
    return data as Post[];
}

// ----------------------
// 게시글 수정
// ----------------------
export async function updatePost(
    groupId: number,
    postId: number,
    body: { content: string; newImages?: string[]; keepImageIds?: number[] }
) {
    return fetcher(`/groups/${groupId}/posts/${postId}`, {
        method: "PUT",
        body: JSON.stringify(body),
    });
}

// 게시글 삭제
export async function deletePost(
    groupId: number,
    postId: number
): Promise<{ message: string }> {
    return fetcher(`/groups/${groupId}/posts/${postId}`, { method: "DELETE" }) as Promise<{
        message: string;
    }>;
}

// 좋아요 토글
export async function toggleLike(groupId: number, postId: number) {
    return fetcher(`/groups/${groupId}/posts/${postId}/like`, {
        method: "POST",
    });
}