# SiliconFlow Chat Model - AI Agent 集成更新

## 🎯 主要更新 (v1.2.0)

### ✅ 添加了工具调用 (Tools Calling) 支持

**问题解决**: 
- n8n AI Agent 提示 "Tools Agent requires Chat Model which supports Tools calling"
- SiliconFlow Chat Model 节点现在完全支持工具调用功能

### 🔧 技术改进

1. **自定义聊天模型实现**
   - 移除了 LangChain 依赖以解决 TypeScript 兼容性问题
   - 实现了原生的 AI Agent 兼容接口
   - 支持 `invoke()`, `call()`, `generate()` 等方法

2. **工具调用接口**
   - 实现了 `bindTools()` 方法进行工具绑定
   - 添加了 `supportsToolCalling = true` 属性
   - 支持 tools 参数和 tool_choice 配置

3. **响应格式优化**
   - 返回结构化响应支持 tool_calls
   - 保持向后兼容的字符串响应
   - 包含 reasoning 内容（推理模型）
   - 添加 response_metadata 包含使用统计

4. **AI Agent 兼容性**
   - 节点分组从 'transform' 改为 'ai'
   - 输出类型为 NodeConnectionType.AiLanguageModel
   - 支持多种输入格式（字符串、消息数组、对象）

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

### 💡 实现亮点

#### 1. 自定义聊天模型架构
```typescript
// 核心实现类
class SiliconFlowChatModelInternal {
  // AI Agent 兼容属性
  _llmType = 'siliconflow-chat';
  _modelType = 'chat_model';
  
  // 主要方法
  async invoke(input: any, options?: { tools?: any[]; toolChoice?: string })
  bindTools(tools: any[]): SiliconFlowChatModelInternal
  
  // 兼容性方法
  async call(input: any): Promise<string>
  async generate(messages: any[]): Promise<any>
  
  // 工具支持检查
  get supportsToolCalling(): boolean { return true; }
  get hasBoundTools(): boolean
  get boundTools(): any[]
}
```

#### 2. 响应格式优化
```typescript
// 标准化响应结构
{
  content: string,                    // 主要回复内容
  additional_kwargs: {               // 扩展信息
    tool_calls?: any[],              // 工具调用
    reasoning?: string               // 推理过程(QwQ/R1)
  },
  response_metadata: {               // 元数据
    model: string,
    usage: object                    // 使用统计
  }
}
```

#### 3. 多格式输入支持
- 字符串输入：`"用户消息"`
- 消息数组：`[{role: "user", content: "消息"}]`
- 对象格式：`{messages: [...], tools: [...]}`
- 内容对象：`{content: "消息内容"}`

### 🛠️ API 调用示例

#### 基础聊天调用
```json
{
  "model": "THUDM/glm-4-plus",
  "messages": [
    {"role": "user", "content": "你好，请介绍一下你自己"}
  ],
  "temperature": 0.7,
  "max_tokens": 1024
}
```

#### 工具调用示例
```json
{
  "model": "THUDM/glm-4-plus",
  "messages": [
    {"role": "user", "content": "帮我查询北京今天的天气，并计算温度的华氏度"}
  ],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_weather",
        "description": "获取指定城市的实时天气信息",
        "parameters": {
          "type": "object",
          "properties": {
            "city": {
              "type": "string", 
              "description": "城市名称，如：北京、上海"
            }
          },
          "required": ["city"]
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "celsius_to_fahrenheit",
        "description": "将摄氏度转换为华氏度",
        "parameters": {
          "type": "object",
          "properties": {
            "celsius": {
              "type": "number",
              "description": "摄氏度温度值"
            }
          },
          "required": ["celsius"]
        }
      }
    }
  ],
  "tool_choice": "auto"
}
```

#### 推理模型调用
```json
{
  "model": "Qwen/QwQ-32B",
  "messages": [
    {"role": "user", "content": "解决这个数学问题：如果一个数的平方等于它的3倍，这个数是多少？"}
  ],
  "enable_thinking": true,
  "thinking_budget": 2048,
  "temperature": 0.1
}
```

### 🔍 兼容性测试

#### 验证工具调用功能
```bash
# 1. 构建项目
npm run build

# 2. 打包测试
npm pack

# 3. 检查输出文件
ls -la dist/

# 4. 验证类型定义
npm run lint
```

#### n8n 集成测试
1. **节点加载测试**: 验证节点能正确加载到 n8n
2. **AI Agent 识别**: 确认在 AI Agent 的 Language Models 列表中可见
3. **工具调用测试**: 添加简单工具（如时间获取）验证功能
4. **模型切换测试**: 验证不同模型间切换正常
5. **推理功能测试**: 测试 QwQ-32B 和 DeepSeek-R1 的推理能力

### 🚦 部署清单

#### 发布前检查
- [ ] TypeScript 编译无错误 (`npm run build`)
- [ ] ESLint 检查通过 (`npm run lint`)
- [ ] 包依赖正确 (`npm audit`)
- [ ] 文档更新完整
- [ ] 版本号递增 (package.json)

#### 安装验证
- [ ] n8n 中节点正确显示
- [ ] AI Agent 能识别为 Chat Model
- [ ] 工具调用功能正常
- [ ] 错误处理恰当
- [ ] 性能满足要求

---

现在您的 SiliconFlow Chat Model 节点应该可以在 n8n AI Agent 的模型选择列表中正常显示，并支持完整的工具调用功能！
