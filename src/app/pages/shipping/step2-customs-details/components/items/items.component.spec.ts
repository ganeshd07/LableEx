import { async, ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { AppState } from 'src/app/+store/app.state';
import { BrowserService } from 'src/app/core/providers/browser.service';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { ItemsComponent } from './items.component';
import { Router } from '@angular/router';
import { ICommodity } from 'src/app/interfaces/shipping-app/commodity';
import * as fromShippingSelector from '../../../+store/shipping.selectors';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { LanguageLoader } from 'src/app/app.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { APIMGlobalTradeService } from 'src/app/core/providers/apim/global-trade.service';
import * as testConfig from '../../../../../../assets/config/mockConfigForTest';
import { ConfigService } from '@ngx-config/core';
import { BehaviorSubject, Observable, Observer } from 'rxjs';
import { DatePipe } from '@angular/common';
import { ServiceType } from 'src/app/types/enum/service-type.enum';
import { APIMShipmentService, APIMCountryService } from 'src/app/core/providers/apim';
import {
  getCountryOfManufactureUSApimBegin,
  getCountryOfManufactureLocalApiBegin,
  saveMergedCountryOfManufactureListAction
} from '../../../+store/shipping.actions';
import { LocalCommodityService } from 'src/app/core/providers/local'
import { CountryTypes } from 'src/app/types/enum/country-type.enum';
import { NotificationService } from 'src/app/core/providers/notification-service';

fdescribe('ItemsComponent', () => {
  let component: ItemsComponent;
  let fixture: ComponentFixture<ItemsComponent>;
  let mockStore: MockStore;
  const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl', 'navigate', 'then']);
  const mockShipmentPurposeList = {
    "transactionId": "e1978982-2507-42fb-a336-efe6acfdf1bb",
    "output": {
      "keyTexts": [
        {
          "key": "SOLD",
          "displayText": "Commercial"
        },
        {
          "key": "GIFT",
          "displayText": "Gift"
        },
        {
          "key": "SAMPLE",
          "displayText": "Sample"
        },
        {
          "key": "REPAIR_AND_RETURN",
          "displayText": "Repair and return"
        },
        {
          "key": "PERSONAL_EFFECTS",
          "displayText": "Personal effects"
        },
        {
          "key": "NOT_SOLD",
          "displayText": "Personal use"
        }
      ]
    }
  }
  const initialState: AppState = {
    shippingApp: {
      userAccount: null,
      shipmentDetails: {
        packageDetails: [],
        totalNumberOfPackages: null,
        totalWeight: null,
        serviceType: ServiceType.INTERNATIONAL_PRIORITY,
        serviceName: '',
        packagingType: '',
        serviceCode: '',
        advancedPackageCode: '',
        totalCustomsOrInvoiceValue: null,
        customsOrInvoiceValueCurrency: '',
        carriageDeclaredValue: null,
        carriageDeclaredValueCurrency: '',
        displayDate: '',
        shipDate: null,
        selectedRate: null,
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

  const mockCurrencyConversionList = {
    transactionId: '883210c0-b495-43c8-988a-7c3ee678c1a2',
    output: {
      amount: [
        {
          finalRoundedAmount: 6451.71,
          finalUnRoundedAmount: 6451.712801,
          conversionFactor: 0.1290342561,
          type: 'WITH_NO_PREMIUM_APPLIED'
        },
        {
          finalRoundedAmount: 65640.62,
          finalUnRoundedAmount: 6564.617775,
          conversionFactor: 0.1312923555,
          ratePercent: 1.01750,
          type: 'PREMIUM_APPLIED'
        }
      ]
    }
  };

  const mockUSCountryOfManufactureListResponse = [
    {
      "name": "China",
      "code": "CN",
      "actualCountryCode": "CN"
    },
    {
      "name": "Albania",
      "code": "AL",
      "actualCountryCode": "AL"
    },
    {
      "name": "Algeria",
      "code": "DZ",
      "actualCountryCode": "DZ"
    },
    {
      "name": "Honk Kong, China",
      "code": "HK",
      "actualCountryCode": "Hk"
    }
  ];

  const mockLocalCountryOfManufactureListResponse = {
    "configlist": [
      {
        "value": "CN",
        "seq": "1"
      },
      {
        "value": "HK",
        "seq": "2"
      },
      {
        "value": "US",
        "seq": "3"
      },
      {
        "value": "TH",
        "seq": "4"
      },
      {
        "value": "TW",
        "seq": "5"
      }
    ]
  };

  const mockSenderCountryCode: string = "HK";

  const mockUSCountryOfManufactureList = [
    {
      "name": "China",
      "code": "CN",
      "actualCountryCode": "CN"
    },
    {
      "name": "Albania",
      "code": "AL",
      "actualCountryCode": "AL"
    },
    {
      "name": "Algeria",
      "code": "DZ",
      "actualCountryCode": "DZ"
    },
    {
      "name": "Honk Kong, China",
      "code": "HK",
      "actualCountryCode": "Hk"
    }
  ];
  const mockLocalCountryOfManufactureList = [
    {
      "value": "CN",
      "seq": "1"
    },
    {
      "value": "HK",
      "seq": "2"
    },
    {
      "value": "US",
      "seq": "3"
    },
    {
      "value": "TH",
      "seq": "4"
    },
    {
      "value": "TW",
      "seq": "5"
    }
  ];

  beforeEach(async(() => {
    const mockConfig = testConfig.config;
    class APIMGlobalTradeServiceStub {
      getCurrencyConversion(fromCurrencyCode: string, toCurrencyCode: string, amount: number, conversionDate: string) {
        return Observable.create((observer: Observer<any>) => {
          observer.next(mockCurrencyConversionList);
        });
      }
    }

    class APIMShipmentServiceStub {
      getShipmentPurposeByCountryCodesAndServiceType(senderCountryCode: string, recipientCountryCode: string, serviceType: string) {
        return Observable.create((observer: Observer<any>) => {
          observer.next(mockShipmentPurposeList);
        });
      }
    }

    class APIMCountryServiceStub {
      getCommodityManufacture(countryType: CountryTypes) {
        return Observable.create((observer: Observer<any>) => {
          observer.next(mockUSCountryOfManufactureListResponse);
        });
      }
    }

    class LocalCommodityServiceStub {
      getCountryOfManufactureByCountryCodeAndType(countryCode: string, type: string) {
        return Observable.create((observer: Observer<any>) => {
          observer.next(mockLocalCountryOfManufactureListResponse);
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
        ItemsComponent
      ],
      imports: [
        FormsModule,
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
        DatePipe,
        provideMockStore({ initialState }),
        NotificationService,
        { provide: Router, useValue: routerSpy },
        { provide: APIMShipmentService, useClass: APIMShipmentServiceStub },
        { provide: APIMGlobalTradeService, useClass: APIMGlobalTradeServiceStub },
        { private: LocalCommodityService, useClass: LocalCommodityServiceStub },
        { private: APIMCountryService, useClass: APIMCountryServiceStub },
        { provide: ConfigService, useClass: ConfigServiceStub }
      ]
    }).compileComponents()
    fixture = TestBed.createComponent(ItemsComponent);
    mockStore = TestBed.inject(MockStore);
    component = fixture.componentInstance;
    fixture.detectChanges();
    spyOn(mockStore, 'dispatch').and.callFake(() => { });
  }));

  beforeEach(() => {
    let tempShipmentPurpose: any = {
      keyTexts:
        [
          {
            "key": "SOLD",
            "displayText": "Commercial"
          },
          {
            "key": "GIFT",
            "displayText": "Gift"
          },
          {
            "key": "SAMPLE",
            "displayText": "Sample"
          },
          {
            "key": "REPAIR_AND_RETURN",
            "displayText": "Repair and return"
          },
          {
            "key": "PERSONAL_EFFECTS",
            "displayText": "Personal effects"
          },
          {
            "key": "NOT_SOLD",
            "displayText": "Personal use"
          }]
    };
    const mockSelector = mockStore.overrideSelector(fromShippingSelector.selectShipmentPurpose, tempShipmentPurpose.keyTexts);
    const mockUSCOMSelector = mockStore.overrideSelector(fromShippingSelector.selectCountryOfManufactureListUS, mockUSCountryOfManufactureList);
    const mockSenderSeletor = mockStore.overrideSelector(fromShippingSelector.selectSenderCountryCode, mockSenderCountryCode);
    const mockLocalCOMSelector = mockStore.overrideSelector(fromShippingSelector.selectCountryOfManufactureListLocal, mockLocalCountryOfManufactureList);
  });

  afterEach(() => {
    fixture.destroy();
  });

  fit('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * START - Unit Test caases for User Story B-452794 - (Add Items Flow and Scenarios)
   */
  fit('should be able to retrieved list of Shipment purpose', () => {
    fixture.detectChanges();
    component.ngOnInit();
    const shipmentPurposes = component.shipmentPurposeList;
    expect(shipmentPurposes.length).toBeGreaterThanOrEqual(6);
    expect(shipmentPurposes[0]).toEqual({ key: 'SOLD', displayText: 'Commercial' });
    expect(shipmentPurposes[1]).toEqual({ key: 'GIFT', displayText: 'Gift' });
    expect(shipmentPurposes[2]).toEqual({ key: 'SAMPLE', displayText: 'Sample' });
    expect(shipmentPurposes[3]).toEqual({ key: 'REPAIR_AND_RETURN', displayText: 'Repair and return' });
    expect(shipmentPurposes[4]).toEqual({ key: 'PERSONAL_EFFECTS', displayText: 'Personal effects' });
    expect(shipmentPurposes[5]).toEqual({ key: 'NOT_SOLD', displayText: 'Personal use' });
  });

  fit('should display the item values from Main Commodity Screen', () => {
    expect(component.items.length).toBeGreaterThan(0);
    expect(component.customDetailsState).toBe(initialState.shippingApp.customsDetails);
    expect(component.form.shipmentPurpose.value).toEqual('commercial');
    expect(component.form.carriageDeclaredValue.value).toBe('');
    expect(component.form.carriageDeclaredValueCurrency.value).toBe('');
  });

  fit('should be able to toggle higher limit of liability coverage', () => {
    spyOn(component, 'toggleDeclaredValueCarriage');
    fixture.detectChanges();
    const element = fixture.nativeElement;
    element.querySelector('.toggle').dispatchEvent(new Event('ionChange'));
    expect(component.toggleDeclaredValueCarriage).toHaveBeenCalled();
  });
  // END - Unit Test caases for User Story B-452794 - (Add Items Flow and Scenarios)

  /**
   * START - Unit Test caases for User Story B-457897 - (Add More Items Flow and change package content)
   */
  fit('should navigate to main commodity page when "ADD ITEM" or "ADD MORE ITEMS" button is clicked', () => {
    fixture.detectChanges();
    spyOn(component, 'updateCustomsDetails');
    spyOn(component, 'updateShipmentDetails');
    component.goToMainCommodityPage();
    expect(component.updateCustomsDetails).toHaveBeenCalled();
    expect(component.updateShipmentDetails).toHaveBeenCalled();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/shipping/add-item');
  });

  fit('should not navigate to main commodity page, if shipment purpose not selected and  when "ADD ITEM" or "ADD MORE ITEMS" button is clicked', () => {
    component.itemForm.controls.shipmentPurpose.setValue('');
    fixture.detectChanges();
    spyOn(component, 'updateCustomsDetails');
    spyOn(component, 'updateShipmentDetails');    
    component.goToMainCommodityPage();
    expect(component.updateCustomsDetails).not.toHaveBeenCalled();
    expect(component.updateShipmentDetails).not.toHaveBeenCalled();
  });

  fit('should display the newly added items from Main Commodity page', () => {
    const initShippingAppState = initialState.shippingApp;
    const nextCommoditiesState: ICommodity[] = Object.assign([], initShippingAppState.customsDetails.commodityList);
    const mockAdditionalItemEntry = {
      name: 'Garments',
      description: 'Jeans',
      countryOfManufacture: 'China',
      quantity: 20,
      quantityUnits: 'pcs',
      qtyUnitLabel: 'Pieces',
      totalWeight: 10,
      totalWeightUnit: 'kg',
      totalWeightUnitLabel: 'Kilogram',
      totalCustomsValue: 2000,
      unitPrice: 'HK$',
      hsCode: null
    };
    nextCommoditiesState.push(mockAdditionalItemEntry);
    const nextCustomsDetailsState = {
      commodityList: nextCommoditiesState,
      customsType: initShippingAppState.customsDetails.customsType,
      productType: initShippingAppState.customsDetails.productType,
      productPurpose: initShippingAppState.customsDetails.productPurpose,
      documentType: initShippingAppState.customsDetails.documentType,
      documentTypeCode: initShippingAppState.customsDetails.documentTypeCode,
      documentValue: initShippingAppState.customsDetails.documentValue,
      documentValueUnits: initShippingAppState.customsDetails.documentValueUnits
    };
    const nextState = {
      shippingApp: {
        userAccount: initShippingAppState.userAccount,
        shipmentDetails: initShippingAppState.shipmentDetails,
        customsDetails: nextCustomsDetailsState,
        senderDetails: initShippingAppState.senderDetails,
        recipientDetails: initShippingAppState.recipientDetails,
        paymentDetails: initShippingAppState.paymentDetails,
        shipmentConfirmation: initShippingAppState.shipmentDetails
      }
    };
    mockStore.setState(nextState);
    mockStore.select(fromShippingSelector.selectCustomsDetails).subscribe((customsInfo) => {
      expect(customsInfo.commodityList.length).toEqual(2);
      component.ngOnInit();
    });

    expect(component.items.length).toBeGreaterThan(1);
  });

  fit('should calculate/re-calculate total weight and total customs value', () => {
    const initShippingAppState = initialState.shippingApp;
    const nextCommoditiesState: ICommodity[] = Object.assign([], initShippingAppState.customsDetails.commodityList);
    const mockAddGarmentItemEntry = {
      name: 'Garments',
      description: 'Jeans',
      countryOfManufacture: 'China',
      quantity: 20,
      quantityUnits: 'pcs',
      qtyUnitLabel: 'Pieces',
      totalWeight: 10,
      totalWeightUnit: 'kg',
      totalWeightUnitLabel: 'Kilogram',
      totalCustomsValue: 2000,
      unitPrice: 'HK$',
      hsCode: null
    };
    const mockAddJewelryItemEntry = {
      name: 'Jewelry',
      description: 'Mock jewelry sample',
      countryOfManufacture: 'China',
      quantity: 30,
      quantityUnits: 'pcs',
      qtyUnitLabel: 'Pieces',
      totalWeight: 5,
      totalWeightUnit: 'kg',
      totalWeightUnitLabel: 'Kilogram',
      totalCustomsValue: 5300,
      unitPrice: 'HK$',
      hsCode: null
    };
    nextCommoditiesState.push(mockAddGarmentItemEntry);
    nextCommoditiesState.push(mockAddJewelryItemEntry);
    const nextCustomsDetailsState = {
      commodityList: nextCommoditiesState,
      customsType: initShippingAppState.customsDetails.customsType,
      productType: initShippingAppState.customsDetails.productType,
      productPurpose: initShippingAppState.customsDetails.productPurpose,
      documentType: initShippingAppState.customsDetails.documentType,
      documentTypeCode: initShippingAppState.customsDetails.documentTypeCode,
      documentValue: initShippingAppState.customsDetails.documentValue,
      documentValueUnits: initShippingAppState.customsDetails.documentValueUnits
    };
    const nextState = {
      shippingApp: {
        userAccount: initShippingAppState.userAccount,
        shipmentDetails: initShippingAppState.shipmentDetails,
        customsDetails: nextCustomsDetailsState,
        senderDetails: initShippingAppState.senderDetails,
        recipientDetails: initShippingAppState.recipientDetails,
        paymentDetails: initShippingAppState.paymentDetails,
        shipmentConfirmation: initShippingAppState.shipmentDetails
      }
    };
    mockStore.setState(nextState);
    component.ngOnInit();
    expect(component.items.length).toEqual(3);
    expect(component.calculatedTotalWeight).toEqual(25);
    expect(component.calculatedTotalCustomsValue).toEqual(8800);
  });
  // END - Unit Test caases for User Story B-457897 - (Add More Items Flow and change package content)

  fit('should navigate to next page after form submit', () => {
    spyOn(component, 'updateCustomsDetails');
    spyOn(component, 'updateShipmentDetails');
    fixture.detectChanges();
    component.submitForm();
    expect(component.updateCustomsDetails).toHaveBeenCalled();
    expect(component.updateShipmentDetails).toHaveBeenCalled();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/shipping/sender-details');
  });

  /* Scenario 2: Declared value for carriage Max length */
  fit('should limit the length of DCV input to 10', () => {
    component.ngOnInit();
    const length = 10;
    const element = fixture.nativeElement;
    const event = { detail: { checked: true } };
    component.toggleDeclaredValueCarriage(event);
    fixture.detectChanges();
    component.cdvInput.value = '09876543212345';
    component.limitLength(component.cdvInput, length);
    expect(component.cdvInput.value).toBe('0987654321');
  });

  /* Scenario 3: Total customs value and Carriage value validation error for decimal places. */
  fit('should validate the pattern DCV input for decimal', () => {
    component.ngOnInit();
    const itemForm = component.itemForm;
    const itemFormCtrls = itemForm.controls;
    const element = fixture.nativeElement;
    const event = { detail: { checked: true } };
    component.toggleDeclaredValueCarriage(event);
    itemFormCtrls.carriageDeclaredValue.setValue(12.345);
    expect(itemFormCtrls.carriageDeclaredValue.errors?.pattern).toBeTruthy();
    expect(itemForm.valid).toBeFalsy();
  });

  /* Scenario 5: Declared Carriage value exceeds Total customs value */
  fit('should show error when DCV > TCV', () => {
    component.ngOnInit();
    const itemForm = component.itemForm;
    const itemFormCtrls = itemForm.controls;
    component.calculatedTotalCustomsValue = 50;
    const element = fixture.nativeElement;
    const event = { detail: { checked: true } };
    component.toggleDeclaredValueCarriage(event);
    fixture.detectChanges();
    itemFormCtrls.carriageDeclaredValue.setValue(51);
    expect(component.isTCVLessThanDCV).toBe(true);
  });

  /* Scenario 7: Conversion of other currencies to USD for carriage value limit
  *  Scenario 8: Carriage value limit for IP and IPF service. */
  fit('should call currency conversion API and return error for exceeding US converted amount', () => {
    component.ngOnInit();
    const fromCurrencyCode = 'HKD';
    const amount = 100;
    const conversionDate = '11/01/2020';
    const itemForm = component.itemForm;
    const itemFormCtrls = itemForm.controls;
    component.calculatedTotalCustomsValue = 500000;
    const element = fixture.nativeElement;
    const event = { detail: { checked: true } };
    component.toggleDeclaredValueCarriage(event);
    itemFormCtrls.carriageDeclaredValue.setValue(500000);
    component.getConvertedCurrency(fromCurrencyCode, amount, conversionDate);
    expect(component.isCarriageValueLimit).toBe(true);
    expect(itemFormCtrls.carriageDeclaredValue.errors?.incorrect).toBeTruthy();
    expect(itemForm.valid).toBeFalsy();
  });

  fit('should be able to navigate to mainCommodityPage when click on edit button in commodityItem.', () => {
    const i = 1;
    component.editMainCommodityPage(i);
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/shipping/edit-item/1');
  });

  fit('should hide delete icon when customs-details page have only 1 commodity.', () => {
    component.initItems();
    component.items.length = 1;
    expect(component.showDeleteButton).toBeFalse;
  });

  fit('should fetch the country codes details for store', () => {
    fixture.detectChanges();
    component.ngOnInit();
    expect(component.senderCountryCode).toEqual('PS');
    expect(component.recipientCountryCode).toEqual('HK');
  });

  fit('should dispatch actions getCountryOfManufactureUSApimBegin, getCountryOfManufactureLocalApiBegin.', fakeAsync(() => {
    fixture.detectChanges();
    component.senderCountryCode = "HK"
    component.goToMainCommodityPage();
    component.handleCountryOfManufactureUSApiSuccess();
    component.handleCountryOfManufactureLocalApiSuccess();
    tick();
    expect(mockStore.dispatch).toHaveBeenCalledWith(getCountryOfManufactureUSApimBegin({ countryType: 'manufacture' }));
    expect(mockStore.dispatch).toHaveBeenCalledWith(getCountryOfManufactureLocalApiBegin({ countryCode: 'HK', configType: 'COM' }))
    expect(component.countryOfManufactureListUS.length).toBeGreaterThan(0);
    expect(component.countryOfManufactureListLocal.length).toBeGreaterThan(0);
  }));

  fit('should return mapped countryOfManufacture list.', fakeAsync(() => {
    component.countryOfManufactureListLocal = mockLocalCountryOfManufactureList;
    component.countryOfManufactureListUS = mockUSCountryOfManufactureList;
    fixture.detectChanges();
    const mappedCOMList = component.mapLocalCountryOfManufactureListToUSList();
    expect(mappedCOMList[0].actualCountryCode).toEqual("CN");
  }));

  fit('should save merged countryOfManufacture list to store.', () => {
    component.countryOfManufactureListLocal = mockLocalCountryOfManufactureList;
    component.countryOfManufactureListUS = mockUSCountryOfManufactureList;
    fixture.detectChanges();
    component.mergeCountryOfManufactureListLocalAndUS();
    expect(mockStore.dispatch).toHaveBeenCalledWith(saveMergedCountryOfManufactureListAction({ mergedListOfcountryOfManufacture: component.mergedCountryOfManufactureList }));
  });

  fit('should get and assigned merged countryOfManufacture list from store.', () => {
    component.countryOfManufactureListLocal = mockLocalCountryOfManufactureList;
    component.countryOfManufactureListUS = mockUSCountryOfManufactureList;
    spyOn(component, 'getCountryOfManufactureList');
    fixture.detectChanges();
    component.mergeCountryOfManufactureListLocalAndUS();
    const mockMergedComList = component.mergedCountryOfManufactureList
    const mockLocalCOMSelector = mockStore.overrideSelector(fromShippingSelector.selectMergedCountryOfManufactureList, mockMergedComList);
    component.getCountryOfManufactureMergedList();
    expect(component.mergedCountryOfManufactureList).toEqual(mockMergedComList);
    expect(component.getCountryOfManufactureList).not.toHaveBeenCalled();
  });

  fit('should navigate to summary page after updating page details and clicked update button.', () => {
    spyOn(component, 'updateCustomsDetails');
    spyOn(component, 'updateShipmentDetails');
    component.editPageDetails = true;
    component.declaredCarriageOnValueChanges();
    fixture.detectChanges();
    component.submitForm();
    expect(component.updateCustomsDetails).toHaveBeenCalled();
    expect(component.updateShipmentDetails).toHaveBeenCalled();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/shipping/summary');
  });

  fit('should navigate to summary page after clicking cancel without updating page details.', () => {
    fixture.detectChanges();
    component.cancelEditPageDetails();
    expect(component.editPageDetails).toEqual(false);
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/shipping/summary');
  });

  fit('should show UPDATE, CANCEL buttons and keep current state values to be use on cancel click.', fakeAsync(() => {
    component.addListenerForEditFromSummary();
    fixture.detectChanges();
    window.dispatchEvent(new Event('editCustomsDetails'));
    tick(500);
    expect(component.editPageDetails).toEqual(true);
    expect(component.stateCustomsData).toBeTruthy;
    expect(component.stateShipmentData).toBeTruthy;
  }));

  fit('should not assigned state values on null.', fakeAsync(() => {
    const mockVal = null;
    component.addListenerForEditFromSummary();
    mockStore.overrideSelector(fromShippingSelector.selectCustomsDetails, mockVal);
    mockStore.overrideSelector(fromShippingSelector.selectShipmentDetails, mockVal);
    window.dispatchEvent(new Event('editCustomsDetails'));
    tick(500);
    expect(component.stateCustomsData).toBeFalsy;
    expect(component.stateShipmentData).toBeFalsy;
  }));

  fit('should call scrollToFirstInvalidControl()', () => {
    component.ngOnInit();
    const itemForm = component.itemForm;
    const itemFormCtrls = itemForm.controls;
    itemFormCtrls.shipmentPurpose.setValue('')
    itemFormCtrls.carriageDeclaredValue.setValue(500000);
    spyOn(component, 'scrollToFirstInvalidControl');
    component.submitForm();
    expect(component.scrollToFirstInvalidControl).toHaveBeenCalled();
  });

  fit('should call getConvertedCurrency', () => {
    component.hasDeclaredValueCarriage = true;
    const docForm = component.itemForm;
    const docFormCtrls = docForm.controls;
    docFormCtrls.shipmentPurpose.setValue('Other');
    component.isTCVLessThanDCV = false;
    component.serviceType === ServiceType.INTERNATIONAL_PRIORITY;
    spyOn(component, 'getConvertedCurrency');
    component.validateBeforeSubmit();
    expect(component.getConvertedCurrency).toHaveBeenCalled();
  });

  fit('should call showBubbleHintMessage.', () => {
    spyOn(component.notif, 'showBubbleHintMessage')
    component.showPurchaseHigherLimitBubbleHint();
    expect(component.notif.showBubbleHintMessage).toHaveBeenCalled();
  });

  fit('should call transportCostAndDutiesTaxDetails.', () => {
    spyOn(component.modalCtrl, 'create')
    component.transportCostAndDutiesTaxDetails();
    expect(component.modalCtrl.create).toHaveBeenCalled();
  });

  fit('should call alertController create', () => {
    spyOn(component.alertController, 'create');
    component.presentAlertConfirm('1');
    expect(component.alertController.create).toHaveBeenCalled();
  })

  fit('should get shipment details', () => {
    const mockShipmentDetails = {
      packageDetails: [],
      totalNumberOfPackages: null,
      totalWeight: null,
      serviceType: ServiceType.INTERNATIONAL_PRIORITY,
      serviceName: '',
      packagingType: '',
      serviceCode: '',
      advancedPackageCode: '',
      totalCustomsOrInvoiceValue: null,
      customsOrInvoiceValueCurrency: '',
      carriageDeclaredValue: 1,
      carriageDeclaredValueCurrency: '',
      displayDate: '',
      shipDate: null,
      selectedRate: null,
      firstAvailableShipDate: null,
      lastAvailableShipDate: null,
      availableShipDates: [],
      selectedPackageOption: null,
      specialServiceInfo: null
    }
    mockStore.overrideSelector(fromShippingSelector.selectShipmentDetails, mockShipmentDetails);
    component.initShipmentDetails();
    expect(component.form.carriageDeclaredValue.value).toEqual(1)
  });

  fit('should call submitForm', () => {
    component.hasDeclaredValueCarriage = false;
    const docForm = component.itemForm;
    const docFormCtrls = docForm.controls;
    docFormCtrls.shipmentPurpose.setValue('Other');
    component.isTCVLessThanDCV = false;
    component.serviceType === ServiceType.INTERNATIONAL_PRIORITY;
    spyOn(component, 'submitForm');
    component.validateBeforeSubmit();
    expect(component.submitForm).toHaveBeenCalled();
  });

  fit('should call toggle declared carriage', () => {
    component.ngOnInit();
    const event = { detail: { checked: false } };
    component.toggleDeclaredValueCarriage(event);
    fixture.detectChanges();
    expect(component.isTCVLessThanDCV).toBe(false)
  });

  fit('should set markAsTouched on shipmentPurpose field when there is no invalid fields', () => {
    spyOn(component.form.shipmentPurpose, 'markAsTouched');
    component.setFocusOnFirstInvalidInput('');
    expect(component.form.shipmentPurpose.markAsTouched).toHaveBeenCalled();
  });

});