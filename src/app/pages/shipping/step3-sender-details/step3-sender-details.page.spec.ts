import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { AppState } from 'src/app/+store/app.state';
import { BrowserService } from 'src/app/core/providers/browser.service';
import { Step3SenderDetailsPage } from './step3-sender-details.page';
import * as fromShippingSelector from '../../shipping/+store/shipping.selectors';
import { APIMCountryService } from 'src/app/core/providers/apim';
import { Observable, Observer } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { LanguageLoader } from 'src/app/app.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getCountryDialingPrefixesBegin } from '../+store/shipping.actions';
import { By } from '@angular/platform-browser';
import { CountryDialingPrefixesResponse } from 'src/app/interfaces/api-service/response/country-dialing-prefixes-response.interface';
import { CountryPrefixType } from 'src/app/interfaces/api-service/response/country-prefix-type.interface';
import { ISender } from 'src/app/interfaces/shipping-app/sender';
import { AccountType } from 'src/app/types/enum/account-type.enum';
import { ConfigService } from '@ngx-config/core';
import * as testConfig from '../../../../assets/config/mockConfigForTest';

fdescribe('Step3SenderDetailsPage', () => {
  let component: Step3SenderDetailsPage;
  let fixture: ComponentFixture<Step3SenderDetailsPage>;
  let store: MockStore<AppState>;
  const mockConfig = testConfig.config;

  const storeSpy = jasmine.createSpyObj('store', ['dispatch', 'select']);
  const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl', 'navigate', 'then']);
  const mockUserAccountDetails = {
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
    lastLogin: new Date()
  };

  class configServiceStub {
    settings: any = mockConfig;
    getSettings(prop: string) {
      return this.settings[prop];
    }
    init() {
      this.settings = mockConfig;
    }
  }

  const dailingCodesMock = {
    transactionId: '23d9a85f-0dca-4092-8299-c83ab410df2c',
    output: {
      countryPrefix: [
        {
          countryCode: 'PR',
          countryDialingCode: '1'
        },
        {
          countryCode: 'PS',
          countryDialingCode: '970'
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

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        Step3SenderDetailsPage
      ],
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        IonicModule.forRoot(),
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
        provideMockStore({ initialState }),
        { provide: Router, useValue: routerSpy },
        { provide: APIMCountryService, useClass: APIMCountryServiceStub },
        { provide: ConfigService, useClass: configServiceStub }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(Step3SenderDetailsPage);
    store = TestBed.inject(MockStore);
    component = fixture.componentInstance;
    fixture.detectChanges();
    spyOn(store, 'dispatch').and.callFake(() => { });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Step3SenderDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  fit('should create', () => {
    expect(component).toBeTruthy();
  });

  fit('should initialize/populate sender form on page load', () => {
    storeSpy.select.and.callFake(fromShippingSelector.selectSenderDetails);
    component.ngOnInit();
    // checking on required fields initially
    expect(component.senderForm.controls.addressLine1.value).toBe(initialState.shippingApp.senderDetails.address1);
    expect(component.senderForm.controls.contactName.value).toBe(initialState.shippingApp.senderDetails.contactName);
    expect(component.senderForm.controls.phoneNumber.value).toBe(initialState.shippingApp.senderDetails.phoneNumber);
    expect(component.senderForm.controls.email.value).toBe(initialState.shippingApp.senderDetails.emailAddress);
    // TODO: Add more controls to test here
  });

  fit('should test form validity', () => {
    const formControls = component.senderForm.controls;
    const address1Input = formControls.addressLine1;
    const contactNameInput = formControls.contactName;
    const phoneNumberInput = formControls.phoneNumber;
    const emailInput = formControls.email;

    address1Input.setValue('');
    contactNameInput.setValue('');
    phoneNumberInput.setValue('');
    emailInput.setValue('');
    expect(address1Input.errors.required).toBeTruthy();
    expect(contactNameInput.errors.required).toBeTruthy();
    expect(phoneNumberInput.errors.required).toBeTruthy();
    expect(emailInput.errors.required).toBeTruthy();
    expect(component.senderForm.valid).toBeFalsy();

    address1Input.setValue('TEST ADDRESS LINE 1');
    contactNameInput.setValue('TEST CONTACT NAME');
    phoneNumberInput.setValue('912345678');
    emailInput.setValue('est123@fedex.com');
    expect(component.senderForm.valid).toBeTruthy();
  });

  fit('should test sender data defaults populating', () => {
    fixture.detectChanges();
    spyOn(component, 'initializeSenderDetailsFromStore');
    component.initSenderDetails();
    expect(component.initializeSenderDetailsFromStore).toHaveBeenCalled();
    expect(component.currentCountryCode).toEqual(initialState.shippingApp.senderDetails.countryCode);
    expect(component.countryCityPostalDisplay).toEqual('Hong Kong,  NYC 111');
  });

  fit('should test getCountryCityPostalDisplay with blank details', () => {
    const blankData: ISender = {
      address1: '',
      address2: '',
      city: undefined,
      contactName: '',
      countryCode: '',
      countryName: undefined,
      postalCode: undefined,
      emailAddress: '',
      postalAware: false,
      stateAware: false,
      phoneNumber: '',
      saveContact: false
    };
    expect(component.getCountryCityPostalDisplay(blankData)).toBe('');
  });

  fit('getCountryDialingPrefixes should dispatch action getCountryDialingPrefixesBegin.', () => {
    component.ngOnInit();
    expect(store.dispatch).toHaveBeenCalledWith(getCountryDialingPrefixesBegin());
  });

  fit('Should set the dialingPrefixValue based on selected currentCountryCode.', () => {
    let countryDialingPrefixesResponseMock: CountryDialingPrefixesResponse;
    const countryPrefix: CountryPrefixType = {
      countryCode: 'PR',
      countryDialingCode: '1'
    };
    const countryPrefix2: CountryPrefixType = {
      countryCode: 'PS',
      countryDialingCode: '970'
    };
    countryDialingPrefixesResponseMock = {
      countryPrefix: [countryPrefix, countryPrefix2]
    };
    store.overrideSelector(fromShippingSelector.selectCountryDialingPrefix, countryDialingPrefixesResponseMock);
    fixture.detectChanges();
    component.initSenderDetails();
    component.currentCountryCode = 'PS';
    expect(component.dialingPrefix.length).toBeGreaterThan(0);
    expect(component.dialingPrefixValue).toEqual('970');
  });

  fit('should be able to validate the phone numbers min and max limit.', () => {
    component.senderForm.get('phoneNumber').setValue('1234');
    fixture.detectChanges();
    expect(component.senderForm.get('phoneNumber').valid).toBeFalse;

    component.senderForm.get('phoneNumber').setValue('123456789123456789');
    fixture.detectChanges();
    expect(component.senderForm.get('phoneNumber').valid).toBeFalse;

    component.senderForm.get('phoneNumber').setValue('123456');
    fixture.detectChanges();
    expect(component.senderForm.get('phoneNumber').valid).toBeTruthy;
  });

  fit('should be able to validate email address input.', () => {
    component.senderForm.get('email').setValue('test123');
    fixture.detectChanges();
    expect(component.senderForm.get('email').valid).toBeFalsy();

    component.senderForm.get('email').setValue('test123.gmail.com');
    fixture.detectChanges();
    expect(component.senderForm.get('email').valid).toBeFalsy();

    component.senderForm.get('email').setValue('test123@om');
    fixture.detectChanges();
    expect(component.senderForm.get('email').valid).toBeFalsy();

    component.senderForm.get('email').setValue('@om.com');
    fixture.detectChanges();
    expect(component.senderForm.get('email').valid).toBeFalsy();

    component.senderForm.get('email').setValue('a@runs@om.com');
    fixture.detectChanges();
    expect(component.senderForm.get('email').valid).toBeFalsy();

    component.senderForm.get('email').setValue('test123@fedex.com');
    fixture.detectChanges();
    expect(component.senderForm.get('email').valid).toBeTruthy();
  });

  fit('should be able to dispatch action and navigate to next page.', () => {
    component.senderForm.get('addressLine1').setValue('Test Address');
    component.senderForm.get('contactName').setValue('Test Contact Name');
    component.senderForm.get('phoneNumber').setValue('12346789');
    component.senderForm.get('email').setValue('TestCom@st.com');

    fixture.detectChanges();
    component.onSubmit();
    expect(component.senderForm.valid).toBeTruthy;
    expect(store.dispatch).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/', 'shipping', 'recipient-details']);
  });

  fit('should test form invalidity', () => {
    // required address1
    component.senderForm.get('addressLine1').setValue('');
    component.senderForm.get('contactName').setValue('Test Contact Name');
    component.senderForm.get('phoneNumber').setValue('1237878678');
    component.senderForm.get('email').setValue('test@test.com');

    fixture.detectChanges();
    component.onSubmit();
    expect(component.senderForm.invalid).toBeTruthy();

    // required contactName
    component.senderForm.get('addressLine1').setValue('test');
    component.senderForm.get('contactName').setValue('');
    component.senderForm.get('phoneNumber').setValue('1237878678');
    component.senderForm.get('email').setValue('test@test.com');

    fixture.detectChanges();
    component.onSubmit();
    expect(component.senderForm.invalid).toBeTruthy();

    // required phoneNumber
    component.senderForm.get('addressLine1').setValue('test');
    component.senderForm.get('contactName').setValue('test contact name');
    component.senderForm.get('phoneNumber').setValue('');
    component.senderForm.get('email').setValue('test@test.com');

    fixture.detectChanges();
    component.onSubmit();
    expect(component.senderForm.invalid).toBeTruthy();

    // required email
    component.senderForm.get('addressLine1').setValue('test');
    component.senderForm.get('contactName').setValue('test contact name');
    component.senderForm.get('phoneNumber').setValue('1237878678');
    component.senderForm.get('email').setValue('');

    fixture.detectChanges();
    component.onSubmit();
    expect(component.senderForm.invalid).toBeTruthy();
  });

  fit('should be able to test phoneNumber length limit', () => {
    const ionicInputEl = fixture.debugElement.query(By.css('[formControlName="phoneNumber"]')).nativeElement;

    // valid phoneNumber length
    ionicInputEl.value = '1234567890';
    component.limitLength(ionicInputEl, 10);
    fixture.detectChanges();
    expect(component.isPhoneNumberValid).toBeTruthy();

    // invalid phoneNumber length
    ionicInputEl.value = '14';
    component.limitLength(ionicInputEl, 10);
    component.senderForm.get('addressLine1').setValue('test');
    component.senderForm.get('contactName').setValue('test contact name');
    component.senderForm.get('email').setValue('test@test.com');
    fixture.detectChanges();
    component.onSubmit();
    expect(component.senderForm.invalid).toBeFalsy();
    expect(component.isPhoneNumberValid).toBeFalsy();

    // sliced phoneNumber length, over the max limit
    ionicInputEl.value = '12345678901234';
    component.limitLength(ionicInputEl, 10);
    fixture.detectChanges();
    expect(ionicInputEl.value).toBe('1234567890');
  });

  fit('should navigate to summary page after updating page details and clicked update button.', () => {
    component.editSenderPageDetails = true;
    component.senderForm.get('addressLine1').setValue('Test Address');
    component.senderForm.get('contactName').setValue('Test Contact Name');
    component.senderForm.get('phoneNumber').setValue('12346789');
    component.senderForm.get('email').setValue('TestCom@st.com');
    fixture.detectChanges();
    component.onSubmit();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/', 'shipping', 'summary']);
  });

  fit('should navigate to summary page after clicking cancel without updating page details.', () => {
    fixture.detectChanges();
    component.cancelEditSenderPageDetails();
    expect(component.editSenderPageDetails).toEqual(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/', 'shipping', 'summary']);
  });

  fit('should show UPDATE, CANCEL buttons and keep current state values to be use on cancel click.', fakeAsync(() => {
    component.addListenerForEditFromSummary();
    fixture.detectChanges();
    window.dispatchEvent(new Event('editSenderDetails'));
    tick(500);
    expect(component.editSenderPageDetails).toEqual(true);
  }));

  fit('should get user account details.', fakeAsync(() => {
    store.overrideSelector(fromShippingSelector.selectUserLoginDetails, mockUserAccountDetails);
    component.getUserAccountDetails();
    fixture.detectChanges();
    tick();
    expect(component.userId).toEqual('123456');
  }));

  fit('should be call postUpdateSenderAddressDetails()', () => {
    store.overrideSelector(fromShippingSelector.selectUserLoginDetails, mockUserAccountDetails);
    component.senderForm.get('addressLine1').setValue('Test Address');
    component.senderForm.get('contactName').setValue('Test Contact Name');
    component.senderForm.get('phoneNumber').setValue('12346789');
    component.senderForm.get('email').setValue('TestCom@st.com');
    component.getUserAccountDetails();
    spyOn(component, 'postUpdateSenderAddressDetails');
    fixture.detectChanges();
    component.onSubmit();
    expect(component.senderForm.valid).toBeTruthy;
    expect(store.dispatch).toHaveBeenCalled();
    expect(component.postUpdateSenderAddressDetails).toHaveBeenCalled();
  });

  fit('should dispatch action postSenderAddressDetailsBegin', () => {
    store.overrideSelector(fromShippingSelector.selectUserLoginDetails, mockUserAccountDetails);
    component.senderForm.get('addressLine1').setValue('Test Address');
    component.senderForm.get('contactName').setValue('Test Contact Name');
    component.senderForm.get('phoneNumber').setValue('12346789');
    component.senderForm.get('email').setValue('TestCom@st.com');
    spyOn(component, 'navigateToNextPage');
    component.getUserAccountDetails();
    fixture.detectChanges();
    component.postUpdateSenderAddressDetails();

    expect(store.dispatch).toHaveBeenCalled();
    expect(component.navigateToNextPage).toHaveBeenCalled();
  });

  fit('should dispatch action postSenderAddressDetailsBegin', () => {
    store.overrideSelector(fromShippingSelector.selectUserLoginDetails, mockUserAccountDetails);
    component.senderForm.get('addressLine1').setValue('Test Address');
    component.senderForm.get('contactName').setValue('Test Contact Name');
    component.senderForm.get('phoneNumber').setValue('12346789');
    component.senderForm.get('email').setValue('TestCom@st.com');
    component.senderDetails.partyId = '12345';
    spyOn(component, 'checkNavigationToPage');
    fixture.detectChanges();
    component.postUpdateSenderAddressDetails();

    expect(store.dispatch).toHaveBeenCalled();
    expect(component.checkNavigationToPage).toHaveBeenCalled();
  });

  fit('should call navigateToNextPage from checkNavigationToPage', () => {
    spyOn(component, 'navigateToNextPage');
    component.checkNavigationToPage();
    expect(component.navigateToNextPage).toHaveBeenCalled();
  });

  fit('should navigate to next page.', () => {
    component.navigateToNextPage();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/', 'shipping', 'recipient-details']);
  });

  fit('should required taxid field when sender country is ID.', () => {
    initialState.shippingApp.senderDetails.countryCode = 'ID';
    spyOn(component,'conditionallyRequiredValidator');
    component.ngOnInit();
    expect(component.conditionallyRequiredValidator).toHaveBeenCalled();
  });

  fit('should required taxid field when sender country is ID.', () => {
    initialState.shippingApp.senderDetails.countryCode = 'ID';    
    component.ngOnInit();
    component.senderForm.controls.taxId.markAsTouched();
    component.onSubmit();
    expect(component.senderForm.valid).toBeFalsy();
  });

  fit('should throw error when taxid field has value less than 15 digits and sender country is ID.', () => {
    initialState.shippingApp.senderDetails.countryCode = 'ID';    
    component.ngOnInit();
    component.senderForm.controls.taxId.setValue(123456);
    component.onSubmit();
    expect(component.senderForm.valid).toBeFalsy();
  });

  fit('should throw error when taxid field has value less than 15 digits and sender country is ID.', () => {
    initialState.shippingApp.senderDetails.countryCode = 'ID';    
    component.ngOnInit();
    component.senderForm.get('addressLine1').setValue('Test Address');
    component.senderForm.get('contactName').setValue('Test Contact Name');
    component.senderForm.get('phoneNumber').setValue('12346789');
    component.senderForm.get('email').setValue('TestCom@st.com');
    component.senderForm.get('taxId').setValue(123456789123456);
    fixture.detectChanges();
    
    component.onSubmit();
    expect(component.senderForm.valid).toBeTruthy();
  });

});
