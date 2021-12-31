import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonSlides } from '@ionic/angular';
import { PackagingType } from 'src/app/types/enum/packaging-type.enum';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UnitOfMeasurement } from 'src/app/types/enum/unit-of-measurement.enum';
import { TranslateService } from '@ngx-translate/core';
import * as apim from '../../../../../core/providers/apim';
import { Sender } from 'src/app/interfaces/api-service/request/sender';
import { Recipient } from 'src/app/interfaces/api-service/request/recipient';
import { PackageOptions } from 'src/app/interfaces/api-service/response/package-options';
import { MinimumMetricWeight } from 'src/app/types/enum/minimum-metric-weight-enum';
import { MinimumImperialWeight } from 'src/app/types/enum/minimum-imperial-weight';
import { MaximumMetricWeight } from 'src/app/types/enum/maximum-metric-weight-enum';
import { MaximumImperialWeight } from 'src/app/types/enum/maximum-imperial-weight';
import { InputTypeConstants } from 'src/app/types/constants/input-type-constants';
import { SessionItems } from 'src/app/types/enum/session-items.enum';
import { ConfigService } from '@ngx-config/core';
import { Util } from 'src/app/providers/util.service';

@Component({
  selector: 'app-packaging-type-options',
  templateUrl: './packaging-type-options.component.html',
  styleUrls: ['./packaging-type-options.component.scss']
})
export class PackagingTypeOptionsComponent implements OnInit, OnDestroy {
  @ViewChild('packagingOptionSlides', { static: false }) slides: IonSlides;

  isAddAnotherPackageHidden = false;
  isDimensionInputFieldHidden = false;
  isNumberOfPackagesDisabled = false;
  inchesCheck = false;
  kgsCheck = false;
  packagesCheck = false;
  addPackageCheck = false;
  disableNumericStepperAdd = false;
  maximumPackage = 25;
  totalNoOfPackages = 1;
  totalWeight = 0;
  packageIndex = 0;
  weightLimitValue = 0;
  weightLimitUnit = '';
  maxWeightDisplay = '';
  minWeightDisplay = '';

  selectedWeightUnit = UnitOfMeasurement.KG;
  selectedPackageType: PackagingType = PackagingType.YOUR_PACKAGING;
  packagingTypeOptionsForm: FormGroup;
  subscriptions: Subscription[] = [];
  totalPackagesCount: any = [];
  packageError: any = [];
  packageOptionDetails: PackageOptions[];
  disablePackageMinusStepper: any = [];
  slidePerView = 3;
  packagingOptionSlidesConfiguration = {
    initialSlide: 0,
    slidesPerView: this.slidePerView,
    slideToClickedSlide: true,
    grabCursor: true
  };
  showSliderPrvBtn = false;
  showSliderNxtBtn = true;
  totalSlides = 7;
  inputConstants = InputTypeConstants;

  constructor(
    private formBuilder: FormBuilder,
    private alertController: AlertController,
    private translate: TranslateService,
    private availabilityService: apim.APIMAvailabilityService,
    private readonly config: ConfigService,
    private utils: Util
  ) { }

  markAllFieldAsTouch(): void {
    if (!this.packagingTypeOptionsForm.valid && this.packagingTypeOptionsForm.dirty && this.packagingTypeOptionsForm.untouched) {
      return;
    }
    this.packagingTypeOptionsForm.markAllAsTouched();
  }

  get packagingType(): typeof PackagingType {
    return PackagingType;
  }

  /**
   * In the initialization phase, it will create the basic structure form group
   * of packaging type options. The 'Your Packaging' type option will be the default packaging type.
   */
  ngOnInit() {
    this.packagingTypeOptionsForm = this.formBuilder.group({
      totalNumberOfPackage: [''],
      totalWeight: ['', [Validators.max(MaximumMetricWeight.YOUR_PACKAGING)]],
      packageType: [''],
      dimensionLength: [''],
      dimensionWidth: [''],
      dimensionHeight: [''],
      dimensionUnit: [''],
      packages: this.formBuilder.array([this.createPackage(false)])
    });

    this.packagingTypeOptionsForm.get('packageType').setValue(this.checkPackagingType(0));
    this.updateSummaryOfPackages();
    this.packageError.push({ inchesCheck: false, kgsCheck: false });
    this.disablePackageMinusStepper.push({ disabled: true });
  }

  /**
   * This will unsubscribe any values being added in the subscription array
   * when the component is destroyed.
   */
  ngOnDestroy() {
    this.subscriptions.forEach(subscriptions => subscriptions.unsubscribe());
  }

  /**
   * Returns the 'packages' in the packaging type options form as form array.
   */
  getPackagesAsFormArray(): FormArray {
    return this.packagingTypeOptionsForm.get('packages') as FormArray;
  }

  /**
   * Returns the complete control of the packaging type options form group.
   */
  get form() {
    return this.packagingTypeOptionsForm.controls;
  }

  /**
   * Adds another package form in the packaging type options screen.
   */
  addPackage(): void {
    this.addPackageCheck = false;
    this.packagesCheck = false;

    const packageForm = this.getPackagesAsFormArray();
    if (this.totalNoOfPackages >= this.maximumPackage) {
      this.addPackageCheck = true;
    } else {
      this.addPackageCheck = false;
      packageForm.push(this.createPackage(true));
      this.packageError.push({ inchesCheck: false, kgsCheck: false });
      this.updateWeightPerPackageValidators();
      this.disablePackageMinusStepper.push({ disabled: true });
    }
  }

  /**
   * Prompts an alert modal to confirm if the selected package
   * should be removed or not.
   *
   * @param index The selected package row subject for removal.
   */
  async promptDeletePackageConfirmationModal(index: number) {
    const applyArialFont = this.config.getSettings('ARIAL_FONT_LANGUAGE_LIST').includes(sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE)) ? true : false;
    const alert = await this.alertController.create({
      header: this.translate.instant('shipmentDetailsPage.warning'),
      message: this.translate.instant('shipmentDetailsPage.warningNote'),
      cssClass: applyArialFont ? 'arial-font' : '',
      buttons: [
        {
          text: this.translate.instant('button.cancel'),
          role: 'cancel',
          cssClass: applyArialFont ? 'delete-package-alert-no arial-font' : 'delete-package-alert-no',
        },
        {
          text: this.translate.instant('button.confirm'),
          handler: () => {
            this.deletePackage(index);
          },
          cssClass: applyArialFont ? 'delete-package-alert-yes arial-font' : 'delete-package-alert-yes'

        }
      ]
    });
    await alert.present();
  }

  /**
   * Removes the selected index in the packages form array.
   *
   * @param index The index to be removed in the packages form array.
   */
  deletePackage(index: number): void {
    const packageDetailsForm = this.getPackagesAsFormArray();
    if (this.packageError[index]) {
      this.packageError.splice(index, 1);
      this.disablePackageMinusStepper.splice(index, 1);
    }
    packageDetailsForm.removeAt(index);
  }

  /**
   * Listens to any changes on the packaging type option slider, passes
   * the selected packaging type index to the packagingTypeSliderChange(), and
   * sets the packaging type to the packaging type options form group.
   *
   * @param $event Returns the index of the selected packaging type.
   */
  packagingTypeSliderChange($event: any): void {
    const selectedPackageTypeIndex = $event.target.swiper.clickedIndex;
    const packageType = this.checkPackagingType(selectedPackageTypeIndex);
    this.selectedPackageType = packageType;
    this.packagingTypeOptionsForm.get('packageType').setValue(packageType);
    this.updateWeightLimits(this.selectedPackageType, this.packageOptionDetails);
  }


  /**
   * Checks the selected packaging type and calls updateAllowablePackageValues()
   * and hideDimensionInputField() for further form changes.
   *
   * @param index The index related to the type of package selected on the slider.
   */
  checkPackagingType(index: number): PackagingType {
    switch (index) {

      case 0:
        this.updateAllowablePackageValues();
        this.updateDimensionInputFieldProperties();
        this.disableNumericStepperAdd = false;

        return PackagingType.YOUR_PACKAGING;

      case 1:
        this.removeExtraPackages();
        this.updateAllowableBigPackageValues();
        this.updateDimensionInputFieldProperties(true);
        this.disableNumericStepperAdd = true;

        return PackagingType.FEDEX_10KG_BOX;

      case 2:
        this.removeExtraPackages();
        this.updateAllowableBigPackageValues();
        this.updateDimensionInputFieldProperties(true);
        this.disableNumericStepperAdd = true;

        return PackagingType.FEDEX_25KG_BOX;

      case 3:
        this.updateAllowablePackageValues();
        this.updateDimensionInputFieldProperties(true);
        this.disableNumericStepperAdd = false;

        return PackagingType.FEDEX_BOX;

      case 4:
        this.removeExtraPackages();
        this.updateAllowableBigPackageValues();
        this.updateDimensionInputFieldProperties(true);
        this.disableNumericStepperAdd = true;

        return PackagingType.FEDEX_ENVELOPE;

      case 5:
        this.updateAllowablePackageValues();
        this.updateDimensionInputFieldProperties(true);
        this.disableNumericStepperAdd = false;

        return PackagingType.FEDEX_PAK;

      case 6:
        this.updateAllowablePackageValues();
        this.updateDimensionInputFieldProperties(true);
        this.disableNumericStepperAdd = false;

        return PackagingType.FEDEX_TUBE;
    }
  }

  /**
   * Changes the maximum package label note and the
   * 'Add another package' on the packaging type option form screen will be present on the following
   * package types:
   * - PackagingType.YOUR_PACKAGING
   * - PackagingType.FEDEX_BOX
   * - PackagingType.FEDEX_PAK
   * - PackagingType.FEDEX_TUBE
   *
   * Validators for the number of packages are updated to mininum of 1
   * and maximum of 40 package pieces to all package rows. The number of packages input box will be set
   * as enabled regardless of the previous status.
   */
  updateAllowablePackageValues(): void {
    const packages = this.getPackagesAsFormArray();

    this.isAddAnotherPackageHidden = false;
    this.isNumberOfPackagesDisabled = false;
    this.maximumPackage = 40;

    for (let i = 0; i < packages.length; i++) {
      const packageToPatch = packages.controls[i].get('numberOfPackage');
      packageToPatch.setValidators([Validators.min(1), Validators.max(40)]);
      packageToPatch.updateValueAndValidity();
      packageToPatch.markAsTouched({ onlySelf: true });
    }
  }

  /**
   * Changes the maximum package label note and the
   * 'Add another package' on the packaging type option form screen will be hidden on the following
   * package types:
   * - PackagingType.FEDEX_10KG_BOX
   * - PackagingType.FEDEX_25KG_BOX
   * - PackagingType.FEDEX_ENVELOPE
   *
   * Validators for the number of packages are updated to maximum of 1 package piece only.
   * The number of packages input box will be set as disabled regardless of the previous status.
   */
  updateAllowableBigPackageValues(): void {
    const packages = this.getPackagesAsFormArray();
    const packageToPatch = packages.controls[0].get('numberOfPackage');

    this.isAddAnotherPackageHidden = true;
    this.isNumberOfPackagesDisabled = true;
    this.maximumPackage = 1;

    packageToPatch.setValue(1);
    packageToPatch.setValidators([Validators.min(1), Validators.max(1)]);
    packageToPatch.updateValueAndValidity();
    packageToPatch.markAsTouched({ onlySelf: true });
  }

  /**
   * Changes the properties of the dimension input field. For now, it enables and disables
   * the length, width, height, and selection for the unit of measurement.
   *
   * @param isDimensionInputFieldHidden If this is set to TRUE, then the dimension input field
   * will be hidden in the packaging type options form screen. Default is FALSE.
   */
  updateDimensionInputFieldProperties(isDimensionInputFieldHidden?: boolean): void {
    const packageForm = this.getPackagesAsFormArray();
    const packageToPatch = packageForm.controls[0];

    if (isDimensionInputFieldHidden) {
      this.isDimensionInputFieldHidden = true;
      packageToPatch.get('dimensionLength').disable();
      packageToPatch.get('dimensionWidth').disable();
      packageToPatch.get('dimensionHeight').disable();
      packageToPatch.get('dimensionUnit').disable();
    } else {
      this.isDimensionInputFieldHidden = false;
      packageToPatch.get('dimensionLength').enable();
      packageToPatch.get('dimensionWidth').enable();
      packageToPatch.get('dimensionHeight').enable();
      packageToPatch.get('dimensionUnit').enable();
    }
  }

  /**
   * Decrements the value of the number of packages by 1. It will no longer decrement
   * when the value reaches 1.
   *
   * @param index The index where the decrement applies
   */
  numericStepperMinus(index: number): void {
    const packages = this.getPackagesAsFormArray();
    const packageToPatch = packages.controls[index];
    const numberOfPackage = packageToPatch.get('numberOfPackage');
    this.packagesCheck = false;
    this.addPackageCheck = false;
    if (numberOfPackage.value > 1 && !this.isNumberOfPackagesDisabled) {
      packageToPatch.get('numberOfPackage').setValue(numberOfPackage.value - 1);
      if (packageToPatch.get('numberOfPackage').value < 2) {
        this.disablePackageMinusStepper[index].disabled = true;
      }
    } else {
      this.packagesCheck = true;
      this.packageIndex = index;
    }
  }

  /**
   * Increments the value of the number of packages by 1.
   *
   * @param index The index where the increment applies
   */
  numericStepperAdd(index: number): void {
    const packages = this.getPackagesAsFormArray();
    const packageToPatch = packages.controls[index];
    const numberOfPackage = packageToPatch.get('numberOfPackage');
    this.packagesCheck = false;
    this.addPackageCheck = false;
    if (!this.isNumberOfPackagesDisabled && (this.totalNoOfPackages !== this.maximumPackage)) {
      packageToPatch.get('numberOfPackage').setValue(numberOfPackage.value + 1);
      if (packageToPatch.get('numberOfPackage').value > 1) {
        this.disablePackageMinusStepper[index].disabled = false;
      }
    } else {
      this.packagesCheck = true;
      this.packageIndex = index;
    }
  }

  /**
   * Changes the unit of measurement of weight per package unit from imperial to metric or metric to imperial and applies
   * the changes to the rest for packaging type options form array.
   */
  changeWeightPerPackageUnit() {
    const packages = this.getPackagesAsFormArray();
    this.selectedWeightUnit = packages.controls[0].get('weightPerPackageUnit').value;

    if (this.selectedWeightUnit === UnitOfMeasurement.KG) {
      for (let i = 0; i < packages.length; i++) {
        packages.controls[i].get('weightPerPackageUnit').setValue(UnitOfMeasurement.KG);
        packages.controls[i].get('dimensionUnit').setValue(UnitOfMeasurement.CM);
      }
    } else {
      for (let i = 0; i < packages.length; i++) {
        packages.controls[i].get('weightPerPackageUnit').setValue(UnitOfMeasurement.LB);
        packages.controls[i].get('dimensionUnit').setValue(UnitOfMeasurement.IN);
      }
    }
    this.selectedWeightUnit = packages.controls[0].get('weightPerPackageUnit').value;
    this.updateWeightLimits(this.selectedPackageType, this.packageOptionDetails);
  }

  /**
   * Changes the unit of measurement of dimension unit from imperial to metric or metric to imperial and applies
   * the changes to the rest for packaging type options form array.
   */
  changeDimensionUnit() {
    const packages = this.getPackagesAsFormArray();

    const dimensionUnit = packages.controls[0].get('dimensionUnit').value;

    if (dimensionUnit === UnitOfMeasurement.CM) {
      for (let i = 0; i < packages.length; i++) {
        packages.controls[i].get('weightPerPackageUnit').setValue(UnitOfMeasurement.KG);
        packages.controls[i].get('dimensionUnit').setValue(UnitOfMeasurement.CM);
      }
    } else {
      for (let i = 0; i < packages.length; i++) {
        packages.controls[i].get('weightPerPackageUnit').setValue(UnitOfMeasurement.LB);
        packages.controls[i].get('dimensionUnit').setValue(UnitOfMeasurement.IN);
      }
    }
  }

  /**
   * Checking the dimensions for length,width and height for validations purpose.
   */

  checkDimensions() {
    let unit;
    const dimensionArray = [];
    if (this.getPackagesAsFormArray().value[this.packageIndex]) {
      dimensionArray.push(this.getPackagesAsFormArray().value[this.packageIndex].dimensionLength);
      dimensionArray.push(this.getPackagesAsFormArray().value[this.packageIndex].dimensionHeight);
      dimensionArray.push(this.getPackagesAsFormArray().value[this.packageIndex].dimensionWidth);
    }

    dimensionArray.sort((a, b) => b - a);
    if (this.getPackagesAsFormArray().value[0]) {
      unit = this.getPackagesAsFormArray().value[0].dimensionUnit;
    }

    if (this.packageError[this.packageIndex] !== undefined) {
      this.packageError[this.packageIndex].inchesCheck = false;
      this.packageError[this.packageIndex].kgsCheck = false;
    }

    if ((unit === UnitOfMeasurement.IN) && (dimensionArray[0] > 119 || dimensionArray[1] > 80 || dimensionArray[2] > 70)) {
      this.packageError[this.packageIndex].inchesCheck = true;
    } else if ((unit === UnitOfMeasurement.CM) && (dimensionArray[0] > 302 || dimensionArray[1] > 203 || dimensionArray[2] > 178)) {
      this.packageError[this.packageIndex].kgsCheck = true;
    }

  }

  /**
   * Removes the extra package pieces on the packaging type options form array for the
   * following packaging type:
   * - PackagingType.FEDEX_10KG_BOX
   * - PackagingType.FEDEX_25KG_BOX
   * - PackagingType.FEDEX_ENVELOPE
   *
   * Retrieves the root index first then removes all the element inside the form array.
   * After the removal, it will insert the root index in the cleared form array.
   */
  removeExtraPackages(): void {
    const packages = this.getPackagesAsFormArray();
    const firstIndex = packages.at(0);
    while (packages.length !== 0) {
      packages.removeAt(0);
    }
    packages.push(firstIndex);
  }

  /**
   * Scrolls and focuses to the first invalid control in the form group
   * Note: This method is already moved to step 1 page
   */
  // routeToRateAndDeliveryPage(): void {
  //   let packageType = this.packagingTypeOptionsForm.get('packageType').value;
  //   if (packageType !== PackagingType.YOUR_PACKAGING && this.canShowRatesEnabled) {
  //     this.updateStoreForFromAndTo.emit(true);
  //     this.router.navigateByUrl(this.rateAndDeliveryPageRoute);
  //   }
  // }

  setTotalNumberOfPackageAndWeight(): void {
    this.form.totalNumberOfPackage.setValue(this.totalNoOfPackages);
    this.form.totalWeight.setValue(this.totalWeight);
  }

  /**
   * Updates the total number of packages and weight whenever the
   * component detects any value change on the number of package and
   * weight per package.
   */
  private updateSummaryOfPackages(): void {
    this.subscriptions.push(this.getPackagesAsFormArray().valueChanges.subscribe((x) => {
      this.totalNoOfPackages = 0;
      this.totalWeight = 0;
      this.packagesCheck = false;
      this.addPackageCheck = false;
      for (let i = 0; i < x.length; i++) {
        if (this.totalPackagesCount && this.totalPackagesCount[i] !== x[i]) {
          this.packageIndex = i;
        }
        this.totalNoOfPackages = this.totalNoOfPackages + x[i].numberOfPackage;
        this.totalWeight += x[i].numberOfPackage * x[i].weightPerPackage;
        if (this.totalNoOfPackages > this.maximumPackage) {
          this.packagesCheck = true;
        }
        this.totalPackagesCount[i] = x[i];
      }
      this.totalWeight = parseFloat((this.totalWeight).toFixed(2));
      this.setTotalNumberOfPackageAndWeight();
      this.checkDimensions();
    }));
  }

  /**
   * Package form builder to add another package piece in the packaging type options form.
   * Default number of package is set to 1, weight per package is set to null. The value for the unit of measurements
   * (e.g. kg, in) will depend on the first index of the packages form array.
   *
   * @param disableUnitSelection If this is set to TRUE, the selection for weight per package and
   * dimension unit will be disabled. Default is FALSE.
   */
  private packageFormBuilder(disableUnitSelection?: boolean): FormGroup {
    const packages = this.getPackagesAsFormArray();
    const weightUnit = packages.controls[0].get('weightPerPackageUnit').value;
    const dimenUnit = packages.controls[0].get('dimensionUnit').value;

    const packageForm = this.formBuilder.group({
      numberOfPackage: 1,
      weightPerPackage: [null, Validators.required],
      weightPerPackageUnit: weightUnit,
      dimensionLength: [''],
      dimensionWidth: [''],
      dimensionHeight: [''],
      dimensionUnit: dimenUnit
    });

    if (disableUnitSelection) {
      packageForm.get('weightPerPackageUnit').disable();
      packageForm.get('dimensionUnit').disable();
    }

    return packageForm;
  }

  /**
   * Creates a package form group based on selected packaging type.
   *
   * @param isAddedAfterNgOnInit If this is set to TRUE, then it will check first
   * for the packaging type and calls the packageFormBuilder() to create
   * the appropriate package form group.
   */
  private createPackage(isAddedAfterNgOnInit: boolean): FormGroup {
    if (isAddedAfterNgOnInit) {
      const packageType = this.packagingTypeOptionsForm.get('packageType').value;
      switch (packageType) {
        case PackagingType.YOUR_PACKAGING:
          return this.packageFormBuilder(true);

        case PackagingType.FEDEX_10KG_BOX:
          return this.packageFormBuilder();

        case PackagingType.FEDEX_25KG_BOX:
          return this.packageFormBuilder();

        case PackagingType.FEDEX_BOX:
          return this.packageFormBuilder(true);

        case PackagingType.FEDEX_ENVELOPE:
          return this.packageFormBuilder();

        case PackagingType.FEDEX_PAK:
          return this.packageFormBuilder(true);

        case PackagingType.FEDEX_TUBE:
          return this.packageFormBuilder(true);

        default:
          return this.packageFormBuilder();
      }
    } else {
      return this.formBuilder.group({
        numberOfPackage: 1,
        weightPerPackage: [null, Validators.required],
        weightPerPackageUnit: UnitOfMeasurement.KG,
        dimensionLength: [''],
        dimensionWidth: [''],
        dimensionHeight: [''],
        dimensionUnit: UnitOfMeasurement.CM
      });
    }
  }

  getPackageAndServiceOptions(shipper: Sender, recipient: Recipient) {
    this.subscriptions.push(this.availabilityService.getPackageAndServiceOptions(shipper, recipient).subscribe(
      (response) => {
        if (response) {
          const modifiedResponse = this.getModifiedResponse(response.output.packageOptions);
          this.packageOptionDetails = modifiedResponse;
          this.updateWeightLimits(this.selectedPackageType, this.packageOptionDetails);
        }
      }
    ));
  }

  getModifiedResponse(packageOptions) {
    packageOptions.forEach((packageOption) => {
      if (packageOption.packageType.key === PackagingType.YOUR_PACKAGING) {
        packageOption.maxMetricWeightAllowed.value = MaximumMetricWeight.YOUR_PACKAGING;
        packageOption.maxWeightAllowed.value = MaximumImperialWeight.YOUR_PACKAGING;
      }
    });
    return packageOptions;
  }

  updateWeightLimits(selectedPackageType: PackagingType, packageOptionDetails: PackageOptions[]) {
    if (this.packageOptionDetails) {
      const selectedPackageOption = packageOptionDetails.find(packageOption => packageOption.packageType.key === selectedPackageType);

      if (this.selectedWeightUnit === UnitOfMeasurement.KG) {
        this.weightLimitValue = selectedPackageOption.maxMetricWeightAllowed.value;
        this.weightLimitUnit = selectedPackageOption.maxMetricWeightAllowed.units;
        this.form.totalWeight.setValidators([Validators.max(MaximumMetricWeight.YOUR_PACKAGING)]);
      }
      else {
        this.weightLimitValue = selectedPackageOption.maxWeightAllowed.value;
        this.weightLimitUnit = selectedPackageOption.maxWeightAllowed.units;
        this.form.totalWeight.setValidators([Validators.max(MaximumImperialWeight.YOUR_PACKAGING)]);
      }

      this.updateWeightPerPackageValidators();
      this.form.totalWeight.updateValueAndValidity();
      this.maxWeightDisplay = this.weightLimitValue.toString() + ' ' + this.weightLimitUnit;
      this.minWeightDisplay = (this.weightLimitUnit === UnitOfMeasurement.KG) ? MinimumMetricWeight[this.selectedPackageType].toString()
        : MinimumImperialWeight[this.selectedPackageType].toString();
      this.minWeightDisplay += ' ' + this.weightLimitUnit;
    } else {
      this.weightLimitValue = 0;
      this.weightLimitUnit = '';
      this.maxWeightDisplay = '';
      this.minWeightDisplay = '';
    }
  }

  updateWeightPerPackageValidators() {
    if (this.packageOptionDetails) {
      const packages = this.getPackagesAsFormArray();
      for (let i = 0; i < packages.length; i++) {
        const packageToPatch = packages.controls[i].get('weightPerPackage');
        packageToPatch.setValidators([Validators.required]);
        packageToPatch.markAsUntouched();
        packageToPatch.updateValueAndValidity();
      }
      setTimeout(() => {
        for (let i = 0; i < packages.length; i++) {
          const packageToPatch = packages.controls[i].get('weightPerPackage');
          packageToPatch.setValidators(
            [Validators.required, Validators.min(
              (this.weightLimitUnit === UnitOfMeasurement.KG) ? MinimumMetricWeight[this.selectedPackageType]
                : MinimumImperialWeight[this.selectedPackageType]),
            Validators.max(this.weightLimitValue)]
          );
          packageToPatch.markAsUntouched();
          packageToPatch.updateValueAndValidity();
        }
      }, 1);
    }
  }

  disableNumericStepper(index: number) {
    const packages = this.getPackagesAsFormArray();
    const packageToPatch = packages.controls[index];
    const numberOfPackage = packageToPatch.get('numberOfPackage');
    if (numberOfPackage.value > 1) {
      this.disablePackageMinusStepper[index].disabled = false;
    }
    else {
      this.disablePackageMinusStepper[index].disabled = true;
    }
  }

  validateNumberOfPackages(index: number) {
    const packages = this.getPackagesAsFormArray();
    const packageToPatch = packages.controls[index];
    const numberOfPackage = packageToPatch.get('numberOfPackage');
    if (numberOfPackage.value === null) {
      numberOfPackage.setValue(1);
    }
  }

  /* Slider Actions on click of left and right arrow buttons. */
  slideNext() {
    this.slides.slideNext();
  }

  slidePrevious() {
    this.slides.slidePrev();
  }

  slideChanged() {
    this.slides.length().then(totalSlides => {
      this.totalSlides = totalSlides;
    });
    this.slides.getActiveIndex().then(currentIndex => {
      if (currentIndex == 0) {
        this.showSliderPrvBtn = false;
        this.showSliderNxtBtn = true;
      } else if (currentIndex == this.totalSlides - this.slidePerView) {
        this.showSliderPrvBtn = true;
        this.showSliderNxtBtn = false;
      } else {
        this.showSliderNxtBtn = true;
        this.showSliderPrvBtn = true;
      }
    });
  }

  onClickSelectDropdown() {
    this.utils.applyArialFontToSelectPopup();
  }

}
