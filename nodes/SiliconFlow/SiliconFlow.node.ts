import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';

import axios, { AxiosResponse } from 'axios';

export class SiliconFlow implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SiliconFlow',
		name: 'siliconFlow',
		icon: 'file:siliconflow.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with SiliconFlow AI models',
		defaults: {
			name: 'SiliconFlow',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'siliconFlowApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{$credentials.baseUrl}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Chat',
						value: 'chat',
					},
					{
						name: 'Embeddings',
						value: 'embeddings',
					},
					{
						name: 'Rerank',
						value: 'rerank',
					},
				],
				default: 'chat',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['chat'],
					},
				},
				options: [
					{
						name: 'Complete',
						value: 'complete',
						description: 'Create a chat completion',
						action: 'Create a chat completion',
					},
				],
				default: 'complete',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['embeddings'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create embeddings',
						action: 'Create embeddings',
					},
				],
				default: 'create',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['rerank'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create rerank request',
						action: 'Create rerank request',
					},
				],
				default: 'create',
			},
			// Chat completion options
			{
				displayName: 'Model',
				name: 'model',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['chat'],
						operation: ['complete'],
					},
				},
				description:
					'The model which will generate the completion. All models support tools calling.',
				typeOptions: {
					loadOptions: {
						routing: {
							request: {
								method: 'GET',
								url: '/models?sub_type=chat',
							},
							output: {
								postReceive: [
									{
										type: 'rootProperty',
										properties: {
											property: 'data',
										},
									},
									{
										type: 'setKeyValue',
										properties: {
											name: '={{$responseItem.id}}',
											value: '={{$responseItem.id}}',
										},
									},
									{
										type: 'sort',
										properties: {
											key: 'name',
										},
									},
								],
							},
						},
					},
				},
				default: 'THUDM/glm-4-plus',
				required: true,
			},
			{
				displayName: 'Messages',
				name: 'messages',
				type: 'fixedCollection',
				displayOptions: {
					show: {
						resource: ['chat'],
						operation: ['complete'],
					},
				},
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						name: 'messageValues',
						displayName: 'Message',
						values: [
							{
								displayName: 'Role',
								name: 'role',
								type: 'options',
								options: [
									{
										name: 'System',
										value: 'system',
									},
									{
										name: 'User',
										value: 'user',
									},
									{
										name: 'Assistant',
										value: 'assistant',
									},
								],
								default: 'user',
							},
							{
								displayName: 'Content',
								name: 'content',
								type: 'string',
								default: '',
								typeOptions: {
									rows: 3,
								},
							},
						],
					},
				],
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['chat'],
						operation: ['complete'],
					},
				},
				default: '',
				description: 'Simple prompt text (alternative to messages)',
				typeOptions: {
					rows: 3,
				},
			},
			{
				displayName: 'Output Mode',
				name: 'outputMode',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['chat'],
						operation: ['complete'],
					},
				},
				options: [
					{
						name: 'Simple (Message Only)',
						value: 'simple',
						description: 'Return only the message content as a string',
					},
					{
						name: 'Detailed (With Metadata)',
						value: 'detailed',
						description: 'Return structured object with message, usage, and metadata',
					},
				],
				default: 'simple',
				description: 'Choose the output format',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['chat'],
						operation: ['complete'],
					},
				},
				options: [
					{
						displayName: 'Max Tokens',
						name: 'max_tokens',
						type: 'number',
						default: 512,
						typeOptions: {
							minValue: 1,
							maxValue: 16384,
						},
						description: 'The maximum number of tokens to generate (1-16384)',
					},
					{
						displayName: 'Temperature',
						name: 'temperature',
						type: 'number',
						default: 0.7,
						typeOptions: {
							minValue: 0,
							maxValue: 2,
							numberPrecision: 2,
						},
						description: 'Determines the degree of randomness in the response',
					},
					{
						displayName: 'Top P',
						name: 'top_p',
						type: 'number',
						default: 0.7,
						typeOptions: {
							minValue: 0,
							maxValue: 1,
							numberPrecision: 2,
						},
						description: 'The top_p (nucleus) parameter for dynamic choice adjustment',
					},
					{
						displayName: 'Top K',
						name: 'top_k',
						type: 'number',
						default: 50,
						description: 'Top-k sampling parameter',
					},
					{
						displayName: 'Min P',
						name: 'min_p',
						type: 'number',
						default: 0.05,
						typeOptions: {
							minValue: 0,
							maxValue: 1,
							numberPrecision: 3,
						},
						description: 'Dynamic filtering threshold for Qwen3 models (0-1)',
					},
					{
						displayName: 'Frequency Penalty',
						name: 'frequency_penalty',
						type: 'number',
						default: 0.5,
						typeOptions: {
							numberPrecision: 2,
						},
						description: 'Frequency penalty parameter',
					},
					{
						displayName: 'Number of Generations',
						name: 'n',
						type: 'number',
						default: 1,
						description: 'Number of generations to return',
					},
					{
						displayName: 'Enable Thinking',
						name: 'enable_thinking',
						type: 'boolean',
						default: true,
						description:
							'Switches between thinking and non-thinking modes (applies to Qwen3 and Hunyuan models)',
					},
					{
						displayName: 'Thinking Budget',
						name: 'thinking_budget',
						type: 'number',
						default: 4096,
						typeOptions: {
							minValue: 128,
							maxValue: 32768,
						},
						description:
							'Maximum tokens for chain-of-thought output (128-32768, applies to reasoning models)',
					},
					{
						displayName: 'Stop Sequences',
						name: 'stop',
						type: 'string',
						default: '',
						description: 'Up to 4 sequences where the API will stop generating (comma-separated)',
					},
					{
						displayName: 'Stream',
						name: 'stream',
						type: 'boolean',
						default: true,
						description: 'Whether to stream back partial progress as Server-Sent Events',
					},
					{
						displayName: 'Response Format',
						name: 'response_format',
						type: 'fixedCollection',
						default: {},
						description: 'Format specification for the model output',
						options: [
							{
								name: 'formatValues',
								displayName: 'Format',
								values: [
									{
										displayName: 'Type',
										name: 'type',
										type: 'options',
										options: [
											{
												name: 'Text',
												value: 'text',
											},
											{
												name: 'JSON Object',
												value: 'json_object',
											},
										],
										default: 'text',
									},
								],
							},
						],
					},
				],
			},
			// Embeddings options
			{
				displayName: 'Model',
				name: 'embeddingModel',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['embeddings'],
						operation: ['create'],
					},
				},
				options: [
					// BGE系列
					{
						name: 'BAAI/bge-large-zh-v1.5 (中文, 512 tokens)',
						value: 'BAAI/bge-large-zh-v1.5',
					},
					{
						name: 'BAAI/bge-large-en-v1.5 (英文, 512 tokens)',
						value: 'BAAI/bge-large-en-v1.5',
					},
					{
						name: 'BAAI/bge-m3 (多语言, 8192 tokens)',
						value: 'BAAI/bge-m3',
					},
					{
						name: 'Pro/BAAI/bge-m3 (多语言专业版, 8192 tokens)',
						value: 'Pro/BAAI/bge-m3',
					},
					// Qwen嵌入系列
					{
						name: 'Qwen3-Embedding-8B (32768 tokens)',
						value: 'Qwen/Qwen3-Embedding-8B',
					},
					{
						name: 'Qwen3-Embedding-4B (32768 tokens)',
						value: 'Qwen/Qwen3-Embedding-4B',
					},
					{
						name: 'Qwen3-Embedding-0.6B (32768 tokens)',
						value: 'Qwen/Qwen3-Embedding-0.6B',
					},
					// 网易有道
					{
						name: 'netease-youdao/bce-embedding-base_v1 (512 tokens)',
						value: 'netease-youdao/bce-embedding-base_v1',
					},
					// 保留原有的sentence-transformers模型
					{
						name: 'sentence-transformers/all-MiniLM-L6-v2',
						value: 'sentence-transformers/all-MiniLM-L6-v2',
					},
				],
				default: 'BAAI/bge-large-zh-v1.5',
				required: true,
				description: 'The model to use for embeddings',
			},
			{
				displayName: 'Input',
				name: 'input',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['embeddings'],
						operation: ['create'],
					},
				},
				default: '',
				required: true,
				description: 'Input text to embed',
				typeOptions: {
					rows: 3,
				},
			},
			{
				displayName: 'Additional Fields',
				name: 'embeddingAdditionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['embeddings'],
						operation: ['create'],
					},
				},
				options: [
					{
						displayName: 'Encoding Format',
						name: 'encoding_format',
						type: 'options',
						options: [
							{
								name: 'Float',
								value: 'float',
							},
							{
								name: 'Base64',
								value: 'base64',
							},
						],
						default: 'float',
						description: 'The format to return the embeddings in',
					},
				],
			},
			// Rerank options
			{
				displayName: 'Model',
				name: 'rerankModel',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['rerank'],
						operation: ['create'],
					},
				},
				options: [
					// Qwen重排序系列
					{
						name: 'Qwen3-Reranker-8B',
						value: 'Qwen/Qwen3-Reranker-8B',
					},
					{
						name: 'Qwen3-Reranker-4B',
						value: 'Qwen/Qwen3-Reranker-4B',
					},
					{
						name: 'Qwen3-Reranker-0.6B',
						value: 'Qwen/Qwen3-Reranker-0.6B',
					},
					// BAAI BGE重排序系列
					{
						name: 'BAAI/bge-reranker-v2-m3',
						value: 'BAAI/bge-reranker-v2-m3',
					},
					{
						name: 'Pro/BAAI/bge-reranker-v2-m3 (专业版)',
						value: 'Pro/BAAI/bge-reranker-v2-m3',
					},
					// 网易有道
					{
						name: 'netease-youdao/bce-reranker-base_v1',
						value: 'netease-youdao/bce-reranker-base_v1',
					},
				],
				default: 'BAAI/bge-reranker-v2-m3',
				required: true,
				description: 'The model to use for reranking',
			},
			{
				displayName: 'Query',
				name: 'query',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['rerank'],
						operation: ['create'],
					},
				},
				default: '',
				required: true,
				description: 'The search query',
				typeOptions: {
					rows: 2,
				},
			},
			{
				displayName: 'Documents',
				name: 'documents',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['rerank'],
						operation: ['create'],
					},
				},
				default: '',
				required: true,
				description: 'Documents to rerank (one per line or comma-separated)',
				typeOptions: {
					rows: 5,
				},
			},
			{
				displayName: 'Additional Fields',
				name: 'rerankAdditionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['rerank'],
						operation: ['create'],
					},
				},
				options: [
					{
						displayName: 'Top N',
						name: 'top_n',
						type: 'number',
						default: 4,
						typeOptions: {
							minValue: 1,
						},
						description: 'Number of most relevant documents to return',
					},
					{
						displayName: 'Return Documents',
						name: 'return_documents',
						type: 'boolean',
						default: false,
						description: 'Whether to include document text in the response',
					},
					{
						displayName: 'Max Chunks Per Doc',
						name: 'max_chunks_per_doc',
						type: 'number',
						default: 10,
						description: 'Maximum chunks for long documents (BGE/YoudAo models only)',
					},
					{
						displayName: 'Overlap Tokens',
						name: 'overlap_tokens',
						type: 'number',
						default: 20,
						typeOptions: {
							maxValue: 80,
						},
						description: 'Token overlaps between chunks (BGE/YoudAo models only, max 80)',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;
		const credentials = await this.getCredentials('siliconFlowApi');

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'chat' && operation === 'complete') {
					const model = this.getNodeParameter('model', i) as string;
					const prompt = this.getNodeParameter('prompt', i) as string;
					const messagesParam = this.getNodeParameter('messages', i) as any;
					const additionalFields = this.getNodeParameter('additionalFields', i) as any;

					let messages: Array<{ role: string; content: string }> = [];

					// Use messages if provided, otherwise use simple prompt
					if (messagesParam?.messageValues && messagesParam.messageValues.length > 0) {
						messages = messagesParam.messageValues;
					} else if (prompt) {
						messages = [{ role: 'user', content: prompt }];
					} else {
						throw new NodeOperationError(
							this.getNode(),
							'Either messages or prompt must be provided',
						);
					}

					const requestBody: any = {
						model,
						messages,
					};

					// Add optional parameters from additionalFields
					if (additionalFields.max_tokens !== undefined) {
						requestBody.max_tokens = additionalFields.max_tokens;
					}
					if (additionalFields.temperature !== undefined) {
						requestBody.temperature = additionalFields.temperature;
					}
					if (additionalFields.top_p !== undefined) {
						requestBody.top_p = additionalFields.top_p;
					}
					if (additionalFields.top_k !== undefined) {
						requestBody.top_k = additionalFields.top_k;
					}
					if (additionalFields.min_p !== undefined) {
						requestBody.min_p = additionalFields.min_p;
					}
					if (additionalFields.frequency_penalty !== undefined) {
						requestBody.frequency_penalty = additionalFields.frequency_penalty;
					}
					if (additionalFields.n !== undefined) {
						requestBody.n = additionalFields.n;
					}
					if (additionalFields.enable_thinking !== undefined) {
						requestBody.enable_thinking = additionalFields.enable_thinking;
					}
					if (additionalFields.thinking_budget !== undefined) {
						requestBody.thinking_budget = additionalFields.thinking_budget;
					}
					if (additionalFields.stream !== undefined) {
						requestBody.stream = additionalFields.stream;
					}
					if (additionalFields.stop && additionalFields.stop.trim()) {
						// Convert comma-separated string to array
						requestBody.stop = additionalFields.stop
							.split(',')
							.map((s: string) => s.trim())
							.filter((s: string) => s);
					}
					if (additionalFields.response_format && additionalFields.response_format.formatValues) {
						requestBody.response_format = {
							type: additionalFields.response_format.formatValues.type,
						};
					}

					const response: AxiosResponse = await axios.post(
						`${credentials.baseUrl}/chat/completions`,
						requestBody,
						{
							headers: {
								Authorization: `Bearer ${credentials.apiKey}`,
								'Content-Type': 'application/json',
							},
						},
					);

					// Extract and format the response data
					const responseData = response.data;
					const choice = responseData.choices?.[0];

					if (!choice) {
						throw new NodeOperationError(this.getNode(), 'No response received from the model');
					}

					// Check if user wants simple output (just the message content)
					const outputMode = this.getNodeParameter('outputMode', i, 'simple') as string;

					let outputData: any;

					if (outputMode === 'simple') {
						// Simple output - just the message content for easy use in workflows
						outputData = choice.message?.content || '';
					} else {
						// Detailed output - structured data with metadata
						outputData = {
							// Main content - what users typically want
							message: choice.message?.content || '',

							// Additional useful information
							model: responseData.model,
							finishReason: choice.finish_reason,

							// Usage statistics
							usage: responseData.usage,

							// Include reasoning content if available (for reasoning models)
							...(choice.message?.reasoning_content && {
								reasoning: choice.message.reasoning_content,
							}),

							// Include tool calls if any
							...(choice.message?.tool_calls && {
								toolCalls: choice.message.tool_calls,
							}),

							// Raw response for advanced users (can be hidden in UI)
							_rawResponse: responseData,
						};
					}

					returnData.push({
						json: outputData,
						pairedItem: { item: i },
					});
				} else if (resource === 'embeddings' && operation === 'create') {
					const model = this.getNodeParameter('embeddingModel', i) as string;
					const input = this.getNodeParameter('input', i) as string;
					const additionalFields = this.getNodeParameter('embeddingAdditionalFields', i) as any;

					const requestBody: any = {
						model,
						input,
					};

					// Add optional parameters from additionalFields
					if (additionalFields.encoding_format !== undefined) {
						requestBody.encoding_format = additionalFields.encoding_format;
					}

					const response: AxiosResponse = await axios.post(
						`${credentials.baseUrl}/embeddings`,
						requestBody,
						{
							headers: {
								Authorization: `Bearer ${credentials.apiKey}`,
								'Content-Type': 'application/json',
							},
						},
					);

					// Extract and format the embedding response
					const responseData = response.data;
					const outputData = {
						// Main embedding data
						embeddings: responseData.data?.map((item: any) => item.embedding) || [],

						// Metadata
						model: responseData.model,
						usage: responseData.usage,

						// Raw response for advanced users
						_rawResponse: responseData,
					};

					returnData.push({
						json: outputData,
						pairedItem: { item: i },
					});
				} else if (resource === 'rerank' && operation === 'create') {
					const model = this.getNodeParameter('rerankModel', i) as string;
					const query = this.getNodeParameter('query', i) as string;
					const documentsParam = this.getNodeParameter('documents', i) as string;
					const additionalFields = this.getNodeParameter('rerankAdditionalFields', i) as any;

					// Parse documents - support both newline and comma-separated formats
					let documents: string[] = [];
					if (documentsParam.includes('\n')) {
						documents = documentsParam
							.split('\n')
							.map((doc) => doc.trim())
							.filter((doc) => doc);
					} else {
						documents = documentsParam
							.split(',')
							.map((doc) => doc.trim())
							.filter((doc) => doc);
					}

					if (documents.length === 0) {
						throw new NodeOperationError(this.getNode(), 'At least one document must be provided');
					}

					const requestBody: any = {
						model,
						query,
						documents,
					};

					// Add optional parameters from additionalFields
					if (additionalFields.top_n !== undefined) {
						requestBody.top_n = additionalFields.top_n;
					}
					if (additionalFields.return_documents !== undefined) {
						requestBody.return_documents = additionalFields.return_documents;
					}
					if (additionalFields.max_chunks_per_doc !== undefined) {
						requestBody.max_chunks_per_doc = additionalFields.max_chunks_per_doc;
					}
					if (additionalFields.overlap_tokens !== undefined) {
						requestBody.overlap_tokens = additionalFields.overlap_tokens;
					}

					const response: AxiosResponse = await axios.post(
						`${credentials.baseUrl}/rerank`,
						requestBody,
						{
							headers: {
								Authorization: `Bearer ${credentials.apiKey}`,
								'Content-Type': 'application/json',
							},
						},
					);

					// Extract and format the rerank response
					const responseData = response.data;
					const outputData = {
						// Main results - sorted by relevance
						results: responseData.results || [],

						// Metadata
						query: query,
						documentsCount: documents.length,

						// Usage information
						usage: responseData.tokens,

						// Raw response for advanced users
						_rawResponse: responseData,
					};

					returnData.push({
						json: outputData,
						pairedItem: { item: i },
					});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
					returnData.push({
						json: { error: errorMessage },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
