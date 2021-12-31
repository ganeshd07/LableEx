import { ComponentFixture, fakeAsync, TestBed, tick, flush } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { Step1ShipmentDetailsPage } from './step1-shipment-details.page';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { LanguageLoader } from 'src/app/app.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { AppState } from 'src/app/+store/app.state';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { NotificationService } from 'src/app/core/providers/notification-service';
import { PackagingType } from 'src/app/types/enum/packaging-type.enum';
import { Observable, Observer, ReplaySubject, Subscription } from 'rxjs';
import { DatePipe } from '@angular/common';
import { AccountType } from 'src/app/types/enum/account-type.enum';
import * as fromShippingSelector from '../+store/shipping.selectors';
import { ShipmentOriginComponent } from '../step1-shipment-details/components/shipment-origin/shipment-origin.component';
import { ISender } from 'src/app/interfaces/shipping-app/sender';
import { saveRecipientDetailsAction, saveSenderAddressAction } from '../+store/shipping.actions';
import { ShipmentDestinationComponent } from './components/shipment-destination/shipment-destination.component';
import { APIMCountryService } from 'src/app/core/providers/apim/country.service';
import { PackagingTypeOptionsComponent } from './components/packaging-type-options/packaging-type-options.component';
import { Sender } from 'src/app/interfaces/api-service/request/sender';
import { Recipient } from 'src/app/interfaces/api-service/request/recipient';
import { APIMAvailabilityService } from 'src/app/core/providers/apim/availability.service';
import { SessionItems } from 'src/app/types/enum/session-items.enum';
import { BehaviorSubject } from 'rxjs';
import * as testConfig from '../../../../assets/config/mockConfigForTest';
import { ConfigService } from '@ngx-config/core';

fdescribe('Step1ShipmentDetailsPage', () => {
  const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl', 'navigate', 'then']);
  let component: Step1ShipmentDetailsPage;
  let fixture: ComponentFixture<Step1ShipmentDetailsPage>;

  const storeSpy = jasmine.createSpyObj('store', ['dispatch', 'select']);
  const eventSubject = new ReplaySubject<RouterEvent>(1);
  const routerMock = {
    navigateByUrl: jasmine.createSpy('navigateByUrl'),
    navigate: jasmine.createSpy('navigate'),
    then: jasmine.createSpy('then'),
    events: eventSubject.asObservable()
  };
  let mockStore: MockStore;
  let formBuilder: FormBuilder;
  let router: Router;

  let initialState: AppState = {
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
      senderDetails: {
        address1: 'TEST DO NOT DISPATCH',
        address2: '',
        city: 'ABERDEEN',
        contactName: 'Derrick Chan',
        countryCode: 'HK',
        countryName: 'Hong Kong',
        postalCode: undefined,
        emailAddress: 'derrick.chan@fedex.com',
        postalAware: false,
        stateAware: false,
        phoneNumber: '912365478',
        saveContact: false,
        stateOrProvinceCode: undefined,
        taxId: '',
        partyId: ''
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
      paymentDetails: null,
      shipmentConfirmation: null
    }
  };

  const mockSender = {
    city: 'ABERDEEN',
    stateOrProvinceCode: '',
    postalCode: '',
    countryCode: 'HK',
  };

  const mockRecipient = {
    city: 'TORONTO',
    stateOrProvinceCode: 'ON',
    postalCode: 'M1M1M1',
    countryCode: 'CA',
  };

  const mockCountryList = {
    transactionId: 'e76bc5bc-21b0-4272-90d8-4541d3c322dd',
    output: {
      countries: [
        {
          code: 'AF',
          name: 'AFGHANISTAN',
          actualCountryCode: 'AF'
        },
        {
          code: 'US',
          name: 'United States',
          actualCountryCode: 'US'
        }
      ]
    }
  };

  const mockCityList = {
    transactionId: '6d4898ae-252f-4a49-ac26-7d1f048c3f7e',
    output: {
      totalResults: 1,
      resultsReturned: 1,
      matchedAddresses: [
        {
          city: 'NEW YORK',
          stateOrProvinceCode: 'NY',
          postalCode: '10001',
          countryCode: 'US',
          residential: false,
          primary: false
        }
      ]
    }
  };

  class APIMCountryServiceStub {
    getCountries() {
      return Observable.create((observer: Observer<any>) => {
        observer.next(mockCountryList);
      });
    }

    getCitiesByCountryCodeAndPostalCode(countryCode: string, postalCode: string) {
      return Observable.create((observer: Observer<any>) => {
        observer.next(mockCityList);
      });
    }
  }

  class APIMAvailabilityServiceStub {
    mockResponse = {
      transactionId: '3a8bddb2-20ce-41d0-8cbd-e3f0a74c4e80',
      output: {
        serviceOptions: [
          {
            key: 'FIRST_OVERNIGHT',
            displayText: 'FedEx First Overnight®'
          },
          {
            key: 'PRIORITY_OVERNIGHT',
            displayText: 'FedEx Priority Overnight®'
          },
          {
            key: 'STANDARD_OVERNIGHT',
            displayText: 'FedEx Standard Overnight®'
          },
          {
            key: 'FEDEX_2_DAY',
            displayText: 'FedEx 2Day®'
          },
          {
            key: 'FEDEX_EXPRESS_SAVER',
            displayText: 'FedEx Economy'
          },
          {
            key: 'FEDEX_GROUND',
            displayText: 'FedEx Ground®'
          }
        ],
        packageOptions: [
          {
            packageType: {
              key: 'FEDEX_BOX',
              displayText: 'FedEx Box'
            },
            rateTypes: [
              'WEIGHT_BASED'
            ],
            subpackageInfoList: [
              {
                description: 'Small',
                dimensionText: '27.62 cm x 3.81 cm x 31.43 cm'
              },
              {
                description: 'Medium',
                dimensionText: '29.21 cm x 6.03 cm x 33.66 cm'
              },
              {
                description: 'Large',
                dimensionText: '31.43 cm x 7.62 cm x 44.45 cm'
              }
            ],
            maxMetricWeightAllowed: {
              units: 'KG',
              value: 18.0
            },
            maxWeightAllowed: {
              units: 'LB',
              value: 40.0
            },
            maxDeclaredValue: {
              currency: 'CAD',
              amount: 50000.0
            }
          },
          {
            packageType: {
              key: 'FEDEX_ENVELOPE',
              displayText: 'FedEx Envelope'
            },
            rateTypes: [
              'WEIGHT_BASED'
            ],
            subpackageInfoList: [
              {
                description: 'Letter',
                dimensionText: '24.13 cm x 31.75 cm'
              },
              {
                description: 'Legal',
                dimensionText: '24.13 cm x 39.37 cm'
              }
            ],
            maxMetricWeightAllowed: {
              units: 'KG',
              value: 0.56
            },
            maxWeightAllowed: {
              units: 'LB',
              value: 1.2
            },
            maxDeclaredValue: {
              currency: 'CAD',
              amount: 100.0
            }
          },
          {
            packageType: {
              key: 'FEDEX_PAK',
              displayText: 'FedEx Pak'
            },
            rateTypes: [
              'WEIGHT_BASED'
            ],
            subpackageInfoList: [
              {
                description: 'Small',
                dimensionText: '26.04 cm x 32.39 cm'
              },
              {
                description: 'Large',
                dimensionText: '30.48 cm x 39.37 cm'
              }
            ],
            maxMetricWeightAllowed: {
              units: 'KG',
              value: 9.0
            },
            maxWeightAllowed: {
              units: 'LB',
              value: 20.0
            },
            maxDeclaredValue: {
              currency: 'CAD',
              amount: 100.0
            }
          },
          {
            packageType: {
              key: 'FEDEX_TUBE',
              displayText: 'FedEx Tube'
            },
            rateTypes: [
              'WEIGHT_BASED'
            ],
            subpackageInfoList: [
              {
                description: 'Tube',
                dimensionText: '15.24 cm x 15.24 cm x 96.52 cm'
              }
            ],
            maxMetricWeightAllowed: {
              units: 'KG',
              value: 9.0
            },
            maxWeightAllowed: {
              units: 'LB',
              value: 20.0
            },
            maxDeclaredValue: {
              currency: 'CAD',
              amount: 50000.0
            }
          },
          {
            packageType: {
              key: 'YOUR_PACKAGING',
              displayText: 'Your Packaging'
            },
            rateTypes: [
              'WEIGHT_BASED'
            ],
            subpackageInfoList: [
              {
                description: 'Please enter the weight and dimensions of your package for a more accurate estimated rate.',
                dimensionText: ''
              }
            ],
            maxMetricWeightAllowed: {
              units: 'KG',
              value: 68.0
            },
            maxWeightAllowed: {
              units: 'LB',
              value: 150.0
            },
            maxDeclaredValue: {
              currency: 'CAD',
              amount: 50000.0
            },
            maximumDimensions: [
              {
                length: 108,
                width: 62,
                height: 62
              },
              {
                length: 274,
                width: 157,
                height: 157
              }
            ],
            maximumLengthPlusGirths: [
              {
                value: 130.0,
                units: 'IN'
              },
              {
                value: 330.0,
                units: 'CM'
              }
            ]
          }
        ],
        oneRate: false,
        pricingOptions: [
          {
            key: 'WEIGHT_BASED',
            displayText: 'FedEx Standard Rate'
          },
          {
            key: 'FLAT_BASED',
            displayText: 'FedEx One Rate'
          }
        ]
      }
    };

    getPackageAndServiceOptions(sender: Sender, recipient: Recipient) {
      return Observable.create((observer: Observer<any>) => {
        observer.next(this.mockResponse);
      });
    }
  }

  beforeEach(async () => {
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


    TestBed.configureTestingModule({
      declarations: [
        Step1ShipmentDetailsPage,
        ShipmentOriginComponent,
        ShipmentDestinationComponent,
        PackagingTypeOptionsComponent
      ],
      imports: [
        RouterTestingModule.withRoutes([]),
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
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        FormBuilder,
        TranslateService,
        DatePipe,
        provideMockStore({ initialState }),
        { provide: Router, useValue: routerSpy },
        NotificationService,
        { provide: Router, useValue: routerMock },
        { provide: APIMCountryService, useClass: APIMCountryServiceStub },
        { provide: APIMAvailabilityService, useClass: APIMAvailabilityServiceStub },
        { provide: ConfigService, useClass: ConfigServiceStub }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);

    fixture = TestBed.createComponent(Step1ShipmentDetailsPage);
    mockStore = TestBed.inject(MockStore);
    component = fixture.componentInstance;
    formBuilder = TestBed.inject(FormBuilder);
    fixture.detectChanges();
    spyOn(mockStore, 'dispatch').and.callFake(() => { });
  });

  afterEach(() => {
    fixture.destroy();
  });

  fit('should create', fakeAsync(() => {
    expect(component).toBeTruthy();
    tick();
  }));

  fit('isFromNewShipMent flag should be false', fakeAsync(() => {
    component.ngOnInit();
    tick(50);
    component.clearShippingData();
    tick(100);
    fixture.detectChanges();
    expect(component.isFromNewShipMent).toBe(false);

    const ele = fixture.debugElement.nativeElement.querySelectorAll('.shipping-comp');
    expect(ele).toBeTruthy();
  }));

  fit('ngOnInit should be called', fakeAsync(() => {
    spyOn(component, 'ngOnInit');
    component.clearShippingData();
    fixture.detectChanges();
    flush();
    expect(component.ngOnInit).toHaveBeenCalled();
  }));

  fit('newShipment value from Session storage should be removed', fakeAsync(() => {
    sessionStorage.setItem(SessionItems.NEWSHIPMENT, 'true');
    component.clearShippingData();
    tick(50);
    fixture.detectChanges();
    flush();
    const storageValue = sessionStorage.getItem(SessionItems.NEWSHIPMENT);
    expect(storageValue).toBe(null);
  }));

  /**
   * Should navigate to show rates page and save the shipment details
   * values given the package is not 'YOUR PACKAGING' type.
   */
  xit('should navigate to show rates page', fakeAsync(() => {
    component.ngOnInit();
    tick(50);
    fixture.detectChanges();

    component.shipmentOriginRef.shipmentOriginForm.get('countryCode').setValue('HK');
    component.shipmentOriginRef.shipmentOriginForm.get('city').setValue('ABERDEEN');

    component.shipmentDestinationRef.shipmentDestinationForm.get('countryCode').setValue('US');
    component.shipmentDestinationRef.shipmentDestinationForm.get('postalCode').setValue('10018');
    component.shipmentDestinationRef.shipmentDestinationForm.get('city').setValue('NEW YORK');

    component.packagingTypeOptionsRef.packagingTypeOptionsForm.get('packageType').setValue(PackagingType.FEDEX_10KG_BOX);
    // component.form.packagingTypeOptionsForm.get('packageType').setValue(PackagingType.FEDEX_10KG_BOX);
    component.routeToRateAndDeliveryPage();

    tick(50);
    fixture.detectChanges();

    expect(component.updateSenderDetails).toHaveBeenCalled();
    expect(component.updateRecipientDetails).toHaveBeenCalled();
    expect(component.updateShipmentDetails).toHaveBeenCalled();
    expect(component.updatePackagingDetails).toHaveBeenCalled();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/shipping/show-rates');
  }));

  /**
   * Should not navigate to show rates page and save shipment details
   * values given the package is 'YOUR PACKAGING' type.
   */
  // fit('should not navigate to show rates page', fakeAsync(() => {
  //   component.ngOnInit();
  //   fixture.detectChanges();
  //   component.form.packagingTypeOptionsForm.get('packageType').setValue(PackagingType.YOUR_PACKAGING);
  //   component.routeToRateAndDeliveryPage();

  //   tick(1000);
  //   fixture.detectChanges();

  //   expect(component.updateSenderDetails).not.toHaveBeenCalled();
  //   expect(component.updateRecipientDetails).not.toHaveBeenCalled();
  //   expect(component.updateShipmentDetails).not.toHaveBeenCalled();
  //   expect(component.updatePackagingDetails).not.toHaveBeenCalled();
  //   expect(routerSpy.navigateByUrl).not.toHaveBeenCalled();
  // }));

  fit('should populate sender and recipient', fakeAsync(() => {
    component.ngOnInit();
    tick(50);
    component.isShipmentOriginValid = true;
    component.isShipmentDestinationValid = true;
    component.sender = component.aPIMShipmentDataMapper.populateSender(
      mockSender.city, mockSender.stateOrProvinceCode, mockSender.postalCode, mockSender.countryCode);
    component.recipient = component.aPIMShipmentDataMapper.populateRecipient(
      mockRecipient.city, mockRecipient.stateOrProvinceCode, mockRecipient.postalCode, mockRecipient.countryCode);
    expect(component.sender.address).toBeDefined();
    expect(component.recipient.address).toBeDefined();
    expect(component.sender.address.countryCode).toBe('HK');
    expect(component.recipient.address.countryCode).toBe('CA');
    expect(component.sender.address.postalCode).toBe('');
    expect(component.recipient.address.postalCode).toBe('M1M1M1');
  }));

  fit('should call getPackageAndServiceOptions', fakeAsync(() => {
    component.sender = component.aPIMShipmentDataMapper.populateSender('ABERDEEN', '', '', 'HK');
    component.recipient = component.aPIMShipmentDataMapper.populateRecipient('VIJAYAWADA', '', '520007', 'IN');
    component.isShipmentOriginValid = true;
    component.isShipmentDestinationValid = true;
    spyOn(component.packagingTypeOptionsRef, 'getPackageAndServiceOptions');
    component.callPackageAndServiceOptionsAPI();
    tick();
    expect(component.packagingTypeOptionsRef.getPackageAndServiceOptions).toHaveBeenCalled();
  }));

  fit('should dispatch an action to save sender details', fakeAsync(() => {
    mockStore.overrideSelector(fromShippingSelector.selectSenderDetails, initialState.shippingApp.senderDetails);
    component.shipmentOriginRef.shipmentOriginForm.controls.countryCode.setValue('HK');
    component.shipmentOriginRef.shipmentOriginForm.controls.city.setValue('ABERDEEN');
    component.shipmentOriginRef.shipmentOriginForm.controls.countryName.setValue('Hong Kong');
    component.senderDetails = initialState.shippingApp.senderDetails;
    const senderDetailsToSave: ISender = {
      address1: 'TEST DO NOT DISPATCH',
      address2: '',
      city: 'ABERDEEN',
      contactName: 'Derrick Chan',
      countryCode: 'HK',
      countryName: 'Hong Kong',
      postalCode: '',
      emailAddress: 'derrick.chan@fedex.com',
      postalAware: false,
      stateAware: false,
      phoneNumber: '912365478',
      stateOrProvinceCode: undefined,
      companyName: undefined,
      taxId: '',
      partyId: ''
    };
    component.updateSenderDetails();
    tick();
    expect(mockStore.dispatch).toHaveBeenCalledWith(saveSenderAddressAction({ senderDetails: senderDetailsToSave }));
  }));

  fit('should dispatch an action to save recipient details', fakeAsync(() => {
    component.shipmentDestinationRef.shipmentDestinationForm.controls.countryCode.setValue('US');
    component.shipmentDestinationRef.shipmentDestinationForm.controls.postalCode.setValue('10018');
    component.shipmentDestinationRef.shipmentDestinationForm.controls.city.setValue('NEW YORK');
    component.shipmentDestinationRef.postalAware = true;
    const recipientDetailsList = [
      {
        address1: '',
        address2: '',
        address3: '',
        residential: false,
        companyName: '',
        contactName: '',
        city: 'NEW YORK',
        countryCode: 'US',
        countryName: '',
        postalCode: '10018',
        postalAware: true,
        stateAware: false,
        phoneNumber: '',
        phoneExt: '',
        taxId: '',
        passportNumber: '',
        stateOrProvinceCode: ''
      }
    ];
    component.updateRecipientDetails();
    tick();
    expect(mockStore.dispatch).toHaveBeenCalledWith(saveRecipientDetailsAction({ recipientDetailsList }));
  }));

  fit('should get sender details from store', fakeAsync(() => {
    mockStore.overrideSelector(fromShippingSelector.selectSenderDetails, initialState.shippingApp.senderDetails);
    component.updateSenderDetails();
    tick();
    expect(component.senderDetails).toBe(initialState.shippingApp.senderDetails);
  }));

  fit('should reset and update value and validity for shipmentDestinationForm', fakeAsync(() => {
    component.shipmentDestinationRef.shipmentDestinationForm.controls.countryCode.setValue('IN');
    component.shipmentDestinationRef.shipmentDestinationForm.controls.city.setValue('VIJAYAWADA');
    component.shipmentDestinationRef.shipmentDestinationForm.controls.postalCode.setValue('520007');
    component.shipmentDestinationRef.shipmentDestinationForm.controls.countryName.setValue('INDIA');
    spyOn(component.shipmentDestinationRef.shipmentDestinationForm, 'reset');
    spyOn(component.shipmentDestinationRef.shipmentDestinationForm, 'updateValueAndValidity');
    component.resetChildren();
    tick();
    expect(component.shipmentDestinationRef.shipmentDestinationForm.reset).toHaveBeenCalled();
    expect(component.shipmentDestinationRef.shipmentDestinationForm.updateValueAndValidity).toHaveBeenCalled();
  }));

  fit('should reset and update value and validity for shipmentOriginForm', fakeAsync(() => {
    component.shipmentOriginRef.shipmentOriginForm.controls.countryCode.setValue('IN');
    component.shipmentOriginRef.shipmentOriginForm.controls.city.setValue('VIJAYAWADA');
    component.shipmentOriginRef.shipmentOriginForm.controls.postalCode.setValue('520007');
    spyOn(component.shipmentOriginRef.shipmentOriginForm, 'reset');
    spyOn(component.shipmentOriginRef.shipmentOriginForm, 'updateValueAndValidity');
    component.resetChildren();
    tick();
    expect(component.shipmentOriginRef.shipmentOriginForm.reset).toHaveBeenCalled();
    expect(component.shipmentOriginRef.shipmentOriginForm.updateValueAndValidity).toHaveBeenCalled();
  }));

  fit('should call initShipmentOriginFormSubs and isShipmentOriginValid is true', fakeAsync(() => {
    component.ngOnInit();
    tick(50);
    component.shipmentOriginRef.shipmentOriginForm.controls.countryCode.setValue('IN');
    component.shipmentOriginRef.shipmentOriginForm.controls.city.setValue('VIJAYAWADA');
    component.shipmentOriginRef.shipmentOriginForm.controls.postalCode.setValue('520007');
    component.shipmentOriginRef.shipmentOriginForm.setValue({
      countryName: '',
      city: 'VIJAYAWADA',
      postalCode: '520007',
      countryCode: 'IN'
    });
    component.initShipmentOriginFormSubs();
    tick(500);
    flush();
    expect(component.isShipmentOriginValid).toEqual(true);
  }));

  fit('should call initShipmentOriginFormSubs and isShipmentOriginValid is false', fakeAsync(() => {
    component.ngOnInit();
    tick(50);
    component.shipmentOriginRef.shipmentOriginForm.setValue({
      countryName: '',
      city: '',
      postalCode: '',
      countryCode: ''
    });
    component.initShipmentOriginFormSubs();
    tick(500);
    flush();
    expect(component.isShipmentOriginValid).toEqual(false);
  }));

  fit('should call initShipmentDestinationFormSubs and isShipmentDestinationValid is true', fakeAsync(() => {
    component.ngOnInit();
    tick(50);
    component.shipmentDestinationRef.shipmentDestinationForm.controls.countryCode.setValue('IN');
    component.shipmentDestinationRef.shipmentDestinationForm.controls.city.setValue('VIJAYAWADA');
    component.shipmentDestinationRef.shipmentDestinationForm.controls.postalCode.setValue('520007');
    component.shipmentDestinationRef.shipmentDestinationForm.controls.countryName.setValue('INDIA');
    component.shipmentDestinationRef.shipmentDestinationForm.controls.stateOrProvinceCode.setValue('');
    component.shipmentDestinationRef.shipmentDestinationForm.setValue({
      countryName: 'INDIA',
      city: 'VIJAYAWADA',
      postalCode: '520007',
      countryCode: 'IN',
      stateOrProvinceCode: ''
    });
    component.initShipmentDestinationFormSubs();
    tick(500);
    flush();
    expect(component.isShipmentDestinationValid).toEqual(true);
  }));

  fit('should call  initShipmentDestinationFormSubs and isShipmentDestinationValid is false', fakeAsync(() => {
    component.ngOnInit();
    tick(50);
    component.shipmentDestinationRef.shipmentDestinationForm.setValue({
      countryName: '',
      city: '',
      postalCode: '',
      countryCode: '',
      stateOrProvinceCode: ''
    });
    component.initShipmentDestinationFormSubs();
    tick(500);
    flush();
    expect(component.isShipmentDestinationValid).toEqual(false);
  }));

  fit('should call  scrollToFirstInvalidControl', fakeAsync(() => {
    spyOn(component, 'scrollToFirstInvalidControl');
    component.routeToRateAndDeliveryPage();
    tick();
    expect(component.scrollToFirstInvalidControl).toHaveBeenCalled();
  }));

  fit('should call updateSenderDetails ', fakeAsync(() => {
    let packages: FormArray;
    component.shipmentDestinationRef.showInvalidCountryError = false;
    component.isShipmentOriginValid = true;
    component.isShipmentDestinationValid = true;
    packages = component.packagingTypeOptionsRef.getPackagesAsFormArray();
    packages.controls[0].get('weightPerPackage').setValue(1);
    component.shipmentOriginRef.shipmentOriginForm.controls.countryCode.setValue('IN');
    component.shipmentOriginRef.shipmentOriginForm.controls.city.setValue('VIJAYAWADA');
    component.shipmentOriginRef.shipmentOriginForm.controls.postalCode.setValue('520007');
    component.shipmentDestinationRef.shipmentDestinationForm.controls.countryCode.setValue('IN');
    component.shipmentDestinationRef.shipmentDestinationForm.controls.city.setValue('VIJAYAWADA');
    component.shipmentDestinationRef.shipmentDestinationForm.controls.postalCode.setValue('520007');
    component.shipmentDestinationRef.shipmentDestinationForm.controls.countryName.setValue('INDIA');
    spyOn(component, 'updateSenderDetails');
    fixture.detectChanges();
    component.routeToRateAndDeliveryPage();
    tick();
    expect(component.updateSenderDetails).toHaveBeenCalled();
  }));

  fit('should reset and update value and validity for packagingTypeOptionsForm', fakeAsync(() => {
    let packages: FormArray;
    packages = component.packagingTypeOptionsRef.getPackagesAsFormArray();
    packages.controls[0].get('weightPerPackage').setValue(1);
    spyOn(component.packagingTypeOptionsRef.packagingTypeOptionsForm, 'reset');
    spyOn(component.packagingTypeOptionsRef.packagingTypeOptionsForm, 'updateValueAndValidity');
    component.resetChildren();
    tick();
    expect(component.packagingTypeOptionsRef.packagingTypeOptionsForm.reset).toHaveBeenCalled();
    expect(component.packagingTypeOptionsRef.packagingTypeOptionsForm.updateValueAndValidity).toHaveBeenCalled();
  }));

  fit('should reset and update value and validity for packagingTypeOptionsForm', fakeAsync(() => {
    spyOn(component.shipmentOriginRef, 'markAllFieldAsTouch');
    spyOn(component.packagingTypeOptionsRef, 'markAllFieldAsTouch');
    component.scrollToFirstInvalidControl();
    expect(component.packagingTypeOptionsRef.markAllFieldAsTouch).toHaveBeenCalled();
    expect(component.packagingTypeOptionsRef.markAllFieldAsTouch).toHaveBeenCalled();
  }));

  fit('should called clear shipping data', fakeAsync(() => {
    const homeNav = new NavigationEnd(1, 'home', 'home');
    eventSubject.next(homeNav);
    sessionStorage.setItem(SessionItems.NEWSHIPMENT, 'true');
    spyOn(component, 'resetChildren');
    spyOn(component, 'clearShippingData');
    component.ngOnInit();
    tick(500);
    expect(component.clearShippingData).toHaveBeenCalled();
  }));

  fit('should set recipient details to null, when country value changed.', fakeAsync(() => {
    const mockData = {
      countryName: 'Afganistan',
      countryCode: 'AF',
      city: 'BAGRAM'
    };

    component.shipmentDestinationRef.shipmentDestinationForm.controls.countryCode.setValue('HK');
    component.shipmentDestinationRef.shipmentDestinationForm.controls.city.setValue('CENTRAL');
    component.shipmentDestinationRef.shipmentDestinationForm.controls.countryName.setValue('Hong Kong');
    tick(500);

    component.checkRecipientDetails(mockData);
    expect(mockStore.dispatch).toHaveBeenCalled();
    expect(component.recipientDetails).toEqual(null);
  }))

  fit('should set recipient details to null, when city value changed.', fakeAsync(() => {
    const mockData = {
      countryName: 'Afganistan',
      countryCode: 'AF',
      city: 'BAGRAM'
    };

    component.shipmentDestinationRef.shipmentDestinationForm.controls.countryCode.setValue('AF');
    component.shipmentDestinationRef.shipmentDestinationForm.controls.city.setValue('ABERDEEN');
    component.shipmentDestinationRef.shipmentDestinationForm.controls.countryName.setValue('Afganistan');
    tick(500);

    component.checkRecipientDetails(mockData);
    expect(mockStore.dispatch).toHaveBeenCalled();
    expect(component.recipientDetails).toEqual(null);
  }));

  fit('should not set recipient details to null, when city and country value are same.', fakeAsync(() => {
    const mockData = {
      countryName: 'Afganistan',
      countryCode: 'AF',
      city: 'BAGRAM'
    };
    initialState.shippingApp.recipientDetails[0].countryName = 'Afganistan';
    initialState.shippingApp.recipientDetails[0].countryCode = 'AF';
    initialState.shippingApp.recipientDetails[0].city = 'BAGRAM';
    mockStore.overrideSelector(fromShippingSelector.selectRecipientDetailsList, initialState.shippingApp.recipientDetails);

    component.shipmentDestinationRef.shipmentDestinationForm.controls.countryCode.setValue('AF');
    component.shipmentDestinationRef.shipmentDestinationForm.controls.city.setValue('BAGRAM');
    component.shipmentDestinationRef.shipmentDestinationForm.controls.countryName.setValue('Afganistan');

    component.checkRecipientDetails(mockData);
    tick(500);
    expect(mockStore.dispatch).not.toHaveBeenCalled();
    expect(component.recipientDetails).not.toEqual(null);
  }));

  fit('should not set recipient details to null, when city and country value are same.', fakeAsync(() => {
    spyOn(component, 'checkRecipientDetails')
    mockStore.overrideSelector(fromShippingSelector.selectRecipientDetailsList, null);

    tick(500);
    expect(component.checkRecipientDetails).not.toHaveBeenCalled();
  }));
});
