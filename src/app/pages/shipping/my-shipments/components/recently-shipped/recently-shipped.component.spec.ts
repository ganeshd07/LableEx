import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { AppState } from 'src/app/+store/app.state';
import { LanguageLoader } from 'src/app/app.module';
import { IUser } from 'src/app/interfaces/shipping-app/user';
import { ShipmentTypesConstants } from 'src/app/types/constants/shipment-types.constants';
import { AccountType } from 'src/app/types/enum/account-type.enum';
import * as fromShippingSelector from '../../../+store/shipping.selectors';
import { RecentlyShippedComponent } from './recently-shipped.component';
import * as testConfig from '../../../../../../assets/config/mockConfigForTest';
import { ConfigService } from '@ngx-config/core';
import { SessionItems } from 'src/app/types/enum/session-items.enum';

fdescribe('RecentlyShippedComponent', () => {
  let component: RecentlyShippedComponent;
  let fixture: ComponentFixture<RecentlyShippedComponent>;
  let store: MockStore<AppState>;
  const mockConfig = testConfig.config;
  let FEDEX_DOMAIN: string;
  let trackingUrl: string;

  const mockConfirmedShipmentList = [{
    shipmentId: 100110,
    shipDate: 'Feb-01-2021',
    serviceType: 'INTERNATIONAL_PRIORITY',
    packagingType: 'YOUR_PACKAGING',
    refNumber: 'HK0201942008',
    status: 'PENDING',
    totalPackageCount: '1',
    shipper: {
      contact: {
        personName: 'test',
        phoneNumber: '85212345677',
        emailAddress: 'test@fedex',
        companyName: null,
        phoneExtension: '',
        taxId: '',
        passportNo: null
      },
      address: {
        city: 'ABERDEEN',
        stateOrProvinceCode: null,
        postalCode: null,
        countryCode: 'HK',
        residential: false,
        streetLines: ['test']
      }
    },
    recipient: {
      contact: {
        personName: 'test',
        phoneNumber: '11225262727272',
        emailAddress: null,
        companyName: null,
        phoneExtension: '',
        taxId: '',
        passportNo: ''
      },
      address: {
        city: 'NEWYORK',
        stateOrProvinceCode: 'NY',
        postalCode: '10018',
        countryCode: 'US',
        residential: true,
        visitor: false,
        streetLines: ['test']
      }
    },
    trackingNumbers: [{
      masterTrackingNumber: '772399004968'
    }],
    createDate: 'Feb-01-2021'
  }];

  const mockUser: IUser = {
    userId: '1234',
    userProfile: null,
    accountType: AccountType.OTP,
    accountProfile: null,
    isUserLoggedIn: true,
    lastLogin: new Date(),
    uidValue: '123456789'
  };

  const initialState: AppState = {
    shippingApp: {
      userAccount: {
        userId: '123456',
        userProfile: {
          output: {
            profile: {
              user: {
                uid: '00g0091fpl'
              },
              contact: {
                personName: 'contactName',
                companyName: '',
                phoneNumber: '',
                emailAddress: '',
                taxId: '123456'
              },
              address: {
                streetLines: [],
                city: 'AUCKLAND',
                stateOrProvinceCode: '',
                postalCode: 123456,
                countryName: 'NEW ZEALAND',
                countryCode: 'NZ',
                residential: 'false'
              }
            }
          }
        },
        accountType: AccountType.OTP,
        accountProfile: '',
        isUserLoggedIn: true,
        lastLogin: new Date()
      },
      shipmentDetails: null,
      customsDetails: null,
      senderDetails: null,
      recipientDetails: null,
      paymentDetails: null,
      shipmentConfirmation: null,
      lookupData: {
        createShipmentError: null,
        createShipmentSuccess: null,
        currencyListLocal: null,
        currencyListUS: null,
        documentDescriptions: null,
        listOfcountryOfManufactureLocal: null,
        listOfcountryOfManufactureUS: null,
        mergedCurrencyList: null,
        mergedListOfcountryOfManufacture: null,
        mergedUomList: null,
        ratesDiscountError: null,
        defaultSenderDetails: null,
        recipientListDetails: null,
        ratesDiscountSuccess: {
          configlist: [
            {
              value: 0,
              seq: 1
            }
          ]
        },
        recipientCities: null,
        recipientCountries: [
          {
            name: 'Afghanistan',
            code: 'AF',
            actualCountryCode: 'AF'
          },
          {
            name: 'United States',
            code: 'US',
            actualCountryCode: 'US'
          }
        ],
        selectedCountryDialingPrefix: null,
        selectedRecipientCountryDetails: {
          countryName: 'Afghanistan',
          countryCode: 'AF',
          domesticShippingAllowed: false,
          domesticShippingUsesInternationalServices: false,
          maxCustomsValue: 50000,
          numberOfCommercialInvoices: 0,
          postalAware: false,
          regionCode: 'APAC',
          states: [],
          currencyCode: 'AFN',
          domesticCurrencyCode: 'AFN',
          anyPostalAwareness: false,
          customsValueRequired: false,
          minCustomsValue: 0,
          documentProductApplicable: false
        },
        selectedSenderCountryDetails: {
          countryName: 'HONG KONG SAR, CHINA',
          countryCode: 'HK',
          domesticShippingAllowed: false,
          domesticShippingUsesInternationalServices: false,
          maxCustomsValue: 50000,
          numberOfCommercialInvoices: 0,
          postalAware: false,
          regionCode: 'APAC',
          states: [],
          currencyCode: 'HKD',
          domesticCurrencyCode: 'HKD',
          anyPostalAwareness: false,
          customsValueRequired: false,
          minCustomsValue: 0,
          documentProductApplicable: false
        },
        senderCities: [
          {
            totalResults: 2,
            resultsReturned: 2,
            matchedAddresses: [
              {
                city: 'A KUNG KOK',
                countryCode: 'HK',
                residential: false,
                primary: false,
                stateOrProvinceCode: '',
                postalCode: ''
              },
              {
                city: 'ABERDEEN',
                countryCode: 'HK',
                residential: false,
                primary: false,
                stateOrProvinceCode: '',
                postalCode: ''
              }
            ]
          }
        ],
        senderCountries: [
          {
            name: 'Afghanistan',
            code: 'AF',
            actualCountryCode: 'AF'
          },
          {
            name: 'Albania',
            code: 'AL',
            actualCountryCode: 'AL'
          }
        ],
        senderRecipientInfo: null,
        shipmentFeedackSuccess: null,
        shipmentPurpose: null,
        systemCommodityList: null,
        uomListLocal: null,
        uomListUS: null
      }
    }
  };
  beforeEach(async(() => {
    class configServiceStub {
      settings: any = mockConfig;
      getSettings(prop: string) {
        return this.settings[prop];
      }
      init() {
        this.settings = mockConfig;
      }
    }

    TestBed.configureTestingModule({
      declarations: [RecentlyShippedComponent],
      imports: [
        IonicModule.forRoot(),
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: LanguageLoader,
            deps: [HttpClient]
          }
        }),
        HttpClientTestingModule
      ],
      providers: [
        TranslateService,
        ModalController,
        { provide: ConfigService, useClass: configServiceStub },
        provideMockStore({ initialState })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RecentlyShippedComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    fixture.detectChanges();
    spyOn(store, 'dispatch').and.callFake(() => { });
    trackingUrl = component.util.joinStrings('', mockConfig.FEDEX_DOMAIN.HOST, mockConfig.FEDEX_DOMAIN.APPS_ISLAND);
  }));

  beforeEach(async(() => {
    store.overrideSelector(fromShippingSelector.selectConfirmedShipmentDetails, mockConfirmedShipmentList);
  }))

  afterEach(() => {
    sessionStorage.clear();
    fixture.destroy();
  });

  fit('should create', () => {
    expect(component).toBeTruthy();
  });

  fit('should not dispatch action to get pending shipment list', () => {
    store.overrideSelector(fromShippingSelector.selectUserLoginDetails, null);
    component.getShipmentDetails();
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  fit('should have shipment list with month and date.', () => {
    store.overrideSelector(fromShippingSelector.selectUserLoginDetails, mockUser);
    component.getShipmentDetails();
    component.handlePendingShipmentSuccess();
    expect(store.dispatch).toHaveBeenCalled();
    expect(component.confirmedShipments.length).toEqual(1);
    expect(component.confirmedShipments[0].month).toEqual('Feb');
  });

  fit('should open new tab with URL, when user click on shipment item.', () => {
    store.overrideSelector(fromShippingSelector.selectUserLoginDetails, mockUser);
    spyOn(window, 'open');
    const mockUrl = trackingUrl + '?trknbr=772399004968';
    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'HK');
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en');
    component.ngOnInit();
    component.openTrackingUrl(mockConfirmedShipmentList[0]);
    expect(window.open).toHaveBeenCalledWith(mockUrl, '_blank');
  });

  fit('should disply message user when confirmed shipment response is empty', () => {
    const mockConfirmedShipments = [{}]
    store.overrideSelector(fromShippingSelector.selectConfirmedShipmentDetails, mockConfirmedShipments);
    component.handlePendingShipmentSuccess();
    expect(component.displyMessage).toBeTrue;
  });
});
