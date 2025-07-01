# SiliconFlow Chat Model Testing Guide

## 测试 AI Agent 兼容性

### 1. 安装插件
```bash
# 在 n8n 项目中安装
npm install ./path/to/n8n-nodes-siliconflow
```

### 2. 配置凭据
1. 在 n8n 中创建 SiliconFlow API 凭据
2. 填入 API Key 和 Base URL: `https://api.siliconflow.cn/v1`

### 3. 测试 Tools Agent
1. 创建新的 Workflow
2. 添加 "Tools Agent" 节点
3. 在 Language Models 中选择 "SiliconFlow Chat Model"
4. 配置支持工具调用的模型（如 GLM-4-Plus）
5. 添加工具（如 Calculator、HTTP Request 等）
6. 测试执行

### 4. 验证功能
- ✅ Chat Model 应该出现在 AI Agent 的 Language Models 列表中
- ✅ 应该支持工具调用（Tools Calling）
- ✅ 支持推理模型（如 QwQ-32B、DeepSeek-R1）
- ✅ 支持思维链推理（enable_thinking 参数）

### 5. 预期行为
- 模型应该能够理解和调用工具
- 推理模型应该能够进行复杂的逻辑推理
- 工具调用结果应该正确集成到对话中

### 6. 错误排除
如果看到 "Tools Agent requires Chat Model which supports Tools calling" 错误：
1. 确认使用的是支持工具调用的模型
2. 检查凭据配置是否正确
3. 验证模型参数设置

## 支持的模型列表
所有配置的模型都支持工具调用：
- GLM-4-Plus (推荐)
- GLM-4-0520, GLM-4-AirX, GLM-4-Air, GLM-4-Flash, GLM-4-AllTools
- Qwen2.5 系列 (72B, 32B, 14B, 7B)
- DeepSeek-V2.5
- QwQ-32B (推理模型)
- DeepSeek-R1 (推理模型)
