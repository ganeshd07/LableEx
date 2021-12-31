import { TestBed, getTestBed, async } from '@angular/core/testing';
import { LocalCommodityService } from './commodity.service';
import { ConfigService } from '@ngx-config/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BrowserService } from '../browser.service';
import { Injector } from '@angular/core';
import * as testConfig from '../../../../assets/config/mockConfigForTest';
import { CommodityManufactureResponse } from 'src/app/interfaces/api-service/response/commodity-manufacture-response.interface';
import { SystemCommodityResponse } from 'src/app/interfaces/api-service/response/system-commodity-list-response';
import { Commodities } from 'src/app/interfaces/api-service/response/commodities';
import { CommodityDetails } from 'src/app/interfaces/api-service/response/commodity-details';
import { CommodityItem } from 'src/app/interfaces/api-service/response/commodity-item';
import { GenericResponse } from 'src/app/interfaces/api-service/response/generic-response';
import { HttpErrorResponse } from '@angular/common/http';
import { SystemCommodity } from 'src/app/interfaces/api-service/response/system-commodity';

const mockError = {
  transactionId: 'fed46156-54ce-4220-967b-0edaf185efbb',
  errors: [
    {
      code: 'SYSTEM.UNEXPECTED.ERROR',
      message: 'The system has experienced an unexpected problem and is unable to complete your request.  Please try again later.  We regret any inconvenience.'
    }
  ]
};

fdescribe('LocalCommodityService', () => {
  let service: LocalCommodityService;
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
        LocalCommodityService,
        BrowserService
      ]
    });

    injector = getTestBed();
    service = injector.get(LocalCommodityService);
    httpMock = injector.get(HttpTestingController);
  });

  fit('should be created', () => {
    expect(service).toBeTruthy();
  });

  fit('getCommoditiesNames() should return a successful response', async () => {
    const mockData = {
      transactionId: '14205792-b885-43b4-9551-2741e652ba9e',
      output: {
        commodities: [
          '"<comm value = 60 >" 20150902',
          '"<comm value = 60 >" 20150908',
          '"<comm value = 60 >" 20160215',
          '"<comm value = 60>" 20150826',
          '< comm value = 60 >',
          'Advertising Material'
        ]
      }
    };

    service.getCommoditiesNames().subscribe((response: GenericResponse<Commodities>) => {
      expect(response.output.commodities.length).toBe(6);
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockData);
  });

  fit('getCommoditiesNames() should able to handle error', async () => {
    service.getCommoditiesNames().subscribe((response: GenericResponse<Commodities>) => {
      expect(response.errors[0].code).toBe('SYSTEM.UNEXPECTED.ERROR');
    });
  });

  fit('should return 404 error response - getCommoditiesNames()', async(() => {
    const mockResponse = new HttpErrorResponse({
      error: '404 error',
      status: 404, statusText: 'Not Found'
    });

    service.getCommoditiesNames().subscribe((response) => {
      expect(response.error).toBeDefined();
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockResponse);
  }));

  fit('getCommodityDetailsByKey() should return a successful response', async () => {
    const mockData = {
      transactionId: '5d2289ff-529d-4cd9-9d00-33acf0cbc8f8',
      output: {
        commodity: {
          name: 'BOOK',
          description: 'Correspondence/No Commercial Value',
          countryOfManufacture: 'AZ',
          harmonizedCode: '3',
          customsValue: {
            currency: 'USD',
            amount: 1.0
          }
        }
      }
    };

    service.getCommodityDetailsByKey('BOOK').subscribe((response: GenericResponse<CommodityDetails>) => {
      expect(response.output.commodity.name).toBe('BOOK');
      expect(response.output.commodity.description).toBe('Correspondence/No Commercial Value');
      expect(response.output.commodity.countryOfManufacture).toBe('AZ');
      expect(response.output.commodity.harmonizedCode).toBe('3');
      expect(response.output.commodity.customsValue.currency).toBe('USD');
      expect(response.output.commodity.customsValue.amount).toBe(1.0);
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockData);
  });

  fit('getCommodityDetailsByKey() should able to handle error', async () => {
    service.getCommodityDetailsByKey('').subscribe((response: GenericResponse<CommodityDetails>) => {
      expect(response.errors[0].code).toBe('SYSTEM.UNEXPECTED.ERROR');
    });
  });

  fit('should return 404 error response - getCommodityDetailsByKey()', async(() => {
    const mockResponse = new HttpErrorResponse({
      error: '404 error',
      status: 404, statusText: 'Not Found'
    });

    service.getCommodityDetailsByKey('').subscribe((response) => {
      expect(response.error).toBeDefined();
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockResponse);
  }));

  // TODO: Uncomment this service test once the commented method getCommodityItemDetails() is being used.
  // NOTE: This takes up code coverage percentage so it's temporarily commented.
  // fit('should SUCCESSFULLY acquire the Item commodities - getCommodityItemDetails()', async(() => {
  //   const mockData = {
  //     value: 'LITHIUM ION BATTERIES IN COMPLIANCE SECTION II OF PI966',
  //     configId: '1',
  //     countryCode: 'CN',
  //     type: 'Electronics'
  //   };

  //   service.getCommodityItemDetails().subscribe((response: GenericResponse<CommodityItem>) => {
  //     console.log('COMMODITY_DETAILS_RESPONSE:', response.output);
  //     expect(response.output.value).toBe(mockConfig.LOCAL.COMMODITY_LOCAL_ITEMS_API.value);
  //     expect(response.output.countryCode).toBe(mockConfig.LOCAL.COMMODITY_LOCAL_ITEMS_API.countryCode);
  //     expect(response.output.type).toBe(mockConfig.LOCAL.COMMODITY_LOCAL_ITEMS_API.type);
  //   });

  //   const request = httpMock.expectOne({ method: 'GET' });
  //   request.flush(mockData);
  // }));

  // TODO: Uncomment this service test once the commented method getCommodityItemDetails() is being used.
  // NOTE: This takes up code coverage percentage so it's temporarily commented.
  // fit('should return 404 error response - getCommodityItemDetails()', async(() => {
  //   const mockResponse = new HttpErrorResponse({
  //     error: '404 error',
  //     status: 404, statusText: 'Not Found'
  //   });

  //   service.getCommodityItemDetails().subscribe((response) => {
  //     expect(response.error).toBeDefined();
  //   });

  //   const request = httpMock.expectOne({ method: 'GET' });
  //   request.flush(mockResponse);
  // }));

  fit('should SUCCESSFULLY acquire country of manufacture - getCountryOfManufactureByCountryCodeAndType()', async(() => {
    const mockData = {
      output: {
        countries: [
          {
            name: 'China',
            code: 'CN',
            actualCountryCode: 'CN'
          },
          {
            name: 'Japan',
            code: 'JP',
            actualCountryCode: 'JP'
          }
        ]
      }
    };

    service.getCountryOfManufactureByCountryCodeAndType('HK', 'manufacture')
      .subscribe((response: GenericResponse<CommodityManufactureResponse>) => {
        expect(response.output.countries).toBeDefined();
        expect(response.output.countries[0].name).toBe('China');
        expect(response.output.countries[0].code).toBe('CN');
        expect(response.output.countries[0].actualCountryCode).toBe('CN');
        expect(response.output.countries[1].name).toBe('Japan');
        expect(response.output.countries[1].code).toBe('JP');
        expect(response.output.countries[1].actualCountryCode).toBe('JP');
      });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockData);
  }));

  fit('should return 404 error response - getCountryOfManufactureByCountryCodeAndType()', async(() => {
    const mockResponse = new HttpErrorResponse({
      error: '404 error',
      status: 404, statusText: 'Not Found'
    });

    service.getCountryOfManufactureByCountryCodeAndType(null, null).subscribe((response) => {
      expect(response.error).toBeDefined();
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockResponse);
  }));

  fit('should SUCCESSFULLY get system commodity list by category - getSystemCommodityListByCategory()', async(() => {
    const mockData = {
      output: {
        commoditylist: [
          {
            commodityId: '305',
            description: 'Air Fryer'
          },
          {
            commodityId: '306',
            description: 'Apple TV'
          },
        ]
      }
    };

    service.getSystemCommodityListByCategory('ELECTRONICS')
      .subscribe((response: GenericResponse<SystemCommodityResponse>) => {
        expect(response.output.commoditylist).toBeDefined();
        expect(response.output.commoditylist[0].commodityId).toBe('305');
        expect(response.output.commoditylist[0].description).toBe('Air Fryer');
        expect(response.output.commoditylist[1].commodityId).toBe('306');
        expect(response.output.commoditylist[1].description).toBe('Apple TV');
      });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockData);
  }));

  fit('should return 404 error response - getSystemCommodityListByCategory()', async(() => {
    const mockResponse = new HttpErrorResponse({
      error: '404 error',
      status: 404, statusText: 'Not Found'
    });

    service.getSystemCommodityListByCategory(null).subscribe((response) => {
      expect(response.error).toBeDefined();
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockResponse);
  }));

  fit('saveUserCommodity() should return a successful response', async () => {
    const mockData = {
      commodityId: "100045"
    };

    const commodityItem = {
      "commodity": {
        "user": {
          "uid": '5001000'
        },
        "commodityDetail": {
          "category": "Electronics",
          "description": "TV"
        }
      }
    }

    service.saveUserCommodity(commodityItem).subscribe((response: SystemCommodity) => {
      expect(response.commodityId).toBe('100045');
    });

    const request = httpMock.expectOne({ method: 'POST' });
    request.flush(mockData);
  });

  fit('saveUserCommodity() should able to handle error', async () => {
    const commodityItem = {
      "commodity": {
        "user": {
          "uid": '5001000'
        },
        "commodityDetail": {
          "category": "Electronics",
          "description": "TV"
        }
      }
    }

    service.saveUserCommodity(commodityItem).subscribe((response: SystemCommodity) => {
      expect(response.errors[0].code).toBe('SYSTEM.UNEXPECTED.ERROR');
    });
  });

  fit('should return 404 error response - saveUserCommodity()', async(() => {
    const mockResponse = new HttpErrorResponse({
      error: '404 error',
      status: 404, statusText: 'Not Found'
    });

    service.saveUserCommodity(null).subscribe((response) => {
      expect(response.error).toBeDefined();
    });

    const request = httpMock.expectOne({ method: 'POST' });
    request.flush(mockResponse);
  }));

  fit('should SUCCESSFULLY get user commodity list by category - getUserCommodityListByCategory()', async(() => {
    const mockData = {
      output: {
        commoditylist: [
          {
            commodityId: '100074',
            commodityDetail: {
              category: 'ELECTRONICS',
              description: 'AAAAA'
            }
          },
          {
            commodityId: '100075',
            commodityDetail: {
              category: 'ELECTRONICS',
              description: 'BBBBB'
            }
          }
        ]
      }
    };

    service.getUserCommodityListByCategory('12345', 'ELECTRONICS')
      .subscribe((response: GenericResponse<any>) => {
        expect(response.output.commoditylist).toBeDefined();
        expect(response.output.commoditylist[0].commodityId).toBe('100074');
        expect(response.output.commoditylist[0].commodityDetail.description).toBe('AAAAA');
        expect(response.output.commoditylist[1].commodityId).toBe('100075');
        expect(response.output.commoditylist[1].commodityDetail.description).toBe('BBBBB');
      });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockData);
  }));

  fit('should return 404 error response - getUserCommodityListByCategory()', async(() => {
    const mockResponse = new HttpErrorResponse({
      error: '404 error',
      status: 404, statusText: 'Not Found'
    });

    service.getUserCommodityListByCategory(null, null).subscribe((response) => {
      expect(response.error).toBeDefined();
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockResponse);
  }));
});
