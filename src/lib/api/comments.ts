import { fetcher } from "@/lib/api/fetcher";

export type Comment = {
    id: number;
    postId: number;
    userId: number;
    nickname: string;
    groupId: number;
    content: string;
    createdAt: string;
    updatedAt: string;
};

// 내부 유틸: Comment 응답 검증
function ensureComment(data: unknown): Comment {
    if (
        data &&
        typeof data === "object" &&
        "id" in data &&
        "postId" in data &&
        "userId" in data &&
        "groupId" in data &&
        "content" in data
    ) {
        return data as Comment;
    }

    console.error("Invalid Comment response:", data);
    throw new Error("Invalid comment response format");
}

// =============================
// 댓글 조회
// =============================
export async function fetchComments(
    groupId: number,
    postId: number
): Promise<Comment[]> {
    const res = await fetcher(
        `/groups/${groupId}/posts/${postId}/comments`
    );

    return Array.isArray(res) ? (res as Comment[]) : [];
}

// =============================
// 댓글 생성
// =============================
export async function createComment(
    groupId: number,
    postId: number,
    content: string
): Promise<Comment> {
    const res = await fetcher(
        `/groups/${groupId}/posts/${postId}/comments`,
        {
            method: "POST",
            body: JSON.stringify({ content }),
        }
    );

    return ensureComment(res);
}

// =============================
// 댓글 수정
// =============================
export async function updateComment(
    groupId: number,
    postId: number,
    commentId: number,
    content: string
): Promise<Comment> {
    const res = await fetcher(
        `/groups/${groupId}/posts/${postId}/comments/${commentId}`,
        {
            method: "PUT",
            body: JSON.stringify({ content }),
        }
    );

    return ensureComment(res);
}

// =============================
// 댓글 삭제
// =============================
export async function deleteComment(
    groupId: number,
    postId: number,
    commentId: number
): Promise<{ message: string }> {
    const res = await fetcher(
        `/groups/${groupId}/posts/${postId}/comments/${commentId}`,
        {
            method: "DELETE",
        }
    );

    return res as { message: string };
}