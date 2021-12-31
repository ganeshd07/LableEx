import { LangLocale } from '../enum/lang-locale.enum';
import { AppSupportedCountry } from '../enum/app-supported-country.enum';
import { LocaleHeader } from '../enum/locale-header.enum';
import * as defaultCurrencyList from 'src/assets/data/default-currency-list.json';
import { SessionItems } from '../enum/session-items.enum';

export class CountryLocale {
  public static getResourceBySupportedCountry(locale: string) {
    const localeObj = this.getSupportedLocales().find(resource => resource.key === locale);
    return (localeObj) ? localeObj : this.getSupportedLocales().find(resource => resource.isDefault === true);
  }

  public static getAPIHeaderLocale() {
    const selectedLanguage = sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE);
    const selectedCountry = sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);
    const enLocaleObj = this.getSupportedLocales().find(resource => (resource.key === selectedCountry && resource.enLangVal === selectedLanguage));
    const localLocaleObj = this.getSupportedLocales().find(resource => (resource.key === selectedCountry && resource.localLangVal === selectedLanguage));
    return (localLocaleObj) ? localLocaleObj.nonEnLocale : enLocaleObj.enLocale;
  }

  public static getSupportedLocales() {
    return [
      {
        key: AppSupportedCountry.HK_COUNTRYCODE,
        enLangVal: LangLocale.EN,
        localLangVal: LangLocale.ZH_HK,
        langLabel: 'Traditional Chinese',
        isDefault: false,
        dialingPrefix: '+852',
        currencies: defaultCurrencyList,
        countryOfManufactureList: [],
        enLocale: LocaleHeader.en_HK,
        nonEnLocale: LocaleHeader.zh_HK
      },
      {
        key: AppSupportedCountry.CN_COUNTRYCODE,
        enLangVal: LangLocale.EN,
        localLangVal: LangLocale.ZH_CN,
        langLabel: 'Chinese',
        isDefault: false,
        dialingPrefix: '+86',
        currencies: defaultCurrencyList,
        countryOfManufactureList: [],
        enLocale: LocaleHeader.en_CN,
        nonEnLocale: LocaleHeader.zh_CN
      },
      {
        key: AppSupportedCountry.SG_COUNTRYCODE,
        enLangVal: LangLocale.EN,
        localLangVal: '',
        langLabel: 'English',
        isDefault: false,
        dialingPrefix: '+65',
        currencies: defaultCurrencyList,
        countryOfManufactureList: [],
        enLocale: LocaleHeader.en_SG,
        nonEnLocale: ''
      },
      {
        key: AppSupportedCountry.DEFAULT_COUNTRYCODE,
        enLangVal: LangLocale.EN,
        localLangVal: '',
        langLabel: 'English',
        isDefault: true,
        dialingPrefix: '+1',
        currencies: defaultCurrencyList,
        countryOfManufactureList: [],
        enLocale: LocaleHeader.en_US,
        nonEnLocale: ''
      },
      {
        key: AppSupportedCountry.AU_COUNTRYCODE,
        enLangVal: LangLocale.EN,
        localLangVal: '',
        langLabel: 'English',
        isDefault: false,
        dialingPrefix: '+61',
        currencies: defaultCurrencyList,
        countryOfManufactureList: [],
        enLocale: LocaleHeader.en_AU,
        nonEnLocale: ''
      },
      {
        key: AppSupportedCountry.ID_COUNTRYCODE,
        enLangVal: LangLocale.EN,
        localLangVal: LangLocale.ID_ID,
        langLabel: 'English',
        isDefault: false,
        dialingPrefix: '+62',
        currencies: defaultCurrencyList,
        countryOfManufactureList: [],
        enLocale: LocaleHeader.en_ID,
        nonEnLocale: LocaleHeader.id_ID
      },
      {
        key: AppSupportedCountry.JP_COUNTRYCODE,
        enLangVal: LangLocale.EN,
        localLangVal: LangLocale.JA_JP,
        langLabel: 'English',
        isDefault: false,
        dialingPrefix: '+81',
        currencies: defaultCurrencyList,
        countryOfManufactureList: [],
        enLocale: LocaleHeader.en_JP,
        nonEnLocale: LocaleHeader.ja_JP
      },
      {
        key: AppSupportedCountry.KR_COUNTRYCODE,
        enLangVal: LangLocale.EN,
        localLangVal: LangLocale.KO_KR,
        langLabel: 'English',
        isDefault: false,
        dialingPrefix: '+82',
        currencies: defaultCurrencyList,
        countryOfManufactureList: [],
        enLocale: LocaleHeader.en_KR,
        nonEnLocale: LocaleHeader.ko_KR
      },
      {
        key: AppSupportedCountry.NZ_COUNTRYCODE,
        enLangVal: LangLocale.EN,
        localLangVal: '',
        langLabel: 'English',
        isDefault: false,
        dialingPrefix: '+64',
        currencies: defaultCurrencyList,
        countryOfManufactureList: [],
        enLocale: LocaleHeader.en_NZ,
        nonEnLocale: ''
      },
      {
        key: AppSupportedCountry.PH_COUNTRYCODE,
        enLangVal: LangLocale.EN,
        localLangVal: '',
        langLabel: 'English',
        isDefault: false,
        dialingPrefix: '+63',
        currencies: defaultCurrencyList,
        countryOfManufactureList: [],
        enLocale: LocaleHeader.en_PH,
        nonEnLocale: ''
      },
      {
        key: AppSupportedCountry.TH_COUNTRYCODE,
        enLangVal: LangLocale.EN,
        localLangVal: LangLocale.TH_TH,
        langLabel: 'English',
        isDefault: false,
        dialingPrefix: '+66',
        currencies: defaultCurrencyList,
        countryOfManufactureList: [],
        enLocale: LocaleHeader.en_TH,
        nonEnLocale: LocaleHeader.th_TH
      },
      {
        key: AppSupportedCountry.TW_COUNTRYCODE,
        enLangVal: LangLocale.EN,
        localLangVal: LangLocale.ZH_TW,
        langLabel: 'English',
        isDefault: false,
        dialingPrefix: '+886',
        currencies: defaultCurrencyList,
        countryOfManufactureList: [],
        enLocale: LocaleHeader.en_TW,
        nonEnLocale: LocaleHeader.zh_TW
      },
      {
        key: AppSupportedCountry.VN_COUNTRYCODE,
        enLangVal: LangLocale.EN,
        localLangVal: LangLocale.VI_VN,
        langLabel: 'English',
        isDefault: false,
        dialingPrefix: '+1',
        currencies: defaultCurrencyList,
        countryOfManufactureList: [],
        enLocale: LocaleHeader.en_VI,
        nonEnLocale: LocaleHeader.vi_VN
      },
      {
        key: AppSupportedCountry.MY_COUNTRYCODE,
        enLangVal: LangLocale.EN,
        localLangVal: '',
        langLabel: 'English',
        isDefault: false,
        dialingPrefix: '+60',
        currencies: defaultCurrencyList,
        countryOfManufactureList: [],
        enLocale: LocaleHeader.en_MY,
        nonEnLocale: ''
      }
    ];
  }
}
