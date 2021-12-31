import { async, ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import * as testConfig from '../../../../assets/config/mockConfigForTest';
import { Step5BillingDetailsPage } from './step5-billing-details.page';
import { Observable, Observer } from 'rxjs';
import { NotificationService } from 'src/app/core/providers/notification-service';
import { APIMAvailabilityService, APIMPaymentService, RatesService } from 'src/app/core/providers/apim';
import { ConfigService } from '@ngx-config/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { APIMAvailabilityDataMapper } from 'src/app/providers/mapper/apim/availability-data-mapper.service';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { AppState } from 'src/app/+store/app.state';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { LanguageLoader } from 'src/app/app.module';
import { Router } from '@angular/router';
import { BillingOptionsUtil } from '../../../../app/types/constants/billing-and-service-options.constants';
import { ShippingInfo } from '../+store/shipping.state';
import { PaymentService } from 'src/app/core/providers/local/payment.service';
import { ApiResponse } from 'src/app/interfaces/api-service/response/api-response';
import * as fromShippingSelector from '../../shipping/+store/shipping.selectors';
import { SessionItems } from 'src/app/types/enum/session-items.enum';
import { RateReplyDetail } from 'src/app/interfaces/api-service/response/rate-reply-detail';
import { RatesDataMapper } from 'src/app/providers/mapper/apim/rates-data-mapper.service';
import { RateQuoteRequest } from 'src/app/interfaces/api-service/request/rate-quote-request';

fdescribe('Step5BillingDetailsPage', () => {
  let component: Step5BillingDetailsPage;
  let fixture: ComponentFixture<Step5BillingDetailsPage>;
  let mockStore: MockStore<AppState>;
  let ratesReqMapper: RatesDataMapper;
  // const storeSpy = jasmine.createSpyObj('mockStore', ['dispatch', 'select']);
  const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl', 'navigate', 'then']);
  const mockConfig = testConfig.config;
  const mockSignatureOptionsList = {
    availableSignatureOptions: [
      {
        key: 'SERVICE_DEFAULT',
        displayText: 'None specified'
      },
      {
        key: 'INDIRECT',
        displayText: 'Indirect signature required'
      },
      {
        key: 'DIRECT',
        displayText: 'Direct signature required'
      },
      {
        key: 'ADULT',
        displayText: 'Adult signature required'
      }
    ],
    recommendedSignatureOption: {
      key: 'SERVICE_DEFAULT',
      displayText: ' None specified'
    }
  };

  const initialState: AppState = {
    shippingApp: {
      userAccount: null,
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
          city: 'NEW YORK',
          countryCode: 'US',
          countryName: 'United States',
          postalCode: '10001',
          postalAware: true,
          stateAware: false,
          phoneNumber: '',
          phoneExt: '',
          taxId: '',
          passportNumber: ''
        }
      ],
      paymentDetails: {
        shippingBillTo: 'PAY_DROPOFF',
        shippingBillToDisplayable: 'Pay at drop off',
        shippingAccountNumber: '',
        shippingAccountNumberDisplayable: 'Pay at drop off',
        dutiesTaxesBillTo: 'RECIPIENT',
        dutiesTaxesBillToDisplayable: 'Bill Recipient',
        dutiesTaxesAccountNumber: '',
        dutiesTaxesAccountNumberDisplayable: 'Bill Recipient'
      },
      shipmentConfirmation: null,
      lookupData: {
        senderRecipientInfo: null,
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
        documentDescriptions: null,
        uomListUS: null,
        uomListLocal: null,
        mergedUomList: null,
        createShipmentError: null,
        createShipmentSuccess: null,
        shipmentFeedackSuccess: null,
        systemCommodityList: null,
        defaultSenderDetails: null,
        recipientListDetails: null,
        ratesDiscountSuccess: {
          configlist: [
            {
              value: 30,
              seq: 1
            }
          ]
        },
        ratesDiscountError: null
      }
    }
  };

  class APIMPaymentServiceStub {
    responseList = {
      transactionId: '84e5f555-84cb-447c-b1a9-78154e076031',
      output: {
        keyText: [
          { key: 'SENDER', 'displayText': 'My account' },
          { key: 'RECIPIENT', 'displayText': 'Recipient' },
          { key: 'THIRD_PARTY', 'displayText': 'Third Party' }
        ]
      }
    };

    getPaymentTypesByCountryCodesAndServiceType(reason: string, serviceType: string, senderCountryCode: string, recipientCountryCode: string) {
      return Observable.create((observer: Observer<any>) => {
        observer.next(this.responseList);
      })
    }
  }

  class ApimAvailabilityServiceStub {
    responseData = {
      transactionId: '443a3020-fbc3-4a11-92e6-73833e895bec',
      output: {
        availableSignatureOptions: [
          { key: 'SERVICE_DEFAULT', 'displayText': 'None specified' },
          { key: 'INDIRECT', 'displayText': 'Indirect signature required' },
          { key: 'DIRECT', 'displayText': 'Direct signature required' },
          { key: 'ADULT', 'displayText': 'Adult signature required' }
        ],
        'recommendedSignatureOption': { 'key': 'SERVICE_DEFAULT', 'displayText': 'None specified' }
      }
    };

    getSignatureOptionsList(shippingInfo: ShippingInfo) {
      return Observable.create((observer: Observer<any>) => {
        observer.next(this.responseData);
      })
    }
  }

  class paymentServiceStub {
    responseList = {
      configlist: [
        {
          "value": 1,
          "seq": 1
        }
      ]
    };

    getconfigList(countryCode: string, type: string) {
      return Observable.create((observer: Observer<ApiResponse>) => {
        observer.next(this.responseList)
      })
    }
  }

  class configServiceStub {
    settings: any = mockConfig;
    getSettings(prop: string) {
      return this.settings[prop];
    }
    init() {
      this.settings = mockConfig;
    }
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        Step5BillingDetailsPage
      ],
      providers: [
        ModalController,
        RatesService,
        NotificationService,
        APIMAvailabilityDataMapper,
        DatePipe,
        TranslateService,
        FormBuilder,
        provideMockStore({ initialState }),
        { provide: Router, useValue: routerSpy },
        { provide: APIMAvailabilityService, useClass: ApimAvailabilityServiceStub },
        { provide: APIMPaymentService, useClass: APIMPaymentServiceStub },
        { provide: RatesService, useClass: APIMRatesServiceStub },
        { provide: ConfigService, useClass: configServiceStub },
        { provide: PaymentService, useClass: paymentServiceStub }
      ],
      imports: [
        HttpClientTestingModule,
        IonicModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: LanguageLoader,
            deps: [HttpClient]
          }
        })
      ]
    }).compileComponents();

    mockStore = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(Step5BillingDetailsPage);
    const store = TestBed.inject(MockStore);
    ratesReqMapper = TestBed.inject(RatesDataMapper);
    component = fixture.componentInstance;
    fixture.detectChanges();
    spyOn(mockStore, 'dispatch').and.callFake(() => { });
  }));

  fit('should create', () => {
    expect(component).toBeTruthy();
  });

  fit('should call ngOnInit ', () => {
    fixture.detectChanges();
    spyOn(component, 'getShippingDetailsFromStore');
    spyOn(component, 'getSignatureOptionsDetails');
    spyOn(component, 'getTransportDutiesTaxesOptions')
    component.ngOnInit();
    expect(component.getShippingDetailsFromStore).toHaveBeenCalled();
    expect(component.getSignatureOptionsDetails).toHaveBeenCalled();
    expect(component.getTransportDutiesTaxesOptions).toHaveBeenCalled();
  });

  fit('should fetch the signature options details ', () => {
    fixture.detectChanges();
    component.signatureOptionsList = mockSignatureOptionsList.availableSignatureOptions;
    component.getSignatureOptionsDetails();
    expect(component.signatureOptionsList.length).toEqual(4);
    expect(component.form.selectedSignatureValue.value).toEqual(component.signatureOptionsList[0]);
    expect(component.currentShippingInfo).toBeDefined();
  });

  /**
    * Expects to call rate request on ngOnInit()
    */
  fit('should be able to refresh rate details on change of signature option', () => {
    spyOn(component, 'refreshRateQuote');
    const signatureOpt = {
      key: 'INDIRECT',
      displayText: 'Indirect signature required'
    }
    component.prevSelectedSignatureOpt = {
      key: 'SERVICE_DEFAULT',
      displayText: 'None specified'
    };
    component.form.selectedSignatureValue.setValue(signatureOpt);
    fixture.detectChanges();
    component.onSelectSignatureOptions();
    expect(component.refreshRateQuote).toHaveBeenCalledWith();
  });

  fit('should submit the billing details to store', () => {
    fixture.detectChanges();
    spyOn(component, 'updatePaymentDetails');
    component.submitForm();
    expect(component.updatePaymentDetails).toHaveBeenCalledWith();
    expect(component.billingForm.valid).toBe(true);
  });

  fit('should having the default data for transportCost when login as Guest', () => {
    fixture.detectChanges();
    sessionStorage.setItem(SessionItems.ISLOGGEDIN, 'false');
    const translationKeyBilling = 'billingAndServicesOptionPage.' + (BillingOptionsUtil.getPaymentType(BillingOptionsUtil.PAY_AT_DROP_OFF).translationKey);
    component.transportCostAndDutiesTaxDetails(BillingOptionsUtil.TRANSPORT_COST);
    expect(component.billingForm.controls.transportVal.value).toEqual(translationKeyBilling);
  });

  fit('should having the default data for duties and taxes when login as Guest', () => {
    const translationKeyDuties = 'billingAndServicesOptionPage.' + (BillingOptionsUtil.getPaymentType(BillingOptionsUtil.BILL_RECIPIENT).translationKey);
    let mockData = initialState.shippingApp;
    mockData.paymentDetails = null;
    mockStore.overrideSelector(fromShippingSelector.selectShippingInfo, mockData);
    component.billingForm.controls.dutiesTaxesAccountNumber.setValue('');
    fixture.detectChanges();
    sessionStorage.setItem(SessionItems.ISLOGGEDIN, 'false');
    component.transportCostAndDutiesTaxDetails(BillingOptionsUtil.DUTIES_TAX);
    expect(component.billingForm.controls.dutiesVal.value).toEqual(translationKeyDuties);
  });

  fit('should be enable transportCost and duties-taxes dropdown.', () => {
    fixture.detectChanges();
    const countryCode = 'HK';
    const transportResult = [{
      configlist: [
        {
          value: 'S',
          seq: '1'
        },
        {
          value: 'R',
          seq: '2'
        },
        {
          value: 'O',
          seq: '3'
        }
      ]
    }, {
      transactionId: '63aa9c76-891d-4c82-b760-3b985a314a7c',
      output: {
        keyTexts: [
          {
            key: 'SENDER', displayText: 'My account'
          },
          {
            key: 'RECIPIENT', displayText: 'Recipient'
          },
          {
            key: 'THIRD_PARTY', displayText: 'Third Party'
          }
        ]
      }
    }];

    component.handleTransportOptions(transportResult);
    expect(component.enableDropDown).toEqual(true);
  });

  fit('should be disable transportCost and set pay at drop as default when respose value equal "F"', () => {
    fixture.detectChanges();
    const countryCode = 'HK';
    const translationKeyBilling = 'billingAndServicesOptionPage.' + (BillingOptionsUtil.getPaymentType(BillingOptionsUtil.PAY_AT_DROP_OFF).translationKey);
    const transportResult = [{
      configlist: []
    }, {
      transactionId: '63aa9c76-891d-4c82-b760-3b985a314a7c',
      output: {
        keyTexts: [
          {
            key: 'SENDER', displayText: 'My account'
          },
          {
            key: 'RECIPIENT', displayText: 'Recipient'
          },
          {
            key: 'THIRD_PARTY', displayText: 'Third Party'
          }
        ]
      }
    }];

    component.handleTransportOptions(transportResult);
    component.transportCostAndDutiesTaxDetails(BillingOptionsUtil.TRANSPORT_COST);
    expect(component.enableDropDown).toEqual(false);
    expect(component.billingForm.controls.transportVal.value).toEqual(translationKeyBilling);
  });

  fit('should be disable duties & taxes and set Recipient as default when local respose value empty', () => {
    fixture.detectChanges();
    const countryCode = 'HK';
    const translationKeyBilling = 'billingAndServicesOptionPage.' + (BillingOptionsUtil.getPaymentType(BillingOptionsUtil.BILL_RECIPIENT).translationKey);
    const dutiesTaxResult = [{
      configlist: []
    }, {
      transactionId: '63aa9c76-891d-4c82-b760-3b985a314a7c',
      output: {
        keyTexts: [
          {
            key: 'SENDER', displayText: 'My account'
          },
          {
            key: 'RECIPIENT', displayText: 'Recipient'
          },
          {
            key: 'THIRD_PARTY', displayText: 'Third Party'
          }
        ]
      }
    }];
    spyOn(component, 'setDutiesValueDisplayName');
    component.handleDutiesTaxestOptions(dutiesTaxResult);
    component.transportCostAndDutiesTaxDetails(BillingOptionsUtil.DUTIES_TAX);
    expect(component.enableDutiesDropDown).toEqual(false);
    expect(component.billingForm.controls.dutiesVal.value).toEqual(translationKeyBilling);
  });

  fit('should be enable duties & taxes and set Recipient as default when local respose value present', () => {
    fixture.detectChanges();
    const countryCode = 'HK';
    const translationKeyBilling = 'billingAndServicesOptionPage.' + (BillingOptionsUtil.getPaymentType(BillingOptionsUtil.BILL_RECIPIENT).translationKey);
    const dutiesTaxResult = [{
      configlist: [
        {
          value: 'S',
          seq: '1'
        },
        {
          value: 'R',
          seq: '2'
        },
        {
          value: 'O',
          seq: '3'
        }
      ]
    }, {
      transactionId: '63aa9c76-891d-4c82-b760-3b985a314a7c',
      output: {
        keyTexts: [
          {
            key: 'SENDER', displayText: 'My account'
          },
          {
            key: 'RECIPIENT', displayText: 'Recipient'
          },
          {
            key: 'THIRD_PARTY', displayText: 'Third Party'
          }
        ]
      }
    }];
    spyOn(component, 'setDutiesValueDisplayName');
    component.handleDutiesTaxestOptions(dutiesTaxResult);
    component.transportCostAndDutiesTaxDetails(BillingOptionsUtil.DUTIES_TAX);
    expect(component.enableDutiesDropDown).toEqual(true);
    expect(component.billingForm.controls.dutiesVal.value).toEqual(translationKeyBilling);
  });

  fit('should be disable duties & taxes and set Recipient as default when local respose has 1 value present', () => {
    fixture.detectChanges();
    const countryCode = 'HK';
    const translationKeyBilling = 'billingAndServicesOptionPage.' + (BillingOptionsUtil.getPaymentType(BillingOptionsUtil.BILL_RECIPIENT).translationKey);
    const dutiesTaxResult = [{
      configlist: [
        {
          value: 'R',
          seq: '1'
        }
      ]
    }, {
      transactionId: '63aa9c76-891d-4c82-b760-3b985a314a7c',
      output: {
        keyTexts: [
          {
            key: 'SENDER', displayText: 'My account'
          },
          {
            key: 'RECIPIENT', displayText: 'Recipient'
          },
          {
            key: 'THIRD_PARTY', displayText: 'Third Party'
          }
        ]
      }
    }];
    spyOn(component, 'setDutiesValueDisplayName');
    component.handleDutiesTaxestOptions(dutiesTaxResult);
    component.transportCostAndDutiesTaxDetails(BillingOptionsUtil.DUTIES_TAX);
    expect(component.enableDutiesDropDown).toEqual(false);
  });

  fit('should be able to refresh rate details on change of transportCost', () => {
    component.currentShippingInfo = initialState.shippingApp;
    component.currentShippingInfo.paymentDetails = {
      shippingBillTo: BillingOptionsUtil.getPaymentType(BillingOptionsUtil.BILL_RECIPIENT).value,
      shippingBillToDisplayable: 'Bill Recipient',
      shippingAccountNumber: '',
      shippingAccountNumberDisplayable: 'Bill Recipient',
      dutiesTaxesBillTo: 'RECIPIENT',
      dutiesTaxesBillToDisplayable: 'Bill Recipient',
      dutiesTaxesAccountNumber: '',
      dutiesTaxesAccountNumberDisplayable: 'Bill Recipient'
    }
    component.billingForm.controls.shippingBillTo.setValue(BillingOptionsUtil.getPaymentType(BillingOptionsUtil.PAY_AT_DROP_OFF).value);
    spyOn(component, 'refreshRateQuote');
    component.onSelectTransportationCost();
    expect(component.refreshRateQuote).toHaveBeenCalled();
  });

  fit('should navigate to summary page after updating page details and clicked update button.', () => {
    component.editBillingPageDetails = true;
    fixture.detectChanges();
    component.submitForm();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/', 'shipping', 'summary']);
  });

  fit('should navigate to summary page after clicking cancel without updating page details.', () => {
    fixture.detectChanges();
    component.cancelEditBillingPageDetails();
    expect(component.editBillingPageDetails).toEqual(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/', 'shipping', 'summary']);
  });

  fit('should show UPDATE, CANCEL buttons and keep current state values to be use on cancel click.', fakeAsync(() => {
    component.addListenerForEditFromSummary();
    fixture.detectChanges();
    window.dispatchEvent(new Event('editBillingServiceOptionDetails'));
    tick(500);
    expect(component.editBillingPageDetails).toEqual(true);
  }));

  fit('should set Transport Form values.', () => {
    const mockModalResponse = {
      data: BillingOptionsUtil.BILL_RECIPIENT,
      role: ''
    };
    spyOn(component, 'setTransportValueDisplayName');
    component.setTransportFormValues(mockModalResponse);
    fixture.detectChanges();
    expect(component.billingForm.controls.transportVal.value).toEqual('Bill Recipient');

    const mockModalResponseAcc = {
      data: BillingOptionsUtil.BILL_RECIPIENT,
      role: '123456789'
    };

    component.setTransportFormValues(mockModalResponseAcc);
    fixture.detectChanges();
    expect(component.billingForm.controls.transportVal.value).toEqual('Bill Recipient-123456789');
  });

  fit('should set Duties and Taxes Form values.', () => {
    const mockModalResponse = {
      data: BillingOptionsUtil.BILL_RECIPIENT,
      role: ''
    };
    spyOn(component, 'setDutiesValueDisplayName');
    component.setDutiesAndTaxesFormValues(mockModalResponse);
    fixture.detectChanges();
    expect(component.billingForm.controls.dutiesVal.value).toEqual('Bill Recipient');

    const mockModalResponseAcc = {
      data: BillingOptionsUtil.BILL_RECIPIENT,
      role: '222222222'
    };

    component.setDutiesAndTaxesFormValues(mockModalResponseAcc);
    fixture.detectChanges();
    expect(component.billingForm.controls.dutiesVal.value).toEqual('Bill Recipient-222222222');
  });

  fit('should update Transport Form values, when duties has selected same values.', () => {
    component.transportationSelectedType = BillingOptionsUtil.BILL_RECIPIENT;
    const mockModalResponse = {
      data: BillingOptionsUtil.BILL_RECIPIENT,
      role: '123456789'
    };

    spyOn(component, 'setTransportFormValues')

    component.checkSelectedPaymentOptionsTransport(mockModalResponse);
    fixture.detectChanges();
    expect(component.setTransportFormValues).toHaveBeenCalledWith(mockModalResponse);

  });

  fit('should not update Transport Form values, when duties has Bill Recipient without account number.', () => {
    component.transportationSelectedType = BillingOptionsUtil.BILL_RECIPIENT;
    const mockModalResponse = {
      data: BillingOptionsUtil.BILL_RECIPIENT,
      role: ''
    };

    spyOn(component, 'setTransportFormValues')

    component.checkSelectedPaymentOptionsTransport(mockModalResponse);
    fixture.detectChanges();
    expect(component.setTransportFormValues).not.toHaveBeenCalled();
  });

  fit('should not update Transport Form values, when duties has different type of selection.', () => {
    component.transportationSelectedType = BillingOptionsUtil.BILL_MY_ACCOUNT;
    const mockModalResponse = {
      data: BillingOptionsUtil.BILL_RECIPIENT,
      role: ''
    };

    spyOn(component, 'setTransportFormValues')

    component.checkSelectedPaymentOptionsTransport(mockModalResponse);
    fixture.detectChanges();
    expect(component.setTransportFormValues).not.toHaveBeenCalled();

  })

  fit('should not update Duties and Taxes Form values, when transport form has selected same values.', () => {
    component.dutiesAndTaxesSelectedType = BillingOptionsUtil.BILL_RECIPIENT;
    const mockModalResponse = {
      data: BillingOptionsUtil.BILL_RECIPIENT,
      role: ''
    };
    spyOn(component, 'setDutiesAndTaxesFormValues')

    component.checkSelectedPaymentOptionsBilling(mockModalResponse);
    fixture.detectChanges();
    expect(component.setDutiesAndTaxesFormValues).toHaveBeenCalledWith(mockModalResponse);
  });


  fit('should update Duties and Taxes Form values, when transport form has selected same values.', () => {
    component.dutiesAndTaxesSelectedType = BillingOptionsUtil.BILL_RECIPIENT;
    const mockModalResponse = {
      data: BillingOptionsUtil.BILL_RECIPIENT,
      role: '123456789'
    };
    spyOn(component, 'setDutiesAndTaxesFormValues')

    component.checkSelectedPaymentOptionsBilling(mockModalResponse);
    fixture.detectChanges();
    expect(component.setDutiesAndTaxesFormValues).toHaveBeenCalledWith(mockModalResponse);
  });

  fit('should not update Duties and Taxes Form values, when transport form has selected different values.', () => {
    component.dutiesAndTaxesSelectedType = BillingOptionsUtil.BILL_MY_ACCOUNT;
    const mockModalResponse = {
      data: BillingOptionsUtil.BILL_RECIPIENT,
      role: '123456789'
    };
    spyOn(component, 'setDutiesAndTaxesFormValues')

    component.checkSelectedPaymentOptionsBilling(mockModalResponse);
    fixture.detectChanges();
    expect(component.setDutiesAndTaxesFormValues).not.toHaveBeenCalled();
  });

  fit('should show/not show modal when isModalPresent is true.', () => {
    component.enableDropDown = false;
    component.isModalPresent = true;
    component.transportCostAndDutiesTaxDetails(BillingOptionsUtil.TRANSPORT_COST);
    expect(component.isModalPresent).toBe(true);

    component.enableDropDown = true;
    component.isModalPresent = true;
    component.transportCostAndDutiesTaxDetails(BillingOptionsUtil.DUTIES_TAX);
    expect(component.isModalPresent).toBe(true);

    component.enableDropDown = true;
    component.isModalPresent = false;
    component.transportCostAndDutiesTaxDetails(BillingOptionsUtil.TRANSPORT_COST);
    expect(component.isModalPresent).toBe(true);

    component.enableDropDown = false;
    component.isModalPresent = false;
    component.transportCostAndDutiesTaxDetails(BillingOptionsUtil.DUTIES_TAX);
    expect(component.isModalPresent).toBe(false);
  });

  fit('should do ngDoCheck', () => {
    spyOn(component, 'refreshRateQuote');
    component.selectedLanguage = 'zh_hk';
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en_hk');
    component.ngDoCheck();
    expect(component.selectedLanguage).toEqual(sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE));
    expect(component.refreshRateQuote).toHaveBeenCalled();
  });


  fit('should be able to request for rate quote', () => {
    component.ratesList = [];
    component.hasRateServiceLoaded = true;
    component.getRateQuote(initialState.shippingApp);
    expect(component.hasRateServiceLoaded).toBe(true);

  });

  fit('should be able to request for rate quote', () => {
    component.ratesList = [];
    const ratesDiscount: ApiResponse = getMockRateWithoutDiscountResponse();
    const rateReplyDetails: RateReplyDetail[] = getMockRateQuoteResponse().output.rateReplyDetails;
    component.getRateQuote(initialState.shippingApp);

    expect(component.ratesList).toBeDefined(ratesReqMapper.mapRateQuoteResponseToGUI(rateReplyDetails, ratesDiscount.configlist));

  });

  fit('should be able to change value after toggle', () => {
    component.changeArrow(true);
    expect(component.downArrow).toEqual(false);

    component.changeArrow(false);
    expect(component.downArrow).toEqual(true);

  });

  fit('should call create modal', () => {
    spyOn(component.modalCtrl, 'create');
    component.signatureOptionBubbleHint();
    expect(component.modalCtrl.create).toHaveBeenCalled();
  });

  fit('should be able to request for refresh rate quote', () => {
    mockStore.overrideSelector(fromShippingSelector.selectShippingInfo, initialState.shippingApp);
    spyOn(component, 'getRateQuote');
    component.refreshRateQuote();

    expect(component.getRateQuote).toHaveBeenCalledWith(initialState.shippingApp);
  });

  fit('should be able to map payment details', () => {

    const paymentDetails = {
      shippingBillTo: 'PAY_DROPOFF',
      shippingBillToDisplayable: 'Pay at drop off',
      shippingAccountNumber: '123456789',
      shippingAccountNumberDisplayable: 'Pay at drop off',
      dutiesTaxesBillTo: 'RECIPIENT',
      dutiesTaxesBillToDisplayable: 'Bill Recipient',
      dutiesTaxesAccountNumber: '3001234567',
      dutiesTaxesAccountNumberDisplayable: 'Bill Recipient'
    }

    component.billingForm.controls.shippingBillTo.setValue('PAY_DROPOFF')
    component.billingForm.controls.shippingBillToDisplayable.setValue('Pay at drop off')
    component.billingForm.controls.shippingAccountNumber.setValue('123456789')
    component.billingForm.controls.shippingAccountNumberDisplayable.setValue('Pay at drop off')
    component.billingForm.controls.dutiesTaxesBillTo.setValue('RECIPIENT')
    component.billingForm.controls.dutiesTaxesBillToDisplayable.setValue('Bill Recipient')
    component.billingForm.controls.dutiesTaxesAccountNumber.setValue('3001234567')
    component.billingForm.controls.dutiesTaxesAccountNumberDisplayable.setValue('Bill Recipient')
    const result = component.mapPaymentDetailsToShippingAppModel()
    fixture.detectChanges();
    expect(result).toEqual(paymentDetails);
  });

  class APIMRatesServiceStub {
    getMockRateQuoteResponse = {
      transactionId: 'a93b492b-8b83-495b-ac80-9b3009313fc0',
      output: {
        rateReplyDetails: [
          {
            serviceType: 'INTERNATIONAL_FIRST',
            serviceSubOptionDetail: {

            },
            serviceName: 'FedEx International First®',
            packagingType: 'YOUR_PACKAGING',
            commit: {
              dateDetail: {
                dayOfWeek: 'Mon',
                time: '08:00',
                day: 'Sep 28, 2020',
                dayCxsFormat: 'Sep-28-2020'
              },
              commodityName: 'MEDICAL EQUIPMENT',
              label: 'Delivery date unavailable',
              commitMessageDetails: 'Delivery date and time estimates are not available for this shipment.',
              alternativeCommodityNames: [
                '1',
                'PRESCRIBED MEDICINE',
                '1',
                'PLASTIC PARTS',
                '1',
                'APPAREL, TEXTILE',
                '1',
                'MACHINERY, ELEC.',
                '1',
                'FURNITURE',
                '1',
                'LEATHER GOODS',
                '1',
                'LAB EQUIPMENT',
                '1',
                'PERSONAL EFFECTS'
              ]
            },
            customerMessages: [
              {
                code: 'customsnote',
                message: 'customsnote'
              },
              {
                code: 'postalAwareAdditionalNote',
                message: 'postalAwareAdditionalNote'
              }
            ],
            ratedShipmentDetails: [
              {
                rateType: 'LIST',
                ratedWeightMethod: 'ACTUAL',
                totalBaseCharge: [
                  {
                    currency: 'HKD',
                    amount: 3239.7
                  }
                ],
                totalNetCharge: [
                  {
                    currency: 'HKD',
                    amount: 3793.85
                  }
                ],
                totalVatCharge: [
                  {
                    amount: 0
                  }
                ],
                totalNetFedExCharge: [
                  {
                    currency: 'HKD',
                    amount: 3793.85
                  }
                ],
                totalDutiesAndTaxes: [
                  {
                    currency: 'HKD',
                    amount: 0
                  }
                ],
                totalNetChargeWithDutiesAndTaxes: [
                  {
                    currency: 'HKD',
                    amount: 3793.85
                  }
                ],
                shipmentLegRateDetails: [
                  {
                    rateScale: 'HK001OF2_06_YOUR_PACKAGING',
                    totalBaseCharge: [
                      {
                        currency: 'HKD',
                        amount: 3239.7
                      }
                    ],
                    totalNetCharge: [
                      {
                        currency: 'HKD',
                        amount: 3793.85
                      }
                    ],
                    taxes: [

                    ],
                    surcharges: [
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
                    discounts: [
                      {
                        type: 'VOLUME',
                        description: 'Volume discount',
                        amount: [
                          {
                            currency: 'HKD',
                            amount: 138.5
                          }
                        ],
                        percent: 40.0
                      }
                    ]
                  }
                ],
                ancillaryFeesAndTaxes: [],
                totalDutiesTaxesAndFees: [
                  {
                    currency: 'HKD',
                    amount: 0
                  }
                ],
                totalAncillaryFeesAndTaxes: [
                  {
                    currency: 'HKD',
                    amount: 0
                  }
                ],
                shipmentRateDetail: {
                  rateZone: 'HK001O',
                  dimDivisor: 139,
                  fuelSurchargePercent: 9.5,
                  totalSurcharges: {
                    currency: 'HKD',
                    amount: 554.15
                  },
                  totalFreightDiscount: {
                    currency: 'HKD',
                    amount: 0
                  },
                  freightDiscount: [],
                  surCharges: [
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
                  ]
                }
              }
            ],
            anonymouslyAllowable: true,
            operationalDetail: {
              originLocationIds: ['HHPA'],
              originLocationNumbers: [0],
              originServiceAreas: ['AM'],
              destinationLocationIds: ['NQAA '],
              destinationLocationNumbers: [0],
              destinationServiceAreas: ['A1'],
              destinationLocationStateOrProvinceCodes: ['TN'],
              deliveryDate: '2020-09-28T08:00:00',
              deliveryDay: 'MON',
              commitDates: [
                '2020-09-28T08:00:00'
              ],
              commitDays: ['MON'],
              ineligibleForMoneyBackGuarantee: false,
              astraDescription: 'INTL1ST',
              originPostalCodes: ['425'],
              stateOrProvinceCodes: ['  '],
              countryCodes: ['HK'],
              airportId: 'MEM',
              serviceCode: '06',
              destinationPostalCodes: ['38111']
            },
            saturdayDelivery: false
          },
          {
            serviceType: 'INTERNATIONAL_PRIORITY',
            serviceSubOptionDetail: {

            },
            serviceName: 'International Priority®',
            packagingType: 'YOUR_PACKAGING',
            commit: {
              dateDetail: {
                dayOfWeek: 'Mon',
                time: '10:30',
                day: 'Sep 28, 2020',
                dayCxsFormat: 'Sep-28-2020'
              },
              label: 'Delivery date unavailable',
              commitMessageDetails: 'Delivery date and time estimates are not available for this shipment.',
              commodityName: 'MEDICAL EQUIPMENT',
              alternativeCommodityNames: [
                '1',
                'PRESCRIBED MEDICINE',
                '1',
                'PLASTIC PARTS',
                '1',
                'APPAREL, TEXTILE',
                '1',
                'MACHINERY, ELEC.',
                '1',
                'FURNITURE',
                '1',
                'LEATHER GOODS',
                '1',
                'LAB EQUIPMENT',
                '1',
                'PERSONAL EFFECTS'
              ]
            },
            customerMessages: [
              {
                code: 'customsnote',
                message: 'customsnote'
              },
              {
                code: 'postalAwareAdditionalNote',
                message: 'postalAwareAdditionalNote'
              }
            ],
            ratedShipmentDetails: [
              {
                rateType: 'LIST',
                ratedWeightMethod: 'ACTUAL',
                totalBaseCharge: [
                  {
                    currency: 'HKD',
                    amount: 3389.05
                  }
                ],
                totalNetCharge: [
                  {
                    currency: 'HKD',
                    amount: 3965.57
                  }
                ],
                totalVatCharge: [
                  {
                    amount: 0
                  }
                ],
                totalNetFedExCharge: [
                  {
                    currency: 'HKD',
                    amount: 3965.57
                  }
                ],
                totalDutiesAndTaxes: [
                  {
                    currency: 'HKD',
                    amount: 0
                  }
                ],
                totalNetChargeWithDutiesAndTaxes: [
                  {
                    currency: 'HKD',
                    amount: 3965.57
                  }
                ],
                shipmentLegRateDetails: [
                  {
                    rateScale: 'HK001OF2_01_YOUR_PACKAGING',
                    totalBaseCharge: [
                      {
                        currency: 'HKD',
                        amount: 3389.05
                      }
                    ],
                    totalNetCharge: [
                      {
                        currency: 'HKD',
                        amount: 3965.57
                      }
                    ],
                    taxes: [

                    ],
                    surcharges: [
                      {
                        type: 'FUEL',
                        description: 'Fuel Surcharge',
                        amount: [
                          {
                            currency: 'HKD',
                            amount: 344.02
                          }
                        ]
                      },
                      {
                        type: 'PEAK',
                        description: 'Peak Surcharge',
                        amount: [
                          {
                            currency: 'HKD',
                            amount: 232.5
                          }
                        ]
                      }
                    ],
                    discounts: [
                      {
                        type: 'VOLUME',
                        description: 'Volume discount',
                        amount: [
                          {
                            currency: 'HKD',
                            amount: 215.18
                          }
                        ],
                        percent: 40.0
                      }
                    ]
                  }
                ],
                ancillaryFeesAndTaxes: [

                ],
                totalDutiesTaxesAndFees: [
                  {
                    currency: 'HKD',
                    amount: 0
                  }
                ],
                totalAncillaryFeesAndTaxes: [
                  {
                    currency: 'HKD',
                    amount: 0
                  }
                ],
                shipmentRateDetail: {
                  rateZone: 'HK001O',
                  dimDivisor: 139,
                  fuelSurchargePercent: 9.5,
                  totalSurcharges: {
                    currency: 'HKD',
                    amount: 576.52
                  },
                  totalFreightDiscount: {
                    currency: 'HKD',
                    amount: 0
                  },
                  freightDiscount: [],
                  surCharges: [
                    {
                      type: 'FUEL',
                      description: 'Fuel Surcharge',
                      amount: [
                        {
                          currency: 'HKD',
                          amount: 344.02
                        }
                      ]
                    },
                    {
                      type: 'PEAK',
                      description: 'Peak Surcharge',
                      amount: [
                        {
                          currency: 'HKD',
                          amount: 232.5
                        }
                      ]
                    }
                  ]
                }
              }
            ],
            anonymouslyAllowable: true,
            operationalDetail: {
              originLocationIds: ['HHPA '],
              originLocationNumbers: [0],
              originServiceAreas: ['AM'],
              destinationLocationIds: ['NQAA '],
              destinationLocationNumbers: [0],
              destinationServiceAreas: ['A1'],
              destinationLocationStateOrProvinceCodes: ['TN'],
              deliveryDate: '2020-09-28T10:30:00',
              deliveryDay: 'MON',
              commitDates: ['2020-09-28T10:30:00'],
              commitDays: ['MON'],
              ineligibleForMoneyBackGuarantee: false,
              astraDescription: 'IP',
              originPostalCodes: ['425'],
              stateOrProvinceCodes: ['  '],
              countryCodes: ['HK'],
              airportId: 'MEM',
              serviceCode: '01',
              destinationPostalCodes: ['38111']
            },
            saturdayDelivery: false
          },
          {
            serviceType: 'INTERNATIONAL_ECONOMY',
            serviceSubOptionDetail: {

            },
            serviceName: 'FedEx International Economy®',
            packagingType: 'YOUR_PACKAGING',
            commit: {
              dateDetail: {
                dayOfWeek: 'Mon',
                time: '16:30',
                day: 'Oct 05, 2020',
                dayCxsFormat: 'Oct-05-2020'
              },
              label: 'Delivery date unavailable',
              commitMessageDetails: 'Delivery date and time estimates are not available for this shipment.',
              commodityName: 'MEDICAL EQUIPMENT',
              alternativeCommodityNames: [
                '1',
                'PRESCRIBED MEDICINE',
                '1',
                'PLASTIC PARTS',
                '1',
                'APPAREL, TEXTILE',
                '1',
                'MACHINERY, ELEC.',
                '1',
                'FURNITURE',
                '1',
                'LEATHER GOODS',
                '1',
                'LAB EQUIPMENT',
                '1',
                'PERSONAL EFFECTS'
              ]
            },
            customerMessages: [
              {
                code: 'customsnote',
                message: 'customsnote'
              },
              {
                code: 'postalAwareAdditionalNote',
                message: 'postalAwareAdditionalNote'
              }
            ],
            ratedShipmentDetails: [
              {
                rateType: 'LIST',
                ratedWeightMethod: 'ACTUAL',
                totalBaseCharge: [
                  {
                    currency: 'HKD',
                    amount: 2525.7
                  }
                ],
                totalNetCharge: [
                  {
                    currency: 'HKD',
                    amount: 3020.22
                  }
                ],
                totalVatCharge: [
                  {
                    amount: 0
                  }
                ],
                totalNetFedExCharge: [
                  {
                    currency: 'HKD',
                    amount: 3020.22
                  }
                ],
                totalDutiesAndTaxes: [
                  {
                    currency: 'HKD',
                    amount: 0
                  }
                ],
                totalNetChargeWithDutiesAndTaxes: [
                  {
                    currency: 'HKD',
                    amount: 3020.22
                  }
                ],
                shipmentLegRateDetails: [
                  {
                    rateScale: 'HK001OF2_04_YOUR_PACKAGING',
                    totalBaseCharge: [
                      {
                        currency: 'HKD',
                        amount: 2525.7
                      }
                    ],
                    totalNetCharge: [
                      {
                        currency: 'HKD',
                        amount: 3020.22
                      }
                    ],
                    taxes: [

                    ],
                    surcharges: [
                      {
                        type: 'FUEL',
                        description: 'Fuel Surcharge',
                        amount: [
                          {
                            currency: 'HKD',
                            amount: 262.02
                          }
                        ]
                      },
                      {
                        type: 'PEAK',
                        description: 'Peak Surcharge',
                        amount: [
                          {
                            currency: 'HKD',
                            amount: 232.5
                          }
                        ]
                      }
                    ],
                    discounts: [
                      {
                        type: 'VOLUME',
                        description: 'Volume discount',
                        amount: [
                          {
                            currency: 'HKD',
                            amount: 215.18
                          }
                        ],
                        percent: 40.0
                      }
                    ]
                  }
                ],
                ancillaryFeesAndTaxes: [

                ],
                totalDutiesTaxesAndFees: [
                  {
                    currency: 'HKD',
                    amount: 0
                  }
                ],
                totalAncillaryFeesAndTaxes: [
                  {
                    currency: 'HKD',
                    amount: 0
                  }
                ],
                shipmentRateDetail: {
                  rateZone: 'HK001O',
                  dimDivisor: 139,
                  fuelSurchargePercent: 9.5,
                  totalSurcharges: {
                    currency: 'HKD',
                    amount: 494.52
                  },
                  totalFreightDiscount: {
                    currency: 'HKD',
                    amount: 0
                  },
                  freightDiscount: [

                  ],
                  surCharges: [
                    {
                      type: 'FUEL',
                      description: 'Fuel Surcharge',
                      amount: [
                        {
                          currency: 'HKD',
                          amount: 262.02
                        }
                      ]
                    },
                    {
                      type: 'PEAK',
                      description: 'Peak Surcharge',
                      amount: [
                        {
                          currency: 'HKD',
                          amount: 232.5
                        }
                      ]
                    }
                  ]
                }
              }
            ],
            anonymouslyAllowable: true,
            operationalDetail: {
              originLocationIds: ['HHPA '],
              originLocationNumbers: [0],
              originServiceAreas: ['AM'],
              destinationLocationIds: ['NQAA '],
              destinationLocationNumbers: [0],
              destinationServiceAreas: ['A1'],
              destinationLocationStateOrProvinceCodes: ['TN'],
              deliveryDate: '2020-10-05T16:30:00',
              deliveryDay: 'MON',
              commitDates: ['2020-10-05T16:30:00'],
              commitDays: ['MON'],
              ineligibleForMoneyBackGuarantee: false,
              astraDescription: 'IE',
              originPostalCodes: ['425'],
              stateOrProvinceCodes: ['  '],
              countryCodes: ['HK'],
              airportId: 'MEM',
              serviceCode: '04',
              destinationPostalCodes: ['38111']
            },
            saturdayDelivery: false
          }
        ],
        servicesAvailableAndFiltered: false,
        quoteDate: 'Sep-25-2020',
        encoded: false
      }
    }
    getRateQuoteV2(rateQuoteRequest: RateQuoteRequest) {
      return Observable.create((observer: Observer<any>) => {
        observer.next(this.getMockRateQuoteResponse);
      });
    }
  }

  function getMockRateQuoteResponse() {
    return {
      transactionId: 'a93b492b-8b83-495b-ac80-9b3009313fc0',
      output: {
        rateReplyDetails: [
          {
            serviceType: 'INTERNATIONAL_FIRST',
            serviceSubOptionDetail: {

            },
            serviceName: 'FedEx International First®',
            packagingType: 'YOUR_PACKAGING',
            commit: {
              dateDetail: {
                dayOfWeek: 'Mon',
                time: '08:00',
                day: 'Sep 28, 2020',
                dayCxsFormat: 'Sep-28-2020'
              },
              commodityName: 'MEDICAL EQUIPMENT',
              label: 'Delivery date unavailable',
              commitMessageDetails: 'Delivery date and time estimates are not available for this shipment.',
              alternativeCommodityNames: [
                '1',
                'PRESCRIBED MEDICINE',
                '1',
                'PLASTIC PARTS',
                '1',
                'APPAREL, TEXTILE',
                '1',
                'MACHINERY, ELEC.',
                '1',
                'FURNITURE',
                '1',
                'LEATHER GOODS',
                '1',
                'LAB EQUIPMENT',
                '1',
                'PERSONAL EFFECTS'
              ]
            },
            customerMessages: [
              {
                code: 'customsnote',
                message: 'customsnote'
              },
              {
                code: 'postalAwareAdditionalNote',
                message: 'postalAwareAdditionalNote'
              }
            ],
            ratedShipmentDetails: [
              {
                rateType: 'LIST',
                ratedWeightMethod: 'ACTUAL',
                totalBaseCharge: [
                  {
                    currency: 'HKD',
                    amount: 3239.7
                  }
                ],
                totalNetCharge: [
                  {
                    currency: 'HKD',
                    amount: 3793.85
                  }
                ],
                totalVatCharge: [
                  {
                    amount: 0
                  }
                ],
                totalNetFedExCharge: [
                  {
                    currency: 'HKD',
                    amount: 3793.85
                  }
                ],
                totalDutiesAndTaxes: [
                  {
                    currency: 'HKD',
                    amount: 0
                  }
                ],
                totalNetChargeWithDutiesAndTaxes: [
                  {
                    currency: 'HKD',
                    amount: 3793.85
                  }
                ],
                shipmentLegRateDetails: [
                  {
                    rateScale: 'HK001OF2_06_YOUR_PACKAGING',
                    totalBaseCharge: [
                      {
                        currency: 'HKD',
                        amount: 3239.7
                      }
                    ],
                    totalNetCharge: [
                      {
                        currency: 'HKD',
                        amount: 3793.85
                      }
                    ],
                    taxes: [

                    ],
                    surcharges: [
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
                    discounts: [
                      {
                        type: 'VOLUME',
                        description: 'Volume discount',
                        amount: [
                          {
                            currency: 'HKD',
                            amount: 138.5
                          }
                        ],
                        percent: 40.0
                      }
                    ]
                  }
                ],
                ancillaryFeesAndTaxes: [],
                totalDutiesTaxesAndFees: [
                  {
                    currency: 'HKD',
                    amount: 0
                  }
                ],
                totalAncillaryFeesAndTaxes: [
                  {
                    currency: 'HKD',
                    amount: 0
                  }
                ],
                shipmentRateDetail: {
                  rateZone: 'HK001O',
                  dimDivisor: 139,
                  fuelSurchargePercent: 9.5,
                  totalSurcharges: {
                    currency: 'HKD',
                    amount: 554.15
                  },
                  totalFreightDiscount: {
                    currency: 'HKD',
                    amount: 0
                  },
                  freightDiscount: [],
                  surCharges: [
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
                  ]
                }
              }
            ],
            anonymouslyAllowable: true,
            operationalDetail: {
              originLocationIds: ['HHPA'],
              originLocationNumbers: [0],
              originServiceAreas: ['AM'],
              destinationLocationIds: ['NQAA '],
              destinationLocationNumbers: [0],
              destinationServiceAreas: ['A1'],
              destinationLocationStateOrProvinceCodes: ['TN'],
              deliveryDate: '2020-09-28T08:00:00',
              deliveryDay: 'MON',
              commitDates: [
                '2020-09-28T08:00:00'
              ],
              commitDays: ['MON'],
              ineligibleForMoneyBackGuarantee: false,
              astraDescription: 'INTL1ST',
              originPostalCodes: ['425'],
              stateOrProvinceCodes: ['  '],
              countryCodes: ['HK'],
              airportId: 'MEM',
              serviceCode: '06',
              destinationPostalCodes: ['38111']
            },
            saturdayDelivery: false
          },
          {
            serviceType: 'INTERNATIONAL_PRIORITY',
            serviceSubOptionDetail: {

            },
            serviceName: 'International Priority®',
            packagingType: 'YOUR_PACKAGING',
            commit: {
              dateDetail: {
                dayOfWeek: 'Mon',
                time: '10:30',
                day: 'Sep 28, 2020',
                dayCxsFormat: 'Sep-28-2020'
              },
              label: 'Delivery date unavailable',
              commitMessageDetails: 'Delivery date and time estimates are not available for this shipment.',
              commodityName: 'MEDICAL EQUIPMENT',
              alternativeCommodityNames: [
                '1',
                'PRESCRIBED MEDICINE',
                '1',
                'PLASTIC PARTS',
                '1',
                'APPAREL, TEXTILE',
                '1',
                'MACHINERY, ELEC.',
                '1',
                'FURNITURE',
                '1',
                'LEATHER GOODS',
                '1',
                'LAB EQUIPMENT',
                '1',
                'PERSONAL EFFECTS'
              ]
            },
            customerMessages: [
              {
                code: 'customsnote',
                message: 'customsnote'
              },
              {
                code: 'postalAwareAdditionalNote',
                message: 'postalAwareAdditionalNote'
              }
            ],
            ratedShipmentDetails: [
              {
                rateType: 'LIST',
                ratedWeightMethod: 'ACTUAL',
                totalBaseCharge: [
                  {
                    currency: 'HKD',
                    amount: 3389.05
                  }
                ],
                totalNetCharge: [
                  {
                    currency: 'HKD',
                    amount: 3965.57
                  }
                ],
                totalVatCharge: [
                  {
                    amount: 0
                  }
                ],
                totalNetFedExCharge: [
                  {
                    currency: 'HKD',
                    amount: 3965.57
                  }
                ],
                totalDutiesAndTaxes: [
                  {
                    currency: 'HKD',
                    amount: 0
                  }
                ],
                totalNetChargeWithDutiesAndTaxes: [
                  {
                    currency: 'HKD',
                    amount: 3965.57
                  }
                ],
                shipmentLegRateDetails: [
                  {
                    rateScale: 'HK001OF2_01_YOUR_PACKAGING',
                    totalBaseCharge: [
                      {
                        currency: 'HKD',
                        amount: 3389.05
                      }
                    ],
                    totalNetCharge: [
                      {
                        currency: 'HKD',
                        amount: 3965.57
                      }
                    ],
                    taxes: [

                    ],
                    surcharges: [
                      {
                        type: 'FUEL',
                        description: 'Fuel Surcharge',
                        amount: [
                          {
                            currency: 'HKD',
                            amount: 344.02
                          }
                        ]
                      },
                      {
                        type: 'PEAK',
                        description: 'Peak Surcharge',
                        amount: [
                          {
                            currency: 'HKD',
                            amount: 232.5
                          }
                        ]
                      }
                    ],
                    discounts: [
                      {
                        type: 'VOLUME',
                        description: 'Volume discount',
                        amount: [
                          {
                            currency: 'HKD',
                            amount: 215.18
                          }
                        ],
                        percent: 40.0
                      }
                    ]
                  }
                ],
                ancillaryFeesAndTaxes: [

                ],
                totalDutiesTaxesAndFees: [
                  {
                    currency: 'HKD',
                    amount: 0
                  }
                ],
                totalAncillaryFeesAndTaxes: [
                  {
                    currency: 'HKD',
                    amount: 0
                  }
                ],
                shipmentRateDetail: {
                  rateZone: 'HK001O',
                  dimDivisor: 139,
                  fuelSurchargePercent: 9.5,
                  totalSurcharges: {
                    currency: 'HKD',
                    amount: 576.52
                  },
                  totalFreightDiscount: {
                    currency: 'HKD',
                    amount: 0
                  },
                  freightDiscount: [],
                  surCharges: [
                    {
                      type: 'FUEL',
                      description: 'Fuel Surcharge',
                      amount: [
                        {
                          currency: 'HKD',
                          amount: 344.02
                        }
                      ]
                    },
                    {
                      type: 'PEAK',
                      description: 'Peak Surcharge',
                      amount: [
                        {
                          currency: 'HKD',
                          amount: 232.5
                        }
                      ]
                    }
                  ]
                }
              }
            ],
            anonymouslyAllowable: true,
            operationalDetail: {
              originLocationIds: ['HHPA '],
              originLocationNumbers: [0],
              originServiceAreas: ['AM'],
              destinationLocationIds: ['NQAA '],
              destinationLocationNumbers: [0],
              destinationServiceAreas: ['A1'],
              destinationLocationStateOrProvinceCodes: ['TN'],
              deliveryDate: '2020-09-28T10:30:00',
              deliveryDay: 'MON',
              commitDates: ['2020-09-28T10:30:00'],
              commitDays: ['MON'],
              ineligibleForMoneyBackGuarantee: false,
              astraDescription: 'IP',
              originPostalCodes: ['425'],
              stateOrProvinceCodes: ['  '],
              countryCodes: ['HK'],
              airportId: 'MEM',
              serviceCode: '01',
              destinationPostalCodes: ['38111']
            },
            saturdayDelivery: false
          },
          {
            serviceType: 'INTERNATIONAL_ECONOMY',
            serviceSubOptionDetail: {

            },
            serviceName: 'FedEx International Economy®',
            packagingType: 'YOUR_PACKAGING',
            commit: {
              dateDetail: {
                dayOfWeek: 'Mon',
                time: '16:30',
                day: 'Oct 05, 2020',
                dayCxsFormat: 'Oct-05-2020'
              },
              label: 'Delivery date unavailable',
              commitMessageDetails: 'Delivery date and time estimates are not available for this shipment.',
              commodityName: 'MEDICAL EQUIPMENT',
              alternativeCommodityNames: [
                '1',
                'PRESCRIBED MEDICINE',
                '1',
                'PLASTIC PARTS',
                '1',
                'APPAREL, TEXTILE',
                '1',
                'MACHINERY, ELEC.',
                '1',
                'FURNITURE',
                '1',
                'LEATHER GOODS',
                '1',
                'LAB EQUIPMENT',
                '1',
                'PERSONAL EFFECTS'
              ]
            },
            customerMessages: [
              {
                code: 'customsnote',
                message: 'customsnote'
              },
              {
                code: 'postalAwareAdditionalNote',
                message: 'postalAwareAdditionalNote'
              }
            ],
            ratedShipmentDetails: [
              {
                rateType: 'LIST',
                ratedWeightMethod: 'ACTUAL',
                totalBaseCharge: [
                  {
                    currency: 'HKD',
                    amount: 2525.7
                  }
                ],
                totalNetCharge: [
                  {
                    currency: 'HKD',
                    amount: 3020.22
                  }
                ],
                totalVatCharge: [
                  {
                    amount: 0
                  }
                ],
                totalNetFedExCharge: [
                  {
                    currency: 'HKD',
                    amount: 3020.22
                  }
                ],
                totalDutiesAndTaxes: [
                  {
                    currency: 'HKD',
                    amount: 0
                  }
                ],
                totalNetChargeWithDutiesAndTaxes: [
                  {
                    currency: 'HKD',
                    amount: 3020.22
                  }
                ],
                shipmentLegRateDetails: [
                  {
                    rateScale: 'HK001OF2_04_YOUR_PACKAGING',
                    totalBaseCharge: [
                      {
                        currency: 'HKD',
                        amount: 2525.7
                      }
                    ],
                    totalNetCharge: [
                      {
                        currency: 'HKD',
                        amount: 3020.22
                      }
                    ],
                    taxes: [

                    ],
                    surcharges: [
                      {
                        type: 'FUEL',
                        description: 'Fuel Surcharge',
                        amount: [
                          {
                            currency: 'HKD',
                            amount: 262.02
                          }
                        ]
                      },
                      {
                        type: 'PEAK',
                        description: 'Peak Surcharge',
                        amount: [
                          {
                            currency: 'HKD',
                            amount: 232.5
                          }
                        ]
                      }
                    ],
                    discounts: [
                      {
                        type: 'VOLUME',
                        description: 'Volume discount',
                        amount: [
                          {
                            currency: 'HKD',
                            amount: 215.18
                          }
                        ],
                        percent: 40.0
                      }
                    ]
                  }
                ],
                ancillaryFeesAndTaxes: [

                ],
                totalDutiesTaxesAndFees: [
                  {
                    currency: 'HKD',
                    amount: 0
                  }
                ],
                totalAncillaryFeesAndTaxes: [
                  {
                    currency: 'HKD',
                    amount: 0
                  }
                ],
                shipmentRateDetail: {
                  rateZone: 'HK001O',
                  dimDivisor: 139,
                  fuelSurchargePercent: 9.5,
                  totalSurcharges: {
                    currency: 'HKD',
                    amount: 494.52
                  },
                  totalFreightDiscount: {
                    currency: 'HKD',
                    amount: 0
                  },
                  freightDiscount: [

                  ],
                  surCharges: [
                    {
                      type: 'FUEL',
                      description: 'Fuel Surcharge',
                      amount: [
                        {
                          currency: 'HKD',
                          amount: 262.02
                        }
                      ]
                    },
                    {
                      type: 'PEAK',
                      description: 'Peak Surcharge',
                      amount: [
                        {
                          currency: 'HKD',
                          amount: 232.5
                        }
                      ]
                    }
                  ]
                }
              }
            ],
            anonymouslyAllowable: true,
            operationalDetail: {
              originLocationIds: ['HHPA '],
              originLocationNumbers: [0],
              originServiceAreas: ['AM'],
              destinationLocationIds: ['NQAA '],
              destinationLocationNumbers: [0],
              destinationServiceAreas: ['A1'],
              destinationLocationStateOrProvinceCodes: ['TN'],
              deliveryDate: '2020-10-05T16:30:00',
              deliveryDay: 'MON',
              commitDates: ['2020-10-05T16:30:00'],
              commitDays: ['MON'],
              ineligibleForMoneyBackGuarantee: false,
              astraDescription: 'IE',
              originPostalCodes: ['425'],
              stateOrProvinceCodes: ['  '],
              countryCodes: ['HK'],
              airportId: 'MEM',
              serviceCode: '04',
              destinationPostalCodes: ['38111']
            },
            saturdayDelivery: false
          }
        ],
        servicesAvailableAndFiltered: false,
        quoteDate: 'Sep-25-2020',
        encoded: false
      }
    };
  }


  // Mock Rate Discount Response - Zero or No Discount
  function getMockRateWithoutDiscountResponse(): ApiResponse {
    return {
      configlist: [
        {
          value: 0,
          seq: 1
        }
      ]
    }
  }

});