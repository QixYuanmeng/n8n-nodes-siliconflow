# 使用示例

这个n8n社区节点允许您在n8n工作流中使用硅基流动的AI模型，支持聊天完成、文本嵌入和文档重排序功能。

## 安装

### 方式1：通过n8n社区节点安装

1. 打开n8n界面
2. 进入 **设置 > 社区节点**
3. 点击 **安装**
4. 在包名称字段中输入 `n8n-nodes-siliconflow`
5. 同意使用社区节点的风险条款
6. 点击 **安装**

### 方式2：手动安装

```bash
npm install n8n-nodes-siliconflow
```

## 配置

1. 在n8n中创建新的凭据
2. 选择 "SiliconFlow API" 凭据类型
3. 输入您的硅基流动API密钥（从 [硅基流动控制台](https://cloud.siliconflow.cn) 获取）
4. 可选：修改基础URL（默认为 `https://api.siliconflow.cn/v1`）

## 支持的操作

### 1. 聊天完成 (Chat Completion)

生成文本回复，支持多轮对话和推理。

#### 支持的模型
- **推理模型**: QwQ-32B, GLM-Z1-Rumination-32B, DeepSeek-R1
- **Qwen3系列**: Qwen3-235B-A22B, Qwen3-32B, Qwen3-14B, Qwen3-8B
- **Qwen2.5系列**: Qwen2.5-7B到72B
- **GLM系列**: GLM-Z1-32B, GLM-4-32B, GLM-4-9B系列
- **其他**: DeepSeek-V2.5, Hunyuan-A13B, MiniMax-M1-80k, QwenLong-L1-32B

#### 主要参数
- **模型**: 选择要使用的语言模型
- **消息**: 配置对话消息（支持system/user/assistant角色）
- **简单提示**: 作为消息的替代，可以直接输入提示文本

#### 高级参数
- **Max Tokens**: 最大生成tokens数量 (1-16384)
- **Temperature**: 随机性控制 (0-2)
- **Top P/K**: 核心采样参数
- **Min P**: 动态过滤阈值（适用于Qwen3模型）
- **Enable Thinking**: 启用思维模式（推理模型）
- **Thinking Budget**: 思维链最大tokens (128-32768)
- **Stream**: 是否使用流式输出
- **Response Format**: 输出格式（text/json_object）
- **Stop Sequences**: 停止生成的序列
  - Max Tokens: 最大生成token数 (默认1024)
  - Temperature: 控制随机性 (0-2, 默认0.7)
  - Top P: 控制多样性 (0-1, 默认1)
  - Stream: 是否流式返回 (默认false)

**示例输出：**
```json
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "Qwen/Qwen2.5-7B-Instruct",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "你好！我是一个AI助手，很高兴为您服务。"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 15,
    "total_tokens": 25
  }
}
```

### 2. 文本嵌入 (Text Embeddings)

将文本转换为向量表示，用于语义搜索、聚类等任务。

#### 支持的模型
- **BGE系列**: bge-large-zh-v1.5 (中文,512), bge-large-en-v1.5 (英文,512), bge-m3 (多语言,8192)
- **Qwen3-Embedding**: 8B/4B/0.6B (支持32K tokens)
- **其他**: YoudAo BCE-embedding, sentence-transformers models

#### 参数
- **模型**: 选择嵌入模型
- **输入**: 要嵌入的文本
- **编码格式**: Float或Base64格式

### 3. 文档重排序 (Document Reranking)

根据查询重新排序文档，提高检索相关性。

#### 支持的模型
- **Qwen3-Reranker**: 8B/4B/0.6B
- **BGE-Reranker**: v2-m3, Pro/v2-m3
- **YoudAo**: bce-reranker-base_v1

#### 参数
- **模型**: 选择重排序模型
- **查询**: 搜索查询文本
- **文档**: 要重排序的文档列表（每行一个或逗号分隔）
- **Top N**: 返回最相关的N个文档
- **返回文档**: 是否在结果中包含文档文本
- **分块参数**: 长文档的分块处理（BGE/YoudAo模型）

## 示例用法

### 聊天完成示例

```json
// 输入
{
  "model": "Qwen/QwQ-32B",
  "messages": [
    {
      "role": "user", 
      "content": "解释一下量子计算的基本原理"
    }
  ],
  "enable_thinking": true,
  "thinking_budget": 2048
}

// 输出
{
  "id": "chatcmpl-xxx",
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "量子计算是基于量子力学原理的计算方式...",
        "reasoning_content": "我需要从基本概念开始解释..."
      }
    }
  ]
}
```

### 文本嵌入示例

```json
// 输入
{
  "model": "BAAI/bge-large-zh-v1.5",
  "input": "人工智能是计算机科学的一个分支"
}

// 输出
{
  "object": "list",
  "data": [
    {
      "object": "embedding",
      "embedding": [0.1234, -0.5678, 0.9012, ...],
      "index": 0
    }
  ],
  "model": "BAAI/bge-large-zh-v1.5",
  "usage": {
    "prompt_tokens": 12,
    "total_tokens": 12
  }
}
```

### 文档重排序示例

```json
// 输入
{
  "model": "BAAI/bge-reranker-v2-m3",
  "query": "机器学习算法",
  "documents": [
    "深度学习是机器学习的一个子领域",
    "Python是一种编程语言",
    "神经网络是深度学习的基础",
    "数据库用于存储数据"
  ],
  "top_n": 2,
  "return_documents": true
}

// 输出
{
  "id": "rerank-xxx",
  "results": [
    {
      "index": 0,
      "relevance_score": 0.95,
      "document": {
        "text": "深度学习是机器学习的一个子领域"
      }
    },
    {
      "index": 2,
      "relevance_score": 0.87,
      "document": {
        "text": "神经网络是深度学习的基础"
      }
    }
  ]
}
```

## 工作流示例

### 示例1：智能客服机器人

```json
{
  "nodes": [
    {
      "parameters": {
        "resource": "chat",
        "operation": "complete",
        "model": "Qwen/Qwen2.5-7B-Instruct",
        "messages": {
          "messageValues": [
            {
              "role": "system",
              "content": "你是一个专业的客服助手，请用友好和专业的语气回答用户问题。"
            },
            {
              "role": "user", 
              "content": "{{$json.userMessage}}"
            }
          ]
        },
        "additionalFields": {
          "temperature": 0.7,
          "max_tokens": 500
        }
      },
      "type": "n8n-nodes-siliconflow.siliconFlow",
      "typeVersion": 1,
      "position": [820, 300]
    }
  ]
}
```

### 示例2：文档语义搜索

```json
{
  "nodes": [
    {
      "parameters": {
        "resource": "embeddings",
        "operation": "create",
        "embeddingModel": "BAAI/bge-large-zh-v1.5",
        "input": "{{$json.documentText}}"
      },
      "type": "n8n-nodes-siliconflow.siliconFlow", 
      "typeVersion": 1,
      "position": [820, 300]
    }
  ]
}
```

## 错误处理

节点会自动处理API错误并返回详细的错误信息。在工作流设置中启用"出错时继续"可以确保单个请求失败不会中断整个工作流。

## 支持的模型

### 聊天模型
- **Qwen2.5系列**: 阿里云通义千问模型，支持中英文对话
- **DeepSeek-V2.5**: DeepSeek的最新对话模型
- **GLM-4-9B**: 智谱AI的对话模型

### 嵌入模型
- **BGE系列**: 北京智源的双语嵌入模型
- **all-MiniLM-L6-v2**: 轻量级多语言嵌入模型

## 注意事项

1. 确保您有有效的硅基流动API密钥
2. 不同模型有不同的计费方式，请查看硅基流动的定价页面
3. 大型模型可能需要更长的响应时间
4. 建议在生产环境中设置适当的超时时间

## 获取API密钥

1. 访问 [硅基流动官网](https://siliconflow.cn/)
2. 注册并登录账号
3. 进入控制台获取API密钥
4. 将密钥配置到n8n凭据中

## 技术支持

如果您遇到问题，请检查：
1. API密钥是否正确
2. 网络连接是否正常
3. 选择的模型是否可用
4. 请求参数是否符合API规范

更多信息请参考 [硅基流动API文档](https://docs.siliconflow.cn/)。
