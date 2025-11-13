/**
 * Collapsible
 * - 접거나 펼칠 수 있는 영역을 제공하는 간단한 래퍼입니다 (Radix Collapsible 사용).
 * - 사용처: 아코디언과는 별개로 단일 접힘 영역이 필요할 때
 */

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent;

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
