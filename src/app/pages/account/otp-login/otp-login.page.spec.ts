import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { OtpLoginPage } from './otp-login.page';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule, IonInput } from '@ionic/angular';
import { BrowserService } from 'src/app/core/providers/browser.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { LanguageLoader } from 'src/app/app.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Observable, Observer } from 'rxjs';
import { AppState } from 'src/app/+store/app.state';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { APIMCountryService } from 'src/app/core/providers/apim';
import * as fromShippingSelector from '../../shipping/+store/shipping.selectors';
import { Router } from '@angular/router';
import { ConfigService } from '@ngx-config/core';
import { P4eOtpService } from 'src/app/core/providers/local/p4e-otp.service';
import { CountryPrefixType } from 'src/app/interfaces/api-service/response/country-prefix-type.interface';
import { CountryDialingPrefixesResponse } from 'src/app/interfaces/api-service/response/country-dialing-prefixes-response.interface';
import { SessionItems } from 'src/app/types/enum/session-items.enum';

fdescribe('OtpLoginPage', () => {
  let component: OtpLoginPage;
  let fixture: ComponentFixture<OtpLoginPage>;
  let store: MockStore<AppState>;
  let mockStore: MockStore;
  const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl', 'navigate', 'then']);

  const mockOtpGenerateResponse = {
    txId: 'tgvNn1plq75wYfPkhNKJMZfcid8rJd9b',
    authType: 'SMS',
    otpPhoneDeliveryRes: {
      contact: '85298403275',
      sendStatus: 'SUCCESS',
      sendTime: '2021-03-15 11:17:33 GMT',
      otpExpiry: 90
    },
    otpEmailDeliveryRes: null,
    status: 'SUCCESS',
    message: 'OTP sent successfully'
  };

  const dailingCodesMock = {
    'transactionId': '23d9a85f-0dca-4092-8299-c83ab410df2c',
    'output': {
      'countryPrefix': [
        {
          'countryCode': 'PR',
          'countryDialingCode': '1'
        },
        {
          'countryCode': 'PS',
          'countryDialingCode': '970'
        }
      ]
    }
  };
  const initialState: AppState = {
    shippingApp: {
      userAccount: null,
      shipmentDetails: null,
      customsDetails: null,
      senderDetails: {
        address1: 'TEST DO NOT DISPATCH',
        address2: '',
        city: 'NYC',
        contactName: 'Derrick Chan',
        countryCode: 'PS',
        countryName: 'Hong Kong',
        postalCode: '111',
        emailAddress: 'derrick.chan@fedex.com',
        postalAware: false,
        stateAware: false,
        phoneNumber: '912365478',
        saveContact: false
      },
      recipientDetails: null,
      paymentDetails: null,
      shipmentConfirmation: null
    }
  };

  class APIMCountryServiceStub {
    getCountryListByType() {
      return Observable.create((observer: Observer<any>) => {
        observer.next(dailingCodesMock);
      });
    }
  }

  class P4eOtpServiceStub {
    generateOtp() {
      return Observable.create((observer: Observer<any>) => {
        observer.next(mockOtpGenerateResponse);
      });
    }
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OtpLoginPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        FormsModule,
        IonicModule,
        RouterTestingModule,
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: LanguageLoader,
            deps: [HttpClient]
          }
        }),
        HttpClientTestingModule
      ],
      providers: [
        BrowserService,
        FormBuilder,
        ConfigService,
        provideMockStore({ initialState }),
        { provide: APIMCountryService, useClass: APIMCountryServiceStub },
        { provide: P4eOtpService, useClass: P4eOtpServiceStub },
        { provide: Router, useValue: routerSpy },
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OtpLoginPage);
    store = TestBed.inject(MockStore);
    component = fixture.componentInstance;
    fixture.detectChanges();
    spyOn(store, 'dispatch').and.callFake(() => { });
  });

  beforeAll(() => {
    let store = {};
    const mockLocalStorage = {
      getItem: (key: string): string => {
        return key in store ? store[key] : null;
      },
      setItem: (key: string, value: string) => {
        store[key] = `${value}​​​​​​​​`;
      }
    };
    spyOn(localStorage, 'getItem')
      .and.callFake(mockLocalStorage.getItem);
    spyOn(localStorage, 'setItem')
      .and.callFake(mockLocalStorage.setItem);
  })



  afterEach(() => {
    sessionStorage.removeItem(SessionItems.MOBILENUMBER);
    sessionStorage.removeItem(SessionItems.ISFROMSUMMARY);
    localStorage.removeItem('suspendedNumber');
    fixture.destroy();
  });

  fit('should create', () => {
    expect(component).toBeTruthy();
  });

  fit('should invalidate form when mobile number is empty', () => {
    component.otpLoginForm.controls.countryCode.setValue('+86');
    component.otpLoginForm.controls.mobileNumber.setValue('');
    expect(component.otpLoginForm.controls.mobileNumber.value).toEqual('');
    expect(component.otpLoginForm.invalid).toBe(true);
  });

  fit('should validate form when mobile number is NOT empty', () => {
    component.otpLoginForm.controls.countryCode.setValue('+86');
    component.otpLoginForm.controls.mobileNumber.patchValue('123456789');
    expect(component.otpLoginForm.controls.mobileNumber.value).toEqual('123456789');
    expect(component.otpLoginForm.hasError('required')).toBe(false);
  });

  fit('Should set the dialingPrefixValue based on currentCountryCode.', fakeAsync(() => {
    let countryDialingPrefixesResponseMock: CountryDialingPrefixesResponse;
    const countryPrefix: CountryPrefixType = {
      countryCode: 'PR',
      countryDialingCode: '1'
    };
    const countryPrefix1: CountryPrefixType = {
      countryCode: 'PS',
      countryDialingCode: '970'
    };
    countryDialingPrefixesResponseMock = {
      countryPrefix: [countryPrefix, countryPrefix1]
    };
    store.overrideSelector(fromShippingSelector.selectCountryDialingPrefix, countryDialingPrefixesResponseMock);
    fixture.detectChanges();
    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'PS');
    component.ngOnInit();
    tick();
    expect(component.countryCode.value).toEqual('+970');
  }));

  fit('should validate form when mobile number length is less than 5.', () => {
    component.phoneNumberMin = 5;
    component.otpLoginForm.controls.countryCode.setValue('+86');
    component.otpLoginForm.controls.mobileNumber.patchValue('1234');
    component.mobileNumberInput.value = '1234';
    component.limitLength(component.mobileNumberInput);
    expect(component.otpLoginForm.controls.mobileNumber.value).toEqual('1234');
    expect(component.isPhoneNumberValid).toBe(false);
  });

  fit('should valid form when mobile number length is more than 5 and less than 15.', () => {
    component.phoneNumberMin = 5;
    component.mobileNumberInput.value = '123456789';
    component.otpLoginForm.controls.countryCode.setValue('+86');
    component.otpLoginForm.controls.mobileNumber.patchValue('123456789');
    component.limitLength(component.mobileNumberInput);
    expect(component.otpLoginForm.controls.mobileNumber.value).toEqual('123456789');
    expect(component.isPhoneNumberValid).toBe(true);
  });

  fit('should valid form when mobile number length is more than 15.', () => {
    component.phoneNumberMin = 5;
    component.mobileNumberInput.value = '12345678901234567890';
    component.otpLoginForm.controls.countryCode.setValue('+86');
    component.otpLoginForm.controls.mobileNumber.patchValue('12345678901234567890');
    component.limitLength(component.mobileNumberInput);
    expect(component.mobileNumberInput.value).toEqual('123456789012345');
    expect(component.isPhoneNumberValid).toBe(true);
  });

  fit('should navigate to verification page, when form is valid.', () => {
    component.otpLoginForm.controls.countryCode.setValue('+86');
    component.otpLoginForm.controls.mobileNumber.patchValue('123456789');
    component.validateMobile();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/account/otp-verification');
  });

  fit('should not to navigate to verification page, when form is invalid.', () => {
    component.otpLoginForm.controls.countryCode.setValue('');
    component.otpLoginForm.controls.mobileNumber.patchValue('');
    component.validateMobile();
    expect(component.otpLoginForm.valid).toBeFalsy;
  });

  fit('should display error message , when mobile number is suspended for 24hrs', () => {
    component.otpLoginForm.controls.countryCode.setValue('+86');
    component.otpLoginForm.controls.mobileNumber.patchValue('9123456789');
    component.browserService.isbrowser = false;
    spyOn(component, 'getMobileNumberWithExpiry');
    localStorage.setItem('suspendedNumber', JSON.stringify({
      mobileNumber: 9123456789,
      suspendedUntil: 2716750884973
    }));
    component.validateMobile();
    expect(component.getMobileNumberWithExpiry).toHaveBeenCalled();
  });

  fit('should have title verification when navigated from summary.', () => {
    sessionStorage.setItem(SessionItems.ISFROMSUMMARY, 'true');
    component.browserService.isbrowser = false;
    component.ngOnInit();
    expect(component.backNavigation).toEqual('/shipping/summary');
    expect(component.isFromSummary).toBeTrue;
  });

  fit('should hide error message', ()=>{
    component.hideErrorMessage();
    expect(component.showErrorMessage).toEqual(false);
  })
});
