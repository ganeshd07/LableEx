import { HttpClient } from '@angular/common/http';
import { async, ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { LanguageLoader } from 'src/app/app.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SummaryDetailsPage } from './summary-details.page';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { AppState } from 'src/app/+store/app.state';
import * as testConfig from '../../../../assets/config/mockConfigForTest';
import { TimeFormatPipe } from '../../../providers/directives/time-format.pipe';
import { SummaryPageConstants } from '../../../types/constants/summary-page.constants';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiResponse } from 'src/app/interfaces/api-service/response/api-response';
import { RateReplyDetail } from 'src/app/interfaces/api-service/response/rate-reply-detail';
import { DatePipe } from '@angular/common';
import { DateFormatPipe } from 'src/app/providers/directives/date-format.pipe';
import { ConfigService } from '@ngx-config/core';
import { RatesService } from 'src/app/core/providers/apim';
import { RatesDataMapper } from 'src/app/providers/mapper/apim/rates-data-mapper.service';
import * as fromShippingSelector from '../+store/shipping.selectors';
import { CreateShipmentResponse } from 'src/app/interfaces/api-service/response/create-shipment-response';
import { postCreateShipmentBegin } from '../+store/shipping.actions';
import { ShippingInfo } from '../+store/shipping.state';
import { BillingOptionsUtil } from 'src/app/types/constants/billing-and-service-options.constants';
import { countryResource } from 'src/app/types/constants/country-resource.constants';
import { SessionItems } from 'src/app/types/enum/session-items.enum';
import { Observable, Observer } from 'rxjs';
import { RateQuoteRequest } from 'src/app/interfaces/api-service/request/rate-quote-request';
import { LocalDateFormatPipe } from 'src/app/providers/directives/local-date-format.pipe';
import { HtmlSanitizer } from 'src/app/providers/directives/html-sanitizer.pipe';

fdescribe('SummaryDetailsPage', () => {
  let component: SummaryDetailsPage;
  let fixture: ComponentFixture<SummaryDetailsPage>;
  const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl', 'navigate', 'then']);
  const mockSuccessValue: CreateShipmentResponse = {
    shipmentId: '82365',
    shipmentRefNumber: 'CN1221355799',
    barcodeURI: 'https://wwwdrt.idev.fedex.com/mobileshipping/qrCode?refNumber=CN1221355799'
  };

  const mockErrorValue = { error: { error: 'Internal Server Error', errorCode: 500 } };
  let mockStore: MockStore;
  let ratesReqMapper: RatesDataMapper;
  const mockCommodityList = [
    {
      countryOfManufacture: 'Hong Kong SAR, China',
      description: 'Apple TV',
      hsCode: null,
      name: 'ELECTRONICS',
      qtyUnitLabel: 'pieces',
      quantity: 1,
      quantityUnits: 'PCS',
      totalCustomsValue: 25,
      totalWeight: 40,
      totalWeightUnit: 'kg',
      totalWeightUnitLabel: 'Kilogram',
      unitPrice: 'HKD'
    },
    {
      countryOfManufacture: 'Hong Kong SAR, China',
      description: 'Mobile',
      hsCode: null,
      name: 'ELECTRONICS',
      qtyUnitLabel: 'pieces',
      quantity: 1,
      quantityUnits: 'PCS',
      totalCustomsValue: 50,
      totalWeight: 100,
      totalWeightUnit: 'kg',
      totalWeightUnitLabel: 'Kilogram',
      unitPrice: 'HKD'
    }];

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
        specialServiceInfo: null,
      },
      customsDetails: {
        commodityList: [],
        customsType: 'doc',
        productType: '',
        productPurpose: '',
        documentType: '',
        documentTypeCode: '',
        documentValue: 2345,
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
      paymentDetails: {
        shippingBillTo: 'BILL_RECIPIENT',
        shippingBillToDisplayable: 'Bill Recipient',
        shippingAccountNumber: '2003456712',
        shippingAccountNumberDisplayable: '',
        dutiesTaxesBillTo: 'PAY_AT_DROP_OFF',
        dutiesTaxesBillToDisplayable: 'Pay at drop off',
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

  class RatesServiceStub {
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
    };

    getRateQuoteV2(rateQuoteRequest: RateQuoteRequest) {
      return Observable.create((observer: Observer<any>) => {
        observer.next(this.getMockRateQuoteResponse);
      });
    }
  }

  beforeEach(async(() => {

    const mockConfig = testConfig.config;

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
        SummaryDetailsPage,
        TimeFormatPipe,
        DateFormatPipe,
        LocalDateFormatPipe,
        HtmlSanitizer
      ],
      imports: [
        IonicModule.forRoot(),
        HttpClientTestingModule,
        RouterTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: LanguageLoader,
            deps: [HttpClient]
          }
        })
      ],
      providers: [
        { provide: RatesService, useClass: RatesServiceStub },
        RatesDataMapper,
        {
          provide: ConfigService,
          useClass: ConfigServiceStub
        },
        provideMockStore({ initialState }),
        TranslateService,
        DatePipe,
        DateFormatPipe,
        LocalDateFormatPipe,
        TimeFormatPipe,
        HtmlSanitizer,
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SummaryDetailsPage);
    mockStore = TestBed.inject(MockStore);
    ratesReqMapper = TestBed.inject(RatesDataMapper);
    component = fixture.componentInstance;
    spyOn(mockStore, 'dispatch').and.callFake(() => { });
    fixture.detectChanges();
  }));

  beforeEach(() => {
    const mockErrorSelector = mockStore.overrideSelector(fromShippingSelector.selectCreateShipmentFailure, mockErrorValue);
    const mockSuccessSelector = mockStore.overrideSelector(fromShippingSelector.selectCreateShipmentSuccess, mockSuccessValue);
  });

  fit('should create', fakeAsync(() => {
    expect(component).toBeTruthy();
  }));

  fit('should call getSummaryDetailsFromStore', () => {
    spyOn(component, 'getSummaryDetailsFromStore');
    component.ngOnInit();
    expect(component.getSummaryDetailsFromStore).toHaveBeenCalled();
  });

  fit('shippingdetails should be true', fakeAsync(() => {
    component.ngOnInit();
    tick();
    fixture.detectChanges();
    flush();
    expect(component.summaryDetails).toBeDefined();
  }));

  fit('if custom type is type doc, then custom type should be Documents.', fakeAsync(() => {
    component.summaryDetails.customsDetails.customsType = SummaryPageConstants.DOC;
    component.ngOnInit();
    tick();
    fixture.detectChanges();
    flush();
    expect(component.customsType).toEqual(SummaryPageConstants.Documents);
  }));

  fit('if custom type is type item, then custom type should be Items.', fakeAsync(() => {
    component.summaryDetails.customsDetails.customsType = SummaryPageConstants.ITEMS;
    component.ngOnInit();
    tick();
    fixture.detectChanges();
    flush();
    expect(component.customsType).toEqual(SummaryPageConstants.ITEMS);
  }));

  fit('if recipient is type company, then recipient company name should present.', fakeAsync(() => {
    component.summaryDetails.recipientDetails[0].companyName = 'ABC CO. LTD.';
    component.ngOnInit();
    tick();
    fixture.detectChanges();
    flush();
    expect(component.recipientCompanyName).toBe(true);
  }));

  fit('if sender is type company, then shipper company name should present.', fakeAsync(() => {
    component.summaryDetails.senderDetails.companyName = 'XYZ Co. LTD.';
    component.ngOnInit();
    tick();
    fixture.detectChanges();
    flush();
    expect(component.shipperCompanyName).toBe(true);
  }));

  fit('should display total cutoms value and weight.', fakeAsync(() => {
    component.summaryDetails.customsDetails.customsType = SummaryPageConstants.ITEMS;
    component.summaryDetails.customsDetails.commodityList = mockCommodityList;
    component.ngOnInit();
    tick();
    fixture.detectChanges();
    flush();
    expect(component.totalCustomsValue).toEqual(75);
    expect(component.totalCustomsWeight).toEqual(140);
  }));

  fit('if shipping bill as Pay at drop off, billingRate should true', fakeAsync(() => {
    component.summaryDetails.paymentDetails.shippingBillToDisplayable = 'Pay at drop off';
    component.ngOnInit();
    tick();
    fixture.detectChanges();
    flush();
    expect(component.billingRate).toBe(true);
  }));

  fit('on click of arrow, downarrow value should change', () => {
    component.changeArrow(true);
    expect(component.downArrow).toEqual(false);

    component.changeArrow(false);
    expect(component.downArrow).toEqual(true);

  });

  fit('should be able to request for rate quote', () => {
    spyOn(component, 'getRateQuote');
    component.ngOnInit();
    expect(component.rateServiceLoading).toBeDefined(); // to check if the variable exists
    expect(component.hasSelected).toBeDefined(); // to check if the variable exists
    expect(component.ratesList).toBeDefined(); // to check if the variable exists
    expect(component.getRateQuote).toHaveBeenCalledWith(initialState.shippingApp);
  });

  /**
   * This scenario tests the tagging of rates list according to their prices (as identified by service type).
   */
  fit('should be able to tag BEST PRICE AND FASTEST rate options', () => {
    const ratesDiscount: ApiResponse = getMockRateWithoutDiscountResponse();
    const rateReplyDetails: RateReplyDetail[] = getMockRateQuoteResponse().output.rateReplyDetails;
    component.ratesList = ratesReqMapper.mapRateQuoteResponseToGUI(rateReplyDetails, ratesDiscount.configlist);

    const bestPriceRate = component.ratesList.find(rate => rate.serviceHint === 'BEST PRICE');
    const fastestPriceRate = component.ratesList.find(rate => rate.serviceHint === 'FASTEST');
    const regularPriceRate = component.ratesList.find(rate => rate.serviceHint === '');

    expect(bestPriceRate.serviceType).toBe('INTERNATIONAL_ECONOMY');
    expect(fastestPriceRate.serviceType).toBe('INTERNATIONAL_FIRST');
    expect(regularPriceRate.serviceType).toBe('INTERNATIONAL_PRIORITY');
  });

  /**
   * This scenario tests the sorting order rendered via mapper service class
   * IN ORDER -> Fastest: INTERNATIONAL_FIRST, 2nd fastest: INTERNATIONAL_PRIORITY, Best Price: INTERNATIONAL_ECONOMY
   */
  fit('should be able to sort rate options based on price', () => {
    const ratesDiscount: ApiResponse = getMockRateWithoutDiscountResponse();
    const rateReplyDetails: RateReplyDetail[] = getMockRateQuoteResponse().output.rateReplyDetails;
    component.ratesList = ratesReqMapper.mapRateQuoteResponseToGUI(rateReplyDetails, ratesDiscount.configlist);

    const bestPriceIndex = component.ratesList.findIndex(x => x.serviceHint === 'BEST PRICE');
    const fastestPriceIndex = component.ratesList.findIndex(x => x.serviceHint === 'FASTEST');
    const regularPriceIndex = component.ratesList.findIndex(x => x.serviceHint === '');

    expect(fastestPriceIndex).toEqual(0); // IF
    expect(regularPriceIndex).toEqual(1); // IP
    expect(bestPriceIndex).toEqual(2); // IE
  });

  /**
    * This scenario tests computation of rates options with discounts
    */
  fit('should be able to compute breakdown prices of rates options WITH DISCOUNTS', async () => {
    const ratesDiscount: ApiResponse = getMockRateWithDiscountResponse();
    const rateReplyDetails: RateReplyDetail[] = getMockRateQuoteResponse().output.rateReplyDetails;
    const ratesOptions = ratesReqMapper.mapRateQuoteResponseToGUI(rateReplyDetails, ratesDiscount.configlist);

    const fastestPriceOption = ratesOptions[1]; // used the second rates option to compute

    const EXPECTED_NEW_NET_CHARGE = 2852.27; // based on mock values
    const EXPECTED_NEW_FUEL_SURCHARGE = 247.44; // computed value
    const EXPECTED_DISCOUNT = 1016.72; // based on mock values

    const updatedFuelSurcharge = fastestPriceOption.surcharges.find(surcharge => surcharge.type === 'FUEL');
    const updatedFuelSurchargeAmount = updatedFuelSurcharge.amount[0].amount;

    expect(+EXPECTED_DISCOUNT).toEqual(fastestPriceOption.totalDiscount);
    expect(EXPECTED_NEW_NET_CHARGE).toEqual(fastestPriceOption.totalNetCharge);
    expect(EXPECTED_NEW_FUEL_SURCHARGE).toEqual(+updatedFuelSurchargeAmount.toFixed(2));
    expect(fastestPriceOption.totalNetChargeBeforeDiscount).toBeGreaterThan(fastestPriceOption.totalNetChargeAfterDiscount);
  });

  /**
   * This scenario tests computation of rates options without discounts
   */
  fit('should be able to compute breakdown prices of rates options WITHOUT DISCOUNTS', async () => {
    const ratesDiscount: ApiResponse = getMockRateWithoutDiscountResponse();
    const rateReplyDetails: RateReplyDetail[] = getMockRateQuoteResponse().output.rateReplyDetails;
    const ratesOptions = ratesReqMapper.mapRateQuoteResponseToGUI(rateReplyDetails, ratesDiscount.configlist);

    const fastestPriceOption = ratesOptions[0]; // used the first rates option to compute
    const EXPECTED_NEW_NET_CHARGE = 3642.19; // based on mock values
    const EXPECTED_NEW_FUEL_SURCHARGE = 315.99; // based on mock values
    const EXPECTED_DISCOUNT_FROM_US_API = 138.5; // based on mock values

    const updatedFuelSurcharge = fastestPriceOption.surcharges.find(surcharge => surcharge.type === 'FUEL');
    const updatedFuelSurchargeAmount = updatedFuelSurcharge.amount[0].amount;

    expect(ratesDiscount.configlist[0].value).toEqual(0);
    expect(EXPECTED_NEW_NET_CHARGE).toEqual(fastestPriceOption.totalNetCharge);
    expect(EXPECTED_NEW_FUEL_SURCHARGE).toEqual(updatedFuelSurchargeAmount);
    expect(fastestPriceOption.totalNetChargeBeforeDiscount - EXPECTED_DISCOUNT_FROM_US_API)
      .toEqual(fastestPriceOption.totalNetChargeAfterDiscount);
  });

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

  // Mock Rate Discount Response - with <30%> Discount
  function getMockRateWithDiscountResponse(): ApiResponse {
    return {
      configlist: [
        {
          value: 30,
          seq: 1
        }
      ]
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
  fit('should call action handler for create shipment API', () => {
    spyOn(component, 'handleCreateShipmentApiSuccess');
    component.ngOnInit();
    expect(component.handleCreateShipmentApiSuccess).toHaveBeenCalled();
  });

  fit('should navigate to OTP page, when user who is not logged in using OTP and try to settle the payments using BILL RECEPIENT option for duty and taxes but entering a FedEx account.', fakeAsync(() => {
    component.ngOnInit();
    initialState.shippingApp.paymentDetails.dutiesTaxesBillToDisplayable =
      BillingOptionsUtil.getPaymentType(BillingOptionsUtil.BILL_RECIPIENT).key;
    fixture.detectChanges();
    component.onClickCreateShipment();
    tick();
    flush();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/account/otp');
  }));

  fit('should navigate to OTP page, when user user who is not logged in using OTP and try to settle the payments using FedEx account for duty and taxes.', fakeAsync(() => {
    component.ngOnInit();
    initialState.shippingApp.paymentDetails.dutiesTaxesBillToDisplayable =
      BillingOptionsUtil.getPaymentType(BillingOptionsUtil.BILL_THIRD_PARTY).key;
    fixture.detectChanges();
    component.onClickCreateShipment();
    tick();
    flush();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/account/otp');
  }));

  fit('should navigate to OTP page, when user user user who is not logged in using OTP and try to settle the payments using FedEx account for transportation cost.', fakeAsync(() => {
    component.ngOnInit();
    initialState.shippingApp.paymentDetails.shippingBillToDisplayable =
      BillingOptionsUtil.getPaymentType(BillingOptionsUtil.BILL_THIRD_PARTY).key;
    fixture.detectChanges();
    component.onClickCreateShipment();
    tick();
    flush();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/account/otp');
  }));

  fit('should dispatch action POST Create Shipment Begin on finalize shipment button click', () => {
    component.ngOnInit();
    sessionStorage.setItem(SessionItems.MOBILENUMBER, '12345678');

    fixture.detectChanges();
    component.onClickCreateShipment();
    expect(mockStore.dispatch).toHaveBeenCalledWith(postCreateShipmentBegin({ shipmentDetails: initialState.shippingApp }));
  });

  fit('should navigate to thank you page on create shipment API call success', fakeAsync(() => {
    component.ngOnInit();
    fixture.detectChanges();
    component.onClickCreateShipment();
    tick();
    flush();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/shipping/thank-you');
  }));

  fit('should navigate to thank you page with selected type is commodity.', fakeAsync(() => {
    const mockData: ShippingInfo = {
      userAccount: null,
      shipmentDetails: {
        packageDetails: [],
        totalNumberOfPackages: 0,
        totalWeight: 0,
        serviceType: 'INTERNATIONAL_PRIORITY',
        serviceName: 'International Priority®',
        packagingType: 'YOUR_PACKAGING',
        serviceCode: '',
        advancedPackageCode: '',
        totalCustomsOrInvoiceValue: 10000,
        customsOrInvoiceValueCurrency: 'CNY',
        carriageDeclaredValue: null,
        carriageDeclaredValueCurrency: '',
        displayDate: '',
        shipDate: new Date(),
        selectedRate: {
          dayOfWeek: null,
          dateOfArrival: null,
          timeOfArrival: null,
          totalNetCharge: 44112.45,
          totalBaseCharge: 53632.16,
          surchargeList: [
            {
              type: 'FUEL',
              description: 'Fuel Surcharge',
              amount: [
                {
                  currency: 'CNY',
                  amount: 6569.94
                }
              ]
            }
          ],
          volumeDiscount: 16089.65,
          currency: 'CNY',
          saturdayDelivery: false
        },
        firstAvailableShipDate: null,
        lastAvailableShipDate: null,
        availableShipDates: [],
        selectedPackageOption: null,
        specialServiceInfo: {
          selectedSignatureOption: {
            key: 'SATURDAY_DELIVERY',
            displayText: 'Saturday Delivery'
          }
        }
      },
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
      senderDetails: {
        address1: 'Add1 sender',
        address2: 'add2 send',
        city: 'BEIJING',
        contactName: 'sender contac',
        countryCode: 'CN',
        countryName: 'China',
        postalCode: '100600',
        companyName: 'sender com',
        emailAddress: 'sender@send.com',
        postalAware: true,
        stateAware: false,
        phoneNumber: '999999999',
        saveContact: false,
        taxId: '09999999999'
      },
      recipientDetails: [
        {
          address1: 'Recipet add 1',
          address2: 'Recipentadd 2',
          address3: 'recieopsn add 3',
          residential: false,
          companyName: 'recispen co name',
          contactName: 'reci contact ame',
          city: 'CAMP WAREHOUSE',
          countryCode: 'AF',
          countryName: 'Afghanistan',
          postalAware: false,
          phoneNumber: '11111111111',
          phoneExt: '345',
          emailAddress: 'reciep@re.com',
          taxId: '222222222222',
          passportNumber: '',
          postalCode: ''
        }
      ],
      paymentDetails: {
        shippingBillTo: 'Pay at drop off',
        shippingBillToDisplayable: 'Pay at drop off',
        shippingAccountNumber: '000000000',
        shippingAccountNumberDisplayable: 'Pay at drop off',
        dutiesTaxesBillTo: 'Bill Recipient',
        dutiesTaxesBillToDisplayable: 'Bill Recipient',
        dutiesTaxesAccountNumber: '000000000',
        dutiesTaxesAccountNumberDisplayable: 'Bill Recipient'
      },
      shipmentConfirmation: null
    };

    spyOn(component, 'validationForPayments');
    const mockCommoditySelector = mockStore.overrideSelector(fromShippingSelector.selectSummaryDetails, mockData);
    component.ngOnInit();
    fixture.detectChanges();
    component.onClickCreateShipment();
    tick();
    flush();
    expect(component.validationForPayments).toHaveBeenCalled();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/shipping/thank-you');
  }));

  fit('should check packaging names.', fakeAsync(() => {
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.checkPackagingName('YOUR_PACKAGING')).toEqual(SummaryPageConstants.YOUR_PACKAGING);
    expect(component.checkPackagingName('FEDEX_10KG_BOX')).toEqual(SummaryPageConstants.FEDEX_10KG_BOX);
    expect(component.checkPackagingName('FEDEX_25KG_BOX')).toEqual(SummaryPageConstants.FEDEX_25KG_BOX);
    expect(component.checkPackagingName('FEDEX_BOX')).toEqual(SummaryPageConstants.FEDEX_BOX);
    expect(component.checkPackagingName('FEDEX_ENVELOPE')).toEqual(SummaryPageConstants.FEDEX_ENVELOPE);
    expect(component.checkPackagingName('FEDEX_PAK')).toEqual(SummaryPageConstants.FEDEX_PAK);
    expect(component.checkPackagingName('FEDEX_TUBE')).toEqual(SummaryPageConstants.FEDEX_TUBE);
    tick();
    flush();
  }));

  fit('should dispatch event editCustomsDetails and navigate to customs details page.', () => {
    spyOn(window, 'dispatchEvent');
    component.clickEditCustomsDetails();
    expect(window.dispatchEvent).toHaveBeenCalledWith(new Event('editCustomsDetails'));
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/shipping/customs-details');
  });

  fit('should dispatch event editSenderDetails and navigate to senders details page', fakeAsync(() => {
    spyOn(window, 'dispatchEvent');
    component.clickEditSenderDetails();
    tick();
    expect(window.dispatchEvent).toHaveBeenCalledWith(new Event('editSenderDetails'));
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/shipping/sender-details');
  }));

  fit('should dispatch event editRecipientDetails and navigate to recipient details page', fakeAsync(() => {
    spyOn(window, 'dispatchEvent');
    component.clickEditRecipientDetails();
    tick();
    expect(window.dispatchEvent).toHaveBeenCalledWith(new Event('editRecipientDetails'));
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/shipping/recipient-details');
  }));

  fit('should dispatch event editBillingServiceOptionDetails and navigate to billing and options details page', fakeAsync(() => {
    spyOn(window, 'dispatchEvent');
    component.clickEditBillingServiceOptionsDetails();
    tick();
    expect(window.dispatchEvent).toHaveBeenCalledWith(new Event('editBillingServiceOptionDetails'));
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/shipping/billing-details');
  }));

  fit('should remove isFromSummary item from session.', () => {
    sessionStorage.setItem(SessionItems.ISFROMSUMMARY, 'true');
    sessionStorage.setItem(SessionItems.MOBILENUMBER, '123456789');
    component.validateSummarySession();
    expect(sessionStorage.getItem(SessionItems.ISFROMSUMMARY)).toBeFalsy();
    expect(sessionStorage.getItem(SessionItems.MOBILENUMBER)).toBeFalsy();
  });

  fit('should be able to change Terms of use and Terms and condition of carriage links based on country and language.', fakeAsync(() => {
    component.termsofUseUrlsData = countryResource.getTermsOfUseUrls();
    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'CN');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.selectedCountry = sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);
    component.selectedLanguage = sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE);
    component.updateTermsURLS();
    tick();
    expect(component.termsofUseLinkUrl).toEqual('https://www.fedex.com/en-cn/campaign/fsmlite-terms-of-use.html');
    expect(component.privacyStatementUrl).toEqual('https://www.fedex.com/en-cn/privacy-policy.html');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'CN');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'zh_cn');
    component.selectedCountry = sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);
    component.selectedLanguage = sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE);
    component.updateTermsURLS();
    tick();
    expect(component.termsofUseLinkUrl).toEqual('https://www.fedex.com/en-cn/campaign/fsmlite-terms-of-use.html');
    expect(component.privacyStatementUrl).toEqual('https://www.fedex.com/zh-cn/privacy-policy.html');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'AU');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.selectedCountry = sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);
    component.selectedLanguage = sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE);
    component.updateTermsURLS();
    tick();
    expect(component.termsofUseLinkUrl).toEqual('https://www.fedex.com/en-au/campaign/fsmlite-terms-of-use.html');
    expect(component.privacyStatementUrl).toEqual('https://www.fedex.com/en-au/privacy-policy.html');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'HK');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.selectedCountry = sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);
    component.selectedLanguage = sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE);
    component.updateTermsURLS();
    tick();
    expect(component.termsofUseLinkUrl).toEqual('https://www.fedex.com/en-hk/campaign/fsmlite-terms-of-use.html');
    expect(component.privacyStatementUrl).toEqual('https://www.fedex.com/en-hk/privacy-policy.html');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'HK');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'zh_hk');
    component.selectedCountry = sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);
    component.selectedLanguage = sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE);
    component.updateTermsURLS();
    tick();
    expect(component.termsofUseLinkUrl).toEqual('https://www.fedex.com/en-hk/campaign/fsmlite-terms-of-use.html');
    expect(component.privacyStatementUrl).toEqual('https://www.fedex.com/zh-hk/privacy-policy.html');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'ID');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.selectedCountry = sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);
    component.selectedLanguage = sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE);
    component.updateTermsURLS();
    tick();
    expect(component.termsofUseLinkUrl).toEqual('https://www.fedex.com/en-id/campaign/fsmlite-terms-of-use.html');
    expect(component.privacyStatementUrl).toEqual('https://www.fedex.com/en-id/privacy-policy.html');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'ID');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'id_id');
    component.selectedCountry = sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);
    component.selectedLanguage = sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE);
    component.updateTermsURLS();
    tick();
    expect(component.termsofUseLinkUrl).toEqual('https://www.fedex.com/en-id/campaign/fsmlite-terms-of-use.html');
    expect(component.privacyStatementUrl).toEqual('https://www.fedex.com/id-id/privacy-policy.html');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'JP');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.selectedCountry = sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);
    component.selectedLanguage = sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE);
    component.updateTermsURLS();
    tick();
    expect(component.termsofUseLinkUrl).toEqual('https://www.fedex.com/en-jp/campaign/fsmlite-terms-of-use.html');
    expect(component.privacyStatementUrl).toEqual('https://www.fedex.com/en-jp/privacy-policy.html');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'JP');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'ja_jp');
    component.selectedCountry = sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);
    component.selectedLanguage = sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE);
    component.updateTermsURLS();
    tick();
    expect(component.termsofUseLinkUrl).toEqual('https://www.fedex.com/en-jp/campaign/fsmlite-terms-of-use.html');
    expect(component.privacyStatementUrl).toEqual('https://www.fedex.com/ja-jp/privacy-policy.html');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'KR');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.selectedCountry = sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);
    component.selectedLanguage = sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE);
    component.updateTermsURLS();
    tick();
    expect(component.termsofUseLinkUrl).toEqual('https://www.fedex.com/en-kr/campaign/fsmlite-terms-of-use.html');
    expect(component.privacyStatementUrl).toEqual('https://www.fedex.com/en-kr/privacy-policy.html');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'KR');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'ko_kr');
    component.selectedCountry = sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);
    component.selectedLanguage = sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE);
    component.updateTermsURLS();
    tick();
    expect(component.termsofUseLinkUrl).toEqual('https://www.fedex.com/en-kr/campaign/fsmlite-terms-of-use.html');
    expect(component.privacyStatementUrl).toEqual('https://www.fedex.com/ko-kr/privacy-policy.html');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'MY');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.selectedCountry = sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);
    component.selectedLanguage = sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE);
    component.updateTermsURLS();
    tick();
    expect(component.termsofUseLinkUrl).toEqual('https://www.fedex.com/en-my/campaign/fsmlite-terms-of-use.html');
    expect(component.privacyStatementUrl).toEqual('https://www.fedex.com/en-my/privacy-policy.html');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'NZ');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.selectedCountry = sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);
    component.selectedLanguage = sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE);
    component.updateTermsURLS();
    tick();
    expect(component.termsofUseLinkUrl).toEqual('https://www.fedex.com/en-nz/campaign/fsmlite-terms-of-use.html');
    expect(component.privacyStatementUrl).toEqual('https://www.fedex.com/en-nz/privacy-policy.html');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'PH');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.selectedCountry = sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);
    component.selectedLanguage = sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE);
    component.updateTermsURLS();
    tick();
    expect(component.termsofUseLinkUrl).toEqual('https://www.fedex.com/en-ph/campaign/fsmlite-terms-of-use.html');
    expect(component.privacyStatementUrl).toEqual('https://www.fedex.com/en-ph/privacy-policy.html');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'SG');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.selectedCountry = sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);
    component.selectedLanguage = sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE);
    component.updateTermsURLS();
    tick();
    expect(component.termsofUseLinkUrl).toEqual('https://www.fedex.com/en-sg/campaign/fsmlite-terms-of-use.html');
    expect(component.privacyStatementUrl).toEqual('https://www.fedex.com/en-sg/privacy-policy.html');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'TH');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.selectedCountry = sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);
    component.selectedLanguage = sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE);
    component.updateTermsURLS();
    tick();
    expect(component.termsofUseLinkUrl).toEqual('https://www.fedex.com/en-th/campaign/fsmlite-terms-of-use.html');
    expect(component.privacyStatementUrl).toEqual('https://www.fedex.com/en-th/privacy-policy.html');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'TH');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'th_th');
    component.selectedCountry = sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);
    component.selectedLanguage = sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE);
    component.updateTermsURLS();
    tick();
    expect(component.termsofUseLinkUrl).toEqual('https://www.fedex.com/en-th/campaign/fsmlite-terms-of-use.html');
    expect(component.privacyStatementUrl).toEqual('https://www.fedex.com/th-th/privacy-policy.html');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'TW');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.selectedCountry = sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);
    component.selectedLanguage = sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE);
    component.updateTermsURLS();
    tick();
    expect(component.termsofUseLinkUrl).toEqual('https://www.fedex.com/en-tw/campaign/fsmlite-terms-of-use.html');
    expect(component.privacyStatementUrl).toEqual('https://www.fedex.com/en-tw/privacy-policy.html');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'TW');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'zh_tw');
    component.selectedCountry = sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);
    component.selectedLanguage = sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE);
    component.updateTermsURLS();
    tick();
    expect(component.termsofUseLinkUrl).toEqual('https://www.fedex.com/en-tw/campaign/fsmlite-terms-of-use.html');
    expect(component.privacyStatementUrl).toEqual('https://www.fedex.com/zh-tw/privacy-policy.html');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'VN');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.selectedCountry = sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);
    component.selectedLanguage = sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE);
    component.updateTermsURLS();
    tick();
    expect(component.termsofUseLinkUrl).toEqual('https://www.fedex.com/en-vn/campaign/fsmlite-terms-of-use.html');
    expect(component.privacyStatementUrl).toEqual('https://www.fedex.com/en-vn/privacy-policy.html');

    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'VN');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'vi_vn');
    component.selectedCountry = sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);
    component.selectedLanguage = sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE);
    component.updateTermsURLS();
    tick();
    expect(component.termsofUseLinkUrl).toEqual('https://www.fedex.com/en-vn/campaign/fsmlite-terms-of-use.html');
    expect(component.privacyStatementUrl).toEqual('https://www.fedex.com/vi-vn/privacy-policy.html');
  }));

  fit('on click of arrow, downarrow value should change', () => {
    const ratesDiscount: ApiResponse = getMockRateWithoutDiscountResponse();
    const rateReplyDetails: RateReplyDetail[] = getMockRateQuoteResponse().output.rateReplyDetails;
    component.ratesList = ratesReqMapper.mapRateQuoteResponseToGUI(rateReplyDetails, ratesDiscount.configlist);
    component.changeArrowPosition(1);
    expect(component.ratesList[0].toggleBreakdown).toEqual(false);

  });
});
