import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { provideMockStore } from '@ngrx/store/testing';
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
import { ShipmentDestinationComponent } from './shipment-destination.component';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { LanguageLoader } from 'src/app/app.module';
import { MockStore } from '@ngrx/store/testing';
import { getRecipientCountriesBegin, getSelectedRecipientCountryDetailsBegin, getRecipientCityListBegin, getRecipientListDetailsBegin } from '../../../+store/shipping.actions';
import { CountryTypes } from 'src/app/types/enum/country-type.enum';
import * as fromShippingSelector from '../../../+store/shipping.selectors';
import { CountryDetailResponse } from 'src/app/interfaces/api-service/response/country-detail-response.interface';
import { AddressTypes } from 'src/app/types/enum/address-type.enum';
import { Router } from '@angular/router';
import { IRecipient } from 'src/app/interfaces/shipping-app/recipient';
import { SessionItems } from 'src/app/types/enum/session-items.enum';

// TODO - Need to be sorted by US owner
fdescribe('ShipmentDestinationComponent', () => {
  let component: ShipmentDestinationComponent;
  let fixture: ComponentFixture<ShipmentDestinationComponent>;
  let store: MockStore<AppState>;

  const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl', 'navigate', 'then']);
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
          code: 'HK',
          name: 'HONG KONG',
          actualCountryCode: 'HK'
        },
        {
          code: 'US',
          name: 'United States',
          actualCountryCode: 'US'
        }
      ]
    }
  };

  const multipleCountryList = {
    transactionId: 'e76bc5bc-21b0-4272-90d8-4541d3c322dd',
    output: {
      countries: [
        {
          code: 'GB',
          name: 'United Kingdom',
          actualCountryCode: 'GB'
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

  const mockRecipientList = {
    partylist: [{
      partyId: '87954',
      user: {
        uid: 58751
      },
      contact: {
        personName: 'pratima',
        companyName: 'CB',
        phoneNumber: '56776',
        emailAddress: 'pratima.p@hcl.com',
        passportNo: '1234',
        taxId: '897'
      },
      address: {
        city: 'new delhi',
        stateOrProvinceCode: 'CB',
        postalCode: '12345',
        countryCode: 'CN',
        visitor: 'true',
        residential: true,
        streetlines: ['add1', 'add2']
      }
    }
    ]
  };

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
          },
          partylist: mockRecipientList.partylist
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
      shipmentConfirmation: null,
      lookupData: {
        createShipmentError: null,
        createShipmentSuccess: null,
        currencyListLocal: null,
        currencyListUS: null,
        documentDescriptions: null,
        listOfcountryOfManufactureLocal: null,
        listOfcountryOfManufactureUS: null,
        mergedCurrencyList: null,
        mergedListOfcountryOfManufacture: null,
        mergedUomList: null,
        ratesDiscountError: null,
        defaultSenderDetails: null,
        recipientListDetails: null,
        ratesDiscountSuccess: {
          configlist: [
            {
              value: 0,
              seq: 1
            }
          ]
        },
        recipientCities: [
          {
            totalResults: 2,
            resultsReturned: 2,
            matchedAddresses: [
              {
                city: 'NEW YORK',
                countryCode: 'US',
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
        ],
        recipientCountries: [
          {
            name: 'Afghanistan',
            code: 'AF',
            actualCountryCode: 'AF'
          },
          {
            name: 'United States',
            code: 'US',
            actualCountryCode: 'US'
          }
        ],
        selectedCountryDialingPrefix: null,
        selectedRecipientCountryDetails: {
          countryName: 'Afghanistan',
          countryCode: 'AF',
          domesticShippingAllowed: false,
          domesticShippingUsesInternationalServices: false,
          maxCustomsValue: 50000,
          numberOfCommercialInvoices: 0,
          postalAware: false,
          regionCode: 'APAC',
          states: [],
          currencyCode: 'AFN',
          domesticCurrencyCode: 'AFN',
          anyPostalAwareness: false,
          customsValueRequired: false,
          minCustomsValue: 0,
          documentProductApplicable: false
        },
        selectedSenderCountryDetails: {
          countryName: 'HONG KONG SAR, CHINA',
          countryCode: 'HK',
          domesticShippingAllowed: false,
          domesticShippingUsesInternationalServices: false,
          maxCustomsValue: 50000,
          numberOfCommercialInvoices: 0,
          postalAware: false,
          regionCode: 'APAC',
          states: [],
          currencyCode: 'HKD',
          domesticCurrencyCode: 'HKD',
          anyPostalAwareness: false,
          customsValueRequired: false,
          minCustomsValue: 0,
          documentProductApplicable: false
        },
        senderCities: [
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
        ],
        senderCountries: [
          {
            name: 'Afghanistan',
            code: 'AF',
            actualCountryCode: 'AF'
          },
          {
            name: 'Albania',
            code: 'AL',
            actualCountryCode: 'AL'
          }
        ],
        senderRecipientInfo: null,
        shipmentFeedackSuccess: null,
        shipmentPurpose: null,
        systemCommodityList: null,
        uomListLocal: null,
        uomListUS: null
      }
    }
  };

  const recipientDataPostalAware: IRecipient = {
    countryName: undefined,
    city: 'New York',
    postalCode: '10001',
    residential: false,
    companyName: 'Company',
    address1: 'Address 1',
    contactName: 'Derrick Chan',
    countryCode: 'US',
    postalAware: true,
    stateAware: false,
    phoneNumber: '1234567890',
    stateOrProvinceCode: 'NY',
    phoneExt: '1',
    emailAddress: 'derrickchan@fedex.com',
    taxId: '123',
    passportNumber: '12345',
    partyId: '12345'
  };

  const recipientDataNonPostalAware: IRecipient = {
    countryName: undefined,
    city: 'Central',
    postalCode: '',
    residential: false,
    companyName: 'Company',
    address1: 'Address 1',
    contactName: 'Derrick Chan',
    countryCode: 'HK',
    postalAware: false,
    stateAware: false,
    phoneNumber: '1234567890',
    stateOrProvinceCode: '',
    phoneExt: '1',
    emailAddress: 'derrickchan@fedex.com',
    taxId: '',
    passportNumber: '',
    partyId: '12345'
  };

  beforeEach(async () => {
    const mockConfig = testConfig.config;

    class APIMCountryServiceStub {
      getCountries() {
        return Observable.create((observer: Observer<any>) => {
          observer.next(mockCountryList);
        });
      }

      getCitiesByCountryCodeAndPostalCode() {
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
      declarations: [ShipmentDestinationComponent],
      imports: [
        IonicModule.forRoot(),
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
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
        TranslateService,
        provideMockStore({ initialState }),
        FormBuilder,
        { provide: APIMCountryService, useClass: APIMCountryServiceStub },
        { provide: Router, useValue: routerSpy },
        { provide: ConfigService, useClass: ConfigServiceStub }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ShipmentDestinationComponent);
    store = TestBed.inject(MockStore);
    component = fixture.componentInstance;
    fixture.detectChanges();
    spyOn(store, 'dispatch').and.callFake(() => { });
  });

  fit('should create component', () => {
    expect(component).toBeTruthy();
  });

  fit('Should call ngOnInit and Initialise Store Selectors', () => {
    fixture.detectChanges();
    spyOn(component, 'initializeShipDestination');
    spyOn(component, 'getUserLoginData');
    component.ngOnInit();
    expect(component.initializeShipDestination).toHaveBeenCalled();
    expect(component.getUserLoginData).toHaveBeenCalled();
    expect(component.shipmentDestinationForm).not.toEqual(null);
  });

  fit('getCountryList should dispatch action getRecipientCountriesBegin.', fakeAsync(() => {
    component.ngOnInit();
    tick();
    expect(store.dispatch).toHaveBeenCalledWith(getRecipientCountriesBegin({ countryType: CountryTypes.COUNTRY_RECIPIENT }));
  }));

  fit('selectRecipientCountries selector should get country list.', fakeAsync(() => {
    fixture.detectChanges();
    component.ngOnInit();
    tick();
    expect(component.countryList.length).toBeGreaterThan(0);
  }));

  fit('on country selection getCountryDetails should have been called.', fakeAsync(() => {
    fixture.detectChanges();
    spyOn(component, 'getSelectedCountryDetails');
    const eventData = { target: { value: 'US' } };
    const country = 'UNITED STATES';
    component.fullCountryList = mockCountryList.output.countries;
    component.countryList = mockCountryList.output.countries;
    component.countrySelected(country);
    component.hideCountryList(eventData);
    tick(100);
    expect(component.getSelectedCountryDetails).toHaveBeenCalled();
  }));

  fit('Selected Sender country should be removed from Recipient Country List.', fakeAsync(() => {
    component.countryList = mockCountryList.output.countries;
    store.overrideSelector(fromShippingSelector.selectSenderCountryCode, 'AF');
    fixture.detectChanges();
    component.ngOnInit();
    tick();
    expect(component.countryList.length).toEqual(1);
    expect(component.countryList[0].name).toBe('United States');
  }));

  fit('on country selection action getSelectedRecipientCountryDetailsBegin should dispatched.', fakeAsync(() => {
    fixture.detectChanges();
    const selectedCountry = {
      name: 'United State',
      code: 'US',
      actualCountryCode: 'US'
    };
    fixture.detectChanges();
    component.getSelectedCountryDetails(selectedCountry);
    tick();
    expect(store.dispatch).toHaveBeenCalledWith(getSelectedRecipientCountryDetailsBegin({ countryCode: selectedCountry.code }));
  }));

  fit('countrySelected with postal aware true', fakeAsync(() => {
    const mockData: CountryDetailResponse = {
      countryName: 'United States of America',
      countryCode: 'US',
      postalAware: true,
    };
    spyOn(component, 'getCityList');
    spyOn(component, 'getSelectedCountryPostalCodePattern').and.callFake(function() {
      return {
        countryCode: 'AU',
        format: 'NNNN',
        pattern: '^\\d{4}$'
      };
    });
    component.shipmentDestinationForm.controls.countryCode.setValue('AU');
    fixture.detectChanges();
    store.overrideSelector(fromShippingSelector.selectSelectedRecipientCountry, mockData);
    fixture.detectChanges();
    component.ngOnInit();

    tick();
    expect(component.postalAware).toBe(true);
    expect(component.getCityList).not.toHaveBeenCalled();
    expect(component.cityList.length).toEqual(0);
  }));

  fit('countrySelected with postal aware false', fakeAsync(() => {
    const mockData: CountryDetailResponse = {
      countryName: 'Afghanistan',
      countryCode: 'AF',
      postalAware: false,
    };
    store.overrideSelector(fromShippingSelector.selectSelectedRecipientCountry, mockData);
    component.ngOnInit();
    expect(component.postalAware).toBe(false);
  }));

  fit('getCityList should dispatch action getRecipientCityListBegin.', fakeAsync(() => {
    component.ngOnInit();
    component.getCityList('US', '');
    fixture.detectChanges();
    tick();
    expect(store.dispatch).toHaveBeenCalledWith(getRecipientCityListBegin({ countryCode: 'US', postalCode: '' }));
  }));

  fit('Selected recipient countries city list should be assigned.', () => {
    const mockData = { matchedAddresses: [{ city: 'New York' }, { city: 'Washington' }] };
    component.shipmentDestinationForm.controls.countryCode.setValue('HK');
    component.setCities(mockData);
    expect(component.cityList.length).toEqual(2);
  });

  fit('postalCodeKeyPress with postal code', fakeAsync(() => {
    component.ngOnInit();
    fixture.detectChanges();
    component.postalAware = true;
    spyOn(component, 'getCityList');
    component.shipmentDestinationForm.get('countryCode').setValue('CN');
    component.shipmentDestinationForm.get('countryName').setValue('China');
    component.setRecipientCountryPostalAware();
    component.form.postalCode.setValue('100600');
    tick();
    component.showInvalidCountryError = false;
    const eventData = { target: { value: '100600' } };
    component.inputPostalCode(eventData);
    tick();
    expect(component.getCityList).toHaveBeenCalled();
  }));

  fit('citySelected should set the stateOrProvinceCode', () => {
    fixture.detectChanges();
    component.cityList = mockCityList.output.matchedAddresses;
    const eventData = { target: { value: 'NEW YORK' } };
    component.citySelected(eventData);
    expect(component.shipmentDestinationForm.controls.stateOrProvinceCode.value).toEqual('NY');
  });

  fit('Should throw an error when postal and city are required', () => {

    component.form.countryCode.setValue('');
    component.form.postalCode.setValue('');
    component.form.city.setValue('');

    component.markAllFieldAsTouch();

    expect(component.form.countryCode.valid).toBe(false);
    expect(component.form.postalCode.valid).toBe(false);
    expect(component.form.city.valid).toBe(false);
  });

  fit('Should pass the validation when fields are filled up', fakeAsync(() => {
    component.postalAware = true;
    component.form.countryCode.setValue('US');
    component.setRecipientCountryPostalAware();
    component.form.postalCode.setValue('10001');
    component.form.city.setValue('NEW YORK');
    const eventData = { target: { value: '10001' } };
    component.inputPostalCode(eventData);
    tick();
    component.markAllFieldAsTouch();
    fixture.detectChanges();

    expect(component.form.countryCode.valid).toBe(true);
    expect(component.form.postalCode.valid).toBe(true);
    expect(component.form.city.valid).toBe(true);
  }));

  fit('Should select city with Primary equals to true.', fakeAsync(() => {
    fixture.detectChanges();
    const mockData = {
      matchedAddresses: [
        { city: 'New York', primary: false, stateOrProvinceCode: '' },
        { city: 'Washington', primary: true, stateOrProvinceCode: '' }
      ]
    };
    component.shipmentDestinationForm.controls.countryCode.setValue('HK');
    component.setCities(mockData);
    fixture.detectChanges();
    expect(component.cityList.length).toEqual(2);
    tick();
    expect(component.shipmentDestinationForm.controls.city.value).toEqual('Washington');
  }));

  fit('Should select city if only one city in response list.', fakeAsync(() => {
    fixture.detectChanges();
    const mockData = {
      matchedAddresses: [
        { city: 'New York', primary: false, stateOrProvinceCode: '' }
      ]
    };
    component.shipmentDestinationForm.controls.countryCode.setValue('HK');
    component.setCities(mockData);
    fixture.detectChanges();
    expect(component.cityList.length).toEqual(1);
    tick();
    expect(component.shipmentDestinationForm.controls.city.value).toEqual('New York');
  }));

  fit('Should display error on no city match found for postal code', fakeAsync(() => {
    const mockData = {
      matchedAddresses: []
    };
    component.shipmentDestinationForm.controls.countryCode.setValue('HK');
    component.setCities(mockData);
    fixture.detectChanges();
    tick();
    expect(component.postalCodeNotFound).toBe(true);
  }));

  fit('citySelectedFromDataList should set the stateOrProvinceCode', fakeAsync(() => {
    fixture.detectChanges();
    const event = { target: { value: 'NEW YORK' } };
    component.ngOnInit();
    component.postalAware = true;
    component.fullCityList = mockCityList.output.matchedAddresses;
    component.cityList = mockCityList.output.matchedAddresses;
    component.form.city.setValue('NEW YORK');
    component.citySelected(event);
    tick(500);
    expect(component.shipmentDestinationForm.controls.stateOrProvinceCode.value).toEqual('NY');
  }));

  fit('Should throw an error when postalCode format inValid', fakeAsync(() => {
    fixture.detectChanges();
    component.postalAware = true;
    spyOn(component, 'getSelectedCountryPostalCodePattern').and.callFake(function() {
      return {
        countryCode: 'AU',
        format: 'NNNN',
        pattern: '^\\d{4}$'
      };
    });
    component.setRecipientCountryPostalAware();
    fixture.detectChanges();
    component.shipmentDestinationForm.get('countryCode').setValue('AU');
    component.form.postalCode.setValue('100');
    tick();
    expect(component.form.postalCode.hasError('pattern')).toBeTruthy();
  }));

  fit('On valid postal code format, format error should not shown', fakeAsync(() => {
    fixture.detectChanges();
    component.postalAware = true;
    spyOn(component, 'getSelectedCountryPostalCodePattern').and.callFake(function() {
      return {
        countryCode: 'AU',
        format: 'NNNN',
        pattern: '^\\d{4}$'
      };
    });
    component.setRecipientCountryPostalAware();
    fixture.detectChanges();
    component.shipmentDestinationForm.get('countryCode').setValue('AU');
    component.form.postalCode.setValue('1000');
    tick();
    expect(component.form.postalCode.hasError('pattern')).toBeFalsy();
  }));

  fit('should disable postal code field when country is not postal aware', fakeAsync(() => {
    fixture.detectChanges();
    component.postalAware = false;
    component.setRecipientCountryPostalAware();
    fixture.detectChanges();
    component.shipmentDestinationForm.get('countryCode').setValue('HK');
    tick();
    expect(component.form.postalCode.disabled).toBe(true);
  }));

  fit('should populate complete country list.', fakeAsync(() => {
    component.ngOnInit();
    fixture.detectChanges();
    const event = { target: { value: '' } };
    component.onSearchCountry(event);
    tick();
    expect(component.countryList.length).toBeGreaterThan(0);
    expect(component.showInvalidCountryError).toBe(false);
  }));

  fit('should populate country list as per search criteria.', fakeAsync(() => {
    component.ngOnInit();
    fixture.detectChanges();
    const event = { target: { value: 'af' } };
    component.onSearchCountry(event);
    tick();
    expect(component.showCountryList).toBe(true);
    expect(component.countryList.length).toBeGreaterThan(0);
    expect(component.showInvalidCountryError).toBe(false);
  }));

  fit('should display error when search text not found in country list.', fakeAsync(() => {
    component.ngOnInit();
    fixture.detectChanges();
    const event = { target: { value: 'test' } };
    component.onSearchCountry(event);
    tick(100);
    expect(component.showInvalidCountryError).toBe(true);
  }));

  fit('should hide country list on focus out.', fakeAsync(() => {
    component.ngOnInit();
    fixture.detectChanges();
    const event = { target: { value: 'Afghanistan' } };
    component.hideCountryList(event);
    tick(100);
    expect(component.showCountryList).toBe(false);
  }));

  fit('should show error for country if proper country is not selected.', fakeAsync(() => {
    component.ngOnInit();
    fixture.detectChanges();
    component.fullCountryList = multipleCountryList.output.countries;
    component.countryList = multipleCountryList.output.countries;
    const event = { target: { value: 'af' } };
    component.onSearchCountry(event);
    tick(100);
    expect(component.showInvalidCountryError).toBe(true);
  }));

  fit('should show error for country if space entered in country field.', fakeAsync(() => {
    component.ngOnInit();
    fixture.detectChanges();
    const event = { target: { value: ' ' } };
    component.onSearchCountry(event);
    tick(100);
    expect(component.showInvalidCountryError).toBe(true);
  }));

  fit('should show error when postal code entered and country is not selected.', fakeAsync(() => {
    fixture.detectChanges();
    spyOn(component, 'getCityList');
    component.form.postalCode.setValue('100600');
    const eventData = { target: { value: '100600' } };
    component.inputPostalCode(eventData);
    tick();
    expect(component.getCityList).not.toHaveBeenCalled();
    expect(component.shipmentDestinationForm.controls.countryName.invalid).toBe(true);
  }));

  fit('should get city list if proper country name is entered.', fakeAsync(() => {
    const mockCountryObj = { code: 'AF', name: 'AFGHANISTAN', actualCountryCode: 'AF' };
    component.ngOnInit();
    fixture.detectChanges();
    component.fullCountryList = mockCountryList.output.countries;
    spyOn(component, 'countrySelected');
    component.shipmentDestinationForm.controls.countryName.setValue('afghanistan');
    const event = { target: { value: 'afghanistan' } };
    component.onSearchCountry(event);
    component.hideCountryList(event);
    tick(100);
    expect(component.countrySelected).toHaveBeenCalledWith(mockCountryObj);
    expect(component.shipmentDestinationForm.controls.countryName.valid).toBe(true);
  }));

  fit('should check city value.', fakeAsync(() => {
    const cityRecord = {
      city: ''
    };
    component.ngOnInit();
    fixture.detectChanges();
    component.setCityValue(cityRecord);
    tick(100);
    expect(component.shipmentDestinationForm.controls.city.value).toEqual('');
  }));

  fit('should get recipient list and show addressbook icon.', fakeAsync(() => {
    store.overrideSelector(fromShippingSelector.selectRecipientListDetails, mockRecipientList);
    component.ngOnInit();
    fixture.detectChanges();
    tick(100);
    expect(component.enableRecipientAddressBook).toBe(true);
  }));

  fit('should get recipient list and hide addressbook icon if list is empty.', fakeAsync(() => {
    const mockEmprtyRecipientList = {
      partylist: []
    };
    store.overrideSelector(fromShippingSelector.selectRecipientListDetails, mockEmprtyRecipientList);
    component.ngOnInit();
    fixture.detectChanges();
    tick(100);
    expect(component.enableRecipientAddressBook).toBe(false);
  }));

  fit('should dispatch an action get RecipientDetailsList', () => {
    store.overrideSelector(fromShippingSelector.selectUserLoginDetails, initialState.shippingApp.userAccount);
    component.getUserLoginData();
    expect(store.dispatch).toHaveBeenCalledWith(getRecipientListDetailsBegin({
      uid: initialState.shippingApp.userAccount.userId,
      addressType: AddressTypes.ADDRESS_RECIPIENT
    }));
  });

  fit('should call setRecipientCountryPostalAware', () => {
    store.overrideSelector(fromShippingSelector.selectSelectedRecipientCountry,
      initialState.shippingApp.lookupData.selectedRecipientCountryDetails);
    spyOn(component, 'setRecipientCountryPostalAware');
    component.shipmentDestinationForm.controls.countryCode.setValue('AF');
    component.initializeShipDestination();
    expect(component.setRecipientCountryPostalAware).toHaveBeenCalled();
  });

  fit('should call setCities', fakeAsync(() => {
    store.overrideSelector(fromShippingSelector.selectRecipientCityList, initialState.shippingApp.lookupData.recipientCities);
    spyOn(component, 'setCities');
    component.initializeShipDestination();
    tick(1000);
    expect(component.setCities).toHaveBeenCalledWith(initialState.shippingApp.lookupData.recipientCities);
  }));

  fit('should return postalCode pattern based on country', () => {
    const countryPattern = {
      countryCode: 'AU',
      format: 'NNNN',
      pattern: '^\\d{4}$'
    };
    component.shipmentDestinationForm.controls.countryCode.setValue('AU');
    const returnValue = component.getSelectedCountryPostalCodePattern();
    expect(returnValue).toEqual(countryPattern);
  });

  fit('should return empty cityList when postal code Invalid', fakeAsync(() => {
    component.ngOnInit();
    fixture.detectChanges();
    spyOn(component, 'getCityList');
    component.shipmentDestinationForm.get('countryName').setValue('China');
    component.showInvalidCountryError = false;
    component.shipmentDestinationForm.get('countryCode').setValue('CN');
    const eventData = { target: { value: '000000' } };
    component.inputPostalCode(eventData);
    tick();
    expect(component.shipmentDestinationForm.controls.city.value).toBe('');
  }));

  fit('should Focus on postal code', () => {
    fixture.detectChanges();
    component.onPostalCodeFocusIn();
    expect(component.isFocusOnPostalCode).toBe(true);
  });

  fit('should navigate to addressbook Page', () => {
    fixture.detectChanges();
    component.openRecipientBook();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/', 'shipping', 'address-book']);
  });

  fit('should hide country list', fakeAsync(() => {
    const mockMultipleCountryName = {
      transactionId: 'e76bc5bc-21b0-4272-90d8-4541d3c322dd',
      output: {
        countries: [
          {
            code: 'GB',
            name: 'United Kingdom',
            actualCountryCode: 'GB'
          },
          {
            code: 'US',
            name: 'United Kingdom Two',
            actualCountryCode: 'US'
          }
        ]
      }
    };

    spyOn(component, 'countrySelected');
    spyOn(component, 'getSelectedCountryDetails');
    component.ngOnInit();
    let event = { target: { value: 'United Kingdom' } };
    component.countryList = mockMultipleCountryName.output.countries;
    component.hideCountryList(event);
    tick(100);
    expect(component.countrySelected).toHaveBeenCalled();
    expect(component.getSelectedCountryDetails).toHaveBeenCalled();
    expect(component.form.postalCode.value).toEqual('');
    expect(component.form.city.value).toEqual('');

    event = { target: { value: 'United' } };
    component.countryList = multipleCountryList.output.countries;
    component.hideCountryList(event);
    tick(100);
    expect(component.showCountryList).toBe(false);
    expect(component.form.countryCode.value).toEqual('');
    expect(component.form.countryName.value).toEqual('');
    expect(component.form.postalCode.value).toEqual('');
    expect(component.form.city.value).toEqual('');
    expect(component.fullCityList).toEqual([]);

    event = { target: { value: null } };
    component.countryList = multipleCountryList.output.countries;
    component.hideCountryList(event);
    tick(100);
    expect(component.showCountryList).toBe(false);
    expect(component.form.countryCode.value).toEqual('');
    expect(component.form.countryName.value).toEqual('');
    expect(component.form.postalCode.value).toEqual('');
    expect(component.form.city.value).toEqual('');
    expect(component.fullCityList).toEqual([]);
  }));

  fit('should validate postal code format', () => {
    const expectedCountryPattern = {
      countryCode: 'PH',
      format: 'NNNN',
      pattern: '^\\d{4}$'
    };
    component.ngOnInit();
    component.form.countryCode.setValue('PH');
    expect(component.getSelectedCountryPostalCodePattern()).toEqual(expectedCountryPattern);
  });

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

  fit('Should call getCityListAndSelectFromAddressBook', fakeAsync(() => {
    store.overrideSelector(fromShippingSelector.selectSenderCountryCode, 'AF');
    store.overrideSelector(fromShippingSelector.selectUserLoginDetails, initialState.shippingApp.userAccount);
    store.overrideSelector(fromShippingSelector.selectSelectedRecipient, recipientDataPostalAware);
    sessionStorage.setItem(SessionItems.RECIPIENTADDRESSBOOK, 'true');
    spyOn(component, 'getCityListAndSelectFromAddressBook');
    component.fullCountryList = mockCountryList.output.countries;
    component.countryList = mockCountryList.output.countries;
    component.ngOnInit();
    tick(1000);
    expect(component.getCityListAndSelectFromAddressBook).toHaveBeenCalled();
  }));

  fit('Should test and set values for getCityListAndSelectFromAddressBook for postal aware', fakeAsync(() => {
    spyOn(component, 'countrySelected');
    spyOn(component, 'getSelectedCountryDetails');
    spyOn(component, 'inputPostalCode');
    component.fullCountryList = mockCountryList.output.countries;
    component.getCityListAndSelectFromAddressBook(recipientDataPostalAware);
    component.isCountryDetailLoaded = true;
    component.postalAware = true;
    component.ngDoCheck();
    tick(500);
    expect(component.countrySelected).toHaveBeenCalled();
    expect(component.getSelectedCountryDetails).toHaveBeenCalled();
    expect(component.inputPostalCode).toHaveBeenCalled();
    expect(component.form.postalCode.value).toEqual(recipientDataPostalAware.postalCode);
  }));

  fit('Should test and set values for getCityListAndSelectFromAddressBook for non postal aware', fakeAsync(() => {
    spyOn(component, 'countrySelected');
    spyOn(component, 'getSelectedCountryDetails');
    spyOn(component, 'inputPostalCode');
    component.fullCountryList = mockCountryList.output.countries;
    component.getCityListAndSelectFromAddressBook(recipientDataNonPostalAware);
    component.isCountryDetailLoaded = true;
    component.postalAware = false;
    component.ngDoCheck();
    tick(500);
    expect(component.countrySelected).toHaveBeenCalled();
    expect(component.getSelectedCountryDetails).toHaveBeenCalled();
    expect(component.inputPostalCode).not.toHaveBeenCalled();
    expect(component.form.postalCode.value).toEqual('');
  }));
});
