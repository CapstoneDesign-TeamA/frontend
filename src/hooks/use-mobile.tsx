import * as React from "react";

// 모바일 화면 기준 너비(px)
const MOBILE_BREAKPOINT = 768;

// useIsMobile: 현재 화면이 모바일 크기인지(true/false) 판별하는 훅
export function useIsMobile() {
    const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

    React.useEffect(() => {
        // 화면 너비가 기준보다 작은지 감시하는 미디어쿼리
        const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

        // 화면 크기 변경 시 호출되는 함수
        const onChange = () => {
            setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        };

        // 이벤트 리스너 등록
        mql.addEventListener("change", onChange);

        // 초기 상태 설정
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

        // 언마운트 시 이벤트 해제
        return () => mql.removeEventListener("change", onChange);
    }, []);

    // 모바일이면 true 반환
    return !!isMobile;
}