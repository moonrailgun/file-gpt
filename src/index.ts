import './update';
import yargs from 'yargs';
import { covertToTsCommand } from './commands/covertToTs';

yargs
  .demandCommand()
  .command(covertToTsCommand)
  .alias('h', 'help')
  .scriptName('filegpt')
  .parse();
