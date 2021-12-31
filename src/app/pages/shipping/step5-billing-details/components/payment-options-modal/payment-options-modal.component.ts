import { Component, OnInit, Input, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { NavParams, ModalController, IonInput } from '@ionic/angular';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { BillingOptionsUtil } from '../../../../../types/constants/billing-and-service-options.constants';
import { Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/+store/app.state';
import * as fromShippingSelector from '../../../../shipping/+store/shipping.selectors';
import { ShippingInfo } from '../../../+store/shipping.state';
import { APIMPaymentService } from 'src/app/core/providers/apim/payment.service';
import { KeyTexts } from 'src/app/interfaces/api-service/response/key-texts';
import { SessionItems } from 'src/app/types/enum/session-items.enum';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'payment-options-modal.component',
  templateUrl: './payment-options-modal.component.html',
  styleUrls: ['./payment-options-modal.component.scss'],
})
export class PaymentOptionsModalComponent implements OnInit, OnDestroy {

  @Input() modalType: string;
  @Input() modalTypeVal: string;
  @Input() transportationSelectedType: string;
  @Input() transportationSelectedAccountNumber: string;
  @Input() dutiesAndTaxesSelectedType: string;
  @Input() dutiesAndTaxesSelectedAccountNumber: string;
  @Input() transportOptions;
  @Input() dutiesTaxesOptions;
  @ViewChild('transportAccountInput', { static: false }) transportAccountInput: { setFocus: () => void; };
  @ViewChild('dutiesAccountInput', { static: false }) dutiesAccountInput: { setFocus: () => void; };

  defaultTransportSelection = BillingOptionsUtil.PAY_AT_DROP_OFF;
  defaultDutiesSelection = BillingOptionsUtil.BILL_RECIPIENT;
  defaultSelection = BillingOptionsUtil.BILLING_OPTION_DEFAULT;
  transportCost = BillingOptionsUtil.TRANSPORT_COST;
  dutiesTax = BillingOptionsUtil.DUTIES_TAX;

  transportPayAtDropOff = true;
  transportSelectBillMyAcc = false;
  transportSelectBillRecipient = false;
  transportSelectBillThirdParty = false;
  dutiesSelectBillMyAcc = false;
  dutiesSelectBillRecipient = true;
  dutiesSelectBillThirdParty = false;
  subs: Subscription;
  selectedPaymentAndAccount: string;
  transportType: string;
  transportAccount: string;
  dutiesType: string;
  dutiesAccount: string;

  transportForm: FormGroup;
  dutiesForm: FormGroup;
  shippingInfo: ShippingInfo;
  transportCostList: KeyTexts[] = [];
  isAccNumberValid: boolean;
  showThirdPartyOption = true;
  sameAccNumberError = false;

  currentSelectedType = '';
  otherDropdownSelectedType = '';

  constructor(
    public navParams: NavParams,
    private formBuilder: FormBuilder,
    public modalController: ModalController,
    private el: ElementRef,
    private paymentService: APIMPaymentService,
    private translate: TranslateService,
    private appStore: Store<AppState>) {
    this.subs = new Subscription();

    let details: any = [];
    this.modalType = navParams.get('modalType'); // Transporation Costs or Duties and Taxes modal
    this.selectedPaymentAndAccount = navParams.get('modalTypeVal'); // Selected value and account number if any

    this.initializeFormGroup(); // Initialize form group every present of modal

    if (this.modalType === BillingOptionsUtil.TRANSPORT_COST) {
      if (this.selectedPaymentAndAccount && this.selectedPaymentAndAccount.includes('-')) {
        details = this.selectedPaymentAndAccount.split('-');  // splits the selected type and account
        this.transportType = details[0];
        this.transportAccount = details[1];
      } else {
        this.transportType = this.selectedPaymentAndAccount;  // sets the default type if there is no account number
        this.transportAccount = '';
      }

      this.defaultTransportSelection = this.transportType;
      this.transportSelectionValue(this.transportType);
      this.formControls(this.transportForm).transportAccountNum.setValue(this.transportAccount);
    } else {
      if (this.selectedPaymentAndAccount && this.selectedPaymentAndAccount.includes('-')) {
        details = this.selectedPaymentAndAccount.split('-');  // splits the selected type and account
        this.dutiesType = details[0];
        this.dutiesAccount = details[1];
      } else {
        this.dutiesType = this.selectedPaymentAndAccount; // sets the default type if there is no account number
        this.dutiesAccount = '';
      }

      this.defaultDutiesSelection = this.dutiesType;
      this.dutiesSelectionValue(this.dutiesType);
      this.formControls(this.dutiesForm).dutiesAccountNum.setValue(this.dutiesAccount);
    }
  }

  ngOnInit() {
    this.getPaymentTypes();
  }

  // Initializes the form group if transporation cost or duties and taxes
  initializeFormGroup() {
    if (this.modalType === BillingOptionsUtil.TRANSPORT_COST) { // If transportation costs form
      this.transportForm = this.formBuilder.group({
        transportAccountNum: ['', [Validators.required]],
      });
    }
    else { // If duties and taxes form
      this.dutiesForm = this.formBuilder.group({
        dutiesAccountNum: ['', [Validators.pattern('^((\\+91-?)|0)?[0-9]{9}$')]],
      });
    }
  }

  // Resets the form to initial state
  resetForm(formGroup: FormGroup) {
    formGroup.reset();
  }

  // Gets the form controls
  formControls(formGroup: FormGroup) {
    return formGroup.controls;
  }

  transportSelectionValue(event) {
    this.sameAccNumberError = false;
    if (event && event.currentTarget) {
      this.formControls(this.transportForm).transportAccountNum.setValue('');
      this.transportType = event.currentTarget.value;
    }

    if (this.transportType === BillingOptionsUtil.PAY_AT_DROP_OFF) {
      this.transportSelectBillMyAcc = false;
      this.transportSelectBillRecipient = false;
      this.transportSelectBillThirdParty = false;
    } else if (this.transportType === BillingOptionsUtil.BILL_MY_ACCOUNT) {
      this.resetForm(this.transportForm);
      this.transportSelectBillMyAcc = true;
      this.transportSelectBillRecipient = false;
      this.transportSelectBillThirdParty = false;
    } else if (this.transportType === BillingOptionsUtil.BILL_RECIPIENT) {
      this.resetForm(this.transportForm);
      this.transportSelectBillMyAcc = false;
      this.transportSelectBillRecipient = true;
      this.transportSelectBillThirdParty = false;
    } else if (this.transportType === BillingOptionsUtil.BILL_THIRD_PARTY) {
      this.resetForm(this.transportForm);
      this.transportSelectBillMyAcc = false;
      this.transportSelectBillRecipient = false;
      this.transportSelectBillThirdParty = true;
    }

    this.checkSelectedPaymentOptions();
  }

  dutiesSelectionValue(event) {
    this.sameAccNumberError = false;
    if (event && event.currentTarget) {
      this.formControls(this.dutiesForm).dutiesAccountNum.setValue('');
      this.dutiesType = event.currentTarget.value;
    }

    this.resetForm(this.dutiesForm);
    if (this.dutiesType === BillingOptionsUtil.BILL_MY_ACCOUNT) {

      this.formControls(this.dutiesForm).dutiesAccountNum.setValidators(Validators.required);
      this.dutiesSelectBillMyAcc = true;
      this.dutiesSelectBillRecipient = false;
      this.dutiesSelectBillThirdParty = false;
    } else if (this.dutiesType === BillingOptionsUtil.BILL_RECIPIENT) {
      this.resetForm(this.dutiesForm);
      this.formControls(this.dutiesForm).dutiesAccountNum.setValidators(Validators.pattern('^((\\+91-?)|0)?[0-9]{9}$'));
      this.dutiesSelectBillMyAcc = false;
      this.dutiesSelectBillRecipient = true;
      this.dutiesSelectBillThirdParty = false;
    } else if (this.dutiesType === BillingOptionsUtil.BILL_THIRD_PARTY) {
      this.resetForm(this.dutiesForm);
      this.formControls(this.dutiesForm).dutiesAccountNum.setValidators(Validators.required);

      this.dutiesSelectBillMyAcc = false;
      this.dutiesSelectBillRecipient = false;
      this.dutiesSelectBillThirdParty = true;
    }

    this.checkSelectedPaymentOptions();
    this.dutiesForm.updateValueAndValidity();
  }

  checkSelectedPaymentOptions() {
    if (this.modalType === BillingOptionsUtil.TRANSPORT_COST) {
      if (this.transportType === this.dutiesAndTaxesSelectedType) {
        this.formControls(this.transportForm).transportAccountNum.setValue(this.dutiesAndTaxesSelectedAccountNumber);
      }
    } else {
      if (this.dutiesType === this.transportationSelectedType) {
        this.formControls(this.dutiesForm).dutiesAccountNum.setValue(this.transportationSelectedAccountNumber);
      }
    }
  }

  closeNavigation() {
    let accountNum: string;
    let type = '';
    this.sameAccNumberError = false;
    if (this.modalType === BillingOptionsUtil.TRANSPORT_COST) {
      if (this.transportType === BillingOptionsUtil.PAY_AT_DROP_OFF) {
        accountNum = '';
      } else {
        accountNum = this.formControls(this.transportForm).transportAccountNum.value;
      }
      type = this.transportType;
    } else {
      accountNum = this.formControls(this.dutiesForm).dutiesAccountNum.value;
      type = this.dutiesType;
    }

    if (this.checkForAccountNumber()) {
      this.modalController.dismiss(type, accountNum);
    } else {
      const translationKey = 'billingAndServicesOptionPage.' + (BillingOptionsUtil.getPaymentType(type).translationKey);
      this.currentSelectedType = this.translate.instant(translationKey);
      this.sameAccNumberError = true;
      if (this.dutiesSelectBillRecipient) {
        this.isAccNumberValid = false;
      }
    }
  }

  // Validates transportation costs form
  validateTransportationCost() {
    if (this.transportSelectBillMyAcc || this.transportSelectBillRecipient || this.transportSelectBillThirdParty) {
      if (this.transportForm.valid) {
        if (this.formControls(this.transportForm).transportAccountNum.value.toString().length > 0 && this.formControls(this.transportForm).transportAccountNum.value.toString().length === 9) {
          this.isAccNumberValid = false;
          this.closeNavigation();
        } else {
          this.isAccNumberValid = true;
        }
      } else {
        this.scrollToFirstInvalidControl(this.transportForm);
      }
    }
    else {
      this.closeNavigation();
    }
  }

  // Validates duties and taxes form
  validateDutiesTaxes() {
    if (!this.dutiesSelectBillRecipient) {
      if (this.dutiesForm.valid) {
        if (this.formControls(this.dutiesForm).dutiesAccountNum.value.toString().length === 9) {
          this.isAccNumberValid = false;
          this.closeNavigation();
        } else {
          this.isAccNumberValid = true;
        }
      } else {
        this.scrollToFirstInvalidControl(this.dutiesForm);
      }
    } else if (this.dutiesSelectBillRecipient) {
      if (this.dutiesForm.valid) {
        this.closeNavigation();
      } else {
        this.isAccNumberValid = true;
      }
    } else {
      this.scrollToFirstInvalidControl(this.dutiesForm);
    }
  }

  checkForAccountNumber() {
    if (this.modalType === BillingOptionsUtil.TRANSPORT_COST) {
      if (this.transportType === BillingOptionsUtil.PAY_AT_DROP_OFF) {
        return true;
      } else {
        const translationKey = this.dutiesAndTaxesSelectedType ? 'billingAndServicesOptionPage.' + (BillingOptionsUtil.getPaymentType(this.dutiesAndTaxesSelectedType).translationKey) : '';
        this.otherDropdownSelectedType = translationKey ? this.translate.instant(translationKey) : '';
        const accountNumber = this.formControls(this.transportForm).transportAccountNum.value.toString();
        if (this.transportType !== this.dutiesAndTaxesSelectedType && this.dutiesAndTaxesSelectedAccountNumber.toString() === accountNumber) {
          return false;
        } else {
          return true;
        }
      }
    } else {
      const translationKey = this.transportationSelectedType ? 'billingAndServicesOptionPage.' + (BillingOptionsUtil.getPaymentType(this.transportationSelectedType).translationKey) : '';
      this.otherDropdownSelectedType = translationKey ? this.translate.instant(translationKey) : '';
      const accountNumber = this.formControls(this.dutiesForm).dutiesAccountNum?.value?.toString();
      if (this.dutiesType !== this.transportationSelectedType && this.transportationSelectedAccountNumber.toString() === accountNumber) {
        return false;
      } else {
        return true;
      }
    }
  }

  // Finds the invalid account number field and sets focus
  public scrollToFirstInvalidControl(formGroup: FormGroup) {
    const firstInvalidControl: HTMLElement = this.el.nativeElement.querySelector(
      'form .ng-invalid'
    );

    if (this.modalType === BillingOptionsUtil.TRANSPORT_COST) {
      this.transportAccountInput.setFocus();
    } else {
      this.dutiesAccountInput.setFocus();
    }
    formGroup.markAllAsTouched();
  }

  getPaymentTypes() {
    if (this.modalType === BillingOptionsUtil.TRANSPORT_COST) {
      this.transportCostList = [{
        'key': BillingOptionsUtil.getPaymentType(BillingOptionsUtil.PAY_AT_DROP_OFF).value,
        'displayText': this.translate.instant('billingAndServicesOptionPage.payAtDropOff')
      }].concat(this.transportOptions);
    } else {
      this.transportCostList = this.dutiesTaxesOptions;
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  hideErrorMessage() {
    this.isAccNumberValid = false;
    this.sameAccNumberError = false;
  }

  showErrorMessage() {
    this.isAccNumberValid = true;
  }

}
