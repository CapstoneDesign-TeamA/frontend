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
    const [imageFile, setImageFile] = useState<File | null>(null); // 실제 선택된 파일

    // 모달 열릴 때마다 폼 초기화
    useEffect(() => {
        if (open) {
            setName("");
            setDescription("");
            setImageFile(null);
        }
    }, [open]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setImageFile(file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = name.trim();
        if (!trimmedName) return;

        onSubmit({
            name: trimmedName,
            description: description.trim() || undefined,
            file: imageFile ?? undefined, // ✅ 여기서 file 키로 넘김
        });
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-lg p-0">
                <form onSubmit={handleSubmit} className="space-y-6 p-6">
                    <DialogHeader>
                        <DialogTitle>그룹 생성</DialogTitle>
                        <DialogDescription>
                            새로운 그룹을 만들고 멤버들과 일정을 관리하세요.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* 그룹명 */}
                        <div className="space-y-2">
                            <Label htmlFor="group-name">그룹명 *</Label>
                            <Input
                                id="group-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="예: 우리 스터디 그룹"
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* 그룹 설명 */}
                        <div className="space-y-2">
                            <Label htmlFor="group-description">그룹 설명</Label>
                            <Textarea
                                id="group-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                placeholder="그룹에 대한 간단한 설명"
                                disabled={loading}
                            />
                        </div>

                        {/* 대표 이미지 파일 선택 */}
                        <div className="space-y-2">
                            <Label htmlFor="group-image-file">대표 이미지 파일</Label>
                            <Input
                                id="group-image-file"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                disabled={loading}
                                className="cursor-pointer"
                            />
                            {imageFile && (
                                <p className="text-xs text-muted-foreground">
                                    선택된 파일: {imageFile.name}
                                </p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
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