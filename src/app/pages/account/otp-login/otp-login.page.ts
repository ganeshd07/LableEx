import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BrowserService } from 'src/app/core/providers/browser.service';
import { IonInput } from '@ionic/angular';
import { select, Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { AppState } from 'src/app/+store/app.state';
import { getCountryDialingPrefixesBegin } from '../../shipping/+store/shipping.actions';
import * as fromShippingSelector from '../../shipping/+store/shipping.selectors';
import { OtpRequestConstants } from 'src/app/types/constants/otp-request.constants';
import { P4eOtpService } from 'src/app/core/providers/local/p4e-otp.service';
import { TranslateService } from '@ngx-translate/core';
import { HttpHeaderKey } from 'src/app/types/enum/http-header-key.enum';
import { SessionItems } from 'src/app/types/enum/session-items.enum';

const SELECT_OPTS_DEFAULT = { disabled: true };
@Component({
  selector: 'app-otp-login',
  templateUrl: './otp-login.page.html',
  styleUrls: ['./otp-login.page.scss'],
})

export class OtpLoginPage implements OnInit {

  @Input() backNavigation = '/login';
  @ViewChild('countryCodeInput') countryCodeInput: any;
  @ViewChild('mobileNumberInput') mobileNumberInput: any;
  otpLoginForm: FormGroup;
  private subs: Subscription;
  phoneNumberMin = 5;
  isPhoneNumberValid = false;
  showErrorMessage = false;
  isFromSummary = false;

  constructor(
    public formBuilder: FormBuilder,
    private router: Router,
    public browserService: BrowserService,
    private appStore: Store<AppState>,
    private p4eOtpService: P4eOtpService,
    public translate: TranslateService
  ) {
    this.subs = new Subscription();
  }

  ngOnInit() {
    this.otpLoginForm = this.formBuilder.group({
      countryCode: ['', SELECT_OPTS_DEFAULT],
      mobileNumber: ['', [Validators.required, Validators.minLength(5), Validators.max(999999999999999)]],
    });
    this.getCountryDialingPrefixes();
    if (this.browserService.isbrowser) {
      this.assignDialingPrefix();
    }
    this.checkRedirectedFromSummary();
  }

  ngOnDestroy() {
    if (this.subs) {
      this.subs.unsubscribe();
    }
  }

  assignDialingPrefix() {
    this.subs.add(
      this.appStore.pipe(select(fromShippingSelector.selectCountryDialingPrefix))
        .subscribe(dialingCode => {
          if (dialingCode) {
            const dialingPrefixList = dialingCode.countryPrefix;
            const selectedCountry = sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);
            const countryDetails = dialingPrefixList.find(country => country.countryCode === selectedCountry);
            this.countryCode.setValue('+' + countryDetails.countryDialingCode);
            sessionStorage.setItem(SessionItems.DIALINGPREFIX, this.countryCode.value);
          }
        })
    );
  }

  getCountryDialingPrefixes() {
    this.appStore.dispatch(getCountryDialingPrefixesBegin());
  }

  get form() {
    return this.otpLoginForm.controls;
  }

  // Limits lengh of string to 15 for mobile number
  limitLength(text: IonInput) {
    const maxLength = 15;
    if (text.value.toString().length > maxLength) {
      text.value = text.value.toString().slice(0, maxLength);
    }

    if (text.value.toString().length < this.phoneNumberMin && text.value.toString().length >= 1) {
      this.isPhoneNumberValid = false;
    } else {
      this.isPhoneNumberValid = true;
    }
  }

  validateMobile() {
    if (this.otpLoginForm.valid) {
      const countryCode = sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);
      const phoneNumber = this.mobileNumber.value.toString();
      if (localStorage.getItem('suspendedNumber')) {
        this.getMobileNumberWithExpiry(phoneNumber);
      }

      this.p4eOtpService.generateOtp(phoneNumber, countryCode).subscribe(response => {
        if (response.otpPhoneDeliveryRes.sendStatus === OtpRequestConstants.SUCCESS) {
          if (this.browserService.isbrowser) {
            sessionStorage.setItem(SessionItems.MOBILENUMBER, this.mobileNumber.value);
          }
          sessionStorage.setItem(HttpHeaderKey.TX_ID, response.txId);
          this.router.navigateByUrl('/account/otp-verification');
        }
      });
    }
  }

  get countryCode() {
    return this.otpLoginForm && this.otpLoginForm.get('countryCode');
  }

  get mobileNumber() {
    return this.otpLoginForm && this.otpLoginForm.get(SessionItems.MOBILENUMBER);
  }

  getMobileNumberWithExpiry(mobileNumber) {
    let mobileNumberSuspended = JSON.parse(localStorage.getItem('suspendedNumber'));
    const now = new Date();
    mobileNumberSuspended = mobileNumberSuspended?.filter(item => (item.suspendedUntil > now.getTime()));
    const mobile = mobileNumberSuspended?.find(val => val.mobileNumber === mobileNumber);
    if (mobile !== undefined) {
      if (now.getTime() < mobile.suspendedUntil) {
        this.showErrorMessage = true;
      }
    }
    localStorage.setItem('suspendedNumber', JSON.stringify(mobileNumberSuspended));
  }

  hideErrorMessage() {
    this.showErrorMessage = false;
  }

  checkRedirectedFromSummary() {
    this.isFromSummary = Boolean(sessionStorage.getItem(SessionItems.ISFROMSUMMARY));
    this.backNavigation = this.isFromSummary ? '/shipping/summary' : '/login';
  }
}
