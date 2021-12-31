import { async, TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ConfigModule, ConfigService, ConfigLoader } from '@ngx-config/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GenericResponse } from 'src/app/interfaces/api-service/response/generic-response';
import { configFactory } from '../../../app.module';
import * as testConfig from '../../../../assets/config/mockConfigForTest';
import { ShipmentFeedbackService } from './shipment-feedback.service';
import { ShipmentFeedbackResponse } from 'src/app/interfaces/api-service/response/shipment-feedback-response';

const mockDevConfig = {
  LOCAL: {
    HOST: 'https://apidrt.idev.fedex.com',
    API_ISLAND: {
      shipmentFeedback: '/api/v1/shipment/score'
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

const SHIPMENTFEEDBACK_API = mockDevConfig.LOCAL.API_ISLAND.shipmentFeedback;
const shipmentFeedbackAPI = mockDevConfig.LOCAL.HOST + SHIPMENTFEEDBACK_API;

describe('ShipmentFeedbackService', () => {
  let service: ShipmentFeedbackService;
  let configService: ConfigService;
  let httpMock: HttpTestingController;
  const mockConfig = testConfig.config;
  const mockData = {
    shipmentId: '82365',
    shipmentRefNumber: 'CN1221355799',
    barcodeURI: 'https://wwwdrt.idev.fedex.com/mobileshipping/qrCode?refNumber=CN1221355799'
  };

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
        ShipmentFeedbackService,
        HttpClient,
        { provide: ConfigService, useClass: configServiceStub },
      ]
    });

    configService = TestBed.inject(ConfigService);
    service = TestBed.inject(ShipmentFeedbackService);
    httpMock = TestBed.inject(HttpTestingController);

  });

  afterEach(async () => {
    httpMock.verify();
  });

  fit('should be created', () => {
    expect(service).toBeTruthy();
  });

  fit('should return a successful response', async (done) => {
    const mockResponse = { output: { scoreId: '184737' } };
    const shipmentId = mockData.shipmentId;
    const comment = 'Very good experience';
    const score = '5';
    service.postShipmentFeedback(shipmentId, score, comment).subscribe((response: GenericResponse<ShipmentFeedbackResponse>) => {
      expect((response.output.scoreId).toString()).toEqual('184737');
      done();
    });

    const urlRequest = httpMock.expectOne(shipmentFeedbackAPI);
    urlRequest.flush(mockResponse);
  });

  fit('should able to handle error.', async (done) => {
    const shipmentId = mockData.shipmentId;
    const comment = 'Very good experience';
    const score = '5';
    service.postShipmentFeedback(shipmentId, score, comment).subscribe((response: GenericResponse<ShipmentFeedbackResponse>) => {
      expect(response.errors[0].code).toBe('SYSTEM.UNEXPECTED.ERROR');
      done();
    });

    const urlRequest = httpMock.expectOne(shipmentFeedbackAPI);
    urlRequest.flush(mockError);
  });

  fit('should return 404 error response - postShipmentFeedback(...)', async(() => {
    const mockResponse = new HttpErrorResponse({
      error: '404 error',
      status: 404, statusText: 'Not Found'
    });

    service.postShipmentFeedback(null, null, null).subscribe((response) => {
      expect(response.error).toBeDefined();
    });

    const request = httpMock.expectOne({ method: 'POST' });
    request.flush(mockResponse);
  }));
});