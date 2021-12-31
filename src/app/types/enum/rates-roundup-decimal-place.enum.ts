/**
 * Number of decimal places to round up the values for each specific country.
 * RatesRoundUpCountries must also contain the country for this to work properly.
 * if not found, it will default to 2 decimal places.
 * Zero(0) means no decimal place/whole number round up.
 *
 * Author: Marlon Micael J. Cuevas
 * Date Created: Sept 29, 2021
 */
export enum RatesRoundUpDecimalPlace {
    JP = 0,
    KR = 0,
    TW = 0,
    VN = 0,
    ID = 0,
    HK = 1
}
