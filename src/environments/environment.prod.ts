import { ConfigState } from '../app/types/enum/config-state.enum';
import { LogLevel } from '../app/types/enum/log-level.enum';

export const environment = {
  state: ConfigState.PROD,
  production: true,
  mock: false,
  page_analytics: true,
  analytics_id_delimeter: '/',
  analytics_debug: false,
  logger: LogLevel.OFF,
  enable_social_login_poc: true,
  otpTimeout: 90000,
  textFieldFocusDelay: 150,
  dev_host_url: 'https://lite.dmz.apac.fedex.com',
  uat_host_url: 'https://lite-uat.dmz.apac.fedex.com',
  local_dev_url: 'localhost:8080'
};
