import {
	INodeType,
	INodeTypeDescription,
	ISupplyDataFunctions,
	SupplyData,
	NodeConnectionType,
} from 'n8n-workflow';

import axios from 'axios';

// Simple SiliconFlow LLM implementation without LangChain dependencies
class SiliconFlowSimpleLLM {
	apiKey: string;
	baseUrl: string;
	model: string;
	temperature: number;
	maxTokens: number;
	topP: number;
	enableThinking: boolean;
	thinkingBudget: number;

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

	async invoke(input: { messages: Array<{ role: string; content: string }> }): Promise<string> {
		
		const requestBody: any = {
			model: this.model,
			messages: input.messages,
			temperature: this.temperature,
			max_tokens: this.maxTokens,
			top_p: this.topP,
			stream: false,
		};

		// Add reasoning parameters for reasoning models
		if (this.enableThinking) {
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

			return choice.message.content || '';
		} catch (error) {
			throw new Error(`SiliconFlow API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}
}

export class SiliconFlowChatModel implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SiliconFlow Chat Model',
		name: 'siliconFlowChatModel',
		icon: 'file:siliconflow.svg',
		group: ['transform'],
		version: 1,
		description: 'SiliconFlow Chat Model for AI Agent integration',
		defaults: {
			name: 'SiliconFlow Chat Model',
		},
		codex: {
			categories: ['AI'],
			subcategories: {
				AI: ['Language Models'],
			},
			resources: {
				primaryDocumentation: [
					{
						url: 'https://docs.siliconflow.cn/',
					},
				],
			},
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
		properties: [
			{
				displayName: 'Model',
				name: 'model',
				type: 'options',
				description: 'The model which will generate the completion',
				options: [
					// Reasoning models
					{
						name: 'QwQ-32B (推理模型)',
						value: 'Qwen/QwQ-32B',
					},
					{
						name: 'GLM-Z1-Rumination-32B-0414 (推理模型)',
						value: 'THUDM/GLM-Z1-Rumination-32B-0414',
					},
					{
						name: 'DeepSeek-R1 (推理模型)',
						value: 'Pro/deepseek-ai/DeepSeek-R1',
					},
					// Qwen3 series
					{
						name: 'Qwen3-235B-A22B',
						value: 'Qwen/Qwen3-235B-A22B',
					},
					{
						name: 'Qwen3-32B',
						value: 'Qwen/Qwen3-32B',
					},
					{
						name: 'Qwen3-14B',
						value: 'Qwen/Qwen3-14B',
					},
					{
						name: 'Qwen3-8B',
						value: 'Qwen/Qwen3-8B',
					},
					// GLM series
					{
						name: 'GLM-4-32B-0414',
						value: 'THUDM/GLM-4-32B-0414',
					},
					{
						name: 'GLM-4-9B-0414',
						value: 'THUDM/GLM-4-9B-0414',
					},
					// Others
					{
						name: 'DeepSeek-V2.5',
						value: 'deepseek-ai/DeepSeek-V2.5',
					},
					{
						name: 'Hunyuan-A13B-Instruct',
						value: 'tencent/Hunyuan-A13B-Instruct',
					},
				],
				default: 'Qwen/QwQ-32B',
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
