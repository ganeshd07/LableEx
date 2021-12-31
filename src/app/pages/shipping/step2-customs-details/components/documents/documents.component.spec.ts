import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { NotificationService } from 'src/app/core/providers/notification-service';
import { RouterTestingModule } from '@angular/router/testing';
import { DocumentsComponent } from './documents.component';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { LanguageLoader } from 'src/app/app.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { AppState } from 'src/app/+store/app.state';
import { BrowserService } from 'src/app/core/providers/browser.service';
import { DocumentsType } from 'src/app/types/enum/documents-type.enum';
import { CustomsDetails } from 'src/app/types/constants/customs-details.constants';
import { APIMGlobalTradeService } from 'src/app/core/providers/apim/global-trade.service';
import * as testConfig from '../../../../../../assets/config/mockConfigForTest';
import { ConfigService } from '@ngx-config/core';
import { Observable, Observer } from 'rxjs';
import { DatePipe } from '@angular/common';
import { ServiceType } from 'src/app/types/enum/service-type.enum';
import * as fromShippingSelector from '../../../../shipping/+store/shipping.selectors';
import { KeyTexts } from 'src/app/interfaces/api-service/response/key-texts';
import { SenderRecipientInfoResponse } from 'src/app/interfaces/api-service/response/sender-recipient-info-response';
import { IShipmentDetails } from 'src/app/interfaces/shipping-app/shipment-details';
import { ICustomsInfo } from 'src/app/interfaces/shipping-app/customs-info';
import { SessionItems } from 'src/app/types/enum/session-items.enum';

fdescribe('DocumentsComponent', () => {
  let component: DocumentsComponent;
  let fixture: ComponentFixture<DocumentsComponent>;
  const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl', 'navigate', 'then']);
  let store: MockStore<AppState>;

  const completeDocTypes: KeyTexts[] =
    [
      {
        key: 'CORRESPONDENCE_NO_COMMERCIAL_VALUE',
        displayText: 'Correspondence/No Commercial Value'
      },
      {
        key: 'PERSONAL_DOCUMENT',
        displayText: 'Personal document'
      },
      {
        key: 'INTEROFFICE_DOCUMENT',
        displayText: 'Interoffice document'
      },
      {
        key: 'BUSINESS_DOCUMENT',
        displayText: 'Business document'
      },
      {
        key: 'OTHER',
        displayText: 'Other'
      }
    ];

  const senderRecipientInfo: SenderRecipientInfoResponse = {
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
        totalCustomsOrInvoiceValue: 100,
        customsOrInvoiceValueCurrency: 'CNY',
        carriageDeclaredValue: 500,
        carriageDeclaredValueCurrency: 'CNY',
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
        commodityList: [],
        customsType: 'doc',
        productType: '',
        productPurpose: '',
        documentType: 'Personal Document',
        documentTypeCode: DocumentsType.PERSONAL,
        documentValue: 23,
        documentValueUnits: 'HKD'
      },
      senderDetails: null,
      recipientDetails: null,
      paymentDetails: null,
      shipmentConfirmation: null,
      lookupData: {
        senderRecipientInfo,
        senderCountries: null,
        senderCities: null,
        recipientCountries: null,
        recipientCities: null,
        selectedRecipientCountryDetails: null,
        selectedSenderCountryDetails: null,
        selectedCountryDialingPrefix: null,
        currencyListUS: null,
        currencyListLocal: null,
        mergedCurrencyList: null,
        shipmentPurpose: null,
        listOfcountryOfManufactureUS: null,
        listOfcountryOfManufactureLocal: null,
        mergedListOfcountryOfManufacture: null,
        defaultSenderDetails: null,
        recipientListDetails: null,
        documentDescriptions: {
          keyTexts: completeDocTypes
        },
        uomListUS: null,
        uomListLocal: null,
        mergedUomList: null,
        createShipmentError: null,
        createShipmentSuccess: null,
        shipmentFeedackSuccess: null,
        systemCommodityList: null,
        ratesDiscountSuccess: null,
        ratesDiscountError: null
      }
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

  beforeEach(async(() => {
    const mockConfig = testConfig.config;
    class APIMGlobalTradeServiceStub {
      getCurrencyConversion(fromCurrencyCode: string, toCurrencyCode: string, amount: number, conversionDate: string) {
        return Observable.create((observer: Observer<any>) => {
          observer.next(mockCurrencyConversionList);
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
      declarations: [DocumentsComponent],
      imports: [
        ReactiveFormsModule,
        IonicModule.forRoot(),
        RouterTestingModule,
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
        NotificationService,
        DatePipe,
        { provide: Router, useValue: routerSpy },
        { provide: APIMGlobalTradeService, useClass: APIMGlobalTradeServiceStub },
        { provide: ConfigService, useClass: ConfigServiceStub },
        provideMockStore({ initialState })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentsComponent);
    store = TestBed.inject(MockStore);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  fit('should create', () => {
    expect(component).toBeTruthy();
  });

  // Scenario 7: Shipper selects currency from dropdown currency.
  fit('it should get all currency list from selected country and sets the default currency', () => {
    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'HK');
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.currencyList.length).toEqual(14);
    expect(component.selectedCurrency).toBe('HKD');
  });

  // Scenario 3:  Shipper selects  Correspondence / No commercial value.
  fit('should change document type selected to ncv', () => {
    const documentType = DocumentsType.NCV;
    component.documentTypeList = completeDocTypes;
    component.onChangeDocumentType(documentType);
    expect(component.isDocumentTypeSelected).toBeFalsy();
    expect(component.isOtherDocumentSelected).toBeFalsy();
    expect(component.isShowContinueButton).toBeTruthy();

  });

  // Scenario 5: Shipper selects Other under Document Type.
  fit('should change document type selected to other', () => {
    const documentType = DocumentsType.OTHER;
    component.onChangeDocumentType(documentType);
    expect(component.isDocumentTypeSelected).toBeTruthy();
    expect(component.isOtherDocumentSelected).toBeTruthy();
    expect(component.isShowContinueButton).toBeTruthy();
  });

  // Scenario 4: Shipper selects ANY of Personal document, Interoffice document, Business document options
  fit('should change document type selected to common document', () => {
    const documentType = DocumentsType.PERSONAL;
    component.onChangeDocumentType(documentType);
    expect(component.isDocumentTypeSelected).toBeTruthy();
    expect(component.isOtherDocumentSelected).toBeFalsy();
    expect(component.isShowContinueButton).toBeTruthy();
  });

  /**
   * START - Unit Test caases for Scenario 6: Shipper clicks higher limit of liability coverage toggle.
   */
  fit('should change the toggle state to false', () => {
    const toggleChecked = false;
    component.toggleCarriageValue(toggleChecked);
    expect(component.isShowCarriageValue).toBeFalsy();
  });

  fit('should change the toggle state to true', () => {
    const toggleChecked = true;
    component.toggleCarriageValue(toggleChecked);
    expect(component.isShowCarriageValue).toBeTruthy();
  });
  /**
   * END - Unit Test caases for Scenario 6: Shipper clicks higher limit of liability coverage toggle.
   */

  fit('should update the currency', () => {
    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'CN');
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.currencyList.length).toBeGreaterThan(5);
    expect(component.selectedCurrency).toEqual('CNY');
  });

  // Scenario 8: Shipper clicks CONTINUE button.
  fit('should navigate to sender details screen after clicking continue button', () => {
    component.documentTypeList = completeDocTypes;
    component.form.documentType.setValue(DocumentsType.NCV);
    component.form.totalCustomsValue.setValue('100');
    component.onChangeDocumentType(DocumentsType.NCV);
    component.validateBeforeSubmit();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/shipping/sender-details');
  });

  fit('should invalidate form with mandatory document type field', () => {
    component.ngOnInit();
    const docForm = component.documentForm;
    const docFormCtrls = docForm.controls;

    docFormCtrls.documentTypeCode.setValue('');
    expect(docForm.valid).toBeFalsy();
  });

  fit('should invalidate form with mandatory Total Customs Value field', () => {
    component.ngOnInit();
    const docForm = component.documentForm;
    const docFormCtrls = docForm.controls;

    docFormCtrls.documentTypeCode.setValue(DocumentsType.OTHER);
    component.onChangeDocumentType(DocumentsType.OTHER);

    const docType = CustomsDetails.getDocumentTypeByCode(DocumentsType.OTHER).displayText;
    expect(docFormCtrls.documentType.value).toBe(docType);
    docFormCtrls.totalCustomsValue.setValue('');
    docFormCtrls.describeDocument.setValue('Custom Document');
    expect(docForm.valid).toBeFalsy();
  });

  fit('should validate Total Customs Value when user enters zero (0) value', () => {
    component.ngOnInit();
    const docForm = component.documentForm;
    const docFormCtrls = docForm.controls;

    docFormCtrls.documentTypeCode.setValue(DocumentsType.OTHER);
    component.onChangeDocumentType(DocumentsType.OTHER);

    const docType = CustomsDetails.getDocumentTypeByCode(DocumentsType.OTHER).displayText;
    expect(docFormCtrls.documentType.value).toBe(docType);
    docFormCtrls.totalCustomsValue.setValue('0');
    docFormCtrls.describeDocument.setValue('Custom Document');
    expect(docFormCtrls.totalCustomsValue.valid).toBeFalsy();
    expect(docForm.valid).toBeFalsy();
  });

  fit('should invalidate form with mandatory Describe Document field', () => {
    component.ngOnInit();
    const docForm = component.documentForm;
    const docFormCtrls = docForm.controls;

    docFormCtrls.documentTypeCode.setValue(DocumentsType.OTHER);
    component.onChangeDocumentType(DocumentsType.OTHER);

    const docType = CustomsDetails.getDocumentTypeByCode(DocumentsType.OTHER).displayText;
    expect(docFormCtrls.documentType.value).toBe(docType);
    docFormCtrls.totalCustomsValue.setValue(500);
    docFormCtrls.describeDocument.setValue('');
    expect(docForm.valid).toBeFalsy();
  });

  /* Scenario 1: Total customs value and Carriage value Max length */
  fit('should limit the length of TCV and DCV inputs to 10', () => {
    component.ngOnInit();
    const length = 10;
    const docForm = component.documentForm;
    const docFormCtrls = docForm.controls;
    docFormCtrls.documentTypeCode.setValue(DocumentsType.PERSONAL);
    component.onChangeDocumentType(DocumentsType.PERSONAL);
    component.totalCustomsValInput.value = '12345678912345';
    component.limitLength(component.totalCustomsValInput, length);
    component.toggleCarriageValue(true);
    component.cdvInput.value = '09876543212345';
    component.limitLength(component.cdvInput, length);
    expect(component.totalCustomsValInput.value).toBe('1234567891');
    expect(component.cdvInput.value).toBe('0987654321');
  });

  /* Scenario 3: Total customs value and Carriage value validation error for decimal places. */
  fit('should validate the pattern for TCV and DCV inputs for decimal', () => {
    component.ngOnInit();
    const docForm = component.documentForm;
    const docFormCtrls = docForm.controls;
    docFormCtrls.documentTypeCode.setValue(DocumentsType.PERSONAL);
    component.onChangeDocumentType(DocumentsType.PERSONAL);
    docFormCtrls.totalCustomsValue.setValue(50.123);
    component.toggleCarriageValue(true);
    docFormCtrls.carriageDeclaredValue.setValue(12.345);
    expect(docFormCtrls.totalCustomsValue.errors?.pattern).toBeTruthy();
    expect(docFormCtrls.carriageDeclaredValue.errors?.pattern).toBeTruthy();
    expect(docForm.valid).toBeFalsy();
  });

  /* Scenario 5: Declared Carriage value exceeds Total customs value */
  fit('should show error when DCV > TCV', () => {
    component.ngOnInit();
    const docForm = component.documentForm;
    const docFormCtrls = docForm.controls;
    docFormCtrls.documentTypeCode.setValue(DocumentsType.PERSONAL);
    component.onChangeDocumentType(DocumentsType.PERSONAL);
    docFormCtrls.totalCustomsValue.setValue(50);
    component.toggleCarriageValue(true);
    docFormCtrls.carriageDeclaredValue.setValue(51);
    expect(component.isTCVLessThanDCV).toBe(true);
    expect(docFormCtrls.totalCustomsValue.errors?.incorrect).toBeTruthy();
    expect(docForm.valid).toBeFalsy();
  });

  /* Scenario 7: Conversion of other currencies to USD for carriage value limit
  *  Scenario 8: Carriage value limit for IP and IPF service. */
  fit('should call currency conversion API and return error for exceeding US converted amount', () => {
    component.ngOnInit();
    const fromCurrencyCode = 'HKD';
    const amount = 100;
    const conversionDate = '11/01/2020';

    const docForm = component.documentForm;
    const docFormCtrls = docForm.controls;
    docFormCtrls.documentTypeCode.setValue(DocumentsType.PERSONAL);
    component.onChangeDocumentType(DocumentsType.PERSONAL);
    docFormCtrls.totalCustomsValue.setValue(500000);
    component.toggleCarriageValue(true);
    docFormCtrls.carriageDeclaredValue.setValue(500000);
    component.getConvertedCurrency(fromCurrencyCode, amount, conversionDate);
    expect(component.isCarriageValueLimit).toBe(true);
    expect(docFormCtrls.carriageDeclaredValue.errors?.incorrect).toBeTruthy();
    expect(docForm.valid).toBeFalsy();
  });

  fit('should have get currency list from store.', () => {
    const mockCurrencyList = [{ iataCode: 'HKD', isoCode: 'HKD', description: 'Hong Kong Dollar', symbol: '$' }, { iataCode: 'EUR', isoCode: 'EUR', description: 'Euro', symbol: '€' }, { iataCode: 'CNY', isoCode: 'CNY', description: 'Chinese Renminbi', symbol: '¥' }, { iataCode: 'UKL', isoCode: 'GBP', description: 'UK Pounds Sterling', symbol: '£' }, { iataCode: 'USD', isoCode: 'USD', description: 'US Dollars', symbol: '$' }, { iataCode: 'ANG', isoCode: 'ANG', description: 'Antilles Guilder', symbol: 'ƒ' }, { iataCode: 'ARN', isoCode: 'ARS', description: 'Argentine Pesos', symbol: '$' }];
    store.overrideSelector(fromShippingSelector.selectMergedCurrencyList, mockCurrencyList);
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.currencyList.length).toBeGreaterThan(0);
    expect(component.currencyList[0].isoCode).toEqual('HKD');
  });

  fit('should filter out NCV if notAllowedDeclaredValueDocumentDescriptions includes NCV', () => {
    component.loadAndFilterDocumentTypes();
    component.documentTypeList = completeDocTypes.filter((documentType) => !component.notAllowedDocumentDesc.includes(documentType.key));
    expect(component.notAllowedDocumentDesc[0]).toEqual(DocumentsType.NCV);
    expect(component.documentTypeList[0].key).not.toEqual(DocumentsType.NCV);
    expect(component.isDocumentTypeDisplayed).toBe(true);
  });

  fit('should show NCV if notAllowedDeclaredValueDocumentDescriptions does not include NCV', () => {
    initialState.shippingApp.lookupData.senderRecipientInfo.customsValueSupport.notAllowedDocumentDescriptions = [];
    component.loadAndFilterDocumentTypes();
    expect(component.notAllowedDocumentDesc).toEqual([]);
    expect(component.documentTypeList.find(
      selectedDocType => selectedDocType.key === DocumentsType.NCV).key).toEqual(DocumentsType.NCV);
    expect(component.isDocumentTypeDisplayed).toBe(true);
  });

  fit('should navigate to summary page after updating page details and clicked update button.', () => {
    spyOn(component, 'updateCustomsDetails');
    spyOn(component, 'updateShipmentDetails');
    component.documentTypeList = completeDocTypes;
    component.form.documentType.setValue(DocumentsType.NCV);
    component.form.totalCustomsValue.setValue('100');
    component.onChangeDocumentType(DocumentsType.NCV);
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
    store.overrideSelector(fromShippingSelector.selectCustomsDetails, mockVal);
    store.overrideSelector(fromShippingSelector.selectShipmentDetails, mockVal);
    window.dispatchEvent(new Event('editCustomsDetails'));
    tick(500);
    expect(component.stateCustomsData).toBeFalsy;
    expect(component.stateShipmentData).toBeFalsy;
  }));

  fit('should reset form values.', fakeAsync(() => {
    const mockVal: ICustomsInfo = {
      commodityList: [],
      customsType: '',
      documentType: '',
      documentTypeCode: '',
      documentValue: null,
      documentValueUnits: null,
      productPurpose: '',
      productType: ''
    };
    store.overrideSelector(fromShippingSelector.selectCustomsDetails, mockVal);
    component.initDocuments();
    tick(500);
    expect(component.form.totalCustomsValue.value).toBe('');
    expect(component.form.documentTypeCode.value).toBe('');
    expect(component.form.carriageDeclaredValue.value).toBe('');
  }));

  fit('should set describeDocument form field values.', fakeAsync(() => {
    const mockVal: ICustomsInfo = {
      commodityList: [],
      customsType: '',
      documentType: 'doc',
      documentTypeCode: DocumentsType.OTHER,
      documentValue: null,
      documentValueUnits: null,
      productPurpose: '',
      productType: ''
    };
    store.overrideSelector(fromShippingSelector.selectCustomsDetails, mockVal);
    component.isOtherDocumentSelected = true;
    component.initDocuments();
    tick(500);
    expect(component.form.describeDocument.value).toBe('doc');
  }));

  fit('should set describeDocument form field values.', fakeAsync(() => {
    store.overrideSelector(fromShippingSelector.selectDocumentDescriptions, initialState.shippingApp.lookupData.documentDescriptions);
    component.notAllowedDocumentDesc = null;
    component.filterDocumentTypes();
    tick(500);
    expect(component.documentTypeList).toEqual(initialState.shippingApp.lookupData.documentDescriptions.keyTexts);
  }));

  fit('should call getConvertedCurrency', () => {
    component.isShowCarriageValue = true;
    const docForm = component.documentForm;
    const docFormCtrls = docForm.controls;
    docFormCtrls.documentTypeCode.setValue(DocumentsType.PERSONAL);
    docFormCtrls.documentType.setValue(DocumentsType.NCV);
    docFormCtrls.totalCustomsValue.setValue(10);
    docFormCtrls.customsValueCurrency.setValue('HKD');
    docFormCtrls.describeDocument.setValue('doc');
    docFormCtrls.carriageDeclaredValue.setValue(10)
    docFormCtrls.carriageDeclaredValueCurrency.setValue('HKD')
    component.isDocumentTypeSelected = true;
    component.serviceType === ServiceType.INTERNATIONAL_PRIORITY;
    spyOn(component, 'getConvertedCurrency');
    component.validateBeforeSubmit();
    expect(component.getConvertedCurrency).toHaveBeenCalled();
  });

  fit('should call showBubbleHintMessage When showDocumentTypeBubbleHint() called .', () => {
    spyOn(component.notif, 'showBubbleHintMessage')
    component.showDocumentTypeBubbleHint();
    expect(component.notif.showBubbleHintMessage).toHaveBeenCalled();
  });

  fit('should call showBubbleHintMessage When showTooltip() called.', () => {
    spyOn(component.notif, 'showBubbleHintMessage')
    component.showTooltip();
    expect(component.notif.showBubbleHintMessage).toHaveBeenCalled();
  });

  fit('should call scrollToFirstInvalidControl()', () => {
    component.ngOnInit();
    const docForm = component.documentForm;
    const docFormCtrls = docForm.controls;
    docFormCtrls.documentTypeCode.setValue(DocumentsType.OTHER);
    component.onChangeDocumentType(DocumentsType.OTHER);
    const docType = CustomsDetails.getDocumentTypeByCode(DocumentsType.OTHER).displayText;
    expect(docFormCtrls.documentType.value).toBe(docType);
    docFormCtrls.totalCustomsValue.setValue(500);
    docFormCtrls.describeDocument.setValue('');
    spyOn(component, 'scrollToFirstInvalidControl');
    component.submitForm();
    expect(component.scrollToFirstInvalidControl).toHaveBeenCalled();
  });

  fit('should change the toggle state to false', () => {
    const toggleChecked = false;
    component.isTCVLessThanDCV = true
    component.toggleCarriageValue(toggleChecked);
    expect(component.isShowCarriageValue).toBeFalsy();
  });

  fit('should reset and update value and validity for packagingTypeOptionsForm', () => {
    spyOn(component, 'setFocusOnFirstInvalidInput');
    component.scrollToFirstInvalidControl();
    expect(component.setFocusOnFirstInvalidInput).toHaveBeenCalled();
  });

  fit('should be able to scroll and set focus on invalid fields', () => {
    component.ngOnInit();
    const docForm = component.documentForm;
    const docFormCtrls = docForm.controls;
    docFormCtrls.documentTypeCode.setValue(DocumentsType.OTHER);
    component.onChangeDocumentType(DocumentsType.OTHER);
    let docType = CustomsDetails.getDocumentTypeByCode(DocumentsType.OTHER).displayText;
    expect(docFormCtrls.documentType.value).toBe(docType);
    docFormCtrls.totalCustomsValue.setValue('');
    docFormCtrls.describeDocument.setValue('doc');
    spyOn(component, 'setFocusOnFirstInvalidInput');
    component.scrollToFirstInvalidControl();
    expect(component.setFocusOnFirstInvalidInput).toHaveBeenCalledWith('totalCustomsValue');

    docFormCtrls.documentTypeCode.setValue(DocumentsType.OTHER);
    component.onChangeDocumentType(DocumentsType.OTHER);
    docType = CustomsDetails.getDocumentTypeByCode(DocumentsType.OTHER).displayText;
    expect(docFormCtrls.documentType.value).toBe(docType);
    docFormCtrls.totalCustomsValue.setValue('10');
    docFormCtrls.describeDocument.setValue('');
    fixture.detectChanges();
    component.scrollToFirstInvalidControl();
    expect(component.setFocusOnFirstInvalidInput).toHaveBeenCalledWith('describeDocument');

    docFormCtrls.documentTypeCode.setValue(DocumentsType.OTHER);
    component.onChangeDocumentType(DocumentsType.OTHER);
    docType = CustomsDetails.getDocumentTypeByCode(DocumentsType.OTHER).displayText;
    expect(docFormCtrls.documentType.value).toBe(docType);
    docFormCtrls.totalCustomsValue.setValue(10);
    docFormCtrls.describeDocument.setValue('doc');
    docFormCtrls.carriageDeclaredValue.setValue('')
    fixture.detectChanges();
    component.updateDCVRequiredValidators();
    component.scrollToFirstInvalidControl();
    expect(component.setFocusOnFirstInvalidInput).toHaveBeenCalledWith('carriageDeclaredValue');
  });

});