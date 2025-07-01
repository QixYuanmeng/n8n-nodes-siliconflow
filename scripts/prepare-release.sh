#!/bin/bash

# 发布准备脚本

echo "🚀 准备发布 n8n-nodes-siliconflow..."

# 1. 清理之前的构建
echo "📦 清理旧的构建文件..."
rm -rf dist/
rm -rf node_modules/

# 2. 安装依赖
echo "📥 安装依赖..."
npm install

# 3. 构建项目
echo "🔨 构建项目..."
npm run build

# 4. 检查构建结果
if [ ! -d "dist" ]; then
    echo "❌ 构建失败！dist目录不存在"
    exit 1
fi

echo "✅ 构建成功！"

# 5. 显示文件结构
echo "📁 构建文件结构："
find dist -type f

# 6. 检查package.json
echo "📋 检查package.json配置..."
node -e "
const pkg = require('./package.json');
const required = ['name', 'version', 'description', 'n8n'];
const missing = required.filter(field => !pkg[field]);
if (missing.length > 0) {
    console.log('❌ package.json缺少必需字段:', missing);
    process.exit(1);
}
console.log('✅ package.json配置正确');
"

# 7. 提示下一步
echo ""
echo "🎉 项目已准备好发布！"
echo ""
echo "发布步骤："
echo "1. 确保您已登录npm: npm login"
echo "2. 发布到npm: npm publish"
echo ""
echo "注意事项："
echo "- 请确保更新了package.json中的版本号"
echo "- 请确保更新了README.md中的安装说明"
echo "- 建议先发布到测试环境验证功能"
