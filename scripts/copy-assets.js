const fs = require('fs');
const path = require('path');

function copyAssets() {
  console.log('Copying SVG assets...');

  // 创建目标目录（如果不存在）
  const siliconFlowDistDir = path.join(__dirname, '..', 'dist', 'nodes', 'SiliconFlow');
  const siliconFlowChatModelDistDir = path.join(__dirname, '..', 'dist', 'nodes', 'SiliconFlowChatModel');

  if (!fs.existsSync(siliconFlowDistDir)) {
    fs.mkdirSync(siliconFlowDistDir, { recursive: true });
  }
  if (!fs.existsSync(siliconFlowChatModelDistDir)) {
    fs.mkdirSync(siliconFlowChatModelDistDir, { recursive: true });
  }

  // 复制 SVG 文件
  const svgFiles = [
    {
      src: path.join(__dirname, '..', 'nodes', 'SiliconFlow', 'siliconflow.svg'),
      dest: path.join(siliconFlowDistDir, 'siliconflow.svg')
    },
    {
      src: path.join(__dirname, '..', 'nodes', 'SiliconFlowChatModel', 'siliconflow.svg'),
      dest: path.join(siliconFlowChatModelDistDir, 'siliconflow.svg')
    }
  ];

  svgFiles.forEach(({ src, dest }) => {
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`Copied: ${src} -> ${dest}`);
    } else {
      console.warn(`Source file not found: ${src}`);
    }
  });

  console.log('SVG assets copied successfully!');
}

copyAssets();
