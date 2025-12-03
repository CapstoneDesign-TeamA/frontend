import {fetcher} from "@/lib/api/fetcher"; // 공통 fetcher

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// ===============================
// Meeting 타입 정의
// ===============================
export interface Meeting {
    id: number;
    groupId: number;
    creatorId: number;
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    time?: string;
    location?: string;
    participantCount: number;
    myStatus?: "ACCEPTED" | "DECLINED" | null;
    participants: string[];
    declined: string[];

}

// 모임 생성 시 Body
export type MeetingCreateBody = {
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    time?: string;     // optional
    location?: string;
};

// -----------------------------
// 모임 생성
// -----------------------------
export async function createMeeting(groupId: number, body: MeetingCreateBody) {
    return fetcher(`/groups/${groupId}/meetings`, {
        method: "POST",
        body: JSON.stringify(body),
    });
}

// -----------------------------
// 모임 목록 조회 (타입 지정)
// -----------------------------
export async function fetchMeetings(groupId: number): Promise<Meeting[]> {
    const res = await fetcher(`/groups/${groupId}/meetings`, { method: "GET" });

    const list = res as Array<Record<string, unknown>>;

    const mapped = list.map((m) => {
        const item: Meeting = {
            id: m.id as number,
            groupId: m.groupId as number,
            creatorId: m.creatorId as number,
            title: m.title as string,
            description: m.description as string | undefined,
            startDate: m.startDate as string,
            endDate: m.endDate as string,
            time: m.time as string | undefined,
            location: m.location as string | undefined,
            participantCount: m.participantCount as number,
            myStatus: (m.myStatus as "ACCEPTED" | "DECLINED" | null) ?? null,
            participants: (m.participants as string[]) ?? [],
            declined: (m.declined as string[]) ?? [],
        };

        return item;
    });

    return mapped;
}

// -----------------------------
// 참여
// -----------------------------
export async function participate(groupId: number, meetingId: number) {
    return fetcher(`/groups/${groupId}/meetings/${meetingId}/participate`, {
        method: "POST",
    });
}

// -----------------------------
// 불참
// -----------------------------
export async function decline(groupId: number, meetingId: number) {
    return fetcher(`/groups/${groupId}/meetings/${meetingId}/decline`, {
        method: "POST",
    });
}

// -----------------------------
// 참여자 목록 조회
// -----------------------------
export async function fetchParticipants(groupId: number, meetingId: number) {
    return fetcher(`/groups/${groupId}/meetings/${meetingId}/participants`, {
        method: "GET",
    });
}

// -----------------------------
// 모임 수정
// -----------------------------
export async function updateMeeting(
    groupId: number,
    meetingId: number,
    body: {
        title: string;
        description?: string;
        startDate: string;
        endDate: string;
        time?: string;
        location?: string;
    }
) {
    return fetcher(`/groups/${groupId}/meetings/${meetingId}`, {
        method: "PUT",
        body: JSON.stringify(body),
    });
}

// -----------------------------
// 모임 삭제 (creator 전용)
// -----------------------------
export async function deleteMeeting(groupId: number, meetingId: number) {
    return fetcher(`/groups/${groupId}/meetings/${meetingId}`, {
        method: "DELETE",
    });
}