import type { ReactNode } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";
import { Button } from "./ui/button";
export function Sheet({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="sheet-backdrop" />
        <Dialog.Popup className="sheet">
          <div className="sheet-head">
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Close
              render={
                <Button variant="ghost" className="touch" aria-label="关闭" />
              }
            >
              <XIcon />
            </Dialog.Close>
          </div>
          <Dialog.Description className="muted">
            HiMate 前端演示 · 数据仅保留在本次页面中
          </Dialog.Description>
          <div className="sheet-content">{children}</div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
