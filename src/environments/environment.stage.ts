import { ConfigState } from '../app/types/enum/config-state.enum';
import { LogLevel } from '../app/types/enum/log-level.enum';

export const environment = {
  state: ConfigState.UAT,
  production: false,
  mock: false,
  page_analytics: navigator.webdriver ? false : true,
  analytics_id_delimeter: '/',
  analytics_debug: navigator.webdriver ? false : true,
  logger: LogLevel.ERROR,
  enable_social_login_poc: true,
  otpTimeout: 90000,
  textFieldFocusDelay: 150,
  dev_host_url: 'https://lite-uat.dmz.apac.fedex.com',
  uat_host_url: 'https://lite-uat.dmz.apac.fedex.com',
  local_dev_url: 'localhost:8080'
};
