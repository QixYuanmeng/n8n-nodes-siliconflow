import {
	NodeConnectionType,
	type INodeType,
	type INodeTypeDescription,
	type ISupplyDataFunctions,
	type SupplyData,
} from 'n8n-workflow';

import axios from 'axios';

// SiliconFlow Chat Model for AI Agent compatibility with Tools support
class SiliconFlowChatModelInternal {
	apiKey: string;
	baseUrl: string;
	model: string;
	temperature: number;
	maxTokens: number;
	topP: number;
	topK?: number;
	frequencyPenalty: number;
	timeout: number;
	maxRetries: number;
	enableThinking: boolean;
	thinkingBudget: number;

	// AI Agent compatibility properties
	_llmType = 'siliconflow-chat';
	_modelType = 'chat_model';
	
	constructor(config: {
		apiKey: string;
		baseUrl: string;
		model: string;
		temperature?: number;
		maxTokens?: number;
		topP?: number;
		topK?: number;
		frequencyPenalty?: number;
		timeout?: number;
		maxRetries?: number;
		enableThinking?: boolean;
		thinkingBudget?: number;
	}) {
		this.apiKey = config.apiKey;
		this.baseUrl = config.baseUrl;
		this.model = config.model;
		this.temperature = config.temperature ?? 0.7;
		this.maxTokens = config.maxTokens ?? 1024;
		this.topP = config.topP ?? 0.7;
		this.topK = config.topK;
		this.frequencyPenalty = config.frequencyPenalty ?? 0;
		this.timeout = config.timeout ?? 60000;
		this.maxRetries = config.maxRetries ?? 2;
		this.enableThinking = config.enableThinking ?? false;
		this.thinkingBudget = config.thinkingBudget ?? 4096;
	}

	// Main invoke method - compatible with n8n AI Agent
	async invoke(input: any, options?: { tools?: any[]; toolChoice?: string }): Promise<any> {
		let messages: Array<{ role: string; content: string; tool_calls?: any[] }>;

		// Handle different input formats for AI Agent compatibility
		if (typeof input === 'string') {
			messages = [{ role: 'user', content: input }];
		} else if (input && Array.isArray(input)) {
			// Direct messages array
			messages = input;
		} else if (input && typeof input === 'object' && 'messages' in input) {
			messages = input.messages;
		} else if (input && typeof input === 'object' && 'content' in input) {
			messages = [{ role: 'user', content: (input as any).content }];
		} else {
			throw new Error('Invalid input format for SiliconFlow Chat Model');
		}

		const requestBody: any = {
			model: this.model,
			messages: messages,
			temperature: this.temperature,
			max_tokens: this.maxTokens,
			top_p: this.topP,
			frequency_penalty: this.frequencyPenalty,
			stream: false,
		};

		// Add additional parameters
		if (this.topK !== undefined) {
			requestBody.top_k = this.topK;
		}

		// Add tools if provided
		if (options?.tools && options.tools.length > 0) {
			requestBody.tools = options.tools;
			if (options.toolChoice) {
				requestBody.tool_choice = options.toolChoice;
			}
		}

		// Add reasoning parameters for reasoning models
		if (this.enableThinking && (this.model.includes('QwQ') || this.model.includes('R1'))) {
			// Only enable thinking when not using tools (some models may not support both)
			if (!requestBody.tools) {
				requestBody.enable_thinking = this.enableThinking;
				requestBody.thinking_budget = this.thinkingBudget;
			}
		}

		try {
			const response = await axios.post(`${this.baseUrl}/chat/completions`, requestBody, {
				headers: {
					Authorization: `Bearer ${this.apiKey}`,
					'Content-Type': 'application/json',
				},
				timeout: this.timeout,
			});

			const choice = response.data.choices?.[0];
			if (!choice) {
				throw new Error('No response received from SiliconFlow');
			}

			// Return structured response for AI Agent compatibility
			const result = {
				content: choice.message.content || '',
				additional_kwargs: {} as any,
				response_metadata: {
					model: this.model,
					usage: response.data.usage,
				},
			};

			// Include tool calls if present
			if (choice.message.tool_calls) {
				result.additional_kwargs.tool_calls = choice.message.tool_calls;
			}

			// Include reasoning if available
			if (choice.message.reasoning_content) {
				result.additional_kwargs.reasoning = choice.message.reasoning_content;
			}

			return result;
		} catch (error) {
			throw new Error(
				`SiliconFlow API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
			);
		}
	}

	// LangChain-style compatibility methods for n8n AI Agent
	async call(input: any): Promise<string> {
		const result = await this.invoke(input);
		return typeof result === 'string' ? result : result.content;
	}

	async generate(messages: any[]): Promise<any> {
		return this.invoke(messages);
	}

	// Tools support methods - essential for n8n AI Agent recognition
	get supportsToolCalling(): boolean {
		return true;
	}

	// Bind tools method
	bindTools(tools: any[]): SiliconFlowChatModelInternal {
		const newInstance = Object.create(this.constructor.prototype);
		Object.assign(newInstance, this);
		newInstance._boundTools = tools;
		return newInstance;
	}

	// Check if tools are bound
	get hasBoundTools(): boolean {
		return !!(this as any)._boundTools;
	}

	// Get bound tools
	get boundTools(): any[] {
		return (this as any)._boundTools || [];
	}

	// Model identification
	get modelName(): string {
		return this.model;
	}

	get _modelName(): string {
		return this.model;
	}

	get _identifying_params(): any {
		return {
			model: this.model,
			temperature: this.temperature,
			max_tokens: this.maxTokens,
			top_p: this.topP,
		};
	}
}

const MODEL_TYPE = '@siliconflow/chat-model';

type SiliconFlowCredential = {
	apiKey: string;
	baseUrl: string;
};

export class SiliconFlowChatModel implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SiliconFlow Chat Model',
		name: 'siliconFlowChatModel',
		icon: 'file:siliconflow.svg',
		group: ['ai'],
		version: [1],
		description: 'For advanced usage with AI Agent chains - supports function calling',
		defaults: {
			name: 'SiliconFlow Chat Model',
		},
		codex: {
			categories: ['AI'],
			subcategories: {
				AI: ['Language Models', 'Root Nodes'],
				'Language Models': ['Chat Models (Recommended)'],
			},
			resources: {
				primaryDocumentation: [
					{
						url: 'https://docs.siliconflow.cn/',
					},
				],
			},
		},
		inputs: [],
		outputs: [NodeConnectionType.AiLanguageModel],
		outputNames: ['Model'],
		credentials: [
			{
				name: 'siliconFlowApi',
				required: true,
			},
		],
		requestDefaults: {
			ignoreHttpStatusErrors: true,
			baseURL: '={{ $credentials?.baseUrl }}',
		},
		properties: [
			{
				displayName:
					'Connect to AI Agent or AI Chain to use this node. SiliconFlow models support function calling and reasoning capabilities.',
				name: 'notice',
				type: 'notice',
				default: '',
			},
			{
				displayName: 'Model',
				name: 'model',
				type: 'options',
				description: 'The model which will generate the completion. All models support tools calling.',
				options: [
					// GLM models with tools support
					{
						name: 'GLM-4-Plus (推荐)',
						value: 'THUDM/glm-4-plus',
					},
					{
						name: 'GLM-4-0520',
						value: 'THUDM/glm-4-0520',
					},
					{
						name: 'GLM-4-AirX',
						value: 'THUDM/glm-4-airx',
					},
					{
						name: 'GLM-4-Air',
						value: 'THUDM/glm-4-air',
					},
					{
						name: 'GLM-4-Flash',
						value: 'THUDM/glm-4-flash',
					},
					{
						name: 'GLM-4-AllTools',
						value: 'THUDM/glm-4-alltools',
					},
					// Qwen models with tools support
					{
						name: 'Qwen2.5-72B-Instruct',
						value: 'Qwen/Qwen2.5-72B-Instruct',
					},
					{
						name: 'Qwen2.5-32B-Instruct',
						value: 'Qwen/Qwen2.5-32B-Instruct',
					},
					{
						name: 'Qwen2.5-14B-Instruct',
						value: 'Qwen/Qwen2.5-14B-Instruct',
					},
					{
						name: 'Qwen2.5-7B-Instruct',
						value: 'Qwen/Qwen2.5-7B-Instruct',
					},
					// DeepSeek models
					{
						name: 'DeepSeek-V2.5',
						value: 'deepseek-ai/DeepSeek-V2.5',
					},
					// Reasoning models
					{
						name: 'QwQ-32B (推理模型)',
						value: 'Qwen/QwQ-32B',
					},
					{
						name: 'DeepSeek-R1 (推理模型)',
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
						displayName: 'Maximum Number of Tokens',
						name: 'maxTokens',
						default: 1024,
						description: 'The maximum number of tokens to generate in the completion.',
						type: 'number',
						typeOptions: {
							maxValue: 16384,
							minValue: 1,
						},
					},
					{
						displayName: 'Sampling Temperature',
						name: 'temperature',
						default: 0.7,
						typeOptions: { maxValue: 2, minValue: 0, numberPrecision: 1 },
						description:
							'Controls randomness: Lowering results in less random completions. As the temperature approaches zero, the model will become deterministic and repetitive.',
						type: 'number',
					},
					{
						displayName: 'Top P',
						name: 'topP',
						default: 0.7,
						typeOptions: { maxValue: 1, minValue: 0, numberPrecision: 2 },
						description:
							'Controls diversity via nucleus sampling: 0.5 means half of all likelihood-weighted options are considered.',
						type: 'number',
					},
					{
						displayName: 'Top K',
						name: 'topK',
						default: 50,
						typeOptions: { maxValue: 100, minValue: 1 },
						description: 'Limits the number of tokens to consider for each step.',
						type: 'number',
					},
					{
						displayName: 'Frequency Penalty',
						name: 'frequencyPenalty',
						default: 0,
						typeOptions: { maxValue: 2, minValue: -2, numberPrecision: 1 },
						description:
							"Positive values penalize new tokens based on their existing frequency in the text so far.",
						type: 'number',
					},
					{
						displayName: 'Timeout',
						name: 'timeout',
						default: 60000,
						description: 'Maximum amount of time a request is allowed to take in milliseconds',
						type: 'number',
					},
					{
						displayName: 'Max Retries',
						name: 'maxRetries',
						default: 2,
						description: 'Maximum number of retries to attempt',
						type: 'number',
					},
					{
						displayName: 'Enable Thinking (推理模型)',
						name: 'enableThinking',
						default: false,
						description: 'Enable chain-of-thought reasoning for supported models',
						type: 'boolean',
					},
					{
						displayName: 'Thinking Budget',
						name: 'thinkingBudget',
						default: 4096,
						typeOptions: { maxValue: 32768, minValue: 128 },
						description: 'Maximum tokens for reasoning process',
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
		const modelName = this.getNodeParameter('model', itemIndex) as string;
		const options = this.getNodeParameter('options', itemIndex, {}) as {
			maxTokens?: number;
			temperature?: number;
			topP?: number;
			topK?: number;
			frequencyPenalty?: number;
			timeout?: number;
			maxRetries?: number;
			enableThinking?: boolean;
			thinkingBudget?: number;
		};

		const model = new SiliconFlowChatModelInternal({
			apiKey: credentials.apiKey as string,
			baseUrl: credentials.baseUrl as string,
			model: modelName,
			maxTokens: options.maxTokens || 1024,
			temperature: options.temperature || 0.7,
			topP: options.topP || 0.7,
			topK: options.topK,
			frequencyPenalty: options.frequencyPenalty || 0,
			timeout: options.timeout || 60000,
			maxRetries: options.maxRetries || 2,
			enableThinking: options.enableThinking || false,
			thinkingBudget: options.thinkingBudget || 4096,
		});

		return {
			response: model,
		};
	}
}
