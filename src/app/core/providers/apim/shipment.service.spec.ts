import { async, getTestBed, TestBed } from '@angular/core/testing';
import { APIMShipmentService } from './shipment.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ConfigService } from '@ngx-config/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import * as testConfig from '../../../../assets/config/mockConfigForTest';
import { Injector } from '@angular/core';
import { GenericResponse } from 'src/app/interfaces/api-service/response/generic-response';
import { KeyTextList } from 'src/app/interfaces/api-service/common/key-text-list';

fdescribe('APIMShipmentService', () => {
  let service: APIMShipmentService;
  let injector: Injector;
  let httpMock: HttpTestingController;

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
        HttpClientTestingModule
      ],
      providers: [
        { provide: ConfigService, useClass: configServiceStub },
        APIMShipmentService,
        HttpClient,
        {
          provide: ConfigService,
          useClass: ConfigServiceStub
        }
      ]
    });

    injector = getTestBed();
    service = injector.get(APIMShipmentService);
    httpMock = injector.get(HttpTestingController);
  });

  fit('should be created', () => {
    expect(service).toBeTruthy();
  });

  fit('getDocumentDescriptionByCountryCodes() should return a successful response', async () => {
    let senderCountryCode: string = 'CA';
    let recipientCountryCode: string = 'US'
    let setAdvanced: boolean = false;

    service.getDocumentDescriptionByCountryCodes(senderCountryCode, recipientCountryCode, setAdvanced)
      .subscribe((response: GenericResponse<KeyTextList>) => {
        expect(response.output.keyTexts.length).toBe(4);
      });
  });

  fit('getDocumentDescriptionByCountryCodes() should able to handle error', async () => {
    let senderCountryCode: string = '';
    let recipientCountryCode: string = 'US'
    let setAdvanced: boolean = false;

    service.getDocumentDescriptionByCountryCodes(senderCountryCode, recipientCountryCode, setAdvanced).subscribe((response: GenericResponse<KeyTextList>) => {
      expect(response.errors[0].code).toBe('SYSTEM.UNEXPECTED.ERROR');
    });
  });

  fit('should return 404 error response - getDocumentDescriptionByCountryCodes()', async(() => {
    const mockResponse = new HttpErrorResponse({
      error: '404 error',
      status: 404, statusText: 'Not Found'
    });

    service.getDocumentDescriptionByCountryCodes(null, null, null).subscribe((response) => {
      expect(response.error).toBeDefined();
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockResponse);
  }));
  
  fit('getDocumentDescriptionByCountryCodes() should able to handle error country code not found', async () => {
    let senderCountryCode: string = '';
    let recipientCountryCode: string = ''
    let setAdvanced: boolean = false;

    service.getDocumentDescriptionByCountryCodes(senderCountryCode, recipientCountryCode, setAdvanced).subscribe((response: GenericResponse<KeyTextList>) => {
      expect(response.errors[0].code).toBe('SENDER.COUNTRYCODE.NOTFOUND');
    });
  });

  fit('getShipmentPurposeByCountryCodesAndServiceType() should return a successful response', async () => {
    let senderCountryCode = 'JP';
    let recipientCountryCode = 'US';
    let serviceType = 'INTERNATIONAL_PRIORITY';

    service.getShipmentPurposeByCountryCodesAndServiceType(senderCountryCode, recipientCountryCode, serviceType)
      .subscribe((response: GenericResponse<KeyTextList>) => {
        expect(response.output.keyTexts.length).toBe(6);
      });
  });

  fit('getShipmentPurposeByCountryCodesAndServiceType() should able to handle error', async () => {
    let senderCountryCode = '';
    let recipientCountryCode = '';
    let serviceType = '';

    service.getShipmentPurposeByCountryCodesAndServiceType(senderCountryCode, recipientCountryCode, serviceType).subscribe((response: GenericResponse<KeyTextList>) => {
      expect(response.errors[0].code).toBe('SYSTEM.UNEXPECTED.ERROR');
    });
  });

  fit('getShipmentPurposeByCountryCodesAndServiceType() should able to handle error invalid service type', async () => {
    let senderCountryCode = 'JP';
    let recipientCountryCode = 'US';
    let serviceType = 'INVALID';

    service.getShipmentPurposeByCountryCodesAndServiceType(senderCountryCode, recipientCountryCode, serviceType).subscribe((response: GenericResponse<KeyTextList>) => {
      expect(response.errors[0].code).toBe('INVALID.SERVICE.TYPE');
    });
  });

  fit('getShipmentPurposeByCountryCodesAndServiceType() should able to handle error country code not found', async () => {
    let senderCountryCode = 'JP';
    let recipientCountryCode = 'US';
    let serviceType = 'INVALID';

    service.getShipmentPurposeByCountryCodesAndServiceType(senderCountryCode, recipientCountryCode, serviceType).subscribe((response: GenericResponse<KeyTextList>) => {
      expect(response.errors[0].code).toBe('SHIPPING.RECIPIENTCOUNTRYCODE.NOTFOUND');
    });
  });

  fit('should return 404 error response - getShipmentPurposeByCountryCodesAndServiceType()', async(() => {
    const mockResponse = new HttpErrorResponse({
      error: '404 error',
      status: 404, statusText: 'Not Found'
    });

    service.getShipmentPurposeByCountryCodesAndServiceType(null, null, null).subscribe((response) => {
      expect(response.error).toBeDefined();
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockResponse);
  }));
});
