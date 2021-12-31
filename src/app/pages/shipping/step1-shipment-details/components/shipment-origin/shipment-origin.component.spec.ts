import { async, ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ShipmentOriginComponent } from './shipment-origin.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppState } from 'src/app/+store/app.state';
import { AccountType } from 'src/app/types/enum/account-type.enum';
import { FormBuilder } from '@angular/forms';
import { APIMCountryService } from 'src/app/core/providers/apim';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConfigService } from '@ngx-config/core';
import * as testConfig from '../../../../../../assets/config/mockConfigForTest';
import { Observable, Observer } from 'rxjs';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { LanguageLoader } from 'src/app/app.module';
import {
  getSelectedSenderCountryDetailsBegin, getSenderCityListBegin,
  getSenderCountriesBegin, saveSenderAddressAction
} from '../../../+store/shipping.actions';
import { CountryTypes } from 'src/app/types/enum/country-type.enum';
import * as fromShippingSelector from '../../../+store/shipping.selectors';
import { CountryDetailResponse } from 'src/app/interfaces/api-service/response/country-detail-response.interface';
import { SessionItems } from 'src/app/types/enum/session-items.enum';
import { ISender } from 'src/app/interfaces/shipping-app/sender';
import { IAddressBookResponse } from 'src/app/interfaces/mock-data/address-book-response.interface';

// TODO - Need to be sorted by US owner
fdescribe('ShipmentOriginComponent', () => {
  let component: ShipmentOriginComponent;
  let fixture: ComponentFixture<ShipmentOriginComponent>;
  let store: MockStore<AppState>;
  const mockCountryList = {
    transactionId: 'e76bc5bc-21b0-4272-90d8-4541d3c322dd',
    output: {
      countries: [
        {
          code: 'AF',
          name: 'AFGHANISTAN',
          actualCountryCode: 'AF'
        },
        {
          code: 'US',
          name: 'United States',
          actualCountryCode: 'US'
        }
      ]
    }
  };

  const mockCityList = {
    transactionId: '6d4898ae-252f-4a49-ac26-7d1f048c3f7e',
    output: {
      totalResults: 1,
      resultsReturned: 1,
      matchedAddresses: [
        {
          city: 'NEW YORK',
          stateOrProvinceCode: 'NY',
          postalCode: '10001',
          countryCode: 'US',
          residential: false,
          primary: false
        }
      ]
    }
  };

  const mockMultipleCities = {
    matchedAddresses: [
      {
        city: 'NEW YORK',
        stateOrProvinceCode: 'NY',
        postalCode: '10001',
        countryCode: 'US',
        residential: false,
        primary: true
      },
      {
        city: 'NEW YORK CITY',
        stateOrProvinceCode: 'NY',
        postalCode: '10001',
        countryCode: 'US',
        residential: false,
        primary: false
      }
    ]
  };

  const mockPartyListPostalAware: IAddressBookResponse = {
    partyId: '87954',
    contact: {
      personName: 'contactName',
      companyName: '',
      phoneNumber: '1234567890',
      emailAddress: 'test@fedex.com',
      passportNo: '',
      taxId: '123456'
    },
    address: {
      streetlines: ['add1', 'add2'],
      city: 'AUCKLAND',
      stateOrProvinceCode: '',
      postalCode: '123456',
      countryCode: 'NZ',
      residential: false,
      visitor: 'false'
    }
  };

  const mockPartyListNonPostalAware: IAddressBookResponse = {
    partyId: '87954',
    contact: {
      personName: 'contactName',
      companyName: '',
      phoneNumber: '1234567890',
      emailAddress: 'test@fedex.com',
      passportNo: '',
      taxId: '123456'
    },
    address: {
      streetlines: ['add1', 'add2'],
      city: 'CENTRAL',
      stateOrProvinceCode: '',
      postalCode: '',
      countryCode: 'HK',
      residential: false,
      visitor: 'false'
    }
  };

  const mockUserAccountDetailsPostalAware = {
    userId: '123456',
    userProfile: {
      partylist: [mockPartyListPostalAware]
    },
    accountType: AccountType.OTP,
    accountProfile: '',
    isUserLoggedIn: true,
    lastLogin: new Date()
  };

  const mockUserAccountDetailsNonPostalAware = {
    userId: '123456',
    userProfile: {
      partylist: [mockPartyListNonPostalAware]
    },
    accountType: AccountType.OTP,
    accountProfile: '',
    isUserLoggedIn: true,
    lastLogin: new Date()
  };

  const initialState: AppState = {
    shippingApp: {
      userAccount: {
        userId: '123456',
        userProfile: {
          partylist: mockUserAccountDetailsPostalAware.userProfile.partylist,
        },
        accountType: AccountType.OTP,
        accountProfile: '',
        isUserLoggedIn: true,
        lastLogin: new Date()
      },
      shipmentDetails: null,
      customsDetails: null,
      senderDetails: null,
      recipientDetails: null,
      paymentDetails: null,
      shipmentConfirmation: null
    }
  };

  beforeEach(async(() => {
    let mockStore: MockStore;
    const mockConfig = testConfig.config;


    class APIMCountryServiceStub {
      getCountries() {
        return Observable.create((observer: Observer<any>) => {
          observer.next(mockCountryList);
        });
      }

      getCitiesByCountryCodeAndPostalCode(countryCode: string, postalCode: string) {
        return Observable.create((observer: Observer<any>) => {
          observer.next(mockCityList);
        });
      }
    }

    class ConfigServiceStub {
      settings: any = mockConfig;
      getSettings(prop: string) {
        return this.settings[prop];
      }
      init() {
        this.settings = mockConfig;
      }
    }
    TestBed.configureTestingModule({
      declarations: [ShipmentOriginComponent],
      imports: [
        IonicModule.forRoot(),
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: LanguageLoader,
            deps: [HttpClient]
          }
        })
      ],
      providers: [
        provideMockStore({ initialState }),
        FormBuilder,
        TranslateService,
        { provide: APIMCountryService, useClass: APIMCountryServiceStub },
        { provide: ConfigService, useClass: ConfigServiceStub }
      ]
    }).compileComponents();
    mockStore = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(ShipmentOriginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch').and.callFake(() => { });
  }));

  fit('should create component', () => {
    expect(component).toBeTruthy();
  });

  fit('should call ngOnInit and initialise countrylist and userLoginData object', () => {
    fixture.detectChanges();
    spyOn(component, 'initializeShipOrigin');
    component.ngOnInit();
    expect(component.initializeShipOrigin).toHaveBeenCalled();
  });

  fit('getCountryList should dispatch action getRecipientCountriesBegin.', () => {
    component.ngOnInit();
    expect(store.dispatch).toHaveBeenCalledWith(getSenderCountriesBegin({ countryType: CountryTypes.COUNTRY_SENDER }));
  });

  fit('should set default coutry.', fakeAsync(() => {
    const mockData = [{ name: 'Hong Kong SAR, China', code: 'HK', actualCountryCode: 'HK' }, { name: 'China', code: 'CN', actualCountryCode: 'CN' }];
    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'HK');
    store.overrideSelector(fromShippingSelector.selectSenderCountries, mockData);
    component.ngOnInit();
    fixture.detectChanges();
    tick(1000);
    expect(component.form.countryName.value).toEqual('Hong Kong SAR, China');
  }));

  fit('Get Country Details, when OnCountryChange', () => {
    component.shipmentOriginForm.get('countryCode').setValue('NZ');
    fixture.detectChanges();
    const selectedCountry = {
      name: 'NEW ZEALAND',
      code: 'NZ',
      actualCountryCode: 'NZ'
    };
    fixture.detectChanges();
    component.onCountryChange();
    expect(store.dispatch).toHaveBeenCalledWith(getSelectedSenderCountryDetailsBegin({ countryCode: 'NZ' }));
  });

  fit('getCityList should dispatch action getSenderCityListBegin.', () => {
    component.ngOnInit();
    component.getSenderCities('US', '');
    fixture.detectChanges();
    expect(store.dispatch).toHaveBeenCalledWith(getSenderCityListBegin({ countryCode: 'US', postalCode: '' }));
  });

  fit('Should call getSenderCities if the enter postalCode is Valid', () => {
    component.ngOnInit();
    fixture.detectChanges();
    spyOn(component, 'getSenderCities');
    component.shipmentOriginForm.get('countryCode').setValue('CN');
    component.form.postalCode.setValue('100600');
    component.inputPostalCode();
    expect(component.getSenderCities).toHaveBeenCalled();
  });

  fit('Hide postalCode, when onCountryChange selected a postalAware false country', fakeAsync(() => {
    const mockData: CountryDetailResponse = {
      countryName: 'Afghanistan',
      countryCode: 'AF',
      postalAware: false,
    };
    spyOn(component, 'getSenderCities');
    component.form.countryCode.setValue('HK');
    fixture.detectChanges();
    store.overrideSelector(fromShippingSelector.selectSenderCountryDetails, mockData);
    fixture.detectChanges();
    component.ngOnInit();

    tick(2000);
    expect(component.postalAware).toBe(false);
    expect(component.getSenderCities).toHaveBeenCalled();
  }));

  fit('countrySelected with postal aware true', fakeAsync(() => {
    const mockData: CountryDetailResponse = {
      countryName: 'United States of America',
      countryCode: 'US',
      postalAware: true,
    };
    spyOn(component, 'getSenderCities');
    spyOn(component, 'validatePostalCodeFormat').and.callFake(function () {
      return {
        countryCode: 'AU',
        format: 'NNNN',
        pattern: '^\\d{4}$'
      };
    });
    component.form.countryCode.setValue('AU');
    fixture.detectChanges();
    store.overrideSelector(fromShippingSelector.selectSenderCountryDetails, mockData);
    fixture.detectChanges();
    component.ngOnInit();

    tick(1000);
    expect(component.postalAware).toBe(true);
    expect(component.getSenderCities).not.toHaveBeenCalled();
  }));

  fit('Should select city with Primary equals to true.', fakeAsync(() => {
    fixture.detectChanges();
    const mockCityList = {
      matchedAddresses: [
        { city: 'Aberdeen', primary: false, stateOrProvinceCode: '' },
        { city: 'Central', primary: true, stateOrProvinceCode: '' }
      ]
    };
    const mockOnlyOneCity = {
      matchedAddresses: [
        { city: 'Aberdeen', primary: false, stateOrProvinceCode: '' }
      ]
    };
    const emptyList = {
      matchedAddresses: []
    };
    component.form.countryCode.setValue('HK');
    component.setCities(emptyList.matchedAddresses);
    expect(component.cityList.length).toEqual(0);
    tick(50);
    expect(component.form.city.value).toEqual('');

    component.setCities(mockOnlyOneCity.matchedAddresses);
    expect(component.cityList.length).toEqual(1);
    tick(50);
    expect(component.form.city.value).toEqual('Aberdeen');

    component.setCities(mockCityList.matchedAddresses);
    expect(component.cityList.length).toEqual(2);
    tick(50);
    expect(component.form.city.value).toEqual('Central');
  }));

  fit('Should throw an error when postal and city are required', () => {
    component.form.countryCode.setValue('');
    component.form.postalCode.setValue('');
    component.form.city.setValue('');

    component.markAllFieldAsTouch();
    fixture.detectChanges();

    expect(component.form.postalCode.hasError('required')).toBeTruthy();
    expect(component.form.city.hasError('required')).toBeTruthy();
  });

  fit('Should pass the validation when fields are filled up', () => {
    const event = {
      detail: {
        value: {
          anyPostalAwareness: false,
          countryCode: 'US',
          countryName: 'UNITED STATES',
          currencyCode: 'USD',
          domesticShippingAllowed: true,
          postalAware: true,
          regionCode: 'UNITEDSTATES',
        }
      }
    };

    component.onCountryChange();

    component.form.countryCode.setValue('US');
    component.form.postalCode.setValue('10001');
    component.form.city.setValue('NEW YORK');

    component.markAllFieldAsTouch();

    expect(component.form.countryCode.hasError('required')).toBeFalsy();
    expect(component.form.postalCode.hasError('required')).toBeFalsy();
    expect(component.form.city.hasError('required')).toBeFalsy();
  });

  fit('Should apply postalCode format Validation on CountryChange', () => {
    fixture.detectChanges();
    component.postalAware = true;
    spyOn(component, 'validatePostalCodeFormat').and.callFake(function () {
      return {
        countryCode: 'JP',
        format: 'NNNNNNN',
        pattern: '^\\d{7}$'
      };
    });
    component.setPostalCodeValidators();
    fixture.detectChanges();
    component.shipmentOriginForm.get('countryCode').setValue('JP');
    component.form.postalCode.setValue('1000123');
    expect(component.form.postalCode.hasError('pattern')).toBeFalsy();
  });

  fit('Should throw an error when postalCode format inValid', () => {
    fixture.detectChanges();
    component.postalAware = true;
    spyOn(component, 'validatePostalCodeFormat').and.callFake(function () {
      return {
        countryCode: 'JP',
        format: 'NNNNNNN',
        pattern: '^\\d{7}$'
      };
    });
    component.setPostalCodeValidators();
    component.shipmentOriginForm.get('countryCode').setValue('JP');
    component.form.postalCode.setValue('100');
    expect(component.form.postalCode.hasError('pattern')).toBeTruthy();
  });

  fit('Should display error on no city match found for postal code', fakeAsync(() => {
    component.initializeShipOrigin();
    fixture.detectChanges();
    const cityList = [];
    component.setCities(cityList);
    tick(50);
    expect(component.postalCodeNotFound).toBe(true);
  }));

  fit('Should not display error on  city match found for postal code', fakeAsync(() => {
    component.initializeShipOrigin();
    fixture.detectChanges();
    const cityList = [
      { city: 'New York', primary: false, stateOrProvinceCode: '' },
      { city: 'Washington', primary: true, stateOrProvinceCode: '' }
    ];
    component.setCities(cityList);
    tick(50);
    expect(component.postalCodeNotFound).toBe(false);
  }));

  fit('should get default sender data.', fakeAsync(() => {
    const mockCountryDetailsPostalAware: CountryDetailResponse = {
      countryName: 'New Zealand',
      countryCode: 'NZ',
      postalAware: true,
    };
    store.overrideSelector(fromShippingSelector.selectUserLoginDetails, mockUserAccountDetailsPostalAware);
    store.overrideSelector(fromShippingSelector.selectSenderCountryDetails, mockCountryDetailsPostalAware);
    store.overrideSelector(fromShippingSelector.selectDefaultSenderDetails, mockUserAccountDetailsPostalAware.userProfile);
    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'NZ');
    component.ngOnInit();
    fixture.detectChanges();
    tick(1000);
    expect(component.defaultSenderDetails).toBeDefined();
  }));

  fit('should get postal and city from store for postal aware.', fakeAsync(() => {
    const mockCountryDetailsPostalAware: CountryDetailResponse = {
      countryName: 'New Zealand',
      countryCode: 'NZ',
      postalAware: true,
    };
    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'NZ');
    store.overrideSelector(fromShippingSelector.selectUserLoginDetails, mockUserAccountDetailsPostalAware);
    store.overrideSelector(fromShippingSelector.selectSenderCountryDetails, mockCountryDetailsPostalAware);
    store.overrideSelector(fromShippingSelector.selectDefaultSenderDetails, mockUserAccountDetailsPostalAware.userProfile);
    spyOn(component, 'inputPostalCode');
    component.ngOnInit();
    component.isCountryDetailLoaded = true;
    component.isPostalFromUserProfile = true;
    component.ngDoCheck();
    fixture.detectChanges();
    tick(1000);
    expect(component.defaultSenderDetails).toBeDefined();
    expect(component.defaultSenderDetails).not.toBeNull();
    expect(component.form.postalCode.value).toBe(component.defaultSenderDetails.address.postalCode);
    expect(component.postalAware).toBe(true);
    expect(component.inputPostalCode).toHaveBeenCalled();
  }));

  fit('should get postal and city from store for non postal aware.', fakeAsync(() => {
    const mockCountryDetailsNonPostalAware: CountryDetailResponse = {
      countryName: 'Hong Kong',
      countryCode: 'HK',
      postalAware: false,
    };
    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'HK');
    store.overrideSelector(fromShippingSelector.selectUserLoginDetails, mockUserAccountDetailsNonPostalAware);
    store.overrideSelector(fromShippingSelector.selectSenderCountryDetails, mockCountryDetailsNonPostalAware);
    store.overrideSelector(fromShippingSelector.selectDefaultSenderDetails, mockUserAccountDetailsNonPostalAware.userProfile);
    spyOn(component, 'inputPostalCode');
    component.ngOnInit();
    component.isCountryDetailLoaded = true;
    component.isPostalFromUserProfile = true;
    const testData = {
      matchedAddresses: [
        { city: 'CENTRAL', primary: false, stateOrProvinceCode: '' }
      ]
    };
    component.cityList = testData.matchedAddresses;
    component.ngDoCheck();
    fixture.detectChanges();
    tick(1000);
    expect(component.defaultSenderDetails).toBeDefined();
    expect(component.defaultSenderDetails).not.toBeNull();
    expect(component.form.postalCode.value).toBe('');
    expect(component.form.city.value).toBe(component.defaultSenderDetails.address.city);
    expect(component.postalAware).toBe(false);
    expect(component.inputPostalCode).not.toHaveBeenCalled();
  }));

  fit('should get postal and city from store.', fakeAsync(() => {
    store.overrideSelector(fromShippingSelector.selectUserLoginDetails, mockUserAccountDetailsPostalAware);
    component.ngOnInit();
    component.defaultSenderDetails = mockUserAccountDetailsPostalAware.userProfile.partylist[0];
    fixture.detectChanges();
    tick(1000);
    expect(component.defaultSenderDetails).toBeDefined();
  }));

  fit('should get default sender data and save sender details to store.', fakeAsync(() => {
    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'NZ');
    component.countryCode = sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);
    store.overrideSelector(fromShippingSelector.selectUserLoginDetails, mockUserAccountDetailsPostalAware);
    store.overrideSelector(fromShippingSelector.selectDefaultSenderDetails, mockUserAccountDetailsPostalAware.userProfile);

    const testData: ISender = {
      address1: 'add1',
      address2: 'add2',
      city: 'AUCKLAND',
      contactName: 'contactName',
      countryCode: 'NZ',
      countryName: undefined,
      postalCode: '123456',
      companyName: '',
      emailAddress: 'test@fedex.com',
      postalAware: undefined,
      stateAware: undefined,
      phoneNumber: '1234567890',
      saveContact: false,
      stateOrProvinceCode: '',
      taxId: '123456',
      dialingPrefix: undefined,
      partyId: '87954'
    };
    component.ngOnInit();
    fixture.detectChanges();
    tick(1000);

    expect(store.dispatch).toHaveBeenCalledWith(saveSenderAddressAction({ senderDetails: testData }));
  }));

  fit('should not dispatch action to get default sender data.', fakeAsync(() => {
    component.defaultSenderDetails = null;
    store.overrideSelector(fromShippingSelector.selectUserLoginDetails, null);
    component.ngOnInit();
    fixture.detectChanges();
    tick(1000);
    expect(component.defaultSenderDetails).toBe(null);
  }));

  fit('should not call assignSenderDetails.', fakeAsync(() => {
    store.overrideSelector(fromShippingSelector.selectSenderDetails, null);
    store.overrideSelector(fromShippingSelector.selectUserLoginDetails, null);
    spyOn(component, 'assignSenderDetails');
    component.ngOnInit();
    fixture.detectChanges();
    tick(1000);
    expect(component.assignSenderDetails).not.toHaveBeenCalled();
  }));

  fit('should hide postalCode error message', () => {
    component.onPostalCodeFocusIn();
    expect(component.isFocusOnPostalCode).toEqual(true);
  });

  fit('should check city field Value', () => {
    const cityRecord = { city: '' };
    component.setCityValue(cityRecord);
    expect(component.form.city.value).toBe('');
  });

  fit('should call setCities', () => {
    const cityListResponse = [
      {
        totalResults: 2,
        resultsReturned: 2,
        matchedAddresses: [
          {
            city: 'A KUNG KOK',
            countryCode: 'HK',
            residential: false,
            primary: false,
            stateOrProvinceCode: '',
            postalCode: ''
          },
          {
            city: 'ABERDEEN',
            countryCode: 'HK',
            residential: false,
            primary: false,
            stateOrProvinceCode: '',
            postalCode: ''
          }
        ]
      }
    ];
    store.overrideSelector(fromShippingSelector.selectCitiesList, cityListResponse);
    spyOn(component, 'setCities');
    component.initializeShipOrigin();
    expect(component.setCities).toHaveBeenCalled();
  });

  fit('should validate postal code format', () => {
    const expectedCountryPattern = {
      countryCode: 'PH',
      format: 'NNNN',
      pattern: '^\\d{4}$'
    };
    component.ngOnInit();
    component.countryCode = 'PH';
    expect(component.validatePostalCodeFormat()).toEqual(expectedCountryPattern);
  });

  fit('should get user postalcode details', fakeAsync(() => {
    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'NZ');
    store.overrideSelector(fromShippingSelector.selectUserLoginDetails, mockUserAccountDetailsPostalAware);
    store.overrideSelector(fromShippingSelector.selectDefaultSenderDetails, mockUserAccountDetailsPostalAware.userProfile);
    component.ngOnInit();
    flush(100);
    expect(component.defaultSenderDetails.address.postalCode).toEqual('123456');
  }));

  fit('Should check cityList length', fakeAsync(() => {
    fixture.detectChanges();
    const testData = {
      matchedAddresses: [
        { city: 'New York', primary: false, stateOrProvinceCode: '' }
      ]
    };
    component.setCities(testData.matchedAddresses);
    component.cityList = testData.matchedAddresses;
    flush(100);
    tick(100);
    expect(component.shipmentOriginForm.controls.city.value).toEqual('New York');

  }));

  fit('should show full city list', () => {
    component.ngOnInit();
    component.fullCityList = mockCityList.output.matchedAddresses;
    component.form.countryCode.setValue('PH');
    component.showFullCityList();
    expect(component.cityList).toEqual(component.fullCityList);
    expect(component.showCityList).toBe(true);
    expect(component.showInvalidCityError).toBe(false);
  });

  fit('should hide city list', fakeAsync(() => {
    component.ngOnInit();
    component.fullCityList = mockCityList.output.matchedAddresses;
    component.cityList = component.fullCityList;
    component.form.countryCode.setValue('US');
    component.form.postalCode.setValue('10001');

    let event = { target: { value: 'NEW YORK' } };
    component.hideCityList(event);
    tick(100);
    expect(component.showCityList).toBe(false);
    expect(component.showInvalidCityError).toBe(false);

    component.fullCityList = mockMultipleCities.matchedAddresses;
    component.cityList = component.fullCityList;
    event = { target: { value: 'NEW' } };
    component.hideCityList(event);
    tick(100);
    expect(component.showInvalidCityError).toBe(false);

    component.fullCityList = mockMultipleCities.matchedAddresses;
    component.cityList = component.fullCityList;
    event = { target: { value: 'NEW YORK' } };
    component.hideCityList(event);
    tick(100);
    expect(component.showInvalidCityError).toBe(false);

    event = { target: { value: null } };
    component.hideCityList(event);
    tick(100);
    expect(component.showInvalidCityError).toBe(false);
  }));

  fit('should search for city list', fakeAsync(() => {
    spyOn(component, 'showFullCityList');
    component.ngOnInit();
    tick(100);
    component.fullCityList = mockMultipleCities.matchedAddresses;
    component.cityList = component.fullCityList;
    component.form.countryCode.setValue('US');
    component.form.postalCode.setValue('10001');

    let event = { target: { value: 'NEW' } };
    component.onSearchCity(event);
    expect(component.showCityList).toBe(true);
    expect(component.showInvalidCityError).toBe(false);

    event = { target: { value: 'CALIFORNIA' } };
    component.onSearchCity(event);
    expect(component.showCityList).toBe(false);
    expect(component.showInvalidCityError).toBe(false);

    event = { target: { value: ' ' } };
    component.onSearchCity(event);
    expect(component.showCityList).toBe(false);
    expect(component.showInvalidCityError).toBe(false);

    event = { target: { value: '的' } };
    component.onSearchCity(event);
    expect(component.showCityList).toBe(false);
    expect(component.showInvalidCityError).toBe(false);

    event = { target: { value: null } };
    component.onSearchCity(event);
    expect(component.showCityList).toBe(false);
    expect(component.showInvalidCityError).toBe(false);
    expect(component.showFullCityList).toHaveBeenCalled();
  }));

});
