/* eslint-disable n8n-nodes-base/node-dirname-against-convention */

import { ChatOpenAI, type ClientOptions } from '@langchain/openai';
import {
	NodeConnectionType,
	type INodeType,
	type INodeTypeDescription,
	type ISupplyDataFunctions,
	type SupplyData,
} from 'n8n-workflow';

type SiliconFlowCredential = {
	apiKey: string;
	baseUrl: string;
};

export class SiliconFlowChatModel implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SiliconFlow Chat Model',
		// eslint-disable-next-line n8n-nodes-base/node-class-description-name-miscased
		name: 'siliconFlowChatModel',
		icon: 'file:siliconflow.svg',
		group: ['transform'],
		version: [1],
		description: 'For advanced usage with an AI chain',
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
		// eslint-disable-next-line n8n-nodes-base/node-class-description-inputs-wrong-regular-node
		inputs: [],
		// eslint-disable-next-line n8n-nodes-base/node-class-description-outputs-wrong
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
					'Connect to AI Agent, Tools Agent, or AI Chain to use this node. SiliconFlow models support function calling and reasoning capabilities.',
				name: 'connectionNotice',
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
						displayName: 'Frequency Penalty',
						name: 'frequencyPenalty',
						default: 0,
						typeOptions: { maxValue: 2, minValue: -2, numberPrecision: 1 },
						description:
							"Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim",
						type: 'number',
					},
					{
						displayName: 'Maximum Number of Tokens',
						name: 'maxTokens',
						default: -1,
						description: 'The maximum number of tokens to generate in the completion.',
						type: 'number',
						typeOptions: {
							maxValue: 32768,
							minValue: -1,
						},
					},
					{
						displayName: 'Presence Penalty',
						name: 'presencePenalty',
						default: 0,
						typeOptions: { maxValue: 2, minValue: -2, numberPrecision: 1 },
						description:
							"Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics",
						type: 'number',
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
						displayName: 'Top P',
						name: 'topP',
						default: 1,
						typeOptions: { maxValue: 1, minValue: 0, numberPrecision: 1 },
						description:
							'Controls diversity via nucleus sampling: 0.5 means half of all likelihood-weighted options are considered. We generally recommend altering this or temperature but not both.',
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
		const credentials = await this.getCredentials<SiliconFlowCredential>('siliconFlowApi');
		const modelName = this.getNodeParameter('model', itemIndex) as string;
		const options = this.getNodeParameter('options', itemIndex, {}) as {
			frequencyPenalty?: number;
			maxTokens?: number;
			maxRetries?: number;
			timeout?: number;
			presencePenalty?: number;
			temperature?: number;
			topP?: number;
			topK?: number;
			enableThinking?: boolean;
			thinkingBudget?: number;
		};

		const configuration: ClientOptions = {
			baseURL: credentials.baseUrl,
		};

		// Prepare model kwargs for SiliconFlow specific features
		const modelKwargs: any = {};

		// Add reasoning parameters for reasoning models
		if (options.enableThinking && (modelName.includes('QwQ') || modelName.includes('R1'))) {
			modelKwargs.enable_thinking = true;
			modelKwargs.thinking_budget = options.thinkingBudget || 4096;
		}

		// Add other SiliconFlow specific parameters
		if (options.topK !== undefined) {
			modelKwargs.top_k = options.topK;
		}

		const model = new ChatOpenAI({
			openAIApiKey: credentials.apiKey,
			model: modelName,
			maxTokens: options.maxTokens || -1,
			temperature: options.temperature ?? 0.7,
			topP: options.topP ?? 1,
			frequencyPenalty: options.frequencyPenalty ?? 0,
			presencePenalty: options.presencePenalty ?? 0,
			timeout: options.timeout ?? 60000,
			maxRetries: options.maxRetries ?? 2,
			configuration,
			modelKwargs: Object.keys(modelKwargs).length > 0 ? modelKwargs : undefined,
		});

		return {
			response: model,
		};
	}
}
