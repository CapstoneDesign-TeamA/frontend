import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { deleteAlbumByUrl } from "@/lib/api/groups";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";

interface AlbumViewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    albums: string[];
    groupId: number;
}

const AlbumViewModal = ({ open, onOpenChange, albums, groupId }: AlbumViewModalProps) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [albumList, setAlbumList] = useState<string[]>(albums);
    const queryClient = useQueryClient();
    const { toast } = useToast();

    useEffect(() => {
        if (open) {
            setAlbumList(albums);
        }
    }, [albums, open]);

    const deleteMutation = useMutation<{ message: string }, Error, string>({
        mutationFn: (imageUrl: string) => deleteAlbumByUrl(groupId, imageUrl),
        onSuccess: (_, imageUrl) => {
            setAlbumList((prev) => prev.filter((url) => url !== imageUrl));
            queryClient.invalidateQueries({ queryKey: ["groupDetail", groupId] });
            toast({
                title: "이미지가 삭제되었습니다",
                description: "앨범 리스트를 새로고침했습니다.",
            });
        },
        onError: (error) => {
            toast({
                title: "이미지 삭제 실패",
                description: error.message || "다시 시도해주세요.",
                variant: "destructive",
            });
        },
    });

    const handleDelete = (e: React.MouseEvent, url: string) => {
        e.stopPropagation();
        if (deleteMutation.isPending) return;
        deleteMutation.mutate(url);
    };

    const renderGrid = () => (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
            {albumList.map((url, i) => (
                <div
                    key={`${url}-${i}`}
                    className="relative aspect-square overflow-hidden rounded-lg border-2 border-gray-200 bg-muted cursor-pointer hover:border-[#2f7e33] hover:shadow-lg transition-all"
                    onClick={() => setSelectedImage(url)}
                >
                    <img
                        src={url}
                        alt={`앨범 ${i + 1}`}
                        className="h-full w-full object-cover"
                    />
                    <Button
                        size="icon"
                        variant="outline"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white text-red-600"
                        onClick={(e) => handleDelete(e, url)}
                        disabled={deleteMutation.isPending && deleteMutation.variables === url}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ))}
        </div>
    );

    return (
        <>
            {/* 앨범 전체보기 모달 */}
            <Dialog open={open && !selectedImage} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0">
                    <DialogHeader className="p-6 pb-4 flex-shrink-0 flex items-center justify-between">
                        <DialogTitle>앨범 전체보기 ({albumList.length}장)</DialogTitle>
                        {deleteMutation.isPending && (
                            <span className="text-sm text-muted-foreground">삭제 중...</span>
                        )}
                    </DialogHeader>

                    <div className="px-6 pb-6 overflow-y-auto custom-scrollbar flex-1">
                        {albumList.length > 0 ? (
                            renderGrid()
                        ) : (
                            <p className="text-center text-muted-foreground py-8">
                                등록된 사진이 없습니다.
                            </p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* 이미지 상세보기 모달 */}
            {selectedImage && (
                <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
                    <DialogContent className="max-w-5xl p-0 bg-black/95">
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            <X className="w-6 h-6 text-white" />
                        </button>
                        <div className="flex items-center justify-center p-4 min-h-[60vh] max-h-[90vh]">
                            <img
                                src={selectedImage}
                                alt="확대 이미지"
                                className="max-w-full max-h-full object-contain"
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
};

export default AlbumViewModal;
