/**
 * Skeleton
 * - 로딩 상태에서 자리 표시용으로 사용하는 단순한 애니메이션 박스 컴포넌트입니다.
 * - 사용법: 로딩 중인 UI 위치에 <Skeleton />을 배치하여 레이아웃 유지 및 시각적 피드백 제공
 */

import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}

export { Skeleton };
