import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import PhotoUploadModal from "./PhotoUploadModal";
import AlbumViewModal from "./AlbumViewModal";
import { Image } from "lucide-react";

const AlbumCard = ({ albums, groupId }) => {
    const [openUpload, setOpenUpload] = useState(false);
    const [openView, setOpenView] = useState(false);

    return (
        <>
            <Card className="shadow-lg hover:shadow-xl transition-all border-2 border-gray-100">
                <CardHeader className="flex flex-row items-center justify-between pb-3 bg-gradient-to-r from-white to-gray-50">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-lg font-bold text-gray-900">앨범</CardTitle>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-sm font-bold shadow-md"
                             style={{ backgroundColor: '#2f7e33' }}>
                            <Image size={14} />
                            <span>{albums.length}</span>
                        </div>
                    </div>

                    <Button
                        size="sm"
                        className="text-white shadow-md hover:shadow-lg transition-all hover:scale-105 rounded-full px-4"
                        style={{ backgroundColor: '#2f7e33' }}
                        onClick={() => setOpenUpload(true)}
                    >
                        + 업로드
                    </Button>
                </CardHeader>

                <CardContent>
                    {albums.length ? (
                        <>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                {albums.slice(0, 4).map((url, i) => (
                                    <div
                                        key={i}
                                        className="aspect-square overflow-hidden rounded-xl border-2 border-gray-100 bg-white hover:border-gray-200 hover:shadow-md transition-all cursor-pointer"
                                    >
                                        <img src={url} className="h-full w-full object-cover" alt={`앨범 ${i + 1}`} />
                                    </div>
                                ))}
                            </div>
                            {albums.length > 4 && (
                                <Button
                                    variant="outline"
                                    className="w-full border-2 border-gray-200 hover:border-gray-300 font-semibold rounded-xl"
                                    onClick={() => setOpenView(true)}
                                >
                                    전체보기 ({albums.length}장)
                                </Button>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <div className="text-4xl mb-2">📷</div>
                            <p className="text-sm">등록된 사진이 없습니다</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <PhotoUploadModal open={openUpload} onOpenChange={setOpenUpload} groupId={groupId} />
            <AlbumViewModal open={openView} onOpenChange={setOpenView} albums={albums} />
        </>
    );
};

export default AlbumCard;