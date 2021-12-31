/**
 * Carriage Limit enum for LABELEX application.
 * This determines the carriage amount limit in USD.
 * Author: Marlon Micael J. Cuevas
 * Date Created: Nov. 18, 2020
 */
export enum CarriageLimit {
  INTERNATIONAL_PRIORITY = '50,000',
  INTERNATIONAL_ECONOMY = '50,000',
  INTERNATIONAL_FIRST = '50,000',
  INTERNATIONAL_PRIORITY_FREIGHT = '100,000',
  INTERNATIONAL_ECONOMY_FREIGHT = '100,000',
  EUROPE_FIRST_INTERNATIONAL_PRIORITY = '50,000',
  FIRST_OVERNIGHT = '50,000',
  PRIORITY_OVERNIGHT = '50,000',
  STANDARD_OVERNIGHT = '50,000',
  FEDEX_2_DAY = '50,000',
  FEDEX_2_DAY_AM = '50,000',
  FEDEX_EXPRESS_SAVER = '50,000',
  FEDEX_GROUND = '50,000',
  INTERNATIONAL_GROUND = '50,000',
  SAME_DAY = '50,000',
  SAME_DAY_CITY = '50,000',

  // Currency used to get carriage limit
  CURRENCY = 'USD',
}
