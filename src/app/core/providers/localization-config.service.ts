import { TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { BrowserService } from './browser.service';
import { LangLocale } from 'src/app/types/enum/lang-locale.enum';
import { SessionItems } from 'src/app/types/enum/session-items.enum';

/**
 * This is a localization configuration service to fetch and set the language
 * based on the browser language of the user.
 *
 * @author Carlo Oseo
 * Date Created: April 30, 2020
 */

@Injectable()
export class LocalizationConfigService {

    selectedCountry: string;
    countryOptions = true;
    private appCountrySelected = new Subject<any>();

    constructor(
        private translate: TranslateService,
        private browserService: BrowserService
        ) { }

    /**
     * This method identifies and returns the default language value
     * set on the browser of the user
     *
     * @returns language: string
     */
    getDefaultLanguage() {
        const language = this.translate.getBrowserLang(); // tw
        let userLangLocale = '';

        userLangLocale = language + '_' + sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY).toLowerCase();
        if (LangLocale[userLangLocale.toUpperCase()] !== undefined) {
            this.translate.setDefaultLang(userLangLocale);
        } else {
            userLangLocale = LangLocale.EN;
            this.translate.setDefaultLang(LangLocale.EN);
        }

        if (this.browserService.isbrowser) {
            sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, userLangLocale);
        }
        return language;
    }

    /**
     * This method fetches the translation set by the user
     * and change the language on the page without reloading
     * the brower
     *
     * @param setLang - selected language
     */
    setLanguage(setLang: string) {
        this.translate.use(setLang);
    }

    /* Set the broadcasted App Access Info API status */
    sendSelectedCountry(status: string) {
        this.appCountrySelected.next({ status });
    }

    /* Get the broadcasted App Access Info API status */
    getSelectedCountry(): Observable<any> {
        return this.appCountrySelected.asObservable();
    }
}
