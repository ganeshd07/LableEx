import { OnDestroy } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { AppState } from 'src/app/+store/app.state';
import { CustomsType } from 'src/app/types/enum/customs-type.enum';
import { StepTypes } from '../../../types/enum/step-type.enum';
import * as fromShippingSelector from '../+store/shipping.selectors';
import { ICustomsInfo } from 'src/app/interfaces/shipping-app/customs-info';
import { Subscription } from 'rxjs';
import {
  saveMergedCurrencyListAction,
  updateCustomsDetailsAction,
  updateShipmentDetailsAction,
  getCurrencyListUSApiBegin,
  getCurrencyListLocalApiBegin,
  getSenderRecipientInfoBegin,
  getDocumentDescriptionsBegin
} from '../+store/shipping.actions';
import { IShipmentDetails } from 'src/app/interfaces/shipping-app/shipment-details';
import { CustomsDetails } from 'src/app/types/constants/customs-details.constants';
import { Currency } from 'src/app/interfaces/api-service/response/currency';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-step2-customs-details',
  templateUrl: './step2-customs-details.page.html',
  styleUrls: ['./step2-customs-details.page.scss'],
})
export class Step2CustomsDetailsPage implements OnInit, OnDestroy {
  currentStep: string = StepTypes.STEP2;
  itemSelected: boolean;
  documentSelected: boolean;
  itemType = CustomsType.ITEM;
  docType = CustomsType.DOCUMENT;

  customsInfoState: ICustomsInfo;
  shipmentInfoState: IShipmentDetails;

  currencyListUS: any[] = [];
  currencyListLocal: any[] = [];
  mergedCurrencyList: Currency[] = [];

  private subs: Subscription;

  senderCountryCode = '';
  recipientCountryCode = '';
  isEditFromSummary = false;

  constructor(
    private appStore: Store<AppState>,
  ) {
    this.subs = new Subscription();
  }

  ngOnInit() {
    const subCustInfo = this.appStore.pipe(select(fromShippingSelector.selectCustomsDetails))
      .subscribe((customsInfo: ICustomsInfo) => {
        this.customsInfoState = customsInfo;
        const type = (this.customsInfoState) ? this.customsInfoState.customsType : null;
        this.selectCustomsType(type);
      });

    this.subs.add(this.appStore.pipe(select(fromShippingSelector.senderRecipientCountryCodes))
      .subscribe((countryCodes) => {
        if (countryCodes) {
          this.senderCountryCode = countryCodes.senderCountryCode;
          this.recipientCountryCode = countryCodes.recipientCountryCode;
        }
      }));

    // MOCK DATA: if testing from the customs details page only to proceed
    if (environment.mock) {
      this.senderCountryCode = 'HK';
      this.recipientCountryCode = 'US';
    }

    this.saveSenderRecipientInfoToStore(this.senderCountryCode, this.recipientCountryCode);

    this.appStore.dispatch(getDocumentDescriptionsBegin({
      senderCountryCode: this.senderCountryCode,
      recipientCountryCode: this.recipientCountryCode,
      setAdvanced: false
    }));

    this.subs.add(subCustInfo);
    this.selectSenderCoutryCode();
    this.handleCurrencyUSApiSuccess();
    this.handleCurrencyLocalApiSuccess();
    this.getCurrencyList();
  }

  selectShipmentInfo() {
    const subShipInfo = this.appStore.pipe(select(fromShippingSelector.selectShipmentDetails))
      .subscribe((shipmentInfo: IShipmentDetails) => {
        this.shipmentInfoState = shipmentInfo;
      });
    this.subs.add(subShipInfo);
  }

  selectSenderCoutryCode() {
    const subsSenderCountryCode = this.appStore.pipe(select(fromShippingSelector.selectSenderCountryCode))
      .subscribe((senderCountryCode: string) => {
        if (senderCountryCode) {
          this.senderCountryCode = senderCountryCode;
        }
      });
    this.subs.add(subsSenderCountryCode);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  displayCustomsType(type: string) {
    this.selectCustomsType(type);
    // this updates the customsType ONLY from customsDetails object
    const updatedCustomsInfo = this.getCustomsInfoByCustomsType(type);
    this.updateCustomsDetails(updatedCustomsInfo);
  }

  selectCustomsType(type: string) {
    switch (type) {
      case CustomsType.ITEM: {
        this.itemSelected = true;
        this.documentSelected = false;
        break;
      }
      case CustomsType.DOCUMENT: {
        this.documentSelected = true;
        this.itemSelected = false;
        break;
      }
      default: {
        this.documentSelected = false;
        this.itemSelected = false;
        break;
      }
    }
  }

  updateCustomsDetails(state: ICustomsInfo) {
    this.appStore.dispatch(updateCustomsDetailsAction({
      customsDetails: state
    }));
  }

  updateShipmentDetails(state: IShipmentDetails): void {
    this.appStore.dispatch(updateShipmentDetailsAction({
      shipmentDetails: state
    }));
  }

  getCustomsInfoByCustomsType(newCUstomsType: string): ICustomsInfo {
    return {
      commodityList: (this.customsInfoState) ? this.customsInfoState.commodityList : [],
      customsType: newCUstomsType,
      productType: (this.customsInfoState) ? this.customsInfoState.productType : '',
      productPurpose: (this.customsInfoState) ? this.customsInfoState.productPurpose : '',
      documentType: (this.customsInfoState) ? this.customsInfoState.documentType : '',
      documentTypeCode: (this.customsInfoState) ? this.customsInfoState.documentTypeCode : '',
      documentValue: (this.customsInfoState) ? this.customsInfoState.documentValue : null,
      documentValueUnits: (this.customsInfoState) ? this.customsInfoState.documentValueUnits : ''
    };
  }

  getCurrencyList() {
    const countryCode = this.senderCountryCode;
    const configType = CustomsDetails.Currency;
    this.appStore.dispatch(getCurrencyListUSApiBegin());
    this.appStore.dispatch(getCurrencyListLocalApiBegin({ countryCode, configType }));
  }

  handleCurrencyUSApiSuccess() {
    this.subs.add(
      this.appStore.pipe(select(fromShippingSelector.selectCurrencyListUS)).subscribe((currencyList: any) => {
        if (currencyList) {
          this.currencyListUS = currencyList;
          this.mergeCurrencyListLocalAndUS();
        }
      })
    );
  }

  handleCurrencyLocalApiSuccess() {
    this.subs.add(
      this.appStore.pipe(select(fromShippingSelector.selectCurrencyListLocal)).subscribe((currencyList: any) => {
        if (currencyList) {
          this.currencyListLocal = currencyList;
          this.mergeCurrencyListLocalAndUS();
        }
      })
    );
  }

  mapLocalCurrencyListToUSCurrencyList() {
    const updatedLocalCurrencyList = [];
    this.currencyListLocal.forEach(currencyLocal => {
      const matchedCurrency = this.currencyListUS.find(currencyUS =>
        currencyLocal.value === currencyUS.isoCode);
      if (matchedCurrency !== undefined) {
        updatedLocalCurrencyList.push(matchedCurrency);
      }
    });
    return updatedLocalCurrencyList;
  }

  mergeCurrencyListLocalAndUS() {
    if (this.currencyListLocal && this.currencyListUS) {
      const currencyListLocalMapped = this.mapLocalCurrencyListToUSCurrencyList();
      currencyListLocalMapped.forEach(currencyLocal => {
        this.currencyListUS = this.currencyListUS.filter(currencyUS =>
          currencyLocal.isoCode !== currencyUS.isoCode);
      });
      this.mergedCurrencyList = [...currencyListLocalMapped, ...this.currencyListUS];
      this.saveMergedCurrencyListToStore();
    }
  }

  saveMergedCurrencyListToStore() {
    this.appStore.dispatch(saveMergedCurrencyListAction({
      mergedCurrencyList: this.mergedCurrencyList
    }));
  }

  saveSenderRecipientInfoToStore(senderCountryCode: string, recipientCountryCode: string) {
    this.appStore.dispatch(getSenderRecipientInfoBegin({
      senderCountryCode,
      recipientCountryCode
    }));
  }

  editFromSummary(isEditFromSummary: boolean): void {
    if (isEditFromSummary) {
      this.currentStep = StepTypes.STEP5;
    } else {
      this.currentStep = StepTypes.STEP2;
    }
    this.isEditFromSummary = isEditFromSummary;
  }
}
