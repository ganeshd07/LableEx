import { async, TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ConfigModule, ConfigService, ConfigLoader } from '@ngx-config/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GenericResponse } from 'src/app/interfaces/api-service/response/generic-response';
import { configFactory } from '../../../app.module';
import * as testConfig from '../../../../assets/config/mockConfigForTest';
import { CreateShipmentService } from './create-shipment.service';
import { CreateShipmentResponse } from 'src/app/interfaces/api-service/response/create-shipment-response';
import { ShippingInfo } from 'src/app/pages/shipping/+store/shipping.state';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { AppState } from 'src/app/+store/app.state';
import { DocumentsType } from 'src/app/types/enum/documents-type.enum';
import { SummaryPageConstants } from 'src/app/types/constants/summary-page.constants';
import { SessionItems } from 'src/app/types/enum/session-items.enum';

const mockDevConfig = {
  LOCAL: {
    HOST: 'https://apidrt.idev.fedex.com',
    API_ISLAND: {
      createShipment: '/api/v1/shipment/create'
    }
  }
};

const mockError = {
  transactionId: 'fed46156-54ce-4220-967b-0edaf185efbb',
  errors: [
    {
      code: 'SYSTEM.UNEXPECTED.ERROR',
      message: 'The system has experienced an unexpected problem and is unable to complete your request.  Please try again later.  We regret any inconvenience.'
    }
  ]
};

describe('CreateShipmentService', () => {
  let service: CreateShipmentService;
  let configService: ConfigService;
  let httpMock: HttpTestingController;
  const mockConfig = testConfig.config;
  let mockStore: MockStore;
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
        mergedListOfcountryOfManufacture: [{
          countries: [{
            code: 'HK',
            actualCountryCode: 'HK',
            name: 'Hong Kong, China'
          }]
        }],
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
  let mockData: ShippingInfo = {
    userAccount: null,
    shipmentDetails: {
      packageDetails: [
        {
          packageCode: '',
          packageQuantity: 1,
          packageWeight: '12',
          packageWeightUnit: 'KG',
          packageDimensionLength: 10,
          packageDimensionWidth: 20,
          packageDimensionHeight: 20,
          packageDimensionUnit: 'CM',
          yourPackageDescription: ''
        }
      ],
      totalNumberOfPackages: 1,
      totalWeight: 12,
      serviceType: 'INTERNATIONAL_PRIORITY',
      serviceName: 'International Priority®',
      packagingType: 'YOUR_PACKAGING',
      serviceCode: '',
      advancedPackageCode: '',
      totalCustomsOrInvoiceValue: null,
      customsOrInvoiceValueCurrency: '',
      carriageDeclaredValue: 12,
      carriageDeclaredValueCurrency: 'CNY',
      displayDate: '',
      shipDate: null,
      selectedRate: {
        dayOfWeek: null,
        dateOfArrival: null,
        timeOfArrival: null,
        totalNetCharge: 4639.77,
        totalBaseCharge: 5641.03,
        saturdayDelivery: null,
        surchargeList: [
          {
            type: 'FUEL',
            description: 'Fuel Surcharge',
            amount: [
              {
                currency: 'CNY',
                amount: 691.05
              }
            ]
          }
        ],
        volumeDiscount: 1692.31,
        currency: 'CNY'
      },
      firstAvailableShipDate: null,
      lastAvailableShipDate: null,
      availableShipDates: null,
      selectedPackageOption: null,
      specialServiceInfo: {
        selectedSignatureOption: {
          key: 'SATURDAY_DELIVERY',
          displayText: 'Saturday Delivery'
        }
      }
    },
    customsDetails: {
      commodityList: [],
      customsType: 'doc',
      productType: '',
      productPurpose: 'SAMPLE',
      documentType: 'Personal Document',
      documentTypeCode: 'DOCUMENTS_ONLY',
      documentValue: 12,
      documentValueUnits: 'CNY'
    },
    senderDetails: {
      address1: 'sender ad1',
      address2: 'sender ad2',
      city: 'BEIJING',
      contactName: 'sender contact name',
      countryCode: 'CN',
      countryName: 'China',
      postalCode: '100600',
      companyName: 'sender com name',
      emailAddress: 'sender@f.com',
      postalAware: true,
      stateAware: false,
      phoneNumber: '123456789',
      saveContact: false,
      taxId: '675678456'
    },
    recipientDetails: [
      {
        address1: 'recipeint ad 1',
        address2: 'recipeint ad 2',
        address3: 'recipent ad 3',
        residential: false,
        companyName: 'recipeint comp name',
        contactName: 'recipeint contact name',
        city: 'CAMP WAREHOUSE',
        countryCode: 'AF',
        countryName: 'Afghanistan',
        postalAware: false,
        phoneNumber: '1234567888888',
        phoneExt: '1111111',
        emailAddress: 'recipient@emal.com',
        taxId: '888888888888',
        passportNumber: '',
        postalCode: ''
      }
    ],
    paymentDetails: {
      shippingBillTo: 'PAY_AT_DROP_OFF',
      shippingBillToDisplayable: 'Pay at drop off',
      shippingAccountNumber: '123456789',
      shippingAccountNumberDisplayable: 'Pay at drop off',
      dutiesTaxesBillTo: 'PAY_AT_DROP_OFF',
      dutiesTaxesBillToDisplayable: 'Bill Recipient',
      dutiesTaxesAccountNumber: '123456789',
      dutiesTaxesAccountNumberDisplayable: 'Bill Recipient'
    },
    shipmentConfirmation: null
  };

  const CREATESHIPMENT_API = mockDevConfig.LOCAL.API_ISLAND;
  const createShipmentAPI = mockDevConfig.LOCAL.HOST + CREATESHIPMENT_API.createShipment;

  class configServiceStub {
    settings: any = mockDevConfig;
    getSettings(prop: string) {
      return this.settings[prop];
    }
    init() {
      this.settings = mockDevConfig;
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ConfigModule.forRoot({
          provide: ConfigLoader,
          useFactory: configFactory,
          deps: [HttpClient]
        }),
        HttpClientTestingModule
      ],
      providers: [
        ConfigService,
        CreateShipmentService,
        HttpClient,
        { provide: ConfigService, useClass: configServiceStub },
        provideMockStore({ initialState }),
      ]
    });

    configService = TestBed.inject(ConfigService);
    service = TestBed.inject(CreateShipmentService);
    httpMock = TestBed.inject(HttpTestingController);
    mockStore = TestBed.inject(MockStore);

  });

  beforeEach(async () => {
    sessionStorage.setItem(SessionItems.DIALINGPREFIX, '+852');
  })

  afterEach(async () => {
    sessionStorage.clear();
    httpMock.verify();
  });

  fit('should be created', () => {
    expect(service).toBeTruthy();
  });

  fit('should return a successful response for document', async (done) => {
    //TODO : Modify as per actual response
    const mockResponse = {
      output: {
        shipmentId: 82365,
        shipmentRefNumber: 'CN1221355799',
        barcodeURI: 'https://wwwdrt.idev.fedex.com/mobileshipping/qrCode?refNumber=CN1221355799'
      }
    };

    service.postCreateShipment(mockData).subscribe((response: GenericResponse<CreateShipmentResponse>) => {
      expect((response.output.shipmentId).toString()).toEqual('82365');
      done();
    });

    const urlRequest = httpMock.expectOne('https://apidrt.idev.fedex.com/api/v1/shipment/create');
    urlRequest.flush(mockResponse);
    httpMock.verify()
  });

  fit('should return a successful response for non document', async (done) => {
    sessionStorage.setItem(SessionItems.MOBILENUMBER, '123456789');
    const mockDataCommodity: ShippingInfo = {
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
        address2: '',
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
        taxId: '09999999999',
        stateOrProvinceCode: ''
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
    }
    const mockResponse = {
      output: {
        shipmentId: 82365,
        shipmentRefNumber: 'CN1221355799',
        barcodeURI: 'https://wwwdrt.idev.fedex.com/mobileshipping/qrCode?refNumber=CN1221355799'
      }
    };

    service.postCreateShipment(mockDataCommodity).subscribe((response: GenericResponse<CreateShipmentResponse>) => {
      expect((response.output.shipmentId).toString()).toEqual('82365');
      done();
    });

    const urlRequest = httpMock.expectOne('https://apidrt.idev.fedex.com/api/v1/shipment/create');
    urlRequest.flush(mockResponse);
    httpMock.verify()
  });

  fit('should return a successful response for document', async (done) => {
    sessionStorage.setItem(SessionItems.MOBILENUMBER, '123456789');
    const mockDataCommodity: ShippingInfo = {
      userAccount: null,
      shipmentDetails: {
        packageDetails: [],
        totalNumberOfPackages: 0,
        totalWeight: 0,
        serviceType: 'INTERNATIONAL_PRIORITY',
        serviceName: 'International Priority®',
        packagingType: '',
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
          saturdayDelivery: true
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
        customsType: SummaryPageConstants.DOC,
        productType: '',
        productPurpose: 'SOLD',
        documentType: 'Description',
        documentTypeCode: DocumentsType.PERSONAL,
        documentValue: 100,
        documentValueUnits: ''
      },
      senderDetails: {
        address1: 'Add1 sender',
        address2: '',
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
        taxId: '09999999999',
        stateOrProvinceCode: ''
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
        shippingAccountNumber: '',
        shippingAccountNumberDisplayable: 'Pay at drop off',
        dutiesTaxesBillTo: 'Bill Recipient',
        dutiesTaxesBillToDisplayable: 'Bill Recipient',
        dutiesTaxesAccountNumber: '',
        dutiesTaxesAccountNumberDisplayable: 'Bill Recipient'
      },
      shipmentConfirmation: null
    }
    const mockResponse = {
      output: {
        shipmentId: 82365,
        shipmentRefNumber: 'CN1221355799',
        barcodeURI: 'https://wwwdrt.idev.fedex.com/mobileshipping/qrCode?refNumber=CN1221355799'
      }
    };

    service.postCreateShipment(mockDataCommodity).subscribe((response: GenericResponse<CreateShipmentResponse>) => {
      expect((response.output.shipmentId).toString()).toEqual('82365');
      done();
    });

    const urlRequest = httpMock.expectOne('https://apidrt.idev.fedex.com/api/v1/shipment/create');
    urlRequest.flush(mockResponse);
    httpMock.verify()
  });

  fit('should return a successful response for document', async (done) => {
    sessionStorage.setItem(SessionItems.MOBILENUMBER, '123456789');
    const mockDataCommodity: ShippingInfo = {
      userAccount: null,
      shipmentDetails: {
        packageDetails: [],
        totalNumberOfPackages: 0,
        totalWeight: 0,
        serviceType: 'INTERNATIONAL_PRIORITY',
        serviceName: 'International Priority®',
        packagingType: '',
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
          saturdayDelivery: true
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
        customsType: SummaryPageConstants.DOC,
        productType: '',
        productPurpose: 'SOLD',
        documentType: 'Description',
        documentTypeCode: DocumentsType.OTHER,
        documentValue: 100,
        documentValueUnits: ''
      },
      senderDetails: {
        address1: 'Add1 sender',
        address2: '',
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
        taxId: '09999999999',
        stateOrProvinceCode: ''
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
        shippingAccountNumber: '',
        shippingAccountNumberDisplayable: 'Pay at drop off',
        dutiesTaxesBillTo: 'Bill Recipient',
        dutiesTaxesBillToDisplayable: 'Bill Recipient',
        dutiesTaxesAccountNumber: '',
        dutiesTaxesAccountNumberDisplayable: 'Bill Recipient'
      },
      shipmentConfirmation: null
    }
    const mockResponse = {
      output: {
        shipmentId: 82365,
        shipmentRefNumber: 'CN1221355799',
        barcodeURI: 'https://wwwdrt.idev.fedex.com/mobileshipping/qrCode?refNumber=CN1221355799'
      }
    };

    service.postCreateShipment(mockDataCommodity).subscribe((response: GenericResponse<CreateShipmentResponse>) => {
      expect((response.output.shipmentId).toString()).toEqual('82365');
      done();
    });

    const urlRequest = httpMock.expectOne('https://apidrt.idev.fedex.com/api/v1/shipment/create');
    urlRequest.flush(mockResponse);
    httpMock.verify()
  });

  fit('should able to handle error.', async (done) => {
    service.postCreateShipment(mockData).subscribe((response: GenericResponse<CreateShipmentResponse>) => {
      expect(response.errors[0].code).toBe('SYSTEM.UNEXPECTED.ERROR');
      done();
    });

    const urlRequest = httpMock.expectOne(createShipmentAPI);
    urlRequest.flush(mockError);
    httpMock.verify()
  });

  fit('should return 404 error response - postCreateShipment()', async(() => {
    const mockResponse = new HttpErrorResponse({
      error: '404 error',
      status: 404, statusText: 'Not Found'
    });

    service.postCreateShipment(mockData).subscribe((response) => {
      expect(response.error).toBeDefined();
    });

    const request = httpMock.expectOne({ method: 'POST' });
    request.flush(mockResponse);
  }));
});