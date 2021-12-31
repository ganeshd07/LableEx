import { async, ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { AlertController, IonicModule } from '@ionic/angular';
import { RightNavMenuComponent } from './right-nav-menu.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { AuthenticationService } from '../../../core/providers/apim/authentication.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConfigService } from '@ngx-config/core';
import * as testConfig from '../../../../assets/config/mockConfigForTest';
import { BrowserService } from '../../providers/browser.service';
import { LocalizationConfigService } from '../../providers/localization-config.service';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, Observer } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LanguageLoader } from 'src/app/app.module';
import { ActivatedRoute, UrlSerializer } from '@angular/router';
import { AppState } from 'src/app/+store/app.state';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { countryResource } from 'src/app/types/constants/country-resource.constants'
import { LangLocale } from 'src/app/types/enum/lang-locale.enum';
import { AppSupportedCountry } from 'src/app/types/enum/app-supported-country.enum';
import { HttpHeaderKey } from 'src/app/types/enum/http-header-key.enum';
import { SessionItems } from 'src/app/types/enum/session-items.enum';

describe('RightNavMenuComponent', () => {
  let component: RightNavMenuComponent;
  let fixture: ComponentFixture<RightNavMenuComponent>;
  let store: MockStore<AppState>;
  let activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', ['navigateByUrl']);
  let eventStub = new BehaviorSubject<any>(null);
  let routerStub = {
    events: eventStub,
    navigateByUrl: jasmine.createSpy('navigateByUrl')
  }

  const initialState: AppState = {
    shippingApp: {
      userAccount: null,
      shipmentDetails: null,
      customsDetails: null,
      senderDetails: null,
      recipientDetails: null,
      paymentDetails: null,
      shipmentConfirmation: null
    }
  };

  beforeEach(async(() => {
    const mockConfig = testConfig.config;

    class ConfigServiceStub {
      settings: any = mockConfig;
      getSettings(prop: string) {
        return this.settings[prop];
      }
      init() {
        this.settings = mockConfig;
      }
    }

    class LocalizationConfigServiceStub {
      getSelectedCountry() {
        return Observable.create((observer: Observer<any>) => {
          observer.next({
            status: "country",
            __proto__: Object
          });
        });
      }

      setLanguage(setLang: string) { }
    }

    TestBed.configureTestingModule({
      declarations: [RightNavMenuComponent],
      imports: [
        IonicModule.forRoot(),
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: false }),
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: LanguageLoader,
            deps: [HttpClient]
          }
        }),
      ],
      providers: [
        AuthenticationService,
        UrlSerializer,
        provideMockStore({ initialState }),
        { provide: ConfigService, useClass: ConfigServiceStub },
        { provide: Router, useValue: routerStub },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: LocalizationConfigService, useClass: LocalizationConfigServiceStub },
        BrowserService,
        TranslateService,
        AlertController
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RightNavMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  fit('should create', () => {
    expect(component).toBeTruthy();
  });

  fit('should get current url when your in messageCentre page', () => {
    eventStub.next(new NavigationEnd(1, '/message-centre', '/message-centre'));
    component.ngDoCheck();
    expect(component.currentUrl).toEqual('/message-centre');
  })

  fit('should set sessionStorage on click message centre', () => {
    component.currentUrl = '/shipping/sender-details';
    component.onClickMessageCentre();
    expect(sessionStorage.getItem(SessionItems.MESSAGECENTRE)).toEqual('true');
    expect(sessionStorage.getItem(SessionItems.PREVIOUSURL)).toEqual('/shipping/sender-details');
  });

  fit('should hide language button for English language country', () => {
    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'AU');
    component.checkLocale();
    expect(component.showLangToggle).toEqual(false);
  });

  fit('should show confirm popup on click logout.', fakeAsync(() => {
    spyOn(component, 'logoutAlertConfirm');
    fixture.detectChanges();
    component.logout();
    tick(200);
    flush(200);
    expect(component.logoutAlertConfirm).toHaveBeenCalled();
  }));

  fit('should navigate to login page on click Cofirm button on logout popup.', fakeAsync(() => {
    spyOn(component, 'clearSessionValues');
    spyOn(component, 'resetStoreValues');
    spyOn(component, 'updateLoggedInStatus');
    fixture.detectChanges();
    component.onConfirmClicked();
    tick(200);
    flush(200);
    expect(routerStub.navigateByUrl).toHaveBeenCalledWith('/login');
    expect(sessionStorage.getItem(SessionItems.ISLOGGEDIN)).toBe(null);
    expect(component.clearSessionValues).toHaveBeenCalled();
    expect(component.resetStoreValues).toHaveBeenCalled();
    expect(component.updateLoggedInStatus).toHaveBeenCalled();
  }));

  fit('should cleared session login values.', fakeAsync(() => {
    fixture.detectChanges();
    sessionStorage.setItem(SessionItems.ISLOGGEDIN, 'true');
    sessionStorage.setItem(HttpHeaderKey.TX_ID, 'AZSJDJEIKL12KSKI3009746');
    component.clearSessionValues();
    tick();

    expect(sessionStorage.getItem(SessionItems.ISLOGGEDIN)).toBe(null);
    expect(sessionStorage.getItem(HttpHeaderKey.TX_ID)).toBe(null);
  }));

  fit('should call create AlertController on click logout ', () => {
    spyOn(component.alertController, 'create');
    component.ngOnInit();
    component.logoutAlertConfirm();
    expect(component.alertController.create).toHaveBeenCalled();
  });

  fit('should be able to change fedEx Location links based on country and language.', () => {
    component.termsofUseUrlsData = countryResource.getTermsOfUseUrls();
    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'CN');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.ngDoCheck();
    expect(component.fedexLocationsLinkUrl).toEqual('https://local.fedex.com/en-cn/');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'CN');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'zh_cn');
    component.ngDoCheck();
    expect(component.fedexLocationsLinkUrl).toEqual('https://local.fedex.com/zh-cn/');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'AU');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.ngDoCheck();
    expect(component.fedexLocationsLinkUrl).toEqual('https://local.fedex.com/en-au/');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'HK');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.ngDoCheck();
    expect(component.fedexLocationsLinkUrl).toEqual('https://local.fedex.com/en-hk/');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'HK');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'zh_hk');
    component.ngDoCheck();
    expect(component.fedexLocationsLinkUrl).toEqual('https://local.fedex.com/zh-hk/');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'ID');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.ngDoCheck();
    expect(component.fedexLocationsLinkUrl).toEqual('https://local.fedex.com/en-id/');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'ID');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'id_id');
    component.ngDoCheck();
    expect(component.fedexLocationsLinkUrl).toEqual('https://local.fedex.com/id-id/');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'JP');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.ngDoCheck();
    expect(component.fedexLocationsLinkUrl).toEqual('https://local.fedex.com/en-jp/');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'JP');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'ja_jp');
    component.ngDoCheck();
    expect(component.fedexLocationsLinkUrl).toEqual('https://local.fedex.com/ja-jp/');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'KR');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.ngDoCheck();
    expect(component.fedexLocationsLinkUrl).toEqual('https://local.fedex.com/en-kr/');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'KR');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'ko_kr');
    component.ngDoCheck();
    expect(component.fedexLocationsLinkUrl).toEqual('https://local.fedex.com/ko-kr/');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'MY');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.ngDoCheck();
    expect(component.fedexLocationsLinkUrl).toEqual('https://local.fedex.com/en-my/');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'NZ');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.ngDoCheck();
    expect(component.fedexLocationsLinkUrl).toEqual('https://local.fedex.com/en-nz/');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'PH');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.ngDoCheck();
    expect(component.fedexLocationsLinkUrl).toEqual('https://local.fedex.com/en-ph/');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'SG');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.ngDoCheck();
    expect(component.fedexLocationsLinkUrl).toEqual('https://local.fedex.com/en-sg/');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'TH');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.ngDoCheck();
    expect(component.fedexLocationsLinkUrl).toEqual('https://local.fedex.com/en-th/');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'TH');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'th_th');
    component.ngDoCheck();
    expect(component.fedexLocationsLinkUrl).toEqual('https://local.fedex.com/th-th/');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'TW');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.ngDoCheck();
    expect(component.fedexLocationsLinkUrl).toEqual('https://local.fedex.com/en-tw/');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'TW');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'zh_tw');
    component.ngDoCheck();
    expect(component.fedexLocationsLinkUrl).toEqual('https://local.fedex.com/zh-tw/');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'VN');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.ngDoCheck();
    expect(component.fedexLocationsLinkUrl).toEqual('https://local.fedex.com/en-vn/');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'VN');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'vi_vn');
    component.ngDoCheck();
    expect(component.fedexLocationsLinkUrl).toEqual('https://local.fedex.com/vi-vn/');
  });

  fit('should be able to change Local Language disply test based on country.', () => {
    component.localLangDisplyText = countryResource.languageDisplayText();
    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'CN');
    component.ngDoCheck();
    expect(component.languageDisplayText).toEqual('简中');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'HK');
    component.ngDoCheck();
    expect(component.languageDisplayText).toEqual('繁中');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'ID');
    component.ngDoCheck();
    expect(component.languageDisplayText).toEqual('Bahasa');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'JP');
    component.ngDoCheck();
    expect(component.languageDisplayText).toEqual('日本語');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'KR');
    component.ngDoCheck();
    expect(component.languageDisplayText).toEqual('한국어');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'TH');
    component.ngDoCheck();
    expect(component.languageDisplayText).toEqual('ไทย');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'TW');
    component.ngDoCheck();
    expect(component.languageDisplayText).toEqual('繁中');
  });

  fit('should be able to switch to Local Language when you click on Local Language Button.', () => {
    let event = {
      toElement: {
        childNodes: [
          {
            data: "简中"
          }
        ]
      }
    }
    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'CN');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.onClickLocalLanguage();
    expect(sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE)).toEqual('zh_cn');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'HK');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.onClickLocalLanguage();
    expect(sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE)).toEqual('zh_hk');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'ID');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.onClickLocalLanguage();
    expect(sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE)).toEqual('id_id');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'JP');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.onClickLocalLanguage();
    expect(sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE)).toEqual('ja_jp');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'KR');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.onClickLocalLanguage();
    expect(sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE)).toEqual('ko_kr');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'TH');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.onClickLocalLanguage(); (event);
    expect(sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE)).toEqual('th_th');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'TW');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.onClickLocalLanguage();
    expect(sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE)).toEqual('zh_tw');
  });

  fit('should be able to switch to English when you click on EN Button.', () => {
    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'CN');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'zh_cn');
    component.onClickEnglishLanguage();
    expect(sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE)).toEqual('en');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'HK');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'zh_hk');
    component.onClickEnglishLanguage();
    expect(sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE)).toEqual('en');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'ID');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'id_id');
    component.onClickEnglishLanguage();
    expect(sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE)).toEqual('en');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'JP');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'ja_jp');
    component.onClickEnglishLanguage();
    expect(sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE)).toEqual('en');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'KR');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'ko_kr');
    component.onClickEnglishLanguage();
    expect(sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE)).toEqual('en');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'TH');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'th_th');
    component.onClickEnglishLanguage();
    expect(sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE)).toEqual('en');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'TW');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'zh_tw');
    component.onClickEnglishLanguage();
    expect(sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE)).toEqual('en');
  });

  fit('should show confirm popup on new shipment click.', fakeAsync(() => {
    component.ngOnInit();
    spyOn(component, 'presentAlertConfirm');
    fixture.detectChanges();
    component.onClickNewShipment();
    tick(200);
    flush(200);
    expect(component.presentAlertConfirm).toHaveBeenCalled();
  }));

  fit('should show confirm popup on new shipment click with alert box.', fakeAsync(() => {
    spyOn(component.alertController, 'create');
    component.ngOnInit();
    component.presentAlertConfirm();
    tick(200);
    flush(200);
    expect(component.alertController.create).toHaveBeenCalled();
  }));

  fit('should show confirm popup on new shipment click.', () => {
    component.ngOnInit();
    fixture.detectChanges();
    component.onClickConfirmedNewShipment();
    expect(sessionStorage.getItem(SessionItems.NEWSHIPMENT)).toBe('true');
    expect(routerStub.navigateByUrl).toHaveBeenCalledWith('/shipping/shipment-details');
  });

  fit('should show confirm popup on new shipment click when user access otp screen from billing option changed.', () => {
    component.ngOnInit();
    sessionStorage.setItem(SessionItems.ISFROMSUMMARY, 'true');
    sessionStorage.setItem(SessionItems.MOBILENUMBER, '12345678');
    fixture.detectChanges();
    component.onClickConfirmedNewShipment();
    expect(sessionStorage.getItem(SessionItems.ISFROMSUMMARY)).toBe(null);
    expect(sessionStorage.getItem(SessionItems.MOBILENUMBER)).toBe(null);
    expect(sessionStorage.getItem(SessionItems.NEWSHIPMENT)).toBe('true');
    expect(routerStub.navigateByUrl).toHaveBeenCalledWith('/shipping/shipment-details');
  });

  fit('should be able to change Terms of use links based on country and language.', () => {
    component.termsofUseUrlsData = countryResource.getTermsOfUseUrls();
    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'CN');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.ngDoCheck();
    expect(component.termsofUseLinkUrl).toEqual('https://www.fedex.com/en-cn/campaign/fsmlite-terms-of-use.html');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'CN');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'zh_cn');
    component.ngDoCheck();
    expect(component.termsofUseLinkUrl).toEqual('https://www.fedex.com/en-cn/campaign/fsmlite-terms-of-use.html');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'AU');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.ngDoCheck();
    expect(component.termsofUseLinkUrl).toEqual('https://www.fedex.com/en-au/campaign/fsmlite-terms-of-use.html');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'HK');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.ngDoCheck();
    expect(component.termsofUseLinkUrl).toEqual('https://www.fedex.com/en-hk/campaign/fsmlite-terms-of-use.html');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'HK');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'zh_hk');
    component.ngDoCheck();
    expect(component.termsofUseLinkUrl).toEqual('https://www.fedex.com/en-hk/campaign/fsmlite-terms-of-use.html');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'ID');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.ngDoCheck();
    expect(component.termsofUseLinkUrl).toEqual('https://www.fedex.com/en-id/campaign/fsmlite-terms-of-use.html');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'ID');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'id_id');
    component.ngDoCheck();
    expect(component.termsofUseLinkUrl).toEqual('https://www.fedex.com/en-id/campaign/fsmlite-terms-of-use.html');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'JP');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.ngDoCheck();
    expect(component.termsofUseLinkUrl).toEqual('https://www.fedex.com/en-jp/campaign/fsmlite-terms-of-use.html');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'JP');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'ja_jp');
    component.ngDoCheck();
    expect(component.termsofUseLinkUrl).toEqual('https://www.fedex.com/en-jp/campaign/fsmlite-terms-of-use.html');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'KR');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.ngDoCheck();
    expect(component.termsofUseLinkUrl).toEqual('https://www.fedex.com/en-kr/campaign/fsmlite-terms-of-use.html');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'KR');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'ko_kr');
    component.ngDoCheck();
    expect(component.termsofUseLinkUrl).toEqual('https://www.fedex.com/en-kr/campaign/fsmlite-terms-of-use.html');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'MY');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.ngDoCheck();
    expect(component.termsofUseLinkUrl).toEqual('https://www.fedex.com/en-my/campaign/fsmlite-terms-of-use.html');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'NZ');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.ngDoCheck();
    expect(component.termsofUseLinkUrl).toEqual('https://www.fedex.com/en-nz/campaign/fsmlite-terms-of-use.html');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'PH');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.ngDoCheck();
    expect(component.termsofUseLinkUrl).toEqual('https://www.fedex.com/en-ph/campaign/fsmlite-terms-of-use.html');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'SG');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.ngDoCheck();
    expect(component.termsofUseLinkUrl).toEqual('https://www.fedex.com/en-sg/campaign/fsmlite-terms-of-use.html');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'TH');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.ngDoCheck();
    expect(component.termsofUseLinkUrl).toEqual('https://www.fedex.com/en-th/campaign/fsmlite-terms-of-use.html');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'TH');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'th_th');
    component.ngDoCheck();
    expect(component.termsofUseLinkUrl).toEqual('https://www.fedex.com/en-th/campaign/fsmlite-terms-of-use.html');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'TW');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.ngDoCheck();
    expect(component.termsofUseLinkUrl).toEqual('https://www.fedex.com/en-tw/campaign/fsmlite-terms-of-use.html');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'TW');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'zh_tw');
    component.ngDoCheck();
    expect(component.termsofUseLinkUrl).toEqual('https://www.fedex.com/en-tw/campaign/fsmlite-terms-of-use.html');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'VN');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.ngDoCheck();
    expect(component.termsofUseLinkUrl).toEqual('https://www.fedex.com/en-vn/campaign/fsmlite-terms-of-use.html');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'VN');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'vi_vn');
    component.ngDoCheck();
    expect(component.termsofUseLinkUrl).toEqual('https://www.fedex.com/en-vn/campaign/fsmlite-terms-of-use.html');
  });

  fit('should check LOcale is English or not', () => {
    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'HK');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'zh_hk');
    expect(component.isLocaleEnglish).toBeFalse;
  });

  fit('should check LOcale is English or not', () => {
    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'HK');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    expect(component.isLocaleEnglish).toBeTrue;
  });

  fit('should call setCountryLocale', () => {
    fixture.detectChanges();
    spyOn(component, 'setCountryLocale');
    component.languageOptions();
    expect(component.setCountryLocale).toHaveBeenCalled();
  });

  fit('should set the CountryLocale Values based on selected country', () => {
    fixture.detectChanges();
    component.setCountryLocale(AppSupportedCountry.HK_COUNTRYCODE);
    expect(component.enLangVal).toEqual(LangLocale.EN);
    expect(component.localLangVal).toEqual(LangLocale.ZH_HK);
    expect(component.langLabel).toEqual('Traditional Chinese')
  });

  fit('should checkLocale based on  country', () => {
    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'HK');
    component.selectedLanguage = LangLocale.ZH_HK
    component.checkLocale();
    expect(component.isLocaleEnglish).toEqual(false);
  });

  fit('should checkLocale based on IsLocaleEnglish  country', () => {
    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'HK');
    component.selectedLanguage = LangLocale.EN
    component.checkLocale();
    expect(component.isLocaleEnglish).toEqual(true);
  });

  fit('should get selected country', () => {
    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'HK');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    expect(component.countryOptions).toBeFalse;
  });

  fit('should open contact us url in new window.', () => {
    spyOn(window, 'open').and.callThrough();
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en_cn');
    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'CN');
    fixture.detectChanges();
    component.onClickContactUs();
    expect(window.open).toHaveBeenCalledWith('https://www.fedex.com/en-cn/customer-support.html', '_blank');
  });

  fit('should open contact us url in new window.', () => {
    spyOn(window, 'open').and.callThrough();
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'zh_cn');
    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'CN');
    fixture.detectChanges();
    component.onClickContactUs();
    expect(window.open).toHaveBeenCalledWith('https://www.fedex.com/zh-cn/customer-support.html', '_blank');
  });

  fit('should get login status', () => {
    component.browserService.isbrowser = true;
    sessionStorage.setItem(SessionItems.ISLOGGEDIN, 'true');
    component.checkLoginStatus();
    expect(component.loggedIn).toBeTrue;
  });

  fit('should set the sessionStorage for previousUrl when clicks on MyShipments', () => {
    fixture.detectChanges();
    component.currentUrl = '/shipping/sender-details';
    component.onClickMyShipments();
    expect(sessionStorage.getItem(SessionItems.PREVIOUSURL)).toEqual('/shipping/sender-details');
  });
});