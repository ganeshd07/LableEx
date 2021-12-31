import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TranslateLoader, TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { AppState } from 'src/app/+store/app.state';
import { LanguageLoader } from 'src/app/app.module';
import { getUomListLocalApiBegin, getUomListUSApiBegin, saveMergedUomListAction, updateCustomsDetailsBegin } from '../+store/shipping.actions';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomsCommodityDetailsPage } from './customs-commodity-details.page';
import { RestrictInputLengthDirective } from './../../../providers/directives/restrict-input-length.directive';
import * as fromShippingSelector from '../../shipping/+store/shipping.selectors';
import { Observable } from 'rxjs/internal/Observable';
import { Observer } from 'rxjs/internal/types';
import * as testConfig from '../../../../assets/config/mockConfigForTest';
import { CurrencyUomComConfigurationService } from 'src/app/core/providers/local/currency-uom-com-configuration.service';
import { NotificationService } from 'src/app/core/providers/notification-service';
import { KeyTextList } from 'src/app/interfaces/api-service/common/key-text-list';
import { LocalCommodityService } from 'src/app/core/providers/local/commodity.service';
import { ConfigService } from '@ngx-config/core';
import { AccountType } from 'src/app/types/enum/account-type.enum';
import { SystemCommodity } from 'src/app/interfaces/api-service/response/system-commodity';
import { mockDataResponse } from 'src/app/types/constants/mock-data-response.constants';
import { CountryLocale } from 'src/app/types/constants/country-locale.constants';
import { CommodityManufactureResponse } from 'src/app/interfaces/api-service/response/commodity-manufacture-response.interface';
import { SessionItems } from 'src/app/types/enum/session-items.enum';

fdescribe('CustomsCommodityDetailsPage', () => {
  let component: CustomsCommodityDetailsPage;
  let fixture: ComponentFixture<CustomsCommodityDetailsPage>;
  let store: MockStore<AppState>;

  const mockCurrencyList = [
    { iataCode: 'HKD', isoCode: 'HKD', description: 'Hong Kong Dollar', symbol: '$' },
    { iataCode: 'EUR', isoCode: 'EUR', description: 'Euro', symbol: '€' },
    { iataCode: 'CNY', isoCode: 'CNY', description: 'Chinese Renminbi', symbol: '¥' },
    { iataCode: 'UKL', isoCode: 'GBP', description: 'UK Pounds Sterling', symbol: '£' },
    { iataCode: 'USD', isoCode: 'USD', description: 'US Dollars', symbol: '$' },
    { iataCode: 'ANG', isoCode: 'ANG', description: 'Antilles Guilder', symbol: 'ƒ' },
    { iataCode: 'ARN', isoCode: 'ARS', description: 'Argentine Pesos', symbol: '$' }
  ];

  const mockLocalUomListResponse = {
    "configlist": [
      { value: "PCS", seq: "1" },
      { value: "BOX", seq: "2" },
      { value: "CM", seq: "3" },
      { value: "CG", seq: "4" },
      { value: "FT", seq: "5" },
      { value: "GAL", seq: "6" }
    ]
  };

  const mockUSUomList = [
    { key: "PCS", displayText: "pieces" },
    { key: "BOX", displayText: "box" },
    { key: "CM", displayText: "centimeters" },
    { key: "CG", displayText: "centigrams" },
    { key: "FT", displayText: "feet" },
    { key: "GAL", displayText: "gallon" }
  ];

  const mockLocalUomList = [
    { value: "PCS", seq: "1" },
    { value: "BOX", seq: "2" },
    { value: "CM", seq: "3" },
    { value: "CG", seq: "4" },
    { value: "FT", seq: "5" },
    { value: "GAL", seq: "6" }
  ];

  const mockUSUomListQuantity: KeyTextList = {
    keyTexts: [
      { key: "PCS", displayText: "pieces" },
      { key: "BOX", displayText: "box" },
      { key: "CM", displayText: "centimeters" },
      { key: "CG", displayText: "centigrams" },
      { key: "FT", displayText: "feet" },
      { key: "GAL", displayText: "gallon" }
    ]
  };

  const mockSenderRecipientInfo = {
    packageContentsIndicator: 'REQUIRED',
    taxIdInfo: {
      sender: {
        federal: 'OPTIONAL',
        state: 'NOTALLOWED'
      },
      recipient: {
        federal: 'OPTIONAL',
        state: 'NOTALLOWED'
      }
    },
    customsClearance: 'REQUIRED',
    commercialInvoiceSupport: {
      invoiceNumber: 'NOTALLOWED'
    },
    notaFiscal: 'NOTALLOWED',
    customsValueSupport: {
      customsValue: 'REQUIRED',
      notAllowedDocumentDescriptions: [
        'CORRESPONDENCE_NO_COMMERCIAL_VALUE'
      ]
    },
    goodsInFreeCirculation: 'NOTALLOWED',
    itemDescriptionForClearanceIndicator: 'NOTALLOWED',
    documentDescriptionIndicator: 'NOTALLOWED',
    shipmentPurposeIndicator: 'REQUIRED',
    shipmentPurposeForServiceTypeSelectionIndicator: 'NOTALLOWED',
    freightOnValueIndicator: 'NOTALLOWED',
    recipientResidentialIndicator: 'NOTALLOWED',
    deliveryInstructionsIndicator: 'NOTALLOWED',
    notAllowedDeclaredValueDocumentDescriptions: [
      'CORRESPONDENCE_NO_COMMERCIAL_VALUE'
    ]
  };

  const storeSpy = jasmine.createSpyObj('store', ['dispatch', 'select']);
  const mockSaveCommodityResponse = {
    commodityId: "100045"
  }

  const mockSystemCommodityData: SystemCommodity[] = [
    { commodityId: '305', description: 'Air Fryer' },
    { commodityId: '306', description: 'Apple TV' },
    { commodityId: '307', description: 'Bakery and biscuit oven' },
    { commodityId: '308', description: 'Bass' },
    { commodityId: '309', description: 'Bluetooth Laser Mouse' },
    { commodityId: '310', description: 'Burglar alarm' },
    { commodityId: '311', description: 'charges' }
  ];
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
      shipmentDetails: {
        selectedRate: {
          dayOfWeek: 'Mon',
          dateOfArrival: 'Dec 04, 2020',
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
        packageDetails: [
          {
            packageCode: '',
            packageQuantity: 1,
            packageWeight: '5',
            packageWeightUnit: 'KG',
            packageDimensionLength: 5,
            packageDimensionWidth: 5,
            packageDimensionHeight: 5,
            packageDimensionUnit: 'CM',
            yourPackageDescription: ''
          },
          {
            packageCode: '',
            packageQuantity: 1,
            packageWeight: '2',
            packageWeightUnit: 'KG',
            packageDimensionLength: 2,
            packageDimensionWidth: 2,
            packageDimensionHeight: 2,
            packageDimensionUnit: '',
            yourPackageDescription: ''
          }
        ],
        totalNumberOfPackages: 2,
        totalWeight: 7,
        serviceType: 'INTERNATIONAL_FIRST',
        serviceName: 'FedEx International First®',
        packagingType: 'YOUR_PACKAGING',
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
        specialServiceInfo: null
      },
      customsDetails: {
        commodityList: [
          {
            name: 'Electronics',
            description: 'ELECTRONIC COMPONENTS',
            countryOfManufacture: 'China',
            quantity: 5,
            quantityUnits: 'pcs',
            qtyUnitLabel: 'Pieces',
            totalWeight: 10,
            totalWeightUnit: 'kg',
            totalWeightUnitLabel: 'Kilogram',
            totalCustomsValue: 1500,
            unitPrice: 'HK$',
            hsCode: null
          }
        ],
        customsType: 'nondoc',
        productType: '',
        productPurpose: 'commercial',
        documentType: '',
        documentTypeCode: '',
        documentValue: null,
        documentValueUnits: ''
      },
      senderDetails: null,
      recipientDetails: null,
      paymentDetails: null,
      shipmentConfirmation: null
    }
  };

  beforeEach(async(() => {
    const mockConfig = testConfig.config;
    class LocalCommodityServiceStub {
      saveUserCommodity(commodityDetails) {
        return Observable.create((observer: Observer<any>) => {
          observer.next(mockSaveCommodityResponse);
        });
      }
    }

    class CurrencyUomComConfigurationServiceStub {
      getConfigurationAsPerCountryCodeAndType(countryCode: string, type: string) {
        return Observable.create((observer: Observer<any>) => {
          observer.next(mockLocalUomListResponse);
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
      declarations: [
        CustomsCommodityDetailsPage,
        RestrictInputLengthDirective
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
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([])
      ],
      providers: [
        TranslatePipe,
        provideMockStore({ initialState }),
        NotificationService,
        { provide: ConfigService, useClass: ConfigServiceStub },
        { provide: LocalCommodityService, useClass: LocalCommodityServiceStub },
        { provide: CurrencyUomComConfigurationService, userClass: CurrencyUomComConfigurationServiceStub }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(CustomsCommodityDetailsPage);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch').and.callFake(() => { });
    fixture.detectChanges();
  }));

  beforeEach(() => {
    const mockUSUomSelector = store.overrideSelector(fromShippingSelector.selectUnitOfMeasure, mockUSUomListQuantity);
    const mockLocalUomSelector = store.overrideSelector(fromShippingSelector.selectUomListLocal, mockLocalUomList);
    const mockselectSystemCommodityListSelector = store.overrideSelector(fromShippingSelector.selectMergedSubCategoryCommodityList, mockSystemCommodityData);
  });

  afterEach(() => {
    fixture.destroy();
  });

  fit('should create', () => {
    expect(component).toBeTruthy();
  });

  fit('should highlight the icon and select the item type - ELECTRONICS', () => {
    const itemsTypeE = component.eItemsType;
    spyOn(component, 'openSearchCommodityModal');
    component.selectItemsType(itemsTypeE.ELECTRONICS);
    expect(component.isItemTypeSelected(itemsTypeE.ELECTRONICS)).toBeTruthy();
    expect(component.isItemTypeSelected(itemsTypeE.JEWELLERY)).toBeFalsy();
    expect(component.isItemTypeSelected(itemsTypeE.HEALTH_CARE)).toBeFalsy();
    expect(component.isItemTypeSelected(itemsTypeE.GARMENTS)).toBeFalsy();
    expect(component.isItemTypeSelected(itemsTypeE.LITHIUM_BATTERY)).toBeFalsy();
    expect(component.isItemTypeSelected(itemsTypeE.OTHERS)).toBeFalsy();
    expect(component.openSearchCommodityModal).toHaveBeenCalledWith();
  });

  fit('should highlight the icon and select the item type - JEWELLERY', () => {
    const itemsTypeE = component.eItemsType;
    spyOn(component, 'openSearchCommodityModal');
    component.selectItemsType(itemsTypeE.JEWELLERY);
    expect(component.isItemTypeSelected(itemsTypeE.ELECTRONICS)).toBeFalsy();
    expect(component.isItemTypeSelected(itemsTypeE.JEWELLERY)).toBeTruthy();
    expect(component.isItemTypeSelected(itemsTypeE.HEALTH_CARE)).toBeFalsy();
    expect(component.isItemTypeSelected(itemsTypeE.GARMENTS)).toBeFalsy();
    expect(component.isItemTypeSelected(itemsTypeE.LITHIUM_BATTERY)).toBeFalsy();
    expect(component.isItemTypeSelected(itemsTypeE.OTHERS)).toBeFalsy();
    expect(component.openSearchCommodityModal).toHaveBeenCalledWith();
  });

  fit('should highlight the icon and select the item type - HEALTH CARE', () => {
    const itemsTypeE = component.eItemsType;
    spyOn(component, 'openSearchCommodityModal');
    component.selectItemsType(itemsTypeE.HEALTH_CARE);
    expect(component.isItemTypeSelected(itemsTypeE.ELECTRONICS)).toBeFalsy();
    expect(component.isItemTypeSelected(itemsTypeE.JEWELLERY)).toBeFalsy();
    expect(component.isItemTypeSelected(itemsTypeE.HEALTH_CARE)).toBeTruthy();
    expect(component.isItemTypeSelected(itemsTypeE.GARMENTS)).toBeFalsy();
    expect(component.isItemTypeSelected(itemsTypeE.LITHIUM_BATTERY)).toBeFalsy();
    expect(component.isItemTypeSelected(itemsTypeE.OTHERS)).toBeFalsy();
    expect(component.openSearchCommodityModal).toHaveBeenCalledWith();
  });

  fit('should highlight the icon and select the item type - GARMENTS', () => {
    const itemsTypeE = component.eItemsType;
    spyOn(component, 'openSearchCommodityModal');
    component.selectItemsType(itemsTypeE.GARMENTS);
    expect(component.isItemTypeSelected(itemsTypeE.ELECTRONICS)).toBeFalsy();
    expect(component.isItemTypeSelected(itemsTypeE.JEWELLERY)).toBeFalsy();
    expect(component.isItemTypeSelected(itemsTypeE.HEALTH_CARE)).toBeFalsy();
    expect(component.isItemTypeSelected(itemsTypeE.GARMENTS)).toBeTruthy();
    expect(component.isItemTypeSelected(itemsTypeE.LITHIUM_BATTERY)).toBeFalsy();
    expect(component.isItemTypeSelected(itemsTypeE.OTHERS)).toBeFalsy();
    expect(component.openSearchCommodityModal).toHaveBeenCalledWith();
  });

  fit('should highlight the icon and select the item type - LITHIUM BATTERY', () => {
    const itemsTypeE = component.eItemsType;
    spyOn(component, 'openSearchCommodityModal');
    component.selectItemsType(itemsTypeE.LITHIUM_BATTERY);
    expect(component.isItemTypeSelected(itemsTypeE.ELECTRONICS)).toBeFalsy();
    expect(component.isItemTypeSelected(itemsTypeE.JEWELLERY)).toBeFalsy();
    expect(component.isItemTypeSelected(itemsTypeE.HEALTH_CARE)).toBeFalsy();
    expect(component.isItemTypeSelected(itemsTypeE.GARMENTS)).toBeFalsy();
    expect(component.isItemTypeSelected(itemsTypeE.LITHIUM_BATTERY)).toBeTruthy();
    expect(component.isItemTypeSelected(itemsTypeE.OTHERS)).toBeFalsy();
    expect(component.openSearchCommodityModal).toHaveBeenCalledWith();
  });

  fit('should highlight the icon and select the item type - OTHERS', () => {
    const itemsTypeE = component.eItemsType;
    spyOn(component, 'openSearchCommodityModal');
    component.selectItemsType(itemsTypeE.OTHERS);
    expect(component.isItemTypeSelected(itemsTypeE.ELECTRONICS)).toBeFalsy();
    expect(component.isItemTypeSelected(itemsTypeE.JEWELLERY)).toBeFalsy();
    expect(component.isItemTypeSelected(itemsTypeE.HEALTH_CARE)).toBeFalsy();
    expect(component.isItemTypeSelected(itemsTypeE.GARMENTS)).toBeFalsy();
    expect(component.isItemTypeSelected(itemsTypeE.LITHIUM_BATTERY)).toBeFalsy();
    expect(component.isItemTypeSelected(itemsTypeE.OTHERS)).toBeTruthy();
    expect(component.openSearchCommodityModal).toHaveBeenCalledWith();
  });

  fit('should retrieved list of country of manufacture for HONG KONG [HK]', () => {
    const mockCountryManufactureList = [{
      code: 'HK',
      actualCountryCode: 'HK',
      name: 'Hong Kong, China'
    }];
    store.overrideSelector(fromShippingSelector.selectMergedCountryOfManufactureList, mockCountryManufactureList);
    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'HK');
    component.ngOnInit();

    const commodityManufactureList = component.countryManufactureList;
    const defaultCountryManufacture = commodityManufactureList[0].name;
    expect(commodityManufactureList.length).toEqual(1);

    const commodityForm = component.commodityForm.controls;
    expect(commodityForm.countryOfManufacture.value).toEqual(defaultCountryManufacture);
  });

  fit('should retrieved list of US item quantity units', fakeAsync(() => {
    component.ngOnInit();
    tick();
    expect(component.uomListUS.length).toEqual(6);
  }));

  /**
   * TODO: This test case scenario is incorrect and needs to update
   * Temporarily skipped to be fixed.
   */
  xit('should be able to Dispatch an action when click on Update.', () => {
    store.overrideSelector(fromShippingSelector.selectMergedCurrencyList, mockCurrencyList);
    component.ngOnInit();
    component.commodityForm.get('quantityUnit').setValue('PCS');
    component.commodityForm.get('totalWeightUnit').setValue('kg');
    component.commodityForm.get('customsValueCurrency').setValue('USD');
    component.uomList = mockUSUomList;
    fixture.detectChanges();
    component.updateCommodityDetails();
    expect(store.dispatch).toHaveBeenCalledWith(updateCustomsDetailsBegin({
      id: component.editIndex,
      commodity: component.mapCommodityToShippingApp()
    }));
  });

  fit('should be populate data when the id equal to 0.', () => {
    component.editIndex = 0;
    const commodityItemList = initialState.shippingApp.customsDetails.commodityList;
    component.items = commodityItemList;
    component.uomList = mockUSUomList;
    component.setupEditFrom();
    expect(component.items.length).toEqual(1);
    expect(component.form.itemDescription.value).toContain(commodityItemList[0].description);
    expect(component.form.quantity.value).toBe(commodityItemList[0].quantity);
    expect(component.form.quantityUnit.value).toContain(commodityItemList[0].quantityUnits);
    expect(component.form.totalWeight.value).toBe(commodityItemList[0].totalWeight);
    expect(component.form.totalWeightUnit.value).toContain(commodityItemList[0].totalWeightUnit);
    expect(component.form.totalCustomsValue.value).toBe(commodityItemList[0].totalCustomsValue);
    expect(component.form.customsValueCurrency.value).toContain(commodityItemList[0].unitPrice);
    expect(component.form.hsCode.value).toBe(commodityItemList[0].hsCode);
  });  

  fit('should be able to display confirmation when item length greater then 0', () => {
    store.overrideSelector(fromShippingSelector.selectMergedCurrencyList, mockCurrencyList);
    const commodityItemList = initialState.shippingApp.customsDetails.commodityList;
    component.items = commodityItemList;
    spyOn(component, 'getThecustomsDetailsStateFromStore');
    component.ngOnInit();
    expect(component.getThecustomsDetailsStateFromStore).toHaveBeenCalled();    
  });

  fit('should be able to display toast pop up when showAlert is true', () => {
    store.overrideSelector(fromShippingSelector.selectMergedCurrencyList, mockCurrencyList);
    spyOn(component, 'presentToast');
    component.uomList = mockUSUomList;
    component.prevCurrencyValue = 'HKD';
    component.updatedCurrencyValue = 'USD'
    component.ngOnInit();
    component.commodityForm.get('quantityUnit').setValue('PCS');
    component.commodityForm.get('totalWeightUnit').setValue('kg');
    component.commodityForm.get('customsValueCurrency').setValue('USD');
    fixture.detectChanges();
    component.updateCommodityList();

    expect(component.presentToast).toHaveBeenCalled();
  });

  fit('should have invalid customs value field, when more than 10 digit entered in customs value field.', () => {
    component.commodityForm.get('totalCustomsValue').setValue('123456789123456789');
    fixture.detectChanges();
    expect(component.commodityForm.get('totalCustomsValue').valid).toBeFalse;
  });

  fit('should validate total customs value when user enters 0 value.', () => {
    store.overrideSelector(fromShippingSelector.selectSenderRecipientInfo, mockSenderRecipientInfo);
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.isRequiredCustomsValue).toBeTruthy();
    component.commodityForm.get('totalCustomsValue').setValue('0');
    expect(component.commodityForm.get('totalCustomsValue').valid).toBeFalse;
  });

  fit('should have invalid customs value field and show error when more than 2 decimal points digit entered in customs value field.', () => {
    component.commodityForm.get('totalCustomsValue').setValue('1234.1233');
    fixture.detectChanges();
    expect(component.commodityForm.get('totalCustomsValue').valid).toBeFalse;
    expect(component.form.totalCustomsValue.hasError('pattern')).toBeTruthy();
  });

  fit('should have valid customs value field and no error when valid custom value entered.', () => {
    component.commodityForm.get('totalCustomsValue').setValue('1234.12');
    fixture.detectChanges();
    expect(component.commodityForm.get('totalCustomsValue').valid).toBeTruthy();
    expect(component.form.totalCustomsValue.hasError('pattern')).toBeFalse;
  });

  fit('should have get currency list from store.', () => {
    store.overrideSelector(fromShippingSelector.selectMergedCurrencyList, mockCurrencyList);
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.currencyList.length).toBeGreaterThan(0);
    expect(component.currencyList[0].isoCode).toEqual('HKD');
  })

  fit('should return merged list of country of manufacture', () => {
    const mockCountryManufactureList = [{
      code: 'HK',
      actualCountryCode: 'HK',
      name: 'Hong Kong, China'
    },
    {
      code: 'CN',
      actualCountryCode: 'CN',
      name: 'China'
    }];
    store.overrideSelector(fromShippingSelector.selectMergedCountryOfManufactureList, mockCountryManufactureList);
    fixture.detectChanges();
    component.getMergedCountryOfManufactureList();
    expect(component.countryManufactureList.length).toBeGreaterThan(0);
  });

  fit('Should call ngOnInit and Initialise Store Selectors', fakeAsync(() => {
    fixture.detectChanges();
    spyOn(component, 'handleUomUSApiSuccess');
    spyOn(component, 'handleUomLocalApiSuccess');
    spyOn(component, 'getUomList');
    component.ngOnInit();
    expect(component.getUomList).toHaveBeenCalled();
    expect(component.handleUomUSApiSuccess).toHaveBeenCalled();
    expect(component.handleUomLocalApiSuccess).toHaveBeenCalled();
  }));

  fit('getUomLists should dispatch action getUomListUSApiBegin, getUomListLocalApiBegin.', fakeAsync(() => {
    component.ngOnInit();
    expect(store.dispatch).toHaveBeenCalledWith(getUomListUSApiBegin());
    expect(store.dispatch).toHaveBeenCalledWith(getUomListLocalApiBegin({ countryCode: 'APAC', configType: 'UOM' }));
    tick();
    expect(component.uomListUS.length).toBeGreaterThan(0);
    expect(component.uomListLocal.length).toBeGreaterThan(0);
  }));

  fit('should return mapped UOM list.', fakeAsync(() => {
    component.uomListLocal = mockLocalUomList;
    component.uomListUS = mockUSUomListQuantity.keyTexts;
    fixture.detectChanges();
    const mappedUomList = component.mapLocalUomListToUSUomList();
    expect(mappedUomList[0].key).toEqual("PCS");
  }));

  fit('should return merged UOM list.', () => {
    component.uomListLocal = mockLocalUomList;
    component.uomListUS = mockUSUomListQuantity.keyTexts;
    fixture.detectChanges();
    component.mergeUomListLocalAndUS();
    expect(component.mergedUomList[0].key).toEqual("PCS");
    expect(component.mergedUomList.length).toEqual(mockUSUomList.length);
  });

  fit('should save merged UOM list to store.', () => {
    component.uomListLocal = mockLocalUomList;
    component.uomListUS = mockUSUomListQuantity.keyTexts;
    fixture.detectChanges();
    component.mergeUomListLocalAndUS();
    expect(store.dispatch).toHaveBeenCalledWith(saveMergedUomListAction({ mergedUomList: component.mergedUomList }));
  });

  fit('should retrieved list of country of manufacture for CHINA [CN]', () => {
    const mockCountryManufactureList = [
      {
        code: 'CN',
        actualCountryCode: 'CN',
        name: 'China'
      }, {
        code: 'HK',
        actualCountryCode: 'HK',
        name: 'Hong Kong, China'
      }
    ];
    store.overrideSelector(fromShippingSelector.selectMergedCountryOfManufactureList, mockCountryManufactureList);

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'CN');
    component.ngOnInit();
    const commodityManufactureList = component.countryManufactureList;
    const defaultCountryManufacture = commodityManufactureList[0].name;
    expect(commodityManufactureList.length).toEqual(2);

    const commodityForm = component.commodityForm.controls;
    expect(commodityForm.countryOfManufacture.value).toEqual(defaultCountryManufacture);
  });

  fit('should retrieved list of customs value currencies for CHINA [CN]', () => {
    initialState.shippingApp.customsDetails.commodityList = [];
    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'CN');
    component.ngOnInit();
    const customsValueCurrencyList = component.currencyList;
    expect(customsValueCurrencyList.length).toEqual(14);

    expect(component.commodityForm.controls.customsValueCurrency.value).toEqual('CNY');
  });

  fit('should retrieved list of customs value currencies for Hong Kong [HK]', () => {
    initialState.shippingApp.customsDetails.commodityList = [];
    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'HK');
    component.ngOnInit();
    const customsValueCurrencyList = component.currencyList;
    expect(customsValueCurrencyList.length).toEqual(14);

    expect(component.commodityForm.controls.customsValueCurrency.value).toEqual('HKD');
  });

  fit('should retrieved list of customs value currencies for default country (Non HK/CN)', () => {
    initialState.shippingApp.customsDetails.commodityList = [];
    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'US');
    component.ngOnInit();
    const customsValueCurrencyList = component.currencyList;
    expect(customsValueCurrencyList.length).toEqual(14);

    expect(component.commodityForm.controls.customsValueCurrency.value).toEqual('USD');
  });

  fit('should not Dispatch an action when click on Add Button, when form is invalid.', () => {
    store.overrideSelector(fromShippingSelector.selectMergedCurrencyList, mockCurrencyList);
    component.ngOnInit();
    component.commodityForm.get('totalWeight').setValue('');
    component.commodityForm.get('totalCustomsValue').setValue('');
    component.commodityForm.get('customsValueCurrency').setValue('HKD');
    spyOn(component, 'scrollToFirstInvalidControl');
    component.submitForm();
    expect(component.scrollToFirstInvalidControl).toHaveBeenCalled();
  });

  fit('should Dispatch an action when click on Add Button', () => {
    store.overrideSelector(fromShippingSelector.selectMergedCurrencyList, mockCurrencyList);
    component.ngOnInit()
    spyOn(component, 'updateCommodityList');
    component.commodityForm.get('itemType').setValue('Electronocs');
    component.commodityForm.get('itemDescription').setValue('Apple TV');
    component.commodityForm.get('quantityUnit').setValue('PCS');
    component.commodityForm.get('totalWeightUnit').setValue('kg');
    component.commodityForm.get('customsValueCurrency').setValue('HKD');
    component.commodityForm.get('totalWeight').setValue('1');
    component.commodityForm.get('totalCustomsValue').setValue('1');
    component.commodityForm.get('countryOfManufacture').setValue('CN');
    component.uomList = mockUSUomList;
    fixture.detectChanges();
    component.submitForm();
    expect(component.updateCommodityList).toHaveBeenCalled();
  });

  fit('should get merged uom list from store.', () => {
    store.overrideSelector(fromShippingSelector.selectMergedUomList, mockUSUomList);
    component.ngOnInit();
    component.scrollToFirstInvalidControl();
    component.ionViewDidEnter();
    fixture.detectChanges();
    expect(component.form.quantityUnit.value).toEqual('PCS');
  });

  fit('should get merged uom list from store and select default selected.', () => {
    store.overrideSelector(fromShippingSelector.selectMergedUomList, mockUSUomList);
    component.defaultQtyUnit = 'CG';
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.form.quantityUnit.value).toEqual('CG');
  });

  fit('should change quantity on numeric stepper click.', () => {
    component.ngOnInit();
    component.form.quantity.setValue(0);
    fixture.detectChanges();
    component.onTickNumStepper('add');
    expect(component.form.quantity.value).toEqual(1);
    component.form.quantity.setValue(0);
    component.observeQuantity(Event);
    expect(component.form.quantity.value).toEqual(1);
    component.form.quantity.setValue(2);
    component.onTickNumStepper('subtract');
    expect(component.form.quantity.value).toEqual(1);
    component.form.quantity.setValue(100000);
    component.observeQuantity(Event);
    expect(component.form.quantity.value).toEqual(component.maxQty);
  });

  fit('should get Account Details from store.', () => {
    store.overrideSelector(fromShippingSelector.selectUserLoginDetails, initialState.shippingApp.userAccount);
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.userId).toEqual('123456');
  });

  fit('should make api call when click on Add Button', fakeAsync(() => {
    component.ngOnInit();
    component.userId = '123445';
    component.itemSubCategoryList = mockSystemCommodityData;
    component.selectedValue = 'ABCD';
    component.makeApiCallToSaveNewCommodity();
    tick();
    fixture.detectChanges();
    expect(component.commodityId).toEqual('100045');
  }));

  fit('should call create modal', () => {
    spyOn(component.modalCtrl, 'create');
    component.openSearchCommodityModal();
    expect(component.modalCtrl.create).toHaveBeenCalled();
  });

  fit('should call updateCurrencyDisplayValue', () => {
    store.overrideSelector(fromShippingSelector.selectMergedCurrencyList, mockCurrencyList);
    component.ngOnInit();
    component.commodityForm.get('itemType').setValue('Electronocs');
    component.commodityForm.get('itemDescription').setValue('Apple TV');
    component.commodityForm.get('quantity').setValue('1')
    component.commodityForm.get('quantityUnit').setValue('PCS');
    component.commodityForm.get('totalWeightUnit').setValue('kg');
    component.commodityForm.get('customsValueCurrency').setValue('HKD');
    component.commodityForm.get('totalWeight').setValue('1');
    component.commodityForm.get('totalCustomsValue').setValue('1');
    component.commodityForm.get('countryOfManufacture').setValue('CN');
    component.commodityForm.get('hsCode').setValue('')
    component.uomList = mockUSUomList;
    fixture.detectChanges();
    component.updateCommodityDetails();
    expect(store.dispatch).toHaveBeenCalledWith(updateCustomsDetailsBegin({
      id: component.editIndex,
      commodity: component.mapCommodityToShippingApp()
    }));
  });

  fit('should call scrollToFirstInvalidControl', () => {
    spyOn(component, 'scrollToFirstInvalidControl');
    component.updateCommodityDetails();
    expect(component.scrollToFirstInvalidControl).toHaveBeenCalled();
  });

  fit('should call create modal', () => {
    spyOn(component.toastController, 'create');
    component.presentToast('HKD', 'USD');
    expect(component.toastController.create).toHaveBeenCalled();
  });

  fit('should call showBubbleHintMessage', () => {
    spyOn(component.notif, 'showBubbleHintMessage');
    component.showHsCodeBubbleHint();
    expect(component.notif.showBubbleHintMessage).toHaveBeenCalled();
  });

  fit('should get shipmentDetails', () => {
    store.overrideSelector(fromShippingSelector.selectShipmentDetails, initialState.shippingApp.shipmentDetails);
    component.getShipmentDetails();
    expect(component.packageDetails).toEqual('kg');
  });

  fit('should be able to scroll and set focus on invalid fields', () => {
    component.commodityForm.get('itemType').setValue('Electronocs');
    component.commodityForm.get('itemDescription').setValue('Apple TV');
    component.commodityForm.get('quantity').setValue('1')
    component.commodityForm.get('quantityUnit').setValue('');
    component.commodityForm.get('totalWeightUnit').setValue('kg');
    component.commodityForm.get('customsValueCurrency').setValue('HKD');
    component.commodityForm.get('totalWeight').setValue('1');
    component.commodityForm.get('totalCustomsValue').setValue('');
    component.commodityForm.get('countryOfManufacture').setValue('CN');
    component.commodityForm.get('hsCode').setValue('');
    spyOn(component, 'setFocusOnFirstInvalidInput');
    component.scrollToFirstInvalidControl();
    expect(component.setFocusOnFirstInvalidInput).toHaveBeenCalledWith('quantityUnit');

    component.commodityForm.get('itemType').setValue('Electronocs');
    component.commodityForm.get('itemDescription').setValue('Apple TV');
    component.commodityForm.get('quantity').setValue('1')
    component.commodityForm.get('quantityUnit').setValue('PCS');
    component.commodityForm.get('totalWeightUnit').setValue('kg');
    component.commodityForm.get('customsValueCurrency').setValue('HKD');
    component.commodityForm.get('totalWeight').setValue('');
    component.commodityForm.get('totalCustomsValue').setValue('');
    component.commodityForm.get('countryOfManufacture').setValue('CN');
    component.commodityForm.get('hsCode').setValue('');
    fixture.detectChanges();
    component.scrollToFirstInvalidControl();
    expect(component.commodityForm.get('quantityUnit').valid).toBeTrue;
    expect(component.setFocusOnFirstInvalidInput).toHaveBeenCalledWith('totalWeight');

    component.commodityForm.get('itemType').setValue('Electronocs');
    component.commodityForm.get('itemDescription').setValue('Apple TV');
    component.commodityForm.get('quantity').setValue('1')
    component.commodityForm.get('quantityUnit').setValue('PCS');
    component.commodityForm.get('totalWeightUnit').setValue('kg');
    component.commodityForm.get('customsValueCurrency').setValue('HKD');
    component.commodityForm.get('totalWeight').setValue('1');
    component.commodityForm.get('totalCustomsValue').setValue('100120.07544');
    component.commodityForm.get('countryOfManufacture').setValue('CN');
    component.commodityForm.get('hsCode').setValue('');
    fixture.detectChanges();
    component.scrollToFirstInvalidControl();
    expect(component.setFocusOnFirstInvalidInput).toHaveBeenCalledWith('totalCustomsValue');
  });

});