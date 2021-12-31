import { EventEmitter, Input, Output } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { NotificationService } from 'src/app/core/providers/notification-service';
import { DocumentsType } from 'src/app/types/enum/documents-type.enum';
import { CountryLocale } from 'src/app/types/constants/country-locale.constants';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ElementRef } from '@angular/core';
import { ViewChild } from '@angular/core';
import { CustomsDetails } from 'src/app/types/constants/customs-details.constants';
import { ICustomsInfo } from 'src/app/interfaces/shipping-app/customs-info';
import { IShipmentDetails } from 'src/app/interfaces/shipping-app/shipment-details';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/+store/app.state';
import * as fromShippingSelector from '../../../+store/shipping.selectors';
import { Subscription } from 'rxjs';
import { IonInput } from '@ionic/angular';
import * as apim from '../../../../../core/providers/apim';
import { CarriageLimit } from 'src/app/types/enum/carriage-limit.enum';
import { CurrencyConversionType } from 'src/app/types/enum/currency-converion-type.enum';
import { DatePipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { ServiceType } from 'src/app/types/enum/service-type.enum';
import { KeyTexts } from 'src/app/interfaces/api-service/response/key-texts';
import { InputTypeConstants } from 'src/app/types/constants/input-type-constants';
import { customsValueValidator, customsWeightValueValidator } from 'src/app/providers/directives/customs-value.directive';
import { SessionItems } from 'src/app/types/enum/session-items.enum';
import { Util } from 'src/app/providers/util.service';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
})
export class DocumentsComponent implements OnInit {
  @ViewChild('totalCustomsValInput', { static: false }) totalCustomsValInput: IonInput;
  @ViewChild('describeDocumentInput', { static: false }) describeDocumentInput: { setFocus: () => void; };
  @ViewChild('cdvInput', { static: false }) cdvInput: IonInput;
  @Input() documentSelected = false;
  @Input() isEditFromSummary;
  @Output() updateCustomsInfo = new EventEmitter();
  @Output() updateShipmentInfo = new EventEmitter();
  @Output() editFromSummary = new EventEmitter();

  isDocumentTypeSelected = false;
  isOtherDocumentSelected = false;
  isShowContinueButton = false;
  isShowCarriageValue = false;
  isTCVLessThanDCV = false;
  isCarriageValueLimit = false;
  setAdvanced = false;
  isDocumentTypeDisplayed = false;
  isRequiredCustomsValue = false;

  documentTypeList: KeyTexts[];
  notAllowedDocumentDesc: string[];
  inputConstants = InputTypeConstants;

  customDetailsState: ICustomsInfo;
  shipmentDetailsState: IShipmentDetails;

  currencyList: any;
  selectedCurrency: any;
  valueAndCurrencyErrorDisplay: string;
  carriageLimit: string;
  dateToday: string;
  serviceType: string;
  documentForm: FormGroup;
  currencyDisplayValue: string;

  private subs: Subscription;
  private tCVSub: Subscription;
  private dvCSub: Subscription;

  editPageDetails = false;
  stateCustomsData: ICustomsInfo;
  stateShipmentData: IShipmentDetails;
  editSubs: Subscription;

  constructor(
    public formBuilder: FormBuilder,
    private appStore: Store<AppState>,
    public notif: NotificationService,
    private router: Router,
    private translate: TranslateService,
    private el: ElementRef,
    private globalTradeAPIMService: apim.APIMGlobalTradeService,
    datePipe: DatePipe,
    private utils: Util
  ) {
    this.subs = new Subscription();
    this.dateToday = datePipe.transform(new Date(), 'MM/dd/yyyy');
  }

  // Gets the currency list from mock data and sets the default selected currency.
  ngOnInit() {
    this.currencyList = CountryLocale.getResourceBySupportedCountry(sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY)).currencies;
    this.currencyList = this.currencyList.default.output.currencies;
    const currentCountry = this.currencyList.find(currencyCountry => currencyCountry.countryCode === sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY));
    this.selectedCurrency = currentCountry ? currentCountry.code : this.currencyList[0].code;

    this.documentForm = this.formBuilder.group({
      documentType: [''],
      documentTypeCode: ['', Validators.required],
      totalCustomsValue: ['', customsValueValidator(this.isRequiredCustomsValue)],
      customsValueCurrency: [this.selectedCurrency],
      describeDocument: [''],
      carriageDeclaredValue: [''],
      carriageDeclaredValueCurrency: [this.selectedCurrency]
    });
    this.addListenerForEditFromSummary();
    this.loadAndFilterDocumentTypes();
    this.initDocuments();
    this.initShipmentDetails();
    this.getMergedCurrencyList();
  }

  ngOnDestroy() {
    if (this.subs) {
      this.subs.unsubscribe();
    }
  }

  initDocuments(): void {
    const subCustomsDetails = this.appStore.pipe(select(fromShippingSelector.selectCustomsDetails))
      .subscribe((currentCustomsInfo: ICustomsInfo) => {
        if (currentCustomsInfo) {
          this.customDetailsState = currentCustomsInfo;
          if (currentCustomsInfo.documentTypeCode) {
            if (this.isOtherDocumentSelected) {
              this.form.describeDocument.setValue(currentCustomsInfo.documentType);
            }

            if (this.isDocumentTypeSelected) {
              this.form.totalCustomsValue.setValue(currentCustomsInfo.documentValue);
              this.form.customsValueCurrency.setValue(currentCustomsInfo.documentValueUnits);
            }

            this.form.documentTypeCode.setValue(currentCustomsInfo.documentTypeCode);
            this.onChangeDocumentType(currentCustomsInfo.documentTypeCode);
          } else {
            this.form.totalCustomsValue.setValue('');
            this.form.describeDocument.setValue('');
            this.form.carriageDeclaredValue.setValue('');
            this.form.documentType.setValue('');
            this.form.documentTypeCode.setValue('');
          }
        }
      });
    this.subs.add(subCustomsDetails);
  }

  initShipmentDetails(): void {
    const subShipmentDetails = this.appStore.pipe(select(fromShippingSelector.selectShipmentDetails))
      .subscribe((currentShipmentInfo: IShipmentDetails) => {
        if (currentShipmentInfo) {
          this.shipmentDetailsState = currentShipmentInfo;
          this.isShowCarriageValue = (currentShipmentInfo.carriageDeclaredValue) ? true : false;
          this.serviceType = currentShipmentInfo.serviceType;
          if (this.isShowCarriageValue) {
            this.form.carriageDeclaredValue.setValue(currentShipmentInfo.carriageDeclaredValue);
            this.form.carriageDeclaredValueCurrency.setValue(currentShipmentInfo.carriageDeclaredValueCurrency);
            this.toggleCarriageValue(true);
          }
        }
      });
    this.subs.add(subShipmentDetails);
  }

  getMergedCurrencyList() {
    this.subs.add(
      this.appStore.pipe(select(fromShippingSelector.selectMergedCurrencyList)).subscribe((currencyList: any) => {
        if (currencyList) {
          this.currencyList = currencyList;
          this.updateCurrencyDisplayValue();
        }
      })
    );
  }

  updateCurrencyDisplayValue() {
    const selectedCurrencyValue = this.form.customsValueCurrency.value;
    const selectedCurrency = this.currencyList.find(currencyItem => currencyItem.iataCode === selectedCurrencyValue);
    if (selectedCurrency) {
      this.currencyDisplayValue = selectedCurrency.isoCode;
      this.form.customsValueCurrency.setValue(selectedCurrency.iataCode);
      this.validateCustomsValueAndCarriageValue();
    }
  }

  loadAndFilterDocumentTypes() {
    this.appStore.pipe(select(fromShippingSelector.selectSenderRecipientInfo))
      .subscribe((senderRecipientInfo) => {
        if (senderRecipientInfo) {
          this.isRequiredCustomsValue = (senderRecipientInfo.customsValueSupport.customsValue === 'REQUIRED');
          this.notAllowedDocumentDesc = senderRecipientInfo.customsValueSupport.notAllowedDocumentDescriptions;
        }
        this.filterDocumentTypes();
      });
  }

  filterDocumentTypes() {
    this.appStore.pipe(select(fromShippingSelector.selectDocumentDescriptions))
      .subscribe((documentDescriptions) => {
        if (documentDescriptions) {
          if (this.notAllowedDocumentDesc) {
            this.documentTypeList = documentDescriptions.keyTexts.filter(
              (documentType) => !this.notAllowedDocumentDesc.includes(documentType.key));
          } else {
            this.documentTypeList = documentDescriptions.keyTexts;
          }
          this.isDocumentTypeDisplayed = true;
        }
      });

    // MOCK DATA: if testing from the customs details page only to proceed
    if (environment.mock) {
      this.documentTypeList = CustomsDetails.getDocumentTypes();
      this.isDocumentTypeDisplayed = true;
    }
  }

  // Limits lengh of string to 10 for TCV and DCV
  limitLength(text: IonInput, length: number) {
    const maxLength = length;
    if (text.value.toString().length > maxLength) {
      text.value = text.value.toString().slice(0, maxLength);
    }
  }

  // TODO: To be revised later, this is a placeholder for the tooltip string.
  showTooltip() {
    const tooltipText = this.translate.instant('customsDetailsPage.declareValueTooltip');
    this.notif.showBubbleHintMessage(tooltipText);
  }

  // Sets the elements to show and hide base on the document type selection.
  onChangeDocumentType(documentTypeCode: string) {
    if (documentTypeCode === DocumentsType.NCV) {
      this.isDocumentTypeSelected = false;
      this.isOtherDocumentSelected = false;
      if (this.tCVSub) {
        this.tCVSub.unsubscribe();
      }
      if (this.dvCSub) {
        this.dvCSub.unsubscribe();
      }
      this.isCarriageValueLimit = false;
    } else if (documentTypeCode === DocumentsType.OTHER) {
      this.isDocumentTypeSelected = true;
      this.isOtherDocumentSelected = true;
      if (this.isShowCarriageValue) {
        this.totalCustomsOnValueChanges();
        this.declaredCarriageOnValueChanges();
      }
    } else {
      this.isDocumentTypeSelected = true;
      this.isOtherDocumentSelected = false;
      if (this.isShowCarriageValue) {
        this.totalCustomsOnValueChanges();
        this.declaredCarriageOnValueChanges();
      }
    }
    this.isTCVLessThanDCV = false;
    const docType = (documentTypeCode) ? this.documentTypeList.find(
      selectedDocType => selectedDocType.key === documentTypeCode).displayText : '';
    this.form.documentType.setValue(docType);
    this.isShowContinueButton = true;
    this.resetCustomsValueValidation();
    this.resetDescribeYourDocValidation();
    this.resetDeclaredCarriageValueValidation();
  }

  resetDescribeYourDocValidation() {
    if (this.isOtherDocumentSelected) {
      this.form.describeDocument.setValidators([Validators.required]);
      this.form.describeDocument.markAsUntouched();
      this.form.describeDocument.updateValueAndValidity();
    } else {
      this.form.describeDocument.reset();
      this.form.describeDocument.setValidators([]);
      this.form.describeDocument.markAsUntouched();
      this.form.describeDocument.updateValueAndValidity();
    }
  }

  // Resets the validators for total customs value
  resetCustomsValueValidation() {
    if (!this.isDocumentTypeSelected) {
      this.form.totalCustomsValue.reset();
      this.form.totalCustomsValue.setValidators([]);
      this.form.totalCustomsValue.markAsUntouched();
      this.form.totalCustomsValue.updateValueAndValidity();
    } else {
      this.updateTCVRequiredValidators();
    }
  }

  // Resets the validators for declared carriage value
  resetDeclaredCarriageValueValidation() {
    if (!this.isDocumentTypeSelected) {
      this.form.carriageDeclaredValue.reset();
      this.form.carriageDeclaredValue.setValidators([]);
      this.form.carriageDeclaredValue.markAsUntouched();
      this.form.carriageDeclaredValue.updateValueAndValidity();
    } else {
      if (this.isShowCarriageValue) {
        this.updateDCVRequiredValidators();
      }
    }
  }

  // Toggles the show/hide of declared carriage value form.
  toggleCarriageValue(toggleState: boolean) {
    if (toggleState) {
      this.isShowCarriageValue = true;
      this.updateDCVRequiredValidators();
      this.totalCustomsOnValueChanges();
      this.declaredCarriageOnValueChanges();
    } else {
      this.tCVSub.unsubscribe();
      this.dvCSub.unsubscribe();
      if (this.isTCVLessThanDCV) {
        this.updateTCVRequiredValidators();
      }
      this.isShowCarriageValue = false;
      this.isTCVLessThanDCV = false;
      this.form.carriageDeclaredValue.reset();
      this.form.carriageDeclaredValue.setValidators([]);
      this.form.carriageDeclaredValue.markAsUntouched();
      this.form.carriageDeclaredValue.updateValueAndValidity();
    }

    this.isCarriageValueLimit = false;
  }

  // Sets the validators for total customs value
  updateTCVRequiredValidators() {
    this.form.totalCustomsValue.setValidators([Validators.required, customsValueValidator(this.isRequiredCustomsValue), Validators.pattern('^[0-9]+([\u002e][0-9]{1,2})?$')]);
    this.form.totalCustomsValue.markAsUntouched();
    this.form.totalCustomsValue.updateValueAndValidity();
  }

  // Sets the validators for declared carriage value
  updateDCVRequiredValidators() {
    this.form.carriageDeclaredValue.setValidators([Validators.required, customsWeightValueValidator(true), Validators.pattern('^[0-9]+([\u002e][0-9]{1,2})?$')]);
    this.form.carriageDeclaredValue.markAsUntouched();
    this.form.carriageDeclaredValue.updateValueAndValidity();
  }

  // Validates if DCV is greater than TCV and sets the error if yes
  validateCustomsValueAndCarriageValue() {
    if ((this.form.totalCustomsValue.value && this.form.carriageDeclaredValue.value) &&
      (this.form.carriageDeclaredValue.value > this.form.totalCustomsValue.value)) {

      this.valueAndCurrencyErrorDisplay = this.currencyDisplayValue + this.form.carriageDeclaredValue.value.toString();

      this.form.totalCustomsValue.setErrors({ incorrect: true });
      this.isTCVLessThanDCV = true;
    }
    else {
      this.isTCVLessThanDCV = false;
    }
  }

  // Observes total customs value field if declared carriage value is present
  totalCustomsOnValueChanges() {
    this.tCVSub = this.form.totalCustomsValue.valueChanges.subscribe(value => {
      this.isTCVLessThanDCV = false;
      this.validateCustomsValueAndCarriageValue();
    });
  }

  // Observes declared carriage value
  declaredCarriageOnValueChanges() {
    this.dvCSub = this.form.carriageDeclaredValue.valueChanges.subscribe(value => {
      this.isTCVLessThanDCV = false;
      this.isCarriageValueLimit = false;
      this.validateCustomsValueAndCarriageValue();
      this.form.totalCustomsValue.updateValueAndValidity();
    });
  }

  // Updates the selected currency to reflect in the declared carriage value.
  updateCurrency() {
    this.form.carriageDeclaredValueCurrency.setValue(this.form.customsValueCurrency.value);
    this.updateCurrencyDisplayValue();
  }

  submitForm(): void {
    if (this.documentForm.valid) {
      this.updateCustomsDetails();
      this.updateShipmentDetails();
      if (this.tCVSub) {
        this.tCVSub.unsubscribe();
      }
      if (this.dvCSub) {
        this.dvCSub.unsubscribe();
      }
      if (this.editPageDetails) {
        this.editPageDetails = false;
        this.editFromSummary.emit(false);
        this.router.navigateByUrl('/shipping/summary');
      } else {
        this.editPageDetails = false;
        this.editFromSummary.emit(false);
        this.router.navigateByUrl('/shipping/sender-details');
      }
    } else {
      this.scrollToFirstInvalidControl();
    }
  }

  scrollToFirstInvalidControl() {
    const firstInvalidControl: HTMLElement = this.el.nativeElement.querySelector(
      'form .ng-invalid'
    );
    this.setFocusOnFirstInvalidInput(firstInvalidControl.id);
    this.documentForm.markAllAsTouched();
  }

  setFocusOnFirstInvalidInput(inputId: string) {
    switch (inputId) {
      case 'totalCustomsValue': {
        this.totalCustomsValInput.setFocus();
        break;
      }
      case 'describeDocument': {
        this.describeDocumentInput.setFocus();
        break;
      }
      case 'carriageDeclaredValue': {
        this.cdvInput.setFocus();
        break;
      }
      default: {
        this.form.documentType.markAsTouched();
        break;
      }
    }
  }

  // Validates the form first and calling currencyconversion API when needed
  validateBeforeSubmit() {
    if (this.isShowCarriageValue && this.documentForm.valid && (this.isDocumentTypeSelected || this.isOtherDocumentSelected)
      && this.serviceType === ServiceType.INTERNATIONAL_PRIORITY) {
      this.getConvertedCurrency(this.form.customsValueCurrency.value, this.form.carriageDeclaredValue.value, this.dateToday);
    } else {
      this.submitForm();
    }

  }

  // Call currencyconversion API
  getConvertedCurrency(fromCurrencyCode: string, amount: number, conversionDate: string) {
    const toCurrencyCode = CarriageLimit.CURRENCY;
    let convertedCurrencyAmount: number;

    // if MOCK is enabled only
    if (environment.mock) {
      fromCurrencyCode = 'HKD';
      amount = 300;
      conversionDate = '11012020';
    }

    this.globalTradeAPIMService.getCurrencyConversion(fromCurrencyCode, toCurrencyCode, amount, conversionDate).subscribe(
      (response) => {
        if (response) {
          for (const amountType of response.output.amount) {
            if (amountType.type === CurrencyConversionType.PREMIUM) {
              convertedCurrencyAmount = amountType.finalRoundedAmount;
              break;
            }
          }
          if (!convertedCurrencyAmount && response.output.amount[0].finalRoundedAmount) {
            convertedCurrencyAmount = response.output.amount[0].finalRoundedAmount;
          }
          if (convertedCurrencyAmount > Number(CarriageLimit[this.serviceType].replace(',', ''))) {
            this.carriageLimit = CarriageLimit[this.serviceType];
            this.isCarriageValueLimit = true;
            this.form.carriageDeclaredValue.setErrors({ incorrect: true });
          } else {
            this.isCarriageValueLimit = false;
            if (this.form.carriageDeclaredValue.valid) {
              this.submitForm();
            }
          }
        }
      }
    );
  }

  updateCustomsDetails(): void {
    const newCustomDetails = {
      commodityList: [],
      customsType: (this.customDetailsState) ? this.customDetailsState.customsType : '',
      productType: '',
      productPurpose: '',
      documentType: (this.isOtherDocumentSelected) ?
        this.form.describeDocument.value : this.form.documentType.value,
      documentTypeCode: this.form.documentTypeCode.value,
      documentValue: (this.isDocumentTypeSelected) ? this.form.totalCustomsValue.value : '',
      documentValueUnits: (this.isDocumentTypeSelected) ? this.form.customsValueCurrency.value : ''
    };
    this.updateCustomsInfo.emit(newCustomDetails);
  }

  updateShipmentDetails(): void {
    const updatedShipmentDetails: IShipmentDetails = {
      packageDetails: (this.shipmentDetailsState) ? this.shipmentDetailsState.packageDetails : [],
      totalNumberOfPackages: (this.shipmentDetailsState) ? this.shipmentDetailsState.totalNumberOfPackages : null,
      totalWeight: (this.shipmentDetailsState) ? this.shipmentDetailsState.totalWeight : null,
      serviceType: (this.shipmentDetailsState) ? this.shipmentDetailsState.serviceType : '',
      serviceName: (this.shipmentDetailsState) ? this.shipmentDetailsState.serviceName : '',
      packagingType: (this.shipmentDetailsState) ? this.shipmentDetailsState.packagingType : '',
      serviceCode: (this.shipmentDetailsState) ? this.shipmentDetailsState.serviceCode : '',
      advancedPackageCode: (this.shipmentDetailsState) ? this.shipmentDetailsState.advancedPackageCode : '',
      totalCustomsOrInvoiceValue: null,
      customsOrInvoiceValueCurrency: '',
      carriageDeclaredValue: (this.isShowCarriageValue) ? this.form.carriageDeclaredValue.value : null,
      carriageDeclaredValueCurrency: (this.isShowCarriageValue) ? this.form.carriageDeclaredValueCurrency.value : '',
      displayDate: (this.shipmentDetailsState) ? this.shipmentDetailsState.displayDate : '',
      shipDate: (this.shipmentDetailsState) ? this.shipmentDetailsState.shipDate : null,
      selectedRate: (this.shipmentDetailsState) ? this.shipmentDetailsState.selectedRate : null,
      firstAvailableShipDate: (this.shipmentDetailsState) ? this.shipmentDetailsState.firstAvailableShipDate : null,
      lastAvailableShipDate: (this.shipmentDetailsState) ? this.shipmentDetailsState.lastAvailableShipDate : null,
      availableShipDates: (this.shipmentDetailsState) ? this.shipmentDetailsState.availableShipDates : [],
      selectedPackageOption: (this.shipmentDetailsState) ? this.shipmentDetailsState.selectedPackageOption : null,
      specialServiceInfo: (this.shipmentDetailsState) ? this.shipmentDetailsState.specialServiceInfo : null,
      currencyDisplayValue: this.currencyDisplayValue
    };
    this.updateShipmentInfo.emit(updatedShipmentDetails);
  }

  get form() {
    return this.documentForm.controls;
  }

  showDocumentTypeBubbleHint() {
    const hintMessage = this.translate.instant('customsDetailsPage.documentTypeBubbleHInt');
    this.notif.showBubbleHintMessage(hintMessage);
  }

  /**
   * Edit from Summary page.
   */
  addListenerForEditFromSummary() {
    this.editPageDetails = this.isEditFromSummary;
    window.addEventListener('editCustomsDetails', () => {
      this.editPageDetails = true;
      this.editFromSummary.emit(true);
      this.editSubs = new Subscription();
      const subCustomsDetails = this.appStore.pipe(select(fromShippingSelector.selectCustomsDetails))
        .subscribe((currentCustomsDetailsState: ICustomsInfo) => {
          if (currentCustomsDetailsState) {
            this.stateCustomsData = { ...currentCustomsDetailsState };
            setTimeout(() => { this.editSubs.unsubscribe() }, 500);
          }
        });
      this.editSubs.add(subCustomsDetails);

      const subShipmentDetails = this.appStore.pipe(select(fromShippingSelector.selectShipmentDetails))
        .subscribe((currentShipmentDetailsState: IShipmentDetails) => {
          if (currentShipmentDetailsState) {
            this.stateShipmentData = { ...currentShipmentDetailsState };
          }
        });
      this.editSubs.add(subShipmentDetails);
    });
  }

  cancelEditPageDetails() {
    this.editPageDetails = false;
    this.editFromSummary.emit(false);
    this.updateCustomsInfo.emit(this.stateCustomsData);
    this.updateShipmentInfo.emit(this.stateShipmentData);
    this.router.navigateByUrl('/shipping/summary');
  }

  onClickSelectDropdown() {
    this.utils.applyArialFontToSelectPopup();
  }
}
