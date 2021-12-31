import { DatePipe } from '@angular/common';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ConfigService } from '@ngx-config/core';
import { RatesService } from 'src/app/core/providers/apim';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import * as testConfig from '../../../../assets/config/mockConfigForTest';
import { RateAndDeliveryOptionPage } from './rate-and-delivery-option.page';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DateFormatPipe } from 'src/app/providers/directives/date-format.pipe';
import { TimeFormatPipe } from 'src/app/providers/directives/time-format.pipe';
import { Router } from '@angular/router';
import { AppState } from 'src/app/+store/app.state';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { LanguageLoader } from 'src/app/app.module';
import { RatesDataMapper } from 'src/app/providers/mapper/apim/rates-data-mapper.service';
import { RateReplyDetail } from 'src/app/interfaces/api-service/response/rate-reply-detail';
import { ApiResponse } from 'src/app/interfaces/api-service/response/api-response';
import { NotificationService } from 'src/app/core/providers/notification-service';
import { UnitOfMeasurement } from 'src/app/types/enum/unit-of-measurement.enum';
import { Observable, Observer } from 'rxjs';
import { RateQuoteRequest } from 'src/app/interfaces/api-service/request/rate-quote-request';
import { SessionItems } from 'src/app/types/enum/session-items.enum';
import { LocalDateFormatPipe } from 'src/app/providers/directives/local-date-format.pipe';

fdescribe('RateAndDeliveryOptionPage', () => {
   let component: RateAndDeliveryOptionPage;
   let fixture: ComponentFixture<RateAndDeliveryOptionPage>;
   let store: MockStore<AppState>;
   let ratesReqMapper: RatesDataMapper;
   let ratesService: RatesService;
   let isError = false;
   const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl', 'navigate', 'then']);
   const initialState: AppState = {
      shippingApp: {
         userAccount: null,
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
         if (!isError) {
            return Observable.create((observer: Observer<any>) => {
               observer.next(this.getMockRateQuoteResponse);
            });
         } else {
            return Observable.create((observer: Observer<any>) => {
               observer.error(getMockRateErrorResponse());
            });
         }

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
            RateAndDeliveryOptionPage,
            DateFormatPipe,
            LocalDateFormatPipe,
            TimeFormatPipe
         ],
         imports: [
            RouterTestingModule,
            IonicModule.forRoot(),
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
            // RatesService,
            RatesDataMapper,
            {
               provide: ConfigService,
               useClass: ConfigServiceStub
            },
            provideMockStore({ initialState }),
            { provide: Router, useValue: routerSpy },
            { provide: RatesService, useClass: APIMRatesServiceStub },
            TranslateService,
            DatePipe,
            DateFormatPipe,
            LocalDateFormatPipe,
            TimeFormatPipe,
            NotificationService
         ]
      }).compileComponents();

      fixture = TestBed.createComponent(RateAndDeliveryOptionPage);
      store = TestBed.inject(MockStore);
      ratesReqMapper = TestBed.inject(RatesDataMapper);
      component = fixture.componentInstance;
      fixture.detectChanges();
      spyOn(store, 'dispatch').and.callFake(() => { });
   }));

   afterEach(() => {
      fixture.destroy();
   });

   fit('should create', () => {
      expect(component).toBeTruthy();
   });

   /**
    * Expects to call rate request on ngOnInit()
    */
   fit('should be able to request for rate quote', () => {
      spyOn(component, 'getRateQuote');
      component.ngOnInit();
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

   fit('should hide rate indicator when there is no value of the dateDetail available for any object.', () => {
      const ratesDiscount: ApiResponse = getMockRateWithoutDiscountResponse();
      const rateReplyDetails: RateReplyDetail[] = getMockRateQuoteResponse().output.rateReplyDetails;
      rateReplyDetails[0].commit.dateDetail = { day: null, dayCxsFormat: null, dayOfWeek: null, time: null };
      component.ratesList = ratesReqMapper.mapRateQuoteResponseToGUI(rateReplyDetails, ratesDiscount.configlist);

      const fastestPriceIndex = component.ratesList.findIndex(x => x.serviceHint === 'FASTEST');
      expect(fastestPriceIndex).toEqual(-1);

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

   /**
    * This scenario tests for selected rate & next page navigation
    */
   fit('should save selected rate and navigate to next custom details page', async () => {
      const ratesDiscount: ApiResponse = getMockRateWithoutDiscountResponse();
      const rateReplyDetails: RateReplyDetail[] = getMockRateQuoteResponse().output.rateReplyDetails;
      const rateDelivOptionList = ratesReqMapper.mapRateQuoteResponseToGUI(rateReplyDetails, ratesDiscount.configlist);

      component.ratesList = rateDelivOptionList;
      component.selectedRate(0);
      component.getRateDetails();
      fixture.detectChanges();
      spyOn(component, 'selectedRate');

      expect(component.rateDetailsState).toBe(initialState.shippingApp.shipmentDetails.selectedRate);
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/shipping/customs-details');
   });

   fit('should calculate dimensional weight, when weight unit is KG', async () => {
      initialState.shippingApp.shipmentDetails.totalWeight = 50;
      initialState.shippingApp.shipmentDetails.packageDetails[0].packageDimensionLength = 100;
      initialState.shippingApp.shipmentDetails.packageDetails[0].packageDimensionWidth = 50;
      initialState.shippingApp.shipmentDetails.packageDetails[0].packageDimensionHeight = 50;
      initialState.shippingApp.shipmentDetails.packageDetails[1].packageDimensionLength = 100;
      initialState.shippingApp.shipmentDetails.packageDetails[1].packageDimensionWidth = 50;
      initialState.shippingApp.shipmentDetails.packageDetails[1].packageDimensionHeight = 50;
      component.calculateChargableDimensionalWeight();

      expect(component.actualTotalWeight).toEqual(50);
      expect(component.packageWeightUnit).toBe(UnitOfMeasurement.KG.toLowerCase());
      expect(component.chargableDimensionalWeight).toEqual(100);
   })

   fit('should hide rates and show error message when dimensional weight is more than 200, when weight unit is KG', async () => {
      initialState.shippingApp.shipmentDetails.totalWeight = 50;
      initialState.shippingApp.shipmentDetails.packageDetails[0].packageDimensionLength = 101;
      initialState.shippingApp.shipmentDetails.packageDetails[0].packageDimensionWidth = 100;
      initialState.shippingApp.shipmentDetails.packageDetails[0].packageDimensionHeight = 100;

      component.calculateChargableDimensionalWeight();

      expect(component.actualTotalWeight).toEqual(50);
      expect(component.packageWeightUnit).toBe(UnitOfMeasurement.KG.toLowerCase());
      expect(component.isDimensionalWeightExceedLimit).toBeTrue;
   })

   fit('should calculate dimensional weight, when weight unit is LB', async () => {
      initialState.shippingApp.shipmentDetails.totalWeight = 210;
      initialState.shippingApp.shipmentDetails.packageDetails[0].packageWeightUnit = UnitOfMeasurement.LB;
      initialState.shippingApp.shipmentDetails.packageDetails[0].packageDimensionLength = 30;
      initialState.shippingApp.shipmentDetails.packageDetails[0].packageDimensionLength = 30;
      initialState.shippingApp.shipmentDetails.packageDetails[0].packageDimensionWidth = 24;
      initialState.shippingApp.shipmentDetails.packageDetails[0].packageDimensionHeight = 24;
      initialState.shippingApp.shipmentDetails.packageDetails[1].packageDimensionLength = 30;
      initialState.shippingApp.shipmentDetails.packageDetails[1].packageDimensionWidth = 24;
      initialState.shippingApp.shipmentDetails.packageDetails[1].packageDimensionHeight = 24;
      component.calculateChargableDimensionalWeight();

      expect(component.actualTotalWeight).toEqual(210);
      expect(component.packageWeightUnit).toBe(UnitOfMeasurement.LB.toLowerCase());
      expect(component.chargableDimensionalWeight).toEqual(248);
   })

   fit('should should hide rates and show error message when dimensional weight is more than 440.92, when weight unit is LB', async () => {
      initialState.shippingApp.shipmentDetails.totalWeight = 210;
      initialState.shippingApp.shipmentDetails.packageDetails[0].packageWeightUnit = UnitOfMeasurement.LB;
      initialState.shippingApp.shipmentDetails.packageDetails[0].packageDimensionLength = 15;
      initialState.shippingApp.shipmentDetails.packageDetails[0].packageDimensionWidth = 63;
      initialState.shippingApp.shipmentDetails.packageDetails[0].packageDimensionHeight = 65;

      component.calculateChargableDimensionalWeight();

      expect(component.actualTotalWeight).toEqual(210);
      expect(component.packageWeightUnit).toBe(UnitOfMeasurement.LB.toLowerCase());
      expect(component.isDimensionalWeightExceedLimit).toBeTrue;
   })

   fit('should hide dimesional fields if dimesnion values not entered.', async () => {
      initialState.shippingApp.shipmentDetails.totalWeight = 210;
      initialState.shippingApp.shipmentDetails.packageDetails[0].packageWeightUnit = UnitOfMeasurement.LB;
      initialState.shippingApp.shipmentDetails.packageDetails[0].packageDimensionLength = null;
      initialState.shippingApp.shipmentDetails.packageDetails[0].packageDimensionWidth = null;
      initialState.shippingApp.shipmentDetails.packageDetails[0].packageDimensionHeight = null;
      initialState.shippingApp.shipmentDetails.packageDetails[1].packageDimensionLength = 30;
      initialState.shippingApp.shipmentDetails.packageDetails[1].packageDimensionWidth = 24;
      initialState.shippingApp.shipmentDetails.packageDetails[1].packageDimensionHeight = 24;
      component.calculateChargableDimensionalWeight();

      expect(component.actualTotalWeight).toEqual(210);
      expect(component.packageWeightUnit).toBe(UnitOfMeasurement.LB.toLowerCase());
      expect(component.chargableDimensionalWeight).toEqual(0);
   })

   fit('should show bubble hint popup on click.', async () => {
      initialState.shippingApp.shipmentDetails.packageDetails[0].packageWeightUnit = UnitOfMeasurement.KG;
      spyOn(component.notif, 'showBubbleHintMessage');
      component.showDimensionalWeightBubbleHint();

      expect(component.notif.showBubbleHintMessage).toHaveBeenCalled();
   })

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

   // Mock Rate Discount Response - with <30%> Discount
   function getMockRateErrorResponse() {
      return {
         transactionId: '9d1b7cb3-575d-4dcd-ad60-43f7653a83b7',
         errors: [{
            code: 'SYSTEM.UNEXPECTED.ERROR',
            message: 'The system has experienced an unexpected problem and is unable to complete your request.  Please try again later.  We regret any inconvenience.'
         }]
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

   fit('should do ngDoCheck', () => {
      spyOn(component, 'ngOnInit');
      component.selectedLanguage = 'zh_hk';
      sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en_hk');
      component.ngDoCheck();
      expect(component.selectedLanguage).toEqual(sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE));
      expect(component.ngOnInit).toHaveBeenCalled();
   });

   fit('should be able to request for rate quote', () => {
      component.ratesList = [];
      const ratesDiscount: ApiResponse = getMockRateWithoutDiscountResponse();
      const rateReplyDetails: RateReplyDetail[] = getMockRateQuoteResponse().output.rateReplyDetails;
      component.getRateQuote(initialState.shippingApp);
      expect(component.ratesList).toBeDefined(ratesReqMapper.mapRateQuoteResponseToGUI(rateReplyDetails, ratesDiscount.configlist));
   });

   fit('should be able to change value after toggle', () => {
      const ratesDiscount: ApiResponse = getMockRateWithoutDiscountResponse();
      const rateReplyDetails: RateReplyDetail[] = getMockRateQuoteResponse().output.rateReplyDetails;
      component.ratesList = ratesReqMapper.mapRateQuoteResponseToGUI(rateReplyDetails, ratesDiscount.configlist);
      component.changeArrow(1);
      expect(component.ratesList[0].toggleBreakdown).toEqual(false);
   });

   fit('should be rateApiError set to true, when rate quote failed.', () => {
      component.ratesList = [];
      isError = true;
      component.getRateQuote(initialState.shippingApp);
      expect(component.rateApiError).toBeTruthy;
   });
});
