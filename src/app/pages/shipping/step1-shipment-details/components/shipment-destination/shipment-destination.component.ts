import { Component, OnInit, OnDestroy, ViewChild, DoCheck } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/+store/app.state';
import * as fromShippingSelector from '../../../+store/shipping.selectors';
import { Subscription } from 'rxjs';
import { IUser } from 'src/app/interfaces/shipping-app/user';
import {
  getRecipientCountriesBegin, getSelectedRecipientCountryDetailsBegin,
  getRecipientCityListBegin, getRecipientListDetailsBegin
} from '../../../+store/shipping.actions';
import { CountryTypes } from 'src/app/types/enum/country-type.enum';
import * as countryPostalConstant from '../../../../../../assets/data/postal-code-pattern.json';
import { InputTypeConstants } from 'src/app/types/constants/input-type-constants';
import { AddressTypes } from 'src/app/types/enum/address-type.enum';
import { IAddressDataList } from 'src/app/interfaces/mock-data/address-data-list.interface';
import { IRecipient } from 'src/app/interfaces/shipping-app/recipient';
import { SessionItems } from 'src/app/types/enum/session-items.enum';

@Component({
  selector: 'app-shipment-destination',
  templateUrl: './shipment-destination.component.html',
  styleUrls: ['./shipment-destination.component.scss']
})
export class ShipmentDestinationComponent implements OnInit, DoCheck, OnDestroy {
  @ViewChild('postalCodeInput', { static: false }) postalCodeInput: { setFocus: () => void; };
  countryList: any[] = [];
  fullCountryList: any[] = [];
  cityList: any = [];
  fullCityList: any = [];
  selectedCountryPattern: any;
  country: any;
  selectedRecipientCountryDetails: any;

  senderCountry: string;
  selectedRecipientCountry: string;
  postalCodeValue: number;
  selectedRecipeientCity: string;

  postalFromAddressBook = '';
  cityFromAddressBook = '';
  stateOrProvinceFromAddressBook = '';
  showCountryList = false;
  postalCodeNotFound = false;
  isFocusOnPostalCode = false;
  showInvalidCountryError = false;
  showCityList = false;
  showInvalidCityError = false;
  isCountrySelected = false;
  postalAware = true;
  enableRecipientAddressBook = false;
  minLength = 3;
  isPostalFromAddressBook = false;
  isCityFromAddressBook = false;
  isCountryDetailLoaded = false;
  isCountryReady = true;
  isCityReady = true;

  shipmentDestinationForm: FormGroup;
  inputConstants = InputTypeConstants;
  subs = new Subscription();

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private appStore: Store<AppState>
  ) { }

  ngOnInit() {
    this.senderCountry = sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);
    this.shipmentDestinationForm = this.formBuilder.group({
      countryCode: ['', Validators.required],
      countryName: ['', Validators.required], // Added for country name value
      postalCode: ['', { validators: [Validators.required], updateOn: 'blur' }],
      city: ['', [Validators.required, Validators.minLength(this.minLength)]],
      stateOrProvinceCode: [''] // Added for stateOrProvinceCode value
    });

    if (this.subs) {
      this.subs.unsubscribe();
      this.subs = new Subscription();
    }

    this.initializeShipDestination();
    this.getRecipientListFromStore();
    this.getUserLoginData();
  }

  markAllFieldAsTouch(): void {
    this.shipmentDestinationForm.markAllAsTouched();
  }

  get form() {
    return this.shipmentDestinationForm.controls;
  }

  initializeShipDestination() {
    this.appStore.dispatch(getRecipientCountriesBegin({ countryType: CountryTypes.COUNTRY_RECIPIENT }));

    // Subs for Sender country code
    this.subs.add(
      this.appStore.pipe(select(fromShippingSelector.selectSenderCountryCode)).subscribe((countryCode: any) => {
        if (countryCode) {
          this.senderCountry = countryCode;
          this.removeSenderCountryFromList();
        }
      })
    );

    // Subs for recipient countries and remove sender country
    this.subs.add(
      this.appStore.pipe(select(fromShippingSelector.selectRecipientCountries)).subscribe((countries: any[]) => {
        if (countries) {
          this.countryList = countries;
          this.removeSenderCountryFromList();
          this.getSelectedRecipientDetailsFromStore();
        }
      })
    );

    // Subs for Country details
    this.subs.add(
      this.appStore.pipe(select(fromShippingSelector.selectSelectedRecipientCountry)).subscribe((countryDetails: any) => {
        if (countryDetails) {
          this.selectedRecipientCountryDetails = countryDetails;
          this.postalAware = this.selectedRecipientCountryDetails.postalAware;
          this.isCountryDetailLoaded = true;
          this.setRecipientCountryPostalAware();
        }
      })
    );

    // Subs for auto load city list based on country
    this.subs.add(
      this.appStore.pipe(select(fromShippingSelector.selectRecipientCityList)).subscribe((cityList: any) => {
        if (cityList) {
          this.setCities(cityList);
        }
      })
    );
  }

  getRecipientListFromStore() {
    this.subs.add(
      this.appStore.pipe(select(fromShippingSelector.selectRecipientListDetails)).subscribe((recipientList: IAddressDataList) => {
        if (recipientList && recipientList.partylist.length > 0) {
          this.enableRecipientAddressBook = true;
        }
      })
    );
  }

  removeSenderCountryFromList() {
    if (this.senderCountry && this.countryList) {
      this.countryList = this.countryList.filter((country) => {
        return country.code !== this.senderCountry;
      });
      this.fullCountryList = [...this.countryList];
    }
  }

  getCityList(countryCode, postalCode) {
    this.cityList = [];
    if (countryCode) {
      this.appStore.dispatch(getRecipientCityListBegin({ countryCode, postalCode }));
    }
  }

  getUserLoginData() {
    this.appStore.pipe(select(fromShippingSelector.selectUserLoginDetails))
      .subscribe((userloginDetails: IUser) => {
        if (userloginDetails) {
          this.appStore.dispatch(getRecipientListDetailsBegin({
            uid: userloginDetails.userId, addressType: AddressTypes.ADDRESS_RECIPIENT
          }));
        }
      });
  }

  setCities(cityList) {
    if (this.form.countryCode.value !== '') {
      this.cityList = cityList.matchedAddresses;
      this.fullCityList = this.cityList;
      this.postalCodeNotFound = this.cityList.length > 0 ? false : true;
      setTimeout(() => {
        if (this.cityList.length === 1) {
          this.form.city.setValue(this.cityList[0].city);
          this.form.stateOrProvinceCode.setValue(this.cityList[0].stateOrProvinceCode);
        } else if (this.cityList.length > 1) {
          const primaryCity = this.cityList.find((city) => city.primary === true);
          if (primaryCity) {
            this.form.city.setValue(primaryCity.city);
            this.form.stateOrProvinceCode.setValue(primaryCity.stateOrProvinceCode);
          }
        }
      }, 0);
    } else {
      this.cityList = [];
    }
  }
  countrySelected(country) {
    this.isCountrySelected = true;
    this.form.postalCode.setValue('');
    this.form.city.setValue('');
    this.form.countryCode.setValue(country.actualCountryCode);
    this.form.countryName.setValue(country.name);
  }

  getSelectedCountryDetails(selectedCountryRecord) {
    if (selectedCountryRecord !== undefined) {
      this.appStore.dispatch(getSelectedRecipientCountryDetailsBegin({ countryCode: selectedCountryRecord.actualCountryCode }));
    }
  }

  setRecipientCountryPostalAware() {
    this.cityList = [];
    if (this.postalAware) {
      this.selectedCountryPattern = this.getSelectedCountryPostalCodePattern();
      this.form.postalCode.enable();
      this.form.postalCode.setValidators(
        [Validators.required, Validators.pattern(this.selectedCountryPattern.pattern)]);
      this.form.postalCode.markAsUntouched();
      this.form.postalCode.updateValueAndValidity();
    } else {
      this.form.postalCode.disable();
      this.form.postalCode.clearAsyncValidators();
      this.form.postalCode.markAsUntouched();
      this.form.postalCode.updateValueAndValidity();
      this.getCityList(this.form.countryCode.value, '');
    }
  }

  getSelectedCountryPostalCodePattern() {
    const selectedCountryCode = this.form.countryCode.value;
    const countryPattern = countryPostalConstant.countries.find(country => country.countryCode === selectedCountryCode
    );
    return countryPattern;
  }

  citySelected(eventCitySelected) {
    const cityRecord = this.cityList.find(city => city.city === eventCitySelected.target.value);
    if (cityRecord) {
      this.form.stateOrProvinceCode.setValue(cityRecord.stateOrProvinceCode);
    } else {
      this.form.stateOrProvinceCode.setValue('');
    }
  }

  inputPostalCode(event) {
    this.postalCodeNotFound = false;
    this.isFocusOnPostalCode = false;
    if (this.form.countryName.valid && !this.showInvalidCountryError &&
      event.target.value.length > 0 && this.form.postalCode.valid) {
      this.form.city.setValue('');
      this.cityList = [];
      this.getCityList(this.form.countryCode.value, event.target.value);
    } else if (this.form.countryName.valid && !this.showInvalidCountryError &&
      event.target.value.length > 0 && !this.form.postalCode.valid) {
      this.form.city.setValue('');
      this.cityList = [];
    }
    else if (this.form.countryName.invalid) {
      this.form.countryName.markAsTouched();
    }
  }

  onPostalCodeFocusIn() {
    this.isFocusOnPostalCode = true;
  }

  onSearchCountry(event) {
    const searchItem = event.target.value;
    if (searchItem) {
      const searchTerm = searchItem.trim();
      if (searchTerm.length >= 1) {
        this.showCountryList = true;
        this.countryList = this.fullCountryList;
        this.countryList = this.countryList.filter((item) =>
          ((item.name + ' (' + item.actualCountryCode + ')').toLowerCase().indexOf(searchTerm.toLowerCase()) > -1)
        );
        if (this.countryList.length === 0) {
          this.showInvalidCountryError = true;
        } else {
          this.showInvalidCountryError = false;
        }
      } else {
        this.showInvalidCountryError = true;
      }
    } else {
      this.showFullCountryList();
    }
    this.isCountrySelected = true;
  }

  hideCountryList(event) {
    setTimeout(() => {
      this.isCountryReady = true;
      const textValue = (event.target.value) ? event.target.value : '';
      this.showCountryList = false;
      const filteredCountrylist = this.countryList.filter((item) =>
        ((item.name + ' (' + item.actualCountryCode + ')').toLowerCase().indexOf(textValue.toLowerCase()) > -1));
      if (filteredCountrylist.length > 1 || filteredCountrylist.length === 0) {
        const actualCountry = filteredCountrylist.find(country =>
          country.name.toLowerCase() === textValue.toLowerCase());
        if (actualCountry) {
          this.countrySelected(actualCountry);
          this.getSelectedCountryDetails(actualCountry);
        } else {
          this.form.countryCode.setValue('');
          this.form.countryName.setValue('');
          this.form.postalCode.setValue('');
          this.form.city.setValue('');
          this.fullCityList = [];
        }
      }
      else if (filteredCountrylist.length === 1) {
        if (this.isCountrySelected) {
          this.countrySelected(filteredCountrylist[0]);
          this.getSelectedCountryDetails(filteredCountrylist[0]);
        }
      }
      this.showInvalidCountryError = !this.form.countryCode.valid || filteredCountrylist.length === 0;
      this.isCountrySelected = false;
    }, 100);
  }

  showFullCountryList() {
    this.isCountryReady = false;
    this.countryList = this.fullCountryList;
    this.showCountryList = true;
    this.showInvalidCountryError = false;
  }

  showFullCityList() {
    this.isCityReady = false;
    this.cityList = this.fullCityList;
    this.showCityList = true;
    this.showInvalidCityError = false;
  }

  hideCityList(event) {
    setTimeout(() => {
      this.isCityReady = true;
      const textValue = (event.target.value) ? event.target.value : '';
      this.showCityList = false;
      const filteredCityList = this.cityList.filter((item) =>
        (item.city.toLowerCase().indexOf(textValue.toLowerCase()) > -1));
      if (filteredCityList.length > 1 || filteredCityList.length === 0) {
        const actualCity = filteredCityList.find(city =>
          city.city.toLowerCase() === textValue.toLowerCase());
        if (actualCity) {
          this.form.city.setValue(actualCity.city);
        } else {
          this.form.city.setValue(this.form.city.value.trim());
        }
      }
      if (textValue.trim().length < this.minLength) {
        this.form.city.setValue('');
      }
    }, 100);
  }

  onSearchCity(event) {
    const searchItem = event.target.value;
    const pattern = new RegExp('^[ A-Za-z0-9_@.,&+-]*$');
    const isValid = pattern.test(searchItem);
    if (!isValid) {
      this.form.city.setValue('');
    }
    else {
      if (searchItem) {
        const searchTerm = searchItem.trim();
        if (searchTerm.length >= 1) {
          this.showCityList = true;
          this.cityList = this.fullCityList;
          this.cityList = this.cityList.filter((item) =>
            (item.city.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1));
          if (this.cityList.length === 0) {
            this.showCityList = false;
          } else {
            this.showInvalidCityError = false;
          }
        } else {
          this.form.city.setValue('');
          this.showFullCityList();
        }
      } else {
        this.showFullCityList();
      }
    }
  }

  setCityValue(cityRecord) {
    this.form.city.setValue(cityRecord.city);
  }

  openRecipientBook() {
    this.router.navigate(['/', 'shipping', 'address-book']);
  }

  getSelectedRecipientDetailsFromStore() {
    this.subs.add(
      this.appStore.pipe(select(fromShippingSelector.selectSelectedRecipient))
        .subscribe((recipientDetail: IRecipient) => {
          const recipientLoadedAddressBook = sessionStorage.getItem(SessionItems.RECIPIENTADDRESSBOOK) === 'true' ? true : false;
          if (recipientDetail && recipientLoadedAddressBook) {
            sessionStorage.removeItem(SessionItems.RECIPIENTADDRESSBOOK);
            this.getCityListAndSelectFromAddressBook(recipientDetail);
          }
        })
    );
  }

  getCityListAndSelectFromAddressBook(recipientDetail: IRecipient) {
    const selectedCountryEvent = {
      name: this.fullCountryList.find(country => country.code === recipientDetail.countryCode).name,
      code: recipientDetail.countryCode,
      actualCountryCode: recipientDetail.countryCode
    };
    this.isCountryDetailLoaded = false;
    this.showInvalidCountryError = false;
    this.countrySelected(selectedCountryEvent);
    this.getSelectedCountryDetails(selectedCountryEvent);
    this.postalFromAddressBook = recipientDetail.postalCode ? recipientDetail.postalCode : '';
    this.cityFromAddressBook = recipientDetail.city;
    this.stateOrProvinceFromAddressBook = recipientDetail.stateOrProvinceCode ? recipientDetail.stateOrProvinceCode : '';
    this.isPostalFromAddressBook = true;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngDoCheck() {
    // This code section is for loading postal and city from address book. ***START***
    if (this.isCountryDetailLoaded && this.isPostalFromAddressBook) {
      if (this.postalAware) {
        const postalCodeEvent = { target: { value: this.postalFromAddressBook } };
        this.form.postalCode.setValue(this.postalFromAddressBook);
        setTimeout(() => {
          this.inputPostalCode(postalCodeEvent);
        }, 50);
      } else {
        this.form.postalCode.setValue('');
      }
      this.form.stateOrProvinceCode.setValue(this.stateOrProvinceFromAddressBook);
      this.isPostalFromAddressBook = false;
      this.isCityFromAddressBook = true;
      this.isCountryDetailLoaded = false;
    }

    if (this.isCityFromAddressBook && this.cityList.length > 0) {
      setTimeout(() => {
        this.form.city.setValue(this.cityFromAddressBook);
      }, 0);
      this.isCityFromAddressBook = false;
    }
    // This code section is for loading postal and city from address book. ***END***
  }
}
