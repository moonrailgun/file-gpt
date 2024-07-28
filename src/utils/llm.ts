import { ChatOpenAI } from '@langchain/openai';

export function getLLMModel(
  modelName: 'deepseek-coder' | 'deepseek-chat' | 'gpt-4o-mini',
  openaiApiKey: string
) {
  const configuration: NonNullable<
    ConstructorParameters<typeof ChatOpenAI>[0]
  >['configuration'] = {};
  if (['deepseek-coder', 'deepseek-chat'].includes(modelName)) {
    configuration.baseURL = 'https://api.deepseek.com/';
  }

  const llm = new ChatOpenAI({
    model: modelName,
    openAIApiKey: openaiApiKey,
    configuration,
    temperature: 0,
    streaming: false,
    timeout: 5000,
  });

  return llm;
}
