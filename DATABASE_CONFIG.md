# 自定义数据库路径配置

## 配置方法

项目支持通过 `DATABASE_URL` 环境变量设置自定义数据库路径。

### 默认配置

默认情况下，数据库路径为：
```
DATABASE_URL=file:./dev.db
```

### 自定义配置选项

#### 1. 使用相对路径

```
DATABASE_URL=file:./data/mydb.db
```

#### 2. 使用绝对路径

```
DATABASE_URL=file:/path/to/your/database.db
```

#### 3. Windows 路径示例

```
DATABASE_URL=file:C:\\path\\to\\database.db
```

### 配置步骤

1. 在 `server` 目录下创建 `.env` 文件（如果不存在）
2. 添加或修改 `DATABASE_URL` 配置
3. 重启服务器

## 技术原理

数据库路径解析逻辑在 `server/src/db/prisma.ts` 中：

- 支持 `file:` 前缀的路径
- 相对路径会相对于 `server` 目录解析
- 绝对路径会直接使用

## 注意事项

1. 确保指定的目录存在且有写入权限
2. 重启服务器后配置才会生效
3. 变更数据库路径会导致连接到新的数据库文件
