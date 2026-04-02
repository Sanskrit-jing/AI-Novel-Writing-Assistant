// 同步环境变量配置脚本
const fs = require('fs');
const path = require('path');

// 定义配置文件路径
const configFile = path.join(__dirname, '..', 'data', 'apiconfig', '.env');
const clientEnvFile = path.join(__dirname, '..', 'client', '.env');
const serverEnvFile = path.join(__dirname, '..', 'server', '.env');

// 检查配置文件是否存在
if (!fs.existsSync(configFile)) {
    console.error('配置文件不存在:', configFile);
    process.exit(1);
}

// 读取配置文件内容
let configContent = fs.readFileSync(configFile, 'utf8');

// 替换变量
configContent = configContent.replace(/\$\{BACKEND_HOST\}/g, '127.0.0.1');
configContent = configContent.replace(/\$\{BACKEND_PORT\}/g, '3000');

// 分离前端和后端配置
const lines = configContent.split('\n');
const frontendConfig = [];
const backendConfig = [];

lines.forEach(line => {
    line = line.trim();
    if (line.startsWith('VITE_')) {
        frontendConfig.push(line);
    } else if (line.startsWith('BACKEND_')) {
        backendConfig.push(line);
    }
});

// 添加服务器额外配置
backendConfig.push('');
backendConfig.push('# 服务器额外配置');
backendConfig.push('ALLOW_LAN=true');
backendConfig.push('CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174');
backendConfig.push('DATABASE_URL=file:./dev.db');

// 写入前端配置文件
fs.writeFileSync(clientEnvFile, frontendConfig.join('\n'), 'utf8');
console.log('已更新前端配置文件:', clientEnvFile);

// 写入后端配置文件
fs.writeFileSync(serverEnvFile, backendConfig.join('\n'), 'utf8');
console.log('已更新后端配置文件:', serverEnvFile);

console.log('配置同步完成！');
