import os
import re

# 定义要修改的文件路径
providers_file = r"d:\Github\gitub\AI-Novel-Writing-Assistant\server\src\llm\providers.ts"
rag_file = r"d:\Github\gitub\AI-Novel-Writing-Assistant\server\src\config\rag.ts"
settings_page_file = r"d:\Github\gitub\AI-Novel-Writing-Assistant\client\src\pages\settings\SettingsPage.tsx"
knowledge_embedding_file = r"d:\Github\gitub\AI-Novel-Writing-Assistant\client\src\pages\knowledge\components\KnowledgeEmbeddingSettingsCard.tsx"

# 定义输出目录
output_dir = r"d:\Github\gitub\AI-Novel-Writing-Assistant\Automatic"

# 确保输出目录存在
os.makedirs(output_dir, exist_ok=True)

def modify_providers():
    """修改providers.ts文件"""
    with open(providers_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 替换PROVIDERS配置
    new_providers = '''export const PROVIDERS: Record<LLMProvider, ProviderConfig> = {
  deepseek: {
    name: "腾讯混元",
    baseURL: "https://api.hunyuan.cloud.tencent.com/v1",
    defaultModel: "hunyuan-lite",
    models: ["hunyuan-lite"],
    envKey: "DEEPSEEK_API_KEY",
    maxTokens: 8192,
  },
  siliconflow: {
    name: "硅基流动",
    baseURL: "https://api.siliconflow.cn/v1",
    defaultModel: "deepseek-ai/DeepSeek-R1-0528-Qwen3-8B",
    models: ["deepseek-ai/DeepSeek-R1-0528-Qwen3-8B"],
    envKey: "SILICONFLOW_API_KEY",
  },
  openai: {
    name: "智谱",
    baseURL: "https://open.bigmodel.cn/api/paas/v4",
    defaultModel: "glm-4.7-flash",
    models: ["glm-4.7-flash", "GLM-4-Flash-250414"],
    envKey: "OPENAI_API_KEY",
  },
  anthropic: {
    name: "开源路由",
    baseURL: "https://openrouter.ai/api/v1",
    defaultModel: "stepfun/step-3.5-flash:free",
    models: ["stepfun/step-3.5-flash:free"],
    envKey: "ANTHROPIC_API_KEY",
  },
  grok: {
    name: "askcodi",
    baseURL: "https://api.askcodi.com/v1",
    defaultModel: "google/gemini-3-flash:free",
    models: ["google/gemini-3-flash:free", "deepseek/deepseek-v3.2:free"],
    envKey: "XAI_API_KEY",
  },
  // OpenAI-compatible 的厂商：只需要 baseURL / defaultModel / models 配好即可。
  kimi: {
    name: "魔塔",
    baseURL: "https://api-inference.modelscope.cn/v1",
    defaultModel: "deepseek-ai/DeepSeek-R1-0528",
    models: ["deepseek-ai/DeepSeek-R1-0528", "deepseek-ai/DeepSeek-V3.1", "deepseek-ai/DeepSeek-V3.2", "ZhipuAI/GLM-5"],
    envKey: "KIMI_API_KEY",
  },
  glm: {
    name: "longcat",
    baseURL: "https://api.longcat.chat/openai",
    defaultModel: "LongCat-Flash-Lite",
    models: ["LongCat-Flash-Lite"],
    envKey: "GLM_API_KEY",
  },
  qwen: {
    name: "sambanova",
    baseURL: "https://api.sambanova.ai/v1",
    defaultModel: "DeepSeek-R1-0528",
    models: ["DeepSeek-R1-0528", "DeepSeek-R1-Distill-Llama-70B", "DeepSeek-V3-0324", "Deepseek-V3.1", "Meta-Llama-3.3-70B-Instruct", "Meta-Llama-3.1-8B-Instruct"],
    envKey: "QWEN_API_KEY",
  },
  gemini: {
    name: "gpt",
    baseURL: "https://api.chatanywhere.tech/v1",
    defaultModel: "gpt-3.5-turbo",
    models: ["gpt-3.5-turbo"],
    envKey: "GEMINI_API_KEY",
  },
};'''
    
    # 使用正则表达式替换PROVIDERS配置
    pattern = r'export const PROVIDERS: Record<LLMProvider, ProviderConfig> = \{[\s\S]*?\};'
    modified_content = re.sub(pattern, new_providers, content)
    
    # 保存修改后的文件
    output_file = os.path.join(output_dir, "providers.ts")
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(modified_content)
    
    print(f"修改后的providers.ts已保存到: {output_file}")

def modify_rag():
    """修改rag.ts文件"""
    with open(rag_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 替换asEmbeddingProvider函数
    new_as_embedding_provider = '''export function asEmbeddingProvider(rawValue: string | undefined): EmbeddingProvider {
  const normalized = (rawValue ?? "").trim().toLowerCase();
  if (normalized === "openai") {
    return "openai";
  }
  return "siliconflow";
}'''
    
    # 替换ragConfig
    new_rag_config = '''export const ragConfig = {
  enabled: isEnabled(process.env.RAG_ENABLED, true),
  verboseLog: isEnabled(process.env.RAG_VERBOSE_LOG, false),
  defaultTenantId: process.env.RAG_DEFAULT_TENANT ?? "default",
  embeddingProvider: asEmbeddingProvider(process.env.EMBEDDING_PROVIDER),
  embeddingModel: process.env.EMBEDDING_MODEL ?? "BAAI/bge-large-zh-v1.5",
  embeddingVersion: asInt(process.env.EMBEDDING_VERSION, 1, 1, 100),
  embeddingBatchSize: asInt(process.env.EMBEDDING_BATCH_SIZE, 64, 1, 256),
  embeddingTimeoutMs: asInt(process.env.RAG_EMBEDDING_TIMEOUT_MS ?? process.env.RAG_HTTP_TIMEOUT_MS, 30000, 5000, 300000),
  embeddingMaxRetries: asInt(process.env.RAG_EMBEDDING_MAX_RETRIES, 2, 0, 8),
  embeddingRetryBaseMs: asInt(process.env.RAG_EMBEDDING_RETRY_BASE_MS, 500, 100, 10000),
  qdrantUrl: (process.env.QDRANT_URL ?? "http://127.0.0.1:6333").replace(/\/+$/, ""),
  qdrantApiKey: process.env.QDRANT_API_KEY ?? "",
  qdrantCollection: process.env.QDRANT_COLLECTION ?? "ai_novel_chunks_v1",
  qdrantTimeoutMs: asInt(process.env.QDRANT_TIMEOUT_MS ?? process.env.RAG_HTTP_TIMEOUT_MS, 30000, 1000, 300000),
  qdrantUpsertMaxBytes: asInt(process.env.QDRANT_UPSERT_MAX_BYTES, 24 * 1024 * 1024, 1024 * 1024, 64 * 1024 * 1024),
  chunkSize: asInt(process.env.RAG_CHUNK_SIZE, 800, 200, 4000),
  chunkOverlap: asInt(process.env.RAG_CHUNK_OVERLAP, 120, 0, 1000),
  vectorCandidates: asInt(process.env.RAG_VECTOR_CANDIDATES, 40, 1, 200),
  keywordCandidates: asInt(process.env.RAG_KEYWORD_CANDIDATES, 40, 1, 200),
  finalTopK: asInt(process.env.RAG_FINAL_TOP_K, 8, 1, 50),
  workerPollMs: asInt(process.env.RAG_WORKER_POLL_MS, 2500, 200, 60000),
  workerMaxAttempts: asInt(process.env.RAG_WORKER_MAX_ATTEMPTS, 5, 1, 20),
  workerRetryBaseMs: asInt(process.env.RAG_WORKER_RETRY_BASE_MS, 5000, 1000, 300000),
  httpTimeoutMs: asInt(process.env.RAG_HTTP_TIMEOUT_MS, 30000, 1000, 300000),
  providerPriority: ["siliconflow", "openai"] as Array<Extract<LLMProvider, "openai" | "siliconflow">>,
};'''
    
    # 替换asEmbeddingProvider函数
    pattern = r'export function asEmbeddingProvider\(rawValue: string \| undefined\): EmbeddingProvider \{[\s\S]*?\}'
    modified_content = re.sub(pattern, new_as_embedding_provider, content)
    
    # 替换ragConfig
    pattern = r'export const ragConfig = \{[\s\S]*?\};'
    modified_content = re.sub(pattern, new_rag_config, modified_content)
    
    # 保存修改后的文件
    output_file = os.path.join(output_dir, "rag.ts")
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(modified_content)
    
    print(f"修改后的rag.ts已保存到: {output_file}")

def modify_settings_page():
    """修改SettingsPage.tsx文件"""
    with open(settings_page_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 替换Embedding Settings Moved部分
    old_text = '''        <CardHeader>
          <CardTitle>Embedding Settings Moved</CardTitle>
          <CardDescription>
            Embedding provider and model configuration now live in the knowledge module.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-md border p-3">
              <div className="text-xs text-muted-foreground">Current embedding provider</div>
              <div className="mt-1 font-medium">{ragProvider?.name ?? ragSettings?.embeddingProvider ?? "-"}</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-xs text-muted-foreground">Current embedding model</div>
              <div className="mt-1 font-medium">{ragSettings?.embeddingModel ?? "-"}</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>Status</span>
            <Badge variant={ragProvider?.isConfigured ? "default" : "outline"}>
              {ragProvider?.isConfigured ? "API key ready" : "API key missing"}
            </Badge>
            <Badge variant={ragProvider?.isActive ? "default" : "outline"}>
              {ragProvider?.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <Button asChild>
            <Link to="/knowledge?tab=settings">Open knowledge settings</Link>
          </Button>
        </CardContent>'''
    
    new_text = '''        <CardHeader>
          <CardTitle>嵌入设置已移动</CardTitle>
          <CardDescription>
            嵌入提供商和模型配置现在位于知识库模块中。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-md border p-3">
              <div className="text-xs text-muted-foreground">当前嵌入提供商</div>
              <div className="mt-1 font-medium">{ragProvider?.name ?? ragSettings?.embeddingProvider ?? "-"}</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-xs text-muted-foreground">当前嵌入模型</div>
              <div className="mt-1 font-medium">{ragSettings?.embeddingModel ?? "-"}</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>状态</span>
            <Badge variant={ragProvider?.isConfigured ? "default" : "outline"}>
              {ragProvider?.isConfigured ? "API密钥就绪" : "缺少API密钥"}
            </Badge>
            <Badge variant={ragProvider?.isActive ? "default" : "outline"}>
              {ragProvider?.isActive ? "活跃" : "非活跃"}
            </Badge>
          </div>
          <Button asChild>
            <Link to="/knowledge?tab=settings">打开知识库设置</Link>
          </Button>
        </CardContent>'''
    
    content = content.replace(old_text, new_text)
    
    # 替换Model Providers部分
    old_text = '''      <Card>
        <CardHeader>
          <CardTitle>Model Providers</CardTitle>
          <CardDescription>Manage provider API keys, default models, and connectivity tests.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {providerConfigs.map((item) => (
            <div
              key={item.provider}
              className={`rounded-md border p-3 transition-colors ${
                item.isConfigured
                  ? "border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20"
                  : "border-border"
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="font-medium">{item.name}</div>
                <Badge
                  variant={item.isConfigured ? "default" : "outline"}
                  className={item.isConfigured ? "bg-emerald-600 text-white hover:bg-emerald-600" : ""}
                >
                  {item.isConfigured ? "Configured" : "Not configured"}
                </Badge>
              </div>
              <div className="mb-2 text-xs text-muted-foreground">Current model: {item.currentModel}</div>
              <div className="mb-3 space-y-2">
                <div className="flex flex-wrap gap-1">
                  {(isProviderExpanded(item.provider)
                    ? item.models
                    : item.models.slice(0, MODEL_BADGE_COLLAPSE_COUNT)
                  ).map((model) => (
                    <Badge
                      key={model}
                      variant={model === item.currentModel ? "default" : "outline"}
                      className={model === item.currentModel ? "bg-primary" : ""}
                    >
                      {model}
                    </Badge>
                  ))}
                </div>
                {item.models.length > MODEL_BADGE_COLLAPSE_COUNT ? (
                  <button
                    type="button"
                    className="text-xs font-medium text-primary transition-opacity hover:opacity-80"
                    onClick={() => toggleProviderExpanded(item.provider)}
                  >
                    {isProviderExpanded(item.provider)
                      ? `收起模型列表`
                      : `展开全部 ${item.models.length} 个模型`}
                  </button>
                ) : null}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingProvider(item.provider);
                    setForm({
                      key: "",
                      model: item.currentModel,
                    });
                    setTestResult("");
                    setActionResult("");
                  }}
                >
                  Configure
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setTestResult("");
                    testMutation.mutate({
                      provider: item.provider,
                    });
                  }}
                  disabled={testMutation.isPending}
                >
                  Test
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setActionResult("");
                    refreshModelsMutation.mutate(item.provider);
                  }}
                  disabled={!item.isConfigured || refreshModelsMutation.isPending}
                >
                  {refreshModelsMutation.isPending && refreshModelsMutation.variables === item.provider
                    ? "Refreshing..."
                    : "Refresh models"}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>'''
    
    new_text = '''      <Card>
        <CardHeader>
          <CardTitle>模型提供商</CardTitle>
          <CardDescription>管理提供商API密钥、默认模型和连接测试。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {providerConfigs.map((item) => (
            <div
              key={item.provider}
              className={`rounded-md border p-3 transition-colors ${
                item.isConfigured
                  ? "border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20"
                  : "border-border"
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="font-medium">{item.name}</div>
                <Badge
                  variant={item.isConfigured ? "default" : "outline"}
                  className={item.isConfigured ? "bg-emerald-600 text-white hover:bg-emerald-600" : ""}
                >
                  {item.isConfigured ? "已配置" : "未配置"}
                </Badge>
              </div>
              <div className="mb-2 text-xs text-muted-foreground">当前模型: {item.currentModel}</div>
              <div className="mb-3 space-y-2">
                <div className="flex flex-wrap gap-1">
                  {(isProviderExpanded(item.provider)
                    ? item.models
                    : item.models.slice(0, MODEL_BADGE_COLLAPSE_COUNT)
                  ).map((model) => (
                    <Badge
                      key={model}
                      variant={model === item.currentModel ? "default" : "outline"}
                      className={model === item.currentModel ? "bg-primary" : ""}
                    >
                      {model}
                    </Badge>
                  ))}
                </div>
                {item.models.length > MODEL_BADGE_COLLAPSE_COUNT ? (
                  <button
                    type="button"
                    className="text-xs font-medium text-primary transition-opacity hover:opacity-80"
                    onClick={() => toggleProviderExpanded(item.provider)}
                  >
                    {isProviderExpanded(item.provider)
                      ? `收起模型列表`
                      : `展开全部 ${item.models.length} 个模型`}
                  </button>
                ) : null}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingProvider(item.provider);
                    setForm({
                      key: "",
                      model: item.currentModel,
                    });
                    setTestResult("");
                    setActionResult("");
                  }}
                >
                  配置
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setTestResult("");
                    testMutation.mutate({
                      provider: item.provider,
                    });
                  }}
                  disabled={testMutation.isPending}
                >
                  测试
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setActionResult("");
                    refreshModelsMutation.mutate(item.provider);
                  }}
                  disabled={!item.isConfigured || refreshModelsMutation.isPending}
                >
                  {refreshModelsMutation.isPending && refreshModelsMutation.variables === item.provider
                    ? "刷新中..."
                    : "刷新模型"}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>'''
    
    content = content.replace(old_text, new_text)
    
    # 替换Configure API Key部分
    old_text = '''      <Dialog open={Boolean(editingProvider)} onOpenChange={(open) => !open && setEditingProvider("")}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure API Key</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              type="password"
              value={form.key}
              placeholder="Enter API key"
              onChange={(event) => setForm((prev) => ({ ...prev, key: event.target.value }))}
            />
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Available models</div>
              <SearchableSelect
                value={form.model}
                onValueChange={(value) => setForm((prev) => ({ ...prev, model: value }))}
                options={(editingConfig?.models ?? []).map((model) => ({ value: model }))}
                placeholder="Select a model"
                searchPlaceholder="Search models"
                emptyText="No models available"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() =>
                  editingProvider &&
                  saveMutation.mutate({
                    provider: editingProvider,
                    key: form.key,
                    model: form.model || undefined,
                  })
                }
                disabled={saveMutation.isPending || !form.key.trim() || !form.model.trim()}
              >
                {saveMutation.isPending ? "Saving..." : "Save"}
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  editingProvider &&
                  testMutation.mutate({
                    provider: editingProvider,
                    apiKey: form.key || undefined,
                    model: form.model || undefined,
                  })
                }
                disabled={testMutation.isPending}
              >
                Test
              </Button>
            </div>
            {testResult ? <div className="text-sm text-muted-foreground">{testResult}</div> : null}
          </div>
        </DialogContent>
      </Dialog>'''
    
    new_text = '''      <Dialog open={Boolean(editingProvider)} onOpenChange={(open) => !open && setEditingProvider("")}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>配置API密钥</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              type="password"
              value={form.key}
              placeholder="输入API密钥"
              onChange={(event) => setForm((prev) => ({ ...prev, key: event.target.value }))}
            />
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">可用模型</div>
              <SearchableSelect
                value={form.model}
                onValueChange={(value) => setForm((prev) => ({ ...prev, model: value }))}
                options={(editingConfig?.models ?? []).map((model) => ({ value: model }))}
                placeholder="选择模型"
                searchPlaceholder="搜索模型"
                emptyText="无可用模型"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() =>
                  editingProvider &&
                  saveMutation.mutate({
                    provider: editingProvider,
                    key: form.key,
                    model: form.model || undefined,
                  })
                }
                disabled={saveMutation.isPending || !form.key.trim() || !form.model.trim()}
              >
                {saveMutation.isPending ? "保存中..." : "保存"}
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  editingProvider &&
                  testMutation.mutate({
                    provider: editingProvider,
                    apiKey: form.key || undefined,
                    model: form.model || undefined,
                  })
                }
                disabled={testMutation.isPending}
              >
                测试
              </Button>
            </div>
            {testResult ? <div className="text-sm text-muted-foreground">{testResult}</div> : null}
          </div>
        </DialogContent>
      </Dialog>'''
    
    content = content.replace(old_text, new_text)
    
    # 保存修改后的文件
    output_file = os.path.join(output_dir, "SettingsPage.tsx")
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"修改后的SettingsPage.tsx已保存到: {output_file}")

def modify_knowledge_embedding():
    """修改KnowledgeEmbeddingSettingsCard.tsx文件"""
    with open(knowledge_embedding_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 替换Embedding 配置部分
    old_text = '''        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>Embedding 配置</CardTitle>
          <Badge variant="outline">集合版本 v{form.collectionVersion}</Badge>
          {currentProvider ? <Badge variant="outline">{currentProvider.name}</Badge> : null}
          {modelQuery.data ? (
            <Badge variant="outline">
              {modelQuery.data.source === "remote" ? "供应商模型" : "内置模型"}
            </Badge>
          ) : null}
        </div>
        <div className="text-sm text-muted-foreground">
          切换 Provider 或 Model 时，系统可以自动生成新的 Qdrant 集合名，避免向量维度冲突；同时你也可以手动指定集合名与重建策略。
        </div>'''
    
    new_text = '''        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>嵌入配置</CardTitle>
          <Badge variant="outline">集合版本 v{form.collectionVersion}</Badge>
          {currentProvider ? <Badge variant="outline">{currentProvider.name}</Badge> : null}
          {modelQuery.data ? (
            <Badge variant="outline">
              {modelQuery.data.source === "remote" ? "供应商模型" : "内置模型"}
            </Badge>
          ) : null}
        </div>
        <div className="text-sm text-muted-foreground">
          切换提供商或模型时，系统可以自动生成新的 Qdrant 集合名，避免向量维度冲突；同时你也可以手动指定集合名与重建策略。
        </div>'''
    
    content = content.replace(old_text, new_text)
    
    # 替换Embedding Provider和Embedding Model部分
    old_text = '''          <div className="space-y-2">
            <div className="text-sm font-medium">Embedding Provider</div>
            <select
              className="w-full rounded-md border bg-background p-2 text-sm"
              value={form.embeddingProvider}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  embeddingProvider: event.target.value as EmbeddingProvider,
                  embeddingModel: "",
                }))}
            >
              {providers.map((item) => (
                <option key={item.provider} value={item.provider}>
                  {item.name}
                </option>
              ))}
            </select>
            {currentProvider ? (
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <Badge variant={currentProvider.isConfigured ? "default" : "outline"}>
                  {currentProvider.isConfigured ? "API Key 已配置" : "API Key 未配置"}
                </Badge>
                <Badge variant={currentProvider.isActive ? "default" : "outline"}>
                  {currentProvider.isActive ? "当前启用" : "未启用"}
                </Badge>
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Embedding Model</div>
            {modelQuery.isLoading ? (
              <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                正在获取该供应商的 Embedding 模型列表...
              </div>
            ) : modelOptions.length > 0 ? (
              <SearchableSelect
                value={form.embeddingModel}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, embeddingModel: value }))}
                options={modelOptions.map((model) => ({ value: model }))}
                placeholder="选择 Embedding 模型"
                searchPlaceholder="搜索 Embedding 模型"
                emptyText="没有匹配的 Embedding 模型"
              />
            ) : null}
            <Input
              className={modelQuery.isLoading || modelOptions.length > 0 ? "hidden" : undefined}
              value={form.embeddingModel}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, embeddingModel: event.target.value }))}
              placeholder="例如 text-embedding-3-small"
            />
            {modelQuery.data ? (
              <div className="text-xs text-muted-foreground">
                {modelQuery.data.source === "remote"
                  ? `已获取 ${modelQuery.data.models.length} 个该供应商的 Embedding 模型。`
                  : "当前展示的是内置 Embedding 模型列表；配置并启用 API Key 后会自动拉取供应商模型。"}
              </div>
            ) : null}
          </div>'''
    
    new_text = '''          <div className="space-y-2">
            <div className="text-sm font-medium">嵌入提供商</div>
            <select
              className="w-full rounded-md border bg-background p-2 text-sm"
              value={form.embeddingProvider}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  embeddingProvider: event.target.value as EmbeddingProvider,
                  embeddingModel: "",
                }))}
            >
              {providers.map((item) => (
                <option key={item.provider} value={item.provider}>
                  {item.name}
                </option>
              ))}
            </select>
            {currentProvider ? (
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <Badge variant={currentProvider.isConfigured ? "default" : "outline"}>
                  {currentProvider.isConfigured ? "API Key 已配置" : "API Key 未配置"}
                </Badge>
                <Badge variant={currentProvider.isActive ? "default" : "outline"}>
                  {currentProvider.isActive ? "当前启用" : "未启用"}
                </Badge>
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">嵌入模型</div>
            {modelQuery.isLoading ? (
              <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                正在获取该提供商的嵌入模型列表...
              </div>
            ) : modelOptions.length > 0 ? (
              <SearchableSelect
                value={form.embeddingModel}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, embeddingModel: value }))}
                options={modelOptions.map((model) => ({ value: model }))}
                placeholder="选择嵌入模型"
                searchPlaceholder="搜索嵌入模型"
                emptyText="没有匹配的嵌入模型"
              />
            ) : null}
            <Input
              className={modelQuery.isLoading || modelOptions.length > 0 ? "hidden" : undefined}
              value={form.embeddingModel}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, embeddingModel: event.target.value }))}
              placeholder="例如 text-embedding-3-small"
            />
            {modelQuery.data ? (
              <div className="text-xs text-muted-foreground">
                {modelQuery.data.source === "remote"
                  ? `已获取 ${modelQuery.data.models.length} 个该提供商的嵌入模型。`
                  : "当前展示的是内置嵌入模型列表；配置并启用 API Key 后会自动拉取提供商模型。"}
              </div>
            ) : null}
          </div>'''
    
    content = content.replace(old_text, new_text)
    
    # 替换Embedding 请求参数部分
    old_text = '''        <div className="space-y-3">
          <div className="text-sm font-medium">Embedding 请求参数</div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="text-sm font-medium">批处理大小</div>
              <Input
                type="number"
                min={1}
                max={256}
                value={form.embeddingBatchSize}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    embeddingBatchSize: Number(event.target.value || prev.embeddingBatchSize),
                  }))}
              />
              <div className="text-xs text-muted-foreground">
                单次向量化请求包含的文本块数量；越大越快，但也更容易触发超时或限流。
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">请求超时（ms）</div>
              <Input
                type="number"
                min={5000}
                max={300000}
                value={form.embeddingTimeoutMs}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    embeddingTimeoutMs: Number(event.target.value || prev.embeddingTimeoutMs),
                  }))}
              />
              <div className="text-xs text-muted-foreground">
                Embedding 接口请求超时时间，网络慢或模型较大时可以适当调高。
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">最大重试次数</div>
              <Input
                type="number"
                min={0}
                max={8}
                value={form.embeddingMaxRetries}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    embeddingMaxRetries: Number(event.target.value || prev.embeddingMaxRetries),
                  }))}
              />
              <div className="text-xs text-muted-foreground">
                请求失败时允许的自动重试次数；设为 0 则只尝试一次。
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">重试基准间隔（ms）</div>
              <Input
                type="number"
                min={100}
                max={10000}
                value={form.embeddingRetryBaseMs}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    embeddingRetryBaseMs: Number(event.target.value || prev.embeddingRetryBaseMs),
                  }))}
              />
              <div className="text-xs text-muted-foreground">
                每次重试前的等待基准值，用来控制失败后的回退节奏。
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={onSave}
          disabled={isSaving || modelQuery.isLoading || !form.embeddingModel.trim() || !collectionNameToDisplay.trim()}
        >
          {isSaving ? "保存中..." : "保存 Embedding 配置"}
        </Button>'''
    
    new_text = '''        <div className="space-y-3">
          <div className="text-sm font-medium">嵌入请求参数</div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="text-sm font-medium">批处理大小</div>
              <Input
                type="number"
                min={1}
                max={256}
                value={form.embeddingBatchSize}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    embeddingBatchSize: Number(event.target.value || prev.embeddingBatchSize),
                  }))}
              />
              <div className="text-xs text-muted-foreground">
                单次向量化请求包含的文本块数量；越大越快，但也更容易触发超时或限流。
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">请求超时（ms）</div>
              <Input
                type="number"
                min={5000}
                max={300000}
                value={form.embeddingTimeoutMs}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    embeddingTimeoutMs: Number(event.target.value || prev.embeddingTimeoutMs),
                  }))}
              />
              <div className="text-xs text-muted-foreground">
                嵌入接口请求超时时间，网络慢或模型较大时可以适当调高。
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">最大重试次数</div>
              <Input
                type="number"
                min={0}
                max={8}
                value={form.embeddingMaxRetries}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    embeddingMaxRetries: Number(event.target.value || prev.embeddingMaxRetries),
                  }))}
              />
              <div className="text-xs text-muted-foreground">
                请求失败时允许的自动重试次数；设为 0 则只尝试一次。
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">重试基准间隔（ms）</div>
              <Input
                type="number"
                min={100}
                max={10000}
                value={form.embeddingRetryBaseMs}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    embeddingRetryBaseMs: Number(event.target.value || prev.embeddingRetryBaseMs),
                  }))}
              />
              <div className="text-xs text-muted-foreground">
                每次重试前的等待基准值，用来控制失败后的回退节奏。
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={onSave}
          disabled={isSaving || modelQuery.isLoading || !form.embeddingModel.trim() || !collectionNameToDisplay.trim()}
        >
          {isSaving ? "保存中..." : "保存嵌入配置"}
        </Button>'''
    
    content = content.replace(old_text, new_text)
    
    # 保存修改后的文件
    output_file = os.path.join(output_dir, "KnowledgeEmbeddingSettingsCard.tsx")
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"修改后的KnowledgeEmbeddingSettingsCard.tsx已保存到: {output_file}")

if __name__ == "__main__":
    print("开始修改项目文件...")
    modify_providers()
    modify_rag()
    modify_settings_page()
    modify_knowledge_embedding()
    print("所有文件修改完成！")
