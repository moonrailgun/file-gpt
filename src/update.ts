import updateNotifier from 'update-notifier';
import packageJson from '../package.json';

updateNotifier({
  pkg: packageJson,
  shouldNotifyInNpmScript: true,
}).notify();
