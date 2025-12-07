// src/lib/api/groups.ts

/**
 * ===============================
 * 프론트에서 사용할 타입 정의
 * ===============================
 */
export type Group = {
    groupId: number;
    name: string;
    membersCount?: number;
    upcomingEvents?: number;
    color?: string;
};

export type BackendGroupSummary = {
    group_id: number;
    name: string;
    member_count: number;
    last_active: string;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

/**
 * ===============================
 * 공통 fetcher — multipart/form-data 지원
 * ===============================
 */
async function fetcher<T>(input: RequestInfo, init: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem("accessToken");
    const isFormData = init.body instanceof FormData;

    const headers: Record<string, string> = {};
    if (!isFormData) headers["Content-Type"] = "application/json";
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(input, {
        ...init,
        headers: {
            ...headers,
            ...(init.headers as Record<string, string> | undefined),
        },
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || res.statusText);
    }

    if (res.status === 204) {
        return null as T;
    }

    return res.json() as Promise<T>;
}

/**
 * ===============================
 * 내 그룹 조회 (GET /groups/my)
 * ===============================
 */
export async function fetchMyGroups(): Promise<Group[]> {
    const res = await fetcher<{ data: BackendGroupSummary[] }>(
        `${API_BASE}/groups/my`
    );

    if (!res.data) return [];

    return res.data.map((g) => ({
        groupId: g.group_id,
        name: g.name,
        membersCount: g.member_count,
        upcomingEvents: 0,
        color: undefined,
    }));
}

/**
 * ===============================
 * 그룹 생성 (POST /groups)
 * ===============================
 */
export async function createGroup(payload: {
    name: string;
    description?: string;
    file?: File | null;
}) {
    const form = new FormData();
    form.append("name", payload.name);
    form.append("description", payload.description || "");

    if (payload.file) {
        form.append("file", payload.file);
    }

    return fetcher(`${API_BASE}/groups`, {
        method: "POST",
        body: form,
    });
}

/**
 * ===============================
 * 그룹 상세 페이지 타입
 * ===============================
 */
export type GroupSchedule = {
    scheduleId: number;
    title: string;
    date: string;
    time: string;
    description: string;
    createdAt: string;
};

export type GroupDetailData = {
    groupId: number;
    name: string;
    description: string;
    imageUrl: string | null;
    members: string[];
    schedules: GroupSchedule[];
    albums: string[];
};

export type AlbumResponse = {
    albumId: number;
    groupId: number;
    title: string;
    description: string;
    imageUrl: string | null;
    createdAt: string;
};

/**
 * ===============================
 * 백엔드 응답 타입 (snake_case)
 * ===============================
 */
type BackendGroupDetailResponse = {
    data: {
        group_id: number;
        name: string;
        description: string;
        image_url: string | null;
        members: string[];
        schedules: {
            schedule_id: number;
            group_id: number;
            title: string;
            date: string;
            time: string;
            description: string;
            created_at: string;
        }[];
        albums: string[];
    };
};

/**
 * ===============================
 * 그룹 상세 조회 (GET /groups/{id})
 * snake_case → camelCase 매핑
 * ===============================
 */
export async function fetchGroupDetail(groupId: number): Promise<GroupDetailData> {
    if (!Number.isFinite(groupId)) {
        throw new Error("유효하지 않은 그룹 ID입니다.");
    }

    const res = await fetcher<BackendGroupDetailResponse>(
        `${API_BASE}/groups/${groupId}`
    );

    const raw = res.data;

    return {
        groupId: raw.group_id,
        name: raw.name,
        description: raw.description,
        imageUrl: raw.image_url,
        members: raw.members,
        albums: raw.albums,

        schedules: raw.schedules.map((s) => ({
            scheduleId: s.schedule_id,
            title: s.title,
            date: s.date,
            time: s.time,
            description: s.description,
            createdAt: s.created_at,
        })),
    };
}

export type UploadGroupAlbumPayload = {
    groupId: number;
    title: string;
    description?: string;
    file: File;
};

export async function uploadGroupAlbum({
    groupId,
    title,
    description,
    file,
}: UploadGroupAlbumPayload): Promise<AlbumResponse> {
    if (!Number.isFinite(groupId)) {
        throw new Error("유효하지 않은 그룹 ID입니다.");
    }

    const form = new FormData();
    form.append("title", title);
    form.append("description", description ?? "");
    form.append("file", file);

    return fetcher(`${API_BASE}/groups/${groupId}/album`, {
        method: "POST",
        body: form,
    });
}

export async function deleteAlbumByUrl(groupId: number, imageUrl: string): Promise<{ message: string }> {
    if (!Number.isFinite(groupId) || !imageUrl) {
        throw new Error("유효하지 않은 요청입니다.");
    }

    const encoded = encodeURIComponent(imageUrl);
    return fetcher(`${API_BASE}/groups/${groupId}/album/by-url?imageUrl=${encoded}`, {
        method: "DELETE",
    });
}

/**
 * ===============================
 * 앨범 삭제 (DELETE /groups/{groupId}/album/{albumId})
 * ===============================
 */
export async function deleteAlbum(groupId: number, albumId: number): Promise<{ message: string }> {
    if (!Number.isFinite(groupId) || !Number.isFinite(albumId)) {
        throw new Error("유효하지 않은 ID입니다.");
    }

    return fetcher(`${API_BASE}/groups/${groupId}/album/${albumId}`, {
        method: "DELETE",
    });
}

export async function deleteGroup(groupId: number) {
    if (!Number.isFinite(groupId)) {
        throw new Error("유효하지 않은 그룹 ID입니다.");
    }

    return fetcher(`${API_BASE}/groups/${groupId}`, {
        method: "DELETE",
    });
}


/**
 * ===============================
 * 그룹 초대 기능
 * ===============================
 */

// 초대 링크 생성 응답 타입
export type InviteLinkResponse = {
    token: string;
    message: string;
};

// 초대 정보 조회 응답 타입
export type InviteInfoResponse = {
    groupId: number;
    name: string;
    description: string;
    imageUrl: string | null;
};

// 초대 수락 응답 타입
export type AcceptInviteResponse = {
    message: string;
};

/**
 * 초대 링크 생성 (POST /groups/{groupId}/invite)
 */
export async function createInviteLink(groupId: number): Promise<InviteLinkResponse> {
    if (!Number.isFinite(groupId)) {
        throw new Error("유효하지 않은 그룹 ID입니다.");
    }

    return fetcher(`${API_BASE}/groups/${groupId}/invite`, {
        method: "POST",
    });
}

/**
 * 초대 정보 조회 (GET /groups/invite/info?token={token})
 */
export async function fetchInviteInfo(token: string): Promise<InviteInfoResponse> {
    if (!token) {
        throw new Error("토큰이 필요합니다.");
    }

    return fetcher(`${API_BASE}/groups/invite/info?token=${token}`, {
        method: "GET",
    });
}

/**
 * 초대 수락 (POST /groups/invite/accept?token={token})
 */
export async function acceptInvite(token: string): Promise<AcceptInviteResponse> {
    if (!token) {
        throw new Error("토큰이 필요합니다.");
    }

    return fetcher(`${API_BASE}/groups/invite/accept?token=${token}`, {
        method: "POST",
    });
}
