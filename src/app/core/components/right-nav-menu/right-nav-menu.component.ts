import { Component, DoCheck, HostBinding, OnInit } from '@angular/core';
import { AlertController, MenuController, Platform, ToastController } from '@ionic/angular';
import { Router, NavigationEnd } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { AuthenticationService } from '../../../core/providers/apim/authentication.service';
import { LocalizationConfigService } from '../../providers/localization-config.service';
import { environment } from '../../../../environments/environment';
import { CountryLocale } from '../../../types/constants/country-locale.constants';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { BrowserService } from '../../providers/browser.service';
import { AppSupportedCountry } from 'src/app/types/enum/app-supported-country.enum';
import { AccountType } from 'src/app/types/enum/account-type.enum';
import { ConfigState } from 'src/app/types/enum/config-state.enum';
import { countryResource } from 'src/app/types/constants/country-resource.constants';
import { LocalAuthenticationService } from '../../providers/local/local-authentication.service';
import { select, Store } from '@ngrx/store';
import { AppState } from 'src/app/+store/app.state';
import { getPendingShipmentDetailsBegin, resetNewShippingAction, saveUserAccountAction } from 'src/app/pages/shipping/+store/shipping.actions';
import { TranslateService } from '@ngx-translate/core';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpHeaderKey } from 'src/app/types/enum/http-header-key.enum';
import { SessionItems } from 'src/app/types/enum/session-items.enum';
import { ConfigService } from '@ngx-config/core';
import * as fromShippingSelector from 'src/app/pages/shipping/+store/shipping.selectors';
import { IUser } from 'src/app/interfaces/shipping-app/user';

@Component({
  selector: 'app-right-nav-menu',
  templateUrl: './right-nav-menu.component.html',
  styleUrls: ['./right-nav-menu.component.scss']
})
export class RightNavMenuComponent implements OnInit, DoCheck {
  dark = false;
  appPages = [
    {
      title: 'home.title',
      url: '/shipping/home',
      icon: 'calendar'
    },
    {
      title: 'about.title',
      url: '/about',
      icon: 'information-circle'
    }
  ];

  loggedIn = true;
  fullname = '';
  emailAddress = '';

  selectedLanguage: string;
  selectedCountry: string;
  langLabel: string;
  localLangVal: string;
  enLangVal: string;
  countryOptions = true;
  isLocaleEnglish = true;
  subscription: Subscription;
  currentUrl: string;
  termsofUseUrlsData = countryResource.getTermsOfUseUrls();
  localLangDisplyText = countryResource.languageDisplayText();
  loggedInOption: string = AccountType.OTP;
  accountEnum = AccountType;
  termsofUseLinkUrl: string;

  showLangToggle = true;
  fedexLocationsLinkUrl: string;
  languageDisplayText: string;
  isSelectedLocaleLocal: boolean;
  isSelectedLocaleEnglish = true;

  constructor(
    private menu: MenuController,
    private platform: Platform,
    private router: Router,
    private swUpdate: SwUpdate,
    private toastCtrl: ToastController,
    private authService: AuthenticationService,
    private localAuthService: LocalAuthenticationService,
    public browserService: BrowserService,
    private localizationConfigService: LocalizationConfigService,
    private appStore: Store<AppState>,
    public alertController: AlertController,
    private translate: TranslateService,
    private sanitizer: DomSanitizer,
    private readonly config: ConfigService
  ) {
    this.initializeApp();
    // NOTE: do not delete this line/console log. This is for debugging purposes but not visible for production.
    if (environment.state !== ConfigState.PROD) {
      console.log('APP_MODE: ', environment.state, ', MOCK_MODE: ', (environment.mock) ? 'ON' : 'OFF');
    }
    this.subscription = this.localizationConfigService.getSelectedCountry().subscribe(response => {
      if (response && response.status === 'country') {
        this.selectedCountry = sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);
        if (this.selectedCountry === AppSupportedCountry.HK_COUNTRYCODE || this.selectedCountry === AppSupportedCountry.CN_COUNTRYCODE) {
          this.countryOptions = false;
        }
      }
      this.selectedLanguage = sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE);
      this.checkLocale();
    });
  }

  ngOnInit() {
    this.checkLoginStatus();
    this.listenForLoginEvents();

    this.swUpdate.available.subscribe(async res => {
      const toast = await this.toastCtrl.create({
        message: 'Update available!',
        // showCloseButton: true,
        position: 'bottom',
        // closeButtonText: `Reload`
      });

      await toast?.present();

      toast
        .onDidDismiss()
        .then(() => this.swUpdate.activateUpdate())
        .then(() => {
          if (this.browserService.isbrowser) {
            window.location.reload();
          }
        });
    });
  }

  @HostBinding('attr.style')
  public get valueAsStyle(): any {
    if (this.languageDisplayText !== undefined) {
      const textToDisply = this.languageDisplayText;
      return this.sanitizer.bypassSecurityTrustStyle(`--some-var:'${textToDisply}'`);
    }
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // TODO: move in auth guard service soon as login component becomes ready
      if (!environment.mock) {
        this.authService.getAccessToken();
        this.localAuthService.getLocalAuthToken();
      }
    });
  }

  languageOptions() {
    this.localLangVal = '';
    this.enLangVal = '';
    this.langLabel = '';

    this.setCountryLocale(this.selectedCountry);
  }

  setCountryLocale(selectedCountry: string) {
    this.enLangVal = CountryLocale.getResourceBySupportedCountry(selectedCountry).enLangVal;
    this.localLangVal = CountryLocale.getResourceBySupportedCountry(selectedCountry).localLangVal;
    this.langLabel = CountryLocale.getResourceBySupportedCountry(selectedCountry).langLabel;
  }

  checkLoginStatus() {
    if (this.browserService.isbrowser) {
      if (sessionStorage.getItem(SessionItems.ISLOGGEDIN)) {
        return this.updateLoggedInStatus(true);
      }
    }

    return this.updateLoggedInStatus(false);
  }

  checkLocale(): void {
    const selectedCountry = sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);
    const locale = CountryLocale.getResourceBySupportedCountry(selectedCountry);
    if (this.selectedLanguage && this.selectedLanguage.split('_')[0] !== 'en') {
      this.isLocaleEnglish = false;
    } else {
      this.isLocaleEnglish = true;
    }

    if (!locale.localLangVal) {
      this.showLangToggle = false;
    }
  }

  updateLoggedInStatus(loggedIn: boolean) {
    this.loggedIn = loggedIn;
  }

  listenForLoginEvents() {
    if (this.browserService.isbrowser) {
      window.addEventListener('user:login', () => {
        this.getUserLoginDetails();
        this.updateLoggedInStatus(true);
      });

      window.addEventListener('user:signup', () => {
        this.updateLoggedInStatus(true);
      });

      window.addEventListener('user:logout', () => {
        this.updateLoggedInStatus(false);
      });
    }
  }

  logout() {
    this.logoutAlertConfirm();
  }

  async logoutAlertConfirm() {
    const applyArialFont = this.config.getSettings('ARIAL_FONT_LANGUAGE_LIST').includes(sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE)) ? true : false;
    const alert = await this.alertController.create({
      cssClass: applyArialFont ? 'arial-font' : '',
      subHeader: this.translate.instant('navigation.logoutAlertMessage'),
      buttons: [
        {
          cssClass: applyArialFont ? 'arial-font' : '',
          text: this.translate.instant('button.cancel')
        }, {
          cssClass: applyArialFont ? 'arial-font' : '',
          text: this.translate.instant('button.confirm'),
          handler: () => {
            this.onConfirmClicked();
          }
        }
      ]
    });
    await alert?.present();
  }

  onConfirmClicked() {
    if (this.browserService.isbrowser) {
      this.updateLoggedInStatus(false);
      this.clearSessionValues();
      this.resetStoreValues();
    }
    this.router.navigateByUrl('/login');
  }

  resetStoreValues() {
    this.appStore.dispatch(resetNewShippingAction());
    this.appStore.dispatch(saveUserAccountAction(null));
  }

  clearSessionValues() {
    sessionStorage.removeItem(HttpHeaderKey.FACEBOOK_TOKEN);
    sessionStorage.removeItem(HttpHeaderKey.GOOGLE_TOKEN);
    sessionStorage.removeItem(HttpHeaderKey.TX_ID);
    sessionStorage.removeItem(SessionItems.MOBILENUMBER);
    sessionStorage.removeItem(SessionItems.ISLOGGEDIN);
  }

  getLocale() {
    const selectedLanguage = sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE);
    const selectedCountry = sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);
    return CountryLocale.getResourceBySupportedCountry(selectedCountry);
  }

  onClickEnglishLanguage() {
    const locale = this.getLocale();
    this.localizationConfigService.setLanguage(locale.enLangVal);
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, locale.enLangVal);
    this.isSelectedLocaleEnglish = true;
    this.isSelectedLocaleLocal = false;
  }

  onClickLocalLanguage() {
    const locale = this.getLocale();
    this.localizationConfigService.setLanguage(locale.localLangVal);
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, locale.localLangVal);
    this.isSelectedLocaleEnglish = false;
    this.isSelectedLocaleLocal = true;
  }

  onClickNewShipment() {
    this.presentAlertConfirm();
  }

  onClickMessageCentre() {
    sessionStorage.setItem(SessionItems.MESSAGECENTRE, 'true');
    sessionStorage.setItem(SessionItems.PREVIOUSURL, this.currentUrl);
  }

  onClickMyShipments() {
    sessionStorage.setItem(SessionItems.PREVIOUSURL, this.currentUrl);
  }

  ngDoCheck() {
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentUrl = event?.url;
    });
    this.selectedCountry = sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);
    this.selectedLanguage = sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE);
    this.termsofUseLinkUrl = this.termsofUseUrlsData.find(country => country.countryCode === this.selectedCountry && country.languageCode === this.selectedLanguage)?.termsOfUseUrl;
    this.fedexLocationsLinkUrl = this.termsofUseUrlsData.find(country => country.countryCode === this.selectedCountry && country.languageCode === this.selectedLanguage)?.fedExLocationUrl;
    this.languageDisplayText = this.localLangDisplyText.find(country => country.countryCode === this.selectedCountry)?.languageDisplayButtonText;
  }

  async presentAlertConfirm() {
    const applyArialFont = this.config.getSettings('ARIAL_FONT_LANGUAGE_LIST').includes(sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE)) ? true : false;
    const alert = await this.alertController.create({
      cssClass: applyArialFont ? 'arial-font' : '',
      subHeader: this.translate.instant('navigation.alertMessage'),
      buttons: [
        {
          cssClass: applyArialFont ? 'arial-font' : '',
          text: this.translate.instant('button.cancel')
        }, {
          cssClass: applyArialFont ? 'arial-font' : '',
          text: this.translate.instant('button.confirm'),
          handler: () => {
            this.onClickConfirmedNewShipment();
          }
        }
      ]
    });
    await alert?.present();
  }

  onClickConfirmedNewShipment() {
    const isFromOtpToSummary = sessionStorage.getItem(SessionItems.ISFROMSUMMARY);
    if (isFromOtpToSummary) {
      sessionStorage.removeItem(SessionItems.ISFROMSUMMARY);
      sessionStorage.removeItem(SessionItems.MOBILENUMBER);
    }
    this.router.navigateByUrl('/shipping/shipment-details');
    this.appStore.dispatch(resetNewShippingAction());
    sessionStorage.setItem(SessionItems.NEWSHIPMENT, 'true');
  }

  onClickContactUs() {
    const selectedLang = this.selectedLanguage.split('_');
    const languageCountry = selectedLang[0] + '-' + this.selectedCountry.toLowerCase();
    const contactUsUrl = countryResource.CONTACTUSURL.replace('lang-country', languageCountry);
    window.open(contactUsUrl, '_blank');
  }

  getUserLoginDetails() {
    this.appStore.pipe(select(fromShippingSelector.selectUserLoginDetails))
      .subscribe((userloginDetails: IUser) => {
        if (userloginDetails) {
          this.loggedInOption = userloginDetails.accountType;
        }
      });
  }
}
