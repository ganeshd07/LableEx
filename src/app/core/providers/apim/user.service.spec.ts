import { TestBed } from "@angular/core/testing";
import { APIMUserService } from './user.service';
import { ConfigModule, ConfigService, ConfigLoader } from '@ngx-config/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DatePipe } from '@angular/common';
import { configFactory } from 'src/app/app.module';
import { HttpClient } from '@angular/common/http';
import * as testConfig from '../../../../assets/config/mockConfigForTest';

// const mockDevConfig = {
//   "APIM": {
//     "HOST": "https://apidrt.idev.fedex.com",
//     "OAUTH_CREDENTIALS": {
//       "grantType": "client_credentials",
//       "clientId": "l7xx8659261c4bca4878b43cc7b367a0e1ec",
//       "clientSecret": "2b91742cb98d4d4a909ec11e5338c4fa",
//       "scope": "oob",
//       "tokenType": "Bearer"
//     },
//     "USER_ISLAND_API": {
//       "login": "/user/v2/login",
//       "logout": "/user/v2/logout"
//     }
//   }
// };

const mockConfig = testConfig.config;

fdescribe('APIMUserService', () => {
  let service: APIMUserService;
  // let configService: ConfigService;
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
        APIMUserService,
        DatePipe,
        {
          provide: ConfigService,
          useClass: ConfigServiceStub
        }
      ]
    });

    service = TestBed.inject(APIMUserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(async () => {
    httpMock.verify();
  });

  fit('should be created', () => {
    expect(service).toBeTruthy();
  });

  // NOTE: This test case is no longer valid & needs an update 
  xit('validateLoginStatus() logged in', async () => {
    // const mockData = {
    //   "transactionId": "320b31e5-fc66-4bfb-9982-47c388dc30ea",
    //   "output": {
    //     "userLoggedIn": true
    //   }
    // };

    service.validateLoginStatus().subscribe((response: any) => {
      expect(response.output.userLoggedIn).toEqual(true);
    });

    // const urlRequest = httpMock.expectOne({ url: './assets/config/development.json' });
    // const request = httpMock.expectOne({ method: 'GET' });

    // urlRequest.flush(mockDevConfig);
    // request.flush(mockData);
  });

  // NOTE: This test case is no longer valid & needs an update 
  xit('loginUser()', async () => {
    // const mockData = {
    //   "transactionId": "54b02d9f-4dee-4d8c-856a-5e73670795fd",
    //   "output": {
    //     "userProfile": {
    //       "registeredContactAndAddress": {
    //         "contact": {
    //           "personName": {
    //             "firstName": "Level3",
    //             "middleName": "",
    //             "lastName": "Taiwan"
    //           },
    //           "companyName": "TW COMPANY L3 testing",
    //           "phoneNumber": "0123456789",
    //           "emailAddress": "cto@fedex.com"
    //         },
    //         "address": {
    //           "streetLines": [
    //             "Address",
    //             ""
    //           ],
    //           "city": "Taipei",
    //           "stateOrProvinceCode": "",
    //           "postalCode": "100",
    //           "countryCode": "TW",
    //           "residential": false
    //         }
    //       },
    //       "isManaged": false,
    //       "defaultAccount": {
    //         "value": "",
    //         "key": "2e316bfc08ae34fdeb13d95e17cb270e"
    //       },
    //       "customer": {
    //         "cashOnly": false,
    //         "creditCardUpdateBlocked": false,
    //         "ukdomesticAllowed": false
    //       },
    //       "expandedAccounts": [
    //         {
    //           "account": {
    //             "accountNumber": {
    //               "value": "",
    //               "key": "2e316bfc08ae34fdeb13d95e17cb270e"
    //             },
    //             "accountNickname": "Level3 Taiwan",
    //             "accountDisplayName": "Level3 Taiwan-007"
    //           }
    //         }
    //       ],
    //       "siteWideProfile": {
    //         "departmentAdmin": false,
    //         "companyAdmin": false
    //       }
    //     },
    //     "loginCookieOutputVO": {
    //       "fclCookie": "ssodrt-cos1.edd1.79269b36",
    //       "nameCookie": "Level3",
    //       "contactNameCookie": "Level3 Taiwan",
    //       "uuidCookie": "0000g0h136"
    //     }
    //   }
    // };

    let username = "level3tw"
    let password = "Test1234"
    service.loginUser(username, password).subscribe((response: any) => {
      expect(response.output.userProfile).toBeDefined();
      expect(response.output.userProfile.registeredContactAndAddress.contact.personName.firstName).toEqual("Level3");
      expect(response.output.userProfile.registeredContactAndAddress.contact.personName.lastName).toEqual("Taiwan");
      expect(response.output.loginCookieOutputVO).toBeDefined();
      expect(response.output.loginCookieOutputVO.fclCookie).toEqual("ssodrt-cos1.edd1.79269b36");
      expect(response.output.loginCookieOutputVO.nameCookie).toEqual("Level3");
      expect(response.output.loginCookieOutputVO.contactNameCookie).toEqual("Level3 Taiwan");
      expect(response.output.loginCookieOutputVO.uuidCookie).toEqual("0000g0h136");
    });

    // const urlRequest = httpMock.expectOne({ url: './assets/config/development.json' });
    // const request = httpMock.expectOne({ method: 'POST' });

    // urlRequest.flush(mockDevConfig);
    // request.flush(mockData);
  });

  // NOTE: This test case is no longer valid & needs an update 
  xit('loginUser() wrong credentials', async () => {
    // const mockData = {
    //   "transactionId": "ebacbcde-952e-47f8-97e8-49909a2cd719",
    //   "errors": [
    //     {
    //       "code": "LOGIN.UNSUCCESSFUL",
    //       "message": "Login incorrect. Either the user ID or password combination is incorrect or the account has been locked. Please try again or click <a href= https://wwwdrt.idev.fedex.com/fcl/web/jsp/forgotPassword.jsp?appName=fclfsm&locale=US_en&step3URL=https://wwwdrt.idev.fedex.com/apps/myprofile/loginandcontact/?locale=en_US&cntry_code=US&afterwardsURL=https://wwwdrt.idev.fedex.com/apps/myprofile/loginandcontact/?locale=en_US&cntry_code=US>here</a> to recover your password.",
    //       "parameterList": []
    //     }
    //   ]
    // };

    let username = "level3tw"
    let password = "wrongPassword"
    service.loginUser(username, password).subscribe((response: any) => {
      expect(response.transactionId).toBeDefined();
      expect(response.errors).toBeDefined();
      expect(response.errors[0].code).toEqual("LOGIN.UNSUCCESSFUL");
      expect(response.errors[0].message).toBeDefined();
    });

    // const urlRequest = httpMock.expectOne({ url: './assets/config/development.json' });
    // const request = httpMock.expectOne({ method: 'POST' });

    // urlRequest.flush(mockDevConfig);
    // request.flush(mockData);
  });

  // NOTE: This test case is no longer valid & needs an update 
  xit('logoutUser()', async () => {
    // const mockData = {
    //   "transactionId": "c01f4b0a-079d-42ee-a3d6-b0d6f7bd5dac",
    //   "output": {}
    // };

    service.logoutUser().subscribe((response: any) => {
      expect(response.transactionId).toBeDefined();
      expect(response.output).toEqual({});
      expect(response.error).toBeUndefined();
      expect(response.errors).toBeUndefined();
    });

    // const urlRequest = httpMock.expectOne({ url: './assets/config/development.json' });
    // const request = httpMock.expectOne({ method: 'PUT' });

    // urlRequest.flush(mockDevConfig);
    // request.flush(mockData);
  });
});