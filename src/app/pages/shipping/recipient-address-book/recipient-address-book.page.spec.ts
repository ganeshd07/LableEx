import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { RecipientAddressBookPage } from './recipient-address-book.page';
import { RecipientAddressBookPageModule } from './recipient-address-book.module';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppState } from 'src/app/+store/app.state';
import { AccountType } from 'src/app/types/enum/account-type.enum';
import { LocalAddressService } from '../../../../app/core/providers/local/address.service';
import * as testConfig from '../../../../assets/config/mockConfigForTest';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Observable, Observer } from 'rxjs';
import { ConfigService } from '@ngx-config/core';
import { AddressTypes } from 'src/app/types/enum/address-type.enum';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { LanguageLoader } from 'src/app/app.module';
import { IAddressBookResponse } from 'src/app/interfaces/mock-data/address-book-response.interface';

describe('RecipientAddressBookPage', () => {
  let component: RecipientAddressBookPage;
  let fixture: ComponentFixture<RecipientAddressBookPage>;

  const recipientList = {
    partylist: [
      {
        partyId: '1',
        contact: {
          personName: 'Billy Tsui',
          companyName: 'Company',
          phoneNumber: '4162301124',
          emailAddress: '',
          taxId: '',
          passportNo: ''
        },
        address: {
          streetlines: [
            '41 PINTO DRIVE'
          ],
          city: 'NORTH YORK',
          stateOrProvinceCode: 'ON',
          postalCode: 'M2J3T9',
          countryCode: 'CA',
          residential: 'true',
          vistor: 'false'
        }
      }
    ]
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
        lastLogin: null
      },
      shipmentDetails: null,
      customsDetails: null,
      senderDetails: null,
      recipientDetails: null,
      paymentDetails: null,
      shipmentConfirmation: null
    }
  };

  beforeEach(async(() => {
    let mockStore: MockStore;
    const mockConfig = testConfig.config;

    class LocalAddressServiceStub {
      getRecipientList(uid: string, recipient: AddressTypes) {
        return Observable.create((observer: Observer<any>) => {
          observer.next(recipientList);
        });
      }
    }

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
      declarations: [RecipientAddressBookPage],
      imports: [
        IonicModule,
        RecipientAddressBookPageModule,
        RouterTestingModule,
        CommonModule,
        FormsModule,
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: LanguageLoader,
            deps: [HttpClient]
          }
        })
      ],
      providers: [
        provideMockStore({ initialState }),
        { provide: LocalAddressService, useClass: LocalAddressServiceStub },
        { provide: ConfigService, useClass: ConfigServiceStub }
      ]
    }).compileComponents();
    mockStore = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(RecipientAddressBookPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  afterEach(() => {
    fixture.destroy();
  });

  fit('should create', () => {
    expect(component).toBeTruthy();
  });

  fit('show or hide item list', () => {
    component.toggle();
    expect(component.hideVal).toEqual(false);
  });

  fit('should call ngOnInit', () => {
    fixture.detectChanges();
    spyOn(component, 'initialiseRecipientList');
    component.ngOnInit();
    expect(component.initialiseRecipientList).toHaveBeenCalled();
    expect(component.hideAddressBook).toEqual(true);
  });

  fit('should filter recipientlist when text search is done', () => {
    fixture.detectChanges();
    component.recipientListMaster = recipientList.partylist;
    let event = { target: { value: '' } };
    component.filterRecipientList(event);
    expect(component.recipientList.length).toEqual(1);
    event = { target: { value: 'billy' } };
    component.filterRecipientList(event);
    expect(component.recipientList.length).toEqual(1);
    event = { target: { value: 'company' } };
    component.filterRecipientList(event);
    expect(component.recipientList.length).toEqual(1);
    event = { target: { value: '41 PINTO' } };
    component.filterRecipientList(event);
    expect(component.recipientList.length).toEqual(1);
    event = { target: { value: 'NORTH' } };
    component.filterRecipientList(event);
    expect(component.recipientList.length).toEqual(1);
    event = { target: { value: 'M2J3T9' } };
    component.filterRecipientList(event);
    expect(component.recipientList.length).toEqual(1);
    event = { target: { value: 'CA' } };
    component.filterRecipientList(event);
    expect(component.recipientList.length).toEqual(1);
  });

  fit('should retrive the recipientlist when page load', () => {
    fixture.detectChanges();
    component.initialiseRecipientList(initialState.shippingApp.userAccount.userId);
    expect(component.recipientListMaster).toEqual(recipientList.partylist);
  });

  fit('should select recipient', () => {
    fixture.detectChanges();
    let mockData: IAddressBookResponse = {
      partyId: '123456',
      contact: {
        personName: 'Derrick Chan',
        companyName: 'FedEx',
        phoneNumber: '1234567890',
        emailAddress: 'derrick.chan@fedex.com',
        taxId: '123456',
        passportNo: '123456'
      },
      address: {
        streetlines: [
          'street 1',
          'street 2',
          'street 3'
        ],
        city: 'ABERDEEN',
        stateOrProvinceCode: '',
        postalCode: '123456',
        countryCode: 'HK',
        residential: false,
        visitor: ''
      }
    };
    component.recipientSelected(mockData);
    expect(component.recipientData).toBeDefined();
    expect(component.recipientData.countryName).toBeUndefined();
    expect(component.recipientData.contactName).toEqual(mockData.contact.personName);
    expect(component.recipientData.companyName).toEqual(mockData.contact.companyName);
    expect(component.recipientData.countryCode).toEqual(mockData.address.countryCode);
    expect(component.recipientData.postalCode).toEqual(mockData.address.postalCode);
    expect(component.recipientData.phoneNumber).toEqual(mockData.contact.phoneNumber);
    expect(component.recipientData.city).toEqual(mockData.address.city);
    expect(component.recipientData.address1).toEqual(mockData.address.streetlines[0]);
    expect(component.recipientData.address2).toEqual(mockData.address.streetlines[1]);
    expect(component.recipientData.address3).toEqual(mockData.address.streetlines[2]);

    mockData.address.residential = true;
    component.recipientSelected(mockData);
    expect(component.recipientData.residential).toEqual(true);

    mockData.address.streetlines = undefined;
    component.recipientSelected(mockData);
    expect(component.recipientData).toBeDefined();
    expect(component.recipientData.address1).toEqual('');
    expect(component.recipientData.address2).toBeUndefined();
    expect(component.recipientData.address3).toBeUndefined();
  });

});
