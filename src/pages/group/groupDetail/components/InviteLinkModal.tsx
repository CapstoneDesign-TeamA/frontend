import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Copy, Share2 } from "lucide-react";

interface InviteLinkModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    inviteUrl: string;
}

const InviteLinkModal = ({
    open,
    onOpenChange,
    inviteUrl
}: InviteLinkModalProps) => {
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(inviteUrl);
            setCopied(true);

            toast({
                title: "복사 완료",
                description: "초대 링크가 클립보드에 복사되었습니다.",
            });

            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast({
                title: "복사 실패",
                description: "다시 시도해주세요.",
                variant: "destructive",
            });
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "그룹 초대",
                    text: "Once 그룹에 초대합니다!",
                    url: inviteUrl,
                });
            } catch (error) {
                // 사용자가 공유를 취소한 경우 무시
            }
        } else {
            handleCopy();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>초대 링크</DialogTitle>
                    <DialogDescription>
                        이 링크를 공유하여 친구를 그룹에 초대하세요.
                        <br />
                        초대 링크는 <strong>1회만 사용 가능</strong>합니다.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center space-x-2">
                    <div className="grid flex-1 gap-2">
                        <Input
                            readOnly
                            value={inviteUrl}
                            className="font-mono text-sm"
                        />
                    </div>
                    <Button
                        size="icon"
                        onClick={handleCopy}
                        variant={copied ? "default" : "outline"}
                        style={copied ? { backgroundColor: '#2f7e33' } : {}}
                    >
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex gap-2">
                    <Button
                        onClick={handleShare}
                        className="flex-1 text-white"
                        style={{ backgroundColor: '#2f7e33' }}
                    >
                        <Share2 className="h-4 w-4 mr-2" />
                        공유하기
                    </Button>
                    <Button
                        onClick={() => onOpenChange(false)}
                        variant="outline"
                        className="flex-1"
                    >
                        닫기
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default InviteLinkModal;

