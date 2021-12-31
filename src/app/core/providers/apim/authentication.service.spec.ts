import { TestBed, async, getTestBed } from '@angular/core/testing';
import { AuthenticationService } from './authentication.service';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { ConfigService } from '@ngx-config/core';
import { Injector } from '@angular/core';
import { BrowserService } from '../browser.service';
import * as testConfig from '../../../../assets/config/mockConfigForTest';
import { OAuthResponse } from 'src/app/interfaces/api-service/response/oauth-response';
import { OAuthEnum } from 'src/app/types/enum/oauth-enum.enum';
import { HttpErrorResponse } from '@angular/common/http';

fdescribe('AuthenticationService', () => {
  let service: AuthenticationService;
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
        AuthenticationService,
        BrowserService
      ]
    });

    injector = getTestBed();
    service = injector.get(AuthenticationService);
    browserService = injector.get(BrowserService);
    httpMock = injector.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  fit('should be created', async(() => {
    expect(service).toBeTruthy();
  }));

  fit('should SUCCESSFULLY acquire Authorization - getOAuthToken()', async(() => {
    const mockResponse = {
      access_token: 'l7xx8659261c4bca4878b43cc7b367a0e1ec',
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'oob'
    };

    service.getOAuthToken().subscribe((response) => {
      expect(response.access_token).toBe(mockConfig.APIM.OAUTH_CREDENTIALS.clientId);
      expect(response.error).toBeUndefined();
    });

    const reqService = httpMock.expectOne(request => {
      return (request.method === 'POST');
    });
    reqService.flush(mockResponse);
  }));

  fit('should FAIL to acquire Authorization - getOAuthToken()', async(() => {
    const mockResponse = {
      error: 'invalid_client',
      error_description: 'The given client credentials were not valid'
    };

    service.getOAuthToken().subscribe((response) => {
      expect(response.access_token).toBeUndefined();
      expect(response.error).toBeDefined();
    });

    const reqService = httpMock.expectOne(request => {
      const expectedRequestUrl = mockConfig.APIM.HOST.concat(mockConfig.APIM.AUTH_ISLAND_API.token);
      expect(expectedRequestUrl).toEqual(request.url);
      return (request.method === 'POST');
    });
    reqService.flush(mockResponse);
  }));

  fit('should throw an http error 404 - getOAuthToken()', async(() => {
    const mockResponse = new HttpErrorResponse({
      error: '404 error',
      status: 404, statusText: 'Not Found'
    });

    service.getOAuthToken().subscribe((response) => {
      expect(response.access_token).toBeUndefined();
      expect(response.error).toBeDefined();
    });

    const reqService = httpMock.expectOne(request => {
      const expectedRequestUrl = mockConfig.APIM.HOST.concat(mockConfig.APIM.AUTH_ISLAND_API.token);
      expect(expectedRequestUrl).toEqual(request.url);
      return (request.method === 'POST');
    });
    reqService.flush(mockResponse);
  }));

  fit('should NOT save the token in session storage if non-browser', () => {
    const oauthResponse: OAuthResponse = {
      access_token: 'l7xx8659261c4bca4878b43cc7b367a0e1ec',
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'oob'
    }
    browserService.isbrowser = false;
    service.saveToken(oauthResponse);
    expect(sessionStorage.getItem(OAuthEnum.STORE_KEY)).toBeNull();
  });

  fit('should be able to save the token in session storage', () => {
    const oauthResponse: OAuthResponse = {
      access_token: 'l7xx8659261c4bca4878b43cc7b367a0e1ec',
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'oob'
    }
    sessionStorage.setItem(OAuthEnum.STORE_KEY, JSON.stringify({
      token: btoa('l7xx8659261c4bca4878b43cc7b367a0e1ec'),
      expiry: 3600
    }));
    browserService.isbrowser = true;
    service.saveToken(oauthResponse);
    expect(sessionStorage.getItem(OAuthEnum.STORE_KEY)).toBeDefined();
  });

  fit('should SUCCESSFULLY call oauth thru getAccessToke()', async(() => {
    const mockResponse = {
      access_token: 'l7xx8659261c4bca4878b43cc7b367a0e1ec',
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'oob'
    };

    browserService.isbrowser = true;
    service.getAccessToken();
    expect(sessionStorage.getItem(OAuthEnum.STORE_KEY)).toBeDefined();

    const reqService = httpMock.expectOne(request => {
      return (request.method === 'POST');
    });
    reqService.flush(mockResponse);
  }));
});
