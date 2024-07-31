import { CommandModule } from 'yargs';
import path from 'path';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import fg from 'fast-glob';
import chalk from 'chalk';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { env } from '../env';
import { CodeOutputParser } from '../utils/CodeOutputParser';
import { getLLMModel } from '../utils/llm';

export const refactorCommand: CommandModule = {
  command: 'refactor <file>',
  describe: 'refactor file and make it easy to read',
  builder: (yargs) =>
    yargs.positional('file', {
      demandOption: true,
      description: 'input file or dir',
      type: 'string',
    }),
  async handler(args: any) {
    const filepath = String(args.file);

    let fileList = [];
    if ((await fs.stat(filepath)).isFile() === true) {
      // is file
      fileList = [path.resolve(process.cwd(), filepath)];
    } else {
      console.log('Scanning all js files in', chalk.blue(filepath), '...');
      fileList = await fg(['./**/*.js', '!node_modules'], {
        cwd: filepath,
        absolute: true,
      });
    }

    console.group('Process file:');
    fileList.forEach((p) => console.log(`- ${p}`));
    console.groupEnd();

    const { openaiApiKey, modelName, generateType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'modelName',
        message: 'Which LLM Model did you want use?',
        choices: ['deepseek-coder', 'deepseek-chat', 'gpt-4o-mini'],
        default: 'deepseek-coder',
      },
      {
        type: 'input',
        name: 'openaiApiKey',
        message: 'Whats your openai api key?',
        default: env.openaiApiKey,
        when: () => !Boolean(env.openaiApiKey),
      },
      {
        type: 'list',
        name: 'generateType',
        choices: [
          { name: 'Replace old file', value: 'replace' },
          { name: 'Keep old file', value: 'keep' },
        ],
        default: 'keep',
      },
    ]);

    const llm = getLLMModel(modelName, openaiApiKey);

    const parser = new CodeOutputParser();

    const promptTemplate = ChatPromptTemplate.fromMessages([
      ['system', systemPrompt],
      ['user', '{code}'],
    ]);

    for (const p of fileList) {
      const code = await fs.readFile(p);

      const res = await promptTemplate
        .pipe(llm)
        .pipe(parser)
        .invoke({
          code: String(code),
        });

      if (generateType === 'keep') {
        await fs.move(p, p + '.old');
      }

      await fs.writeFile(p, res);
    }
  },
};

const systemPrompt = `
You are a skilled software engineer with deep expertise in code refactoring and optimization across multiple programming languages. Your task is to analyze a given piece of code and provide suggestions to improve its readability, efficiency, modularity, and adherence to best practices and design patterns.

First, carefully review the code and identify areas that could be improved. Consider factors such as:

- Readability: Is the code easy to understand? Are variables and functions named descriptively? Is the formatting consistent?

- Efficiency: Can the code be optimized for better performance? Are there any redundant or unnecessary operations?

- Modularity: Is the code properly organized into functions or classes? Is there good separation of concerns?

- Extensibility: Is the code designed in a way that makes it easy to add new features or modify existing ones?

- Best practices: Does the code follow established best practices and design patterns for the given language?

Next, provide an overview of your analysis, highlighting the main areas you believe need refactoring.

And add some comments as appropriate.

Finally, use origin type and language to output your test code, and please make sure your output is clear and not include any comment, its very important to me
`;
