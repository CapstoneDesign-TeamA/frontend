import * as React from "react";
import type {ToastActionElement, ToastProps} from "@/components/ui/toast";

// 동시에 표시 가능한 최대 토스트 개수
const TOAST_LIMIT = 1;
// 자동 제거까지 대기 시간 (ms)
const TOAST_REMOVE_DELAY = 1000000;

// Toast 객체 타입 정의
type ToasterToast = ToastProps & {
    id: string;
    title?: React.ReactNode;
    description?: React.ReactNode;
    action?: ToastActionElement;
};

// 액션 타입 정의 (토스트 추가/수정/닫기/삭제)
const actionTypes = {
    ADD_TOAST: "ADD_TOAST",
    UPDATE_TOAST: "UPDATE_TOAST",
    DISMISS_TOAST: "DISMISS_TOAST",
    REMOVE_TOAST: "REMOVE_TOAST",
} as const;

// 고유 ID 생성
let count = 0;

function genId() {
    count = (count + 1) % Number.MAX_SAFE_INTEGER;
    return count.toString();
}

type ActionType = typeof actionTypes;

// 상태 업데이트를 위한 액션 타입 정의
type Action =
    | { type: ActionType["ADD_TOAST"]; toast: ToasterToast }
    | { type: ActionType["UPDATE_TOAST"]; toast: Partial<ToasterToast> }
    | { type: ActionType["DISMISS_TOAST"]; toastId?: ToasterToast["id"] }
    | { type: ActionType["REMOVE_TOAST"]; toastId?: ToasterToast["id"] };

// 전역 상태 (현재 활성화된 토스트 목록)
interface State {
    toasts: ToasterToast[];
}

// 토스트 자동 제거를 위한 타이머 저장소
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

// 일정 시간이 지나면 토스트 제거
const addToRemoveQueue = (toastId: string) => {
    if (toastTimeouts.has(toastId)) return;

    const timeout = setTimeout(() => {
        toastTimeouts.delete(toastId);
        dispatch({type: "REMOVE_TOAST", toastId});
    }, TOAST_REMOVE_DELAY);

    toastTimeouts.set(toastId, timeout);
};

// reducer: 액션에 따라 토스트 상태 변경
export const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        // 새 토스트 추가
        case "ADD_TOAST":
            return {...state, toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT)};

        // 기존 토스트 업데이트
        case "UPDATE_TOAST":
            return {
                ...state,
                toasts: state.toasts.map((t) => (t.id === action.toast.id ? {...t, ...action.toast} : t)),
            };

        // 토스트 닫기 (open: false)
        case "DISMISS_TOAST": {
            const {toastId} = action;

            if (toastId) addToRemoveQueue(toastId);
            else state.toasts.forEach((toast) => addToRemoveQueue(toast.id));

            return {
                ...state,
                toasts: state.toasts.map((t) =>
                    t.id === toastId || toastId === undefined ? {...t, open: false} : t
                ),
            };
        }

        // 토스트 완전히 삭제
        case "REMOVE_TOAST":
            if (action.toastId === undefined) {
                return {...state, toasts: []};
            }
            return {...state, toasts: state.toasts.filter((t) => t.id !== action.toastId)};
    }
};

// 상태 변경 리스너 목록
const listeners: Array<(state: State) => void> = [];
let memoryState: State = {toasts: []};

// dispatch: 상태를 reducer로 업데이트하고 모든 리스너에 알림
function dispatch(action: Action) {
    memoryState = reducer(memoryState, action);
    listeners.forEach((listener) => listener(memoryState));
}

// toast 생성 함수
type Toast = Omit<ToasterToast, "id">;

function toast({...props}: Toast) {
    const id = genId();

    const update = (props: ToasterToast) => dispatch({type: "UPDATE_TOAST", toast: {...props, id}});
    const dismiss = () => dispatch({type: "DISMISS_TOAST", toastId: id});

    dispatch({
        type: "ADD_TOAST",
        toast: {
            ...props,
            id,
            open: true,
            onOpenChange: (open) => {
                if (!open) dismiss();
            },
        },
    });

    return {id, dismiss, update};
}

// React 컴포넌트에서 사용하는 hook
function useToast() {
    const [state, setState] = React.useState<State>(memoryState);

    React.useEffect(() => {
        listeners.push(setState);
        return () => {
            const index = listeners.indexOf(setState);
            if (index > -1) listeners.splice(index, 1);
        };
    }, [state]);

    return {
        ...state,
        toast,
        dismiss: (toastId?: string) => dispatch({type: "DISMISS_TOAST", toastId}),
    };
}

export {useToast, toast};