import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { AppState } from 'src/app/+store/app.state';
import { ISender } from 'src/app/interfaces/shipping-app/sender';
import { SenderForm } from 'src/app/interfaces/shipping-form/sender-form';
import { getCountryDialingPrefixesBegin, updateSenderAddressDetailsBegin, postSenderAddressDetailsBegin, saveSenderAddressAction } from '../+store/shipping.actions';
import { StepTypes } from '../../../types/enum/step-type.enum';
import * as fromShippingSelector from '../+store/shipping.selectors';
import { InputTypeConstants } from 'src/app/types/constants/input-type-constants';
import { IonInput } from '@ionic/angular';
import { PhoneNumberLimitTypes } from 'src/app/types/enum/phone-number-limit-type.enum';
import { AddressTypes } from 'src/app/types/enum/address-type.enum';
import { IUser } from 'src/app/interfaces/shipping-app/user';
import { ConfigService } from '@ngx-config/core';

@Component({
  selector: 'app-step3-sender-details',
  templateUrl: './step3-sender-details.page.html',
  styleUrls: ['./step3-sender-details.page.scss'],
})
export class Step3SenderDetailsPage implements OnInit, OnDestroy {
  // Workaround for input focus() on ion-input fields
  @ViewChild('addressLine1Input', { static: false }) addressLine1Input: { setFocus: () => void; };
  @ViewChild('contactNameInput', { static: false }) contactNameInput: { setFocus: () => void; };
  @ViewChild('phoneNumberInput', { static: false }) phoneNumberInput: { setFocus: () => void; };
  @ViewChild('emailInput', { static: false }) emailInput: { setFocus: () => void; };

  currentStep: string = StepTypes.STEP3;
  backNavPath = '/shipping/customs-details'; // TODO: change to navstepper component route
  backbuttonFlag = true;

  senderForm: FormGroup;

  private subs: Subscription;
  countryCityPostalDisplay: string;
  currentCountryCode: string;
  countryDetails: any;
  dialingPrefix: any[];
  dialingPrefixValue: string;
  senderDetails: ISender;
  inputConstants = InputTypeConstants;
  phoneNumberMin = PhoneNumberLimitTypes.DEFAULT_MIN;
  isPhoneNumberValid = true;
  userId: string = null;
  editSenderPageDetails = false;
  isTaxIdRequiredValidator = false;

  constructor(
    public formBuilder: FormBuilder,
    private appStore: Store<AppState>,
    private router: Router,
    private el: ElementRef,
    private config: ConfigService

  ) {
    this.subs = new Subscription();
  }

  ngOnInit() {
    this.isTaxIdRequiredValidator = true;
    this.senderForm = this.formBuilder.group({
      addressLine1: ['', [Validators.required, Validators.minLength(3)]],
      addressLine2: ['', [Validators.minLength(3)]],
      contactName: ['', [Validators.required, Validators.minLength(3)]],
      companyName: ['', [Validators.minLength(3)]],
      phoneNumber: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(12)]],
      email: ['', [Validators.required, Validators.pattern('[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}')]],
      taxId: ['', {Validators:[Validators.maxLength(18)],updateOn: 'blur'}]
    });

    this.getUserAccountDetails();
    this.addListenerForEditFromSummary();
    this.getCountryDialingPrefixes();
    this.initSenderDetails();
  }

  conditionallyRequiredValidator() {
    this.senderForm.controls.taxId.setValidators([Validators.required, Validators.maxLength(18), Validators.min(99999999999999)]);
    this.senderForm.updateValueAndValidity();
  }

  ngOnDestroy() {
    if (this.subs) {
      this.subs.unsubscribe();
    }
  }

  getUserAccountDetails() {
    this.subs.add(this.appStore.pipe(select(fromShippingSelector.selectUserLoginDetails))
      .subscribe((userloginDetails: IUser) => {
        if (userloginDetails) {
          this.userId = userloginDetails.userId;
        }
      }));
  }

  initSenderDetails() {
    const subsSenderDetails = this.appStore.pipe(select(fromShippingSelector.selectSenderDetails))
      .subscribe((senderDetailsState: ISender) => {
        if (senderDetailsState) {
          this.senderDetails = senderDetailsState;
          this.isTaxIdRequiredValidator = this.config.getSettings('MANDATORY_TAX_ID_COUNTRY_LIST').includes(this.senderDetails.countryCode) ? true : false;
          if (this.isTaxIdRequiredValidator) {
            this.conditionallyRequiredValidator();
          }
          this.populateSenderDetailsForm(senderDetailsState);
          this.initializeSenderDetailsFromStore(senderDetailsState);
        }
      });
    this.subs.add(subsSenderDetails);
  }

  onSubmit() {
    if (this.senderForm.valid && this.isPhoneNumberValid) {
      this.appStore.dispatch(saveSenderAddressAction({
        senderDetails: this.getShippingAppSenderDetails(this.senderForm)
      }));
      this.currentStep = StepTypes.STEP3;
      if (this.userId) {
        this.postUpdateSenderAddressDetails();
      } else {
        this.checkNavigationToPage();
      }
    } else {
      if (this.isPhoneNumberValid) {
        this.scrollToFirstInvalidControl();
      }
      else {
        this.setFocusOnFirstInvalidInput('phoneNumber');
      }
    }
  }

  postUpdateSenderAddressDetails() {
    if (this.senderDetails.partyId) {
      this.appStore.dispatch(updateSenderAddressDetailsBegin({
        senderAddressDetails: this.getShippingAppSenderDetails(this.senderForm),
        partyId: this.senderDetails.partyId,
        userId: this.userId
      }));
      this.checkNavigationToPage();
    } else {
      this.appStore.dispatch(postSenderAddressDetailsBegin({
        senderAddressDetails: this.getShippingAppSenderDetails(this.senderForm),
        addressType: AddressTypes.ADDRESS_DEFAULT_SENDER,
        userId: this.userId
      }));
      this.navigateToNextPage();
    }
  }

  checkNavigationToPage() {
    if (this.editSenderPageDetails) {
      this.editSenderPageDetails = false;
      this.router.navigate(['/', 'shipping', 'summary']);
    } else {
      this.editSenderPageDetails = false;
      this.navigateToNextPage();
    }
  }

  navigateToNextPage() {
    this.router.navigate(['/', 'shipping', 'recipient-details']);
  }

  private scrollToFirstInvalidControl() {
    const firstInvalidControl: HTMLElement = this.el.nativeElement.querySelector(
      'form .ng-invalid'
    );
    this.setFocusOnFirstInvalidInput(firstInvalidControl.id);
    this.senderForm.markAllAsTouched();
  }

  private setFocusOnFirstInvalidInput(inputId: string) {
    switch (inputId) {
      case 'contactName': {
        this.contactNameInput.setFocus();
        break;
      }
      case 'phoneNumber': {
        this.phoneNumberInput.setFocus();
        break;
      }
      case 'email': {
        this.emailInput.setFocus();
        break;
      }
      default: {
        this.addressLine1Input.setFocus();
        break;
      }
    }
  }

  // TODO: Retrieve other values below as necessary from shippingApp model for defaults
  getShippingAppSenderDetails(senderForm: FormGroup): ISender {
    const senderFormVal: SenderForm = this.senderForm.value;
    return {
      address1: senderFormVal.addressLine1,
      address2: senderFormVal.addressLine2,
      city: this.senderDetails.city,
      contactName: senderFormVal.contactName,
      countryCode: this.senderDetails.countryCode,
      countryName: this.senderDetails.countryName,
      postalCode: this.senderDetails.postalCode,
      companyName: senderFormVal.companyName,
      emailAddress: senderFormVal.email,
      postalAware: this.senderDetails.postalAware,
      stateAware: this.senderDetails.stateAware,
      phoneNumber: senderFormVal.phoneNumber,
      saveContact: false,
      stateOrProvinceCode: this.senderDetails.stateOrProvinceCode,
      taxId: senderFormVal.taxId,
      dialingPrefix: this.dialingPrefixValue,
      partyId: this.senderDetails.partyId
    };
  }

  private populateSenderDetailsForm(sender: ISender): void {
    this.form.addressLine1.setValue(sender.address1);
    this.form.addressLine2.setValue(sender.address2);
    this.form.contactName.setValue(sender.contactName);
    this.form.companyName.setValue(sender.companyName);
    this.form.phoneNumber.setValue(sender.phoneNumber);
    this.form.email.setValue(sender.emailAddress);
    this.form.taxId.setValue(sender.taxId);
  }

  get form() {
    return this.senderForm.controls;
  }

  getCountryDialingPrefixes() {
    this.appStore.dispatch(getCountryDialingPrefixesBegin());
  }

  initializeSenderDetailsFromStore(senderDetails: ISender) {
    this.populateSenderDetailsForm(senderDetails);
    this.countryCityPostalDisplay = this.getCountryCityPostalDisplay(senderDetails);
    this.currentCountryCode = senderDetails.countryCode;
    this.subs.add(
      this.appStore.pipe(select(fromShippingSelector.selectCountryDialingPrefix))
        .subscribe(dialingCode => {
          if (dialingCode) {
            this.dialingPrefix = dialingCode.countryPrefix;
            this.countryDetails = this.dialingPrefix.find(country => country.countryCode === this.currentCountryCode);
            this.dialingPrefixValue = this.countryDetails.countryDialingCode;
          }
        })
    );
  }

  getCountryCityPostalDisplay(senderDetails: ISender) {
    const countryName = (senderDetails.countryName) ? senderDetails.countryName.concat(', ') : '';
    const postalCode = (senderDetails.postalCode) ? senderDetails.postalCode : '';
    const city = (senderDetails.city) ? ' '.concat(senderDetails.city).concat(' ') : '';
    return countryName.concat(city).concat(postalCode);
  }

  // Limits lengh of string of ion-input
  limitLength(text: IonInput, length: number) {
    const maxLength = length;
    if (text.value.toString().length > maxLength) {
      text.value = text.value.toString().slice(0, maxLength);
    }

    if (text.value.toString().length < this.phoneNumberMin && text.value.toString().length >= 1) {
      this.isPhoneNumberValid = false;
    } else {
      this.isPhoneNumberValid = true;
    }
  }

  /**
   * Edit from Summary page.
   */
  addListenerForEditFromSummary() {
    window.addEventListener('editSenderDetails', () => {
      this.currentStep = StepTypes.STEP5;
      this.editSenderPageDetails = true;
      this.backbuttonFlag = false;
    });
  }

  cancelEditSenderPageDetails() {
    this.currentStep = StepTypes.STEP3;
    this.editSenderPageDetails = false;
    this.backbuttonFlag = true;
    this.router.navigate(['/', 'shipping', 'summary']);
  }
}
