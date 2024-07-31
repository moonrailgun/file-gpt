import './update';
import yargs from 'yargs';
import { covertToTsCommand } from './commands/covertToTs';
import { generateUnittestCommand } from './commands/generateUnittest';
import { refactorCommand } from './commands/refactor';

yargs
  .demandCommand()
  .command(covertToTsCommand)
  .command(generateUnittestCommand)
  .command(refactorCommand)
  .alias('h', 'help')
  .scriptName('fileai')
  .parse();
