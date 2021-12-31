import { TestBed, getTestBed, async } from '@angular/core/testing';
import { RatesService } from './rates.service';
import { ConfigService } from '@ngx-config/core';
import { environment } from '../../../../environments/environment';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Injector } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import * as testConfig from '../../../../assets/config/mockConfigForTest';
import { AppState } from 'src/app/+store/app.state';
import { provideMockStore } from '@ngrx/store/testing';
import { RatesDataMapper } from 'src/app/providers/mapper/apim/rates-data-mapper.service';

fdescribe('RatesService', () => {
  let service: RatesService;
  let ratesDataMapper: RatesDataMapper;
  let httpMock: HttpTestingController;
  let injector: Injector;

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

  const initialState: AppState = {
    shippingApp: {
      userAccount: null,
      shipmentDetails: {
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
        serviceType: '',
        serviceName: '',
        packagingType: 'YOUR_PACKAGING',
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
        availableShipDates: null,
        selectedPackageOption: null,
        specialServiceInfo: null
      },
      customsDetails: null,
      senderDetails: {
        countryCode: 'CN',
        countryName: 'China',
        postalCode: '100011',
        city: 'BEIJING',
        postalAware: true,
        emailAddress: 'chrisyan@gmail.com',
        address1: 'No.122 Liu Hua Road',
        contactName: 'Chris Yan',
        stateAware: false,
        phoneNumber: '+862086666888',
        stateOrProvinceCode: '',
        companyName: 'ACM Corp',
        taxId: '',
        address2: 'Yue Xiu'
      },
      recipientDetails: [
        {
          address1: '',
          contactName: '',
          countryCode: 'PH',
          countryName: 'Philippines',
          postalCode: '1214',
          city: 'MAKATI',
          postalAware: true,
          phoneNumber: '',
          companyName: '',
          residential: false
        }
      ],
      paymentDetails: null,
      shipmentConfirmation: null,
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: ConfigService, useClass: ConfigServiceStub },
        HttpClient,
        RatesService,
        DatePipe,
        RatesDataMapper,
        provideMockStore({ initialState })
      ]
    });

    injector = getTestBed();
    service = injector.get(RatesService);
    ratesDataMapper = injector.get(RatesDataMapper);
    httpMock = injector.get(HttpTestingController);
  });

  afterEach((() => {
    httpMock.verify();
  }));

  fit('should be created', () => {
    expect(service).toBeTruthy();
  });

  fit('should be able to call APIM rates service', () => {
    const mockResponse = getMockRateQuoteResponse();
    const mappedRatesParam = ratesDataMapper.mapRateRequestFromStore(initialState.shippingApp);
    service.getRateQuoteV2(mappedRatesParam).subscribe((response) => {
      const mockRateResponse = response.output.rateReplyDetails;
      expect(mockRateResponse.length).toBeGreaterThan(1);
    });

    const reqService = httpMock.expectOne(request => {
      const expectedRequestUrl = mockConfig.APIM.HOST.concat(mockConfig.APIM.RATES_ISLAND_API.rateQuote);
      expect(expectedRequestUrl).toEqual(request.url);
      return (request.method === 'POST');
    });
    reqService.flush(mockResponse);
  });

  fit('should return 404 error response - getRateQuoteV2()', async(() => {
    const mockResponse = new HttpErrorResponse({
      error: '404 error',
      status: 404, statusText: 'Not Found'
    });

    service.getRateQuoteV2(null).subscribe((response) => {
      expect(response.error).toBeDefined();
    });

    const request = httpMock.expectOne({ method: 'POST' });
    request.flush(mockResponse);
  }));
  
  function getMockRateQuoteResponse() {
    return {
      transactionId: 'a93b492b-8b83-495b-ac80-9b3009313fc0',
      output: {
        rateReplyDetails: [
          {
            serviceType: 'INTERNATIONAL_FIRST',
            serviceSubOptionDetail: {},
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
                    taxes: [],
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
                    discounts: []
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
                  ]
                }
              }
            ],
            anonymouslyAllowable: true,
            operationalDetail: {
              originLocationIds: [
                'HHPA '
              ],
              originLocationNumbers: [
                0
              ],
              originServiceAreas: [
                'AM'
              ],
              destinationLocationIds: [
                'NQAA '
              ],
              destinationLocationNumbers: [
                0
              ],
              destinationServiceAreas: [
                'A1'
              ],
              destinationLocationStateOrProvinceCodes: [
                'TN'
              ],
              deliveryDate: '2020-09-28T08:00:00',
              deliveryDay: 'MON',
              commitDates: [
                '2020-09-28T08:00:00'
              ],
              commitDays: [
                'MON'
              ],
              ineligibleForMoneyBackGuarantee: false,
              astraDescription: 'INTL1ST',
              originPostalCodes: [
                '425'
              ],
              stateOrProvinceCodes: [
                '  '
              ],
              countryCodes: [
                'HK'
              ],
              airportId: 'MEM',
              serviceCode: '06',
              destinationPostalCodes: [
                '38111'
              ]
            },
            saturdayDelivery: false
          },
          {
            serviceType: 'INTERNATIONAL_PRIORITY',
            serviceSubOptionDetail: {},
            serviceName: 'International Priority®',
            packagingType: 'YOUR_PACKAGING',
            commit: {
              dateDetail: {
                dayOfWeek: 'Mon',
                time: '10:30',
                day: 'Sep 28, 2020',
                dayCxsFormat: 'Sep-28-2020'
              },
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
                    taxes: [],
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
                    discounts: []
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
                    amount: 576.52
                  },
                  totalFreightDiscount: {
                    currency: 'HKD',
                    amount: 0
                  },
                  freightDiscount: [],
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
                  ]
                }
              }
            ],
            anonymouslyAllowable: true,
            operationalDetail: {
              originLocationIds: [
                'HHPA '
              ],
              originLocationNumbers: [
                0
              ],
              originServiceAreas: [
                'AM'
              ],
              destinationLocationIds: [
                'NQAA '
              ],
              destinationLocationNumbers: [
                0
              ],
              destinationServiceAreas: [
                'A1'
              ],
              destinationLocationStateOrProvinceCodes: [
                'TN'
              ],
              deliveryDate: '2020-09-28T10:30:00',
              deliveryDay: 'MON',
              commitDates: [
                '2020-09-28T10:30:00'
              ],
              commitDays: [
                'MON'
              ],
              ineligibleForMoneyBackGuarantee: false,
              astraDescription: 'IP',
              originPostalCodes: [
                '425'
              ],
              stateOrProvinceCodes: [
                '  '
              ],
              countryCodes: [
                'HK'
              ],
              airportId: 'MEM',
              serviceCode: '01',
              destinationPostalCodes: [
                '38111'
              ]
            },
            saturdayDelivery: false
          },
          {
            serviceType: 'INTERNATIONAL_ECONOMY',
            serviceSubOptionDetail: {},
            serviceName: 'FedEx International Economy®',
            packagingType: 'YOUR_PACKAGING',
            commit: {
              dateDetail: {
                dayOfWeek: 'Mon',
                time: '16:30',
                day: 'Oct 05, 2020',
                dayCxsFormat: 'Oct-05-2020'
              },
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
                    taxes: [],
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
                    discounts: []
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
                    amount: 494.52
                  },
                  totalFreightDiscount: {
                    currency: 'HKD',
                    amount: 0
                  },
                  freightDiscount: [],
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
                  ]
                }
              }
            ],
            anonymouslyAllowable: true,
            operationalDetail: {
              originLocationIds: [
                'HHPA '
              ],
              originLocationNumbers: [
                0
              ],
              originServiceAreas: [
                'AM'
              ],
              destinationLocationIds: [
                'NQAA '
              ],
              destinationLocationNumbers: [
                0
              ],
              destinationServiceAreas: [
                'A1'
              ],
              destinationLocationStateOrProvinceCodes: [
                'TN'
              ],
              deliveryDate: '2020-10-05T16:30:00',
              deliveryDay: 'MON',
              commitDates: [
                '2020-10-05T16:30:00'
              ],
              commitDays: [
                'MON'
              ],
              ineligibleForMoneyBackGuarantee: false,
              astraDescription: 'IE',
              originPostalCodes: [
                '425'
              ],
              stateOrProvinceCodes: [
                '  '
              ],
              countryCodes: [
                'HK'
              ],
              airportId: 'MEM',
              serviceCode: '04',
              destinationPostalCodes: [
                '38111'
              ]
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
});
