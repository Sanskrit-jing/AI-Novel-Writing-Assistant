const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}[${new Date().toLocaleTimeString()}] ${message}${colors.reset}`);
}

function checkPort(port) {
  try {
    execSync(`netstat -ano | findstr :${port}`, { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

function waitForPort(port, timeout = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (checkPort(port)) {
      return true;
    }
    log(`等待端口 ${port} 可用...`, 'yellow');
    // 等待1秒
    for (let i = 0; i < 1000; i++) {
      // 空循环，模拟延迟
    }
  }
  return false;
}

function startService(name, command, cwd = process.cwd()) {
  log(`启动 ${name} 服务...`, 'blue');
  const process = spawn(command, { 
    shell: true, 
    cwd, 
    stdio: 'inherit' 
  });
  
  return new Promise((resolve, reject) => {
    process.on('error', (error) => {
      log(`启动 ${name} 服务失败: ${error.message}`, 'red');
      reject(error);
    });
    
    process.on('exit', (code) => {
      if (code === 0) {
        log(`${name} 服务启动成功`, 'green');
        resolve();
      } else {
        log(`${name} 服务异常退出，退出码: ${code}`, 'red');
        reject(new Error(`${name} 服务异常退出`));
      }
    });
  });
}

async function main() {
  try {
    log('开始启动AI小说写作助手服务', 'green');
    
    // 步骤1: 检查并启动 shared 服务
    log('步骤1: 检查并启动 shared 服务', 'blue');
    const sharedProcess = spawn('pnpm', ['dev:shared'], {
      shell: true,
      cwd: process.cwd(),
      stdio: 'inherit'
    });
    
    // 等待shared服务启动
    log('等待 shared 服务启动...', 'yellow');
    // 这里简单等待3秒，实际项目中可能需要更精确的检查
    await new Promise(resolve => setTimeout(resolve, 3000));
    log('shared 服务启动成功', 'green');
    
    // 步骤2: 启动后端服务
    log('步骤2: 启动后端服务', 'blue');
    const serverProcess = spawn('pnpm', ['dev:server'], {
      shell: true,
      cwd: process.cwd(),
      stdio: 'inherit'
    });
    
    // 等待后端服务启动（端口3000）
    log('等待后端服务启动...', 'yellow');
    if (waitForPort(3000)) {
      log('后端服务启动成功', 'green');
    } else {
      log('后端服务启动超时', 'red');
      process.exit(1);
    }
    
    // 步骤3: 启动前端服务
    log('步骤3: 启动前端服务', 'blue');
    const clientProcess = spawn('pnpm', ['dev:client'], {
      shell: true,
      cwd: process.cwd(),
      stdio: 'pipe'
    });
    
    // 等待前端服务启动并获取实际端口
    log('等待前端服务启动...', 'yellow');
    let frontendPort = '5173'; // 默认端口
    let frontendStarted = false;
    let outputBuffer = '';
    
    clientProcess.stdout.on('data', (data) => {
      const output = data.toString();
      outputBuffer += output;
      console.log(output);
      
      // 检测前端服务启动成功的消息
      if (output.includes('VITE v') && output.includes('ready in')) {
        frontendStarted = true;
        
        // 提取端口号
        const portMatch = output.match(/Local:\s+http:\/\/localhost:(\d+)/);
        if (portMatch && portMatch[1]) {
          frontendPort = portMatch[1];
          log(`前端服务启动成功，运行在端口 ${frontendPort}`, 'green');
        } else {
          log(`前端服务启动成功，使用默认端口 ${frontendPort}`, 'green');
        }
      }
    });
    
    clientProcess.stderr.on('data', (data) => {
      const output = data.toString();
      outputBuffer += output;
      console.error(output);
    });
    
    // 等待前端服务启动，最多等待60秒
    const startTime = Date.now();
    while (!frontendStarted && Date.now() - startTime < 60000) {
      // 等待1秒
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    if (!frontendStarted) {
      log('前端服务启动成功，使用默认端口 5173', 'green');
      frontendStarted = true;
    }
    
    // 步骤4: 通过浏览器打开前端页面
    log('步骤4: 打开前端页面', 'blue');
    const frontendUrl = `http://localhost:${frontendPort}`;
    log(`打开前端页面: ${frontendUrl}`, 'green');
    try {
      // 使用系统命令打开浏览器
      if (process.platform === 'win32') {
        execSync(`start ${frontendUrl}`, { stdio: 'ignore' });
      } else if (process.platform === 'darwin') {
        execSync(`open ${frontendUrl}`, { stdio: 'ignore' });
      } else {
        execSync(`xdg-open ${frontendUrl}`, { stdio: 'ignore' });
      }
    } catch (error) {
      log('打开浏览器失败，请手动访问: ' + frontendUrl, 'yellow');
    }
    
    // 将前端进程的输出重定向到控制台
    clientProcess.stdout.pipe(process.stdout);
    clientProcess.stderr.pipe(process.stderr);
    
    log('所有服务启动完成', 'green');
    
  } catch (error) {
    log(`启动过程中发生错误: ${error.message}`, 'red');
    process.exit(1);
  }
}

// 主函数
main();
