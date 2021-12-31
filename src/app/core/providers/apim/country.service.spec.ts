import { APIMCountryService } from './country.service';
import { async, TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ConfigModule, ConfigService, ConfigLoader } from '@ngx-config/core';
import * as testConfig from '../../../../assets/config/mockConfigForTest';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DatePipe } from '@angular/common';
import { CountryTypes } from '../../../types/enum/country-type.enum';
import { configFactory } from 'src/app/app.module';
import { GenericResponse } from 'src/app/interfaces/api-service/response/generic-response';
import { SenderRecipientInfoResponse } from 'src/app/interfaces/api-service/response/sender-recipient-info-response';
import { CountryDetailResponse } from 'src/app/interfaces/api-service/response/country-detail-response.interface';
import { CityListResponse } from 'src/app/interfaces/api-service/response/city-list-response.interface';
import { CountryDialingPrefixesResponse } from 'src/app/interfaces/api-service/response/country-dialing-prefixes-response.interface';
import { CountryListResponse } from 'src/app/interfaces/api-service/response/country-list-response';
import { Country } from 'src/app/interfaces/api-service/response/country';
import { CommodityManufactureResponse } from 'src/app/interfaces/api-service/response/commodity-manufacture-response.interface';
import { StateResponse } from 'src/app/interfaces/api-service/response/state-response';

const mockConfig = testConfig.config;

const mockError = {
  transactionId: 'fed46156-54ce-4220-967b-0edaf185efbb',
  errors: [
    {
      code: 'SYSTEM.UNEXPECTED.ERROR',
      message: 'The system has experienced an unexpected problem and is unable to complete your request.  Please try again later.  We regret any inconvenience.'
    }
  ]
};

fdescribe('APIMCountryService', () => {
  let service: APIMCountryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {

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
        HttpClient,
        APIMCountryService,
        DatePipe,
        {
          provide: ConfigService,
          useClass: ConfigServiceStub
        }
      ]
    });

    service = TestBed.inject(APIMCountryService);
    httpMock = TestBed.inject(HttpTestingController);

  });

  afterEach(async () => {
    httpMock.verify();
  });

  fit('should be created', () => {
    expect(service).toBeTruthy();
  });

  fit('getCommodityManufacture() should return a successful response', async () => {
    const mockData = {
      transactionId: '295fb427-d91c-4999-955d-f086ed8c2c11',
      output: {
        countries: [
          {
            name: 'Afghanistan',
            code: 'AF',
            actualCountryCode: 'AF'
          },
          {
            name: 'Albania',
            code: 'AL',
            actualCountryCode: 'AL'
          },
          {
            name: 'Algeria',
            code: 'DZ',
            actualCountryCode: 'DZ'
          }
        ]
      }
    };

    service.getCommodityManufacture(CountryTypes.COUNTRY_MANUFACTURE).subscribe((response: GenericResponse<CommodityManufactureResponse>) => {
      expect(response.output.countries.length).toBe(3);
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockData);
  });

  fit('getCommodityManufacture() should able to handle error', async () => {
    service.getCommodityManufacture(CountryTypes.COUNTRY_MANUFACTURE).subscribe((response: GenericResponse<CommodityManufactureResponse>) => {
      expect(response.errors[0].code).toBe('SYSTEM.UNEXPECTED.ERROR');
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockError);
  });

  fit('should return 404 error response - getCommodityManufacture()', async(() => {
    const mockResponse = new HttpErrorResponse({
      error: '404 error',
      status: 404, statusText: 'Not Found'
    });

    service.getCommodityManufacture(null).subscribe((response) => {
      expect(response.error).toBeDefined();
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockResponse);
  }));

  fit('getCountryListByType() get type by recipient should return a successful response', async () => {
    const mockData = {
      transactionId: 'e76bc5bc-21b0-4272-90d8-4541d3c322dd',
      output: {
        countries: [
          {
            regionCode: 'EMEA',
            currencyCode: 'USD',
            countryCode: 'AF',
            countryName: 'AFGHANISTAN',
            domesticShippingAllowed: false,
            postalAware: false,
            anyPostalAwareness: false
          },
          {
            regionCode: 'EMEA',
            currencyCode: 'USD',
            countryCode: 'AL',
            countryName: 'ALBANIA',
            domesticShippingAllowed: false,
            postalAware: false,
            anyPostalAwareness: false
          },
          {
            regionCode: 'EMEA',
            currencyCode: 'USD',
            countryCode: 'DZ',
            countryName: 'ALGERIA',
            domesticShippingAllowed: false,
            postalAware: false,
            anyPostalAwareness: false
          }
        ]
      }
    };

    service.getCountryListByType(CountryTypes.COUNTRY_RECIPIENT).subscribe((response: GenericResponse<CountryListResponse<Country>>) => {
      expect(response.output.countries.length).toBe(3);
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockData);
  });

  fit('getCountryListByType() get type by sender should return a successful response', async () => {
    const mockData = {
      transactionId: 'e76bc5bc-21b0-4272-90d8-4541d3c322dd',
      output: {
        countries: [
          {
            regionCode: 'EMEA',
            currencyCode: 'USD',
            countryCode: 'AF',
            countryName: 'AFGHANISTAN',
            domesticShippingAllowed: false,
            postalAware: false,
            anyPostalAwareness: false
          },
          {
            regionCode: 'EMEA',
            currencyCode: 'USD',
            countryCode: 'AL',
            countryName: 'ALBANIA',
            domesticShippingAllowed: false,
            postalAware: false,
            anyPostalAwareness: false
          },
          {
            regionCode: 'EMEA',
            currencyCode: 'USD',
            countryCode: 'DZ',
            countryName: 'ALGERIA',
            domesticShippingAllowed: false,
            postalAware: false,
            anyPostalAwareness: false
          }
        ]
      }
    };

    service.getCountryListByType(CountryTypes.COUNTRY_SENDER).subscribe((response: GenericResponse<CountryListResponse<Country>>) => {
      expect(response.output.countries.length).toBe(3);
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockData);
  });

  fit('getCountryListByType() should able to handle error', async () => {
    service.getCountryListByType(CountryTypes.COUNTRY_SENDER).subscribe((response: GenericResponse<CountryListResponse<Country>>) => {
      expect(response.errors[0].code).toBe('SYSTEM.UNEXPECTED.ERROR');
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockError);
  });

  fit('should return 404 error response - getCountryListByType()', async(() => {
    const mockResponse = new HttpErrorResponse({
      error: '404 error',
      status: 404, statusText: 'Not Found'
    });

    service.getCountryListByType(null).subscribe((response) => {
      expect(response.error).toBeDefined();
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockResponse);
  }));

  fit('getCountryDialingPrefixes() should return a successful response', async () => {
    const mockData = {
      transactionId: '23d9a85f-0dca-4092-8299-c83ab410df2c',
      output: {
        countryPrefix: [
          {
            countryCode: 'PR',
            countryDialingCode: '1'
          },
          {
            countryCode: 'PS',
            countryDialingCode: '970'
          },
          {
            countryCode: 'PT',
            countryDialingCode: '351'
          }
        ]
      }
    };

    service.getCountryDialingPrefixes().subscribe((response: GenericResponse<CountryDialingPrefixesResponse>) => {
      expect(response.output.countryPrefix.length).toBe(3);
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockData);
  });

  fit('should able to handle service error - getCountryDialingPrefixes()', async () => {
    service.getCountryDialingPrefixes().subscribe((response: GenericResponse<CountryDialingPrefixesResponse>) => {
      expect(response.errors[0].code).toBe('SYSTEM.UNEXPECTED.ERROR');
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockError);
  });

  fit('should return 404 error response - getCountryDialingPrefixes()', async(() => {
    const mockResponse = new HttpErrorResponse({
      error: '404 error',
      status: 404, statusText: 'Not Found'
    });

    service.getCountryDialingPrefixes().subscribe((response) => {
      expect(response.error).toBeDefined();
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockResponse);
  }));

  fit('getCitiesByCountryCodeAndPostalCode() should return a successful response', async () => {
    const mockData = {
      transactionId: '6d4898ae-252f-4a49-ac26-7d1f048c3f7e',
      output: {
        totalResults: 1,
        resultsReturned: 1,
        matchedAddresses: [
          {
            city: 'NEW YORK',
            stateOrProvinceCode: 'NY',
            postalCode: '10001',
            countryCode: 'US',
            residential: false,
            primary: false
          }
        ]
      }
    };

    service.getCitiesByCountryCodeAndPostalCode('US', '10001').subscribe((response: GenericResponse<CityListResponse>) => {
      expect(response.output.totalResults).toBe(1);
      expect(response.output.resultsReturned).toBe(1);
      expect(response.output.matchedAddresses.length).toBe(1);
      expect(response.output.matchedAddresses[0].city).toBe('NEW YORK');
      expect(response.output.matchedAddresses[0].stateOrProvinceCode).toBe('NY');
      expect(response.output.matchedAddresses[0].postalCode).toBe('10001');
      expect(response.output.matchedAddresses[0].countryCode).toBe('US');
      expect(response.output.matchedAddresses[0].residential).toBeFalsy();
      expect(response.output.matchedAddresses[0].primary).toBeFalsy();
    });

    const request = httpMock.expectOne({ method: 'POST' });
    request.flush(mockData);
  });

  fit('should return 404 error response - getCitiesByCountryCodeAndPostalCode()', async(() => {
    const mockResponse = new HttpErrorResponse({
      error: '404 error',
      status: 404, statusText: 'Not Found'
    });

    service.getCitiesByCountryCodeAndPostalCode(null, null).subscribe((response) => {
      expect(response.error).toBeDefined();
    });

    const request = httpMock.expectOne({ method: 'POST' });
    request.flush(mockResponse);
  }));

  fit('getCitiesByCountryCodeAndPostalCode() should able to handle error', async () => {
    service.getCitiesByCountryCodeAndPostalCode('', '').subscribe((response: GenericResponse<CityListResponse>) => {
      expect(response.errors[0].code).toBe('SYSTEM.UNEXPECTED.ERROR');
    });

    const request = httpMock.expectOne({ method: 'POST' });
    request.flush(mockError);
  });

  fit('getCountryDetailsByCountryCode() should return a successful response', async () => {
    const mockData = {
      transactionId: '1e48a7e7-10e2-4361-a2c7-bc76cf6b4d26',
      output: {
        countryName: 'UNITED STATES',
        countryCode: 'US',
        domesticShippingAllowed: true,
        domesticShippingUsesInternationalServices: false,
        maxCustomsValue: 50000,
        numberOfCommercialInvoices: 0,
        postalAware: true,
        regionCode: 'UNITEDSTATES',
        states: [
          {
            code: 'AL',
            name: 'Alabama'
          },
          {
            code: 'AK',
            name: 'Alaska'
          },
          {
            code: 'AZ',
            name: 'Arizona'
          }
        ]
      }
    };

    service.getCountryDetailsByCountryCode('US').subscribe((response: GenericResponse<CountryDetailResponse>) => {
      expect(response.output.countryName).toBe('UNITED STATES');
      expect(response.output.countryCode).toBe('US');
      expect(response.output.domesticShippingAllowed).toBeTruthy();
      expect(response.output.domesticShippingUsesInternationalServices).toBeFalsy();
      expect(response.output.maxCustomsValue).toBe(50000);
      expect(response.output.numberOfCommercialInvoices).toBe(0);
      expect(response.output.postalAware).toBeTruthy();
      expect(response.output.regionCode).toBe('UNITEDSTATES');
      expect(response.output.states.length).toBe(3);
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockData);
  });

  fit('getCountryDetailsByCountryCode() should able to handle error', async () => {
    service.getCountryDetailsByCountryCode('').subscribe((response: GenericResponse<CountryDetailResponse>) => {
      expect(response.errors[0].code).toBe('SYSTEM.UNEXPECTED.ERROR');
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockError);
  });

  fit('should return 404 error response - getCountryDetailsByCountryCode()', async(() => {
    const mockResponse = new HttpErrorResponse({
      error: '404 error',
      status: 404, statusText: 'Not Found'
    });

    service.getCountryDetailsByCountryCode(null).subscribe((response) => {
      expect(response.error).toBeDefined();
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockResponse);
  }));

  fit('getSenderRecipientInfoByCountryCodes() should return a successful response', async () => {
    const mockData = {
      transactionId: 'eb6719b8-8130-4e68-8125-e11f7932b9f5',
      output: {
        packageContentsIndicator: 'REQUIRED',
        taxIdInfo: {
          sender: {
            federal: 'NOTALLOWED',
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
    };

    service.getSenderRecipientInfoByCountryCodes('PH', 'US').subscribe((response: GenericResponse<SenderRecipientInfoResponse>) => {
      expect(response.output.packageContentsIndicator).toBe('REQUIRED');
      expect(response.output.taxIdInfo.sender.federal).toBe('NOTALLOWED');
      expect(response.output.taxIdInfo.sender.state).toBe('NOTALLOWED');
      expect(response.output.taxIdInfo.recipient.federal).toBe('OPTIONAL');
      expect(response.output.taxIdInfo.recipient.state).toBe('NOTALLOWED');
      expect(response.output.customsClearance).toBe('REQUIRED');
      expect(response.output.commercialInvoiceSupport.invoiceNumber).toBe('NOTALLOWED');
      expect(response.output.notaFiscal).toBe('NOTALLOWED');
      expect(response.output.customsValueSupport.customsValue).toBe('REQUIRED');
      expect(response.output.customsValueSupport.notAllowedDocumentDescriptions.length).toBe(1);
      expect(response.output.goodsInFreeCirculation).toBe('NOTALLOWED');
      expect(response.output.itemDescriptionForClearanceIndicator).toBe('NOTALLOWED');
      expect(response.output.documentDescriptionIndicator).toBe('NOTALLOWED');
      expect(response.output.shipmentPurposeIndicator).toBe('REQUIRED');
      expect(response.output.shipmentPurposeForServiceTypeSelectionIndicator).toBe('NOTALLOWED');
      expect(response.output.freightOnValueIndicator).toBe('NOTALLOWED');
      expect(response.output.recipientResidentialIndicator).toBe('NOTALLOWED');
      expect(response.output.deliveryInstructionsIndicator).toBe('NOTALLOWED');
      expect(response.output.notAllowedDeclaredValueDocumentDescriptions.length).toBe(1);
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockData);
  });

  fit('getSenderRecipientInfoByCountryCodes() should able to handle error', async () => {
    service.getSenderRecipientInfoByCountryCodes('', '').subscribe((response: GenericResponse<SenderRecipientInfoResponse>) => {
      expect(response.errors[0].code).toBe('SYSTEM.UNEXPECTED.ERROR');
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockError);
  });

  fit('should return 404 error response - getSenderRecipientInfoByCountryCodes()', async(() => {
    const mockResponse = new HttpErrorResponse({
      error: '404 error',
      status: 404, statusText: 'Not Found'
    });

    service.getSenderRecipientInfoByCountryCodes(null, null).subscribe((response) => {
      expect(response.error).toBeDefined();
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockResponse);
  }));

  fit('getCountries() should return a successful response', async () => {
    const mockData = {
      transactionId: 'e76bc5bc-21b0-4272-90d8-4541d3c322dd',
      output: {
        countries: [
          {
            regionCode: 'EMEA',
            currencyCode: 'USD',
            countryCode: 'AF',
            countryName: 'AFGHANISTAN',
            domesticShippingAllowed: false,
            postalAware: false,
            anyPostalAwareness: false
          },
          {
            regionCode: 'EMEA',
            currencyCode: 'USD',
            countryCode: 'AL',
            countryName: 'ALBANIA',
            domesticShippingAllowed: false,
            postalAware: false,
            anyPostalAwareness: false
          },
          {
            regionCode: 'EMEA',
            currencyCode: 'USD',
            countryCode: 'DZ',
            countryName: 'ALGERIA',
            domesticShippingAllowed: false,
            postalAware: false,
            anyPostalAwareness: false
          }
        ]
      }
    };

    service.getCountries().subscribe((response: GenericResponse<CountryListResponse<Country>>) => {
      expect(response.output.countries.length).toBe(3);
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockData);
  });

  fit('should return 404 error response - getCountries()', async(() => {
    const mockResponse = new HttpErrorResponse({
      error: '404 error',
      status: 404, statusText: 'Not Found'
    });

    service.getCountries().subscribe((response) => {
      expect(response.error).toBeDefined();
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockResponse);
  }));

  fit('getStatesByCountryCode() should return a successful response', async () => {
    const mockData = {
      transactionId: 'e76bc5bc-21b0-4272-90d8-4541d3c322dd',
      output: {
        states: [
          {
            code: 'NY',
            name: 'New York'
          },
          {
            code: 'CA',
            name: 'California'
        }
        ]
      }
    };

    const countryCode = 'US';
    service.getStatesByCountryCode(countryCode).subscribe((response: GenericResponse<StateResponse>) => {
      expect(response.output.states.length).toBeGreaterThan(0);
      expect(response.output.states[0].code).toBe('NY');
      expect(response.output.states[0].name).toBe('New York');
      expect(response.output.states[1].code).toBe('CA');
      expect(response.output.states[1].name).toBe('California');
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockData);
  });

  fit('should return 404 error response - getStatesByCountryCode(...)', async(() => {
    const mockResponse = new HttpErrorResponse({
      error: '404 error',
      status: 404, statusText: 'Not Found'
    });

    service.getStatesByCountryCode(null).subscribe((response) => {
      expect(response.error).toBeDefined();
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockResponse);
  }));
});
