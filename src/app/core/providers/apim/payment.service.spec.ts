import { async, TestBed } from '@angular/core/testing';
import { APIMPaymentService } from './payment.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ConfigModule, ConfigService, ConfigLoader } from '@ngx-config/core';
import * as testConfig from '../../../../assets/config/mockConfigForTest';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { configFactory } from 'src/app/app.module';
import { GenericResponse } from 'src/app/interfaces/api-service/response/generic-response';
import { KeyTextList } from 'src/app/interfaces/api-service/common/key-text-list';

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

fdescribe('APIMPaymentService', () => {
  let service: APIMPaymentService;
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
        APIMPaymentService,
        HttpClient,
        {
          provide: ConfigService,
          useClass: ConfigServiceStub
        },
      ]
    });

    service = TestBed.inject(APIMPaymentService);
    httpMock = TestBed.inject(HttpTestingController);

  });

  afterEach(async () => {
    httpMock.verify();
  });

  fit('should be created', () => {
    expect(service).toBeTruthy();
  });

  fit('getPaymentTypesByCountryCodesAndServiceType() should return a successful response', async () => {
    const mockData = {
      transactionId: '130fceeb-cc10-4953-babc-c0061a987dbb',
      output: {
        keyTexts: [
          {
            key: 'SENDER',
            displayText: 'My account'
          },
          {
            key: 'RECIPIENT',
            displayText: 'Recipient'
          },
          {
            key: 'THIRD_PARTY',
            displayText: 'Third Party '
          }
        ]
      }
    };

    const reason = 'DUTIESTAXES';
    const serviceType = 'INTERNATIONAL_PRIORITY';
    const senderCountryCode = 'US';
    const recipientCountryCode = 'CA';

    service.getPaymentTypesByCountryCodesAndServiceType(reason, serviceType, senderCountryCode, recipientCountryCode)
      .subscribe((response: GenericResponse<KeyTextList>) => {
        expect(response.output.keyTexts.length).toBe(3);
      });

    const request = httpMock.expectOne({ method: 'GET' });

    request.flush(mockData);
  });

  fit('getPaymentTypesByCountryCodesAndServiceType() should able to handle error', async () => {
    const reason = '';
    const serviceType = '';
    const senderCountryCode = '';
    const recipientCountryCode = '';

    service.getPaymentTypesByCountryCodesAndServiceType(reason, serviceType, senderCountryCode, recipientCountryCode)
      .subscribe((response: GenericResponse<KeyTextList>) => {
        expect(response.errors[0].code).toBe('SYSTEM.UNEXPECTED.ERROR');
      });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockError);
  });

  fit('should return 404 error response - getPaymentTypesByCountryCodesAndServiceType()', async(() => {
    const mockResponse = new HttpErrorResponse({
      error: '404 error',
      status: 404, statusText: 'Not Found'
    });

    service.getPaymentTypesByCountryCodesAndServiceType(null, null, null, null).subscribe((response) => {
      expect(response.error).toBeDefined();
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockResponse);
  }));
});
