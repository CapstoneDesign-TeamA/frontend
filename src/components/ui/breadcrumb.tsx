/**
 * Breadcrumb
 * - 페이지 위치를 계층적으로 보여주는 내비게이션 컴포넌트 모음입니다.
 * - Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink 등으로 구성됩니다.
 */

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

// Breadcrumb: 전체 브레드크럼 내비게이션 컨테이너
const Breadcrumb = React.forwardRef<
    HTMLElement,
    React.ComponentPropsWithoutRef<"nav"> & { separator?: React.ReactNode }
>(({ ...props }, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />);
Breadcrumb.displayName = "Breadcrumb";

// BreadcrumbList: 브레드크럼 항목들을 감싸는 <ol> 리스트
const BreadcrumbList = React.forwardRef<HTMLOListElement, React.ComponentPropsWithoutRef<"ol">>(
    ({ className, ...props }, ref) => (
        <ol
            ref={ref}
            className={cn(
                "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5",
                className
            )}
            {...props}
        />
    )
);
BreadcrumbList.displayName = "BreadcrumbList";

// BreadcrumbItem: 각 단계(항목)를 감싸는 <li> 요소
const BreadcrumbItem = React.forwardRef<HTMLLIElement, React.ComponentPropsWithoutRef<"li">>(
    ({ className, ...props }, ref) => (
        <li ref={ref} className={cn("inline-flex items-center gap-1.5", className)} {...props} />
    )
);
BreadcrumbItem.displayName = "BreadcrumbItem";

// BreadcrumbLink: 실제 클릭 가능한 링크
const BreadcrumbLink = React.forwardRef<
    HTMLAnchorElement,
    React.ComponentPropsWithoutRef<"a"> & { asChild?: boolean }
>(({ asChild, className, ...props }, ref) => {
    const Comp = asChild ? Slot : "a";
    return <Comp ref={ref} className={cn("transition-colors hover:text-foreground", className)} {...props} />;
});
BreadcrumbLink.displayName = "BreadcrumbLink";

// BreadcrumbPage: 현재 페이지를 표시하는 마지막 항목
const BreadcrumbPage = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<"span">>(
    ({ className, ...props }, ref) => (
        <span
            ref={ref}
            role="link"
            aria-disabled="true"
            aria-current="page"
            className={cn("font-normal text-foreground", className)}
            {...props}
        />
    )
);
BreadcrumbPage.displayName = "BreadcrumbPage";

// BreadcrumbSeparator: 각 항목 사이 구분자 (기본값: > 아이콘)
const BreadcrumbSeparator = ({ children, className, ...props }: React.ComponentProps<"li">) => (
    <li role="presentation" aria-hidden="true" className={cn("[&>svg]:size-3.5", className)} {...props}>
        {children ?? <ChevronRight />}
    </li>
);
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

// BreadcrumbEllipsis: 항목이 많을 때 “...”으로 생략 표시
const BreadcrumbEllipsis = ({ className, ...props }: React.ComponentProps<"span">) => (
    <span
        role="presentation"
        aria-hidden="true"
        className={cn("flex h-9 w-9 items-center justify-center", className)}
        {...props}
    >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More</span>
  </span>
);
BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis";

// 모든 구성 요소 export
export {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
    BreadcrumbEllipsis,
};