import { async, getTestBed, TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { LocalAddressService } from './address.service';
import { ConfigService } from '@ngx-config/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import * as testConfig from '../../../../assets/config/mockConfigForTest';
import { Injector } from '@angular/core';
import { AddressBookPartyResponse } from 'src/app/interfaces/api-service/response/address-book-party-response';
import { GenericResponse } from 'src/app/interfaces/api-service/response/generic-response';
import { PartyListResponse } from 'src/app/interfaces/api-service/response/party-list-response';
import { AddressTypes } from 'src/app/types/enum/address-type.enum';
import { IAddressDataList } from 'src/app/interfaces/mock-data/address-data-list.interface';
import { ShipmentTypesConstants } from 'src/app/types/constants/shipment-types.constants';

const mockError = {
  transactionId: 'fed46156-54ce-4220-967b-0edaf185efbb',
  errors: [
    {
      code: 'SYSTEM.UNEXPECTED.ERROR',
      message: 'The system has experienced an unexpected problem and is unable to complete your request.  Please try again later.  We regret any inconvenience.'
    }
  ]
};

fdescribe('LocalAddressService', () => {
  let service: LocalAddressService;
  let configService: ConfigService;
  let httpMock: HttpTestingController;

  const mockConfig = testConfig.config;

  const mockSenderDetails = {
    address1: 'TEST DO NOT DISPATCH',
    address2: '',
    city: 'NYC',
    contactName: 'Derrick Chan',
    countryCode: 'PS',
    countryName: 'Hong Kong',
    postalCode: '111',
    emailAddress: 'derrick.chan@fedex.com',
    postalAware: false,
    stateAware: false,
    phoneNumber: '912365478',
    saveContact: false
  }

  const mockRecipientList = {
    partylist: [{
      partyId: '87954',
      user: {
        uid: 58751
      },
      contact: {
        personName: 'pratima',
        companyName: 'CB',
        phoneNumber: '56776',
        emailAddress: 'pratima.p@hcl.com',
        passportNo: '1234',
        taxId: '897'
      },
      address: {
        city: 'new delhi',
        stateOrProvinceCode: 'CB',
        postalCode: '12345',
        countryCode: 'CN',
        visitor: 'true',
        residential: 'true',
        streetlines: ['add1', 'add2']
      }
    }
    ]
  };

  const mockPendingShipmentList = [{
    shipmentId: 100110,
    shipDate: ' ',
    serviceType: 'INTERNATIONAL_PRIORITY ',
    packagingType: 'YOUR_PACKAGING ',
    refNumber: 'HK0201942008 ',
    status: 'PENDING ',
    totalPackageCount: '1 ',
    shipper: {
      contact: {
        personName: 'test ',
        phoneNumber: '85212345677 ',
        emailAddress: 'test@fedex ',
        companyName: null,
        phoneExtension: ' ',
        taxId: ' ',
        passportNo: null
      },
      address: {
        city: 'ABERDEEN ',
        stateOrProvinceCode: null,
        postalCode: null,
        countryCode: 'HK ',
        residential: false,
        streetLines: ['test ']
      }
    },
    recipient: {
      contact: {
        personName: 'test ',
        phoneNumber: '11225262727272 ',
        emailAddress: null,
        companyName: null,
        phoneExtension: ' ',
        taxId: ' ',
        passportNo: ' '
      },
      address: {
        city: 'NEWYORK ',
        stateOrProvinceCode: 'NY ',
        postalCode: '10018 ',
        countryCode: 'US ',
        residential: true,
        visitor: false,
        streetLines: ['test ']
      }
    },
    trackingNumbers: [],
    createDate: 'Feb-01-2021 '
  }];

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
        LocalAddressService,
        HttpClient
      ]
    });

    configService = TestBed.inject(ConfigService);
    service = TestBed.inject(LocalAddressService);
    httpMock = TestBed.inject(HttpTestingController);
  });



  afterEach(async () => {
    httpMock.verify();
  });

  fit('should be created', () => {
    expect(service).toBeTruthy();
  });

  fit('getAddressBookPartyByContactId() should return a successful response', async () => {
    const mockData = {
      transactionId: '5c6b6648-d8ec-45e7-a27f-bfb08d1263e1',
      output: {
        partyInfoVO: {
          party: {
            tins: [],
            contact: {
              contactId: '861283163',
              nickName: 'BATZ123',
              personName: {
                firstName: 'Neethu11111111111111111111111',
                lastName: 'Narayanan'
              },
              phoneNumberDetails: [
                {
                  number: {
                    localNumber: '5656565656',
                    extension: '020'
                  },
                  permissions: {}
                },
                {
                  type: 'FAX',
                  number: {
                    localNumber: '5656565656'
                  },
                  permissions: {}
                }
              ],
              companyName: {
                name: 'priyanka',
                department: 'IT_DZ'
              }
            },
            address: {
              streetLines: [
                'street 1',
                'street 2'
              ],
              city: 'NewYork',
              stateOrProvinceCode: 'US',
              postalCode: 'postal code',
              countryCode: 'US',
              residential: false
            }
          },
          addressCheckDetail: {
            acsClientVerifiedFlg: true,
            acsVerifiedStatusCD: '1',
            acsBypassFlg: false,
            addressTypeCd: 'R'
          },
          partyType: 'RECIPIENT',
          addressAncillaryDetail: {
            opCoTypeCD: 'EXPRESS_AND_GROUND',
            reference: '444444444',
            validFlg: 'Y',
            sharedFlg: 'Y',
            acceptedFlg: 'Y',
            einCd: 'E'
          }
        }
      }
    };

    service.getAddressBookPartyByContactId('861283163').subscribe((response: GenericResponse<AddressBookPartyResponse>) => {
      expect(response.output.partyInfoVO.party.contact.contactId).toBe('861283163');
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockData);
  });

  fit('getAddressBookPartyByContactId() should able to handle error', async () => {
    service.getAddressBookPartyByContactId('861283163').subscribe((response: GenericResponse<AddressBookPartyResponse>) => {
      expect(response.errors[0].code).toBe('SYSTEM.UNEXPECTED.ERROR');
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockError);
  });

  fit('should return 404 error response - getAddressBookPartyByContactId()', async(() => {
    const mockResponse = new HttpErrorResponse({
      error: '404 error',
      status: 404, statusText: 'Not Found'
    });

    service.getAddressBookPartyByContactId(null).subscribe((response) => {
      expect(response.error).toBeDefined();
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockResponse);
  }));

  fit('getPartyListByAddressType() should return a successful response', async () => {
    const mockData = {
      transactionId: '0e258cda-0768-4ba9-8ada-98a99e84f65d',
      output: {
        partyList: [
          {
            contactID: 80497280,
            nickName: 'AU EAST SYDNEY',
            contactName: 'AU EAST SYDNEY',
            companyName: 'AU EAST SYDNEY',
            countryCD: 'AU'
          },
          {
            contactID: 80624543,
            nickName: 'AU DUAL Adelaide',
            contactName: 'AU DUAL  Ad',
            companyName: 'AU DUAL Ad',
            countryCD: 'AU'
          },
          {
            contactID: 80624656,
            nickName: 'CN Dual',
            contactName: 'CN Dual',
            companyName: 'CN COMPANY',
            countryCD: 'CN'
          }
        ]
      }
    };

    const addressType = 'recipient';

    service.getPartyListByAddressType(addressType).subscribe((response: GenericResponse<PartyListResponse>) => {
      expect(response.output.partyList.length).toBe(3);
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockData);
  });

  fit('getPartyListByAddressType() should able to handle error', async () => {
    const addressType = '';

    service.getPartyListByAddressType(addressType).subscribe((response: GenericResponse<PartyListResponse>) => {
      expect(response.errors[0].code).toBe('SYSTEM.UNEXPECTED.ERROR');
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockError);
  });

  fit('should return 404 error response - getPartyListByAddressType()', async(() => {
    const mockResponse = new HttpErrorResponse({
      error: '404 error',
      status: 404, statusText: 'Not Found'
    });

    service.getPartyListByAddressType(null).subscribe((response) => {
      expect(response.error).toBeDefined();
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockResponse);
  }));

  fit('should return a successful response, when getRecipientList() called.', async () => {
    service.getRecipientList('1234', AddressTypes.ADDRESS_RECIPIENT).subscribe((response: IAddressDataList) => {
      expect(response.partylist.length).toBe(1);
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockRecipientList);
  });

  fit('should return 404 error response - getRecipientList()', async(() => {
    const mockResponse = new HttpErrorResponse({
      error: '404 error',
      status: 404, statusText: 'Not Found'
    });

    service.getRecipientList(null, null).subscribe((response) => {
      expect(response).toBeDefined();
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockResponse);
  }));

  fit('should return a successful response, when getShipmentsListDetails() called.', async(() => {
    service.getShipmentsListDetails('1234', ShipmentTypesConstants.PENDING).subscribe((response: any) => {
      expect(response.length).toBe(1);
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockPendingShipmentList);
  }));

  fit('should return 404 error response - getShipmentsListDetails()', async(() => {
    const mockResponse = new HttpErrorResponse({
      error: '404 error',
      status: 404, statusText: 'Not Found'
    });

    service.getShipmentsListDetails(null, null).subscribe((response) => {
      expect(response.error).toBeDefined();
    });

    const request = httpMock.expectOne({ method: 'GET' });
    request.flush(mockResponse);
  }));

  fit('should return a successful response, when postPartyAddressDetails() called.', async(() => {
    service.postPartyAddressDetails(mockSenderDetails, AddressTypes.ADDRESS_DEFAULT_SENDER, '1234').subscribe((response: any) => {
      expect(response.partyId).toEqual('101010');
    });

    const request = httpMock.expectOne({ method: 'POST' });
    request.flush({ partyId: '101010' });
  }));

  fit('should return 404 error response - postPartyAddressDetails()', async(() => {
    const mockResponse = new HttpErrorResponse({
      error: '404 error',
      status: 404, statusText: 'Not Found'
    });

    service.postPartyAddressDetails(mockSenderDetails, null, null).subscribe((response) => {
      expect(response.error).toBeDefined();
    });

    const request = httpMock.expectOne({ method: 'POST' });
    request.flush(mockResponse);
  }));

  fit('should return a successful response, when updatePartyAddressDetails() called.', async(() => {
    const mockSenderDetails = {
      address1: 'TEST DO NOT DISPATCH',
      address2: 'Test add 2',
      address3: 'Test add 3',
      city: 'NYC',
      contactName: 'Derrick Chan',
      companyName: 'company',
      phoneExt: '12',
      passportNumber: 'ABCD',
      countryCode: 'PS',
      countryName: 'Hong Kong',
      postalCode: '',
      emailAddress: 'derrick.chan@fedex.com',
      postalAware: false,
      stateAware: false,
      phoneNumber: '912365478',
      saveContact: false,
      visitor: true
    }
    service.updatePartyAddressDetails(mockSenderDetails, '101010', '100100').subscribe((response: any) => {
      expect(response.Ok).toEqual('Ok');
    });

    const request = httpMock.expectOne({ method: 'PUT' });
    request.flush({ Ok: 'Ok' });
  }));

  fit('should return 404 error response - updatePartyAddressDetails()', async(() => {
    const mockResponse = new HttpErrorResponse({
      error: '404 error',
      status: 404, statusText: 'Not Found'
    });

    service.updatePartyAddressDetails(mockSenderDetails, null, null).subscribe((response) => {
      expect(response.error).toBeDefined();
    });

    const request = httpMock.expectOne({ method: 'PUT' });
    request.flush(mockResponse);
  }));
});
