// src/lib/api/calendar.ts

/**
 * ===============================
 * 프론트에서 사용할 타입 정의
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
    headers: {
      ...headers,
      ...(init.headers as Record<string, string> | undefined),
    },
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
 * 타입 정의 (snake → camel 변환 전용)
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
 * 월별 일정 불러오기
 * GET /calendar?year=&month=
 * ===========================
 */
export async function fetchMonthSchedules(year: number, month: number): Promise<Schedule[]> {
  const res = await fetcher<RawMonthSchedulesResponse>(`${API_BASE}/calendar?year=${year}&month=${month}`);

  return (res.schedules || []).map((s) => ({
    scheduleId: s.schedule_id,
    title: s.title,
    memo: s.memo,
    startDateTime: s.start_date_time,
    endDateTime: s.end_date_time,
    type: s.type,
    color: s.color,
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
  };
}

/**
 * ===========================
 * 일정 수정
 * ===========================
 */
export async function updateSchedule(id: number, payload: {
  title: string;
  memo?: string;
  startDateTime: string;
  endDateTime: string;
}): Promise<Schedule> {
  
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
