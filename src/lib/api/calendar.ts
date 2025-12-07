// src/lib/api/calendar.ts

/**
 * ===============================
 * 공통 설정
 * ===============================
 */
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

const getToken = () =>
    localStorage.getItem("access_token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("ACCESS_TOKEN") ||
    "";

async function fetcher<T>(input: RequestInfo, init: RequestInit = {}): Promise<T> {
    const token = getToken();
    const isFormData = init.body instanceof FormData;

    const headers: Record<string, string> = {};
    if (!isFormData) headers["Content-Type"] = "application/json";
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(input, {
        ...init,
        headers: { ...headers, ...(init.headers as Record<string, string> | undefined) },
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || res.statusText);
    }

    if (res.status === 204) return null as T;

    return res.json() as Promise<T>;
}

/**
 * ===========================
 * 타입 정의 — 개인 캘린더 (월 단위)
 * ===========================
 */

export type RawSchedule = {
    schedule_id: number;
    title: string;
    memo?: string;
    start_date_time: string;
    end_date_time: string;
    type?: "PERSONAL" | "GROUP";
    color?: string;
    user_id: number;
    user_name: string;
};

export type RawMonthSchedulesResponse = {
    schedules: RawSchedule[];
};

export type Schedule = {
    scheduleId: number;
    title: string;
    memo?: string;
    startDateTime: string;
    endDateTime: string;
    type?: "PERSONAL" | "GROUP";
    color?: string;
    userId: number;
    userName: string;
};

/**
 * ===========================
 * 타입 정의 — 개인 캘린더 (일 단위)
 * ===========================
 */

export type RawDailySchedule = {
    schedule_id: number;
    title: string;
    start_date_time: string;
    end_date_time: string;
    user_id: number;
    user_name: string;
};

export type RawDailyScheduleResponse = {
    schedules: RawDailySchedule[];
};

export type DailySchedule = {
    scheduleId: number;
    title: string;
    startDateTime: string;
    endDateTime: string;
    userId: number;
    userName: string;
};

export type CreateScheduleResponse = {
    schedule_id: number;
    message: string;
};

export type UpdateScheduleResponse = {
    schedule_id: number;
    message: string;
};

export type DeleteScheduleResponse = {
    message: string;
};

/**
 * ===========================
 * 월별 일정 조회
 * ===========================
 */
export async function fetchMonthSchedules(
    year: number,
    month: number
): Promise<Schedule[]> {
    const res = await fetcher<RawMonthSchedulesResponse>(
        `${API_BASE}/calendar?year=${year}&month=${month}`
    );

    return res.schedules.map((s) => ({
        scheduleId: s.schedule_id,
        title: s.title,
        memo: s.memo,
        startDateTime: s.start_date_time,
        endDateTime: s.end_date_time,
        type: s.type,
        color: s.color,
        userId: s.user_id,
        userName: s.user_name,
    }));
}

/**
 * ===========================
 * 일별 일정 조회
 * GET /calendar/date/{date}
 * ===========================
 */
export async function fetchDailySchedules(date: string): Promise<DailySchedule[]> {
    const res = await fetcher<RawDailyScheduleResponse>(
        `${API_BASE}/calendar/date/${date}`
    );

    // 현재 로그인한 사용자의 일정만 필터링
    const currentUserId = Number(localStorage.getItem("user_id"));

    return res.schedules
        .filter((s) => s.user_id === currentUserId)
        .map((s) => ({
            scheduleId: s.schedule_id,
            title: s.title,
            startDateTime: s.start_date_time,
            endDateTime: s.end_date_time,
            userId: s.user_id,
            userName: s.user_name,
        }));
}

/**
 * ===========================
 * 일정 생성
 * ===========================
 */
export async function createSchedule(payload: {
    title: string;
    memo?: string;
    startDateTime: string;
    endDateTime: string;
    groupId?: number | null;
}): Promise<Schedule> {
    const body = {
        title: payload.title,
        memo: payload.memo,
        start_date_time: payload.startDateTime,
        end_date_time: payload.endDateTime,
        group_id: payload.groupId ?? null,
    };

    const res = await fetcher<CreateScheduleResponse>(`${API_BASE}/calendar`, {
        method: "POST",
        body: JSON.stringify(body),
    });

    return {
        scheduleId: res.schedule_id,
        title: payload.title,
        memo: payload.memo,
        startDateTime: payload.startDateTime,
        endDateTime: payload.endDateTime,
        type: "PERSONAL",
        userId: Number(localStorage.getItem("user_id")) || 0,
        userName: localStorage.getItem("user_name") || "나",
    };
}

/**
 * ===========================
 * 일정 수정
 * ===========================
 */
export async function updateSchedule(
    id: number,
    payload: {
        title: string;
        memo?: string;
        startDateTime: string;
        endDateTime: string;
    }
): Promise<Schedule> {
    const body = {
        title: payload.title,
        memo: payload.memo,
        start_date_time: payload.startDateTime,
        end_date_time: payload.endDateTime,
    };

    const res = await fetcher<UpdateScheduleResponse>(`${API_BASE}/calendar/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
    });

    return {
        scheduleId: res.schedule_id,
        title: payload.title,
        memo: payload.memo,
        startDateTime: payload.startDateTime,
        endDateTime: payload.endDateTime,
        type: "PERSONAL",
        userId: Number(localStorage.getItem("user_id")) || 0,
        userName: localStorage.getItem("user_name") || "나",
    };
}

/**
 * ===========================
 * 일정 삭제
 * ===========================
 */
export async function deleteSchedule(id: number): Promise<string> {
    const res = await fetcher<DeleteScheduleResponse>(`${API_BASE}/calendar/${id}`, {
        method: "DELETE",
    });
    return res.message;
}

/**
 * ==========================================
 * 그룹 캘린더 API
 * ==========================================
 */

export type RawGroupSchedule = {
    schedule_id: number;
    group_id: number;
    title: string;
    date: string;
    time: string | null;
    description: string | null;
    created_at: string;
};

export type GroupSchedule = {
    scheduleId: number;
    groupId: number;
    title: string;
    date: string;
    time: string;
    description: string;
    createdAt: string;
};

/**
 * 그룹 일정 조회
 */
export async function fetchGroupSchedules(
    groupId: number,
    year?: number,
    month?: number
): Promise<GroupSchedule[]> {
    // year, month가 들어오면 월 단위 조회 지원
    let url = `${API_BASE}/groups/${groupId}/schedules`;

    if (year && month) {
        url += `?year=${year}&month=${month}`;
    }

    const res = await fetcher<{ data: RawGroupSchedule[] }>(url);

    return res.data.map((s) => ({
        scheduleId: s.schedule_id,
        groupId: s.group_id,
        title: s.title,
        date: s.date,
        time: s.time ?? "00:00",
        description: s.description ?? "",
        createdAt: s.created_at,
    }));
}

/**
 * 그룹 BusyCount
 */
export async function fetchGroupBusyCount(
    groupId: number,
    startDate: string,
    endDate: string
): Promise<{ busyCountByDay: Record<string, number> }> {
    return fetcher(
        `${API_BASE}/calendar/group/${groupId}/busy-count?startDate=${startDate}&endDate=${endDate}`
    );
}

/**
 * ===========================
 * 그룹원들의 개인 일정 조회 (월 단위)
 * GET /calendar/group/{groupId}/members?year={year}&month={month}
 * ===========================
 */
export async function fetchGroupMembersSchedules(
    groupId: number,
    year: number,
    month: number
): Promise<Schedule[]> {
    try {
        const res = await fetcher<RawMonthSchedulesResponse>(
            `${API_BASE}/calendar/group/${groupId}/members?year=${year}&month=${month}`
        );

        return res.schedules.map((s) => ({
            scheduleId: s.schedule_id,
            title: s.title,
            memo: s.memo,
            startDateTime: s.start_date_time,
            endDateTime: s.end_date_time,
            type: s.type || "PERSONAL",
            color: s.color,
            userId: s.user_id,
            userName: s.user_name,
        }));
    } catch (error) {
        // 백엔드에 해당 API가 없는 경우 빈 배열 반환
        console.warn("그룹원 일정 조회 실패:", error);
        return [];
    }
}
