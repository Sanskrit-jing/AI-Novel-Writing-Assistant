const path = require('node:path');

function resolveDatabaseUrl(databaseUrl) {
  const fallbackUrl = databaseUrl ?? "file:./dev.db";
  if (!fallbackUrl.startsWith("file:")) {
    return fallbackUrl;
  }

  const filePath = fallbackUrl.slice("file:".length) || "./dev.db";
  const resolvedFilePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(__dirname, "./server", filePath);

  return `file:${resolvedFilePath}`;
}

// 测试不同的配置
const testCases = [
  "file:./dev.db",
  "file:./data/mydb.db",
  "file:/absolute/path/to/db.db",
  "file:C:\\Windows\\Path\\To\\db.db"
];

console.log('测试数据库路径解析:');
console.log('====================================');
testCases.forEach((testCase, index) => {
  const result = resolveDatabaseUrl(testCase);
  console.log(`测试 ${index + 1}: ${testCase}`);
  console.log(`结果: ${result}`);
  console.log('------------------------------------');
});
