import { async, TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ConfigModule, ConfigService, ConfigLoader } from '@ngx-config/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { configFactory } from '../../../app.module';
import * as testConfig from '../../../../assets/config/mockConfigForTest';
import { P4eOtpService } from './p4e-otp.service';
import { OtpRequestConstants } from '../../../types/constants/otp-request.constants';
import { GenericOtpResponse } from '../../../interfaces/api-service/response/generic-otp-response';
import { AccountType } from 'src/app/types/enum/account-type.enum';
import { SessionItems } from 'src/app/types/enum/session-items.enum';
import { HttpHeaderKey } from 'src/app/types/enum/http-header-key.enum';

const mockConfig = testConfig.config;    

describe('P4eOtpService', () => {
  let configService: ConfigService;
  let httpMock: HttpTestingController;
  const mockConfig = testConfig.config;
  let service: P4eOtpService;
  const localApiIsland = mockConfig.LOCAL.API_ISLAND;
  const generateOtpAPI = mockConfig.LOCAL.HOST + localApiIsland.generateOtp;
  const validateOtpAPI = mockConfig.LOCAL.HOST + localApiIsland.validateOtp;

  class configServiceStub {
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
        P4eOtpService,
        HttpClient,
        { provide: ConfigService, useClass: configServiceStub },
      ]
    });

    service = TestBed.inject(P4eOtpService);
    configService = TestBed.inject(ConfigService);
    httpMock = TestBed.inject(HttpTestingController);

  });

  afterEach(async () => {
    httpMock.verify();
    sessionStorage.clear();
  });

  fit('should be created', () => {
    expect(service).toBeTruthy();
  });

  fit('should return a successful response', async (done) => {
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'HK');
    sessionStorage.setItem(SessionItems.DIALINGPREFIX, '+852');
    const mockResponse = {
      txId: 'tgvNn1plq75wYfPkhNKJMZfcid8rJd9b',
      authType: 'SMS',
      otpPhoneDeliveryRes: {
        contact: '85298403275',
        sendStatus: 'SUCCESS',
        sendTime: '2021-03-15 11:17:33 GMT',
        otpExpiry: 90
      },
      otpEmailDeliveryRes: null,
      status: 'SUCCESS',
      message: 'OTP sent successfully'
    };

    service.generateOtp('85298403275', 'HK').subscribe((response: GenericOtpResponse) => {
      expect((response.otpPhoneDeliveryRes.sendStatus).toString()).toEqual(OtpRequestConstants.SUCCESS);
      done();
    });

    const urlRequest = httpMock.expectOne(generateOtpAPI);
    urlRequest.flush(mockResponse);
  });

  fit('should return a successful response when billing and options changed', async (done) => {
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'HK');
    sessionStorage.setItem(SessionItems.DIALINGPREFIX, '+852');
    sessionStorage.setItem(SessionItems.ISFROMSUMMARY, 'true');
    const mockResponse = {
      txId: 'tgvNn1plq75wYfPkhNKJMZfcid8rJd9b',
      authType: 'SMS',
      otpPhoneDeliveryRes: {
        contact: '85298403275',
        sendStatus: 'SUCCESS',
        sendTime: '2021-03-15 11:17:33 GMT',
        otpExpiry: 90
      },
      otpEmailDeliveryRes: null,
      status: 'SUCCESS',
      message: 'OTP sent successfully'
    };

    service.generateOtp('85298403275', 'HK').subscribe((response: GenericOtpResponse) => {
      expect((response.otpPhoneDeliveryRes.sendStatus).toString()).toEqual(OtpRequestConstants.SUCCESS);
      done();
    });

    const urlRequest = httpMock.expectOne(generateOtpAPI);
    urlRequest.flush(mockResponse);
  });

  fit('should return 404 error response - generateOtp()', async(() => {
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'HK');
    sessionStorage.setItem(SessionItems.DIALINGPREFIX, '+852');
    const mockResponse = new HttpErrorResponse({
      error: '404 error',
      status: 404, statusText: 'Not Found'
    });

    service.generateOtp('85298403275', 'HK').subscribe((response) => {
      expect(response.error).toBeDefined();
    });

    const request = httpMock.expectOne({ method: 'POST' });
    request.flush(mockResponse);
  }));

  fit('should return a successful response for validateOtp()', async (done) => {
    sessionStorage.setItem(HttpHeaderKey.TX_ID, 'tgvNn1plq75wYfPkhNKJMZfcid8rJd9b');
    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'HK');
    sessionStorage.setItem(SessionItems.DIALINGPREFIX, '+852');
    const mockResponse = {
      txId: 'tgvNn1plq75wYfPkhNKJMZfcid8rJd9b',
      authType: 'SMS',
      otpPhoneDeliveryRes: {
        contact: '85298403275',
        sendStatus: 'SUCCESS',
        sendTime: '2021-03-15 11:17:33 GMT',
        otpExpiry: 90
      },
      otpEmailDeliveryRes: null,
      status: 'SUCCESS',
      message: 'OTP validated successfully'
    };

    service.validateOtp('85298403275').subscribe((response: GenericOtpResponse) => {
      expect((response.otpPhoneDeliveryRes.sendStatus).toString()).toEqual(OtpRequestConstants.SUCCESS);
      done();
    });

    const urlRequest = httpMock.expectOne(validateOtpAPI);
    urlRequest.flush(mockResponse);
  });

  fit('should return a successful response for validateOtp() when billing and option changed', async (done) => {
    sessionStorage.setItem(HttpHeaderKey.TX_ID, 'tgvNn1plq75wYfPkhNKJMZfcid8rJd9b');
    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'HK');
    sessionStorage.setItem(SessionItems.DIALINGPREFIX, '+852');
    sessionStorage.setItem(SessionItems.ISFROMSUMMARY, 'true');
    const mockResponse = {
      txId: 'tgvNn1plq75wYfPkhNKJMZfcid8rJd9b',
      authType: 'SMS',
      otpPhoneDeliveryRes: {
        contact: '85298403275',
        sendStatus: 'SUCCESS',
        sendTime: '2021-03-15 11:17:33 GMT',
        otpExpiry: 90
      },
      otpEmailDeliveryRes: null,
      status: 'SUCCESS',
      message: 'OTP validated successfully'
    };

    service.validateOtp('85298403275').subscribe((response: GenericOtpResponse) => {
      expect((response.otpPhoneDeliveryRes.sendStatus).toString()).toEqual(OtpRequestConstants.SUCCESS);
      done();
    });

    const urlRequest = httpMock.expectOne(validateOtpAPI);
    urlRequest.flush(mockResponse);
  });

  fit('should return 404 error response - validateOtp()', async(() => {
    sessionStorage.setItem(HttpHeaderKey.TX_ID, 'tgvNn1plq75wYfPkhNKJMZfcid8rJd9b');
    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'HK');
    sessionStorage.setItem(SessionItems.DIALINGPREFIX, '+852');
    const mockResponse = new HttpErrorResponse({
      error: '404 error',
      status: 404, statusText: 'Not Found'
    });

    service.validateOtp('85298403275').subscribe((response) => {
      expect(response.error).toBeDefined();
    });

    const request = httpMock.expectOne({ method: 'POST' });
    request.flush(mockResponse);
  }));

  fit('should return a successful response for getUserProfileDetails()', async (done) => {   
    const mockResponse = {
     uid: '1234567'
    };

    service.getUserProfileDetails('85298403275').subscribe((response: any) => {
      expect((response.uid)).toEqual('1234567');
      done();
    });

    const urlRequest = httpMock.expectOne({ method: 'GET' });
    urlRequest.flush(mockResponse);
  });

  fit('should return 404 error response - validateOtp()', async(() => {   
    const mockResponse = new HttpErrorResponse({
      error: '404 error',
      status: 404, statusText: 'Not Found'
    });

    service.getUserProfileDetails('85298403275').subscribe((response) => {
      expect(response.error).toBeDefined();
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockResponse);
  }));
});