import { optMain } from './options.js';

optMain({browser, document});
setInterval(() => {
  optMain({browser, document});
}, 5000);


