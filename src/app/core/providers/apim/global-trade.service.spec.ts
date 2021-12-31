import { TestBed, async } from '@angular/core/testing';
import { APIMGlobalTradeService } from './global-trade.service';
import { ConfigModule, ConfigService, ConfigLoader } from '@ngx-config/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import * as testConfig from '../../../../assets/config/mockConfigForTest';
import { configFactory } from 'src/app/app.module';
import { HttpClient } from 'selenium-webdriver/http';
import { HttpErrorResponse } from '@angular/common/http';

const mockConfig = testConfig.config;

fdescribe('APIMGlobalTradeService', () => {
  let service: APIMGlobalTradeService;
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
        APIMGlobalTradeService,
        {
          provide: ConfigService,
          useClass: ConfigServiceStub
        },
      ]
    });

    service = TestBed.inject(APIMGlobalTradeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach((() => {
    httpMock.verify();
  }));

  fit('should be created', async(() => {
    expect(service).toBeTruthy();
  }));

  fit('should return list of currencies - getCurrencies()', async(() => {
    const mockResponse = {
      transactionId: '17d12fc2-d901-40ed-9c7a-a3c45c98982a',
      output: {
        currencies: [
          {
            iataCode: 'HKD',
            isoCode: 'HKD',
            description: 'Hong Kong Dollar',
            symbol: '$'
          },
          {
            iataCode: 'JYE',
            isoCode: 'JPY',
            description: 'Japanese Yen',
            symbol: '¥'
          },
          {
            iataCode: 'PHP',
            isoCode: 'PHP',
            description: 'Philippine Pesos',
            symbol: '₱'
          },
          {
            iataCode: 'SID',
            isoCode: 'SGD',
            description: 'Singapore Dollars',
            symbol: '$'
          },
          {
            iataCode: 'USD',
            isoCode: 'USD',
            description: 'US Dollars',
            symbol: '$'
          }
        ]
      }
    };

    service.getCurrencies().subscribe((response) => {
      expect(response.output.currencies.length).toBeGreaterThanOrEqual(5);
      expect(response.output.currencies[0].description).toBe('Hong Kong Dollar');
      expect(response.output.currencies[1].description).toBe('Japanese Yen');
      expect(response.output.currencies[2].description).toBe('Philippine Pesos');
      expect(response.output.currencies[3].description).toBe('Singapore Dollars');
      expect(response.output.currencies[4].description).toBe('US Dollars');
    });

    const reqService = httpMock.expectOne({ method: 'GET' });
    reqService.flush(mockResponse);
  }));

  fit('should return 404 error response - getCurrencies()', async(() => {
    const mockResponse = new HttpErrorResponse({
      error: '404 error',
      status: 404, statusText: 'Not Found'
    });

    service.getCurrencies().subscribe((response) => {
      expect(response.error).toBeDefined();
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockResponse);
  }));

  fit('should get currency conversion - getCurrencyConversion()', async(() => {
    const mockResponse = {
      transactionId: '883210c0-b495-43c8-988a-7c3ee678c1a2',
      output: {
        amount: [
          {
            finalRoundedAmount: 6451.71,
            finalUnRoundedAmount: 6451.712801,
            conversionFactor: 0.1290342561,
            type: 'WITH_NO_PREMIUM_APPLIED'
          },
          {
            finalRoundedAmount: 6564.62,
            finalUnRoundedAmount: 6564.617775,
            conversionFactor: 0.1312923555,
            ratePercent: 1.01750,
            type: 'PREMIUM_APPLIED'
          }
        ]
      }
    };

    const fromCurrencyCode = 'HK';
    const toCurrencyCode = 'US';
    const amount = 200;
    const conversionDate = '01/01/2020';
    service.getCurrencyConversion(fromCurrencyCode, toCurrencyCode, amount, conversionDate).subscribe((response) => {
      expect(response.output.amount.length).toBeGreaterThanOrEqual(0);
      expect(response.output.amount[0].finalRoundedAmount).toBe(6451.71);
      expect(response.output.amount[0].finalUnRoundedAmount).toBe(6451.712801);
      expect(response.output.amount[0].conversionFactor).toBe(0.1290342561);
      expect(response.output.amount[0].type).toBe('WITH_NO_PREMIUM_APPLIED');
      expect(response.output.amount[1].finalRoundedAmount).toBe(6564.62);
      expect(response.output.amount[1].finalUnRoundedAmount).toBe(6564.617775);
      expect(response.output.amount[1].conversionFactor).toBe(0.1312923555);
      expect(response.output.amount[1].type).toBe('PREMIUM_APPLIED');
    });

    const reqService = httpMock.expectOne({ method: 'GET' });
    reqService.flush(mockResponse);
  }));

  fit('should return 404 error response - getCurrencyConversion(...)', async(() => {
    const mockResponse = new HttpErrorResponse({
      error: '404 error',
      status: 404, statusText: 'Not Found'
    });

    service.getCurrencyConversion(null, null, null, null).subscribe((response) => {
      expect(response.error).toBeDefined();
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockResponse);
  }));
});
