# 项目地址路径和获取方式总结

## 环境配置文件路径

### 客户端环境配置
- **文件路径**：`client/.env`
- **作用**：存储前端环境变量，特别是API基础URL
- **配置内容**：
  ```
  VITE_API_BASE_URL=http://localhost:3000/api
  ```

### 服务器环境配置
- **文件路径**：`server/.env`
- **作用**：存储后端服务器配置
- **配置内容**：
  ```
  PORT=3000
  HOST=127.0.0.1
  ALLOW_LAN=false
  CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174
  DATABASE_URL=file:./dev.db
  ```

## 前端获取后端服务地址的方式

### 1. 核心配置文件
- **文件路径**：`client/src/lib/constants.ts`
- **获取方式**：从环境变量 `VITE_API_BASE_URL` 获取，默认值为 `http://localhost:3000/api`
- **代码**：
  ```typescript
  export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ??
    (import.meta.env.DEV && typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.hostname}:3000/api`
      : "http://localhost:3000/api");
  ```

### 2. API客户端
- **文件路径**：`client/src/api/client.ts`
- **获取方式**：使用 `API_BASE_URL` 作为axios客户端的baseURL
- **代码**：
  ```typescript
  export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT_MS,
  });
  ```

### 3. Chat组件
- **文件路径**：`client/src/pages/chat/components/AssistantChatPanel.tsx`
- **获取方式**：直接使用 `API_BASE_URL` 构建API请求
- **代码**：
  ```typescript
  const response = await fetch(`${API_BASE_URL}/chat`, {
    // 请求配置
  });
  ```

### 4. SSE钩子
- **文件路径**：`client/src/hooks/useSSE.ts`
- **获取方式**：使用 `API_BASE_URL` 构建SSE请求
- **代码**：
  ```typescript
  const response = await fetch(url.startsWith("http") ? url : `${API_BASE_URL}${url}`, {
    // 请求配置
  });
  ```

### 5. 图片API
- **文件路径**：`client/src/api/images.ts`
- **获取方式**：使用 `API_BASE_URL` 获取API源地址
- **代码**：
  ```typescript
  const apiOrigin = API_BASE_URL.replace(/\/api\/?$/i, "");
  ```

### 6. 创意中心API
- **文件路径**：`client/src/api/creativeHub.ts`
- **获取方式**：使用 `API_BASE_URL` 构建creative hub相关请求
- **代码**：
  ```typescript
  const response = await fetch(`${API_BASE_URL}/creative-hub/threads/${resolvedThreadId}/runs/stream`, {
    // 请求配置
  });
  ```

## 后端服务地址配置

### 服务器启动配置
- **文件路径**：`server/src/app.ts`
- **获取方式**：从环境变量 `PORT` 和 `HOST` 获取
- **代码**：
  ```typescript
  const port = Number(process.env.PORT ?? 3000);
  const host = process.env.HOST ?? (allowLan ? "0.0.0.0" : "localhost");
  ```

## 总结

1. **环境配置管理**：
   - 项目使用 `.env` 文件管理环境变量
   - 前端通过 `VITE_API_BASE_URL` 配置后端服务地址
   - 后端通过 `PORT` 和 `HOST` 配置服务监听地址

2. **后端服务地址获取方式**：
   - 前端：统一从 `client/src/lib/constants.ts` 中的 `API_BASE_URL` 获取
   - 后端：从环境变量 `PORT` 和 `HOST` 获取

3. **代码组织**：
   - 前端将API基础URL集中管理在 `constants.ts` 文件中
   - 所有前端API调用都使用这个集中管理的地址
   - 后端服务地址配置也集中在环境变量中

## 修改方案：环境变量集中管理

### 1. 统一配置文件
- **文件路径**：`data/apiconfig/.env`
- **作用**：集中管理后端服务配置和前端API地址
- **配置内容**：
  ```
  # 后端服务配置
  BACKEND_PORT=3000
  BACKEND_HOST=127.0.0.1
  
  # 前端API地址
  VITE_API_BASE_URL=http://${BACKEND_HOST}:${BACKEND_PORT}/api
  ```

### 2. 同步脚本
- **文件路径**：`scripts/sync-env.js`
- **作用**：将统一配置同步到前端和后端的.env文件
- **功能**：
  - 读取统一配置文件
  - 替换变量（如 ${BACKEND_HOST} 和 ${BACKEND_PORT}）
  - 分离前端和后端配置
  - 添加服务器额外配置
  - 写入前端和后端的.env文件

### 3. 集成到项目流程
- **修改文件**：`package.json`
- **添加脚本**：`sync-env` 命令
- **集成到命令**：将同步脚本集成到所有相关命令中（dev、build、typecheck、lint等）

### 4. 使用方法
当后端服务地址需要变更时：
1. 修改 `data/apiconfig/.env` 文件中的 `BACKEND_HOST` 和 `BACKEND_PORT`
2. 运行 `pnpm sync-env` 命令，或直接运行 `pnpm dev`
3. 配置会自动同步到前端和后端的.env文件中

### 5. 优势
- **集中管理**：所有配置集中在一个文件，避免分散修改
- **自动同步**：通过脚本自动将配置同步到前端和后端
- **易于维护**：变更时只需修改一个文件，减少出错概率
- **兼容性好**：适用于开发、测试和生产环境

## 常见问题及解决方案

### 问题：前端API请求失败，显示"接口不存在"错误

#### 错误信息
```json
{"success":false,"error":"接口不存在。"}
```

#### 根本原因
1. 服务器的 `ALLOW_LAN` 被设置为 `false`，导致服务器只监听 `localhost`
2. 前端在开发模式下可能使用 `127.0.0.1` 发起API请求，导致连接被拒绝
3. 同步脚本 `scripts/sync-env.js` 中硬编码了 `ALLOW_LAN=false`，每次运行时都会覆盖服务器的配置

#### 解决方案
1. **修改同步脚本**：
   - 打开 `scripts/sync-env.js` 文件
   - 将第 40 行的 `ALLOW_LAN=false` 改为 `ALLOW_LAN=true`

2. **更新环境配置**：
   - 运行 `pnpm sync-env` 命令，更新服务器的 `.env` 文件

3. **重启服务器**：
   - 终止所有 Node.js 进程：`taskkill /f /im node.exe`
   - 重新启动服务器：`pnpm dev`

#### 验证结果
- 服务器现在监听所有地址（`0.0.0.0`），包括 `localhost` 和 `127.0.0.1`
- 前端可以成功连接到后端，API请求返回正常
- 前端页面可以正常加载，不再显示"接口不存在"的错误