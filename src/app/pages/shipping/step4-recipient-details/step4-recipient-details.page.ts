import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { AppState } from 'src/app/+store/app.state';
import { StepTypes } from '../../../types/enum/step-type.enum';
import * as fromShippingSelector from '../+store/shipping.selectors';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IRecipient } from 'src/app/interfaces/shipping-app/recipient';
import { RecipientForm } from 'src/app/interfaces/shipping-form/recipient-form';
import { Router } from '@angular/router';
import { saveRecipientDetailsAction } from '../+store/shipping.actions';
import { Subscription } from 'rxjs';
import { InputTypeConstants } from '../../../types/constants/input-type-constants';
import { IonInput } from '@ionic/angular';
import { PhoneNumberLimitTypes } from '../../../types/enum/phone-number-limit-type.enum';
import { LocalAddressService } from 'src/app/core/providers/local/address.service';
import { AddressTypes } from 'src/app/types/enum/address-type.enum';
import { IUser } from 'src/app/interfaces/shipping-app/user';
import { ConfigService } from '@ngx-config/core';
import { CustomsType } from 'src/app/types/enum/customs-type.enum';

@Component({
  selector: 'app-step4-recipient-details',
  templateUrl: './step4-recipient-details.page.html',
  styleUrls: ['./step4-recipient-details.page.scss'],
})
export class Step4RecipientDetailsPage implements OnInit, OnDestroy {
  // Workaround for input focus() on ion-input fields
  @ViewChild('addressLine1Input', { static: false }) addressLine1Input: { setFocus: () => void; };
  @ViewChild('contactNameInput', { static: false }) contactNameInput: { setFocus: () => void; };
  @ViewChild('companyNameInput', { static: false }) companyNameInput: { setFocus: () => void; };
  @ViewChild('phoneNumberInput', { static: false }) phoneNumberInput: { setFocus: () => void; };
  @ViewChild('phoneExt', { static: false }) phoneExt: { setFocus: () => void; };
  @ViewChild('emailInput', { static: false }) emailInput: { setFocus: () => void; };
  @ViewChild('taxIdInput', { static: false }) taxIdInput: { setFocus: () => void; };
  @ViewChild('passportNoInput', { static: false }) passportNoInput: { setFocus: () => void; };

  backbuttonFlag = true;
  residential = true;
  brResident = false;
  showAddressLine3 = false;
  BRAZIL_COUNTRY_CODE = 'BR';
  currentCountryCode: string;
  currentStep: string = StepTypes.STEP4;
  recipientForm: FormGroup;
  subs = new Subscription();
  fromStoreRecipientDetails: IRecipient;
  countryCityPostalDisplay: string;
  dialingPrefixValue: string;
  inputConstants = InputTypeConstants;
  phoneNumberMin = PhoneNumberLimitTypes.DEFAULT_MIN;
  isPhoneNumberValid = true;
  phoneNumberMax = PhoneNumberLimitTypes.DEFAULT_MAX;
  isDefaultValidation = true;
  editRecipientPageDetails = false;
  recipientFormData: IRecipient;
  partyId: string;
  userId: string;
  updateResponse: string;
  isTaxIdRequiredValidator = false;

  constructor(
    public formBuilder: FormBuilder,
    private appStore: Store<AppState>,
    private router: Router,
    private el: ElementRef,
    private localAddressService: LocalAddressService,
    private config: ConfigService) { }

  ngOnInit() {
    this.recipientForm = this.formBuilder.group({
      addressLine1: ['', [Validators.required, Validators.minLength(3)]],
      addressLine2: ['', [Validators.minLength(3)]],
      addressLine3: ['', [Validators.minLength(3)]],
      contactName: ['', [Validators.required, Validators.minLength(3)]],
      companyName: ['', [Validators.minLength(3)]],
      phoneNumber: ['', { validators: [Validators.required, Validators.minLength(this.phoneNumberMin), Validators.maxLength(this.phoneNumberMax)] }],
      phoneExt: [''],
      email: ['', [Validators.pattern('[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}')]],
      taxId: ['', { Validators: [Validators.maxLength(18)], updateOn: 'blur' }],
      passportNo: ['']
    });
    this.addListenerForEditFromSummary();
    this.observeAddressLine2();
    this.initializeRecipientDetailsFromStore();
    this.getSelectedRecipientDetailsFromStore();
    this.getUserAccountDetails();
  }

  conditionallyRequiredValidator() {
    const shippingInfo = this.appStore.pipe(select(fromShippingSelector.selectShippingInfo))
      .subscribe((selectedShippingInfo) => {
        if (selectedShippingInfo && selectedShippingInfo.customsDetails.customsType === CustomsType.ITEM) {
          this.isTaxIdRequiredValidator = true;
          this.recipientForm.controls.taxId.setValidators([Validators.required, Validators.maxLength(18), Validators.min(99999999999999)]);
          this.recipientForm.updateValueAndValidity();
        }
      });
    this.subs.add(shippingInfo);
  }

  submitForm(): void {
    if (this.recipientForm.valid && this.isPhoneNumberValid) {
      this.appStore.dispatch(saveRecipientDetailsAction({
        recipientDetailsList: this.mapRecipientFormValuesToStore()
      }));
      this.currentStep = StepTypes.STEP4;
      this.postUpdateRecipientAddressDetails();
      if (this.editRecipientPageDetails) {
        this.editRecipientPageDetails = false;
        this.router.navigate(['/', 'shipping', 'summary']);
      } else {
        this.editRecipientPageDetails = false;
        this.router.navigate(['/shipping/billing-details']);
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

  postUpdateRecipientAddressDetails() {
    this.recipientFormData = (this.mapRecipientFormValuesToStore())[0];
    if (this.partyId !== undefined) {
      this.subs.add(this.localAddressService.updatePartyAddressDetails(this.recipientFormData, this.partyId, this.userId).subscribe(response => {
        this.updateResponse = response.message;
      }));
    } else if (this.userId !== undefined) {
      this.subs.add(this.localAddressService.postPartyAddressDetails(this.recipientFormData, AddressTypes.ADDRESS_RECIPIENT, this.userId).subscribe(response => {
        this.partyId = response.partyId;
      }));
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

  private scrollToFirstInvalidControl() {
    const firstInvalidControl: HTMLElement = this.el.nativeElement.querySelector(
      'form .ng-invalid'
    );
    this.setFocusOnFirstInvalidInput(firstInvalidControl.id);
    this.recipientForm.markAllAsTouched();
  }

  public setFocusOnFirstInvalidInput(inputId: string) {
    switch (inputId) {
      case 'contactName': {
        this.contactNameInput.setFocus();
        break;
      }
      case 'companyName': {
        this.companyNameInput.setFocus();
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
      case 'taxId': {
        this.taxIdInput.setFocus();
        break;
      }
      case 'passportNo': {
        this.passportNoInput.setFocus();
        break;
      }
      default: {
        this.addressLine1Input.setFocus();
        break;
      }
    }
  }

  initializeRecipientDetailsFromStore() {
    this.subs.add(this.appStore.pipe(select(fromShippingSelector.selectRecipientDetailsList))
      .subscribe((currentRecipientDetailsList: IRecipient[]) => {
        if (currentRecipientDetailsList && currentRecipientDetailsList.length > 0) {
          this.fromStoreRecipientDetails = currentRecipientDetailsList[0];
          const passportNoLength = (this.fromStoreRecipientDetails.passportNumber) ?
            this.fromStoreRecipientDetails.passportNumber.length : 0;
          this.brResident = (passportNoLength === 0);
          this.residential = this.fromStoreRecipientDetails.residential;
          this.currentCountryCode = this.fromStoreRecipientDetails.countryCode;
          this.countryCityPostalDisplay = this.getCountryCityPostalDisplay(this.fromStoreRecipientDetails);
          this.getPrefixByCountryCode();
          this.mapStoreDataToRecipientForm(currentRecipientDetailsList);
          this.checkMaxLengthForPhoneNumber();
          const isTaxIdMandatoryCountry = this.config.getSettings('MANDATORY_TAX_ID_COUNTRY_LIST').includes(this.currentCountryCode) ? true : false;
          if (isTaxIdMandatoryCountry) {
            this.conditionallyRequiredValidator();
          }
        }
      }));
  }

  getCountryCityPostalDisplay(recipientDetails: IRecipient) {
    const countryName = (recipientDetails.countryName) ? recipientDetails.countryName : '';
    const postalCode = (recipientDetails.postalCode) ? ', '.concat(recipientDetails.postalCode) : '';
    const city = (recipientDetails.city) ? ', '.concat(recipientDetails.city) : '';
    const stateOrProvinceCode = (recipientDetails.stateOrProvinceCode) ? ', '.concat(recipientDetails.stateOrProvinceCode) : '';
    return countryName.concat(city).concat(stateOrProvinceCode).concat(postalCode);
  }

  getPrefixByCountryCode() {
    this.subs.add(
      this.appStore.pipe(select(fromShippingSelector.selectCountryDialingPrefix))
        .subscribe(dialingCode => {
          if (dialingCode) {
            const dialingPrefix = dialingCode.countryPrefix;
            const countryDetails = dialingPrefix.find(country => country.countryCode === this.currentCountryCode);
            this.dialingPrefixValue = countryDetails.countryDialingCode;
          }
        })
    );
  }

  checkMaxLengthForPhoneNumber() {
    if (this.currentCountryCode === 'CA') {
      this.phoneNumberMax = PhoneNumberLimitTypes.CA_MAX;
      this.phoneNumberMin = PhoneNumberLimitTypes.CA_MIN;
      this.isDefaultValidation = false;
    } else if (this.currentCountryCode === 'US') {
      this.phoneNumberMax = PhoneNumberLimitTypes.US_MAX;
      this.phoneNumberMin = PhoneNumberLimitTypes.US_MIN;
      this.isDefaultValidation = false;
    } else {
      this.phoneNumberMax = PhoneNumberLimitTypes.DEFAULT_MAX;
      this.phoneNumberMin = PhoneNumberLimitTypes.DEFAULT_MIN;
      this.isDefaultValidation = true;
    }
    this.form.phoneNumber.setValidators([]);
    this.form.phoneNumber.markAsUntouched();
    this.form.phoneNumber.updateValueAndValidity();
  }

  changeCompanyAddressToggle(event) {
    const isCompanyAddress = event.detail.checked;
    this.residential = (isCompanyAddress) ? false : true;

    if (this.residential) {
      this.form.companyName.setValidators([]);
      this.form.companyName.markAsUntouched();
      this.form.companyName.updateValueAndValidity();
    } else {
      this.form.companyName.setValidators([Validators.required, Validators.minLength(3)]);
      this.form.companyName.markAsUntouched();
      this.form.companyName.updateValueAndValidity();
    }
  }

  changeBrazilResidentToggle(brResident: boolean) {
    this.brResident = this.brResident ? false : true;
    const isRecipientFromBrazil = (this.currentCountryCode === this.BRAZIL_COUNTRY_CODE);
    if (isRecipientFromBrazil && this.brResident) {
      // for TaxId
      this.form.taxId.setValidators([Validators.required, Validators.maxLength(18)]);
      this.form.taxId.markAsUntouched();
      this.form.taxId.updateValueAndValidity();

      // for passportNo
      this.form.passportNo.setValidators([]);
      this.form.passportNo.markAsUntouched();
      this.form.passportNo.updateValueAndValidity();
    } else {
      // for TaxId
      this.form.taxId.setValidators([]);
      this.form.taxId.markAsUntouched();
      this.form.taxId.updateValueAndValidity();

      // for passportNo
      this.form.passportNo.setValidators([Validators.required]);
      this.form.passportNo.markAsUntouched();
      this.form.passportNo.updateValueAndValidity();
    }
  }

  mapRecipientFormValuesToStore(): IRecipient[] {
    const recipientFormVal: RecipientForm = this.recipientForm.value;
    const isRecipientFromBrazil = (this.currentCountryCode === this.BRAZIL_COUNTRY_CODE);
    return [{
      address1: recipientFormVal.addressLine1,
      address2: recipientFormVal.addressLine2,
      address3: recipientFormVal.addressLine3,
      residential: this.residential,
      companyName: (!this.residential) ? recipientFormVal.companyName : '',
      contactName: recipientFormVal.contactName,
      city: this.fromStoreRecipientDetails.city,
      countryCode: this.fromStoreRecipientDetails.countryCode,
      countryName: this.fromStoreRecipientDetails.countryName,
      postalCode: this.fromStoreRecipientDetails.postalCode,
      postalAware: this.fromStoreRecipientDetails.postalAware,
      stateOrProvinceCode: this.fromStoreRecipientDetails.stateOrProvinceCode ? this.fromStoreRecipientDetails.stateOrProvinceCode : undefined,
      stateAware: this.fromStoreRecipientDetails.stateAware,
      phoneNumber: recipientFormVal.phoneNumber,
      phoneExt: (!this.residential) ? recipientFormVal.phoneExt : '',
      emailAddress: recipientFormVal.email,
      taxId: ((isRecipientFromBrazil && this.brResident) || !isRecipientFromBrazil) ? recipientFormVal.taxId : '',
      passportNumber: ((isRecipientFromBrazil && !this.brResident)) ? recipientFormVal.passportNo : '',
      dialingPrefix: this.dialingPrefixValue,
      partyId: this.partyId ? this.partyId : undefined
    }];
  }

  private mapStoreDataToRecipientForm(recipients: IRecipient[]): void {
    this.residential = recipients[0].residential === undefined ? true : recipients[0].residential;
    this.form.addressLine1.setValue(recipients[0].address1);
    this.form.addressLine2.setValue(recipients[0].address2);
    this.form.addressLine3.setValue(recipients[0].address3);
    this.form.contactName.setValue(recipients[0].contactName);
    this.form.companyName.setValue(recipients[0].companyName);
    this.form.phoneNumber.setValue(recipients[0].phoneNumber);
    this.form.phoneExt.setValue(recipients[0].phoneExt);
    this.form.email.setValue(recipients[0].emailAddress);
    this.form.taxId.setValue(recipients[0].taxId);
    this.form.passportNo.setValue(recipients[0].passportNumber);
  }

  observeAddressLine2() {
    this.form.addressLine2.valueChanges.subscribe(value => {
      if (value) {
        this.showAddressLine3 = true;
      } else {
        this.showAddressLine3 = false;
      }
    });
  }

  get form() {
    return this.recipientForm.controls;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
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

  // Limits lengh of string of phone ext
  limitLengthPhoneExt(text: IonInput, length: number) {
    const maxLength = length;
    if (text.value.toString().length > maxLength) {
      text.value = text.value.toString().slice(0, maxLength);
    }
  }

  /**
  * Edit from Summary page.
  */
  addListenerForEditFromSummary() {
    window.addEventListener('editRecipientDetails', () => {
      this.currentStep = StepTypes.STEP5;
      this.editRecipientPageDetails = true;
      this.backbuttonFlag = false;
    });
  }

  cancelEditRecipientPageDetails() {
    this.currentStep = StepTypes.STEP4;
    this.editRecipientPageDetails = false;
    this.backbuttonFlag = true;
    this.router.navigate(['/', 'shipping', 'summary']);
  }

  getSelectedRecipientDetailsFromStore() {
    this.subs.add(
      this.appStore.pipe(select(fromShippingSelector.selectSelectedRecipient))
        .subscribe((recipientDetail: IRecipient) => {
          if (recipientDetail) {
            this.partyId = recipientDetail.partyId;
          }
        })
    );
  }
}
