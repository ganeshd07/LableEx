import { TestBed, async } from '@angular/core/testing';
import { APIMCommodityService } from './commodity.service';
import { ConfigModule, ConfigService, ConfigLoader } from '@ngx-config/core';
import * as testConfig from '../../../../assets/config/mockConfigForTest';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DatePipe } from '@angular/common';
import { configFactory } from 'src/app/app.module';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

const mockConfig = testConfig.config;

fdescribe('APIMCommodityService', () => {
  let service: APIMCommodityService;
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
        APIMCommodityService,
        DatePipe,
        {
          provide: ConfigService,
          useClass: ConfigServiceStub
        }
      ]
    });

    service = TestBed.inject(APIMCommodityService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach((() => {
    httpMock.verify();
  }));

  fit('should be created', async(() => {
    expect(service).toBeTruthy();
  }));

  fit('should return VALID commodity description - validateCommodityDescription(...)', async(() => {
    const mockResponse = {
      transactionId: '27b2c5c1-f653-484c-83d0-d1fe28ff70c5',
      output: {
        valid: true
      }
    };

    service.validateCommodityDescription('book').subscribe((response) => {
      expect(response.output.valid).toBe(true);
    });

    const reqService = httpMock.expectOne(request => {
      return (request.method === 'POST');
    });
    reqService.flush(mockResponse);
  }));

  fit('should return 404 error response - validateCommodityDescription()', async(() => {
    const mockResponse = new HttpErrorResponse({
      error: '404 error',
      status: 404, statusText: 'Not Found'
    });

    service.validateCommodityDescription(null).subscribe((response) => {
      expect(response.error).toBeDefined();
    });

    const request = httpMock.expectOne({ method: 'POST' });
    request.flush(mockResponse);
  }));

  fit('should return INVALID commodity description - validateCommodityDescription(...)', async(() => {
    const mockResponse = {
      transactionId: '27b2c5c1-f653-484c-83d0-d1fe28ff70c5',
      output: {
        valid: false
      }
    };

    service.validateCommodityDescription('$@4rwer').subscribe((response) => {
      expect(response.output.valid).toBe(false);
    });

    const reqService = httpMock.expectOne(request => {
      return (request.method === 'POST');
    });

    reqService.flush(mockResponse);
  }));

  fit('should get unit of measures - fetchUnitOfMeasures()', async(() => {
    const mockResponse = {
      transactionId: '1f8c1d55-f38f-4a24-906c-426478ccd6bb',
      output: {
        keyTexts: [
          {
            key: 'PCS',
            displayText: 'pieces'
          },
          {
            key: 'CM',
            displayText: 'centimeters'
          }, {
            key: 'G',
            displayText: 'grams'
          }
        ]
      }
    };

    service.fetchUnitOfMeasures().subscribe((response) => {
      expect(response.output).toBeDefined();
      expect(response.output.keyTexts.length).toBeGreaterThan(0);
      expect(response.output.keyTexts[0].key).toBe('PCS');
      expect(response.output.keyTexts[0].displayText).toBe('pieces');
      expect(response.output.keyTexts[1].key).toBe('CM');
      expect(response.output.keyTexts[1].displayText).toBe('centimeters');
      expect(response.output.keyTexts[2].key).toBe('G');
      expect(response.output.keyTexts[2].displayText).toBe('grams');
    });

    const reqService = httpMock.expectOne(request => {
      return (request.method === 'GET');
    });

    reqService.flush(mockResponse);
  }));

  fit('should return 404 error response - fetchUnitOfMeasures()', async(() => {
    const mockResponse = new HttpErrorResponse({
      error: '404 error',
      status: 404, statusText: 'Not Found'
    });

    service.fetchUnitOfMeasures().subscribe((response) => {
      expect(response.error).toBeDefined();
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockResponse);
  }));
});
