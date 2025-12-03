import { useMutation, useQueryClient } from "@tanstack/react-query";
import { participate, decline } from "@/lib/api/meetings.ts";
import { useToast } from "@/hooks/use-toast.ts";

export function useMeetingActions(groupId: number) {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const participateMutation = useMutation({
        mutationFn: (meetingId: number) => participate(groupId, meetingId),
        onSuccess: () => {
            toast({ title: "참여 완료되었습니다." });
            queryClient.invalidateQueries({ queryKey: ["meetings", groupId] });
        },
    });

    const declineMutation = useMutation({
        mutationFn: (meetingId: number) => decline(groupId, meetingId),
        onSuccess: () => {
            toast({ title: "불참 처리되었습니다." });
            queryClient.invalidateQueries({ queryKey: ["meetings", groupId] });
        },
    });

    return {
        participate: participateMutation.mutate,
        decline: declineMutation.mutate,
    };
}