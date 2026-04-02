import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Maximize2, Check, X } from "lucide-react";

interface FullscreenEditorProps {
  value: string;
  onChange: (value: string) => void;
  title: string;
  placeholder?: string;
  children: React.ReactNode;
}

const FullscreenEditor: React.FC<FullscreenEditorProps> = ({
  value,
  onChange,
  title,
  placeholder = "请输入内容...",
  children,
}) => {
  const [editorValue, setEditorValue] = useState(value);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      // 打开时同步当前值
      setEditorValue(value);
    }
  };

  const handleSave = () => {
    onChange(editorValue);
  };

  const handleCancel = () => {
    // 取消时重置为原始值
    setEditorValue(value);
  };

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{title}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSave}
                className="h-8 w-8"
                title="保存修改"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                className="h-8 w-8"
                title="取消修改"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="mt-4">
          <textarea
            value={editorValue}
            onChange={(e) => setEditorValue(e.target.value)}
            placeholder={placeholder}
            className="w-full h-[60vh] rounded-md border bg-background px-4 py-3 text-sm font-mono resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleCancel}>
            取消
          </Button>
          <Button onClick={handleSave}>
            保存修改
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FullscreenEditor;