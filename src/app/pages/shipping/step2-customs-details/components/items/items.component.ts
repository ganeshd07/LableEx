import { DatePipe } from '@angular/common';
import { ViewChild } from '@angular/core';
import { EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { ElementRef } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, IonInput, ModalController } from '@ionic/angular';
import { select, Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { AppState } from 'src/app/+store/app.state';
import { ICommodity } from 'src/app/interfaces/shipping-app/commodity';
import { ICustomsInfo } from 'src/app/interfaces/shipping-app/customs-info';
import { IShipmentDetails } from 'src/app/interfaces/shipping-app/shipment-details';
import { CustomsDetails } from 'src/app/types/constants/customs-details.constants';
import * as fromShippingSelector from '../../../+store/shipping.selectors';
import * as apim from '../../../../../core/providers/apim';
import { CarriageLimit } from 'src/app/types/enum/carriage-limit.enum';
import { CurrencyConversionType } from 'src/app/types/enum/currency-converion-type.enum';
import { environment } from 'src/environments/environment';
import { ServiceType } from 'src/app/types/enum/service-type.enum';
import { deleteCoustomsdetailsBegin, getCountryOfManufactureLocalApiBegin, getCountryOfManufactureUSApimBegin, saveMergedCountryOfManufactureListAction } from '../../../+store/shipping.actions';
import { getShipmentPurposeBegin, getShipmentPurposeSuccess, getShipmentPurposeFailure } from '../../../+store/shipping.actions';
import { ManufactureCountriesList } from 'src/app/interfaces/api-service/response/manufacture-countries-list.interface';
import { ConfigList } from 'src/app/interfaces/api-service/response/configlist';
import { NotificationService } from 'src/app/core/providers/notification-service';
import { TranslateService } from '@ngx-translate/core';
import { ShipmentPurposeBubbleHintComponent } from '../shipment-purpose-bubble-hint/shipment-purpose-bubble-hint.component';
import { ItemsType } from 'src/app/types/enum/items-type.enum';
import { InputTypeConstants } from 'src/app/types/constants/input-type-constants';
import { customsWeightValueValidator } from 'src/app/providers/directives/customs-value.directive';
import { Util } from 'src/app/providers/util.service';
import { ConfigService } from '@ngx-config/core';
import { SessionItems } from 'src/app/types/enum/session-items.enum';

@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.scss'],
})
export class ItemsComponent implements OnInit, OnDestroy {
  @ViewChild('cdvInput', { static: false }) cdvInput: IonInput;
  @Input() itemSelected = false;
  @Input() isEditFromSummary;
  @Output() updateCustomsInfo = new EventEmitter();
  @Output() updateShipmentInfo = new EventEmitter();
  @Output() editFromSummary = new EventEmitter();

  hasDeclaredValueCarriage: boolean;
  isTCVLessThanDCV = false;
  isCarriageValueLimit = false;

  calculatedTotalWeightUnit: string;
  calculatedTotalCustomsValueCurrency: string;
  valueAndCurrencyErrorDisplay: string;
  carriageLimit: string;
  dateToday: string;
  serviceType: string;
  recipientCountryCode: string;
  senderCountryCode: string;

  calculatedTotalWeight = 0;
  calculatedTotalCustomsValue = 0;

  customDetailsState: ICustomsInfo;
  shipmentDetailsState: IShipmentDetails;

  items: ICommodity[] = [];
  shipmentPurposeList = [];

  itemForm: FormGroup;

  private subs: Subscription;
  dvCSub: Subscription;
  comMergeListSub: Subscription;
  showDeleteButton: boolean;
  commodityName: string;
  totalPackageWeight: number;
  countryOfManufactureListLocal: ConfigList[];
  countryOfManufactureListUS: ManufactureCountriesList[];
  mergedCountryOfManufactureList: any;

  editPageDetails = false;
  stateCustomsData: ICustomsInfo;
  stateShipmentData: IShipmentDetails;
  editSubs: Subscription;
  otherItem = '';
  inputConstants = InputTypeConstants;

  constructor(
    public formBuilder: FormBuilder,
    private appStore: Store<AppState>,
    private route: Router,
    private el: ElementRef,
    private globalTradeAPIMService: apim.APIMGlobalTradeService,
    private datePipe: DatePipe,
    private shipmentAPIMServices: apim.APIMShipmentService,
    public alertController: AlertController,
    public notif: NotificationService,
    private translate: TranslateService,
    public modalCtrl: ModalController,
    private utils: Util,
    private readonly config: ConfigService
  ) {
    this.subs = new Subscription();
    this.comMergeListSub = new Subscription();
    this.dateToday = datePipe.transform(new Date(), 'MM/dd/yyyy');
  }

  ngOnInit() {
    this.itemForm = this.formBuilder.group({
      shipmentPurpose: ['', [Validators.required]],
      carriageDeclaredValue: [''],
      carriageDeclaredValueCurrency: ['']
    });

    this.addListenerForEditFromSummary();
    this.initItems();
    this.initShipmentDetails();
    this.getInputDetailsFromStore();
    this.handleSeletedShipmentPurposeSuccess();
    this.getShipmentPurposeOptions();
    this.getShipmemtDetails();
    this.handleCountryOfManufactureLocalApiSuccess();
    this.handleCountryOfManufactureUSApiSuccess();
    this.otherItem = (CustomsDetails.mainCommodityItemTypes().find(item => item.key === ItemsType.OTHERS)).displayText;
  }

  getInputDetailsFromStore() {
    const senderCountryCode = this.appStore.pipe(select(fromShippingSelector.senderRecipientCountryCodes))
      .subscribe((codes) => {
        this.senderCountryCode = codes.senderCountryCode;
        this.recipientCountryCode = codes.recipientCountryCode;
      });
  }

  getShipmentPurposeOptions() {
    let senderCountryCode = this.senderCountryCode;
    let recipientCountryCode = this.recipientCountryCode;
    let serviceType = this.serviceType;

    this.appStore.dispatch(getShipmentPurposeBegin({ senderCountryCode, recipientCountryCode, serviceType }));
  }

  handleSeletedShipmentPurposeSuccess() {
    this.subs.add(
      this.appStore.pipe(select(fromShippingSelector.selectShipmentPurpose)).subscribe((shipmentPurposeDetails: any) => {
        if (shipmentPurposeDetails) {
          this.shipmentPurposeList = shipmentPurposeDetails;
        }
      })
    );
  }


  ngOnDestroy() {
    if (this.subs) {
      this.subs.unsubscribe();
    }
  }

  // Limits lengh of string to 10 for DCV
  limitLength(text: IonInput, length: number) {
    const maxLength = length;
    if (text.value.toString().length > maxLength) {
      text.value = text.value.toString().slice(0, maxLength);
    }
  }

  submitForm(): void {
    if (this.itemForm.valid) {
      this.updateCustomsDetails();
      this.updateShipmentDetails();
      this.comMergeListSub.unsubscribe();
      if (this.dvCSub) {
        this.dvCSub.unsubscribe();
      }
      if (this.editPageDetails) {
        this.editPageDetails = false;
        this.editFromSummary.emit(false);
        this.route.navigateByUrl('/shipping/summary');
      } else {
        this.editPageDetails = false;
        this.editFromSummary.emit(false);
        this.route.navigateByUrl('/shipping/sender-details');
      }

    } else {
      this.scrollToFirstInvalidControl();
    }
  }

  async presentAlertConfirm(index) {
    this.commodityName = this.items[index]?.description;
    const applyArialFont = this.config.getSettings('ARIAL_FONT_LANGUAGE_LIST').includes(sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE)) ? true : false;
    const alert = await this.alertController.create({
      cssClass: applyArialFont ? 'my-custom-class arial-font' : 'my-custom-class',
      message: `${this.translate.instant('customsDetailsPage.deleteConfirmation')} </br>${this.commodityName}`,
      buttons: [
        {
          text: this.translate.instant('button.cancel'),
          role: 'cancel',
          cssClass: applyArialFont ? 'secondary arial-font' : 'secondary',
          handler: (blah) => {
          }
        }, {
          text: this.translate.instant('button.delete'),
          cssClass: applyArialFont ? 'secondary arial-font' : 'secondary',
          handler: () => {
            this.appStore.dispatch(deleteCoustomsdetailsBegin({
              id: index
            }));
            if (this.items.length === 1) {
              this.showDeleteButton = false;
            }
          }
        }
      ]
    });
    await alert.present();
  }

  initItems(): void {
    const subCustomsDetails = this.appStore.pipe(select(fromShippingSelector.selectCustomsDetails))
      .subscribe((currentCustomsDetailsState: ICustomsInfo) => {
        if (currentCustomsDetailsState) {
          this.customDetailsState = currentCustomsDetailsState;
          this.form.shipmentPurpose.setValue(currentCustomsDetailsState.productPurpose);
          this.items = currentCustomsDetailsState.commodityList;
          this.calculateTotals(this.items);
          this.validateCustomsValueAndCarriageValue();
          if (this.items.length > 1) {
            this.showDeleteButton = true;
          }
        }
      });
    this.subs.add(subCustomsDetails);
  }

  initShipmentDetails(): void {
    const subShipmentDetails = this.appStore.pipe(select(fromShippingSelector.selectShipmentDetails))
      .subscribe((currentShipmentDetailsState: IShipmentDetails) => {
        if (currentShipmentDetailsState) {
          this.shipmentDetailsState = currentShipmentDetailsState;
          this.hasDeclaredValueCarriage = (currentShipmentDetailsState.carriageDeclaredValue) ? true : false;
          this.serviceType = currentShipmentDetailsState.serviceType;
          if (this.hasDeclaredValueCarriage) {
            this.form.carriageDeclaredValue.setValue(currentShipmentDetailsState.carriageDeclaredValue);
            this.form.carriageDeclaredValueCurrency.setValue(currentShipmentDetailsState.carriageDeclaredValueCurrency);
          }
        }
      });
    this.subs.add(subShipmentDetails);
  }

  updateCustomsDetails(): void {
    const selectedItem = this.shipmentPurposeList.find(item => item.key === this.form.shipmentPurpose.value);
    const newCustomDetails = {
      commodityList: (this.customDetailsState) ? this.customDetailsState.commodityList : [],
      customsType: (this.customDetailsState) ? this.customDetailsState.customsType : '',
      productType: selectedItem ? selectedItem.displayText : '',
      productPurpose: this.form.shipmentPurpose.value,
      documentType: '', // this property is for document types only
      documentTypeCode: '', // this property is for document types only
      documentValue: '', // this property is for document types only
      documentValueUnits: '' // this property is for document types only
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
      totalCustomsOrInvoiceValue: this.calculatedTotalCustomsValue,
      customsOrInvoiceValueCurrency: this.calculatedTotalCustomsValueCurrency,
      carriageDeclaredValue: (this.hasDeclaredValueCarriage) ? this.form.carriageDeclaredValue.value : null,
      carriageDeclaredValueCurrency: (this.hasDeclaredValueCarriage) ? this.calculatedTotalCustomsValueCurrency : '',
      displayDate: (this.shipmentDetailsState) ? this.shipmentDetailsState.displayDate : '',
      shipDate: (this.shipmentDetailsState) ? this.shipmentDetailsState.shipDate : null,
      selectedRate: (this.shipmentDetailsState) ? this.shipmentDetailsState.selectedRate : null,
      firstAvailableShipDate: (this.shipmentDetailsState) ? this.shipmentDetailsState.firstAvailableShipDate : null,
      lastAvailableShipDate: (this.shipmentDetailsState) ? this.shipmentDetailsState.lastAvailableShipDate : null,
      availableShipDates: (this.shipmentDetailsState) ? this.shipmentDetailsState.availableShipDates : [],
      selectedPackageOption: (this.shipmentDetailsState) ? this.shipmentDetailsState.selectedPackageOption : null,
      specialServiceInfo: (this.shipmentDetailsState) ? this.shipmentDetailsState.specialServiceInfo : null,
      currencyDisplayValue: (this.shipmentDetailsState) ? this.shipmentDetailsState.currencyDisplayValue : null
    };
    this.updateShipmentInfo.emit(updatedShipmentDetails);
  }

  goToMainCommodityPage() {
    if (this.itemForm.valid) {
      this.updateCustomsDetails();
      this.updateShipmentDetails();
      this.getCountryOfManufactureMergedList();
      this.route.navigateByUrl('/shipping/add-item');
    } else {
      this.itemForm.controls.shipmentPurpose.markAsTouched();
    }

  }

  editMainCommodityPage(index) {
    this.route.navigateByUrl(`/shipping/edit-item/${index}`);
  }

  calculateTotals(items: ICommodity[]) {
    this.calculatedTotalWeight = 0;
    this.calculatedTotalCustomsValue = 0;
    items.forEach(item => (this.calculatedTotalWeight = parseFloat((this.calculatedTotalWeight + item.totalWeight).toFixed(2))));
    items.forEach(item => (this.calculatedTotalCustomsValue = parseFloat((this.calculatedTotalCustomsValue + item.totalCustomsValue).toFixed(2))));


    if (items.length > 0) {
      this.calculatedTotalWeightUnit = items[0].totalWeightUnit;
      this.calculatedTotalCustomsValueCurrency = items[0].unitPrice;
    }
  }

  toggleDeclaredValueCarriage(event) {
    this.hasDeclaredValueCarriage = event.detail.checked;
    if (this.hasDeclaredValueCarriage) {
      this.form.carriageDeclaredValue.setValidators([Validators.required, customsWeightValueValidator(true), Validators.pattern('^[0-9]+([\u002e][0-9]{1,2})?$')]);
      this.form.carriageDeclaredValue.markAsUntouched();
      this.form.carriageDeclaredValue.updateValueAndValidity();

      this.declaredCarriageOnValueChanges();
    } else {
      this.dvCSub?.unsubscribe();
      this.isTCVLessThanDCV = false;
      this.form.carriageDeclaredValue.reset();
      this.form.carriageDeclaredValue.setValidators([]);
      this.form.carriageDeclaredValue.markAsUntouched();
      this.form.carriageDeclaredValue.updateValueAndValidity();
    }
  }

  // Validates if DCV is greater than computed TCV and sets the error if yes
  validateCustomsValueAndCarriageValue() {
    if ((this.calculatedTotalCustomsValue && this.form.carriageDeclaredValue.value) &&
      (this.form.carriageDeclaredValue.value > this.calculatedTotalCustomsValue)) {

      this.valueAndCurrencyErrorDisplay = this.shipmentDetailsState.currencyDisplayValue
        + this.form.carriageDeclaredValue.value.toString();

      this.isTCVLessThanDCV = true;
    }
    else {
      this.isTCVLessThanDCV = false;
    }
  }

  // Observes declared carriage value
  declaredCarriageOnValueChanges() {
    this.dvCSub = this.form.carriageDeclaredValue.valueChanges.subscribe(value => {
      this.isTCVLessThanDCV = false;
      this.isCarriageValueLimit = false;
      this.validateCustomsValueAndCarriageValue();
    });
  }

  // Validates the form first and calling currencyconversion API when needed
  validateBeforeSubmit() {
    if (this.hasDeclaredValueCarriage && this.itemForm.valid && !this.isTCVLessThanDCV
      && this.serviceType === ServiceType.INTERNATIONAL_PRIORITY) {
      this.getConvertedCurrency(this.calculatedTotalCustomsValueCurrency, this.form.carriageDeclaredValue.value, this.dateToday);
    } else {
      if (!this.isTCVLessThanDCV) {
        this.submitForm();
      }
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

  scrollToFirstInvalidControl() {
    const firstInvalidControl: HTMLElement = this.el.nativeElement.querySelector(
      'form .ng-invalid'
    );
    this.setFocusOnFirstInvalidInput(firstInvalidControl.id);
    this.itemForm.markAllAsTouched();
  }

  setFocusOnFirstInvalidInput(inputId: string) {
    switch (inputId) {
      case 'carriageDeclaredValue': {
        this.cdvInput.setFocus();
        break;
      }
      default: {
        this.form.shipmentPurpose.markAsTouched();
        break;
      }
    }
  }

  getShipmemtDetails() {
    const subShipmentDetails = this.appStore.pipe(select(fromShippingSelector.selectShipmentDetails))
      .subscribe(shipmentDetailsState => {
        if (shipmentDetailsState) {
          this.totalPackageWeight = shipmentDetailsState.totalWeight;
        }
      });
    this.subs.add(subShipmentDetails);
  }

  get form() {
    return this.itemForm.controls;
  }

  getCountryOfManufactureMergedList() {
    const subMergedComList = this.appStore.pipe(select(fromShippingSelector.selectMergedCountryOfManufactureList))
      .subscribe(mergedComList => {
        if (mergedComList) {
          this.mergedCountryOfManufactureList = mergedComList;
        } else {
          this.getCountryOfManufactureList();
        }
      });
    this.comMergeListSub.add(subMergedComList);
  }

  getCountryOfManufactureList() {
    const countryCode = this.senderCountryCode;
    const configType = CustomsDetails.CountryOfManufacture;
    const countryType = CustomsDetails.CountryType;
    if (countryCode) {
      this.appStore.dispatch(getCountryOfManufactureUSApimBegin({ countryType }));
      setTimeout(() => {
        this.appStore.dispatch(getCountryOfManufactureLocalApiBegin({ countryCode, configType }));
      }, 0);
    }
  }

  handleCountryOfManufactureLocalApiSuccess() {
    this.subs.add(
      this.appStore.pipe(select(fromShippingSelector.selectCountryOfManufactureListLocal)).subscribe((countryOfManufactureList: any) => {
        if (countryOfManufactureList) {
          this.countryOfManufactureListLocal = countryOfManufactureList;
          this.mergeCountryOfManufactureListLocalAndUS();
        }
      })
    );
  }

  handleCountryOfManufactureUSApiSuccess() {
    this.subs.add(
      this.appStore.pipe(select(fromShippingSelector.selectCountryOfManufactureListUS)).subscribe((countryOfManufactureList: any) => {
        if (countryOfManufactureList) {
          this.countryOfManufactureListUS = countryOfManufactureList;
          this.mergeCountryOfManufactureListLocalAndUS();
        }
      })
    );
  }

  mapLocalCountryOfManufactureListToUSList() {
    let updatedLocalCountryOfManufactureList = [];
    this.countryOfManufactureListLocal.forEach(comLocal => {
      const matchedCountryOfManufacture = this.countryOfManufactureListUS.find(comUS =>
        comLocal.value === comUS.actualCountryCode);
      if (matchedCountryOfManufacture !== undefined) {
        updatedLocalCountryOfManufactureList.push(matchedCountryOfManufacture);
      }
    });
    return updatedLocalCountryOfManufactureList;
  }

  mergeCountryOfManufactureListLocalAndUS() {
    if (this.countryOfManufactureListLocal && this.countryOfManufactureListUS) {
      this.countryOfManufactureListLocal = this.mapLocalCountryOfManufactureListToUSList();
      this.countryOfManufactureListLocal.forEach(comLocal => {
        this.countryOfManufactureListUS = this.countryOfManufactureListUS.filter(comUS =>
          comLocal.value !== comUS.actualCountryCode);
      });
      this.mergedCountryOfManufactureList = [...this.countryOfManufactureListLocal, ...this.countryOfManufactureListUS];
      this.saveMergedCountryOfManufactureListToStore();
    }
  }

  saveMergedCountryOfManufactureListToStore() {
    this.appStore.dispatch(saveMergedCountryOfManufactureListAction({
      mergedListOfcountryOfManufacture: this.mergedCountryOfManufactureList
    }));
  }

  async transportCostAndDutiesTaxDetails() {
    const modal = await this.modalCtrl.create({
      component: ShipmentPurposeBubbleHintComponent,
      cssClass: 'shipment-purpose-modal',
    });
    return await modal.present();
  }

  showPurchaseHigherLimitBubbleHint() {
    const hintMessage = this.translate.instant('customsDetailsPage.purchaseHigherLimitCoverageBubbleHint');
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
    this.updateCustomsInfo.emit(this.stateCustomsData);
    this.updateShipmentInfo.emit(this.stateShipmentData);
    this.editFromSummary.emit(false);
    this.route.navigateByUrl('/shipping/summary');
  }

  onClickSelectDropdown() {
    this.utils.applyArialFontToSelectPopup();
  }
}
