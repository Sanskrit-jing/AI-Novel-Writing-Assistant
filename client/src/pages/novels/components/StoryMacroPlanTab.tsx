import { useState } from "react";
import type { StoryConflictLayers, StoryMacroField } from "@ai-novel/shared/types/storyMacro";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import FullscreenEditor from "@/components/common/FullscreenEditor";
import { Maximize2 } from "lucide-react";
import type { StoryMacroTabProps } from "./NovelEditView.types";
import {
  ENGINE_TEXT_FIELDS,
  FieldActions,
  listToText,
  SUMMARY_FIELDS,
  textareaClassName,
} from "./StoryMacroPlanTab.shared";

const EMPTY_CONFLICT_LAYERS: StoryConflictLayers = {
  external: "",
  internal: "",
  relational: "",
};

export default function StoryMacroPlanTab(props: StoryMacroTabProps) {
  const [activeSection, setActiveSection] = useState("basicInfo");
  const expansion = props.expansion ?? {
    expanded_premise: "",
    protagonist_core: "",
    conflict_engine: "",
    conflict_layers: EMPTY_CONFLICT_LAYERS,
    mystery_box: "",
    emotional_line: "",
    setpiece_seeds: [],
    tone_reference: "",
  };

  const sections = [
    { id: "basicInfo", label: "故事想法输入" },
    { id: "storyEngine", label: "故事引擎原型" },
    { id: "issues", label: "冲突与信息缺口" },
    { id: "summary", label: "推进与兑现摘要" },
    { id: "constraints", label: "硬约束" },
    { id: "constraintEngine", label: "约束引擎" },
    { id: "storyState", label: "故事状态" },
  ];

  return (
    <div className="flex gap-4 h-[80vh]">
      {/* 左侧导航栏 */}
      <div className="w-64 shrink-0">
        <Card className="h-full flex flex-col">
          <CardHeader className="sticky top-0 z-10 bg-background border-b">
            <CardTitle className="text-lg">故事宏观规划</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === section.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-muted"
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 右侧内容栏 */}
      <div className="flex-1">
        <Card className="h-full flex flex-col">
          <CardContent className="flex-1 overflow-y-auto">
            {activeSection === "basicInfo" && (
              <div className="space-y-4">
                <CardHeader className="sticky top-0 z-10 bg-background border-b mb-4">
                  <CardTitle>故事想法输入</CardTitle>
                  <CardDescription>
                    这一步先于角色创建。这里不生成具体角色阵容，而是先把故事重构成能持续推进的故事引擎原型。
                  </CardDescription>
                </CardHeader>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-foreground">故事想法输入</div>
                    <FullscreenEditor
                      value={props.storyInput}
                      onChange={(value) => props.onStoryInputChange(value)}
                      title="全屏编辑 - 故事想法输入"
                      placeholder="用自然语言描述故事想法、想要的压迫感、想避免的风格和结局倾向。"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        title="全屏编辑"
                      >
                        <Maximize2 className="h-3 w-3" />
                      </Button>
                    </FullscreenEditor>
                  </div>
                  <textarea
                    value={props.storyInput}
                    onChange={(event) => props.onStoryInputChange(event.target.value)}
                    placeholder="用自然语言描述故事想法、想要的压迫感、想避免的风格和结局倾向。"
                    className={textareaClassName("min-h-36")}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={props.onDecompose} disabled={props.isDecomposing || !props.storyInput.trim()}>
                    {props.isDecomposing ? "生成中..." : props.hasPlan ? "重新生成故事引擎" : "生成故事引擎"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={props.onBuildConstraintEngine}
                    disabled={props.isBuilding || !props.decomposition.selling_point.trim()}
                  >
                    {props.isBuilding ? "构建中..." : "构建约束引擎"}
                  </Button>
                  <Button variant="outline" onClick={props.onSaveEdits} disabled={props.isSaving}>
                    {props.isSaving ? "保存中..." : "保存修改"}
                  </Button>
                </div>
                {props.message ? (
                  <div className="rounded-lg border border-border/70 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                    {props.message}
                  </div>
                ) : null}
              </div>
            )}

            {activeSection === "storyEngine" && props.expansion && (
              <div className="space-y-4">
                <CardHeader className="sticky top-0 z-10 bg-background border-b mb-4">
                  <CardTitle>故事引擎原型</CardTitle>
                  <CardDescription>
                    这里定义故事为什么能一直写下去：主角如何被困、冲突怎样升级、未知如何驱动读者继续读。
                  </CardDescription>
                </CardHeader>
                <div className="grid gap-4 xl:grid-cols-2">
                  {ENGINE_TEXT_FIELDS.map((item) => {
                    const value = expansion[item.field as keyof typeof expansion];
                    return (
                      <div key={item.field} className="space-y-2 rounded-xl border border-border/70 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="text-sm font-medium text-foreground">{item.label}</div>
                          <div className="flex items-center gap-2">
                            <FieldActions
                              field={item.field}
                              lockedFields={props.lockedFields}
                              regeneratingField={props.regeneratingField}
                              storyInput={props.storyInput}
                              onToggleLock={props.onToggleLock}
                              onRegenerateField={props.onRegenerateField}
                            />
                            <FullscreenEditor
                              value={typeof value === "string" ? value : ""}
                              onChange={(val) => props.onFieldChange(item.field, val)}
                              title={`全屏编辑 - ${item.label}`}
                              placeholder={item.placeholder}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                title="全屏编辑"
                              >
                                <Maximize2 className="h-3 w-3" />
                              </Button>
                            </FullscreenEditor>
                          </div>
                        </div>
                        {item.multiline ? (
                          <textarea
                            value={typeof value === "string" ? value : ""}
                            onChange={(event) => props.onFieldChange(item.field, event.target.value)}
                            placeholder={item.placeholder}
                            className={textareaClassName()}
                          />
                        ) : (
                          <Input
                            value={typeof value === "string" ? value : ""}
                            onChange={(event) => props.onFieldChange(item.field, event.target.value)}
                            placeholder={item.placeholder}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-2 rounded-xl border border-border/70 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-medium text-foreground">冲突层</div>
                    <FieldActions
                      field="conflict_layers"
                      lockedFields={props.lockedFields}
                      regeneratingField={props.regeneratingField}
                      storyInput={props.storyInput}
                      onToggleLock={props.onToggleLock}
                      onRegenerateField={props.onRegenerateField}
                    />
                  </div>
                  <div className="grid gap-4 xl:grid-cols-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">外部压迫</div>
                        <FullscreenEditor
                          value={expansion.conflict_layers.external}
                          onChange={(value) => props.onFieldChange("conflict_layers", {
                            ...expansion.conflict_layers,
                            external: value,
                          })}
                          title="全屏编辑 - 外部压迫"
                          placeholder="外部系统、威胁或环境如何持续压迫主角。"
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            title="全屏编辑"
                          >
                            <Maximize2 className="h-3 w-3" />
                          </Button>
                        </FullscreenEditor>
                      </div>
                      <textarea
                        value={expansion.conflict_layers.external}
                        onChange={(event) => props.onFieldChange("conflict_layers", {
                          ...expansion.conflict_layers,
                          external: event.target.value,
                        })}
                        placeholder="外部系统、威胁或环境如何持续压迫主角。"
                        className={textareaClassName("min-h-24")}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">内部崩塌</div>
                        <FullscreenEditor
                          value={expansion.conflict_layers.internal}
                          onChange={(value) => props.onFieldChange("conflict_layers", {
                            ...expansion.conflict_layers,
                            internal: value,
                          })}
                          title="全屏编辑 - 内部崩塌"
                          placeholder="主角内在恐惧、欲望或误判怎样反噬自己。"
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            title="全屏编辑"
                          >
                            <Maximize2 className="h-3 w-3" />
                          </Button>
                        </FullscreenEditor>
                      </div>
                      <textarea
                        value={expansion.conflict_layers.internal}
                        onChange={(event) => props.onFieldChange("conflict_layers", {
                          ...expansion.conflict_layers,
                          internal: event.target.value,
                        })}
                        placeholder="主角内在恐惧、欲望或误判怎样反噬自己。"
                        className={textareaClassName("min-h-24")}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">关系压力</div>
                        <FullscreenEditor
                          value={expansion.conflict_layers.relational}
                          onChange={(value) => props.onFieldChange("conflict_layers", {
                            ...expansion.conflict_layers,
                            relational: value,
                          })}
                          title="全屏编辑 - 关系压力"
                          placeholder="关键关系如何制造选择代价和情感张力。"
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            title="全屏编辑"
                          >
                            <Maximize2 className="h-3 w-3" />
                          </Button>
                        </FullscreenEditor>
                      </div>
                      <textarea
                        value={expansion.conflict_layers.relational}
                        onChange={(event) => props.onFieldChange("conflict_layers", {
                          ...expansion.conflict_layers,
                          relational: event.target.value,
                        })}
                        placeholder="关键关系如何制造选择代价和情感张力。"
                        className={textareaClassName("min-h-24")}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 rounded-xl border border-border/70 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-medium text-foreground">高张力场面种子</div>
                    <div className="flex items-center gap-2">
                      <FieldActions
                        field="setpiece_seeds"
                        lockedFields={props.lockedFields}
                        regeneratingField={props.regeneratingField}
                        storyInput={props.storyInput}
                        onToggleLock={props.onToggleLock}
                        onRegenerateField={props.onRegenerateField}
                      />
                      <FullscreenEditor
                        value={listToText(expansion.setpiece_seeds)}
                        onChange={(value) => props.onFieldChange(
                          "setpiece_seeds",
                          value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean),
                        )}
                        title="全屏编辑 - 高张力场面种子"
                        placeholder="每行一个高张力场面。"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          title="全屏编辑"
                        >
                          <Maximize2 className="h-3 w-3" />
                        </Button>
                      </FullscreenEditor>
                    </div>
                  </div>
                  <textarea
                    value={listToText(expansion.setpiece_seeds)}
                    onChange={(event) => props.onFieldChange(
                      "setpiece_seeds",
                      event.target.value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean),
                    )}
                    placeholder="每行一个高张力场面。"
                    className={textareaClassName("min-h-32")}
                  />
                </div>
              </div>
            )}

            {activeSection === "issues" && props.issues.length > 0 && (
              <div className="space-y-4">
                <CardHeader className="sticky top-0 z-10 bg-background border-b mb-4">
                  <CardTitle>冲突与信息缺口</CardTitle>
                </CardHeader>
                <div className="space-y-2">
                  {props.issues.map((issue, index) => (
                    <div key={`${issue.type}-${issue.field}-${index}`} className="rounded-lg border border-amber-300/60 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                      <div className="font-medium">{issue.type === "conflict" ? "输入冲突" : "信息不足"}</div>
                      <div className="mt-1">{issue.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === "summary" && (
              <div className="space-y-4">
                <CardHeader className="sticky top-0 z-10 bg-background border-b mb-4">
                  <CardTitle>推进与兑现摘要</CardTitle>
                  <CardDescription>
                    这是对故事引擎的压缩摘要，供后续大纲、节拍和写作流程直接消费。
                  </CardDescription>
                </CardHeader>
                <div className="grid gap-4 xl:grid-cols-2">
                  {SUMMARY_FIELDS.map((item) => {
                    const value = props.decomposition[item.field as keyof typeof props.decomposition];
                    return (
                      <div key={item.field} className="space-y-2 rounded-xl border border-border/70 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="text-sm font-medium text-foreground">{item.label}</div>
                          <div className="flex items-center gap-2">
                            <FieldActions
                              field={item.field}
                              lockedFields={props.lockedFields}
                              regeneratingField={props.regeneratingField}
                              storyInput={props.storyInput}
                              onToggleLock={props.onToggleLock}
                              onRegenerateField={props.onRegenerateField}
                            />
                            <FullscreenEditor
                              value={typeof value === "string" ? value : ""}
                              onChange={(val) => props.onFieldChange(item.field, val)}
                              title={`全屏编辑 - ${item.label}`}
                              placeholder={item.placeholder}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                title="全屏编辑"
                              >
                                <Maximize2 className="h-3 w-3" />
                              </Button>
                            </FullscreenEditor>
                          </div>
                        </div>
                        {item.multiline ? (
                          <textarea
                            value={typeof value === "string" ? value : ""}
                            onChange={(event) => props.onFieldChange(item.field, event.target.value)}
                            placeholder={item.placeholder}
                            className={textareaClassName()}
                          />
                        ) : (
                          <Input
                            value={typeof value === "string" ? value : ""}
                            onChange={(event) => props.onFieldChange(item.field, event.target.value)}
                            placeholder={item.placeholder}
                          />
                        )}
                      </div>
                    );
                  })}

                  <div className="space-y-2 rounded-xl border border-border/70 p-4 xl:col-span-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm font-medium text-foreground">关键兑现点</div>
                      <div className="flex items-center gap-2">
                        <FieldActions
                          field="major_payoffs"
                          lockedFields={props.lockedFields}
                          regeneratingField={props.regeneratingField}
                          storyInput={props.storyInput}
                          onToggleLock={props.onToggleLock}
                          onRegenerateField={props.onRegenerateField}
                        />
                        <FullscreenEditor
                          value={listToText(props.decomposition.major_payoffs)}
                          onChange={(value) => props.onFieldChange(
                            "major_payoffs",
                            value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean),
                          )}
                          title="全屏编辑 - 关键兑现点"
                          placeholder="每行一个关键兑现点。"
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            title="全屏编辑"
                          >
                            <Maximize2 className="h-3 w-3" />
                          </Button>
                        </FullscreenEditor>
                      </div>
                    </div>
                    <textarea
                      value={listToText(props.decomposition.major_payoffs)}
                      onChange={(event) => props.onFieldChange(
                        "major_payoffs",
                        event.target.value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean),
                      )}
                      placeholder="每行一个关键兑现点。"
                      className={textareaClassName("min-h-32")}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === "constraints" && (
              <div className="space-y-4">
                <CardHeader className="sticky top-0 z-10 bg-background border-b mb-4">
                  <CardTitle>硬约束</CardTitle>
                  <CardDescription>
                    这里的规则会作为后续生成的硬边界，防止故事在下游被写散。
                  </CardDescription>
                </CardHeader>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-medium text-foreground">叙事规则</div>
                    <div className="flex items-center gap-2">
                      <FieldActions
                        field="constraints"
                        lockedFields={props.lockedFields}
                        regeneratingField={props.regeneratingField}
                        storyInput={props.storyInput}
                        onToggleLock={props.onToggleLock}
                        onRegenerateField={props.onRegenerateField}
                      />
                      <FullscreenEditor
                        value={listToText(props.constraints)}
                        onChange={(value) => props.onFieldChange(
                          "constraints",
                          value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean),
                        )}
                        title="全屏编辑 - 叙事规则"
                        placeholder="每行一条必须遵守的叙事规则。"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          title="全屏编辑"
                        >
                          <Maximize2 className="h-3 w-3" />
                        </Button>
                      </FullscreenEditor>
                    </div>
                  </div>
                  <textarea
                    value={listToText(props.constraints)}
                    onChange={(event) => props.onFieldChange(
                      "constraints",
                      event.target.value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean),
                    )}
                    placeholder="每行一条必须遵守的叙事规则。"
                    className={textareaClassName("min-h-36")}
                  />
                </div>
              </div>
            )}

            {activeSection === "constraintEngine" && (
              <div className="space-y-4">
                <CardHeader className="sticky top-0 z-10 bg-background border-b mb-4">
                  <CardTitle>约束引擎</CardTitle>
                  <CardDescription>
                    当前保存的是后续角色、主线、章节规划可以直接消费的规则源。
                  </CardDescription>
                </CardHeader>
                {props.constraintEngine ? (
                  <>
                    <div className="space-y-2 rounded-xl border border-border/70 p-4">
                      <div className="text-sm font-medium text-foreground">故事前提</div>
                      <div className="text-sm leading-7 text-muted-foreground">{props.constraintEngine.premise}</div>
                    </div>
                    <div className="grid gap-4 xl:grid-cols-2">
                      <div className="space-y-2 rounded-xl border border-border/70 p-4">
                        <div className="text-sm font-medium text-foreground">核心未知</div>
                        <div className="text-sm text-muted-foreground">{props.constraintEngine.mystery_box}</div>
                      </div>
                      <div className="space-y-2 rounded-xl border border-border/70 p-4">
                        <div className="text-sm font-medium text-foreground">冲突轴线</div>
                        <div className="text-sm text-muted-foreground">{props.constraintEngine.conflict_axis}</div>
                      </div>
                      <div className="space-y-2 rounded-xl border border-border/70 p-4">
                        <div className="text-sm font-medium text-foreground">压力角色槽位</div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          {props.constraintEngine.pressure_roles.map((item) => (
                            <div key={item}>{item}</div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2 rounded-xl border border-border/70 p-4">
                        <div className="text-sm font-medium text-foreground">成长节点</div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          {props.constraintEngine.growth_path.map((item) => (
                            <div key={item}>{item}</div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2 rounded-xl border border-border/70 p-4">
                        <div className="text-sm font-medium text-foreground">阶段模型</div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          {props.constraintEngine.phase_model.map((phase) => (
                            <div key={phase.name}>
                              <span className="font-medium text-foreground">{phase.name}</span>
                              {" · "}
                              {phase.goal}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2 rounded-xl border border-border/70 p-4">
                        <div className="text-sm font-medium text-foreground">硬约束清单</div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          {props.constraintEngine.hard_constraints.map((item) => (
                            <div key={item}>{item}</div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2 rounded-xl border border-border/70 p-4 xl:col-span-2">
                        <div className="text-sm font-medium text-foreground">兑现节点</div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          {props.constraintEngine.turning_points.map((item) => (
                            <div key={`${item.phase}-${item.title}`}>
                              <span className="font-medium text-foreground">{item.phase}</span>
                              {" · "}
                              {item.summary}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2 rounded-xl border border-border/70 p-4">
                        <div className="text-sm font-medium text-foreground">结局必须出现</div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          {props.constraintEngine.ending_constraints.must_have.map((item) => (
                            <div key={item}>{item}</div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2 rounded-xl border border-border/70 p-4">
                        <div className="text-sm font-medium text-foreground">结局必须避免</div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          {props.constraintEngine.ending_constraints.must_not_have.map((item) => (
                            <div key={item}>{item}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl border border-dashed border-border/70 px-4 py-6 text-sm text-muted-foreground">
                    还没有约束引擎。先完成故事引擎拆解，再点击“构建约束引擎”。
                  </div>
                )}
              </div>
            )}

            {activeSection === "storyState" && (
              <div className="space-y-4">
                <CardHeader className="sticky top-0 z-10 bg-background border-b mb-4">
                  <CardTitle>故事状态</CardTitle>
                  <CardDescription>
                    保存当前阶段和主角处境，方便后续章节推进时复用。
                  </CardDescription>
                </CardHeader>
                <div className="grid gap-4 xl:grid-cols-[160px_160px_minmax(0,1fr)_auto]">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-foreground">当前阶段</div>
                    <Input
                      type="number"
                      value={props.state.currentPhase}
                      onChange={(event) => props.onStateChange("currentPhase", Number(event.target.value))}
                      min={0}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-foreground">进度</div>
                    <Input
                      type="number"
                      value={props.state.progress}
                      onChange={(event) => props.onStateChange("progress", Number(event.target.value))}
                      min={0}
                      max={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-foreground">主角当前处境</div>
                      <FullscreenEditor
                        value={props.state.protagonistState}
                        onChange={(value) => props.onStateChange("protagonistState", value)}
                        title="全屏编辑 - 主角当前处境"
                        placeholder="例如：仍在否认真相，但已经无法退出。"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          title="全屏编辑"
                        >
                          <Maximize2 className="h-3 w-3" />
                        </Button>
                      </FullscreenEditor>
                    </div>
                    <Input
                      value={props.state.protagonistState}
                      onChange={(event) => props.onStateChange("protagonistState", event.target.value)}
                      placeholder="例如：仍在否认真相，但已经无法退出。"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button variant="outline" onClick={props.onSaveState} disabled={props.isSavingState}>
                      {props.isSavingState ? "保存中..." : "保存状态"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
