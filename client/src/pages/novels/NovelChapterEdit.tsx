import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import StreamOutput from "@/components/common/StreamOutput";
import LLMSelector from "@/components/common/LLMSelector";
import FullscreenEditor from "@/components/common/FullscreenEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Maximize2 } from "lucide-react";
import { queryKeys } from "@/api/queryKeys";
import {
  getChapterAuditReports,
  getChapterPlan,
  getChapterStateSnapshot,
  getNovelDetail,
  getChapterTraces,
  replanNovel,
  updateNovelChapter,
} from "@/api/novel";
import {
  detectStyleIssues,
  rewriteStyleIssues,
} from "@/api/styleEngine";
import { useSSE } from "@/hooks/useSSE";
import { useLLMStore } from "@/store/llmStore";
import { ChapterRuntimeAuditCard, ChapterRuntimeContextCard } from "./components/ChapterRuntimePanels";

export default function NovelChapterEdit() {
  const { id = "", chapterId = "" } = useParams();
  const queryClient = useQueryClient();
  const llm = useLLMStore();
  const [contentDraft, setContentDraft] = useState("");
  const [styleRewritePreview, setStyleRewritePreview] = useState("");

  const { data: detailResponse } = useQuery({
    queryKey: queryKeys.novels.detail(id),
    queryFn: () => getNovelDetail(id),
    enabled: Boolean(id),
  });

  const { data: chapterPlanResponse } = useQuery({
    queryKey: queryKeys.novels.chapterPlan(id, chapterId),
    queryFn: () => getChapterPlan(id, chapterId),
    enabled: Boolean(id) && Boolean(chapterId),
  });

  const { data: chapterStateSnapshotResponse } = useQuery({
    queryKey: queryKeys.novels.chapterStateSnapshot(id, chapterId),
    queryFn: () => getChapterStateSnapshot(id, chapterId),
    enabled: Boolean(id) && Boolean(chapterId),
  });

  const { data: chapterTracesResponse } = useQuery({
    queryKey: queryKeys.novels.chapterTraces(id, chapterId),
    queryFn: () => getChapterTraces(id, chapterId),
    enabled: Boolean(id) && Boolean(chapterId),
  });

  const { data: chapterAuditReportsResponse } = useQuery({
    queryKey: queryKeys.novels.chapterAuditReports(id, chapterId),
    queryFn: () => getChapterAuditReports(id, chapterId),
    enabled: Boolean(id) && Boolean(chapterId),
  });

  const novel = detailResponse?.data ?? null;
  const chapter = useMemo(
    () => novel?.chapters.find((c) => c.id === chapterId) ?? null,
    [novel, chapterId],
  );
  const chapterPlan = chapterPlanResponse?.data ?? null;
  const chapterStateSnapshot = chapterStateSnapshotResponse?.data ?? null;
  const traces = chapterTracesResponse?.data ?? [];
  const chapterAuditReports = chapterAuditReportsResponse?.data ?? [];

  useEffect(() => {
    if (chapter?.content) {
      setContentDraft(chapter.content);
    }
  }, [chapter?.content]);

  const { start, abort, isStreaming, content, runtimePackage } = useSSE();

  const saveChapterMutation = useMutation({
    mutationFn: (content: string) => updateNovelChapter(id, chapterId, { content }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.novels.detail(id) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.novels.chapterPlan(id, chapterId) });
    },
  });

  const detectStyleMutation = useMutation({
    mutationFn: () =>
      detectStyleIssues({
        content: contentDraft,
        novelId: id,
        chapterId,
        provider: llm.provider,
        model: llm.model,
        temperature: 0.2,
      }),
  });

  const rewriteStyleMutation = useMutation({
    mutationFn: async () => {
      const report = detectStyleMutation.data?.data ?? (await detectStyleIssues({
        content: contentDraft,
        novelId: id,
        chapterId,
        provider: llm.provider,
        model: llm.model,
        temperature: 0.2,
      })).data;
      if (!report || report.violations.length === 0) {
        return { data: { content: contentDraft } };
      }
      return rewriteStyleIssues({
        content: contentDraft,
        novelId: id,
        chapterId,
        issues: report.violations.map((item) => ({
          ruleName: item.ruleName,
          excerpt: item.excerpt,
          suggestion: item.suggestion,
        })),
        provider: llm.provider,
        model: llm.model,
        temperature: 0.5,
      });
    },
    onSuccess: (response) => {
      const next = response.data?.content ?? contentDraft;
      setStyleRewritePreview(next);
      setContentDraft(next);
    },
  });

  const replanChapterMutation = useMutation({
    mutationFn: () => replanNovel(id, {
      chapterId,
      reason: "manual_replan_from_chapter_editor",
      triggerType: "manual",
      sourceIssueIds: openAuditIssueIds,
      windowSize: 3,
      provider: llm.provider,
      model: llm.model,
      temperature: llm.temperature,
    }),
    onSuccess: async (response) => {
      const affectedChapterIds = response.data?.affectedChapterIds ?? [];
      await queryClient.invalidateQueries({ queryKey: queryKeys.novels.detail(id) });
      await Promise.all(
        affectedChapterIds.map((affectedChapterId) =>
          queryClient.invalidateQueries({ queryKey: queryKeys.novels.chapterPlan(id, affectedChapterId) })),
      );
      await queryClient.invalidateQueries({ queryKey: queryKeys.novels.chapterPlan(id, chapterId) });
    },
  });

  const openAuditIssueIds = useMemo(() => {
    const issues: string[] = [];
    chapterAuditReports.forEach((report) => {
      report.issues.forEach((issue) => {
        if (issue.status === "open") {
          issues.push(issue.id);
        }
      });
    });
    return issues;
  }, [chapterAuditReports]);

  return (
    <div className="grid gap-4 lg:grid-cols-[28%_44%_28%]">
      <Card className="h-[calc(100vh-8rem)] flex flex-col">
        <CardHeader className="shrink-0">
          <CardTitle>章节信息</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-3">
          <div>
            <div className="mb-1 text-sm text-muted-foreground">章节标题</div>
            <div className="rounded-md border p-2 text-sm">{chapter?.title ?? "未找到章节"}</div>
          </div>
          <LLMSelector />
          <div className="flex gap-2">
            <Button
              onClick={() =>
                void start(`/novels/${id}/chapters/${chapterId}/runtime/run`, {
                  provider: llm.provider,
                  model: llm.model,
                  temperature: llm.temperature,
                })
              }
              disabled={isStreaming || !chapter}
            >
              AI 生成内容
            </Button>
            <Button variant="secondary" onClick={abort} disabled={!isStreaming}>
              停止生成
            </Button>
          </div>
          {traces.length > 0 && (
            <div className="rounded-md border p-2 text-sm">
              <div className="mb-1 font-medium text-muted-foreground">生成轨迹</div>
              <ul className="space-y-1">
                {traces.slice(0, 5).map((run) => (
                  <li key={run.id} className="flex items-center justify-between gap-2 text-xs">
                    <span className="truncate">{run.goal}</span>
                    <span className="shrink-0 text-muted-foreground">{run.status}</span>
                    <span className="shrink-0 text-muted-foreground">
                      {run.createdAt ? new Date(run.createdAt).toLocaleString() : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <ChapterRuntimeContextCard
            runtimePackage={runtimePackage}
            chapterPlan={chapterPlan}
            stateSnapshot={chapterStateSnapshot}
          />
          <StreamOutput content={content} isStreaming={isStreaming} onAbort={abort} />
        </CardContent>
      </Card>

      <Card className="h-[calc(100vh-8rem)] flex flex-col">
        <CardHeader className="shrink-0">
          <CardTitle>正文编辑</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-3">
          <div className="relative">
            <textarea
              className="min-h-[570px] w-full rounded-md border bg-background p-3 text-sm"
              value={contentDraft}
              onChange={(event) => setContentDraft(event.target.value)}
              placeholder="在这里编辑章节正文..."
            />
            <FullscreenEditor
              value={contentDraft}
              onChange={(value) => setContentDraft(value)}
              title="全屏编辑 - 章节正文"
              placeholder="在这里编辑章节正文..."
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 bg-background/80 hover:bg-background"
                title="全屏编辑"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </FullscreenEditor>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>字数：{contentDraft.length}</span>
            <Button
              onClick={() => saveChapterMutation.mutate(contentDraft)}
              disabled={saveChapterMutation.isPending || !chapter}
            >
              {saveChapterMutation.isPending ? "保存中..." : "保存章节"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="h-[calc(100vh-8rem)] flex flex-col">
        <CardHeader className="shrink-0">
          <CardTitle>写法 / 审计 / 决策</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-3">
          <div className="rounded-md border p-3">
            <div className="mb-2 text-sm font-medium">写法检测 / 一键修正</div>
            <div className="flex gap-2">
              <Button onClick={() => detectStyleMutation.mutate()} disabled={detectStyleMutation.isPending || !contentDraft.trim()}>
                检测 AI 味
              </Button>
              <Button variant="secondary" onClick={() => rewriteStyleMutation.mutate()} disabled={rewriteStyleMutation.isPending || !contentDraft.trim()}>
                一键修正
              </Button>
            </div>
            {detectStyleMutation.data?.data ? (
              <div className="mt-3 rounded-md border p-2 text-sm">
                <div className="font-medium">风险分：{detectStyleMutation.data.data.riskScore}</div>
                <div className="mt-1 text-muted-foreground">{detectStyleMutation.data.data.summary}</div>
              </div>
            ) : null}
            {styleRewritePreview ? (
              <div className="mt-2 rounded-md border bg-muted/20 p-2 text-xs text-muted-foreground">
                已将修正结果回填到正文编辑区。
              </div>
            ) : null}
          </div>

          {runtimePackage?.styleReview?.report ? (
            <div className="rounded-md border p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium">Runtime style review</div>
                <span className="text-xs text-muted-foreground">
                  risk {runtimePackage.styleReview.report.riskScore}
                </span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {runtimePackage.styleReview.autoRewritten
                  ? "This draft was auto-rewritten to better match the selected style."
                  : "This draft was checked against the selected style and kept as-is."}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {runtimePackage.styleReview.report.summary}
              </div>
              {runtimePackage.styleReview.report.violations.slice(0, 3).map((item, index) => (
                <div key={`${item.ruleId}-${index}`} className="mt-2 rounded-md border bg-muted/20 p-2 text-xs">
                  <div className="font-medium">{item.ruleName}</div>
                  <div className="mt-1 text-muted-foreground">{item.reason}</div>
                  <div className="mt-1 whitespace-pre-wrap">{item.excerpt}</div>
                </div>
              ))}
            </div>
          ) : null}
          <ChapterRuntimeAuditCard
            runtimePackage={runtimePackage}
            auditReports={chapterAuditReports}
            onReplan={() => replanChapterMutation.mutate()}
            isReplanning={replanChapterMutation.isPending}
            lastReplanResult={replanChapterMutation.data?.data ?? null}
          />
        </CardContent>
      </Card>
    </div>
  );
}
