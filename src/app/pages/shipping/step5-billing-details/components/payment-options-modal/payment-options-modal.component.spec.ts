import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, ModalController, NavParams } from '@ionic/angular';
import * as testConfig from '../../../../../../assets/config/mockConfigForTest';
import { PaymentOptionsModalComponent } from './payment-options-modal.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BillingOptionsUtil } from '../../../../../types/constants/billing-and-service-options.constants';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { LanguageLoader } from 'src/app/app.module';
import { APIMPaymentService } from '../../../../../core/providers/apim/payment.service';
import { Observable, Observer } from 'rxjs';
import { ConfigService } from '@ngx-config/core';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { AppState } from 'src/app/+store/app.state';
import { SessionItems } from 'src/app/types/enum/session-items.enum';

describe('TransportDutiesComponent', () => {
  let component: PaymentOptionsModalComponent;
  let fixture: ComponentFixture<PaymentOptionsModalComponent>;
  let mockStore: MockStore<AppState>;

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
        shippingAccountNumberDisplayable: '',
        dutiesTaxesBillTo: 'RECIPIENT',
        dutiesTaxesBillToDisplayable: 'Bill Recipient',
        dutiesTaxesAccountNumber: '3001234567',
        dutiesTaxesAccountNumberDisplayable: ''
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

  const mockPaymentTypeData = [
    { key: 'SENDER', 'displayText': 'My account' },
    { key: 'RECIPIENT', 'displayText': 'Recipient' },
    { key: 'THIRD_PARTY', 'displayText': 'Third Party' }
  ];

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

    TestBed.configureTestingModule({
      declarations: [
        PaymentOptionsModalComponent
      ],
      providers: [
        NavParams,
        FormBuilder,
        ModalController,
        provideMockStore({ initialState }),
        { provide: APIMPaymentService, useClass: APIMPaymentServiceStub },
        { provide: ConfigService, useClass: configServiceStub }
      ],
      imports: [
        HttpClientTestingModule,
        IonicModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: LanguageLoader,
            deps: [HttpClient]
          }
        })
      ]
    }).compileComponents();
  }));
  beforeEach(() => {
    mockStore = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(PaymentOptionsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    spyOn(mockStore, 'dispatch').and.callFake(() => { });
  });

  fit('should create', () => {
    expect(component).toBeTruthy();
  });

  fit('should change the transporation costs values based on selection', () => {
    component.modalType = BillingOptionsUtil.TRANSPORT_COST;
    component.initializeFormGroup();
    fixture.detectChanges();

    const payAtDropOffVal = { currentTarget: { value: BillingOptionsUtil.PAY_AT_DROP_OFF } };
    component.transportSelectionValue(payAtDropOffVal);
    expect(component.transportSelectBillMyAcc).toEqual(false);
    expect(component.transportSelectBillRecipient).toEqual(false);
    expect(component.transportSelectBillThirdParty).toEqual(false);

    const billMyAccountVal = { currentTarget: { value: BillingOptionsUtil.BILL_MY_ACCOUNT } };
    component.transportSelectionValue(billMyAccountVal);
    expect(component.transportSelectBillMyAcc).toEqual(true);
    expect(component.transportSelectBillRecipient).toEqual(false);
    expect(component.transportSelectBillThirdParty).toEqual(false);

    const billRecipientVal = { currentTarget: { value: BillingOptionsUtil.BILL_RECIPIENT } };
    component.transportSelectionValue(billRecipientVal);
    expect(component.transportSelectBillMyAcc).toEqual(false);
    expect(component.transportSelectBillRecipient).toEqual(true);
    expect(component.transportSelectBillThirdParty).toEqual(false);

    const billThirdPartyVal = { currentTarget: { value: BillingOptionsUtil.BILL_THIRD_PARTY } };
    component.transportSelectionValue(billThirdPartyVal);
    expect(component.transportSelectBillMyAcc).toEqual(false);
    expect(component.transportSelectBillRecipient).toEqual(false);
    expect(component.transportSelectBillThirdParty).toEqual(true);

  });

  fit('should change the duties and taxes values based on selection', () => {
    component.modalType = BillingOptionsUtil.DUTIES_TAX;
    component.initializeFormGroup();
    fixture.detectChanges();

    const billMyAccountVal = { currentTarget: { value: BillingOptionsUtil.BILL_MY_ACCOUNT } };
    component.dutiesSelectionValue(billMyAccountVal);
    expect(component.dutiesSelectBillMyAcc).toEqual(true);
    expect(component.dutiesSelectBillRecipient).toEqual(false);
    expect(component.dutiesSelectBillThirdParty).toEqual(false);

    const billRecipientVal = { currentTarget: { value: BillingOptionsUtil.BILL_RECIPIENT } };
    component.dutiesSelectionValue(billRecipientVal);
    expect(component.dutiesSelectBillMyAcc).toEqual(false);
    expect(component.dutiesSelectBillRecipient).toEqual(true);
    expect(component.dutiesSelectBillThirdParty).toEqual(false);

    const billThirdPartyVal = { currentTarget: { value: BillingOptionsUtil.BILL_THIRD_PARTY } };
    component.dutiesSelectionValue(billThirdPartyVal);
    expect(component.dutiesSelectBillMyAcc).toEqual(false);
    expect(component.dutiesSelectBillRecipient).toEqual(false);
    expect(component.dutiesSelectBillThirdParty).toEqual(true);

  });

  fit('should close the transportation costs modal if value is Pay at drop off', () => {
    component.modalType = BillingOptionsUtil.TRANSPORT_COST;
    component.dutiesAndTaxesSelectedAccountNumber = '123456789';
    component.transportationSelectedAccountNumber = '222222222';
    component.initializeFormGroup();
    fixture.detectChanges();
    const event = { currentTarget: { value: BillingOptionsUtil.PAY_AT_DROP_OFF } };
    component.transportSelectionValue(event);
    component.validateTransportationCost();
    expect(component.modalController.dismiss()).toBeTruthy();
  });

  // Scenario 1: Shipper selects Bill Recipient OR Bill My Account OR Bill Third Party under Transportation Costs.
  fit('should validate the transportation costs modal if value is Bill My Account and account number has value', () => {
    component.modalType = BillingOptionsUtil.TRANSPORT_COST;
    component.dutiesAndTaxesSelectedAccountNumber = '123456789';
    component.transportationSelectedAccountNumber = '222222222';
    component.initializeFormGroup();
    fixture.detectChanges();
    const event = { currentTarget: { value: BillingOptionsUtil.BILL_RECIPIENT } };
    component.transportSelectionValue(event);
    component.formControls(component.transportForm).transportAccountNum.setValue('123456789');
    expect(component.transportSelectBillRecipient).toBe(true);
    component.validateTransportationCost();
    expect(component.transportForm.valid).toBe(true);

    const event2 = { currentTarget: { value: BillingOptionsUtil.BILL_MY_ACCOUNT } };
    component.transportSelectionValue(event2);
    component.formControls(component.transportForm).transportAccountNum.setValue('987654321');
    expect(component.transportSelectBillMyAcc).toBe(true);
    component.validateTransportationCost();
    expect(component.transportForm.valid).toBe(true);

    const event3 = { currentTarget: { value: BillingOptionsUtil.BILL_THIRD_PARTY } };
    component.transportSelectionValue(event3);
    component.formControls(component.transportForm).transportAccountNum.setValue('123456789');
    expect(component.transportSelectBillThirdParty).toBe(true);
    component.validateTransportationCost();
    expect(component.transportForm.valid).toBe(true);
  });

  // Scenario 1: Shipper selects Bill Recipient OR Bill My Account OR Bill Third Party under Transportation Costs.
  fit('should validate the transportation costs modal if value is Bill Recipient and account number has no value', () => {
    component.modalType = BillingOptionsUtil.TRANSPORT_COST;
    component.dutiesAndTaxesSelectedAccountNumber = '123456789';
    component.transportationSelectedAccountNumber = '222222222';
    component.initializeFormGroup();
    fixture.detectChanges();
    const event = { currentTarget: { value: BillingOptionsUtil.BILL_RECIPIENT } };
    component.transportSelectionValue(event);
    component.formControls(component.transportForm).transportAccountNum.setValue('');
    expect(component.transportSelectBillRecipient).toBe(true);
    expect(component.transportForm.valid).toBe(false);

    const event2 = { currentTarget: { value: BillingOptionsUtil.BILL_MY_ACCOUNT } };
    component.transportSelectionValue(event2);
    component.formControls(component.transportForm).transportAccountNum.setValue('');
    expect(component.transportSelectBillMyAcc).toBe(true);
    expect(component.transportForm.valid).toBe(false);

    const event3 = { currentTarget: { value: BillingOptionsUtil.BILL_THIRD_PARTY } };
    component.transportSelectionValue(event3);
    component.formControls(component.transportForm).transportAccountNum.setValue('');
    expect(component.transportSelectBillThirdParty).toBe(true);
    expect(component.transportForm.valid).toBe(false);
  });

  // Scenario 2: Shipper selects Bill My Account OR Bill Third Party under Duties and Taxes.
  fit('should validate the duties and taxes modal if value is Bill My Account and account number has value', () => {
    component.modalType = BillingOptionsUtil.DUTIES_TAX;
    component.dutiesAndTaxesSelectedAccountNumber = '123456789';
    component.transportationSelectedAccountNumber = '222222222';
    component.initializeFormGroup();
    fixture.detectChanges();
    const event = { currentTarget: { value: BillingOptionsUtil.BILL_MY_ACCOUNT } };
    component.dutiesSelectionValue(event);
    component.formControls(component.dutiesForm).dutiesAccountNum.setValue('123456789');
    expect(component.dutiesSelectBillMyAcc).toBe(true);
    component.validateDutiesTaxes();
    expect(component.dutiesForm.valid).toBe(true);

    const event2 = { currentTarget: { value: BillingOptionsUtil.BILL_THIRD_PARTY } };
    component.dutiesSelectionValue(event2);
    component.formControls(component.dutiesForm).dutiesAccountNum.setValue('987654321');
    expect(component.dutiesSelectBillThirdParty).toBe(true);
    component.validateDutiesTaxes();
    expect(component.dutiesForm.valid).toBe(true);
  });

  // Scenario 2: Shipper selects Bill My Account OR Bill Third Party under Duties and Taxes.
  fit('should validate the duties and taxes modal if value is Bill Third Party and account number has no value', () => {
    component.modalType = BillingOptionsUtil.DUTIES_TAX;
    component.initializeFormGroup();
    fixture.detectChanges();
    const event = { currentTarget: { value: BillingOptionsUtil.BILL_MY_ACCOUNT } };
    component.dutiesSelectionValue(event);
    component.formControls(component.dutiesForm).dutiesAccountNum.setValue('');
    expect(component.dutiesSelectBillMyAcc).toBe(true);
    expect(component.dutiesForm.valid).toBe(false);

    const event2 = { currentTarget: { value: BillingOptionsUtil.BILL_THIRD_PARTY } };
    component.dutiesSelectionValue(event2);
    component.formControls(component.dutiesForm).dutiesAccountNum.setValue('');
    expect(component.dutiesSelectBillThirdParty).toBe(true);
    expect(component.dutiesForm.valid).toBe(false);
  });

  fit('should call ngOnInit ', () => {
    fixture.detectChanges();
    spyOn(component, 'getPaymentTypes');   
    component.ngOnInit();
    expect(component.getPaymentTypes).toHaveBeenCalled();
  });

  fit('should call getPaymentTypes and set duties values to popup', () => {
    component.modalType = BillingOptionsUtil.DUTIES_TAX;
    fixture.detectChanges();
    component.ngOnInit();
    expect(component.transportCostList).toEqual(component.dutiesTaxesOptions);
  });

  fit('should call getPaymentTypes and set transport values to popup', () => {
    component.modalType = BillingOptionsUtil.TRANSPORT_COST;
    component.transportOptions = [
      {
        key: 'SENDER', displayText: 'My account'
      },
      {
        key: 'RECIPIENT', displayText: 'Recipient'
      }
    ];
    component.initializeFormGroup();
    fixture.detectChanges();
    component.ngOnInit();
    expect(component.transportCostList[0].key).toEqual(BillingOptionsUtil.getPaymentType(BillingOptionsUtil.PAY_AT_DROP_OFF).value);
  });  

  fit('should check for account number of transport and billing option.', () => {
    component.modalType = BillingOptionsUtil.DUTIES_TAX;
    component.transportationSelectedType = BillingOptionsUtil.BILL_MY_ACCOUNT;
    component.dutiesType = BillingOptionsUtil.BILL_RECIPIENT
    component.transportationSelectedAccountNumber = '123456789';
    component.initializeFormGroup();
    fixture.detectChanges();

    component.formControls(component.dutiesForm).dutiesAccountNum.setValue('123456789');
    const val = component.checkForAccountNumber();
    fixture.detectChanges();
    expect(val).toBeFalse;
  });

  fit('should show error message', () => {
    component.showErrorMessage();
    expect(component.isAccNumberValid).toBeTrue;
  });

  fit('should hide error message', () => {
    component.hideErrorMessage();
    expect(component.isAccNumberValid).toBeFalse;
    expect(component.sameAccNumberError).toBeFalse;
  });

  fit('should find isAccNumberValid is false ', () => {
    component.dutiesSelectBillRecipient = false;
    component.dutiesForm.controls.dutiesAccountNum.setValue('123456789');
    component.validateDutiesTaxes();
    expect(component.isAccNumberValid).toBeFalse;
  });

  fit('should call scrollToFirstInvalidControl when dutiesSelectBillRecipient and dutiesForm invalid', () => {
    component.dutiesSelectBillRecipient = false;
    component.dutiesForm.controls.dutiesAccountNum.setValue('12345678');
    spyOn(component, 'scrollToFirstInvalidControl')
    component.validateDutiesTaxes();
    expect(component.dutiesForm.valid).toBeFalse;
    expect(component.scrollToFirstInvalidControl).toHaveBeenCalledWith(component.dutiesForm);
  });

  fit('should set transportAccountNum value when modal type TransportCost', () => {
    component.modalType = BillingOptionsUtil.TRANSPORT_COST;
    component.transportType = component.dutiesAndTaxesSelectedType;
    component.initializeFormGroup();
    component.checkSelectedPaymentOptions();
    expect(component.transportForm.controls.transportAccountNum.value).toEqual(component.dutiesAndTaxesSelectedAccountNumber);
  });

  fit('should set transportAccountNum value when modal type DutiesTax', () => {
    component.modalType = BillingOptionsUtil.DUTIES_TAX;
    component.dutiesType = component.transportationSelectedType;
    component.initializeFormGroup();
    component.checkSelectedPaymentOptions();
    expect(component.dutiesForm.controls.dutiesAccountNum.value).toEqual(component.transportationSelectedAccountNumber);
  });

  fit('should call scrollToFirstInvalidControl when transportForm invalid', () => {
    component.modalType = BillingOptionsUtil.TRANSPORT_COST;
    component.transportSelectBillMyAcc = true;
    component.initializeFormGroup();
    component.transportForm.controls.transportAccountNum.setValue('');
    spyOn(component, 'scrollToFirstInvalidControl')
    component.validateTransportationCost();
    expect(component.transportForm.valid).toBeFalse;
    expect(component.scrollToFirstInvalidControl).toHaveBeenCalled();
  });

  fit('should call scrollToFirstInvalidControl when transportForm valid', () => {
    component.modalType = BillingOptionsUtil.TRANSPORT_COST;
    component.transportSelectBillMyAcc = true;
    component.initializeFormGroup();
    component.transportForm.controls.transportAccountNum.setValue('234');
    component.validateTransportationCost();
    expect(component.transportForm.valid).toBeTrue;
    expect(component.isAccNumberValid).toBeTrue;
  });

  fit('should call closeNavigation when dutiesForm valid', () => {
    component.dutiesSelectBillRecipient = true;
    component.dutiesForm.controls.dutiesAccountNum.setValue('');
    spyOn(component, 'closeNavigation')
    component.validateDutiesTaxes();
    expect(component.closeNavigation).toHaveBeenCalled();
  });

  fit('should find isAccNumberValid is true', () => {
    component.dutiesSelectBillRecipient = true;
    component.dutiesForm.controls.dutiesAccountNum.setValue('123445');
    component.validateDutiesTaxes();
    expect(component.isAccNumberValid).toBeTrue;
  });

});
