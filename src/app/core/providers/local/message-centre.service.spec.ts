import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ConfigModule, ConfigService, ConfigLoader } from '@ngx-config/core';
import * as testConfig from '../../../../assets/config/mockConfigForTest';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { configFactory } from 'src/app/app.module';
import { MessageCentreService } from './message-centre.service';
import { MessageCentreResponse } from 'src/app/interfaces/api-service/response/message-centre-response.interface';

const mockConfig = testConfig.config;

const mockMessageCentreServiceResponse: MessageCentreResponse[] = [
  {
    messageId: 100140,
    category: 'SPECIAL_OFFER',
    countryCode: 'HK',
    endDate: 'Mar-26-2022 23:59',
    pin: true,
    startDate: 'Mar-23-2021 00:00',
    messageDescs: [
      {
        messageDescId: 100181,
        description: 'Test',
        locale: 'en_hk',
        title: 'Test'
      }
    ]
  },
  {
      messageId: 100081,
      category: 'NEWS',
      countryCode: 'HK',
      endDate: 'Mar-22-2022 00:00',
      pin: true,
      startDate: 'Mar-10-2021 00:00',
      isExpanded: true,
      messageDescs: [
          {
              messageDescId: 100080,
              description: 'Update update Update update',
              locale: 'en_hk',
              title: 'Update update Update update'
          }
      ]
  }
];

fdescribe('MessageCentreService', () => {
  let service: MessageCentreService;
  let httpMock: HttpTestingController;
  const countryCode = 'HK';
  const language = 'en_hk';
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
        MessageCentreService,
        HttpClient,
        {
          provide: ConfigService,
          useClass: ConfigServiceStub
        },
      ]
    });

    service = TestBed.inject(MessageCentreService);
    httpMock = TestBed.inject(HttpTestingController);

  });

  afterEach(async () => {
    httpMock.verify();
  });

  fit('should be created', () => {
    expect(service).toBeTruthy();
  });

  fit('getMessageCentreList() should return a successful response', async () => {
    service.getMessageCentreList(countryCode, language)
      .subscribe((response: MessageCentreResponse[]) => {
        expect(response.length).toEqual(2);
        expect(response[0].messageId).toEqual(100140);
        expect(response[0].countryCode).toEqual(countryCode);
        expect(response[0].messageDescs.length).toEqual(1);
        expect(response[0].messageDescs[0].messageDescId).toEqual(100181);
        expect(response[0].messageDescs[0].locale).toEqual(language);

        expect(response[1].messageId).toEqual(100081);
        expect(response[1].countryCode).toEqual(countryCode);
        expect(response[1].messageDescs.length).toEqual(1);
        expect(response[1].messageDescs[0].messageDescId).toEqual(100080);
        expect(response[1].messageDescs[0].locale).toEqual(language);
      });

    const request = httpMock.expectOne({ method: 'GET' });

    request.flush(mockMessageCentreServiceResponse);
  });

  fit('should return 404 for getMessageCentreList()', async () => {
    const mockErrorResponse = new HttpErrorResponse({
      error: '404 error',
      status: 404,
      statusText: 'Not Found'
    });

    service.getMessageCentreList(countryCode, language).subscribe(() => {
    }, error => {
      expect(error.error).toBe('404 error');
      expect(error.status).toBe(404);
      expect(error.statusText).toBe('Not Found');
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockErrorResponse);
  });
});
