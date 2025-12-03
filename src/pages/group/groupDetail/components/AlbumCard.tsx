import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import PhotoUploadModal from "./PhotoUploadModal";

const AlbumCard = ({ albums, groupId }) => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>앨범</CardTitle>
                        <p className="text-sm text-muted-foreground">총 {albums.length}장</p>
                    </div>

                    <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
                        사진 업로드
                    </Button>
                </CardHeader>

                <CardContent>
                    {albums.length ? (
                        <div className="grid grid-cols-2 gap-4">
                            {albums.slice(0, 4).map((url, i) => (
                                <div
                                    key={i}
                                    className="aspect-square overflow-hidden rounded-lg border bg-muted"
                                >
                                    <img src={url} className="h-full w-full object-cover" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">등록된 사진이 없습니다.</p>
                    )}
                </CardContent>
            </Card>

            <PhotoUploadModal open={open} onOpenChange={setOpen} groupId={groupId} />
        </>
    );
};

export default AlbumCard;