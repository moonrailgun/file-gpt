import './update';
import yargs from 'yargs';
import { covertToTsCommand } from './commands/covertToTs';
import { generateUnittestCommand } from './commands/generateUnittest';

yargs
  .demandCommand()
  .command(covertToTsCommand)
  .command(generateUnittestCommand)
  .alias('h', 'help')
  .scriptName('filegpt')
  .parse();
