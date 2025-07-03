# n8n-nodes-siliconflow

An n8n community node to integrate with SiliconFlow AI models, providing access to chat completions, vision analysis, text embeddings, and document reranking capabilities.

## Features

- 🤖 **Chat Completions**: Access to 20+ AI models including Qwen, GLM, DeepSeek, Hunyuan, and MiniMax
- 👁️ **Vision Analysis**: Analyze images with powerful vision-language models (Qwen2.5-VL, QVQ, DeepSeek-VL2)
- 🧮 **Text Embeddings**: Support for 9 embedding models including BGE, Qwen3-Embedding, and YoudAo
- 📊 **Document Reranking**: Rerank documents for better relevance with 6 reranking models
- 🎯 **AI Agent Integration**: Dedicated node for seamless integration with n8n AI Agent nodes
- 🔧 **Flexible Output**: Choose between simple (message-only) and detailed (with metadata) output modes
- ⚡ **Advanced Parameters**: Full support for reasoning models, streaming, and custom formats
- 🔐 **Secure Authentication**: API key-based authentication with configurable base URL

## Supported Models

### Chat Completion Models
- **Qwen Series**: QwQ-32B (reasoning), Qwen3-235B-A22B, Qwen3-32B, Qwen3-14B, Qwen3-8B, Qwen2.5 series
- **GLM Series**: GLM-Z1-32B, GLM-4-32B, GLM-Z1-Rumination-32B (reasoning), GLM-4-9B series
- **DeepSeek**: DeepSeek-V2.5, DeepSeek-R1 (reasoning)
- **Others**: Hunyuan-A13B-Instruct, MiniMax-M1-80k, QwenLong-L1-32B

### Embedding Models
- **BGE Series**: bge-large-zh-v1.5, bge-large-en-v1.5, bge-m3 (multilingual)
- **Qwen3-Embedding**: 8B, 4B, 0.6B (up to 32K tokens)
- **Others**: YoudAo BCE, sentence-transformers models

### Reranking Models
- **Qwen3-Reranker**: 8B, 4B, 0.6B
- **BGE-Reranker**: v2-m3, Pro/v2-m3
- **YoudAo**: bce-reranker-base_v1

## Installation

Community nodes are not available in the npm registry. To install this node, you have the following options:

### Option 1: User Installation via n8n Community Nodes

1. Go to **Settings > Community Nodes**.
2. Select **Install**.
3. Enter `n8n-nodes-siliconflow` in **Enter npm package name**.
4. Agree to the [risks](https://docs.n8n.io/integrations/community-nodes/risks/) of using community nodes: select **I understand the risks of installing unverified code from a public source**.
5. Select **Install**.

After installing the node, you can use it like any other node. n8n displays the node in search results in the **Nodes** panel.

### Option 2: Manual installation

To get started install the package in your n8n root directory:

`npm install n8n-nodes-siliconflow`

For Docker-based deployments, add the following line before the font installation command in your [n8n Dockerfile](https://github.com/n8n-io/n8n/blob/master/docker/images/n8n/n8n/Dockerfile):

`RUN cd /usr/local/lib/node_modules/n8n && npm install n8n-nodes-siliconflow`

## Configuration

You will need a SiliconFlow API key to use this node. You can get one from [SiliconFlow](https://siliconflow.cn/).

1. Create a SiliconFlow account at [https://cloud.siliconflow.cn](https://cloud.siliconflow.cn)
2. Generate an API key from your account settings
3. In n8n, create a new SiliconFlow API credential with:
   - **API Key**: Your SiliconFlow API key
   - **Base URL**: `https://api.siliconflow.cn/v1` (default)

## Operations

The SiliconFlow node provides two types of nodes:

### SiliconFlow Node
The main node supports three operations:

#### 1. Chat Completion
Generate text completions using SiliconFlow's language models. Features include:
- **Output Modes**: 
  - **Simple**: Returns only the message content as a string (ideal for chat workflows)
  - **Detailed**: Returns structured data with message, usage, metadata, and reasoning content
- Support for reasoning models (QwQ-32B, GLM-Z1-Rumination, DeepSeek-R1)
- Advanced parameters: temperature, top_p, top_k, min_p, frequency_penalty
- Thinking mode for chain-of-thought reasoning
- Streaming and custom response formats
- System, user, and assistant message roles

#### 2. Text Embedding
Generate vector embeddings for text using various embedding models:
- Support for Chinese, English, and multilingual models
- Token limits from 512 to 32,768 depending on model
- Float or Base64 encoding formats
- Batch processing support

#### 3. Document Reranking
Rerank documents based on relevance to a query:
- Support for multiple reranking algorithms
- Configurable top-N results
- Document chunking for long texts
- Relevance scoring

### SiliconFlow Chat Model Node
A specialized node designed for AI Agent integration:
- **AI Agent Compatibility**: Can be used as a language model provider in n8n AI Agent nodes
- **Seamless Integration**: Works with official AI Agent, AI Tool, and AI Memory nodes
- **Multi-turn Conversations**: Supports complex dialogue scenarios
- **Reasoning Support**: Full support for reasoning models with thinking capabilities

## Usage Examples

### Basic Chat with Simple Output
```json
{
  "resource": "chat",
  "operation": "complete",
  "model": "Qwen/QwQ-32B",
  "prompt": "Hello, how are you?",
  "outputMode": "simple"
}
```
**Output**: `"Hello! I'm doing well, thank you for asking. How can I help you today?"`

### Chat with Detailed Output
```json
{
  "resource": "chat", 
  "operation": "complete",
  "model": "Qwen/QwQ-32B",
  "prompt": "Explain quantum computing",
  "outputMode": "detailed"
}
```
**Output**:
```json
{
  "message": "Quantum computing is a type of computation that harnesses quantum mechanical phenomena...",
  "model": "Qwen/QwQ-32B",
  "finishReason": "stop",
  "usage": {
    "prompt_tokens": 15,
    "completion_tokens": 150,
    "total_tokens": 165
  },
  "reasoning": "The user is asking about quantum computing..."
}
```

### AI Agent Integration
1. Add an **AI Agent** node to your workflow
2. Add a **SiliconFlow Chat Model** node
3. In the AI Agent configuration, select the SiliconFlow Chat Model as your language model
4. Configure other AI Agent settings (tools, memory, etc.)
5. Your AI Agent now uses SiliconFlow's powerful models!

## Advanced Features

- **Reasoning Models**: Enable thinking mode for step-by-step problem solving
- **Long Context**: Support for models with up to 80K context length
- **Multilingual**: Chinese, English, and multilingual model options
- **Flexible Input**: Support for simple prompts or structured message arrays

## Compatibility

Tested with n8n version 1.0+.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [SiliconFlow API documentation](https://docs.siliconflow.cn/)

## License

[MIT](https://github.com/QixYuanmeng/n8n-nodes-siliconflow/blob/master/LICENSE.md)
