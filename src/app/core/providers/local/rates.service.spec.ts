import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Injector } from '@angular/core';
import { async, getTestBed, TestBed } from '@angular/core/testing';
import { configFactory, ConfigLoader, ConfigModule, ConfigService } from '@ngx-config/core';
import { LocalRatesService } from './rates.service';
import * as testConfig from '../../../../assets/config/mockConfigForTest';
import { BrowserService } from '../browser.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

fdescribe('LocalRatesService', () => {
  let service: LocalRatesService;
  let httpMock: HttpTestingController;
  let injector: Injector;

  const mockConfig = testConfig.config;
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
        LocalRatesService,
        BrowserService,
        {
          provide: ConfigService,
          useClass: configServiceStub
        }
      ]
    });

    injector = getTestBed();
    service = injector.get(LocalRatesService);
    httpMock = injector.get(HttpTestingController);
  });

  afterEach((() => {
    httpMock.verify();
  }));

  fit('should be created', () => {
    expect(service).toBeTruthy();
  });

  fit('should return a successful service response', async(() => {
    const mockResponse = {
      configlist: [
        {
          value: '30',
          seq: '1'
        }
      ]
    }

    service.getRatesDiscountByCountry('CN').subscribe((response) => {
      expect(response.configlist).toBeDefined();
      expect(response.configlist.length).toEqual(1);
    });

    const reqService = httpMock.expectOne(request => {
      const expectedReqUrl = mockConfig.LOCAL.HOST
        .concat(mockConfig.LOCAL.API_ISLAND.configList)
        .concat(`?type=DISCOUNT&countryCode=CN`);
      expect(expectedReqUrl).toBe(request.url);
      return (request.method === 'GET');
    });
    reqService.flush(mockResponse);
  }));

  fit('should return 404 error response - getRatesDiscountByCountry()', async(() => {
    const mockResponse = new HttpErrorResponse({
      error: '404 error',
      status: 404, statusText: 'Not Found'
    });

    service.getRatesDiscountByCountry(null).subscribe((response) => {
      expect(response.error).toBeDefined();
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockResponse);
  }));
});
