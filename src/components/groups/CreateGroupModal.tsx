// components/groups/CreateGroupModal.tsx
import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface CreateGroupPayload {
    name: string;
    description?: string;
    file?: File | null;
}

interface CreateGroupModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (payload: CreateGroupPayload) => void;
    loading?: boolean;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
                                                                      open,
                                                                      onClose,
                                                                      onSubmit,
                                                                      loading,
                                                                  }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>("");

    useEffect(() => {
        if (open) {
            setName("");
            setDescription("");
            setFile(null);
            setPreview("");
        }
    }, [open]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0] || null;
        setFile(f);

        if (f) {
            const url = URL.createObjectURL(f);
            setPreview(url);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        onSubmit({
            name: name.trim(),
            description: description.trim(),
            file,
        });
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-lg p-0">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <DialogHeader>
                        <DialogTitle>그룹 생성</DialogTitle>
                        <DialogDescription>
                            새로운 그룹을 만들고 멤버들과 일정을 관리하세요.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* 그룹명 */}
                        <div className="space-y-2">
                            <Label>그룹명 *</Label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="예: 우리 스터디 그룹"
                                required
                            />
                        </div>

                        {/* 설명 */}
                        <div className="space-y-2">
                            <Label>그룹 설명</Label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                placeholder="그룹에 대한 간단한 설명"
                            />
                        </div>

                        {/* 이미지 */}
                        <div className="space-y-2">
                            <Label>대표 이미지 (선택)</Label>
                            <Input type="file" accept="image/*" onChange={handleFileChange} />

                            {preview && (
                                <div className="mt-2 flex items-center gap-3">
                                    <img
                                        src={preview}
                                        alt="미리보기"
                                        className="w-20 h-20 object-cover rounded-lg border"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            취소
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "생성 중..." : "생성"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};