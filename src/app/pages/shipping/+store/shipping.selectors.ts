import { createSelector } from '@ngrx/store';
import { AppState } from 'src/app/+store/app.state';
import * as fromShippingState from './shipping.state';

export const selectFromParent = (state: AppState) => state.shippingApp;

export const selectShippingInfo = createSelector(selectFromParent,
    (state: fromShippingState.ShippingInfo) => state);

// TODO: This is for demo purposes only. This line still subject to change
export const selectSenderDetails = createSelector(selectFromParent,
    (state: fromShippingState.ShippingInfo) => state.senderDetails);

export const selectRecipientDetailsList = createSelector(selectFromParent,
    (state: fromShippingState.ShippingInfo) => state.recipientDetails);

export const selectUserLoginDetails = createSelector(selectFromParent,
    (state: fromShippingState.ShippingInfo) => state.userAccount);

export const selectCustomsDetails = createSelector(selectFromParent,
    (state: fromShippingState.ShippingInfo) => state.customsDetails);

export const selectShipmentDetails = createSelector(selectFromParent,
    (state: fromShippingState.ShippingInfo) => state.shipmentDetails);

export const selectSelectedRecipient = createSelector(selectFromParent,
    (state: fromShippingState.ShippingInfo) => state.recipientDetails && state.recipientDetails.length > 0 ?
        state.recipientDetails[0] : null);

export const selectSelectedRates = createSelector(selectFromParent,
    (state: fromShippingState.ShippingInfo) => state.shipmentDetails ? state.shipmentDetails.selectedRate : null);

export const selectSpecialServiceInfo = createSelector(selectFromParent,
    (state: fromShippingState.ShippingInfo) => state.shipmentDetails ? state.shipmentDetails.specialServiceInfo : null);

export const selectSummaryDetails = createSelector(selectFromParent, (state: fromShippingState.ShippingInfo) => state);

export const selectSenderCountries = createSelector(selectFromParent,
    (state: fromShippingState.ShippingInfo) => state.lookupData ? state.lookupData.senderCountries : null);

export const selectRecipientCountries = createSelector(selectFromParent,
    (state: fromShippingState.ShippingInfo) => state.lookupData ? state.lookupData.recipientCountries : null);

export const selectSelectedRecipientCountry = createSelector(selectFromParent,
    (state: fromShippingState.ShippingInfo) => state.lookupData ? (state.lookupData.selectedRecipientCountryDetails ?
        state.lookupData.selectedRecipientCountryDetails : null) : null);

export const selectRecipientCityList = createSelector(selectFromParent,
    (state: fromShippingState.ShippingInfo) => state.lookupData ? (state.lookupData.recipientCities ?
        state.lookupData.recipientCities : null) : null);

export const selectSenderCountryCode = createSelector(selectFromParent,
    (state: fromShippingState.ShippingInfo) => state.lookupData ? (state.lookupData.selectedSenderCountryDetails ?
        state.lookupData.selectedSenderCountryDetails.countryCode : null) : null);

export const selectSenderCountryDetails = createSelector(selectFromParent,
    (state: fromShippingState.ShippingInfo) => state.lookupData ? (state.lookupData.selectedSenderCountryDetails ?
        state.lookupData.selectedSenderCountryDetails : null) : null);

export const selectCitiesList = createSelector(selectFromParent,
    (state: fromShippingState.ShippingInfo) => state.lookupData ? (state.lookupData.senderCities ?
        state.lookupData.senderCities : null) : null);

export const selectCountryDialingPrefix = createSelector(selectFromParent,
    (state: fromShippingState.ShippingInfo) => state.lookupData ? (state.lookupData.selectedCountryDialingPrefix ?
        state.lookupData.selectedCountryDialingPrefix : null) : null);

export const selectCurrencyListUS = createSelector(selectFromParent,
    (state: fromShippingState.ShippingInfo) => state.lookupData ? state.lookupData.currencyListUS : null);

export const selectCurrencyListLocal = createSelector(selectFromParent,
    (state: fromShippingState.ShippingInfo) => state.lookupData ? state.lookupData.currencyListLocal : null);

export const selectMergedCurrencyList = createSelector(selectFromParent,
    (state: fromShippingState.ShippingInfo) => state.lookupData ? state.lookupData.mergedCurrencyList : null);

export const selectShipmentPurpose = createSelector(selectFromParent,
    (state: fromShippingState.ShippingInfo) => state.lookupData ? state.lookupData.shipmentPurpose : null);


export const shipmentPurposeCountryCodes = createSelector(selectFromParent,
    (state: fromShippingState.ShippingInfo) => {
        return {
            senderCountryCode: state.senderDetails ? state.senderDetails.countryCode : null,
            recipientCountryCode: state.recipientDetails && state.recipientDetails.length > 0 ? state.recipientDetails[0].countryCode : null
        };
    });

export const selectCountryOfManufactureListUS = createSelector(selectFromParent,
    (state: fromShippingState.ShippingInfo) => state.lookupData ? state.lookupData.listOfcountryOfManufactureUS : null);

export const selectCountryOfManufactureListLocal = createSelector(selectFromParent,
    (state: fromShippingState.ShippingInfo) => state.lookupData ? state.lookupData.listOfcountryOfManufactureLocal : null);

export const selectMergedCountryOfManufactureList = createSelector(selectFromParent,
    (state: fromShippingState.ShippingInfo) => state.lookupData ? state.lookupData.mergedListOfcountryOfManufacture : null);

export const selectSenderRecipientInfo = createSelector(selectFromParent,
    (state: fromShippingState.ShippingInfo) => state.lookupData ? state.lookupData.senderRecipientInfo : null);

export const selectDocumentDescriptions = createSelector(selectFromParent,
    (state: fromShippingState.ShippingInfo) => state.lookupData ? state.lookupData.documentDescriptions : null);

export const senderRecipientCountryCodes = createSelector(selectFromParent,
    (state: fromShippingState.ShippingInfo) => {
        return {
            senderCountryCode: state.senderDetails ? state.senderDetails.countryCode : null,
            recipientCountryCode: state.recipientDetails && state.recipientDetails.length > 0
                ? state.recipientDetails[0].countryCode : null
        };
    });

export const selectUnitOfMeasure = createSelector(selectFromParent,
    (state: fromShippingState.ShippingInfo) => state.lookupData ? state.lookupData.uomListUS : null);

export const selectUomListLocal = createSelector(selectFromParent,
    (state: fromShippingState.ShippingInfo) => state.lookupData ? state.lookupData.uomListLocal : null);

export const selectMergedUomList = createSelector(selectFromParent,
    (state: fromShippingState.ShippingInfo) => state.lookupData ? state.lookupData.mergedUomList : null);

export const selectCreateShipmentFailure = createSelector(selectFromParent,
    (state: fromShippingState.ShippingInfo) => state.lookupData ? state.lookupData.createShipmentError : null);

export const selectCreateShipmentSuccess = createSelector(selectFromParent,
    (state: fromShippingState.ShippingInfo) => state.lookupData ? state.lookupData.createShipmentSuccess : null);

export const selectShipmentFeedbackSuccess = createSelector(selectFromParent,
    (state: fromShippingState.ShippingInfo) => state.lookupData ? state.lookupData.shipmentFeedackSuccess : null);

export const selectSystemCommodityList = createSelector(selectFromParent,
    (state: fromShippingState.ShippingInfo) => state.lookupData ? state.lookupData.systemCommodityList : null);

export const selectRatesDiscountFailure = createSelector(selectFromParent,
    (state: fromShippingState.ShippingInfo) => state.lookupData ? state.lookupData.ratesDiscountSuccess : null);

export const selectRatesDiscountSuccess = createSelector(selectFromParent,
    (state: fromShippingState.ShippingInfo) => state.lookupData ? state.lookupData.ratesDiscountError : null);

export const selectDefaultSenderDetails = createSelector(selectFromParent,
    (state: fromShippingState.ShippingInfo) => state.lookupData ? (state.lookupData.defaultSenderDetails ?
        state.lookupData.defaultSenderDetails : null) : null);

export const selectRecipientListDetails = createSelector(selectFromParent,
    (state: fromShippingState.ShippingInfo) => state.lookupData ? (state.lookupData.recipientListDetails ?
        state.lookupData.recipientListDetails : null) : null);

export const selectPendingShipmentDetails = createSelector(selectFromParent,
    (state: fromShippingState.ShippingInfo) => state.lookupData ? (state.lookupData.pendingShipmentDetails ?
        state.lookupData.pendingShipmentDetails : null) : null);

export const selectConfirmedShipmentDetails = createSelector(selectFromParent,
    (state: fromShippingState.ShippingInfo) => state.lookupData ? (state.lookupData.confirmedShipmentDetails ?
        state.lookupData.confirmedShipmentDetails : null) : null);

export const selectSenderPartyId = createSelector(selectFromParent,
    (state: fromShippingState.ShippingInfo) => {
        return state.senderDetails ? state.senderDetails.partyId : null;
    });

export const selectUserCommodityList = createSelector(selectFromParent,
    (state: fromShippingState.ShippingInfo) => state.lookupData ? state.lookupData.userCommodityList : null);

export const selectMergedSubCategoryCommodityList = createSelector(selectFromParent,
    (state: fromShippingState.ShippingInfo) => state.lookupData ? state.lookupData.mergedSubCategoryCommodityList : null);
