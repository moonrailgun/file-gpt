import './update';
import yargs from 'yargs';
import { covertToTsCommand } from './commands/covertToTs';
import { generateUnittestCommand } from './commands/generateUnittest';
import { refactorCommand } from './commands/refactor';
import { freeCommand } from './commands/free';

yargs
  .demandCommand()
  .command(covertToTsCommand)
  .command(generateUnittestCommand)
  .command(refactorCommand)
  .command(freeCommand)
  .alias('h', 'help')
  .scriptName('fileai')
  .parse();
