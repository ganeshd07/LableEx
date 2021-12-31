import { Component, OnDestroy, OnInit, DoCheck } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { AppState } from 'src/app/+store/app.state';
import { RatesService } from 'src/app/core/providers/apim';
import { IRateQuote } from 'src/app/interfaces/shipping-app/rate-quote';
import { IShipmentDetails } from 'src/app/interfaces/shipping-app/shipment-details';
import { IRatesForm } from 'src/app/interfaces/shipping-form/rates-form';
import { RatesDataMapper } from 'src/app/providers/mapper/apim/rates-data-mapper.service';
import { StepTypes } from 'src/app/types/enum/step-type.enum';
import { updateSelectedRate, updateShipmentDetailsAction } from '../+store/shipping.actions';
import * as fromShippingSelector from '../+store/shipping.selectors';
import { ShippingInfo } from '../+store/shipping.state';
import { DimensionalWeightCalculationUnitValue } from 'src/app/types/enum/dimensional-weight-calculation-unit-value.enum';
import { UnitOfMeasurement } from 'src/app/types/enum/unit-of-measurement.enum';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from 'src/app/core/providers/notification-service';
import { SessionItems } from 'src/app/types/enum/session-items.enum';
import { LangLocale } from 'src/app/types/enum/lang-locale.enum';
import * as defaultCurrencyList from 'src/assets/data/default-currency-list.json';
import { CountryLocale } from 'src/app/types/constants/country-locale.constants';
import { MaximumMetricWeight } from 'src/app/types/enum/maximum-metric-weight-enum';
import { MaximumImperialWeight } from 'src/app/types/enum/maximum-imperial-weight';

@Component({
  selector: 'app-rate-and-delivery-option',
  templateUrl: './rate-and-delivery-option.page.html',
  styleUrls: ['./rate-and-delivery-option.page.scss'],
})
export class RateAndDeliveryOptionPage implements OnInit, OnDestroy, DoCheck {
  currentStep: string = StepTypes.STEP1;
  backNavigation = '/shipping/shipment-details';
  nextNavigation = '/shipping/customs-details';
  selectedLanguage: string;
  localLanguageConstants = LangLocale;

  shippingInfoState: ShippingInfo;
  rateDetailsState: IRateQuote;
  ratesList: IRatesForm[];

  noAvailableOptions = false;
  hasSelected = false;
  subscription: Subscription;
  actualTotalWeight;
  chargableDimensionalWeight;
  packageWeightUnit: string;
  rateApiError: boolean = false;
  currencyList: any;
  isDimensionalWeightExceedLimit = false;
  errorDefaultRate = {
    currency: '',
    date: '',
    dayCxsFormat: '',
    dayOfWeek: '',
    discounts: [],
    saturdayDelivery: false,
    serviceHint: '',
    serviceName: 'International Priority®',
    serviceType: 'INTERNATIONAL_PRIORITY',
    surcharges: [],
    tempDateDetails: null,
    time: '',
    toggleBreakdown: false,
    totalBaseCharge: 0,
    totalDiscount: 0,
    totalNetCharge: 0,
    totalNetChargeAfterDiscount: 0,
    totalNetChargeBeforeDiscount: 0,
    vat: undefined
  }

  constructor(
    private ratesService: RatesService,
    private ratesReqDataMapper: RatesDataMapper,
    private appStore: Store<AppState>,
    private router: Router,
    public notif: NotificationService,
    private translate: TranslateService
  ) {
    this.subscription = new Subscription();
    this.selectedLanguage = sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE);
  }

  ngOnInit() {
    this.currencyList = CountryLocale.getResourceBySupportedCountry(sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY)).currencies;
    this.currencyList = this.currencyList.default.output.currencies;
    const currentCurrency = this.currencyList.find(countryCurrency => countryCurrency.countryCode === sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY));
    const defaultCurrency = currentCurrency ? currentCurrency.code : this.currencyList[0].code;
    this.errorDefaultRate.currency = defaultCurrency;

    const subShipInfo = this.appStore.pipe(select(fromShippingSelector.selectShippingInfo))
      .subscribe((selectedShippingInfo: ShippingInfo) => {
        if (selectedShippingInfo) {
          this.shippingInfoState = selectedShippingInfo;
          if (this.shippingInfoState.shipmentDetails) {
            this.calculateChargableDimensionalWeight();
            this.getRateQuote(selectedShippingInfo);
          }
        }
      });
    this.subscription.add(subShipInfo);

    setTimeout(() => {
      this.addAccordionToggleFunction();
    }, 1000);
  }

  ngDoCheck() {
    if (this.selectedLanguage !== sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE)) {
      this.selectedLanguage = sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE);
      this.ngOnInit();
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  /**
   * Changes the arrows when the rate breakdown accordion is toggled.
   * @param index The index of the rate to toggle.
   */
  changeArrow(index: number): void {
    this.ratesList[index].toggleBreakdown = !this.ratesList[index].toggleBreakdown;
    for (let i = 0; i < this.ratesList.length; i++) {
      if (index !== i) {
        this.ratesList[i].toggleBreakdown = false;
      }
    }
  }

  /**
   * Saves the selected rate in the state and navigates the user to customs details page.
   * @param selectedRate The selected rate to be stored on the state.
   */
  selectedRate(SelectedIndex: number): void {
    this.hasSelected = true;
    const rateDetails = this.ratesList[SelectedIndex];
    this.updateShipmentSelectedServiceType(rateDetails);
    this.updateRateDetails(rateDetails);
    this.router.navigateByUrl(this.nextNavigation);
  }

  /**
   * Maps the selected rate to rate details and
   * calls the dispatch to store in the storage
   * @param rateDetails The selected rate to map
   */
  updateShipmentSelectedServiceType(rateDetails: IRatesForm): void {
    this.appStore.dispatch(updateShipmentDetailsAction({
      shipmentDetails: this.ratesReqDataMapper.mapRateDetailsToShipmentDetails(rateDetails, this.shippingInfoState, null)
    }));
  }

  /**
   * Maps the selected rate to rate details and
   * calls the dispatch to store in the storage
   * @param rateDetails The selected rate to map
   */
  updateRateDetails(rateDetails: IRatesForm): void {
    this.appStore.dispatch(updateSelectedRate({
      rateDetails: this.ratesReqDataMapper.mapSelectedRateToRateDetails(rateDetails)
    }));
  }

  /**
   * Gets the currrent rate details data in the storage
   */
  getRateDetails(): void {
    const subCurrentRateDetails = this.appStore.pipe(select(fromShippingSelector.selectShipmentDetails))
      .subscribe((currentShipmentDetailsState: IShipmentDetails) => {
        if (currentShipmentDetailsState) {
          this.rateDetailsState = currentShipmentDetailsState.selectedRate;
        }
      });
    this.subscription.add(subCurrentRateDetails);
  }

  /**
   * Gets the rate quote via APIM Rate Quote V2 service.
   * 
   */
  getRateQuote(selectedShippingInfo: ShippingInfo): void {
    this.ratesList = [];
    if (!this.hasSelected) {
      const ratesParams = this.ratesReqDataMapper.mapRateRequestFromStore(selectedShippingInfo);
      const ratesDiscount = (selectedShippingInfo.lookupData.ratesDiscountSuccess !== undefined) ?
        selectedShippingInfo.lookupData.ratesDiscountSuccess.configlist : [];
      this.ratesService.getRateQuoteV2(ratesParams).subscribe(
        (response) => {
          this.ratesList = this.ratesReqDataMapper.mapRateQuoteResponseToGUI(response.output.rateReplyDetails, ratesDiscount);
        }, (error) => {
          this.rateApiError = true;
          this.ratesList[0] = this.errorDefaultRate;
        });
    }
  }

  /**
   * Adds accordion toggle functionality to the rates breakdown.
   * @author Solman Raj
   */
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

  /**
   * Dimensional Weight Computation
   */
  calculateChargableDimensionalWeight() {
    this.actualTotalWeight = this.shippingInfoState.shipmentDetails.totalWeight;
    this.packageWeightUnit = (this.shippingInfoState.shipmentDetails.packageDetails[0].packageWeightUnit).toLocaleLowerCase();
    this.chargableDimensionalWeight = this.getDimensionalWeight();
    if ((this.packageWeightUnit === 'kg' && this.chargableDimensionalWeight > MaximumMetricWeight.YOUR_PACKAGING)
      || (this.packageWeightUnit === 'lb' && this.chargableDimensionalWeight > MaximumImperialWeight.YOUR_PACKAGING)) {
      this.isDimensionalWeightExceedLimit = true;
    } else {
      this.isDimensionalWeightExceedLimit = false;
    }
  }

  getDimensionalWeight() {
    const packageDetails = this.shippingInfoState.shipmentDetails.packageDetails;
    let totalDimensionalWeight = 0;
    let shouldSkip = false;
    const weightDividerValue = this.getWeightDividerValue();
    packageDetails.forEach(pkg => {
      if (!shouldSkip && pkg.packageDimensionHeight && pkg.packageDimensionLength && pkg.packageDimensionWidth) {
        const dimensionalWeight = ((pkg.packageDimensionHeight * pkg.packageDimensionLength * pkg.packageDimensionWidth)) * pkg.packageQuantity / weightDividerValue;
        totalDimensionalWeight = totalDimensionalWeight + dimensionalWeight;
      } else {
        totalDimensionalWeight = 0;
        shouldSkip = true;
        return;
      }
    })
    return Math.floor(totalDimensionalWeight);
  }

  getWeightDividerValue() {
    let weightDividerValue = 1;
    switch (this.packageWeightUnit.toUpperCase()) {
      case UnitOfMeasurement.KG:
        weightDividerValue = DimensionalWeightCalculationUnitValue.KG;
        break;

      case UnitOfMeasurement.LB:
        weightDividerValue = DimensionalWeightCalculationUnitValue.LB;
        break;

    }
    return weightDividerValue;
  }

  showDimensionalWeightBubbleHint() {
    const hintMessage = this.getMessageString();
    this.notif.showBubbleHintMessage(hintMessage);
  }

  getMessageString(): string {
    let message: string = this.translate.instant('rateAndDeliveryOptionsPage.dimensionalWeightHint');
    if (this.packageWeightUnit.toUpperCase() === UnitOfMeasurement.LB) {
      const kgStr = DimensionalWeightCalculationUnitValue.KG.toString();
      const lbStr = DimensionalWeightCalculationUnitValue.LB.toString();
      const index = message.indexOf(kgStr);
      message = message.substring(0, index) + lbStr + message.substring(index + kgStr.length);
    }
    return message;
  }
}
