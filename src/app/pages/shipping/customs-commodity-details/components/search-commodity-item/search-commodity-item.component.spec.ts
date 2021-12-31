import { TestBed, async, ComponentFixture, getTestBed, fakeAsync, tick } from '@angular/core/testing';
import { SearchCommodityItemComponent } from './search-commodity-item.component';
import { ModalController, AngularDelegate, IonicModule } from '@ionic/angular';
import { LocalCommodityService } from 'src/app/core/providers/local';
import { ConfigService } from '@ngx-config/core';
import * as testConfig from '../../../../../../assets/config/mockConfigForTest';
import { CommonModule } from '@angular/common';
import { NotificationService } from 'src/app/core/providers/notification-service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Observable, Observer } from 'rxjs';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { LanguageLoader } from 'src/app/app.module';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { AppState } from 'src/app/+store/app.state';
import * as fromShippingSelector from '../../../+store/shipping.selectors';
import { ItemsType } from 'src/app/types/enum/items-type.enum';
import { getSystemCommodityListBegin } from '../../../+store/shipping.actions';
import { SystemCommodity } from 'src/app/interfaces/api-service/response/system-commodity';
import { FormsModule, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AccountType } from 'src/app/types/enum/account-type.enum';


fdescribe('SearchCommodityItemComponent', () => {
  let component: SearchCommodityItemComponent;
  let fixture: ComponentFixture<SearchCommodityItemComponent>;
  let formBuilder: FormBuilder;
  let store: MockStore<AppState>;
  const mockUserCommodityList = [
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
    },
    {
      commodityId: '100076',
      commodityDetail: {
        category: 'ELECTRONICS',
        description: 'KKKKK'
      }
    },
    {
      commodityId: '100077',
      commodityDetail: {
        category: 'ELECTRONICS',
        description: 'ZZZZZZ'
      }
    }
  ];
  const mockUserAccountDetails = {
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
  };
  const mockSystemCommodityData: SystemCommodity[] = [
    { commodityId: '305', description: 'Air Fryer' },
    { commodityId: '306', description: 'Apple TV' },
    { commodityId: '307', description: 'Bakery and biscuit oven' },
    { commodityId: '308', description: 'Bass' },
    { commodityId: '309', description: 'AAAAA' },
    { commodityId: '310', description: 'Burglar alarm' },
    { commodityId: '311', description: 'charges' }
  ];
  const initialState: AppState = {
    shippingApp: {
      userAccount: null,
      shipmentDetails: {
        selectedRate: {
          dayOfWeek: 'Mon',
          dateOfArrival: 'Sep 28, 2020',
          timeOfArrival: '08:00',
          totalNetCharge: 3793.85,
          totalBaseCharge: 3239.7,
          surchargeList: [
            {
              type: 'FUEL',
              description: 'Fuel Surcharge',
              amount: [
                {
                  currency: 'HKD',
                  amount: 329.15
                }
              ]
            },
            {
              type: 'PEAK',
              description: 'Peak Surcharge',
              amount: [
                {
                  currency: 'HKD',
                  amount: 225
                }
              ]
            }
          ],
          volumeDiscount: 148.5,
          currency: 'HKD',
          saturdayDelivery: false
        },
        packageDetails: [],
        totalNumberOfPackages: 0,
        totalWeight: 0,
        serviceType: 'INTERNATIONAL_FIRST',
        serviceName: 'FedEx International First®',
        packagingType: '',
        serviceCode: '',
        advancedPackageCode: '',
        totalCustomsOrInvoiceValue: null,
        customsOrInvoiceValueCurrency: '',
        carriageDeclaredValue: null,
        carriageDeclaredValueCurrency: '',
        displayDate: '',
        shipDate: null,
        firstAvailableShipDate: null,
        lastAvailableShipDate: null,
        availableShipDates: [],
        selectedPackageOption: null,
        specialServiceInfo: null,
      },
      customsDetails: {
        commodityList: [],
        customsType: 'doc',
        productType: '',
        productPurpose: '',
        documentType: '',
        documentTypeCode: '',
        documentValue: 2345,
        documentValueUnits: ''
      },
      senderDetails: {
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
      },
      recipientDetails: [
        {
          address1: '',
          address2: '',
          address3: '',
          residential: false,
          companyName: '',
          contactName: '',
          city: 'Kowloon',
          countryCode: 'HK',
          countryName: 'Hong Kong',
          postalCode: '852',
          postalAware: false,
          stateAware: false,
          phoneNumber: '',
          phoneExt: '',
          taxId: '',
          passportNumber: ''
        }
      ],
      paymentDetails: {
        shippingBillTo: 'Bill Recipient',
        shippingBillToDisplayable: 'Bill Recipient',
        shippingAccountNumber: '2003456712',
        shippingAccountNumberDisplayable: '',
        dutiesTaxesBillTo: 'Bill Recipient',
        dutiesTaxesBillToDisplayable: 'Bill Recipient',
        dutiesTaxesAccountNumber: '3001234567',
        dutiesTaxesAccountNumberDisplayable: ''
      },
      shipmentConfirmation: null
    }
  };
  beforeEach(async(() => {
    const mockConfig = testConfig.config;
    class localCommoityServiceStub {
      getCommodityItemDetails() {
        return Observable.create((observer: Observer<any>) => {
          observer.next(mockSystemCommodityData);
        })
      }
    }

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
      declarations: [
        SearchCommodityItemComponent
      ],
      providers: [
        ModalController,
        FormBuilder,
        NotificationService,
        TranslateService,
        AngularDelegate,
        { provide: LocalCommodityService, useClass: localCommoityServiceStub },
        { provide: ConfigService, useClass: configServiceStub },
        provideMockStore({ initialState })
      ],
      imports: [
        HttpClientTestingModule,
        IonicModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: LanguageLoader,
            deps: [HttpClient]
          }
        })
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchCommodityItemComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    fixture.detectChanges();
    spyOn(store, 'dispatch').and.callFake(() => { });
  });

  beforeEach(() => {
    const mockUSCurrencySelector = store.overrideSelector(fromShippingSelector.selectSystemCommodityList, mockSystemCommodityData);
  });

  afterEach(() => {
    fixture.destroy();
  });

  fit('should create', () => {
    expect(component).toBeTruthy();
  });

  fit('should call getSystemCommodityList and store should dispatch action using selected category.', () => {
    component.itemSelectedType = ItemsType.ELECTRONICS;
    component.ngOnInit();
    fixture.detectChanges();
    expect(store.dispatch).toHaveBeenCalledWith(getSystemCommodityListBegin({ category: ItemsType.ELECTRONICS }));
  });

  fit('should call getSystemCommodityList and store should dispatch action using selected category.', fakeAsync(() => {
    component.itemSelectedType = ItemsType.ELECTRONICS;
    component.ngOnInit();
    fixture.detectChanges();
    tick();
    expect(component.itemSubCategoryList.length).toBeGreaterThan(0);
  }));

  fit('should cancel the sub category details.', fakeAsync(() => {
    component.itemSelectedType = ItemsType.ELECTRONICS;
    fixture.detectChanges();
    component.ngOnInit();
    tick();
    component.onCancel();
    const responseLength = component.systemCommodityList.length;
    expect(component.itemSubCategoryList.length).toEqual(responseLength);
  }));

  fit('should search the data in the list', fakeAsync(() => {
    component.itemSelectedType = ItemsType.ELECTRONICS;
    fixture.detectChanges();
    component.ngOnInit();
    tick();
    //Search commodity using value 'Apple TV'
    const evet = { target: { 'value': 'Apple TV' } };
    component.onSearch(evet);
    expect(component.itemSubCategoryList.length).toEqual(1);

    //After removing search text.
    const evet1 = { target: { 'value': '' } };
    component.onSearch(evet1);
    expect(component.itemSubCategoryList.length).toBeGreaterThan(1);

    //Search commmodity using incorrect value 'Baaa'
    const evet2 = { target: { 'value': 'Baaa' } };
    component.onSearch(evet2);
    expect(component.itemSubCategoryList.length).toEqual(1);

    //Search with wrong value 'Baaa' and change it correct value 'Ba'
    const evet3 = { target: { 'value': 'Ba' } };
    component.onSearch(evet3);
    expect(component.itemSubCategoryList.length).toEqual(2);
  }));

  fit('should call modal close function.', fakeAsync(() => {
    spyOn(component.modalController, 'dismiss')
    component.itemSelectedType = ItemsType.ELECTRONICS;
    component.ngOnInit();
    fixture.detectChanges();
    tick();
    const item = { commodityId: '306', description: 'Apple TV' }
    component.closeNavigation(item);
    expect(component.modalController.dismiss).toHaveBeenCalledWith(item);
  }));

  fit('should call modal close function with item description entered by user for Others.', fakeAsync(() => {
    spyOn(component.modalController, 'dismiss')
    component.itemSelectedType = ItemsType.OTHERS;
    component.ngOnInit();
    fixture.detectChanges();
    tick();
    component.otherCategoryForm.controls.itemDescription.setValue('Other Test Item');
    const testItem = { commodityId: '', description: 'Other Test Item' }
    component.addOtherCategoryItem();
    expect(component.modalController.dismiss).toHaveBeenCalledWith(testItem);
  }));

  fit('should not call modal close function and show required error.', fakeAsync(() => {
    spyOn(component.modalController, 'dismiss')
    component.itemSelectedType = ItemsType.OTHERS;
    component.ngOnInit();
    fixture.detectChanges();
    tick();
    component.otherCategoryForm.controls.itemDescription.setValue('    ');
    const testItem = { commodityId: '', description: '   ' }
    component.addOtherCategoryItem();
    expect(component.modalController.dismiss).not.toHaveBeenCalledWith(testItem);
    expect(component.otherCategoryForm.controls.itemDescription.errors.required).toBeTrue;
  }));

  fit('should display error message, when item description entered by user is less than 6 characters for Others.', fakeAsync(() => {
    component.itemSelectedType = ItemsType.OTHERS;
    component.ngOnInit();
    fixture.detectChanges();
    tick();
    component.otherCategoryForm.controls.itemDescription.setValue('test');
    expect(component.otherCategoryForm.controls.itemDescription.errors.minlength).toBeTrue;
  }));

  fit('should get user account details.', fakeAsync(() => {
    store.overrideSelector(fromShippingSelector.selectUserLoginDetails, mockUserAccountDetails);
    component.getUserAccountDetails();
    fixture.detectChanges();
    tick();
    expect(component.userId).toEqual('123456');
  }));

  fit('should get user commodity details list.', fakeAsync(() => {
    store.overrideSelector(fromShippingSelector.selectUserCommodityList, mockUserCommodityList);
    component.ngOnInit();
    fixture.detectChanges();
    tick();
    expect(component.userCommodityList.length).toEqual(4);
  }));

  fit('should map user commodity list as system commodity list object.', fakeAsync(() => {
    store.overrideSelector(fromShippingSelector.selectUserCommodityList, mockUserCommodityList);
    component.ngOnInit();
    fixture.detectChanges();
    tick();
    expect(component.userCommodityList.length).toEqual(4);
    expect(component.userCommodityList[0].commodityId).toBeTruthy;
    expect(component.userCommodityList[0].description).toBeTruthy;

    const mappedUserCommodity = component.mapUserCommodity([]);
    fixture.detectChanges();
    tick();
    expect(mappedUserCommodity.length).toEqual(0);
  }));

  fit('should merge user commodity list, system commodity list and return sorted list.', fakeAsync(() => {
    store.overrideSelector(fromShippingSelector.selectUserLoginDetails, mockUserAccountDetails);
    store.overrideSelector(fromShippingSelector.selectUserCommodityList, mockUserCommodityList);
    component.ngOnInit();
    fixture.detectChanges();
    tick();
    expect(component.itemSubCategoryList.length).toEqual(11);
    expect(component.itemSubCategoryList[0].description).toEqual('AAAAA');
    expect(component.itemSubCategoryList[component.itemSubCategoryList.length - 1].description).toEqual('ZZZZZZ');
  }));

  fit('should display user commodity list when selected category is Others.', fakeAsync(() => {
    store.overrideSelector(fromShippingSelector.selectSystemCommodityList, null);
    store.overrideSelector(fromShippingSelector.selectUserLoginDetails, mockUserAccountDetails);
    store.overrideSelector(fromShippingSelector.selectUserCommodityList, mockUserCommodityList);
    spyOn(component, 'saveMergedSubCategoryToStore');
    component.ngOnInit();
    fixture.detectChanges();
    tick();
    component.mergeSystemAndUserCommodity();
    expect(component.saveMergedSubCategoryToStore).toHaveBeenCalled();
    expect(component.itemSubCategoryList.length).toEqual(4);
    expect(component.itemSubCategoryList[0].description).toEqual('AAAAA');
  }));

  fit('should display system commodity list when user commodity list not available.', fakeAsync(() => {
    store.overrideSelector(fromShippingSelector.selectUserLoginDetails, mockUserAccountDetails);
    store.overrideSelector(fromShippingSelector.selectUserCommodityList, null);
    component.ngOnInit();
    fixture.detectChanges();
    tick();
    expect(component.itemSubCategoryList.length).toEqual(7);
    expect(component.itemSubCategoryList[0].description).toEqual('Air Fryer');
  }));

  fit('should display empty commodity list when user commodity and system commodity list not available.', fakeAsync(() => {
    component.userCommodityList = null;
    component.systemCommodityList = null;
    fixture.detectChanges();
    component.mergeSystemAndUserCommodity();
    tick();
    expect(component.itemSubCategoryList).toBeFalse;
  }));
});
