import { async, TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { ConfigModule, ConfigService, ConfigLoader } from '@ngx-config/core';
import { PaymentService } from './payment.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { configFactory } from '../../../app.module';
import * as testConfig from '../../../../assets/config/mockConfigForTest';
import { BillingOptionsUtil } from 'src/app/types/constants/billing-and-service-options.constants';
import { GenericResponse } from 'src/app/interfaces/api-service/response/generic-response';
import { ApiResponse } from 'src/app/interfaces/api-service/response/api-response';

const mockDevConfig = {
  LOCAL: {
    HOST: 'https://apidrt.idev.fedex.com',
    API_ISLAND: {
      authenticate: '/api/v1/authenticate',
      configList: '/api/v1/config/configlist',
      createShipment: '/api/v1/shipment/create',
      shipmentFeedback: '/api/v1/shipment/score',
      generateOtp: '/api/v1/otp/generate',
      validateOtp: '/api/v1/otp/validate'
    }
  }
};

const mockError = {
  transactionId: 'fed46156-54ce-4220-967b-0edaf185efbb',
  error: 'SYSTEM.UNEXPECTED.ERROR',
};

describe('PaymentService', () => {
  let configService: ConfigService;
  let httpMock: HttpTestingController;
  const mockConfig = testConfig.config;
  let service: PaymentService;
  const configListAPI = (mockDevConfig.LOCAL.HOST) + (mockDevConfig.LOCAL.API_ISLAND.configList);

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
        PaymentService,
        HttpClient,
        { provide: ConfigService, useClass: configServiceStub },
      ]
    });
    service = TestBed.inject(PaymentService);
    configService = TestBed.inject(ConfigService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(async () => {
    httpMock.verify();
  });

  fit('should be created', () => {
    expect(service).toBeTruthy();
  });

  fit('should return a successful response', () => {
    const mockResponse = {
        configlist: [
          {
            "value": 'T',
            "seq": 1
          }
        ]
    };

    service.getconfigList('HK', BillingOptionsUtil.ACCOUNT_BILLING).subscribe((response: ApiResponse) => {
      expect(response.configlist[0].seq).toEqual(1);
    });

    const urlRequest = httpMock.expectOne('https://apidrt.idev.fedex.com/api/v1/config/configlist?countryCode=HK&type=ACCOUNT_BILLING');
    urlRequest.flush(mockResponse);
  });

  fit('getconfigList should able to handle error', async () => {
    const addressType = '';

    service.getconfigList(null, null).subscribe((response: ApiResponse) => {
      expect(response.error).toBe('SYSTEM.UNEXPECTED.ERROR');
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockError);
  });

  fit('should return 404 error response - getconfigList()', async(() => {
    const mockResponse = new HttpErrorResponse({
      error: '404 error',
      status: 404, statusText: 'Not Found'
    });

    service.getconfigList(null, null).subscribe((response: ApiResponse) => {
      expect(response.error).toBeDefined();
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockResponse);
  }));
});
