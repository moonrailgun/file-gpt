import {
  BaseOutputParser,
  FormatInstructionsOptions,
} from '@langchain/core/output_parsers';

export class CodeOutputParser extends BaseOutputParser<string> {
  static lc_name() {
    return 'CodeOutputParser';
  }

  lc_namespace = ['langchain', 'output_parsers', 'string'];

  getFormatInstructions(options?: FormatInstructionsOptions): string {
    throw 'Some code in markdown code block';
  }

  async parse(text: string): Promise<string> {
    text = text.trim();
    const match = /```(\w*)?(.*)```/s.exec(text);
    if (!match) {
      return text;
    } else {
      return String(match[2]).trim();
    }
  }
}
