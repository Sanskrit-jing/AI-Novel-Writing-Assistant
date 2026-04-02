# 同步环境变量配置脚本

# 定义配置文件路径
$configFile = "$PSScriptRoot\..\data\apiconfig\.env"
$clientEnvFile = "$PSScriptRoot\..\client\.env"
$serverEnvFile = "$PSScriptRoot\..\server\.env"

# 检查配置文件是否存在
if (-not (Test-Path $configFile)) {
    Write-Error "配置文件不存在: $configFile"
    exit 1
}

# 读取配置文件内容
$configContent = Get-Content $configFile -Raw

# 替换变量
$configContent = $configContent -replace '\$\{BACKEND_HOST\}', '127.0.0.1'
$configContent = $configContent -replace '\$\{BACKEND_PORT\}', '3000'

# 分离前端和后端配置
$frontendConfig = @()
$backendConfig = @()

foreach ($line in $configContent -split "\n") {
    $line = $line.Trim()
    if ($line -match '^VITE_') {
        $frontendConfig += $line
    } elseif ($line -match '^BACKEND_') {
        $backendConfig += $line
    }
}

# 添加服务器额外配置
$backendConfig += ""
$backendConfig += "# 服务器额外配置"
$backendConfig += "ALLOW_LAN=false"
$backendConfig += "CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174"
$backendConfig += "DATABASE_URL=file:./dev.db"

# 写入前端配置文件
$frontendConfig | Set-Content $clientEnvFile -Force
Write-Host "已更新前端配置文件: $clientEnvFile"

# 写入后端配置文件
$backendConfig | Set-Content $serverEnvFile -Force
Write-Host "已更新后端配置文件: $serverEnvFile"

Write-Host "配置同步完成！"
