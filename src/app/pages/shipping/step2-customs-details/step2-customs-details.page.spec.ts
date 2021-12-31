import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { Step2CustomsDetailsPage } from './step2-customs-details.page';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { LanguageLoader } from 'src/app/app.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MockStore } from '@ngrx/store/testing';
import * as fromShippingSelector from '../+store/shipping.selectors';
import { AppState } from 'src/app/+store/app.state';
import { AccountType } from 'src/app/types/enum/account-type.enum';
import { provideMockStore } from '@ngrx/store/testing';
import {
  getCurrencyListUSApiBegin,
  getCurrencyListLocalApiBegin,
  saveMergedCurrencyListAction,
  getDocumentDescriptionsBegin
} from '../+store/shipping.actions';
import * as testConfig from '../../../../assets/config/mockConfigForTest';
import { Observable, Observer } from 'rxjs';
import { APIMGlobalTradeService } from 'src/app/core/providers/apim';
import { CurrencyUomComConfigurationService } from 'src/app/core/providers/local/currency-uom-com-configuration.service';
import { CustomsType } from 'src/app/types/enum/customs-type.enum';
import { ItemsType } from 'src/app/types/enum/items-type.enum';

describe('Step2CustomsDetailsPage', () => {
  let component: Step2CustomsDetailsPage;
  let fixture: ComponentFixture<Step2CustomsDetailsPage>;
  let store: MockStore<AppState>;
  const mockUSCurrencyListResponse = {
    output: {
      currencies:
        [{ iataCode: 'ANG', isoCode: 'ANG', description: 'Antilles Guilder', symbol: 'ƒ' }, { iataCode: 'ARN', isoCode: 'ARS', description: 'Argentine Pesos', symbol: '$' }]

    }
  };
  const mockLocalCurrencyListResponse = {
    configlist: [{ value: 'USD', seq: '1' }, { value: 'HKD', seq: '2' }, { value: 'EUR', seq: '3' }, { value: 'UKL', seq: '4' }, { value: 'CNY', seq: '5' }]
  };

  const mockSenderCountryCode = 'HK';

  const mockUSCurrencyList = [{ iataCode: 'HKD', isoCode: 'HKD', description: 'Hong Kong Dollar', symbol: '$' }, { iataCode: 'EUR', isoCode: 'EUR', description: 'Euro', symbol: '€' }, { iataCode: 'CNY', isoCode: 'CNY', description: 'Chinese Renminbi', symbol: '¥' }, { iataCode: 'UKL', isoCode: 'GBP', description: 'UK Pounds Sterling', symbol: '£' }, { iataCode: 'USD', isoCode: 'USD', description: 'US Dollars', symbol: '$' }, { iataCode: 'ANG', isoCode: 'ANG', description: 'Antilles Guilder', symbol: 'ƒ' }, { iataCode: 'ARN', isoCode: 'ARS', description: 'Argentine Pesos', symbol: '$' }];
  const mockLocalCurrencyList = [{ value: 'USD', seq: '1' }, { value: 'HKD', seq: '2' }, { value: 'EUR', seq: '3' }, { value: 'UKL', seq: '4' }, { value: 'CNY', seq: '5' }];

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
        lastLogin: new Date()
      },
      shipmentDetails: {
        selectedRate: {
          dayOfWeek: 'Mon',
          dateOfArrival: 'Sep 28, 2020',
          timeOfArrival: '08:00',
          totalNetCharge: 3793.85,
          totalBaseCharge: 3239.7,
          surchargeList: [
            {
              type: 'FUEL',
              description: 'Fuel Surcharge',
              amount: [
                {
                  currency: 'HKD',
                  amount: 329.15
                }
              ]
            },
            {
              type: 'PEAK',
              description: 'Peak Surcharge',
              amount: [
                {
                  currency: 'HKD',
                  amount: 225
                }
              ]
            }
          ],
          volumeDiscount: 148.5,
          currency: 'HKD',
          saturdayDelivery: false
        },
        packageDetails: [],
        totalNumberOfPackages: 0,
        totalWeight: 0,
        serviceType: 'INTERNATIONAL_FIRST',
        serviceName: 'FedEx International First®',
        packagingType: '',
        serviceCode: '',
        advancedPackageCode: '',
        totalCustomsOrInvoiceValue: null,
        customsOrInvoiceValueCurrency: '',
        carriageDeclaredValue: null,
        carriageDeclaredValueCurrency: '',
        displayDate: '',
        shipDate: null,
        firstAvailableShipDate: null,
        lastAvailableShipDate: null,
        availableShipDates: [],
        selectedPackageOption: null,
        specialServiceInfo: {
          selectedSignatureOption: {
            key: 'SERVICE_DEFAULT',
            displayText: 'None specified'
          }
        },
      },
      customsDetails: null,
      senderDetails: {
        address1: 'TEST',
        address2: '',
        city: 'NYC',
        contactName: 'Derrick Chan',
        countryCode: 'HK',
        countryName: 'Hong Kong',
        postalCode: '',
        emailAddress: 'derrick.chan@fedex.com',
        postalAware: false,
        stateAware: false,
        phoneNumber: '912365478',
        saveContact: false
      },
      recipientDetails: [
        {
          address1: 'TEST',
          address2: '',
          address3: '',
          residential: false,
          companyName: '',
          contactName: 'TEST',
          city: 'New York',
          countryCode: 'US',
          countryName: 'United States',
          postalCode: '10001',
          postalAware: true,
          stateAware: true,
          phoneNumber: '912365478',
          phoneExt: '',
          taxId: '',
          passportNumber: ''
        }
      ],
      paymentDetails: null,
      shipmentConfirmation: null
    }
  };

  beforeEach(async(() => {
    const mockConfig = testConfig.config;

    class APIMGlobalTradeServiceStub {
      getCurrencies() {
        return Observable.create((observer: Observer<any>) => {
          observer.next(mockUSCurrencyListResponse);
        });
      }
    }

    class CurrencyUomComConfigurationServiceStub {
      getConfigurationAsPerCountryCodeAndType(countryCode: string, type: string) {
        return Observable.create((observer: Observer<any>) => {
          observer.next(mockLocalCurrencyListResponse);
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
      declarations: [Step2CustomsDetailsPage],
      imports: [
        RouterTestingModule,
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
        { provide: APIMGlobalTradeService, useClass: APIMGlobalTradeServiceStub },
        { provide: CurrencyUomComConfigurationService, userClass: CurrencyUomComConfigurationServiceStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Step2CustomsDetailsPage);
    store = TestBed.inject(MockStore);
    component = fixture.componentInstance;
    fixture.detectChanges();
    spyOn(store, 'dispatch').and.callFake(() => { });
  }));

  beforeEach(() => {
    const mockUSCurrencySelector = store.overrideSelector(fromShippingSelector.selectCurrencyListUS, mockUSCurrencyList);
    const mockSenderSeletor = store.overrideSelector(fromShippingSelector.selectSenderCountryCode, mockSenderCountryCode);
    const mockLocalCurrencySelector = store.overrideSelector(fromShippingSelector.selectCurrencyListLocal, mockLocalCurrencyList);
  });

  afterEach(() => {
    fixture.destroy();
  });

  fit('should create', () => {
    expect(component).toBeTruthy();
  });

  fit('Should call ngOnInit and Initialise Store Selectors', fakeAsync(() => {
    fixture.detectChanges();
    spyOn(component, 'handleCurrencyUSApiSuccess');
    spyOn(component, 'handleCurrencyLocalApiSuccess');
    spyOn(component, 'getCurrencyList');
    spyOn(component, 'selectSenderCoutryCode');
    component.ngOnInit();
    expect(component.getCurrencyList).toHaveBeenCalled();
    expect(component.handleCurrencyUSApiSuccess).toHaveBeenCalled();
    expect(component.handleCurrencyLocalApiSuccess).toHaveBeenCalled();
    expect(component.selectSenderCoutryCode).toHaveBeenCalled();
  }));

  fit('getCurrencyLists should dispatch action getCurrencyListUSApiBegin, getCurrencyListLocalApiBegin.', fakeAsync(() => {
    component.ngOnInit();
    expect(store.dispatch).toHaveBeenCalledWith(getCurrencyListUSApiBegin());
    expect(store.dispatch).toHaveBeenCalledWith(getCurrencyListLocalApiBegin({ countryCode: 'HK', configType: 'CURRENCY' }));
    tick();
    expect(component.currencyListUS.length).toBeGreaterThan(0);
    expect(component.currencyListLocal.length).toBeGreaterThan(0);
  }));

  fit('should return mapped currency list.', fakeAsync(() => {
    component.currencyListLocal = mockLocalCurrencyList;
    component.currencyListUS = mockUSCurrencyList;
    fixture.detectChanges();
    const mappedCurrencyList = component.mapLocalCurrencyListToUSCurrencyList();
    expect(mappedCurrencyList[0].isoCode).toEqual('USD');
  }));

  fit('should return merged currency list.', () => {
    component.currencyListLocal = mockLocalCurrencyList;
    component.currencyListUS = mockUSCurrencyList;
    fixture.detectChanges();
    component.mergeCurrencyListLocalAndUS();
    expect(component.mergedCurrencyList[0].isoCode).toEqual('USD');
    expect(component.mergedCurrencyList.length).toEqual(mockUSCurrencyList.length);
  });

  fit('should not return Merge currency list if local list not present .', () => {
    component.currencyListLocal = null;
    component.currencyListUS = mockUSCurrencyList;
    fixture.detectChanges();
    component.mergeCurrencyListLocalAndUS();
    expect(component.mergedCurrencyList).toBeFalsy;

  });

  fit('should save merged currency list to store.', () => {
    component.currencyListLocal = mockLocalCurrencyList;
    component.currencyListUS = mockUSCurrencyList;
    fixture.detectChanges();
    component.mergeCurrencyListLocalAndUS();
    expect(store.dispatch).toHaveBeenCalledWith(saveMergedCurrencyListAction({ mergedCurrencyList: component.mergedCurrencyList }));
  });

  fit('should call SenderRecipientInfo and DocumentDescription API onload', () => {
    spyOn(component, 'saveSenderRecipientInfoToStore');
    component.ngOnInit();
    expect(component.senderCountryCode).toEqual('HK');
    expect(component.recipientCountryCode).toEqual('US');
    expect(component.saveSenderRecipientInfoToStore).toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith(getDocumentDescriptionsBegin({
      senderCountryCode: component.senderCountryCode,
      recipientCountryCode: component.recipientCountryCode,
      setAdvanced: false
    }));
  });

  fit('should have isEditFromSummary to be true, when editFromSummary calls with true.', () => {
    component.editFromSummary(true);
    fixture.detectChanges();
    expect(component.currentStep).toEqual('5');
    expect(component.isEditFromSummary).toBe(true);
  });

  fit('should have isEditFromSummary to be false, when editFromSummary calls with false.', () => {
    component.editFromSummary(false);
    fixture.detectChanges();
    expect(component.currentStep).toEqual('2');
    expect(component.isEditFromSummary).toBe(false);
  });

  fit('should update customs details when selected type is ITEM getCustomsInfoByCustomsType', () => {
    spyOn(component, 'updateCustomsDetails');
    component.customsInfoState = {
      commodityList: [{
        description: 'test item',
        name: ItemsType.ELECTRONICS,
        countryOfManufacture: 'China',
        qtyUnitLabel: '2',
        quantity: 2,
        quantityUnits: 'PCS',
        totalCustomsValue: 200,
        totalWeight: 10,
        totalWeightUnit: 'KG',
        totalWeightUnitLabel: 'KG',
        unitPrice: 'USD',
        hsCode: ''
      }],
      customsType: CustomsType.ITEM,
      productType: '',
      productPurpose: '',
      documentType: '',
      documentTypeCode: '',
      documentValue: 200,
      documentValueUnits: 'USD'
    };
    component.displayCustomsType(CustomsType.ITEM);
    fixture.detectChanges();
    expect(component.updateCustomsDetails).toHaveBeenCalled();
    expect(component.documentSelected).toBe(false);
    expect(component.itemSelected).toBe(true);
  });

  fit('should update customs details when selected type is ITEM getCustomsInfoByCustomsType and customs details not present', () => {
    spyOn(component, 'updateCustomsDetails')
    component.displayCustomsType(CustomsType.ITEM);
    fixture.detectChanges();
    expect(component.updateCustomsDetails).toHaveBeenCalled();
    expect(component.documentSelected).toBe(false);
    expect(component.itemSelected).toBe(true);
  });

  fit('should update customs details when selected type is DOCUMENT.', () => {
    component.customsInfoState = {
      commodityList: [{
        description: 'test',
        name: '',
        countryOfManufacture: '',
        qtyUnitLabel: '',
        quantity: 0,
        quantityUnits: '',
        totalCustomsValue: 200,
        totalWeight: 0,
        totalWeightUnit: '',
        totalWeightUnitLabel: '',
        unitPrice: 'USD',
        hsCode: ''
      }],
      customsType: CustomsType.DOCUMENT,
      productType: '',
      productPurpose: '',
      documentType: '',
      documentTypeCode: '',
      documentValue: 200,
      documentValueUnits: 'USD'
    };
    spyOn(component, 'updateCustomsDetails')
    component.displayCustomsType(CustomsType.DOCUMENT);
    fixture.detectChanges();
    expect(component.updateCustomsDetails).toHaveBeenCalled();
    expect(component.documentSelected).toBe(true);
    expect(component.itemSelected).toBe(false);
  });

  fit('should update customs details when selected type is DOCUMENT and customs details not present', () => {
    spyOn(component, 'updateCustomsDetails')
    component.displayCustomsType(CustomsType.DOCUMENT);
    fixture.detectChanges();
    expect(component.updateCustomsDetails).toHaveBeenCalled();
    expect(component.documentSelected).toBe(true);
    expect(component.itemSelected).toBe(false);
  });

  fit('should update customs details when selected type is DOCUMENT.', () => {
    component.customsInfoState = {
      commodityList: [{
        description: 'test',
        name: '',
        countryOfManufacture: '',
        qtyUnitLabel: '',
        quantity: 0,
        quantityUnits: '',
        totalCustomsValue: 200,
        totalWeight: 0,
        totalWeightUnit: '',
        totalWeightUnitLabel: '',
        unitPrice: 'USD',
        hsCode: ''
      }],
      customsType: CustomsType.DOCUMENT,
      productType: '',
      productPurpose: '',
      documentType: '',
      documentTypeCode: '',
      documentValue: 200,
      documentValueUnits: 'USD'
    };
    component.displayCustomsType(CustomsType.DOCUMENT);
    fixture.detectChanges();
    expect(store.dispatch).toHaveBeenCalled();
    expect(component.documentSelected).toBe(true);
    expect(component.itemSelected).toBe(false);
  });

  fit('should update customs details when selected type is DOCUMENT.', () => {
    component.updateShipmentDetails(null);
    expect(store.dispatch).toHaveBeenCalled();
  });

  fit('should get shipment details from store', ()=>{
    store.overrideSelector(fromShippingSelector.selectShipmentDetails, initialState.shippingApp.shipmentDetails);
    component.selectShipmentInfo();
    expect(component.shipmentInfoState).toEqual(initialState.shippingApp.shipmentDetails);
  });

});
