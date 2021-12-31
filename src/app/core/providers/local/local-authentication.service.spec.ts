import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Injector } from '@angular/core';
import { async, getTestBed, TestBed } from '@angular/core/testing';
import { ConfigService } from '@ngx-config/core';
import { OAuthEnum } from 'src/app/types/enum/oauth-enum.enum';
import * as testConfig from '../../../../assets/config/mockConfigForTest';
import { BrowserService } from '../browser.service';
import { LocalAuthenticationService } from './local-authentication.service';

fdescribe('LocalAuthenticationService', () => {
  let service: LocalAuthenticationService;
  let browserService: BrowserService;
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
        LocalAuthenticationService,
        BrowserService
      ]
    });

    injector = getTestBed();
    service = injector.get(LocalAuthenticationService);
    browserService = injector.get(BrowserService);
    httpMock = injector.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  fit('should be created', () => {
    expect(service).toBeTruthy();
  });

  fit('should successfully request for GUEST authorization token', async(() => {
    const mockResponse = {
      tokenType: 'Guest',
      token: 'Basic eyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiJzb2Z0dGVrSldUIiwic3ViIjoibGFiZWxleDEyM0lkIiwiYXV0aG9yaXRpZXMiOlsiQU5PTllNT1VTIl0sImlhdCI6MTYxMjM2NzMyNCwiZXhwIjoxNjEyMzY3OTI0fQ.d1eWsn4ko-dCeLvVRrhAJ08EAavJi-5yQ5dLDCqL32ENg06NJnfjXHlUCTfJSoUfAR8_tLtUMHXV1-2LlfdoLQ'
    };

    service.getAuthenticationToken().subscribe((response) => {
      expect(response.tokenType).toBe(mockResponse.tokenType);
      expect(response.token).toBe(mockResponse.token);
    });

    const reqService = httpMock.expectOne(request => {
      const localApiHost = mockConfig.LOCAL.HOST;
      const authEndpoint = mockConfig.LOCAL.API_ISLAND.authenticate;
      const expectedRequestUrl = [localApiHost, authEndpoint].join('');
      expect(request.url).toBe(expectedRequestUrl);
      return (request.method === 'POST');
    });

    reqService.flush(mockResponse);
  }));

  fit('should fail request for GUEST authorization token', async(() => {
    const mockResponse = {};

    service.getAuthenticationToken().subscribe((response) => {
      expect(response.tokenType).toBeUndefined();
      expect(response.token).toBeUndefined();
    });

    const reqService = httpMock.expectOne(request => {
      const localApiHost = mockConfig.LOCAL.HOST;
      const authEndpoint = mockConfig.LOCAL.API_ISLAND.authenticate;
      const expectedRequestUrl = [localApiHost, authEndpoint].join('');
      expect(request.url).toBe(expectedRequestUrl);
      return (request.method === 'POST');
    });

    reqService.flush(mockResponse);
  }));

  fit('should return 404 error response - getAuthenticationToken()', async(() => {
    const mockResponse = new HttpErrorResponse({
      error: '404 error',
      status: 404, statusText: 'Not Found'
    });

    service.getAuthenticationToken().subscribe((response) => {
      expect(response.token).toBeUndefined();
      expect(response.error).toBeDefined();
    });

    const request = httpMock.expectOne({ method: 'POST' });
    request.flush(mockResponse);
  }));

  fit('should SUCCESSFULLY call Local API oauth thru getLocalAuthToken()', async(() => {
    const mockResponse = {
      tokenType: 'Guest',
      token: 'Basic eyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiJzb2Z0dGVrSldUIiwic3ViIjoibGFiZWxleDEyM0lkIiwiYXV0aG9yaXRpZXMiOlsiQU5PTllNT1VTIl0sImlhdCI6MTYxMjM2NzMyNCwiZXhwIjoxNjEyMzY3OTI0fQ.d1eWsn4ko-dCeLvVRrhAJ08EAavJi-5yQ5dLDCqL32ENg06NJnfjXHlUCTfJSoUfAR8_tLtUMHXV1-2LlfdoLQ'
    };

    browserService.isbrowser = true;
    service.getLocalAuthToken();
    expect(sessionStorage.getItem(OAuthEnum.LOCAL_STORE_KEY)).toBeDefined();

    const reqService = httpMock.expectOne(request => {
      return (request.method === 'POST');
    });
    reqService.flush(mockResponse);
  }));
});
