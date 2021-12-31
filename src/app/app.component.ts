import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { LocalizationConfigService } from '../../src/app/core/providers/localization-config.service';
import { ActivatedRoute } from '@angular/router';
import { CountryLocale } from './types/constants/country-locale.constants';
import { AppSupportedCountry } from './types/enum/app-supported-country.enum';
import { PageAnalyticsService } from './providers/page-analytics.service';
import { SessionItems } from './types/enum/session-items.enum';
import { HttpHeaderKey } from './types/enum/http-header-key.enum';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  dark = false;
  parameterizedSelectedCountry: string;
  currentRoute: string;
  querySubs: Subscription = new Subscription();

  constructor(
    private localizationConfigService: LocalizationConfigService,
    private route: ActivatedRoute,
    private pageAnalyticsService: PageAnalyticsService
  ) {
  }

  ngOnInit() {
    const onLoadParams = new URLSearchParams(document.location.search.substring(1));
    let onLoadCountry = onLoadParams.get('country');

    this.querySubs.add(this.route.queryParams.subscribe(params => {
      const parameterizedSelectedCountry: string = onLoadCountry === null ? params.country : onLoadCountry;
      onLoadCountry = null;
      if (parameterizedSelectedCountry) {
        sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, parameterizedSelectedCountry.toUpperCase());
        sessionStorage.setItem(SessionItems.DIALINGPREFIX,
          CountryLocale.getResourceBySupportedCountry(parameterizedSelectedCountry.toUpperCase()).dialingPrefix);
        this.localizationConfigService.sendSelectedCountry('country');
      } else {
        // If no country was set via params or no stored selectedCountry in sessionStorage,
        // the app will default to HK else it will just use what has been set in sessionStorage.
        const sessionSelectedCountry = sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);
        if (!sessionSelectedCountry) {
          sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, AppSupportedCountry.HK_COUNTRYCODE);
          sessionStorage.setItem(SessionItems.DIALINGPREFIX,
            CountryLocale.getResourceBySupportedCountry(AppSupportedCountry.HK_COUNTRYCODE).dialingPrefix);
          this.localizationConfigService.sendSelectedCountry('country');
        }
      }

      sessionStorage.removeItem(SessionItems.RECIPIENTADDRESSBOOK);
      // TODO: Remove when need to retain login details.
      // Remove logged in items when page is refreshed.
      sessionStorage.removeItem(SessionItems.ISLOGGEDIN);
      sessionStorage.removeItem(SessionItems.MOBILENUMBER);
      sessionStorage.removeItem(HttpHeaderKey.TX_ID);
      sessionStorage.removeItem(HttpHeaderKey.FACEBOOK_TOKEN);
      sessionStorage.removeItem(HttpHeaderKey.GOOGLE_TOKEN);
      this.localizationConfigService.getDefaultLanguage();
      this.querySubs.unsubscribe();
    }));

    // route subscription/initialization for Adobe Analytics
    this.pageAnalyticsService.registerPageViews();
    this.validateSummarySession();
  }

  validateSummarySession() {
    const isFromOtpToSummary = sessionStorage.getItem(SessionItems.ISFROMSUMMARY);
    if (isFromOtpToSummary) {
      sessionStorage.removeItem(SessionItems.ISFROMSUMMARY);
      sessionStorage.removeItem(SessionItems.MOBILENUMBER);
    }
  }
}
