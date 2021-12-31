import { async, TestBed } from "@angular/core/testing";
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CurrencyUomComConfigurationService } from './currency-uom-com-configuration.service';
import { ConfigModule, ConfigService, ConfigLoader } from '@ngx-config/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CurrencyConfigurationResponse } from '../../../interfaces/api-service/response/currency-configuration-response';
import { GenericResponse } from 'src/app/interfaces/api-service/response/generic-response';
import { configFactory } from './../../../app.module';
import * as testConfig from '../../../../assets/config/mockConfigForTest';

const mockDevConfig = {
  LOCAL: {
    HOST: 'https://apidrt.idev.fedex.com',
    API_ISLAND: {
      configList: '/api/v1/config/configlist'
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

const CONFIGURATION_API = mockDevConfig.LOCAL.API_ISLAND;
const configurationAPI = mockDevConfig.LOCAL.HOST + CONFIGURATION_API.configList;

describe('CurrencyUomComConfigurationService', () => {
  let service: CurrencyUomComConfigurationService;
  let configService: ConfigService;
  let httpMock: HttpTestingController;
  const mockConfig = testConfig.config;
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
        CurrencyUomComConfigurationService,
        HttpClient,
        { provide: ConfigService, useClass: configServiceStub },
      ]
    });

    configService = TestBed.inject(ConfigService);
    service = TestBed.inject(CurrencyUomComConfigurationService);
    httpMock = TestBed.inject(HttpTestingController);

  });

  afterEach(async () => {
    httpMock.verify();
  });

  fit('should be created', () => {
    expect(service).toBeTruthy();
  });

  fit('getConfigurationAsPerCountryCodeAndType() should return a successful response', async (done) => {
    const mockData = {
      output: {
        configlist: [{ value: 'USD', seq: '1' }, { value: 'HKD', seq: '2' }, { value: 'EUR', seq: '3' }, { value: 'UKL', seq: '4' }, { value: 'CNY', seq: '5' }]
      }
    };
    const countryCode = 'HK';
    const configType = 'CURRENCY';
    service.getConfigurationAsPerCountryCodeAndType(countryCode, configType).subscribe((response: GenericResponse<CurrencyConfigurationResponse>) => {
      expect(response.output.configlist.length).toBe(5);
      done();
    });

    const urlRequest = httpMock.expectOne(configurationAPI + '?countryCode=HK&type=CURRENCY');
    urlRequest.flush(mockData);
    httpMock.verify()
  });

  fit('getConfigurationAsPerCountryCodeAndType() should able to handle error.', async (done) => {
    const countryCode = 'HK';
    const configType = 'CURRENCY';
    service.getConfigurationAsPerCountryCodeAndType(countryCode, configType).subscribe((response: GenericResponse<CurrencyConfigurationResponse>) => {
      expect(response.errors[0].code).toBe('SYSTEM.UNEXPECTED.ERROR');
      done();
    });

    const urlRequest = httpMock.expectOne(configurationAPI + '?countryCode=HK&type=CURRENCY');
    urlRequest.flush(mockError);
    httpMock.verify()
  });

  fit('should return 404 error response - getConfigurationAsPerCountryCodeAndType()', async(() => {
    const mockResponse = new HttpErrorResponse({
      error: '404 error',
      status: 404, statusText: 'Not Found'
    });

    service.getConfigurationAsPerCountryCodeAndType(null, null).subscribe((response) => {
      expect(response.error).toBeDefined();
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockResponse);
  }));
});