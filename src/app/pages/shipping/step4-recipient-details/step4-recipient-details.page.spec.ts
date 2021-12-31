import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { AppState } from 'src/app/+store/app.state';
import { Step4RecipientDetailsPage } from './step4-recipient-details.page';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { LanguageLoader } from 'src/app/app.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { APIMCountryService } from 'src/app/core/providers/apim';
import * as testConfig from '../../../../assets/config/mockConfigForTest';
import { ConfigService } from '@ngx-config/core';
import { DatePipe } from '@angular/common';
import { Observable, Observer } from 'rxjs';
import { RestrictInputDirective } from './../../../providers/directives/restrict-input.directive';
import * as fromShippingSelector from '../../shipping/+store/shipping.selectors';
import { By } from '@angular/platform-browser';
import { PhoneNumberLimitTypes } from 'src/app/types/enum/phone-number-limit-type.enum';
import { CountryDialingPrefixesResponse } from 'src/app/interfaces/api-service/response/country-dialing-prefixes-response.interface';
import { CountryPrefixType } from 'src/app/interfaces/api-service/response/country-prefix-type.interface';
import { AccountType } from 'src/app/types/enum/account-type.enum';
import { ISender } from 'src/app/interfaces/shipping-app/sender';
import { AddressTypes } from 'src/app/types/enum/address-type.enum';
import { LocalAddressService } from 'src/app/core/providers/local/address.service';
import { IRecipient } from 'src/app/interfaces/shipping-app/recipient';

fdescribe('Step4RecipientDetailsPage', () => {
  let component: Step4RecipientDetailsPage;
  let fixture: ComponentFixture<Step4RecipientDetailsPage>;
  let store: MockStore<AppState>;
  const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl', 'navigate', 'then']);
  const postResponseList = {
    partyId: "100045"
  }
  const updateResponseList = {
    message: 'ok'
  }
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

  const recipientList = {
    address1: "abc",
    address2: undefined,
    address3: undefined,
    city: "KABUL CITY",
    companyName: "CBSS",
    contactName: "pratima",
    countryCode: "AF",
    countryName: "Afghanistan",
    emailAddress: "pratima.p@hcl.com",
    partyId: "94400",
    passportNumber: "1234",
    phoneExt: "5765",
    phoneNumber: "str56776",
    postalAware: false,
    postalCode: undefined,
    residential: false,
    stateAware: false,
    stateOrProvinceCode: undefined,
    taxId: "897"
  };

  const initialState: AppState = {
    shippingApp: {
      userAccount: null,
      shipmentDetails: null,
      customsDetails: {
        commodityList: [
          {
            name: '306',
            description: 'Apple TV',
            countryOfManufacture: 'China',
            quantity: 5,
            quantityUnits: 'BOX',
            qtyUnitLabel: 'Box',
            totalWeight: 200,
            totalWeightUnit: 'kg',
            totalWeightUnitLabel: 'Kilogram',
            totalCustomsValue: 10000,
            unitPrice: 'CNY',
            hsCode: 'HS3455'
          }
        ],
        customsType: 'nondoc',
        productType: '',
        productPurpose: 'SOLD',
        documentType: '',
        documentTypeCode: '',
        documentValue: 100,
        documentValueUnits: ''
      },
      senderDetails: null,
      recipientDetails: [
        {
          address1: '',
          address2: '',
          address3: '',
          residential: false,
          companyName: '',
          contactName: '',
          city: 'Kowloon',
          countryCode: 'HK',
          countryName: 'Hong Kong',
          postalCode: '852',
          postalAware: false,
          stateAware: false,
          phoneNumber: '',
          phoneExt: '',
          taxId: '',
          passportNumber: ''
        }
      ],
      paymentDetails: null,
      shipmentConfirmation: null
    }
  };

  const mockPrefixData = {
    "transactionId": "23d9a85f-0dca-4092-8299-c83ab410df2c",
    "output": {
      "countryPrefix": [
        {
          "countryCode": "US",
          "countryDialingCode": "1"
        },
        {
          "countryCode": "PS",
          "countryDialingCode": "970"
        },
        {
          "countryCode": "PT",
          "countryDialingCode": "351"
        }
      ]
    }
  };

  beforeEach(async(() => {

    const mockConfig = testConfig.config;
    class configServiceStub {
      settings: any = mockConfig;
      getSettings(prop: string) {
        return this.settings[prop];
      }
      init() {
        this.settings = mockConfig;
      }
    }

    class LocalAddressServiceStub {
      postPartyAddressDetails(addressDetails: ISender, addresstype: AddressTypes, userId: string) {
        return Observable.create((observer: Observer<any>) => {
          observer.next(postResponseList);
        });
      }

      updatePartyAddressDetails(addressDetails: ISender, partyId: string) {
        return Observable.create((observer: Observer<any>) => {
          observer.next(updateResponseList);
        });
      }
    }

    class APIMCountryServiceStub {
      getCountryDialingPrefixes() {
        return Observable.create((observer: Observer<any>) => {
          observer.next(mockPrefixData);
        });
      }
    }
    TestBed.configureTestingModule({
      declarations: [
        Step4RecipientDetailsPage,
        RestrictInputDirective
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
        provideMockStore({ initialState }),
        { provide: APIMCountryService, useClass: APIMCountryServiceStub },
        DatePipe,
        { provide: ConfigService, useClass: configServiceStub },
        { provide: Router, useValue: routerSpy },
        { provide: LocalAddressService, useClass: LocalAddressServiceStub }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(Step4RecipientDetailsPage);
    store = TestBed.inject(MockStore);
    component = fixture.componentInstance;
    fixture.detectChanges();
    spyOn(store, 'dispatch').and.callFake(() => { });
  }));

  afterEach(() => {
    fixture.destroy();
  });

  fit('should create', () => {
    expect(component).toBeTruthy();
  });

  fit('should show/hide address line 3 field', () => {
    const formCtrls = component.recipientForm.controls;
    const addressLine2Input = formCtrls.addressLine2;
    const el = fixture.debugElement.nativeElement;
    const adressLine3Field = el.querySelector('ion-input[formControlName=addressLine3]');
    fixture.detectChanges();

    addressLine2Input.setValue('c');
    expect(component.showAddressLine3).toBeTruthy();
    expect(adressLine3Field).toBeDefined();

    addressLine2Input.setValue('');
    expect(component.showAddressLine3).toBeFalsy();
    expect(adressLine3Field).toBeNull();
  });

  fit('should show/hide company address & ext field', () => {
    const el = fixture.debugElement.nativeElement;
    const companyNameField = el.querySelector('ion-input[formControlName=companyName]');
    const phoneExtField = el.querySelector('ion-input[formControlName=phoneExt]');
    fixture.detectChanges();

    component.residential = false;
    expect(companyNameField).toBeDefined();
    expect(phoneExtField).toBeDefined();
  });

  fit('Phone number field should have error, when entered value has less than 6 digit.', () => {
    component.recipientForm.get('phoneNumber').setValue('1234');
    fixture.detectChanges();
    expect(component.recipientForm.get('phoneNumber').valid).toBeFalse;
  });

  fit('Phone number field should have error, when entered value has more than 15 digit.', () => {
    component.recipientForm.get('phoneNumber').setValue('123456789123456789');
    fixture.detectChanges();
    expect(component.recipientForm.get('phoneNumber').valid).toBeFalse;
  })

  fit('Phone number field should not have error, when entered value is within min amd max limit.', () => {
    component.recipientForm.get('phoneNumber').setValue('123456');
    fixture.detectChanges();
    expect(component.recipientForm.get('phoneNumber').valid).toBeTruthy;

    component.recipientForm.get('phoneNumber').setValue('12345678912345');
    fixture.detectChanges();
    expect(component.recipientForm.get('phoneNumber').valid).toBeTruthy;
  });

  fit('email field should have error, on invalid email address.', () => {
    component.recipientForm.get('email').setValue('test123');
    fixture.detectChanges();
    expect(component.recipientForm.get('email').valid).toBeFalse;

    component.recipientForm.get('email').setValue('test123.gmail.com');
    fixture.detectChanges();
    expect(component.recipientForm.get('email').valid).toBeFalse;

    component.recipientForm.get('email').setValue('test123@ok');
    fixture.detectChanges();
    expect(component.recipientForm.get('email').valid).toBeFalse;

    component.recipientForm.get('email').setValue('@ok.com');
    fixture.detectChanges();
    expect(component.recipientForm.get('email').valid).toBeFalse;
  });

  fit('email field should have no error, on valid email address.', () => {
    component.recipientForm.get('email').setValue('test123@fedex.com');
    fixture.detectChanges();
    expect(component.recipientForm.get('email').valid).toBeTruthy;
  });

  fit('Should set the dialingPrefixValue based on selected currentCountryCode.', () => {
    let countryDialingPrefixesResponseMock: CountryDialingPrefixesResponse;
    let countryPrefix: CountryPrefixType = {
      countryCode: 'PR',
      countryDialingCode: '1'
    };
    let countryPrefix2: CountryPrefixType = {
      countryCode: 'PS',
      countryDialingCode: '970'
    };
    countryDialingPrefixesResponseMock = {
      countryPrefix: [countryPrefix, countryPrefix2]
    };
    store.overrideSelector(fromShippingSelector.selectCountryDialingPrefix, countryDialingPrefixesResponseMock);
    component.currentCountryCode = 'PS';
    fixture.detectChanges();
    component.getPrefixByCountryCode();
    component.currentCountryCode = 'PS';
    expect(component.dialingPrefixValue.length).toBeGreaterThan(0);
    expect(component.dialingPrefixValue).toEqual('970');
  });

  fit('should test form validity', () => {
    component.recipientForm.get('addressLine1').setValue('');
    component.recipientForm.get('contactName').setValue('');
    component.recipientForm.get('phoneNumber').setValue('');
    component.recipientForm.get('companyName').setValue('');
    component.residential = false;
    fixture.detectChanges();
    expect(component.recipientForm.get('addressLine1').valid).toBeFalse;
    expect(component.recipientForm.get('contactName').valid).toBeFalse;
    expect(component.recipientForm.get('phoneNumber').valid).toBeFalse;
    expect(component.recipientForm.get('companyName').valid).toBeFalse;
    expect(component.recipientForm.valid).toBeFalsy();

    component.recipientForm.get('addressLine1').setValue('Test Address');
    component.recipientForm.get('contactName').setValue('Test Name');
    component.recipientForm.get('phoneNumber').setValue('12346789');
    component.recipientForm.get('companyName').setValue('Test Com');
    component.residential = false;
    fixture.detectChanges();
    expect(component.recipientForm.get('addressLine1').valid).toBeTruthy;
    expect(component.recipientForm.get('contactName').valid).toBeTruthy;
    expect(component.recipientForm.get('phoneNumber').valid).toBeTruthy;
    expect(component.recipientForm.get('companyName').valid).toBeTruthy;

    expect(component.recipientForm.valid).toBeTruthy();

  });

  fit('click on continue should store form values and navigate. ', () => {
    component.recipientForm.get('addressLine1').setValue('Test Address');
    component.recipientForm.get('contactName').setValue('Test Contact Name');
    component.recipientForm.get('phoneNumber').setValue('12346789');
    component.recipientForm.get('companyName').setValue('Test Com');
    spyOn(component, 'postUpdateRecipientAddressDetails');
    fixture.detectChanges();
    component.submitForm();
    expect(component.recipientForm.valid).toBeTruthy();
    expect(store.dispatch).toHaveBeenCalled();
    expect(component.postUpdateRecipientAddressDetails).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/shipping/billing-details']);
  });

  fit('should be able to test phoneNumber length limit and set focus invalid input', () => {
    let ionicInputEl = fixture.debugElement.query(By.css('[formControlName="phoneNumber"]')).nativeElement;

    //valid phoneNumber length
    ionicInputEl.value = '1234567890';
    component.limitLength(ionicInputEl, 10);
    fixture.detectChanges();
    expect(component.isPhoneNumberValid).toBeTruthy();

    //invalid form & valid phoneNumber length
    ionicInputEl.value = '1234567890';
    component.limitLength(ionicInputEl, 10);
    component.recipientForm.get('addressLine1').setValue('');
    component.recipientForm.get('contactName').setValue('test contact name');
    fixture.detectChanges();
    component.submitForm();
    expect(component.recipientForm.invalid).toBeTruthy();
    expect(component.isPhoneNumberValid).toBeTruthy();

    //invalid form & invalid phoneNumber length
    ionicInputEl.value = '12';
    component.limitLength(ionicInputEl, 10);
    component.recipientForm.get('addressLine1').setValue('');
    component.recipientForm.get('contactName').setValue('test contact name');
    fixture.detectChanges();
    component.submitForm();
    expect(component.recipientForm.invalid).toBeTruthy();
    expect(component.isPhoneNumberValid).toBeFalsy();

    //sliced phoneNumber length, over the max limit
    ionicInputEl.value = '12345678901234';
    component.limitLength(ionicInputEl, 10);
    fixture.detectChanges();
    expect(ionicInputEl.value).toBe('1234567890');

    //invalid form & valid phoneNumber length & first invalid contactName
    ionicInputEl.value = '1234567890';
    component.limitLength(ionicInputEl, 10);
    component.recipientForm.get('addressLine1').setValue('test addr1');
    component.recipientForm.get('contactName').setValue('');
    fixture.detectChanges();
    component.submitForm();
    expect(component.recipientForm.invalid).toBeTruthy();
    expect(component.isPhoneNumberValid).toBeTruthy();

    //invalid form & valid phoneNumber length & first invalid companyName
    ionicInputEl.value = '1234567890';
    component.limitLength(ionicInputEl, 10);
    component.recipientForm.get('addressLine1').setValue('test addr1');
    component.recipientForm.get('contactName').setValue('test contact name');
    component.recipientForm.get('companyName').setValue('');
    fixture.detectChanges();
    component.submitForm();
    expect(component.recipientForm.invalid).toBeTruthy();
    expect(component.isPhoneNumberValid).toBeTruthy();

    //invalid form & valid phoneNumber length & first invalid email
    ionicInputEl.value = '1234567890';
    component.limitLength(ionicInputEl, 10);
    component.recipientForm.get('addressLine1').setValue('test addr1');
    component.recipientForm.get('contactName').setValue('test contact name');
    component.recipientForm.get('companyName').setValue('test companyName');
    component.recipientForm.get('email').setValue('aa');
    fixture.detectChanges();
    component.submitForm();
    expect(component.recipientForm.invalid).toBeTruthy();
    expect(component.isPhoneNumberValid).toBeTruthy();
  });

  fit('should be able to test phoneExt length limit', () => {
    let ionicInputEl = fixture.debugElement.query(By.css('[formControlName="phoneExt"]')).nativeElement;

    //sliced phoneNumber length, over the max limit
    ionicInputEl.value = '12345';
    component.limitLengthPhoneExt(ionicInputEl, 3);
    fixture.detectChanges();
    expect(ionicInputEl.value).toBe('123');
  });

  fit('should be able to test checkMaxLength for PhoneNumber', () => {
    // for CANADA
    component.currentCountryCode = 'CA';
    component.checkMaxLengthForPhoneNumber();
    expect(component.phoneNumberMax).toEqual(PhoneNumberLimitTypes.CA_MAX);
    expect(component.phoneNumberMin).toEqual(PhoneNumberLimitTypes.CA_MIN);
    expect(component.isDefaultValidation).toBeFalse;

    // for US
    component.currentCountryCode = 'US';
    component.checkMaxLengthForPhoneNumber();
    expect(component.phoneNumberMax).toEqual(PhoneNumberLimitTypes.US_MAX);
    expect(component.phoneNumberMin).toEqual(PhoneNumberLimitTypes.US_MIN);
    expect(component.isDefaultValidation).toBeFalse;
  });

  fit('should be able to toggle for company address', () => {
    // setting country to BR
    component.currentCountryCode = component.BRAZIL_COUNTRY_CODE;
    const companyToggle = { detail: { checked: true } };
    component.changeCompanyAddressToggle(companyToggle);
    fixture.detectChanges();
    expect(component.residential).toBeFalsy();

    const residentialToggle = { detail: { checked: false } };
    component.changeCompanyAddressToggle(residentialToggle);
    fixture.detectChanges();
    expect(component.residential).toBeTruthy();

  });

  fit('should be able to toggle for brazil residents', () => {
    // setting country to BR
    component.currentCountryCode = component.BRAZIL_COUNTRY_CODE;
    component.brResident = false;
    component.changeBrazilResidentToggle(component.brResident);
    fixture.detectChanges();
    expect(component.brResident).toBe(true);

    //invalid form with required passportNo error
    component.isPhoneNumberValid = true;
    component.recipientForm.get('addressLine1').setValue('test addr1');
    component.recipientForm.get('contactName').setValue('test contact name');
    component.recipientForm.get('companyName').setValue('test companyName');
    component.recipientForm.get('email').setValue('test@test.com');

    component.recipientForm.get('taxId').setValue('123243');
    component.recipientForm.get('passportNo').setValue('');
    fixture.detectChanges();
    component.submitForm();
    expect(component.recipientForm.invalid).toBeTruthy();
  });

  fit('should be able to untoggle for non-brazil residents', () => {
    // setting country to BR
    component.currentCountryCode = component.BRAZIL_COUNTRY_CODE;
    component.brResident = true;
    component.changeBrazilResidentToggle(component.brResident);
    fixture.detectChanges();
    expect(component.brResident).toBe(false);

    //invalid form with required taxId error
    component.isPhoneNumberValid = true;
    component.recipientForm.get('addressLine1').setValue('test addr1');
    component.recipientForm.get('contactName').setValue('test contact name');
    component.recipientForm.get('companyName').setValue('test companyName');
    component.recipientForm.get('email').setValue('test@test.com');

    component.recipientForm.get('taxId').setValue('');
    fixture.detectChanges();
    component.submitForm();
    expect(component.recipientForm.invalid).toBeTruthy();
  });
  fit('should navigate to summary page after updating page details and clicked update button.', () => {
    component.editRecipientPageDetails = true;
    component.recipientForm.get('addressLine1').setValue('Test Address');
    component.recipientForm.get('contactName').setValue('Test Contact Name');
    component.recipientForm.get('phoneNumber').setValue('12346789');
    component.recipientForm.get('companyName').setValue('Test Com');
    fixture.detectChanges();
    component.submitForm();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/', 'shipping', 'summary']);
  });

  fit('should navigate to summary page after clicking cancel without updating page details.', () => {
    fixture.detectChanges();
    component.cancelEditRecipientPageDetails();
    expect(component.editRecipientPageDetails).toEqual(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/', 'shipping', 'summary']);
  });

  fit('should show UPDATE, CANCEL buttons and keep current state values to be use on cancel click.', fakeAsync(() => {
    component.addListenerForEditFromSummary();
    fixture.detectChanges();
    window.dispatchEvent(new Event('editRecipientDetails'));
    tick(500);
    expect(component.editRecipientPageDetails).toEqual(true);
  }));

  fit('should call ngOnInit', () => {
    spyOn(component, 'getSelectedRecipientDetailsFromStore');
    spyOn(component, 'getUserAccountDetails');
    component.ngOnInit();
    expect(component.getSelectedRecipientDetailsFromStore).toHaveBeenCalled();
    expect(component.getUserAccountDetails).toHaveBeenCalled();
  })

  fit('should call create address Api end point on click continue', () => {
    component.partyId = undefined;
    component.userId = '58751'
    component.postUpdateRecipientAddressDetails();
    expect(component.partyId).toEqual('100045');
  })

  fit('should call update address Api end point on click continue', () => {
    component.partyId = "100045";
    component.postUpdateRecipientAddressDetails();
    expect(component.updateResponse).toEqual('ok');
  })

  fit('should get user account details.', fakeAsync(() => {
    store.overrideSelector(fromShippingSelector.selectUserLoginDetails, mockUserAccountDetails);
    component.getUserAccountDetails();
    fixture.detectChanges();
    tick();
    expect(component.userId).toEqual('123456');
  }));

  fit('should get selected Recipient details.', fakeAsync(() => {
    store.overrideSelector(fromShippingSelector.selectSelectedRecipient, recipientList);
    component.getSelectedRecipientDetailsFromStore();
    fixture.detectChanges();
    tick();
    expect(component.partyId).toEqual('94400');
  }));

  fit('should get selected Recipient details.', fakeAsync(() => {
    const recipientList = {
      address1: "abc",
      address2: undefined,
      address3: undefined,
      city: "KABUL CITY",
      companyName: "CBSS",
      contactName: "pratima",
      countryCode: "AF",
      countryName: "Afghanistan",
      emailAddress: "pratima.p@hcl.com",
      partyId: "94400",
      passportNumber: "1234",
      phoneExt: "5765",
      phoneNumber: "str56776",
      postalAware: false,
      postalCode: undefined,
      residential: false,
      stateAware: false,
      stateOrProvinceCode: "NY",
      taxId: "897"
    };

    store.overrideSelector(fromShippingSelector.selectSelectedRecipient, recipientList);
    const result = component.getCountryCityPostalDisplay(recipientList)
    fixture.detectChanges();
    tick();
    expect(result).toEqual("Afghanistan, KABUL CITY, NY")
  }));

  fit('should set focus on email field when it is the first invalid field', () => {
    component.recipientForm.get('email').setValue('');
    component.recipientForm.get('contactName').setValue('subhra');
    component.recipientForm.get('companyName').setValue('CBSS');
    component.recipientForm.get('phoneNumber').setValue('82990033');
    component.recipientForm.get('taxId').setValue('897');
    component.recipientForm.get('passportNo').setValue('1234');
    fixture.detectChanges();
    spyOn(component.emailInput, 'setFocus');
    component.setFocusOnFirstInvalidInput('email');
    expect(component.emailInput.setFocus).toHaveBeenCalled();
  });

  fit('should required taxid field when recipient country is ID and customs type is Item', fakeAsync(() => {
    const recipientDetails = 
    [{
      address1: '',
      address2: '',
      city: '',
      contactName: '',
      contactId: '',
      countryCode: 'ID',
      countryName: 'Inodesia',
      postalCode: '',
      stateOrProvinceCode: '',
      postalAware: true,
      stateAware: false,
      phoneNumber: '',
      saveContact: false,
      taxId: '',
      passportNumber: '',
      dialingPrefix: '',
      partyId: '',
      address3: '',
      residential: false,
      companyName: '',
      emailAddress: '',
      phoneExt: ''
    }];
  
  store.overrideSelector(fromShippingSelector.selectRecipientDetailsList, recipientDetails);

    fixture.detectChanges();
    tick();
    component.ngOnInit();
    component.recipientForm.controls.taxId.markAsTouched();
    component.submitForm();
    expect(component.recipientForm.valid).toBeFalsy();
  }));

  fit('should required taxid field when recipient country is ID and customs type is Item', fakeAsync(() => {
    const recipientDetails = 
      [{
        address1: '',
        address2: '',
        city: '',
        contactName: '',
        contactId: '',
        countryCode: 'ID',
        countryName: 'Inodesia',
        postalCode: '',
        stateOrProvinceCode: '',
        postalAware: true,
        stateAware: false,
        phoneNumber: '',
        saveContact: false,
        taxId: '',
        passportNumber: '',
        dialingPrefix: '',
        partyId: '',
        address3: '',
        residential: false,
        companyName: '',
        emailAddress: '',
        phoneExt: ''
      }];
    
    store.overrideSelector(fromShippingSelector.selectRecipientDetailsList, recipientDetails);
    component.ngOnInit();    
    component.recipientForm.get('addressLine1').setValue('Test Address');
    component.recipientForm.get('contactName').setValue('Test Contact Name');
    component.recipientForm.get('phoneNumber').setValue('12346789');
    component.recipientForm.get('companyName').setValue('Test Com');
    component.recipientForm.get('taxId').setValue(123456789123456);
    fixture.detectChanges();
    tick();
    component.submitForm();
    expect(component.recipientForm.valid).toBeTruthy();
  }));

});