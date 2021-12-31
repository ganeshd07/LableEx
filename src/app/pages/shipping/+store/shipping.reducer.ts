import { createReducer, on } from '@ngrx/store';
import * as ShippingInfo from './shipping.state';
import * as ShippingActions from './shipping.actions';
import { ICustomsInfo } from 'src/app/interfaces/shipping-app/customs-info';
import { ICommodity } from 'src/app/interfaces/shipping-app/commodity';
import { IShipmentDetails } from 'src/app/interfaces/shipping-app/shipment-details';
import { ISender } from 'src/app/interfaces/shipping-app/sender';
import { SessionItems } from 'src/app/types/enum/session-items.enum';

export const shippingFeatureKey = 'shippingApp';

export const initialState = ShippingInfo.initialState;

export const ShippingReducer = createReducer(
  initialState,
  on(ShippingActions.saveSenderAddressAction, (state: ShippingInfo.ShippingInfo, { senderDetails }) => {    
    return { ...state, senderDetails };
  }),

  on(ShippingActions.saveRecipientDetailsAction, (state: ShippingInfo.ShippingInfo, { recipientDetailsList }) => {
    return { ...state, recipientDetails: recipientDetailsList };
  }),

  on(ShippingActions.saveUserAccountAction, (state: ShippingInfo.ShippingInfo, { userAccount }) => {    
    return { ...state, userAccount };
  }),

  on(ShippingActions.addCommodityAction, (state: ShippingInfo.ShippingInfo, { commodity }) => {
    const customsDetailsState: ICustomsInfo = state.customsDetails;
    const commodities: ICommodity[] = Object.assign([], (customsDetailsState) ? customsDetailsState.commodityList.map(commodityListItem => ({
      ...commodityListItem,
      unitPrice: commodity.unitPrice
    })) : []);
    commodities.push(commodity);
    const currentCustomsDetails = {
      commodityList: commodities,
      customsType: (customsDetailsState) ? customsDetailsState.customsType : '',
      productType: (customsDetailsState) ? customsDetailsState.productType : '',
      productPurpose: (customsDetailsState) ? customsDetailsState.productPurpose : '',
      documentType: (customsDetailsState) ? customsDetailsState.documentType : '',
      documentTypeCode: (customsDetailsState) ? customsDetailsState.documentTypeCode : '',
      documentValue: (customsDetailsState) ? customsDetailsState.documentValue : '',
      documentValueUnits: (customsDetailsState) ? customsDetailsState.documentValueUnits : ''
    };
    return { ...state, customsDetails: currentCustomsDetails };
  }),

  on(ShippingActions.updateSelectedRate, (state: ShippingInfo.ShippingInfo, { rateDetails }) => {
    const shipmentDetailsState: IShipmentDetails = state.shipmentDetails;
    const currentShippingDetails = {
      selectedRate: rateDetails,
      packageDetails: (shipmentDetailsState) ? shipmentDetailsState.packageDetails : null,
      totalNumberOfPackages: (shipmentDetailsState) ? shipmentDetailsState.totalNumberOfPackages : null,
      totalWeight: (shipmentDetailsState) ? shipmentDetailsState.totalWeight : null,
      serviceType: (shipmentDetailsState) ? shipmentDetailsState.serviceType : null,
      serviceName: (shipmentDetailsState) ? shipmentDetailsState.serviceName : null,
      packagingType: (shipmentDetailsState) ? shipmentDetailsState.packagingType : null,
      serviceCode: (shipmentDetailsState) ? shipmentDetailsState.serviceCode : null,
      advancedPackageCode: (shipmentDetailsState) ? shipmentDetailsState.advancedPackageCode : null,
      totalCustomsOrInvoiceValue: (shipmentDetailsState) ? shipmentDetailsState.totalCustomsOrInvoiceValue : null,
      customsOrInvoiceValueCurrency: (shipmentDetailsState) ? shipmentDetailsState.customsOrInvoiceValueCurrency : null,
      carriageDeclaredValue: (shipmentDetailsState) ? shipmentDetailsState.carriageDeclaredValue : null,
      carriageDeclaredValueCurrency: (shipmentDetailsState) ? shipmentDetailsState.carriageDeclaredValueCurrency : null,
      displayDate: (shipmentDetailsState) ? shipmentDetailsState.displayDate : null,
      shipDate: (shipmentDetailsState) ? shipmentDetailsState.shipDate : null,
      firstAvailableShipDate: (shipmentDetailsState) ? shipmentDetailsState.firstAvailableShipDate : null,
      lastAvailableShipDate: (shipmentDetailsState) ? shipmentDetailsState.lastAvailableShipDate : null,
      availableShipDates: (shipmentDetailsState) ? shipmentDetailsState.availableShipDates : null,
      selectedPackageOption: (shipmentDetailsState) ? shipmentDetailsState.selectedPackageOption : null,
      specialServiceInfo: (shipmentDetailsState) ? shipmentDetailsState.specialServiceInfo : null,
      currencyDisplayValue: (shipmentDetailsState) ? shipmentDetailsState.currencyDisplayValue : null
    };
    return { ...state, shipmentDetails: currentShippingDetails };
  }),

  on(ShippingActions.updateCustomsDetailsAction, (state: ShippingInfo.ShippingInfo, { customsDetails }) => {
    return { ...state, customsDetails };
  }),

  on(ShippingActions.updateShipmentDetailsAction, (state: ShippingInfo.ShippingInfo, { shipmentDetails }) => {
    return { ...state, shipmentDetails };
  }),

  on(ShippingActions.saveRecipientAddressSelectedAction, (state: ShippingInfo.ShippingInfo, { selectedRecipient }) => {
    return { ...state, recipientDetails: [selectedRecipient] };
  }),

  on(ShippingActions.resetNewShippingAction, (state: ShippingInfo.ShippingInfo) => {
    return {
      ...state,
      shipmentDetails: null,
      customsDetails: null,
      senderDetails: null,
      recipientDetails: null,
      paymentDetails: null,
      shipmentConfirmation: null,
      lookupData: {
        selectedRecipientCountryDetails: undefined,
        recipientCities: undefined,
        mergedCurrencyList: undefined,
        currencyListUS: undefined,
        currencyListLocal: undefined,
        documentDescriptions: undefined,
        senderRecipientInfo: undefined,
        shipmentPurpose: undefined,
        selectedCountryDialingPrefix: undefined,
        listOfcountryOfManufactureLocal: undefined,
        listOfcountryOfManufactureUS: undefined,
        mergedListOfcountryOfManufacture: undefined,
        createShipmentError: undefined,
        createShipmentSuccess: undefined,
        uomListLocal: undefined,
        uomListUS: undefined,
        mergedUomList: undefined,
        shipmentFeedackSuccess: undefined,
        systemCommodityList: undefined,
        ratesDiscountError: undefined,
        senderCountries: state.lookupData?.senderCountries,
        ratesDiscountSuccess: state.lookupData?.ratesDiscountSuccess,
        recipientCountries: state.lookupData?.recipientCountries,
        selectedSenderCountryDetails: state.lookupData?.selectedSenderCountryDetails,
        senderCities: state.lookupData?.senderCities,
        defaultSenderDetails: undefined,
        recipientListDetails: undefined,
        userCommodityList: undefined
      }
    };
  }),

  on(ShippingActions.savePaymentsDetailsAction, (state: ShippingInfo.ShippingInfo, { paymentDetails, specialServiceInfo }) => {
    const currentShippingDetails: IShipmentDetails = { ...state.shipmentDetails, specialServiceInfo };
    return { ...state, shipmentDetails: currentShippingDetails, paymentDetails };
  }),

  on(ShippingActions.getSenderCountriesSuccess, (state: ShippingInfo.ShippingInfo, { data }) => {
    const lookupData = { ...state.lookupData, senderCountries: data };
    return { ...state, lookupData };
  }),

  on(ShippingActions.getRecipientCountriesSuccess, (state: ShippingInfo.ShippingInfo, { data }) => {
    const lookupData = { ...state.lookupData, recipientCountries: data };
    return { ...state, lookupData };
  }),

  on(ShippingActions.getSelectedRecipientCountryDetailsSuccess, (state: ShippingInfo.ShippingInfo, { data }) => {
    const lookupData = { ...state.lookupData, selectedRecipientCountryDetails: data };
    return { ...state, lookupData };
  }),

  on(ShippingActions.getRecipientCityListSuccess, (state: ShippingInfo.ShippingInfo, { data }) => {
    const lookupData = { ...state.lookupData, recipientCities: data };
    return { ...state, lookupData };
  }),

  on(ShippingActions.getSelectedSenderCountryDetailsSuccess, (state: ShippingInfo.ShippingInfo, { data }) => {
    const lookupData = { ...state.lookupData, selectedSenderCountryDetails: data };
    return { ...state, lookupData };
  }),

  on(ShippingActions.getSenderCityListSuccess, (state: ShippingInfo.ShippingInfo, { data }) => {
    const lookupData = { ...state.lookupData, senderCities: data };
    return { ...state, lookupData };
  }),

  on(ShippingActions.getCountryDialingPrefixesSuccess, (state: ShippingInfo.ShippingInfo, { data }) => {
    const lookupData = { ...state.lookupData, selectedCountryDialingPrefix: data };
    return { ...state, lookupData: lookupData };
  }),

  on(ShippingActions.deleteCoustomsdetailsBegin, (state: ShippingInfo.ShippingInfo, { id }) => {
    const customsDetailsState: ICustomsInfo = state.customsDetails;
    const commodities: ICommodity[] = Object.assign([], (customsDetailsState) ? customsDetailsState.commodityList : []);
    commodities.splice(id, 1);
    const currentCustomsDetails = {
      commodityList: commodities,
      customsType: (customsDetailsState) ? customsDetailsState.customsType : '',
      productType: (customsDetailsState) ? customsDetailsState.productType : '',
      productPurpose: (customsDetailsState) ? customsDetailsState.productPurpose : '',
      documentType: (customsDetailsState) ? customsDetailsState.documentType : '',
      documentTypeCode: (customsDetailsState) ? customsDetailsState.documentTypeCode : '',
      documentValue: (customsDetailsState) ? customsDetailsState.documentValue : '',
      documentValueUnits: (customsDetailsState) ? customsDetailsState.documentValueUnits : ''
    };
    return { ...state, customsDetails: currentCustomsDetails };
  }),

  on(ShippingActions.updateCustomsDetailsBegin, (state: ShippingInfo.ShippingInfo, { id, commodity }) => {
    const customsDetailsState: ICustomsInfo = state.customsDetails;
    const commodities: ICommodity[] = Object.assign([], (customsDetailsState) ? customsDetailsState.commodityList.map(commodityListItem => ({
      ...commodityListItem,
      unitPrice: commodity.unitPrice
    })) : []);
    commodities.splice(id, 1, commodity);
    const currentCustomsDetails = {
      commodityList: commodities,
      customsType: (customsDetailsState) ? customsDetailsState.customsType : '',
      productType: (customsDetailsState) ? customsDetailsState.productType : '',
      productPurpose: (customsDetailsState) ? customsDetailsState.productPurpose : '',
      documentType: (customsDetailsState) ? customsDetailsState.documentType : '',
      documentTypeCode: (customsDetailsState) ? customsDetailsState.documentTypeCode : '',
      documentValue: (customsDetailsState) ? customsDetailsState.documentValue : '',
      documentValueUnits: (customsDetailsState) ? customsDetailsState.documentValueUnits : ''
    };
    return { ...state, customsDetails: currentCustomsDetails };
  }),

  on(ShippingActions.getCurrencyListUSApiSuccess, (state: ShippingInfo.ShippingInfo, { data }) => {
    const lookupData = { ...state.lookupData, currencyListUS: data };
    return { ...state, lookupData };
  }),

  on(ShippingActions.getCurrencyListLocalApiSuccess, (state: ShippingInfo.ShippingInfo, { data }) => {
    const lookupData = { ...state.lookupData, currencyListLocal: data.configlist };
    return { ...state, lookupData };
  }),

  on(ShippingActions.saveMergedCurrencyListAction, (state: ShippingInfo.ShippingInfo, { mergedCurrencyList }) => {
    const lookupData = { ...state.lookupData, mergedCurrencyList };
    return { ...state, lookupData };
  }),

  on(ShippingActions.getShipmentPurposeSuccess, (state: ShippingInfo.ShippingInfo, { shipmentPurposeList }) => {
    const lookupData = { ...state.lookupData, shipmentPurpose: shipmentPurposeList };
    return { ...state, lookupData };
  }),

  on(ShippingActions.getCountryOfManufactureLocalApiSuccess, (state: ShippingInfo.ShippingInfo, { data }) => {
    const lookupData = { ...state.lookupData, listOfcountryOfManufactureLocal: data.configlist };
    return { ...state, lookupData };
  }),

  on(ShippingActions.getCountryOfManufactureUSApimSuccess, (state: ShippingInfo.ShippingInfo, { data }) => {
    const lookupData = { ...state.lookupData, listOfcountryOfManufactureUS: data.output.countries };
    return { ...state, lookupData };
  }),

  on(ShippingActions.saveMergedCountryOfManufactureListAction, (state: ShippingInfo.ShippingInfo, { mergedListOfcountryOfManufacture }) => {
    const lookupData = { ...state.lookupData, mergedListOfcountryOfManufacture };
    return { ...state, lookupData };
  }),

  on(ShippingActions.getSenderRecipientInfoSuccess, (state: ShippingInfo.ShippingInfo, { senderRecipientInfo }) => {
    const lookupData = { ...state.lookupData, senderRecipientInfo };
    return { ...state, lookupData };
  }),

  on(ShippingActions.getDocumentDescriptionsSuccess, (state: ShippingInfo.ShippingInfo, { documentDescriptions }) => {
    const lookupData = { ...state.lookupData, documentDescriptions };
    return { ...state, lookupData };
  }),

  on(ShippingActions.getUomListUSApiSuccess, (state: ShippingInfo.ShippingInfo, { data }) => {
    const lookupData = { ...state.lookupData, uomListUS: data };
    return { ...state, lookupData };
  }),

  on(ShippingActions.getUomListLocalApiSuccess, (state: ShippingInfo.ShippingInfo, { data }) => {
    const lookupData = { ...state.lookupData, uomListLocal: data.configlist };
    return { ...state, lookupData };
  }),

  on(ShippingActions.saveMergedUomListAction, (state: ShippingInfo.ShippingInfo, { mergedUomList }) => {
    const lookupData = { ...state.lookupData, mergedUomList };
    return { ...state, lookupData };
  }),

  on(ShippingActions.postCreateShipmentFailure, (state: ShippingInfo.ShippingInfo, { error }) => {
    const lookupData = { ...state.lookupData, createShipmentError: error };
    return { ...state, lookupData };
  }),

  on(ShippingActions.postCreateShipmentSuccess, (state: ShippingInfo.ShippingInfo, { data }) => {
    const lookupData = { ...state.lookupData, createShipmentSuccess: data };
    return { ...state, lookupData };
  }),

  on(ShippingActions.postShipmentFeedbackSuccess, (state: ShippingInfo.ShippingInfo, { data }) => {
    const lookupData = { ...state.lookupData, shipmentFeedackSuccess: data };
    return { ...state, lookupData };
  }),

  on(ShippingActions.getSystemCommodityListSuccess, (state: ShippingInfo.ShippingInfo, { data }) => {
    const lookupData = { ...state.lookupData, systemCommodityList: data.commoditylist };
    return { ...state, lookupData };
  }),

  on(ShippingActions.removeSystemCommodityListOnSelection, (state: ShippingInfo.ShippingInfo) => {
    let lookupData = { ...state.lookupData, systemCommodityList: null };
    lookupData = { ...lookupData, userCommodityList: null };
    return { ...state, lookupData };
  }),

  on(ShippingActions.getRatesDiscountByCountrySuccess, (state: ShippingInfo.ShippingInfo, { data }) => {
    const lookupData = { ...state.lookupData, ratesDiscountSuccess: data };
    return { ...state, lookupData };
  }),

  on(ShippingActions.getRatesDiscountByCountryFailure, (state: ShippingInfo.ShippingInfo, { error }) => {
    const lookupData = { ...state.lookupData, ratesDiscountError: error };
    return { ...state, lookupData };
  }),

  on(ShippingActions.updateCurrencyDisplayValue, (state: ShippingInfo.ShippingInfo, { displayValue }) => {
    const currentShippingDetails: IShipmentDetails = { ...state.shipmentDetails, currencyDisplayValue: displayValue };
    return { ...state, shipmentDetails: currentShippingDetails };
  }),

  on(ShippingActions.updatePaymentsDetailsAction, (state: ShippingInfo.ShippingInfo, { paymentDetails }) => {
    const currentShippingDetails: IShipmentDetails = { ...state.shipmentDetails };
    return { ...state, shipmentDetails: currentShippingDetails, paymentDetails };
  }),

  on(ShippingActions.updateSenderMobileNumberAction, (state: ShippingInfo.ShippingInfo, { phoneNumber }) => {
    const senderDetails: ISender = { ...state.senderDetails, phoneNumber: phoneNumber };
    return { ...state, senderDetails };
  }),

  on(ShippingActions.getDefaultSenderDetailsSuccess, (state: ShippingInfo.ShippingInfo, { data }) => {
    const lookupData = { ...state.lookupData, defaultSenderDetails: data };
    return { ...state, lookupData };
  }),

  on(ShippingActions.getRecipientListDetailsSuccess, (state: ShippingInfo.ShippingInfo, { data }) => {
    const lookupData = { ...state.lookupData, recipientListDetails: data };
    return { ...state, lookupData };
  }),

  on(ShippingActions.getPendingShipmentDetailsSuccess, (state: ShippingInfo.ShippingInfo, { data }) => {
    const lookupData = { ...state.lookupData, pendingShipmentDetails: data };
    return { ...state, lookupData };
  }),

  on(ShippingActions.getConfirmedShipmentDetailsSuccess, (state: ShippingInfo.ShippingInfo, { data }) => {
    const lookupData = { ...state.lookupData, confirmedShipmentDetails: data };
    return { ...state, lookupData };
  }),

  on(ShippingActions.postSenderAddressDetailsSuccess, (state: ShippingInfo.ShippingInfo, { partyId }) => {
    const senderDetails: ISender = { ...state.senderDetails, partyId: partyId };
    return { ...state, senderDetails };
  }),

  on(ShippingActions.getUserCommodityListSuccess, (state: ShippingInfo.ShippingInfo, { data }) => {
    const lookupData = { ...state.lookupData, userCommodityList: data.commoditylist };
    return { ...state, lookupData };
  }),

  on(ShippingActions.saveMergedSubCategoryCommodityListAction, (state: ShippingInfo.ShippingInfo, { mergedSubCategoryCommodityList }) => {
    const lookupData = { ...state.lookupData, mergedSubCategoryCommodityList: mergedSubCategoryCommodityList };
    return { ...state, lookupData };
  })
);