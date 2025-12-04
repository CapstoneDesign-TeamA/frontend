import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { useState } from "react";

interface AlbumViewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    albums: string[];
}

const AlbumViewModal = ({ open, onOpenChange, albums }: AlbumViewModalProps) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    return (
        <>
            {/* 앨범 전체보기 모달 */}
            <Dialog open={open && !selectedImage} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl max-h-[80vh] p-0">
                    <DialogHeader className="p-6 pb-4">
                        <DialogTitle>앨범 전체보기 ({albums.length}장)</DialogTitle>
                    </DialogHeader>

                    <div className="px-6 pb-6 overflow-y-auto">
                        {albums.length > 0 ? (
                            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                                {albums.map((url, i) => (
                                    <div
                                        key={i}
                                        className="aspect-square overflow-hidden rounded-lg border bg-muted cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() => setSelectedImage(url)}
                                    >
                                        <img
                                            src={url}
                                            alt={`앨범 ${i + 1}`}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
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

