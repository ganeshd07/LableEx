import { Component, DoCheck, OnDestroy, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { AppState } from 'src/app/+store/app.state';
import { RatesDataMapper } from 'src/app/providers/mapper/apim/rates-data-mapper.service';
import * as fromShippingSelector from '../+store/shipping.selectors';
import { ShippingInfo } from '../+store/shipping.state';
import { SummaryPageConstants } from '../../../../app/types/constants/summary-page.constants';

import { RatesService } from 'src/app/core/providers/apim';
import { LocalRatesService } from 'src/app/core/providers/local/rates.service';
import { postCreateShipmentBegin, updateSelectedRate } from '../+store/shipping.actions';
import { CreateShipmentResponse } from 'src/app/interfaces/api-service/response/create-shipment-response';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { IRatesForm } from 'src/app/interfaces/shipping-form/rates-form';
import { BillingOptionsUtil } from 'src/app/types/constants/billing-and-service-options.constants';
import { countryResource } from 'src/app/types/constants/country-resource.constants';
import { SessionItems } from 'src/app/types/enum/session-items.enum';
import { LangLocale } from 'src/app/types/enum/lang-locale.enum';


@Component({
  selector: 'app-summary-details',
  templateUrl: './summary-details.page.html',
  styleUrls: ['./summary-details.page.scss'],
})
export class SummaryDetailsPage implements OnInit, OnDestroy, DoCheck {
  customsType: string;
  fromSeparate: string;
  toSeparate: string;
  senderAddSeparate: string;
  recipientAdd2Separate: string;
  recipientAdd3Separate: string;
  packageName: string;
  currencySign = '$';
  customsTypeDisplay: boolean;
  recipientCompanyName: boolean;
  shipperCompanyName: boolean;
  billingRate: boolean;
  hasRateServiceLoaded = false;
  downArrow = false;
  rateServiceLoading = false;
  ratesList: IRatesForm[];
  selectedRate: IRatesForm;
  noAvailableOptions = false;
  hasSelected = false;
  ratesTimeUpdated = false;
  isLoggedInUser: string;
  isRouteToTYPage = false;
  selectedLanguage: string;
  selectedCountry: string;
  localLanguageConstants = LangLocale;
  subs = new Subscription();
  summaryDetails: ShippingInfo;
  isDateUnavailableLabel: boolean;
  totalCustomsValue = 0;
  totalCustomsWeight = 0;
  shippingBillToDisplayable = '';
  dutiesTaxesBillToDisplayable = '';

  payAtDropOff: string = BillingOptionsUtil.getPaymentType(BillingOptionsUtil.PAY_AT_DROP_OFF).value;
  termsofUseUrlsData = countryResource.getTermsOfUseUrls();
  termsofUseLinkUrl: string;
  termsAndConditionsLinkUrl: string;
  termsAndConditions: string;
  privacyStatementUrl: string;
  globalPrivacyPolicyUrl: string = countryResource.GLOBALPRIVACYPOLICYURL;

  constructor(private appStore: Store<AppState>,
    private alertController: AlertController,
    private translate: TranslateService,
    private router: Router,
    private ratesReqDataMapper: RatesDataMapper,
    private ratesService: RatesService,
    private localRatesService: LocalRatesService
  ) { }

  backNavPath = '/shipping/customs-details'; // TODO: change to navstepper component route


  ngOnInit() {
    this.selectedCountry = sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);
    this.selectedLanguage = sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE);
    this.refreshRateQuote();
    this.getSummaryDetailsFromStore();
    setTimeout(() => {
      this.addAccordionToggleFunction();
    }, 1000);
    this.isLoggedInUser = sessionStorage.getItem(SessionItems.ISLOGGEDIN);
    this.handleCreateShipmentApiSuccess();
    this.updateTermsURLS();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngDoCheck() {
    if (this.selectedLanguage !== sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE)) {
      this.selectedLanguage = sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE);
      this.ratesTimeUpdated = false;
      this.refreshRateQuote();
      this.updateTermsURLS();
    }
  }

  updateTermsURLS() {
    this.termsofUseLinkUrl = this.termsofUseUrlsData.find(country =>
      country.countryCode === this.selectedCountry && country.languageCode === this.selectedLanguage)?.termsOfUseUrl;
    this.privacyStatementUrl = this.termsofUseUrlsData.find(country =>
      country.countryCode === this.selectedCountry && country.languageCode === this.selectedLanguage)?.privacyUrl;
    setTimeout(() => {
      this.termsAndConditions = this.translate.instant('loginPage.termsOfUseNote').replace('{{termsOfUseLink}}',
        this.termsofUseLinkUrl).replace('{{privacyStatement}}',
          this.privacyStatementUrl).replace('{{globalPrivacyStatement}}', this.globalPrivacyPolicyUrl);
    }, 0);
  }

  refreshRateQuote() {
    this.hasRateServiceLoaded = false;
    const subShipInfo = this.appStore.pipe(select(fromShippingSelector.selectShippingInfo))
      .subscribe((selectedShippingInfo: ShippingInfo) => {
        if (selectedShippingInfo) {
          this.getRateQuote(selectedShippingInfo);
        }
      });
    this.subs.add(subShipInfo);
  }

  getSummaryDetailsFromStore() {
    const subSelecteSummaryDetails = this.appStore.pipe(select(fromShippingSelector.selectSummaryDetails))
      .subscribe((summaryDetails: ShippingInfo) => {
        if (summaryDetails && !this.isRouteToTYPage) {
          this.summaryDetails = summaryDetails;
          if (this.summaryDetails.shipmentDetails.packagingType) {
            this.packageName = this.checkPackagingName(this.summaryDetails.shipmentDetails.packagingType);
          }
          if (this.summaryDetails.customsDetails) {
            this.customsType = this.summaryDetails.customsDetails.customsType === SummaryPageConstants.DOC ? SummaryPageConstants.Documents : SummaryPageConstants.ITEMS;
            this.customsTypeDisplay = this.customsType === SummaryPageConstants.ITEMS ? false : true;
            this.assignTotalCustomsValueAndWeight();
          }
          if (this.summaryDetails.recipientDetails[0]) {
            this.recipientCompanyName = this.summaryDetails.recipientDetails[0].companyName ? true : false;
            this.toSeparate = summaryDetails.recipientDetails[0].city && summaryDetails?.recipientDetails[0].postalCode ? ',' : '';
            this.recipientAdd2Separate = summaryDetails.recipientDetails[0].address2 ? ',' : '';
            this.recipientAdd3Separate = summaryDetails.recipientDetails[0].address3 ? ',' : '';
          }
          if (this.summaryDetails.senderDetails) {
            this.shipperCompanyName = this.summaryDetails.senderDetails.companyName ? true : false;
            this.fromSeparate = summaryDetails.senderDetails.city && summaryDetails?.senderDetails?.postalCode ? ',' : '';
            this.senderAddSeparate = summaryDetails.senderDetails.address2 ? ',' : '';
          }
          if (this.summaryDetails.paymentDetails) {
            if (this.summaryDetails.paymentDetails.shippingBillToDisplayable === SummaryPageConstants.PAY_AT_DROP_OFF) {
              this.billingRate = true;
            }
          }
          this.isDateUnavailableLabel = summaryDetails.shipmentDetails.selectedRate.dateOfArrival ? false : true;

          if ((this.summaryDetails.paymentDetails.shippingBillToDisplayable)){
            this.shippingBillToDisplayable = this.translate.instant('billingAndServicesOptionPage.' +
            (BillingOptionsUtil.getPaymentType(this.summaryDetails.paymentDetails.shippingBillToDisplayable).translationKey));
          }

          if ((this.summaryDetails.paymentDetails.dutiesTaxesBillToDisplayable)){
            this.dutiesTaxesBillToDisplayable = this.translate.instant('billingAndServicesOptionPage.' +
            (BillingOptionsUtil.getPaymentType(this.summaryDetails.paymentDetails.dutiesTaxesBillToDisplayable).translationKey));
          }
        }
      });
    this.subs.add(subSelecteSummaryDetails);
  }

  assignTotalCustomsValueAndWeight() {
    this.totalCustomsValue = 0;
    this.totalCustomsWeight = 0;
    this.summaryDetails.customsDetails.commodityList.forEach(commodity => {
      this.totalCustomsValue = this.totalCustomsValue + commodity.totalCustomsValue;
      this.totalCustomsWeight = this.totalCustomsWeight + commodity.totalWeight;
    });
  }

  onClickCreateShipment(): void {
    this.validateSummarySession();
    const navigateToOtp = this.validationForPayments();
    if (navigateToOtp) {
      sessionStorage.setItem(SessionItems.ISFROMSUMMARY, 'true');
      this.subs.unsubscribe();
      this.router.navigateByUrl('/account/otp');
    } else {
      this.isRouteToTYPage = true;
      this.appStore.dispatch(postCreateShipmentBegin({
        shipmentDetails: this.summaryDetails
      }));
    }
  }

  validateSummarySession() {
    const isFromOtpToSummary = sessionStorage.getItem(SessionItems.ISFROMSUMMARY);
    if (isFromOtpToSummary) {
      sessionStorage.removeItem(SessionItems.ISFROMSUMMARY);
      sessionStorage.removeItem(SessionItems.MOBILENUMBER);
    }
  }

  validationForPayments(): boolean {
    const mobileNumber = sessionStorage.getItem(SessionItems.MOBILENUMBER);
    if (!mobileNumber) {
      const selectedDutiesTaxesBillTo = BillingOptionsUtil.getPaymentType(BillingOptionsUtil.BILL_RECIPIENT).key;
      const selectedTransportationTo = BillingOptionsUtil.getPaymentType(BillingOptionsUtil.PAY_AT_DROP_OFF).key;
      if (this.summaryDetails.paymentDetails.dutiesTaxesBillToDisplayable !== selectedDutiesTaxesBillTo ||
        this.summaryDetails.paymentDetails.shippingBillToDisplayable !== selectedTransportationTo) {
        return true;
      } else if (this.summaryDetails.paymentDetails.dutiesTaxesBillToDisplayable === selectedDutiesTaxesBillTo &&
        this.summaryDetails.paymentDetails.dutiesTaxesAccountNumber) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public changeArrow(downArrowParam) {
    this.downArrow = false;
    if (!downArrowParam) {
      this.downArrow = true;
    }
  }

  checkPackagingName(PackagingType: string): string {
    switch (PackagingType) {
      case 'YOUR_PACKAGING':
        return SummaryPageConstants.YOUR_PACKAGING;
      case 'FEDEX_10KG_BOX':
        return SummaryPageConstants.FEDEX_10KG_BOX;
      case 'FEDEX_25KG_BOX':
        return SummaryPageConstants.FEDEX_25KG_BOX;
      case 'FEDEX_BOX':
        return SummaryPageConstants.FEDEX_BOX;
      case 'FEDEX_ENVELOPE':
        return SummaryPageConstants.FEDEX_ENVELOPE;
      case 'FEDEX_PAK':
        return SummaryPageConstants.FEDEX_PAK;
      case 'FEDEX_TUBE':
        return SummaryPageConstants.FEDEX_TUBE;
    }
  }

  getRateQuote(selectedShippingInfo: ShippingInfo): void {
    this.rateServiceLoading = true;
    if (!this.hasSelected && !this.isRouteToTYPage && !this.hasRateServiceLoaded) {
      const ratesParams = this.ratesReqDataMapper.mapRateRequestFromStore(selectedShippingInfo);
      const ratesDiscount = (selectedShippingInfo.lookupData.ratesDiscountSuccess !== undefined) ?
        selectedShippingInfo.lookupData.ratesDiscountSuccess.configlist : [];
      this.ratesList = [];
      this.subs.add(this.ratesService.getRateQuoteV2(ratesParams).subscribe(
        (response) => {
          this.hasRateServiceLoaded = true;
          if (response) {
            this.rateServiceLoading = false;
            this.ratesList = this.ratesReqDataMapper.mapRateQuoteResponseToGUI(response.output.rateReplyDetails, ratesDiscount);
            if (this.ratesList.length > 0) {
              this.selectedRate = this.ratesList[0];
              this.ratesTimeUpdated = true;
              this.updateRateDetails(this.selectedRate);
            }
          }
        }));
    }
  }

  updateRateDetails(rateDetails: IRatesForm): void {
    this.appStore.dispatch(updateSelectedRate({
      rateDetails: this.ratesReqDataMapper.mapSelectedRateToRateDetails(rateDetails)
    }));
  }

  private addAccordionToggleFunction(): void {
    const accItem = document.getElementsByClassName('accordionItem');
    const accHD = document.getElementsByClassName('accordionItemHeading');
    let index = 0;

    for (index = 0; index < accHD.length; index++) {
      accHD[index].addEventListener('click', toggleItem);
    }

    function toggleItem() {
      const itemClass = this.parentNode.className;
      for (index = 0; index < accItem.length; index++) {
        accItem[index].className = 'accordionItem close';
      }

      if (itemClass === 'accordionItem close') {
        this.parentNode.className = 'accordionItem open';
      }
    }
  }

  changeArrowPosition(index: number): void {
    this.ratesList[index].toggleBreakdown = !this.ratesList[index].toggleBreakdown;
    for (let i = 0; i < this.ratesList.length; i++) {
      if (index !== i) {
        this.ratesList[i].toggleBreakdown = false;
      }
    }
  }

  handleCreateShipmentApiSuccess() {
    this.subs.add(
      this.appStore.pipe(select(fromShippingSelector.selectCreateShipmentSuccess)).subscribe((shipmentSuccess: CreateShipmentResponse) => {
        if (shipmentSuccess) {
          this.navigateToNextPage();
        }
      })
    );
  }

  navigateToNextPage() {
    const isFromOtpToSummary = sessionStorage.getItem(SessionItems.ISFROMSUMMARY);
    if (isFromOtpToSummary) {
      sessionStorage.removeItem(SessionItems.ISFROMSUMMARY);
      sessionStorage.removeItem(SessionItems.MOBILENUMBER);
    }
    this.router.navigateByUrl('/shipping/thank-you');
  }

  clickEditCustomsDetails() {
    window.dispatchEvent(new Event('editCustomsDetails'));
    this.router.navigateByUrl('/shipping/customs-details');
  }

  clickEditSenderDetails() {
    setTimeout(() => {
      window.dispatchEvent(new Event('editSenderDetails'));
    }, 0);
    this.router.navigateByUrl('/shipping/sender-details');
  }

  clickEditRecipientDetails() {
    setTimeout(() => {
      window.dispatchEvent(new Event('editRecipientDetails'));
    }, 0);
    this.router.navigateByUrl('/shipping/recipient-details');
  }

  clickEditBillingServiceOptionsDetails() {
    setTimeout(() => {
      window.dispatchEvent(new Event('editBillingServiceOptionDetails'));
    }, 0);
    this.router.navigateByUrl('/shipping/billing-details');
  }

}
