import { HttpClient } from '@angular/common/http';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { IonicModule } from '@ionic/angular';
import { NotificationService } from 'src/app/core/providers/notification-service';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { LanguageLoader } from 'src/app/app.module';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { AppState } from 'src/app/+store/app.state';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import * as fromShippingSelector from './../+store/shipping.selectors';
import { ShipmentFeedbackResponse } from 'src/app/interfaces/api-service/response/shipment-feedback-response';
import { postShipmentFeedbackBegin } from '../+store/shipping.actions';
import { ThankYouPage } from './thank-you.page';
import { ThankYouPageConstants } from '../../../../app/types/constants/thank-you-page.constants';
import { ReactiveFormsModule } from '@angular/forms';
import { CreateShipmentResponse } from 'src/app/interfaces/api-service/response/create-shipment-response';
import { SessionItems } from 'src/app/types/enum/session-items.enum';
import * as testConfig from '../../../../assets/config/mockConfigForTest';
import { ConfigService } from '@ngx-config/core';

fdescribe('ThankYouPage', () => {
  let component: ThankYouPage;
  let fixture: ComponentFixture<ThankYouPage>;
  const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl', 'navigate', 'then']);
  const mockSuccessValue: ShipmentFeedbackResponse = {
    scoreId: '82365'
  };
  const mockShipmentSuccessData: CreateShipmentResponse = {
    shipmentId: '82365',
    shipmentRefNumber: 'CN1221355799',
    barcodeURI: 'https://wwwdrt.idev.fedex.com/mobileshipping/qrCode?refNumber=CN1221355799'
  };
  const mockErrorValue = {
    error: {
      error: 'Internal Server Error',
      errorCode: 500
    }
  };
  let mockStore: MockStore;
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
      declarations: [ThankYouPage],
      imports: [
        IonicModule.forRoot(),
        HttpClientTestingModule,
        RouterTestingModule,
        ReactiveFormsModule,
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
        provideMockStore({ initialState }),
        NotificationService,
        { provide: Router, useValue: routerSpy },
        { provide: ConfigService, useClass: ConfigServiceStub },
        provideMockStore({ initialState })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ThankYouPage);
    mockStore = TestBed.inject(MockStore);
    component = fixture.componentInstance;
    spyOn(mockStore, 'dispatch').and.callFake(() => { });
    fixture.detectChanges();
  }));

  beforeEach(() => {
    const mockShipmentSuccessSelector = mockStore.overrideSelector(
      fromShippingSelector.selectShipmentFeedbackSuccess, mockShipmentSuccessData);
    const mockErrorSelector = mockStore.overrideSelector(fromShippingSelector.selectCreateShipmentFailure, mockErrorValue);
    const mockSuccessSelector = mockStore.overrideSelector(fromShippingSelector.selectShipmentFeedbackSuccess, mockSuccessValue);
  });

  fit('should create', () => {
    expect(component).toBeTruthy();
  });

  fit('should get shipment id, reference id and QR code url from store and add handle success listener.', () => {
    spyOn(component, 'getFinalizedShipmentData');
    spyOn(component, 'handleSubmitFeedbackSuccess');
    component.ngOnInit();
    expect(component.getFinalizedShipmentData).toHaveBeenCalled();
    expect(component.handleSubmitFeedbackSuccess).toHaveBeenCalled();
  });

  fit('should assign selected rating value on click on star rating', () => {
    component.selectStarRating(4);
    expect(component.starRatings).toEqual(4);
  });

  fit('should open location url in new window.', () => {
    spyOn(window, 'open').and.callThrough();
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en_cn');
    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'CN');
    component.pageConstants = ThankYouPageConstants;
    fixture.detectChanges();
    component.onClickFindLocation();

    expect(window.open).toHaveBeenCalledWith('https://local.fedex.com/en-cn/', '_blank');
  });

  fit('should open location url in new window.', () => {
    spyOn(window, 'open').and.callThrough();
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'zh_cn');
    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'CN');
    component.pageConstants = ThankYouPageConstants;
    fixture.detectChanges();
    component.onClickFindLocation();

    expect(window.open).toHaveBeenCalledWith('https://local.fedex.com/zh-cn/', '_blank');
  });

  fit('should retun formatted url as per language and country', () => {
    const urlHK = component.getLocalFormattedUrl(component.pageConstants.HK);
    expect(urlHK).toEqual('https://local.fedex.com/zh-hk/');

    const urlID = component.getLocalFormattedUrl(component.pageConstants.ID);
    expect(urlID).toEqual('https://local.fedex.com/id-id/');

    const urlJP = component.getLocalFormattedUrl(component.pageConstants.JP);
    expect(urlJP).toEqual('https://local.fedex.com/ja-jp/');

    const urlKR = component.getLocalFormattedUrl(component.pageConstants.KR);
    expect(urlKR).toEqual('https://local.fedex.com/ko-kr/');

    const urlTH = component.getLocalFormattedUrl(component.pageConstants.TH);
    expect(urlTH).toEqual('https://local.fedex.com/th-th/');

    const urlTW = component.getLocalFormattedUrl(component.pageConstants.TW);
    expect(urlTW).toEqual('https://local.fedex.com/zh-tw/');

    const urlVN = component.getLocalFormattedUrl(component.pageConstants.VN);
    expect(urlVN).toEqual('https://local.fedex.com/vi-vn/');

    const urlDefault = component.getLocalFormattedUrl('US');
    expect(urlDefault).toEqual('https://local.fedex.com/en-US/');
  });

  fit('should have been dispatch action on submit feedback clicked.', () => {
    component.ngOnInit();
    component.thankYouForm.controls.commentText.setValue('Very good experience');
    component.starRatings = 5;
    fixture.detectChanges();
    component.submitFeedback();

    expect(mockStore.dispatch).toHaveBeenCalledWith(postShipmentFeedbackBegin({
      shipmentId: component.shipmentData.shipmentId,
      comment: component.thankYouForm.controls.commentText.value,
      score: component.starRatings.toString()
    }));
  });

  fit('should not have been dispatch action on submit feedback clicked when comment is blank.', () => {
    component.ngOnInit();
    component.thankYouForm.controls.commentText.setValue('');
    component.starRatings = 5;
    fixture.detectChanges();
    component.submitFeedback();

    expect(mockStore.dispatch).not.toHaveBeenCalledWith(postShipmentFeedbackBegin({
      shipmentId: component.shipmentData.shipmentId,
      comment: component.thankYouForm.controls.commentText.value,
      score: component.starRatings.toString()
    }));
  });

  fit('should not have been dispatch action on submit feedback clicked when comment is more than 450.', () => {
    component.ngOnInit();
    const longComment = 'Test long comment. Test long comment. Test long comment. Test long comment. Test long comment. Test long comment. Test long comment. '
      + 'Test long comment. Test long comment. Test long comment. Test long comment. Test long comment. Test long comment. Test long comment. Test long comment. '
      + 'Test long comment. Test long comment. Test long comment. Test long comment. Test long comment. Test long comment. Test long comment. Test long comment. '
      + 'Test long comment. ';
    component.thankYouForm.controls.commentText.setValue(longComment);
    component.starRatings = 5;
    fixture.detectChanges();
    component.submitFeedback();

    expect(component.thankYouForm.controls.commentText.value.length).toBeGreaterThan(450);
    expect(mockStore.dispatch).not.toHaveBeenCalledWith(postShipmentFeedbackBegin({
      shipmentId: component.shipmentData.shipmentId,
      comment: component.thankYouForm.controls.commentText.value,
      score: component.starRatings.toString()
    }));
  });

  fit('should hide rating block on feedback successfully submitted.', fakeAsync(() => {
    component.ngOnInit();
    component.thankYouForm.controls.commentText.setValue('Very good experience');
    component.starRatings = 5;
    fixture.detectChanges();
    component.submitFeedback();
    tick();
    expect(component.commentArea).toBe(false);
  }));

  fit('should get the finalized shipment data', () => {
    mockStore.overrideSelector(fromShippingSelector.selectCreateShipmentSuccess, mockShipmentSuccessData);
    component.getFinalizedShipmentData();
    expect(component.shipmentData).toEqual(mockShipmentSuccessData);
  });
});
