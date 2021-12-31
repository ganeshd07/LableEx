import { HttpClient } from '@angular/common/http';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageLoader } from 'src/app/app.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TermsAndConditionsKrPage } from './terms-and-conditions-kr.page';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HtmlSanitizer } from 'src/app/providers/directives/html-sanitizer.pipe';
import { RouterTestingModule } from '@angular/router/testing';
import { SessionItems } from 'src/app/types/enum/session-items.enum';
import { Router } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { AppState } from 'src/app/+store/app.state';
import { StoreModule } from '@ngrx/store';
import { AccountType } from 'src/app/types/enum/account-type.enum';
import { ConfigService } from '@ngx-config/core';
import * as testConfig from 'src/assets/config/mockConfigForTest';
import { P4eOtpService } from 'src/app/core/providers/local/p4e-otp.service';
import { Observable, Observer } from 'rxjs';

describe('TermsAndConditionsKrPage', () => {
  let component: TermsAndConditionsKrPage;
  let fixture: ComponentFixture<TermsAndConditionsKrPage>;
  const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl', 'navigate', 'then']);
  let store: MockStore<AppState>;
  const storeSpy = jasmine.createSpyObj('store', ['dispatch', 'select']);
  let mockUserIdResponse;

  const mockConfig = testConfig.config;
  beforeEach(async(() => {
    class ConfigServiceStub {
      settings: any = mockConfig;
      getSettings(prop: string) {
        return this.settings[prop];
      }
      init() {
        this.settings = mockConfig;
      }
    }

    class P4eOtpServiceStub {
      getUserProfileDetails() {
        return Observable.create((observer: Observer<any>) => {
          observer.next(mockUserIdResponse);
        })
      }

      updateAcceptedTCFlag() {
        return Observable.create((observer: Observer<any>) => {
          observer.next({ Message: 'OK' });
        })
      }
    }

    const initialState: AppState = {
      shippingApp: {
        userAccount: {
          userId: '123456',
          userProfile: {
            output: {
              profile: {
                user: {
                  uid: '00g0091fpl'
                },
                contact: {
                  personName: 'contactName',
                  companyName: '',
                  phoneNumber: '',
                  emailAddress: '',
                  taxId: '123456'
                },
                address: {
                  streetLines: [],
                  city: 'AUCKLAND',
                  stateOrProvinceCode: '',
                  postalCode: 123456,
                  countryName: 'NEW ZEALAND',
                  countryCode: 'NZ',
                  residential: 'false'
                }
              }
            }
          },
          accountType: AccountType.OTP,
          accountProfile: '',
          isUserLoggedIn: true,
          lastLogin: new Date(),
          uidValue: "9736647577"
        },
        shipmentDetails: null,
        customsDetails: null,
        senderDetails: {
          countryCode: "HK",
          countryName: "",
          postalCode: "",
          city: "",
          postalAware: false,
          emailAddress: "",
          address1: "",
          address2: "",
          contactName: undefined,
          stateAware: false,
          phoneNumber: "9736647577",
          stateOrProvinceCode: undefined,
          companyName: undefined,
          taxId: undefined
        },
        recipientDetails: null,
        paymentDetails: null,
        shipmentConfirmation: null
      }
    };

    TestBed.configureTestingModule({
      declarations: [
        TermsAndConditionsKrPage,
        HtmlSanitizer
      ],
      imports: [
        IonicModule.forRoot(),
        HttpClientTestingModule,
        RouterTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: LanguageLoader,
            deps: [HttpClient]
          }
        })],
      providers: [
        TranslateService,
        FormBuilder,
        HtmlSanitizer,
        { provide: Router, useValue: routerSpy },
        provideMockStore({ initialState }),
        { provide: ConfigService, useClass: ConfigServiceStub },
        { provide: P4eOtpService, useClass: P4eOtpServiceStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TermsAndConditionsKrPage);
    store = TestBed.inject(MockStore);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  fit('should create', () => {
    expect(component).toBeTruthy();
  });

  fit('sholud check all checkBoxes under I consent to all below terms and conditions clicked', fakeAsync(() => {
    const event = { target: { checked: true } };
    component.onTnCCheckBoxChecked(event);
    spyOn(component, 'enableAgreeButton');
    expect(component.isTnCChecked).toBe(true);
    tick();
    expect(component.enableAgreeButton).toHaveBeenCalled();
  }));

  fit('sholud uncheck all checkBoxes under I consent to all below terms and conditions unchecked', fakeAsync(() => {
    const event = { target: { checked: false } };
    component.onTnCCheckBoxChecked(event);
    spyOn(component, 'enableAgreeButton');
    expect(component.isTnCChecked).toBe(false);
    tick();
    expect(component.enableAgreeButton).toHaveBeenCalled();
  }));

  fit('sholud check all checkBoxes under I consent to all below agreements clicked', fakeAsync(() => {
    const event = { target: { checked: true } };
    component.onAgreementCheckBoxChecked(event);
    spyOn(component, 'enableAgreeButton');
    expect(component.isAgreementChecked).toBe(true);
    tick();
    expect(component.enableAgreeButton).toHaveBeenCalled();
  }));

  fit('sholud uncheck all checkBoxes under I consent to all below agreements unchecked', fakeAsync(() => {
    const event = { target: { checked: false } };
    component.onAgreementCheckBoxChecked(event);
    spyOn(component, 'enableAgreeButton');
    expect(component.isAgreementChecked).toBe(false);
    tick();
    expect(component.enableAgreeButton).toHaveBeenCalled();
  }));

  fit('should enable Agree Button when checked all the required checkboxes', () => {
    component.termsAndConditionsForm.get('requiredcheckBoxOne').setValue(true);
    component.termsAndConditionsForm.get('requiredcheckBoxTwo').setValue(true);
    component.termsAndConditionsForm.get('requiredcheckBoxThree').setValue(true);
    component.termsAndConditionsForm.get('requiredcheckBoxFour').setValue(true);
    component.termsAndConditionsForm.get('requiredcheckBoxFive').setValue(true);
    component.termsAndConditionsForm.get('requiredcheckBoxSix').setValue(true);
    component.enableAgreeButton();
    expect(component.disableAgreeButton).toBe(false);
  });

  fit('should disable Agree Button when Unchecked any one of the required checkboxes', () => {
    component.termsAndConditionsForm.get('requiredcheckBoxOne').setValue(true);
    component.termsAndConditionsForm.get('requiredcheckBoxTwo').setValue(true);
    component.termsAndConditionsForm.get('requiredcheckBoxThree').setValue(true);
    component.termsAndConditionsForm.get('requiredcheckBoxFour').setValue(true);
    component.termsAndConditionsForm.get('requiredcheckBoxFive').setValue(true);
    component.termsAndConditionsForm.get('requiredcheckBoxSix').setValue(false);
    component.enableAgreeButton();
    expect(component.disableAgreeButton).toBe(true);
  });

  fit('should translate link on each checkbox link for EN', () => {
    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'KR');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');

    component.ngDoCheck();
    expect(component.checkBoxTwoLink).toBe('https://www.fedex.com/en-kr/open-account/consent/personal-info.html');
    expect(component.checkBoxThreeLink).toBe('https://www.fedex.com/en-kr/open-account/consent/personal-info-transfer.html');
  });

  fit('should translate link on each checkbox link for KR', () => {
    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'KR');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'ko_kr');

    component.ngDoCheck();
    expect(component.checkBoxTwoLink).toBe('https://www.fedex.com/ko-kr/open-account/consent/personal-info.html');
    expect(component.checkBoxThreeLink).toBe('https://www.fedex.com/ko-kr/open-account/consent/personal-info-transfer.html');
  });

  fit('should naviagte to shipment details after accepting terms and condition', () => {
    component.onClickAgreeTermsAndCondition();
    expect(component.router.navigate).toHaveBeenCalledWith(['/shipping/shipment-details']);
  });

  fit('should naviagte to shipment details after accepting terms and condition for logged in user', () => {
    spyOn(component.p4eOtpService, 'updateAcceptedTCFlag');
    sessionStorage.setItem(SessionItems.ISLOGGEDIN, 'true');
    component.onClickAgreeTermsAndCondition();
    expect(component.router.navigate).toHaveBeenCalledWith(['/shipping/shipment-details']);
  });
});