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
    imageUrl?: string;
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
    const [imageUrl, setImageUrl] = useState("");

    useEffect(() => {
        if (open) {
            setName("");
            setDescription("");
            setImageUrl("");
        }
    }, [open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = name.trim();
        if (!trimmedName) return;

        onSubmit({
            name: trimmedName,
            description: description.trim() || undefined,
            imageUrl: imageUrl.trim() || undefined,
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
                        <div className="space-y-2">
                            <Label htmlFor="group-name">그룹명 *</Label>
                            <Input
                                id="group-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="예: 우리 스터디 그룹"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="group-description">그룹 설명</Label>
                            <Textarea
                                id="group-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                placeholder="그룹에 대한 간단한 설명"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="group-image-url">대표 이미지 URL</Label>
                            <Input
                                id="group-image-url"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="https://example.com/cover.png"
                            />
                            <p className="text-xs text-muted-foreground">
                                이미지를 아직 준비하지 않았다면 비워두셔도 됩니다.
                            </p>
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