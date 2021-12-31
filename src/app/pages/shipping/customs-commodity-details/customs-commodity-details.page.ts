import { Component, OnInit } from '@angular/core';
import { SearchCommodityItemComponent } from './components/search-commodity-item/search-commodity-item.component';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ICommodity } from 'src/app/interfaces/shipping-app/commodity';
import { CommodityForm } from 'src/app/interfaces/shipping-form/commodity-form';
import { CustomsDetails } from 'src/app/types/constants/customs-details.constants';
import { select, Store } from '@ngrx/store';
import { AppState } from 'src/app/+store/app.state';
import { addCommodityAction, updateCurrencyDisplayValue, getUomListLocalApiBegin, getUomListUSApiBegin, saveMergedUomListAction, updateCustomsDetailsBegin } from '../+store/shipping.actions';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemsType } from 'src/app/types/enum/items-type.enum';
import { ItemsTypeObj } from 'src/app/interfaces/items-type-obj.interface';
import { CountryLocale } from 'src/app/types/constants/country-locale.constants';
import { ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import * as fromShippingSelector from '../+store/shipping.selectors';
import { ICustomsInfo } from 'src/app/interfaces/shipping-app/customs-info';
import { pairwise, startWith } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from 'src/app/core/providers/notification-service';
import { KeyTexts } from 'src/app/interfaces/api-service/response/key-texts';
import { SystemCommodity } from 'src/app/interfaces/api-service/response/system-commodity';
import { IUser } from 'src/app/interfaces/shipping-app/user';
import { LocalCommodityService } from 'src/app/core/providers/local/commodity.service';
import { customsValueValidator, customsWeightValueValidator } from 'src/app/providers/directives/customs-value.directive';
import { TranslatePipe } from '@ngx-translate/core'
import { SessionItems } from 'src/app/types/enum/session-items.enum';
import { InputTypeConstants } from 'src/app/types/constants/input-type-constants';
import { Util } from 'src/app/providers/util.service';
import { ConfigService } from '@ngx-config/core';

@Component({
  selector: 'app-customs-commodity-details',
  templateUrl: './customs-commodity-details.page.html',
  styleUrls: ['./customs-commodity-details.page.scss'],
})
export class CustomsCommodityDetailsPage implements OnInit {
  @ViewChild('totalWeightInput', { static: false }) totalWeightInput: { setFocus: () => void; };
  @ViewChild('totalCustomsValueInput', { static: false }) totalCustomsValueInput: { setFocus: () => void; };

  commodityForm: FormGroup;

  // strings
  prevCurrencyValue: string;
  updatedCurrencyValue: string;
  defaultQtyUnit: string;
  packageDetails: string;
  selectedValue: string;
  itemSelectedType: string;
  defaultHref = '';

  // numbers
  minQty = CustomsDetails.MinQuantity;
  maxQty = CustomsDetails.MaxQuantity;
  editIndex: number;

  // booleans  
  showUpdateButton: boolean;
  isRequiredCustomsValue = false;

  // custom types
  eItemsType: typeof ItemsType = ItemsType;

  // array objects/list
  arrItemsType: ItemsTypeObj[];
  uomList: any[] = null;
  mergedUomList: KeyTexts[] = [];
  uomListUS: any[] = null;
  uomListLocal: any[] = null;
  items: ICommodity[];

  // unknown types
  currencyList: any;
  countryManufactureList: any;
  selectedItem: any;
  itemSubCategoryList: SystemCommodity[];
  userId: any;
  commodityId: string;

  // built-in classes
  subs = new Subscription();
  defaultCountryManufacture = '';

  inputConstants = InputTypeConstants;

  constructor(
    public formBuilder: FormBuilder,
    private appStore: Store<AppState>,
    private route: Router,
    private el: ElementRef,
    public modalCtrl: ModalController,
    private activatedRoute: ActivatedRoute,
    private alertController: AlertController,
    public toastController: ToastController,
    private translate: TranslateService,
    public notif: NotificationService,
    private localCommodityService: LocalCommodityService,
    public translatePipe: TranslatePipe,
    private utils: Util,
    private readonly config: ConfigService
  ) {
    this.arrItemsType = CustomsDetails.initialItemsTypeObj();
  }

  ngOnInit() {
    this.getSenderRecipientInfo();
    this.handleUomUSApiSuccess();
    this.handleUomLocalApiSuccess();
    this.getUomList();
    this.getMergedUomList();
    this.getShipmentDetails();
    this.currencyList = CountryLocale.getResourceBySupportedCountry(sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY)).currencies;
    this.currencyList = this.currencyList.default.output.currencies;
    const currentCurrency = this.currencyList.find(countryCurrency => countryCurrency.countryCode === sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY));
    const defaultCurrency = currentCurrency ? currentCurrency.code : this.currencyList[0].code;

    this.commodityForm = this.formBuilder.group({
      itemType: ['', [Validators.required]],
      itemDescription: ['', [Validators.required]],
      quantity: [this.minQty],
      quantityUnit: [this.defaultQtyUnit, [Validators.required]],
      totalWeight: ['', [Validators.required, customsWeightValueValidator(true), Validators.pattern('^[0-9]+([\u002e][0-9]{1,2})?$')]],
      totalWeightUnit: [this.packageDetails],
      totalCustomsValue: ['', [Validators.required, customsValueValidator(this.isRequiredCustomsValue), Validators.pattern('^[0-9]+([\u002e][0-9]{1,2})?$')]],
      customsValueCurrency: [defaultCurrency],
      countryOfManufacture: [this.defaultCountryManufacture, [Validators.required]],
      hsCode: []
    });

    this.subs.add(
      this.appStore.pipe(select(fromShippingSelector.selectUserLoginDetails))
        .subscribe((details: IUser) => {
          if (details) {
            this.userId = details.userId;
          }
        })
    );

    if (this.activatedRoute.snapshot.paramMap.get('id')) {
      this.editIndex = +this.activatedRoute.snapshot.paramMap.get('id');
    }

    this.selectedValue = '';
    this.getMergedCountryOfManufactureList();
    this.getCurrencyListFromStore();
    this.getThecustomsDetailsStateFromStore();
    this.getSystemCommodityList();
  }

  getSenderRecipientInfo() {
    this.appStore.pipe(select(fromShippingSelector.selectSenderRecipientInfo))
      .subscribe((senderRecipientInfo) => {
        if (senderRecipientInfo) {
          this.isRequiredCustomsValue = (senderRecipientInfo.customsValueSupport.customsValue === 'REQUIRED');
        }
      });
  }

  getUomList() {
    const countryCode = CustomsDetails.APAC;
    const configType = CustomsDetails.UOM;
    this.appStore.dispatch(getUomListUSApiBegin());
    this.appStore.dispatch(getUomListLocalApiBegin({ countryCode, configType }));
  }

  getSystemCommodityList() {
    this.appStore.pipe(select(fromShippingSelector.selectMergedSubCategoryCommodityList)).subscribe((systemCommodityList: SystemCommodity[]) => {
      if (systemCommodityList) {
        this.itemSubCategoryList = systemCommodityList;
      }
    });
  }

  handleUomUSApiSuccess() {
    this.subs.add(
      this.appStore.pipe(select(fromShippingSelector.selectUnitOfMeasure)).subscribe((uomListUS: any) => {
        if (uomListUS) {
          this.uomListUS = uomListUS.keyTexts;
          this.mergeUomListLocalAndUS();
        }
      })
    );
  }

  handleUomLocalApiSuccess() {
    this.subs.add(
      this.appStore.pipe(select(fromShippingSelector.selectUomListLocal)).subscribe((uomListLocal: any) => {
        if (uomListLocal) {
          this.uomListLocal = uomListLocal;
          this.mergeUomListLocalAndUS();
        }
      })
    );
  }

  mergeUomListLocalAndUS() {
    if (this.uomListLocal && this.uomListUS) {
      this.uomListLocal = this.mapLocalUomListToUSUomList();
      this.mergedUomList = this.uomListLocal;
      this.saveMergedUomListToStore();
    }
  }

  mapLocalUomListToUSUomList() {
    let updatedLocalUomList = [];
    this.uomListLocal.forEach(uomLocal => {
      const matchedUom = this.uomListUS.find(uomUS =>
        uomLocal.value === uomUS.key);
      if (matchedUom !== undefined) {
        updatedLocalUomList.push(matchedUom);
      }

    });
    return updatedLocalUomList;
  }

  saveMergedUomListToStore() {
    this.appStore.dispatch(saveMergedUomListAction({
      mergedUomList: this.mergedUomList
    }));
  }

  getMergedUomList() {
    this.subs.add(
      this.appStore.pipe(select(fromShippingSelector.selectMergedUomList)).subscribe((uomList: any) => {
        if (uomList && uomList.length > 0) {
          this.uomList = uomList;
          this.defaultQtyUnit = this.defaultQtyUnit ? this.defaultQtyUnit : this.uomList[0].key;
          if (this.commodityForm) {
            this.commodityForm.get('quantityUnit').setValue(this.defaultQtyUnit, { emitEvent: true });
          }
        }
      })
    );
  }

  setupEditFrom() {
    if (this.editIndex >= 0) {
      const item = this.items[this.editIndex];
      if (item) {
        const selectedItem = CustomsDetails.mainCommodityItemTypes().find(commodityType => commodityType.displayText === item.name);
        for (const aitem of this.arrItemsType) {
          if (aitem.typeKey === selectedItem.key) {
            aitem.selected = true;
          } else {
            aitem.selected = false;
          }
        }
        this.isItemTypeSelected(selectedItem.key);
        this.showUpdateButton = true;
        this.selectedItem = selectedItem;
        this.selectedValue = item.description;
        this.itemSelectedType = selectedItem.key;
        this.defaultQtyUnit = item.quantityUnits;
        this.commodityForm.controls.itemType.setValue(item.name, { emitEvent: false });
        this.commodityForm.controls.itemDescription.setValue(item.description, { emitEvent: false });
        this.commodityForm.controls.quantity.setValue(item.quantity, { emitEvent: false });
        this.commodityForm.controls.quantityUnit.setValue(item.quantityUnits, { emitEvent: false });
        this.commodityForm.controls.totalWeight.setValue(item.totalWeight, { emitEvent: false });
        this.commodityForm.controls.totalCustomsValue.setValue(item.totalCustomsValue, { emitEvent: false });
        this.commodityForm.controls.totalWeightUnit.setValue(item.totalWeightUnit, { emitEvent: false });
        this.commodityForm.controls.customsValueCurrency.setValue(item.unitPrice, { emitEvent: false });
        this.commodityForm.controls.countryOfManufacture.setValue(item.countryOfManufacture, { emitEvent: false });
        this.commodityForm.controls.hsCode.setValue(item.hsCode, { emitEvent: false });
      }
    }
  }

  getThecustomsDetailsStateFromStore() {
    const customsDetailsState = this.appStore.pipe(select(fromShippingSelector.selectCustomsDetails))
      .subscribe((currentCustomsDetailsState: ICustomsInfo) => {
        if (currentCustomsDetailsState) {
          this.items = currentCustomsDetailsState.commodityList;
          this.setupEditFrom();
        }
      });
    this.subs.add(customsDetailsState);

    const curr = this.commodityForm.get('customsValueCurrency').value;
    const customsValueCurrency = this.commodityForm.get('customsValueCurrency');
    customsValueCurrency.valueChanges.pipe(startWith(''), pairwise()).subscribe(([prev, next]) => {
      prev = prev ? prev : curr;
      const prevCurrency = this.getCurrencyDetails(prev);
      const nextCurrency = this.getCurrencyDetails(next);
      prev = prevCurrency ? prevCurrency.isoCode : prev;
      next = nextCurrency ? nextCurrency.isoCode : next;
      if (prev !== next) {
        this.presentAlertConfirm(prev, next);
        this.prevCurrencyValue = prev;
        this.updatedCurrencyValue = next;
      } else {
        this.prevCurrencyValue = null;
        this.updatedCurrencyValue = null;
      }
    });
  }

  ionViewDidEnter() {
    this.defaultHref = `/customs-details`;
  }

  isItemTypeSelected(itemsType: string): boolean {
    return this.arrItemsType.find(type => type.typeKey === itemsType).selected;
  }

  selectItemsType(itemsType: string) {
    this.itemSelectedType = itemsType;
    for (const item of this.arrItemsType) {
      if (item.typeKey === itemsType) {
        item.selected = true;
      } else {
        item.selected = false;
      }
    }
    this.openSearchCommodityModal();
  }

  async openSearchCommodityModal() {
    const modal = await this.modalCtrl.create({
      component: SearchCommodityItemComponent,
      cssClass: 'customs-commodity-modal',
      componentProps: {
        itemSelectedType: this.itemSelectedType
      }
    });

    modal.onDidDismiss().then(searchItem => {
      if (searchItem.data.description) {
        this.selectedValue = searchItem.data.description;
        this.selectedItem = CustomsDetails.mainCommodityItemTypes().find(item => item.key === this.itemSelectedType);
        // created from User Story B-452794 - values assigned to hidden controls
        this.form.itemType.setValue(this.selectedItem.displayText);
        this.form.itemDescription.setValue(searchItem.data.description);
      }
    });
    return await modal.present();
  }

  submitForm(): void {
    this.makeApiCallToSaveNewCommodity();
    if (this.commodityForm.valid) {
      this.updateCommodityList();
      this.route.navigateByUrl('/shipping/customs-details');
    } else {
      this.scrollToFirstInvalidControl();
    }
  }


  /**
   * TODO: Refactor this method, This should not exist at all.
   * Temporarily modified to include the checking of form validity
   */
  updateCommodityDetails() {
    if (this.commodityForm.valid) {
      this.updateCurrencyDisplayValue();
      this.route.navigateByUrl('/shipping/customs-details');
      this.appStore.dispatch(updateCustomsDetailsBegin({
        id: this.editIndex,
        commodity: this.mapCommodityToShippingApp()
      }));
      this.showToasPopupForCurrencyChange();
    } else {
      this.scrollToFirstInvalidControl();
    }
  }

  scrollToFirstInvalidControl() {
    const firstInvalidControl: HTMLElement = this.el.nativeElement.querySelector(
      'form .ng-invalid'
    );
    this.setFocusOnFirstInvalidInput(firstInvalidControl.id);
    this.commodityForm.markAllAsTouched();
  }

  setFocusOnFirstInvalidInput(inputId: string) {
    switch (inputId) {
      case 'totalWeight': {
        this.totalWeightInput.setFocus();
        break;
      }
      case 'totalCustomsValue': {
        this.totalCustomsValueInput.setFocus();
        break;
      }
      case 'quantityUnit': {
        this.form.quantityUnit.markAsDirty();
        break;
      }
      case 'countryOfManufacture': {
        this.form.countryOfManufacture.markAsDirty();
        break;
      }
      default: {
        this.form.itemType.markAsDirty();
        break;
      }
    }
  }

  updateCommodityList() {
    this.updateCurrencyDisplayValue();
    this.appStore.dispatch(addCommodityAction({
      commodity: this.mapCommodityToShippingApp()
    }));
    this.showToasPopupForCurrencyChange();
  }

  showToasPopupForCurrencyChange() {
    if (this.prevCurrencyValue && this.updatedCurrencyValue) {
      this.presentToast(this.prevCurrencyValue, this.updatedCurrencyValue);
    }
  }

  mapCommodityToShippingApp(): ICommodity {
    const commodityFormVal: CommodityForm = this.commodityForm.value;
    return {
      name: commodityFormVal.itemType,
      description: commodityFormVal.itemDescription,
      countryOfManufacture: commodityFormVal.countryOfManufacture,
      quantity: commodityFormVal.quantity,
      quantityUnits: commodityFormVal.quantityUnit,
      qtyUnitLabel: this.getQuantityUnitLabel(commodityFormVal.quantityUnit),
      totalWeight: commodityFormVal.totalWeight,
      totalWeightUnit: commodityFormVal.totalWeightUnit,
      totalWeightUnitLabel: CustomsDetails.getWeightUnitLabel(commodityFormVal.totalWeightUnit),
      totalCustomsValue: commodityFormVal.totalCustomsValue,
      unitPrice: commodityFormVal.customsValueCurrency,
      hsCode: commodityFormVal.hsCode
    };
  }

  getQuantityUnitLabel(quantityUnit: string): string {
    const item = this.uomList.find((uomItem) => uomItem.key === quantityUnit);
    return item.displayText;
  }

  onTickNumStepper(operation: string) {
    const currentQtyValue = this.form.quantity.value;
    switch (operation) {
      case 'subtract':
        if (this.form.quantity.value > this.minQty) {
          this.form.quantity.setValue(currentQtyValue - 1);
        }
        break;
      default:
        if (this.form.quantity.value < this.maxQty) {
          this.form.quantity.setValue(currentQtyValue + 1);
        }
        break;
    }
  }

  observeQuantity(e) {
    const currentQtyValue = this.form.quantity.value;
    if (!currentQtyValue || currentQtyValue < this.minQty) {
      this.form.quantity.setValue(this.minQty);
    } else if (currentQtyValue > this.maxQty) {
      this.form.quantity.setValue(this.maxQty);
    }
  }

  get form() {
    return this.commodityForm.controls;
  }

  async presentAlertConfirm(prev, curr) {
    const applyArialFont = this.config.getSettings('ARIAL_FONT_LANGUAGE_LIST').includes(sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE)) ? true : false;
    const message = this.translatePipe.transform(this.translate.instant('customsDetailsPage.currencyChangedMessage', { prev: prev, curr: curr }));
    const alert = await this.alertController.create({
      cssClass: applyArialFont ? 'confirmation-alert arial-font' : 'confirmation-alert',
      header: this.translate.instant('addItemsPage.confirmationAlert.header'),
      subHeader: this.translate.instant('addItemsPage.confirmationAlert.subHeader'),
      message: message,
      buttons: [
        {
          text: this.translate.instant('button.cancel'),
          role: 'cancel',
          cssClass: applyArialFont ? 'secondary arial-font' : 'secondary',
          handler: () => {
            const currency = this.currencyList.find(currencyItem => currencyItem.isoCode === prev);
            this.commodityForm.controls.customsValueCurrency.setValue(currency.iataCode, { emitEvent: false });
          }
        }, {
          cssClass: applyArialFont ? 'secondary arial-font' : 'secondary',
          text: this.translate.instant('button.update'),
          handler: () => {
          }
        }
      ]
    });
    await alert.present();
  }

  async presentToast(ICurrency, UCurrency) {
    const message = this.translatePipe.transform(this.translate.instant('customsDetailsPage.currencyUpdationMessage', { ICurrency: ICurrency, UCurrency: UCurrency }));
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom'
    });
    toast.present();
  }

  getCurrencyListFromStore() {
    this.subs.add(
      this.appStore.pipe(select(fromShippingSelector.selectMergedCurrencyList)).subscribe((currencyList: any) => {
        if (currencyList) {
          this.currencyList = currencyList;
          this.updateCurrencyDisplayValue();
        }
      })
    );
  }

  getCurrencyDetails(currencyValue) {
    const currency = this.currencyList.find(currencyItem => currencyItem.iataCode === currencyValue);
    return currency;
  }

  updateCurrencyDisplayValue() {
    const selectedCurrencyValue = this.form.customsValueCurrency.value;
    const selectedCurrency = this.getCurrencyDetails(selectedCurrencyValue);
    if (selectedCurrency) {
      this.appStore.dispatch(updateCurrencyDisplayValue({
        displayValue: selectedCurrency.isoCode
      }));
    }
  }

  ngOnDestroy() {
    if (this.subs) {
      this.subs.unsubscribe();
    }
  }

  getMergedCountryOfManufactureList() {
    this.subs.add(
      this.appStore.pipe(select(fromShippingSelector.selectMergedCountryOfManufactureList)).subscribe((comList: any) => {
        if (comList) {
          this.countryManufactureList = comList;
          this.defaultCountryManufacture = this.countryManufactureList.find(country => country.code === sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY)).name;
          this.commodityForm.get('countryOfManufacture').setValue(this.defaultCountryManufacture, { emitEvent: true });
        }
      })
    );
  }

  showHsCodeBubbleHint() {
    const hintMessage = this.translate.instant('customsDetailsPage.hsCodeBubbleHint');
    this.notif.showBubbleHintMessage(hintMessage);
  }

  getShipmentDetails() {
    this.subs.add(
      this.appStore.pipe(select(fromShippingSelector.selectShipmentDetails)).subscribe((shipmentDetails) => {
        if (shipmentDetails) {
          this.packageDetails = shipmentDetails.packageDetails[0].packageWeightUnit.toLowerCase();
        }
      })
    );
  }

  makeApiCallToSaveNewCommodity() {
    const itemMatchFound = this.itemSubCategoryList?.find(item => item.description === this.selectedValue);
    if (itemMatchFound === undefined && this.userId) {
      const commodityItem = {
        commodity: {
          user: {
            uid: this.userId
          },
          commodityDetail: {
            category: this.selectedItem?.displayText,
            description: this.selectedValue
          }
        }
      };
      this.localCommodityService.saveUserCommodity(commodityItem).subscribe(response => {
        this.commodityId = response.commodityId;
      });
    }
  }

  onClickSelectDropdown() {
    this.utils.applyArialFontToSelectPopup();
  }
}
