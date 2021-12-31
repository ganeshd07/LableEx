import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { AppState } from 'src/app/+store/app.state';
import { StepTypes } from '../../../../app/types/enum/step-type.enum';
import * as fromShippingSelector from '../+store/shipping.selectors';
import { ShipmentDestinationComponent } from './components/shipment-destination/shipment-destination.component';
import { ShipmentOriginComponent } from './components/shipment-origin/shipment-origin.component';
import { IRecipient } from 'src/app/interfaces/shipping-app/recipient';
import { saveRecipientDetailsAction, saveSenderAddressAction, updateShipmentDetailsAction } from '../+store/shipping.actions';
import { ISender } from 'src/app/interfaces/shipping-app/sender';
import { PackagingTypeOptionsComponent } from './components/packaging-type-options/packaging-type-options.component';
import { FormBuilder } from '@angular/forms';
import { IShipmentDetails } from 'src/app/interfaces/shipping-app/shipment-details';
import { IPackageDetails } from 'src/app/interfaces/shipping-app/package-details';
import { ElementRef } from '@angular/core';
import { APIMShipmentDataMapper } from 'src/app/providers/mapper/apim/shipment-data-mapper.service';
import { Sender } from 'src/app/interfaces/api-service/request/sender';
import { Recipient } from 'src/app/interfaces/api-service/request/recipient';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { SessionItems } from 'src/app/types/enum/session-items.enum';

@Component({
  selector: 'app-step1-shipment-details',
  templateUrl: './step1-shipment-details.page.html',
  styleUrls: ['./step1-shipment-details.page.scss'],
})
export class Step1ShipmentDetailsPage implements OnInit, OnDestroy {
  @ViewChild(ShipmentOriginComponent, { static: false }) shipmentOriginRef: ShipmentOriginComponent;
  @ViewChild(ShipmentDestinationComponent, { static: false }) shipmentDestinationRef: ShipmentDestinationComponent;
  @ViewChild(PackagingTypeOptionsComponent, { static: false }) packagingTypeOptionsRef: PackagingTypeOptionsComponent;

  isFromNewShipMent: boolean;
  isShipmentOriginValid = false;
  isShipmentDestinationValid = false;

  rateAndDeliveryPageRoute = '/shipping/show-rates';

  currentStep: string = StepTypes.STEP1;
  subs = new Subscription();
  recipientDetails: IRecipient;
  senderDetails: ISender;

  sender: Sender;
  recipient: Recipient;

  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    public formBuilder: FormBuilder,
    private appStore: Store<AppState>,
    private router: Router,
    private el: ElementRef,
    public aPIMShipmentDataMapper: APIMShipmentDataMapper
  ) {
  }

  ngOnDestroy(): void {
    this.destroy$.unsubscribe();
    this.subs.unsubscribe();
  }

  ngOnInit() {
    if (this.subs){
      this.subs.unsubscribe();
      this.subs = new Subscription();
    }

    if (this.destroy$){
      this.destroy$.unsubscribe();
      this.destroy$ = new Subject<boolean>();
    }
    this.initComponentMethods();
  }

  initComponentMethods() {
    this.subs.add(
      this.appStore.pipe(select(fromShippingSelector.selectSelectedRecipient))
        .subscribe((recipientDetail: IRecipient) => {
          if (recipientDetail) {
            this.recipientDetails = recipientDetail;
          }
        })
    );

    this.subs.add(
      this.router.events.subscribe((event: any) => {
        if (event instanceof NavigationEnd) {
          const isNewShipment = sessionStorage.getItem(SessionItems.NEWSHIPMENT);
          if (isNewShipment) {
            this.resetChildren();
            this.clearShippingData();
          }
        }
      })
    );

    setTimeout(() => {
      this.initShipmentOriginFormSubs();
      this.initShipmentDestinationFormSubs();
    }, 50);

  }

  initShipmentOriginFormSubs() {
    this.shipmentOriginRef.shipmentOriginForm.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(500),
      distinctUntilChanged()).subscribe(response => {
        if (response && this.shipmentOriginRef.shipmentOriginForm.valid && this.shipmentOriginRef.isCityReady) {
          const city = (response.city) ? response.city : '';
          const stateOrProvinceCode = (response.stateOrProvinceCode) ? response.stateOrProvinceCode : '';
          const postalCode = (response.postalCode) ? response.postalCode : '';
          const countryCode = (response.countryCode) ? response.countryCode : sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);
          this.sender = this.aPIMShipmentDataMapper.populateSender(city, stateOrProvinceCode, postalCode, countryCode);
          this.isShipmentOriginValid = true;
          this.callPackageAndServiceOptionsAPI();
        } else {
          this.isShipmentOriginValid = false;
        }
      });
  }

  initShipmentDestinationFormSubs() {
    this.shipmentDestinationRef.shipmentDestinationForm.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(500),
      distinctUntilChanged()).subscribe(response => {
        if (response && this.shipmentDestinationRef.shipmentDestinationForm.valid
          && this.shipmentDestinationRef.isCountryReady && this.shipmentDestinationRef.isCityReady) {
          const city = (response.city) ? response.city : '';
          const stateOrProvinceCode = (response.stateOrProvinceCode) ? response.stateOrProvinceCode : '';
          const postalCode = (response.postalCode) ? response.postalCode : '';
          const countryCode = (response.countryCode) ? response.countryCode : '';
          this.recipient = this.aPIMShipmentDataMapper.populateRecipient(city, stateOrProvinceCode, postalCode, countryCode);
          this.isShipmentDestinationValid = true;
          this.callPackageAndServiceOptionsAPI();
        } else {
          this.isShipmentDestinationValid = false;
        }
      });
  }

  callPackageAndServiceOptionsAPI() {
    if (this.isShipmentOriginValid && this.isShipmentDestinationValid) {
      this.packagingTypeOptionsRef.getPackageAndServiceOptions(this.sender, this.recipient);
    }
  }

  routeToRateAndDeliveryPage(): void {
    const isShipmentOriginFormValid = this.isShipmentOriginValid;
    const isShipmentDestinationValid = this.isShipmentDestinationValid;
    const isPackagingTypeOptionsFormValid = this.packagingTypeOptionsRef.packagingTypeOptionsForm.valid;

    // Check for packaging type options errors in dimensions
    let dimensionsHasErrors = false;
    for (const packageIndex of this.packagingTypeOptionsRef.packageError){
      if (packageIndex.inchesCheck || packageIndex.kgsCheck) {
        dimensionsHasErrors = true;
        break;
      }
    }

    if (isShipmentOriginFormValid && isShipmentDestinationValid &&
      isPackagingTypeOptionsFormValid && !this.shipmentDestinationRef.showInvalidCountryError && !dimensionsHasErrors) {
      this.updateSenderDetails();
      this.checkRecipientDetails(this.recipientDetails);
      this.updateRecipientDetails();
      this.updateShipmentDetails();

      this.router.navigateByUrl(this.rateAndDeliveryPageRoute);
    } else {
      this.scrollToFirstInvalidControl();
    }
  }

  updateSenderDetails() {
    const senderSelected = this.shipmentOriginRef.shipmentOriginForm.getRawValue();
    this.subs.add(this.appStore.pipe(select(fromShippingSelector.selectSenderDetails))
      .subscribe((senderDetailsState: ISender) => {
        if (senderDetailsState) {
          this.senderDetails = senderDetailsState;
        }
      }));
    const senderDetails: ISender = {
      countryCode: senderSelected.countryCode,
      countryName: senderSelected.countryName,
      postalCode: senderSelected.postalCode,
      city: senderSelected.city,
      postalAware: senderSelected.postalCode ? true : false,
      emailAddress: this.senderDetails ? this.senderDetails.emailAddress : undefined,
      address1: this.senderDetails ? this.senderDetails.address1 : undefined,
      contactName: this.senderDetails ? this.senderDetails.contactName : undefined,
      stateAware: false,
      phoneNumber: this.senderDetails ? this.senderDetails.phoneNumber : undefined,
      stateOrProvinceCode: this.senderDetails ? this.senderDetails.stateOrProvinceCode : undefined,
      companyName: this.senderDetails ? this.senderDetails.companyName : undefined,
      taxId: this.senderDetails ? this.senderDetails.taxId : undefined,
      partyId: this.senderDetails ? this.senderDetails.partyId : undefined
    };
    senderDetails.address2 = this.senderDetails ? this.senderDetails.address2 : undefined;
    this.appStore.dispatch(saveSenderAddressAction({ senderDetails }));
  }

  checkRecipientDetails(previousRecipientData) {
    if (previousRecipientData){
      const recipientFormData = this.shipmentDestinationRef.shipmentDestinationForm.value;
      if (recipientFormData.countryCode !== previousRecipientData.countryCode || recipientFormData.city !== previousRecipientData.city) {
        this.recipientDetails = null;
        this.appStore.dispatch(saveRecipientDetailsAction({ recipientDetailsList: null }));
      }
    }
  }

  updateRecipientDetails() {
    const recipientSelected = this.shipmentDestinationRef.shipmentDestinationForm.value;
    const postalAware = this.shipmentDestinationRef.postalAware;
    this.appStore.dispatch(saveRecipientDetailsAction({
      recipientDetailsList: [
        {
          ...this.recipientDetails,
          countryCode: recipientSelected.countryCode,
          countryName: recipientSelected.countryName,
          postalCode: recipientSelected.postalCode,
          city: recipientSelected.city,
          stateOrProvinceCode: recipientSelected.stateOrProvinceCode,
          postalAware
        }
      ]
    }));
  }

  updateShipmentDetails(): void {
    const packagingDetailsValue = this.packagingTypeOptionsRef.packagingTypeOptionsForm.value;
    const shipmentDetails: IShipmentDetails = {
      packageDetails: this.updatePackagingDetails(packagingDetailsValue.packages),
      totalNumberOfPackages: packagingDetailsValue.totalNumberOfPackage,
      totalWeight: packagingDetailsValue.totalWeight,
      serviceType: '',
      serviceName: '',
      packagingType: packagingDetailsValue.packageType,
      serviceCode: '',
      advancedPackageCode: '',
      totalCustomsOrInvoiceValue: null,
      customsOrInvoiceValueCurrency: '',
      carriageDeclaredValue: null,
      carriageDeclaredValueCurrency: '',
      displayDate: '',
      shipDate: null,
      selectedRate: null,
      firstAvailableShipDate: null,
      lastAvailableShipDate: null,
      availableShipDates: null,
      selectedPackageOption: null,
      specialServiceInfo: null
    };
    this.appStore.dispatch(updateShipmentDetailsAction({ shipmentDetails }));
  }

  updatePackagingDetails(packages: any): IPackageDetails[] {
    const packageList: any[] = [];
    const weightUnitOfMeasurement = packages[0].weightPerPackageUnit;
    const packageDimensionUnit = packages[0].dimensionUnit;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < packages.length; i++) {
      const packageObject: IPackageDetails = {
        packageCode: '',
        packageQuantity: packages[i].numberOfPackage,
        packageWeight: packages[i].weightPerPackage,
        packageWeightUnit: weightUnitOfMeasurement,
        packageDimensionLength: packages[i].dimensionLength,
        packageDimensionWidth: packages[i].dimensionWidth,
        packageDimensionHeight: packages[i].dimensionHeight,
        packageDimensionUnit,
        yourPackageDescription: ''
      };
      packageList.push(packageObject);
    }
    return packageList;
  }

  scrollToFirstInvalidControl() {
    const firstInvalidControl: HTMLElement = this.el.nativeElement.querySelector(
      'form .ion-invalid'
    );
    this.shipmentOriginRef.markAllFieldAsTouch();
    this.shipmentDestinationRef.markAllFieldAsTouch();
    this.packagingTypeOptionsRef.markAllFieldAsTouch();
    if (firstInvalidControl !== null) {
      firstInvalidControl.scrollIntoView();
    }
  }

  clearShippingData() {
    this.isFromNewShipMent = true;
    setTimeout(() => {
      this.isFromNewShipMent = false;
      this.recipientDetails = null;
      this.senderDetails = null;
      // This is the fix for packageandserviceoptions call for newShipment.
      sessionStorage.removeItem(SessionItems.NEWSHIPMENT);
      this.ngOnInit();
    }, 0);
  }

  resetChildren() {
    if (this.shipmentOriginRef.shipmentOriginForm.valid) {
      this.shipmentOriginRef.shipmentOriginForm.reset();
      this.shipmentOriginRef.shipmentOriginForm.updateValueAndValidity();
    }

    if (this.shipmentDestinationRef.shipmentDestinationForm.valid) {
      this.shipmentDestinationRef.shipmentDestinationForm.reset();
      this.shipmentDestinationRef.shipmentDestinationForm.updateValueAndValidity();
    }

    if (this.packagingTypeOptionsRef.packagingTypeOptionsForm.valid) {
      this.packagingTypeOptionsRef.packagingTypeOptionsForm.reset();
      this.packagingTypeOptionsRef.packagingTypeOptionsForm.updateValueAndValidity();
    }
  }

}
