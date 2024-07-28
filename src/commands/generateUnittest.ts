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

export const generateUnittestCommand: CommandModule = {
  command: 'generateUnittest <file>',
  describe: 'generate unit test with code',
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

    const { openaiApiKey, modelName, testType } = await inquirer.prompt([
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
        name: 'testType',
        message: 'Which type of test tool are you using?',
        choices: ['vitest', 'jest'],
        default: 'vitest',
      },
    ]);

    const llm = getLLMModel(modelName, openaiApiKey);

    const parser = new CodeOutputParser();

    const promptTemplate = ChatPromptTemplate.fromMessages([
      ['system', systemPrompt],
      ['user', '{code}'],
    ]);

    for (const p of fileList) {
      const newFilePath = p.replace(/\.(\w*?)$/, '.test.$1');

      const code = await fs.readFile(p);

      const res = await promptTemplate
        .pipe(llm)
        .pipe(parser)
        .invoke({
          testType: String(testType),
          path: `./${path.basename(p, path.extname(p))}`,
          code: String(code),
        });

      await fs.writeFile(newFilePath, res);
    }
  },
};

const systemPrompt = `
You are an expert software tester tasked with thoroughly testing a given piece of code. Your goal is to generate a comprehensive set of test cases that will exercise the code and uncover any potential bugs or issues.

First, carefully analyze the provided code. Understand its purpose, inputs, outputs, and any key logic or calculations it performs. Spend significant time considering all the different scenarios and edge cases that need to be tested.

Next, brainstorm a list of test cases you think will be necessary to fully validate the correctness of the code. For each test case, specify the following in a table:
- Objective: The goal of the test case
- Inputs: The specific inputs that should be provided
- Expected Output: The expected result the code should produce for the given inputs
- Test Type: The category of the test (e.g. positive test, negative test, edge case, etc.)

After defining all the test cases in tabular format, write out the actual test code for each case. Ensure the test code follows these steps:
1. Arrange: Set up any necessary preconditions and inputs
2. Act: Execute the code being tested
3. Assert: Verify the actual output matches the expected output

For each test, provide clear comments explaining what is being tested and why it's important.

Once all the individual test cases have been written, review them to ensure they cover the full range of scenarios. Consider if any additional tests are needed for completeness.

Finally, use {testType} to output your test code, and please make sure your output is clear and not include any comment, its very important to me

You can import(or require) source module from "./{path}"

Here is the code that you must generate test cases for:
`;
