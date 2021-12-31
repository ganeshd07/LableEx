import { async, TestBed } from '@angular/core/testing';
import { APIMNotificationService } from './notification.service';
import { ConfigModule, ConfigService, ConfigLoader } from '@ngx-config/core';
import * as testConfig from '../../../../assets/config/mockConfigForTest';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { configFactory } from 'src/app/app.module';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

const mockConfig = testConfig.config;

fdescribe('APIMNotificationService', () => {
  let service: APIMNotificationService;
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
        APIMNotificationService,
        {
          provide: ConfigService,
          useClass: ConfigServiceStub
        }
      ]
    });

    service = TestBed.inject(APIMNotificationService);
    httpMock = TestBed.inject(HttpTestingController);

  });

  afterEach(async () => {
    httpMock.verify();
  });

  fit('should be created', () => {
    expect(service).toBeTruthy();
  });

  fit('getEmailLanguages()', async () => {
    const mockData = {
      transactionId: '453602b6-8402-40d2-b495-ca291321f00a',
      output: {
        keyTexts: [
          {
            key: 'en',
            displayText: 'English'
          },
          {
            key: 'zh_CN',
            displayText: 'Chinese (Simplified)'
          },
          {
            key: 'zh_TW',
            displayText: 'Chinese (Traditional)'
          },
          {
            key: 'ja',
            displayText: 'Japanese'
          }
        ]
      }
    };

    service.getEmailLanguages().subscribe((response: any) => {
      expect(response.output).toBeDefined();
      expect(response.output.keyTexts.length).toBeGreaterThanOrEqual(1);
      expect(response.output.keyTexts[0].key).toEqual('en');
      expect(response.output.keyTexts[0].displayText).toEqual('English');
      expect(response.output.keyTexts[1].key).toEqual('zh_CN');
      expect(response.output.keyTexts[1].displayText).toEqual('Chinese (Simplified)');
      expect(response.output.keyTexts[2].key).toEqual('zh_TW');
      expect(response.output.keyTexts[2].displayText).toEqual('Chinese (Traditional)');
      expect(response.output.keyTexts[3].key).toEqual('ja');
      expect(response.output.keyTexts[3].displayText).toEqual('Japanese');
    });

    const request = httpMock.expectOne({ method: 'GET' });

    request.flush(mockData);
  });

  fit('should test getEmailLanguages() with empty values', async () => {
    const mockData = {
      transactionId: '453602b6-8402-40d2-b495-ca291321f00a',
      output: {}
    };

    service.getEmailLanguages().subscribe((response: any) => {
      expect(response.transactionId).toBeDefined();
      expect(response.output).toEqual({});
    });

    const request = httpMock.expectOne({ method: 'GET' });

    request.flush(mockData);
  });

  fit('should return 404 error response - getEmailLanguages()', async(() => {
    const mockResponse = new HttpErrorResponse({
      error: '404 error',
      status: 404, statusText: 'Not Found'
    });

    service.getEmailLanguages().subscribe((response) => {
      expect(response.error).toBeDefined();
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockResponse);
  }));
});
