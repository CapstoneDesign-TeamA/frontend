import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// 그룹 생성 모달 컴포넌트
// 요구사항:
// - name 필수, description / imageUrl 선택
// - open, onClose, onSubmit, loading props
// - Dialog 크기/여백은 기존 일정 추가 팝업을 가정하여 max-w-lg 적용
// - 생성 클릭 시 상위 onSubmit(payload) 호출
// - name 검증 후 에러 메시지 표시

export interface CreateGroupPayload {
  name: string;
  description?: string;
  imageUrl?: string;
}

interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateGroupPayload) => Promise<void> | void;
  loading?: boolean; // 생성 중 로딩 상태
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ open, onClose, onSubmit, loading }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [touched, setTouched] = useState(false);

  // 모달 열릴 때 폼 초기화
  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
      setImageUrl("");
      setTouched(false);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const trimmed = name.trim();
    if (!trimmed) return; // 필수값 검증 실패
    onSubmit({ name: trimmed, description: description.trim() || undefined, imageUrl: imageUrl.trim() || undefined });
  };

  const nameError = touched && !name.trim() ? "그룹명을 입력해주세요" : "";

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg p-0">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                autoFocus
                aria-invalid={!!nameError}
                aria-describedby={nameError ? "group-name-error" : undefined}
              />
              {nameError && <p id="group-name-error" className="text-xs text-destructive mt-1">{nameError}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="group-description">그룹 설명 (선택)</Label>
              <Textarea
                id="group-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="그룹에 대한 간단한 설명을 작성하세요."
                className="resize-none"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="group-image">대표 이미지 URL (선택)</Label>
              <Input
                id="group-image"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.png"
              />
              {imageUrl.trim() && (
                <div className="mt-2 rounded-md border p-2 flex items-center gap-3">
                  <img
                    src={imageUrl}
                    alt="그룹 이미지 미리보기"
                    className="w-12 h-12 object-cover rounded"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                  <span className="text-xs text-muted-foreground break-all flex-1">
                    {imageUrl}
                  </span>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>취소</Button>
            <Button type="submit" disabled={loading || !name.trim()}>{loading ? "생성 중..." : "생성"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
