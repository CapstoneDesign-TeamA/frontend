/**
 * Badge
 * - 작은 배지/라벨 컴포넌트로 상태나 수치 표시용
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// badgeVariants: 뱃지의 스타일(variant) 정의
const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                // 기본 스타일
                default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
                // 보조 색상
                secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
                // 경고/위험용 색상
                destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
                // 외곽선만 있는 형태
                outline: "text-foreground",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

// BadgeProps: 뱃지 컴포넌트의 타입 정의
export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof badgeVariants> {}

// Badge: 상태나 분류를 표시하는 작은 라벨 컴포넌트
function Badge({ className, variant, ...props }: BadgeProps) {
    return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

// Badge 컴포넌트 및 스타일 export
export { Badge, badgeVariants };