import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Subscription, timer, interval } from 'rxjs';
import { AppState } from 'src/app/+store/app.state';
import { BrowserService } from 'src/app/core/providers/browser.service';
import { environment } from 'src/environments/environment';
import { postCreateShipmentBegin, resetNewShippingAction, updatePaymentsDetailsAction } from '../../shipping/+store/shipping.actions';

import { AlertController, IonInput } from '@ionic/angular';
import { P4eOtpService } from 'src/app/core/providers/local/p4e-otp.service';
import { OtpRequestConstants } from 'src/app/types/constants/otp-request.constants';
import { ShippingInfo } from '../../shipping/+store/shipping.state';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import * as fromShippingSelector from '../../shipping/+store/shipping.selectors';
import { IPayment } from 'src/app/interfaces/shipping-app/payment';
import { BillingOptionsUtil } from 'src/app/types/constants/billing-and-service-options.constants';
import { CreateShipmentResponse } from 'src/app/interfaces/api-service/response/create-shipment-response';
import { LoginUserProfileService } from '../../../providers/login-user-profile.service';
import { HttpHeaderKey } from 'src/app/types/enum/http-header-key.enum';
import { SessionItems } from 'src/app/types/enum/session-items.enum';
import { ConfigService } from '@ngx-config/core';

@Component({
  selector: 'otp-verification',
  templateUrl: './otp-verification.page.html',
  styleUrls: ['./otp-verification.page.scss'],
})
export class OtpVerificationPage implements OnInit {

  @Input() backNavigation = '../../otp';
  @ViewChild('verificationcodeInput1') verificationcodeInput1: any;
  @ViewChild('verificationcodeInput2') verificationcodeInput2: any;
  @ViewChild('verificationcodeInput3') verificationcodeInput3: any;
  @ViewChild('verificationcodeInput4') verificationcodeInput4: any;
  @ViewChild('verificationcodeInput5') verificationcodeInput5: any;
  @ViewChild('verificationcodeInput6') verificationcodeInput6: any;

  otpVerificationForm: FormGroup;
  resendOTPFlag = false;
  otpTimer = environment.otpTimeout;
  routeNavSubscription: Subscription;
  subs: Subscription;
  timerSubs: Subscription;
  mobileNumber = '';
  dialingPrefix = '';
  countryCode = '';
  failedAttempts = 0;
  showBackButton = false;
  showErrorMessage: boolean;
  mobileNumberSuspended: any[] = [];
  isFromSummaryPage = false;
  shippingInfo: ShippingInfo;
  hideFailedVarificationPage = true;
  userProfile = null;
  userId = null;
  userAcceptedTC: string;
  timerText: string = '';

  constructor(
    public router: Router,
    private formBuilder: FormBuilder,
    private appStore: Store<AppState>,
    private browserService: BrowserService,
    public loginUserProfileService: LoginUserProfileService,
    private translate: TranslateService,
    public alertController: AlertController,
    public translatePipe: TranslatePipe,
    private readonly config: ConfigService,
    public p4eOtpService: P4eOtpService) {
    this.subs = new Subscription();
    this.timerSubs = new Subscription();
    this.routeNavSubscription = this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationEnd) {
        this.timerText = '';
        this.startOTPTimer();
        // Initializes the form when the page reroutes to this page
        this.otpVerificationForm.reset();
        this.resendOTPFlag = false;
        if (this.browserService.isbrowser) {
          this.getSessionItems();
        }
        timer(environment.textFieldFocusDelay).subscribe(val => this.verificationcodeInput1 ? this.verificationcodeInput1.setFocus() : null);
      }
    });
  }

  ngOnInit() {
    this.otpVerificationForm = this.formBuilder.group({
      verificationcode1: ['', [Validators.required]],
      verificationcode2: ['', [Validators.required]],
      verificationcode3: ['', [Validators.required]],
      verificationcode4: ['', [Validators.required]],
      verificationcode5: ['', [Validators.required]],
      verificationcode6: ['', [Validators.required]]
    });

    if (this.browserService.isbrowser) {
      this.getSessionItems();
    }
    this.checkRedirectedFromSummary();
  }

  ngOnDestroy() {
    if (this.subs) {
      this.subs.unsubscribe();
      this.timerSubs?.unsubscribe();
    }
  }

  get form() {
    return this.otpVerificationForm.controls;
  }

  startOTPTimer() {
    let OtpTimer = String(this.otpTimer / 1000 + 1);
    if (this.router.routerState.snapshot.url === '/account/otp-verification') {
      this.timerSubs = new Subscription();
      this.timerSubs.add(interval(1000).subscribe(time => {
        if (time === this.otpTimer / 1000) {
          this.timerSubs.unsubscribe();
          this.resendOTPFlag = true;
        }
        OtpTimer = ((Number(OtpTimer) - 1).toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false }));
        const message = this.translatePipe.transform(this.translate.instant(`otp.enterOneTimePwdDetails`, { TIME: OtpTimer }));
        this.timerText = message;
      }));
    } else {
      this.timerSubs?.unsubscribe();
    }
  }

  getSessionItems() {
    this.dialingPrefix = sessionStorage.getItem(SessionItems.DIALINGPREFIX);
    this.mobileNumber = sessionStorage.getItem(SessionItems.MOBILENUMBER);
    this.countryCode = sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);
  }

  // Limits lengh of string to 1 for each verification input
  limitLength(ionInput: IonInput) {
    const maxLength = 1;
    if (ionInput.value.toString().length > maxLength) {
      ionInput.value = ionInput.value.toString().slice(0, maxLength);
    }
  }

  // Focuses on the next verification input field and checks the form's status
  setFocus(currentInput: IonInput, nextInput: IonInput) {
    this.limitLength(currentInput);
    if (currentInput.value !== '' && nextInput.value === '') {
      nextInput.setFocus();
    }
  }

  // Verify OTP button
  verifyOTP() {
    const otpEntered = [this.otpVerificationForm.get('verificationcode1').value, this.otpVerificationForm.get('verificationcode2').value, this.otpVerificationForm.get('verificationcode3').value, this.otpVerificationForm.get('verificationcode4').value, this.otpVerificationForm.get('verificationcode5').value, this.otpVerificationForm.get('verificationcode6').value];
    if (this.otpVerificationForm.valid) {
      const token = otpEntered.join('').toString();
      this.p4eOtpService.validateOtp(token).subscribe(response => {
        if (response.status === OtpRequestConstants.SUCCESS) {
          if (!this.isFromSummaryPage) {
            this.getUserProfileId();
          } else {
            this.createShipment();
          }

        } if (response.status === OtpRequestConstants.FAILED && this.failedAttempts <= 5) {
          this.showErrorMessage = true;
          this.failedAttempts += 1;
          if (this.failedAttempts >= 5 && !this.isFromSummaryPage) {
            this.showBackButton = true;
            this.showErrorMessage = false;
            this.saveMobileNumberWithExpiry('suspendedNumber', this.mobileNumber, 86400000);
          } else if (this.failedAttempts >= 5 && this.isFromSummaryPage) {
            this.hideFailedVarificationPage = false;
          }
        }
      });
    }
  }

  // Resend OTP button
  resendOTP() {
    this.resendOTPFlag = false;
    this.otpVerificationForm.reset();
    this.verificationcodeInput1?.setFocus();
    this.p4eOtpService.generateOtp(this.mobileNumber, this.countryCode).subscribe(response => {
      if (response.otpPhoneDeliveryRes.sendStatus === OtpRequestConstants.SUCCESS) {
        if (this.browserService.isbrowser) {
          sessionStorage.setItem(SessionItems.MOBILENUMBER, this.mobileNumber);
        }
        this.startOTPTimer();
        sessionStorage.setItem(HttpHeaderKey.TX_ID, response.txId);
      }
    });
  }

  getUserProfileId() {
    this.loginUserProfileService.getUserProfileOTP();
  }

  saveMobileNumberWithExpiry(key, value, duration) {
    const now = new Date();
    if (localStorage.getItem('suspendedNumber')) {
      this.mobileNumberSuspended = JSON.parse(localStorage.getItem('suspendedNumber'));
    }
    this.mobileNumberSuspended.push({
      mobileNumber: value,
      suspendedUntil: now.getTime() + duration
    });
    localStorage.setItem(key, JSON.stringify(this.mobileNumberSuspended));
  }

  hideErrorMessage() {
    this.showErrorMessage = false;
  }

  /** Below functionality for OTP validation when
     redirceted from summary page. 
  **/
  checkRedirectedFromSummary() {
    this.isFromSummaryPage = Boolean(sessionStorage.getItem(SessionItems.ISFROMSUMMARY));
    if (this.isFromSummaryPage) {
      this.handleCreateShipmentApiSuccess();
      this.subs.add(this.appStore.pipe(select(fromShippingSelector.selectSummaryDetails))
        .subscribe((shippingInfo: ShippingInfo) => {
          if (shippingInfo) {
            this.shippingInfo = shippingInfo;
          }
        }));
    }
  }

  clickAgreeToProceed() {
    this.appStore.dispatch(updatePaymentsDetailsAction({
      paymentDetails: this.mapPaymentDetailsToShippingAppModel()
    }));
    this.createShipment();
  }

  createShipment() {
    setTimeout(() => {
      this.appStore.dispatch(postCreateShipmentBegin({
        shipmentDetails: this.shippingInfo
      }));
    }, 100);
  }

  private mapPaymentDetailsToShippingAppModel(): IPayment {
    return {
      shippingBillTo: BillingOptionsUtil.getPaymentType(BillingOptionsUtil.PAY_AT_DROP_OFF).value,
      shippingBillToDisplayable: BillingOptionsUtil.PAY_AT_DROP_OFF,
      shippingAccountNumber: '',
      shippingAccountNumberDisplayable: BillingOptionsUtil.PAY_AT_DROP_OFF,
      dutiesTaxesBillTo: BillingOptionsUtil.getPaymentType(BillingOptionsUtil.BILL_RECIPIENT).value,
      dutiesTaxesBillToDisplayable: BillingOptionsUtil.BILL_RECIPIENT,
      dutiesTaxesAccountNumber: '',
      dutiesTaxesAccountNumberDisplayable: BillingOptionsUtil.BILL_RECIPIENT
    };
  }

  onClickCancelShipment() {
    this.presentAlertConfirm();
  }

  async presentAlertConfirm() {
    const applyArialFont = this.config.getSettings('ARIAL_FONT_LANGUAGE_LIST').includes(sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE)) ? true : false;
    const alert = await this.alertController.create({
      cssClass: applyArialFont ? 'arial-font' : '',
      subHeader: this.translate.instant('otp.cancelShipmentConfirmMessage'),
      buttons: [
        {
          cssClass: applyArialFont ? 'arial-font' : '',
          text: this.translate.instant('button.no')
        }, {
          cssClass: applyArialFont ? 'arial-font' : '',
          text: this.translate.instant('button.confirm'),
          handler: () => {
            this.onConfirmClicked();
          }
        }
      ]
    });
    await alert?.present();
  }

  handleCreateShipmentApiSuccess() {
    this.subs.add(
      this.appStore.pipe(select(fromShippingSelector.selectCreateShipmentSuccess)).subscribe((shipmentSuccess: CreateShipmentResponse) => {
        if (shipmentSuccess) {
          this.navigateToThankYouPage();
        }
      })
    );
  }

  navigateToThankYouPage() {
    this.router.navigateByUrl('/shipping/thank-you');
  }

  onConfirmClicked() {
    sessionStorage.removeItem(SessionItems.ISFROMSUMMARY);
    this.router.navigateByUrl('/shipping/shipment-details');
    this.appStore.dispatch(resetNewShippingAction());
    sessionStorage.setItem(SessionItems.NEWSHIPMENT, 'true');
  }
}
