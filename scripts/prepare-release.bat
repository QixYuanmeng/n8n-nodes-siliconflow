@echo off
REM 发布准备脚本 (Windows版本)

echo 🚀 准备发布 n8n-nodes-siliconflow...

REM 1. 清理之前的构建
echo 📦 清理旧的构建文件...
if exist dist rmdir /s /q dist
if exist node_modules rmdir /s /q node_modules

REM 2. 安装依赖
echo 📥 安装依赖...
npm install

REM 3. 构建项目
echo 🔨 构建项目...
npm run build

REM 4. 检查构建结果
if not exist dist (
    echo ❌ 构建失败！dist目录不存在
    exit /b 1
)

echo ✅ 构建成功！

REM 5. 显示文件结构
echo 📁 构建文件结构：
dir /s /b dist

REM 6. 提示下一步
echo.
echo 🎉 项目已准备好发布！
echo.
echo 发布步骤：
echo 1. 确保您已登录npm: npm login
echo 2. 发布到npm: npm publish
echo.
echo 注意事项：
echo - 请确保更新了package.json中的版本号
echo - 请确保更新了README.md中的安装说明
echo - 建议先发布到测试环境验证功能

pause
