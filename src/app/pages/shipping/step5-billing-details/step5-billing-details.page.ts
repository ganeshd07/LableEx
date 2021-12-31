import { Component, OnInit, ViewChild, OnDestroy, DoCheck } from '@angular/core';
import { StepTypes } from '../../../types/enum/step-type.enum';
import { ModalController, IonSelect } from '@ionic/angular';
import { PaymentOptionsModalComponent } from './components/payment-options-modal/payment-options-modal.component';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { BillingOptionsUtil } from '../../../../app/types/constants/billing-and-service-options.constants';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/+store/app.state';
import * as fromShippingSelector from '../+store/shipping.selectors';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { IPayment } from 'src/app/interfaces/shipping-app/payment';
import { ISpecialServices } from 'src/app/interfaces/shipping-app/special-services';
import { BillingForm } from 'src/app/interfaces/shipping-form/billing-form';
import { savePaymentsDetailsAction, updateSelectedRate, updateShipmentDetailsAction } from '../+store/shipping.actions';
import { APIMAvailabilityDataMapper } from 'src/app/providers/mapper/apim/availability-data-mapper.service';
import { APIMAvailabilityService } from '../../../core/providers/apim';
import { ShippingInfo } from '../+store/shipping.state';
import { RatesDataMapper } from 'src/app/providers/mapper/apim/rates-data-mapper.service';
import { RatesService } from '../../../core/providers/apim';
import { IRatesForm } from 'src/app/interfaces/shipping-form/rates-form';
import { ISignatureOption } from 'src/app/interfaces/shipping-app/signature-option';
import { KeyTexts } from 'src/app/interfaces/api-service/response/key-texts';
import { IShipmentDetails } from 'src/app/interfaces/shipping-app/shipment-details';
import { SignatureOptionBubbleHintComponent } from './components/signature-option-bubble-hint/signature-option-bubble-hint.component';
import { PaymentService } from 'src/app/core/providers/local/payment.service';
import { SessionItems } from 'src/app/types/enum/session-items.enum';
import { TranslateService } from '@ngx-translate/core';
import { Util } from 'src/app/providers/util.service';
import { APIMPaymentService } from 'src/app/core/providers/apim/payment.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-step5-billing-details',
  templateUrl: './step5-billing-details.page.html',
  styleUrls: ['./step5-billing-details.page.scss'],
})
export class Step5BillingDetailsPage implements OnInit, OnDestroy, DoCheck {
  currentStep: string = StepTypes.STEP5;
  transportCost: string = BillingOptionsUtil.TRANSPORT_COST;
  dutiesTax: string = BillingOptionsUtil.DUTIES_TAX;
  selectedLanguage: string;
  isModalPresent = false;

  backbuttonFlag = true;
  downArrow = false;
  rateOptions = false;
  rateFlag = false;
  rateApiError = false;
  hasRateServiceLoaded = false;

  signatureOptionsList: KeyTexts[] = [];
  ratesList: IRatesForm[];

  billingForm: FormGroup;

  selectedRates: IRatesForm;
  currentShippingInfo: ShippingInfo;

  subs: Subscription;
  editBillingPageDetails = false;

  dutiesAndTaxesSelectedType = '';
  dutiesAndTaxesSelectedAccountNumber = '';
  transportationSelectedType = '';
  transportationSelectedAccountNumber = '';

  prevSelectedSignatureOpt = null;
  initialSignatureUpdate = true;

  @ViewChild('selectedSignatureValueRef', { static: false }) selectedSignatureValueRef: IonSelect;
  enableDropDown = false;
  enableDutiesDropDown = false;
  transportOptions = [];
  dutiesTaxesOptions = [];
  configList: any;

  constructor(
    public modalCtrl: ModalController,
    private appStore: Store<AppState>,
    private apimAvailabilityService: APIMAvailabilityService,
    private formBuilder: FormBuilder,
    private router: Router,
    private availabilityDataMapper: APIMAvailabilityDataMapper,
    private ratesReqDataMapper: RatesDataMapper,
    private paymentService: PaymentService,
    private utils: Util,
    private translate: TranslateService,
    private ratesService: RatesService,
    private paymentServiceAPIM: APIMPaymentService) {
    this.subs = new Subscription();
  }

  ngOnInit() {
    this.selectedLanguage = sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE);
    this.billingForm = this.formBuilder.group({
      selectedSignatureValue: [''],
      transportVal: [this.translate.instant('billingAndServicesOptionPage.payAtDropOff')],
      dutiesVal: [this.translate.instant('billingAndServicesOptionPage.billRecipient')],
      shippingBillTo: [''],
      shippingAccountNumber: [''],
      shippingBillToDisplayable: [''],
      shippingAccountNumberDisplayable: [BillingOptionsUtil.PAY_AT_DROP_OFF],
      dutiesTaxesBillTo: [''],
      dutiesTaxesAccountNumber: [''],
      dutiesTaxesBillToDisplayable: [''],
      dutiesTaxesAccountNumberDisplayable: [BillingOptionsUtil.BILL_RECIPIENT]
    });
    this.addListenerForEditFromSummary();
    this.getShippingDetailsFromStore();
    this.getSignatureOptionsDetails();
    this.getTransportDutiesTaxesOptions();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngDoCheck() {
    if (this.selectedLanguage !== sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE)) {
      this.selectedLanguage = sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE);
      this.getSignatureOptionsDetails();
      this.getTransportDutiesTaxesOptions();
      this.refreshRateQuote();
    }
  }

  public changeArrow(downArrowParam) {
    this.downArrow = false;
    if (!downArrowParam) {
      this.downArrow = true;
    }
  }

  getShippingDetailsFromStore() {
    const subSignatureOpt$ = this.appStore.pipe(select(fromShippingSelector.selectShippingInfo))
      .subscribe((selectedShippingInfo) => {
        if (selectedShippingInfo) {
          this.currentShippingInfo = selectedShippingInfo;
          if (selectedShippingInfo.paymentDetails) {
            this.setTransportValueDisplayName(selectedShippingInfo.paymentDetails.shippingBillToDisplayable, selectedShippingInfo.paymentDetails.shippingAccountNumber);
            this.setDutiesValueDisplayName(selectedShippingInfo.paymentDetails.dutiesTaxesBillToDisplayable, selectedShippingInfo.paymentDetails.dutiesTaxesAccountNumber);
          }
        }
      });
    this.subs.add(subSignatureOpt$);
  }

  getSignatureOptionsDetails() {
    this.prevSelectedSignatureOpt = this.form.selectedSignatureValue?.value;
    const signatureOptionParams = this.availabilityDataMapper.mapSignatureOptionRequestFromStore(this.currentShippingInfo);
    const obsAvailabilityService$ = this.apimAvailabilityService.getSignatureOptionsList(signatureOptionParams);
    this.subs.add(obsAvailabilityService$.subscribe(
      (response) => {
        this.signatureOptionsList = response.output.availableSignatureOptions;
        setTimeout(() => {
          if (this.signatureOptionsList.length > 0) {
            const signatureOption = this.signatureOptionsList.find(signature => this.prevSelectedSignatureOpt?.key === signature.key);
            this.prevSelectedSignatureOpt = signatureOption ? signatureOption : this.signatureOptionsList[0];
            this.form.selectedSignatureValue.patchValue(signatureOption ? signatureOption : this.signatureOptionsList[0]);
          } else {
            this.onSelectSignatureOptions();
          }
        }, 0);
      }));
  }

  onSelectSignatureOptions() {
    if (this.initialSignatureUpdate || this.prevSelectedSignatureOpt?.key !== this.form.selectedSignatureValue.value.key) {
      if (this.currentShippingInfo.shipmentDetails) {
        this.initialSignatureUpdate = false;
        this.updatePaymentDetails();
        this.appStore.dispatch(updateShipmentDetailsAction({
          shipmentDetails: this.ratesReqDataMapper.mapRateDetailsToShipmentDetails(
            this.selectedRates,
            this.currentShippingInfo,
            this.updateSpecialServiceInfo(this.form.selectedSignatureValue.value, this.currentShippingInfo.shipmentDetails))
        }));
      }
      this.refreshRateQuote();
    }
  }

  getTransportDutiesTaxesOptions() {
    const reasonTransport = "TRANSPORTATION";
    const reasonDuties = "DUTIESTAXES";
    const servicetype = this.currentShippingInfo.shipmentDetails.serviceType;
    const sendercountrycode = this.currentShippingInfo.senderDetails.countryCode;
    const recipientcountrycode = this.currentShippingInfo.recipientDetails[0].countryCode;

    const localTransportOption = this.paymentService.getconfigList(sendercountrycode, BillingOptionsUtil.TRANSPORT_OPTIONS);
    const apimTransportOption = this.paymentServiceAPIM.getPaymentTypesByCountryCodesAndServiceType(
      reasonTransport,
      servicetype,
      sendercountrycode,
      recipientcountrycode
    );

    const localDutiesTaxesOption = this.paymentService.getconfigList(sendercountrycode, BillingOptionsUtil.DUTYTAX_OPTIONS);
    const apimDutiesTaxesOption = this.paymentServiceAPIM.getPaymentTypesByCountryCodesAndServiceType(
      reasonDuties,
      servicetype,
      sendercountrycode,
      recipientcountrycode
    );

    forkJoin([localTransportOption, apimTransportOption]).subscribe(transportOptionsResults => {
      this.handleTransportOptions(transportOptionsResults);
    });

    forkJoin([localDutiesTaxesOption, apimDutiesTaxesOption]).subscribe(dutyTaxesOptionsResults => {
      this.handleDutiesTaxestOptions(dutyTaxesOptionsResults);
    });
  }

  handleTransportOptions(transportOptionsResults) {
    if (transportOptionsResults[0] && transportOptionsResults[0].configlist.length > 0) {
      const mappedTransportOptions = this.mapPaymentOptionResponseToKeyDisplayText(transportOptionsResults[0].configlist, false);
      const apimTransportOptions = transportOptionsResults[1];
      this.transportOptions = this.mergeLocalApimResult(apimTransportOptions.output.keyTexts, mappedTransportOptions);
      this.enableDropDown = true;
    }
  }

  handleDutiesTaxestOptions(dutyTaxesOptionsResults) {
    if (dutyTaxesOptionsResults[0] && dutyTaxesOptionsResults[0].configlist.length > 0) {
      const mappedDutyTaxesOptions = this.mapPaymentOptionResponseToKeyDisplayText(dutyTaxesOptionsResults[0].configlist, true);
      const apimDutyTaxesOptions = dutyTaxesOptionsResults[1];
      this.dutiesTaxesOptions = this.mergeLocalApimResult(apimDutyTaxesOptions.output.keyTexts, mappedDutyTaxesOptions);
      if (this.dutiesTaxesOptions.length > 1) {
        this.enableDutiesDropDown = true;
      }
    }
  }

  mergeLocalApimResult(apimOptions, localOptions) {
    let finalOptions = [];
    apimOptions.forEach(apimItem => {
      localOptions.forEach(localItem => {
        if (apimItem.key === localItem.key) {
          finalOptions.push(apimItem);
        }
      })
    })
    return finalOptions;
  }

  mapPaymentOptionResponseToKeyDisplayText(configList, isDutyTaxes) {
    let mappedPaymentOptions = [];
    if (isDutyTaxes) {
      const recipientIndex = configList.findIndex(item => item.value === BillingOptionsUtil.LOCAL_RECIPIENT_KEY);
      const senderPartyIndex = configList.findIndex(item => item.value === BillingOptionsUtil.LOCAL_SENDER_KEY);
      const thirdPartyIndex = configList.findIndex(item => item.value === BillingOptionsUtil.LOCAL_THIRD_PART_KEY);
      const recipientObj = { value: BillingOptionsUtil.LOCAL_RECIPIENT_KEY };
      if (recipientIndex === -1 && thirdPartyIndex !== -1) {
        configList.splice(thirdPartyIndex - 1, 0, recipientObj);
      } else if (senderPartyIndex !== -1 && recipientIndex === -1 && thirdPartyIndex === -1) {
        configList.splice(senderPartyIndex + 1, 0, recipientObj);
      } else if (recipientIndex === -1) {
        configList.splice(senderPartyIndex + 1, 0, recipientObj);
      }
    }

    configList.forEach((configItem) => {
      let item = { key: '' };
      switch (configItem.value) {
        case BillingOptionsUtil.LOCAL_SENDER_KEY:
          item.key = BillingOptionsUtil.getPaymentType(BillingOptionsUtil.BILL_MY_ACCOUNT).value;
          break;
        case BillingOptionsUtil.LOCAL_RECIPIENT_KEY:
          item.key = BillingOptionsUtil.getPaymentType(BillingOptionsUtil.BILL_RECIPIENT).value;
          break;
        case BillingOptionsUtil.LOCAL_THIRD_PART_KEY:
          item.key = BillingOptionsUtil.getPaymentType(BillingOptionsUtil.BILL_THIRD_PARTY).value;
          break;
      }
      mappedPaymentOptions.push(item);
    });

    return mappedPaymentOptions;
  }

  onSelectTransportationCost() {
    const previousTransportValue = this.currentShippingInfo.paymentDetails.shippingBillTo;
    this.updatePaymentDetails();
    if (this.billingForm.controls.shippingBillTo.value === BillingOptionsUtil.getPaymentType(BillingOptionsUtil.PAY_AT_DROP_OFF).value &&
      previousTransportValue !== BillingOptionsUtil.getPaymentType(BillingOptionsUtil.PAY_AT_DROP_OFF).value) {
      this.refreshRateQuote();
    }
  }

  refreshRateQuote() {
    this.hasRateServiceLoaded = false;
    const subShipInfo$ = this.appStore.pipe(select(fromShippingSelector.selectShippingInfo))
      .subscribe((selectedShippingInfo: ShippingInfo) => {
        if (selectedShippingInfo && !this.hasRateServiceLoaded) {
          this.currentShippingInfo = selectedShippingInfo;
          this.getRateQuote(selectedShippingInfo);
        }
      });
    this.subs.add(subShipInfo$);
  }

  updateSpecialServiceInfo(signatureOptionObj: ISignatureOption, shipmentDetails: IShipmentDetails): ISpecialServices {
    const spclServiceInfo = shipmentDetails.specialServiceInfo;
    const selectedSignatureOpt = (signatureOptionObj) ? signatureOptionObj : undefined;
    const currentHandlingServices = (spclServiceInfo) ? spclServiceInfo.handlingTypes : undefined;
    return {
      selectedSignatureOption: selectedSignatureOpt,
      handlingTypes: currentHandlingServices
    };
  }

  /**
   * Gets the rate quote via APIM Rate Quote V2 service.
   * 
   */
  getRateQuote(selectedShippingInfo: ShippingInfo): void {
    this.ratesList = [];
    if (!this.hasRateServiceLoaded) {
      this.hasRateServiceLoaded = true;
      const ratesParams = this.ratesReqDataMapper.mapRateRequestFromStore(selectedShippingInfo);
      const ratesDiscount = (selectedShippingInfo.lookupData.ratesDiscountSuccess !== undefined) ?
        selectedShippingInfo.lookupData.ratesDiscountSuccess.configlist : [];
      this.subs.add(this.ratesService.getRateQuoteV2(ratesParams).subscribe(
        (response) => {
          this.ratesList = this.ratesReqDataMapper.mapRateQuoteResponseToGUI(response.output.rateReplyDetails, ratesDiscount);
          if (this.ratesList.length > 0) {
            this.selectedRates = this.ratesList[0];
            this.updateRateDetails(this.selectedRates);
          }
        }, (error) => {
          this.rateFlag = true;
          this.rateApiError = true;
        }
      ));
    }
  }

  async transportCostAndDutiesTaxDetails(modalType) {
    if ((this.enableDropDown && modalType === BillingOptionsUtil.TRANSPORT_COST) ||
      (this.enableDutiesDropDown && modalType === BillingOptionsUtil.DUTIES_TAX) && !this.isModalPresent) {
      this.isModalPresent = true;
      let modalTypeVal = '';
      if (modalType === BillingOptionsUtil.TRANSPORT_COST) {
        modalTypeVal = this.billingForm.controls.shippingAccountNumberDisplayable.value;
      } else {
        modalTypeVal = this.billingForm.controls.dutiesTaxesAccountNumberDisplayable.value;

      }
      this.transportationSelectedType = this.billingForm.controls.shippingBillToDisplayable.value;
      this.transportationSelectedAccountNumber = this.billingForm.controls.shippingAccountNumber.value;
      this.dutiesAndTaxesSelectedType = this.billingForm.controls.dutiesTaxesBillToDisplayable.value;
      this.dutiesAndTaxesSelectedAccountNumber = this.billingForm.controls.dutiesTaxesAccountNumber.value;
      const modal = await this.modalCtrl.create({
        component: PaymentOptionsModalComponent,
        cssClass: 'payment-options-modal',
        componentProps: {
          'modalType': modalType,
          'modalTypeVal': modalTypeVal,
          'transportationSelectedType': this.transportationSelectedType,
          'transportationSelectedAccountNumber': this.transportationSelectedAccountNumber,
          'dutiesAndTaxesSelectedType': this.dutiesAndTaxesSelectedType,
          'dutiesAndTaxesSelectedAccountNumber': this.dutiesAndTaxesSelectedAccountNumber,
          'transportOptions': this.transportOptions,
          'dutiesTaxesOptions': this.dutiesTaxesOptions
        }
      });

      modal.onDidDismiss().then(response => {
        if (response.data) {
          if (modalType === BillingOptionsUtil.TRANSPORT_COST) {
            this.checkSelectedPaymentOptionsBilling(response);
            this.setTransportFormValues(response);
            this.rateFlag = false;
            if (response.data !== BillingOptionsUtil.PAY_AT_DROP_OFF) {
              this.rateFlag = true;
            }
          } else {
            this.checkSelectedPaymentOptionsTransport(response);
            this.setDutiesAndTaxesFormValues(response);
          }
        }
        this.isModalPresent = false;
      });

      return await modal.present();
    }
  }

  setTransportValueDisplayName(displayValue, accountNumber) {
    const translationKeyBilling = 'billingAndServicesOptionPage.' + (BillingOptionsUtil.getPaymentType(displayValue).translationKey);
    if (accountNumber) {
      this.billingForm.controls.transportVal.setValue(this.translate.instant(translationKeyBilling) + '-' + accountNumber);
    } else {
      this.billingForm.controls.transportVal.setValue(this.translate.instant(translationKeyBilling));
    }
  }

  setDutiesValueDisplayName(displayValue, accountNumber) {
    const translationKeyDuties = 'billingAndServicesOptionPage.' + (BillingOptionsUtil.getPaymentType(displayValue).translationKey);
    if (accountNumber) {
      this.billingForm.controls.dutiesVal.setValue(this.translate.instant(translationKeyDuties) + '-' + accountNumber);
    } else {
      this.billingForm.controls.dutiesVal.setValue(this.translate.instant(translationKeyDuties))
    }
  }

  setTransportFormValues(response) {
    this.billingForm.controls.shippingBillTo.setValue(BillingOptionsUtil.getPaymentType(response.data).value);
    this.billingForm.controls.shippingBillToDisplayable.setValue(response.data);
    this.billingForm.controls.shippingAccountNumber.setValue(response.role);
    if (response.role) {
      this.billingForm.controls.transportVal.setValue(response.data + '-' + response.role);
      this.billingForm.controls.shippingAccountNumberDisplayable.setValue(response.data + '-' + response.role);
    } else {
      this.billingForm.controls.transportVal.setValue(response.data);
      this.billingForm.controls.shippingAccountNumberDisplayable.setValue(response.data);
    }

    this.setTransportValueDisplayName(response.data, response.role);
  }

  setDutiesAndTaxesFormValues(response) {
    this.billingForm.controls.dutiesTaxesBillTo.setValue(BillingOptionsUtil.getPaymentType(response.data).value);
    this.billingForm.controls.dutiesTaxesBillToDisplayable.setValue(response.data);
    if (response.role) {
      this.billingForm.controls.dutiesTaxesAccountNumber.setValue(response.role);
      this.billingForm.controls.dutiesVal.setValue(response.data + '-' + response.role);
      this.billingForm.controls.dutiesTaxesAccountNumberDisplayable.setValue(response.data + '-' + response.role);
    } else {
      this.billingForm.controls.dutiesTaxesAccountNumber.setValue('');
      this.billingForm.controls.dutiesVal.setValue(response.data);
      this.billingForm.controls.dutiesTaxesAccountNumberDisplayable.setValue(response.data);
    }

    this.setDutiesValueDisplayName(response.data, response.role);
  }

  checkSelectedPaymentOptionsBilling(response) {
    if (this.dutiesAndTaxesSelectedType === response.data) {
      this.setDutiesAndTaxesFormValues(response);
    }
  }

  checkSelectedPaymentOptionsTransport(response) {
    if (this.transportationSelectedType === response.data) {
      if (response.data === BillingOptionsUtil.BILL_RECIPIENT && response.role === '') {
        return;
      }
      this.setTransportFormValues(response);
    }
  }

  openSignatureOptions(evnt: MouseEvent) {
    if (this.selectedSignatureValueRef) {
      this.selectedSignatureValueRef.interface = 'alert';
      this.selectedSignatureValueRef.open(evnt);
    }
  }

  submitForm(): void {
    if (this.billingForm.valid) {
      this.updatePaymentDetails();
      this.editBillingPageDetails = false;
      this.subs.unsubscribe();
      this.router.navigate(['/', 'shipping', 'summary']);
    }
  }

  public mapPaymentDetailsToShippingAppModel(): IPayment {
    const billingFormVal: BillingForm = this.billingForm.value;
    return {
      shippingBillTo: (billingFormVal.shippingBillTo) ? billingFormVal.shippingBillTo : BillingOptionsUtil.getPaymentType(BillingOptionsUtil.PAY_AT_DROP_OFF).value,
      shippingBillToDisplayable: (billingFormVal.shippingBillToDisplayable) ? billingFormVal.shippingBillToDisplayable : BillingOptionsUtil.PAY_AT_DROP_OFF,
      shippingAccountNumber: (billingFormVal.shippingAccountNumber) ? billingFormVal.shippingAccountNumber : '',
      shippingAccountNumberDisplayable: (billingFormVal.shippingAccountNumberDisplayable) ? billingFormVal.shippingAccountNumberDisplayable : BillingOptionsUtil.PAY_AT_DROP_OFF,
      dutiesTaxesBillTo: (billingFormVal.dutiesTaxesBillTo) ? billingFormVal.dutiesTaxesBillTo : BillingOptionsUtil.getPaymentType(BillingOptionsUtil.BILL_RECIPIENT).value,
      dutiesTaxesBillToDisplayable: (billingFormVal.dutiesTaxesBillToDisplayable) ? billingFormVal.dutiesTaxesBillToDisplayable : BillingOptionsUtil.BILL_RECIPIENT,
      dutiesTaxesAccountNumber: billingFormVal.dutiesTaxesAccountNumber ? billingFormVal.dutiesTaxesAccountNumber : '',
      dutiesTaxesAccountNumberDisplayable: billingFormVal.dutiesTaxesAccountNumberDisplayable ? billingFormVal.dutiesTaxesAccountNumberDisplayable : BillingOptionsUtil.BILL_RECIPIENT
    };
  }

  mapSignatureOptionsToShippingAppModel(signature): ISpecialServices {
    let specialServiceInfoObj = undefined;
    if (signature) {
      specialServiceInfoObj = {
        selectedSignatureOption: {
          key: signature.key,
          displayText: signature.displayText
        },
        handlingTypes: this.currentShippingInfo.shipmentDetails.specialServiceInfo ? this.currentShippingInfo.shipmentDetails.specialServiceInfo.handlingTypes : undefined
      };
    }
    return specialServiceInfoObj;
  }

  updateRateDetails(rateDetails: IRatesForm): void {
    this.appStore.dispatch(updateSelectedRate({
      rateDetails: this.ratesReqDataMapper.mapSelectedRateToRateDetails(rateDetails)
    }));
  }

  updatePaymentDetails() {
    this.appStore.dispatch(savePaymentsDetailsAction({
      paymentDetails: this.mapPaymentDetailsToShippingAppModel(),
      specialServiceInfo: this.mapSignatureOptionsToShippingAppModel(this.form.selectedSignatureValue.value)
    }));
  }

  get form() {
    return this.billingForm.controls;
  }

  async signatureOptionBubbleHint() {
    const modal = await this.modalCtrl.create({
      component: SignatureOptionBubbleHintComponent,
      cssClass: 'signature-option-bubble-hint-modal',
    });
    return await modal.present();
  }

  /**
  * Edit from Summary page.
  */
  addListenerForEditFromSummary() {
    window.addEventListener('editBillingServiceOptionDetails', () => {
      this.editBillingPageDetails = true;
      this.backbuttonFlag = false;
    });
  }

  cancelEditBillingPageDetails() {
    this.editBillingPageDetails = false;
    this.backbuttonFlag = true;
    this.router.navigate(['/', 'shipping', 'summary']);
  }

  onClickSelectDropdown() {
    this.utils.applyArialFontToSelectPopup();
  }
}
