import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AlertController, IonicModule } from '@ionic/angular';
import { PackagingTypeOptionsComponent } from './packaging-type-options.component';
import { RouterTestingModule } from '@angular/router/testing';
import { AbstractControl, FormArray, FormBuilder } from '@angular/forms';
import { PackagingType } from 'src/app/types/enum/packaging-type.enum';
import { UnitOfMeasurement } from 'src/app/types/enum/unit-of-measurement.enum';
import { Router } from '@angular/router';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { LanguageLoader } from 'src/app/app.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { APIMAvailabilityService } from 'src/app/core/providers/apim';
import * as testConfig from '../../../../../../assets/config/mockConfigForTest';
import { Recipient } from 'src/app/interfaces/api-service/request/recipient';
import { Sender } from 'src/app/interfaces/api-service/request/sender';
import { Observable, Observer } from 'rxjs';
import { ConfigService } from '@ngx-config/core';

fdescribe('PackagingTypeOptionsComponent', () => {
  let component: PackagingTypeOptionsComponent;
  let fixture: ComponentFixture<PackagingTypeOptionsComponent>;
  let router: Router;

  const mockResponse = {
    transactionId: '3a8bddb2-20ce-41d0-8cbd-e3f0a74c4e80',
    output: {
      serviceOptions: [
        {
          key: 'FIRST_OVERNIGHT',
          displayText: 'FedEx First Overnight®'
        },
        {
          key: 'PRIORITY_OVERNIGHT',
          displayText: 'FedEx Priority Overnight®'
        },
        {
          key: 'STANDARD_OVERNIGHT',
          displayText: 'FedEx Standard Overnight®'
        },
        {
          key: 'FEDEX_2_DAY',
          displayText: 'FedEx 2Day®'
        },
        {
          key: 'FEDEX_EXPRESS_SAVER',
          displayText: 'FedEx Economy'
        },
        {
          key: 'FEDEX_GROUND',
          displayText: 'FedEx Ground®'
        }
      ],
      packageOptions: [
        {
          packageType: {
            key: 'FEDEX_BOX',
            displayText: 'FedEx Box'
          },
          rateTypes: [
            'WEIGHT_BASED'
          ],
          subpackageInfoList: [
            {
              description: 'Small',
              dimensionText: '27.62 cm x 3.81 cm x 31.43 cm'
            },
            {
              description: 'Medium',
              dimensionText: '29.21 cm x 6.03 cm x 33.66 cm'
            },
            {
              description: 'Large',
              dimensionText: '31.43 cm x 7.62 cm x 44.45 cm'
            }
          ],
          maxMetricWeightAllowed: {
            units: 'KG',
            value: 18.0
          },
          maxWeightAllowed: {
            units: 'LB',
            value: 40.0
          },
          maxDeclaredValue: {
            currency: 'CAD',
            amount: 50000.0
          }
        },
        {
          packageType: {
            key: 'FEDEX_ENVELOPE',
            displayText: 'FedEx Envelope'
          },
          rateTypes: [
            'WEIGHT_BASED'
          ],
          subpackageInfoList: [
            {
              description: 'Letter',
              dimensionText: '24.13 cm x 31.75 cm'
            },
            {
              description: 'Legal',
              dimensionText: '24.13 cm x 39.37 cm'
            }
          ],
          maxMetricWeightAllowed: {
            units: 'KG',
            value: 0.56
          },
          maxWeightAllowed: {
            units: 'LB',
            value: 1.2
          },
          maxDeclaredValue: {
            currency: 'CAD',
            amount: 100.0
          }
        },
        {
          packageType: {
            key: 'FEDEX_PAK',
            displayText: 'FedEx Pak'
          },
          rateTypes: [
            'WEIGHT_BASED'
          ],
          subpackageInfoList: [
            {
              description: 'Small',
              dimensionText: '26.04 cm x 32.39 cm'
            },
            {
              description: 'Large',
              dimensionText: '30.48 cm x 39.37 cm'
            }
          ],
          maxMetricWeightAllowed: {
            units: 'KG',
            value: 9.0
          },
          maxWeightAllowed: {
            units: 'LB',
            value: 20.0
          },
          maxDeclaredValue: {
            currency: 'CAD',
            amount: 100.0
          }
        },
        {
          packageType: {
            key: 'FEDEX_TUBE',
            displayText: 'FedEx Tube'
          },
          rateTypes: [
            'WEIGHT_BASED'
          ],
          subpackageInfoList: [
            {
              description: 'Tube',
              dimensionText: '15.24 cm x 15.24 cm x 96.52 cm'
            }
          ],
          maxMetricWeightAllowed: {
            units: 'KG',
            value: 9.0
          },
          maxWeightAllowed: {
            units: 'LB',
            value: 20.0
          },
          maxDeclaredValue: {
            currency: 'CAD',
            amount: 50000.0
          }
        },
        {
          packageType: {
            key: 'YOUR_PACKAGING',
            displayText: 'Your Packaging'
          },
          rateTypes: [
            'WEIGHT_BASED'
          ],
          subpackageInfoList: [
            {
              description: 'Please enter the weight and dimensions of your package for a more accurate estimated rate.',
              dimensionText: ''
            }
          ],
          maxMetricWeightAllowed: {
            units: 'KG',
            value: 200.0
          },
          maxWeightAllowed: {
            units: 'LB',
            value: 440.92
          },
          maxDeclaredValue: {
            currency: 'CAD',
            amount: 50000.0
          },
          maximumDimensions: [
            {
              length: 108,
              width: 62,
              height: 62
            },
            {
              length: 274,
              width: 157,
              height: 157
            }
          ],
          maximumLengthPlusGirths: [
            {
              value: 130.0,
              units: 'IN'
            },
            {
              value: 330.0,
              units: 'CM'
            }
          ]
        }
      ],
      oneRate: false,
      pricingOptions: [
        {
          key: 'WEIGHT_BASED',
          displayText: 'FedEx Standard Rate'
        },
        {
          key: 'FLAT_BASED',
          displayText: 'FedEx One Rate'
        }
      ]
    }
  };

  const sender = {
    address: {
      city: 'Beverly Hills',
      stateOrProvinceCode: 'CA',
      postalCode: '90210',
      countryCode: 'US'
    }

  };

  const recipient = {
    address: {
      city: 'Irving',
      stateOrProvinceCode: 'TX',
      postalCode: '75063',
      countryCode: 'US'
    }

  };

  beforeEach(async () => {
    const mockConfig = testConfig.config;
    class APIMAvailabilityServiceStub {
      getPackageAndServiceOptions(sender: Sender, recipient: Recipient) {
        return Observable.create((observer: Observer<any>) => {
          observer.next(mockResponse);
        });
      }
    }

    class ConfigServiceStub {
      settings: any = mockConfig;
      getSettings(prop: string) {
        return this.settings[prop];
      }
      init() {
        this.settings = mockConfig;
      }
    }

    TestBed.configureTestingModule({
      declarations: [
        PackagingTypeOptionsComponent
      ],
      imports: [
        RouterTestingModule.withRoutes([]),
        IonicModule.forRoot(),
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: LanguageLoader,
            deps: [HttpClient]
          }
        }),
        HttpClientTestingModule
      ],
      providers: [
        TranslateService,
        FormBuilder,
        AlertController,
        { provide: APIMAvailabilityService, useClass: APIMAvailabilityServiceStub },
        { provide: ConfigService, useClass: ConfigServiceStub }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);

    fixture = TestBed.createComponent(PackagingTypeOptionsComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  fit('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Default packaging on first load should be 'Your Packaging'
   */
  fit('Your Packaging should be the default package type when the page has been loaded', () => {
    const packageType = component.form.packageType.value;
    expect(packageType).toEqual(PackagingType.YOUR_PACKAGING);
  });

  /**
   * Scenario 1 : Number of Packages allowable values
   * GIVEN I have completed the login screen
   * WHEN I entered the Shipment Detail screen and select the following packaging type
   * - Your Packaging
   * - FedEx Box
   * - FedEx Pak
   * - FedEx Tube
   * THEN the acceptable values for Number of Packages is 1-40
   * AND system shall display the label of "Max. 40".
   * AND + Add Another Package is Shown
   */
  fit('scenario one: number of packages allowable values', () => {
    let packages: FormArray;
    let firstPackageIndex: AbstractControl;

    packages = component.getPackagesAsFormArray();
    firstPackageIndex = packages.controls[0].get('numberOfPackage');
    firstPackageIndex.setValue(50);

    // Your Packaging
    component.checkPackagingType(0);
    expect(firstPackageIndex.errors.max).toBeTruthy();
    expect(component.maximumPackage).toEqual(40);
    expect(component.isAddAnotherPackageHidden).toBeFalsy();

    // FedEx Box
    component.checkPackagingType(3);
    expect(firstPackageIndex.errors.max).toBeTruthy();
    expect(component.maximumPackage).toEqual(40);
    expect(component.isAddAnotherPackageHidden).toBeFalsy();

    // FedEx Pak
    component.checkPackagingType(5);
    expect(firstPackageIndex.errors.max).toBeTruthy();
    expect(component.maximumPackage).toEqual(40);
    expect(component.isAddAnotherPackageHidden).toBeFalsy();

    // FedEx Tube
    component.checkPackagingType(6);
    expect(firstPackageIndex.errors.max).toBeTruthy();
    expect(component.maximumPackage).toEqual(40);
    expect(component.isAddAnotherPackageHidden).toBeFalsy();
  });

  /**
   * Scenario 2: Shipper selected 10KG OR 25KG box OR FedEx Envelope
   * GIVEN I am in the Shipment Detail screen
   * WHEN I selected 10KG OR 25 KG Box OR FedEx Envelope in Packaging Type Options
   * THEN the Number of Packages is set to 1 and disabled
   * AND the Dimension Detail fields are HIDDEN;
   * AND system shall display the label of "Max. 1"
   * AND + Add Another Package is HIDDEN
   */
  fit('scenario 2: shipper selected 10kg/25kg/envelope', () => {
    let packages: FormArray;
    let firstPackageIndex: AbstractControl;

    // Fedex 10KG Box
    packages = component.getPackagesAsFormArray();
    firstPackageIndex = packages.controls[0].get('numberOfPackage');

    component.checkPackagingType(1);
    expect(firstPackageIndex.value).toEqual(1);
    expect(component.isNumberOfPackagesDisabled).toBeTruthy();
    expect(component.isDimensionInputFieldHidden).toBeTruthy();
    expect(component.maximumPackage).toEqual(1);
    expect(component.isAddAnotherPackageHidden).toBeTruthy();

    // Fedex 25KG Box
    component.checkPackagingType(2);
    expect(firstPackageIndex.value).toEqual(1);
    expect(component.isNumberOfPackagesDisabled).toBeTruthy();
    expect(component.isDimensionInputFieldHidden).toBeTruthy();
    expect(component.maximumPackage).toEqual(1);
    expect(component.isAddAnotherPackageHidden).toBeTruthy();

    // Fedex Envelope
    component.checkPackagingType(4);
    expect(firstPackageIndex.value).toEqual(1);
    expect(component.isNumberOfPackagesDisabled).toBeTruthy();
    expect(component.isDimensionInputFieldHidden).toBeTruthy();
    expect(component.maximumPackage).toEqual(1);
    expect(component.isAddAnotherPackageHidden).toBeTruthy();
  });

  /**
   * Scenario 3 : Shipper selected Packaging Type as your packaging to activate the dimension Detail field
   * GIVEN I am in the Shipment Detail screen
   * WHEN I selected Packaging type is Your packaging
   * THEN the Number of Packages is enabled
   * AND the Dimension Detail field are SHOWN
   */
  fit('scenario 3: shipper selected packaging Type as your packaging to activate the dimension detail field', () => {
    let packages: FormArray;
    let firstPackageIndex: AbstractControl;

    packages = component.getPackagesAsFormArray();
    firstPackageIndex = packages.controls[0].get('numberOfPackage');

    component.checkPackagingType(0);
    expect(firstPackageIndex.enabled).toBeTruthy();
    expect(component.isDimensionInputFieldHidden).toBeFalsy();
  });

  /**
   * Scenario 4 : Shipper selected Packaging Type  to deactivate the dimension Detail field
   * GIVEN I am in the Shipment Detail screen
   * WHEN I entered the Shipment Detail screen and select the following packaging type
   * - FedEx 10KG Box
   * - FedEx 25KG Box
   * - FedEx Envelope
   * - FedEx Box
   * - FedEx Pak
   * - FedEx Tube
   * THEN the Dimension Detail field are HIDDEN
   */
  fit('scenario 4: shipper selected packaging type to deactivate the dimension detail field', () => {
    // FedEx 10KG Box
    component.checkPackagingType(1);
    expect(component.isDimensionInputFieldHidden).toBeTruthy();
    // FedEx 25KG Box
    component.checkPackagingType(2);
    expect(component.isDimensionInputFieldHidden).toBeTruthy();
    // FedEx Box
    component.checkPackagingType(3);
    expect(component.isDimensionInputFieldHidden).toBeTruthy();
    // FedEx Envelope
    component.checkPackagingType(4);
    expect(component.isDimensionInputFieldHidden).toBeTruthy();
    // FedEx Pak
    component.checkPackagingType(5);
    expect(component.isDimensionInputFieldHidden).toBeTruthy();
    // FedEx Tube
    component.checkPackagingType(6);
    expect(component.isDimensionInputFieldHidden).toBeTruthy();
  });

  /**
   * Scenario 5: Shipper add additional package with different dimensions and weight
   * GIVEN I entered the Shipment Detail screen and select the Your Packaging
   * WHEN I clicked the + Add Another Package
   * THEN it should show the below fields with empty values above + Add Another Package
   * Number of Packages - default 1
   * Weight Per Package - w/o Max Weight Hints
   * Weight Unit - value same as first index and disabled (w/o Max Hints)
   * Dimension fiield- enabled
   * Dimension Unit - value same as first index and disabled
   * Delete icon - shown except first index
   * Total No. of Package - shows total number of package
   * Total Weight - shows total weight
   */
  fit('scenario 5: shipper add additional package with different dimensions and weight', () => {
    let packages: FormArray;
    let weightPerPackageUnitValue: AbstractControl;
    let packageIndex: AbstractControl;

    component.checkPackagingType(0);
    component.addPackage();

    packages = component.getPackagesAsFormArray();
    weightPerPackageUnitValue = packages.controls[0].get('weightPerPackageUnit').value;
    packageIndex = packages.controls[1];

    expect(packageIndex.get('numberOfPackage').value).toEqual(1);
    expect(packageIndex.get('weightPerPackageUnit').value).toEqual(weightPerPackageUnitValue);
    expect(packageIndex.get('weightPerPackageUnit').disable).toBeTruthy();
    expect(component.isDimensionInputFieldHidden).toBeFalsy();
    expect(packageIndex.get('dimensionUnit').disable).toBeTruthy();
    expect(component.totalNoOfPackages).toBeDefined();
    expect(component.totalWeight).toBeDefined();
  });

  /**
   * Scenario 6: Shipper add additional package with different packaging weight
   * GIVEN I entered the Shipment Detail screen and select the following packaging type
   * - FedEx Box
   * - FedEx Pak
   * - FedEx Tube
   * WHEN I clicked the + Add Another Package
   * THEN it should show the below fields with empty values above + Add Another Package
   * Number of Packages - default 1 (w/o Package Hints)
   * Weight Per Package - value same as first index and disabled (w/o Max Hints)
   * Weight Unit - value same as first index and disabled
   * Dimension fiield - disabled
   * Delete icon - shown except first index
   * Total No. of Package - shows total number of package
   * Total Weight - shows total weight
   */
  fit('scenario 6: shipper add additional package with different packaging weight', () => {
    let packages: FormArray;
    let weightPerPackageUnitValue: AbstractControl;
    let packageIndex: AbstractControl;

    // FedEx Box
    component.removeExtraPackages();
    component.checkPackagingType(3);
    component.addPackage();

    packages = component.getPackagesAsFormArray();
    weightPerPackageUnitValue = packages.controls[0].get('weightPerPackageUnit').value;
    packageIndex = packages.controls[1];

    expect(packageIndex.get('numberOfPackage').value).toEqual(1);
    expect(packageIndex.get('weightPerPackageUnit').value).toEqual(weightPerPackageUnitValue);
    expect(packageIndex.get('weightPerPackageUnit').disable).toBeTruthy();
    expect(component.isDimensionInputFieldHidden).toBeTruthy();
    expect(component.totalNoOfPackages).toBeDefined();
    expect(component.totalWeight).toBeDefined();

    // FedEx Pax
    component.removeExtraPackages();
    component.checkPackagingType(5);
    component.addPackage();

    expect(packageIndex.get('numberOfPackage').value).toEqual(1);
    expect(packageIndex.get('weightPerPackageUnit').value).toEqual(weightPerPackageUnitValue);
    expect(packageIndex.get('weightPerPackageUnit').disable).toBeTruthy();
    expect(component.isDimensionInputFieldHidden).toBeTruthy();
    expect(component.totalNoOfPackages).toBeDefined();
    expect(component.totalWeight).toBeDefined();

    // FedEx Tube
    component.removeExtraPackages();
    component.checkPackagingType(6);
    component.addPackage();

    expect(packageIndex.get('numberOfPackage').value).toEqual(1);
    expect(packageIndex.get('weightPerPackageUnit').value).toEqual(weightPerPackageUnitValue);
    expect(packageIndex.get('weightPerPackageUnit').disable).toBeTruthy();
    expect(component.isDimensionInputFieldHidden).toBeTruthy();
    expect(component.totalNoOfPackages).toBeDefined();
    expect(component.totalWeight).toBeDefined();
  });

  /**
   * Scenario 7 : Shipper delete packages
   * GIVEN package information section is more than 1
   * WHEN I clicked the delete icon on each package section
   * THEN it should prompt a confirmation alert with 'Yes' 'No'
   */
  fit('scenario 7 : shipper delete packages', async () => {
    component.removeExtraPackages();
    component.addPackage();

    spyOn(component, 'promptDeletePackageConfirmationModal').and.callThrough();
    component.promptDeletePackageConfirmationModal(1);

    expect(component.promptDeletePackageConfirmationModal).toHaveBeenCalled();
  });

  /**
   * Scenario 8 : Shipper confirm to delete packages
   * GIVEN Confirmation alert for delete package is popup
   * WHEN I clicked Yes
   * THEN the particular dimensional detail  will be deleted
   */
  fit('scenario 8 : shipper confirm to delete packages', async () => {
    let packages: FormArray;

    component.removeExtraPackages();
    component.addPackage();

    packages = component.getPackagesAsFormArray();
    component.promptDeletePackageConfirmationModal = jasmine.createSpy().and.callFake(
      () => {
        component.deletePackage(1);
        return 'Yes';
      }
    );
    component.promptDeletePackageConfirmationModal(1);

    expect(packages.length).toEqual(1);
  });

  /**
   * Scenario 9 to 12: changing to another unit of measurement
   */
  fit('should change from another unit of measurement', () => {
    let packages: FormArray;

    let oldWeightPerPackageUnit: AbstractControl;
    let oldDimensionUnit: AbstractControl;
    let newWeightPerPackageUnit: AbstractControl;
    let secondRowWeightUnitValue: AbstractControl;
    let newDimensionUnit: AbstractControl;
    let secondRowDimensionUnit: AbstractControl;

    component.removeExtraPackages();
    component.checkPackagingType(0);
    component.addPackage();

    packages = component.getPackagesAsFormArray();
    oldWeightPerPackageUnit = packages.controls[0].get('weightPerPackageUnit').value;
    oldDimensionUnit = packages.controls[0].get('dimensionUnit').value;

    packages.controls[0].get('weightPerPackageUnit').setValue(UnitOfMeasurement.LB);
    component.changeWeightPerPackageUnit();

    newWeightPerPackageUnit = packages.controls[0].get('weightPerPackageUnit').value;
    secondRowWeightUnitValue = packages.controls[1].get('weightPerPackageUnit').value;
    expect(oldWeightPerPackageUnit).not.toEqual(newWeightPerPackageUnit);
    expect(newWeightPerPackageUnit).toEqual(secondRowWeightUnitValue);

    newDimensionUnit = packages.controls[0].get('dimensionUnit').value;
    secondRowDimensionUnit = packages.controls[1].get('dimensionUnit').value;
    expect(oldDimensionUnit).not.toEqual(newDimensionUnit);
    expect(newDimensionUnit).toEqual(secondRowDimensionUnit);

    oldWeightPerPackageUnit = packages.controls[0].get('weightPerPackageUnit').value;
    oldDimensionUnit = packages.controls[0].get('dimensionUnit').value;
    packages.controls[0].get('weightPerPackageUnit').setValue(UnitOfMeasurement.KG);
    component.changeWeightPerPackageUnit();

    newWeightPerPackageUnit = packages.controls[0].get('weightPerPackageUnit').value;
    secondRowWeightUnitValue = packages.controls[1].get('weightPerPackageUnit').value;
    expect(oldWeightPerPackageUnit).not.toEqual(newWeightPerPackageUnit);
    expect(newWeightPerPackageUnit).toEqual(secondRowWeightUnitValue);

    newDimensionUnit = packages.controls[0].get('dimensionUnit').value;
    secondRowDimensionUnit = packages.controls[1].get('dimensionUnit').value;
    expect(oldDimensionUnit).not.toEqual(newDimensionUnit);
    expect(newDimensionUnit).toEqual(secondRowDimensionUnit);
  });

  fit('prompt required error when weight per package is empty', () => {
    let packages: FormArray;

    packages = component.getPackagesAsFormArray();
    packages.controls[0].get('weightPerPackage').setValue('');
    fixture.detectChanges();

    expect(packages.controls[0].get('weightPerPackage').hasError('required')).toBeTruthy();
  });

  fit('does not prompt required error when weight per package has a value', () => {
    let packages: FormArray;

    packages = component.getPackagesAsFormArray();
    packages.controls[0].get('weightPerPackage').setValue(1);
    fixture.detectChanges();

    expect(packages.controls[0].get('weightPerPackage').hasError('required')).toBeFalsy();
  });

  fit('checks the inches dimensions as per package', () => {
    let packages: FormArray;
    packages = component.getPackagesAsFormArray();

    packages.value[0].dimensionLength = 120;
    packages.value[0].dimensionHeight = 70;
    packages.value[0].dimensionWidth = 80;
    packages.value[0].dimensionUnit = UnitOfMeasurement.IN;
    component.checkDimensions();

    expect(component.packageError[0].inchesCheck).toBe(true);

    packages.value[0].dimensionLength = 119;
    packages.value[0].dimensionHeight = 70;
    packages.value[0].dimensionWidth = 80;
    packages.value[0].dimensionUnit = UnitOfMeasurement.IN;
    component.checkDimensions();

    expect(component.packageError[0].inchesCheck).toBe(false);

    fixture.detectChanges();

  });

  fit('checks the kilo grams dimensions as per package', () => {
    let packages: FormArray;
    packages = component.getPackagesAsFormArray();

    packages.value[0].dimensionLength = 303;
    packages.value[0].dimensionHeight = 178;
    packages.value[0].dimensionWidth = 203;
    packages.value[0].dimensionUnit = UnitOfMeasurement.CM;
    component.checkDimensions();
    expect(component.packageError[0].kgsCheck).toBe(true);

    packages.value[0].dimensionLength = 302;
    packages.value[0].dimensionHeight = 178;
    packages.value[0].dimensionWidth = 203;
    packages.value[0].dimensionUnit = UnitOfMeasurement.CM;
    component.checkDimensions();
    expect(component.packageError[0].kgsCheck).toBe(false);

    fixture.detectChanges();
  });

  fit('it should call packageandserviceoptions API', () => {
    component.selectedPackageType = PackagingType.YOUR_PACKAGING;
    component.selectedWeightUnit = UnitOfMeasurement.KG;
    component.getPackageAndServiceOptions(sender, recipient);
    expect(component.packageOptionDetails).toBeDefined();
    expect(component.packageOptionDetails).toBe(mockResponse.output.packageOptions);
  });

  fit('it should update weight limits of min and max', () => {
    component.selectedPackageType = PackagingType.YOUR_PACKAGING;
    component.selectedWeightUnit = UnitOfMeasurement.KG;
    component.packageOptionDetails = mockResponse.output.packageOptions;
    component.updateWeightLimits(component.selectedPackageType, component.packageOptionDetails);
    expect(component.weightLimitValue).toBe(200.0);
    expect(component.weightLimitUnit).toBe('KG');
    expect(component.maxWeightDisplay).toBe('200 KG');
    expect(component.minWeightDisplay).toBe('0.5 KG');
  });

  fit('it should update weight limits of min and max', () => {
    component.selectedPackageType = PackagingType.YOUR_PACKAGING;
    component.selectedWeightUnit = UnitOfMeasurement.LB;
    component.packageOptionDetails = mockResponse.output.packageOptions;
    component.updateWeightLimits(component.selectedPackageType, component.packageOptionDetails);
    expect(component.weightLimitValue).toBe(440.92);
    expect(component.weightLimitUnit).toBe('LB');
    expect(component.maxWeightDisplay).toBe('440.92 LB');
    expect(component.minWeightDisplay).toBe('1 LB');
  });

  fit('should slide to next slide on click of right arrow button on slider.', fakeAsync(() => {
    spyOn(component.slides, 'slideNext');
    component.slideNext();
    expect(component.slides.slideNext).toHaveBeenCalled();
  }));

  fit('should slide to previous slide on click of left arrow button on slider.', fakeAsync(() => {
    spyOn(component.slides, 'slidePrev');
    component.slidePrevious();
    expect(component.slides.slidePrev).toHaveBeenCalled();
  }));

  fit('should hide left and show right arrow buttons on slider, when silder reach at start position.', fakeAsync(() => {
    spyOn(component.slides, 'getActiveIndex').and.returnValue(Promise.resolve(0));
    component.slideChanged();
    tick();
    expect(component.showSliderPrvBtn).toBe(false);
    expect(component.showSliderNxtBtn).toBe(true);
  }));

  fit('should show left and right arrow buttons on slider, when slider has slides at left and right side.', fakeAsync(() => {
    spyOn(component.slides, 'getActiveIndex').and.returnValue(Promise.resolve(2));
    component.slideChanged();
    tick();
    expect(component.showSliderPrvBtn).toBe(true);
    expect(component.showSliderNxtBtn).toBe(true);
  }));

  fit('should show left and hide right arrow buttons on slider, when slider reached at end position', fakeAsync(() => {
    spyOn(component.slides, 'getActiveIndex').and.returnValue(Promise.resolve(4));
    component.slideChanged();
    tick();
    expect(component.showSliderPrvBtn).toBe(true);
    expect(component.showSliderNxtBtn).toBe(false);
  }));

  fit('Should set value for number of packages to 1, when user delete value of number of packages', () => {
    let packages: FormArray;
    let firstPackageIndex: AbstractControl;

    packages = component.getPackagesAsFormArray();
    firstPackageIndex = packages.controls[0].get('numberOfPackage');
    firstPackageIndex.setValue(null);

    component.validateNumberOfPackages(0);
    expect(firstPackageIndex.value).toEqual(1);
  });

  fit('Should add package based on the packaging type', () => {
    component.totalNoOfPackages = 1;
    component.maximumPackage = 40;

    component.form.packageType.setValue('TEST');
    component.addPackage();

    component.form.packageType.setValue(PackagingType.YOUR_PACKAGING);
    component.addPackage();

    component.form.packageType.setValue(PackagingType.FEDEX_10KG_BOX);
    component.addPackage();

    component.form.packageType.setValue(PackagingType.FEDEX_25KG_BOX);
    component.addPackage();

    component.form.packageType.setValue(PackagingType.FEDEX_BOX);
    component.addPackage();

    component.form.packageType.setValue(PackagingType.FEDEX_ENVELOPE);
    component.addPackage();

    component.form.packageType.setValue(PackagingType.FEDEX_PAK);
    component.addPackage();

    component.form.packageType.setValue(PackagingType.FEDEX_TUBE);
    component.addPackage();

    expect(component.addPackageCheck).toBe(false);

    component.totalNoOfPackages = 5;
    component.maximumPackage = 1;

    component.form.packageType.setValue(PackagingType.YOUR_PACKAGING);
    component.addPackage();

    expect(component.addPackageCheck).toBe(true);
  });

  fit('should disable numeric stepper', () => {
    let packages: FormArray;
    let firstPackageIndex: AbstractControl;

    packages = component.getPackagesAsFormArray();
    firstPackageIndex = packages.controls[0].get('numberOfPackage');
    firstPackageIndex.setValue(1);
    component.disableNumericStepper(0);
    expect(component.disablePackageMinusStepper[0].disabled).toBe(true);

    firstPackageIndex.setValue(5);
    component.disableNumericStepper(0);
    expect(component.disablePackageMinusStepper[0].disabled).toBe(false);
  });

  fit('should validate package weight', () => {
    let packages: FormArray;
    packages = component.getPackagesAsFormArray();
    packages.controls[0].get('weightPerPackage').setValue(12.23);
    expect(packages.controls[0].get('weightPerPackage').valid).toBeTruthy;
    packages.controls[0].get('weightPerPackage').setValue('', { emitEvent: true });
    expect(packages.controls[0].get('weightPerPackage').valid).toBeFalsy;
  });

  fit('should add or minus numeric stepper', () => {
    let packages: FormArray;
    let firstPackageIndex: AbstractControl;

    packages = component.getPackagesAsFormArray();
    firstPackageIndex = packages.controls[0].get('numberOfPackage');
    firstPackageIndex.setValue(1);
    component.numericStepperAdd(0);
    expect(component.disablePackageMinusStepper[0].disabled).toBe(false);

    firstPackageIndex.setValue(2);
    component.numericStepperMinus(0);
    expect(component.disablePackageMinusStepper[0].disabled).toBe(true);

    component.isNumberOfPackagesDisabled = true;
    component.numericStepperAdd(0);
    expect(component.packagesCheck).toBe(true);
    expect(component.packageIndex).toBe(0);

    component.numericStepperMinus(0);
    expect(component.packagesCheck).toBe(true);
    expect(component.packageIndex).toBe(0);
  });

  fit('should change dimension unit to lb or kg and in to cm', () => {
    let packages: FormArray;
    let firstPackageDimension: AbstractControl;
    let firstPackageWeight: AbstractControl;

    packages = component.getPackagesAsFormArray();
    firstPackageDimension = packages.controls[0].get('dimensionUnit');
    firstPackageWeight = packages.controls[0].get('weightPerPackageUnit');
    firstPackageDimension.setValue('CM');
    component.changeDimensionUnit();
    expect(firstPackageDimension.value).toEqual(UnitOfMeasurement.CM);
    expect(firstPackageWeight.value).toEqual(UnitOfMeasurement.KG);

    firstPackageDimension.setValue('IN');
    component.changeDimensionUnit();
    expect(firstPackageDimension.value).toEqual(UnitOfMeasurement.IN);
    expect(firstPackageWeight.value).toEqual(UnitOfMeasurement.LB);
  });

  fit('should change packaging type based on slider index', () => {
    let event = { target: { swiper: { clickedIndex: 0 } } };
    component.packagingTypeSliderChange(event);
    expect(component.selectedPackageType).toBe(PackagingType.YOUR_PACKAGING);

    event = { target: { swiper: { clickedIndex: 1 } } };
    component.packagingTypeSliderChange(event);
    expect(component.selectedPackageType).toBe(PackagingType.FEDEX_10KG_BOX);

    event = { target: { swiper: { clickedIndex: 2 } } };
    component.packagingTypeSliderChange(event);
    expect(component.selectedPackageType).toBe(PackagingType.FEDEX_25KG_BOX);

    event = { target: { swiper: { clickedIndex: 3 } } };
    component.packagingTypeSliderChange(event);
    expect(component.selectedPackageType).toBe(PackagingType.FEDEX_BOX);

    event = { target: { swiper: { clickedIndex: 4 } } };
    component.packagingTypeSliderChange(event);
    expect(component.selectedPackageType).toBe(PackagingType.FEDEX_ENVELOPE);

    event = { target: { swiper: { clickedIndex: 5 } } };
    component.packagingTypeSliderChange(event);
    expect(component.selectedPackageType).toBe(PackagingType.FEDEX_PAK);

    event = { target: { swiper: { clickedIndex: 6 } } };
    component.packagingTypeSliderChange(event);
    expect(component.selectedPackageType).toBe(PackagingType.FEDEX_TUBE);
  });
});
