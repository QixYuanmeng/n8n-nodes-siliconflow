#!/bin/bash

echo "正在发布到GitHub..."

echo "1. 构建项目..."
npm run build
if [ $? -ne 0 ]; then
    echo "构建失败，停止发布"
    exit 1
fi

echo "2. 推送到GitHub..."
git push -u origin main
if [ $? -ne 0 ]; then
    echo "推送失败，请检查GitHub仓库是否已创建"
    echo "或者您是否有正确的访问权限"
    exit 1
fi

echo "3. 创建release标签..."
git tag v1.1.0
git push origin v1.1.0

echo "✅ 发布完成！"
echo "📦 仓库地址: https://github.com/QixYuanmeng/n8n-nodes-siliconflow"
echo "🚀 您现在可以："
echo "   1. 在GitHub上创建Release"
echo "   2. 发布到npm: npm publish"
echo "   3. 在n8n中安装: npm install n8n-nodes-siliconflow"
