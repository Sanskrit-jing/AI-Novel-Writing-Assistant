import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Maximize2 } from "lucide-react";
import MarkdownViewer from "./MarkdownViewer";
import FullscreenEditor from "./FullscreenEditor";

interface StreamOutputProps {
  isStreaming: boolean;
  content: string;
  onAbort?: () => void;
  onChange?: (value: string) => void;
  title?: string;
  emptyText?: string;
}

export default function StreamOutput({ isStreaming, content, onAbort, onChange, title = "AI 输出", emptyText = "等待流式输出..." }: StreamOutputProps) {
  const wordCount = content.trim().length;

  return (
    <motion.div
      className="min-w-0 w-full max-w-full overflow-hidden rounded-md border bg-card p-4"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{title}</span>
        <div className="flex items-center gap-2">
          {isStreaming ? (
            <span className="text-xs text-muted-foreground">正在生成...</span>
          ) : (
            <span className="text-xs text-muted-foreground">字数：{wordCount}</span>
          )}
          {onChange && (
            <FullscreenEditor
              value={content}
              onChange={onChange}
              title={`${title} - 编辑`}
              placeholder={emptyText}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                title="全查看和编辑"
              >
                <Maximize2 className="h-3 w-3" />
              </Button>
            </FullscreenEditor>
          )}
          {isStreaming && onAbort ? (
            <Button size="sm" variant="secondary" onClick={onAbort}>
              停止生成
            </Button>
          ) : null}
        </div>
      </div>

      <div className="max-h-[200px] overflow-y-auto">
        <MarkdownViewer content={content || emptyText} />
      </div>
    </motion.div>
  );
}
