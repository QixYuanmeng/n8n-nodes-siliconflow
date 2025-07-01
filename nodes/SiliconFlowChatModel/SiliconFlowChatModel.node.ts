import {
	INodeType,
	INodeTypeDescription,
	ISupplyDataFunctions,
	SupplyData,
	NodeConnectionType,
} from 'n8n-workflow';

import axios from 'axios';

// Simple SiliconFlow LLM implementation for AI Agent compatibility with Tools support
class SiliconFlowSimpleLLM {
	apiKey: string;
	baseUrl: string;
	model: string;
	temperature: number;
	maxTokens: number;
	topP: number;
	enableThinking: boolean;
	thinkingBudget: number;
	
	// AI Agent compatibility properties
	_llmType = 'siliconflow';
	_modelType = 'base_chat_model';
	supportsToolCalling = true; // This is crucial for AI Agent compatibility

	constructor(config: {
		apiKey: string;
		baseUrl: string;
		model: string;
		temperature?: number;
		maxTokens?: number;
		topP?: number;
		enableThinking?: boolean;
		thinkingBudget?: number;
	}) {
		this.apiKey = config.apiKey;
		this.baseUrl = config.baseUrl;
		this.model = config.model;
		this.temperature = config.temperature ?? 0.7;
		this.maxTokens = config.maxTokens ?? 1024;
		this.topP = config.topP ?? 0.7;
		this.enableThinking = config.enableThinking ?? true;
		this.thinkingBudget = config.thinkingBudget ?? 4096;
	}

	// Main invoke method with tools support
	async invoke(input: any, options?: { tools?: any[]; toolChoice?: string }): Promise<any> {
		let messages: Array<{ role: string; content: string; tool_calls?: any[] }>;
		
		// Handle different input formats for AI Agent compatibility
		if (typeof input === 'string') {
			messages = [{ role: 'user', content: input }];
		} else if (input && typeof input === 'object' && 'messages' in input) {
			messages = input.messages;
		} else if (input && typeof input === 'object' && 'content' in input) {
			messages = [{ role: 'user', content: (input as any).content }];
		} else if (Array.isArray(input)) {
			// Direct messages array
			messages = input;
		} else {
			throw new Error('Invalid input format for SiliconFlow Chat Model');
		}

		const requestBody: any = {
			model: this.model,
			messages: messages,
			temperature: this.temperature,
			max_tokens: this.maxTokens,
			top_p: this.topP,
			stream: false,
		};

		// Add tools support if provided
		if (options?.tools && options.tools.length > 0) {
			requestBody.tools = options.tools;
			if (options.toolChoice) {
				requestBody.tool_choice = options.toolChoice;
			}
		}

		// Add reasoning parameters for reasoning models
		if (this.enableThinking && !requestBody.tools) {
			// Only enable thinking when not using tools (some models may not support both)
			requestBody.enable_thinking = this.enableThinking;
			requestBody.thinking_budget = this.thinkingBudget;
		}

		try {
			const response = await axios.post(`${this.baseUrl}/chat/completions`, requestBody, {
				headers: {
					Authorization: `Bearer ${this.apiKey}`,
					'Content-Type': 'application/json',
				},
			});

			const choice = response.data.choices?.[0];
			if (!choice) {
				throw new Error('No response received from SiliconFlow');
			}

			// Return structured response for tools compatibility
			const result = {
				content: choice.message.content || '',
				additional_kwargs: {},
			};

			// Include tool calls if present
			if (choice.message.tool_calls) {
				result.additional_kwargs = {
					tool_calls: choice.message.tool_calls,
				};
			}

			// Include reasoning if available
			if (choice.message.reasoning_content) {
				result.additional_kwargs = {
					...result.additional_kwargs,
					reasoning: choice.message.reasoning_content,
				};
			}

			// For simple string responses (backward compatibility)
			if (!choice.message.tool_calls && typeof input === 'string') {
				return choice.message.content || '';
			}

			return result;
		} catch (error) {
			throw new Error(
				`SiliconFlow API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
			);
		}
	}

	// Method specifically for tools calling (required by n8n AI Agent)
	async invokeWithTools(messages: any[], tools: any[], toolChoice?: string): Promise<any> {
		return this.invoke({ messages }, { tools, toolChoice });
	}

	// Alternative method names that n8n AI Agent might expect
	async call(input: string | { messages: Array<{ role: string; content: string }> }): Promise<string> {
		const result = await this.invoke(input);
		return typeof result === 'string' ? result : result.content;
	}

	async generate(input: string | { messages: Array<{ role: string; content: string }> }): Promise<string> {
		const result = await this.invoke(input);
		return typeof result === 'string' ? result : result.content;
	}

	// Tools support check method
	supportsTools(): boolean {
		return true;
	}
}

export class SiliconFlowChatModel implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SiliconFlow Chat Model',
		name: 'siliconFlowChatModel',
		icon: 'file:siliconflow.svg',
		group: ['transform'],
		version: 1,
		description: 'SiliconFlow Chat Model with Tools calling support for AI Agent integration',
		defaults: {
			name: 'SiliconFlow Chat Model',
		},
		codex: {
			categories: ['AI'],
			subcategories: {
				AI: ['Language Models', 'Tools'],
			},
			resources: {
				primaryDocumentation: [
					{
						url: 'https://docs.siliconflow.cn/',
					},
				],
			},
			alias: ['@ai', 'chatmodel', 'llm', 'language model', 'siliconflow', 'tools'],
		},
		credentials: [
			{
				name: 'siliconFlowApi',
				required: true,
			},
		],
		inputs: [],
		outputs: [NodeConnectionType.AiLanguageModel],
		outputNames: ['Model'],
		requestDefaults: {
			returnFullResponse: false,
		},
		properties: [
			{
				displayName: 'Model',
				name: 'model',
				type: 'options',
				description: 'The model which will generate the completion (Tools calling enabled models)',
				options: [
					// GLM models with tools support
					{
						name: 'GLM-4-Plus (工具调用)',
						value: 'THUDM/glm-4-plus',
					},
					{
						name: 'GLM-4-0520 (工具调用)',
						value: 'THUDM/glm-4-0520',
					},
					{
						name: 'GLM-4-AirX (工具调用)',
						value: 'THUDM/glm-4-airx',
					},
					{
						name: 'GLM-4-Air (工具调用)',
						value: 'THUDM/glm-4-air',
					},
					{
						name: 'GLM-4-Flash (工具调用)',
						value: 'THUDM/glm-4-flash',
					},
					{
						name: 'GLM-4-AllTools (工具调用)',
						value: 'THUDM/glm-4-alltools',
					},
					// Qwen models with tools support
					{
						name: 'Qwen2.5-72B-Instruct (工具调用)',
						value: 'Qwen/Qwen2.5-72B-Instruct',
					},
					{
						name: 'Qwen2.5-32B-Instruct (工具调用)',
						value: 'Qwen/Qwen2.5-32B-Instruct',
					},
					{
						name: 'Qwen2.5-14B-Instruct (工具调用)',
						value: 'Qwen/Qwen2.5-14B-Instruct',
					},
					{
						name: 'Qwen2.5-7B-Instruct (工具调用)',
						value: 'Qwen/Qwen2.5-7B-Instruct',
					},
					// DeepSeek models with tools support
					{
						name: 'DeepSeek-V2.5 (工具调用)',
						value: 'deepseek-ai/DeepSeek-V2.5',
					},
					// Reasoning models (some support tools)
					{
						name: 'QwQ-32B (推理+工具)',
						value: 'Qwen/QwQ-32B',
					},
					{
						name: 'DeepSeek-R1 (推理+工具)',
						value: 'Pro/deepseek-ai/DeepSeek-R1',
					},
				],
				default: 'THUDM/glm-4-plus',
			},
			{
				displayName: 'Options',
				name: 'options',
				placeholder: 'Add Option',
				description: 'Additional options to add',
				type: 'collection',
				default: {},
				options: [
					{
						displayName: 'Temperature',
						name: 'temperature',
						default: 0.7,
						typeOptions: { maxValue: 2, minValue: 0, numberPrecision: 1 },
						description: 'Controls randomness: lowering results in less random completions',
						type: 'number',
					},
					{
						displayName: 'Max Tokens',
						name: 'maxTokens',
						default: 1024,
						typeOptions: { maxValue: 16384, minValue: 1 },
						description: 'The maximum number of tokens to generate',
						type: 'number',
					},
					{
						displayName: 'Top P',
						name: 'topP',
						default: 0.7,
						typeOptions: { maxValue: 1, minValue: 0, numberPrecision: 2 },
						description: 'Controls diversity via nucleus sampling',
						type: 'number',
					},
					{
						displayName: 'Enable Thinking',
						name: 'enableThinking',
						default: true,
						description: 'Enable thinking mode for reasoning models',
						type: 'boolean',
					},
					{
						displayName: 'Thinking Budget',
						name: 'thinkingBudget',
						default: 4096,
						typeOptions: { maxValue: 32768, minValue: 128 },
						description: 'Maximum tokens for chain-of-thought reasoning',
						type: 'number',
						displayOptions: {
							show: {
								enableThinking: [true],
							},
						},
					},
				],
			},
		],
	};

	async supplyData(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData> {
		const credentials = await this.getCredentials('siliconFlowApi');
		const model = this.getNodeParameter('model', itemIndex) as string;
		const options = this.getNodeParameter('options', itemIndex, {}) as {
			temperature?: number;
			maxTokens?: number;
			topP?: number;
			enableThinking?: boolean;
			thinkingBudget?: number;
		};

		const chatModel = new SiliconFlowSimpleLLM({
			apiKey: credentials.apiKey as string,
			baseUrl: credentials.baseUrl as string,
			model,
			temperature: options.temperature,
			maxTokens: options.maxTokens,
			topP: options.topP,
			enableThinking: options.enableThinking,
			thinkingBudget: options.thinkingBudget,
		});

		return {
			response: chatModel,
		};
	}
}
