import { TestBed, async, getTestBed } from '@angular/core/testing';
import { APIMAvailabilityService } from './availability.service';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { DatePipe } from '@angular/common';
import { ConfigService } from '@ngx-config/core';
import { Injector } from '@angular/core';
import * as testConfig from '../../../../assets/config/mockConfigForTest';
import { APIMAvailabilityDataMapper } from 'src/app/providers/mapper/apim/availability-data-mapper.service';
import { Recipient } from 'src/app/interfaces/api-service/request/recipient';
import { Sender } from 'src/app/interfaces/api-service/request/sender';
import { SignatureOptionsParams } from 'src/app/interfaces/api-service/request/signature-option-params.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { response } from 'express';

fdescribe('APIMAvailabilityService', () => {
  let service: APIMAvailabilityService;
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: ConfigService, useClass: ConfigServiceStub },
        APIMAvailabilityService, APIMAvailabilityDataMapper,
        DatePipe
      ]
    });

    injector = getTestBed();
    service = injector.get(APIMAvailabilityService);
    httpMock = injector.get(HttpTestingController);
  });

  fit('should be created', async(() => {
    expect(service).toBeTruthy();
  }));

  fit('should get package type list - getPackageTypeList()', async(() => {
    const mockResponse = {
      transactionId: 'cb4e22cc-e4fe-43ce-8a1a-a452dab6b7c4',
      output: {
        packagingTypeList: [
          'FEDEX_ENVELOPE',
          'FEDEX_SMALL_BOX',
          'FEDEX_MEDIUM_BOX',
          'FEDEX_LARGE_BOX',
          'FEDEX_EXTRA_LARGE_BOX'
        ]
      }
    };

    // We call the service
    service.getPackageTypeList().subscribe((response) => {
      expect(response.output.packagingTypeList.length).toBeGreaterThanOrEqual(5);
      expect(response.output.packagingTypeList).toContain('FEDEX_ENVELOPE');
      expect(response.output.packagingTypeList).toContain('FEDEX_SMALL_BOX');
      expect(response.output.packagingTypeList).toContain('FEDEX_EXTRA_LARGE_BOX');
    });

    const request = httpMock.expectOne({ method: 'GET' });

    request.flush(mockResponse);
  }));

  fit('should return 404 error response - getPackageTypeList()', async(() => {
    const mockResponse = new HttpErrorResponse({
      error: '404 error',
      status: 404, statusText: 'Not Found'
    });

    service.getPackageTypeList().subscribe((response) => {
      expect(response.error).toBeDefined();
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockResponse);
  }));

  fit('should get package and service options - getPackageAndServiceOptions(...)', async(() => {
    const mockResponse = {
      transactionDetails: [
        {
          sourceSystem: 'VACS',
          transactionId: 'commondatacal-INET:vacs-getAllServicesAndPackaging-edcdev1-release-vacs-l3-3-e288fe1d-7014-43e1-74d5-f7dd-20201206-07:48:28,238-1730988882'
        }
      ],
      output: {
        serviceOptions: [
          {
            key: 'FIRST_OVERNIGHT',
            displayText: 'FedEx First Overnight<SUP>&reg;</SUP>'
          },
          {
            key: 'PRIORITY_OVERNIGHT',
            displayText: 'FedEx Priority Overnight<SUP>&reg;</SUP>'
          },
          {
            key: 'STANDARD_OVERNIGHT',
            displayText: 'FedEx Standard Overnight<SUP>&reg;</SUP>'
          },
          {
            key: 'FEDEX_2_DAY_AM',
            displayText: 'FedEx 2Day AM<SUP>&reg;</SUP> '
          },
          {
            key: 'FEDEX_2_DAY',
            displayText: 'FedEx 2Day<SUP>&reg;</SUP>'
          },
          {
            key: 'FEDEX_EXPRESS_SAVER',
            displayText: 'FedEx Express Saver<SUP>&reg;</SUP>'
          },
          {
            key: 'FEDEX_FIRST_FREIGHT',
            displayText: 'FedEx First Overnight<SUP>&reg;</SUP>Freight'
          },
          {
            key: 'FEDEX_1_DAY_FREIGHT',
            displayText: 'FedEx 1Day Freight<SUP>&reg;</SUP>'
          },
          {
            key: 'FEDEX_2_DAY_FREIGHT',
            displayText: 'FedEx 2Day Freight<SUP>&reg;</SUP>'
          },
          {
            key: 'FEDEX_3_DAY_FREIGHT',
            displayText: 'FedEx 3Day Freight<SUP>&reg;</SUP>'
          },
          {
            key: 'FEDEX_GROUND',
            displayText: 'FedEx Ground<SUP>&reg;</SUP>'
          },
          {
            key: 'FEDEX_HOME_DELIVERY',
            displayText: 'FedEx Home Delivery <SUP>&reg;</SUP> '
          }
        ],
        packageOptions: [
          {
            packageType: {
              key: 'FEDEX_ENVELOPE',
              displayText: 'FedEx Envelope'
            },
            rateTypes: [
              'WEIGHT_BASED',
              'FLAT_BASED'
            ],
            subpackageInfoList: [
              {
                description: 'Letter',
                dimensionText: '24.13 cm x 31.75 cm'
              },
              {
                description: 'Legal',
                dimensionText: '24.13 cm x 39.37 cm'
              }
            ],
            maxMetricWeightAllowed: {
              units: 'KG',
              value: 0.22
            },
            maxWeightAllowed: {
              units: 'LB',
              value: 0.5
            },
            oneRateMaxWeightAllowed: {
              units: 'LB',
              value: 10.0
            },
            oneRateMaxMetricWeightAllowed: {
              units: 'KG',
              value: 4.53
            }
          },
          {
            packageType: {
              key: 'FEDEX_PAK',
              displayText: 'FedEx Pak'
            },
            rateTypes: [
              'WEIGHT_BASED',
              'FLAT_BASED'
            ],
            subpackageInfoList: [
              {
                description: 'Small',
                dimensionText: '26.04 cm x 32.39 cm'
              },
              {
                description: 'Large',
                dimensionText: '30.48 cm x 39.37 cm'
              }
            ],
            maxMetricWeightAllowed: {
              units: 'KG',
              value: 9.0
            },
            maxWeightAllowed: {
              units: 'LB',
              value: 20.0
            },
            oneRateMaxWeightAllowed: {
              units: 'LB',
              value: 50.0
            },
            oneRateMaxMetricWeightAllowed: {
              units: 'KG',
              value: 22.67
            }
          },
          {
            packageType: {
              key: 'FEDEX_SMALL_BOX',
              displayText: 'FedEx Small Box'
            },
            rateTypes: [
              'WEIGHT_BASED',
              'FLAT_BASED'
            ],
            subpackageInfoList: [
              {
                description: 'S1: Rectangular and shallow',
                dimensionText: '27.62 cm x 3.81 cm x 31.43 cm'
              },
              {
                description: 'S2: Rectangular and deep',
                dimensionText: '2.23 cm x 6.83 cm x 28.73 cm'
              }
            ],
            maxMetricWeightAllowed: {
              units: 'KG',
              value: 9.0
            },
            maxWeightAllowed: {
              units: 'LB',
              value: 20.0
            },
            oneRateMaxWeightAllowed: {
              units: 'LB',
              value: 50.0
            },
            oneRateMaxMetricWeightAllowed: {
              units: 'KG',
              value: 22.67
            }
          },
          {
            packageType: {
              key: 'FEDEX_MEDIUM_BOX',
              displayText: 'FedEx Medium Box'
            },
            rateTypes: [
              'WEIGHT_BASED',
              'FLAT_BASED'
            ],
            subpackageInfoList: [
              {
                description: 'M1: Rectangular and shallow',
                dimensionText: '29.21 cm x 6.03 cm x 33.66 cm'
              },
              {
                description: 'M2: Rectangular and deep',
                dimensionText: '22.23 cm x 11.11 cm x 28.73 cm'
              }
            ],
            maxMetricWeightAllowed: {
              units: 'KG',
              value: 9.0
            },
            maxWeightAllowed: {
              units: 'LB',
              value: 20.0
            },
            oneRateMaxWeightAllowed: {
              units: 'LB',
              value: 50.0
            },
            oneRateMaxMetricWeightAllowed: {
              units: 'KG',
              value: 22.67
            }
          },
          {
            packageType: {
              key: 'FEDEX_LARGE_BOX',
              displayText: 'FedEx Large Box'
            },
            rateTypes: [
              'WEIGHT_BASED',
              'FLAT_BASED'
            ],
            subpackageInfoList: [
              {
                description: 'L1: Rectangular and shallow',
                dimensionText: '31.43 cm x 7.62 cm x 44.45 cm'
              },
              {
                description: 'L2: Rectangular and deep',
                dimensionText: '22.23 cm x 19.69 cm x 28.73 cm'
              }
            ],
            maxMetricWeightAllowed: {
              units: 'KG',
              value: 9.0
            },
            maxWeightAllowed: {
              units: 'LB',
              value: 20.0
            },
            oneRateMaxWeightAllowed: {
              units: 'LB',
              value: 50.0
            },
            oneRateMaxMetricWeightAllowed: {
              units: 'KG',
              value: 22.67
            }
          },
          {
            packageType: {
              key: 'FEDEX_EXTRA_LARGE_BOX',
              displayText: 'FedEx Extra Large Box'
            },
            rateTypes: [
              'WEIGHT_BASED',
              'FLAT_BASED'
            ],
            subpackageInfoList: [
              {
                description: 'X1: Cube-shaped',
                dimensionText: '30.16 cm x 27.46 cm x 28.10 cm'
              },
              {
                description: 'X2: Rectangular-shaped',
                dimensionText: '40.01 cm x 36.04 cm x 15.24 cm'
              }
            ],
            maxMetricWeightAllowed: {
              units: 'KG',
              value: 9.0
            },
            maxWeightAllowed: {
              units: 'LB',
              value: 20.0
            },
            oneRateMaxWeightAllowed: {
              units: 'LB',
              value: 50.0
            },
            oneRateMaxMetricWeightAllowed: {
              units: 'KG',
              value: 22.67
            }
          },
          {
            packageType: {
              key: 'FEDEX_TUBE',
              displayText: 'FedEx Tube'
            },
            rateTypes: [
              'WEIGHT_BASED',
              'FLAT_BASED'
            ],
            subpackageInfoList: [
              {
                description: 'Tube',
                dimensionText: '15.24 cm x 15.24 cm x 96.52 cm'
              }
            ],
            maxMetricWeightAllowed: {
              units: 'KG',
              value: 9.0
            },
            maxWeightAllowed: {
              units: 'LB',
              value: 20.0
            },
            oneRateMaxWeightAllowed: {
              units: 'LB',
              value: 50.0
            },
            oneRateMaxMetricWeightAllowed: {
              units: 'KG',
              value: 22.67
            }
          },
          {
            packageType: {
              key: 'YOUR_PACKAGING',
              displayText: 'Your Packaging'
            },
            rateTypes: [
              'WEIGHT_BASED'
            ],
            subpackageInfoList: [
              {
                description: 'Please enter the weight and dimensions of your package for a more accurate estimated rate.',
                dimensionText: ''
              }
            ],
            maxMetricWeightAllowed: {
              units: 'KG',
              value: 998.0
            },
            maxWeightAllowed: {
              units: 'LB',
              value: 2200.0
            }
          }
        ],
        oneRate: true,
        pricingOptions: [
          {
            key: 'WEIGHT_BASED',
            displayText: 'FedEx Standard Rate'
          },
          {
            key: 'FLAT_BASED',
            displayText: 'FedEx One Rate'
          }
        ]
      },
      successful: true
    };

    let sender: Sender;
    let recipient: Recipient;
    service.getPackageAndServiceOptions(sender, recipient).subscribe((response) => {
      expect(response.output.packageOptions.length).toBeGreaterThanOrEqual(1);
      expect(response.output.serviceOptions.length).toBeGreaterThanOrEqual(1);
      expect(response.output.pricingOptions.length).toBeGreaterThanOrEqual(1);
      expect(response.output.oneRate).toBe(true);
    });

    const request = httpMock.expectOne({ method: 'POST' });

    request.flush(mockResponse);
  }));

  fit('should return 404 error response - getPackageAndServiceOptions()', async(() => {
    const mockResponse = new HttpErrorResponse({
      error: '404 error',
      status: 404, statusText: 'Not Found'
    });

    let sender: Sender;
    let recipient: Recipient;
    service.getPackageAndServiceOptions(sender, recipient).subscribe((response) => {
      expect(response.error).toBeDefined();
    });

    const request = httpMock.expectOne({ method: 'POST' });
    request.flush(mockResponse);
  }));

  fit('should get signature options list - getSignatureOptionsList()', async(() => {
    const mockResponse = {
      transactionId: '443a3020-fbc3-4a11-92e6-73833e895bec',
      output: {
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
          displayText: 'None specified'
        }
      }
    };

    const requestParams: SignatureOptionsParams = {
      requestedShipment: {
        shipper: {
          contact: {
            personName: 'Nikita',
            phoneNumber: '9595661856',
            emailAddress: '',
            companyName: 'Syntel'
          },
          address: {
            city: 'ADAN',
            stateOrProvinceCode: '',
            postalCode: '',
            countryCode: 'KW',
            residential: false,
            streetLines: [
              '10 Fedex Parkway'
            ]
          },
          tins: [
            {
              tinType: 'BUSINESS_UNION',
              number: '',
              usage: ''
            }
          ]
        },
        recipients: [
          {
            contact: {
              personName: 'Supriya',
              phoneNumber: '9595661856',
              emailAddress: '',
              companyName: 'Syntel'
            },
            address: {
              city: 'ALAJUELA',
              stateOrProvinceCode: '',
              postalCode: '',
              countryCode: 'CR',
              residential: false,
              streetLines: [
                '10 Fedex Parkway'
              ]
            },
            tins: [
              {
                tinType: 'BUSINESS_UNION',
                number: '',
                usage: ''
              }
            ],
            deliveryInstructions: ''
          }
        ],
        shipTimestamp: 'Apr-19-2015',
        pickupType: 'DROPOFF_AT_FEDEX_LOCATION',
        serviceType: 'INTERNATIONAL_PRIORITY',
        specialServicesRequested: {
          specialServiceTypes: []
        },
        customsClearanceDetail: {
          documentContent: 'NON_DOCUMENTS',
          insuranceCharges: 0.0,
          commercialInvoice: {
            shipmentPurpose: 'NOT_SOLD'
          },
          commodities: [
            {
              name: 'DOCUMENTS',
              numberOfPieces: 1,
              description: 'DOCUMENTS',
              countryOfManufacture: 'KW',
              weight: {
                value: '20',
                units: 'LB'
              },
              quantity: 1,
              quantityUnits: 'EA',
              unitPrice: {
                amount: 100,
                currency: 'KUD'
              },
              customsValue: {
                amount: 100,
                currency: 'KUD'
              }
            }
          ]
        },
        blockInsightVisibility: true,
        requestedPackageLineItems: [
          {
            groupPackageCount: 1,
            physicalPackaging: 'YOUR_PACKAGING',
            weight: {
              units: 'LB',
              value: '20'
            },
            itemDescriptionForClearance: '',
            insuredValue: {
              currency: 'KUD',
              amount: 100
            }
          }
        ]
      }
    };
    // We call the service
    service.getSignatureOptionsList(requestParams).subscribe((response) => {
      expect(response.output.availableSignatureOptions.length).toBe(4);
      expect(response.output.availableSignatureOptions[0].key).toBe('SERVICE_DEFAULT');
      expect(response.output.availableSignatureOptions[0].displayText).toBe('None specified');
      expect(response.output.availableSignatureOptions[1].key).toBe('INDIRECT');
      expect(response.output.availableSignatureOptions[1].displayText).toBe('Indirect signature required');
      expect(response.output.availableSignatureOptions[2].key).toBe('DIRECT');
      expect(response.output.availableSignatureOptions[2].displayText).toBe('Direct signature required');
      expect(response.output.availableSignatureOptions[3].key).toBe('ADULT');
      expect(response.output.availableSignatureOptions[3].displayText).toBe('Adult signature required');
      expect(response.output.recommendedSignatureOption.key).toBe('SERVICE_DEFAULT');
      expect(response.output.recommendedSignatureOption.displayText).toBe('None specified');
    });

    const request = httpMock.expectOne({ method: 'POST' });
    request.flush(mockResponse);
  }));

  fit('should return 404 error response - getPackageAndServiceOptions()', async(() => {
    const mockResponse = new HttpErrorResponse({
      error: '404 error',
      status: 404, statusText: 'Not Found'
    });

    service.getSignatureOptionsList(null).subscribe((response) => {
      expect(response.error).toBeDefined();
    });

    const request = httpMock.expectOne({ method: 'POST' });
    request.flush(mockResponse);
  }));
});
