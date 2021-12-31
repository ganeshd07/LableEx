// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.

import { ConfigState } from '../app/types/enum/config-state.enum';
import { LogLevel } from '../app/types/enum/log-level.enum';

// The list of which env maps to which file can be found in `.angular-cli.json`.
export const environment = {
  state: ConfigState.DEV,
  production: false,
  mock: false,
  page_analytics: navigator.webdriver ? false : true,
  analytics_id_delimeter: '/',
  analytics_debug: navigator.webdriver ? false : true,
  logger: LogLevel.ALL,
  enable_social_login_poc: true, //TODO - FLAG Added to run POC code in dev environment  
  otpTimeout: 90000,
  textFieldFocusDelay: 150,
  dev_host_url: 'https://lite-dev.ute.apac.fedex.com',
  uat_host_url: 'https://lite-uat.dmz.apac.fedex.com',
  local_dev_url: 'localhost:8080'
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
