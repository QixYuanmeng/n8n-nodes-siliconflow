# SiliconFlow Chat Model - AI Agent 集成更新

## 🎯 主要更新 (v1.2.0)

### ✅ 添加了工具调用 (Tools Calling) 支持

**问题解决**: 
- n8n AI Agent 提示 "Tools Agent requires Chat Model which supports Tools calling"
- SiliconFlow Chat Model 节点现在完全支持工具调用功能

### 🔧 技术改进

1. **工具调用接口**
   - 实现了 `invokeWithTools()` 方法
   - 添加了 `supportsToolCalling = true` 属性
   - 支持 tools 参数和 tool_choice 配置

2. **响应格式优化**
   - 返回结构化响应支持 tool_calls
   - 保持向后兼容的字符串响应
   - 包含 reasoning 内容（推理模型）

3. **模型筛选**
   - 只显示支持工具调用的模型
   - 标明每个模型的工具调用能力
   - 默认使用 GLM-4-Plus（最佳工具调用模型）

### 📋 支持工具调用的模型列表

#### GLM 系列 (智谱AI)
- ✅ GLM-4-Plus - 最强大的工具调用模型
- ✅ GLM-4-0520 - 稳定版本
- ✅ GLM-4-AirX - 高性能版本
- ✅ GLM-4-Air - 轻量版本
- ✅ GLM-4-Flash - 快速响应版本
- ✅ GLM-4-AllTools - 专用工具调用版本

#### Qwen 系列 (阿里通义千问)
- ✅ Qwen2.5-72B-Instruct - 最大模型
- ✅ Qwen2.5-32B-Instruct - 高性能版本
- ✅ Qwen2.5-14B-Instruct - 平衡版本
- ✅ Qwen2.5-7B-Instruct - 轻量版本

#### DeepSeek 系列
- ✅ DeepSeek-V2.5 - 支持工具调用

#### 推理模型 (支持工具+推理)
- ✅ QwQ-32B - 推理+工具调用
- ✅ DeepSeek-R1 - 推理+工具调用

### 🚀 使用方法

#### 1. 基本 AI Agent 设置
```
1. 添加 "AI Agent" 节点
2. 添加 "SiliconFlow Chat Model" 节点  
3. 在 AI Agent 中选择 SiliconFlow Chat Model
4. 现在可以添加工具了！
```

#### 2. 推荐配置
- **模型**: GLM-4-Plus（最佳工具调用性能）
- **Temperature**: 0.1-0.3（工具调用需要较低随机性）
- **Max Tokens**: 1024-2048

#### 3. 工具调用特性
- ✅ 函数调用 (Function Calling)
- ✅ 多工具并行调用
- ✅ 工具结果处理
- ✅ 复杂工作流支持

### 🔍 技术实现细节

```typescript
// 工具调用接口实现
async invokeWithTools(messages: any[], tools: any[], toolChoice?: string): Promise<any> {
  return this.invoke({ messages }, { tools, toolChoice });
}

// 支持检查
supportsTools(): boolean {
  return true;
}

// 工具调用兼容性标记
supportsToolCalling = true;
```

### 📈 性能对比

| 模型 | 工具调用准确率 | 响应速度 | 推荐场景 |
|------|---------------|----------|----------|
| GLM-4-Plus | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 复杂工具链 |
| GLM-4-AllTools | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 专业工具调用 |
| Qwen2.5-72B | ⭐⭐⭐⭐ | ⭐⭐⭐ | 大规模推理 |
| DeepSeek-V2.5 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 成本效益 |

### 🔧 故障排除

**问题**: AI Agent 仍然不识别节点
**解决**: 
1. 确保使用 v1.2.0+ 版本
2. 重新构建并安装节点
3. 重启 n8n 服务
4. 清除浏览器缓存

**问题**: 工具调用失败
**解决**:
1. 检查模型是否支持工具调用
2. 验证工具定义格式
3. 使用 GLM-4-Plus 进行测试

### 📝 更新日志

- 🆕 添加完整的工具调用支持
- 🔧 优化模型列表（仅显示支持工具的模型）
- 📊 改进响应格式处理
- 🏷️ 更新包关键词和描述
- 📖 完善文档和使用说明

---

现在您的 SiliconFlow Chat Model 节点应该可以在 n8n AI Agent 的模型选择列表中正常显示，并支持完整的工具调用功能！
