import { Component, OnInit, OnDestroy, ViewChild, DoCheck } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { AppState } from 'src/app/+store/app.state';
import * as fromShippingSelector from '../../../+store/shipping.selectors';
import { IUser } from 'src/app/interfaces/shipping-app/user';
import { Subscription } from 'rxjs';
import {
  getDefaultSenderDetailsBegin,
  getRatesDiscountByCountryBegin, getSelectedSenderCountryDetailsBegin,
  getSenderCityListBegin, getSenderCountriesBegin, saveSenderAddressAction
} from '../../../+store/shipping.actions';
import { CountryTypes } from 'src/app/types/enum/country-type.enum';
import * as postalCodePatternConstant from '../../../../../../assets/data/postal-code-pattern.json';
import { IonSelect } from '@ionic/angular';
import { InputTypeConstants } from 'src/app/types/constants/input-type-constants';
import { Country } from 'src/app/interfaces/api-service/response/country';
import { IAddressBookResponse } from 'src/app/interfaces/mock-data/address-book-response.interface';
import { SessionItems } from 'src/app/types/enum/session-items.enum';
import { AddressTypes } from 'src/app/types/enum/address-type.enum';
import { IAddressDataList } from 'src/app/interfaces/mock-data/address-data-list.interface';

@Component({
  selector: 'app-shipment-origin',
  templateUrl: './shipment-origin.component.html',
  styleUrls: ['./shipment-origin.component.scss']
})
export class ShipmentOriginComponent implements OnInit, OnDestroy, DoCheck {
  @ViewChild('countryCodeFrom', { static: false }) countryCodeFrom: IonSelect;
  countryList: Country[] = [];
  cityList: any = [];
  fullCityList: any = [];
  selectedCountryPattern: { countryCode: string; format: string; pattern: string; };

  hidePostal = false;
  selectedCountryRecord: any;
  postalAware: boolean;
  postalCodeNotFound: boolean;
  isFocusOnPostalCode: boolean;
  showCityList = false;
  showInvalidCityError = false;
  isPostalFromUserProfile = false;
  isCityFromUserProfile = false;
  isCountryDetailLoaded = false;
  isCityReady = true;
  isCountryMatched = false;
  minLength = 3;
  countryCode: string;
  shipmentOriginForm: FormGroup;
  defaultSenderDetails: IAddressBookResponse;
  inputConstants = InputTypeConstants;
  subs = new Subscription();

  constructor(
    private formBuilder: FormBuilder,
    private appStore: Store<AppState>,
  ) { }

  ngOnInit() {
    this.shipmentOriginForm = this.formBuilder.group({
      countryCode: [{ value: '', disabled: true }, Validators.required],
      countryName: [''], // Added for country name value
      postalCode: ['', { validators: [Validators.required], updateOn: 'blur' }],
      city: ['', [Validators.required, Validators.minLength(this.minLength)]]
    });

    if (this.subs) {
      this.subs.unsubscribe();
      this.subs = new Subscription();
    }
    this.countryCode = sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);
    this.initializeShipOrigin();
  }

  markAllFieldAsTouch(): void {
    this.shipmentOriginForm.markAllAsTouched();
  }

  get form() {
    return this.shipmentOriginForm.controls;
  }

  initializeShipOrigin() {
    this.appStore.dispatch(getSenderCountriesBegin({ countryType: CountryTypes.COUNTRY_SENDER }));

    // Subs for Sender Countries and setting selected country from session
    this.subs.add(
      this.appStore.pipe(select(fromShippingSelector.selectSenderCountries)).subscribe((countries: any[]) => {
        this.countryList = countries;
        if (this.countryList) {
          setTimeout(() => {
            const selectedCountry = this.countryList.find(country => country.code === this.countryCode);
            if(selectedCountry){              
              this.countryList = [selectedCountry];
            }
            this.form.countryCode.setValue(this.countryCode);
            this.form.countryName.setValue(selectedCountry.name);
            this.form.postalCode.setValue('');
            this.form.city.setValue('');
            this.onCountryChange();
          }, 50);
        }
      })
    );

    // Subs for Country Detail and update postal and city lists
    this.subs.add(
      this.appStore.pipe(select(fromShippingSelector.selectSenderCountryDetails)).subscribe((selectedCountrydata) => {
        if (selectedCountrydata) {
          this.isCountryDetailLoaded = true;
          this.hidePostal = !selectedCountrydata.postalAware;
          this.postalAware = selectedCountrydata.postalAware;
          this.form.postalCode.setValue('');
          this.form.city.setValue('');
          this.setPostalCodeValidators();
          this.getUserLoginDataFromStore();
        }
      })
    );

    // Subs for setting city list
    this.subs.add(
      this.appStore.pipe(select(fromShippingSelector.selectCitiesList)).subscribe(cities => {
        if (cities) {
          this.setCities(cities);
        }
      })
    );

    // Subs for getting default sender list
    this.subs.add(
      this.appStore.pipe(select(fromShippingSelector.selectDefaultSenderDetails)).subscribe((defaultSenderData: IAddressDataList) => {
        if (defaultSenderData) {
          this.defaultSenderDetails = defaultSenderData.partylist ? defaultSenderData.partylist[0] : null;
          if (this.defaultSenderDetails) {
            this.isCountryMatched = this.countryCode === defaultSenderData.partylist[0].address.countryCode ? true : false;
            this.isCountryMatched ? this.isPostalFromUserProfile = true : this.isPostalFromUserProfile = false;
            this.assignSenderDetails();
          }
        }
      })
    );

    // Subs for getting Rates discount by country
    this.appStore.dispatch(getRatesDiscountByCountryBegin({ countryCode: this.countryCode }));
  }

  assignSenderDetails() {
    this.appStore.dispatch(saveSenderAddressAction({
      senderDetails: {
        address1: this.isCountryMatched ? this.defaultSenderDetails.address.streetlines[0] : '',
        address2: this.isCountryMatched ? this.defaultSenderDetails.address.streetlines[1] : '',
        city: this.isCountryMatched ?
          this.defaultSenderDetails.address.city : '',
        contactName: this.isCountryMatched ? this.defaultSenderDetails.contact.personName : '',
        countryCode: this.isCountryMatched ? this.defaultSenderDetails.address.countryCode : '',
        countryName: undefined,
        postalCode: this.isCountryMatched ? this.defaultSenderDetails.address.postalCode : '',
        companyName: this.isCountryMatched ? this.defaultSenderDetails.contact.companyName : '',
        emailAddress: this.defaultSenderDetails.contact.emailAddress,
        postalAware: undefined,
        stateAware: undefined,
        phoneNumber: this.isCountryMatched ? this.defaultSenderDetails.contact.phoneNumber : '',
        saveContact: false,
        stateOrProvinceCode: this.isCountryMatched ? this.defaultSenderDetails.address.stateOrProvinceCode : undefined,
        taxId: this.isCountryMatched ? this.defaultSenderDetails.contact.taxId : undefined,
        dialingPrefix: undefined,
        partyId: this.defaultSenderDetails.partyId
      }
    }));
  }

  setCities(cities) {
    this.cityList = cities;
    this.fullCityList = this.cityList;
    this.postalCodeNotFound = this.cityList.length === 0 ? true : false;
    setTimeout(() => {
      if (this.cityList.length === 1) {
        this.form.city.setValue(this.cityList[0].city);
      }
      else if (this.cityList.length > 1) {
        const primaryCity = this.cityList.find((city) => city.primary === true);
        if (primaryCity) {
          this.form.city.setValue(primaryCity.city);
        }
      }
    }, 50);
  }

  setPostalCodeValidators() {
    this.cityList = [];
    if (this.postalAware) {
      this.selectedCountryPattern = this.validatePostalCodeFormat();
      this.form.postalCode.enable();
      this.form.postalCode.setValidators([Validators.required, Validators.pattern(this.selectedCountryPattern.pattern)]);
      this.form.postalCode.markAsUntouched();
      this.form.postalCode.updateValueAndValidity();
    } else {
      this.form.postalCode.disable();
      this.form.postalCode.clearAsyncValidators();
      this.form.postalCode.markAsUntouched();
      this.form.postalCode.updateValueAndValidity();
      this.getSenderCities(this.countryCode, '');
    }
  }

  getSenderCities(countryCode, postalCode) {
    if (countryCode) {
      this.appStore.dispatch(getSenderCityListBegin({ countryCode, postalCode }));
    }
  }

  getUserLoginDataFromStore() {
    this.subs.add(
      this.appStore.pipe(select(fromShippingSelector.selectUserLoginDetails)).subscribe((userDetailResponse: IUser) => {
        if (userDetailResponse) {
          this.appStore.dispatch(getDefaultSenderDetailsBegin({ uid: userDetailResponse.userId, addressType: AddressTypes.ADDRESS_DEFAULT_SENDER }));
        }
      }));
  }

  inputPostalCode() {
    this.isFocusOnPostalCode = false;
    this.postalCodeNotFound = false;
    this.shipmentOriginForm.controls.city.setValue('');
    this.cityList = [];
    if (this.form.postalCode.valid) {
      this.getSenderCities(this.shipmentOriginForm.controls.countryCode.value, this.shipmentOriginForm.controls.postalCode.value);
    }
  }

  onCountryChange() {
    if (this.form.countryCode.value) {
      this.appStore.dispatch(getSelectedSenderCountryDetailsBegin({ countryCode: this.form.countryCode.value }));
    }
  }

  validatePostalCodeFormat() {
    const countryPattern = postalCodePatternConstant.countries.find(country => country.countryCode === this.countryCode
    );
    return countryPattern;
  }

  onPostalCodeFocusIn() {
    this.isFocusOnPostalCode = true;
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

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  ngDoCheck() {
    // This code section is for loading postal and city from default sender list. ***START***
    if (this.isCountryDetailLoaded && this.isPostalFromUserProfile && this.defaultSenderDetails) {
      if (this.postalAware) {
        this.form.postalCode.setValue(this.defaultSenderDetails.address.postalCode);
        setTimeout(() => {
          this.inputPostalCode();
        }, 50);
      } else {
        this.form.postalCode.setValue('');
      }
      this.form.postalCode.setValue(this.defaultSenderDetails.address.postalCode);
      this.isPostalFromUserProfile = false;
      this.isCityFromUserProfile = true;
      this.isCountryDetailLoaded = false;
    }

    if (this.isCityFromUserProfile && this.cityList.length > 0 && this.defaultSenderDetails) {
      setTimeout(() => {
        this.form.city.setValue(this.defaultSenderDetails.address.city);
      }, 0);
      this.isCityFromUserProfile = false;
    }
    // This code section is for loading postal and city from default sender list. ***END***
  }
}
