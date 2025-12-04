import { fetcher } from "@/lib/api/fetcher";

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
    time?: string;
    location?: string;
};

// ===============================
// AI 추천 타입
// ===============================
export interface AiRecommendItem {
    placeName: string;
    address: string;
    reason: string;
    imageUrl?: string;
}

export interface AiRecommendResponse {
    recommendations: AiRecommendItem[];
}

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

    return list.map((m) => ({
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
    }));
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
    // 1. 모임 불참 API 호출
    const result = await fetcher(`/groups/${groupId}/meetings/${meetingId}/decline`, {
        method: "POST",
    });

    // 2. 캘린더에서 해당 모임 일정 삭제
    try {
        const meetings = await fetchMeetings(groupId);
        const meeting = meetings.find(m => m.id === meetingId);

        if (meeting) {
            // 현재 달의 캘린더 일정을 가져와서 매칭되는 일정 삭제
            const { fetchMonthSchedules, deleteSchedule } = await import("@/lib/api/calendar");
            const now = new Date();
            const schedules = await fetchMonthSchedules(now.getFullYear(), now.getMonth() + 1);

            // 제목이 매칭되는 일정 찾기
            const scheduleToDelete = schedules.find(
                s => s.title === `[모임] ${meeting.title}` &&
                     s.startDateTime.startsWith(meeting.startDate)
            );

            if (scheduleToDelete) {
                await deleteSchedule(scheduleToDelete.scheduleId);
            }
        }
    } catch (error) {
        console.error("캘린더 일정 삭제 실패:", error);
        // 캘린더 삭제 실패해도 불참은 성공한 것으로 처리
    }

    return result;
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
// 모임 삭제
// -----------------------------
export async function deleteMeeting(groupId: number, meetingId: number) {
    return fetcher(`/groups/${groupId}/meetings/${meetingId}`, {
        method: "DELETE",
    });
}

// -----------------------------
// AI 추천 (타입 안전)
// -----------------------------
export async function fetchAiRecommendByGroup(
    groupId: number
): Promise<AiRecommendResponse> {
    return fetcher(`/ai/recommend/group/${groupId}`, {
        method: "POST",
    }) as Promise<AiRecommendResponse>;
}