import { async, ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { IonicModule, IonInput } from '@ionic/angular';
import { OtpVerificationPage } from './otp-verification.page';
import { RouterTestingModule } from '@angular/router/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { BrowserService } from 'src/app/core/providers/browser.service';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader, TranslatePipe } from '@ngx-translate/core';
import { LanguageLoader } from 'src/app/app.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BehaviorSubject, Observable, Observer } from 'rxjs';
import { P4eOtpService } from 'src/app/core/providers/local/p4e-otp.service';
import { OtpRequestConstants } from 'src/app/types/constants/otp-request.constants';
import { Router } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { AppState } from 'src/app/+store/app.state';
import { AccountType } from 'src/app/types/enum/account-type.enum';
import { saveSenderAddressAction, saveUserAccountAction, updatePaymentsDetailsAction } from '../../shipping/+store/shipping.actions';
import * as testConfig from '../../../../assets/config/mockConfigForTest';
import { ConfigService } from '@ngx-config/core';
import * as userProfileCN from '../../../../assets/data/user-profile-cn.json';
import { BillingOptionsUtil } from 'src/app/types/constants/billing-and-service-options.constants';
import * as fromShippingSelector from '../../shipping/+store/shipping.selectors';
import { CreateShipmentResponse } from 'src/app/interfaces/api-service/response/create-shipment-response';
import { AppSupportedCountry } from 'src/app/types/enum/app-supported-country.enum';
import { LoginUserProfileService } from 'src/app/providers/login-user-profile.service';
import { HttpHeaderKey } from 'src/app/types/enum/http-header-key.enum';
import { SessionItems } from 'src/app/types/enum/session-items.enum';

fdescribe('OtpVerificationPage', () => {
  let component: OtpVerificationPage;
  let fixture: ComponentFixture<OtpVerificationPage>;
  let store: MockStore<AppState>;
  let eventStub = new BehaviorSubject<any>(null);
  let mockData;
  let router: Router
  let routerStub = {
    events: eventStub,
    navigateByUrl: jasmine.createSpy('navigateByUrl'),
    routerState: {
      snapshot: {
        url: '/account/otp-verification'
      }
    }
  }
  const storeSpy = jasmine.createSpyObj('store', ['dispatch', 'select']);
  const mockSuccessValue: CreateShipmentResponse = {
    shipmentId: '82365',
    shipmentRefNumber: 'CN1221355799',
    barcodeURI: 'https://wwwdrt.idev.fedex.com/mobileshipping/qrCode?refNumber=CN1221355799'
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
        lastLogin: new Date(),
        uidValue: "9736647577"
      },
      shipmentDetails: null,
      customsDetails: null,
      senderDetails: {
        countryCode: "HK",
        countryName: "",
        postalCode: "",
        city: "",
        postalAware: false,
        emailAddress: "",
        address1: "",
        address2: "",
        contactName: undefined,
        stateAware: false,
        phoneNumber: "9736647577",
        stateOrProvinceCode: undefined,
        companyName: undefined,
        taxId: undefined
      },
      recipientDetails: null,
      paymentDetails: null,
      shipmentConfirmation: null
    }
  };

  const mockOtpValidateResponse = {
    txId: 'tgvNn1plq75wYfPkhNKJMZfcid8rJd9b',
    status: 'SUCCESS',
    message: 'Successfully Validated'
  };

  const mockOtpGenerateResponse = {
    txId: 'tgvNn1plq75wYfPkhNKJMZfcid8rJd9c',
    authType: 'SMS',
    otpPhoneDeliveryRes: {
      contact: '85298403275',
      sendStatus: 'SUCCESS',
      sendTime: '2021-03-15 11:17:33 GMT',
      otpExpiry: 90
    },
    otpEmailDeliveryRes: null,
    status: 'SUCCESS',
    message: 'OTP sent successfully'
  };

  let mockUserIdResponse;

  class P4eOtpServiceStub {
    generateOtp(mobileNumber, countryCode) {
      return Observable.create((observer: Observer<any>) => {
        observer.next(mockOtpGenerateResponse);
      });
    }

    validateOtp() {
      return Observable.create((observer: Observer<any>) => {
        observer.next(mockOtpValidateResponse);
      })
    }

    getUserProfileDetails() {
      return Observable.create((observer: Observer<any>) => {
        observer.next(mockUserIdResponse);
      })
    }
  }

  class LoginUserProfileServiceStub {
    getUserProfileOTP() { }
  }

  beforeEach(async(() => {
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

    TestBed.configureTestingModule({
      declarations: [OtpVerificationPage],
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        IonicModule.forRoot(),
        StoreModule.forRoot({}),
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
        FormBuilder,
        TranslatePipe,
        { provide: P4eOtpService, useClass: P4eOtpServiceStub },
        { provide: LoginUserProfileService, useClass: LoginUserProfileServiceStub },
        BrowserService,
        { provide: Router, useValue: routerStub },
        provideMockStore({ initialState }),
        { provide: ConfigService, useClass: configServiceStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OtpVerificationPage);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    router = TestBed.inject(Router)
    spyOn(store, 'dispatch').and.callFake(() => { });

    mockData = {
      userAccount: null,
      shipmentDetails: {
        packageDetails: [],
        totalNumberOfPackages: 0,
        totalWeight: 0,
        serviceType: 'INTERNATIONAL_PRIORITY',
        serviceName: 'International Priority®',
        packagingType: 'YOUR_PACKAGING',
        serviceCode: '',
        advancedPackageCode: '',
        totalCustomsOrInvoiceValue: 10000,
        customsOrInvoiceValueCurrency: 'CNY',
        carriageDeclaredValue: null,
        carriageDeclaredValueCurrency: '',
        displayDate: '',
        shipDate: new Date(),
        selectedRate: {
          dayOfWeek: null,
          dateOfArrival: null,
          timeOfArrival: null,
          totalNetCharge: 44112.45,
          totalBaseCharge: 53632.16,
          surchargeList: [
            {
              type: 'FUEL',
              description: 'Fuel Surcharge',
              amount: [
                {
                  currency: 'CNY',
                  amount: 6569.94
                }
              ]
            }
          ],
          volumeDiscount: 16089.65,
          currency: 'CNY',
          saturdayDelivery: false
        },
        firstAvailableShipDate: null,
        lastAvailableShipDate: null,
        availableShipDates: [],
        selectedPackageOption: null,
        specialServiceInfo: {
          selectedSignatureOption: {
            key: 'SATURDAY_DELIVERY',
            displayText: 'Saturday Delivery'
          }
        }
      },
      customsDetails: {
        commodityList: [
          {
            name: '306',
            description: 'Apple TV',
            countryOfManufacture: 'China',
            quantity: 5,
            quantityUnits: 'BOX',
            qtyUnitLabel: 'Box',
            totalWeight: 200,
            totalWeightUnit: 'kg',
            totalWeightUnitLabel: 'Kilogram',
            totalCustomsValue: 10000,
            unitPrice: 'CNY',
            hsCode: 'HS3455'
          }
        ],
        customsType: 'nondoc',
        productType: '',
        productPurpose: 'SOLD',
        documentType: '',
        documentTypeCode: '',
        documentValue: 100,
        documentValueUnits: ''
      },
      senderDetails: {
        address1: 'Add1 sender',
        address2: 'add2 send',
        city: 'BEIJING',
        contactName: 'sender contac',
        countryCode: 'CN',
        countryName: 'China',
        postalCode: '100600',
        companyName: 'sender com',
        emailAddress: 'sender@send.com',
        postalAware: true,
        stateAware: false,
        phoneNumber: '999999999',
        saveContact: false,
        taxId: '09999999999'
      },
      recipientDetails: [
        {
          address1: 'Recipet add 1',
          address2: 'Recipentadd 2',
          address3: 'recieopsn add 3',
          residential: false,
          companyName: 'recispen co name',
          contactName: 'reci contact ame',
          city: 'CAMP WAREHOUSE',
          countryCode: 'AF',
          countryName: 'Afghanistan',
          postalAware: false,
          phoneNumber: '11111111111',
          phoneExt: '345',
          emailAddress: 'reciep@re.com',
          taxId: '222222222222',
          passportNumber: '',
          postalCode: ''
        }
      ],
      paymentDetails: {
        shippingBillTo: 'Pay at drop off',
        shippingBillToDisplayable: 'Pay at drop off',
        shippingAccountNumber: '000000000',
        shippingAccountNumberDisplayable: 'Pay at drop off',
        dutiesTaxesBillTo: 'Bill Recipient',
        dutiesTaxesBillToDisplayable: 'Bill Recipient',
        dutiesTaxesAccountNumber: '000000000',
        dutiesTaxesAccountNumberDisplayable: 'Bill Recipient'
      },
      shipmentConfirmation: null
    }
    const mockCommoditySelector = store.overrideSelector(fromShippingSelector.selectSummaryDetails, mockData);

  }));

  afterEach(() => {
    sessionStorage.clear();
    fixture.destroy();
  });

  fit('should create', fakeAsync(() => {
    expect(component).toBeTruthy();
  }));

  fit('form invalid when 1 field is empty', fakeAsync(() => {
    component.otpTimer = 100;
    component.ngOnInit();
    fixture.detectChanges();

    component.otpVerificationForm.controls.verificationcode1.setValue('1');
    component.otpVerificationForm.controls.verificationcode2.setValue('2');
    component.otpVerificationForm.controls.verificationcode3.setValue('3');
    component.otpVerificationForm.controls.verificationcode4.setValue('4');
    component.otpVerificationForm.controls.verificationcode5.setValue('5');
    component.otpVerificationForm.controls.verificationcode6.setValue('');
    tick(200);
    flush();

    expect(component.otpVerificationForm.valid).toBeFalsy();
  }));

  fit('form should be valid', fakeAsync(() => {
    component.otpTimer = 100;
    component.ngOnInit();
    fixture.detectChanges();

    component.otpVerificationForm.controls.verificationcode1.setValue('1');
    component.otpVerificationForm.controls.verificationcode2.setValue('2');
    component.otpVerificationForm.controls.verificationcode3.setValue('3');
    component.otpVerificationForm.controls.verificationcode4.setValue('4');
    component.otpVerificationForm.controls.verificationcode5.setValue('5');
    component.otpVerificationForm.controls.verificationcode6.setValue('6');
    tick(200);
    flush();
    expect(component.otpVerificationForm.valid).toBeTruthy();
  }));

  fit('should call getUserProfileOTP() from LoginUserProfileService', () => {
    spyOn(component.loginUserProfileService, 'getUserProfileOTP');
    component.getUserProfileId();
    expect(component.loginUserProfileService.getUserProfileOTP).toHaveBeenCalled();
  });

  fit('should display an error message and  Back to login page button after entering incorrect otp 5times', () => {
    component.ngOnInit();
    fixture.detectChanges();

    component.otpVerificationForm.controls.verificationcode1.setValue('1');
    component.otpVerificationForm.controls.verificationcode2.setValue('2');
    component.otpVerificationForm.controls.verificationcode3.setValue('3');
    component.otpVerificationForm.controls.verificationcode4.setValue('4');
    component.otpVerificationForm.controls.verificationcode5.setValue('5');
    component.otpVerificationForm.controls.verificationcode6.setValue('6');
    mockOtpValidateResponse.status = OtpRequestConstants.FAILED;
    component.failedAttempts = 5;
    component.verifyOTP();
    expect(component.showBackButton).toEqual(true);
  });

  fit('should get user Profile when otp validation success', () => {
    sessionStorage.setItem(SessionItems.MOBILENUMBER, '123456789');
    sessionStorage.setItem(SessionItems.DIALINGPREFIX, '+485');
    spyOn(component, 'getUserProfileId');
    fixture.detectChanges();
    component.otpVerificationForm.controls.verificationcode1.setValue('1');
    component.otpVerificationForm.controls.verificationcode2.setValue('2');
    component.otpVerificationForm.controls.verificationcode3.setValue('3');
    component.otpVerificationForm.controls.verificationcode4.setValue('4');
    component.otpVerificationForm.controls.verificationcode5.setValue('5');
    component.otpVerificationForm.controls.verificationcode6.setValue('6');
    mockOtpValidateResponse.status = OtpRequestConstants.SUCCESS;

    component.verifyOTP();
    component.getUserProfileId();
    expect(component.getUserProfileId).toHaveBeenCalled();
  });

  fit('should get store data when comes from Summary page.', fakeAsync(() => {
    sessionStorage.setItem(SessionItems.ISFROMSUMMARY, 'true');
    component.otpTimer = 100;
    component.ngOnInit();
    fixture.detectChanges();
    tick(200);
    flush(200);
    expect(component.shippingInfo).toEqual(mockData);
  }));

  fit('should update store values and dispatch updatePaymentsDetailsAction.', fakeAsync(() => {
    component.otpTimer = 100;
    component.ngOnInit();
    const paymentDetails = {
      shippingBillTo: BillingOptionsUtil.getPaymentType(BillingOptionsUtil.PAY_AT_DROP_OFF).value,
      shippingBillToDisplayable: BillingOptionsUtil.PAY_AT_DROP_OFF,
      shippingAccountNumber: '',
      shippingAccountNumberDisplayable: BillingOptionsUtil.PAY_AT_DROP_OFF,
      dutiesTaxesBillTo: BillingOptionsUtil.getPaymentType(BillingOptionsUtil.BILL_RECIPIENT).value,
      dutiesTaxesBillToDisplayable: BillingOptionsUtil.BILL_RECIPIENT,
      dutiesTaxesAccountNumber: '',
      dutiesTaxesAccountNumberDisplayable: BillingOptionsUtil.BILL_RECIPIENT
    }
    fixture.detectChanges();
    component.clickAgreeToProceed();
    tick(200);
    flush(200);
    expect(store.dispatch).toHaveBeenCalledWith(updatePaymentsDetailsAction({ paymentDetails: paymentDetails }));
  }));

  fit('should show confirm popup on cancel shipment click.', fakeAsync(() => {
    component.otpTimer = 100;
    component.ngOnInit();
    spyOn(component, 'presentAlertConfirm');
    fixture.detectChanges();
    component.onClickCancelShipment();
    tick(200);
    flush(200);
    expect(component.presentAlertConfirm).toHaveBeenCalled();
  }));

  fit('should navigate to step zero on click of Cofirm button on popup.', fakeAsync(() => {
    component.otpTimer = 100;
    component.ngOnInit();
    fixture.detectChanges();
    component.onConfirmClicked();
    tick(200);
    flush(200);
    expect(routerStub.navigateByUrl).toHaveBeenCalledWith('/shipping/shipment-details');
  }));

  fit('should have call create shipment when otp validation success', fakeAsync(() => {
    component.otpTimer = 100;
    component.ngOnInit();
    fixture.detectChanges();
    component.otpVerificationForm.controls.verificationcode1.setValue('1');
    component.otpVerificationForm.controls.verificationcode2.setValue('2');
    component.otpVerificationForm.controls.verificationcode3.setValue('3');
    component.otpVerificationForm.controls.verificationcode4.setValue('4');
    component.otpVerificationForm.controls.verificationcode5.setValue('5');
    component.otpVerificationForm.controls.verificationcode6.setValue('6');
    mockOtpValidateResponse.status = OtpRequestConstants.SUCCESS;
    spyOn(component, 'createShipment');
    component.isFromSummaryPage = true;
    fixture.detectChanges();
    component.verifyOTP();
    tick(200);
    flush(200);
    expect(component.createShipment).toHaveBeenCalled();
  }));

  fit('should hide back arrow button after entering incorrect otp 5 times', () => {
    component.ngOnInit();
    fixture.detectChanges();

    component.otpVerificationForm.controls.verificationcode1.setValue('1');
    component.otpVerificationForm.controls.verificationcode2.setValue('2');
    component.otpVerificationForm.controls.verificationcode3.setValue('3');
    component.otpVerificationForm.controls.verificationcode4.setValue('4');
    component.otpVerificationForm.controls.verificationcode5.setValue('5');
    component.otpVerificationForm.controls.verificationcode6.setValue('6');
    mockOtpValidateResponse.status = OtpRequestConstants.FAILED;
    component.failedAttempts = 5;
    component.isFromSummaryPage = true;
    component.verifyOTP();
    expect(component.hideFailedVarificationPage).toEqual(false);
  });

  fit('should call resend otp.', fakeAsync(() => {
    component.otpTimer = 1000;
    component.ngOnInit();
    fixture.detectChanges();

    component.otpVerificationForm.controls.verificationcode1.setValue('1');
    component.otpVerificationForm.controls.verificationcode2.setValue('2');
    component.otpVerificationForm.controls.verificationcode3.setValue('3');
    component.otpVerificationForm.controls.verificationcode4.setValue('4');
    component.otpVerificationForm.controls.verificationcode5.setValue('5');
    component.otpVerificationForm.controls.verificationcode6.setValue('6');
    component.resendOTP();
    expect(component.resendOTPFlag).toEqual(false);
    tick(2000);
    flush();
    expect(component.resendOTPFlag).toEqual(true);
    expect(sessionStorage.getItem(HttpHeaderKey.TX_ID)).toEqual('tgvNn1plq75wYfPkhNKJMZfcid8rJd9c');
  }));

  fit('should unsubscribe timer when not on verification page.', fakeAsync(() => {
    component.otpTimer = 5000;
    routerStub.routerState.snapshot.url = '/account/otp';
    spyOn(component.timerSubs, 'unsubscribe');
    component.ngOnInit();
    fixture.detectChanges();

    component.startOTPTimer();
    tick(2000);
    flush();
    expect(component.timerSubs.unsubscribe).toHaveBeenCalled();

  }));

  fit('should limit length of string of input to 1.', fakeAsync(() => {
    component.otpTimer = 100;
    component.ngOnInit();
    fixture.detectChanges();
    component.verificationcodeInput1 = component.otpVerificationForm.controls.verificationcode1;
    component.otpVerificationForm.controls.verificationcode1.setValue('123');
    component.limitLength(component.verificationcodeInput1);
    tick(200);
    flush();
    expect(component.otpVerificationForm.controls.verificationcode1.value).toEqual('1');
  }));

  fit('should call action handler for create shipment API', () => {
    spyOn(component, 'handleCreateShipmentApiSuccess');
    component.otpTimer = 100;
    sessionStorage.setItem(SessionItems.ISFROMSUMMARY, 'true');
    component.ngOnInit();
    expect(component.handleCreateShipmentApiSuccess).toHaveBeenCalled();
  });

  fit('should navigate to thank you page on create shipment API call success', fakeAsync(() => {
    sessionStorage.setItem(SessionItems.ISFROMSUMMARY, 'true');
    const mockSuccessSelector = store.overrideSelector(fromShippingSelector.selectCreateShipmentSuccess, mockSuccessValue);
    component.otpTimer = 100;
    component.ngOnInit();
    fixture.detectChanges();
    component.createShipment();
    tick(100);
    flush();
    expect(routerStub.navigateByUrl).toHaveBeenCalledWith('/shipping/thank-you');
  }));

  fit('should error message after entering incorrect otp', () => {
    component.ngOnInit();
    fixture.detectChanges();

    component.otpVerificationForm.controls.verificationcode1.setValue('1');
    component.otpVerificationForm.controls.verificationcode2.setValue('2');
    component.otpVerificationForm.controls.verificationcode3.setValue('3');
    component.otpVerificationForm.controls.verificationcode4.setValue('4');
    component.otpVerificationForm.controls.verificationcode5.setValue('5');
    component.otpVerificationForm.controls.verificationcode6.setValue('6');
    mockOtpValidateResponse.status = OtpRequestConstants.FAILED;
    component.verifyOTP();
    expect(component.showErrorMessage).toEqual(true);
  });

  fit('should hide some label and verify button after entering incorrect otp 5times', () => {
    component.ngOnInit();
    fixture.detectChanges();

    component.otpVerificationForm.controls.verificationcode1.setValue('1');
    component.otpVerificationForm.controls.verificationcode2.setValue('2');
    component.otpVerificationForm.controls.verificationcode3.setValue('3');
    component.otpVerificationForm.controls.verificationcode4.setValue('4');
    component.otpVerificationForm.controls.verificationcode5.setValue('5');
    component.otpVerificationForm.controls.verificationcode6.setValue('6');
    spyOn(component, 'saveMobileNumberWithExpiry');
    mockOtpValidateResponse.status = OtpRequestConstants.FAILED;
    const mobileNumber = component.mobileNumber;
    component.failedAttempts = 5;
    component.verifyOTP();
    expect(component.showBackButton).toEqual(true);
    expect(component.showErrorMessage).toEqual(false);
    expect(component.saveMobileNumberWithExpiry).toHaveBeenCalledWith('suspendedNumber', mobileNumber, 86400000);
  });

  fit('should hide error message', () => {
    component.hideErrorMessage();
    expect(component.showErrorMessage).toEqual(false);
  })

  fit('should call alertController create', () => {
    spyOn(component.alertController, 'create');
    component.presentAlertConfirm();
    expect(component.alertController.create).toHaveBeenCalled();
  })
});